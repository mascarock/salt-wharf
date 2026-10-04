import { isFixtureMode } from "@/lib/env";
import Link from "next/link";
import { StudioMount } from "../studio-mount";

export const dynamic = "force-dynamic";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (isFixtureMode()) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-16">
        <article className="paper-board relative p-8">
          <p className="relative font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[var(--ink-soft)]">
            Salt Wharf · Studio
          </p>
          <h1 className="relative mt-3 text-4xl leading-none">
            Studio is parked
          </h1>
          <p className="relative mt-4 text-sm leading-relaxed text-[var(--ink-soft)]">
            Fixture mode is on because <code>SANITY_PROJECT_ID</code> is unset.
            The public board and the stage-manager desk read{" "}
            <code>sanity/seed.ndjson</code>. Set the four variables in{" "}
            <code>.env.example</code>, import the seed, and this route mounts
            Studio with the Salt Wharf structure and Callboard tool.
          </p>
          <p className="relative mt-6">
            <Link href="/" className="underline decoration-[var(--rule)]">
              Back to the door
            </Link>
          </p>
        </article>
      </main>
    );
  }

  return <StudioMount />;
}
