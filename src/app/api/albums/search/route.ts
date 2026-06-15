import { NextResponse } from "next/server";
import { searchSpotifyAlbums } from "@/lib/spotify/albums";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? "";
  const result = await searchSpotifyAlbums(query);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
