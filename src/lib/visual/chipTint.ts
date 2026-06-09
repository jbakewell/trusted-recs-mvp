export type ChipTint = "neutral" | "rose" | "teal" | "green" | "orange" | "purple" | "olive";

export function tintForReason(label: string): ChipTint {
  const value = label.toLocaleLowerCase();

  if (/(visual|beautiful|stunning|spectacular|animation)/.test(value)) {
    return "teal";
  }

  if (/(comfort|family|kids|gentle|feel-good|uplifting|warm|charming)/.test(value)) {
    return "green";
  }

  if (/(escape|soundtrack|adventure|journey|energy|joyful|location)/.test(value)) {
    return "orange";
  }

  if (/(thrill|brutal|strange|weird|dark|horror|tense|disturb|mindbend)/.test(value)) {
    return "purple";
  }

  if (/(classic|atmospheric|slow burn|history|western|epic)/.test(value)) {
    return "olive";
  }

  if (/(witty|smart|emotional|romantic|character|story|writing)/.test(value)) {
    return "rose";
  }

  return "neutral";
}
