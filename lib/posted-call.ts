import type { CallSheetDoc } from "./types";

/**
 * The live call for a night is the posted sheet that no other posted sheet
 * for that same date points at via `supersedes`.
 *
 * An older posted sheet that still names the principal loses to the later
 * posted sheet that sets `supersedes`. A return to draft, or a strike, takes
 * a sheet out of the posted set, so it can no longer hide the sheet it once
 * replaced.
 */
export function currentPostedCallSheet(
  sheets: CallSheetDoc[],
  performanceDate: string,
): CallSheetDoc | null {
  const posted = sheets.filter(
    (sheet) =>
      sheet.status === "posted" && sheet.performanceDate === performanceDate,
  );
  const supersededIds = new Set(
    posted
      .map((sheet) => sheet.supersedes?._ref)
      .filter((id): id is string => Boolean(id)),
  );
  const standing = posted.filter((sheet) => !supersededIds.has(sheet._id));
  if (standing.length === 0) {
    return null;
  }
  if (standing.length === 1) {
    return standing[0];
  }
  return (
    standing.find((sheet) => sheet.supersedes) ??
    standing.sort((a, b) => a._id.localeCompare(b._id))[0]
  );
}

export function boardDates(sheets: CallSheetDoc[]): string[] {
  return Array.from(
    new Set(
      sheets
        .filter((sheet) => sheet.status === "posted")
        .map((sheet) => sheet.performanceDate),
    ),
  ).sort();
}

export function resolveBoardDate(
  sheets: CallSheetDoc[],
  today = todayIsoDate(),
): string | null {
  if (currentPostedCallSheet(sheets, today)) {
    return today;
  }
  const dates = boardDates(sheets);
  for (let i = dates.length - 1; i >= 0; i -= 1) {
    if (currentPostedCallSheet(sheets, dates[i])) {
      return dates[i];
    }
  }
  return dates.at(-1) ?? null;
}

export function todayIsoDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatBoardDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatPostedTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
  return `${time} UTC`;
}
