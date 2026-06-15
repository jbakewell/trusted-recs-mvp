import { notFound } from "next/navigation";
import { FixedHeader } from "@/components/app/FixedHeader";
import { ScrollRegion } from "@/components/app/ScrollRegion";
import { WizardShell } from "@/components/app/WizardShell";
import { PrivateGroupRejoin } from "@/components/groups/PrivateGroupRejoin";
import { Card } from "@/components/ui/Card";
import { OverprintBackground, pickOverprintBackgroundIndex } from "@/components/visual/OverprintBackground";
import { prisma } from "@/lib/db/prisma";
import { getCurrentParticipantForGroup } from "@/lib/groups/session.server";
import type { MusicService } from "@/lib/music/serviceLinks";
import { InvitePanel } from "../InvitePanel";
import { AddMemberForm, ArchiveGroupForm, PreferredMusicServiceForm } from "./ManageGroupActions";

type ManageGroupPageProps = {
  params: Promise<{ groupId: string }>;
};

export const dynamic = "force-dynamic";

export default async function ManageGroupPage({ params }: ManageGroupPageProps) {
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
        background={<OverprintBackground backgroundIndex={backgroundIndex} density="subtle" route="manage" />}
        header={<FixedHeader leftAction={{ href: "/", label: "Home" }} subtitle="Invite required" title="Private group" />}
      >
        <PrivateGroupRejoin title="Rejoin this group to manage invites" />
      </WizardShell>
    );
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      participants: {
        where: { status: "active" },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        include: {
          inviteLinks: {
            where: { status: "active" },
            select: { status: true },
          },
        },
      },
    },
  });

  if (!group) {
    notFound();
  }

  if (group.archivedAt) {
    return (
      <WizardShell
        background={<OverprintBackground backgroundIndex={backgroundIndex} density="subtle" route="manage" />}
        header={<FixedHeader leftAction={{ href: "/", label: "Home" }} subtitle="Archived" title="Group archived" />}
      >
        <ScrollRegion className="grid content-start gap-4 p-4">
          <Card className="grid gap-2">
            <p className="metadata-label text-text-muted">Archived group</p>
            <h1 className="section-title">{group.name}</h1>
            <p className="text-body-sm text-text-secondary">This group is no longer active.</p>
          </Card>
        </ScrollRegion>
      </WizardShell>
    );
  }

  return (
    <WizardShell
      background={<OverprintBackground backgroundIndex={backgroundIndex} density="subtle" route="manage" />}
      header={<FixedHeader leftAction={{ href: `/groups/${group.id}`, label: "Back to group" }} subtitle={group.name} title="Manage group" />}
    >
      <ScrollRegion className="grid content-start gap-4 p-4">
        <Card className="grid gap-2">
          <p className="metadata-label text-accent">Your trusted circle</p>
          <h1 className="section-title">{group.participants.length} people</h1>
          <p className="text-body-sm text-text-secondary">
            Share invite links for each person from their tile. Invite revoking will live in a later admin pass.
          </p>
        </Card>
        <PreferredMusicServiceForm
          groupId={group.id}
          preferredMusicService={(currentParticipant.preferredMusicService ?? "none") as MusicService}
        />
        {currentParticipant?.role === "admin" ? <AddMemberForm groupId={group.id} /> : null}
        <InvitePanel
          canManageInvites={currentParticipant?.role === "admin"}
          participants={group.participants.map((participant) => ({
            id: participant.id,
            displayName: participant.displayName,
            avatarSeed: participant.avatarSeed,
            role: participant.role,
            hasActiveInvite: Boolean(participant.inviteLinks?.length),
          }))}
        />
        {currentParticipant?.role !== "admin" ? (
          <Card className="grid gap-2">
            <p className="metadata-label text-text-muted">Invite management</p>
            <p className="text-body-sm text-text-secondary">
              Ask the group admin to create and share invite links.
            </p>
          </Card>
        ) : (
          <ArchiveGroupForm groupId={group.id} />
        )}
      </ScrollRegion>
    </WizardShell>
  );
}
