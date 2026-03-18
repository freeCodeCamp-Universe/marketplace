# Task Formats Reference

All task files are Markdown using `# --section--` headings. Every file starts
with an HTML comment documenting the audio line, then follows the template for
its block type and interaction format.

---

## Format Selection Guide

Choose the interaction format based on what best tests the concept:

| Concept type                                                | Best format                          |
| ----------------------------------------------------------- | ------------------------------------ |
| Comprehension — did they understand what they heard?        | Multiple Choice                      |
| Vocabulary — do they know a specific word or phrase?        | Fill in the Blank                    |
| Grammar rule — true/false about a pattern they just learned | True or False                        |
| Numbers, names, factual recall                              | Multiple Choice or Fill in the Blank |
| Sentence structure — building from parts                    | Fill in the Blank                    |

Within each block type, the **purpose** of the description differs:

- **Warm-up**: Brief intro to prime the learner. No grammar explanations. Simple.
- **Learn**: Full teaching moment. Explain the rule, give examples in description.
- **Practice**: Confirmation task. No examples — learner applies knowledge alone.

---

## Block Type Differences at a Glance

|                           | Warm-up                  | Learn                       | Practice                                   |
| ------------------------- | ------------------------ | --------------------------- | ------------------------------------------ |
| Description style         | Brief intro, no examples | Full explanation + examples | State concept being practiced, no examples |
| Question complexity       | Simple                   | Moderate                    | Moderate to challenging                    |
| Explanation depth         | Brief, flag gotchas      | Reinforce teaching point    | Reinforce + expand                         |
| Has `--video-solution--`? | Yes (MC/TF)              | Yes (MC/TF)                 | Yes (MC/TF)                                |

---

## Correct Answer Rule

**The correct answer never has a `### --feedback--` block under it.**
Wrong answers always do.

Do **not** add any comment to the correct answer line. The absence of a `### --feedback--` block is the only signal needed.

---

## Formatting Rules

**No `→` arrows.** Use a dash `-` instead in all explanations and conjugation pairs.

- ✅ `desarrollar` - `desarrolla` (to develop - develops)
- ❌ `desarrollar` → `desarrolla`

**`For example:` spacing.** When introducing examples in a description or explanation:

- Always put a blank line before `For example:`
- If there is **only one example**, write it on the next line without a `-` bullet
- If there are **two or more examples**, use `-` bullets for each

Single example (no bullet):

```
...pattern used throughout this module.

For example:
`La empresa tiene veinticinco empleados.` — The company has twenty-five employees.
```

Multiple examples (bullets):

```
...structure used throughout this module:

For example:
- `La empresa tiene veinticinco empleados.` — The company has twenty-five employees.
- `El equipo tiene seis miembros.` — The team has six members.
```

---

## Spanish vs. English Backtick Rules

These rules apply everywhere: answer options, descriptions, explanations, and feedback.

**Rule 1 — All Spanish content gets backticks.**
Any Spanish word, phrase, fragment, or full sentence must be wrapped in backticks.

- ✅ `La empresa crea productos digitales.`
- ❌ La empresa crea productos digitales.

**Rule 2 — English content never gets backticks.**
Plain English prose, English answer options, and English labels stay outside backticks.

- ✅ A technology company.
- ❌ `A technology company.`

**Rule 3 — Spanish answer options: backticks + capitalize the first letter.**
When an answer option is in Spanish, wrap it in backticks AND capitalize the first letter.

- ✅ `El departamento de marketing`.
- ✅ `La empresa CREA productos digitales`
- ❌ `el departamento de marketing`

**Rule 4 — English answer options: plain text, no backticks.**

- ✅ Twelve employees.
- ✅ A technology company.
- ❌ `Twelve employees.`

**Rule 5 — Structure patterns: only backtick the Spanish fragments, not the placeholders.**
When showing a grammatical pattern in an explanation, backtick each Spanish segment
but leave English placeholder labels outside backticks.

