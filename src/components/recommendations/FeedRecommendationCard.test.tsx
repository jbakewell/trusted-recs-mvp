import { render, screen } from "@testing-library/react";
import { FeedRecommendationCard } from "./FeedRecommendationCard";

const recommendation = {
  id: "rec-1",
  note: "This is really terrifying",
  recommendedByParticipant: {
    displayName: "Jake",
  },
  reason: {
    label: "Fallback reason",
  },
  reasonSelections: [
    { reason: { label: "Mind-blowing" } },
    { reason: { label: "Must watch" } },
    { reason: { label: "Emotional" } },
    { reason: { label: "Beautiful" } },
  ],
  item: {
    id: "item-1",
    type: "movie" as const,
    title: "Parasite",
    description: "A family thriller.",
    imageUrl: null,
    movieMetadata: {
      releaseYear: 2019,
      overview: "A movie description.",
      posterPath: null,
      genres: ["thriller", "drama"],
        },
        bookMetadata: null,
        albumMetadata: null,
      },
  targets: [{ targetType: "group" as const, participant: null }],
};

describe("FeedRecommendationCard", () => {
  it("renders a compact comment-first card with a movie detail link", () => {
    render(<FeedRecommendationCard groupId="group-1" recommendation={recommendation} />);

    expect(screen.getByRole("heading", { name: "Parasite" })).toBeInTheDocument();
    expect(screen.getByText("2019 - Thriller, Drama")).toBeInTheDocument();
    expect(screen.getByText('Jake says: "This is really terrifying"')).toBeInTheDocument();
    expect(screen.queryByText("Mind-blowing")).not.toBeInTheDocument();
    expect(screen.queryByText("Must watch")).not.toBeInTheDocument();
    expect(screen.queryByText("Emotional")).not.toBeInTheDocument();
    expect(screen.queryByText("Beautiful")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "More..." })).toHaveAttribute("href", "/groups/group-1/items/item-1");
    expect(screen.getByRole("link", { name: "View Parasite details" })).toHaveAttribute("href", "/groups/group-1/items/item-1");
  });

  it("uses the movie description when there is no user comment", () => {
    render(<FeedRecommendationCard groupId="group-1" recommendation={{ ...recommendation, note: null }} />);

    expect(screen.getByText("A movie description.")).toBeInTheDocument();
    expect(screen.queryByText('Jake says: "A movie description."')).not.toBeInTheDocument();
  });

  it("renders book metadata in the same compact card layout", () => {
    render(
      <FeedRecommendationCard
        groupId="group-1"
        recommendation={{
          ...recommendation,
          note: null,
          item: {
            id: "book-item-1",
            type: "book",
            title: "The Left Hand of Darkness",
            description: "A book description.",
            imageUrl: "https://example.com/cover.jpg",
            movieMetadata: null,
            bookMetadata: {
              authors: ["Ursula K. Le Guin"],
              publisher: "Ace",
              publishedYear: 1969,
              description: "A landmark science fiction novel.",
              coverUrl: "https://example.com/cover.jpg",
              categories: ["Fiction"],
            },
            albumMetadata: null,
          },
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "The Left Hand of Darkness" })).toBeInTheDocument();
    expect(screen.getByText("Ursula K. Le Guin - 1969 - Ace")).toBeInTheDocument();
    expect(screen.getByText("A landmark science fiction novel.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "More..." })).toHaveAttribute("href", "/groups/group-1/items/book-item-1");
  });

  it("renders album metadata in the same compact card layout", () => {
    render(
      <FeedRecommendationCard
        groupId="group-1"
        recommendation={{
          ...recommendation,
          note: null,
          item: {
            id: "album-item-1",
            type: "album",
            title: "OK Computer",
            description: null,
            imageUrl: "https://example.com/ok-computer.jpg",
            movieMetadata: null,
            bookMetadata: null,
            albumMetadata: {
              artists: ["Radiohead"],
              releaseYear: 1997,
              coverImageUrl: "https://example.com/ok-computer.jpg",
              totalTracks: 12,
            },
          },
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "OK Computer" })).toBeInTheDocument();
    expect(screen.getAllByText("Radiohead - 1997 - 12 tracks").length).toBeGreaterThan(0);
    const detailLink = screen.getByRole("link", { name: "View OK Computer details" });
    expect(detailLink).toHaveAttribute(
      "href",
      "/groups/group-1/items/album-item-1",
    );
    expect(detailLink.querySelector("img")).toHaveClass("aspect-square");
  });
});
