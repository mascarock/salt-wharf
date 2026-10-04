import { cookies } from "next/headers";

export const STAGE_MANAGER_NAME = "elena";
export const STAGE_MANAGER_PASS = "callboard";
export const STAGE_MANAGER_DISPLAY = "Elena Cassar";

const COOKIE = "sw_sm";

export async function isStageManager(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === STAGE_MANAGER_NAME;
}

export async function signInStageManager(name: string, passphrase: string) {
  const ok =
    name.trim().toLowerCase() === STAGE_MANAGER_NAME &&
    passphrase === STAGE_MANAGER_PASS;
  if (!ok) {
    return false;
  }
  const jar = await cookies();
  jar.set(COOKIE, STAGE_MANAGER_NAME, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });
  return true;
}

export async function signOutStageManager() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
