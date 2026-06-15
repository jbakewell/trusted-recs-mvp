export type GoogleBookSearchResult = {
  googleBooksId: string;
  title: string;
  subtitle: string | null;
  authors: string[];
  publisher: string | null;
  publishedDate: string | null;
  publishedYear: number | null;
  description: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  categories: string[];
  language: string | null;
  averageRating: number | null;
  ratingsCount: number | null;
};

type GoogleBooksVolumePayload = {
  id?: unknown;
  volumeInfo?: {
    title?: unknown;
    subtitle?: unknown;
    authors?: unknown;
    publisher?: unknown;
    publishedDate?: unknown;
    description?: unknown;
    imageLinks?: {
      thumbnail?: unknown;
      smallThumbnail?: unknown;
    };
    pageCount?: unknown;
    categories?: unknown;
    language?: unknown;
    averageRating?: unknown;
    ratingsCount?: unknown;
  };
};

type GoogleBooksSearchPayload = {
  items?: GoogleBooksVolumePayload[];
};

export type SearchBooksResult =
  | {
      ok: true;
      books: GoogleBookSearchResult[];
    }
  | {
      ok: false;
      error: string;
    };

function cleanString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function cleanNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function cleanStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => cleanString(item)).filter((item): item is string => Boolean(item))
    : [];
}

function normalizeImageUrl(value: unknown) {
  const imageUrl = cleanString(value);
  return imageUrl ? imageUrl.replace(/^http:\/\//, "https://") : null;
}

function publishedYearFromDate(value: string | null) {
  const match = value?.match(/^(\d{4})/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function normalizeGoogleBook(volume: GoogleBooksVolumePayload): GoogleBookSearchResult | null {
  const googleBooksId = cleanString(volume.id);
  const info = volume.volumeInfo;
  const title = cleanString(info?.title);

  if (!googleBooksId || !title) {
    return null;
  }

  const publishedDate = cleanString(info?.publishedDate);
  const thumbnail = normalizeImageUrl(info?.imageLinks?.thumbnail) ?? normalizeImageUrl(info?.imageLinks?.smallThumbnail);

  return {
    googleBooksId,
    title,
    subtitle: cleanString(info?.subtitle),
    authors: cleanStringArray(info?.authors),
    publisher: cleanString(info?.publisher),
    publishedDate,
    publishedYear: publishedYearFromDate(publishedDate),
    description: cleanString(info?.description),
    coverUrl: thumbnail,
    pageCount: cleanNumber(info?.pageCount),
    categories: cleanStringArray(info?.categories),
    language: cleanString(info?.language),
    averageRating: cleanNumber(info?.averageRating),
    ratingsCount: cleanNumber(info?.ratingsCount),
  };
}

export function normalizeGoogleBooksSearchPayload(payload: GoogleBooksSearchPayload): GoogleBookSearchResult[] {
  return (payload.items ?? [])
    .map(normalizeGoogleBook)
    .filter((book): book is GoogleBookSearchResult => Boolean(book));
}

function appendApiKey(url: URL) {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY?.trim();

  if (apiKey) {
    url.searchParams.set("key", apiKey);
  }
}

export async function searchGoogleBooks(query: string): Promise<SearchBooksResult> {
  const cleanQuery = query.trim();

  if (cleanQuery.length < 2) {
    return { ok: true, books: [] };
  }

  const baseUrl = process.env.GOOGLE_BOOKS_BASE_URL ?? "https://www.googleapis.com/books/v1";
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/volumes`);
  url.searchParams.set("q", cleanQuery);
  url.searchParams.set("printType", "books");
  url.searchParams.set("maxResults", "10");
  appendApiKey(url);

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      return { ok: false, error: "Google Books could not search right now. Try again in a moment." };
    }

    const payload = (await response.json()) as GoogleBooksSearchPayload;
    return { ok: true, books: normalizeGoogleBooksSearchPayload(payload) };
  } catch {
    return { ok: false, error: "Google Books could not search right now. Try again in a moment." };
  }
}

export async function getGoogleBookDetails(googleBooksId: string): Promise<SearchBooksResult> {
  const cleanId = googleBooksId.trim();

  if (!cleanId) {
    return { ok: false, error: "Choose a book before submitting." };
  }

  const baseUrl = process.env.GOOGLE_BOOKS_BASE_URL ?? "https://www.googleapis.com/books/v1";
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/volumes/${encodeURIComponent(cleanId)}`);
  appendApiKey(url);

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });

    if (!response.ok) {
      return { ok: false, error: "Google Books could not load that book right now. Try again in a moment." };
    }

    const book = normalizeGoogleBook((await response.json()) as GoogleBooksVolumePayload);

    if (!book) {
      return { ok: false, error: "Google Books returned an incomplete book record." };
    }

    return { ok: true, books: [book] };
  } catch {
    return { ok: false, error: "Google Books could not load that book right now. Try again in a moment." };
  }
}
