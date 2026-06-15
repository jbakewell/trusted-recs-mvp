import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MovieWatchProviders } from "./MovieWatchProviders";

describe("MovieWatchProviders", () => {
  it("renders populated provider groups and hides empty groups", () => {
    render(
      <MovieWatchProviders
        movieTitle="The Matrix"
        result={{
          ok: true,
          data: {
            region: "GB",
            link: "https://www.themoviedb.org/movie/603/watch",
            stream: [{ providerId: 1, name: "Netflix", logoUrl: "https://example.com/netflix.jpg", displayPriority: 1 }],
            rent: [{ providerId: 2, name: "Apple TV", logoUrl: null, displayPriority: 2 }],
            buy: [],
            free: [],
            ads: [],
          },
        }}
      />,
    );

    expect(screen.getByText("Where to watch")).toBeInTheDocument();
    expect(screen.getByText("Stream")).toBeInTheDocument();
    expect(screen.getByText("Netflix")).toBeInTheDocument();
    expect(screen.getByText("Rent")).toBeInTheDocument();
    expect(screen.getByText("Apple TV")).toBeInTheDocument();
    expect(screen.queryByText("Buy")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View all watch options for The Matrix" })).toHaveAttribute(
      "target",
      "_blank",
    );
  });

  it("shows an empty state when no providers are available", () => {
    render(
      <MovieWatchProviders
        movieTitle="Tiny Film"
        result={{
          ok: true,
          data: {
            region: "GB",
            link: null,
            stream: [],
            rent: [],
            buy: [],
            free: [],
            ads: [],
          },
        }}
      />,
    );

    expect(screen.getByText("No watch options found for your region.")).toBeInTheDocument();
  });

  it("shows a safe error state", () => {
    render(
      <MovieWatchProviders
        movieTitle="The Matrix"
        result={{ ok: false, error: "Watch options are not available right now." }}
      />,
    );

    expect(screen.getByText("Watch options are not available right now.")).toBeInTheDocument();
  });
});
