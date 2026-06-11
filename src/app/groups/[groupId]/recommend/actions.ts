"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentParticipantForGroup } from "@/lib/groups/session.server";
import { getTmdbMovieDetails } from "@/lib/tmdb/movies";

export type RecommendationFormState = {
  status: "idle" | "error";
  error?: string;
};

type TargetType = "group" | "participant" | "later";

function releaseDateForDb(releaseDate: string | null) {
  return releaseDate ? new Date(`${releaseDate}T00:00:00.000Z`) : null;
}

export async function createRecommendationAction(
  _state: RecommendationFormState,
  formData: FormData,
): Promise<RecommendationFormState> {
  const groupId = String(formData.get("groupId") ?? "");
  const tmdbId = Number.parseInt(String(formData.get("tmdbId") ?? ""), 10);
  const legacyReasonId = String(formData.get("reasonId") ?? "");
  const reasonIds = Array.from(
    new Set(
      formData
        .getAll("reasonIds")
        .map((value) => String(value))
        .concat(legacyReasonId)
        .filter(Boolean),
    ),
  ).slice(0, 8);
  const targetType = (String(formData.get("targetType") ?? "") || "group") as TargetType;
  const note = String(formData.get("note") ?? "").trim();
  const targetParticipantIds = formData.getAll("targetParticipantIds").map((value) => String(value));

  if (!groupId || !Number.isInteger(tmdbId)) {
    return { status: "error", error: "Choose a movie before submitting." };
  }

  if (!["group", "participant", "later"].includes(targetType)) {
    return { status: "error", error: "Choose who this recommendation is for." };
  }

  if (note.length > 280) {
    return { status: "error", error: "Keep the note to 280 characters or fewer." };
  }

  const currentParticipant = await getCurrentParticipantForGroup(groupId);

  if (!currentParticipant) {
    return { status: "error", error: "Your session has expired. Rejoin the group before recommending a movie." };
  }

  const reasons = await prisma.recommendationReason.findMany({
    where: reasonIds.length > 0 ? { id: { in: reasonIds }, active: true } : { active: true },
    orderBy: [{ genreKey: "asc" }, { sortOrder: "asc" }],
  });
  const reasonsById = new Map(reasons.map((reason) => [reason.id, reason]));
  const selectedReasons =
    reasonIds.length > 0
      ? reasonIds.map((reasonId) => reasonsById.get(reasonId)).filter((reason): reason is (typeof reasons)[number] => Boolean(reason))
      : [];
  const primaryReason = selectedReasons[0] ?? reasons[0];

  if (!primaryReason) {
    return { status: "error", error: "Choose an available reason." };
  }

  const movieResult = await getTmdbMovieDetails(tmdbId);

  if (!movieResult.ok) {
    return { status: "error", error: movieResult.error };
  }

  const movie = movieResult.movies[0];
  const externalId = String(movie.tmdbId);

  const targetRows =
    targetType === "participant"
      ? await prisma.participant
          .findMany({
            where: {
              id: { in: targetParticipantIds },
              groupId,
              status: "active",
            },
            select: { id: true },
          })
          .then((participants) =>
            participants.map((participant) => ({
              targetType: "participant" as const,
              participantId: participant.id,
            })),
          )
      : [
          {
            targetType,
            participantId: null,
          },
        ];

  if (targetRows.length === 0) {
    return { status: "error", error: "Choose at least one person, or recommend it to the whole group." };
  }

  await prisma.$transaction(async (tx) => {
    const item = await tx.item.upsert({
      where: {
        type_externalSource_externalId: {
          type: "movie",
          externalSource: "tmdb",
          externalId,
        },
      },
      create: {
        type: "movie",
        title: movie.title,
        subtitle: movie.releaseYear ? String(movie.releaseYear) : null,
        description: movie.overview,
        imageUrl: movie.posterUrl,
        externalSource: "tmdb",
        externalId,
      },
      update: {
        title: movie.title,
        subtitle: movie.releaseYear ? String(movie.releaseYear) : null,
        description: movie.overview,
        imageUrl: movie.posterUrl,
      },
    });

    await tx.movieMetadata.upsert({
      where: { tmdbId: movie.tmdbId },
      create: {
        itemId: item.id,
        tmdbId: movie.tmdbId,
        title: movie.title,
        originalTitle: movie.originalTitle,
        releaseDate: releaseDateForDb(movie.releaseDate),
        releaseYear: movie.releaseYear,
        overview: movie.overview,
        posterPath: movie.posterPath,
        backdropPath: movie.backdropPath,
        genres: movie.genreKeys,
        originalLanguage: movie.originalLanguage,
        popularity: movie.popularity,
        voteAverage: movie.voteAverage,
        voteCount: movie.voteCount,
        tmdbLastSyncedAt: new Date(),
      },
      update: {
        title: movie.title,
        originalTitle: movie.originalTitle,
        releaseDate: releaseDateForDb(movie.releaseDate),
        releaseYear: movie.releaseYear,
        overview: movie.overview,
        posterPath: movie.posterPath,
        backdropPath: movie.backdropPath,
        genres: movie.genreKeys,
        originalLanguage: movie.originalLanguage,
        popularity: movie.popularity,
        voteAverage: movie.voteAverage,
        voteCount: movie.voteCount,
        tmdbLastSyncedAt: new Date(),
      },
    });

    await tx.recommendation.create({
      data: {
        groupId,
        itemId: item.id,
        recommendedByParticipantId: currentParticipant.id,
        reasonId: primaryReason.id,
        note: note.length > 0 ? note : null,
        reasonSelections:
          selectedReasons.length > 0
            ? {
                create: selectedReasons.map((reason, index) => ({
                  reasonId: reason.id,
                  sortOrder: index,
                })),
              }
            : undefined,
        targets: {
          create: targetRows,
        },
      },
    });
  });

  revalidatePath(`/groups/${groupId}`);
  redirect(`/groups/${groupId}?recommended=1`);
}
