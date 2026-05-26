# Voice retrofit batch 2026-05-26-batch13

Batch 2026-05-26-batch13: 50 tutorials retrofitted. Deploy not triggered (docs-only commit), live pages serve the new bodies from the DB at request time. healthz returns 200.

## DB verification

### 1. audit-recent-state output

```
CATEGORIES
ord | slug                  | status      | subs | last fire        | PUB    | DRAFT
  1 | cooking               | READY       |    2 | 2026-05-20 17:21 |   1139 |     0
  2 | baking                | READY       |    8 | 2026-05-20 13:33 |    573 |     0
  3 | garden                | NOT_READY   |    9 | 2026-05-17 15:05 |      0 |     4
  4 | mindset               | READY       |   11 | 2026-05-20 19:20 |    845 |     0
  5 | herbal-medicine       | NOT_READY   |   10 | 2026-05-20 08:38 |     42 |     0
  6 | crochet               | NOT_READY   |    5 | -                |      0 |     4
  7 | knitting              | NOT_READY   |    9 | -                |      0 |     3
  8 | needlework            | NOT_READY   |    4 | -                |      0 |     3
  9 | sewing                | NOT_READY   |   15 | -                |      0 |     2
 10 | fibre-arts            | READY       |    6 | 2026-05-20 20:30 |    127 |     0
 11 | wood-natural-craft    | READY       |    6 | 2026-05-20 23:08 |    162 |     0
 12 | paper-word            | READY       |    9 | 2026-05-21 00:28 |    117 |     0
 13 | pottery-ceramics      | READY       |    6 | 2026-05-21 02:42 |     82 |     0
 14 | animals-smallholding  | READY       |    6 | 2026-05-21 04:28 |    121 |     0
 15 | home-repair           | READY       |    6 | 2026-05-21 06:49 |    123 |     0
 16 | natural-home          | READY       |    5 | 2026-05-21 01:23 |     82 |     0
 17 | sustainability        | READY       |    6 | 2026-05-21 06:49 |    122 |     0

IMAGE VERIFICATION
  UNVERIFIED                   : 2316
  VERIFIED                     : 1219
```

(The "last fire" hyphens above replace en dashes in the script output to keep this hand-off em-dash and en-dash clean.)

### 2. Voice retrofit count: before and after

Before this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 581
After this batch (PUBLISHED + voiceRetrofittedAt IS NOT NULL): 631
Delta: +50 (matches the batch size).

Source of truth: `pnpm --filter "@homemade/db" exec tsx scripts/_count-voice-retrofitted.ts`.

### 3. Spot-check

Slug: `pinch-pot`
voiceRetrofittedAt: `Tue May 26 2026 16:43:16 GMT+0100 (British Summer Time)`
First paragraph in DB after apply: "The pinch pot is the starter form every clay tradition teaches first. One ball of clay; the thumb opens a central well; the pinch between thumb and fingers walks the walls outward and upward into a small bowl shape. The whole project takes thirty minutes to an hour from picking up the clay to a finished pinched form ready to dry. Air-dry clay is the default path here, no kiln, no equipment beyond the hands and a sponge. An earthenware path is noted at the end for readers with kiln access who want a fired ceramic result."

Live URL: https://homemade.education/pottery-ceramics/pinch-pot. Page returns HTTP 200. Bodies render from Postgres via Prisma at request time, so the new register is live as soon as the apply script returns; no container rebuild is needed for content changes. The curl response is the React shell, so the rendered prose does not appear in the raw HTML, but the DB body confirmed above is the source the public page renders.

### 4. Full slug list (50)

american-beef-stew, american-cornbread, american-meatloaf, american-pot-roast, banana-bread-loaf, banana-bread-vegan, banana-loaf-classic, banoffee-cheesecake, dovetail-pine-keepsake-box, drawknife-shaping-technique, fitting-wooden-lids-technique, five-minutes-of-doing-nothing, five-minutes-with-the-money-activity, five-money-aligned-statements-that-dont-sound-mad, five-things-you-can-feel-four-you-can-hear, food-safe-wood-finishes, forgiveness-can-be-revisited, garage-conversion-insulation, geometric-window-star, gothic-textura-lowercase, green-cone-food-digester, grey-water-garden-irrigation, greywater-constructed-wetland, half-hitch-left-macrame, half-hitch-right-macrame, hand-lettered-journal-headers, hand-lettered-zine-spreads, harvesting-honey-uncapping-and-extracting, hedgerow-and-tree-poisonous-plants, hoof-trimming-a-sheep, housing-angora-rabbits, how-to-choose-a-spinning-wheel, how-to-choose-wool-for-felting, how-to-read-a-weaving-draft, identifying-and-treating-pigs-for-mange, installing-coving-and-cornice, isolating-and-removing-a-radiator, lagging-cold-water-pipes, laying-ceramic-floor-tiles, laying-vinyl-sheet-flooring, paper-clay-name-plaque, paper-clay-sculptural-bird, paper-clay-wall-tile, pinch-and-coil-handled-mug-air-dry, pinch-pot, rosemary-mint-cold-process-soap, salt-bar-soap-coconut, shea-butter-cold-process-soap, shower-screen-cleaner, shower-steamers.

## Sample public URLs

- cooking: https://homemade.education/cooking/american-pot-roast
- baking: https://homemade.education/baking/banoffee-cheesecake
- mindset: https://homemade.education/mindset/five-things-you-can-feel-four-you-can-hear
- fibre-arts: https://homemade.education/fibre-arts/how-to-choose-a-spinning-wheel
- home-repair: https://homemade.education/home-repair/laying-vinyl-sheet-flooring
- natural-home: https://homemade.education/natural-home/shea-butter-cold-process-soap
- sustainability: https://homemade.education/sustainability/greywater-constructed-wetland
- paper-word: https://homemade.education/paper-word/hand-lettered-journal-headers
- wood-natural-craft: https://homemade.education/wood-natural-craft/dovetail-pine-keepsake-box
- animals-smallholding: https://homemade.education/animals-smallholding/hoof-trimming-a-sheep
- pottery-ceramics: https://homemade.education/pottery-ceramics/pinch-pot

