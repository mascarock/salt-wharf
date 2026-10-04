import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { indexCompany, type Company } from "./company";
import { mergeById, parseNdjson } from "./parse-ndjson";
import type { CompanyDoc } from "./types";

const SEED_PATH = path.join(process.cwd(), "sanity", "seed.ndjson");
const OVERLAY_PATH = path.join(process.cwd(), ".data", "overlay.ndjson");

export async function readSeedDocuments(): Promise<CompanyDoc[]> {
  const text = await readFile(SEED_PATH, "utf8");
  return parseNdjson(text);
}

export async function readOverlayDocuments(): Promise<CompanyDoc[]> {
  try {
    const text = await readFile(OVERLAY_PATH, "utf8");
    return parseNdjson(text);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function loadFixtureCompany(): Promise<Company> {
  const seed = await readSeedDocuments();
  const overlay = await readOverlayDocuments();
  return indexCompany(mergeById(seed, overlay));
}

export async function writeFixtureOverlay(documents: CompanyDoc[]): Promise<void> {
  const seed = await readSeedDocuments();
  const existing = await readOverlayDocuments();
  const next = mergeById(existing, documents);
  const changed = next.filter((doc) => {
    const original = seed.find((item) => item._id === doc._id);
    return JSON.stringify(original) !== JSON.stringify(doc);
  });
  await mkdir(path.dirname(OVERLAY_PATH), { recursive: true });
  await writeFile(
    OVERLAY_PATH,
    changed.map((doc) => JSON.stringify(doc)).join("\n") + (changed.length ? "\n" : ""),
    "utf8",
  );
}

export async function upsertFixtureDocuments(
  documents: CompanyDoc[],
): Promise<Company> {
  const company = await loadFixtureCompany();
  const merged = mergeById(company.documents, documents);
  await writeFixtureOverlay(merged);
  return indexCompany(merged);
}
