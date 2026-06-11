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

const groupWithFeed = {
  id: "group-1",
  name: "Film Club",
  participants: [
    {
      id: "participant-1",
      displayName: "Jake",
      avatarSeed: "abcdef12",
      role: "admin" as const,
    },
    {
      id: "participant-2",
      displayName: "Maya",
      avatarSeed: "12345678",
      role: "member" as const,
    },
    {
      id: "participant-3",
      displayName: "Rita",
      avatarSeed: "22345678",
      role: "member" as const,
    },
    {
      id: "participant-4",
      displayName: "Sean",
      avatarSeed: "32345678",
      role: "member" as const,
    },
    {
      id: "participant-5",
      displayName: "Aofie",
      avatarSeed: "42345678",
      role: "member" as const,
    },
    {
      id: "participant-6",
      displayName: "Ravi",
      avatarSeed: "52345678",
      role: "member" as const,
    },
    {
      id: "participant-7",
      displayName: "Dina",
      avatarSeed: "62345678",
      role: "member" as const,
    },
  ],
  recommendations: [
    {
      id: "rec-1",
      note: "Still thinking about it.",
      recommendedByParticipant: {
        displayName: "Jake",
        avatarSeed: "abcdef12",
      },
      reason: {
        label: "Must watch",
      },
      reasonSelections: [],
      item: {
        id: "item-1",
        title: "Parasite",
        description: "A family thriller.",
        movieMetadata: {
          releaseYear: 2019,
          overview: "Greed and class discrimination.",
          posterPath: null,
          genres: ["thriller", "drama"],
        },
      },
      targets: [{ targetType: "group" as const, participant: null }],
    },
  ],
};

describe("GroupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentParticipantForGroup.mockResolvedValue(null);
    groupFindUnique.mockResolvedValue({ id: "group-1" });
  });

  it("does not load or render the feed without a participant session", async () => {
    const { default: GroupPage } = await import("./page");

    render(await GroupPage({ params: Promise.resolve({ groupId: "group-1" }) }));

    expect(screen.getByRole("heading", { name: "This private group needs an invite" })).toBeInTheDocument();
    expect(screen.queryByText("Film Club")).not.toBeInTheDocument();
    expect(screen.queryByText("Parasite")).not.toBeInTheDocument();
    expect(groupFindUnique).toHaveBeenCalledTimes(1);
    expect(groupFindUnique).toHaveBeenCalledWith({
      where: { id: "group-1" },
      select: { id: true },
    });
  });

  it("renders the private feed for an active participant session", async () => {
    const { default: GroupPage } = await import("./page");
    getCurrentParticipantForGroup.mockResolvedValue({
      id: "participant-1",
      displayName: "Jake",
      avatarSeed: "abcdef12",
    });
    groupFindUnique.mockResolvedValue(groupWithFeed);

    render(await GroupPage({ params: Promise.resolve({ groupId: "group-1" }) }));

    expect(screen.getByText("Film Club")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Manage Film Club" })).toHaveAttribute("href", "/groups/group-1/manage");
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
    expect(screen.getByText("Recommend a movie")).toBeInTheDocument();
    expect(screen.getByText("Parasite")).toBeInTheDocument();
    expect(screen.queryByText("Private group")).not.toBeInTheDocument();
    expect(screen.queryByText("Manage")).not.toBeInTheDocument();
  });
});
