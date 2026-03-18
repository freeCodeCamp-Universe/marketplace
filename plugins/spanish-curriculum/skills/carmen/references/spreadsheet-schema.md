# Planning Spreadsheet Schema Reference

Each CEFR level has its own spreadsheet. All follow the same structure.

Current files:

- **A1:** `CL-A1 Spanish Planning-updated.xlsx`
- Future levels will follow the same naming pattern (e.g., `CL-A2 Spanish Planning.xlsx`)

---

## Chapter Status Sheet — Source of Truth for What's Been Built

### Columns

| Column         | Type                 | Notes                                                                        |
| -------------- | -------------------- | ---------------------------------------------------------------------------- |
| Due Date       | Date or blank        | When this item is due                                                        |
| Person/Status  | Text                 | Name (in progress), `Merged 🎉` (complete), or a number (unassigned backlog) |
| Type           | Text                 | `Chapter`, `Module`, `Learn`, `Warm-up`, `Practice`, `Review`, `Quiz`        |
| Name           | Human-readable title |                                                                              |
| dashed-name    | Text                 | URL slug — always `es-[level]-[type]-[kebab-case]`                           |
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

## Grammar / Pronunciation / Ortography Sheets — PCIC Concept Inventory

These contain the raw PCIC reference material for the level. Header row structure:

```
Section | Subsection / Item | Topic | Example / Notes | Block 1 | Block 2 | Block 3
```

- **Section** — broad grammar/pronunciation/ortography category
- **Subsection / Item** — PCIC section number (e.g., `1.2. El género de los sustantivos`)
- **Topic** — the specific teachable concept
- **Example / Notes** — sample language or clarifying notes
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
3. Plan curricular table (Gramática | Function | Vocabulario | Nociones | etc.)
4. Pragmatics row (Tácticas | Géneros | Ortografía | Pronunciación | Cultura)
5. Block sequence rows (Warm-up, Learn, Practice, Review, Quiz)

---

## URL Slug Naming Conventions

Slugs follow this pattern: `es-[level]-[type]-[kebab-case-name]`

| CEFR Level | Level code | Example slug                           |
| ---------- | ---------- | -------------------------------------- |
| A1         | `a1`       | `es-a1-learn-greetings-during-the-day` |
| A2         | `a2`       | `es-a2-learn-preterite-regular-verbs`  |
| B1         | `b1`       | `es-b1-learn-subjunctive-introduction` |

| Block Type | Slug type segment | Example                                         |
| ---------- | ----------------- | ----------------------------------------------- |
| Chapter    | `chapter`         | `es-a1-chapter-spanish-fundamentals`            |
| Module     | `module`          | `es-a1-module-letters-sounds-and-first-numbers` |
| Learn      | `learn`           | `es-a1-learn-vowels`                            |
| Warm-up    | `warm-up`         | `es-a1-warm-up-greetings-basics`                |
| Practice   | `practice`        | `es-a1-practice-the-alphabet`                   |
| Review     | `review`          | `es-a1-review-spanish-fundamentals`             |
| Quiz       | `quiz`            | `es-a1-quiz-spanish-fundamentals`               |

---

## A1 Curriculum Status (current snapshot)

| #   | Chapter                             | Modules                                  | Status              |
| --- | ----------------------------------- | ---------------------------------------- | ------------------- |
| 0   | Welcome to A1 Professional Spanish  | —                                        | Chapter header only |
| 1   | Spanish Fundamentals                | Module 1: Letters, Sounds, First Numbers | ✅ Complete         |
| 2   | Greetings and Introductions         | Module 1: Greetings and Farewells        | ✅ Complete         |
| 3   | Describing a Company and Its People | Multiple modules                         | 🔄 In progress      |

Always re-read the Chapter Status sheet to get the current state — this table
may be out of date.
