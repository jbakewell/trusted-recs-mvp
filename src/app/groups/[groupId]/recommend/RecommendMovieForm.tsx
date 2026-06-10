"use client";

import { useActionState, useMemo, useState } from "react";
import { CompactProgress } from "@/components/app/CompactProgress";
import { CompactSummaryCard } from "@/components/app/CompactSummaryCard";
import { FixedFooterAction } from "@/components/app/FixedFooterAction";
import { FixedHeader } from "@/components/app/FixedHeader";
import { ScrollRegion } from "@/components/app/ScrollRegion";
import { useKeyboardInset } from "@/components/app/useKeyboardInset";
import { WizardShell } from "@/components/app/WizardShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { MoviePoster } from "@/components/ui/MoviePoster";
import { orderReasonOptions, type ReasonOption } from "@/lib/recommendations/reasons";
import type { TmdbMovieSearchResult } from "@/lib/tmdb/movies";
import { tintForReason, type ChipTint } from "@/lib/visual/chipTint";
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
};

type TargetType = "group" | "participant" | "later";
type WizardStep = 1 | 2 | 3 | 4;

const initialState: RecommendationFormState = { status: "idle" };

const reasonTintClasses: Record<ChipTint, string> = {
  neutral: "border-border-subtle bg-bg-muted text-text-secondary",
  rose: "border-chip-rose bg-chip-rose text-text-primary",
  teal: "border-chip-teal bg-chip-teal text-text-primary",
  green: "border-chip-green bg-chip-green text-text-primary",
  orange: "border-chip-orange bg-chip-orange text-text-primary",
  purple: "border-chip-purple bg-chip-purple text-text-primary",
  olive: "border-chip-olive bg-chip-olive text-text-primary",
};

const reasonAccentClasses: Record<ChipTint, string> = {
  neutral: "bg-text-muted",
  rose: "bg-accent",
  teal: "bg-accent-teal",
  green: "bg-accent-green",
  orange: "bg-accent-orange",
  purple: "bg-accent-purple",
  olive: "bg-accent-olive",
};

