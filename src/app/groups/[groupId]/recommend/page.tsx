import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { FixedHeader } from "@/components/app/FixedHeader";
import { WizardShell } from "@/components/app/WizardShell";
import { Card } from "@/components/ui/Card";
import { prisma } from "@/lib/db/prisma";
import { hashToken, SESSION_COOKIE_NAME } from "@/lib/groups/session";
import { RecommendMovieForm } from "./RecommendMovieForm";

type RecommendPageProps = {
  params: Promise<{ groupId: string }>;
};

export default async function RecommendPage({ params }: RecommendPageProps) {
  const { groupId } = await params;
  const cookieStore = await cookies();
  const rawSessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const sessionTokenHash = rawSessionToken ? hashToken(rawSessionToken) : null;

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

  const session = sessionTokenHash
    ? await prisma.session.findUnique({
        where: { sessionTokenHash },
        include: { participant: true },
      })
    : null;
  const currentParticipant =
    session?.participant.groupId === group.id && !session.revokedAt && session.expiresAt > new Date() ? session.participant : null;

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
