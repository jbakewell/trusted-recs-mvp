"use client";

import { useState, useTransition } from "react";
import { AvatarBadge } from "@/components/ui/AvatarBadge";
import { Button } from "@/components/ui/Button";
import { createOrRegenerateInviteAction, type InviteActionState } from "./invite-actions";

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
  return `${role === "admin" ? "Admin" : "Member"}${hasActiveInvite ? " - invite ready" : ""}`;
}

function InviteRow({ canManageInvites, participant }: { canManageInvites: boolean; participant: InviteParticipant }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [hasActiveInvite, setHasActiveInvite] = useState(participant.hasActiveInvite);

  async function copyInvite(inviteUrl: string) {
    if (!inviteUrl || typeof window === "undefined") {
      return;
    }

    await navigator.clipboard.writeText(inviteUrl);
  }

  async function shareInvite(inviteUrl: string) {
    if (!inviteUrl || typeof window === "undefined") {
      return;
    }

    const shareData = {
      title: "Join my Trusted Recs group",
      text: `${participant.displayName}, join our Trusted Recs group.`,
      url: inviteUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await copyInvite(inviteUrl);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      await copyInvite(inviteUrl);
    }
  }

  function handleShareInvite() {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("participantId", participant.id);
      formData.set("origin", window.location.origin);

      const result = await createOrRegenerateInviteAction(initialState, formData);

      if (result.error || (!result.inviteUrl && !result.invitePath)) {
        setError(result.error ?? "Invite link could not be created.");
        return;
      }

      setHasActiveInvite(true);
      await shareInvite(result.inviteUrl ?? new URL(result.invitePath ?? "", window.location.origin).toString());
    });
  }

  return (
    <div className="grid gap-2 rounded-card border border-border-subtle surface-strong p-3 shadow-subtle">
      <div className="flex items-center gap-3">
        <AvatarBadge name={participant.displayName} seed={seedToNumber(participant.avatarSeed)} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm font-bold text-text-primary">{participant.displayName}</p>
          <p className="metadata-label text-text-muted">{inviteStatus(participant.role, hasActiveInvite)}</p>
        </div>
        {canManageInvites ? (
          <Button className="min-w-[104px] px-3 text-[11px]" disabled={isPending} onClick={handleShareInvite} type="button">
            {isPending ? "Preparing..." : "Share invite"}
          </Button>
        ) : null}
      </div>

      {error ? <p className="text-body-sm font-medium text-status-error">{error}</p> : null}
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
