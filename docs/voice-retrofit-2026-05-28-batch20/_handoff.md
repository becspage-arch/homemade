Batch 2026-05-28-batch20: 75 tutorials retrofitted. Deploy green, healthz 200.

## Mandatory DB verification

### 1. audit-recent-state.ts output

```
CATEGORIES
ord | slug                  | status      | subs | last fire        | PUB    | DRAFT
  1 | cooking               | READY       |    2 | 2026-05-28 15:41 |   1139 |     0
  2 | baking                | READY       |    8 | 2026-05-28 14:28 |    613 |     0
  3 | garden                | NOT_READY   |    9 | 2026-05-17 15:05 |      0 |     4
  4 | mindset               | READY       |   11 | 2026-05-28 17:19 |    845 |     0
  5 | herbal-medicine       | NOT_READY   |   10 | 2026-05-20 08:38 |     42 |     0
  6 | crochet               | NOT_READY   |    5 | (none)           |      0 |     4
  7 | knitting              | NOT_READY   |    9 | (none)           |      0 |     3
  8 | needlework            | NOT_READY   |    4 | (none)           |      0 |     3
  9 | sewing                | NOT_READY   |   15 | (none)           |      0 |     2
 10 | fibre-arts            | READY       |    6 | 2026-05-28 17:23 |    127 |     0
 11 | wood-natural-craft    | READY       |    6 | 2026-05-20 23:08 |    162 |     0
 12 | paper-word            | READY       |    9 | 2026-05-21 00:28 |    117 |     0
 13 | pottery-ceramics      | READY       |    6 | 2026-05-21 02:42 |     82 |     0
 14 | animals-smallholding  | READY       |    6 | 2026-05-21 04:28 |    121 |     0
 15 | home-repair           | READY       |    6 | 2026-05-21 06:49 |    123 |     0
 16 | natural-home          | READY       |    5 | 2026-05-21 01:23 |     82 |     0
 17 | sustainability        | READY       |    6 | 2026-05-21 06:49 |    122 |     0

IMAGE VERIFICATION
  UNVERIFIED                   : 2298
  VERIFIED                     : 1197
```

(The "last fire" column rendered with em dashes by the audit script for null
timestamps. Replaced with "(none)" here so the hand-off stays free of em or
en dashes.)

PUBLISHED total is now 3575 (up by 1 from batch19's 3574; cooking-bulk-032
shipped 1138 to 1139 in the gap).

### 2. Voice retrofit progress

Before this fire: 3471 PUBLISHED with voiceRetrofittedAt set.
After this fire:  3546 PUBLISHED with voiceRetrofittedAt set.
Difference: 75. Matches the batch size.

Counts from check-voice-progress.ts after apply:

```
Done:      3546 of 3575  (99%)
Remaining: 29
Last retrofit:  Thu May 28 2026 18:41:44 GMT+0100 (British Summer Time)
Batches of 50 still to go: 1
```

Next fire should pick up the final 29 tutorials and the routine is done.

### 3. Random spot-check

Random pick from batch: `why-debt-obsession-grows-in-the-dark`.

DB row after apply:

```
slug:                why-debt-obsession-grows-in-the-dark
category:            mindset
voiceRetrofittedAt:  2026-05-28T17:41:43.994Z
revisedFrom set:     true
URL:                 https://homemade.education/mindset/why-debt-obsession-grows-in-the-dark
```

First paragraph in DB after apply:

> Debt obsession has a particular quality: the thinking is loudest not when
> you are sitting down to deal with the debt, but in the middle of doing
> something else. In a meeting. In the supermarket. Just before sleep. The
> number arrives uninvited and replays until the next distraction.

Live page check: the site is currently behind the pre-launch splash gate, so
the public HTML for tutorial URLs serves the "coming soon" landing rather
than the rendered tutorial. DB is canonical for this verification, same as
batches 17 to 19.

### 4. Full slug list (75)

