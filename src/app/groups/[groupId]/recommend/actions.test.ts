import { vi } from "vitest";

const tx = {
  item: {
    upsert: vi.fn(async () => ({ id: "item-1" })),
  },
  movieMetadata: {
    upsert: vi.fn(async () => ({})),
  },
  recommendation: {
    create: vi.fn(async () => ({ id: "rec-1" })),
  },
};

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: () => ({ value: "session-token" }),
  })),
}));

vi.mock("@/lib/groups/session", () => ({
  SESSION_COOKIE_NAME: "trusted_recs_session",
  hashToken: () => "hashed-token",
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

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    session: {
      findUnique: vi.fn(async () => ({
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        participant: {
          id: "participant-1",
          groupId: "group-1",
          status: "active",
        },
      })),
    },
    recommendationReason: {
      findFirst: vi.fn(async () => ({ id: "reason-1", active: true })),
    },
    participant: {
      findMany: vi.fn(async () => [{ id: "participant-2" }]),
    },
    $transaction: vi.fn(async (callback) => callback(tx)),
  },
}));

describe("createRecommendationAction", () => {
  it("returns an error state for incomplete submissions", async () => {
    const { createRecommendationAction } = await import("./actions");

    const result = await createRecommendationAction({ status: "idle" }, new FormData());

    expect(result.status).toBe("error");
    expect(result.error).toBe("Choose a movie before submitting.");
  });

  it("returns a saved state with the created recommendation id", async () => {
    const { createRecommendationAction } = await import("./actions");
    const formData = new FormData();
    formData.set("groupId", "group-1");
    formData.set("tmdbId", "1");
    formData.set("reasonId", "reason-1");
    formData.set("targetType", "participant");
    formData.append("targetParticipantIds", "participant-2");

    const result = await createRecommendationAction({ status: "idle" }, formData);

    expect(result).toEqual({ status: "saved", recommendationId: "rec-1" });
  });
});
