import type { ReactNode } from "react";

type AvatarBadgeProps = {
  label?: ReactNode;
  name: string;
  seed?: number;
  size?: "sm" | "md";
};

const avatarCircleAssets = [
  { bg: "bg-avatar-rose", src: "/avatar-circles/circle_rose_transparent.png", text: "text-text-inverse" },
  { bg: "bg-avatar-teal", src: "/avatar-circles/circle_teal_transparent.png", text: "text-text-inverse" },
  { bg: "bg-avatar-green", src: "/avatar-circles/circle_green_transparent.png", text: "text-text-inverse" },
  { bg: "bg-avatar-orange", src: "/avatar-circles/circle_orange_transparent.png", text: "text-text-inverse" },
  { bg: "bg-avatar-purple", src: "/avatar-circles/circle_purple_transparent.png", text: "text-text-inverse" },
  { bg: "bg-avatar-olive", src: "/avatar-circles/circle_olive_transparent.png", text: "text-text-inverse" },
  { bg: "bg-avatar-charcoal", src: "/avatar-circles/circle_charcoal_transparent.png", text: "text-text-inverse" },
  { bg: "bg-transparent", src: "/avatar-circles/circle_paper_outline_transparent.png", text: "text-text-primary" },
];

const sizeClasses = {
  sm: "h-8 w-8 text-caption",
  md: "h-[44px] w-[44px] text-body-sm",
};

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AvatarBadge({ label, name, seed = 0, size = "sm" }: AvatarBadgeProps) {
  const asset = avatarCircleAssets[Math.abs(seed) % avatarCircleAssets.length];

  return (
    <span
      aria-label={name}
      className={`asset-circle relative inline-grid shrink-0 place-items-center rounded-full bg-contain bg-center bg-no-repeat ${asset.bg} ${asset.text} ${sizeClasses[size]} font-bold tracking-[0.06em]`}
      style={{ backgroundImage: `url(${asset.src})` }}
      title={name}
    >
      <span className="relative z-10">{label ?? initialsFor(name)}</span>
    </span>
  );
}
