# Mindset pipeline plan

This is the planning document for the Mindset category — what to build,
what the user wants, how content fills, how the AI plan generator works,
and how it all sequences.

> **Status note — last updated 2026-05-14, several rounds of Rebecca
> review.** Sections in this doc that have been superseded or
> updated:
>
> - "Who this is for" framing was too modest. The user wants
>   aspirational + spiritual + wealthy without apology, Amanda
>   Frances–coded. Brainstorm doc carries the corrected version.
> - Voice register section was off. See `docs/mindset-brainstorm.md`.
> - Privacy framing was overcautious. The app *is* the private place
>   for this work — money, marriage, body are exactly what users
>   want in the app rather than dinner-table conversations.
> - Practice types expanded to 11 — Spells separated from Activities
>   and Rituals; Affirmations separated from Energy alignment
>   statements; Embodiment added.
> - Library target bumped to **~4,320 entries** at full depth across
>   16 life categories (full brainstorm now complete — see
>   `docs/mindset-brainstorm.md`). Perimenopause and Menopause are
>   explicit sub-categories within Body per Rebecca's instruction.
> - **Plan templates dropped as a content type.** No "The Money
>   Plan" etc. as named generic content. Library is everything
>   public-facing. The AI generator produces personalised plans
>   on demand; those plans don't have names.
> - **Plan generator is now two-tier:**
>   - **Free:** daily pick from the library, chosen for the user
>     each day. Curation, not generation.
>   - **Paid:** custom plan with AI-generated unique content per
>     user. Library is inspiration; output is fresh content stored
>     against `UserPlanDay`.
> - Schema updated (this doc) — PlanTemplate / PlanTemplateDay
>   dropped; UserPlanDay extended to hold either a library
>   reference or generated content; DailyPick table added for the
>   free surface.
>
> Read `docs/mindset-brainstorm.md` for the matrix (life category ×
> stuck-on × practice type), the corrected voice register, and the
> full plan-generator-free-vs-paid description. The schema sketch,
> page types, build sequence, and source-audit-first principle in
> this doc are current.

## The user

Same Homemade audience: women 32–48, slow-living-but-not-extreme,
disposable income, intentional. For Mindset specifically she's:

- Stuck on something specific — money, body, business, motherhood,
  purpose, a particular fear. She knows what it is.
- Has tried things. Read a book, watched some YouTube, dabbled in
  tapping, journals on and off. None of it stuck because she doesn't
  have a system.
- Doesn't want extreme spiritual. No "high-vibe queen" energy, no
  affirmation-shouting, no rented-yacht manifesting. She finds that
  embarrassing.
- Wants gentle, grounded, real. Practical. Quietly effective.
- Time-poor. Has 5 minutes in the morning and 5 at night, sometimes
  10, sometimes 30 on a Sunday.
- Resistant to woo but open to spiritual / energy work when it's
  presented well — by someone she trusts who isn't pushing it.
- Looking for "what do I do today?" not "here's 800 articles, pick
  one."
- Comes back when she falls off. Doesn't want streak-shaming.
- Privacy-sensitive. Tapping about money blocks, journal entries
  about her marriage. This isn't for sharing.

## What matters (and what doesn't)

### Matters
- **Right practice at right time.** She doesn't want to search for what
  she needs — she wants the right thing surfaced.
- **A daily structure that fits her actual life.** 5 min morning + 5
  min evening default. Anything longer is opt-in.
- **Connection to her real situation.** Not generic. "Money blocks"
  is too broad — "the money block where you can earn it but can't
  hold onto it" is specific enough.
- **Quiet progress visibility.** "You've done 14 of 30 days — here's
  what's shifted" beats "🔥 14-day streak!"
- **Small wins early.** Day 1 doesn't ask too much.
- **Permission rather than prescription.** Adaptable, not rigid.
- **Stories of real people doing this.** Eventually — gated behind
  privacy choices.

### Doesn't matter / can harm
- **Social features.** No sharing practices, no leaderboards, no
  manifestation-buddy systems. This is intimate.
