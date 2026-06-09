export type TmdbMovieSearchResult = {
  tmdbId: number;
  title: string;
  originalTitle: string | null;
  releaseDate: string | null;
  releaseYear: number | null;
  overview: string | null;
  posterPath: string | null;
  posterUrl: string | null;
  backdropPath: string | null;
  originalLanguage: string | null;
  popularity: number | null;
  voteAverage: number | null;
  voteCount: number | null;
  genreKeys: string[];
};

type TmdbMoviePayload = {
  id?: number;
  title?: string;
  original_title?: string;
  release_date?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  original_language?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  genres?: { id?: number; name?: string }[];
};

type TmdbSearchPayload = {
  results?: TmdbMoviePayload[];
};

export type SearchMoviesResult =
  | {
      ok: true;
      movies: TmdbMovieSearchResult[];
    }
  | {
      ok: false;
      error: string;
    };

const POSTER_THUMBNAIL_SIZE = "w342";

const TMDB_GENRE_KEYS_BY_ID: Record<number, string> = {
  12: "adventure",
  14: "fantasy",
  16: "animation",
  18: "drama",
  27: "horror",
  28: "action",
  35: "comedy",
  36: "history",
  37: "western",
  53: "thriller",
  80: "crime",
  99: "documentary",
  10402: "music",
  10749: "romance",
  10751: "family",
  10752: "war",
  878: "science-fiction",
  9648: "mystery",
};

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function cleanNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function tmdbImageUrl(path: string | null, size = POSTER_THUMBNAIL_SIZE) {
  if (!path) {
    return null;
  }

  const baseUrl = process.env.TMDB_IMAGE_BASE_URL ?? "https://image.tmdb.org/t/p";
  return `${baseUrl.replace(/\/$/, "")}/${size}${path}`;
}

export function releaseYearFromDate(releaseDate: string | null) {
  if (!releaseDate || !/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) {
    return null;
  }

  return Number.parseInt(releaseDate.slice(0, 4), 10);
}

function genreKeysForMovie(movie: TmdbMoviePayload) {
  const ids = movie.genre_ids ?? movie.genres?.map((genre) => genre.id).filter((id): id is number => typeof id === "number") ?? [];
  const seen = new Set<string>();

  return ids
    .map((id) => TMDB_GENRE_KEYS_BY_ID[id])
    .filter((genreKey): genreKey is string => Boolean(genreKey))
    .filter((genreKey) => {
      if (seen.has(genreKey)) {
        return false;
      }

      seen.add(genreKey);
      return true;
    });
}

export function normalizeTmdbMovie(movie: TmdbMoviePayload): TmdbMovieSearchResult | null {
  const tmdbId = cleanNumber(movie.id);
  const title = cleanString(movie.title);

  if (!tmdbId || !title) {
    return null;
  }

  const releaseDate = cleanString(movie.release_date);
  const posterPath = cleanString(movie.poster_path);

  return {
    tmdbId,
    title,
    originalTitle: cleanString(movie.original_title),
    releaseDate,
    releaseYear: releaseYearFromDate(releaseDate),
    overview: cleanString(movie.overview),
    posterPath,
    posterUrl: tmdbImageUrl(posterPath),
    backdropPath: cleanString(movie.backdrop_path),
    originalLanguage: cleanString(movie.original_language),
    popularity: cleanNumber(movie.popularity),
    voteAverage: cleanNumber(movie.vote_average),
    voteCount: cleanNumber(movie.vote_count),
    genreKeys: genreKeysForMovie(movie),
  };
}

export function normalizeTmdbSearchPayload(payload: TmdbSearchPayload) {
  return (payload.results ?? []).map(normalizeTmdbMovie).filter((movie): movie is TmdbMovieSearchResult => Boolean(movie));
}

export async function searchTmdbMovies(query: string): Promise<SearchMoviesResult> {
  const cleanQuery = query.trim();

  if (cleanQuery.length < 2) {
    return { ok: false, error: "Search with at least 2 characters." };
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey || apiKey === "[placeholder]") {
    return { ok: false, error: "Movie search is not configured yet." };
  }

  const baseUrl = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/search/movie`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("query", cleanQuery);
  url.searchParams.set("include_adult", "false");
  url.searchParams.set("language", "en-US");
  url.searchParams.set("page", "1");

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 60 * 60,
      },
    });

    if (!response.ok) {
      return { ok: false, error: "TMDB could not search right now. Try again in a moment." };
    }

    const payload = (await response.json()) as TmdbSearchPayload;
    return {
      ok: true,
      movies: normalizeTmdbSearchPayload(payload).slice(0, 10),
    };
  } catch {
    return { ok: false, error: "Movie search is offline right now. Try again in a moment." };
  }
}

export async function getTmdbMovieDetails(tmdbId: number): Promise<SearchMoviesResult> {
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return { ok: false, error: "Choose a valid movie." };
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey || apiKey === "[placeholder]") {
    return { ok: false, error: "Movie search is not configured yet." };
  }

  const baseUrl = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/movie/${tmdbId}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "en-US");

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 60 * 60 * 24,
      },
    });

    if (!response.ok) {
      return { ok: false, error: "TMDB could not load that movie right now. Try again in a moment." };
    }

    const movie = normalizeTmdbMovie((await response.json()) as TmdbMoviePayload);

    if (!movie) {
      return { ok: false, error: "TMDB returned an incomplete movie record." };
    }

    return {
      ok: true,
      movies: [movie],
    };
  } catch {
    return { ok: false, error: "Movie details are offline right now. Try again in a moment." };
  }
}
