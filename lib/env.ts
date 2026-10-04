export function sanityProjectId(): string | undefined {
  const id = process.env.SANITY_PROJECT_ID?.trim();
  return id || undefined;
}

export function sanityDataset(): string {
  return process.env.SANITY_DATASET?.trim() || "production";
}

export function sanityReadToken(): string | undefined {
  return process.env.SANITY_API_READ_TOKEN?.trim() || undefined;
}

export function sanityWriteToken(): string | undefined {
  return process.env.SANITY_API_WRITE_TOKEN?.trim() || undefined;
}

export function isFixtureMode(): boolean {
  return !sanityProjectId();
}

// The Salt Wharf documents live in this Sanity project. Fixture mode prints
// the same documents from sanity/seed.ndjson.
const SALT_WHARF_PROJECT_ID = "ebwymj6z";

export function sanityHome(): { projectId: string; dataset: string } {
  return {
    projectId: sanityProjectId() ?? SALT_WHARF_PROJECT_ID,
    dataset: sanityDataset(),
  };
}
