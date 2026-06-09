"use client";

import { useActionState } from "react";
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
};

const initialState: ClaimInviteState = {};

export function JoinInviteForm({ token, groupName, proposedParticipant }: JoinInviteFormProps) {
  const [state, formAction, isPending] = useActionState<ClaimInviteState, FormData>(claimInviteAction, initialState);

  return (
    <Card className="grid gap-5">
      <div className="grid gap-2">
        <p className="metadata-label text-accent">Private invite</p>
        <h1 className="section-title">Join {groupName}</h1>
        <p className="text-body-sm text-text-secondary">
          You&apos;ve been invited to join {groupName}. Continue as {proposedParticipant.displayName} to see and share
          movie recommendations.
        </p>
      </div>

      <form action={formAction} className="grid gap-4">
        <input name="token" type="hidden" value={token} />

        {state.error ? <p className="text-body-sm font-medium text-status-error">{state.error}</p> : null}

        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Joining..." : `Continue as ${proposedParticipant.displayName}`}
        </Button>
      </form>

      <ButtonLink className="w-full sm:w-fit" href="/" variant="text">
        Back to home
      </ButtonLink>
    </Card>
  );
}
