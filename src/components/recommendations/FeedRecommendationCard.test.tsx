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
    title: "Parasite",
    movieMetadata: {
      releaseYear: 2019,
      posterPath: null,
      genres: ["thriller", "drama"],
    },
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
    expect(screen.getByRole("link", { name: "More..." })).toHaveAttribute("href", "/groups/group-1/movies/item-1");
  });
});
