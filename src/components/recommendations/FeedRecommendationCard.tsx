import Link from "next/link";
import { MoviePoster } from "@/components/ui/MoviePoster";
import {
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
    title: string;
    description?: string | null;
    movieMetadata: {
      releaseYear: number | null;
      overview?: string | null;
      posterPath: string | null;
      genres: unknown;
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
  const movieHref = `/groups/${groupId}/movies/${recommendation.item.id}`;
  const noteOrDescription =
    recommendation.note?.trim() || metadata?.overview?.trim() || recommendation.item.description?.trim() || null;

  return (
    <article className="relative h-[178px] shrink-0 overflow-hidden rounded-card border border-border-subtle surface-strong p-3 shadow-subtle">
      <div className="grid h-full grid-cols-[minmax(0,1fr)_92px] gap-3">
        <div className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-2">
          <div className="min-w-0">
            <h2 className="line-clamp-1 font-display text-[28px] font-semibold uppercase leading-none tracking-[0.04em] text-text-primary">
              {recommendation.item.title}
            </h2>
            <p className="metadata-label mt-1 truncate text-text-muted">
              {metadata?.releaseYear ?? "Year unknown"} - {genresText(metadata?.genres, 2)}
            </p>
          </div>

          <p className="line-clamp-2 self-start text-body-sm text-text-secondary">
            {recommenderNoteText(recommendation.recommendedByParticipant.displayName, noteOrDescription)}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Link className={`${pillLinkClasses} min-h-8 px-2.5 text-[10px]`} href={movieHref}>
              More...
            </Link>
          </div>
        </div>

        <Link
          aria-label={`View ${recommendation.item.title} details`}
          className="self-start rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
          href={movieHref}
        >
          <MoviePoster
            className="!w-[92px]"
            size="md"
            src={tmdbImageUrl(metadata?.posterPath ?? null) ?? undefined}
            title={recommendation.item.title}
          />
        </Link>
      </div>
    </article>
  );
}
