"use client";

import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { archiveRecommendationAction } from "./actions";

type ArchiveRecommendationButtonProps = {
  groupId: string;
  itemId: string;
  itemType: "album" | "book" | "movie";
  recommendationId: string;
};

export function ArchiveRecommendationButton({
  groupId,
  itemId,
  itemType,
  recommendationId,
}: ArchiveRecommendationButtonProps) {
  function confirmArchive(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Remove this recommendation from the group feed?")) {
      event.preventDefault();
    }
  }

  return (
    <form action={archiveRecommendationAction} onSubmit={confirmArchive}>
      <input name="groupId" type="hidden" value={groupId} />
      <input name="itemId" type="hidden" value={itemId} />
      <input name="itemType" type="hidden" value={itemType} />
      <input name="recommendationId" type="hidden" value={recommendationId} />
      <Button className="min-h-8 min-w-0 px-3 text-[10px]" type="submit" variant="text">
        Remove
      </Button>
    </form>
  );
}
