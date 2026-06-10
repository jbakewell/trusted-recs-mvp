import type { HTMLAttributes, ReactNode } from "react";

type TranslucentSurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article" | "aside";
  children: ReactNode;
  strength?: "soft" | "default" | "strong";
};

const strengthClasses = {
  soft: "surface-soft",
  default: "surface-paper",
  strong: "surface-strong",
};

export function TranslucentSurface({
  as,
  children,
  className = "",
  strength = "default",
  ...props
}: TranslucentSurfaceProps) {
  const Component = as ?? "div";

  return (
    <Component className={`${strengthClasses[strength]} ${className}`} {...props}>
      {children}
    </Component>
  );
}