- **Heavy gamification.** Streaks that shame, badges, points.
- **Algorithmic feed.** "Recommended for you" feels robotic in this
  domain.
- **Generic "abundance" content.** Anything that could be on any
  manifesting Instagram.
- **Long pre-baked courses.** Rigid 12-week programs are what burned
  Rebecca with The Aligned Life book — too long, life moves on,
  ignored after week 3.
- **Anything that promises the impossible.** Quiet ambition only.

## Three layers

The Mindset section has three distinct surfaces, each serving a different
moment in the user's day:

1. **The standard library** — practices, activities, readings, plan
   templates. Free, browseable, the moat. Thousands of pieces over time.

2. **The 30-day plan generator (AI-tailored)** — user inputs her current
   situation + form prefs, gets a personalised 30-day sequence drawing
   from the library. The killer hook. Built free; AI cost gated to
   Rebecca's account during beta.

3. **The quick-help matcher** — "I'm feeling [stuck / anxious / lonely /
   tired / triggered / angry] right now" → instant practice match from
   the library. The 1am, 3pm, when-it-hits-you surface.

The library is the foundation. The plan generator is what makes the
section feel personal. The matcher is what makes it feel available.

## Content types and counts

Target ~1,000 standard library entries at "deep enough to feel real"
launch depth. Distribution:

| Type | Count | What it is |
|---|---:|---|
| **Tapping (EFT) scripts** | 200 | Worded-out scripts for specific blocks. By target (money / body / relationships / sleep / etc), by context (morning / before a big meeting / when overwhelmed), by depth (beginner intro → deep specific). |
| **Energy alignment statements** | 150 | Statement-led practices. Includes Rebecca's Money Zone method as a first-class technique with multiple money-aligned variations. Body, business, home, relationship statements. |
| **Activities & rituals** | 200 | The embodied layer. £1-coin energetic deposits, wardrobe rituals, "live as if" anchors, mirror work, object-based practices, money rituals (touch money, bless money), morning/evening anchors. |
| **Journal prompts** | 150 | The tight kind — one specific question per prompt, not blank pages. Daily prompts, weekly review, stuck-state prompts, money / body / relationship-specific. |
| **Reading / education** | 150 | Long-form explainers. How tapping works (science + energy view). The Money Zone method explained. Why "live as if" works. Reading the resistance. Allowing vs forcing. The role of trust. Real stories from Rebecca. |
| **30-day plan templates** | 100 | Named, curated plans the AI generator can also base personalised plans on. "Money reset", "Stuck unstuck", "Body & beautiful", "Pre-launch", "Mama reset", "Marriage tune-up", "Begin again", etc. |
| **Practice collections** | 50 | Curated bundles — "When you can't sleep", "When you're stuck about money", "When you've lost momentum". Discovery surfaces, not their own content. |

Total ~1,000. Higher than I had in the cross-category grid (also 1,000) —
this is the right depth, the grid number can stay.

## Activities — the embodied ritual layer

The activities idea matters more than features-for-sake-of-features
because most manifesting platforms are abstract — "sit and visualise",
"say affirmations". The body-based, object-based, in-the-world activities
are different:

- **Energetic deposits.** £1 coin on the property you want. Written
  cheque to yourself for your goal. Buying one item from your future
  life now.
- **Walk-by visualisations.** Drive past the house, walk past the
  business location, sit on the bench by the school.
- **Wardrobe & object rituals.** Wearing the ring you bought your
  future self. Putting a vision in your sock drawer where you see it
  daily. The £20 note in the photo frame.
- **"Live as if" anchors.** Eating off the nice plates tonight.
  Lighting the candles for a Tuesday. Dressing as if you were already
  the version of you who has it.
- **Money rituals.** Touching the money before spending it.
  Bless-and-let-go. Pulling notes out and looking at them. Cleaning
  the wallet.
- **Body rituals.** Mirror work, body acknowledgment, dressing up for
  yourself, slowly applying body cream as practice.
