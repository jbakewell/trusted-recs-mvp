import { describe, expect, it, vi, beforeEach } from "vitest";

const searchSpotifyAlbums = vi.fn();

vi.mock("@/lib/spotify/albums", () => ({
  searchSpotifyAlbums,
}));

describe("GET /api/albums/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns normalized album search results", async () => {
    searchSpotifyAlbums.mockResolvedValue({
      ok: true,
      albums: [
        {
          spotifyAlbumId: "album-1",
          title: "OK Computer",
          artists: ["Radiohead"],
          releaseDate: "1997-05-21",
          releaseYear: 1997,
          coverImageUrl: "https://example.com/cover.jpg",
          totalTracks: 12,
          spotifyUrl: "https://open.spotify.com/album/album-1",
        },
      ],
    });
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost/api/albums/search?query=ok"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      albums: [
        expect.objectContaining({
          spotifyAlbumId: "album-1",
          title: "OK Computer",
        }),
      ],
    });
    expect(searchSpotifyAlbums).toHaveBeenCalledWith("ok");
  });

  it("returns a bad request when Spotify search fails without leaking tokens", async () => {
    searchSpotifyAlbums.mockResolvedValue({
      ok: false,
      error: "Spotify could not search albums right now. Try again in a moment.",
    });
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost/api/albums/search?query=ok"));
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({
      ok: false,
      error: "Spotify could not search albums right now. Try again in a moment.",
    });
    expect(JSON.stringify(payload)).not.toContain("access_token");
    expect(JSON.stringify(payload)).not.toContain("Bearer");
  });

  it("returns a bad request for short queries", async () => {
    searchSpotifyAlbums.mockResolvedValue({
      ok: false,
      error: "Enter at least two characters to search albums.",
    });
    const { GET } = await import("./route");

    const response = await GET(new Request("http://localhost/api/albums/search?query=o"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Enter at least two characters to search albums.",
    });
    expect(searchSpotifyAlbums).toHaveBeenCalledWith("o");
  });
});
