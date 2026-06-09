"use client";

import { FormEvent, useEffect, useMemo, useRef, useState, useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Textarea } from "@/components/ui/Input";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { MoviePoster } from "@/components/ui/MoviePoster";
import { OverprintMotif } from "@/components/visual/OverprintMotif";
import { SectionAccentBars } from "@/components/visual/SectionAccentBars";
import { orderReasonOptions, type ReasonOption } from "@/lib/recommendations/reasons";
import type { TmdbMovieSearchResult } from "@/lib/tmdb/movies";
import { tintForReason, type ChipTint } from "@/lib/visual/chipTint";
import { createRecommendationAction, type RecommendationFormState } from "./actions";

type MovieSearchResponse =
  | {
      ok: true;
      movies: TmdbMovieSearchResult[];
    }
  | {
      ok: false;
      error: string;
    };

type ParticipantOption = {
  id: string;
  displayName: string;
};

type RecommendMovieFormProps = {
  groupId: string;
  participants: ParticipantOption[];
  reasons: ReasonOption[];
};

const DEBOUNCE_MS = 400;
const initialState: RecommendationFormState = {};

const reasonTintClasses: Record<ChipTint, string> = {
  neutral: "border-border-subtle bg-bg-muted text-text-secondary",
  rose: "border-chip-rose bg-chip-rose text-text-primary",
  teal: "border-chip-teal bg-chip-teal text-text-primary",
  green: "border-chip-green bg-chip-green text-text-primary",
  orange: "border-chip-orange bg-chip-orange text-text-primary",
  purple: "border-chip-purple bg-chip-purple text-text-primary",
  olive: "border-chip-olive bg-chip-olive text-text-primary",
};

const reasonAccentClasses: Record<ChipTint, string> = {
  neutral: "bg-text-muted",
  rose: "bg-accent",
  teal: "bg-accent-teal",
  green: "bg-accent-green",
  orange: "bg-accent-orange",
  purple: "bg-accent-purple",
  olive: "bg-accent-olive",
};

function SearchResult({
  movie,
  onSelect,
}: {
  movie: TmdbMovieSearchResult;
  onSelect: (movie: TmdbMovieSearchResult) => void;
}) {
  return (
    <article className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 border border-border-subtle bg-bg-surface p-3">
      <MoviePoster src={movie.posterUrl ?? undefined} title={movie.title} />
      <div className="min-w-0 space-y-2">
        <div>
          <h2 className="line-clamp-2 text-card-title font-semibold uppercase tracking-[0.02em] text-text-primary">
            {movie.title}
          </h2>
          <p className="metadata-label mt-1 text-text-muted">{movie.releaseYear ?? "Year unknown"}</p>
        </div>
        <p className="line-clamp-3 text-body-sm text-text-secondary">
          {movie.overview ?? "No overview is available yet."}
        </p>
        <Button className="w-full sm:w-fit" onClick={() => onSelect(movie)} type="button" variant="secondary">
          Select movie
        </Button>
      </div>
    </article>
  );
}

