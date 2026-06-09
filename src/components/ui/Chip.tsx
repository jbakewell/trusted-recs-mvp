import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  selected?: boolean;
};

type ChipButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
  children: ReactNode;
};

const chipClasses = (selected = false) =>
  `inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border px-3 text-caption font-bold uppercase tracking-[0.06em] ${
    selected
      ? "border-accent bg-accent text-text-inverse"
      : "border-border-subtle bg-bg-surface text-text-primary"
  }`;

export function Chip({ selected = false, className = "", ...props }: ChipProps) {
  return <span className={`${chipClasses(selected)} ${className}`} {...props} />;
}

export function ChipButton({ selected = false, className = "", children, ...props }: ChipButtonProps) {
  return (
    <button
      aria-pressed={selected}
      className={`${chipClasses(selected)} transition-colors hover:border-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${className}`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
