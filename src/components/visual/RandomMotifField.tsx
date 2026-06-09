import type { CSSProperties } from "react";
import { createSeededRandom, randomBetween, randomInt } from "@/lib/visual/seededRandom";
import { OverprintMotif, type OverprintMotifPalette, type OverprintMotifVariant } from "./OverprintMotif";

type RandomMotifFieldProps = {
  seed: string;
  density?: "low" | "medium";
  placement?: "corner" | "edge" | "background" | "emptyState";
  palette?: "mixed" | "roseTealOlive" | "roseGreenOrange";
  className?: string;
};

const variantsByPlacement: Record<NonNullable<RandomMotifFieldProps["placement"]>, OverprintMotifVariant[]> = {
  corner: ["cornerCluster", "edgeBars"],
  edge: ["edgeBars", "cornerCluster"],
  background: ["bottomLandscape", "cornerCluster"],
  emptyState: ["emptyState", "cornerCluster"],
};

export function RandomMotifField({
  seed,
  density = "low",
  placement = "corner",
  palette = "mixed",
  className = "",
}: RandomMotifFieldProps) {
  const random = createSeededRandom(`${seed}:${density}:${placement}:${palette}`);
  const count = density === "medium" ? randomInt(random, 4, 6) : randomInt(random, 2, 3);
  const variants = variantsByPlacement[placement];
  const shapes = Array.from({ length: count }, (_, index) => {
    const variant = variants[index % variants.length];
    const top = randomBetween(random, 0, 74);
    const left = randomBetween(random, 0, 78);
    const rotation = randomBetween(random, -14, 14);
    const scale = randomBetween(random, 0.62, 1.12);
    const opacity = randomBetween(random, 0.42, 0.72);

    return { index, variant, top, left, rotation, scale, opacity };
  });

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {shapes.map((shape) => (
        <OverprintMotif
          className="absolute"
          intensity="subtle"
          key={shape.index}
          palette={palette as OverprintMotifPalette}
          size="md"
          variant={shape.variant}
          style={{
            left: `${shape.left}%`,
            opacity: shape.opacity,
            top: `${shape.top}%`,
            transform: `rotate(${shape.rotation}deg) scale(${shape.scale})`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
