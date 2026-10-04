import { indexCompany, type Company } from "./company";
import { isFixtureMode } from "./env";
import { loadFixtureCompany } from "./fixtures";
import { createSanityClient } from "./sanity-client";
import type { CompanyDoc } from "./types";

const QUERY = `*[_type in [
  "person",
  "production",
  "scene",
  "role",
  "casting",
  "callSheet",
  "workflowTransition"
]]`;

export async function loadCompany(): Promise<Company> {
  if (isFixtureMode()) {
    return loadFixtureCompany();
  }
  const client = createSanityClient("read");
  if (!client) {
    return loadFixtureCompany();
  }
  const documents = await client.fetch<CompanyDoc[]>(QUERY);
  return indexCompany(documents);
}
