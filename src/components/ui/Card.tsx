import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-card border border-border-subtle bg-bg-surface p-4 md:p-6 ${className}`} {...props} />;
}
