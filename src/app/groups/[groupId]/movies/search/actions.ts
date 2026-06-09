"use server";

import { searchTmdbMovies, type TmdbMovieSearchResult } from "@/lib/tmdb/movies";

export type MovieSearchState = {
  query?: string;
  movies?: TmdbMovieSearchResult[];
  error?: string;
  searched?: boolean;
};

export async function searchMoviesAction(_state: MovieSearchState, formData: FormData): Promise<MovieSearchState> {
  const query = String(formData.get("query") ?? "").trim();

  if (query.length === 0) {
    return { query, error: "Enter a movie title to search.", searched: false };
  }

  const result = await searchTmdbMovies(query);

  if (!result.ok) {
    return { query, error: result.error, searched: true };
  }

  return {
    query,
    movies: result.movies,
    searched: true,
  };
}
