export type ReasonOption = {
  id: string;
  label: string;
  genreKey: string | null;
  sortOrder: number;
};

const GENRE_REASON_LIMITS = [6, 4, 3] as const;
const GLOBAL_REASON_LIMIT = 2;

export function orderReasonOptions(reasons: ReasonOption[], genreKeys: string[]) {
  const activeGenreKeys = genreKeys.filter(Boolean).slice(0, GENRE_REASON_LIMITS.length);
  const selected: ReasonOption[] = [];
  const seenLabels = new Set<string>();

  function addReason(reason: ReasonOption) {
    const key = reason.label.toLocaleLowerCase();

    if (seenLabels.has(key)) {
      return;
    }

    seenLabels.add(key);
    selected.push(reason);
  }

  activeGenreKeys.forEach((genreKey, index) => {
    reasons
      .filter((reason) => reason.genreKey === genreKey)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, GENRE_REASON_LIMITS[index])
      .forEach(addReason);
  });

  reasons
    .filter((reason) => reason.genreKey === null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, GLOBAL_REASON_LIMIT)
    .forEach(addReason);

  if (selected.length > 0) {
    return selected;
  }

  return reasons
    .filter((reason) => reason.genreKey === null)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, 8);
}
