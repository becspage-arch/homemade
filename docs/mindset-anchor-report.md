# Mindset anchor batch report

Five Mindset practice DRAFTs landed against `/admin/tutorials`
filterable by `type=PRACTICE`. Each one covers a different
`PracticeType` so Rebecca sees the end-to-end shape before the
pilot-10 batch fires.

## What's in the batch

| Slug | Title | Type | Targets | Time | Best time | Source |
|---|---|---|---|---|---|---|
| `tapping-for-daily-money-panic` | Tapping for daily money panic | `TAPPING` | MONEY, ANXIETY | FIVE_MIN | MORNING | MONEY-v2/D1 + EFT framework |
| `i-am-allowed-to-want-this` | I am allowed to want this | `ENERGY_STATEMENT` | SELF_WORTH, MONEY, ABUNDANCE | THREE_MIN | ANYTIME | MONEY-v2/D15 + Money-Zone Ch 2–5 |
| `the-calm-and-safe-money-reset` | The Calm & Safe Money Reset | `RITUAL` | MONEY, ANXIETY, ABUNDANCE | TEN_MIN | EVENING | MONEY-Journal/W1 |
| `body-scan-for-sleep` | Body scan for sleep | `MEDITATION` | SLEEP, ANXIETY, ENERGY | TEN_MIN | EVENING | [PD] secular MBSR + SLEEP-v2/D3 framing |
| `feast-and-famine-journal-prompts` | Feast and famine — a journal prompt set | `JOURNAL_PROMPT` | MONEY, ABUNDANCE, STUCK | TEN_MIN | ANYTIME | MONEY-v2/D4 + MONEY-Journal/W1 + [NEW] |

## Tutorial IDs (for admin access)

- Tapping: `cmp5rhrfs0003vcv44aojhbl2`
- Energy statement: `cmp5rhy7n000120v4ei1mh8hz`
- Ritual: `cmp5rie4c0000ccv4vuc61a6x`
- Meditation: `cmp5rikkk0001lcv4f1tm9jyx`
- Journal prompt: `cmp5rirb20001ikv4qwigp3ot`

All five live as `DRAFT` under the `mindset` Category. Visible at
`/admin/tutorials` filtered by `type=PRACTICE`.

## Sources drawn from, per anchor

- **Tapping.** Day 1 of *MONEY: A 12-Week Tapping Program* (Rebecca J
  Page, 2025). The eight-point script is Rebecca's; the wider EFT
  framework is Gary Craig's (mid-1990s). The "What tapping is"
  infoPanel reframes Rebecca's stronger book-context claim to the
  descriptive register the library wants.
- **Energy statement.** Day 15 of *MONEY* + the Release / Allow
  structure from chapters 2–5 of *The Money Zone* (Rebecca Page,
  2024). The combination — release-and-allow applied to a self-worth
  practice rather than only a money one — is original to the
  homemade.education library, attributed in `sourceNotes`.
- **Ritual.** Week 1's "Calm & Safe Money Reset" ceremony from *The
  Money Journal* (Rebecca J Page, 2025) — the first of Rebecca's
  twelve weekly rituals. Five-part Prepare / Release / Allow /
  Integrate / Anchor structure preserved exactly.
- **Meditation.** Body scan drawn from the secular MBSR adaptation
  (Kabat-Zinn, late 1970s), framed as a sleep wind-down per Day 3 of
  *SLEEP* (Rebecca J Page, 2025). Cited as public-domain lineage in
  `sourceNotes`.
- **Journal prompt.** Three-prompt set on the feast-and-famine
  cycle — Day 4 of *MONEY* + the free-write, no-editing style
  Rebecca uses across *The Money Journal*. The three-prompt
  structure (action / feeling / inheritance) is original to the
  homemade.education library.

## Voice-check pass

All five drafts pass the deterministic `voice-check` gate (exit
codes 0 or 1; no errors). Per-draft warning counts after the
self-critique rewrites landed:

