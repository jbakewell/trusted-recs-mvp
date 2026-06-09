"use client";

import { useActionState, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { createGroupAction, type CreateGroupState } from "./actions";

const initialState: CreateGroupState = {};

export function CreateGroupForm() {
  const [state, formAction, isPending] = useActionState<CreateGroupState, FormData>(createGroupAction, initialState);
  const [participantFields, setParticipantFields] = useState(["", ""]);

  return (
    <form action={formAction} className="grid gap-5">
      <Card className="grid gap-5">
        <div className="grid gap-2">
          <p className="metadata-label text-accent">Milestone 3</p>
          <h1 className="section-title">Create your private group</h1>
          <p className="text-body-sm text-text-secondary">
            No accounts or passwords. Start with the people whose film recommendations you want to remember.
          </p>
        </div>

        <Input
          autoComplete="off"
          error={state.errors?.groupName}
          label="Group name"
          name="groupName"
          placeholder="Family film night"
          required
        />
        <Input
          autoComplete="name"
          error={state.errors?.creatorName}
          label="Your display name"
          name="creatorName"
          placeholder="Sarah"
          required
        />

        <fieldset className="grid gap-3">
          <div className="grid gap-1">
            <legend className="text-body-sm font-semibold text-text-primary">Other participants</legend>
            <p className="text-caption text-text-muted">Add names now, or leave blanks and invite them later.</p>
          </div>
          <div className="grid gap-3">
            {participantFields.map((value, index) => (
              <Input
                autoComplete="off"
                defaultValue={value}
                key={index}
                label={`Participant ${index + 1}`}
                name="participantNames"
                placeholder={index === 0 ? "Dad" : "Tom"}
              />
            ))}
          </div>
          {state.errors?.participantNames ? (
            <p className="text-body-sm font-medium text-status-error">{state.errors.participantNames}</p>
          ) : null}
          <Button
            className="w-full border-dashed sm:w-fit"
            onClick={() => setParticipantFields((fields) => [...fields, ""])}
            type="button"
            variant="secondary"
          >
            Add another name
          </Button>
        </fieldset>
      </Card>

      <div className="sticky bottom-0 -mx-4 border-t border-border-subtle bg-bg-base/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <div className="grid gap-3 sm:flex sm:items-center">
          <Button className="w-full sm:w-fit" disabled={isPending} type="submit">
            {isPending ? "Creating…" : "Create group"}
          </Button>
          <ButtonLink className="w-full sm:w-fit" href="/" variant="secondary">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </form>
  );
}
