# Folder Structure & File Naming Reference

All task files go into the user's selected working folder, organized by chapter
and module. This structure makes it easy for the i18n & UI Strategist to locate
and review tasks before they go into the freeCodeCamp repo.

---

## Folder Hierarchy

```
[Selected folder]/
└── [Chapter Name]/
    └── [Module Name]/
        ├── WARM-UP_task-1.md
        ├── LEARN_task-1.md
        ├── LEARN_task-2.md
        ├── PRACTICE_task-1.md
        ├── REVIEW-GRAMMAR_task-1.md     ← template pending
        ├── REVIEW-GLOSSARY_task-1.md    ← template pending
        └── QUIZ_task-1.md               ← template pending
```

**Chapter Name** and **Module Name** come directly from Carmen's Module Brief.
Use the exact names as written — don't abbreviate, slug-ify, or rephrase them.

---

## Real Examples

```
Describing a Company and Its People/
└── Module 2 - Company Departments and Roles/
    ├── WARM-UP_task-1.md
    ├── LEARN_task-1.md
    ├── LEARN_task-2.md
    ├── LEARN_task-3.md
    ├── PRACTICE_task-1.md
    ├── PRACTICE_task-2.md
    ├── REVIEW-GRAMMAR_task-1.md
    ├── REVIEW-GLOSSARY_task-1.md
    └── QUIZ_task-1.md

Spanish Fundamentals/
└── Module 1 - Letters, Sounds and First Numbers/
    ├── WARM-UP_task-1.md
    ├── LEARN_task-1.md
    ├── LEARN_task-2.md
    ├── LEARN_task-3.md
    ├── PRACTICE_task-1.md
    ├── REVIEW-GRAMMAR_task-1.md
    ├── REVIEW-GLOSSARY_task-1.md
    └── QUIZ_task-1.md
```

---

## File Naming Rules

### Prefix

Each file's name starts with the block type prefix — always uppercase, always
followed by an underscore:

| Block                               | Prefix            |
| ----------------------------------- | ----------------- |
| Warm-up                             | `WARM-UP`         |
| Learn                               | `LEARN`           |
| Practice                            | `PRACTICE`        |
| Review (grammar explanation)        | `REVIEW-GRAMMAR`  |
| Review (glossary / vocabulary list) | `REVIEW-GLOSSARY` |
| Quiz                                | `QUIZ`            |

### Task number

After the prefix, add `_task-[N]` where N starts at 1 and increments within
that prefix only. Each prefix has its own independent counter.

```
LEARN_task-1.md      ← first Learn task
LEARN_task-2.md      ← second Learn task
LEARN_task-3.md      ← third Learn task
PRACTICE_task-1.md   ← first Practice task (counter resets — not task-4)
PRACTICE_task-2.md   ← second Practice task
```

### Full file name pattern

```
[PREFIX]_task-[N].md
```

Examples:

- `WARM-UP_task-1.md`
- `LEARN_task-1.md`
- `LEARN_task-2.md`
- `PRACTICE_task-1.md`
- `REVIEW-GRAMMAR_task-1.md`
- `REVIEW-GLOSSARY_task-1.md`
- `QUIZ_task-1.md`

---

## How Many Files Per Block?

The Module Brief's concept list and block sequence tells you:

- **Warm-up**: typically 1 file (one concept to activate prior knowledge)
- **Learn**: one file per concept in the Learn block (could be 1–4 files)
- **Practice**: one file per concept being practiced (often matches Learn count)
- **Review-Grammar**: typically 1 file per module (grammar highlight summary)
- **Review-Glossary**: typically 1 file per module (vocabulary list)
- **Quiz**: typically 1 file per module (10 or 20 questions)

When in doubt, follow the "Suggested Block Sequence" section of the Module Brief
exactly — it lists each task explicitly.

---

## Handoff to i18n & UI Strategist

When the module folder is complete, it's passed to the i18n & UI Strategist for
review. They will check:

- Structural correctness (all required sections present)
- Language consistency and translation readiness
- UI rendering compatibility

Marcos does not submit to the freeCodeCamp repo directly — that step happens
after the i18n & UI Strategist approves the files.
