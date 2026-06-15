"use client";

import type { FormEvent } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { addMemberAction, archiveGroupAction, type AddMemberState, type ArchiveGroupState } from "./actions";

const initialAddMemberState: AddMemberState = { status: "idle" };
const initialArchiveGroupState: ArchiveGroupState = { status: "idle" };

export function AddMemberForm({ groupId }: { groupId: string }) {
  const [state, formAction, isPending] = useActionState<AddMemberState, FormData>(addMemberAction, initialAddMemberState);

  return (
    <Card className="grid gap-3">
      <div className="grid gap-1">
        <p className="metadata-label text-accent">Add member</p>
        <p className="text-body-sm text-text-secondary">Add someone to this group, then share their invite from the member list.</p>
      </div>
      <form action={formAction} className="grid gap-3">
        <input name="groupId" type="hidden" value={groupId} />
        <Input
          error={state.status === "error" ? state.error : undefined}
          label="Display name"
          maxLength={40}
          name="displayName"
          placeholder="User Name 1"
          required
        />
        <Button className="w-full" disabled={isPending} type="submit">
          {isPending ? "Adding..." : "Add member"}
        </Button>
      </form>
      {state.status === "success" && state.message ? (
        <p className="text-body-sm font-semibold text-status-success">{state.message}</p>
      ) : null}
    </Card>
  );
}

export function ArchiveGroupForm({ groupId }: { groupId: string }) {
  const [state, formAction, isPending] = useActionState<ArchiveGroupState, FormData>(
    archiveGroupAction,
    initialArchiveGroupState,
  );

  function confirmArchive(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm("Archive this group? It will disappear from your active groups, but its data will be kept.")) {
      event.preventDefault();
    }
  }

  return (
    <Card className="grid gap-3">
      <div className="grid gap-1">
        <p className="metadata-label text-text-muted">Archive group</p>
        <p className="text-body-sm text-text-secondary">Hide this group from active use while keeping its history intact.</p>
      </div>
      <form action={formAction} className="grid gap-2" onSubmit={confirmArchive}>
        <input name="groupId" type="hidden" value={groupId} />
        <Button className="w-full" disabled={isPending} type="submit" variant="secondary">
          {isPending ? "Archiving..." : "Archive group"}
        </Button>
      </form>
      {state.status === "error" && state.error ? (
        <p className="text-body-sm font-medium text-status-error">{state.error}</p>
      ) : null}
    </Card>
  );
}