export function RecommendMovieForm({ groupId, participants, reasons }: RecommendMovieFormProps) {
  const [submitState, submitAction, isSubmitting] = useActionState<RecommendationFormState, FormData>(
    createRecommendationAction,
    initialState,
  );
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<TmdbMovieSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | undefined>();
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TmdbMovieSearchResult | null>(null);
  const [targetType, setTargetType] = useState<"group" | "participant" | "later">("group");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [selectedReasonId, setSelectedReasonId] = useState("");
  const requestIdRef = useRef(0);

  const orderedReasons = useMemo(
    () => orderReasonOptions(reasons, selectedMovie?.genreKeys ?? []),
    [reasons, selectedMovie?.genreKeys],
  );

  async function runSearch(nextQuery: string, signal?: AbortSignal) {
    const cleanQuery = nextQuery.trim();

    if (cleanQuery.length === 0) {
      setMovies([]);
      setSearchError(undefined);
      setSearched(false);
      setIsSearching(false);
      return;
    }

    if (cleanQuery.length < 2) {
      setMovies([]);
      setSearchError("Search with at least 2 characters.");
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
        setSearchError(payload.error);
        setSearched(true);
        return;
      }

      setMovies(payload.movies);
      setSearchError(undefined);
      setSearched(true);
    } catch {
      if (signal?.aborted || requestId !== requestIdRef.current) {
        return;
      }

      setMovies([]);
      setSearchError("Movie search is offline right now. Try again in a moment.");
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

  function selectMovie(movie: TmdbMovieSearchResult) {
    setSelectedMovie(movie);
    setSelectedReasonId("");
    setQuery(movie.title);
    setMovies([]);
    setSearched(false);
  }

  function toggleParticipant(participantId: string) {
    setSelectedParticipantIds((ids) =>
      ids.includes(participantId) ? ids.filter((id) => id !== participantId) : [...ids, participantId],
    );
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
            <p className="metadata-label text-accent">Step 1</p>
            <SectionAccentBars count={2} />
          </div>
          <h1 className="section-title">Choose a movie</h1>
          <p className="text-body-sm text-text-secondary">
            Search TMDB, pick the right film, then add why your group should watch it.
          </p>
        </div>

        <form className="relative z-10 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end" onSubmit={submitSearch}>
          <Input
            autoComplete="off"
            error={searchError}
            label="Movie title"
            name="query"
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedMovie(null);
            }}
            placeholder="Alien"
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

      {!isSearching && searched && movies.length === 0 && !searchError ? (
        <EmptyState
          description="Try the exact title, an alternate spelling, or a shorter search."
          title="No matching movies found"
        />
      ) : null}

      {!isSearching && movies.length > 0 ? (
        <section className="grid gap-3" aria-label="Movie search results">
          {movies.map((movie) => (
            <SearchResult key={movie.tmdbId} movie={movie} onSelect={selectMovie} />
          ))}
        </section>
      ) : null}

      {selectedMovie ? (
        <form action={submitAction} className="grid gap-5">
          <input name="groupId" type="hidden" value={groupId} />
          <input name="tmdbId" type="hidden" value={selectedMovie.tmdbId} />

          <Card className="grid gap-4">
            <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-3">
              <MoviePoster src={selectedMovie.posterUrl ?? undefined} title={selectedMovie.title} />
              <div className="min-w-0">
                <p className="metadata-label text-accent">Selected movie</p>
                <h2 className="mt-1 line-clamp-2 text-card-title font-semibold uppercase tracking-[0.02em] text-text-primary">
                  {selectedMovie.title}
                </h2>
                <p className="metadata-label mt-1 text-text-muted">{selectedMovie.releaseYear ?? "Year unknown"}</p>
                <p className="mt-2 line-clamp-3 text-body-sm text-text-secondary">
                  {selectedMovie.overview ?? "No overview is available yet."}
                </p>
              </div>
            </div>
          </Card>

          <Card className="relative grid gap-4 overflow-hidden">
            <OverprintMotif
              className="absolute -bottom-10 -right-8 h-32 w-32 opacity-70"
              intensity="standard"
              palette="tealOliveCharcoal"
              size="lg"
              variant="edgeBars"
            />
            <div className="relative z-10 grid gap-1 pr-10">
              <div className="flex items-center justify-between gap-3">
                <p className="metadata-label text-accent">Step 2</p>
                <SectionAccentBars count={2} palette="tealOlive" />
              </div>
              <h2 className="section-title">Who is it for?</h2>
            </div>

            <div className="relative z-10 grid gap-2">
              {[
                { value: "group", label: "Everyone in the group" },
                { value: "participant", label: "Specific people" },
                { value: "later", label: "Save for later" },
              ].map((option) => (
                <label
                  className="flex min-h-11 items-center gap-3 border border-border-subtle bg-bg-muted px-3 text-body-sm font-semibold text-text-primary"
                  key={option.value}
                >
                  <input
                    checked={targetType === option.value}
                    name="targetType"
                    onChange={() => setTargetType(option.value as typeof targetType)}
                    type="radio"
                    value={option.value}
                  />
                  {option.label}
                </label>
              ))}
            </div>

            {targetType === "participant" ? (
              <div className="relative z-10 grid gap-2">
                {participants.map((participant) => (
                  <label
                    className="flex min-h-11 items-center gap-3 border border-border-subtle bg-bg-surface px-3 text-body-sm font-semibold text-text-primary"
                    key={participant.id}
                  >
                    <input
                      checked={selectedParticipantIds.includes(participant.id)}
                      name="targetParticipantIds"
                      onChange={() => toggleParticipant(participant.id)}
                      type="checkbox"
                      value={participant.id}
                    />
                    {participant.displayName}
                  </label>
                ))}
              </div>
            ) : null}
          </Card>

          <Card className="grid gap-4">
            <div className="grid gap-1">
              <div className="flex items-center justify-between gap-3">
                <p className="metadata-label text-accent">Step 3</p>
                <SectionAccentBars count={3} />
              </div>
              <h2 className="section-title">Why recommend it?</h2>
              <p className="text-body-sm text-text-secondary">Pick one genre-aware reason.</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {orderedReasons.map((reason) => {
                const tint = tintForReason(reason.label);
                const selected = selectedReasonId === reason.id;

                return (
                  <label
                    className={`grid aspect-square min-h-[86px] cursor-pointer place-items-center border p-2 text-center text-[10px] font-bold uppercase leading-tight tracking-[0.05em] transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring sm:min-h-[104px] sm:text-caption ${
                      selected ? "border-accent bg-accent text-text-inverse" : reasonTintClasses[tint]
                    }`}
                    key={reason.id}
                  >
                    <input
                      checked={selected}
                      className="sr-only"
                      name="reasonId"
                      onChange={() => setSelectedReasonId(reason.id)}
                      required
                      type="radio"
                      value={reason.id}
                    />
                    <span
                      aria-hidden="true"
                      className={`h-2 w-10 rounded-full ${selected ? "bg-text-inverse" : reasonAccentClasses[tint]}`}
                    />
                    <span className="max-w-full break-words">{reason.label}</span>
                  </label>
                );
              })}
            </div>
          </Card>

          <Card className="grid gap-4">
            <Textarea label="Optional note" maxLength={280} name="note" placeholder="Why should they watch it?" />
            {submitState.error ? <p className="text-body-sm font-medium text-status-error">{submitState.error}</p> : null}
            <Button className="w-full sm:w-fit" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Saving..." : "Save recommendation"}
            </Button>
          </Card>
        </form>
      ) : null}
    </div>
  );
}