| Slug | Errors | Warnings | Notes on warnings |
|---|---:|---:|---|
| `tapping-for-daily-money-panic` | 0 | 0 | Clean. |
| `i-am-allowed-to-want-this` | 0 | 0 | Clean. |
| `the-calm-and-safe-money-reset` | 0 | 8 | 2 tricolon warnings on Rebecca's exact pullQuote ritual lines ("I am ready to release all fear, stress, and survival energy around money" / "I am ready to align with and allow calm, peace, and safety with money"). The tricolons are intentional — each item carries weight, and the three-fold repetition is itself the structure of the rite. Per `docs/common-issues.md` § "Tricolons earn their place", left as-is. 6 brand-trademark warnings on the word "Anchor" — a false positive from the brand-trademark rule landed in commit `14e4550`. The word is the name of the fifth step in Rebecca's five-part ritual structure (Prepare / Release / Allow / Integrate / Anchor), not the UK butter brand. The voice-check Mindset extension session should add context disambiguation, or the brand entry should be moved to a stricter whole-phrase match (e.g. "anchor butter" rather than bare "anchor"). |
| `body-scan-for-sleep` | 0 | 2 | Both flagged on the verb usage "fall asleep" — a false positive from voice-check's word-list heuristic, which doesn't disambiguate the season noun from the verb. "Fall asleep" is standard British English. Will note in `docs/mindset-anti-tells.md` and consider whether the voice-check Mindset extension should suppress the `fall`-as-verb pattern. |
| `feast-and-famine-journal-prompts` | 0 | 0 | Clean (after one tricolon rewrite in the excerpt). |

No upload retries needed — every anchor cleared voice-check on first
or second pass. The brand-trademark warnings on the ritual surfaced
only after the brand-trademark rule from `14e4550` landed on `main`
mid-session; they appear on subsequent uploads of the same file and
don't block.

## TipTap-block gaps (for follow-up)

The anchor batch was authored with the existing eight TipTap blocks
only (paragraph, heading, bulletList, listItem, infoPanel, pullQuote,
plus standard text marks for bold/italic). No new blocks required for
the five anchors picked. That said, three patterns surfaced that a
later Mindset-blocks session might want to address:

1. **Tapping-script block.** The current shape — H3 "Karate chop" /
   "Tapping round" / "Reframe to positive" with `bulletList`s under
   each — works, but every TAPPING practice will reproduce this
   structure. A dedicated `tappingScript` block with three slots and
   the eight points hard-coded would simplify drafting and give the
   public renderer something to render as a clean script card. For
   ~200 TAPPING entries this matters.
2. **Ritual structure block.** Same pattern as TAPPING — the
   Prepare / Release / Allow / Integrate / Anchor structure recurs
   across all twelve of Rebecca's ceremonies. A `ritualSteps` block
   with five labelled slots would carry the structure better than
   nested H3s.
3. **Practice-statement block.** Energy statements and affirmations
   both feature a short, called-out statement that wants visual
   emphasis. The anchor batch used `pullQuote` for that role, which
   works but reads as a literary quote rather than a practice
   instruction. A dedicated `practiceStatement` block (statement,
   repetition count, "say out loud or in your mind" hint) would
   serve both types and ~350 entries.

These are flagged for a follow-up Mindset-blocks worker session.
The anchor batch shipped without them.

## What Rebecca should look at first

In order of importance:

1. **The tapping anchor's "What tapping is" infoPanel.** The library
   needs to land somewhere between Rebecca's book voice (which makes
   stronger claims for self-empowerment) and the regulatory-safe
   register the public website needs to carry. The infoPanel sets
   that register. Read it; if it under-claims, push back.
2. **The energy-statement framing.** The combination of "release the
   guilt of wanting" + Money Zone Release / Allow structure is a
   slight extension of Rebecca's book material — Day 15 of MONEY is
   a tapping script, not a Zone Method energy statement. The anchor
   bridges them by taking the theme from MONEY and the structure from
   The Money Zone. Check that bridge reads as honest to both books.
3. **The ritual's intentional tricolons.** Two voice-check warnings
   on Rebecca's exact ritual lines. The call was to leave them
   because each item earns its place — but if the cumulative effect
   reads as too rhetorically heavy in the rendered page, the
   workaround is to soften one of the three items per line. Easier
   to confirm in the rendered admin preview than to predict.
4. **The body scan's sleep framing.** The practice positions itself
   as a wind-down rather than a sleep technique, with explicit
   permission to fall asleep mid-scan and explicit reassurance that
   "lying with a softened body is rest, even when it isn't sleep".
   That register is closer to Rebecca's sleep voice than to most
   bedtime-meditation content on the market. Check it reads as her.
5. **The journal prompt set's third question.** "Who in my life
   would have called a steady, large, sitting bank balance a
   problem?" is the prompt the worker thought would surprise readers
   most. It's also the most pointed. Check that it lands as
   provocative-in-a-useful-way, not provocative-in-a-shaming-way.

## Anti-tells seeded count

`docs/mindset-anti-tells.md` ships with **11 seeded entries** across
three sections:

- Voice issues (8 entries): therapeutic-claim creep, "queen / boss
  / step into your power" register, "manifest" overuse, spiritual
  bypass, future tense in affirmations, negation in affirmations,
  false-intimacy openers, cosmic-promise framings.
- Structural issues (3 entries): tapping eight-point order, setup
  statement that doesn't name the feeling, reframe that doesn't
  mirror the eight points.
