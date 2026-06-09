import { OverprintMotif } from "@/components/visual/OverprintMotif";

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
      <OverprintMotif className="absolute inset-0 h-full w-full" intensity="bold" palette="roseTealOlive" variant="posterFallback" />
      <span className="relative z-10 rounded-full bg-bg-surface/75 px-2 font-display text-display-md font-bold text-text-primary">
        {initial}
      </span>
    </div>
  );
}
