# Homepage redesign: strategy spec (2026-05-25)

Strategic synthesis only. No code change in this session. The implementation
session reads this doc as its brief.

---

## Executive summary

The current homepage reads as 2014-editorial-magazine restraint when the
product is a 2026-streaming-discovery surface for 25,000+ tutorials. Above
the fold today shows roughly 5-7 items: a 50/50 split hero plus the heading
of one rail. That's a magazine cover, not a discovery surface.

The redesign keeps the slow-living register (Fraunces, Lora, sage, cream,
parchment) and triples the first-viewport density. Image dominance goes up.
Whitespace between rails compresses. The hero becomes full-bleed with text
overlaid in the Netflix manner. Cards shift to portrait crops for more
visual real-estate per tile. One rail (community makes) adopts the
Pinterest caption-on-image card. The category index at the bottom moves
from labelled parchment tiles to a Pinterest-feeling photo grid.

Pinterest is dense AND calm. Netflix is image-rich AND deliberate. Homemade
should be both. The voice doesn't change. The page just stops apologising
for the size of its library.

> **Note on reference screenshots.** The brief points to
> `docs/homepage-redesign-2026-05-25/references/screenshots-captured.md`
> for visual references. That file isn't on disk in this worktree, so this
> spec works from Rebecca's verbatim brief quote plus the six benchmark
> sites researched in Part 1. If the screenshots land later, Part 1 should
> be reconciled with the actual reference shots before build.

---

## Part 1: Reference research

Six sites benchmarked beyond Pinterest and Netflix to broaden the palette.
Three (NYT Cooking, Bon Appétit, Apartment Therapy, Airbnb) hard-blocked
WebFetch and are reported from training-knowledge recall rather than fresh
fetch. Substack and Spotify were fetched but are login-gated.

### NYT Cooking

- **Above-fold density (1440px):** hero + 4 secondary cards = ~5 items,
  plus a top utility strip (search, recipe box).
- **Hero treatment:** split layout. Large square food photo on one side,
  headline + dek + byline + save button on the other.
- **Card treatment:** image-with-text-below. Square or 4:5 photo,
  Spectral-style serif headline, sans metadata: byline + star rating +
  review count + cook-time. Save-bookmark icon top-right on image.
- **Row variation:** hero, "Featured" 3-up grid, horizontal-scroll rail,
  collection mosaic (1 big tile + several small).
- **Typography register:** serif headlines, sans metadata. Tight leading,
  generous around cards. Editorial.
- **Borrow:** the recipe-card metadata cluster (byline + rating + review
  count + cook-time as one quiet line). Conveys authority without shouting.
- **Don't borrow:** the subscription paywall scrim. Breaks calm.

### Bon Appétit

- **Above-fold density (1440px):** single dominant hero + 3-4-up
  secondary row = 4-5 items.
- **Hero treatment:** full-bleed photograph with headline overlaid in
  large display serif, subtle dark-to-light gradient at the bottom for
  legibility.
- **Card treatment:** image-with-text-below for most rows; hero is
  text-on-image. Squared corners, portrait photo crops (often 4:5 or
  3:4), tiny uppercase rubric above title, no visible cook-time on card.
- **Row variation:** hero, "Latest" 4-up grid, themed editorial package
  rail, recipe rail. Magazine stacking, each row visually distinct.
- **Typography register:** display serif headlines, sans rubrics +
  metadata. Magazine-tight. Strongly editorial.
- **Borrow:** the **rubric line** above each card title. Tiny uppercase
  category kicker that reads like a magazine table-of-contents without
  adding visual weight.
- **Don't borrow:** text-on-image overlay on every card. Gorgeous when
  the photo is right, brutal when the photo is wrong. At 25k tutorials
  the photo will not always be right.

### Apartment Therapy

- **Above-fold density (1440px):** hero (1 large lead story) + 2-3
  secondary stories stacked beside + small "trending" sidebar of ~5
  headlines = ~9-10 items.
- **Hero treatment:** asymmetric split. One large feature image with
  headline below, flanked by smaller stories. Not full-bleed.
- **Card treatment:** image-with-text-below. Subtle rounded corners on
  photos, category kicker, headline, occasional byline. Quiet hover.
- **Row variation:** lead block, topical section header ("Kitchen",
  "Bedroom") with 4-up grid, "House Tour" wide feature, mixed editorial
  blocks. **Section-anchored** rather than rail-anchored.
