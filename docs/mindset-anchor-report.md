# Mindset anchor batch report

Ten Mindset DRAFTs landed in two passes (v1 + v2). Both visible at
`/admin/tutorials?category=mindset` filterable by `type=PRACTICE` /
`type=READING`.

**v1 (2026-05-14, commit `ffc357f`).** Five anchor practices, one
per practice type. Rebecca reviewed the v1 tapping anchor and
flagged the whole batch as ethereal AI-poetry rather than
cooking-recipe-factual: imagined felt sensations dressed as
observations, methodology restated across every script, defensive
in-body disclaimers, vague "what you might notice" lists. Sub-
category was also wrong (null rather than the practice type).

**v2 (2026-05-15).** Two structural fixes + a register rewrite.
Five type-intro READING entries seeded so individual practice
scripts can assume the methodology rather than restate it. Eleven
SubCategory rows seeded so each practice maps to its practice
type. The five anchor practices re-authored in the cooking-recipe
register, with sub-categories set, methodology stripped, defensive
disclaimers removed, and "what you might notice" lists deleted
unless one concrete observation justified them.

## What's in the batch

### Type-intro READINGs (5, all sub-category `reading`)

| Slug | Title | Tutorial id |
|---|---|---|
| `how-eft-tapping-works` | How EFT tapping works | `cmp6khydg00025kv41xk744xr` |
| `how-energy-statements-work` | How energy statements work | `cmp6ki1e10001hgv4ym2nyi71` |
| `how-rituals-work` | How rituals work | `cmp6ki4kc0001o0v41moaibb2` |
| `body-based-meditation` | Body-based meditation | `cmp6ki7eq0002o4v4eyp1xwxv` |
| `journal-prompts-as-practice` | Journal prompts as practice | `cmp6kia3f0002wkv4ey57xqb7` |

Each READING is the canonical reference for its practice type.
Methodology lives here once. The corresponding practice scripts
link to the READING in their opening paragraph and assume it's
been read.

### Practice anchors (5, one per sub-category)

| Slug | Title | Type | Sub-category | Tutorial id |
|---|---|---|---|---|
| `tapping-for-daily-money-panic` | Tapping for daily money panic | TAPPING | `tapping` | `cmp5rhrfs0003vcv44aojhbl2` |
| `i-am-allowed-to-want-this` | I am allowed to want this | ENERGY_STATEMENT | `energy-statement` | `cmp5rhy7n000120v4ei1mh8hz` |
| `the-calm-and-safe-money-reset` | The Calm & Safe Money Reset | RITUAL | `ritual` | `cmp5rie4c0000ccv4vuc61a6x` |
| `body-scan-for-sleep` | Body scan for sleep | MEDITATION | `meditation` | `cmp5rikkk0001lcv4f1tm9jyx` |
| `feast-and-famine-journal-prompts` | Feast and famine — a journal prompt set | JOURNAL_PROMPT | `journal-prompt` | `cmp5rirb20001ikv4qwigp3ot` |

All five v1 rows were updated in place (same slugs, same Tutorial
ids); the upload script is idempotent on re-run.

## What changed in v2

### Voice register

- **Stripped imagined felt sensations from intros.** v1's
  "Money panic at 6am is the tight chest before you've opened
  your eyes. The bank-balance loop. The bracing for a day that
  hasn't started." became v2's "A five-minute tapping script
  adapted from Day 1 of Rebecca's MONEY program. The script
  targets recurring morning money worry — checking the bank
  balance before the day starts, running the numbers in the
  shower, the feeling of being behind before anything has
  happened." Factual lead. Specific examples. Same register as
  the cooking pilot tutorials.
- **Cut "what you might notice" lists.** The v1 tapping anchor's
  "A yawn or two. Tears, sometimes, on the third round. A
  loosening in the chest." section is gone. The pattern reads as
  AI-guessed universality; either an observation is concrete and
  worth one sentence, or it isn't worth stating.
- **Cut defensive in-body disclaimers.** v1's "If you're working
  with a healthcare or mental-health provider for anxiety, tell
  them you're trying this and see what they say." is gone. The
  section-level safety frame lives on `/mindset` and the legal
  pages.
- **Cut strange-metaphor tells.** "Steadier head", "the bracing",
  "the holding", "settling into the body" — all stripped.

### Structure

- **Methodology pulled out into READING entries.** v1's tapping
  anchor restated where the karate chop point is, how many
  times to tap, the eight-point order, the three-round structure.
  All of that now lives in `how-eft-tapping-works`. v2 tapping
  scripts link to it in the opening paragraph and drop straight
  into the karate chop. Same pattern for ritual (`how-rituals-work`),
  energy statements (`how-energy-statements-work`), meditation
  (`body-based-meditation`), and journal prompts
  (`journal-prompts-as-practice`).
- **Sub-categories set to practice types.** Each anchor's
  `subCategorySlug` now matches its practice type (`tapping`,
  `energy-statement`, `ritual`, `meditation`, `journal-prompt`).
  Eleven sub-categories total seeded under `mindset` Category
  (one per `PracticeType` enum value).

### Length

