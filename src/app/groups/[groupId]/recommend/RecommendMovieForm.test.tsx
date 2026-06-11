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

  it("advances through the two-step recommendation flow", async () => {
    render(
      <RecommendMovieForm
        backgroundIndex={0}
        currentParticipantName="Sarah"
        groupId="group-1"
        groupName="Film club"
        participants={[{ id: "p2", displayName: "Tom" }]}
        reasons={reasons}
      />,
    );

    fireEvent.change(screen.getByLabelText("Movie title"), { target: { value: "ap" } });

    fireEvent.click(await screen.findByRole("button", { name: /The Apartment/i }));
    expect(screen.getByRole("heading", { name: "Add a note or reasons" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Who is it for?" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Audience details" })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Add a note/i)).toBeInTheDocument();

    expect(screen.getByText("By Sarah")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share with group" })).toBeEnabled();
  });
});
