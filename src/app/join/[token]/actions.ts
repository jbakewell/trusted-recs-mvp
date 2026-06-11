"use server";

import type { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { createRawToken, hashToken, rememberSessionToken, sessionExpiryDate } from "@/lib/groups/session";

export type ClaimInviteState = {
  error?: string;
};

export async function claimInviteAction(_state: ClaimInviteState, formData: FormData): Promise<ClaimInviteState> {
  const rawInviteToken = String(formData.get("token") ?? "");

  if (!rawInviteToken) {
    return { error: "This invite link is missing details. Ask for a fresh link." };
  }

  const invite = await prisma.inviteLink.findUnique({
    where: { tokenHash: hashToken(rawInviteToken) },
    include: { group: true, participant: true },
  });

  if (!invite) {
    return { error: "This invite link does not work. Ask for a fresh link." };
  }

  if (invite.status !== "active" || invite.revokedAt) {
    return { error: "This invite link has been replaced. Ask for the latest link." };
  }

  const participant = invite.participant;

  if (participant.status !== "active" || participant.groupId !== invite.groupId) {
    return { error: "That person is not active in this group." };
  }

  const rawSessionToken = createRawToken();
  const expiresAt = sessionExpiryDate();

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.session.create({
      data: {
        participantId: participant.id,
        sessionTokenHash: hashToken(rawSessionToken),
        expiresAt,
      },
    });

    await tx.inviteLink.update({
      where: { id: invite.id },
      data: {
        status: "revoked",
        revokedAt: new Date(),
        lastUsedAt: new Date(),
      },
    });
  });

  const cookieStore = await cookies();
  rememberSessionToken(cookieStore, rawSessionToken, expiresAt);

  redirect(`/groups/${invite.groupId}?participant=${participant.id}`);
}
