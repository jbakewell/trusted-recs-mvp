import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { sessionTokenHashesFromCookies } from "@/lib/groups/session";

export type KnownDeviceGroup = {
  groupId: string;
  groupName: string;
  participantName: string;
  participantRole: "admin" | "member";
  participantAvatarSeed: string;
  participantCount: number;
  recommendationCount: number;
};

export async function getCurrentParticipantForGroup(groupId: string) {
  const cookieStore = await cookies();
  const tokenHashes = sessionTokenHashesFromCookies(cookieStore);

  if (tokenHashes.length === 0) {
    return null;
  }

  const sessions = await prisma.session.findMany({
    where: {
      sessionTokenHash: { in: tokenHashes },
      revokedAt: null,
      expiresAt: { gt: new Date() },
      participant: {
        is: {
          groupId,
          status: "active",
        },
      },
    },
    include: { participant: true },
  });

  const sessionsByHash = new Map(sessions.map((session) => [session.sessionTokenHash, session]));
  const session = tokenHashes.map((hash) => sessionsByHash.get(hash)).find(Boolean);

  return session?.participant ?? null;
}

export async function getKnownGroupsForDevice(): Promise<KnownDeviceGroup[]> {
  const cookieStore = await cookies();
  const tokenHashes = sessionTokenHashesFromCookies(cookieStore);

  if (tokenHashes.length === 0) {
    return [];
  }

  const sessions = await prisma.session.findMany({
    where: {
      sessionTokenHash: { in: tokenHashes },
      revokedAt: null,
      expiresAt: { gt: new Date() },
      participant: {
        is: {
          status: "active",
          group: {
            is: {
              archivedAt: null,
            },
          },
        },
      },
    },
    include: {
      participant: {
        include: {
          group: {
            include: {
              _count: {
                select: {
                  participants: true,
                  recommendations: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const sessionsByHash = new Map(sessions.map((session) => [session.sessionTokenHash, session]));
  const seenGroupIds = new Set<string>();
  const knownGroups: KnownDeviceGroup[] = [];

  for (const tokenHash of tokenHashes) {
    const session = sessionsByHash.get(tokenHash);

    if (!session || seenGroupIds.has(session.participant.groupId)) {
      continue;
    }

    seenGroupIds.add(session.participant.groupId);
    knownGroups.push({
      groupId: session.participant.groupId,
      groupName: session.participant.group.name,
      participantName: session.participant.displayName,
      participantRole: session.participant.role,
      participantAvatarSeed: session.participant.avatarSeed,
      participantCount: session.participant.group._count.participants,
      recommendationCount: session.participant.group._count.recommendations,
    });
  }

  return knownGroups;
}
