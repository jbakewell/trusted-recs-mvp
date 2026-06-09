import { render, screen } from "@testing-library/react";
import Home from "../page";

describe("landing page", () => {
  it("renders the landing content and example recommendation", () => {
    render(<Home />);

    expect(screen.getByRole("heading", { level: 1, name: "Trusted Recs" })).toBeInTheDocument();
    expect(screen.getByText("Save the films your favourite people tell you to watch.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create a group" })).toHaveAttribute("href", "/groups/new");
    expect(screen.getByText("Sarah recommended this")).toBeInTheDocument();
    expect(screen.getByText("No email, password, phone number, or contact import required for MVP group use.")).toBeInTheDocument();
  });
});
