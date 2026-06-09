"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { MoviePoster } from "@/components/ui/MoviePoster";
import { searchMoviesAction, type MovieSearchState } from "./actions";

const initialState: MovieSearchState = {};

function MovieSearchResultCard({ movie }: { movie: NonNullable<MovieSearchState["movies"]>[number] }) {
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
        <p className="text-caption font-bold uppercase tracking-[0.06em] text-text-muted">
          TMDB #{movie.tmdbId}
        </p>
      </div>
    </article>
  );
}

export function MovieSearchForm() {
  const [state, formAction, isPending] = useActionState<MovieSearchState, FormData>(searchMoviesAction, initialState);
  const movies = state.movies ?? [];

  return (
    <div className="grid gap-5">
      <Card className="grid gap-4">
        <div className="grid gap-2">
          <p className="metadata-label text-accent">Milestone 5</p>
          <h1 className="section-title">Find a movie</h1>
          <p className="text-body-sm text-text-secondary">
            Search TMDB for the film your group wants to remember. You&apos;ll choose who to recommend it to in the next
            milestone.
          </p>
        </div>

        <form action={formAction} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <Input
            autoComplete="off"
            defaultValue={state.query}
            error={state.error}
            label="Movie title"
            name="query"
            placeholder="The Apartment"
            required
          />
          <Button className="w-full sm:w-fit" disabled={isPending} type="submit">
            {isPending ? "Searching..." : "Search"}
          </Button>
        </form>
      </Card>

      {isPending ? (
        <div className="grid gap-3" aria-live="polite">
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </div>
      ) : null}

      {!isPending && state.searched && movies.length === 0 && !state.error ? (
        <EmptyState
          description="Try the exact title, an alternate spelling, or a shorter search."
          title="No matching movies found"
        />
      ) : null}

      {!isPending && movies.length > 0 ? (
        <section className="grid gap-3" aria-label="Movie search results">
          {movies.map((movie) => (
            <MovieSearchResultCard key={movie.tmdbId} movie={movie} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
