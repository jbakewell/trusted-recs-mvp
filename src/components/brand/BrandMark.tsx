import { OverprintMotif } from "@/components/visual/OverprintMotif";

export function BrandMark() {
  return (
    <div aria-hidden="true" className="relative h-10 w-10 shrink-0 overflow-visible">
      <OverprintMotif className="h-10 w-10" intensity="bold" palette="roseTealOlive" size="sm" variant="brandMark" />
    </div>
  );
}
