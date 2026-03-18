# Planning Spreadsheet Schema Reference

Each CEFR level has its own spreadsheet. All follow the same structure.

Each team names their spreadsheets according to their language and level, e.g.:

- `[lang-code]-[level] Curriculum Planning` (e.g., `es-a1 Curriculum Planning`)
- Future levels follow the same naming pattern

---

## Chapter Status Sheet — Source of Truth for What's Been Built

### Columns

| Column         | Type                 | Notes                                                                        |
| -------------- | -------------------- | ---------------------------------------------------------------------------- |
| Due Date       | Date or blank        | When this item is due                                                        |
| Person/Status  | Text                 | Name (in progress), `Merged 🎉` (complete), or a number (unassigned backlog) |
| Type           | Text                 | `Chapter`, `Module`, `Learn`, `Warm-up`, `Practice`, `Review`, `Quiz`        |
| Name           | Human-readable title |                                                                              |
| dashed-name    | Text                 | URL slug — always `[lang-code]-[level]-[type]-[kebab-case]`                  |
| QA             | Boolean              | True = passed quality review                                                 |
| PR Links/notes | Text                 | GitHub PR URL or notes                                                       |

### Status Interpretation

| Status value                   | Meaning                                       |
| ------------------------------ | --------------------------------------------- |
| `Merged 🎉`                    | **Fully complete and live** — treat as TAUGHT |
| Person's name (e.g., "Rafael") | In progress — NOT yet taught                  |
| Number (e.g., 0, 1, 2)         | Backlog / unassigned — NOT yet taught         |
| Blank                          | Row is a Chapter header, not a task           |

### Block Hierarchy

```
Chapter  (Type = "Chapter")
  └── Module  (Type = "Module")
        ├── Warm-up
        ├── Learn       (may repeat for multiple topics)
        ├── Practice
        ├── Review
        └── Quiz
```

---

## Framework Concept Inventory Sheets (e.g., Grammar / Pronunciation / Orthography)

These contain the official language framework reference material for the level.
Tab names vary by team and framework — Carmen confirms which tabs are in use at
session start. Typical header row structure:

```
Section | Subsection / Item | Topic | Example / Notes | Block 1 | Block 2 | Block 3
```

- **Section** — broad category (grammar domain, pronunciation area, etc.)
- **Subsection / Item** — framework reference number or code
- **Topic** — the specific teachable concept
- **Example / Notes** — sample language in the target language or clarifying notes
- **Block 1–3** — which curriculum blocks cover this concept (often empty; don't rely on these alone)

---

## Chapter Content Sheets — Module Planning Detail

Each completed chapter has its own sheet named after it (e.g., `Greetings and Introductions`). These show the Plan curricular tables and block sequences for all modules in that chapter.

**When to read these:**

- During Research & Plan mode: to understand the depth and style of prior modules
- During Refine mode: as the primary object of review

---

## Chapter Template Sheet

The canonical format for all module planning. Always consult this sheet before
producing a Module Brief to ensure the format matches exactly.

Structure:

1. Chapter objective
2. Module title and learning goal
3. Framework planning table (columns defined by the official framework in use —
   follow the structure already present in this sheet)
4. Block sequence rows (Warm-up, Learn, Practice, Review, Quiz)

---

## URL Slug Naming Conventions

Slugs follow this pattern: `[lang-code]-[level]-[type]-[kebab-case-name]`

Where `[lang-code]` is the ISO 639-1 code for the target language (e.g., `es`
for Spanish, `pt` for Portuguese, `fr` for French, `de` for German).

| CEFR Level | Level code | Example slug (Spanish)                    |
| ---------- | ---------- | ----------------------------------------- |
| A1         | `a1`       | `es-a1-learn-greetings-during-the-day`    |
| A2         | `a2`       | `es-a2-learn-preterite-regular-verbs`     |
| B1         | `b1`       | `es-b1-learn-subjunctive-introduction`    |

| Block Type | Slug type segment | Example (Spanish A1)                              |
| ---------- | ----------------- | ------------------------------------------------- |
| Chapter    | `chapter`         | `es-a1-chapter-target-language-fundamentals`      |
| Module     | `module`          | `es-a1-module-letters-sounds-and-first-numbers`   |
| Learn      | `learn`           | `es-a1-learn-vowels`                              |
| Warm-up    | `warm-up`         | `es-a1-warm-up-greetings-basics`                  |
| Practice   | `practice`        | `es-a1-practice-the-alphabet`                     |
| Review     | `review`          | `es-a1-review-target-language-fundamentals`       |
| Quiz       | `quiz`            | `es-a1-quiz-target-language-fundamentals`         |

Always re-read the Chapter Status sheet for the current curriculum state — do
not rely on any static snapshot here.
