"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { createAvatarSeed, createRawToken, hashToken, SESSION_COOKIE_NAME, sessionExpiryDate } from "@/lib/groups/session";
import { validateCreateGroup } from "@/lib/groups/validation";

export type CreateGroupState = {
  errors?: {
    groupName?: string;
    creatorName?: string;
    participantNames?: string;
  };
};


export async function createGroupAction(_state: CreateGroupState, formData: FormData): Promise<CreateGroupState> {
  const validation = validateCreateGroup(formData);

  if (!validation.ok) {
    return { errors: validation.errors };
  }

  const { groupName, creatorName, participantNames } = validation.value;
  const rawSessionToken = createRawToken();
  const sessionTokenHash = hashToken(rawSessionToken);
  const expiresAt = sessionExpiryDate();

  const { group, creator } = await prisma.$transaction(async (tx: any) => {
    const createdGroup = await tx.group.create({
      data: {
        name: groupName,
      },
    });

    const createdCreator = await tx.participant.create({
      data: {
        groupId: createdGroup.id,
        displayName: creatorName,
        avatarSeed: createAvatarSeed(groupName, creatorName),
        role: "admin",
      },
    });

    if (participantNames.length > 0) {
      await tx.participant.createMany({
        data: participantNames.map((displayName) => ({
          groupId: createdGroup.id,
          displayName,
          avatarSeed: createAvatarSeed(groupName, displayName),
          role: "member" as const,
        })),
      });
    }

    await tx.group.update({
      where: { id: createdGroup.id },
      data: { createdByParticipantId: createdCreator.id },
    });

    await tx.session.create({
      data: {
        participantId: createdCreator.id,
        sessionTokenHash,
        expiresAt,
      },
    });

    return { group: createdGroup, creator: createdCreator };
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawSessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  redirect(`/groups/${group.id}?participant=${creator.id}`);
}
