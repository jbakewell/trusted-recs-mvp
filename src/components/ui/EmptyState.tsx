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
    <Card className="grid gap-4 text-center">
      <div className="mx-auto">
        <BrandMark />
      </div>
      <div className="grid gap-2">
        <h2 className="section-title">{title}</h2>
        <p className="text-body-sm text-text-secondary">{description}</p>
      </div>
      {actionLabel && actionHref ? <ButtonLink href={actionHref}>{actionLabel}</ButtonLink> : null}
    </Card>
  );
}
