import type { CSSProperties } from "react";

type NumberedProgressProps = {
  currentStep: number;
  totalSteps: number;
};

export function NumberedProgress({ currentStep, totalSteps }: NumberedProgressProps) {
  return (
    <div className="flex h-12 shrink-0 items-center border-b border-border-subtle surface-header px-6">
      <div className="grid w-full grid-cols-[repeat(var(--steps),minmax(0,1fr))] items-center" style={{ "--steps": totalSteps } as CSSProperties}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;
          const active = step === currentStep;
          const complete = step < currentStep;

          return (
            <div className="relative flex items-center justify-center" key={step}>
              {step > 1 ? <span className="absolute right-1/2 top-1/2 h-px w-full -translate-y-1/2 bg-border-subtle" aria-hidden="true" /> : null}
              <span
                className={`relative z-10 grid h-6 w-6 place-items-center rounded-full border text-caption font-bold ${
                  active
                    ? "border-accent bg-accent text-text-inverse"
                    : complete
                      ? "border-text-primary bg-text-primary text-text-inverse"
                      : "border-border-strong bg-surface-strong text-text-muted"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
