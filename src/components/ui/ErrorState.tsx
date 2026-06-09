import { Button } from "./Button";
import { Card } from "./Card";

type ErrorStateProps = {
  title: string;
  description: string;
  retryLabel?: string;
};

export function ErrorState({ title, description, retryLabel = "Try again" }: ErrorStateProps) {
  return (
    <Card className="grid gap-4 border-status-error/70">
      <div className="grid gap-1">
        <h2 className="section-title text-status-error">{title}</h2>
        <p className="text-body-sm text-text-secondary">{description}</p>
      </div>
      <Button variant="secondary">{retryLabel}</Button>
    </Card>
  );
}
