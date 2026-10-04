---
title: I built Salt Wharf, a Sanity callboard where the later posted sheet wins
published: false
tags: sanitychallenge
---

I built Salt Wharf as a stage-door callboard for a fictional Valletta theatre company. The public page is meant to feel like the sheet taped beside the stage door, not an admin dashboard: it answers one question for tonight, which is who is actually called.

The story in the data happens on 4 October 2026. There are two posted call sheets for that night. The first one still names Mara Camilleri as Rosa. The second one supersedes the first and posts Lina Borg because Camilleri is off. The public door shows Borg, while backstage still shows that the earlier posted sheet exists and does not win.

That was the Sanity-shaped part I wanted to make visible. I did not want to overwrite history just to get the correct door. The model keeps both sheets as documents. The later posted sheet points at the earlier one with `supersedes`, and the resolver prints the posted sheet for that date that no other posted sheet supersedes.

The other important piece is coverage. Salt Wharf does not store an understudy list. It computes whether someone can stand in from the role and the night:

1. the person's range contains the role's required range
2. their skills cover the role's required skills
3. they are not cast or called in a concurrent scene
4. they are not unavailable that night
5. they are not already covering two other roles

The backstage desk prints the first failed predicate for each rejected candidate, so the stage manager can see why Lina Borg is the workable cover for Rosa rather than treating the result as magic.

The fake stage-door credentials are intentionally printed for the challenge demo:

- name: `elena`
- passphrase: `callboard`

They are fake. They do not protect Sanity, GitHub, or any real system. Live Sanity writes still require the normal local environment configuration and a real write token. The repo keeps `SANITY_API_READ_TOKEN` and `SANITY_API_WRITE_TOKEN` empty.

Sanity project id: `ebwymj6z`

Dataset: `production`

The thing I like about this version is that the public door tells the current truth, while the backstage desk admits how that truth changed. A later posted sheet replaced an earlier posted sheet, the earlier record did not disappear, and the cover call is explainable from the company data.
