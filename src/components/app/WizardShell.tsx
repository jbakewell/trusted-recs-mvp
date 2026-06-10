import type { ReactNode } from "react";

type WizardShellProps = {
  header: ReactNode;
  progress?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function WizardShell({ header, progress, children, footer, className = "" }: WizardShellProps) {
  return (
    <main className={`flex h-dvh min-h-dvh w-full flex-col overflow-hidden bg-bg-page ${className}`}>
      {header}
      {progress}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</section>
      {footer}
    </main>
  );
}
