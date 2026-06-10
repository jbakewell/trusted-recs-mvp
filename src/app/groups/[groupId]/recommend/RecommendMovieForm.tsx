"use client";

import { useActionState, useMemo, useState } from "react";
import { FixedFooterAction } from "@/components/app/FixedFooterAction";
import { FixedHeader } from "@/components/app/FixedHeader";
import { NumberedProgress } from "@/components/app/NumberedProgress";
import { ScrollRegion } from "@/components/app/ScrollRegion";
import { useKeyboardInset } from "@/components/app/useKeyboardInset";
import { WizardShell } from "@/components/app/WizardShell";
import { Button } from "@/components/ui/Button";
import { Chip, ChipButton } from "@/components/ui/Chip";
import { MoviePoster } from "@/components/ui/MoviePoster";
import { OverprintBackground } from "@/components/visual/OverprintBackground";
import { orderReasonOptions, type ReasonOption } from "@/lib/recommendations/reasons";
import type { TmdbMovieSearchResult } from "@/lib/tmdb/movies";
import { tintForReason } from "@/lib/visual/chipTint";
import { MovieSearchForm } from "../movies/search/MovieSearchForm";
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
};

type TargetType = "group" | "participant" | "later";
type WizardStep = 1 | 2 | 3 | 4;

const NOTE_LIMIT = 240;
const initialState: RecommendationFormState = { status: "idle" };

function movieMetadata(movie: TmdbMovieSearchResult) {
  return [movie.releaseYear ?? "Year unknown", movie.genreKeys.slice(0, 3).join(", ")].filter(Boolean).join(" - ");
}

function selectedTargetLabel(targetType: TargetType, participants: ParticipantOption[], selectedParticipantIds: string[]) {
  if (targetType === "group") {
    return "For everyone";
  }

  if (targetType === "later") {
    return "Saved for later";
  }

  const names = participants
    .filter((participant) => selectedParticipantIds.includes(participant.id))
    .map((participant) => participant.displayName);

  return names.length > 0 ? `For ${names.join(", ")}` : "For specific people";
}

