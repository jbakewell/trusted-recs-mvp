import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const groupFindUnique = vi.fn();
const getCurrentParticipantForGroup = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    group: {
      findUnique: groupFindUnique,
    },
  },
}));

vi.mock("@/lib/groups/session.server", () => ({
  getCurrentParticipantForGroup,
}));

vi.mock("@/components/visual/OverprintBackground", () => ({
  OverprintBackground: () => null,
  pickOverprintBackgroundIndex: () => 0,
}));

vi.mock("../InvitePanel", () => ({
  InvitePanel: ({ participants }: { participants: { displayName: string }[] }) => (
    <div>
      {participants.map((participant) => (
        <p key={participant.displayName}>{participant.displayName}</p>
      ))}
    </div>
  ),
}));

const groupForManage = {
  id: "group-1",
  name: "Film Club",
  participants: [
    {
      id: "participant-1",
      displayName: "Jake",
      avatarSeed: "abcdef12",
      role: "admin" as const,
      inviteLinks: [],
    },
    {
      id: "participant-2",
      displayName: "Maya",
      avatarSeed: "12345678",
      role: "member" as const,
      inviteLinks: [],
    },
  ],
};

describe("ManageGroupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentParticipantForGroup.mockResolvedValue(null);
    groupFindUnique.mockResolvedValue({ id: "group-1" });
  });

  it("does not render member management without a participant session", async () => {
    const { default: ManageGroupPage } = await import("./page");

    render(await ManageGroupPage({ params: Promise.resolve({ groupId: "group-1" }) }));

    expect(screen.getByRole("heading", { name: "Rejoin this group to manage invites" })).toBeInTheDocument();
    expect(screen.queryByText("Jake")).not.toBeInTheDocument();
    expect(screen.queryByText("Maya")).not.toBeInTheDocument();
    expect(groupFindUnique).toHaveBeenCalledWith({
      where: { id: "group-1" },
      select: { id: true },
    });
  });

  it("renders member management for an active participant session", async () => {
    const { default: ManageGroupPage } = await import("./page");
    getCurrentParticipantForGroup.mockResolvedValue({
      id: "participant-1",
      displayName: "Jake",
      role: "admin",
      preferredMusicService: "youtube_music",
    });
    groupFindUnique.mockResolvedValue(groupForManage);

    render(await ManageGroupPage({ params: Promise.resolve({ groupId: "group-1" }) }));

    expect(screen.getByRole("heading", { name: "2 people" })).toBeInTheDocument();
    expect(screen.getByText("Jake")).toBeInTheDocument();
    expect(screen.getByText("Maya")).toBeInTheDocument();
    expect(screen.getByText("Preferred music service")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Music service" })).toHaveValue("youtube_music");
  });
});
