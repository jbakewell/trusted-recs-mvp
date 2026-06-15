import { ItemThumbnail } from "./ItemThumbnail";

type MoviePosterProps = {
  title: string;
  src?: string;
  className?: string;
  size?: "sm" | "md";
};

const sizeClasses = {
  sm: "w-16",
  md: "w-[92px]",
};

export function MoviePoster({ title, src, className = "", size = "md" }: MoviePosterProps) {
  return <ItemThumbnail className={className} label="poster" size={size} src={src} title={title} />;
}
