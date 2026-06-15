import { describe, expect, it, vi, beforeEach } from "vitest";

const revalidatePath = vi.fn();
const redirectMock = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});
const getCurrentParticipantForGroup = vi.fn();
const groupFindUnique = vi.fn();
const groupUpdate = vi.fn();
const participantFindMany = vi.fn();
const participantCreate = vi.fn();

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
    group: {
      findUnique: groupFindUnique,
      update: groupUpdate,
    },
    participant: {
      findMany: participantFindMany,
      create: participantCreate,
    },
  },
}));

describe("manage group actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentParticipantForGroup.mockResolvedValue({
      id: "participant-1",
      role: "admin",
    });
    groupFindUnique.mockResolvedValue({ id: "group-1", archivedAt: null });
    participantFindMany.mockResolvedValue([{ displayName: "Jake" }]);
    participantCreate.mockResolvedValue({ id: "participant-2" });
    groupUpdate.mockResolvedValue({ id: "group-1" });
  });

  it("lets an admin add a new active member", async () => {
    const { addMemberAction } = await import("./actions");
    const formData = new FormData();
    formData.set("groupId", "group-1");
    formData.set("displayName", "  User   Name 1  ");

    const result = await addMemberAction({ status: "idle" }, formData);

    expect(result).toEqual({
      status: "success",
      message: "User Name 1 added. Share their invite when you're ready.",
    });
    expect(participantCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        groupId: "group-1",
        displayName: "User Name 1",
        role: "member",
        status: "active",
        avatarSeed: expect.any(String),
      }),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/groups/group-1/manage");
    expect(revalidatePath).toHaveBeenCalledWith("/groups/group-1");
  });

  it("blocks non-admins from adding members", async () => {
    const { addMemberAction } = await import("./actions");
    getCurrentParticipantForGroup.mockResolvedValue({
      id: "participant-2",
      role: "member",
    });
    const formData = new FormData();
    formData.set("groupId", "group-1");
    formData.set("displayName", "Maya");

    const result = await addMemberAction({ status: "idle" }, formData);

    expect(result).toEqual({
      status: "error",
      error: "Only group admins can manage this group.",
    });
    expect(participantCreate).not.toHaveBeenCalled();
  });

  it("archives an active group and returns to the landing page", async () => {
    const { archiveGroupAction } = await import("./actions");
    const formData = new FormData();
    formData.set("groupId", "group-1");

    await expect(archiveGroupAction({ status: "idle" }, formData)).rejects.toThrow(
      "NEXT_REDIRECT:/?archived=1",
    );

    expect(groupUpdate).toHaveBeenCalledWith({
      where: { id: "group-1" },
      data: { archivedAt: expect.any(Date) },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/groups/group-1");
    expect(revalidatePath).toHaveBeenCalledWith("/groups/group-1/manage");
  });
});
