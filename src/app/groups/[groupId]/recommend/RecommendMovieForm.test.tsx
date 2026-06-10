import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { RecommendMovieForm } from "./RecommendMovieForm";

vi.mock("./actions", () => ({
  createRecommendationAction: vi.fn(async () => ({ status: "idle" })),
}));

const reasons = [
  { id: "funny", label: "Hilarious", genreKey: "comedy", sortOrder: 1 },
  { id: "smart", label: "Witty & smart", genreKey: null, sortOrder: 1 },
];

const movie = {
  tmdbId: 1,
  title: "The Apartment",
  originalTitle: "The Apartment",
  releaseDate: "1960-06-21",
  releaseYear: 1960,
  overview: "A man lends his apartment to company executives.",
  posterPath: null,
  posterUrl: null,
  backdropPath: null,
  genreKeys: ["comedy"],
  originalLanguage: "en",
  popularity: 1,
  voteAverage: 8,
  voteCount: 100,
};

describe("RecommendMovieForm", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({ ok: true, movies: [movie] }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("advances through the four-step board flow", async () => {
    render(
      <RecommendMovieForm
        currentParticipantName="Sarah"
        groupId="group-1"
        groupName="Film club"
        participants={[{ id: "p2", displayName: "Tom" }]}
        reasons={reasons}
      />,
    );

    fireEvent.change(screen.getByLabelText("Movie title"), { target: { value: "ap" } });

    fireEvent.click(await screen.findByRole("button", { name: /The Apartment/i }));
    expect(screen.getByRole("heading", { name: "Who is it for?" })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Add a note/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "Audience details" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { name: "Why do you recommend this?" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Add a note/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Hilarious" }));
    fireEvent.click(screen.getByRole("button", { name: "Witty & smart" }));

    expect(screen.getByText("By Sarah")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share with group" })).toBeEnabled();
  });
});
