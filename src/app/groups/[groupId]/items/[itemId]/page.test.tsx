import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

const groupFindUnique = vi.fn();
const itemFindFirst = vi.fn();
const getCurrentParticipantForGroup = vi.fn();
const getTmdbMovieWatchProviders = vi.fn();

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();

  return {
    ...actual,
    notFound: vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    }),
  };
});

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
  getCurrentParticipantForGroup,
}));

vi.mock("@/lib/tmdb/watchProviders", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/tmdb/watchProviders")>();

  return {
    ...actual,
    getTmdbMovieWatchProviders,
  };
});

vi.mock("@/components/visual/OverprintBackground", () => ({
  OverprintBackground: () => null,
  pickOverprintBackgroundIndex: () => 0,
}));

const albumItem = {
  id: "item-1",
  title: "OK Computer",
  type: "album",
  description: "The classic album.",
  imageUrl: "https://example.com/cover.jpg",
  movieMetadata: null,
  bookMetadata: null,
  albumMetadata: {
    artists: ["Radiohead"],
    releaseYear: 1997,
    releaseDate: "1997-05-21",
    totalTracks: 12,
    coverImageUrl: "https://example.com/cover.jpg",
    spotifyUrl: "https://open.spotify.com/album/album-1",
  },
  recommendations: [
    {
      id: "recommendation-1",
      note: "Still sounds future-facing.",
      recommendedByParticipantId: "participant-2",
      recommendedByParticipant: {
        displayName: "Maya",
        avatarSeed: "abcdef12",
      },
      reason: {
        label: "No skips",
      },
      reasonSelections: [
        {
          reason: {
            label: "No skips",
          },
        },
      ],
      targets: [
        {
          targetType: "group",
          participant: null,
        },
      ],
    },
  ],
};

const bookItem = {
  ...albumItem,
  id: "item-2",
  title: "The Left Hand of Darkness",
  type: "book",
  description: "A landmark science fiction novel.",
  imageUrl: "https://example.com/book.jpg",
  movieMetadata: null,
  albumMetadata: null,
  bookMetadata: {
    authors: ["Ursula K. Le Guin"],
    publishedYear: 1969,
    publisher: "Ace",
    categories: ["Science Fiction"],
    pageCount: 304,
    language: "en",
    coverUrl: "https://example.com/book.jpg",
    description: "A landmark science fiction novel.",
  },
};

const movieItem = {
  ...albumItem,
  id: "item-3",
  title: "The Matrix",
  type: "movie",
  description: "A hacker discovers reality is not what it seems.",
  imageUrl: "https://example.com/poster.jpg",
  bookMetadata: null,
  albumMetadata: null,
  movieMetadata: {
    tmdbId: 603,
    releaseYear: 1999,
    genres: ["action", "science-fiction"],
    runtime: 136,
    originalLanguage: "en",
    voteAverage: 8.2,
    voteCount: 25000,
    posterPath: "/matrix.jpg",
    overview: "A hacker discovers reality is not what it seems.",
  },
};

describe("ItemDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentParticipantForGroup.mockResolvedValue({
      id: "participant-1",
      displayName: "Jake",
      avatarSeed: "12345678",
      role: "member",
      preferredMusicService: "apple_music",
    });
    groupFindUnique.mockResolvedValue({
      id: "group-1",
      name: "Album Club",
      archivedAt: null,
    });
    itemFindFirst.mockResolvedValue(albumItem);
    getTmdbMovieWatchProviders.mockResolvedValue({
      ok: true,
      data: {
        region: "GB",
        link: "https://www.themoviedb.org/movie/603/watch",
        stream: [{ providerId: 1, name: "Netflix", logoUrl: null, displayPriority: 1 }],
        rent: [],
        buy: [],
        free: [],
        ads: [],
      },
    });
  });

  it("renders album service links using the participant preference", async () => {
    const { default: ItemDetailPage } = await import("./page");

    render(await ItemDetailPage({ params: Promise.resolve({ groupId: "group-1", itemId: "item-1" }) }));

    expect(screen.getByRole("link", { name: "Search for OK Computer by Radiohead on Apple Music" })).toHaveAttribute(
      "href",
      "https://music.apple.com/search?term=Radiohead%20OK%20Computer",
    );
    expect(screen.getByRole("link", { name: "Open OK Computer by Radiohead in Spotify" })).toHaveAttribute(
      "href",
      "https://open.spotify.com/album/album-1",
    );
  });

  it("renders a Bookshop.org link for book details", async () => {
    const { default: ItemDetailPage } = await import("./page");
    itemFindFirst.mockResolvedValue(bookItem);

    render(await ItemDetailPage({ params: Promise.resolve({ groupId: "group-1", itemId: "item-2" }) }));

    expect(screen.getByRole("link", { name: "Find The Left Hand of Darkness on Bookshop.org" })).toHaveAttribute(
      "href",
      "https://uk.bookshop.org/search?keywords=Ursula%20K.%20Le%20Guin%20The%20Left%20Hand%20of%20Darkness",
    );
    expect(screen.getByRole("link", { name: "Find The Left Hand of Darkness on Bookshop.org" })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByRole("link", { name: "Find The Left Hand of Darkness on Bookshop.org" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });

  it("renders movie watch providers for movie details", async () => {
    const { default: ItemDetailPage } = await import("./page");
    itemFindFirst.mockResolvedValue(movieItem);

    render(await ItemDetailPage({ params: Promise.resolve({ groupId: "group-1", itemId: "item-3" }) }));

    expect(getTmdbMovieWatchProviders).toHaveBeenCalledWith(603);
    expect(screen.getByText("Where to watch")).toBeInTheDocument();
    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all watch options for The Matrix" })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
  });

  it("does not reveal item details when the item is not recommended in the group", async () => {
    const { default: ItemDetailPage } = await import("./page");
    itemFindFirst.mockResolvedValue(null);

    await expect(ItemDetailPage({ params: Promise.resolve({ groupId: "group-1", itemId: "item-1" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(notFound).toHaveBeenCalled();
  });
});
