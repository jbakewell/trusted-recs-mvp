type SectionAccentBarsProps = {
  palette?: "default" | "tealOlive" | "roseOnly";
  count?: 1 | 2 | 3;
  className?: string;
};

const palettes = {
  default: ["bg-accent", "bg-accent-teal", "bg-accent-orange"],
  tealOlive: ["bg-accent-teal", "bg-accent-olive", "bg-accent"],
  roseOnly: ["bg-accent"],
};

export function SectionAccentBars({ palette = "default", count = 3, className = "" }: SectionAccentBarsProps) {
  return (
    <span aria-hidden="true" className={`inline-flex items-center gap-1 ${className}`}>
      {palettes[palette].slice(0, count).map((color, index) => (
        <span className={`h-[3px] w-[18px] ${color}`} key={`${color}-${index}`} />
      ))}
    </span>
  );
}