- **Typography register:** display sans headlines, occasional serif
  pull-quote, sans metadata. Looser leading. Between editorial and
  friendly-utility.
- **Borrow:** the **section-anchored layout**. Each major topic gets its
  own header strip plus grid, instead of everything dissolving into
  infinite rails. Helps a 25k-item library feel navigable.
- **Don't borrow:** the display-ad slots wedged between editorial rows.
  Rhythm-killer.

### Substack home

- **Above-fold density (1440px), signed-in:** ~3-4 long post-cards above
  fold. Logged-out lands on a marketing page.
- **Hero treatment:** none. Opens straight into the chronological feed.
- **Card treatment:** long-form horizontal card. Thumbnail right (1:1 or
  4:3), title + dek + publication name + byline + read-time + like-count
  left. Quiet borders, light rounded corners on image only.
- **Row variation:** almost none. Single vertical feed of uniform
  post-cards, occasionally a "Recommended publications" horizontal rail
  of round publication avatars.
- **Typography register:** Spectral-family serif for post titles, sans
  for metadata. Tight on titles, generous on dek. Newspaper-editorial.
- **Borrow:** the **long-form horizontal card** with thumbnail-right and
  headline + dek + meta-left. Useful for a rail where the tutorial needs
  a sentence of context, not just a title (today's scheduled step, new
  since last visit).
- **Don't borrow:** pure chronological feed with no curation. At 25k
  items this is a wall.

### Spotify Web Player

- **Above-fold density (1440px):** 8-12 items. Section header plus ~5-6
  square cards per rail, with the top of the next rail peeking.
