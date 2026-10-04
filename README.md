# Salt Wharf

Stage-door callboard for a Valletta theatre company. The public page is the board on the wall: who is actually called tonight. Backstage, a stage manager moves a call sheet through a workflow stored as documents, and asks the book who can cover a role.

Coverage is a function of range, skills, concurrent scenes, unavailability, and how many roles a person is already covering. It is not a maintained covers list.

## Run

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43173](http://127.0.0.1:43173). No environment variables are required. Fixture mode reads `sanity/seed.ndjson`.

```bash
npm run build
npm start
```

`npm run build` also runs `npm run verify`, which checks the seed story: the later posted sheet wins, and the cover traces for Rosa hold.

## Stage door

The backstage gate is disclosed, not real authentication.

- Name: `elena`
- Passphrase: `callboard`

`/backstage` is the desk. `/` is the door.

## How the supersedes rule works

A night can have more than one call sheet. The board does not print the newest document, and it does not print every sheet that still says `posted`.

It prints the posted sheet for that date that no other **posted** sheet for the same date points at with `supersedes`.

In the seed, 4 October 2026 has two posted sheets:

1. `callSheet-oct4-v1` still names Mara Camilleri as Rosa.
2. `callSheet-oct4-v2` sets `supersedes` to the first sheet and names Lina Borg, because Camilleri is unavailable.

The door shows Borg. The first sheet is still in the dataset, still `posted`, and still wrong if you read it in isolation.

If the later sheet leaves the posted set — returned to draft with a written reason, or struck — it can no longer hide the sheet it replaced.

## Coverage

`lib/coverage.ts` is the only source of truth for who can stand in. For each person it checks, in this order:

1. vocal range contains the role's required range (scientific pitch, e.g. G3–C5)
2. skills are a superset of the role's required skills
3. the person is not cast, and not called, in a scene that `runsConcurrentWith` the role's scene
4. the person is not on `unavailableDates` for that night
5. the person is not already covering two other roles that night

The first failed predicate is what the desk prints.

## Sanity

Sanity project `ebwymj6z`, dataset `production` (public). Studio lives at `/studio` when `SANITY_PROJECT_ID` is set. With that variable unset, the app stays in fixture mode and `/studio` stays parked.

Copy `.env.example`. The project id and dataset are already filled. Leave the tokens empty unless you need live writes:

```
SANITY_PROJECT_ID=ebwymj6z
SANITY_DATASET=production
SANITY_API_READ_TOKEN=
SANITY_API_WRITE_TOKEN=
```

Import the same seed the app already uses:

```bash
npx sanity dataset import sanity/seed.ndjson production
```

Schema is TypeScript under `sanity/schema`. The desk structure groups call sheets by status and opens a Callboard tool that resolves the standing posted sheet with the same function as the public door.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next.js on port 43173 |
| `npm run build` | Verify seed, then production build |
| `npm run verify` | Assert the 4 October cover story |
| `npm run seed:write` | Rewrite `sanity/seed.ndjson` from `scripts/generate-seed.ts` |
