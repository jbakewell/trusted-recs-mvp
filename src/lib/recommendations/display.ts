export type RecommendationTargetForDisplay = {
  targetType: "group" | "participant" | "later";
  participant: { displayName: string } | null;
};

export type RecommendationReasonSelectionForDisplay = {
  reason: {
    label: string;
  };
};

export type RecommendationReasonsForDisplay = {
  reason: {
    label: string;
  };
  reasonSelections?: RecommendationReasonSelectionForDisplay[];
};

export function recommendationTargetText(targets: RecommendationTargetForDisplay[]) {
  if (targets.some((target) => target.targetType === "group")) {
    return "For everyone";
  }

  if (targets.some((target) => target.targetType === "later")) {
    return "Saved for later";
  }

  const names = targets.map((target) => target.participant?.displayName).filter(Boolean);
  return names.length > 0 ? `For ${names.join(", ")}` : "For specific people";
}

export function titleCase(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function genresText(genres: unknown, limit = 3) {
  return Array.isArray(genres) && genres.length > 0
    ? genres.slice(0, limit).map((genre) => titleCase(String(genre))).join(", ")
    : "Genre unknown";
}

export function authorsText(authors: unknown, limit = 3) {
  return Array.isArray(authors) && authors.length > 0
    ? authors.slice(0, limit).map((author) => String(author)).join(", ")
    : "Author unknown";
}

export function categoriesText(categories: unknown, limit = 3) {
  return Array.isArray(categories) && categories.length > 0
    ? categories.slice(0, limit).map((category) => titleCase(String(category))).join(", ")
    : null;
}

export function recommendationReasons(recommendation: RecommendationReasonsForDisplay) {
  if (recommendation.reasonSelections) {
    return recommendation.reasonSelections.map((selection) => selection.reason.label);
  }

  return [recommendation.reason.label];
}

export function recommenderNoteText(name: string, note: string | null) {
  return note?.trim() ? `${name} says: "${note.trim()}"` : `${name} recommended this.`;
}

export function runtimeText(runtime: number | null | undefined) {
  return runtime ? `${runtime} min` : null;
}

export function ratingText(voteAverage: unknown, voteCount: number | null | undefined) {
  const average = typeof voteAverage === "number" ? voteAverage : Number(voteAverage);

  if (!Number.isFinite(average) || !voteCount) {
    return null;
  }

  return `${average.toFixed(1)} from ${voteCount.toLocaleString()} votes`;
}
