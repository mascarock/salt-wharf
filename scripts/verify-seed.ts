import assert from "node:assert/strict";
import { indexCompany } from "../lib/company";
import { findCoverage } from "../lib/coverage";
import { parseNdjson } from "../lib/parse-ndjson";
import { currentPostedCallSheet } from "../lib/posted-call";
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

  console.log("Seed story holds: Borg is called, Camilleri is not.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
