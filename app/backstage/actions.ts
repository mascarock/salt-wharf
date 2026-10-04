"use server";

import { revalidatePath } from "next/cache";
import { applyWorkflowTransition } from "@/lib/mutations";
import {
  STAGE_MANAGER_DISPLAY,
  signInStageManager,
  signOutStageManager,
} from "@/lib/session";
import type { CallSheetStatus } from "@/lib/types";

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
) {
  const name = String(formData.get("name") ?? "");
  const passphrase = String(formData.get("passphrase") ?? "");
  const ok = await signInStageManager(name, passphrase);
  if (!ok) {
    return { error: "The door does not know that name." };
  }
  revalidatePath("/backstage");
  return {};
}

export async function logoutAction() {
  await signOutStageManager();
  revalidatePath("/backstage");
}

export async function transitionAction(formData: FormData) {
  const callSheetId = String(formData.get("callSheetId") ?? "");
  const toStatus = String(formData.get("toStatus") ?? "") as CallSheetStatus;
  const note = String(formData.get("note") ?? "");
  const result = await applyWorkflowTransition({
    callSheetId,
    toStatus,
    actorName: STAGE_MANAGER_DISPLAY,
    note,
  });
  if (result.error) {
    return { error: result.error };
  }
  revalidatePath("/");
  revalidatePath("/backstage");
  return {};
}
