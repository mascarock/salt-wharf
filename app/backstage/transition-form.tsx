"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { CallSheetStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/workflow";
import { transitionAction } from "./actions";

export function TransitionForm({
  callSheetId,
  toStatus,
}: {
  callSheetId: string;
  toStatus: CallSheetStatus;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const needsReason = toStatus === "draft";

  return (
    <form
      className="space-y-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const formData = new FormData(event.currentTarget);
        const result = await transitionAction(formData);
        setPending(false);
        if (result?.error) {
          setError(result.error);
        }
      }}
    >
      <input type="hidden" name="callSheetId" value={callSheetId} />
      <input type="hidden" name="toStatus" value={toStatus} />
      {needsReason ? (
        <label className="block text-sm">
          Reason to pull it from the door
          <textarea
            name="note"
            required
            rows={2}
            className="mt-1 w-full border border-[var(--rule)] bg-[var(--paper)] p-2 text-sm"
          />
        </label>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        variant={toStatus === "posted" ? "tungsten" : "default"}
      >
        {pending ? "Writing the move…" : `Move to ${STATUS_LABELS[toStatus]}`}
      </Button>
      {error ? (
        <p className="text-sm text-[var(--pin)]" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
