export function LoadingSkeleton() {
  return (
    <div aria-label="Loading" className="grid grid-cols-[92px_minmax(0,1fr)] gap-3 rounded-card border border-border-subtle bg-bg-surface p-3" role="status">
      <div className="aspect-[2/3] w-[92px] animate-pulse bg-bg-inset" />
      <div className="grid content-start gap-3">
        <div className="h-3 w-2/3 animate-pulse bg-bg-muted" />
        <div className="h-5 w-full animate-pulse bg-bg-muted" />
        <div className="h-3 w-1/2 animate-pulse bg-bg-muted" />
        <div className="h-8 w-28 animate-pulse rounded-full bg-bg-muted" />
        <div className="h-3 w-5/6 animate-pulse bg-bg-muted" />
      </div>
    </div>
  );
}
