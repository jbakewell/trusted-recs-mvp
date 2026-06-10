import Link from "next/link";
import type { ReactNode } from "react";

type HeaderAction =
  | {
      href: string;
      label: string;
    }
  | {
      onClick?: never;
      label: string;
    };

type FixedHeaderProps = {
  title: string;
  subtitle?: string;
  leftAction?: HeaderAction;
  rightAction?: ReactNode;
};

function BackGlyph() {
  return <span aria-hidden="true" className="text-[22px] leading-none">&lt;</span>;
}

export function FixedHeader({ title, subtitle, leftAction, rightAction }: FixedHeaderProps) {
  return (
    <header className="grid h-14 shrink-0 grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-2 border-b border-border-subtle surface-header px-3">
      <div className="flex h-11 items-center justify-start">
        {leftAction && "href" in leftAction ? (
          <Link
            aria-label={leftAction.label}
            className="grid h-10 w-10 shrink-0 place-items-center text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            href={leftAction.href}
          >
            <BackGlyph />
          </Link>
        ) : leftAction ? (
          <span className="grid h-10 w-10 shrink-0 place-items-center text-text-primary">
            <BackGlyph />
          </span>
        ) : null}
      </div>
      <div className="min-w-0 text-center">
        <h1 className="truncate text-body-sm font-bold uppercase tracking-[0.08em] text-text-primary">{title}</h1>
        {subtitle ? <p className="truncate text-caption font-semibold text-text-muted">{subtitle}</p> : null}
      </div>
      <div className="flex h-11 items-center justify-end">{rightAction}</div>
    </header>
  );
}
