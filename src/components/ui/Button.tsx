import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

const variantClasses = {
  primary: {
    asset: "/pills/pill_rose_transparent.png",
    classes: "border-transparent text-text-inverse hover:brightness-95",
  },
  secondary: {
    asset: "/pills/pill_paper_outline_transparent.png",
    classes: "border-transparent text-text-primary hover:brightness-95",
  },
  text: {
    asset: null,
    classes: "h-10 border-transparent bg-transparent px-1 text-accent hover:underline",
  },
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
  "relative inline-flex min-h-11 min-w-[120px] items-center justify-center gap-2 overflow-hidden rounded-full border px-[18px] text-center text-[13px] font-bold uppercase tracking-[0.06em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:opacity-45 lg:min-h-10";

function ButtonContent({ children, variant }: { children: ReactNode; variant: Variant }) {
  const asset = variantClasses[variant].asset;

  return (
    <>
      {asset ? (
        <span
          aria-hidden="true"
          className="asset-pill-layer"
          style={{ "--pill-cap": "44px", "--pill-image": `url(${asset})` } as CSSProperties}
        >
          <span className="asset-pill-fill" />
          <span className="asset-pill-cap-left" />
          <span className="asset-pill-cap-right" />
        </span>
      ) : null}
      <span className="relative z-10">{children}</span>
    </>
  );
}

export function Button({ children, variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button className={`${baseClasses} ${variantClasses[variant].classes} ${className}`} type={type} {...props}>
      <ButtonContent variant={variant}>{children}</ButtonContent>
    </button>
  );
}

export function ButtonLink({ children, variant = "primary", className = "", href, ...props }: ButtonLinkProps) {
  return (
    <Link className={`${baseClasses} ${variantClasses[variant].classes} ${className}`} href={href} {...props}>
      <ButtonContent variant={variant}>{children}</ButtonContent>
    </Link>
  );
}
