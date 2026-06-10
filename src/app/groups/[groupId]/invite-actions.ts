"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { hashToken } from "@/lib/groups/session";
import { getCurrentParticipantForGroup } from "@/lib/groups/session.server";
import { createInviteToken, invitePathForToken } from "@/lib/invites/links";

export type InviteActionState = {
  invitePath?: string;
  message?: string;
  error?: string;
};

async function getAdminContext(participantId: string) {
  const targetParticipant = await prisma.participant.findUnique({
    where: { id: participantId },
  });

  if (!targetParticipant || targetParticipant.status !== "active") {
    return { error: "That participant is not available for this group." };
  }

  const admin = await getCurrentParticipantForGroup(targetParticipant.groupId);

  if (!admin) {
    return { error: "Your admin session has expired. Rejoin the group from this browser." };
  }

  if (admin.role !== "admin") {
    return { error: "Only group admins can manage invite links." };
  }

  return {
    admin,
    targetParticipant,
  };
}

export async function createOrRegenerateInviteAction(_state: InviteActionState, formData: FormData): Promise<InviteActionState> {
  const participantId = String(formData.get("participantId") ?? "");
  const context = await getAdminContext(participantId);

  if ("error" in context) {
    return { error: context.error };
  }

  const rawToken = createInviteToken();
  const tokenHash = hashToken(rawToken);

  await prisma.$transaction(async (tx: any) => {
    await tx.inviteLink.updateMany({
      where: {
        participantId: context.targetParticipant.id,
        status: "active",
      },
      data: {
        status: "revoked",
        revokedAt: new Date(),
      },
    });

    await tx.inviteLink.create({
      data: {
        groupId: context.targetParticipant.groupId,
        participantId: context.targetParticipant.id,
        tokenHash,
      },
    });
  });

  revalidatePath(`/groups/${context.targetParticipant.groupId}`);

  return {
    invitePath: invitePathForToken(rawToken),
    message: `Fresh invite link ready for ${context.targetParticipant.displayName}.`,
  };
}

export async function revokeInviteAction(_state: InviteActionState, formData: FormData): Promise<InviteActionState> {
  const participantId = String(formData.get("participantId") ?? "");
  const context = await getAdminContext(participantId);

  if ("error" in context) {
    return { error: context.error };
  }

  await prisma.inviteLink.updateMany({
    where: {
      participantId: context.targetParticipant.id,
      status: "active",
    },
    data: {
      status: "revoked",
      revokedAt: new Date(),
    },
  });

  revalidatePath(`/groups/${context.targetParticipant.groupId}`);

  return {
    message: `Invite link revoked for ${context.targetParticipant.displayName}.`,
  };
}
