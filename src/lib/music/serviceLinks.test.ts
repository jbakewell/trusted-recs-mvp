import { describe, expect, it } from "vitest";
import { albumSearchQuery, buildAlbumServiceLinks, musicServiceSearchUrl } from "./serviceLinks";

const album = {
  title: "OK Computer",
  artists: ["Radiohead", "Other Artist"],
  spotifyUrl: "https://open.spotify.com/album/album-1",
};

describe("album service links", () => {
  it("uses exact Spotify link when Spotify is preferred", () => {
    expect(buildAlbumServiceLinks({ ...album, preferredMusicService: "spotify" })).toEqual({
      primary: {
        label: "Open in Spotify",
        url: "https://open.spotify.com/album/album-1",
        service: "spotify_exact",
        ariaLabel: "Open OK Computer by Radiohead in Spotify",
      },
      secondary: [],
    });
  });

  it("uses Spotify search when Spotify is preferred but no exact URL exists", () => {
    expect(buildAlbumServiceLinks({ ...album, spotifyUrl: null, preferredMusicService: "spotify" }).primary).toMatchObject({
      label: "Search on Spotify",
      url: "https://open.spotify.com/search/Radiohead%20OK%20Computer",
      service: "spotify",
    });
  });

  it.each([
    ["apple_music", "Search on Apple Music", "https://music.apple.com/search?term=Radiohead%20OK%20Computer"],
    ["youtube_music", "Search on YouTube Music", "https://music.youtube.com/search?q=Radiohead%20OK%20Computer"],
    ["amazon_music", "Search on Amazon Music", "https://music.amazon.co.uk/search/Radiohead%20OK%20Computer"],
    ["bandcamp", "Search on Bandcamp", "https://bandcamp.com/search?q=Radiohead%20OK%20Computer"],
  ] as const)("uses %s as primary and exact Spotify as secondary", (service, label, url) => {
    const links = buildAlbumServiceLinks({ ...album, preferredMusicService: service });

    expect(links.primary).toMatchObject({ label, url, service });
    expect(links.secondary).toEqual([
      expect.objectContaining({
        label: "Open in Spotify",
        url: "https://open.spotify.com/album/album-1",
        service: "spotify_exact",
      }),
    ]);
  });

  it("uses exact Spotify only when no service is preferred", () => {
    expect(buildAlbumServiceLinks({ ...album, preferredMusicService: "none" })).toEqual({
      primary: expect.objectContaining({
        label: "Open in Spotify",
      }),
      secondary: [],
    });
  });

  it("returns no actions when no link can be generated", () => {
    expect(buildAlbumServiceLinks({ title: "", artists: [], spotifyUrl: null, preferredMusicService: "none" })).toEqual({
      primary: undefined,
      secondary: [],
    });
  });

  it("encodes service search URLs", () => {
    expect(musicServiceSearchUrl("apple_music", "Björk Vespertine")).toBe(
      "https://music.apple.com/search?term=Bj%C3%B6rk%20Vespertine",
    );
  });

  it("uses the first artist and falls back to album title only", () => {
    expect(albumSearchQuery("OK Computer", ["Radiohead", "Other Artist"])).toBe("Radiohead OK Computer");
    expect(albumSearchQuery("Uncredited Album", [])).toBe("Uncredited Album");
  });
});
