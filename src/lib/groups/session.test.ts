import {
  DEVICE_SESSIONS_COOKIE_NAME,
  MAX_DEVICE_SESSION_TOKENS,
  SESSION_COOKIE_NAME,
  parseDeviceSessionCookie,
  readSessionTokens,
  rememberSessionToken,
  uniqueSessionTokens,
} from "./session";

function token(label: string) {
  return `${label}${"a".repeat(32)}`;
}

function createCookieStore(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));

  return {
    values,
    get: (name: string) => {
      const value = values.get(name);
      return value ? { value } : undefined;
    },
    set: (name: string, value: string) => {
      values.set(name, value);
    },
  };
}

describe("session cookies", () => {
  it("deduplicates valid session tokens while preserving order", () => {
    expect(uniqueSessionTokens([token("one"), "bad token", token("two"), token("one")])).toEqual([
      token("one"),
      token("two"),
    ]);
  });

  it("parses device session cookies", () => {
    expect(parseDeviceSessionCookie(`${token("one")}.${token("two")}.${token("one")}`)).toEqual([
      token("one"),
      token("two"),
    ]);
  });

  it("reads legacy and device session cookies together", () => {
    const store = createCookieStore({
      [SESSION_COOKIE_NAME]: token("current"),
      [DEVICE_SESSIONS_COOKIE_NAME]: `${token("older")}.${token("current")}`,
    });

    expect(readSessionTokens(store)).toEqual([token("current"), token("older")]);
  });

  it("remembers the newest token first and caps stored device sessions", () => {
    const olderTokens = Array.from({ length: MAX_DEVICE_SESSION_TOKENS + 2 }, (_, index) => token(`older${index}`));
    const store = createCookieStore({
      [DEVICE_SESSIONS_COOKIE_NAME]: olderTokens.join("."),
    });

    rememberSessionToken(store, token("newest"), new Date("2026-01-01T00:00:00.000Z"));

    expect(store.values.get(SESSION_COOKIE_NAME)).toBe(token("newest"));
    expect(store.values.get(DEVICE_SESSIONS_COOKIE_NAME)?.split(".")).toHaveLength(MAX_DEVICE_SESSION_TOKENS);
    expect(store.values.get(DEVICE_SESSIONS_COOKIE_NAME)?.split(".")[0]).toBe(token("newest"));
  });
});
