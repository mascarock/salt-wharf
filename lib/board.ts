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
  previousPersonName: string;
  currentPersonName: string;
  previousSheetTitle: string;
  previousSheetId: string;
};

export type BoardView = {
  date: string | null;
  isTonight: boolean;
  formattedDate: string | null;
  sheet: CallSheetDoc | null;
  production: ProductionDoc | null;
  lines: BoardLine[];
  replacements: BoardReplacement[];
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
    emptyReason: "ok",
  };
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
        previousPersonName: previousPerson?.name ?? "Previous call",
        currentPersonName: currentPerson?.name ?? "Current call",
        previousSheetTitle: previous.title ?? previous._id,
        previousSheetId: previous._id,
      };
    })
    .filter((item): item is BoardReplacement => Boolean(item));
}
