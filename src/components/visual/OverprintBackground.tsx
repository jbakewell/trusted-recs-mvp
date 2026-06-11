import type { CSSProperties } from "react";

export const OVERPRINT_BACKGROUND_IMAGES = [
  "/backgrounds/back-1.png",
  "/backgrounds/back-2.png",
  "/backgrounds/back-3.png",
  "/backgrounds/back-4.png",
  "/backgrounds/back-5.png",
  "/backgrounds/back-6.png",
  "/backgrounds/back-7.png",
  "/backgrounds/back-8.png",
] as const;

type OverprintBackgroundProps = {
  route?: "landing" | "landingHero" | "group-home" | "recommend" | "search" | "manage" | "generic";
  seed?: string;
  density?: "none" | "subtle" | "medium" | "bold";
  className?: string;
  backgroundIndex?: number;
};

const densityOpacity = {
  none: "0",
  subtle: "0.42",
  medium: "0.58",
  bold: "0.72",
};

export function pickOverprintBackgroundIndex() {
  return Math.floor(Math.random() * OVERPRINT_BACKGROUND_IMAGES.length);
}

export function OverprintBackground({
  backgroundIndex = 0,
  className = "",
  density = "medium",
}: OverprintBackgroundProps) {
  if (density === "none") {
    return null;
  }

  const image = OVERPRINT_BACKGROUND_IMAGES[Math.abs(backgroundIndex) % OVERPRINT_BACKGROUND_IMAGES.length];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden bg-bg-page ${className}`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={
          {
            backgroundImage: `url("${image}")`,
            opacity: densityOpacity[density],
          } as CSSProperties
        }
      />
      <div className="absolute inset-0 bg-bg-page/20" />
    </div>
  );
}
