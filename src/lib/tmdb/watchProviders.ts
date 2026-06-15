import { tmdbImageUrl } from "./movies";

export type WatchProvider = {
  providerId: number;
  name: string;
  logoUrl?: string | null;
  displayPriority?: number | null;
};

export type MovieWatchProviders = {
  region: string;
  link?: string | null;
  stream: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
  free: WatchProvider[];
  ads: WatchProvider[];
};

export type GetMovieWatchProvidersResult =
  | {
      ok: true;
      data: MovieWatchProviders;
    }
  | {
      ok: false;
      error: string;
    };

type TmdbProviderPayload = {
  provider_id?: number;
  provider_name?: string;
  logo_path?: string | null;
  display_priority?: number | null;
};

type TmdbRegionWatchProvidersPayload = {
  link?: string | null;
  flatrate?: TmdbProviderPayload[];
  rent?: TmdbProviderPayload[];
  buy?: TmdbProviderPayload[];
  free?: TmdbProviderPayload[];
  ads?: TmdbProviderPayload[];
};

type TmdbWatchProvidersPayload = {
  results?: Record<string, TmdbRegionWatchProvidersPayload | undefined>;
};

const EMPTY_GROUPS = {
  stream: [],
  rent: [],
  buy: [],
  free: [],
  ads: [],
} satisfies Omit<MovieWatchProviders, "region" | "link">;

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function cleanNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function defaultWatchRegion() {
  return normalizeWatchRegion(process.env.DEFAULT_WATCH_REGION) ?? "GB";
}

export function normalizeWatchRegion(region: unknown) {
  const cleanRegion = cleanString(region)?.toUpperCase() ?? null;

  if (!cleanRegion || !/^[A-Z]{2}$/.test(cleanRegion)) {
    return null;
  }

  return cleanRegion;
}

export function resolveWatchRegion(region?: string | null) {
  return normalizeWatchRegion(region) ?? defaultWatchRegion();
}

function normalizeProvider(provider: TmdbProviderPayload): WatchProvider | null {
  const providerId = cleanNumber(provider.provider_id);
  const name = cleanString(provider.provider_name);

  if (!providerId || !name) {
    return null;
  }

  return {
    providerId,
    name,
    logoUrl: tmdbImageUrl(cleanString(provider.logo_path), "w92"),
    displayPriority: cleanNumber(provider.display_priority),
  };
}

function normalizeProviderList(providers: TmdbProviderPayload[] | undefined) {
  return (providers ?? [])
    .map(normalizeProvider)
    .filter((provider): provider is WatchProvider => Boolean(provider))
    .sort((first, second) => {
      const firstPriority = first.displayPriority ?? Number.MAX_SAFE_INTEGER;
      const secondPriority = second.displayPriority ?? Number.MAX_SAFE_INTEGER;

      return firstPriority - secondPriority || first.name.localeCompare(second.name);
    });
}

export function emptyMovieWatchProviders(region: string): MovieWatchProviders {
  return {
    region,
    link: null,
    stream: [],
    rent: [],
    buy: [],
    free: [],
    ads: [],
  };
}

export function normalizeTmdbWatchProvidersPayload(
  payload: TmdbWatchProvidersPayload,
  requestedRegion?: string | null,
): MovieWatchProviders {
  const region = resolveWatchRegion(requestedRegion);
  const regionResult = payload.results?.[region];

  if (!regionResult) {
    return emptyMovieWatchProviders(region);
  }

  return {
    region,
    link: cleanString(regionResult.link),
    stream: normalizeProviderList(regionResult.flatrate),
    rent: normalizeProviderList(regionResult.rent),
    buy: normalizeProviderList(regionResult.buy),
    free: normalizeProviderList(regionResult.free),
    ads: normalizeProviderList(regionResult.ads),
  };
}

export function hasWatchProviders(data: MovieWatchProviders) {
  return Object.keys(EMPTY_GROUPS).some((key) => data[key as keyof typeof EMPTY_GROUPS].length > 0);
}

export async function getTmdbMovieWatchProviders(
  tmdbId: number,
  requestedRegion?: string | null,
): Promise<GetMovieWatchProvidersResult> {
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return { ok: false, error: "Choose a valid movie." };
  }

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey || apiKey === "[placeholder]") {
    return { ok: false, error: "Watch options are not configured yet." };
  }

  const region = resolveWatchRegion(requestedRegion);
  const baseUrl = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/movie/${tmdbId}/watch/providers`);
  url.searchParams.set("api_key", apiKey);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 60 * 60 * 6,
      },
    });

    if (!response.ok) {
      return { ok: false, error: "Watch options are not available right now." };
    }

    return {
      ok: true,
      data: normalizeTmdbWatchProvidersPayload((await response.json()) as TmdbWatchProvidersPayload, region),
    };
  } catch {
    return { ok: false, error: "Watch options are not available right now." };
  }
}
