import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Home from "../page";
import { getKnownGroupsForDevice } from "@/lib/groups/session.server";

vi.mock("@/lib/groups/session.server", () => ({
  getKnownGroupsForDevice: vi.fn(async () => []),
}));

describe("landing page", () => {
  it("renders the landing content without the old what-youll-save section", async () => {
    render(await Home());

    expect(screen.getByRole("heading", { level: 1, name: "Trusted Recs" })).toBeInTheDocument();
    expect(screen.getByText(/Great picks/)).toBeInTheDocument();
    expect(screen.getByText(/Better together/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create a group" })).toHaveAttribute("href", "/groups/new");
    expect(screen.getByText("Example recommendation")).toBeInTheDocument();
    expect(screen.queryByText("What you'll save")).not.toBeInTheDocument();
    expect(screen.queryByText("Sarah recommended this")).not.toBeInTheDocument();
  });

  it("shows remembered groups for returning devices", async () => {
    vi.mocked(getKnownGroupsForDevice).mockResolvedValueOnce([
      {
        groupId: "group-1",
        groupName: "McDowell Film Time",
        participantName: "Sean",
        participantRole: "admin",
        participantAvatarSeed: "a1b2c3d4",
        participantCount: 3,
        recommendationCount: 2,
      },
    ]);

    render(await Home());

    expect(screen.getByRole("heading", { level: 2, name: "Your groups" })).toBeInTheDocument();
    expect(screen.getByText("McDowell Film Time")).toBeInTheDocument();
    expect(screen.getByText("Viewing as Sean")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open group" })).toHaveAttribute("href", "/groups/group-1");
  });
});
