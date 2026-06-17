---
name: sync-small-superblocks
description: >
  Check whether the standalone "small" superblocks in the freeCodeCamp
  curriculum are in sync with the v9 superblock modules they are derived from,
  and report every block that was added, moved, or removed in the big superblock
  but not reflected in the small one. Invoke with /sync-small-superblocks. Use
  for: "check small superblocks", "superblocks out of sync", "sync superblocks",
  "missing curriculum blocks", "compare superblock modules".
---

# Sync Small Superblocks

You are an agent that audits the freeCodeCamp curriculum for drift between the
large v9 superblocks and the standalone "small" superblocks derived from them,
then reports what is out of sync.

The curriculum has large v9 superblocks (e.g. `javascript-v9`,
`responsive-web-design-v9`) organized into chapters and modules. Many smaller
standalone superblocks (e.g. `introduction-to-loops-in-javascript`, `basic-html`)
mirror a single module of a big superblock so learners can take that slice on its
own. When a block is added to, moved between, or removed from a module in a big
superblock, the matching small superblock is often not updated. This skill finds
those drifts.

Two files define each superblock's block list:

- **Structure file**: `curriculum/structure/superblocks/<name>.json`. A big
  superblock is shaped `{"chapters": [{"modules": [...]}]}`; a small superblock
  is shaped `{"blocks": [...]}`.
- **Intro file**: `client/i18n/locales/english/intro.json`. Each superblock key
  has a `blocks` object mapping block name to its `{title, intro}`.

All paths are relative to the freeCodeCamp repository root.

## When to use this skill

- A maintainer wants to confirm the standalone superblocks still match the v9
  curriculum after blocks were added, reordered, moved, or removed.

## Prerequisites

- Run from the root of a freeCodeCamp/freeCodeCamp checkout (the directory
  containing `curriculum/` and `client/`).
- Work from an up-to-date `main`. The mapping depends on the exact current block
  lists, so a stale or PR-branch checkout produces stale results. Confirm with
  `git rev-parse --abbrev-ref HEAD` and pull the latest `main` first.
- Python 3.

## Instructions

1. Confirm the working directory is a freeCodeCamp repo on up-to-date `main`.

2. Run the bundled detector from the repository root. The script reads the
   current working directory by default; override with `FCC_REPO` if needed:

   ```sh
   python3 path/to/this/skill/check_sync.py
   ```

   It prints JSON to stdout: `{"findings": [ ... ]}`. Each finding is one small
   superblock that is out of sync, with:
   - `small_superblock`, `source_superblock`, `modules` — the small superblock,
     the big superblock it derives from, and the source module(s).
   - `ambiguous_mapping` — `true` when the source module feeds more than one
     small superblock (e.g. the `git` module feeds both `introduction-to-nano`
     and `introduction-to-git-and-github`). Call these out for manual review.
   - `current_blocks` / `proposed_blocks` — the structure file's block list now
     and after the fix (missing blocks inserted in module order, stale blocks
     removed).
   - `missing` — blocks present in the source module but absent from the small
     superblock. Each has `block`, `after` (the block it should follow; `null`
     means first), `module`, `intro_content` (the `{title, intro}` from the big
     superblock, or `null` if the big intro has no entry), and
     `intro_already_present` (`true` when only the structure file needs the
     addition).
   - `stale` — blocks in the small superblock no longer in its source module.
     Each has `block`, `status` (`moved` or `removed`), `now_in_modules` (where a
     moved block went), and `intro_present_in_small`. Appended cert-project labs
     are NOT reported as stale; they legitimately live in a separate cert-project
     module.

3. Turn the JSON into a readable report (see Output format). Do not modify any
   files and do not open issues or PRs.

## Handling arguments

- A superblock name (e.g. `/sync-small-superblocks introduction-to-loops-in-javascript`)
  — run the full check, then report only that small superblock; note if it is in
  sync.
- No arguments — report every out-of-sync small superblock.

## Output format

A concise report:

- The branch/commit checked and the total number of out-of-sync small
  superblocks (state "all small superblocks are in sync" if there are none).
- One section per finding, headed by the small superblock and its source module:
  - **Add** lines: `<block>` to insert after `<after>` (or "at the start"); note
    when the intro already exists or when there is no intro entry in the big
    superblock.
  - **Move/Remove** lines: `<block>` moved to `<now_in_modules>` (so it should
    leave this small superblock) or removed entirely.
- A final note listing any `ambiguous_mapping` findings and any missing block
  whose `intro_content` is `null`, flagged for manual review.

For each finding, point to the two files that would need editing
(`curriculum/structure/superblocks/<name>.json` and
`client/i18n/locales/english/intro.json`) so a maintainer can act on the report.

## Guardrails

- Avoid editing curriculum files, opening issues, or pushing; only report
  findings and let the maintainer decide what to change.
- Avoid running against a stale or PR-branch checkout; verify up-to-date `main`
  first, since the report is only as accurate as the block lists on disk.
- Avoid inventing intro text; when reporting an intro to copy, use the
  `intro_content` the detector returns verbatim, and flag `null` entries.
- Avoid reporting appended cert-project labs as problems; the detector already
  excludes them, so do not re-flag extras it omitted.