- **Pre-bed & morning anchors.** Hand-on-heart minute. Listing five
  evidence-of-abundance items. Touching the door frame on the way in
  and out.

These are first-class content. Each one has its own page. Many are
30-second to 5-minute practices. Activity pages can include illustration
(eventually — pre-launch image batch).

## Source material — Rebecca's books

Her existing books are the source for much of this content. Workers
read them, synthesize into library entries (multi-entry per chapter,
not 1-to-1 ports), preserve her voice (her books, her voice — no AI
ventriloquism needed).

- `H:\My Drive\Book Interior - Manifesting v2.docx` (location TBD — see
  her Downloads folder).
- `H:\My Drive\Book Interior - MONEY v2.docx`.
- `H:\My Drive\The Money Zone by Rebecca Page v1.docx` — her own
  method, anchors the energy-alignment-statement type.
- `H:\My Drive\The Aligned Life Program - 12 Weeks of Tapping for Body,
  Money & Manifesting.docx` — older, but rich source for tapping
  scripts. Her voice from a few years ago; voice-check + light editing
  needed.

The first worker session against Mindset is a **book audit**: read each
book, extract a content inventory mapped to the type taxonomy above
(this script could become this many tapping scripts, this method
explained becomes one reading entry plus four supporting practices,
etc.).

## The 30-day plan generator

### User flow

1. **Input form** — kept small, not a quiz:
   - "What are you focused on right now?" (free text, ~100 words)
   - "Where do you feel most stuck?" (multi-select tags: money / body
     / business / relationships / motherhood / time / energy / purpose
     / sleep / grief / fear)
   - "What's currently working that you want more of?" (free text,
     optional)
   - "How much time do you have daily?" (radio: 3-5 / 5-10 / 10-20 /
     20+ min, separate morning + evening)
   - "What practices do you naturally lean toward?" (multi-select:
     tapping / journaling / rituals / movement / quiet sitting /
     listening / energy statements)
   - "What do you not want?" (free text or tag-anti: nothing too woo
     / nothing requiring materials / nothing involving the body /
     etc.)

2. **Generate.** Form submits → creates a `UserPlan` row with
   `status = PENDING_GENERATION`.

3. **Worker generates.** A worker session picks up pending plans,
   reads the input, selects practices from the library matched by
   target + time + style + anti-tags, sequences gently (light week
   one, deeper week two-three, integration week four), writes
   PlanDay rows, flips status to `ACTIVE`.

4. **User opens plan.** Sees the 30-day overview. Today's bits laid
   out. Can re-generate once they've run it at least a week.

### Gating

Per the locked premium philosophy (`feedback_premium_philosophy.md`)
this is built free, with the AI cost gated by feature flag to
Rebecca's account only during beta. She pays her own session cost. The
flag becomes a premium gate later if/when that fits.

### Why this specific UX

- **Form is small.** A 25-question quiz would scare off the user; six
  fields is enough to specialise the plan.
- **Free text matters.** "I want to buy the house at the end of our
  road but can't see how" is a more specific signal than the tags
  alone. The worker uses the free text to flavour the plan.
- **Generation happens asynchronously.** The user submits, comes back
  to find their plan. Beats fake real-time streaming for an experience
  that's supposed to feel considered. Also pragmatic — worker
  sessions don't run instantly.
- **Re-generate after a week.** Forces commitment but allows pivot if
  the plan is wrong. Premium tiers later might cap re-generation
  frequency.

### Generator prompt outline

The generator prompt (a worker prompt template at
`docs/mindset-plan-generator.md`) takes:

