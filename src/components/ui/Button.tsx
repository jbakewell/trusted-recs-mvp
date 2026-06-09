import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

const variantClasses = {
  primary:
    "border-accent bg-accent text-text-inverse hover:border-accent-hover hover:bg-accent-hover",
  secondary:
    "border-border-strong bg-transparent text-text-primary hover:bg-bg-muted",
  text: "h-10 border-transparent bg-transparent px-1 text-accent hover:underline",
} as const;

type Variant = keyof typeof variantClasses;

type SharedProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type ButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonLinkProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const baseClasses =
  "inline-flex min-h-11 min-w-[120px] items-center justify-center gap-2 rounded-button border px-[18px] text-center text-[13px] font-bold uppercase tracking-[0.06em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-45 lg:min-h-10";

export function Button({ children, variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} type={type} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({ children, variant = "primary", className = "", href, ...props }: ButtonLinkProps) {
  return (
    <Link className={`${baseClasses} ${variantClasses[variant]} ${className}`} href={href} {...props}>
      {children}
    </Link>
  );
}
