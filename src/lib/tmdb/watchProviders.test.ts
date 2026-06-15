import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  defaultWatchRegion,
  getTmdbMovieWatchProviders,
  hasWatchProviders,
  normalizeTmdbWatchProvidersPayload,
  normalizeWatchRegion,
} from "./watchProviders";

describe("TMDB watch providers", () => {
  const originalDefaultRegion = process.env.DEFAULT_WATCH_REGION;
  const originalApiKey = process.env.TMDB_API_KEY;
  const originalBaseUrl = process.env.TMDB_BASE_URL;
  const originalImageBaseUrl = process.env.TMDB_IMAGE_BASE_URL;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.DEFAULT_WATCH_REGION = "GB";
    process.env.TMDB_API_KEY = "tmdb-key";
    process.env.TMDB_BASE_URL = "https://api.themoviedb.org/3";
    process.env.TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
  });

  afterEach(() => {
    process.env.DEFAULT_WATCH_REGION = originalDefaultRegion;
    process.env.TMDB_API_KEY = originalApiKey;
    process.env.TMDB_BASE_URL = originalBaseUrl;
    process.env.TMDB_IMAGE_BASE_URL = originalImageBaseUrl;
  });

  it("maps and sorts TMDB provider groups", () => {
    const data = normalizeTmdbWatchProvidersPayload(
      {
        results: {
          GB: {
            link: "https://www.themoviedb.org/movie/603/watch",
            flatrate: [
              { provider_id: 2, provider_name: "B Stream", logo_path: "/b.jpg", display_priority: 2 },
              { provider_id: 1, provider_name: "A Stream", logo_path: "/a.jpg", display_priority: 1 },
            ],
            rent: [{ provider_id: 3, provider_name: "RentCo", logo_path: null, display_priority: 3 }],
            buy: [{ provider_id: 4, provider_name: "BuyCo", logo_path: "/buy.jpg", display_priority: 4 }],
            free: [{ provider_id: 5, provider_name: "FreeCo", logo_path: "/free.jpg", display_priority: 5 }],
            ads: [{ provider_id: 6, provider_name: "AdsCo", logo_path: "/ads.jpg", display_priority: 6 }],
          },
        },
      },
      "GB",
    );

    expect(data.stream.map((provider) => provider.name)).toEqual(["A Stream", "B Stream"]);
    expect(data.stream[0].logoUrl).toBe("https://image.tmdb.org/t/p/w92/a.jpg");
    expect(data.rent[0]).toMatchObject({ name: "RentCo", logoUrl: null });
    expect(data.buy[0].name).toBe("BuyCo");
    expect(data.free[0].name).toBe("FreeCo");
    expect(data.ads[0].name).toBe("AdsCo");
    expect(data.link).toBe("https://www.themoviedb.org/movie/603/watch");
    expect(hasWatchProviders(data)).toBe(true);
  });

  it("returns empty grouped lists when the region is missing", () => {
    const data = normalizeTmdbWatchProvidersPayload({ results: { US: { flatrate: [] } } }, "GB");

    expect(data).toEqual({
      region: "GB",
      link: null,
      stream: [],
      rent: [],
      buy: [],
      free: [],
      ads: [],
    });
    expect(hasWatchProviders(data)).toBe(false);
  });

  it("defaults and validates watch regions", () => {
    expect(normalizeWatchRegion("gb")).toBe("GB");
    expect(normalizeWatchRegion("gbr")).toBeNull();
    expect(defaultWatchRegion()).toBe("GB");

    process.env.DEFAULT_WATCH_REGION = "us";
    expect(defaultWatchRegion()).toBe("US");
  });

  it("fetches watch providers without leaking raw TMDB details", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        results: {
          GB: {
            flatrate: [{ provider_id: 1, provider_name: "Netflix", logo_path: "/netflix.jpg", display_priority: 1 }],
          },
        },
      }),
    })) as unknown as typeof fetch;
    vi.stubGlobal("fetch", fetchMock);

    await expect(getTmdbMovieWatchProviders(603, "GB")).resolves.toEqual({
      ok: true,
      data: expect.objectContaining({
        region: "GB",
        stream: [expect.objectContaining({ name: "Netflix" })],
      }),
    });

    const url = vi.mocked(fetchMock).mock.calls[0][0] as URL;
    expect(url.pathname).toBe("/3/movie/603/watch/providers");
    expect(url.searchParams.get("api_key")).toBe("tmdb-key");
  });

  it("returns a safe error when TMDB fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
      })) as unknown as typeof fetch,
    );

    await expect(getTmdbMovieWatchProviders(603, "GB")).resolves.toEqual({
      ok: false,
      error: "Watch options are not available right now.",
    });
  });
});