- The UserPlan input fields (the user's words).
- The available library (practice slugs + metadata + when-to-use
  strings).
- The available named plan templates (so the worker can pull a
  template wholesale if a good match, or assemble bespoke if not).

Outputs a 30-day sequence as `PlanDay` rows: morning practice slug,
evening practice slug, optional activity slug, optional reflection
prompt slug, weekly theme. Plus a short personalised intro from the
plan generator addressing the user's specific situation (one
paragraph, in Rebecca's voice).

## Page types

1. **Mindset homepage / Today view** — what the user lands on.
   - **Free user without a plan**: today's daily pick (one practice
     chosen for her from the library). Plus "I'm feeling..." chip
     selector. Plus browse-the-library entry. Plus a soft prompt to
     try the paid generator if she wants more.
   - **Paid user with active plan**: today's morning + evening from
     her custom plan, anchor practice if any. Quiet progress strip.
     "I'm feeling..." still available for off-plan moments.
   - **Paid user without active plan**: prompt to generate; also
     gets daily pick like the free experience.

2. **Practice page** — single library entry. Title, intro (why this
   matters), the practice itself, what to notice, when to use this,
   when not to. Save to favourites, mark as done, "when this isn't
   working" links to alternatives.

3. **Library browse** — filterable by life category, target, time,
   type, time-of-day. Search by feeling.

4. **Plan-generator form** — Path A / Path B toggle. Paid-only.
   Submits to `UserPlan`, async generation.

5. **Plan running page** — when the user has an active custom plan.
   Day grid (1–30). Today's bits front and centre. Yesterday's
   reflection visible. Reflection note input (encrypted-at-rest).
   Quiet days-remaining strip.

6. **Generated content page** (paid plan day) — when the practice
   on a given day was AI-generated (not a library reference), it
   gets its own page rendered from `UserPlanDay.morning_generated_
   content` etc. Same shape as a library Practice page but private
   to the user, not browseable, not saveable to favourites (it's
   already hers).

7. **Favourites / saved practices** — the user's own library subset.

8. **Settings — Mindset privacy** — per-user controls (journal
   entries never shared, practices used never displayed, plan inputs
   private).

## Schema sketch

```
Practice (Tutorial subtype — the public library entry)
- id, slug, title, body (TipTap JSON)
- type: TAPPING | ENERGY_STATEMENT | AFFIRMATION | SPELL | RITUAL |
        ACTIVITY | JOURNAL_PROMPT | VISUALISATION | MEDITATION |
        EMBODIMENT | READING
- targets[]: MONEY | BODY | RELATIONSHIPS | SLEEP | ANXIETY |
             CONFIDENCE | ABUNDANCE | STUCK | GRIEF | FEAR |
             MOTHERHOOD | PURPOSE | TIME | ENERGY | JOY |
             SPIRITUALITY | HEALTH | SELF_WORTH | FORGIVENESS |
             AGEING
- time_band: 3_MIN | 5_MIN | 10_MIN | 20_MIN | 30_PLUS
- best_time: MORNING | EVENING | ANYTIME | AS_NEEDED
- depth: BEGINNER | INTERMEDIATE | ADVANCED
- materials_note (text, usually empty)
- when_to_use (one-sentence matcher string)
- when_not_to_use (optional, for safety)
- alternative_practice_ids[] (for "when this isn't working")

(No PlanTemplate / PlanTemplateDay — see brainstorm doc. Plans are
not a content type; the library is everything public-facing, the
AI generator builds personalised plans on demand.)

UserPlan
- user_id
- input_text (the user's pour-it-out free text, nullable if Path B)
- input_fields (JSONB — Path B structured fields, nullable if Path A)
- time_morning, time_evening (minutes, defaults)
- anti_tags[] (text)
- tier_at_creation: FREE_DAILY_PICK | PAID_CUSTOM
- status: PENDING_GENERATION | ACTIVE | PAUSED | COMPLETED | ABANDONED
- start_date, current_day, created_at, completed_at
- generator_intro (paragraph generated by the worker, paid tier)

UserPlanDay
- user_plan_id, day_number
- morning_source: LIBRARY_REF | GENERATED
- morning_practice_id (nullable — set when LIBRARY_REF)
- morning_generated_content (TipTap JSON, nullable — set when GENERATED)
- evening_source: LIBRARY_REF | GENERATED
- evening_practice_id (nullable)
- evening_generated_content (nullable)
- anchor_source (same pattern as morning/evening)
- anchor_practice_id (nullable)
- anchor_generated_content (nullable)
- daily_reflection_prompt_id (nullable, can also be generated)
- weekly_theme (text)
- morning_done_at, evening_done_at, anchor_done_at
- reflection_note (private text, encrypted at rest)

DailyPick (for free users — what gets surfaced on the Today view)
- user_id, pick_date
- practice_id
- shown_at, viewed_at, marked_helpful, marked_done_at

UserPracticeFavorite
- user_id, practice_id, added_at

UserPracticeUse
- user_id, practice_id, used_at, context_target

UserFeeling (for the "I'm feeling..." matcher, anonymised analytics)
- user_id (hashed), feeling_at, target_at_time, matched_practice_id
```

