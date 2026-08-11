---
name: learning-of-the-day
description: Write a new Learning of the Day entry for this Astro site — a system design component, pattern, or research paper summarised with a decision rule, prerequisites, an explicit coverage boundary, a hands-on build in Node/JS, sources, and a mastery path. Use when asked to add, draft, or review a learning entry, when the user asks "teach me the next thing", or when the user asks what to learn today.
---

# Learning of the Day

Write one entry into `src/content/learning/`. The reader is a JavaScript
full-stack developer (React, Next, Node) who is still a student — they cannot
tell when a topic has been covered badly, so the entry has to make its own
quality visible.

## The rule that matters most

**Never silently omit an adjacent topic.** The reader has no way to detect a
gap. Every entry therefore declares its own boundary in `scope.notCovered`,
with a reason and a pointer to where the excluded topic belongs.

If while writing you think *"that's related but too big to include"* — that
thought is a `notCovered` entry. Write it down instead of dropping it.

Do **not** pad `notCovered` with unrelated topics to look thorough. It lists
things a reasonable person would expect to find here and won't. Test: would
someone searching for this topic plausibly land on this page? If yes and it's
absent, it goes in `notCovered`.

## Before writing: the coverage sweep

Do this before drafting, not after. For the chosen topic, write out:

1. **Variants** — every kind of the thing (L4/L7/DNS/client-side; FIFO/pub-sub/log/task; etc.)
2. **Algorithms** — the named algorithms practitioners argue about
3. **Failure modes** — what pages someone at 3am
4. **Operations** — health, metrics, rollout, capacity
5. **Neighbours** — topics one hop away that share vocabulary with this one

Everything in 1–4 belongs in the entry. Everything in 5 is either covered or
goes in `notCovered`. Nothing from the sweep may be dropped without appearing
in one of those two places.

Then sanity-check the name collisions. Topics that *sound* related often
aren't (flood fill vs token bucket), and topics that sound unrelated often are.
If a term shares a word with the topic, say explicitly whether it belongs.

## The bar: explain → choose → defend

The goal is architectural judgement, not vocabulary. "I know Kafka" is not
senior. The target is:

> "Given these constraints, this architecture is appropriate. Here is the
> bottleneck, here is how it fails, here is how we scale it, and here is the
> trade-off we're accepting."

Every entry must carry the reader to **level 3**:

1. **Explain** — what the thing is and what kinds exist
2. **Choose** — given constraints, pick one and say why
3. **Defend** — answer "why not X?" and "when is this the wrong call?"

An entry that stops at level 1 is a Wikipedia summary. Rewrite it.

## Picking the topic

`curriculum.md` in this folder is the backlog — it holds the full phase-ordered
topic list, the capstone systems, and the reader's context. **Read it and take
the next unchecked item** unless the user names a topic. Phases are ordered by
dependency, so don't jump ahead without checking earlier phases for unwritten
prerequisites; anything missing goes into the entry's `prerequisites`.

After writing, tick the item in `curriculum.md` and put the entry's date-slug
next to it. That file is the memory of what's been covered — an untick means it
will get written twice.

Also check `src/content/blog/` for overlap with existing posts.

Within those constraints, prefer a topic that is:

1. Something the reader will hit in real work within six months
2. A genuine "which one do I use" decision — that decision is the entry's spine
3. Buildable in Node in under an hour — the hands-on section is not optional

A topic with no decision to make and nothing to build makes a bad entry. Take
the next one on the list instead, and note why you skipped it.

## File and frontmatter

Path: `src/content/learning/YYYY-MM-DD-slug.md` — the date prefix is the URL
and the archive ordering, so it must be the intended publish date.

Schema lives in `src/content.config.ts` (`learning` collection) and is
enforced at build time. Required fields:

| Field | What goes in it |
| --- | --- |
| `title` | The topic plus its angle, not a bare noun |
| `description` | One line for the archive list |
| `pubDate` | Matches the filename date |
| `kind` | `component` \| `pattern` \| `paper` |
| `tags` | Reuse existing tags where possible |
| `tldr` | One sentence worth remembering in a year. Not a definition — an insight |
| `decisionRule` | The actual heuristic for choosing between variants, under pressure |
| `prerequisites[]` | `topic`, `why`, `check` — `check` is a question they can answer to self-test |
| `scope.covered[]` | Plain statements of what's inside |
| `scope.notCovered[]` | `topic`, `why` (why excluded), `where` (which entry it belongs to) |
| `sources[]` | `title`, `url`, `type` — real, reachable, primary where possible |
| `mastery[]` | `stage` + `topics[]`, ordered foundations → operations |

### Prerequisites

Three to five. Each `check` must be answerable — a yes/no self-test, not a
vague "understand X". If a prerequisite is a whole language or runtime, say so
plainly (e.g. "you need Go for this one") rather than hiding it.

### Sources

Four to six. Prefer the primary source: the paper, the RFC, the vendor's own
docs. One accessible entry point plus one deep source beats six blog posts.
Never invent a URL — if unsure it exists, use a source you're certain of.

## Body structure

Markdown body, in this order. Headings feed the table of contents.

1. `## The one idea` — the single mental model everything else follows from
2. `## The <N> kinds` — the variants, each with what it can and can't do
3. `## Picking one` — a decision table mapping situation → choice
4. One or two `##` sections on the mechanics that actually bite (algorithms, semantics)
5. `## The failures that actually page you` — concrete, named, with the mechanism
6. `## Build it yourself` — see below
7. `## Defend your choice` — see below
8. `## Test yourself` — five questions answerable without looking anything up

## Defend your choice — the level-3 section

Three or four "why not?" questions with real answers, written as the exchange
that would happen in a design review. Each answer must name a *condition*, not
a preference:

> **"Why Redis here?"** — Because this data is read-heavy, tolerates a few
> seconds of staleness, and database latency is the current bottleneck.
>
> **"Why not Kafka?"** — At this throughput SQS is operationally simpler and
> we need neither partition ordering nor replay.

Include at least one question of the form **"when would this be the wrong
call?"** — a component with no downside has not been understood yet. Where the
honest answer is "the boring option is correct here", say that; recognising
over-engineering is part of the bar.

## Build it yourself — the section that must not be skipped

Node standard library only. No Express, no npm install, unless the topic
literally cannot be done without a dependency (say so if it can't).

- Numbered steps, each a complete runnable file with a `// run: node x.js` comment
- Under an hour total
- Include the shell commands to verify each step, with what to look for
- **Include a step that breaks it on purpose** — reproducing one failure mode from section 5 is what turns the list into knowledge
- Where the demo is anticlimactic, say so honestly ("with uniform backends you'll barely see a difference — which is the lesson")

If the topic is genuinely not buildable locally (a distributed consensus
protocol, say), build the smallest honest slice of it and state what the toy
version leaves out.

## Voice

Direct and concrete. Explain the mechanism, not the vibe. Prefer a table over
prose for anything enumerable. No filler intros, no "in today's fast-paced
world". Assume intelligence, don't assume knowledge.

## Before finishing

- `npx astro build` — the schema is validated at build; a missing field fails the build
- Re-read the coverage sweep: is every item in 1–4 present, and every item in 5 either covered or in `notCovered`?
- Does the entry reach level 3 — could the reader defend the choice, not just name it?
- Every source URL is one you are confident exists
- Every code block runs as written, in order, from an empty folder
- Tick the topic in `curriculum.md` with its date-slug, or it will be written twice

If the dev server was running while `src/content.config.ts` changed, restart it
— Astro does not hot-reload a new or altered collection, and the page will
render with an empty list until it restarts.
