import type { ExternalSource } from "@prisma/client";
import type { ItemCategory, RecommendItemType } from "./types";

type ItemProviderConfig = {
  category: ItemCategory;
  externalSource: ExternalSource;
  noun: string;
  plural: string;
};

export const itemProviders: Record<RecommendItemType, ItemProviderConfig> = {
  movie: {
    category: "movies",
    externalSource: "tmdb",
    noun: "movie",
    plural: "movies",
  },
  book: {
    category: "books",
    externalSource: "google_books",
    noun: "book",
    plural: "books",
  },
  album: {
    category: "albums",
    externalSource: "spotify",
    noun: "album",
    plural: "albums",
  },
};

export function itemProvider(itemType: RecommendItemType) {
  return itemProviders[itemType];
}
