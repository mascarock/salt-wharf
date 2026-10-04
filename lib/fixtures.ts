import { Buffer } from "node:buffer";
import { cookies } from "next/headers";
import seedText from "../sanity/seed.ndjson";
import { indexCompany, type Company } from "./company";
import { parseNdjson } from "./parse-ndjson";
import {
  CALL_SHEET_STATUSES,
  ref,
  type CallSheetStatus,
  type CompanyDoc,
  type WorkflowTransitionDoc,
} from "./types";
import { assertTransition } from "./workflow";

/**
 * Fixture mode reads the committed seed, bundled into the server build by
 * next.config.ts. It never touches the filesystem, so it runs the same on
 * Node and on Cloudflare Workers.
 *
 * Stage-manager moves are kept in the visitor's own cookie and replayed onto
 * the seed. Nobody else sees them: every other visitor still reads the
 * committed story.
 */
const MOVES_COOKIE = "sw_moves";
const MAX_MOVES = 12;
const MAX_COOKIE_LENGTH = 3800;

type Move =
  | [sheetId: string, from: CallSheetStatus, to: CallSheetStatus, at: string, actor: string]
  | [sheetId: string, from: CallSheetStatus, to: CallSheetStatus, at: string, actor: string, note: string];

export function readSeedDocuments(): CompanyDoc[] {
  return parseNdjson(seedText);
}

export async function loadFixtureCompany(): Promise<Company> {
  return replay(await readMoves());
}

export async function recordFixtureMove(
  transition: WorkflowTransitionDoc,
): Promise<{ company: Company; error?: string }> {
  const moves = await readMoves();
  if (moves.length >= MAX_MOVES) {
    return {
      company: replay(moves),
      error: `This browser has made ${MAX_MOVES} moves. Put the book back to start again.`,
    };
  }

  const { callSheet, fromStatus, toStatus, at, actorName, note } = transition;
  const move: Move = note
    ? [callSheet._ref, fromStatus, toStatus, at, actorName, note.slice(0, 200)]
    : [callSheet._ref, fromStatus, toStatus, at, actorName];
  const next = [...moves, move];
  const value = Buffer.from(JSON.stringify(next)).toString("base64url");
  if (value.length > MAX_COOKIE_LENGTH) {
    return { company: replay(moves), error: "That note is too long for the book." };
  }

  const jar = await cookies();
  jar.set(MOVES_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });
  return { company: replay(next) };
}

export async function clearFixtureMoves(): Promise<void> {
  const jar = await cookies();
  jar.delete(MOVES_COOKIE);
}

async function readMoves(): Promise<Move[]> {
  const jar = await cookies();
  const value = jar.get(MOVES_COOKIE)?.value;
  if (!value) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );
    return Array.isArray(parsed)
      ? parsed.filter(isMove).slice(0, MAX_MOVES)
      : [];
  } catch {
    return [];
  }
}

function isMove(value: unknown): value is Move {
  if (!Array.isArray(value) || (value.length !== 5 && value.length !== 6)) {
    return false;
  }
  const statuses: readonly string[] = CALL_SHEET_STATUSES;
  return (
    value.every((part) => typeof part === "string") &&
    statuses.includes(value[1]) &&
    statuses.includes(value[2])
  );
}

/** Applies each legal move in order; a move that no longer fits is skipped. */
function replay(moves: Move[]): Company {
  const byId = new Map<string, CompanyDoc>(
    readSeedDocuments().map((doc) => [doc._id, doc]),
  );
  moves.forEach(([sheetId, fromStatus, toStatus, at, actorName, note], index) => {
    const sheet = byId.get(sheetId);
    if (
      sheet?._type !== "callSheet" ||
      sheet.status !== fromStatus ||
      assertTransition(fromStatus, toStatus, note)
    ) {
      return;
    }
    byId.set(sheetId, { ...sheet, status: toStatus });
    const id = `workflowTransition.${sheetId}.move${index + 1}`;
    byId.set(id, {
      _id: id,
      _type: "workflowTransition",
      callSheet: ref(sheetId),
      fromStatus,
      toStatus,
      actorName,
      at,
      note,
    });
  });
  return indexCompany(Array.from(byId.values()));
}
