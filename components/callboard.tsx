import Link from "next/link";
import type { BoardView } from "@/lib/board";

export function Callboard({ board }: { board: BoardView }) {
  const company = board.production?.companyName ?? "Salt Wharf";
  const show = board.production?.title ?? "Untitled production";

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8 sm:px-8 sm:py-12">
      <p className="no-print mb-6 font-mono text-[0.7rem] uppercase text-[var(--tungsten)]">
        Stage door · {board.production?.venue ?? "The Salt Stores"}
      </p>

      <article className="paper-board relative flex-1 px-6 py-10 sm:px-12 sm:py-14">
        <header className="relative text-center">
          <p className="font-mono text-[0.72rem] uppercase text-[var(--ink-soft)]">
            {company}
          </p>
          <h1 className="mt-3 font-display text-5xl sm:text-7xl leading-[0.9]">
            {show}
          </h1>
          <p className="mt-5 font-mono text-[0.78rem] uppercase">
            {board.isTonight ? "Tonight" : "Called"}
            {board.formattedDate ? ` · ${board.formattedDate}` : ""}
          </p>
          {board.production?.season ? (
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Tech week · {board.production.season}
            </p>
          ) : null}
        </header>

        {board.replacements.length > 0 ? (
          <section className="call-slip relative mx-auto mt-8 max-w-2xl border-y-2 border-[var(--pin)] bg-[rgba(139,58,42,0.08)] px-4 py-4 text-center">
            <p className="font-mono text-[0.7rem] uppercase text-[var(--pin)]">
              Later sheet posted · earlier sheet replaced
            </p>
            {board.replacements.map((change) => (
              <p
                key={`${change.previousSheetId}-${change.roleName}`}
                className="mt-2 text-xl leading-tight sm:text-2xl"
              >
                {change.roleName}:{" "}
                <span className="line-through decoration-[var(--pin)]/70">
                  {change.previousPersonName}
                </span>{" "}
                <span className="font-semibold">{change.currentPersonName}</span>
              </p>
            ))}
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              {board.replacements[0].previousSheetTitle} is still posted in the
              book, but the later sheet is the call tonight.
            </p>
          </section>
        ) : null}

        <div className="relative mx-auto my-8 h-px w-24 bg-[var(--rule)]" />

        {board.emptyReason !== "ok" || board.lines.length === 0 ? (
          <EmptyBoard />
        ) : (
          <ol className="relative mx-auto max-w-2xl space-y-7">
            {board.lines.map((line) => (
              <li
                key={`${line.personId}-${line.roleId}`}
                className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1 sm:grid-cols-[5.5rem_1fr]"
              >
                <time className="font-mono text-base text-[var(--pin)] sm:text-lg">
                  {line.callTime}
                </time>
                <div>
                  <p className="text-3xl sm:text-5xl leading-none">
                    {line.personName}
                  </p>
                  <p className="mt-1 font-mono text-xs uppercase text-[var(--ink-soft)]">
                    {line.roleName}
                    {line.note ? ` · ${line.note}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}

        <footer className="relative mx-auto mt-14 max-w-2xl border-t border-[var(--rule)] pt-4 text-center text-sm text-[var(--ink-soft)]">
          {board.sheet?.title ? <p>{board.sheet.title}</p> : null}
          <p className="mt-1">
            Only the posted sheet that is not superseded stands on this door.
          </p>
        </footer>
      </article>

      <nav className="no-print mt-6 flex items-center justify-between font-mono text-[0.68rem] uppercase text-[var(--rule)]">
        <Link href="/backstage" className="hover:text-[var(--tungsten)]">
          Stage manager
        </Link>
        <Link href="/studio" className="hover:text-[var(--tungsten)]">
          Studio
        </Link>
      </nav>
    </main>
  );
}

function EmptyBoard() {
  return (
    <div className="relative mx-auto max-w-lg py-16 text-center">
      <p className="text-4xl sm:text-5xl leading-none">
        No call posted
      </p>
      <p className="mt-4 text-[var(--ink-soft)]">
        The door stays dark until a sheet is posted and not superseded.
      </p>
    </div>
  );
}