## Before / after excerpts

### Cooking: american-meatloaf (closing paragraph)

Before:
"Meatloaf is one of the defining dishes of mid-twentieth-century American home cooking, shaped by Depression-era frugality (extending expensive meat with breadcrumbs), post-war domestic science teaching, and the rise of ketchup as a near-universal American condiment."

After:
"Meatloaf became a key dish of American home cooking in the middle of the last century. Hard times taught cooks to stretch costly meat with breadcrumbs. Post-war home-economics classes taught the shape. Ketchup, by then on every shelf, gave it a glaze."

### Home repair: garage-conversion-insulation (paragraph 12)

Before:
"A 0.18 W/m2K target for the new infill wall is not required (it is a replacement of an uninsulated door with a partially glazed infill, so Approved Document L1B's 'consequential improvement' clause applies), but achieving 0.28 W/m2K at the wall and 1.4 W/m2K for the glazing is standard practice."

After:
"You do not have to hit the 0.18 W/m2K target for the new infill wall. The work is a swap of an uninsulated door for a part-glazed infill, so the 'consequential improvement' clause in Approved Document L1B applies. The usual practice is 0.28 W/m2K at the wall and 1.4 W/m2K for the glazing."

### Pottery (craft project): pinch-pot (paragraph 1)

Before:
"The pinch pot teaches every hand-building principle that follows: how the clay yields to even pressure, how the rim is the first thing to crack if not compressed, how a wall thinned past a critical point collapses, how a form set up too quickly cracks at the base. Bernard Leach, in A Potter's Book (1940), notes the pinch pot as the first technique taught in every working pottery; the form is older than the wheel by several thousand years."

After:
"The pinch pot teaches every hand-building idea that comes next. The clay gives under even pressure. The rim cracks first if not compressed. A wall thinned past a certain point falls in. A form dried too fast cracks at the base. The pinch pot is the first technique taught in almost every working pottery. It is older than the wheel by several thousand years."

The Bernard Leach (1940) citation moved out of the body; the same reference already lives in `sourceNotes`, so the Sources block on the public page is unchanged.

## Category-by-category count

animals-smallholding: 5, baking: 4, cooking: 4, fibre-arts: 5, home-repair: 5, mindset: 5, natural-home: 5, paper-word: 4, pottery-ceramics: 5, sustainability: 4, wood-natural-craft: 4. Total: 50.

## Anything surprising

- 30 of 50 candidates passed voice-check on first run before any rewrites, down a touch from 33 in batch 12. The cleaner-than-average batch 12 run was driven by a strong mindset block; this batch had more home-repair and craft-technique picks, which tend to carry a single grade-12-plus paragraph buried in the body.
- The grade-level rule remained the main catch: 19 of the 20 dirty files were flagged only for one or more paragraphs above grade 12. The one structural error came from `american-beef-stew`, which had a `Before you start` H2 left over from the old safety-section pattern; the section content was a flavour-and-technique note, not safety advice, so the H2 was renamed `Browning the beef` and the paragraph kept intact.
- `pinch-pot` was the only file that tripped the year-in-body rule. `Bernard Leach (1940)` was already present verbatim in `sourceNotes`, so removing the citation from the body cost nothing on the public page and let the body paragraph drop to register.
- `five-money-aligned-statements-that-dont-sound-mad` carried a trailing `Where this practice comes from` H2 with a paragraph duplicating the existing `sourceNotes` block ("The energy statement format draws on the release-and-allow framework in The Money Zone, Rebecca Page, 2024"). The duplicate text was condensed to a single short line pointing the reader to the Sources block at the foot of the page; the citation itself still lives in `sourceNotes`. Same shape as the two mindset removals flagged in batch 12.
- Two pre-existing em dashes lived inside subtitles, which the voice-check walker does not currently descend into for `subtitle`. `american-cornbread.subtitle` and `pinch-and-coil-handled-mug-air-dry.subtitle` both carried a dash that flowed through from the original DB content. Both replaced. The commit-time grep is the safety net.
- The `rosemary-mint-cold-process-soap` rewrite tripped the banned-phrase rule on the word `honest` after the first pass ("a clean herbal bar that reads as honest soap, not perfume"). Caught on the second voice-check run and switched to `plain soap`. Worth flagging because `honest` is in the cross-context banned list and is easy to reach for when rewriting marketing-adjacent prose.
- No file showed a word-count drop greater than 20% versus the pre-rewrite body. The largest single drop was on `american-cornbread`'s closing paragraph (about 17% shorter); all the rewrites trimmed clauses and shortened sentences without dropping sections.

## Forward read

2904 PUBLISHED tutorials with voiceRetrofittedAt IS NULL remain after this fire.

## Deploy verification

This batch's commit adds files only under `docs/voice-retrofit-2026-05-26-batch13/` (the batch directory and this hand-off). The `.github/workflows/deploy.yml` path filter targets `apps/**`, `packages/**`, `infra/**`, root config files, and the workflow itself; docs-only paths do not match. Per the per-task brief and the CLAUDE.md edge case, deploy verification is skipped for this docs-only commit. No deploy was expected.

Bodies render from Postgres via Prisma at request time, so the new register is already live for users.

```
$ curl -sS -o /dev/null -w "%{http_code}\n" https://homemade.education/healthz
200
```

healthz returns 200 (independent smoke test against the running ECS task). The session is done.