- **Hero treatment:** none. Opens with a section header ("Trending
  songs") and a grid of square cards. Content-first.
- **Card treatment:** square album-art thumbnail, rounded corners, title
  one line below, secondary meta (artist) quieter below that. No
  text-on-image. Hover surfaces a play button overlay; otherwise calm.
- **Row variation:** uniform. Four to five stacked horizontal-scroll
  rails, each with a "Show all" link top-right.
- **Typography register:** sans throughout. Tight, functional. Utility,
  not editorial.
- **Borrow:** the **"Show all →" link** in the row header. Sets the
  rail-as-preview expectation cleanly, lets each rail stay short (5-7
  items) without feeling truncated.
- **Don't borrow:** uniform-rail-everywhere monotony. Calming, but at
  25k items it stops feeling browsable and starts feeling like a
  database query.

### Airbnb

- **Above-fold density (1440px):** pinned search bar at top, then ~8-10
  listing cards in a 4-column grid = ~10 items above fold including the
  search bar.
- **Hero treatment:** no image hero. The search bar IS the hero. Below
  it, a horizontally-scrollable category-icon filter chip strip, then
  the listings grid.
- **Card treatment:** image-with-text-below. Photo carousel inside the
  card (paginated dots), rounded corners on image (~12px), small heart
  top-right, title one line, location + dates + price-per-night beneath
  in quiet sans. Hover surfaces the carousel arrows.
- **Row variation:** almost none below the category strip. Single
  uniform 4-column grid that scrolls infinitely. Variation comes from
  category chips at the top.
- **Typography register:** sans throughout. Tight, generous leading.
  Utility with a sliver of editorial calm.
- **Borrow:** the **category-icon filter chip strip** directly under the
  page top. For 25k tutorials this could be a primary discovery
  affordance without committing to a left-nav.
- **Don't borrow:** the infinite uniform grid. Flattens hierarchy. Every
  item reads as equally important. Wrong for a curated editorial site.

### Cross-site patterns that recur

1. **Image-with-text-below dominates over text-on-image.** Five of six
   sites use it as the default; text-on-image is reserved for the lead
   hero only (Bon Appétit alone). At 25k tutorials with variable photo
   quality, image-with-text-below is the safer default. Text-on-image is
   the hero affordance, not the card affordance.

2. **Subtle row-header affordances do the wayfinding.** Section title +
   small "Show all →" link or category kicker (Spotify, NYT, Bon App,
   Apartment Therapy). The header strip carries editorial voice; the
   cards themselves stay quiet and uniform.

3. **Mixed serif/sans typography is the editorial signal.** NYT, Bon
   App, Apartment Therapy, Substack all pair serif headlines with sans
   metadata. The pure-sans sites (Spotify, Airbnb) read as utility
   platforms. This pairing is the single clearest dividing line between
   "calm magazine" and "search-result database". Homemade's
   Fraunces + Lora pairing is already on the editorial side; the
   redesign just exercises it harder.

---

## Part 2: Locked design principles

The eight principles that drive every decision in the spec.

1. **Image-first.** When image and text compete, image wins. Photo crop,
   photo quality, and photo dominance set the visual tone. Text exists
   to label the photo, not the other way round.

2. **Slow-living register survives the density increase.** Fraunces,
   Lora, sage, cream, parchment stay locked. The tone is unchanged; only
   the spacing compresses. Pinterest is dense AND calm. We follow that
   model.

3. **First-viewport density triples.** Currently ~5-7 items above fold
   at 1440px. Target ~15-20. See Part 5 for exact numbers per
   breakpoint.

4. **Variable card shapes per rail.** Every rail can have its own card
   pattern. No single uniform card across the whole page. Variation
   drives browsability for a 25k library and gives the page rhythm.

5. **Text-on-image is reserved for the hero and a single Pinterest-style
   rail.** Every other rail uses image-with-text-below. Text-on-image
   needs a gradient and only works on photos quiet enough to support
   overlaid text. That's an editorial selection per slot, not a card
   pattern to spray across the page.

6. **Section-anchored, not infinite-rail.** Each major topic (continue
   making, in season, per-category most-loved, community makes, makers
   to follow) gets a named section with editorial framing. No infinite
   scroll. The bottom of the page is a finite, navigable category index.

7. **Mobile density stays high.** Horizontal rails collapse to swipe;
   the category index stays a 2-column grid (not a stack); the hero
   compresses to text-on-image rather than splitting vertically. The
   density principle isn't a desktop-only luxury.

8. **No procedural cards as design language.** Procedurals are the
   invisible technical fallback that catches the last microsecond of a
   missing image. They never appear in this spec as a design option, in
   any rail, ever.

---

## Part 3: Component-by-component spec

Twelve sections covered. New / restructured components flagged.

### 1. Top nav (transparent-over-hero, solid-on-scroll)

- **Current:** [SiteHeader](apps/web/src/components/public/site-header.tsx)
  renders wordmark + category menu + search + user menu in a solid
  header strip above all content.
- **Proposed:** keep the same composition. Change the styling pattern to
  Netflix-style: transparent background while the user is over the hero
  zone, solid cream background with 0.5px sage rule below once scrolled
  past the hero. Wordmark stays cream while transparent (against the
  hero photo); switches to espresso when solid.
- **Brand tokens:** Lora caps for nav, sage links on cream when solid,
  cream on photo when transparent. Search input stays its current shape.
- **Mobile:** same pattern. Hamburger collapses the category menu.
- **Data:** no change.
- **Complexity:** small. CSS plus a small scroll listener (`IntersectionObserver`
  watching the hero zone).

### 2. Hero zone (full-bleed image + text overlaid bottom-left)

- **Current:** 50/50 split, image right + text left, `max-height: 60vh`,
  inside a 1280px container.
- **Proposed:** full-bleed photograph. Image spans the content width
  (1280px capped) on desktop; consider full-viewport-width on screens
  above 1440px so the hero feels Netflix-scale. Title + kicker + dek +
  CTA chip overlaid bottom-left over a dark-bottom-to-transparent-top
  gradient (linear-gradient, 50% height, rgba 0,0,0 0.55 to transparent)
  for legibility. State-aware switching stays exactly as today:
  `SCHEDULED_STEP` / `CONTINUE_MAKING` / `EDITORIAL_PICK` /
  `WORDMARK_FALLBACK`. Only the visual shell changes; the logic in
  [page.tsx](apps/web/src/app/(public)/page.tsx) doesn't.
- **Brand tokens:** Fraunces 56-72px title in cream; Lora caps kicker in
  cream with sage underline rule; Fraunces italic excerpt in cream at
  80% opacity; Lora CTA chip with sage outline. The gradient is the
  only structural addition.
- **Height:** 56vh desktop, 60vh tablet, 52vh mobile. Down from current
  60vh-uncapped so it doesn't eat the whole first viewport.
- **Mobile:** image switches to a 4:5 portrait crop; text overlay shifts
  to the lower 40%. The 50/50 horizontal split is dropped on mobile
  entirely (vertical stacking inflated the page height).
- **Data:** same as current. No schema change required.
- **Editorial consideration:** the editorial-pick slot needs hero-quality
  photos. Recommendation: introduce a `Tutorial.heroQuality` enum
  ('editorial' | 'standard' | 'fallback') so the homepage hero loader
  filters to 'editorial' only. Flagged as Open Decision 2 (Rebecca may
  prefer hand-curation without a schema field).
- **Complexity:** medium. Restructure `HeroEditorialPick` /
  `HeroContinueMaking` / `HeroScheduledStep` to share one `HeroOverlay`
  layout component. The current three are nearly identical and would
  collapse cleanly.

### 3. Density rails (the bulk of the page)

- **Current:** [HomeRail](apps/web/src/components/public/home-rail.tsx)
  + [HomeCard](apps/web/src/components/public/home-card.tsx). Cards
  220-240px wide, image 3:2 landscape, 14px gap, scroll-snap horizontal
  rail with arrow buttons (already shipped, see
  [home-page.css:175-247](apps/web/src/app/(public)/home-page.css:175)).
- **Proposed:** keep the rail shell. Change card shape to portrait
  (4:5 instead of 3:2) so each card takes more visual real-estate and
  the overall feel is Pinterest-portrait, not landscape-magazine.
  Tighten gap to 12px. Card title font down to 16-17px from 18px so the
  denser format reads cleanly. Show 5 cards above fold on 1440px (vs 4
  today). Show edge of card 3 on mobile to signal swipe.
- **Brand tokens:** unchanged. Kicker + title + meta hierarchy stays.
- **Mobile:** card width 65vw (was 68vw). Edge of next card visible.
- **Data:** no change.
- **Complexity:** small. CSS-only: aspect-ratio swap, grid-auto-columns
  resize, font tweak.

### 4. "Recently made by the community" rail (Pinterest moment)

- **Current:** [RecentlyMadeRail](apps/web/src/components/public/recently-made-rail.tsx)
  uses the same HomeCard shape as everything else, just in a horizontal
  rail.
- **Proposed:** switch to the **Pinterest Caption Card** pattern (see
  Part 4). Title overlaid bottom-left over a subtle gradient, no
  category kicker on-card, no metadata on-card. "Made by {name}"
  remains as a tiny line *below* the image so the maker credit doesn't
  compete with the title. Card heights vary (some 4:5, some 3:4, some
  1:1) to break the uniform rhythm and read like a Pinterest grid.
- **When user-content is thin (launch state):** rotate editorial photos
  with varied crops to simulate the masonry rhythm. Don't drop the rail
  to "uniform 4:5 because there's not enough content". The visual
  variation IS the rail's identity.
- **Mobile:** switches to 2-column **masonry grid** (not horizontal
  scroll). The whole point of Pinterest's mobile experience is the
  vertical browse, and this rail is the only one where Pinterest's
  mobile pattern fits better than the swipe rail. Other rails stay
  horizontal-swipe on mobile.
- **Brand tokens:** Fraunces 14-16px title in cream, overlaid; gradient
  rgba(0,0,0, 0.5 → 0); "Made by {name}" in Lora caps below image.
- **Data:** no schema change. `RecentlyMadeTile` already has all the
  fields needed.
- **Complexity:** medium. New `RecentlyMadeMasonry` component for
  mobile; desktop rail variant with mixed aspect ratios; the existing
  RecentlyMadeRail becomes a thin wrapper that picks shape by
  breakpoint.

### 5. "In season this week": asymmetric mosaic

- **Current:** standard HomeRail with uniform HomeCards.
- **Proposed:** 1 large featured tile (2× width and height of standard)
  + 4 smaller standard tiles in a 2×2 grid beside it on 1440px. On
  1280px, 1 large + 3 small in a 1×3 column. The featured tile uses the
  **Magazine Editorial Card** pattern (image + kicker + title + dek +
  byline); the smaller tiles use the **Standard Discovery Card**.
  Pattern borrowed from Bon Appétit's themed-package rows.
- **Mobile:** collapses to a standard horizontal-swipe rail using
  Standard Discovery Cards. Mosaic doesn't work mobile-narrow.
- **Brand tokens:** unchanged.
- **Data:** same `data.inSeasonNow`. First item gets the featured slot,
  remaining fill the grid.
- **Complexity:** medium. New `InSeasonMosaic` component with its own
  CSS grid; falls back to existing HomeRail at mobile breakpoint.

### 6. "Continue making" / "Where you left off" / "On your Make it list"

- **Current:** standard rails using HomeCard.
- **Proposed:** keep as horizontal rails using the new Standard
  Discovery Card. Add a thin sage progress bar at the bottom of the
  image (30% sage, fills to 100% as project completes). This is the one
  place metadata earns its place because it's actionable for the
  Maker. They can see at a glance which project is nearly done.
- **Brand tokens:** progress bar in sage, 3px tall, sits over the bottom
  edge of the image inside the rounded corner.
- **Mobile:** same horizontal rail.
- **Data:** needs UserProject percent-complete exposed in
  `ReaderState`. Check whether this field already exists; if not it's a
  small derived calculation (completed steps / total steps).
- **Complexity:** small. CSS addition + ReaderState surface.

### 7. "Today's scheduled project actions": switch to horizontal card

- **Current:** text-only cards (no image), parchment background, sit in
  a horizontal rail. Tutorial title + step number + step body, no photo.
- **Proposed:** switch to the **Substack Horizontal Card** pattern (see
  Part 4). Small 88×88 tutorial hero thumbnail on the right; overline
  ("Day 4 · Sourdough loaf") + step title (Fraunces 18px) + step body
  (1 line, Lora 14px) + CTA chip ("Open the project →") on the left.
  The image makes the row feel like an inbox of "next steps" rather
  than a wall of text.
- **Brand tokens:** parchment background stays. Border on focus only.
- **Mobile:** same horizontal card shape, 64×64 thumbnail.
- **Data:** same.
- **Complexity:** small. New `ScheduledActionCard` component replacing
  the inline card markup in
  [page.tsx:141-153](apps/web/src/app/(public)/page.tsx:141).

### 8. Per-category "Most-loved in X" rails

- **Current:** HomeRail + HomeCard per spine category (cooking, baking,
  garden, mindset, herbal).
- **Proposed:** keep the rails, use Standard Discovery Card. Add a
  small 24×24 category icon (sage, line-style, phosphor or hand-drawn
  set TBD) to the rail header, left of the heading text. Categorisation
  IS the navigation; the icon strengthens it visually and gives the
  page rhythm at the rail-header level.
- **"See all" link** moves to a standard position (top-right of the
  rail header). Already partly done; just be consistent across every
  per-category rail.
- **Brand tokens:** 24×24 icon in sage, then Fraunces 20px heading,
  then "See all →" right-aligned in Lora caps.
- **Mobile:** same.
- **Data:** needs a `Category.iconKey` field OR a derived icon from a
  static map keyed by category slug. The derived-map approach is
  preferred: no migration, single source of truth in code. Flag the
  decision in Part 6.
- **Complexity:** medium. Icon set selection + integration into rail
  header.

### 9. "Makers to follow" rail (NEW)

- **Current:** doesn't exist on the homepage. Maker of the Month is the
  only Maker-surface today and it sits at the bottom.
- **Proposed:** add a "Makers to follow" rail above the category index.
  Pinterest Caption Card pattern using Maker profile photo as card
  image, Maker handle overlaid bottom. Click → Maker profile page.
- **Brand tokens:** same as Pinterest caption card. Profile photos
  should be circular-cropped to differentiate from tutorial cards (so
  the rail reads "people" not "things").
- **Mobile:** horizontal scroll.
- **Data:** needs a new loader, `loadFeaturedMakers({ limit: 12 })`.
  Hand-curated for launch via a `User.isFeaturedMaker` boolean (small
  Maker pool initially). Algorithmic ranking later.
- **Coordination note:** this enters Session A territory (Maker public
  surfaces). Decide whether the homepage rail builds in this session
  using a stub loader, or waits for Session A. Flagged as Open
  Decision 5.
- **Complexity:** medium. New loader + new component + `isFeaturedMaker`
  schema field.

### 10. Maker of the Month tile

- **Current:** full-width tile in the rail stack.
- **Proposed:** keep as-is. The full-width editorial break tile is the
  right break from rail density. Tighten the photo crop and consider a
  Fraunces 32px title (up from current). Otherwise no change.
- **Complexity:** small (cosmetic).

### 11. Category index ("Browse all categories")

- **Current:** 3-4 column grid of parchment tiles with name + 3-line
  description, `auto-fill, minmax(220px, 1fr)`. Reads as a directory
  table, not a discovery surface.
- **Proposed:** switch to image-driven category cards. Each category
  gets a curated category-hero photo (derived from the category's
  anchor tutorial's hero, already in the DB, no migration). Category
  name overlaid bottom-left in Fraunces 24-28px with a subtle gradient.
  Description drops entirely from the card. The photo plus name carries it.
  Grid: 4 col at 1440px, 3 col at 1024px, 2 col at 768px, 2 col at
  375px. Cards are 4:5 portrait at the larger breakpoints.
- **Brand tokens:** Fraunces 24-28px in cream overlaid; sage gradient
  base, dark vignette top-right corner for cream wordmark legibility.
- **Mobile:** 2-column grid (not single-column stack; the density
  principle holds on mobile).
- **Data:** uses category anchor tutorial's hero. No schema change if
  every category has an anchor tutorial already; otherwise a
  `Category.heroMediaId` override.
- **Complexity:** medium. Replaces the existing parchment tile
  component. New CSS, new image-loading.

### 12. Onboarding card (untouched)

- **Current:** inline card at top of homepage for new users:
  ~200-260px tall, one question, "Continue" / "Skip for now".
- **Proposed:** no change. The locked treatment from
  [project_ux_review_briefs.md](C:\Users\Rebecca\.claude\projects\C--Users-Rebecca-Projects-code-homemade\memory\project_ux_review_briefs.md)
  stays. It was settled in the second-pass feedback after the first
  homepage ship.
- **Complexity:** zero.

---

## Part 4: Card pattern library

Five reusable card patterns. Each rail picks one; the page reads varied,
not chaotic, because variation happens at the rail-pattern level not
inside a single rail.

### Pattern A: Editorial Hero Tile

Used only for the hero zone. Full-bleed image with text overlaid bottom-left.

```
┌───────────────────────────────────────────────────────┐
│                                                       │
│                                                       │
│           [full-bleed photograph, 16:9]               │
│                                                       │
│   EDITORIAL PICK · COOKING                            │
│   Slow-Roast                                          │
│   Lamb Shoulder                                       │
│   On crushed butter beans and salsa verde.            │
│   [READ THE GUIDE →]                                  │
└───────────────────────────────────────────────────────┘
```

- Image: 16:9 desktop, 4:5 mobile.
- Gradient: linear bottom-to-transparent, rgba(0,0,0,0.55) to 0, 50%
  height.
- Text: Lora caps kicker, Fraunces 56-72px title (cream), Fraunces
  italic excerpt (cream 80% opacity), Lora CTA chip with sage border.
- Mobile: same overlay, smaller title (40-48px), kicker stays.

### Pattern B: Standard Discovery Card

Used for: continue making, where you left off, make-it list, in-season
small tiles, per-category most-loved, new since last visit.

```
┌───────────────────┐
│                   │
│   [photo, 4:5]    │
│                   │
│                   │
└───────────────────┘
  COOKING
  Roast tomato
  and harissa soup
  45 min · Beginner
```

- Image: 4:5 portrait, rounded corner 4px (matches existing).
- Text below: Lora 10px caps kicker (category), Fraunces 16-17px title
  (clamped to 2 lines), Lora 11px metadata (time · difficulty) one
  line.
- Saved-bookmark icon top-right on image (existing); dietary badges
  bottom-right on image (existing).
- Hover: faint scale 1.02 on image, no overlay.
- Mobile: same shape, 65vw width when scrolled.

### Pattern C: Pinterest Caption Card

Used for: recently made by the community, makers to follow, category
index tiles.

```
┌───────────────────┐
│                   │
│   [photo, varied  │
│    height: 4:5,   │
│    3:4, or 1:1]   │
│                   │
│ Sourdough loaf    │
│ with fennel       │
└───────────────────┘
   Made by Hannah
```

- Image: varied aspect ratios across the rail (4:5, 3:4, 1:1) to break
  uniform rhythm. Title overlaid bottom-left over a small gradient
  (rgba(0,0,0,0.5 → 0), 35% height).
- Title: Fraunces 14-16px in cream, overlaid.
- Subtitle (optional): "Made by {name}" or "@{handle}" in Lora caps
  *below* the image so it doesn't compete with the title.
- Mobile: 2-column masonry on the community rail; horizontal swipe on
  others.

### Pattern D: Magazine Editorial Card

Used for: this week's editorial picks, in-season featured tile, "new
since you last visited" lead item.

```
┌─────────────────────────────────────┐
│                                     │
│     [photo, 3:2 landscape]          │
│                                     │
│                                     │
└─────────────────────────────────────┘
  COOKING
  Slow-roast lamb shoulder
  on crushed butter beans
  Tender, fork-pulled lamb with a herb-bright relish.
  by Hannah · 3 hr · Intermediate
```

- Image: 3:2 landscape, rounded corner 4px. Wider card (320-360px on
  desktop) than the standard discovery card.
- Text below: Lora caps kicker, Fraunces 18-20px title (2 lines),
  Fraunces italic 13-14px dek (2 lines), Lora 11px byline +
  time + difficulty.
- Mobile: 80vw width when scrolled.

### Pattern E: Substack Horizontal Card

Used for: today's scheduled project actions.

```
┌─────────────────────────────────────────────┬──────┐
│ DAY 4 · SOURDOUGH LOAF                      │      │
│ Shape and proof                             │ [88] │
│ Form the dough into a tight boule and       │      │
│ let it proof in the banneton for 4 hours.   │      │
│ [OPEN THE PROJECT →]                        │      │
└─────────────────────────────────────────────┴──────┘
```

- Layout: text left (flex-grow), thumbnail right (88×88 rounded 4px).
- Text stack: Lora caps overline ("Day N · {tutorial title}"),
  Fraunces 18px step title, Lora 14px step body (1 line clamp),
  Lora caps CTA chip.
- Parchment background, no border (focus border only).
- Mobile: same shape, thumbnail 64×64.

---

## Part 5: First-viewport density target

### Targets per breakpoint

| Breakpoint | Items above fold | Current state |
|------------|------------------|---------------|
| 1440px     | 15-20            | 5-7           |
| 1280px     | 12-15            | 4-5           |
| 768px      | 8-12             | 3-4           |
| 375px      | 4-6              | 2-3           |

These numbers count tiles as items. The hero counts as 1; a rail header
counts as the rail's identity (not as an item); each visible card in a
rail counts as 1.

### Allocation at 1440 × 900 viewport (illustrative)

| Zone               | Height (px) | Cumulative | Items |
|--------------------|-------------|------------|-------|
| Top nav transparent| 0 (overlaid)| 0          | 0     |
| Hero               | 504 (56vh)  | 504        | 1     |
| Hero to rail gap   | 32          | 536        | 0     |
| Rail 1 header      | 44          | 580        | 0     |
| Rail 1 cards (5 × 4:5 at ~220px wide → ~275px tall image + ~70px text) | 345 | 925 | 5 |
| Rail 2 header peeks above fold | -- | (fold at 900) | (header visible) |

Above fold at 1440 × 900: hero (1) + 5 cards in rail 1 = **6 strong
items** with the next rail's header peeking. The "preview of below the
fold" is the rail-header peek, which is the explicit invitation to
scroll.

To hit 15-20 we need the viewport to be tall enough to show rail 2 in
full as well. At 1440 × 1100 (a common modern desktop with browser
chrome consuming ~80px): hero + 5 + rail 2 header + 5 = ~12 items
visible, with edge of rail 3 peeking. That's a 2.5× jump from today.

The headline number ("15-20 items above the fold") is achievable on
larger desktop heights (1440 × 1200+) and on the homepage's most
common shape (the user scrolls 1-2 rails-worth and is now seeing 15-20
items). The principle is that the page must reward downward scroll
immediately: every rail header should be visible within one swipe of
the previous rail's cards. Today rail-to-rail spacing eats most of
that scroll.

### Compression sources (where the density comes from)

| Source                              | Saved px per occurrence |
|-------------------------------------|-------------------------|
| Hero from 60vh+ to 56vh             | ~30                     |
| Rail vertical padding 40 → 24       | 32 (per gap)            |
| Rail header → cards margin 20 → 12  | 8 (per rail)            |
| Card image 3:2 → 4:5 (same width)   | +37 (per card visible)  |
| Card text gap 10 → 6                | 4 (per card)            |
| Card title 18 → 16                  | ~3                      |
| "Make-it list" overline drop        | ~14 (per saved rail)    |

Net effect: each rail-to-rail handoff loses ~40px of vertical real
estate while each card-image gains ~37px of visual weight. The page
gets *denser AND more image-rich at the same time*. The trade isn't
density vs photography; it's whitespace-as-respiration vs.
images-as-respiration. Images give the page room to breathe better than
whitespace does, because the image is itself a moment of pause.

---

## Part 6: Open decisions for Rebecca

Five decisions to lock before the build session fires. The build
session reads these answers in this doc.

### Decision 1: Hero rotation cadence

Does the editorial-pick hero rotate between 3-5 picks per week
(carousel with autoplay or dot pagination), or stay fixed on one pick
that admin changes manually?

- **Rotation:** richer first impression, encourages re-visits ("what's
  new today?"), adds carousel UI cost (autoplay, pause-on-hover,
  reduced-motion support, indicators).
- **Fixed:** simpler, calmer, demands one truly excellent photo per
  week from editorial.

Orchestrator lean: **fixed** for launch. Rotation can come after
content velocity proves the editorial team can supply 3-5 hero-quality
photos weekly without strain.

### Decision 2: Hero photo-quality gate

Should the editorial-pick hero require a schema flag
(`Tutorial.heroQuality` enum: editorial | standard | fallback) so only
hero-grade photos surface, or rely on admin judgement at pick-time
with no schema field?

- **Schema flag:** enforces discipline, prevents a weak photo
  accidentally surfacing. Author/admin cost: one more curation step.
- **Admin judgement:** no schema change, no migration. Risk: a weak
  photo slips through if admin isn't paying attention.

Orchestrator lean: **schema flag.** Cheap to add now (per
`feedback_schema_all_fields_upfront.md`), expensive to retrofit later.

### Decision 3: Mobile pattern for "Recently made by the community"

Pinterest-style 2-column masonry, or horizontal swipe rail like every
other section?

- **Masonry:** more engaging mobile browse, more in keeping with the
  Pinterest character of the rail, more code (masonry layout + image
  height variation logic).
- **Swipe rail:** consistent with every other mobile rail, less code,
  less engaging.

Orchestrator lean: **masonry.** This rail is the one place the
Pinterest pattern earns its keep on mobile, and the engagement model is
meaningfully different.

### Decision 4: Category index treatment

Image-driven category cards with name overlaid (Pinterest-feeling,
shorter), or labelled parchment tiles + description (current,
orienting)?

- **Image cards:** ends the page on a visual high; reduces text density
  at the bottom; relies on category-hero photos.
- **Labelled tiles:** more orientation for newcomers who don't know
  what "Mindset" means yet; safer if anchor-tutorial photos for some
  categories aren't strong yet.

Orchestrator lean: **image cards** with a small "what's in this
category" line *below* the card image (compromise position). Best of
both: visual at the top of the card, orientation at the bottom in
small Lora.

### Decision 5: "Makers to follow" rail sequencing

Build the rail in this homepage session using a hand-curated featured
list (stub loader, `User.isFeaturedMaker` boolean), or wait for Session
A's Maker public surfaces to ship first?

- **Build now:** homepage gets a complete Maker surface from day one;
  forces Session A coordination but the schema field is trivial.
- **Wait:** cleaner sequencing; the rail's destinations (Maker profile
  pages) don't exist yet so clicks lead nowhere or to placeholders.

Orchestrator lean: **wait.** The rail without working destinations is
worse than no rail. Add it as a follow-up after Session A ships.

---

## Estimated build complexity

Total: **one large worker session, Opus.** Visual judgement matters
across every component; Sonnet for content authoring isn't right here.

Breakdown:

| Component                          | Size       |
|------------------------------------|------------|
| Top nav transparent-on-hero        | Small      |
| Hero zone full-bleed restructure   | Medium     |
| Standard rail card aspect shift    | Small (CSS)|
| Recently-made Pinterest card + mobile masonry | Medium |
| In-season asymmetric mosaic        | Medium     |
| Continue-making progress bar       | Small      |
| Scheduled action horizontal card   | Small      |
| Per-category icon in rail header   | Medium (icon set) |
| Makers to follow rail              | (deferred per Decision 5) |
| Maker of the Month tile polish     | Small      |
| Category index image redesign      | Medium     |
| Onboarding card                    | Zero       |

Plus one schema migration if Decision 2 = schema flag
(`Tutorial.heroQuality`).

The work is parallelisable into 3-4 components inside one session: a
hero shell, the card library expansion, the mosaic / masonry layouts,
and the category index image swap. Each touches its own files; no two
fight for the same component.

---

## Hand-off

When this spec is approved, the build session reads it and works
through the components in this order:

1. Card pattern library: implement the 5 patterns in
   `apps/web/src/components/public/home-cards/` so subsequent sections
   compose against them.
2. Hero zone restructure (depends on pattern A).
3. Standard rails CSS-only update (depends on pattern B).
4. In-season mosaic (depends on patterns B + D).
5. Recently-made Pinterest rail + mobile masonry (depends on pattern C).
6. Scheduled action card (depends on pattern E).
7. Per-category rail icons.
8. Category index image redesign (depends on pattern C variant).
9. Top nav transparent treatment.
10. Continue-making progress bar.

Build session brief should include this doc by reference and the
Rebecca answers from Part 6.
