import Link from "next/link";
import { ItemThumbnail } from "@/components/ui/ItemThumbnail";
import {
  authorsText,
  genresText,
  recommenderNoteText,
  type RecommendationReasonsForDisplay,
  type RecommendationTargetForDisplay,
} from "@/lib/recommendations/display";
import { tmdbImageUrl } from "@/lib/tmdb/movies";

export type FeedRecommendationCardRecommendation = RecommendationReasonsForDisplay & {
  id: string;
  note: string | null;
  recommendedByParticipant: {
    displayName: string;
  };
  item: {
    id: string;
    type: "movie" | "book";
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    movieMetadata: {
      releaseYear: number | null;
      overview?: string | null;
      posterPath: string | null;
      genres: unknown;
    } | null;
    bookMetadata?: {
      authors: unknown;
      publisher: string | null;
      publishedYear: number | null;
      description?: string | null;
      coverUrl: string | null;
      categories: unknown;
    } | null;
  };
  targets: RecommendationTargetForDisplay[];
};

type FeedRecommendationCardProps = {
  groupId: string;
  recommendation: FeedRecommendationCardRecommendation;
};

const pillLinkClasses =
  "inline-flex min-h-9 items-center justify-center rounded-full border border-border-strong bg-transparent px-3 text-caption font-bold uppercase tracking-[0.06em] text-text-primary shadow-subtle transition-colors hover:bg-bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring";

export function FeedRecommendationCard({ groupId, recommendation }: FeedRecommendationCardProps) {
  const metadata = recommendation.item.movieMetadata;
  const bookMetadata = recommendation.item.bookMetadata;
  const itemHref = `/groups/${groupId}/items/${recommendation.item.id}`;
  const userNote = recommendation.note?.trim() || null;
  const fallbackSummary =
    (recommendation.item.type === "book" ? bookMetadata?.description?.trim() : metadata?.overview?.trim()) ||
    recommendation.item.description?.trim() ||
    null;
  const displayNote = userNote
    ? recommenderNoteText(recommendation.recommendedByParticipant.displayName, userNote)
    : fallbackSummary ?? recommenderNoteText(recommendation.recommendedByParticipant.displayName, null);
  const thumbnailSrc =
    recommendation.item.type === "book"
      ? bookMetadata?.coverUrl ?? recommendation.item.imageUrl
      : tmdbImageUrl(metadata?.posterPath ?? null) ?? recommendation.item.imageUrl;
  const metadataText =
    recommendation.item.type === "book"
      ? [authorsText(bookMetadata?.authors, 2), bookMetadata?.publishedYear ? String(bookMetadata.publishedYear) : null, bookMetadata?.publisher]
          .filter(Boolean)
          .join(" - ")
      : `${metadata?.releaseYear ?? "Year unknown"} - ${genresText(metadata?.genres, 2)}`;

  return (
    <article className="relative h-[178px] shrink-0 overflow-hidden rounded-card border border-border-subtle surface-strong p-3 shadow-subtle">
      <div className="grid h-full grid-cols-[minmax(0,1fr)_92px] gap-3">
        <div className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-2">
          <div className="min-w-0">
            <h2 className="line-clamp-1 font-display text-[28px] font-semibold uppercase leading-none tracking-[0.04em] text-text-primary">
              {recommendation.item.title}
            </h2>
            <p className="metadata-label mt-1 truncate text-text-muted">
              {metadataText}
            </p>
          </div>

          <p className="line-clamp-2 self-start text-body-sm text-text-secondary">
            {displayNote}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link className={`${pillLinkClasses} min-h-8 px-2.5 text-[10px]`} href={itemHref}>
              More...
            </Link>
          </div>
        </div>

        <Link
          aria-label={`View ${recommendation.item.title} details`}
          className="self-start rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          href={itemHref}
        >
          <ItemThumbnail
            className="!w-[92px]"
            label={recommendation.item.type === "book" ? "cover" : "poster"}
            size="md"
            src={thumbnailSrc ?? undefined}
            title={recommendation.item.title}
          />
        </Link>
      </div>
    </article>
  );
}
