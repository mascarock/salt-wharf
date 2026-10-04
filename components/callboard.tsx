import Link from "next/link";
import type { BoardView } from "@/lib/board";

export function Callboard({ board }: { board: BoardView }) {
  const company = board.production?.companyName ?? "Salt Wharf";
  const show = board.production?.title ?? "Untitled production";

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8 sm:px-8 sm:py-12">
      <p className="no-print mb-6 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-[var(--tungsten)]">
        Stage door · {board.production?.venue ?? "The Salt Stores"}
      </p>

      <article className="paper-board relative flex-1 px-6 py-10 sm:px-12 sm:py-14">
        <header className="relative text-center">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.42em] text-[var(--ink-soft)]">
            {company}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.8rem,9vw,6.4rem)] leading-[0.9] tracking-tight">
            {show}
          </h1>
          <p className="mt-5 font-mono text-[0.78rem] uppercase tracking-[0.28em]">
            {board.isTonight ? "Tonight" : "Called"}
            {board.formattedDate ? ` · ${board.formattedDate}` : ""}
          </p>
          {board.production?.season ? (
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Tech week · {board.production.season}
            </p>
          ) : null}
        </header>

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
                  <p className="text-[clamp(1.7rem,5vw,2.8rem)] leading-none tracking-tight">
                    {line.personName}
                  </p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
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

      <nav className="no-print mt-6 flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--rule)]">
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
      <p className="text-[clamp(2rem,6vw,3.4rem)] leading-none">
        No call posted
      </p>
      <p className="mt-4 text-[var(--ink-soft)]">
        The door stays dark until a sheet is posted and not superseded.
      </p>
    </div>
  );
}
