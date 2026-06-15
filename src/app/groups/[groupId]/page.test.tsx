import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const groupFindUnique = vi.fn();
const getCurrentParticipantForGroup = vi.fn();
const getKnownGroupsForDevice = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    group: {
      findUnique: groupFindUnique,
    },
  },
}));

vi.mock("@/lib/groups/session.server", () => ({
  getCurrentParticipantForGroup,
  getKnownGroupsForDevice,
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
        type: "movie" as const,
        title: "Parasite",
        description: "A family thriller.",
        imageUrl: null,
        movieMetadata: {
          releaseYear: 2019,
          overview: "Greed and class discrimination.",
          posterPath: null,
          genres: ["thriller", "drama"],
        },
        bookMetadata: null,
        albumMetadata: null,
      },
      targets: [{ targetType: "group" as const, participant: null }],
    },
  ],
};

describe("GroupPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentParticipantForGroup.mockResolvedValue(null);
    getKnownGroupsForDevice.mockResolvedValue([]);
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
      select: { id: true, name: true, archivedAt: true },
    });
  });

  it("does not render an archived group feed", async () => {
    const { default: GroupPage } = await import("./page");
    getCurrentParticipantForGroup.mockResolvedValue({
      id: "participant-1",
      displayName: "Jake",
      avatarSeed: "abcdef12",
    });
    groupFindUnique.mockResolvedValue({
      ...groupWithFeed,
      archivedAt: new Date("2026-01-01"),
    });

    render(await GroupPage({ params: Promise.resolve({ groupId: "group-1" }) }));

    expect(screen.getByText("Archived group")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Film Club" })).toBeInTheDocument();
    expect(screen.getByText("This group is no longer active.")).toBeInTheDocument();
    expect(screen.queryByText("Parasite")).not.toBeInTheDocument();
  });

  it("renders the private feed for an active participant session", async () => {
    const { default: GroupPage } = await import("./page");
    getCurrentParticipantForGroup.mockResolvedValue({
      id: "participant-1",
      displayName: "Jake",
      avatarSeed: "abcdef12",
    });
    groupFindUnique.mockResolvedValue(groupWithFeed);
    getKnownGroupsForDevice.mockResolvedValue([
      {
        groupId: "group-1",
        groupName: "Film Club",
        participantName: "Jake",
        participantRole: "admin",
        participantAvatarSeed: "abcdef12",
        participantCount: 7,
        recommendationCount: 1,
      },
    ]);

    render(await GroupPage({ params: Promise.resolve({ groupId: "group-1" }) }));

    expect(screen.getByText("Film Club")).toBeInTheDocument();
    expect(screen.queryByText("v")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Group settings" })).toHaveAttribute("href", "/groups/group-1/manage");
    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("+3")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Recommend a movie" })).toHaveAttribute(
      "href",
      "/groups/group-1/recommend?type=movie",
    );
    expect(screen.getByRole("link", { name: "Movies" })).toHaveAttribute("aria-current", "page");
    expect(groupFindUnique).toHaveBeenLastCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          recommendations: expect.objectContaining({
            where: expect.objectContaining({
              item: { type: "movie" },
            }),
          }),
        }),
      }),
    );
    expect(screen.getByText("Parasite")).toBeInTheDocument();
    expect(screen.queryByText("Private group")).not.toBeInTheDocument();
    expect(screen.queryByText("Manage")).not.toBeInTheDocument();
  });

  it("activates the books feed from the URL and opens book recommendation flow", async () => {
    const { default: GroupPage } = await import("./page");
    getCurrentParticipantForGroup.mockResolvedValue({
      id: "participant-1",
      displayName: "Jake",
      avatarSeed: "abcdef12",
    });
    groupFindUnique.mockResolvedValue({ ...groupWithFeed, recommendations: [] });

    render(
      await GroupPage({
        params: Promise.resolve({ groupId: "group-1" }),
        searchParams: Promise.resolve({ type: "books" }),
      }),
    );

    expect(screen.getByRole("link", { name: "Books" })).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("link", { name: "Recommend a book" })[0]).toHaveAttribute(
      "href",
      "/groups/group-1/recommend?type=book",
    );
    expect(groupFindUnique).toHaveBeenLastCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          recommendations: expect.objectContaining({
            where: expect.objectContaining({
              item: { type: "book" },
            }),
          }),
        }),
      }),
    );
  });

  it("activates the albums feed from the URL and opens album recommendation flow", async () => {
    const { default: GroupPage } = await import("./page");
    getCurrentParticipantForGroup.mockResolvedValue({
      id: "participant-1",
      displayName: "Jake",
      avatarSeed: "abcdef12",
    });
    groupFindUnique.mockResolvedValue({ ...groupWithFeed, recommendations: [] });

    render(
      await GroupPage({
        params: Promise.resolve({ groupId: "group-1" }),
        searchParams: Promise.resolve({ type: "albums" }),
      }),
    );

    expect(screen.getByRole("link", { name: "Albums" })).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("link", { name: "Recommend an album" })[0]).toHaveAttribute(
      "href",
      "/groups/group-1/recommend?type=album",
    );
    expect(groupFindUnique).toHaveBeenLastCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          recommendations: expect.objectContaining({
            where: expect.objectContaining({
              item: { type: "album" },
            }),
          }),
        }),
      }),
    );
  });

  it("shows the group switch arrow only when multiple known groups exist", async () => {
    const { default: GroupPage } = await import("./page");
    getCurrentParticipantForGroup.mockResolvedValue({
      id: "participant-1",
      displayName: "Jake",
      avatarSeed: "abcdef12",
    });
    groupFindUnique.mockResolvedValue(groupWithFeed);
    getKnownGroupsForDevice.mockResolvedValue([
      {
        groupId: "group-1",
        groupName: "Film Club",
        participantName: "Jake",
        participantRole: "admin",
        participantAvatarSeed: "abcdef12",
        participantCount: 7,
        recommendationCount: 1,
      },
      {
        groupId: "group-2",
        groupName: "Sunday Films",
        participantName: "Jake",
        participantRole: "member",
        participantAvatarSeed: "abcdef12",
        participantCount: 3,
        recommendationCount: 5,
      },
    ]);

    render(await GroupPage({ params: Promise.resolve({ groupId: "group-1" }) }));

    expect(screen.getByRole("link", { name: "Switch group" })).toHaveAttribute("href", "/");
    expect(screen.getByText("v")).toBeInTheDocument();
  });
});