function SelectedMovieSummary({ movie, onChange }: { movie: TmdbMovieSearchResult; onChange: () => void }) {
  return (
    <div className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 rounded-card border border-border-subtle surface-strong p-3">
      <MoviePoster className="w-[52px]" size="sm" src={movie.posterUrl ?? undefined} title={movie.title} />
      <div className="min-w-0">
        <p className="metadata-label text-accent">Selected movie</p>
        <h2 className="line-clamp-2 font-display text-[20px] font-semibold uppercase leading-none tracking-[0.04em] text-text-primary">
          {movie.title}
        </h2>
        <p className="truncate text-body-sm text-text-muted">{movieMetadata(movie)}</p>
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
  participants,
  reasons,
  backgroundIndex,
}: RecommendMovieFormProps) {
  useKeyboardInset();

  const [submitState, submitAction, isSubmitting] = useActionState<RecommendationFormState, FormData>(
    createRecommendationAction,
    initialState,
  );
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedMovie, setSelectedMovie] = useState<TmdbMovieSearchResult | null>(null);
  const [targetType, setTargetType] = useState<TargetType>("group");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [selectedReasonIds, setSelectedReasonIds] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const orderedReasons = useMemo(
    () => orderReasonOptions(reasons, selectedMovie?.genreKeys ?? []),
    [reasons, selectedMovie?.genreKeys],
  );
  const selectedReasons = selectedReasonIds
    .map((reasonId) => orderedReasons.find((reason) => reason.id === reasonId) ?? reasons.find((reason) => reason.id === reasonId))
    .filter((reason): reason is ReasonOption => Boolean(reason));
  const targetLabel = selectedTargetLabel(targetType, participants, selectedParticipantIds);
  const canContinueAudience = targetType !== "participant" || selectedParticipantIds.length > 0;

  function selectMovie(movie: TmdbMovieSearchResult) {
    setSelectedMovie(movie);
    setSelectedReasonIds([]);
    setStep(2);
  }

  function toggleParticipant(participantId: string) {
    setSelectedParticipantIds((ids) =>
      ids.includes(participantId) ? ids.filter((id) => id !== participantId) : [...ids, participantId],
    );
  }

  function chooseTarget(nextTargetType: TargetType) {
    setTargetType(nextTargetType);
    if (nextTargetType !== "participant") {
      setSelectedParticipantIds([]);
    }
  }

  function toggleReason(reasonId: string) {
    setSelectedReasonIds((ids) =>
      ids.includes(reasonId) ? ids.filter((id) => id !== reasonId) : [...ids, reasonId],
    );
  }

  const selectedMovieSummary = selectedMovie ? (
    <SelectedMovieSummary movie={selectedMovie} onChange={() => setStep(1)} />
  ) : null;

  const footer =
    step === 2 ? (
      <FixedFooterAction
        primary={
          <Button className="w-full" onClick={() => setStep(3)} type="button">
            Continue
          </Button>
        }
        secondary={
          <Button onClick={() => setStep(1)} type="button" variant="text">
            Back
          </Button>
        }
      />
    ) : step === 3 ? (
      <FixedFooterAction
        primary={
          <Button className="w-full" disabled={!canContinueAudience} onClick={() => setStep(4)} type="button">
            Continue
          </Button>
        }
        secondary={
          <Button onClick={() => setStep(2)} type="button" variant="text">
            Back
          </Button>
        }
      />
    ) : step === 4 ? (
      <FixedFooterAction
        primary={
          <Button className="w-full" disabled={isSubmitting || selectedReasonIds.length === 0} form="recommendation-review-form" type="submit">
            {isSubmitting ? "Sharing..." : "Share with group"}
          </Button>
        }
        secondary={
          <Button onClick={() => setStep(3)} type="button" variant="text">
            Back
          </Button>
        }
      />
    ) : null;

  return (
    <WizardShell
      background={<OverprintBackground backgroundIndex={backgroundIndex} density="medium" route="recommend" />}
      footer={footer}
      header={<FixedHeader leftAction={{ href: `/groups/${groupId}`, label: "Back to group" }} subtitle={groupName} title="Add recommendation" />}
      progress={<NumberedProgress currentStep={step} totalSteps={4} />}
    >
      {step === 1 ? <MovieSearchForm onSelectMovie={selectMovie} /> : null}

      {step === 2 && selectedMovie ? (
        <ScrollRegion className="grid content-start gap-4 p-4">
          {selectedMovieSummary}
          <section className="grid gap-3">
            <div>
              <p className="metadata-label text-accent">Step 2</p>
              <h2 className="section-title mt-1">Who is it for?</h2>
            </div>
            <div className="grid gap-2">
              {[
                { value: "group", label: "Everyone in the group" },
                { value: "participant", label: "Specific people" },
                { value: "later", label: "Save for later" },
              ].map((option) => (
                <label
                  className={`flex min-h-[56px] items-center gap-3 rounded-card border px-4 text-body-sm font-semibold text-text-primary ${
                    targetType === option.value ? "border-accent bg-chip-rose" : "border-border-subtle surface-strong"
                  }`}
                  key={option.value}
                >
                  <input
                    checked={targetType === option.value}
                    name="targetTypeControl"
                    onChange={() => chooseTarget(option.value as TargetType)}
                    type="radio"
                    value={option.value}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </section>
        </ScrollRegion>
      ) : null}

      {step === 3 && selectedMovie ? (
        <ScrollRegion className="grid content-start gap-4 p-4">
          {selectedMovieSummary}
          <section className="grid gap-3">
            <div>
              <p className="metadata-label text-accent">Step 3</p>
              <h2 className="section-title mt-1">Audience details</h2>
            </div>
            {targetType === "participant" ? (
              <div className="grid max-h-[420px] gap-2 overflow-y-auto overscroll-contain pr-1">
                {participants.length > 0 ? (
                  participants.map((participant) => (
                    <label
                      className={`flex min-h-12 items-center gap-3 rounded-card border px-3 text-body-sm font-semibold text-text-primary ${
                        selectedParticipantIds.includes(participant.id) ? "border-accent bg-chip-rose" : "border-border-subtle surface-strong"
                      }`}
                      key={participant.id}
                    >
                      <input
                        checked={selectedParticipantIds.includes(participant.id)}
                        onChange={() => toggleParticipant(participant.id)}
                        type="checkbox"
                      />
                      {participant.displayName}
                    </label>
                  ))
                ) : (
                  <p className="rounded-card border border-border-subtle surface-strong p-3 text-body-sm text-text-secondary">
                    There are no other people in this group yet.
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-card border border-border-subtle surface-strong p-4">
                <p className="metadata-label text-text-muted">Selected audience</p>
                <p className="mt-2 section-title">{targetLabel}</p>
                <p className="mt-2 text-body-sm text-text-secondary">
                  This recommendation will be filed with this audience label in the group feed.
                </p>
              </div>
            )}
          </section>
        </ScrollRegion>
      ) : null}

      {step === 4 && selectedMovie ? (
        <ScrollRegion className="grid content-start gap-4 p-4">
          <form action={submitAction} className="grid gap-4" id="recommendation-review-form">
            <input name="groupId" type="hidden" value={groupId} />
            <input name="tmdbId" type="hidden" value={selectedMovie.tmdbId} />
            <input name="targetType" type="hidden" value={targetType} />
            <input name="note" type="hidden" value={note} />
            {selectedReasonIds.map((reasonId) => (
              <input key={reasonId} name="reasonIds" type="hidden" value={reasonId} />
            ))}
            {selectedParticipantIds.map((participantId) => (
              <input key={participantId} name="targetParticipantIds" type="hidden" value={participantId} />
            ))}

            <section className="grid gap-3">
              <div>
                <p className="metadata-label text-accent">Step 4</p>
                <h2 className="section-title mt-1">Why do you recommend this?</h2>
                <p className="text-body-sm text-text-secondary">Select all that apply.</p>
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
                  <MoviePoster size="sm" src={selectedMovie.posterUrl ?? undefined} title={selectedMovie.title} />
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 font-display text-section-title font-semibold uppercase tracking-[0.04em] text-text-primary">
                      {selectedMovie.title}
                    </h2>
                    <p className="text-body-sm text-text-muted">{movieMetadata(selectedMovie)}</p>
                    <p className="mt-2 text-body-sm text-text-secondary">By {currentParticipantName}</p>
                  </div>
                </div>
                <div className="grid gap-2 text-body-sm text-text-secondary">
                  <p><span className="font-bold text-text-primary">Audience:</span> {targetLabel}</p>
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
