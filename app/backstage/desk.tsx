import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { BoardView } from "@/lib/board";
import type { Company } from "@/lib/company";
import { findCoverage } from "@/lib/coverage";
import { formatRange } from "@/lib/pitch";
import { currentPostedCallSheet, formatBoardDate } from "@/lib/posted-call";
import { getDoc } from "@/lib/company";
import type {
  CallSheetDoc,
  CoverTrace,
  PersonDoc,
  ProductionDoc,
  RoleDoc,
  SceneDoc,
  WorkflowTransitionDoc,
} from "@/lib/types";
import { NEXT_STATUSES, STATUS_LABELS } from "@/lib/workflow";
import { logoutAction } from "./actions";
import { TransitionForm } from "./transition-form";

export function Desk({
  company,
  board,
  draft,
  selectedRoleId,
  selectedDate,
}: {
  company: Company;
  board: BoardView;
  draft: CallSheetDoc | null;
  selectedRoleId?: string;
  selectedDate?: string;
}) {
  const production = company.productions[0];
  const date = selectedDate || board.date || draft?.performanceDate || "";
  const roleId = selectedRoleId || "role.rosa";
  const role = getDoc<RoleDoc>(company, roleId);
  const workingSheet =
    (date ? currentPostedCallSheet(company.callSheets, date) : null) ??
    company.callSheets.find(
      (sheet) => sheet.performanceDate === date && sheet.status !== "struck",
    ) ??
    draft ??
    board.sheet;
  const traces =
    role && date
      ? findCoverage(role, date, company, workingSheet ?? null)
      : [];

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <section className="paper-board relative p-6 sm:p-8">
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--ink-soft)]">
              Backstage · {production?.companyName ?? "Salt Wharf"}
            </p>
            <h1 className="mt-2 text-4xl leading-none sm:text-5xl">
              {production?.title ?? "Call book"}
            </h1>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              Leave
            </Button>
          </form>
        </div>
        <p className="relative mt-3 max-w-xl text-sm text-[var(--ink-soft)]">
          Elena Cassar. The door passphrase is in the book. Moves write a
          transition document; they do not flip a boolean.
        </p>

        <Separator className="relative my-6" />

        <PostedSummary
          board={board}
          transitions={company.transitions.filter(
            (item) =>
              board.sheet && item.callSheet._ref === board.sheet._id,
          )}
        />

        <Separator className="relative my-6" />

        {draft ? (
          <DraftPanel
            draft={draft}
            production={production}
            transitions={company.transitions.filter(
              (item) => item.callSheet._ref === draft._id,
            )}
            people={company.people}
            roles={company.roles}
          />
        ) : (
          <p className="relative text-sm text-[var(--ink-soft)]">
            No draft in the book. Import the seed or write one in Studio.
          </p>
        )}
      </section>

      <section className="paper-board relative p-6 sm:p-8">
        <p className="relative font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--ink-soft)]">
          Cover finder
        </p>
        <h2 className="relative mt-2 text-3xl leading-none">Who can stand in</h2>
        <p className="relative mt-3 text-sm text-[var(--ink-soft)]">
          Pure function: range contains, skills superset, no concurrent scene,
          not unavailable, not already covering two roles. Nothing is stored as
          a covers list.
        </p>
        <CoverForm
          roles={company.roles}
          scenes={company.scenes}
          dates={Array.from(
            new Set(company.callSheets.map((sheet) => sheet.performanceDate)),
          )}
          roleId={roleId}
          date={date}
        />
        {role ? (
          <p className="relative mt-4 font-mono text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
            {role.characterName} · {formatRange(role.requiredRange)} ·{" "}
            {role.requiredSkills.join(" · ")}
          </p>
        ) : null}
        <CoverageList traces={traces} />
      </section>
    </div>
  );
}

