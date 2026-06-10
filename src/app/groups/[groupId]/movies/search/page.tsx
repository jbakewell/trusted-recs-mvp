import { notFound } from "next/navigation";
import { FixedHeader } from "@/components/app/FixedHeader";
import { WizardShell } from "@/components/app/WizardShell";
import { Card } from "@/components/ui/Card";
import { OverprintBackground, pickOverprintBackgroundIndex } from "@/components/visual/OverprintBackground";
import { prisma } from "@/lib/db/prisma";
import { getCurrentParticipantForGroup } from "@/lib/groups/session.server";
import { MovieSearchForm } from "./MovieSearchForm";

type MovieSearchPageProps = {
  params: Promise<{ groupId: string }>;
};

export const dynamic = "force-dynamic";

export default async function MovieSearchPage({ params }: MovieSearchPageProps) {
  const { groupId } = await params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, name: true },
  });

  if (!group) {
    notFound();
  }

  const currentParticipant = await getCurrentParticipantForGroup(group.id);
  const backgroundIndex = pickOverprintBackgroundIndex();

  return (
    <WizardShell
      background={<OverprintBackground backgroundIndex={backgroundIndex} density="subtle" route="search" />}
      header={<FixedHeader leftAction={{ href: `/groups/${group.id}`, label: "Back to group" }} subtitle={group.name} title="Choose a movie" />}
    >
      {currentParticipant ? (
        <MovieSearchForm />
      ) : (
        <div className="p-4">
          <Card className="grid gap-3">
            <p className="metadata-label text-text-muted">Session needed</p>
            <h1 className="section-title">Rejoin this group to search movies</h1>
            <p className="text-body-sm text-text-secondary">
              Movie search is available to active group participants. Open your invite link or return from the browser
              where you created the group.
            </p>
          </Card>
        </div>
      )}
    </WizardShell>
  );
}
