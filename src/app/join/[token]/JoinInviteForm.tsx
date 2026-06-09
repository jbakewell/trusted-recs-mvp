"use client";

import { useActionState, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { claimInviteAction, type ClaimInviteState } from "./actions";

type ParticipantOption = {
  id: string;
  displayName: string;
};

type JoinInviteFormProps = {
  token: string;
  groupName: string;
  proposedParticipant: ParticipantOption;
  participants: ParticipantOption[];
};

const initialState: ClaimInviteState = {};

export function JoinInviteForm({ token, groupName, proposedParticipant, participants }: JoinInviteFormProps) {
  const [state, formAction, isPending] = useActionState<ClaimInviteState, FormData>(claimInviteAction, initialState);
  const [showPicker, setShowPicker] = useState(false);

  return (
    <Card className="grid gap-5">
      <div className="grid gap-2">
        <p className="metadata-label text-accent">Private invite</p>
        <h1 className="section-title">Join {groupName}</h1>
        <p className="text-body-sm text-text-secondary">
          You’ve been invited to join {groupName}. Continue as {proposedParticipant.displayName} to see and share movie recommendations.
        </p>
      </div>

      <form action={formAction} className="grid gap-4">
        <input name="token" type="hidden" value={token} />
        {!showPicker ? <input name="participantId" type="hidden" value={proposedParticipant.id} /> : null}

        {showPicker ? (
          <label className="grid gap-2 text-body-sm font-semibold text-text-primary">
            I’m someone else
            <select
              className="min-h-[46px] w-full border border-border-strong bg-bg-surface px-3 text-body text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              defaultValue={proposedParticipant.id}
              name="participantId"
            >
              {participants.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.displayName}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {state.error ? <p className="text-body-sm font-medium text-status-error">{state.error}</p> : null}

        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Joining…" : showPicker ? "Continue" : `Continue as ${proposedParticipant.displayName}`}
        </Button>
      </form>

      <div className="grid gap-2 sm:flex sm:items-center">
        <Button className="w-full sm:w-fit" onClick={() => setShowPicker((value) => !value)} type="button" variant="secondary">
          {showPicker ? `Use ${proposedParticipant.displayName}` : "I’m someone else"}
        </Button>
        <ButtonLink className="w-full sm:w-fit" href="/" variant="text">
          Back to home
        </ButtonLink>
      </div>
    </Card>
  );
}
