import { createSeededRandom, randomBetween, randomInt } from "./seededRandom";

describe("seeded random", () => {
  it("returns the same sequence for the same seed", () => {
    const first = createSeededRandom("group-1");
    const second = createSeededRandom("group-1");

    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it("returns different sequences for different seeds", () => {
    const first = createSeededRandom("group-1");
    const second = createSeededRandom("group-2");

    expect([first(), first(), first()]).not.toEqual([second(), second(), second()]);
  });

  it("keeps generated values within requested bounds", () => {
    const random = createSeededRandom("bounds");
    const decimal = randomBetween(random, 10, 20);
    const integer = randomInt(random, 2, 4);

    expect(decimal).toBeGreaterThanOrEqual(10);
    expect(decimal).toBeLessThanOrEqual(20);
    expect(integer).toBeGreaterThanOrEqual(2);
    expect(integer).toBeLessThanOrEqual(4);
    expect(Number.isInteger(integer)).toBe(true);
  });
});
