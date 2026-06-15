export type SpotifyAlbumSearchResult = {
  spotifyAlbumId: string;
  title: string;
  artists: string[];
  releaseDate: string | null;
  releaseYear: number | null;
  coverImageUrl: string | null;
  totalTracks: number | null;
  spotifyUrl: string | null;
};

type SpotifyArtistPayload = {
  name?: unknown;
};

type SpotifyImagePayload = {
  url?: unknown;
  width?: unknown;
  height?: unknown;
};

type SpotifyAlbumPayload = {
  id?: unknown;
  name?: unknown;
  artists?: unknown;
  release_date?: unknown;
  images?: unknown;
  total_tracks?: unknown;
  external_urls?: {
    spotify?: unknown;
  };
};

type SpotifySearchPayload = {
  albums?: {
    items?: SpotifyAlbumPayload[];
  };
};

type SpotifyTokenPayload = {
  access_token?: unknown;
  expires_in?: unknown;
};

export type SearchAlbumsResult =
  | {
      ok: true;
      albums: SpotifyAlbumSearchResult[];
    }
  | {
      ok: false;
      error: string;
    };

let cachedToken: { accessToken: string; expiresAt: number } | null = null;
const TOKEN_EXPIRY_MARGIN_MS = 60_000;

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function cleanNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function cleanStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => cleanString(item)).filter((item): item is string => Boolean(item))
    : [];
}

export function releaseYearFromDate(value: string | null) {
  const match = value?.match(/^(\d{4})/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function bestSpotifyImageUrl(value: unknown) {
  if (!Array.isArray(value)) {
    return null;
  }

  const images = value
    .map((image): SpotifyImagePayload | null => (image && typeof image === "object" ? image : null))
    .filter((image): image is SpotifyImagePayload => Boolean(image))
    .map((image) => ({
      url: cleanString(image.url),
      width: cleanNumber(image.width) ?? 0,
      height: cleanNumber(image.height) ?? 0,
    }))
    .filter((image) => Boolean(image.url));

  if (images.length === 0) {
    return null;
  }

  return images.sort((a, b) => b.width * b.height - a.width * a.height)[0].url;
}

export function normalizeSpotifyAlbum(album: SpotifyAlbumPayload): SpotifyAlbumSearchResult | null {
  const spotifyAlbumId = cleanString(album.id);
  const title = cleanString(album.name);

  if (!spotifyAlbumId || !title) {
    return null;
  }

  const releaseDate = cleanString(album.release_date);
  const artists = Array.isArray(album.artists)
    ? cleanStringArray(album.artists.map((artist) => (artist && typeof artist === "object" ? (artist as SpotifyArtistPayload).name : null)))
    : [];

  return {
    spotifyAlbumId,
    title,
    artists,
    releaseDate,
    releaseYear: releaseYearFromDate(releaseDate),
    coverImageUrl: bestSpotifyImageUrl(album.images),
    totalTracks: cleanNumber(album.total_tracks),
    spotifyUrl: cleanString(album.external_urls?.spotify),
  };
}

export function normalizeSpotifyAlbumSearchPayload(payload: SpotifySearchPayload): SpotifyAlbumSearchResult[] {
  return (payload.albums?.items ?? [])
    .map(normalizeSpotifyAlbum)
    .filter((album): album is SpotifyAlbumSearchResult => Boolean(album));
}

export function clearSpotifyTokenCacheForTests() {
  cachedToken = null;
}

export async function getSpotifyAccessToken(now = Date.now()): Promise<string | null> {
  if (cachedToken && cachedToken.expiresAt - TOKEN_EXPIRY_MARGIN_MS > now) {
    return cachedToken.accessToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret || clientId === "[placeholder]" || clientSecret === "[placeholder]") {
    return null;
  }

  const accountsUrl = process.env.SPOTIFY_ACCOUNTS_URL ?? "https://accounts.spotify.com";
  const url = new URL(`${accountsUrl.replace(/\/$/, "")}/api/token`);
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as SpotifyTokenPayload;
  const accessToken = cleanString(payload.access_token);
  const expiresIn = cleanNumber(payload.expires_in);

  if (!accessToken || !expiresIn) {
    return null;
  }

  cachedToken = {
    accessToken,
    expiresAt: now + expiresIn * 1000,
  };

  return accessToken;
}

export async function searchSpotifyAlbums(query: string): Promise<SearchAlbumsResult> {
  const cleanQuery = query.trim();

  if (cleanQuery.length < 2) {
    return { ok: false, error: "Enter at least two characters to search albums." };
  }

  const accessToken = await getSpotifyAccessToken();

  if (!accessToken) {
    return { ok: false, error: "Spotify album search is not configured yet." };
  }

  const baseUrl = process.env.SPOTIFY_BASE_URL ?? "https://api.spotify.com/v1";
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/search`);
  url.searchParams.set("q", cleanQuery);
  url.searchParams.set("type", "album");
  url.searchParams.set("limit", "10");
  url.searchParams.set("market", "GB");

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { ok: false, error: "Spotify could not search albums right now. Try again in a moment." };
    }

    const payload = (await response.json()) as SpotifySearchPayload;
    return { ok: true, albums: normalizeSpotifyAlbumSearchPayload(payload) };
  } catch {
    return { ok: false, error: "Spotify could not search albums right now. Try again in a moment." };
  }
}

export async function getSpotifyAlbumDetails(spotifyAlbumId: string): Promise<SearchAlbumsResult> {
  const cleanId = spotifyAlbumId.trim();

  if (!cleanId) {
    return { ok: false, error: "Choose an album before submitting." };
  }

  const accessToken = await getSpotifyAccessToken();

  if (!accessToken) {
    return { ok: false, error: "Spotify album search is not configured yet." };
  }

  const baseUrl = process.env.SPOTIFY_BASE_URL ?? "https://api.spotify.com/v1";
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/albums/${encodeURIComponent(cleanId)}`);
  url.searchParams.set("market", "GB");

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { ok: false, error: "Spotify could not load that album right now. Try again in a moment." };
    }

    const album = normalizeSpotifyAlbum((await response.json()) as SpotifyAlbumPayload);

    if (!album) {
      return { ok: false, error: "Spotify returned an incomplete album record." };
    }

    return { ok: true, albums: [album] };
  } catch {
    return { ok: false, error: "Spotify could not load that album right now. Try again in a moment." };
  }
}
