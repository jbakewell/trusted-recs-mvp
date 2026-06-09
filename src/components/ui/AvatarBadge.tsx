type AvatarBadgeProps = {
  name: string;
  seed?: number;
};

const avatarColors = ["bg-accent-soft", "bg-accent-teal/25", "bg-accent-green/25", "bg-accent-orange/25", "bg-accent-purple/25"];

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AvatarBadge({ name, seed = 0 }: AvatarBadgeProps) {
  const color = avatarColors[Math.abs(seed) % avatarColors.length];

  return (
    <span
      aria-label={name}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-subtle ${color} text-caption font-bold tracking-[0.06em] text-text-primary`}
      title={name}
    >
      {initialsFor(name)}
    </span>
  );
}
