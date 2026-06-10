"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { hashToken, SESSION_COOKIE_NAME } from "@/lib/groups/session";
import { getTmdbMovieDetails } from "@/lib/tmdb/movies";

export type RecommendationFormState = {
  status: "idle" | "error" | "saved";
  error?: string;
  recommendationId?: string;
};

type TargetType = "group" | "participant" | "later";

async function getCurrentParticipant(groupId: string) {
  const cookieStore = await cookies();
  const rawSessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawSessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { sessionTokenHash: hashToken(rawSessionToken) },
    include: { participant: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    return null;
  }

  if (session.participant.groupId !== groupId || session.participant.status !== "active") {
    return null;
  }

  return session.participant;
}

function releaseDateForDb(releaseDate: string | null) {
  return releaseDate ? new Date(`${releaseDate}T00:00:00.000Z`) : null;
}

export async function createRecommendationAction(
  _state: RecommendationFormState,
  formData: FormData,
): Promise<RecommendationFormState> {
  const groupId = String(formData.get("groupId") ?? "");
  const tmdbId = Number.parseInt(String(formData.get("tmdbId") ?? ""), 10);
  const reasonId = String(formData.get("reasonId") ?? "");
  const targetType = String(formData.get("targetType") ?? "") as TargetType;
  const note = String(formData.get("note") ?? "").trim();
  const targetParticipantIds = formData.getAll("targetParticipantIds").map((value) => String(value));

  if (!groupId || !Number.isInteger(tmdbId)) {
    return { status: "error", error: "Choose a movie before submitting." };
  }

  if (!reasonId) {
    return { status: "error", error: "Choose one reason." };
  }

  if (!["group", "participant", "later"].includes(targetType)) {
    return { status: "error", error: "Choose who this recommendation is for." };
  }

  if (note.length > 280) {
    return { status: "error", error: "Keep the note to 280 characters or fewer." };
  }

  const currentParticipant = await getCurrentParticipant(groupId);

  if (!currentParticipant) {
    return { status: "error", error: "Your session has expired. Rejoin the group before recommending a movie." };
  }

  const reason = await prisma.recommendationReason.findFirst({
    where: { id: reasonId, active: true },
  });

  if (!reason) {
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

  const recommendation = await prisma.$transaction(async (tx) => {
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

    return tx.recommendation.create({
      data: {
        groupId,
        itemId: item.id,
        recommendedByParticipantId: currentParticipant.id,
        reasonId,
        note: note.length > 0 ? note : null,
        targets: {
          create: targetRows,
        },
      },
    });
  });

  revalidatePath(`/groups/${groupId}`);
  return { status: "saved", recommendationId: recommendation.id };
}
