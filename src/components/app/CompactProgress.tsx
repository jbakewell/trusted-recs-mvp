type CompactProgressProps = {
  currentStep: number;
  totalSteps: number;
};

export function CompactProgress({ currentStep, totalSteps }: CompactProgressProps) {
  return (
    <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border-subtle bg-bg-page px-4">
      <p className="metadata-label shrink-0 text-text-muted">Step {currentStep} of {totalSteps}</p>
      <div className="flex flex-1 items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, index) => {
          const step = index + 1;
          const active = step === currentStep;
          const complete = step < currentStep;

          return (
            <span
              className={`h-1.5 flex-1 rounded-full ${
                active ? "bg-accent" : complete ? "bg-accent-soft" : "bg-bg-inset"
              }`}
              key={step}
            />
          );
        })}
      </div>
    </div>
  );
}
