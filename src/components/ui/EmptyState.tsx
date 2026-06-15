import { BrandMark } from "../brand/BrandMark";
import { ButtonLink } from "./Button";
import { Card } from "./Card";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <Card className="relative grid gap-4 overflow-hidden text-center">
      <div className="relative z-10 mx-auto">
        <BrandMark />
      </div>
      <div className="relative z-10 grid gap-2">
        <h2 className="section-title">{title}</h2>
        <p className="text-body-sm text-text-secondary">{description}</p>
      </div>
      {actionLabel && actionHref ? <ButtonLink className="relative z-10" href={actionHref}>{actionLabel}</ButtonLink> : null}
    </Card>
  );
}
