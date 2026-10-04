import assert from "node:assert/strict";
import { indexCompany } from "../lib/company";
import { findCoverage } from "../lib/coverage";
import { parseNdjson } from "../lib/parse-ndjson";
import { currentPostedCallSheet } from "../lib/posted-call";
import { buildBoardView } from "../lib/board";
import type { CallSheetDoc, PersonDoc, RoleDoc } from "../lib/types";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function main() {
  const text = await readFile(
    path.join(process.cwd(), "sanity", "seed.ndjson"),
    "utf8",
  );
  const company = indexCompany(parseNdjson(text));
  const date = "2026-10-04";
  const standing = currentPostedCallSheet(company.callSheets, date);
  assert.ok(standing, "expected a standing posted sheet for 4 October");
  assert.equal(standing._id, "callSheet-oct4-v2");
  assert.equal(standing.supersedes?._ref, "callSheet-oct4-v1");

  const v1 = company.byId.get("callSheet-oct4-v1") as CallSheetDoc;
  assert.equal(v1.status, "posted");
  assert.ok(
    v1.items.some((item) => item.person._ref === "person-maraCamilleri"),
    "older sheet still names the principal",
  );
  assert.ok(
    standing.items.some((item) => item.person._ref === "person-linaBorg"),
    "later sheet posts the cover",
  );
  assert.ok(
    !standing.items.some((item) => item.person._ref === "person-maraCamilleri"),
    "cover sheet must not still call the principal",
  );

  const rosa = company.byId.get("role-rosa") as RoleDoc;
  const traces = findCoverage(rosa, date, company, standing);
  const byId = Object.fromEntries(traces.map((trace) => [trace.personId, trace]));

  assert.equal(byId["person-linaBorg"]?.canCover, true, "Lina can cover Rosa");
  assert.equal(byId["person-toniVella"]?.failedPredicate, "range");
  assert.equal(byId["person-pawluGalea"]?.failedPredicate, "concurrent scene");
  assert.equal(byId["person-maraCamilleri"]?.failedPredicate, "date");
  assert.equal(byId["person-sofiaMicallef"]?.failedPredicate, "already covering");
  assert.equal(byId["person-ritaAzzopardi"]?.failedPredicate, "skill");

  const lina = company.byId.get("person-linaBorg") as PersonDoc;
  assert.ok(lina.skills.includes("high-belt"));

  const board = buildBoardView(company, date);
  assert.deepEqual(
    board.replacements.map((replacement) => ({
      roleName: replacement.roleName,
      previousPersonName: replacement.previousPersonName,
      currentPersonName: replacement.currentPersonName,
    })),
    [
      {
        roleName: "Rosa",
        previousPersonName: "Mara Camilleri",
        currentPersonName: "Lina Borg",
      },
    ],
  );

  assert.ok(
    board.lines.some(
      (line) => line.roleName === "Rosa" && line.personName === "Lina Borg",
    ),
    "public door shows Borg as Rosa",
  );
  assert.ok(
    !board.lines.some((line) => line.personName === "Mara Camilleri"),
    "public door does not show Camilleri after v2 posts",
  );

  assert.equal(board.replacements[0].currentSheetTitle, "4 Oct — Rosa cover");
  assert.deepEqual(
    board.book.map((entry) => ({
      sheetId: entry.sheetId,
      state: entry.state,
      calls: entry.calls,
    })),
    [
      {
        sheetId: "callSheet-oct4-v2",
        state: "standing",
        calls: [{ roleName: "Rosa", personName: "Lina Borg" }],
      },
      {
        sheetId: "callSheet-oct4-v1",
        state: "replaced",
        calls: [{ roleName: "Rosa", personName: "Mara Camilleri" }],
      },
    ],
    "the door's book keeps v1, marked replaced by v2",
  );
  assert.equal(board.book[1].replacedBy, "4 Oct — Rosa cover");

  console.log(
    "Seed story holds: v1 still names Mara Camilleri; v2 supersedes it; the public door calls Lina Borg and keeps v1 in the book, marked replaced.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
