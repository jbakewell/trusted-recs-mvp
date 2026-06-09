"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createOrRegenerateInviteAction, revokeInviteAction, type InviteActionState } from "./invite-actions";

type InviteParticipant = {
  id: string;
  displayName: string;
  role: "admin" | "member";
  hasActiveInvite: boolean;
};

type InvitePanelProps = {
  participants: InviteParticipant[];
};

const initialState: InviteActionState = {};

function InviteRow({ participant }: { participant: InviteParticipant }) {
  const [generateState, generateAction, isGenerating] = useActionState<InviteActionState, FormData>(
    createOrRegenerateInviteAction,
    initialState,
  );
  const [revokeState, revokeAction, isRevoking] = useActionState<InviteActionState, FormData>(revokeInviteAction, initialState);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [hasActiveInvite, setHasActiveInvite] = useState(participant.hasActiveInvite);

  useEffect(() => {
    if (generateState.invitePath) {
      setHasActiveInvite(true);
      setCopyMessage(null);
    }
  }, [generateState.invitePath]);

  useEffect(() => {
    if (revokeState.message) {
      setHasActiveInvite(false);
      setCopyMessage(null);
    }
  }, [revokeState.message]);

  const absoluteInviteUrl = useMemo(() => {
    if (!generateState.invitePath || !hasActiveInvite || typeof window === "undefined") {
      return null;
    }

    return new URL(generateState.invitePath, window.location.origin).toString();
  }, [generateState.invitePath, hasActiveInvite]);

  async function copyInvite() {
    if (!absoluteInviteUrl) {
      return;
    }

    await navigator.clipboard.writeText(absoluteInviteUrl);
    setCopyMessage("Invite link copied");
  }

  return (
    <div className="grid gap-3 border border-border-subtle bg-bg-muted p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-body-sm font-bold text-text-primary">{participant.displayName}</p>
          <p className="metadata-label text-text-muted">
            {participant.role === "admin" ? "Admin" : "Member"} · {hasActiveInvite ? "Active invite" : "No active invite"}
          </p>
        </div>
      </div>

      {generateState.error || revokeState.error ? (
        <p className="text-body-sm font-medium text-status-error">{generateState.error ?? revokeState.error}</p>
      ) : null}
      {generateState.message || revokeState.message || copyMessage ? (
        <p className="text-body-sm font-medium text-text-secondary">{copyMessage ?? revokeState.message ?? generateState.message}</p>
      ) : null}

      {absoluteInviteUrl ? (
        <div className="grid gap-2">
          <p className="break-all border border-border-subtle bg-bg-surface p-2 text-caption text-text-secondary">{absoluteInviteUrl}</p>
          <Button className="w-full" onClick={copyInvite} type="button" variant="secondary">
            Copy invite link
          </Button>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <form action={generateAction}>
          <input name="participantId" type="hidden" value={participant.id} />
          <Button className="w-full" disabled={isGenerating} type="submit">
            {hasActiveInvite ? "Regenerate" : "Generate link"}
          </Button>
        </form>
        <form action={revokeAction}>
          <input name="participantId" type="hidden" value={participant.id} />
          <Button className="w-full" disabled={isRevoking || !hasActiveInvite} type="submit" variant="secondary">
            Revoke
          </Button>
        </form>
      </div>
    </div>
  );
}

export function InvitePanel({ participants }: InvitePanelProps) {
  return (
    <Card className="grid gap-4">
      <div className="grid gap-1">
        <p className="metadata-label text-accent">Invite links</p>
        <h2 className="section-title">Share the group</h2>
        <p className="text-body-sm text-text-secondary">
          Generate a one-person invite, copy it into WhatsApp or messages, and revoke or replace it later.
        </p>
      </div>
      <div className="grid gap-3">
        {participants.map((participant) => (
          <InviteRow key={participant.id} participant={participant} />
        ))}
      </div>
    </Card>
  );
}
