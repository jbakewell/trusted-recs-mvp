import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-card border border-border-subtle surface-strong p-4 md:p-6 ${className}`} {...props} />;
}
