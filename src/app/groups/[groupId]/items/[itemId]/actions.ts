"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { getCurrentParticipantForGroup } from "@/lib/groups/session.server";

export async function archiveRecommendationAction(formData: FormData) {
  const groupId = String(formData.get("groupId") ?? "");
  const itemId = String(formData.get("itemId") ?? "");
  const recommendationId = String(formData.get("recommendationId") ?? "");
  const requestedItemType = String(formData.get("itemType") ?? "movie");
  const itemType = requestedItemType === "book" ? "books" : requestedItemType === "album" ? "albums" : "movies";

  if (!groupId || !itemId || !recommendationId) {
    redirect("/");
  }

  const currentParticipant = await getCurrentParticipantForGroup(groupId);

  if (!currentParticipant) {
    redirect(`/groups/${groupId}/items/${itemId}`);
  }

  const recommendation = await prisma.recommendation.findFirst({
    where: {
      id: recommendationId,
      groupId,
      itemId,
      deletedAt: null,
      group: { archivedAt: null },
    },
    select: {
      id: true,
      recommendedByParticipantId: true,
    },
  });

  if (!recommendation) {
    redirect(`/groups/${groupId}?type=${itemType}`);
  }

  const canArchive = currentParticipant.role === "admin" || recommendation.recommendedByParticipantId === currentParticipant.id;

  if (!canArchive) {
    redirect(`/groups/${groupId}/items/${itemId}`);
  }

  await prisma.recommendation.update({
    where: { id: recommendation.id },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/groups/${groupId}`);
  revalidatePath(`/groups/${groupId}/items/${itemId}`);
  redirect(`/groups/${groupId}?type=${itemType}&archived=1`);
}
