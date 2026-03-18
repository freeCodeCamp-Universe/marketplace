# i18n Curriculum Plugin

A multi-agent pipeline for building language curriculum content across CEFR levels A1–C2.
Works with any target language — Spanish, Portuguese, French, German, and beyond.

> **Note:** Carmen and Marcos are internal codenames for the researcher/planner and task creator agents. The names are not language-specific.

---

## What's inside

| Agent                 | Command       | Role                                                                                                                                             |
| --------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Carmen** | `/carmen`     | Researcher & planner — reads the Google Sheets planning spreadsheet, maps language framework concepts, writes detailed task sequences with `—carmen` signature |
| **Marcos** | `/marcos`     | Task creator — reads Carmen's plan from Google Sheets and writes `.md` task files directly into a cloned Git repo on a feature branch                          |
| **Curriculum**        | `/curriculum` | Orchestrator — runs Carmen → Marcos in sequence with a review checkpoint in between                                                              |

Plus a **task validation hook** that automatically checks every `.md` file Marcos writes for structural correctness.

---

## Setup (first time only)

**→ See [`setup/credentials-setup.md`](setup/credentials-setup.md) for complete step-by-step instructions.**

High-level summary:

1. Admin creates a Google Cloud service account and shares the credentials JSON with the team
2. Each team member stores the JSON as the `GOOGLE_SERVICE_ACCOUNT_JSON` environment variable
3. Each team member clones the curriculum Git repo
4. Each team member installs and authenticates the GitHub CLI (`gh auth login`) for PR creation

---

## Installation

Extract the plugin zip, then open the Claude desktop app:

- **Mac/Linux**: Settings → Plugins → Install from folder → select `i18n-curriculum/`
- **Windows**: Same path using the Windows folder picker

All three slash commands appear immediately after installation.

---

## Running the pipeline

Every session, you'll tell the agents two things:

- The Google Sheet URL (or name) for the planning spreadsheet
- The path to your cloned curriculum repo (for Marcos)

### Full pipeline

```
/curriculum — plan and create module 2 of "Describing a Company" chapter
```

Carmen plans → you review → Marcos creates task files on your current feature branch.

### Planning only

```
/carmen — plan module 2 of "Describing a Company and Its People" chapter
Sheet: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
```

### Task creation only (after Carmen has planned)

```
/marcos — create tasks for "Describing a Company" chapter, module 2
Repo: /Users/yourname/projects/your-curriculum-repo
Sheet: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
```

---

## Branch protection

Marcos checks the current Git branch before writing any file. If you are on `main` or `master`, Marcos stops and asks you to create a feature branch first:

```
⛔ You are on the `main` branch. I can't write task files to `main`.
Please create a feature branch first, for example:
git checkout -b feat/describing-a-company-module-2
Then let me know when you're ready.
```

Create the branch yourself, then re-run Marcos. He will confirm the branch and proceed.

---

## Carmen's signature system

When Carmen adds content to the Google Sheet (only when explicitly directed), it marks its contributions with a `—carmen` signature so the team can distinguish Carmen's input from human-authored content.

When updating a cell that already has team-written content, Carmen appends a suggestion in _italic_ + `—carmen` rather than overwriting:

> _Suggested task sequence: ..._
> _—carmen_

Carmen never writes to the sheet without being asked.

---

## Validation hook

After every `.md` file is written, the plugin automatically runs a structural check:

```
┌─ 📋 Task Validator: PRACTICE_task-2.md
│  ✅ All structure checks passed.
└──────────────────────────────────────────────
```

If something is wrong:

```
┌─ 📋 Task Validator: PRACTICE_task-3.md
│  ⚠️  MC task missing: ## --video-solution-- (correct answer index)
│
│  1 warning(s) — review before committing to GitHub.
└──────────────────────────────────────────────
```

Warnings only — the file is still created, but flagged for review.

---

## GitHub CLI — PR creation

After Marcos finishes creating task files, he will provide a ready-to-run `gh pr create` command. Run it in your terminal to open a draft PR. No token or plugin configuration is needed — just the GitHub CLI installed and authenticated (`gh auth login`).

---

## CEFR level coverage

Carmen works across all levels. When starting a new level, tell Carmen which level and provide the new sheet URL. Carmen automatically reads all prior-level sheets before planning to avoid concept repetition.

---

## Team roles

| Role            | Primary agent | What they do                                                 |
| --------------- | ------------- | ------------------------------------------------------------ |
| Curriculum Lead | `/carmen`     | Plans modules, sets task sequences, updates the Google Sheet |
| Content Writer  | `/marcos`     | Creates task files from Carmen's plan on a feature branch    |
| Reviewer        | Both          | Reviews task files before PR merge                           |
| Pipeline Owner  | `/curriculum` | Runs the full Carmen → Marcos pipeline                       |

---

## Updating the plugin

Skill files live in `skills/carmen/SKILL.md`, `skills/marcos/SKILL.md`, and `skills/curriculum/SKILL.md`. Edit them to refine agent behavior, then repackage and redistribute the zip.
