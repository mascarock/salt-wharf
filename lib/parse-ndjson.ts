import type { CompanyDoc } from "./types";

export function parseNdjson(text: string): CompanyDoc[] {
  const documents: CompanyDoc[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    documents.push(JSON.parse(line) as CompanyDoc);
  }
  return documents;
}

export function toNdjson(documents: CompanyDoc[]): string {
  return documents.map((doc) => JSON.stringify(doc)).join("\n") + "\n";
}

export function mergeById(
  base: CompanyDoc[],
  overlay: CompanyDoc[],
): CompanyDoc[] {
  const map = new Map<string, CompanyDoc>();
  for (const doc of base) {
    map.set(doc._id, doc);
  }
  for (const doc of overlay) {
    map.set(doc._id, doc);
  }
  return Array.from(map.values());
}
