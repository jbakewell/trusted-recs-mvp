export function BrandMark() {
  return (
    <div aria-hidden="true" className="relative h-10 w-10 shrink-0 border border-border-strong bg-bg-surface">
      <span className="absolute left-2 top-2 h-4 w-4 rounded-full border border-text-primary bg-accent-soft" />
      <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border border-text-primary bg-accent" />
      <span className="absolute left-[15px] top-[15px] h-2 w-2 bg-text-primary" />
    </div>
  );
}
