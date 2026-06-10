import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { MovieSearchForm } from "./MovieSearchForm";

describe("MovieSearchForm", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          ok: true,
          movies: [
            {
              tmdbId: 226979,
              title: "The Apartment",
              originalTitle: "The Apartment",
              releaseDate: "1960-06-21",
              releaseYear: 1960,
              overview: "A man lends his apartment to company executives.",
              posterPath: "/poster.jpg",
              posterUrl: "https://image.tmdb.org/t/p/w342/poster.jpg",
              backdropPath: null,
              genreKeys: ["comedy", "drama"],
              originalLanguage: "en",
              popularity: 1,
              voteAverage: 8,
              voteCount: 100,
            },
          ],
        }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("searches while typing and hides technical TMDB IDs", async () => {
    render(<MovieSearchForm />);

    fireEvent.focus(screen.getByLabelText("Movie title"));
    fireEvent.change(screen.getByLabelText("Movie title"), { target: { value: "ap" } });

    expect(await screen.findByText("The Apartment")).toBeInTheDocument();
    expect(screen.queryByText(/TMDB #/)).not.toBeInTheDocument();
  });
});
