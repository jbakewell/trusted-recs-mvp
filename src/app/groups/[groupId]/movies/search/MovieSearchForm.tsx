"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { MoviePoster } from "@/components/ui/MoviePoster";
import { OverprintMotif } from "@/components/visual/OverprintMotif";
import { SectionAccentBars } from "@/components/visual/SectionAccentBars";
import type { TmdbMovieSearchResult } from "@/lib/tmdb/movies";

type MovieSearchResponse =
  | {
      ok: true;
      movies: TmdbMovieSearchResult[];
    }
  | {
      ok: false;
      error: string;
    };

const DEBOUNCE_MS = 400;

function MovieSearchResultCard({ movie }: { movie: TmdbMovieSearchResult }) {
  const yearLabel = movie.releaseYear ? String(movie.releaseYear) : "Year unknown";
  const overview = movie.overview ?? "No overview is available yet.";

  return (
    <article className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 border border-border-subtle bg-bg-surface p-3">
      <MoviePoster src={movie.posterUrl ?? undefined} title={movie.title} />
      <div className="min-w-0 space-y-2">
        <div>
          <h2 className="line-clamp-2 text-card-title font-semibold uppercase tracking-[0.02em] text-text-primary">
            {movie.title}
          </h2>
          <p className="metadata-label mt-1 text-text-muted">{yearLabel}</p>
        </div>
        <p className="line-clamp-4 text-body-sm text-text-secondary">{overview}</p>
        <p className="text-caption font-bold uppercase tracking-[0.06em] text-text-muted">TMDB #{movie.tmdbId}</p>
      </div>
    </article>
  );
}

export function MovieSearchForm() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<TmdbMovieSearchResult[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const requestIdRef = useRef(0);

  async function runSearch(nextQuery: string, signal?: AbortSignal) {
    const cleanQuery = nextQuery.trim();

    if (cleanQuery.length === 0) {
      setMovies([]);
      setError(undefined);
      setSearched(false);
      setIsSearching(false);
      return;
    }

    if (cleanQuery.length < 2) {
      setMovies([]);
      setError("Search with at least 2 characters.");
      setSearched(false);
      setIsSearching(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsSearching(true);

    try {
      const response = await fetch(`/api/tmdb/search?query=${encodeURIComponent(cleanQuery)}`, {
        signal,
      });
      const payload = (await response.json()) as MovieSearchResponse;

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!payload.ok) {
        setMovies([]);
        setError(payload.error);
        setSearched(true);
        return;
      }

      setMovies(payload.movies);
      setError(undefined);
      setSearched(true);
    } catch (caughtError) {
      if (signal?.aborted || requestId !== requestIdRef.current) {
        return;
      }

      setMovies([]);
      setError("Movie search is offline right now. Try again in a moment.");
      setSearched(true);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsSearching(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const debounce = window.setTimeout(() => {
      void runSearch(query, controller.signal);
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(debounce);
      controller.abort();
    };
  }, [query]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch(query);
  }

  return (
    <div className="grid gap-5">
      <Card className="relative grid gap-4 overflow-hidden">
        <OverprintMotif
          className="absolute -right-10 -top-8 h-32 w-32 opacity-75"
          intensity="standard"
          palette="roseTealOlive"
          size="lg"
          variant="cornerCluster"
        />
        <div className="relative z-10 grid gap-2 pr-12">
          <div className="flex items-center justify-between gap-3">
            <p className="metadata-label text-accent">Milestone 5</p>
            <SectionAccentBars count={2} />
          </div>
          <h1 className="section-title">Find a movie</h1>
          <p className="text-body-sm text-text-secondary">
            Search TMDB for the film your group wants to remember. You&apos;ll choose who to recommend it to in the next
            milestone.
          </p>
        </div>

        <form className="relative z-10 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" onSubmit={submitSearch}>
          <Input
            autoComplete="off"
            error={error}
            label="Movie title"
            name="query"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="The Apartment"
            required
            value={query}
          />
          <Button className="w-full sm:w-fit" disabled={isSearching} type="submit">
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>
      </Card>

      {isSearching ? (
        <div className="grid gap-3" aria-live="polite">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : null}

      {!isSearching && searched && movies.length === 0 && !error ? (
        <EmptyState
          description="Try the exact title, an alternate spelling, or a shorter search."
          title="No matching movies found"
        />
      ) : null}

      {!isSearching && movies.length > 0 ? (
        <section className="grid gap-3" aria-label="Movie search results">
          {movies.map((movie) => (
            <MovieSearchResultCard key={movie.tmdbId} movie={movie} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
