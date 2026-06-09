import type { CSSProperties } from "react";

export type OverprintMotifVariant =
  | "brandMark"
  | "cornerCluster"
  | "bottomLandscape"
  | "posterFallback"
  | "emptyState"
  | "sectionDivider"
  | "quotePanel"
  | "edgeBars";

export type OverprintMotifPalette =
  | "roseTealOlive"
  | "roseGreenOrange"
  | "tealOliveCharcoal"
  | "rosePurpleOrange"
  | "mixed";

export type OverprintMotifIntensity = "subtle" | "standard" | "bold";

type OverprintMotifProps = {
  variant: OverprintMotifVariant;
  palette?: OverprintMotifPalette;
  intensity?: OverprintMotifIntensity;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  style?: CSSProperties;
};

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-20 w-20",
  lg: "h-36 w-36",
  xl: "h-64 w-64",
};

const intensityOpacity = {
  subtle: "0.52",
  standard: "0.7",
  bold: "0.84",
};

const palettes: Record<OverprintMotifPalette, string[]> = {
  roseTealOlive: ["var(--color-accent)", "var(--color-accent-teal)", "var(--color-accent-olive)", "var(--color-bg-surface)"],
  roseGreenOrange: ["var(--color-accent)", "var(--color-accent-green)", "var(--color-accent-orange)", "var(--color-bg-surface)"],
  tealOliveCharcoal: ["var(--color-accent-teal)", "var(--color-accent-olive)", "var(--color-text-primary)", "var(--color-bg-surface)"],
  rosePurpleOrange: ["var(--color-accent)", "var(--color-accent-purple)", "var(--color-accent-orange)", "var(--color-bg-surface)"],
  mixed: ["var(--color-accent)", "var(--color-accent-teal)", "var(--color-accent-green)", "var(--color-accent-orange)"],
};

function ShapeGroup({ variant, colors }: { variant: OverprintMotifVariant; colors: string[] }) {
  const [primary, secondary, tertiary, pale] = colors;

  if (variant === "brandMark") {
    return (
      <>
        <circle cx="27" cy="22" r="18" fill={primary} />
        <circle cx="42" cy="27" r="18" fill={secondary} />
        <path d="M18 64 L34 30 L50 64 Z" fill="var(--color-text-primary)" />
        <circle cx="38" cy="42" r="8" fill={tertiary} />
      </>
    );
  }

  if (variant === "posterFallback") {
    return (
      <>
        <rect x="0" y="0" width="100" height="150" fill="var(--color-bg-inset)" opacity="0.72" />
        <circle cx="31" cy="42" r="31" fill={primary} />
        <circle cx="58" cy="58" r="30" fill={secondary} />
        <path d="M18 142 L45 72 L72 142 Z" fill="var(--color-text-primary)" />
        <circle cx="58" cy="88" r="15" fill={pale} opacity="0.86" />
        <path d="M76 14 V70 M84 14 V70 M92 14 V70" stroke="var(--color-text-primary)" strokeWidth="3" />
      </>
    );
  }

  if (variant === "bottomLandscape" || variant === "cornerCluster") {
    return (
      <>
        <path d="M0 160 A120 120 0 0 1 120 40 V160 Z" fill={primary} />
        <path d="M82 160 A120 120 0 0 1 202 40 V160 Z" fill={secondary} />
        <circle cx="214" cy="84" r="52" fill={tertiary} />
        <circle cx="44" cy="84" r="46" fill={pale} opacity="0.72" />
        <path d="M236 70 V154 M248 70 V154 M260 70 V154" stroke="var(--color-text-primary)" strokeWidth="4" />
      </>
    );
  }

  if (variant === "emptyState" || variant === "quotePanel") {
    return (
      <>
        <circle cx="42" cy="42" r="34" fill={primary} />
        <circle cx="72" cy="58" r="30" fill={secondary} />
        <path d="M28 124 L56 70 L86 124 Z" fill="var(--color-text-primary)" />
        <circle cx="84" cy="88" r="20" fill={tertiary} />
      </>
    );
  }

  if (variant === "edgeBars" || variant === "sectionDivider") {
    return (
      <>
        <rect x="24" y="14" width="8" height="58" fill={primary} />
        <rect x="40" y="4" width="8" height="76" fill={secondary} />
        <rect x="56" y="20" width="8" height="48" fill={tertiary} />
        <circle cx="48" cy="48" r="24" fill={pale} opacity="0.58" />
      </>
    );
  }

  return null;
}

export function OverprintMotif({
  variant,
  palette = "mixed",
  intensity = "standard",
  size = "md",
  className = "",
  style,
}: OverprintMotifProps) {
  const viewBox = variant === "posterFallback" ? "0 0 100 150" : "0 0 280 180";
  const motifSize = variant === "posterFallback" ? "" : sizeClasses[size];

  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none select-none overflow-visible ${motifSize} ${className}`}
      focusable="false"
      style={style}
      viewBox={viewBox}
    >
      <defs>
        <filter id={`grain-${variant}-${palette}-${intensity}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence baseFrequency="0.9" numOctaves="2" seed="7" type="fractalNoise" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA slope="0.035" type="linear" />
          </feComponentTransfer>
          <feBlend in2="SourceGraphic" mode="multiply" />
        </filter>
      </defs>
      <g filter={`url(#grain-${variant}-${palette}-${intensity})`} opacity={intensityOpacity[intensity]} style={{ mixBlendMode: "multiply" }}>
        <ShapeGroup colors={palettes[palette]} variant={variant} />
      </g>
    </svg>
  );
}
