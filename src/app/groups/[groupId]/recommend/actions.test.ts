import { vi } from "vitest";

const tx = {
  item: {
    upsert: vi.fn(async () => ({ id: "item-1" })),
  },
  movieMetadata: {
    upsert: vi.fn(async () => ({})),
  },
  bookMetadata: {
    upsert: vi.fn(async () => ({})),
  },
  recommendation: {
    create: vi.fn(async () => ({ id: "rec-1" })),
  },
};

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const redirectMock = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/groups/session.server", () => ({
  getCurrentParticipantForGroup: vi.fn(async () => ({
    id: "participant-1",
    groupId: "group-1",
    status: "active",
  })),
}));

vi.mock("@/lib/tmdb/movies", () => ({
  getTmdbMovieDetails: vi.fn(async () => ({
    ok: true,
    movies: [
      {
        tmdbId: 1,
        title: "The Apartment",
        originalTitle: "The Apartment",
        releaseDate: "1960-06-21",
        releaseYear: 1960,
        overview: "A man lends his apartment to company executives.",
        posterPath: null,
        posterUrl: null,
        backdropPath: null,
        genreKeys: ["comedy"],
        originalLanguage: "en",
        popularity: 1,
        voteAverage: 8,
        voteCount: 100,
      },
    ],
  })),
}));

vi.mock("@/lib/google-books/books", () => ({
  getGoogleBookDetails: vi.fn(async () => ({
    ok: true,
    books: [
      {
        googleBooksId: "book-1",
        title: "The Left Hand of Darkness",
        subtitle: null,
        authors: ["Ursula K. Le Guin"],
        publisher: "Ace",
        publishedDate: "1969",
        publishedYear: 1969,
        description: "A landmark science fiction novel.",
        coverUrl: "https://example.com/cover.jpg",
        pageCount: 304,
        categories: ["Fiction"],
        language: "en",
        averageRating: 4.3,
        ratingsCount: 1200,
      },
    ],
  })),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    recommendationReason: {
      findMany: vi.fn(async () => [
        { id: "reason-1", active: true },
        { id: "reason-2", active: true },
      ]),
    },
    participant: {
      findMany: vi.fn(async () => [{ id: "participant-2" }]),
    },
    $transaction: vi.fn(async (callback) => callback(tx)),
  },
}));

describe("createRecommendationAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an error state for incomplete submissions", async () => {
    const { createRecommendationAction } = await import("./actions");

    const result = await createRecommendationAction({ status: "idle" }, new FormData());

    expect(result.status).toBe("error");
    expect(result.error).toBe("Choose a movie before submitting.");
  });

  it("redirects to the group feed after saving", async () => {
    const { createRecommendationAction } = await import("./actions");
    const formData = new FormData();
    formData.set("groupId", "group-1");
    formData.set("tmdbId", "1");
    formData.append("reasonIds", "reason-1");
    formData.append("reasonIds", "reason-2");
    formData.set("targetType", "participant");
    formData.append("targetParticipantIds", "participant-2");

    await expect(createRecommendationAction({ status: "idle" }, formData)).rejects.toThrow(
      "NEXT_REDIRECT:/groups/group-1?type=movies&recommended=1",
    );
    expect(redirectMock).toHaveBeenCalledWith("/groups/group-1?type=movies&recommended=1");
    expect(tx.recommendation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reasonId: "reason-1",
          reasonSelections: {
            create: [
              { reasonId: "reason-1", sortOrder: 0 },
              { reasonId: "reason-2", sortOrder: 1 },
            ],
          },
        }),
      }),
    );
  });

  it("keeps legacy single reason submissions working", async () => {
    const { createRecommendationAction } = await import("./actions");
    const formData = new FormData();
    formData.set("groupId", "group-1");
    formData.set("tmdbId", "1");
    formData.set("reasonId", "reason-1");
    formData.set("targetType", "group");

    await expect(createRecommendationAction({ status: "idle" }, formData)).rejects.toThrow(
      "NEXT_REDIRECT:/groups/group-1?type=movies&recommended=1",
    );
    expect(tx.recommendation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reasonId: "reason-1",
          reasonSelections: {
            create: [{ reasonId: "reason-1", sortOrder: 0 }],
          },
        }),
      }),
    );
  });

  it("allows recommendations without a note or selected reasons", async () => {
    const { createRecommendationAction } = await import("./actions");
    const formData = new FormData();
    formData.set("groupId", "group-1");
    formData.set("tmdbId", "1");

    await expect(createRecommendationAction({ status: "idle" }, formData)).rejects.toThrow(
      "NEXT_REDIRECT:/groups/group-1?type=movies&recommended=1",
    );
    expect(tx.recommendation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reasonId: "reason-1",
          note: null,
          reasonSelections: undefined,
          targets: {
            create: [{ targetType: "group", participantId: null }],
          },
        }),
      }),
    );
  });

  it("saves book recommendations and redirects to the books feed", async () => {
    const { createRecommendationAction } = await import("./actions");
    const formData = new FormData();
    formData.set("groupId", "group-1");
    formData.set("itemType", "book");
    formData.set("googleBooksId", "book-1");
    formData.append("reasonIds", "reason-2");
    formData.set("note", "A winter classic.");

    await expect(createRecommendationAction({ status: "idle" }, formData)).rejects.toThrow(
      "NEXT_REDIRECT:/groups/group-1?type=books&recommended=1",
    );
    expect(tx.item.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          type: "book",
          title: "The Left Hand of Darkness",
          externalSource: "google_books",
          externalId: "book-1",
        }),
      }),
    );
    expect(tx.bookMetadata.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          googleBooksId: "book-1",
          authors: ["Ursula K. Le Guin"],
        }),
      }),
    );
    expect(tx.recommendation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          note: "A winter classic.",
          reasonId: "reason-2",
        }),
      }),
    );
  });
});
