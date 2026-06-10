import type { ReactNode } from "react";

type FixedFooterActionProps = {
  primary: ReactNode;
  secondary?: ReactNode;
  className?: string;
};

export function FixedFooterAction({ primary, secondary, className = "" }: FixedFooterActionProps) {
  return (
    <footer className={`shrink-0 border-t border-border-subtle surface-header px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom)+var(--keyboard-inset,0px))] ${className}`}>
      <div className={secondary ? "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3" : "grid"}>
        {secondary}
        {primary}
      </div>
    </footer>
  );
}
