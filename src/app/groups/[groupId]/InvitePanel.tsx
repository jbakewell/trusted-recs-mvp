"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { Button } from "@/components/ui/Button";
import { createOrRegenerateInviteAction, revokeInviteAction, type InviteActionState } from "./invite-actions";

type InviteParticipant = {
  id: string;
  displayName: string;
  avatarSeed: string;
  role: "admin" | "member";
  hasActiveInvite: boolean;
};

type InvitePanelProps = {
  canManageInvites: boolean;
  participants: InviteParticipant[];
};

const initialState: InviteActionState = {};

function seedToNumber(seed: string) {
  return Number.parseInt(seed.slice(0, 8), 16) || 0;
}

function inviteStatus(role: InviteParticipant["role"], hasActiveInvite: boolean) {
  return `${role === "admin" ? "Admin" : "Member"} - ${hasActiveInvite ? "Active invite" : "No active invite"}`;
}

function InviteRow({ canManageInvites, participant }: { canManageInvites: boolean; participant: InviteParticipant }) {
  const [generateState, generateAction, isGenerating] = useActionState<InviteActionState, FormData>(
    createOrRegenerateInviteAction,
    initialState,
  );
  const [revokeState, revokeAction, isRevoking] = useActionState<InviteActionState, FormData>(revokeInviteAction, initialState);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [hasActiveInvite, setHasActiveInvite] = useState(participant.hasActiveInvite);

  useEffect(() => {
    if (generateState.invitePath) {
      setHasActiveInvite(true);
      setShareMessage("Invite link ready to share.");
    }
  }, [generateState.invitePath]);

  useEffect(() => {
    if (revokeState.message) {
      setHasActiveInvite(false);
      setShareMessage(null);
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
    setShareMessage("Invite link copied.");
  }

  async function shareInvite() {
    if (!absoluteInviteUrl) {
      return;
    }

    const shareData = {
      title: "Join my Trusted Recs group",
      text: `${participant.displayName}, join our Trusted Recs group.`,
      url: absoluteInviteUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareMessage("Invite shared.");
        return;
      }

      await copyInvite();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      await copyInvite();
    }
  }

  return (
    <div className="grid gap-3 border border-border-subtle bg-bg-muted p-3">
      <div className="flex items-center gap-3">
        <AvatarBadge name={participant.displayName} seed={seedToNumber(participant.avatarSeed)} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm font-bold text-text-primary">{participant.displayName}</p>
          <p className="metadata-label text-text-muted">{inviteStatus(participant.role, hasActiveInvite)}</p>
        </div>
      </div>

      {generateState.error || revokeState.error ? (
        <p className="text-body-sm font-medium text-status-error">{generateState.error ?? revokeState.error}</p>
      ) : null}
      {generateState.message || revokeState.message || shareMessage ? (
        <p className="text-body-sm font-medium text-text-secondary">{shareMessage ?? revokeState.message ?? generateState.message}</p>
      ) : null}

      {canManageInvites ? (
        <div className="grid gap-2">
          {absoluteInviteUrl ? (
            <>
              <Button className="w-full" onClick={shareInvite} type="button">
                Share invite
              </Button>
              <Button className="w-full" onClick={copyInvite} type="button" variant="secondary">
                Copy link
              </Button>
            </>
          ) : (
            <form action={generateAction}>
              <input name="participantId" type="hidden" value={participant.id} />
              <Button className="w-full" disabled={isGenerating} type="submit">
                {hasActiveInvite ? "Replace share link" : "Create share link"}
              </Button>
            </form>
          )}
          <form action={revokeAction}>
            <input name="participantId" type="hidden" value={participant.id} />
            <Button className="w-full" disabled={isRevoking || !hasActiveInvite} type="submit" variant="secondary">
              Revoke invite
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export function InvitePanel({ canManageInvites, participants }: InvitePanelProps) {
  return (
    <div className="grid gap-3">
      {participants.map((participant) => (
        <InviteRow canManageInvites={canManageInvites} key={participant.id} participant={participant} />
      ))}
    </div>
  );
}
