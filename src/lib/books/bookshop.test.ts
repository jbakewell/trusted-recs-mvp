import { describe, expect, it } from "vitest";
import { bookshopSearchQuery, buildBookshopSearchUrl } from "./bookshop";

describe("Bookshop.org links", () => {
  it("builds a search URL from title and first author", () => {
    expect(
      buildBookshopSearchUrl({
        title: "The Left Hand of Darkness",
        authors: ["Ursula K. Le Guin", "Someone Else"],
      }),
    ).toBe("https://uk.bookshop.org/search?keywords=Ursula%20K.%20Le%20Guin%20The%20Left%20Hand%20of%20Darkness");
  });

  it("uses title only when author is missing", () => {
    expect(buildBookshopSearchUrl({ title: "Piranesi", authors: [] })).toBe(
      "https://uk.bookshop.org/search?keywords=Piranesi",
    );
  });

  it("URL-encodes the query", () => {
    expect(buildBookshopSearchUrl({ title: "Jonathan Strange & Mr Norrell", authors: ["Susanna Clarke"] })).toBe(
      "https://uk.bookshop.org/search?keywords=Susanna%20Clarke%20Jonathan%20Strange%20%26%20Mr%20Norrell",
    );
  });

  it("returns no link when title is missing", () => {
    expect(buildBookshopSearchUrl({ title: "", authors: ["Ursula K. Le Guin"] })).toBeNull();
    expect(bookshopSearchQuery({ title: null, authors: ["Ursula K. Le Guin"] })).toBeNull();
  });
});
