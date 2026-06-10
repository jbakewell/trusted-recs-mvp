import type { HTMLAttributes } from "react";

export function ScrollRegion({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] ${className}`}
      {...props}
    />
  );
}
