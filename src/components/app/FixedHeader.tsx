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
  return <span aria-hidden="true" className="text-[24px] leading-none">‹</span>;
}

export function FixedHeader({ title, subtitle, leftAction, rightAction }: FixedHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border-subtle bg-bg-page px-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {leftAction ? (
          "href" in leftAction ? (
            <Link
              aria-label={leftAction.label}
              className="grid h-10 w-10 shrink-0 place-items-center text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              href={leftAction.href}
            >
              <BackGlyph />
            </Link>
          ) : (
            <span className="grid h-10 w-10 shrink-0 place-items-center text-text-primary">
              <BackGlyph />
            </span>
          )
        ) : null}
        <div className="min-w-0 text-center sm:text-left">
          <h1 className="truncate text-body-sm font-bold uppercase tracking-[0.08em] text-text-primary">{title}</h1>
          {subtitle ? <p className="truncate text-caption font-semibold text-text-muted">{subtitle}</p> : null}
        </div>
      </div>
      {rightAction ? <div className="shrink-0">{rightAction}</div> : <span aria-hidden="true" className="h-10 w-10 shrink-0" />}
    </header>
  );
}
