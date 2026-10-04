import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
      <article className="paper-board relative p-8 text-center">
        <p className="relative font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--ink-soft)]">
          Salt Wharf
        </p>
        <h1 className="relative mt-3 text-4xl">Wrong door</h1>
        <p className="relative mt-4 text-sm text-[var(--ink-soft)]">
          That passage is not in the house.
        </p>
        <p className="relative mt-6">
          <Link href="/" className="underline decoration-[var(--rule)]">
            Back to the callboard
          </Link>
        </p>
      </article>
    </main>
  );
}
