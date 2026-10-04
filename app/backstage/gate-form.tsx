"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "./actions";

export function GateForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Stage manager</Label>
        <Input
          id="name"
          name="name"
          autoComplete="username"
          placeholder="Name on the book"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passphrase">Passphrase</Label>
        <Input
          id="passphrase"
          name="passphrase"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state?.error ? (
        <p className="text-sm text-[var(--pin)]" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Checking the book…" : "Open the door"}
      </Button>
    </form>
  );
}
