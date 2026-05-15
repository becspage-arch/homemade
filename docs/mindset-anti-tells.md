# Mindset anti-tells — drafts that recur

Patterns that recur in Mindset drafts often enough to be worth
catching proactively during self-critique. Maintained as a living
list — the equivalent of `docs/common-issues.md` for the Cooking
pipeline.

**How this list is used:**

- Every Mindset drafting worker reads this file at session start.
- The body-authoring self-critique pass (see `docs/mindset-author.md`
  § "Self-critique pass") includes a step that checks each entry
  below against the draft and rewrites any matching line.
- When a worker spots a new pattern recurring 3+ times in its batch,
  it appends an entry at the end of the relevant section before the
  session hands off.
- When Rebecca spot-checks live practices and finds a recurring
  issue, she adds an entry directly. The next batch picks it up.
- Where a pattern is deterministic (a banned phrase, a banned
  register-word), it should also be added to
  `packages/db/scripts/voice-check.ts` so the upload gate catches
  it without relying on self-critique. The Mindset-specific
  voice-check extension is its own session — entries marked
  `[needs-voice-check]` are ready to land there.

Format per entry: a short rule, **Why**, **How to fix**. Severity
flag with the rule: `[block]` (rewrite mandatory), `[warn]` (rewrite
preferred but not required).

Seeded with the patterns the anchor-batch worker spotted in the
source material + the voice rules. Will accrue more entries as
pilot / bulk batches surface recurring tells.

---

## Voice issues

- **Ethereal-poetic register** `[block]`
  Pattern: prose that swaps factual description for imagined felt
  sensations dressed as observation. The single biggest failure
  mode in the v1 anchor batch (Rebecca's review, 2026-05-15).
  Examples from v1:
  - "Money panic at 6am is the tight chest before you've opened
    your eyes. The bank-balance loop. The bracing for a day that
    hasn't started."
  - "...settle the nervous system enough that you can look at the
    day with a steadier head."
  - "A yawn or two. Tears, sometimes, on the third round. A
    loosening in the chest."
  Each one is the AI imagining what a felt sensation feels like
  and pretending it's a universal observation.
  **Why:** The audience clocks the register as AI-imagined. Real
  authority in this space comes from being specific about the
  practice (eight points, three rounds, five minutes) — not from
  guessing what the reader's body is doing. The cooking-recipe
  register works because it describes the dish, not how the eater
  will feel. Mindset uses the same register: describe the
  practice, not the felt experience the user might have.
  **How to fix:** Strip imagined felt sensations from intros,
  "what you might notice" sections, and closing paragraphs. Lead
  with what the practice is: "A five-minute tapping practice from
  Day 1 of *MONEY*. The script targets recurring daily money
  worry." Where felt sensation appears inside a script line (e.g.
  the Tapping Round naming "I'm tired of carrying this"), it
  stays — that's the source-faithful practice content. Outside
  the script, the prose stays factual.

- **Defensive in-body disclaimer** `[block]`
  Pattern: a sentence in the practice body warning the user to
  consult a healthcare professional. "If you're working with a
  mental-health provider for anxiety, tell them you're trying this
  and see what they say." Inflammatory rather than reassuring —
  reads as the publication covering itself instead of guiding
  the user.
  **Why:** Section-level disclaimers live in legal pages and on
  section landing pages, not in individual practices. A practice
  page that warns the user every time reads as anxious, not
  authoritative. The cooking recipes don't include "consult your
  GP before eating eggs"; Mindset shouldn't either.
  **How to fix:** Cut the in-body disclaimer entirely. The
  section-level safety frame lives on `/mindset` and the legal
  pages.

- **Methodology restatement in practice scripts** `[block]`
  Pattern: every tapping script restating where the karate chop
  point is, that you tap five to seven times, that you go through
  the round three times. Same for meditations restating breath
  technique, rituals restating the five-part shape, journal sets
  restating free-write rules.
  **Why:** Across ~200 tapping scripts the user reads the same
  five paragraphs of methodology. It's content-bloat and reads
  as defensive padding. One READING entry per practice type
  carries the methodology; individual scripts assume it.
  **How to fix:** Cut every methodology paragraph from the script
  body. Add a single one-line link to the type-intro READING at
  the top: "New to tapping? Read [how EFT tapping works] first."
  Drop straight into the karate chop.

