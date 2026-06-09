import { createHash, randomBytes } from "crypto";

export const SESSION_COOKIE_NAME = "trusted_recs_session";

export function createRawToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function createAvatarSeed(groupName: string, displayName: string) {
  return hashToken(`${groupName}:${displayName}`).slice(0, 16);
}

export function sessionExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);
  return expiresAt;
}
