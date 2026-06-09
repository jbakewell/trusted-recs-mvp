import { validateCreateGroup } from "./validation";

function formDataFrom(entries: Record<string, string | string[]>) {
  const formData = new FormData();

  Object.entries(entries).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
      return;
    }

    formData.set(key, value);
  });

  return formData;
}

describe("validateCreateGroup", () => {
  it("accepts a group creator and participant names", () => {
    const result = validateCreateGroup(
      formDataFrom({
        groupName: "Family film night",
        creatorName: "Sarah",
        participantNames: ["Dad", "Tom"],
      }),
    );

    expect(result).toEqual({
      ok: true,
      value: {
        groupName: "Family film night",
        creatorName: "Sarah",
        participantNames: ["Dad", "Tom"],
      },
    });
  });

  it("returns friendly errors for missing required values", () => {
    const result = validateCreateGroup(formDataFrom({ groupName: "", creatorName: "", participantNames: [] }));

    expect(result).toEqual({
      ok: false,
      errors: {
        groupName: "Give your group a name.",
        creatorName: "Add the name friends will recognise.",
      },
    });
  });

  it("deduplicates blank creator and participant names", () => {
    const result = validateCreateGroup(
      formDataFrom({
        groupName: "  Friday   films ",
        creatorName: "Sarah",
        participantNames: ["Sarah", " dad ", "Dad", ""],
      }),
    );

    expect(result).toEqual({
      ok: true,
      value: {
        groupName: "Friday films",
        creatorName: "Sarah",
        participantNames: ["dad"],
      },
    });
  });
});
