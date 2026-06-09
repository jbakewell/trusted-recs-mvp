import { orderReasonOptions, type ReasonOption } from "./reasons";

const reasons: ReasonOption[] = [
  { id: "action-fast", label: "Fast-paced", genreKey: "action", sortOrder: 1 },
  { id: "action-brutal", label: "Brutal", genreKey: "action", sortOrder: 2 },
  { id: "action-set-pieces", label: "Great set pieces", genreKey: "action", sortOrder: 3 },
  { id: "action-adrenaline", label: "Pure adrenaline", genreKey: "action", sortOrder: 4 },
  { id: "action-tense", label: "Tense", genreKey: "action", sortOrder: 5 },
  { id: "action-explosive", label: "Explosive", genreKey: "action", sortOrder: 6 },
  { id: "action-extra", label: "Extra action", genreKey: "action", sortOrder: 7 },
  { id: "thriller-tense", label: "Tense", genreKey: "thriller", sortOrder: 1 },
  { id: "thriller-gripping", label: "Gripping", genreKey: "thriller", sortOrder: 2 },
  { id: "global-characters", label: "Amazing characters", genreKey: null, sortOrder: 1 },
  { id: "global-made", label: "Beautifully made", genreKey: null, sortOrder: 2 },
  { id: "global-story", label: "Great story", genreKey: null, sortOrder: 3 },
];

describe("reason chip ordering", () => {
  it("prioritizes primary genre reasons and then fallback reasons", () => {
    expect(orderReasonOptions(reasons, ["action"]).map((reason) => reason.label)).toEqual([
      "Fast-paced",
      "Brutal",
      "Great set pieces",
      "Pure adrenaline",
      "Tense",
      "Explosive",
      "Amazing characters",
      "Beautifully made",
    ]);
  });

  it("adds secondary genre reasons without duplicate labels", () => {
    expect(orderReasonOptions(reasons, ["action", "thriller"]).map((reason) => reason.label)).toEqual([
      "Fast-paced",
      "Brutal",
      "Great set pieces",
      "Pure adrenaline",
      "Tense",
      "Explosive",
      "Gripping",
      "Amazing characters",
      "Beautifully made",
    ]);
  });

  it("falls back to global reasons when genre data is missing", () => {
    expect(orderReasonOptions(reasons, []).map((reason) => reason.label)).toEqual([
      "Amazing characters",
      "Beautifully made",
    ]);
  });
});
