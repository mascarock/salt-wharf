# Salt Wharf

Salt Wharf is a stage-door callboard for a fictional Valletta theatre company. The public page is the paper on the wall: it shows who is actually called tonight. Backstage, the stage manager sees the call-sheet stack, moves sheets through workflow documents, and asks the book who can cover a role.

On 4 October 2026, two posted sheets exist:

1. `callSheet-oct4-v1`, the earlier posting, still names Mara Camilleri as Rosa.
2. `callSheet-oct4-v2`, the later posting, supersedes the first sheet and posts Lina Borg because Camilleri is off.

The door shows Borg. The earlier sheet is still in the dataset and still says `posted`, but it does not win because a later posted sheet for the same night points at it with `supersedes`.

## Run

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43174](http://127.0.0.1:43174). No environment variables are required. With `SANITY_PROJECT_ID` unset, fixture mode reads `sanity/seed.ndjson` and local workflow moves write to `.data/overlay.ndjson`, which is gitignored.

```bash
npm run verify
npm run build
npm start
```

`npm run verify` asserts the 4 October story: v2 is the standing sheet, v1 remains posted, Mara Camilleri is still on the earlier sheet, Lina Borg is on the door, and the cover predicates explain why the other candidates fail.

## Stage Door

The backstage gate is fake stage-door theatre for the challenge demo. It is intentionally disclosed:

- Name: `elena`
- Passphrase: `callboard`

This does not protect Sanity, GitHub, or any real resource. Live Sanity writes require the normal local Sanity environment setup, including a write token. The repo leaves `SANITY_API_READ_TOKEN` and `SANITY_API_WRITE_TOKEN` empty.

`/` is the public door. `/backstage` is the desk. `/studio` mounts Sanity Studio only when fixture mode is off.

## Supersedes Rule

A night can have more than one posted call sheet. Salt Wharf does not blindly print the newest document, and it does not print every sheet with `status: "posted"`.

For a performance date, the public door prints the posted sheet that no other posted sheet for that same date supersedes. If a later sheet returns to draft or is struck, it leaves the posted set and stops hiding the older sheet.

That is why 4 October 2026 is interesting: the older sheet is not deleted and not edited away. It still records the first call, but the later Rosa-cover sheet supersedes it and becomes the standing call.

## Coverage

Coverage is computed. It is not a stored understudy list.

`lib/coverage.ts` checks each person against the role and the selected night:

1. vocal range contains the role's required range
2. skills are a superset of the role's required skills
3. the person is not cast, and not called, in a concurrent scene
4. the person is not unavailable that night
5. the person is not already covering two other roles that night

The desk prints the first failed predicate for each rejected person. In the seed, Lina Borg clears the checks for Rosa; Mara Camilleri fails because she is unavailable on 4 October 2026.

## Sanity

Sanity project id: `ebwymj6z`

Dataset: `production`

Copy `.env.example` if you want live Sanity mode. Keep the tokens blank in the repo:

```env
SANITY_PROJECT_ID=ebwymj6z
SANITY_DATASET=production
SANITY_API_READ_TOKEN=
SANITY_API_WRITE_TOKEN=
```

Import the same seed the fixture app uses:

```bash
npx sanity dataset import sanity/seed.ndjson production
```

Schema lives under `sanity/schema`. The Sanity desk structure groups call sheets by status and exposes a Callboard tool that resolves the same standing posted sheet as the public door.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs Next.js on port 43174 |
| `npm run verify` | Proves the 4 October call-sheet and coverage story |
| `npm run build` | Verifies the seed, then builds the Next app |
| `npm run start` | Starts the built app on port 43174 |
| `npm run seed:write` | Rewrites `sanity/seed.ndjson` from `scripts/generate-seed.ts` |
