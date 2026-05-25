# Reference screenshots: verbal descriptions

Five screenshots captured during the planning session, described in
enough detail that the strategy spec at
[../../homepage-redesign-2026-05-25.md](../../homepage-redesign-2026-05-25.md)
can be reconciled against them without needing the image files.

The image files themselves were shared in chat and aren't checked into
the repo; if any future session wants the originals they're in the
session transcript for `kind-borg-68cf3c`.

---

## 1. Pinterest home feed (uk.pinterest.com/homefeed)

**Layout**
- Pure masonry grid. **Eight columns** visible at this viewport
  (~1490px browser width).
- Card widths uniform across columns (each ~150px wide). Card heights
  vary from ~250px up to ~600px depending on the source image's aspect
  ratio.
- Vertical and horizontal gap between cards: ~12px.
- No section headers anywhere. No rails. Pure infinite feed.
- Top chrome: pink "Pinterest" wordmark + "Home feed" label left,
  profile + search + notifications right. "All" filter pill below the
  top chrome.

**Card treatment**
- Each card is a photograph (varying aspect ratios, naturally
  proportioned).
- Caption below the image: 1-2 lines of small sans (~12-14px) with the
  pin title; below that a smaller line for the source ("Etsy",
  "Wayfair UK", "bridelily") or "Sponsored" chip.
- Some pins have text baked INTO the image as part of the original
  design (e.g. "16 Cloak Crochet Patterns That Are Enchanting"). These
  are clearly designer-graphic pins, not photographs with overlay.
  This is the source of Rebecca's "I like the text on the images that
  pinterest often has" comment.
- Three-dot menu top-right of every card on hover; heart icon also
  appears on hover.
- No category labels, no metadata, no time/difficulty equivalents.
  Image plus caption is the entire card.

**Above-fold density estimate**: at this viewport with 8 columns,
roughly **24-30 items** visible above the fold (3-4 rows of 8). That
is the density level Pinterest sets.

**Content mix in this particular feed**
- Wedding dresses, crochet patterns, sourdough scoring, dining rooms,
  cut flower gardens, embroidered linen, recipe cards, hair styling,
  midjourney-generated rooms, dresses (sage green theme). Highly
  varied. The masonry rhythm IS the visual variety.

---

## 2. Netflix homepage hero (netflix.com/browse, top of page)

**Layout**
- **Full viewport width** hero. No container max-width. The image
  extends edge-to-edge across the browser window.
- Hero height: approximately **75% of viewport height**. Dominates the
  first screen.
- Background is an autoplaying video frame (in this capture: a still
  from "The Boroughs" showing two men talking through a car window,
  warm green lighting).

**Overlay treatment**
- Top nav: solid dark background (or strongly darkened gradient). Red
  NETFLIX wordmark left; Home / Series / Films / Games / New & Popular
  / My List / Browse by Language in white sans. Search, notification
  bell (with "1" badge), profile chip right.
- Title overlay bottom-left: small red "NETFLIX" originals chip above
  a stylised script title "The Boroughs" (per-show typography, not the
  system font).
- CTAs below the title: white "▶ Play" pill button + dark "ⓘ More
  Info" pill button.
- Centered overlay tagline (interesting): "Welcome to The Boroughs,
  where you'll have the time of your life." sits center-right of the
  hero in white sans, overlaid directly on the video. Not at any
  particular edge, floating in the middle of the imagery.
- Sound mute toggle bottom-right of hero. Pink "15" age rating chip
  below the sound toggle. Carousel-pagination dot row top-right of the
  next row ("My List") just visible at the very bottom of the
  viewport.

**Gradient**
- Subtle dark vignette at the bottom of the hero for legibility of the
  title chip and CTAs. Not a heavy gradient across the whole image.

**Above-fold density**: hero (1 dominant item) + the very top of the
"My List" row label visible. So at the hero state Netflix is showing
~1 item above fold by count, but the hero is doing all the
storytelling.

---

## 3. Netflix scrolled state (netflix.com/browse, scrolled past hero)

**Layout**
- Top nav becomes solid black (was transparent over the hero).
- "My List" row at the top of viewport: title + 5 landscape cards
  visible + edge of 6th card. Tiny pagination dot row top-right of the
  row.
- "Continue watching for Pages" row below: 5 landscape cards visible.
  Each card has a thin **red progress bar** at the bottom indicating
  watched percentage.
- "Today's Top Picks for You" row below that: 5 landscape cards
  visible. Each card has a small red "TOP 10" badge top-right and a
  red "Recently Added" badge bottom-left.
- "Women in STEM" row partially visible at the bottom of the viewport.

