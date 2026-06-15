export type BookshopSearchBook = {
  title?: string | null;
  authors?: unknown;
};

function cleanText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function firstAuthor(authors: unknown) {
  if (!Array.isArray(authors)) {
    return "";
  }

  return cleanText(String(authors[0] ?? ""));
}

export function bookshopSearchQuery(book: BookshopSearchBook) {
  const title = cleanText(book.title ?? "");

  if (!title) {
    return null;
  }

  return [firstAuthor(book.authors), title].filter(Boolean).join(" ");
}

export function buildBookshopSearchUrl(book: BookshopSearchBook) {
  const query = bookshopSearchQuery(book);

  if (!query) {
    return null;
  }

  return `https://uk.bookshop.org/search?keywords=${encodeURIComponent(query)}`;
}
