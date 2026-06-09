type AvatarBadgeProps = {
  name: string;
  seed?: number;
  size?: "sm" | "md";
};

const avatarColors = [
  { bg: "bg-avatar-rose", text: "text-text-inverse" },
  { bg: "bg-avatar-teal", text: "text-text-inverse" },
  { bg: "bg-avatar-green", text: "text-text-inverse" },
  { bg: "bg-avatar-orange", text: "text-text-inverse" },
  { bg: "bg-avatar-purple", text: "text-text-inverse" },
  { bg: "bg-avatar-olive", text: "text-text-inverse" },
  { bg: "bg-avatar-charcoal", text: "text-text-inverse" },
  { bg: "bg-avatar-paper", text: "text-text-primary" },
];

const sizeClasses = {
  sm: "h-8 w-8 text-caption",
  md: "h-10 w-10 text-body-sm",
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

export function AvatarBadge({ name, seed = 0, size = "sm" }: AvatarBadgeProps) {
  const color = avatarColors[Math.abs(seed) % avatarColors.length];

  return (
    <span
      aria-label={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-border-subtle ${color.bg} ${color.text} ${sizeClasses[size]} font-bold tracking-[0.06em]`}
      title={name}
    >
      {initialsFor(name)}
    </span>
  );
}
