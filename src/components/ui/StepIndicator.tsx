type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  label: string;
};

export function StepIndicator({ currentStep, totalSteps, label }: StepIndicatorProps) {
  return (
    <div aria-label={label} className="grid gap-2" role="group">
      <p className="metadata-label text-text-muted">Step {currentStep} of {totalSteps}</p>
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }, (_, index) => {
          const active = index + 1 <= currentStep;
          return <span aria-hidden="true" className={`h-2 flex-1 ${active ? "bg-accent" : "bg-bg-muted"}`} key={index} />;
        })}
      </div>
    </div>
  );
}