- **"What you might notice" lists** `[block]`
  Pattern: a section listing vague felt effects — "a yawn or two",
  "tears, sometimes", "a sudden urge to check the bank balance,
  or the opposite, no urge at all", "a loosening in the chest".
  Reads as the AI guessing what's universal.
  **Why:** Either an effect is concrete and worth stating in one
  sentence, or it isn't worth stating. A list of "you might feel
  X or you might feel the opposite of X" is filler — it reads as
  scaffolding around an absent observation.
  **How to fix:** Cut the whole section unless one observation is
  concrete and useful (e.g. "Most people slow down on the third
  pass of the script" — observed, specific, actionable). If you
  can't name one such observation, skip the section.

- **Strange-metaphor tells** `[warn]`
  Pattern: metaphors that lack a literal anchor. "A steadier
  head" (was the head wobbling?), "the bracing" (bracing for
  what?), "the holding" (holding what?), "settling into the
  body" (where in the body?). Each is the AI reaching for
  emotional weight without grounding it.
  **Why:** A metaphor needs a literal anchor — name the thing the
  metaphor is standing in for. Without the anchor, the metaphor
  reads as imagined depth.
  **How to fix:** Either anchor the metaphor (e.g. "a steady
  voice when you re-read the bills email") or cut it.


- **Therapeutic-claim creep** `[block]` `[needs-voice-check]`
  Pattern: practices framed as "this will fix / cure / heal / treat
  / clear X". Drift toward language that implies medical or
  therapeutic authority. Particularly common on tapping practices
  drawn from `MONEY-v2` and `SLEEP-v2` where the source material
  uses stronger claims for the book context than the library wants
  to carry.
  **Why:** Homemade is a homemaking publication, not a clinical
  service. Therapeutic claims invite regulatory attention and harm
  trust when the practice doesn't deliver the promised cure. Mindset
  practices are tools the user holds — not treatments applied to
  the user.
  **How to fix:** Replace "this will heal your money fear" with
  "this is a practice for when money fear is up." Replace "tapping
  clears anxiety" with "tapping is a self-regulation tool you can
  use when anxiety is up." Practices are described as *what they
  are*, not *what they cure*. See `docs/mindset-author.md` §
  "Safety voice".

- **"Queen / boss / step into your power" register** `[block]` `[needs-voice-check]`
  Pattern: "step into your money queen energy", "your boss-self is
  waiting", "rise into your power", "claim your throne". The
  manifestation-Instagram register the audience finds embarrassing
  (see `docs/mindset-pipeline.md` § "The user").
  **Why:** The Mindset audience is post-this-register. She finds
  "high-vibe queen" energy embarrassing. The voice rule is locked
  in `project_mindset_planning.md` and `feedback_homemade_voice.md`.
  **How to fix:** Cut the register-word. Rebuild the sentence around
  the actual feeling or action. "Step into your money queen energy"
  → "Sit with the picture of money sitting easily in your account
  for a full month." Be specific; lose the register.

- **"Manifest" overuse** `[warn]` `[needs-voice-check]`
  Pattern: "manifest" as the primary verb of every paragraph.
  "Manifest the money, manifest the house, manifest the calm."
  Manifesting is one method among the eleven — it's not the umbrella
  term for everything Mindset does.
  **Why:** Over-reliance flattens the practice diversity (tapping,
  ritual, journal, embodiment, visualisation all collapse to
  "manifesting"). The audience reads it as Instagram-coded.
  **How to fix:** Once per practice maximum. Prefer specific verbs —
  "tap", "say", "write down", "picture", "release", "allow", "sit
  with", "name". When the practice is genuinely about manifesting
  (the MANIFESTING book material), use it — but once, not as the
  refrain.

- **Spiritual bypass — practice as replacement for action** `[block]`
  Pattern: practices framed as a way to avoid a real-world problem.
  "Tap until the debt goes away." "Visualise the money and don't
  look at the bills." Spiritual bypass is one of the strongest
  failure modes in the manifesting-content space.
  **Why:** The audience trusts the section because it isn't this.
  Bypassed advice undermines the practice's actual value — which is
  to settle the nervous system enough to take real-world action.
  **How to fix:** Frame practices as *alongside* action, not *instead
  of* action. "Tap to release the panic so you can look at the debt
  with a steady head, then make the next concrete decision." The
  practice prepares the body to do the thing — it doesn't replace
  the thing.

- **Future tense in affirmations / energy statements** `[block]`
  Pattern: "I will be safe with money." "I will be calm." "I will
  have abundance." Future tense weakens the statement — it pushes
  the new reality away from now.
  **Why:** Affirmations and energy statements work as state-
  declarations in the present. Future-tense versions read as wishes,
  which the nervous system parses as "this isn't true yet".
  **How to fix:** Rewrite as present tense. "I am safe with money."
  "I am calm." "I am holding abundance." If the statement feels
  untrue in present tense, the gap is the work — name a smaller
  truer present-tense version. "I am safe in this moment" is true
  even when "I am safe with money" isn't yet.

- **Negation in affirmations** `[block]`
  Pattern: "I am no longer afraid of money." "I don't worry about
  debt." "I'm not stuck anymore." The nervous system parses the
  noun, not the negation — "afraid", "worry", "stuck" — and the
  affirmation reinforces the thing it's trying to release.
  **Why:** Standard affirmation craft. Positive construction
  ("I am safe", "I trust", "I have") works; negation construction
  ("I am not afraid") doesn't.
  **How to fix:** Rewrite to positive construction. "I am no longer
  afraid of money" → "I am safe with money." "I don't worry about
  debt" → "I look at the number from steady ground."

- **False-intimacy openers** `[warn]` `[needs-voice-check]`
  Pattern: "I see you." "You're seen." "I get it." "I know what it's
  like." "I've been there." The AI-as-friend opening that promises
  emotional intimacy the page can't deliver.
  **Why:** The reader can tell the difference between Rebecca
  speaking from her actual experience (which she does in her books)
  and the AI ventriloquising sympathy. The latter erodes trust.
  **How to fix:** Replace with a specific observation about what the
  practice does. "I see you" → "Money panic at 6am is the tight
  chest before you've even opened your eyes." Direct, specific,
  earned.

- **Cosmic-promise framings** `[block]` `[needs-voice-check]`
  Pattern: "the universe has your back", "everything happens for
  a reason", "your vibration is your destiny", "trust the timing of
  your life", "you are exactly where you need to be". The
  Instagram-spirituality register the audience clocks instantly.
  **Why:** Unfalsifiable cosmic claims do the same harm as
  therapeutic-claim creep, in the other direction. They also
  trample on the audience's loss / grief / hard-thing-happening
  experience — "everything happens for a reason" lands badly to
  someone in acute pain.
  **How to fix:** Cut the cosmic frame. State what the practice
  actually does. "Trust the timing of your life" → "Sit with not
  knowing when the next thing arrives — and the practice you do in
  the meantime."

## Structural issues

- **Tapping script missing the eight-point order** `[block]`
  Pattern: a tapping practice that names six or seven of the eight
  points, or rearranges them, or invents new points. The eight
  points in Rebecca's books are always in this order: Eyebrow → Side
  of Eye → Under Eye → Under Nose → Chin → Collarbone → Under Arm →
  Top of Head.
  **Why:** Consistency across the library matters. Users learn the
  eight-point sequence once and apply it everywhere. Variants
  fragment the muscle memory.
  **How to fix:** Both the Tapping Round and the Reframe to Positive
  must include all eight points in the canonical order. Each line
  short. Use Rebecca's lines from the source-day script where they
  fit.

- **Setup statement that doesn't name the feeling** `[block]`
  Pattern: a karate-chop set-up statement that's generic — "Even
  though I have some money stuff, I deeply and completely accept
  myself" — instead of naming the specific feeling. Tapping practice
  needs the felt name of the thing being worked with for the
  script to do its work.
  **Why:** EFT practice depends on naming the felt sensation
  specifically — that's what the tapping is regulating around.
  Generic set-ups don't engage the limbic system.
  **How to fix:** Name the felt feeling, the body location, or the
  specific story. "Even though I wake up gripped before the day
  starts, with a tight chest and the bank balance looping in my
  head, I deeply and completely accept myself." Specific.

- **Reframe that doesn't mirror the eight points** `[block]`
  Pattern: a Reframe to Positive section that has fewer lines than
  the Tapping Round, or rearranges the order, or doesn't move from
  acknowledgement to where the user is going.
  **Why:** The reframe is the lift. It walks the user from the named
  feeling to a place that feels possible. Mirroring the eight-point
  order anchors that walk in muscle memory.
  **How to fix:** Eight lines, same order as the Tapping Round, each
  reframed. The first line lifts gently ("I give myself permission
  to breathe right now") — it doesn't leap to the destination ("I
  am wealthy and free"). The last line ("Top of Head") is allowed
  to be the most aspirational.

## Metadata issues

- **`practiceTargets` too narrow** `[warn]`
  Pattern: a practice that obviously serves multiple targets but
  gets tagged with one. A money-tapping practice that also calms
  anxiety should be tagged `["MONEY", "ANXIETY"]`, not just
  `["MONEY"]` — the "I'm feeling..." matcher needs both routes.
  **Why:** The matcher and the plan generator both read
  `practiceTargets`. A practice that only surfaces under MONEY
  misses the user who searched ANXIETY this morning.
  **How to fix:** Tag every plausibly-relevant target. Two or three
  targets is normal for a Mindset practice. More than four starts
  to suggest the practice is unfocused.

- **`whenToUse` written as marketing copy** `[warn]`
  Pattern: `whenToUse` written as a generic sentence — "For anyone
  feeling stressed about money." Instead of as a specific matcher
  trigger — "Use when you wake up already gripped by money before
  the day starts."
  **Why:** `whenToUse` is read aloud by the "I'm feeling..." matcher
  and the plan generator. It needs to be the felt situation that
  triggers reaching for this practice, not a sales pitch.
  **How to fix:** Write `whenToUse` as the felt moment. "When you've
  been awake since 3am running the numbers." "When the bills email
  has just arrived and your chest tightened." Specific moment,
  specific feeling.

## Source-attribution issues

- **Crediting EFT to Rebecca** `[block]`
  Pattern: a tapping practice's `sourceNotes` that says "EFT method
  developed by Rebecca Page" or similar. EFT is Gary Craig's method
  (mid-1990s), derived from Roger Callahan's Thought Field Therapy.
  Rebecca's contribution is the day-by-day programs and the specific
  scripts.
  **Why:** Honesty. Also: appropriating the EFT lineage harms trust
  with the readers who already know the field.
  **How to fix:** Credit the tapping framework to Gary Craig.
  Credit the specific script to Rebecca's book. "The tapping
  framework is Gary Craig's Emotional Freedom Technique (EFT), in
  use since the mid-1990s. The script for this practice is adapted
  from Day X of MONEY (Rebecca J Page, 2025)."

- **Mystifying public-domain practices** `[warn]`
  Pattern: a `[PD]` practice (body scan, breath meditation, candle
  ritual) that gets framed as Rebecca's invention or as a
  proprietary technique. These are public-domain practices with
  long lineages — the appropriation is mild but adds up.
  **Why:** The library benefits from honesty about what's whose. A
  body scan is body scan craft, not Homemade craft. The Homemade
  contribution is the curation + the voice.
  **How to fix:** Name the lineage. "Body scan meditation has
  multiple lineages — the version here draws on the secular
  mindfulness adaptations that became widespread through MBSR in
  the 1980s." Then deliver the practice in Rebecca's voice.

## Cross-category issues

(empty initially — populated once Mindset content runs alongside
Cooking content in the library and patterns emerge that cross both.)
