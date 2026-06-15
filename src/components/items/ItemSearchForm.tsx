"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ScrollRegion } from "@/components/app/ScrollRegion";
import { useKeyboardInset } from "@/components/app/useKeyboardInset";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ItemThumbnail } from "@/components/ui/ItemThumbnail";
import {
  itemDescription,
  itemImageUrl,
  itemMetadata,
  itemSearchHeading,
  itemSearchLabel,
  itemSearchPlaceholder,
  itemThumbnailLabel,
  type RecommendableItem,
  type RecommendItemType,
} from "@/lib/items/types";

type ItemSearchResponse =
  | {
      ok: true;
      movies?: Omit<Extract<RecommendableItem, { itemType: "movie" }>, "itemType">[];
      books?: Omit<Extract<RecommendableItem, { itemType: "book" }>, "itemType">[];
      albums?: Omit<Extract<RecommendableItem, { itemType: "album" }>, "itemType">[];
    }
  | {
      ok: false;
      error: string;
    };

const DEBOUNCE_MS = 300;

function CompactResultCard({ item, onSelect }: { item: RecommendableItem; onSelect?: () => void }) {
  const overview = itemDescription(item) ?? `No ${item.itemType === "movie" ? "overview" : "description"} is available yet.`;

  const content = (
    <>
      <ItemThumbnail
        label={itemThumbnailLabel(item.itemType)}
        size="sm"
        src={itemImageUrl(item)}
        title={item.title}
      />
      <div className="min-w-0 flex-1">
        <h2 className="line-clamp-2 text-[16px] font-semibold leading-[21px] text-text-primary">{item.title}</h2>
        <p className="mt-1 text-body-sm leading-[18px] text-text-muted">{itemMetadata(item)}</p>
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
    <div aria-label="Loading result" className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-card border border-border-subtle bg-surface-strong p-3" role="status">
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

type ItemSearchFormProps = {
  itemType: RecommendItemType;
  onSelectItem?: (item: RecommendableItem) => void;
};

export function ItemSearchForm({ itemType, onSelectItem }: ItemSearchFormProps) {
  useKeyboardInset();

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<RecommendableItem[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const requestIdRef = useRef(0);
  const inputWrapRef = useRef<HTMLDivElement>(null);

  async function runSearch(nextQuery: string, signal?: AbortSignal) {
    const cleanQuery = nextQuery.trim();

    if (cleanQuery.length < 2) {
      setItems([]);
      setError(undefined);
      setSearched(false);
      setIsSearching(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsSearching(true);

    try {
      const endpoint =
        itemType === "book" ? "/api/books/search" : itemType === "album" ? "/api/albums/search" : "/api/tmdb/search";
      const response = await fetch(`${endpoint}?query=${encodeURIComponent(cleanQuery)}`, { signal });
      const payload = (await response.json()) as ItemSearchResponse;

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!payload.ok) {
        setItems([]);
        setError(`${itemType === "book" ? "Book" : itemType === "album" ? "Album" : "Movie"} search is not available right now. Try again in a moment.`);
        setSearched(true);
        return;
      }

      const nextItems =
        itemType === "book"
          ? (payload.books ?? []).map((book) => ({ ...book, itemType: "book" as const }))
          : itemType === "album"
            ? (payload.albums ?? []).map((album) => ({ ...album, itemType: "album" as const }))
          : (payload.movies ?? []).map((movie) => ({ ...movie, itemType: "movie" as const }));
      setItems(nextItems);
      setError(undefined);
      setSearched(true);
    } catch {
      if (signal?.aborted || requestId !== requestIdRef.current) {
        return;
      }

      setItems([]);
      setError(`${itemType === "book" ? "Book" : itemType === "album" ? "Album" : "Movie"} search is not available right now. Try again in a moment.`);
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
  }, [query, itemType]);

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
          <p className="metadata-label text-accent">
            {isFocused || query ? `Search ${itemType === "book" ? "books" : itemType === "album" ? "albums" : "movies"}` : itemSearchLabel(itemType)}
          </p>
          {isFocused || query ? null : (
            <>
              <h1 className="section-title">{itemSearchHeading(itemType)}</h1>
              <p className="text-body-sm text-text-secondary">
                Search for the {itemType === "book" ? "book" : itemType === "album" ? "album" : "movie"} you want to recommend.
              </p>
            </>
          )}
        </div>

        <form onSubmit={submitSearch}>
          <Input
            autoComplete="off"
            error={undefined}
            label={itemType === "book" ? "Book title or author" : itemType === "album" ? "Album title or artist" : "Movie title"}
            name="query"
            onBlur={() => setIsFocused(false)}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={focusSearch}
            placeholder={itemSearchPlaceholder(itemType)}
            required
            value={query}
          />
        </form>
      </div>

      <ScrollRegion
        className="mt-2 grid content-start gap-2 pb-[calc(24px+var(--keyboard-inset,0px))]"
        aria-label={`${itemType === "book" ? "Book" : itemType === "album" ? "Album" : "Movie"} search results`}
      >
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

        {!isSearching && searched && items.length === 0 && !error ? (
          <div className="rounded-card border border-border-subtle bg-surface-strong p-3">
            <p className="text-body-sm font-bold text-text-primary">No {itemType === "book" ? "books" : itemType === "album" ? "albums" : "films"} found.</p>
            <p className="mt-1 text-body-sm text-text-secondary">Try a shorter title or check the spelling.</p>
          </div>
        ) : null}

        {!isSearching && items.length > 0
          ? items.map((item) => (
              <CompactResultCard
                key={item.itemType === "book" ? item.googleBooksId : item.itemType === "album" ? item.spotifyAlbumId : item.tmdbId}
                item={item}
                onSelect={onSelectItem ? () => onSelectItem(item) : undefined}
              />
            ))
          : null}
      </ScrollRegion>
    </div>
  );
}
