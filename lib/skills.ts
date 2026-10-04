export const SKILL_IDS = [
  "lead",
  "maltese-dialect",
  "high-belt",
  "dance",
  "character",
  "ensemble",
  "boat-work",
  "whistle",
] as const;

export type SkillId = (typeof SKILL_IDS)[number];

export const SKILL_LABELS: Record<SkillId, string> = {
  lead: "Lead",
  "maltese-dialect": "Maltese dialect",
  "high-belt": "High belt",
  dance: "Dance",
  character: "Character",
  ensemble: "Ensemble",
  "boat-work": "Boat work",
  whistle: "Whistle",
};

export function isSkillId(value: string): value is SkillId {
  return (SKILL_IDS as readonly string[]).includes(value);
}
