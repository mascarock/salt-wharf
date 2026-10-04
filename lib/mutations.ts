import { randomUUID } from "node:crypto";
import { getDoc, type Company } from "./company";
import { isFixtureMode } from "./env";
import { upsertFixtureDocuments } from "./fixtures";
import { loadCompany } from "./load-company";
import { createSanityClient } from "./sanity-client";
import type {
  CallSheetDoc,
  CallSheetStatus,
  WorkflowTransitionDoc,
} from "./types";
import { assertTransition } from "./workflow";

export type TransitionInput = {
  callSheetId: string;
  toStatus: CallSheetStatus;
  actorName: string;
  note?: string;
};

export async function applyWorkflowTransition(
  input: TransitionInput,
): Promise<{ company: Company; error?: string }> {
  const company = await loadCompany();
  const sheet = getDoc<CallSheetDoc>(company, input.callSheetId);
  if (!sheet || sheet._type !== "callSheet") {
    return { company, error: "That call sheet is not in the book." };
  }

  const problem = assertTransition(sheet.status, input.toStatus, input.note);
  if (problem) {
    return { company, error: problem };
  }

  const at = new Date().toISOString();
  const transition: WorkflowTransitionDoc = {
    _id: `workflowTransition.${sheet._id}.${randomUUID()}`,
    _type: "workflowTransition",
    callSheet: { _type: "reference", _ref: sheet._id },
    fromStatus: sheet.status,
    toStatus: input.toStatus,
    actorName: input.actorName,
    at,
    note: input.note?.trim() || undefined,
  };
  const nextSheet: CallSheetDoc = {
    ...sheet,
    status: input.toStatus,
  };

  if (isFixtureMode()) {
    const next = await upsertFixtureDocuments([nextSheet, transition]);
    return { company: next };
  }

  const client = createSanityClient("write");
  if (!client) {
    return {
      company,
      error: "SANITY_API_WRITE_TOKEN is required to move a live call sheet.",
    };
  }

  await client.createOrReplace(transition);
  await client.patch(sheet._id).set({ status: input.toStatus }).commit();
  return { company: await loadCompany() };
}
