import { AvatarBadge } from "../ui/AvatarBadge";
import { Card } from "../ui/Card";
import { Chip } from "../ui/Chip";
import { MoviePoster } from "../ui/MoviePoster";

type RecommendationCardProps = {
  recommender: string;
  title: string;
  year: string;
  genres: string;
  reason: string;
  note: string;
  target: string;
};

export function RecommendationCard({ recommender, title, year, genres, reason, note, target }: RecommendationCardProps) {
  return (
    <Card className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 p-3 text-left">
      <MoviePoster title={title} />
      <div className="min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <AvatarBadge name={recommender} seed={2} />
          <p className="truncate text-body-sm font-semibold text-text-secondary">{recommender} recommended this</p>
        </div>
        <div>
          <h3 className="truncate text-card-title font-semibold uppercase tracking-[0.02em] text-text-primary">{title}</h3>
          <p className="metadata-label mt-1 text-text-muted">{year} · {genres}</p>
        </div>
        <Chip className="min-h-8 bg-accent-soft/70" selected={false}>{reason}</Chip>
        <p className="line-clamp-2 text-body-sm text-text-secondary">“{note}”</p>
        <div className="space-y-1 border-t border-border-subtle pt-2">
          <p className="text-body-sm font-semibold text-text-muted">{target}</p>
          <p className="text-caption font-bold uppercase tracking-[0.06em] text-text-secondary">Want to watch · 2&nbsp;&nbsp; Loved it · 1</p>
        </div>
      </div>
    </Card>
  );
}
