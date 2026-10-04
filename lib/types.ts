import type { SkillId } from "./skills";

export const CALL_SHEET_STATUSES = [
  "draft",
  "stageManagerReview",
  "posted",
  "struck",
] as const;

export type CallSheetStatus = (typeof CALL_SHEET_STATUSES)[number];

export const LEGAL_TRANSITIONS: ReadonlyArray<
  readonly [CallSheetStatus, CallSheetStatus]
> = [
  ["draft", "stageManagerReview"],
  ["stageManagerReview", "posted"],
  ["posted", "struck"],
  ["posted", "draft"],
] as const;

export type SanityRef = {
  _type: "reference";
  _ref: string;
};

export type VocalRange = {
  low: string;
  high: string;
};

export type PersonDoc = {
  _id: string;
  _type: "person";
  name: string;
  vocalRange: VocalRange;
  skills: SkillId[] | string[];
  unavailableDates?: string[];
};

export type ProductionDoc = {
  _id: string;
  _type: "production";
  title: string;
  companyName: string;
  venue?: string;
  season?: string;
  techWeekStart?: string;
  synopsis?: string;
};

export type SceneDoc = {
  _id: string;
  _type: "scene";
  title: string;
  order: number;
  production: SanityRef;
  runsConcurrentWith?: SanityRef[];
};

export type RoleDoc = {
  _id: string;
  _type: "role";
  characterName: string;
  production: SanityRef;
  scene: SanityRef;
  requiredRange: VocalRange;
  requiredSkills: SkillId[] | string[];
};

export type CastingDoc = {
  _id: string;
  _type: "casting";
  person: SanityRef;
  role: SanityRef;
  date: string;
};

export type CallSheetItem = {
  _key: string;
  person: SanityRef;
  role: SanityRef;
  callTime: string;
  note?: string;
};

export type CallSheetDoc = {
  _id: string;
  _type: "callSheet";
  title?: string;
  performanceDate: string;
  production: SanityRef;
  status: CallSheetStatus;
  supersedes?: SanityRef;
  items: CallSheetItem[];
};

export type WorkflowTransitionDoc = {
  _id: string;
  _type: "workflowTransition";
  callSheet: SanityRef;
  fromStatus: CallSheetStatus;
  toStatus: CallSheetStatus;
  actorName: string;
  at: string;
  note?: string;
};

export type CompanyDoc =
  | PersonDoc
  | ProductionDoc
  | SceneDoc
  | RoleDoc
  | CastingDoc
  | CallSheetDoc
  | WorkflowTransitionDoc;

export type CoverFailReason =
  | "range"
  | "skill"
  | "concurrent scene"
  | "date"
  | "already covering";

export type CoverTrace = {
  personId: string;
  personName: string;
  canCover: boolean;
  failedPredicate?: CoverFailReason;
};

export function isLegalTransition(
  from: CallSheetStatus,
  to: CallSheetStatus,
): boolean {
  return LEGAL_TRANSITIONS.some(([a, b]) => a === from && b === to);
}

export function ref(id: string): SanityRef {
  return { _type: "reference", _ref: id };
}
