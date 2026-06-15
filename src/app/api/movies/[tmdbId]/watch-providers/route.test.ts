import { beforeEach, describe, expect, it, vi } from "vitest";

const getTmdbMovieWatchProviders = vi.fn();

vi.mock("@/lib/tmdb/watchProviders", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/tmdb/watchProviders")>();

  return {
    ...actual,
    getTmdbMovieWatchProviders,
  };
});

describe("GET /api/movies/[tmdbId]/watch-providers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns normalized watch providers", async () => {
    getTmdbMovieWatchProviders.mockResolvedValue({
      ok: true,
      data: {
        region: "GB",
        link: null,
        stream: [{ providerId: 1, name: "Netflix", logoUrl: null, displayPriority: 1 }],
        rent: [],
        buy: [],
        free: [],
        ads: [],
      },
    });
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost/api/movies/603/watch-providers?region=GB"), {
      params: Promise.resolve({ tmdbId: "603" }),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: expect.objectContaining({
        region: "GB",
        stream: [expect.objectContaining({ name: "Netflix" })],
      }),
    });
    expect(getTmdbMovieWatchProviders).toHaveBeenCalledWith(603, "GB");
  });

  it("rejects invalid movie ids", async () => {
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost/api/movies/nope/watch-providers"), {
      params: Promise.resolve({ tmdbId: "nope" }),
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "Choose a valid movie." });
    expect(getTmdbMovieWatchProviders).not.toHaveBeenCalled();
  });

  it("rejects invalid regions without leaking API keys", async () => {
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost/api/movies/603/watch-providers?region=GBR"), {
      params: Promise.resolve({ tmdbId: "603" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ ok: false, error: "Choose a valid watch region." });
    expect(JSON.stringify(payload)).not.toContain("api_key");
  });

  it("returns a safe error when provider lookup fails", async () => {
    getTmdbMovieWatchProviders.mockResolvedValue({
      ok: false,
      error: "Watch options are not available right now.",
    });
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost/api/movies/603/watch-providers"), {
      params: Promise.resolve({ tmdbId: "603" }),
    });

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Watch options are not available right now.",
    });
  });
});
