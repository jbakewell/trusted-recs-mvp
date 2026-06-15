"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentParticipantForGroup } from "@/lib/groups/session.server";

const MAX_DISPLAY_NAME_LENGTH = 40;
const MAX_PARTICIPANTS = 20;

export type AddMemberState = {
  status: "idle" | "success" | "error";
  message?: string;
  error?: string;
};

export type ArchiveGroupState = {
  status: "idle" | "error";
  error?: string;
};

function cleanName(value: FormDataEntryValue | string | null) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

async function requireGroupAdmin(groupId: string) {
  const currentParticipant = await getCurrentParticipantForGroup(groupId);

  if (!currentParticipant) {
    return { error: "Your session has expired. Rejoin the group before managing it." };
  }

  if (currentParticipant.role !== "admin") {
    return { error: "Only group admins can manage this group." };
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { id: true, archivedAt: true },
  });

  if (!group || group.archivedAt) {
    return { error: "This group is not available." };
  }

  return { currentParticipant, group };
}

export async function addMemberAction(_state: AddMemberState, formData: FormData): Promise<AddMemberState> {
  const groupId = String(formData.get("groupId") ?? "");
  const displayName = cleanName(formData.get("displayName"));

  if (!groupId) {
    return { status: "error", error: "Group could not be found." };
  }

  if (!displayName) {
    return { status: "error", error: "Add a member name." };
  }

  if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
    return { status: "error", error: `Keep display names to ${MAX_DISPLAY_NAME_LENGTH} characters or fewer.` };
  }

  const context = await requireGroupAdmin(groupId);

  if ("error" in context) {
    return { status: "error", error: context.error };
  }

  const participants = await prisma.participant.findMany({
    where: { groupId, status: "active" },
    select: { displayName: true },
  });

  if (participants.length >= MAX_PARTICIPANTS) {
    return { status: "error", error: `Groups can include up to ${MAX_PARTICIPANTS} people.` };
  }

  if (participants.some((participant) => participant.displayName.toLocaleLowerCase() === displayName.toLocaleLowerCase())) {
    return { status: "error", error: `${displayName} is already in this group.` };
  }

  await prisma.participant.create({
    data: {
      groupId,
      displayName,
      avatarSeed: randomUUID().replace(/-/g, ""),
      role: "member",
      status: "active",
    },
  });

  revalidatePath(`/groups/${groupId}/manage`);
  revalidatePath(`/groups/${groupId}`);

  return { status: "success", message: `${displayName} added. Share their invite when you're ready.` };
}

export async function archiveGroupAction(_state: ArchiveGroupState, formData: FormData): Promise<ArchiveGroupState> {
  const groupId = String(formData.get("groupId") ?? "");

  if (!groupId) {
    return { status: "error", error: "Group could not be found." };
  }

  const context = await requireGroupAdmin(groupId);

  if ("error" in context) {
    return { status: "error", error: context.error };
  }

  await prisma.group.update({
    where: { id: groupId },
    data: { archivedAt: new Date() },
  });

  revalidatePath("/");
  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/groups/${groupId}/manage`);
  redirect("/?archived=1");
}
