type MoviePosterProps = {
  title: string;
  src?: string;
  className?: string;
};

export function MoviePoster({ title, src, className = "" }: MoviePosterProps) {
  if (src) {
    return (
      <img
        alt={`${title} poster`}
        className={`aspect-[2/3] w-[92px] shrink-0 border border-border-subtle object-cover ${className}`}
        src={src}
      />
    );
  }

  const initial = title.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      aria-label={`${title} poster unavailable`}
      className={`relative grid aspect-[2/3] w-[92px] shrink-0 place-items-center overflow-hidden border border-border-subtle bg-bg-inset ${className}`}
      role="img"
    >
      <span className="absolute left-3 top-4 h-8 w-8 rounded-full border border-text-primary bg-accent-soft" />
      <span className="absolute bottom-5 right-3 h-9 w-9 rounded-full border border-text-primary bg-bg-surface" />
      <span className="z-10 font-display text-display-md font-bold text-text-primary">{initial}</span>
    </div>
  );
}
