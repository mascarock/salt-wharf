import { buildBoardView } from "@/lib/board";
import { isFixtureMode } from "@/lib/env";
import { loadCompany } from "@/lib/load-company";
import { isStageManager } from "@/lib/session";
import { Desk } from "./desk";
import { GateForm } from "./gate-form";

export const dynamic = "force-dynamic";

export default async function BackstagePage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; date?: string }>;
}) {
  const allowed = await isStageManager();
  if (!allowed) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16">
        <article className="paper-board relative p-8">
          <p className="relative font-mono text-[0.68rem] uppercase text-[var(--ink-soft)]">
            Salt Wharf · Stage door
          </p>
          <h1 className="relative mt-3 text-4xl leading-none">
            The book is shut
          </h1>
          <p className="relative mt-4 text-sm text-[var(--ink-soft)]">
            Fake contest gate, not real security. It is printed here on
            purpose for the challenge judges and protects nothing in Sanity or
            GitHub. Stage manager name <strong>elena</strong>, passphrase{" "}
            <strong>callboard</strong>.
          </p>
          <div className="relative mt-8">
            <GateForm />
          </div>
        </article>
      </main>
    );
  }

  const params = await searchParams;
  const company = await loadCompany();
  const board = buildBoardView(company);
  const draft =
    company.callSheets.find((sheet) => sheet.status === "draft") ??
    company.callSheets.find((sheet) => sheet.status === "stageManagerReview") ??
    company.callSheets
      .filter((sheet) => sheet.status === "posted")
      .sort((a, b) => b.performanceDate.localeCompare(a.performanceDate))[0] ??
    null;

  return (
    <main className="min-h-screen pb-16">
      <Desk
        company={company}
        board={board}
        draft={draft}
        selectedRoleId={params.role}
        selectedDate={params.date}
        fixtureMode={isFixtureMode()}
      />
    </main>
  );
}