function PostedSummary({
  board,
  transitions,
}: {
  board: BoardView;
  transitions: WorkflowTransitionDoc[];
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl">On the door</h2>
        <Badge>{board.isTonight ? "Tonight" : "Standing"}</Badge>
      </div>
      {board.sheet && board.formattedDate ? (
        <>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            {board.formattedDate}
            {board.sheet.title ? ` · ${board.sheet.title}` : ""}
          </p>
          <ul className="mt-4 space-y-2">
            {board.lines.map((line) => (
              <li
                key={`${line.personId}-${line.roleId}`}
                className="flex justify-between gap-4 border-b border-[var(--rule)]/50 py-1 text-sm"
              >
                <span>
                  <span className="font-mono text-[var(--pin)]">
                    {line.callTime}
                  </span>{" "}
                  {line.personName}
                </span>
                <span className="text-[var(--ink-soft)]">
                  {line.roleName}
                  {line.note ? ` · ${line.note}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-3 text-sm">No posted call is standing.</p>
      )}
      {board.sheet?.supersedes ? (
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          This sheet supersedes {board.sheet.supersedes._ref}. The older
          posting still names the principal and still says posted.
        </p>
      ) : null}
      {transitions.length > 0 ? (
        <ol className="mt-3 space-y-1 text-xs text-[var(--ink-soft)]">
          {transitions
            .slice()
            .sort((a, b) => a.at.localeCompare(b.at))
            .map((item) => (
              <li key={item._id}>
                {STATUS_LABELS[item.fromStatus]} → {STATUS_LABELS[item.toStatus]}{" "}
                · {item.actorName}
                {item.note ? ` — ${item.note}` : ""}
              </li>
            ))}
        </ol>
      ) : null}
      <p className="mt-4">
        <Link href="/" className="underline decoration-[var(--rule)]">
          Open the public board
        </Link>
      </p>
    </div>
  );
}

function DraftPanel({
  draft,
  production,
  transitions,
  people,
  roles,
}: {
  draft: CallSheetDoc;
  production?: ProductionDoc;
  transitions: WorkflowTransitionDoc[];
  people: PersonDoc[];
  roles: RoleDoc[];
}) {
  const next = NEXT_STATUSES[draft.status];
  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl">Working sheet</h2>
        <Badge>{STATUS_LABELS[draft.status]}</Badge>
      </div>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">
        {draft.title ?? draft._id} · {formatBoardDate(draft.performanceDate)} ·{" "}
        {production?.title}
      </p>
      <ul className="mt-4 space-y-2">
        {draft.items.map((item) => {
          const person = people.find((entry) => entry._id === item.person._ref);
          const role = roles.find((entry) => entry._id === item.role._ref);
          return (
            <li
              key={item._key}
              className="flex justify-between gap-4 border-b border-[var(--rule)]/50 py-1 text-sm"
            >
              <span>
                <span className="font-mono text-[var(--pin)]">
                  {item.callTime}
                </span>{" "}
                {person?.name}
              </span>
              <span className="text-[var(--ink-soft)]">
                {role?.characterName}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 space-y-3">
        {next.map((status) => (
          <TransitionForm
            key={status}
            callSheetId={draft._id}
            toStatus={status}
          />
        ))}
        {next.length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">
            Struck sheets stay in the archive.
          </p>
        ) : null}
      </div>

      <h3 className="mt-8 font-mono text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
        Transitions
      </h3>
      {transitions.length === 0 ? (
        <p className="mt-2 text-sm">No moves yet. The first button writes one.</p>
      ) : (
        <ol className="mt-2 space-y-2 text-sm">
          {transitions
            .slice()
            .sort((a, b) => a.at.localeCompare(b.at))
            .map((item) => (
              <li key={item._id}>
                <span className="font-mono text-xs">
                  {item.at.replace("T", " ").replace(".000Z", " UTC")}
                </span>
                <br />
                {STATUS_LABELS[item.fromStatus]} → {STATUS_LABELS[item.toStatus]}{" "}
                · {item.actorName}
                {item.note ? ` — ${item.note}` : ""}
              </li>
            ))}
        </ol>
      )}
    </div>
  );
}

function CoverForm({
  roles,
  scenes,
  dates,
  roleId,
  date,
}: {
  roles: RoleDoc[];
  scenes: SceneDoc[];
  dates: string[];
  roleId: string;
  date: string;
}) {
  return (
    <form method="get" className="relative mt-6 grid gap-3 sm:grid-cols-2">
      <label className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
        Role
        <select
          name="role"
          defaultValue={roleId}
          className="mt-1 h-10 w-full border border-[var(--rule)] bg-[var(--paper)] px-2 text-sm text-[var(--ink)]"
        >
          {roles.map((role) => {
            const scene = scenes.find((entry) => entry._id === role.scene._ref);
            return (
              <option key={role._id} value={role._id}>
                {role.characterName}
                {scene ? ` — ${scene.title}` : ""}
              </option>
            );
          })}
        </select>
      </label>
      <label className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
        Night
        <select
          name="date"
          defaultValue={date}
          className="mt-1 h-10 w-full border border-[var(--rule)] bg-[var(--paper)] px-2 text-sm text-[var(--ink)]"
        >
          {dates.map((value) => (
            <option key={value} value={value}>
              {formatBoardDate(value)}
            </option>
          ))}
        </select>
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" variant="outline" size="sm">
          Ask the book
        </Button>
      </div>
    </form>
  );
}

function CoverageList({ traces }: { traces: CoverTrace[] }) {
  const yes = traces.filter((trace) => trace.canCover);
  const no = traces.filter((trace) => !trace.canCover);
  return (
    <div className="relative mt-6 space-y-6">
      <div>
        <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
          Can cover
        </h3>
        {yes.length === 0 ? (
          <p className="mt-2 text-sm">No one clears every predicate.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {yes.map((trace) => (
              <li key={trace.personId} className="text-xl leading-tight">
                {trace.personName}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
          First reason they cannot
        </h3>
        <ul className="mt-2 space-y-2 text-sm">
          {no.map((trace) => (
            <li
              key={trace.personId}
              className="flex justify-between gap-4 border-b border-[var(--rule)]/40 py-1"
            >
              <span>{trace.personName}</span>
              <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--pin)]">
                {trace.failedPredicate}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
