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

export type BoardView = {
  date: string | null;
  isTonight: boolean;
  formattedDate: string | null;
  sheet: CallSheetDoc | null;
  production: ProductionDoc | null;
  lines: BoardLine[];
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

  return {
    date,
    isTonight: date === today,
    formattedDate: formatBoardDate(date),
    sheet,
    production,
    lines,
    emptyReason: "ok",
  };
}
