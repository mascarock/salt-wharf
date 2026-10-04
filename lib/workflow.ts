import { isLegalTransition, type CallSheetStatus } from "./types";

export const STATUS_LABELS: Record<CallSheetStatus, string> = {
  draft: "Draft",
  stageManagerReview: "Stage manager review",
  posted: "Posted",
  struck: "Struck",
};

export const NEXT_STATUSES: Record<CallSheetStatus, CallSheetStatus[]> = {
  draft: ["stageManagerReview"],
  stageManagerReview: ["posted"],
  posted: ["struck", "draft"],
  struck: [],
};

export function assertTransition(
  from: CallSheetStatus,
  to: CallSheetStatus,
  note?: string,
): string | null {
  if (!isLegalTransition(from, to)) {
    return `Illegal transition: ${from} → ${to}.`;
  }
  if (from === "posted" && to === "draft" && !note?.trim()) {
    return "Returning a posted sheet to draft needs a reason.";
  }
  return null;
}