- ✅ `El departamento de` [department's name] + `tiene` + [number] + `empleados`.
- ❌ `El departamento de` `[department's name]` + `tiene` + `[number]` + `empleados`.

---

## Conjugation Task Format (Multiple Choice)

When the concept being tested is a verb conjugation, use full sentences as answer
options — not isolated words. The verb being tested must appear in UPPERCASE within
the sentence so the learner can clearly see what is being evaluated.

**Question stem:**

> Which of the following sentences is conjugated correctly with the verb `[verb]`?

**Answer options — full sentences, verb in uppercase:**

```
`La empresa CREAR productos digitales`    ← wrong (infinitive)
`La empresa CREAN productos digitales`    ← wrong (3rd plural)
`La empresa CREO productos digitales`     ← wrong (1st singular)
`La empresa CREA productos digitales`     ← correct
```

All options are Spanish sentences in backticks with the first letter capitalized.
Wrong-answer feedback explains which person/number/form was wrong and why.
The explanation shows the full conjugation table and highlights the 3rd person form.

---

## WARM-UP TASKS

### Warm-up: Multiple Choice

```markdown
<!-- (Audio) [SPANISH SENTENCE OR PHRASE THE LEARNER WILL HEAR] -->

# --description--

[Brief description of what the learner will listen to. Warm-ups prime the
learner for the Learn block — keep it light, no grammar explanations.
Descriptions are in English.]

# --instructions--

Listen to the audio and answer the question below.

# --questions--

## --text--

[Simple question about the audio. Clear and concise. In English.]

## --answers--

[Wrong answer 1]

### --feedback--

[Why this is wrong]

---

[Correct answer]

---

[Wrong answer 3]

### --feedback--

[Why this is wrong]

---

[Wrong answer 4]

### --feedback--

[Why this is wrong]

## --video-solution--

[Answer number: 1, 2, 3, or 4]

# --explanation--

[Brief explanation. Flag any gotchas or tricky terms the learner should notice.
In English.]
```

---

### Warm-up: Fill in the Blank

```markdown
<!-- (Audio) [SPANISH SENTENCE OR PHRASE THE LEARNER WILL HEAR] -->

# --description--

[Brief description of what the learner will listen to. Keep it light.
In English.]

# --instructions--

Listen to the audio and complete the sentence below.

# --fillInTheBlank--

## --sentence--

[Sentence with BLANK where the missing word(s) go. Use backticks for the
Spanish: `Hay BLANK personas en el BLANK.`]

## --blanks--

`[correct word for BLANK 1]`

### --feedback--

[Hint if wrong — e.g. "This word means 'three' in Spanish."]

---

`[correct word for BLANK 2]`

### --feedback--

[Hint if wrong]

---

`[correct word for BLANK 3]`

### --feedback--

[Hint if wrong]

# --explanation--

[Brief explanation. Flag gotchas. In English.]
```

---

### Warm-up: True or False

```markdown
<!-- (Audio) [SPANISH SENTENCE OR PHRASE THE LEARNER WILL HEAR] -->

# --description--

[Brief description of what the learner will listen to. In English.]

# --instructions--

Listen to the audio and decide if the following statement is true or false.

# --questions--

## --text--

Is it true or false: [Statement in English that the learner evaluates]

## --answers--

True

### --feedback--

[Feedback if True is wrong — or if True is correct, this block is omitted]

---

False

## --video-solution--

[2 for True, 1 for False — depending on which is correct]

# --explanation--

[Brief explanation. In English.]
```

---

## LEARN TASKS

Learn tasks are the core teaching moment. The description **must** explain the
grammar rule or concept and include examples. This is what separates Learn from
Warm-up and Practice.

### Learn: Multiple Choice

```markdown
<!-- (Audio) [SPANISH SENTENCE OR PHRASE THE LEARNER WILL HEAR] -->

# --description--

[Detailed explanation of the concept being taught. Include:

- What rule or pattern is illustrated
- Examples with backtick-formatted Spanish: `El equipo tiene seis miembros.`
- Why the grammar works this way
- Any related concepts the learner will also encounter
  Descriptions are in English.]

# --instructions--

Listen to the audio and answer the question below.

# --questions--

## --text--

[Clear question about the audio. In English.]

## --answers--

[Wrong answer 1]

### --feedback--

[Why this is wrong — help the learner understand the error]

---

[Correct answer]

---

[Wrong answer 3]

### --feedback--

[Why this is wrong]

---

[Wrong answer 4]

### --feedback--

[Why this is wrong]

## --video-solution--

[Answer number]

# --explanation--

[Reinforce the teaching point. Restate the Spanish from the audio and translate
it. Expand on any nuances. In English.]
```

---

### Learn: Fill in the Blank

```markdown
<!-- (Audio) [SPANISH SENTENCE OR PHRASE THE LEARNER WILL HEAR] -->

# --description--

[Detailed explanation of the concept. Include grammar rule + examples.
In English.]

# --instructions--

Listen to the audio and complete the sentence below.

# --fillInTheBlank--

## --sentence--

[Sentence with BLANK placeholders. Use backticks: `Hay BLANK en el BLANK.`]

## --blanks--

`[correct word]`

### --feedback--

[Helpful hint — what the word means, a spelling note, or why it fits here]

---

`[correct word]`

### --feedback--

[Helpful hint]

---

`[correct word]`

### --feedback--

[Helpful hint]

# --explanation--

[Reinforce the teaching point. Give the full sentence and translation.
Expand with related examples if useful. In English.]
```

---

### Learn: True or False

```markdown
<!-- (Audio) [SPANISH SENTENCE OR PHRASE THE LEARNER WILL HEAR] -->

# --description--

[Detailed explanation of the concept being taught. Include grammar rule +
examples. In English.]

# --instructions--

Listen to the audio and decide if the following statement is true or false.

# --questions--

## --text--

Is it true or false: [Statement]

## --answers--

True

### --feedback--

[Feedback if True is the wrong answer]

---

False

## --video-solution--

[2 for True, 1 for False]

# --explanation--

[Reinforce the teaching point. In English.]
```

---

## PRACTICE TASKS

Practice tasks are hands-off. The learner applies what they learned without
guidance. The description confirms what concept is being practiced but gives
**no examples** — that would give away the answer.

### Practice: Multiple Choice

```markdown
<!-- (Audio) [SPANISH SENTENCE OR PHRASE THE LEARNER WILL HEAR] -->

# --description--

[State what concept the learner is practicing. No examples. In English.
e.g. "In this task, you will practice identifying the verb `tener` used with
a third-person singular subject to express quantity."]

# --instructions--

Listen to the audio and answer the question below.

# --questions--

## --text--

[Well-formed question. In English.]

## --answers--

[Wrong answer 1]

### --feedback--

[Why this is wrong]

---

[Correct answer]

---

[Wrong answer 3]

### --feedback--

[Why this is wrong]

---

[Wrong answer 4]

### --feedback--

[Why this is wrong]

## --video-solution--

[Answer number]

# --explanation--

[Detailed explanation: restate the correct answer, explain the concept fully,
provide additional examples to reinforce learning. In English.]
```

---

### Practice: Fill in the Blank

```markdown
<!-- (Audio) [SPANISH SENTENCE OR PHRASE THE LEARNER WILL HEAR] -->

# --description--

[State what concept is being practiced. No examples. In English.]

# --instructions--

Listen to the audio and complete the sentence below.

# --fillInTheBlank--

## --sentence--

[Sentence with BLANK placeholders in backticks]

## --blanks--

`[correct word]`

### --feedback--

[Hint for when wrong]

---

`[correct word]`

### --feedback--

[Hint for when wrong]

---

`[correct word]`

### --feedback--

[Hint for when wrong]

# --explanation--

[Full explanation: complete sentence + translation, teaching points, and
expanded examples. In English.]
```

---

### Practice: True or False

```markdown
<!-- (Audio) [SPANISH SENTENCE OR PHRASE THE LEARNER WILL HEAR] -->

# --description--

[State what concept is being practiced. No examples. In English.]

# --instructions--

Listen to the audio and decide if the following statement is true or false.

# --questions--

## --text--

Is it true or false: [Statement]

## --answers--

True

### --feedback--

[Feedback if True is wrong]

---

False

## --video-solution--

[2 for True, 1 for False]

# --explanation--

[Full explanation. In English.]
```

---

## REVIEW TASKS

Review tasks have **no audio comment** at the top. They are read-only reference
blocks — no questions, no blanks, no video solution. The learner confirms they
read it via `# --assignment--`.

### Review-Grammar (`REVIEW-GRAMMAR_task-1.md`)

The grammar review is a short article reinforcing key grammar points from the
module's Learn blocks. Group content under `## Heading` sections. Use `<br />`
between sections. All Spanish examples use backticks. All prose is in English.

```markdown
<!-- GRAMMAR -->

# --description--

Congratulations! You're almost done with this module.

The article below will help you review some key grammar points covered in the
tasks, so you can feel confident before taking the Module Quiz.

Once you've read it, just mark the task as complete and move on to the next
part of the review.

## [Grammar Point 1 — e.g. "Subject Pronoun Omission"]

[Explanation of the grammar rule. Use backticks for Spanish examples.]

- `[Example sentence]` – [Translation]

- `[Example sentence]` – [Translation]

<br />

## [Grammar Point 2]

[Explanation. Examples.]

- `[Example sentence]` – [Translation]

<br />

## [Grammar Point 3]

[Explanation. Examples.]

<br />

# --assignment--

I confirm I read the grammar highlights.
```

---

### Review-Glossary (`REVIEW-GLOSSARY_task-1.md`)

The glossary lists all key vocabulary from the module, grouped by category and
in alphabetical order within each category. Use the `- \`Spanish\` – English`format. Use`<br>` between categories. No audio comment.

```markdown
<!-- GLOSSARY -->

# --description--

This **Glossary** is a quick reference of the most important words and phrases
from the content you've worked with in this module.

The words are organized by category and in alphabetical order.

## [Category 1 — e.g. "Greetings and Introductions"]

- `[Spanish word or phrase]` – [English translation]

- `[Spanish word or phrase]` – [English translation]

- `[Spanish word or phrase]` – [English translation]

<br>

## [Category 2]

- `[Spanish word or phrase]` – [English translation]

- `[Spanish word or phrase]` – [English translation]

<br>

## [Category 3]

- `[Spanish word or phrase]` – [English translation]

# --assignment--

I confirm I read the glossary.
```

---

## QUIZ TASKS

The quiz tests all concepts from the module. It has **no audio comment**, **no
feedback on distractors**, and **no `# --explanation--`**. Each question has
exactly **3 distractors** (wrong answers) and **1 answer** (correct answer).
Aim for 10 questions per module; 20 for larger modules. State the passing
threshold in the description.

### Quiz (`QUIZ_task-1.md`)

```markdown
# --description--

This quiz checks your understanding of [list of topics covered in the module].

To pass the quiz, you must correctly answer **at least [N] of the [total]**
questions below.

Read each question carefully and select the correct answer. There's only one
correct choice per question.

# --quizzes--

## --quiz--

### --question--

#### --text--

[Question text — clear and unambiguous. In English or Spanish as appropriate.]

#### --distractors--

[Wrong option 1]

---

[Wrong option 2]

---

[Wrong option 3]

#### --answer--

[Correct answer]

---

## --quiz--

### --question--

#### --text--

[Question text]

#### --distractors--

[Wrong option 1]

---

[Wrong option 2]

---

[Wrong option 3]

#### --answer--

[Correct answer]

---
```

> Repeat `## --quiz--` blocks for each question (10–20 total). No `### --feedback--`
> blocks anywhere in the quiz. The `#### --answer--` section contains only the
> correct answer text, followed by `---` to close the block.

---

## Quality Checklist

Before committing any task file, verify:

**All task types:**

- [ ] No `[PLACEHOLDER]` text left anywhere in the file
- [ ] All prose (descriptions, instructions, explanations) is in English
- [ ] All Spanish words, phrases, and sentences are wrapped in backticks
- [ ] English content (including English answer options) is NOT wrapped in backticks
- [ ] Spanish answer options have the first letter capitalized inside backticks
- [ ] Structure patterns in explanations: Spanish fragments in backticks, placeholder labels outside
- [ ] Conjugation tasks use full sentences as options, with the verb in UPPERCASE
- [ ] This task maps to exactly one concept from the Module Brief
- [ ] No `→` arrows anywhere — use `-` instead for all conjugation pairs and lists
- [ ] `For example:` has a blank line before it; single examples have no `-` bullet

**Warm-up / Learn / Practice only:**

- [ ] Audio comment at the top — Spanish sentence the learner will hear
- [ ] Correct answer has **no** `### --feedback--` block and **no** trailing comment
- [ ] All wrong answers have a `### --feedback--` block
- [ ] `--video-solution--` contains only a number (1, 2, 3, or 4)
- [ ] Description matches the block type (Warm-up = light; Learn = examples; Practice = no examples)

**REVIEW-GRAMMAR only:**

- [ ] Starts with `<!-- GRAMMAR -->` comment (no audio line)
- [ ] Content grouped under `## Heading` sections
- [ ] `<br />` spacer between each section
- [ ] Ends with `# --assignment--` → `I confirm I read the grammar highlights.`
- [ ] No `# --explanation--`, no questions, no blanks

**REVIEW-GLOSSARY only:**

- [ ] Starts with `<!-- GLOSSARY -->` comment (no audio line)
- [ ] Vocabulary grouped by category, alphabetical within each category
- [ ] Each entry uses `- \`Spanish\` – English` format
- [ ] `<br>` spacer between each category
- [ ] Ends with `# --assignment--` → `I confirm I read the glossary.`
- [ ] No `# --explanation--`, no questions, no blanks

**QUIZ only:**

- [ ] No audio comment at the top
- [ ] Description states the passing threshold (e.g. "at least 9 of 10")
- [ ] Each question has exactly **3 distractors** and **1 answer**
- [ ] No `### --feedback--` blocks anywhere in the quiz
- [ ] No `# --explanation--` section
- [ ] Each quiz block ends with `---` after `#### --answer--`
- [ ] 10 questions for standard modules, 20 for larger modules
