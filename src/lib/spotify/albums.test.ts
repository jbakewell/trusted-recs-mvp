import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bestSpotifyImageUrl,
  clearSpotifyTokenCacheForTests,
  getSpotifyAccessToken,
  normalizeSpotifyAlbum,
  normalizeSpotifyAlbumSearchPayload,
  releaseYearFromDate,
  searchSpotifyAlbums,
} from "./albums";

describe("Spotify album helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearSpotifyTokenCacheForTests();
    process.env.SPOTIFY_CLIENT_ID = "client-id";
    process.env.SPOTIFY_CLIENT_SECRET = "client-secret";
    process.env.SPOTIFY_BASE_URL = "https://api.spotify.com/v1";
    process.env.SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com";
  });

  it("parses release years from Spotify release dates", () => {
    expect(releaseYearFromDate("1997-05-21")).toBe(1997);
    expect(releaseYearFromDate("1997")).toBe(1997);
    expect(releaseYearFromDate(null)).toBeNull();
  });

  it("selects the largest Spotify image", () => {
    expect(
      bestSpotifyImageUrl([
        { url: "https://example.com/small.jpg", width: 64, height: 64 },
        { url: "https://example.com/large.jpg", width: 640, height: 640 },
      ]),
    ).toBe("https://example.com/large.jpg");
  });

  it("normalizes album payloads", () => {
    expect(
      normalizeSpotifyAlbum({
        id: "spotify-album-1",
        name: "OK Computer",
        artists: [{ name: "Radiohead" }],
        release_date: "1997-05-21",
        images: [{ url: "https://example.com/cover.jpg", width: 640, height: 640 }],
        total_tracks: 12,
        external_urls: { spotify: "https://open.spotify.com/album/abc" },
      }),
    ).toEqual({
      spotifyAlbumId: "spotify-album-1",
      title: "OK Computer",
      artists: ["Radiohead"],
      releaseDate: "1997-05-21",
      releaseYear: 1997,
      coverImageUrl: "https://example.com/cover.jpg",
      totalTracks: 12,
      spotifyUrl: "https://open.spotify.com/album/abc",
    });
  });

  it("normalizes search payloads and drops incomplete records", () => {
    expect(
      normalizeSpotifyAlbumSearchPayload({
        albums: {
          items: [
            { id: "album-1", name: "Album One" },
            { id: "album-2" },
          ],
        },
      }),
    ).toEqual([
      {
        spotifyAlbumId: "album-1",
        title: "Album One",
        artists: [],
        releaseDate: null,
        releaseYear: null,
        coverImageUrl: null,
        totalTracks: null,
        spotifyUrl: null,
      },
    ]);
  });

  it("constructs and caches Spotify token requests", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ access_token: "token-1", expires_in: 3600 }),
    })) as unknown as typeof fetch;
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSpotifyAccessToken(1_000)).resolves.toBe("token-1");
    await expect(getSpotifyAccessToken(2_000)).resolves.toBe("token-1");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://accounts.spotify.com/api/token"),
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from("client-id:client-secret").toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }),
    );
  });

  it("refreshes the token when it is near expiry", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "token-1", expires_in: 120 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "token-2", expires_in: 120 }),
      }) as unknown as typeof fetch;
    vi.stubGlobal("fetch", fetchMock);

    await expect(getSpotifyAccessToken(1_000)).resolves.toBe("token-1");
    await expect(getSpotifyAccessToken(70_000)).resolves.toBe("token-2");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("searches albums with type album and market GB", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "token-1", expires_in: 3600 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ albums: { items: [{ id: "album-1", name: "Blue" }] } }),
      }) as unknown as typeof fetch;
    vi.stubGlobal("fetch", fetchMock);

    await expect(searchSpotifyAlbums("blue")).resolves.toEqual({
      ok: true,
      albums: [
        expect.objectContaining({
          spotifyAlbumId: "album-1",
          title: "Blue",
        }),
      ],
    });

    const searchUrl = vi.mocked(fetchMock).mock.calls[1][0] as URL;
    expect(searchUrl.searchParams.get("type")).toBe("album");
    expect(searchUrl.searchParams.get("market")).toBe("GB");
    expect(searchUrl.searchParams.get("limit")).toBe("10");
  });
});
