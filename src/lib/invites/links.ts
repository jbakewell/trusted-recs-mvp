import { createRawToken } from "@/lib/groups/session";

export function createInviteToken() {
  return createRawToken();
}

export function invitePathForToken(rawToken: string) {
  return `/join/${rawToken}`;
}

export function inviteUrlForToken(rawToken: string, origin: string) {
  return new URL(invitePathForToken(rawToken), origin).toString();
}
