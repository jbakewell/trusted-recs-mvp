export type CreateGroupInput = {
  groupName: string;
  creatorName: string;
  participantNames: string[];
};

export type CreateGroupValidation =
  | {
      ok: true;
      value: CreateGroupInput;
    }
  | {
      ok: false;
      errors: {
        groupName?: string;
        creatorName?: string;
        participantNames?: string;
      };
    };

const MAX_GROUP_NAME_LENGTH = 80;
const MAX_DISPLAY_NAME_LENGTH = 40;
const MAX_PARTICIPANTS = 20;

function cleanName(value: FormDataEntryValue | string | null) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function uniqueNames(names: string[]) {
  const seen = new Set<string>();

  return names.filter((name) => {
    const key = name.toLocaleLowerCase();

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function validateCreateGroup(formData: FormData): CreateGroupValidation {
  const groupName = cleanName(formData.get("groupName"));
  const creatorName = cleanName(formData.get("creatorName"));
  const participantNames = uniqueNames(
    formData
      .getAll("participantNames")
      .map(cleanName)
      .filter((name) => name.length > 0 && name.toLocaleLowerCase() !== creatorName.toLocaleLowerCase()),
  );

  const errors: NonNullable<Extract<CreateGroupValidation, { ok: false }>["errors"]> = {};

  if (groupName.length === 0) {
    errors.groupName = "Give your group a name.";
  } else if (groupName.length > MAX_GROUP_NAME_LENGTH) {
    errors.groupName = `Keep the group name to ${MAX_GROUP_NAME_LENGTH} characters or fewer.`;
  }

  if (creatorName.length === 0) {
    errors.creatorName = "Add the name friends will recognise.";
  } else if (creatorName.length > MAX_DISPLAY_NAME_LENGTH) {
    errors.creatorName = `Keep display names to ${MAX_DISPLAY_NAME_LENGTH} characters or fewer.`;
  }

  const tooLongName = participantNames.find((name) => name.length > MAX_DISPLAY_NAME_LENGTH);
  const totalParticipants = participantNames.length + (creatorName.length > 0 ? 1 : 0);

  if (tooLongName) {
    errors.participantNames = `Keep participant names to ${MAX_DISPLAY_NAME_LENGTH} characters or fewer.`;
  } else if (totalParticipants > MAX_PARTICIPANTS) {
    errors.participantNames = `Milestone 3 groups can include up to ${MAX_PARTICIPANTS} people.`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      groupName,
      creatorName,
      participantNames,
    },
  };
}
