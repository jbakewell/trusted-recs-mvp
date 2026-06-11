import { vi } from "vitest";
import { SESSION_COOKIE_NAME } from "@/lib/groups/session";

const inviteFindUnique = vi.fn();
const cookieSet = vi.fn();
const tx = {
  session: {
    create: vi.fn(async () => ({})),
  },
  inviteLink: {
    update: vi.fn(async () => ({})),
  },
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(),
    set: cookieSet,
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    inviteLink: {
      findUnique: inviteFindUnique,
    },
    $transaction: vi.fn(async (callback) => callback(tx)),
  },
}));

describe("claimInviteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    inviteFindUnique.mockResolvedValue({
      id: "invite-1",
      groupId: "group-1",
      status: "active",
      revokedAt: null,
      group: {
        id: "group-1",
        name: "Film Club",
      },
      participant: {
        id: "participant-1",
        groupId: "group-1",
        displayName: "Maya",
        status: "active",
      },
    });
  });

  it("creates a participant session, remembers it in cookies, revokes the invite, and redirects to the group", async () => {
    const { claimInviteAction } = await import("./actions");
    const formData = new FormData();
    formData.set("token", "raw-invite-token");

    await expect(claimInviteAction({}, formData)).rejects.toThrow(
      "NEXT_REDIRECT:/groups/group-1?participant=participant-1",
    );

    expect(tx.session.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          participantId: "participant-1",
          sessionTokenHash: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      }),
    );
    expect(tx.inviteLink.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "invite-1" },
        data: expect.objectContaining({
          status: "revoked",
          revokedAt: expect.any(Date),
          lastUsedAt: expect.any(Date),
        }),
      }),
    );
    expect(cookieSet).toHaveBeenCalledWith(
      SESSION_COOKIE_NAME,
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      }),
    );
  });
});
