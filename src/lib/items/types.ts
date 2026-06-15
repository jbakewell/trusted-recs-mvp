import type { GoogleBookSearchResult } from "@/lib/google-books/books";
import type { TmdbMovieSearchResult } from "@/lib/tmdb/movies";

export type ItemCategory = "movies" | "books";
export type RecommendItemType = "movie" | "book";

export type RecommendableItem =
  | ({ itemType: "movie" } & TmdbMovieSearchResult)
  | ({ itemType: "book" } & GoogleBookSearchResult);

export function itemTypeFromCategory(category: ItemCategory): RecommendItemType {
  return category === "books" ? "book" : "movie";
}

export function categoryFromItemType(itemType: string | null | undefined): ItemCategory {
  return itemType === "book" || itemType === "books" ? "books" : "movies";
}

export function itemTypeFromSearchParam(value: string | string[] | undefined): RecommendItemType {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "book" || raw === "books" ? "book" : "movie";
}

export function categoryFromSearchParam(value: string | string[] | undefined): ItemCategory {
  return itemTypeFromSearchParam(value) === "book" ? "books" : "movies";
}

export function categoryLabel(category: ItemCategory) {
  return category === "books" ? "Books" : "Movies";
}

export function recommendLabel(itemType: RecommendItemType) {
  return itemType === "book" ? "Recommend a book" : "Recommend a movie";
}

export function itemThumbnailLabel(itemType: RecommendItemType) {
  return itemType === "book" ? "cover" : "poster";
}

export function itemSearchLabel(itemType: RecommendItemType) {
  return itemType === "book" ? "Book search" : "Movie search";
}

export function itemSearchHeading(itemType: RecommendItemType) {
  return itemType === "book" ? "Choose a book" : "Choose a movie";
}

export function itemSearchPlaceholder(itemType: RecommendItemType) {
  return itemType === "book" ? "Book title or author" : "Movie title";
}

export function itemMetadata(item: RecommendableItem) {
  if (item.itemType === "book") {
    return [
      item.authors.length > 0 ? item.authors.join(", ") : "Author unknown",
      item.publishedYear ? String(item.publishedYear) : null,
      item.publisher,
    ]
      .filter(Boolean)
      .join(" - ");
  }

  return [item.releaseYear ?? "Year unknown", item.genreKeys.slice(0, 3).join(", ")].filter(Boolean).join(" - ");
}

export function itemImageUrl(item: RecommendableItem) {
  return item.itemType === "book" ? item.coverUrl : item.posterUrl;
}

export function itemDescription(item: RecommendableItem) {
  return item.itemType === "book" ? item.description : item.overview;
}

export function itemReasonKeys(item: RecommendableItem) {
  return item.itemType === "book" ? item.categories.map((category) => category.toLowerCase()) : item.genreKeys;
}