**Card treatment**
- Cards are **landscape ~16:9 or 2:3** proportions (Netflix uses both
  shapes depending on row; here they're landscape).
- Image is the show's poster/promo art with title typography baked
  into the image (no separate text label below the card). This is
  feasible for Netflix because every show ships with designed key art;
  it isn't directly applicable to user-generated tutorial photos.
- Rounded corners: ~4px radius.
- No category kicker, no caption, no metadata text. The card IS the
  poster.
- Hover (not visible in screenshot but well-documented): card expands
  to ~150% and reveals controls + synopsis.

**Density**
- ~5 cards per row at this viewport, edge of 6th visible (matches
  Homemade's current rail).
- Vertical row gap: tight, ~32-40px between rows.
- Above-fold count when scrolled: 5 × 4 rows = ~20 items visible. This
  is the **density target** the redesign aims at.

---

## 4. Homemade homepage hero (current, homemade.education)

**Layout**
- Hero zone uses a max-width container (~1280px); does NOT extend to
  viewport edges.
- 50/50 horizontal split: photograph left, text block right.
- Image: Patatas bravas in a dark blue bowl on a dark linen surface,
  approximately 3:2 landscape, ~50% of container width.
- Text block right: "THIS WEEK'S EDITORIAL PICK" in sage Lora caps,
  "COOKING" in warm-taupe Lora caps, "Patatas bravas" in Fraunces
  ~48px, italic Fraunces excerpt ("Cubed potatoes fried until golden
  and crisp, served with a hot, smoky tomato sauce and a smear of
  aioli. The definitive Spanish bar snack, bold, satisfying, and
  ready in under an hour. Serves four as a starter."), "READ THE
  GUIDE →" in sage Lora caps.
- Hero takes approximately **55-60% of viewport height**.
- Cream background dominates the upper portion of the screen; lots of
  whitespace around the text block.

**Below hero**
- Sage 0.5px rule then "This week's editorial picks" rail header (also
  in sage Fraunces), with the top of the first rail card just visible
  at the bottom of the viewport.

**Above-fold density**: hero (1) + rail header (visual only) + top
edge of card 1 = effectively **1 item** above fold. This is the
sparseness Rebecca described.

---

## 5. Homemade scrolled state (current, homemade.education)

**Layout**
- Cream background throughout.
- "Most-loved in cooking" rail at the top of viewport: sage Fraunces
  title left, "SEE ALL →" sage Lora caps right. **5 landscape cards
  visible + edge of 6th**.
- Cards: 3:2 landscape image with subtle rounded corners, "COOKING"
  category in sage Lora caps, dish title in Fraunces ~18px, time +
  difficulty in small Lora ("1 hr 5 min · Beginner").
- Vertical gap between rails: significant, ~80-100px of cream
  whitespace.
- "Most-loved in baking" rail below: same shape. Baking cards have
  small dietary badges (V, Vg, GF) bottom-right on the image.
- Photography across both rails is strong (Glamorgan
  Sausages, Fish and Chips, Bubble and Squeak, Beef Wellington,
  Yorkshire Puddings, Toad in the Hole on cooking; Treacle Tart,
  Angel Food Cake, Walnut Fudge, Turkish Delight, Tarte Bourdaloue,
  Sussex Pond Pudding on baking).

**Card treatment observations**
- The card shape itself reads well. Photography is good. Typography
  hierarchy is clear.
- The rail-to-rail vertical whitespace is the issue, not the card
  design. Each rail is well-composed; the page just doesn't pack
  enough of them into the visible area.

**Above-fold density** (scrolled state, mid-page): **~12 items**
(2 rails × 5-6 cards). This is already close to the redesign's target
range. The hero-zone sparseness is the bigger problem to solve.

---

## Reconciliation summary

What changes (or stays) in the spec given the actual screenshots:

- **Pinterest density is higher than estimated.** 8 columns at 1490px,
  not 5. The "Recently made by the community" rail's masonry could go
  denser than the spec implies.
- **Pinterest text-on-image is variant, not default.** Default
  Pinterest card is caption-below. Text-on-image happens on
  designer-graphic pins (covers, branded layouts). Pattern C in the
  spec should default to caption-below and treat overlay as a variant
  for cover-style cards (the category index is a better home for that
  variant than the community rail).
- **Netflix hero is full viewport width.** The spec proposes content-
  width capped at 1280px. Going edge-to-edge on screens above 1440px
  is the stronger move and matches the reference.
- **Netflix hero is taller than the spec proposes.** ~75vh in the
  reference vs the spec's 56vh. The redesign's hero should sit closer
  to 65-70vh on desktop.
- **Netflix scrolled state density matches the spec target.** 5 cards
  per row, ~20 items visible across 4 rows. Homemade's current rail
  shape (5 + edge of 6th visible) already hits the column count;
  what's missing is the vertical compression between rails.
- **Current Homemade cards are good in isolation.** The 4:5 portrait
  swap in the spec was overcautious. The current 3:2 landscape works.
  The change worth keeping is the rail-to-rail gap compression and
  the hero treatment, not the card aspect ratio.
- **Current Homemade rail-to-rail gap is the biggest single problem.**
  ~80-100px of cream between rails. Compressing to 32-40px (per the
  spec) is the highest-leverage single change.