Single migration. Field-up-front per the standing rule.

## Voice register for Mindset

Different from recipes. Recipes are reference; Mindset is gentler and
more permission-giving.

### Good register
- "Today, do this."
- Direct, brief, specific.
- "Notice what comes up. Don't fix it."
- Permission rather than prescription.
- "You already know this." (sparingly)
- First person from Rebecca occasionally (she IS the IP holder; her
  voice carries the section).

### Anti-tells (Mindset-specific bans on top of the standard rules)

- No "queen", "boss", "high vibe", "manifestation queen", "your
  power", "step into".
- "Manifest" as a verb is allowed sparingly but not as the primary
  verb of every paragraph.
- No "your future self is waiting / watching / cheering".
- No "I see you / you're seen / I get it".
- No "real talk / honest / let me tell you" softeners.
- No mystical-grandiose claims ("you'll attract everything you've
  ever wanted").
- No threats about the energy ("don't think about lack or it
  multiplies").

These get added to the voice-check CLI when the Mindset pipeline ships,
plus to `docs/common-issues.md` as the patterns surface from drafting.

## Privacy

Mindset content has different privacy weight than a sourdough recipe.

- **Journal entries** never leave the user's account. Stored encrypted
  at rest. Excluded from analytics aggregation. Never used to train
  anything.
- **UserPlan input** (the user's free-text answer to "what are you
  focused on") similarly private. Used to generate her plan only.
- **Practice usage** (what the user did when) is private by default.
  Optional opt-in for aggregate analytics (anonymised).
- **No social sharing** by default. No "share to Instagram", no
  buddy systems, no "post your win". Could add later as deliberate
  feature but never as default.
- **Reviews / community** — disabled on individual practices and
  activities. They'd change how people use them and add social
  pressure to intimate content. Allowed on reading articles where the
  content is general / educational.

## Build sequence

Each step is a worker session.

### Pre-step — Source audit
A short worker session reads Rebecca's four books, produces a content
inventory mapped to the type taxonomy. Output: a doc listing source →
target type → estimated entries derivable. Becomes the seed for
the recipe-backlog equivalent (Mindset backlog).

### Step 1 — Page design lock
Page specs for: Today view, Practice page, Activity page, Plan
template page, Plan running page, Plan-generator form, Library
browse. Output: `docs/page-design-mindset.md`. No code yet.

### Step 2 — Schema migration
The schema sketch above lands as one Prisma migration. New tables,
new Tutorial subtype values, new enums. Same field-up-front pattern
as Cooking.

### Step 3 — Authoring prompt template
`docs/mindset-author.md`, written like `docs/tutorial-author.md` but
for Mindset's shape. Different output contract (Practice rather than
Recipe), different voice rules section, different self-critique
checklist (with Mindset-specific anti-tells).

### Step 4 — Voice-check extension
Add Mindset-specific deterministic bans (queen / high-vibe / manifest
overuse) to `packages/db/scripts/voice-check.ts`. Plus the standard
register-check structure.

### Step 5 — Mindset backlog
`docs/mindset-backlog.md` — the equivalent of recipe-backlog.md. Lists
every practice, activity, reading entry, journal prompt, plan
template to be drafted. Built from the source audit + a structural
pass (cover every common target × every practice type).

### Step 6 — Anchor batch (5 practices + 1 plan template + 1 activity)
A small first batch with deeper review. One tapping script, one
energy alignment statement, one activity (likely the £1 coin one),
one reading entry, one journal prompt, one short plan template.
Rebecca reviews these in admin preview.

### Step 7 — Pilot batch of 10 (auto-publish flow, per Phase 8 Step
11 + 12 pattern)
Drafts 10 across types, runs through self-critique + voice-check +
common-issues check, uploads as PUBLISHED. Report patterns for prompt
refinement.

### Step 8 — Plan generator schema + form + worker prompt
- UserPlan + UserPlanDay tables (in Step 2's migration, ahead of need).
- Plan-generator form at `/me/mindset/new-plan`.
- `docs/mindset-plan-generator.md` — worker prompt template that takes
  UserPlan input + library, outputs PlanDay sequence.
- Worker script that picks up `PENDING_GENERATION` UserPlan rows and
  runs the generator prompt. Triggered manually for beta (Rebecca-
  only); later Inngest job for scale.

### Step 9 — Plan running UX
Today view, plan running page, daily check-off, reflection notes
(encrypted-at-rest text field), quiet progress indicator. Plus the
"I'm feeling..." matcher.

### Step 10 — Plan templates (the named 30-days)
Drafted as worker session. 10 named templates to start ("Money
reset", "Stuck unstuck", "Body & beautiful", "Pre-launch", "Mama
reset", "Marriage tune-up", "Begin again", "Sleep & nervous system",
"Abundance dwelling", "Comparison cure"). Each = 30 PlanTemplateDay
rows referencing existing practices.

### Step 11 — Bulk fill
Standing worker pattern. Each batch picks N from the backlog, drafts,
auto-publishes. Approximate fill weeks per the BUILD_PROGRESS grid (1
week at full throughput on Mindset, but realistically slower per-entry
than recipes because of the higher curation bar).

### Step 12 — First Rebecca-as-beta-tester plan
Once Steps 1–10 are in, Rebecca generates her first personalised plan
on herself. Runs it for 30 days. Notes shape it back into the
generator prompt + library + page design as needed.

## Open decisions for Rebecca

1. **Anti-tells list above** — any "queen / high-vibe / step into /
   manifest queen" terms missed? Add now while it's in mind.
2. **Privacy stance** — comfortable with the "no social, no sharing,
   no reviews on practices" default? Or want a deliberate small
   community surface for something specific?
3. **Activities target count** — 200 seems right for depth. Push back
   if too many or too few.
4. **Named plan templates** — the 10 above feel like the right
   starting set, or want different archetypes? "Mama reset" feels
   particularly right; "Comparison cure" might be the most needed
   given the audience.
5. **Book audit first** — happy with that as the literal next concrete
   step, before page-design lock? Or want page-design first and book
   audit second? (I'd argue book audit first because it shapes the
   library taxonomy.)
6. **Plan generator beta flag** — you start as the only user. Once
   it's running, what's the trigger to open it to a second user?
   (Worth noting: until premium tiers exist, every plan-generation is
   you paying API cost.)

## Future considerations (out of initial scope)

- **Tester program** for Mindset specifically — given the privacy
  weight, the tester program here might look different (perhaps
  closer to "trusted readers" than open testers).
- **Audio versions** of practices — tapping scripts especially read
  much better aloud than on the page. Defer to a focused audio pass
  later.
- **Push notifications** — daily reminders for the plan running. The
  app surface (Capacitor) supports this; the wiring is a focused
  session after launch.
- **Companion content** — the Mindset section naturally cross-refs
  Garden (gardening as a mindset practice), Cooking (cooking as a
  mindfulness), Herbal medicine (the practitioner mindset). Don't
  build cross-refs upfront; spot them as they emerge.
- **The site's tone overall** — Mindset's voice register naturally
  flavours adjacent categories. Worth a brand-doc pass once the
  Mindset register is locked.
