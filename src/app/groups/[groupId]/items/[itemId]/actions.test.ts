import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const redirectMock = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const getCurrentParticipantForGroup = vi.fn();
const recommendationFindFirst = vi.fn();
const recommendationUpdate = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/groups/session.server", () => ({
  getCurrentParticipantForGroup,
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    recommendation: {
      findFirst: recommendationFindFirst,
      update: recommendationUpdate,
    },
  },
}));

function archiveFormData(itemType = "movie") {
  const formData = new FormData();
  formData.set("groupId", "group-1");
  formData.set("itemId", "item-1");
  formData.set("recommendationId", "recommendation-1");
  formData.set("itemType", itemType);
  return formData;
}

describe("archiveRecommendationAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentParticipantForGroup.mockResolvedValue({
      id: "participant-1",
      role: "admin",
    });
    recommendationFindFirst.mockResolvedValue({
      id: "recommendation-1",
      recommendedByParticipantId: "participant-2",
    });
    recommendationUpdate.mockResolvedValue({ id: "recommendation-1" });
  });

  it("lets an admin archive a recommendation and returns to the matching feed", async () => {
    const { archiveRecommendationAction } = await import("./actions");

    await expect(archiveRecommendationAction(archiveFormData("book"))).rejects.toThrow(
      "NEXT_REDIRECT:/groups/group-1?type=books&archived=1",
    );

    expect(recommendationFindFirst).toHaveBeenCalledWith({
      where: {
        id: "recommendation-1",
        groupId: "group-1",
        itemId: "item-1",
        deletedAt: null,
        group: { archivedAt: null },
      },
      select: {
        id: true,
        recommendedByParticipantId: true,
      },
    });
    expect(recommendationUpdate).toHaveBeenCalledWith({
      where: { id: "recommendation-1" },
      data: { deletedAt: expect.any(Date) },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/groups/group-1");
    expect(revalidatePath).toHaveBeenCalledWith("/groups/group-1/items/item-1");
  });

  it("lets the original recommender archive their own recommendation", async () => {
    const { archiveRecommendationAction } = await import("./actions");
    getCurrentParticipantForGroup.mockResolvedValue({
      id: "participant-2",
      role: "member",
    });

    await expect(archiveRecommendationAction(archiveFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/groups/group-1?type=movies&archived=1",
    );

    expect(recommendationUpdate).toHaveBeenCalledWith({
      where: { id: "recommendation-1" },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it("blocks other members from archiving someone else's recommendation", async () => {
    const { archiveRecommendationAction } = await import("./actions");
    getCurrentParticipantForGroup.mockResolvedValue({
      id: "participant-3",
      role: "member",
    });

    await expect(archiveRecommendationAction(archiveFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/groups/group-1/items/item-1",
    );

    expect(recommendationUpdate).not.toHaveBeenCalled();
  });
});
