import { normalizeGoogleBook, normalizeGoogleBooksSearchPayload } from "./books";

describe("Google Books normalisation", () => {
  it("normalizes a Google Books volume into the app shape", () => {
    expect(
      normalizeGoogleBook({
        id: "abc123",
        volumeInfo: {
          title: "The Left Hand of Darkness",
          subtitle: "A Novel",
          authors: ["Ursula K. Le Guin"],
          publisher: "Ace",
          publishedDate: "1969-03-01",
          description: "A landmark science fiction novel.",
          imageLinks: {
            thumbnail: "http://books.google.com/cover.jpg",
          },
          pageCount: 304,
          categories: ["Fiction"],
          language: "en",
          averageRating: 4.3,
          ratingsCount: 1200,
        },
      }),
    ).toEqual({
      googleBooksId: "abc123",
      title: "The Left Hand of Darkness",
      subtitle: "A Novel",
      authors: ["Ursula K. Le Guin"],
      publisher: "Ace",
      publishedDate: "1969-03-01",
      publishedYear: 1969,
      description: "A landmark science fiction novel.",
      coverUrl: "https://books.google.com/cover.jpg",
      pageCount: 304,
      categories: ["Fiction"],
      language: "en",
      averageRating: 4.3,
      ratingsCount: 1200,
    });
  });

  it("filters malformed rows from search payloads", () => {
    expect(
      normalizeGoogleBooksSearchPayload({
        items: [
          { id: "ok", volumeInfo: { title: "Valid Book" } },
          { id: "", volumeInfo: { title: "Missing ID" } },
          { id: "missing-title", volumeInfo: {} },
        ],
      }),
    ).toHaveLength(1);
  });
});
