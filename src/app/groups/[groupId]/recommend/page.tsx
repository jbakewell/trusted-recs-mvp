import { notFound } from "next/navigation";
import { FixedHeader } from "@/components/app/FixedHeader";
import { WizardShell } from "@/components/app/WizardShell";
import { PrivateGroupRejoin } from "@/components/groups/PrivateGroupRejoin";
import { OverprintBackground, pickOverprintBackgroundIndex } from "@/components/visual/OverprintBackground";
import { prisma } from "@/lib/db/prisma";
import { getCurrentParticipantForGroup } from "@/lib/groups/session.server";
import { itemTypeFromSearchParam } from "@/lib/items/types";
import { RecommendMovieForm } from "./RecommendMovieForm";

type RecommendPageProps = {
  params: Promise<{ groupId: string }>;
  searchParams?: Promise<{ type?: string | string[] }>;
};

export const dynamic = "force-dynamic";

export default async function RecommendPage({ params, searchParams }: RecommendPageProps) {
  const { groupId } = await params;
  const resolvedSearchParams = await searchParams;
  const itemType = itemTypeFromSearchParam(resolvedSearchParams?.type);
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
        background={<OverprintBackground backgroundIndex={backgroundIndex} density="subtle" route="recommend" />}
        header={<FixedHeader leftAction={{ href: "/", label: "Home" }} subtitle="Invite required" title="Private group" />}
      >
        <PrivateGroupRejoin title={`Rejoin this group to recommend ${itemType === "book" ? "books" : "movies"}`} />
      </WizardShell>
    );
  }

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

  return (
    <RecommendMovieForm
      backgroundIndex={backgroundIndex}
      currentParticipantName={currentParticipant.displayName}
      groupId={group.id}
      groupName={group.name}
      itemType={itemType}
      participants={targetParticipants}
      reasons={reasons}
    />
  );
}
