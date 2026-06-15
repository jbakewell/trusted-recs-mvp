"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getGoogleBookDetails } from "@/lib/google-books/books";
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
  const itemType = String(formData.get("itemType") ?? "movie") === "book" ? "book" : "movie";
  const tmdbId = Number.parseInt(String(formData.get("tmdbId") ?? ""), 10);
  const googleBooksId = String(formData.get("googleBooksId") ?? "").trim();
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

  if (!groupId || (itemType === "movie" && !Number.isInteger(tmdbId)) || (itemType === "book" && !googleBooksId)) {
    return { status: "error", error: `Choose a ${itemType} before submitting.` };
  }

  if (!["group", "participant", "later"].includes(targetType)) {
    return { status: "error", error: "Choose who this recommendation is for." };
  }

  if (note.length > 280) {
    return { status: "error", error: "Keep the note to 280 characters or fewer." };
  }

  const currentParticipant = await getCurrentParticipantForGroup(groupId);

  if (!currentParticipant) {
    return { status: "error", error: `Your session has expired. Rejoin the group before recommending a ${itemType}.` };
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

  const movieResult = itemType === "movie" ? await getTmdbMovieDetails(tmdbId) : null;
  const bookResult = itemType === "book" ? await getGoogleBookDetails(googleBooksId) : null;

  if (movieResult && !movieResult.ok) {
    return { status: "error", error: movieResult.error };
  }

  if (bookResult && !bookResult.ok) {
    return { status: "error", error: bookResult.error };
  }

  const movie = movieResult?.ok ? movieResult.movies[0] : null;
  const book = bookResult?.ok ? bookResult.books[0] : null;
  const externalId = movie ? String(movie.tmdbId) : book?.googleBooksId ?? "";

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

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const item = await tx.item.upsert({
      where: {
        type_externalSource_externalId: {
          type: itemType,
          externalSource: itemType === "book" ? "google_books" : "tmdb",
          externalId,
        },
      },
      create: {
        type: itemType,
        title: book?.title ?? movie?.title ?? "",
        subtitle: book?.subtitle ?? (movie?.releaseYear ? String(movie.releaseYear) : null),
        description: book?.description ?? movie?.overview ?? null,
        imageUrl: book?.coverUrl ?? movie?.posterUrl ?? null,
        externalSource: itemType === "book" ? "google_books" : "tmdb",
        externalId,
      },
      update: {
        title: book?.title ?? movie?.title ?? "",
        subtitle: book?.subtitle ?? (movie?.releaseYear ? String(movie.releaseYear) : null),
        description: book?.description ?? movie?.overview ?? null,
        imageUrl: book?.coverUrl ?? movie?.posterUrl ?? null,
      },
    });

    if (movie) {
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
    }

    if (book) {
      await tx.bookMetadata.upsert({
        where: { googleBooksId: book.googleBooksId },
        create: {
          itemId: item.id,
          googleBooksId: book.googleBooksId,
          title: book.title,
          subtitle: book.subtitle,
          authors: book.authors,
          publisher: book.publisher,
          publishedDate: book.publishedDate,
          publishedYear: book.publishedYear,
          description: book.description,
          coverUrl: book.coverUrl,
          pageCount: book.pageCount,
          categories: book.categories,
          language: book.language,
          averageRating: book.averageRating,
          ratingsCount: book.ratingsCount,
          googleBooksLastSyncedAt: new Date(),
        },
        update: {
          title: book.title,
          subtitle: book.subtitle,
          authors: book.authors,
          publisher: book.publisher,
          publishedDate: book.publishedDate,
          publishedYear: book.publishedYear,
          description: book.description,
          coverUrl: book.coverUrl,
          pageCount: book.pageCount,
          categories: book.categories,
          language: book.language,
          averageRating: book.averageRating,
          ratingsCount: book.ratingsCount,
          googleBooksLastSyncedAt: new Date(),
        },
      });
    }

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
  redirect(`/groups/${groupId}?type=${itemType === "book" ? "books" : "movies"}&recommended=1`);
}
