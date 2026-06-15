export type MusicService = "spotify" | "apple_music" | "youtube_music" | "amazon_music" | "bandcamp" | "none";
export type AlbumServiceLinkKind = MusicService | "spotify_exact";

export type AlbumServiceLink = {
  label: string;
  url: string;
  service: AlbumServiceLinkKind;
  ariaLabel: string;
};

export type AlbumLinkInput = {
  title: string;
  artists: string[];
  spotifyUrl?: string | null;
  preferredMusicService?: MusicService | null;
};

export type AlbumServiceLinks = {
  primary?: AlbumServiceLink;
  secondary: AlbumServiceLink[];
};

const serviceLabels: Record<Exclude<MusicService, "none">, string> = {
  spotify: "Spotify",
  apple_music: "Apple Music",
  youtube_music: "YouTube Music",
  amazon_music: "Amazon Music",
  bandcamp: "Bandcamp",
};

function cleanText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function albumSearchQuery(title: string, artists: string[]) {
  const cleanTitle = cleanText(title);
  const primaryArtist = cleanText(artists[0] ?? "");

  return [primaryArtist, cleanTitle].filter(Boolean).join(" ");
}

function artistText(artists: string[]) {
  return cleanText(artists[0] ?? "") || "Unknown artist";
}

export function musicServiceSearchUrl(service: Exclude<MusicService, "none">, query: string) {
  const encodedQuery = encodeURIComponent(query);

  if (service === "spotify") {
    return `https://open.spotify.com/search/${encodedQuery}`;
  }

  if (service === "apple_music") {
    return `https://music.apple.com/search?term=${encodedQuery}`;
  }

  if (service === "youtube_music") {
    return `https://music.youtube.com/search?q=${encodedQuery}`;
  }

  if (service === "amazon_music") {
    return `https://music.amazon.co.uk/search/${encodedQuery}`;
  }

  return `https://bandcamp.com/search?q=${encodedQuery}`;
}

function exactSpotifyLink(input: AlbumLinkInput): AlbumServiceLink | null {
  const spotifyUrl = cleanText(input.spotifyUrl ?? "");

  if (!spotifyUrl) {
    return null;
  }

  return {
    label: "Open in Spotify",
    url: spotifyUrl,
    service: "spotify_exact",
    ariaLabel: `Open ${input.title} by ${artistText(input.artists)} in Spotify`,
  };
}

function searchLink(service: Exclude<MusicService, "none">, input: AlbumLinkInput): AlbumServiceLink | null {
  const query = albumSearchQuery(input.title, input.artists);

  if (!query) {
    return null;
  }

  return {
    label: `Search on ${serviceLabels[service]}`,
    url: musicServiceSearchUrl(service, query),
    service,
    ariaLabel: `Search for ${input.title} by ${artistText(input.artists)} on ${serviceLabels[service]}`,
  };
}

export function buildAlbumServiceLinks(input: AlbumLinkInput): AlbumServiceLinks {
  const preferredMusicService = input.preferredMusicService ?? "none";
  const spotifyExact = exactSpotifyLink(input);

  if (preferredMusicService === "spotify") {
    return {
      primary: spotifyExact ?? searchLink("spotify", input) ?? undefined,
      secondary: [],
    };
  }

  if (preferredMusicService !== "none") {
    return {
      primary: searchLink(preferredMusicService, input) ?? spotifyExact ?? undefined,
      secondary: spotifyExact ? [spotifyExact] : [],
    };
  }

  return {
    primary: spotifyExact ?? undefined,
    secondary: [],
  };
}

export const musicServiceOptions: { value: MusicService; label: string }[] = [
  { value: "none", label: "None" },
  { value: "spotify", label: "Spotify" },
  { value: "apple_music", label: "Apple Music" },
  { value: "youtube_music", label: "YouTube Music" },
  { value: "amazon_music", label: "Amazon Music" },
  { value: "bandcamp", label: "Bandcamp" },
];

export function isMusicService(value: string): value is MusicService {
  return musicServiceOptions.some((option) => option.value === value);
}
