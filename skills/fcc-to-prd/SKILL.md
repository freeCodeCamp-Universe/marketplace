---
name: fcc-to-prd
description: Turn the current conversation into a PRD for a freeCodeCamp constellation project (curriculum, app, game, site, or tool) and save it to the project — no interview, just synthesis of what was already discussed. Typically follows an fcc-refine-idea session.
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a PRD. Do NOT interview the user — just synthesize what you already know. A PRD records what was decided: anything not established in the conversation or the brief belongs in Open Questions, not stated as a decision.

## Process

1. Explore the repo or boilerplate to understand the current state, if you haven't already. If a brief from `fcc-refine-idea` exists (`docs/briefs/<slug>-brief.md`), treat it as the source of truth for concept, learner, and scope.

2. Sketch the seams at which you're going to test the feature. Prefer seams the stack or boilerplate already provides (component boundaries, game-state layer, level/lesson definitions) over new ones. Place any new seam at the highest point you can — the fewer seams, the better; the ideal number is one.

   Check with the user that these seams match their expectations. This is the only checkpoint — after it, write the PRD without further questions.

3. Write the PRD to `docs/specs/<slug>-prd.md` using the template below.

<prd-template>

## Problem Statement

The problem the audience is facing, from their perspective. Constellation projects serve ordinary people who want to learn, advance their skills, get more productive, or add a tool to their belt.

## Audience & Outcome

Who exactly, their starting point, and the one testable outcome — carried from the brief.

## Solution

The solution to the problem, from the audience's perspective.

## Core Loop

The repeating interaction that delivers the value.

## User Stories

A LONG, numbered list of user stories, each in the format:

1. As a <actor>, I want <feature>, so that <benefit>

<user-story-example>
1. As a learner who freezes writing flexbox unaided, I want the preview to update on every keystroke, so that I can see the effect of each property before committing to it
</user-story-example>

This list should be extremely extensive and cover all aspects of the project.

## Implementation Decisions

The implementation decisions that were made: modules built or modified, their interfaces, architectural decisions, schema changes, API contracts, specific interactions.

Do NOT include specific file paths or code snippets — they go stale quickly. Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision, trimmed to the decision-rich parts, and note it came from a prototype.

## Testing Decisions

What makes a good test (external behavior only, not implementation details), which modules will be tested at the agreed seams, and prior art for the tests in the codebase.

## fCC Alignment

Confirm: free, no login required to start, works on low-end devices, keyboard and screen reader accessible, Command-line Chic styling. Note any deliberate deviation and why.

## Out of Scope

The explicit cut list.

## Open Questions

Everything the conversation did not settle — content details, tuning values, hosting, metrics. Surface these; do not resolve them yourself.

## Further Notes

</prd-template>
