import { createHash, randomBytes } from "crypto";

export const SESSION_COOKIE_NAME = "trusted_recs_session";
export const DEVICE_SESSIONS_COOKIE_NAME = "trusted_recs_sessions";
export const MAX_DEVICE_SESSION_TOKENS = 12;

type CookieStore = {
  get(name: string): { value: string } | undefined;
  set?: (
    name: string,
    value: string,
    options: {
      httpOnly: boolean;
      sameSite: "lax";
      secure: boolean;
      path: string;
      expires: Date;
    },
  ) => void;
};

export function createRawToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

function isSessionToken(value: string) {
  return /^[A-Za-z0-9_-]{32,}$/.test(value);
}

export function uniqueSessionTokens(tokens: string[]) {
  const seen = new Set<string>();

  return tokens.filter((token) => {
    if (!isSessionToken(token) || seen.has(token)) {
      return false;
    }

    seen.add(token);
    return true;
  });
}

export function parseDeviceSessionCookie(value: string | undefined) {
  if (!value) {
    return [];
  }

  return uniqueSessionTokens(value.split("."));
}

export function readSessionTokens(cookieStore: CookieStore) {
  const currentToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const deviceTokens = parseDeviceSessionCookie(cookieStore.get(DEVICE_SESSIONS_COOKIE_NAME)?.value);

  return uniqueSessionTokens([currentToken ?? "", ...deviceTokens]).slice(0, MAX_DEVICE_SESSION_TOKENS);
}

export function sessionTokenHashesFromCookies(cookieStore: CookieStore) {
  return readSessionTokens(cookieStore).map(hashToken);
}

export function rememberSessionToken(cookieStore: CookieStore, rawToken: string, expiresAt: Date) {
  const tokens = uniqueSessionTokens([rawToken, ...readSessionTokens(cookieStore)]).slice(0, MAX_DEVICE_SESSION_TOKENS);
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };

  cookieStore.set?.(SESSION_COOKIE_NAME, rawToken, options);
  cookieStore.set?.(DEVICE_SESSIONS_COOKIE_NAME, tokens.join("."), options);
}

export function createAvatarSeed(groupName: string, displayName: string) {
  return hashToken(`${groupName}:${displayName}`).slice(0, 16);
}

export function sessionExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);
  return expiresAt;
}
