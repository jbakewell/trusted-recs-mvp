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

const tintAssets: Record<ChipTint, { src: string; text: string }> = {
  neutral: { src: "/pills/pill_paper_outline_transparent.png", text: "text-text-primary" },
  rose: { src: "/pills/pill_rose_transparent.png", text: "text-text-inverse" },
  teal: { src: "/pills/pill_teal_transparent.png", text: "text-text-inverse" },
  green: { src: "/pills/pill_green_transparent.png", text: "text-text-inverse" },
  orange: { src: "/pills/pill_orange_transparent.png", text: "text-text-inverse" },
  purple: { src: "/pills/pill_purple_transparent.png", text: "text-text-inverse" },
  olive: { src: "/pills/pill_olive_transparent.png", text: "text-text-inverse" },
};

const chipClasses = (selected = false, tint: ChipTint = "neutral") => {
  const asset = selected ? tintAssets.rose : tintAssets[tint];

  return `relative inline-flex min-h-9 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-3 text-caption font-bold uppercase tracking-[0.06em] shadow-subtle ${asset.text}`;
};

function PillImage({ selected = false, tint = "neutral" }: { selected?: boolean; tint?: ChipTint }) {
  const asset = selected ? tintAssets.rose : tintAssets[tint];

  return (
    <img
      alt=""
      aria-hidden="true"
      className="asset-pill absolute inset-0 h-full w-full select-none object-fill"
      draggable={false}
      src={asset.src}
    />
  );
}

export function Chip({ selected = false, tint = "neutral", className = "", ...props }: ChipProps) {
  const { children, ...spanProps } = props;

  return (
    <span className={`${chipClasses(selected, tint)} ${className}`} {...spanProps}>
      <PillImage selected={selected} tint={tint} />
      <span className="relative z-10">{children}</span>
    </span>
  );
}

export function ChipButton({ selected = false, tint = "neutral", className = "", children, ...props }: ChipButtonProps) {
  return (
    <button
      aria-pressed={selected}
      className={`${chipClasses(selected, tint)} transition-colors hover:border-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${className}`}
      type="button"
      {...props}
    >
      <PillImage selected={selected} tint={tint} />
      <span className="relative z-10">{children}</span>
    </button>
  );
}