function movieMetadata(movie: TmdbMovieSearchResult) {
  return [movie.releaseYear ?? "Year unknown", movie.genreKeys.slice(0, 2).join(", ")].filter(Boolean).join(" - ");
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

function SummaryPoster({ movie }: { movie: TmdbMovieSearchResult }) {
  return <MoviePoster className="w-[52px]" size="sm" src={movie.posterUrl ?? undefined} title={movie.title} />;
}

export function RecommendMovieForm({
  groupId,
  groupName,
  currentParticipantName,
  participants,
  reasons,
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
  const [selectedReasonId, setSelectedReasonId] = useState("");
  const [note, setNote] = useState("");

  const orderedReasons = useMemo(
    () => orderReasonOptions(reasons, selectedMovie?.genreKeys ?? []),
    [reasons, selectedMovie?.genreKeys],
  );
  const selectedReason = orderedReasons.find((reason) => reason.id === selectedReasonId) ?? reasons.find((reason) => reason.id === selectedReasonId);
  const canContinueTarget = targetType !== "participant" || selectedParticipantIds.length > 0;
  const targetLabel = selectedTargetLabel(targetType, participants, selectedParticipantIds);

  function selectMovie(movie: TmdbMovieSearchResult) {
    setSelectedMovie(movie);
    setSelectedReasonId("");
    setStep(2);
  }

  function toggleParticipant(participantId: string) {
    setSelectedParticipantIds((ids) =>
      ids.includes(participantId) ? ids.filter((id) => id !== participantId) : [...ids, participantId],
    );
  }

  const selectedMovieSummary =
    selectedMovie ? (
      <CompactSummaryCard
        action={
          <button className="text-caption font-bold uppercase tracking-[0.08em] text-accent" onClick={() => setStep(1)} type="button">
            Change
          </button>
        }
        label="Selected movie"
        metadata={movieMetadata(selectedMovie)}
        poster={<SummaryPoster movie={selectedMovie} />}
        title={selectedMovie.title}
      />
    ) : null;

  const footer =
    step === 2 ? (
      <FixedFooterAction
        primary={
          <Button className="w-full" disabled={!canContinueTarget} onClick={() => setStep(3)} type="button">
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
          <Button className="w-full" disabled={!selectedReasonId} onClick={() => setStep(4)} type="button">
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
          <Button className="w-full" disabled={isSubmitting} form="recommendation-review-form" type="submit">
            {isSubmitting ? "Saving..." : "Save recommendation"}
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
      footer={footer}
      header={<FixedHeader leftAction={{ href: `/groups/${groupId}`, label: "Back to group" }} subtitle={groupName} title="Add recommendation" />}
      progress={<CompactProgress currentStep={step} totalSteps={4} />}
    >
      {step === 1 ? (
        <MovieSearchForm onSelectMovie={selectMovie} />
      ) : null}

      {step === 2 && selectedMovie ? (
        <ScrollRegion className="grid content-start gap-4 p-4">
          {selectedMovieSummary}
          <section className="grid gap-3">
            <div>
              <p className="metadata-label text-accent">Choose target</p>
              <h2 className="section-title mt-1">Who is it for?</h2>
            </div>
            <div className="grid gap-2">
              {[
                { value: "group", label: "Everyone in the group" },
                { value: "participant", label: "Specific people" },
                { value: "later", label: "Save for later" },
              ].map((option) => (
                <label
                  className={`flex min-h-[52px] items-center gap-3 border px-3 text-body-sm font-semibold text-text-primary ${
                    targetType === option.value ? "border-accent bg-accent-soft/60" : "border-border-subtle bg-bg-surface"
                  }`}
                  key={option.value}
                >
                  <input
                    checked={targetType === option.value}
                    name="targetTypeControl"
                    onChange={() => setTargetType(option.value as TargetType)}
                    type="radio"
                    value={option.value}
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {targetType === "participant" ? (
              <div className="grid max-h-56 gap-2 overflow-y-auto overscroll-contain">
                {participants.length > 0 ? (
                  participants.map((participant) => (
                    <label
                      className="flex min-h-11 items-center gap-3 border border-border-subtle bg-bg-surface px-3 text-body-sm font-semibold text-text-primary"
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
                  <p className="border border-border-subtle bg-bg-surface p-3 text-body-sm text-text-secondary">
                    There are no other people in this group yet.
                  </p>
                )}
              </div>
            ) : null}
            <label className="grid gap-2 pt-2 text-body-sm font-semibold text-text-primary">
              Add a note <span className="font-normal text-text-muted">(optional)</span>
              <textarea
                className="min-h-[116px] resize-none border border-border-subtle bg-bg-surface p-3 text-body text-text-primary placeholder:text-text-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                maxLength={280}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Why should they watch it?"
                value={note}
              />
              <span className="text-right text-caption font-semibold text-text-muted">{note.length} / 280</span>
            </label>
          </section>
        </ScrollRegion>
      ) : null}

      {step === 3 && selectedMovie ? (
        <ScrollRegion className="grid content-start gap-4 p-4">
          {selectedMovieSummary}
          <section className="grid gap-3">
            <div>
              <p className="metadata-label text-accent">Choose reason</p>
              <h2 className="section-title mt-1">Why recommend it?</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {orderedReasons.map((reason) => {
                const tint = tintForReason(reason.label);
                const selected = selectedReasonId === reason.id;

                return (
                  <label
                    className={`grid aspect-square min-h-[86px] cursor-pointer place-items-center border p-2 text-center text-[10px] font-bold uppercase leading-tight tracking-[0.05em] transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus-ring ${
                      selected ? "border-accent bg-accent text-text-inverse" : reasonTintClasses[tint]
                    }`}
                    key={reason.id}
                  >
                    <input
                      checked={selected}
                      className="sr-only"
                      name="reasonIdControl"
                      onChange={() => setSelectedReasonId(reason.id)}
                      type="radio"
                      value={reason.id}
                    />
                    <span
                      aria-hidden="true"
                      className={`h-2 w-10 rounded-full ${selected ? "bg-text-inverse" : reasonAccentClasses[tint]}`}
                    />
                    <span className="max-w-full break-words">{reason.label}</span>
                  </label>
                );
              })}
            </div>
          </section>
        </ScrollRegion>
      ) : null}

      {step === 4 && selectedMovie && selectedReason ? (
        <ScrollRegion className="grid content-start gap-4 p-4">
          <form action={submitAction} className="grid gap-4" id="recommendation-review-form">
            <input name="groupId" type="hidden" value={groupId} />
            <input name="tmdbId" type="hidden" value={selectedMovie.tmdbId} />
            <input name="targetType" type="hidden" value={targetType} />
            <input name="reasonId" type="hidden" value={selectedReason.id} />
            <input name="note" type="hidden" value={note} />
            {selectedParticipantIds.map((participantId) => (
              <input key={participantId} name="targetParticipantIds" type="hidden" value={participantId} />
            ))}

            <section className="relative overflow-hidden border border-border-subtle bg-bg-surface p-4">
              <div className="relative z-10 grid gap-4">
                <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3">
                  <MoviePoster size="sm" src={selectedMovie.posterUrl ?? undefined} title={selectedMovie.title} />
                  <div className="min-w-0">
                    <p className="metadata-label text-accent">Review</p>
                    <h2 className="line-clamp-2 font-display text-section-title font-semibold uppercase tracking-[0.04em] text-text-primary">
                      {selectedMovie.title}
                    </h2>
                    <p className="text-body-sm text-text-muted">{movieMetadata(selectedMovie)}</p>
                  </div>
                </div>
                <div className="grid gap-2 text-body-sm text-text-secondary">
                  <p><span className="font-bold text-text-primary">Target:</span> {targetLabel}</p>
                  <p><span className="font-bold text-text-primary">Reason:</span> {selectedReason.label}</p>
                  {note.trim() ? <p className="line-clamp-3"><span className="font-bold text-text-primary">Note:</span> {note.trim()}</p> : null}
                  <p><span className="font-bold text-text-primary">Recommended by:</span> {currentParticipantName}</p>
                </div>
                <Chip className="w-fit" selected={false} tint={tintForReason(selectedReason.label)}>
                  {selectedReason.label}
                </Chip>
              </div>
            </section>

            {submitState.status === "error" ? (
              <p className="border border-status-error bg-bg-surface p-3 text-body-sm font-medium text-status-error">
                {submitState.error}
              </p>
            ) : null}
          </form>
        </ScrollRegion>
      ) : null}
    </WizardShell>
  );
}
