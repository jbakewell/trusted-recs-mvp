import type { ReactNode } from "react";

type CompactSummaryCardProps = {
  poster?: ReactNode;
  label: string;
  title: string;
  metadata?: string;
  action?: ReactNode;
  className?: string;
};

export function CompactSummaryCard({ poster, label, title, metadata, action, className = "" }: CompactSummaryCardProps) {
  return (
    <article className={`grid min-h-[76px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-card border border-border-subtle bg-bg-surface p-3 ${className}`}>
      {poster}
      <div className="min-w-0">
        <p className="metadata-label text-accent">{label}</p>
        <h2 className="truncate font-display text-card-title font-semibold uppercase tracking-[0.04em] text-text-primary">
          {title}
        </h2>
        {metadata ? <p className="truncate text-body-sm text-text-muted">{metadata}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </article>
  );
}
