"use client";

import { useActionState, useMemo, useState } from "react";
import { FixedFooterAction } from "@/components/app/FixedFooterAction";
import { FixedHeader } from "@/components/app/FixedHeader";
import { NumberedProgress } from "@/components/app/NumberedProgress";
import { ScrollRegion } from "@/components/app/ScrollRegion";
import { useKeyboardInset } from "@/components/app/useKeyboardInset";
import { WizardShell } from "@/components/app/WizardShell";
import { ItemSearchForm } from "@/components/items/ItemSearchForm";
import { Button } from "@/components/ui/Button";
import { Chip, ChipButton } from "@/components/ui/Chip";
import { ItemThumbnail } from "@/components/ui/ItemThumbnail";
import { OverprintBackground } from "@/components/visual/OverprintBackground";
import {
  itemDescription,
  itemImageUrl,
  itemMetadata,
  itemReasonKeys,
  itemThumbnailLabel,
  type RecommendableItem,
  type RecommendItemType,
} from "@/lib/items/types";
import { orderReasonOptions, type ReasonOption } from "@/lib/recommendations/reasons";
import { tintForReason } from "@/lib/visual/chipTint";
import { createRecommendationAction, type RecommendationFormState } from "./actions";

type ParticipantOption = {
  id: string;
  displayName: string;
};

type RecommendMovieFormProps = {
  groupId: string;
  groupName: string;
  currentParticipantName: string;
  participants: ParticipantOption[];
  reasons: ReasonOption[];
  backgroundIndex: number;
  itemType?: RecommendItemType;
};

type WizardStep = 1 | 2;

const NOTE_LIMIT = 240;
const initialState: RecommendationFormState = { status: "idle" };

function SelectedItemSummary({ item, onChange }: { item: RecommendableItem; onChange: () => void }) {
  return (
    <div className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 rounded-card border border-border-subtle surface-strong p-3">
      <ItemThumbnail
        className="w-[52px]"
        label={itemThumbnailLabel(item.itemType)}
        size="sm"
        src={itemImageUrl(item)}
        title={item.title}
      />
      <div className="min-w-0">
        <p className="metadata-label text-accent">Selected {item.itemType}</p>
        <h2 className="line-clamp-2 font-display text-[20px] font-semibold uppercase leading-none tracking-[0.04em] text-text-primary">
          {item.title}
        </h2>
        <p className="truncate text-body-sm text-text-muted">{itemMetadata(item)}</p>
      </div>
      <button className="text-caption font-bold uppercase tracking-[0.08em] text-accent" onClick={onChange} type="button">
        Change
      </button>
    </div>
  );
}

