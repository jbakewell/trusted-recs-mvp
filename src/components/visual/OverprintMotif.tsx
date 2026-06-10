import type { CSSProperties } from "react";

export type OverprintMotifVariant =
  | "brandMark"
  | "cornerOrbs"
  | "bottomOrbs"
  | "largeArch"
  | "keyholeStack"
  | "trianglePeaks"
  | "semicircleLandscape"
  | "verticalRules"
  | "posterFallback"
  | "emptyState"
  | "feedAccent"
  | "cornerCluster"
  | "bottomLandscape"
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
  md: "h-24 w-24",
  lg: "h-44 w-44",
  xl: "h-72 w-72",
};

const intensityOpacity = {
  subtle: "0.48",
  standard: "0.66",
  bold: "0.82",
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
        <circle cx="58" cy="50" r="32" fill={primary} />
        <circle cx="82" cy="68" r="28" fill={secondary} />
        <path d="M34 132 L68 62 L104 132 Z" fill="var(--color-text-primary)" />
        <circle cx="70" cy="82" r="18" fill="var(--color-text-primary)" opacity="0.72" />
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

  if (variant === "cornerOrbs" || variant === "cornerCluster") {
    return (
      <>
        <circle cx="84" cy="70" r="62" fill={primary} />
        <circle cx="132" cy="104" r="56" fill={secondary} />
        <circle cx="180" cy="78" r="42" fill={tertiary} />
        <circle cx="116" cy="144" r="34" fill="var(--color-text-primary)" opacity="0.62" />
      </>
    );
  }

  if (variant === "bottomOrbs" || variant === "bottomLandscape") {
    return (
      <>
        <path d="M0 240 A132 132 0 0 1 132 108 V240 Z" fill={primary} />
        <path d="M84 240 A132 132 0 0 1 216 108 V240 Z" fill={secondary} />
        <circle cx="238" cy="154" r="64" fill={tertiary} />
        <circle cx="54" cy="142" r="44" fill={pale} opacity="0.74" />
        <path d="M246 80 V214 M258 80 V214 M270 80 V214" stroke="var(--color-text-primary)" strokeWidth="4" />
      </>
    );
  }

  if (variant === "largeArch") {
    return (
      <>
        <path d="M38 236 V126a86 86 0 0 1 172 0v110h-48V128a38 38 0 0 0-76 0v108Z" fill={secondary} />
        <path d="M138 236 V130a64 64 0 0 1 104 50v56Z" fill={primary} />
        <circle cx="206" cy="166" r="40" fill={tertiary} />
      </>
    );
  }

  if (variant === "keyholeStack" || variant === "emptyState" || variant === "quotePanel") {
    return (
      <>
        <circle cx="98" cy="78" r="52" fill={primary} />
        <circle cx="142" cy="96" r="46" fill={secondary} />
        <path d="M70 220 L116 116 L164 220 Z" fill="var(--color-text-primary)" />
        <circle cx="156" cy="134" r="30" fill={tertiary} />
        <circle cx="126" cy="104" r="22" fill="var(--color-bg-surface)" opacity="0.78" />
      </>
    );
  }

  if (variant === "trianglePeaks") {
    return (
      <>
        <path d="M34 230 L102 62 L174 230 Z" fill={secondary} />
        <path d="M112 230 L176 94 L244 230 Z" fill={primary} />
        <path d="M82 230 L148 118 L214 230 Z" fill="var(--color-text-primary)" opacity="0.58" />
        <circle cx="218" cy="92" r="32" fill={pale} opacity="0.8" />
      </>
    );
  }

  if (variant === "semicircleLandscape" || variant === "feedAccent") {
    return (
      <>
        <path d="M0 220 A110 110 0 0 1 110 110 V220 Z" fill={primary} />
        <path d="M92 220 A100 100 0 0 1 192 120 V220 Z" fill={secondary} />
        <rect x="202" y="76" width="58" height="144" fill={tertiary} opacity="0.84" />
        <path d="M226 90 V206 M238 90 V206 M250 90 V206" stroke="var(--color-text-primary)" strokeWidth="5" />
      </>
    );
  }

  if (variant === "verticalRules" || variant === "edgeBars" || variant === "sectionDivider") {
    return (
      <>
        <rect x="70" y="56" width="10" height="142" fill={primary} />
        <rect x="96" y="36" width="10" height="178" fill={secondary} />
        <rect x="122" y="72" width="10" height="112" fill={tertiary} />
        <circle cx="110" cy="132" r="54" fill={pale} opacity="0.66" />
        <path d="M178 44 V218 M194 44 V218 M210 44 V218" stroke="var(--color-text-primary)" strokeWidth="5" />
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
  const viewBox = variant === "posterFallback" ? "0 0 100 150" : "0 0 280 240";
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
          <feTurbulence baseFrequency="0.8" numOctaves="2" seed="7" type="fractalNoise" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA slope="0.03" type="linear" />
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
