import { invitePathForToken, inviteUrlForToken } from "./links";

describe("invite links", () => {
  const previousAppBaseUrl = process.env.APP_BASE_URL;

  afterEach(() => {
    process.env.APP_BASE_URL = previousAppBaseUrl;
  });

  it("builds join paths without exposing hashed tokens", () => {
    expect(invitePathForToken("raw-token")).toBe("/join/raw-token");
  });

  it("builds absolute URLs from the current origin", () => {
    delete process.env.APP_BASE_URL;

    expect(inviteUrlForToken("abc123", "https://trusted-recs.example/groups/1")).toBe("https://trusted-recs.example/join/abc123");
  });

  it("prefers the configured stable app URL over preview origins", () => {
    process.env.APP_BASE_URL = "https://trusted-recs-mvp.vercel.app";

    expect(inviteUrlForToken("abc123", "https://preview-url.vercel.app/groups/1")).toBe(
      "https://trusted-recs-mvp.vercel.app/join/abc123",
    );
  });

  it("normalizes a configured bare host to https", () => {
    process.env.APP_BASE_URL = "trusted-recs-mvp.vercel.app";

    expect(inviteUrlForToken("abc123", "https://preview-url.vercel.app/groups/1")).toBe(
      "https://trusted-recs-mvp.vercel.app/join/abc123",
    );
  });
});
