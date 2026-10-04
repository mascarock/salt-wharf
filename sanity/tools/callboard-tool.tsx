"use client";

import { useEffect, useMemo, useState } from "react";
import { useClient } from "sanity";
import { indexCompany, type Company } from "@/lib/company";
import {
  currentPostedCallSheet,
  formatBoardDate,
  resolveBoardDate,
} from "@/lib/posted-call";
import type {
  CallSheetDoc,
  CompanyDoc,
  PersonDoc,
  ProductionDoc,
  RoleDoc,
} from "@/lib/types";
import { STATUS_LABELS } from "@/lib/workflow";

const QUERY = `*[_type in [
  "person",
  "production",
  "scene",
  "role",
  "casting",
  "callSheet",
  "workflowTransition"
]]`;

export function CallboardTool() {
  const client = useClient({ apiVersion: "2026-10-01" });
  const [company, setCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    client
      .fetch<CompanyDoc[]>(QUERY)
      .then((documents) => {
        if (!cancelled) {
          setCompany(indexCompany(documents));
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const view = useMemo(() => {
    if (!company) return null;
    const date = resolveBoardDate(company.callSheets);
    const sheet = date
      ? currentPostedCallSheet(company.callSheets, date)
      : null;
    const production = sheet
      ? (company.byId.get(sheet.production._ref) as ProductionDoc | undefined)
      : company.productions[0];
    const items = (sheet?.items ?? [])
      .map((item) => {
        const person = company.byId.get(item.person._ref) as
          | PersonDoc
          | undefined;
        const role = company.byId.get(item.role._ref) as RoleDoc | undefined;
        return {
          callTime: item.callTime,
          note: item.note,
          personName: person?.name ?? item.person._ref,
          roleName: role?.characterName ?? item.role._ref,
        };
      })
      .sort((a, b) => a.callTime.localeCompare(b.callTime));
    return { date, sheet, production, items };
  }, [company]);

  if (error) {
    return (
      <div style={panelStyle}>
        <p style={kickerStyle}>Salt Wharf · Callboard</p>
        <h1 style={titleStyle}>Cannot read the book</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!view) {
    return (
      <div style={panelStyle}>
        <p style={kickerStyle}>Salt Wharf · Callboard</p>
        <p>Copying the board…</p>
      </div>
    );
  }

  if (!view.sheet || !view.date) {
    return (
      <div style={panelStyle}>
        <p style={kickerStyle}>Salt Wharf · Callboard</p>
        <h1 style={titleStyle}>No posted call</h1>
        <p>The door stays dark until a sheet is posted and not superseded.</p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <p style={kickerStyle}>
        {view.production?.companyName ?? "Salt Wharf"} · Studio tool
      </p>
      <h1 style={titleStyle}>{view.production?.title ?? "Untitled"}</h1>
      <p style={metaStyle}>
        {formatBoardDate(view.date)} · {STATUS_LABELS[view.sheet.status]} ·{" "}
        {view.sheet.title ?? view.sheet._id}
      </p>
      <p style={noteStyle}>
        Standing posted sheet. An older posted sheet for this date loses if this
        one sets <code>supersedes</code>.
      </p>
      <ol style={listStyle}>
        {view.items.map((item) => (
          <li key={`${item.personName}-${item.roleName}-${item.callTime}`}>
            <strong>
              {item.callTime} {item.personName}
            </strong>
            <span>
              {" "}
              — {item.roleName}
              {item.note ? ` (${item.note})` : ""}
            </span>
          </li>
        ))}
      </ol>
      <CallSheetAudit sheets={company?.callSheets ?? []} date={view.date} />
    </div>
  );
}

function CallSheetAudit({
  sheets,
  date,
}: {
  sheets: CallSheetDoc[];
  date: string;
}) {
  const night = sheets.filter((sheet) => sheet.performanceDate === date);
  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 style={{ fontSize: "1rem" }}>Sheets for this night</h2>
      <ul>
        {night.map((sheet) => (
          <li key={sheet._id}>
            {sheet.title ?? sheet._id} — {sheet.status}
            {sheet.supersedes ? ` · supersedes ${sheet.supersedes._ref}` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}

const panelStyle: React.CSSProperties = {
  padding: "2rem",
  maxWidth: "42rem",
  fontFamily: "Georgia, serif",
  color: "#24180f",
};

const kickerStyle: React.CSSProperties = {
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  fontSize: "0.75rem",
};

const titleStyle: React.CSSProperties = {
  fontSize: "2.4rem",
  margin: "0.4rem 0",
};

const metaStyle: React.CSSProperties = {
  marginTop: 0,
};

const noteStyle: React.CSSProperties = {
  color: "#5c4633",
};

const listStyle: React.CSSProperties = {
  paddingLeft: "1.2rem",
  lineHeight: 1.7,
};
