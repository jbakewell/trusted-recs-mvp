import { BrandMark } from "@/components/brand/BrandMark";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/db/prisma";
import { hashToken } from "@/lib/groups/session";
import { JoinInviteForm } from "./JoinInviteForm";

type JoinInvitePageProps = {
  params: Promise<{ token: string }>;
};

function InviteError({ title, description }: { title: string; description: string }) {
  return (
    <Card className="grid gap-4 border-status-error/70">
      <div className="grid gap-2">
        <p className="metadata-label text-status-error">Invite unavailable</p>
        <h1 className="section-title text-status-error">{title}</h1>
        <p className="text-body-sm text-text-secondary">{description}</p>
      </div>
      <ButtonLink href="/" variant="secondary">
        Back to home
      </ButtonLink>
    </Card>
  );
}

export default async function JoinInvitePage({ params }: JoinInvitePageProps) {
  const { token } = await params;
  const invite = await prisma.inviteLink.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      group: true,
      participant: true,
    },
  });

  let content;

  if (!invite) {
    content = <InviteError description="This invite link does not work. Ask your group admin for a fresh link." title="This invite link does not work." />;
  } else if (invite.status !== "active" || invite.revokedAt) {
    content = <InviteError description="This invite link has been replaced. Ask your group admin for the latest link." title="This invite link has been replaced." />;
  } else if (invite.participant.status !== "active") {
    content = <InviteError description="This participant is no longer active in the group." title="This invite is no longer active." />;
  } else {
    content = (
      <JoinInviteForm
        groupName={invite.group.name}
        proposedParticipant={{ id: invite.participant.id, displayName: invite.participant.displayName }}
        token={token}
      />
    );
  }

  return (
    <main className="main-container">
      <section className="mx-auto grid max-w-xl gap-6">
        <div className="flex items-center gap-3 pt-4">
          <BrandMark />
          <p className="metadata-label text-text-secondary">Trusted Recs invite</p>
        </div>
        {content}
      </section>
    </main>
  );
}
