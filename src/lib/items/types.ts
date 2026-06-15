import type { GoogleBookSearchResult } from "@/lib/google-books/books";
import type { SpotifyAlbumSearchResult } from "@/lib/spotify/albums";
import type { TmdbMovieSearchResult } from "@/lib/tmdb/movies";

export type ItemCategory = "movies" | "books" | "albums";
export type RecommendItemType = "movie" | "book" | "album";

export type RecommendableItem =
  | ({ itemType: "movie" } & TmdbMovieSearchResult)
  | ({ itemType: "book" } & GoogleBookSearchResult)
  | ({ itemType: "album" } & SpotifyAlbumSearchResult);

export function itemTypeFromCategory(category: ItemCategory): RecommendItemType {
  if (category === "books") {
    return "book";
  }

  if (category === "albums") {
    return "album";
  }

  return "movie";
}

export function categoryFromItemType(itemType: string | null | undefined): ItemCategory {
  if (itemType === "book" || itemType === "books") {
    return "books";
  }

  if (itemType === "album" || itemType === "albums") {
    return "albums";
  }

  return "movies";
}

export function itemTypeFromSearchParam(value: string | string[] | undefined): RecommendItemType {
  const raw = Array.isArray(value) ? value[0] : value;
  return itemTypeFromCategory(categoryFromItemType(raw));
}

export function categoryFromSearchParam(value: string | string[] | undefined): ItemCategory {
  const raw = Array.isArray(value) ? value[0] : value;
  return categoryFromItemType(raw);
}

export function categoryLabel(category: ItemCategory) {
  if (category === "books") {
    return "Books";
  }

  if (category === "albums") {
    return "Albums";
  }

  return "Movies";
}

export function recommendLabel(itemType: RecommendItemType) {
  if (itemType === "book") {
    return "Recommend a book";
  }

  if (itemType === "album") {
    return "Recommend an album";
  }

  return "Recommend a movie";
}

export function itemThumbnailLabel(itemType: RecommendItemType) {
  return itemType === "movie" ? "poster" : "cover";
}

export function itemSearchLabel(itemType: RecommendItemType) {
  if (itemType === "book") {
    return "Book search";
  }

  if (itemType === "album") {
    return "Album search";
  }

  return "Movie search";
}

export function itemSearchHeading(itemType: RecommendItemType) {
  if (itemType === "book") {
    return "Choose a book";
  }

  if (itemType === "album") {
    return "Choose an album";
  }

  return "Choose a movie";
}

export function itemSearchPlaceholder(itemType: RecommendItemType) {
  if (itemType === "book") {
    return "Book title or author";
  }

  if (itemType === "album") {
    return "Album title or artist";
  }

  return "Movie title";
}

export function itemTypeNoun(itemType: RecommendItemType) {
  if (itemType === "book") {
    return "book";
  }

  if (itemType === "album") {
    return "album";
  }

  return "movie";
}

function tracksText(totalTracks: number | null) {
  if (!totalTracks) {
    return null;
  }

  return `${totalTracks} ${totalTracks === 1 ? "track" : "tracks"}`;
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

  if (item.itemType === "album") {
    return [
      item.artists.length > 0 ? item.artists.join(", ") : "Artist unknown",
      item.releaseYear ? String(item.releaseYear) : null,
      tracksText(item.totalTracks),
    ]
      .filter(Boolean)
      .join(" - ");
  }

  return [item.releaseYear ?? "Year unknown", item.genreKeys.slice(0, 3).join(", ")].filter(Boolean).join(" - ");
}

export function itemImageUrl(item: RecommendableItem) {
  if (item.itemType === "book") {
    return item.coverUrl;
  }

  if (item.itemType === "album") {
    return item.coverImageUrl;
  }

  return item.posterUrl;
}

export function itemDescription(item: RecommendableItem) {
  if (item.itemType === "book") {
    return item.description;
  }

  if (item.itemType === "album") {
    return itemMetadata(item);
  }

  return item.overview;
}

export function itemReasonKeys(item: RecommendableItem) {
  if (item.itemType === "book") {
    return item.categories.map((category) => category.toLowerCase());
  }

  if (item.itemType === "album") {
    return ["album_default"];
  }

  return item.genreKeys;
}
