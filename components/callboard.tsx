import Link from "next/link";
import type { BoardView, BookEntry } from "@/lib/board";
import { formatPostedTime } from "@/lib/posted-call";

export type DoorSource = {
  projectId: string;
  dataset: string;
  fixture: boolean;
};

export function Callboard({
  board,
  source,
}: {
  board: BoardView;
  source: DoorSource;
}) {
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
              <div
                key={`${change.previousSheetId}-${change.roleId}`}
                className="mt-3"
              >
                <p className="text-2xl leading-tight sm:text-3xl">
                  {board.isTonight
                    ? `Tonight’s ${change.roleName}`
                    : `${change.roleName} on ${board.formattedDate}`}{" "}
                  is{" "}
                  <span className="font-semibold">
                    {change.currentPersonName}
                  </span>
                </p>
                <p className="mt-2 leading-snug">
                  because a later sheet, “{change.currentSheetTitle}”,
                  replaced{" "}
                  <span className="line-through decoration-[var(--pin)]/70">
                    {change.previousPersonName}
                  </span>
                  .
                </p>
              </div>
            ))}
            {board.book.some(
              (entry) =>
                entry.sheetId === board.replacements[0].previousSheetId &&
                entry.state === "replaced",
            ) ? (
              <p className="mt-3 text-sm text-[var(--ink-soft)]">
                The earlier sheet, “{board.replacements[0].previousSheetTitle}”,
                stays in the book, marked replaced.
              </p>
            ) : null}
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

        {board.book.length > 1 ? (
          <section
            aria-labelledby="book-heading"
            className="relative mx-auto mt-12 max-w-2xl"
          >
            <h2
              id="book-heading"
              className="text-center font-mono text-[0.72rem] uppercase text-[var(--ink-soft)]"
            >
              The book · {board.formattedDate}
            </h2>
            <ol className="mt-4 space-y-3">
              {board.book.map((entry) => (
                <BookSlip key={entry.sheetId} entry={entry} />
              ))}
            </ol>
          </section>
        ) : null}

        <footer className="relative mx-auto mt-14 max-w-2xl border-t border-[var(--rule)] pt-4 text-center text-sm text-[var(--ink-soft)]">
          {board.sheet?.title ? <p>{board.sheet.title}</p> : null}
          <p className="mt-1">
            Only the posted sheet that is not superseded stands on this door.
          </p>
          <p className="mt-4">
            The documents live in Sanity project{" "}
            <span className="font-mono text-[var(--ink)]">
              {source.projectId}
            </span>
            , dataset{" "}
            <span className="font-mono text-[var(--ink)]">
              {source.dataset}
            </span>
            .{" "}
            {source.fixture
              ? "This door prints the same documents from the seed bundled with the site, so it needs no token."
              : "This door reads them from Sanity."}
          </p>
          <p className="mt-1">
            <a
              href={callSheetsQueryUrl(source)}
              className="underline decoration-[var(--rule)] hover:text-[var(--ink)]"
            >
              Read the call sheets straight from Sanity
            </a>
          </p>
        </footer>
      </article>

      <nav className="no-print mt-6 flex items-center justify-between font-mono text-[0.68rem] uppercase text-[var(--rule)]">
        <Link href="/backstage" className="hover:text-[var(--tungsten)]">
          Stage manager · fake contest gate
        </Link>
        <Link href="/studio" className="hover:text-[var(--tungsten)]">
          Studio
        </Link>
      </nav>
    </main>
  );
}

const BOOK_LABELS: Record<BookEntry["state"], string> = {
  standing: "On the door",
  replaced: "Replaced",
  posted: "Posted",
};

function BookSlip({ entry }: { entry: BookEntry }) {
  const replaced = entry.state === "replaced";
  return (
    <li
      className={`call-slip border-y px-4 py-3 ${
        replaced ? "border-[var(--pin)]/60" : "border-[var(--rule)]/70"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-lg leading-tight sm:text-xl">{entry.title}</p>
        <span
          className={`border px-2 py-0.5 font-mono text-[0.68rem] uppercase ${
            replaced
              ? "border-[var(--pin)] text-[var(--pin)]"
              : "border-[var(--ink)] text-[var(--ink)]"
          }`}
        >
          {BOOK_LABELS[entry.state]}
        </span>
      </div>
      <p className="mt-1 font-mono text-[0.7rem] uppercase text-[var(--ink-soft)]">
        {entry.postedAt ? `Posted ${formatPostedTime(entry.postedAt)}` : "Posted"}
        {entry.calls
          .map((call) => ` · ${call.roleName}: ${call.personName}`)
          .join("")}
      </p>
      {replaced ? (
        <p className="mt-1 text-sm text-[var(--pin)]">
          Still in the book
          {entry.replacedBy ? `, replaced by “${entry.replacedBy}”` : ""}. It
          no longer stands on the door.
        </p>
      ) : null}
    </li>
  );
}

function callSheetsQueryUrl({ projectId, dataset }: DoorSource): string {
  const query =
    '*[_type == "callSheet"] | order(performanceDate asc, _id asc){_id, title, performanceDate, status, "supersedes": supersedes._ref}';
  return `https://${projectId}.apicdn.sanity.io/v2026-10-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
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
