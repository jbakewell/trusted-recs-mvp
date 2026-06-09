import { normalizeTmdbMovie, normalizeTmdbSearchPayload, releaseYearFromDate, tmdbImageUrl } from "./movies";

describe("TMDB movie normalisation", () => {
  const originalImageBaseUrl = process.env.TMDB_IMAGE_BASE_URL;

  beforeEach(() => {
    process.env.TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
  });

  afterEach(() => {
    process.env.TMDB_IMAGE_BASE_URL = originalImageBaseUrl;
  });

  it("extracts a release year from a full TMDB release date", () => {
    expect(releaseYearFromDate("1960-06-21")).toBe(1960);
    expect(releaseYearFromDate("1960")).toBeNull();
    expect(releaseYearFromDate(null)).toBeNull();
  });

  it("builds poster image URLs from TMDB paths", () => {
    expect(tmdbImageUrl("/abc123.jpg")).toBe("https://image.tmdb.org/t/p/w342/abc123.jpg");
    expect(tmdbImageUrl(null)).toBeNull();
  });

  it("normalizes a TMDB search result into the app shape", () => {
    expect(
      normalizeTmdbMovie({
        id: 284,
        title: "The Apartment",
        original_title: "The Apartment",
        release_date: "1960-06-21",
        overview: "A Manhattan office worker lets executives use his apartment.",
        poster_path: "/zS8rTz2pWt3M36T3n0v2WZXLd14.jpg",
        backdrop_path: "/backdrop.jpg",
        original_language: "en",
        popularity: 18.55,
        vote_average: 8.2,
        vote_count: 2400,
      }),
    ).toMatchObject({
      tmdbId: 284,
      title: "The Apartment",
      releaseYear: 1960,
      posterUrl: "https://image.tmdb.org/t/p/w342/zS8rTz2pWt3M36T3n0v2WZXLd14.jpg",
      voteAverage: 8.2,
    });
  });

  it("keeps missing poster and overview values nullable", () => {
    expect(
      normalizeTmdbMovie({
        id: 1,
        title: "Tiny Indie Movie",
        poster_path: null,
        overview: "",
      }),
    ).toMatchObject({
      posterPath: null,
      posterUrl: null,
      overview: null,
    });
  });

  it("filters malformed TMDB rows from search payloads", () => {
    expect(
      normalizeTmdbSearchPayload({
        results: [{ title: "Missing ID" }, { id: 2 }, { id: 3, title: "Valid Movie" }],
      }),
    ).toHaveLength(1);
  });
});
