# Build notes

Salt Wharf is a stage-door callboard. I wanted the schema to do the interesting work, and the public page to look like a board you can read from a corridor, not a CMS demo.

## What this is

A Valletta company, Salt Wharf, is in tech week on *The Last Luzzu*. Eight people. Ten scenes. Two posted call sheets for 4 October 2026. The first still names Mara Camilleri as Rosa. The second supersedes it and posts Lina Borg, because Camilleri is unavailable that night. The public board must show Borg. If it shows Camilleri, the supersedes rule is wrong.

Backstage is a disclosed gate: stage manager name `elena`, passphrase `callboard`. Behind it, a draft for 5 October can be moved through documents, and a cover finder asks who can stand in for a role.

## Schema tradeoffs

I kept a role as a character track with one scene, not “Rosa in every scene she plays”. Concurrent coverage needs a single edge to walk. Splitting Rosa into Kitchen-Rosa, Storm-Rosa, Finale-Rosa would make the call sheet honest about the book and ruin the cover story: Borg would already hold three tracks and fail “already covering two”. One role, one scene, one call item. The scene is the constraint, not a covers array.

`runsConcurrentWith` is stored on the scene. Kitchen points at Harbour Office and the reverse is stored too. The function also walks incoming edges, because a one-way link is too easy to forget in Studio. That is deliberate duplication in the seed and a safety net in code.

Casting and call sheets are different documents. Casting is who holds the part that night. The call sheet is who is actually called. Coverage reads both. Pawlu Galea fails Rosa only because he is cast as the Clerk in the harbour office, which runs with the kitchen. He has the range and the skills. A covers list would have hidden that.

Workflow is not a boolean and not a field-only status change in the UI. A `workflowTransition` document records from, to, who, when, and why. Legal pairs are `draft → stageManagerReview → posted → struck`, plus `posted → draft` with a required note. Studio validation and the server action use the same helper. Returning a posted sheet to draft takes it out of the posted set, so it can no longer hide the sheet it superseded. That follows from the rule; I did not add a second mechanism.

Skills are closed string ids, shared by people and roles. I did not promote them to documents. A skill document would have been prettier in Studio and would have made the seed harder to import. String ids are what the brief asked for, and a shared const keeps the two fields aligned.

Vocal range is a pair of scientific pitches, not a fach. “Soprano” is a label. G3–C5 is a span. Containment is MIDI math. The same object shape is reused as `vocalRange` on a person and `requiredRange` on a role.

I did not add a `cover` document type. The later call sheet may annotate an item with `note: "cover"`. That is a house note after a decision, not a source of truth.

## Fixture mode

The app still runs with no env vars. `SANITY_PROJECT_ID` unset means `sanity/seed.ndjson` is the dataset. The seed is imported as a string at build time (a webpack `asset/source` rule in `next.config.ts`), so the server never reads the filesystem. That is what lets the same build run on Cloudflare Workers.

Stage-manager moves are kept in the visitor's own cookie as a short list of transitions and replayed onto the seed, with the same legality check as the server action. Nothing is shared between visitors. One judge posting the 5 October draft cannot change another judge's door, and **Put the book back** on the desk restores the committed story.

The Sanity project is `ebwymj6z`, dataset `production`, organization `mascarock` (`o1r4ucepz`). Context Knowledge Bases is enabled on the org. Tokens are not in the repo. When `SANITY_PROJECT_ID` and a write token are set locally, the same document shapes are fetched with GROQ and transitions are written through the API.

## Studio, and why there is no App SDK app

I wanted the App SDK bonus. I read the current quickstart. A Dashboard app needs `sanity deploy` and Dashboard auth; the local SDK server is proxied through sanity.io for login. There is still no App SDK deploy on this project, and I am not wrapping unused `@sanity/sdk-react` hooks to pretend there is one.

What I did ship, and what actually runs after an import:

- TypeScript schema under `sanity/schema`
- `sanity.config.ts` and `sanity.cli.ts` pointed at `ebwymj6z` / `production`
- a custom structure: call sheets by status, the production graph, company, transition log
- a Callboard Studio tool that resolves the standing posted sheet with the same function as `/`

`/studio` in fixture mode does not boot Studio against a missing env. It says the studio is parked and how to mount it. When it does mount, Studio loads in the browser only (`next/dynamic` with `ssr: false`). Server-rendering it put about 9 MB of Studio into the Cloudflare worker. Without it, the upload is about 1.1 MB gzipped.

Sanity Workflows (the product) is a different thing from workflow-as-data. I modelled the process as documents next to the content, which is what the desk and an agent can share. I did not take a dependency on a prerelease workflow engine.

## What I cut

- Live preview / Presentation. The door is a finished artifact, not an editorial canvas.
- Editing call items in the Next desk. The interesting write is the transition. Item edits belong in Studio after import.
- A ninth person for the stage manager. Elena is the gate and the actorName on transitions. She is not in the company graph.
- App SDK Dashboard deploy. See above.
- A second component library. The board is paper and type. shadcn primitives are only on the desk (button, input, label, badge, separator), restyled to ink and tungsten.

## How to judge the story quickly

1. Open `/` (deployed as `saltwharf.vibefy.net`). Lina Borg is Rosa. The slip says why: a later sheet replaced Mara Camilleri. Camilleri is not called. Under the calls, the book keeps the earlier sheet, marked replaced. The footer names the Sanity project, `ebwymj6z`, and dataset, `production`.
2. Sign in at `/backstage` as `elena` / `callboard`. This is a fake contest gate, not real security.
3. Cover finder, role Rosa, night 4 October. Borg can cover. Vella fails range. Galea fails concurrent scene. Camilleri fails date. Micallef fails already covering. Azzopardi fails skill.
4. Advance the 5 October draft. Each button writes a `workflowTransition` and changes status. Posting it does not disturb 4 October, because supersedes is per date. The moves live in your browser only.
5. `npm run verify` asserts (1) and (3) against the seed file.

## Taste

The public route is a callboard: warm corridor, tungsten, a paper sheet, names large enough to read from a doorway. If it looks like a dashboard, I missed.
