import { OverprintMotif } from "@/components/visual/OverprintMotif";

type ItemThumbnailProps = {
  title: string;
  src?: string | null;
  label?: "poster" | "cover";
  className?: string;
  size?: "sm" | "md";
  aspect?: "portrait" | "square";
};

const sizeClasses = {
  sm: "w-16",
  md: "w-[92px]",
};

export function ItemThumbnail({ title, src, label = "poster", className = "", size = "md", aspect = "portrait" }: ItemThumbnailProps) {
  const thumbnailSize = sizeClasses[size];
  const aspectClass = aspect === "square" ? "aspect-square" : "aspect-[2/3]";

  if (src) {
    return (
      <img
        alt={`${title} ${label}`}
        className={`${aspectClass} ${thumbnailSize} shrink-0 border border-border-subtle object-cover ${className}`}
        src={src}
      />
    );
  }

  const initial = title.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      aria-label={`${title} ${label} unavailable`}
      className={`relative grid ${aspectClass} ${thumbnailSize} shrink-0 place-items-center overflow-hidden border border-border-subtle bg-bg-inset ${className}`}
      role="img"
    >
      <OverprintMotif className="absolute inset-0 h-full w-full" intensity="bold" palette="roseTealOlive" variant="posterFallback" />
      <span className="relative z-10 rounded-full bg-bg-surface/75 px-2 font-display text-display-md font-bold text-text-primary empty:hidden">
        {initial}
      </span>
    </div>
  );
}