export function RecommendMovieForm({
  groupId,
  groupName,
  currentParticipantName,
  reasons,
  backgroundIndex,
  itemType = "movie",
}: RecommendMovieFormProps) {
  useKeyboardInset();

  const [submitState, submitAction, isSubmitting] = useActionState<RecommendationFormState, FormData>(
    createRecommendationAction,
    initialState,
  );
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedItem, setSelectedItem] = useState<RecommendableItem | null>(null);
  const [selectedReasonIds, setSelectedReasonIds] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const orderedReasons = useMemo(
    () => orderReasonOptions(reasons, selectedItem ? itemReasonKeys(selectedItem) : []),
    [reasons, selectedItem],
  );
  const selectedReasons = selectedReasonIds
    .map((reasonId) => orderedReasons.find((reason) => reason.id === reasonId) ?? reasons.find((reason) => reason.id === reasonId))
    .filter((reason): reason is ReasonOption => Boolean(reason));

  function selectItem(item: RecommendableItem) {
    setSelectedItem(item);
    setSelectedReasonIds([]);
    setStep(2);
  }

  function toggleReason(reasonId: string) {
    setSelectedReasonIds((ids) =>
      ids.includes(reasonId) ? ids.filter((id) => id !== reasonId) : [...ids, reasonId],
    );
  }

  const selectedItemSummary = selectedItem ? (
    <SelectedItemSummary item={selectedItem} onChange={() => setStep(1)} />
  ) : null;
  const returnCategory = itemType === "book" ? "books" : "movies";

  const footer =
    step === 2 ? (
      <FixedFooterAction
        primary={
          <Button className="w-full" disabled={isSubmitting} form="recommendation-review-form" type="submit">
            {isSubmitting ? "Sharing..." : "Share with group"}
          </Button>
        }
        secondary={
          <Button onClick={() => setStep(1)} type="button" variant="text">
            Back
          </Button>
        }
      />
    ) : null;

  return (
    <WizardShell
      background={<OverprintBackground backgroundIndex={backgroundIndex} density="medium" route="recommend" />}
      footer={footer}
      header={<FixedHeader leftAction={{ href: `/groups/${groupId}?type=${returnCategory}`, label: "Back to group" }} subtitle={groupName} title="Add recommendation" />}
      progress={<NumberedProgress currentStep={step} totalSteps={2} />}
    >
      {step === 1 ? <ItemSearchForm itemType={itemType} onSelectItem={selectItem} /> : null}

      {step === 2 && selectedItem ? (
        <ScrollRegion className="grid content-start gap-4 p-4">
          <form action={submitAction} className="grid gap-4" id="recommendation-review-form">
            <input name="groupId" type="hidden" value={groupId} />
            <input name="itemType" type="hidden" value={selectedItem.itemType} />
            {selectedItem.itemType === "movie" ? (
              <input name="tmdbId" type="hidden" value={selectedItem.tmdbId} />
            ) : (
              <input name="googleBooksId" type="hidden" value={selectedItem.googleBooksId} />
            )}
            <input name="targetType" type="hidden" value="group" />
            <input name="note" type="hidden" value={note} />
            {selectedReasonIds.map((reasonId) => (
              <input key={reasonId} name="reasonIds" type="hidden" value={reasonId} />
            ))}

            {selectedItemSummary}

            <section className="grid gap-3">
              <div>
                <p className="metadata-label text-accent">Step 2</p>
                <h2 className="section-title mt-1">Add a note or reasons</h2>
                <p className="text-body-sm text-text-secondary">Both are optional.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {orderedReasons.map((reason) => {
                  const selected = selectedReasonIds.includes(reason.id);

                  return (
                    <ChipButton
                      key={reason.id}
                      onClick={() => toggleReason(reason.id)}
                      selected={selected}
                      tint={tintForReason(reason.label)}
                    >
                      {reason.label}
                    </ChipButton>
                  );
                })}
              </div>
            </section>

            <label className="grid gap-2 text-body-sm font-semibold text-text-primary">
              Add a note <span className="font-normal text-text-muted">(optional)</span>
              <textarea
                className="min-h-[104px] resize-none rounded-card border border-border-subtle bg-surface-strong p-3 text-body text-text-primary placeholder:text-text-placeholder focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                maxLength={NOTE_LIMIT}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a short note."
                value={note}
              />
              <span className="text-right text-caption font-semibold text-text-muted">{note.length} / {NOTE_LIMIT}</span>
            </label>

            <section className="relative overflow-hidden rounded-card border border-border-subtle surface-strong p-4">
              <div className="relative z-10 grid gap-4">
                <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
                  <ItemThumbnail
                    label={itemThumbnailLabel(selectedItem.itemType)}
                    size="sm"
                    src={itemImageUrl(selectedItem)}
                    title={selectedItem.title}
                  />
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 font-display text-section-title font-semibold uppercase tracking-[0.04em] text-text-primary">
                      {selectedItem.title}
                    </h2>
                    <p className="text-body-sm text-text-muted">{itemMetadata(selectedItem)}</p>
                    <p className="mt-2 text-body-sm text-text-secondary">By {currentParticipantName}</p>
                  </div>
                </div>
                <div className="grid gap-2 text-body-sm text-text-secondary">
                  {selectedReasons.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedReasons.map((reason) => (
                        <Chip key={reason.id} selected={false} tint={tintForReason(reason.label)}>
                          {reason.label}
                        </Chip>
                      ))}
                    </div>
                  ) : null}
                  {note.trim() ? <p className="line-clamp-3">"{note.trim()}"</p> : null}
                  {!note.trim() && selectedReasons.length === 0 ? (
                    <p className="line-clamp-3 text-text-muted">{itemDescription(selectedItem) ?? "No note or reasons added."}</p>
                  ) : null}
                </div>
              </div>
            </section>

            {submitState.status === "error" ? (
              <p className="rounded-card border border-status-error bg-surface-strong p-3 text-body-sm font-medium text-status-error">
                {submitState.error}
              </p>
            ) : null}
          </form>
        </ScrollRegion>
      ) : null}
    </WizardShell>
  );
}
