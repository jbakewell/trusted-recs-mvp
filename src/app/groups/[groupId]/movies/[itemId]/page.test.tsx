import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const groupFindUnique = vi.fn();
const itemFindFirst = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    group: {
      findUnique: groupFindUnique,
    },
    item: {
      findFirst: itemFindFirst,
    },
  },
}));

vi.mock("@/lib/groups/session.server", () => ({
  getCurrentParticipantForGroup: vi.fn(async () => null),
}));

vi.mock("@/components/visual/OverprintBackground", () => ({
  OverprintBackground: () => null,
  pickOverprintBackgroundIndex: () => 0,
}));

const movieItem = {
  id: "item-1",
  title: "Parasite",
  description: "A family thriller.",
  movieMetadata: {
    releaseYear: 2019,
    overview: "Greed and class discrimination threaten a newly formed symbiotic relationship.",
    posterPath: null,
    genres: ["thriller", "drama"],
    runtime: 132,
    originalLanguage: "ko",
    voteAverage: 8.5,
    voteCount: 12000,
  },
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
      reasonSelections: [
        { reason: { label: "Must watch" } },
        { reason: { label: "Thought-provoking" } },
      ],
      targets: [{ targetType: "group" as const, participant: null }],
    },
  ],
};

describe("MovieDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    groupFindUnique.mockResolvedValue({ id: "group-1", name: "Film club" });
    itemFindFirst.mockResolvedValue(movieItem);
  });

  it("loads only movies recommended in the current group", async () => {
    const { getMovieDetailForGroup } = await import("./page");

    await getMovieDetailForGroup("group-1", "item-1");

    expect(itemFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "item-1",
          recommendations: {
            some: {
              groupId: "group-1",
              deletedAt: null,
            },
          },
        }),
      }),
    );
  });

  it("returns null when the item is not recommended in the group", async () => {
    const { getMovieDetailForGroup } = await import("./page");
    itemFindFirst.mockResolvedValueOnce(null);

    await expect(getMovieDetailForGroup("group-1", "item-1")).resolves.toBeNull();
  });

  it("renders movie metadata and all group recommendations", async () => {
    const { default: MovieDetailPage } = await import("./page");

    render(await MovieDetailPage({ params: Promise.resolve({ groupId: "group-1", itemId: "item-1" }) }));

    expect(screen.getByRole("heading", { level: 1, name: "Parasite" })).toBeInTheDocument();
    expect(screen.getByText(/2019 - Thriller, Drama - 132 min - KO - 8.5 from 12,000 votes/)).toBeInTheDocument();
    expect(screen.getByText(/Greed and class discrimination/)).toBeInTheDocument();
    expect(screen.getByText('Jake says: "Still thinking about it."')).toBeInTheDocument();
    expect(screen.getByText("Must watch")).toBeInTheDocument();
    expect(screen.getByText("Thought-provoking")).toBeInTheDocument();
  });
});
