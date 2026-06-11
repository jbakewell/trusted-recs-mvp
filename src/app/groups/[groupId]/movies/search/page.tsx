import { notFound } from "next/navigation";
import { FixedHeader } from "@/components/app/FixedHeader";
import { WizardShell } from "@/components/app/WizardShell";
import { PrivateGroupRejoin } from "@/components/groups/PrivateGroupRejoin";
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
  const currentParticipant = await getCurrentParticipantForGroup(groupId);
  const backgroundIndex = pickOverprintBackgroundIndex();

  if (!currentParticipant) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { id: true },
    });

    if (!group) {
      notFound();
    }

    return (
      <WizardShell
        background={<OverprintBackground backgroundIndex={backgroundIndex} density="subtle" route="search" />}
        header={<FixedHeader leftAction={{ href: "/", label: "Home" }} subtitle="Invite required" title="Private group" />}
      >
        <PrivateGroupRejoin title="Rejoin this group to search movies" />
      </WizardShell>
    );
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, name: true },
  });

  if (!group) {
    notFound();
  }

  return (
    <WizardShell
      background={<OverprintBackground backgroundIndex={backgroundIndex} density="subtle" route="search" />}
      header={<FixedHeader leftAction={{ href: `/groups/${group.id}`, label: "Back to group" }} subtitle={group.name} title="Choose a movie" />}
    >
      <MovieSearchForm />
    </WizardShell>
  );
}
