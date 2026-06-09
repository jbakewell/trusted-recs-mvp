"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { hashToken, SESSION_COOKIE_NAME } from "@/lib/groups/session";
import { createInviteToken, invitePathForToken } from "@/lib/invites/links";

export type InviteActionState = {
  invitePath?: string;
  message?: string;
  error?: string;
};

async function getAdminContext(participantId: string) {
  const cookieStore = await cookies();
  const rawSessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!rawSessionToken) {
    return { error: "Your admin session has expired. Rejoin the group from this browser." };
  }

  const session = await prisma.session.findUnique({
    where: { sessionTokenHash: hashToken(rawSessionToken) },
    include: { participant: true },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    return { error: "Your admin session has expired. Rejoin the group from this browser." };
  }

  if (session.participant.role !== "admin" || session.participant.status !== "active") {
    return { error: "Only group admins can manage invite links." };
  }

  const targetParticipant = await prisma.participant.findUnique({
    where: { id: participantId },
  });

  if (!targetParticipant || targetParticipant.status !== "active" || targetParticipant.groupId !== session.participant.groupId) {
    return { error: "That participant is not available for this group." };
  }

  return {
    admin: session.participant,
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
