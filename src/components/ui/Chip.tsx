import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  selected?: boolean;
  tint?: ChipTint;
};

type ChipButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  tint?: ChipTint;
  children: ReactNode;
};

type ChipTint = "neutral" | "rose" | "teal" | "green" | "orange" | "purple" | "olive";

const tintClasses: Record<ChipTint, string> = {
  neutral: "border-border-subtle bg-surface-strong text-text-primary",
  rose: "border-chip-rose bg-chip-rose text-text-primary",
  teal: "border-chip-teal bg-chip-teal text-text-primary",
  green: "border-chip-green bg-chip-green text-text-primary",
  orange: "border-chip-orange bg-chip-orange text-text-primary",
  purple: "border-chip-purple bg-chip-purple text-text-primary",
  olive: "border-chip-olive bg-chip-olive text-text-primary",
};

const chipClasses = (selected = false, tint: ChipTint = "neutral") =>
  `inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border px-3 text-caption font-bold uppercase tracking-[0.06em] shadow-subtle ${
    selected
      ? "border-accent bg-accent text-text-inverse"
      : tintClasses[tint]
  }`;

export function Chip({ selected = false, tint = "neutral", className = "", ...props }: ChipProps) {
  return <span className={`${chipClasses(selected, tint)} ${className}`} {...props} />;
}

export function ChipButton({ selected = false, tint = "neutral", className = "", children, ...props }: ChipButtonProps) {
  return (
    <button
      aria-pressed={selected}
      className={`${chipClasses(selected, tint)} transition-colors hover:border-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
