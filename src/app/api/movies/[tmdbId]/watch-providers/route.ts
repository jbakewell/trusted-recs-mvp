import { NextResponse } from "next/server";
import { getTmdbMovieWatchProviders, normalizeWatchRegion } from "@/lib/tmdb/watchProviders";

type WatchProvidersRouteContext = {
  params: Promise<{ tmdbId: string }>;
};

export async function GET(request: Request, context: WatchProvidersRouteContext) {
  const { tmdbId: rawTmdbId } = await context.params;
  const tmdbId = Number.parseInt(rawTmdbId, 10);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return NextResponse.json({ ok: false, error: "Choose a valid movie." }, { status: 400 });
  }

  const url = new URL(request.url);
  const requestedRegion = url.searchParams.get("region");
  const region = normalizeWatchRegion(requestedRegion);

  if (requestedRegion && !region) {
    return NextResponse.json({ ok: false, error: "Choose a valid watch region." }, { status: 400 });
  }

  const result = await getTmdbMovieWatchProviders(tmdbId, region);

  if (!result.ok) {
    return NextResponse.json(result, { status: 502 });
  }

  return NextResponse.json(result);
}
