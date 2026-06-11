import { createRawToken } from "@/lib/groups/session";

export function createInviteToken() {
  return createRawToken();
}

export function invitePathForToken(rawToken: string) {
  return `/join/${rawToken}`;
}

export function canonicalInviteOrigin(fallbackOrigin?: string) {
  const configuredOrigin = process.env.APP_BASE_URL?.trim();

  if (configuredOrigin && configuredOrigin !== "[placeholder]") {
    return /^https?:\/\//i.test(configuredOrigin) ? configuredOrigin : `https://${configuredOrigin}`;
  }

  return fallbackOrigin?.trim() || "http://localhost:3000";
}

export function inviteUrlForToken(rawToken: string, fallbackOrigin?: string) {
  return new URL(invitePathForToken(rawToken), canonicalInviteOrigin(fallbackOrigin)).toString();
}
