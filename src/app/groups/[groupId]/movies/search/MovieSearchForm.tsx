"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ScrollRegion } from "@/components/app/ScrollRegion";
import { useKeyboardInset } from "@/components/app/useKeyboardInset";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MoviePoster } from "@/components/ui/MoviePoster";
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

const DEBOUNCE_MS = 300;

function CompactResultCard({ movie, onSelect }: { movie: TmdbMovieSearchResult; onSelect?: () => void }) {
  const yearLabel = movie.releaseYear ? String(movie.releaseYear) : "Year unknown";
  const overview = movie.overview ?? "No overview is available yet.";
  const metadata = [yearLabel, movie.genreKeys.slice(0, 3).join(", ")].filter(Boolean).join(" - ");

  const content = (
    <>
      <MoviePoster size="sm" src={movie.posterUrl ?? undefined} title={movie.title} />
      <div className="min-w-0 flex-1">
        <h2 className="line-clamp-2 text-[16px] font-semibold leading-[21px] text-text-primary">{movie.title}</h2>
        <p className="mt-1 text-body-sm leading-[18px] text-text-muted">{metadata}</p>
        <p className="mt-1 line-clamp-2 text-body-sm leading-[19px] text-text-secondary">{overview}</p>
      </div>
      {onSelect ? (
        <span
          aria-hidden="true"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-[22px] font-semibold leading-none text-text-inverse"
        >
          +
        </span>
      ) : null}
    </>
  );

  if (onSelect) {
    return (
      <button
        className="flex w-full items-center gap-3 rounded-card border border-border-subtle bg-surface-strong p-3 text-left shadow-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        onClick={onSelect}
        type="button"
      >
        {content}
      </button>
    );
  }

  return (
    <article className="flex items-center gap-3 rounded-card border border-border-subtle bg-surface-strong p-3 shadow-subtle">
      {content}
    </article>
  );
}

function CompactSkeleton() {
  return (
    <div aria-label="Loading movie result" className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-card border border-border-subtle bg-surface-strong p-3" role="status">
      <div className="aspect-[2/3] w-16 animate-pulse bg-bg-inset" />
      <div className="grid content-start gap-2">
        <div className="h-4 w-3/4 animate-pulse bg-bg-muted" />
        <div className="h-3 w-1/3 animate-pulse bg-bg-muted" />
        <div className="h-3 w-full animate-pulse bg-bg-muted" />
        <div className="h-3 w-5/6 animate-pulse bg-bg-muted" />
      </div>
    </div>
  );
}

type MovieSearchFormProps = {
  onSelectMovie?: (movie: TmdbMovieSearchResult) => void;
};

export function MovieSearchForm({ onSelectMovie }: MovieSearchFormProps) {
  useKeyboardInset();

  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<TmdbMovieSearchResult[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const requestIdRef = useRef(0);
  const inputWrapRef = useRef<HTMLDivElement>(null);

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
      setError(undefined);
      setSearched(false);
      setIsSearching(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsSearching(true);

    try {
      const response = await fetch(`/api/tmdb/search?query=${encodeURIComponent(cleanQuery)}`, { signal });
      const payload = (await response.json()) as MovieSearchResponse;

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!payload.ok) {
        setMovies([]);
        setError("Movie search is not available right now. Try again in a moment.");
        setSearched(true);
        return;
      }

      setMovies(payload.movies);
      setError(undefined);
      setSearched(true);
    } catch {
      if (signal?.aborted || requestId !== requestIdRef.current) {
        return;
      }

      setMovies([]);
      setError("Movie search is not available right now. Try again in a moment.");
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

  function focusSearch() {
    setIsFocused(true);
    window.setTimeout(() => {
      inputWrapRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    }, 60);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3">
      <div className="shrink-0" ref={inputWrapRef}>
        <div className={`grid gap-1 transition-all ${isFocused || query ? "mb-2" : "mb-3"}`}>
          <p className="metadata-label text-accent">{isFocused || query ? "Search movies" : "Movie search"}</p>
          {isFocused || query ? null : (
            <>
              <h1 className="section-title">Choose a movie</h1>
            <p className="text-body-sm text-text-secondary">Search for the movie you want to recommend.</p>
            </>
          )}
        </div>

        <form onSubmit={submitSearch}>
          <Input
            autoComplete="off"
            error={undefined}
            label="Movie title"
            name="query"
            onBlur={() => setIsFocused(false)}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={focusSearch}
            placeholder="Movie title"
            required
            value={query}
          />
        </form>
      </div>

      <ScrollRegion className="mt-2 grid content-start gap-2 pb-[calc(24px+var(--keyboard-inset,0px))]" aria-label="Movie search results">
        {isSearching ? (
          <>
            <CompactSkeleton />
            <CompactSkeleton />
            <CompactSkeleton />
          </>
        ) : null}

        {!isSearching && error ? (
          <div className="grid gap-3 rounded-card border border-border-subtle bg-surface-strong p-3">
            <p className="text-body-sm font-semibold text-text-primary">{error}</p>
            <Button className="w-full sm:w-fit" onClick={() => void runSearch(query)} type="button" variant="secondary">
              Retry
            </Button>
          </div>
        ) : null}

        {!isSearching && searched && movies.length === 0 && !error ? (
          <div className="rounded-card border border-border-subtle bg-surface-strong p-3">
            <p className="text-body-sm font-bold text-text-primary">No films found.</p>
            <p className="mt-1 text-body-sm text-text-secondary">Try a shorter title or check the spelling.</p>
          </div>
        ) : null}

        {!isSearching && movies.length > 0
          ? movies.map((movie) => (
              <CompactResultCard
                key={movie.tmdbId}
                movie={movie}
                onSelect={onSelectMovie ? () => onSelectMovie(movie) : undefined}
              />
            ))
          : null}
      </ScrollRegion>
    </div>
  );
}