- sausage-and-mash-with-caramelised-onions
- what-is-my-mum-rage-actually-telling-me-i-need
- what-is-the-largest-amount-youve-held-journal
- what-is-this-fight-actually-about
- what-is-true-in-this-present-moment
- what-is-true-in-this-present-moment-journal
- what-it-means-to-steward-wealth-journal
- what-joy-am-i-afraid-to-let-in
- what-kind-of-company-am-i-missing-journal
- what-makes-an-idea-feel-aligned-journal
- what-money-story-do-i-want-to-pass-forward-journal
- what-new-income-streams-have-appeared-journal
- what-part-of-me-doesnt-actually-want-this-journal
- what-payment-can-i-reframe-with-gratitude-journal
- what-qualities-do-my-ideal-partners-share-journal
- what-richness-looks-like-on-an-ordinary-day-journal
- what-small-moments-build-my-calm-today-journal
- what-stops-me-from-welcoming-investment-journal
- what-used-to-light-me-up-that-i-have-put-down
- what-was-i-taught-about-women-with-money-journal
- what-wealth-surrounds-me-right-now-journal
- what-wisdom-do-i-have-now-that-i-didnt-at-30-journal
- what-would-forgiving-them-cost-me
- what-would-i-ask-for-if-i-knew-the-answer-was-yes-journal
- what-would-i-charge-if-nobody-would-flinch-journal
- what-would-i-do-if-i-knew-it-would-be-easy
- what-would-i-give-if-generosity-always-returned-journal
- what-would-i-invest-in-if-i-knew-it-would-work-journal
- what-would-overflow-as-my-natural-state-look-like-journal
- what-would-the-bigger-house-actually-fix-journal
- what-would-trusting-myself-fully-with-wealth-look-like-journal
- whatever-floats-your-boat-brownies
- whats-available-to-her-is-available-to-me
- when-a-parent-dies-grief-reading
- when-did-i-last-trust-my-body-fully-journal
- when-did-the-sleep-story-start-journal
- when-has-my-intuition-been-right
- when-have-i-rushed-or-waited-too-long-journal
- when-money-arrives-what-do-i-do
- when-the-home-becomes-the-work
- when-the-money-flow-reverses-supporting-your-parents-reading
- when-the-sleepless-years-leave-a-mark
- when-two-money-histories-share-a-bank-account-reading
- when-women-trigger-each-other-about-money
- when-womens-friendships-disappear-in-midlife
- when-you-cant-forgive
- where-did-fast-and-now-come-from
- where-did-hard-work-equals-worth-come-from-journal
- where-did-i-have-to-keep-moving-come-from-journal
- where-did-i-learn-that-wanting-was-wrong
- where-did-i-learn-that-wanting-was-wrong-journal
- where-did-money-is-hard-come-from-journal
- where-did-resting-is-wasting-time-come-from-journal
- where-does-the-autonomy-wobble-live-journal
- where-i-hold-fear-around-taxes-and-inheritance-journal
- where-to-start-with-money-work
- which-role-is-loudest-today-which-is-starved
- white-bean-and-rosemary-soup
- white-chocolate-cardamom-mousse
- who-do-i-become-as-the-start-of-the-new-line
- who-do-i-become-as-the-start-of-the-new-line-journal
- who-i-need-in-my-wealth-team-journal
- who-in-the-family-said-we-never-get-ahead-journal
- who-told-me-investing-wasnt-for-women-like-me
- who-was-i-before-the-baby-journal
- who-would-be-freed-by-my-visible-wealth-journal
- whole-grilled-bream-greek
- whose-money-life-have-i-decided-isnt-mine
- whose-success-do-i-struggle-to-celebrate-why
- whose-voice-calls-my-pleasure-selfish-journal
- why-autonomy-matters-even-in-a-happy-partnership-reading
- why-debt-obsession-grows-in-the-dark
- why-earn-more-doesnt-fix-money-problems
- why-generational-wealth-feels-like-betrayal
- why-huge-wealth-feels-impossible-to-picture

## Sample public URLs

- https://homemade.education/cooking/sausage-and-mash-with-caramelised-onions
- https://homemade.education/cooking/whatever-floats-your-boat-brownies
- https://homemade.education/cooking/white-bean-and-rosemary-soup
- https://homemade.education/cooking/whole-grilled-bream-greek
- https://homemade.education/mindset/what-is-this-fight-actually-about
- https://homemade.education/mindset/when-a-parent-dies-grief-reading
- https://homemade.education/mindset/when-the-home-becomes-the-work
- https://homemade.education/mindset/why-debt-obsession-grows-in-the-dark
- https://homemade.education/mindset/why-huge-wealth-feels-impossible-to-picture
- https://homemade.education/mindset/why-autonomy-matters-even-in-a-happy-partnership-reading

