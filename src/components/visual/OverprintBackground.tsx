import { createSeededRandom, randomBetween, randomInt } from "@/lib/visual/seededRandom";
import { OverprintMotif, type OverprintMotifPalette, type OverprintMotifVariant } from "./OverprintMotif";

type OverprintBackgroundProps = {
  route: "landing" | "group-home" | "recommend" | "search" | "manage" | "generic";
  seed: string;
  density?: "none" | "subtle" | "medium" | "bold";
  className?: string;
};

type MotifPlacement = {
  variant: OverprintMotifVariant;
  palette: OverprintMotifPalette;
  className: string;
  rotation?: number;
  scale?: number;
  opacity?: number;
};

const routeMotifs: Record<OverprintBackgroundProps["route"], MotifPlacement[]> = {
  landing: [
    { variant: "largeArch", palette: "roseTealOlive", className: "absolute -left-20 -top-24 h-80 w-80 sm:h-96 sm:w-96", opacity: 0.8 },
    { variant: "verticalRules", palette: "tealOliveCharcoal", className: "absolute right-0 top-28 h-52 w-36", opacity: 0.78 },
    { variant: "bottomOrbs", palette: "roseGreenOrange", className: "absolute -bottom-14 -right-20 h-80 w-96", opacity: 0.76 },
  ],
  "group-home": [
    { variant: "semicircleLandscape", palette: "roseGreenOrange", className: "absolute -bottom-16 -right-16 h-80 w-80", opacity: 0.5 },
    { variant: "largeArch", palette: "tealOliveCharcoal", className: "absolute -right-20 top-44 h-72 w-72", opacity: 0.28 },
    { variant: "cornerOrbs", palette: "rosePurpleOrange", className: "absolute -left-20 bottom-16 h-64 w-64", opacity: 0.36 },
  ],
  recommend: [
    { variant: "largeArch", palette: "tealOliveCharcoal", className: "absolute -right-20 -top-20 h-72 w-72", opacity: 0.42 },
    { variant: "bottomOrbs", palette: "rosePurpleOrange", className: "absolute -bottom-20 -right-16 h-80 w-80", opacity: 0.52 },
    { variant: "cornerOrbs", palette: "roseGreenOrange", className: "absolute -left-20 bottom-10 h-56 w-56", opacity: 0.34 },
  ],
  search: [
    { variant: "largeArch", palette: "tealOliveCharcoal", className: "absolute -right-20 -top-20 h-72 w-72", opacity: 0.38 },
    { variant: "bottomOrbs", palette: "roseGreenOrange", className: "absolute -bottom-20 -left-20 h-72 w-72", opacity: 0.42 },
  ],
  manage: [
    { variant: "verticalRules", palette: "roseTealOlive", className: "absolute -right-6 top-28 h-64 w-40", opacity: 0.5 },
    { variant: "cornerOrbs", palette: "roseGreenOrange", className: "absolute -bottom-20 -left-16 h-72 w-72", opacity: 0.4 },
  ],
  generic: [
    { variant: "bottomOrbs", palette: "mixed", className: "absolute -bottom-20 -right-16 h-72 w-72", opacity: 0.38 },
  ],
};

const densityCount = {
  none: 0,
  subtle: 1,
  medium: 2,
  bold: 3,
};

export function OverprintBackground({ route, seed, density = "medium", className = "" }: OverprintBackgroundProps) {
  const placements = routeMotifs[route] ?? routeMotifs.generic;
  const random = createSeededRandom(`${route}:${seed}:${density}`);
  const count = Math.min(densityCount[density], placements.length);
  const offset = placements.length > 1 ? randomInt(random, 0, placements.length - 1) : 0;
  const selected = Array.from({ length: count }, (_, index) => placements[(offset + index) % placements.length]);

  if (selected.length === 0) {
    return null;
  }

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}>
      {selected.map((placement, index) => {
        const rotation = placement.rotation ?? randomBetween(random, -4, 4);
        const scale = placement.scale ?? randomBetween(random, 0.94, 1.12);

        return (
          <OverprintMotif
            className={placement.className}
            intensity={density === "bold" ? "bold" : "standard"}
            key={`${placement.variant}-${index}`}
            palette={placement.palette}
            size="xl"
            variant={placement.variant}
            style={{
              opacity: placement.opacity ?? randomBetween(random, 0.35, 0.65),
              transform: `rotate(${rotation}deg) scale(${scale})`,
            }}
          />
        );
      })}
    </div>
  );
}
