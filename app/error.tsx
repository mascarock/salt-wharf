"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
      <article className="paper-board relative p-8 text-center">
        <p className="relative font-mono text-[0.68rem] uppercase text-[var(--ink-soft)]">
          Salt Wharf
        </p>
        <h1 className="relative mt-3 text-4xl">The call cannot be read</h1>
        <p className="relative mt-4 text-sm text-[var(--ink-soft)]">
          {error.message || "The book failed to open."}
        </p>
        <div className="relative mt-6 flex justify-center gap-4 text-sm">
          <button type="button" onClick={reset} className="underline">
            Try again
          </button>
          <Link href="/" className="underline decoration-[var(--rule)]">
            Back to the door
          </Link>
        </div>
      </article>
    </main>
  );
}