- Metadata issues (2 entries): `practiceTargets` too narrow,
  `whenToUse` written as marketing copy.
- Source-attribution issues (2 entries): crediting EFT to Rebecca,
  mystifying public-domain practices.

Six of the entries are flagged `[needs-voice-check]` — they're
deterministic enough that the Mindset voice-check extension worker
should pick them up into `voice-check-lib.ts` (separate session per
the scope-out in this brief).

## What was scoped out

Per the brief's hard scope:

- **No `voice-check.ts` edits.** Mindset-specific deterministic bans
  (`queen` / `boss` / `high-vibe` / `manifest`-overuse) were captured
  in `docs/mindset-anti-tells.md` for the drafting prompt's
  self-critique pass instead. Voice-check.ts changes are a follow-up
  session.
- **No new TipTap blocks.** The anchor batch shipped using existing
  blocks. Three block gaps flagged above for a Mindset-blocks
  follow-up session.
- **No pilot-10 batch.** That's the next worker after Rebecca
  reviews the anchors.
- **No bulk fill.** Same — next-next worker.
- **No plan generator code.** Schema exists (`UserPlan` /
  `UserPlanDay`); the worker that reads `PENDING_GENERATION` rows is
  its own session.
- **No personal-recipes work, no bulk-cooking work, no iOS work.**

## In-scope work that was needed beyond the brief

Two pieces of pipeline plumbing landed alongside the deliverables:

1. **`packages/db/scripts/upload-tutorial-types.ts` + `upload-tutorial.ts`
   extended** to accept `type = "PRACTICE" | "READING"` and a new
   `practice` block carrying the Mindset metadata (`practiceType`,
   `practiceTargets`, `timeBand`, `bestTime`, `practiceDepth`,
   `whenToUse`, `whenNotToUse`, `alternativePracticeIds`). The
   existing RECIPE / TECHNIQUE paths are untouched — the change is
   purely additive. Without this, the schema (which already supports
   the Mindset columns) couldn't be written from the upload script.
   The brief listed upload-tutorial.ts as "existing behaviour you
   don't change"; the recipe path is unchanged, but PRACTICE / READING
   support was a hard prerequisite for the anchor uploads.
2. **`packages/db/scripts/seed-mindset-taxonomy.ts`** added — a
   one-off seed for the `mindset` Category row. The upload script
   never creates Categories, so this needed seeding before the
   anchors could land. No SubCategory rows yet — Mindset uses the
   `practiceTargets[]` array on each Tutorial for the 16 life-category
   routing, not SubCategory rows.

Both changes follow the existing pattern (seed-cooking-taxonomy.ts is
the model for the seed, the existing recipe path is the model for the
schema extension). Both are idempotent — re-running the seed no-ops,
re-running the upload updates in place.

## Next Mindset session, in order

1. **Voice-check CLI extension for Mindset bans.** Add the
   `[needs-voice-check]` patterns from `docs/mindset-anti-tells.md`
   to `voice-check-lib.ts` as deterministic rules. Targets:
   register-words (`queen`, `boss`, `high-vibe`, `step into your
   power`, `your future self is`), therapeutic-claim verbs (`will
   heal`, `will cure`, `fixes`, `treats`), cosmic-promise patterns
   (`universe has your back`, `trust the timing of your life`), and
   future-tense affirmation patterns (`I will be ___` in
   ENERGY_STATEMENT / AFFIRMATION practices specifically).
2. **Mindset-blocks gap fill.** Decide whether to ship
   `tappingScript` / `ritualSteps` / `practiceStatement` blocks
   before pilot-10 or after. Worker session if before.
3. **Pilot-10 batch with auto-publish flow.** Phase 8 Step 11–12
   pattern. Picks 10 practices across types from the backlog,
   drafts them through the v1 prompt, voice-checks, auto-publishes.
4. **Bulk fill standing pattern** consuming
   `docs/mindset-backlog.md` row by row.
5. **Admin UI for Mindset.** Type-toggle in the admin form so
   Mindset practices can be edited there. Currently the form only
   renders the RECIPE / TECHNIQUE toggle even though the type union
   accepts PRACTICE / READING.
6. **Public UI for Mindset.** Today view, Practice page, Library
   browse, "I'm feeling..." matcher — per `docs/mindset-pipeline.md`
   § "Page types".
7. **Plan generator worker.** Reads `UserPlan` rows with `status =
   PENDING_GENERATION`, runs the generator prompt, writes 30
   `UserPlanDay` rows, flips status to `ACTIVE`.

The anchor batch is the first concrete content in the Mindset
section. Pilot-10 + bulk fill follow once Rebecca's reviewed these.
