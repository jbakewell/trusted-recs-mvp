"use client";

import type { FormEvent } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { musicServiceOptions, type MusicService } from "@/lib/music/serviceLinks";
import {
  addMemberAction,
  archiveGroupAction,
  updatePreferredMusicServiceAction,
  type AddMemberState,
  type ArchiveGroupState,
  type PreferredMusicServiceState,
} from "./actions";

const initialAddMemberState: AddMemberState = { status: "idle" };
const initialArchiveGroupState: ArchiveGroupState = { status: "idle" };
const initialPreferredMusicServiceState: PreferredMusicServiceState = { status: "idle" };

export function PreferredMusicServiceForm({
  groupId,
  preferredMusicService,
}: {
  groupId: string;
  preferredMusicService: MusicService;
}) {
  const [state, formAction, isPending] = useActionState<PreferredMusicServiceState, FormData>(
    updatePreferredMusicServiceAction,
    initialPreferredMusicServiceState,
  );

  return (
    <Card className="grid gap-3">
      <div className="grid gap-1">
        <p className="metadata-label text-accent">Preferred music service</p>
        <p className="text-body-sm text-text-secondary">Used to show the best music link for album recommendations.</p>
      </div>
      <form action={formAction} className="grid gap-3">
        <input name="groupId" type="hidden" value={groupId} />
        <label className="grid gap-2 text-body-sm font-semibold text-text-primary" htmlFor="preferred-music-service">
          Music service
          <select
            className="min-h-[46px] w-full rounded-sm border border-border-strong bg-surface-strong px-3 text-body text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
            defaultValue={preferredMusicService}
            id="preferred-music-service"
            name="preferredMusicService"
          >
            {musicServiceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Button className="w-full" disabled={isPending} type="submit" variant="secondary">
          {isPending ? "Saving..." : "Save music preference"}
        </Button>
      </form>
      {state.status === "success" && state.message ? (
        <p className="text-body-sm font-semibold text-status-success">{state.message}</p>
      ) : null}
      {state.status === "error" && state.error ? (
        <p className="text-body-sm font-medium text-status-error">{state.error}</p>
      ) : null}
    </Card>
  );
}

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
