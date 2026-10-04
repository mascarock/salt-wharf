import { getDoc, type Company } from "./company";
import {
  currentPostedCallSheet,
  formatBoardDate,
  resolveBoardDate,
  todayIsoDate,
} from "./posted-call";
import type { CallSheetDoc, PersonDoc, ProductionDoc, RoleDoc } from "./types";

export type BoardLine = {
  callTime: string;
  personName: string;
  personId: string;
  roleName: string;
  roleId: string;
  note?: string;
};

export type BoardReplacement = {
  roleName: string;
  roleId: string;
  previousPersonName: string;
  currentPersonName: string;
  previousSheetTitle: string;
  previousSheetId: string;
  currentSheetTitle: string;
};

/** A posted sheet for the night, as the book keeps it. */
export type BookEntry = {
  sheetId: string;
  title: string;
  state: "standing" | "replaced" | "posted";
  postedAt: string | null;
  replacedBy?: string;
  calls: { roleName: string; personName: string }[];
};

export type BoardView = {
  date: string | null;
  isTonight: boolean;
  formattedDate: string | null;
  sheet: CallSheetDoc | null;
  production: ProductionDoc | null;
  lines: BoardLine[];
  replacements: BoardReplacement[];
  book: BookEntry[];
  emptyReason: "none" | "unposted" | "ok";
};

export function buildBoardView(
  company: Company,
  preferredDate?: string | null,
): BoardView {
  const today = todayIsoDate();
  const date = preferredDate || resolveBoardDate(company.callSheets, today);
  const sheet = date ? currentPostedCallSheet(company.callSheets, date) : null;
  const production = sheet
    ? getDoc<ProductionDoc>(company, sheet.production._ref) ?? null
    : company.productions[0] ?? null;

  if (!date || !sheet) {
    return {
      date,
      isTonight: date === today,
      formattedDate: date ? formatBoardDate(date) : null,
      sheet: null,
      production,
      lines: [],
      replacements: [],
      book: [],
      emptyReason: "unposted",
    };
  }

  const lines = sheet.items
    .map((item) => {
      const person = getDoc<PersonDoc>(company, item.person._ref);
      const role = getDoc<RoleDoc>(company, item.role._ref);
      return {
        callTime: item.callTime,
        personName: person?.name ?? "Unnamed",
        personId: item.person._ref,
        roleName: role?.characterName ?? "Role",
        roleId: item.role._ref,
        note: item.note,
      };
    })
    .sort((a, b) => {
      const time = a.callTime.localeCompare(b.callTime);
      if (time !== 0) return time;
      return a.personName.localeCompare(b.personName);
    });

  const replacements = buildReplacements(company, sheet);

  return {
    date,
    isTonight: date === today,
    formattedDate: formatBoardDate(date),
    sheet,
    production,
    lines,
    replacements,
    book: buildBook(company, date, sheet, replacements),
    emptyReason: "ok",
  };
}

/**
 * Every posted sheet for the night stays in the book. The standing sheet is
 * on the door; a sheet another posted sheet supersedes is marked replaced.
 * Each entry lists who it calls for the roles that changed.
 */
function buildBook(
  company: Company,
  date: string,
  standing: CallSheetDoc,
  replacements: BoardReplacement[],
): BookEntry[] {
  const changedRoles = new Set(replacements.map((change) => change.roleId));
  const posted = company.callSheets.filter(
    (sheet) => sheet.performanceDate === date && sheet.status === "posted",
  );

  return posted
    .map((sheet): BookEntry => {
      const replacedBy = posted.find(
        (other) => other.supersedes?._ref === sheet._id,
      );
      return {
        sheetId: sheet._id,
        title: sheet.title ?? sheet._id,
        state:
          sheet._id === standing._id
            ? "standing"
            : replacedBy
              ? "replaced"
              : "posted",
        postedAt: lastPostedAt(company, sheet._id),
        replacedBy: replacedBy ? (replacedBy.title ?? replacedBy._id) : undefined,
        calls: sheet.items
          .filter((item) => changedRoles.has(item.role._ref))
          .map((item) => ({
            roleName:
              getDoc<RoleDoc>(company, item.role._ref)?.characterName ?? "Role",
            personName:
              getDoc<PersonDoc>(company, item.person._ref)?.name ?? "Unnamed",
          })),
      };
    })
    .sort((a, b) => {
      if (a.state === "standing") return -1;
      if (b.state === "standing") return 1;
      return (b.postedAt ?? "").localeCompare(a.postedAt ?? "");
    });
}

function lastPostedAt(company: Company, sheetId: string): string | null {
  const times = company.transitions
    .filter(
      (move) => move.callSheet._ref === sheetId && move.toStatus === "posted",
    )
    .map((move) => move.at)
    .sort();
  return times.at(-1) ?? null;
}

function buildReplacements(
  company: Company,
  sheet: CallSheetDoc,
): BoardReplacement[] {
  const previous = sheet.supersedes?._ref
    ? getDoc<CallSheetDoc>(company, sheet.supersedes._ref)
    : null;
  if (!previous) {
    return [];
  }

  return sheet.items
    .map((item) => {
      const previousItem = previous.items.find(
        (entry) => entry.role._ref === item.role._ref,
      );
      if (!previousItem || previousItem.person._ref === item.person._ref) {
        return null;
      }

      const role = getDoc<RoleDoc>(company, item.role._ref);
      const previousPerson = getDoc<PersonDoc>(
        company,
        previousItem.person._ref,
      );
      const currentPerson = getDoc<PersonDoc>(company, item.person._ref);

      return {
        roleName: role?.characterName ?? "Role",
        roleId: item.role._ref,
        previousPersonName: previousPerson?.name ?? "Previous call",
        currentPersonName: currentPerson?.name ?? "Current call",
        previousSheetTitle: previous.title ?? previous._id,
        previousSheetId: previous._id,
        currentSheetTitle: sheet.title ?? sheet._id,
      };
    })
    .filter((item): item is BoardReplacement => Boolean(item));
}
