import { notFound } from "next/navigation";
import { FixedHeader } from "@/components/app/FixedHeader";
import { WizardShell } from "@/components/app/WizardShell";
import { Card } from "@/components/ui/Card";
import { OverprintBackground } from "@/components/visual/OverprintBackground";
import { prisma } from "@/lib/db/prisma";
import { getCurrentParticipantForGroup } from "@/lib/groups/session.server";
import { RecommendMovieForm } from "./RecommendMovieForm";

type RecommendPageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function RecommendPage({ params }: RecommendPageProps) {
  const { groupId } = await params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      participants: {
        where: { status: "active" },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          displayName: true,
        },
      },
    },
  });

  if (!group) {
    notFound();
  }

  const currentParticipant = await getCurrentParticipantForGroup(group.id);

  const reasons = await prisma.recommendationReason.findMany({
    where: { active: true },
    orderBy: [{ genreKey: "asc" }, { sortOrder: "asc" }],
    select: {
      id: true,
      label: true,
      genreKey: true,
      sortOrder: true,
    },
  });

  const targetParticipants = group.participants.filter((participant) => participant.id !== currentParticipant?.id);

  if (currentParticipant) {
    return (
      <RecommendMovieForm
        currentParticipantName={currentParticipant.displayName}
        groupId={group.id}
        groupName={group.name}
        participants={targetParticipants}
        reasons={reasons}
      />
    );
  }

  return (
    <WizardShell
      background={<OverprintBackground density="subtle" route="recommend" seed={`${group.id}:session-needed`} />}
      header={<FixedHeader leftAction={{ href: `/groups/${group.id}`, label: "Back to group" }} subtitle={group.name} title="Add recommendation" />}
    >
      <div className="p-4">
        <Card className="grid gap-3">
          <p className="metadata-label text-text-muted">Session needed</p>
          <h1 className="section-title">Rejoin this group to recommend movies</h1>
          <p className="text-body-sm text-text-secondary">
            Recommendations are available to active group participants. Open your invite link or return from the browser
            where you created the group.
          </p>
        </Card>
      </div>
    </WizardShell>
  );
}
