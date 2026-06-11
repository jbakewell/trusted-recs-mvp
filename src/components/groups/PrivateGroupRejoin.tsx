import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type PrivateGroupRejoinProps = {
  actionLabel?: string;
  description?: string;
  title?: string;
};

export function PrivateGroupRejoin({
  actionLabel = "Back to home",
  description = "Open your invite link, or return from a browser that already belongs to this group.",
  title = "This private group needs an invite",
}: PrivateGroupRejoinProps) {
  return (
    <div className="grid min-h-0 flex-1 place-items-center p-4">
      <Card className="grid w-full max-w-sm gap-4 text-center">
        <div className="grid gap-2">
          <p className="metadata-label text-accent">Private group</p>
          <h1 className="section-title">{title}</h1>
          <p className="text-body-sm text-text-secondary">{description}</p>
        </div>
        <ButtonLink className="w-full" href="/" variant="secondary">
          {actionLabel}
        </ButtonLink>
      </Card>
    </div>
  );
}
