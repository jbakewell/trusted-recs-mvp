import { NextResponse } from "next/server";
import { searchTmdbMovies } from "@/lib/tmdb/movies";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? "";
  const result = await searchTmdbMovies(query);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