- The tapping anchor dropped from ~1,000 words (v1) to ~400
  words (v2). The ritual anchor from ~800 to ~350. The
  meditation from ~900 to ~500. Tighter and denser; the methodology
  moved to the type-intro reading; the practice script is the
  practice script.

## Voice-check pass

All 10 entries pass `voice-check` (0 errors).

| Slug | Errors | Warnings | Notes |
|---|---:|---:|---|
| `tapping-for-daily-money-panic` | 0 | 0 | Clean. |
| `i-am-allowed-to-want-this` | 0 | 0 | Clean. |
| `the-calm-and-safe-money-reset` | 0 | 8 | All intentional: 5 "Anchor"-the-ritual-step false positives (the word names the fifth step in Rebecca's five-part ritual structure, not the UK butter brand); 3 tricolons on Rebecca's exact ritual pullQuote lines (the three-fold repetition is the structure of the rite). |
| `body-scan-for-sleep` | 0 | 1 | "Fall asleep" verb usage false positive. |
| `feast-and-famine-journal-prompts` | 0 | 1 | One tricolon on a factual three-prompt summary. Intentional. |
| `how-eft-tapping-works` | 0 | 3 | All tricolons on accurate book-title lists ("MONEY, SLEEP, WEIGHT LOSS, and MANIFESTING") and factual three-item summaries. Intentional. |
| `how-energy-statements-work` | 0 | 0 | Clean. |
| `how-rituals-work` | 0 | 6 | "Anchor"-the-ritual-step + intentional tricolons on Rebecca's framework. |
| `body-based-meditation` | 0 | 4 | "Anchor"-the-ritual-step (referenced in cross-link to ritual reading) + tricolons on factual three-family / three-source lists. Intentional. |
| `journal-prompts-as-practice` | 0 | 0 | Clean. |

The recurring "Anchor" false positive is the strongest argument
for the voice-check Mindset extension session: the brand-trademark
rule needs context-sensitive matching ("anchor butter" rather than
bare "anchor") or a Mindset-context allowlist.

## What Rebecca should look at first

1. **The cooking-recipe register.** Read the v2 tapping anchor
   (`tapping-for-daily-money-panic`) and confirm it reads as
   factual / observed / cooking-recipe-clean rather than as
   ethereal AI-poetry. If it still drifts, the v2 prompt needs
   another pass.
2. **The type-intro readings.** `how-eft-tapping-works` is the
   model for the other four type-intros. Read it first. The
   shape (what the method is, how a session runs, where it comes
   from, scope statement, lineage credit) is what `how-rituals-work`,
   `how-energy-statements-work`, `body-based-meditation`, and
   `journal-prompts-as-practice` follow.
3. **The sub-category navigation.** Admin browse should now show
   five mindset sub-categories with content
   (Tapping / Energy statements / Ritual / Meditation / Journal
   prompt — and `Reading` with the five type-intros). The other
   six sub-categories (Affirmation, Spell, Activity, Visualisation,
   Embodiment) are seeded but empty.
4. **The cross-references.** Each practice now links to its
   type-intro reading at the top, plus to one or two sibling
   practices in the "When this isn't working" section. The
   linking reads as a network rather than a tree.

## Anti-tells doc updates

`docs/mindset-anti-tells.md` gained 5 new entries in v2, all
flagged `[block]`:

1. **Ethereal-poetic register** — the headline failure mode.
2. **Defensive in-body disclaimer** — the inflammatory pattern.
3. **Methodology restatement in practice scripts** — the
   content-bloat pattern.
4. **"What you might notice" lists** — the AI-guessed-universality
   pattern.
5. **Strange-metaphor tells** — metaphors without literal anchors.

The full list now sits at 16 entries, 14 of them `[block]`. Eight
are flagged `[needs-voice-check]` for the voice-check Mindset
extension session.

## What's still out of scope

- **No voice-check.ts deterministic-rule edits** — the new v2
  anti-tells captured for the drafting prompt's self-critique
  pass only. Voice-check extension is the next Mindset session.
- **No new TipTap blocks** — the v2 anchor batch shipped using
  existing blocks. The three block gaps flagged in the v1 report
  (`tappingScript`, `ritualSteps`, `practiceStatement`) are still
  follow-up work; v2 made the case stronger by reducing the
  number of paragraphs each script needs.
- **No pilot-10, no bulk fill, no plan generator, no admin UI,
  no public UI.**

## Next Mindset session, in order

1. **Voice-check CLI extension** — `[needs-voice-check]` entries
   from `docs/mindset-anti-tells.md` into `voice-check-lib.ts`.
   Also fix the bare-`anchor` false positive (match `anchor
   butter` instead).
2. **Pilot-10 batch with auto-publish flow.** Phase 8 Step 11–12
   pattern. Picks 10 practices across types from the backlog.
3. **Bulk fill standing pattern** consuming
   `docs/mindset-backlog.md`.
4. *(optional)* **Mindset-blocks gap fill** — `tappingScript` /
   `ritualSteps` / `practiceStatement` TipTap blocks if the
   pilot-10 reveals the same shape repeating enough to justify
   them.
5. **Admin UI** type-toggle in `tutorial-form.tsx`.
6. **Public UI** for Mindset.
7. **Plan generator worker.**
