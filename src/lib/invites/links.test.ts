import { invitePathForToken, inviteUrlForToken } from "./links";

describe("invite links", () => {
  it("builds join paths without exposing hashed tokens", () => {
    expect(invitePathForToken("raw-token")).toBe("/join/raw-token");
  });

  it("builds absolute URLs from the current origin", () => {
    expect(inviteUrlForToken("abc123", "https://trusted-recs.example/groups/1")).toBe("https://trusted-recs.example/join/abc123");
  });
});