## Before / after excerpts

Three rewrites across the content types in the batch. Each shows the
flagged paragraph before voice-check (top) and the rewritten version (bottom).

### 1. when-a-parent-dies-grief-reading (mindset READING)

Before (grade 17.5):
> When a parent dies, several things are lost simultaneously: the person
> themselves; the role they played (buffer, witness, repository of family
> history); the particular relationship that existed between child and
> parent, which is never the same as any other relationship; and, often,
> the childhood home and its emotional weight. These compound losses are
> part of what makes parental grief heavier than its cultural treatment
> would suggest.

After:
> When a parent dies, several things are lost at once. The person
> themselves. The role they played: buffer, witness, keeper of family
> history. The bond between child and parent, which is never quite like
> any other bond. Often the childhood home and its weight too. These
> layered losses are part of what makes parental grief heavier than the
> culture admits.

### 2. why-huge-wealth-feels-impossible-to-picture (mindset READING)

Before (grade 14.8):
> Most wealth ceilings form during childhood and early adulthood, through
> three main routes: comparison, inherited narrative, and conditional
> worthiness.

After:
> Most wealth ceilings take shape during childhood and early adulthood.
> Three main routes set them. Comparison. Inherited family story.
> Conditional worth.

### 3. whole-grilled-bream-greek (cooking RECIPE)

Before (grade 12.5):
> Whole grilled sea bream is the fish taverna standard of the Greek
> islands and mainland coast: the default order when the fish is fresh,
> presented whole, drizzled with ladolemono (lemon-oil dressing) and
> served with nothing more than a salad and bread. The simplicity is the
> point. It requires good fish and a hot grill, and beyond that there is
> nothing to improve on. Greek aquaculture produces large quantities of
> farmed sea bream (and sea bass, which can be substituted directly),
> making both fish available across Europe year-round, though the flavour
> of wild or line-caught fish from cleaner Mediterranean waters is
> noticeably better.

After:
> Whole grilled sea bream is the standard fish-taverna dish of the Greek
> islands and mainland coast. It is the default order when the fish is
> fresh. The fish goes out whole, drizzled with ladolemono (lemon-oil
> dressing), and served with nothing more than a salad and bread. The
> simplicity is the point. It needs good fish and a hot grill. Beyond
> that there is nothing to add. Greek fish farms put out a lot of sea
> bream (and sea bass, which can stand in for it), so both are around in
> Europe all year. The flavour of wild or line-caught fish from cleaner
> Mediterranean water is noticeably better.

## Category-by-category count

- mindset: 70
- cooking: 5

## Notes

- 56 of the 75 exported bodies were already clean against the voice-check
  rules and applied unchanged. 19 needed targeted rewrites.
- 31 paragraph-level rewrites in pass-1 (grade-level and the one (1989)
  year-in-body in when-the-home-becomes-the-work).
- 5 follow-up rewrites in pass-2 cleared 4 stragglers. Two were caused by my
  own pass-1: the word "treats" (used to mean "regards" / "frames") tripped
  the medical-claim rule in when-a-parent-dies-grief-reading and
  why-debt-obsession-grows-in-the-dark. Reworded to "admits" and "looks at"
  respectively. The other two were paragraphs still over the grade-12
  threshold after the first pass; broke into shorter sentences.
- Pass-3 removed em-dashes from three legacy titles / subtitles that
  pre-dated the voice spec:
  - who-in-the-family-said-we-never-get-ahead-journal (title)
  - when-did-the-sleep-story-start-journal (subtitle)
  - why-huge-wealth-feels-impossible-to-picture (subtitle)
  Voice-check only enforces the em-dash rule on body paragraphs, but the
  routine brief bans em-dashes everywhere. Caught by the directory-wide
  grep before commit.
- No tutorial saw a word-count drop greater than 20%. The substance of
  every paragraph was preserved; only sentence structure and vocabulary
  changed.
- Bream recipe paragraph kept the brief mentions of ladolemono and
  Mediterranean aquaculture because both were genuine craft / cultural
  context, not academic gloss.

One-line forward read: 29 PUBLISHED tutorials remain with
voiceRetrofittedAt IS NULL. The next fire will finish the routine.
