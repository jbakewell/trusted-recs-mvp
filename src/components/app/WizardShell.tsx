import type { ReactNode } from "react";

type WizardShellProps = {
  header: ReactNode;
  progress?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  background?: ReactNode;
  className?: string;
};

export function WizardShell({ header, progress, children, footer, background, className = "" }: WizardShellProps) {
  return (
    <main className={`relative isolate flex h-dvh min-h-dvh w-full flex-col overflow-hidden bg-bg-page ${className}`}>
      {background}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        {header}
        {progress}
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</section>
        {footer}
      </div>
    </main>
  );
}
