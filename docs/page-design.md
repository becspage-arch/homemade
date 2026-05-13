# Page design — recipe and technique

The locked specification for the two public content pages on
homemade.education: the **recipe** page (primary content) and the
**technique** page (reference content). Every component, every field,
every interaction; desktop, mobile, and print.

This doc is the source of truth for the schema additions in Phase 8
Step 2 and the UI work in Step 3 onward. If a component is documented
here but missing from code, it's a gap to close. If a component is in
code but missing here, the doc is wrong and gets patched.

## 1. Purpose

The recipe page is where a reader lands when they've picked something
to cook. Everything on the page either helps them decide they want to
make it, or helps them make it without leaving.

The technique page is where a reader lands when they've hit a step
they don't know how to do — a roux, a chiffonade, blocking a square.
A technique page is reference, not a project in itself.

Recipes lead, techniques support. A recipe references techniques via
the SubTutorialCard block; the technique page never references a
specific recipe in its body, but the page auto-surfaces the recipes
that link in.

The spec covers both pages because they share most of their chrome
(layout, header, footer, reading tools) and differ in the body
sections that sit between them.

## 2. Recipe page

A `RECIPE` Tutorial. Lives at `/[categorySlug]/[tutorialSlug]`, same
route as a technique; the `type` discriminator on Tutorial picks the
renderer. Desktop layout is a three-column grid: sticky TOC on the
left, body in the centre, project companion on the right.

### 2.1 Header / hero zone

| Element | Source | Notes |
|---|---|---|
| Breadcrumb | `Category` + `SubCategory` + tutorial title | All-caps small label. Last segment is the title; non-link. |
| Eyebrow label | Static "A recipe" (or "A bake", "A preserve" by SubCategory) | Fraunces italic. Sits above the H1. |
| Title (H1) | `Tutorial.title` | Fraunces 64px desktop, 44px mobile. |
| Subtitle / standfirst | `Tutorial.subtitle` falling back to `Tutorial.excerpt` | Fraunces italic 21px. One sentence that sets the scene without being precious. |
| Hero image | `Tutorial.hero` → `mediaUrl(_, 'hero')` | Editorial food photography (locked, see `project_content_pipeline.md`). 4:3 aspect on desktop, collapses on mobile. |
| Author byline | "By Homemade" (default) or "By {creator displayHandle}" linking to `/makers/{handle}` | Single line beneath the standfirst. The creator path matters from Phase 6 onward. |
| Social proof strip | Reviews count, completion rate, average actual time from `UserProject.timeToCompleteMinutes` | Only renders when there's enough completed-project data to back it up. **Open question 1.** |

### 2.2 Info bar

Sits as a thin horizontal strip beneath the hero, above the body grid.
Wraps to two rows on mobile. Every value is a `<dl>` term/description
pair.

| Field | Source | Behaviour |
|---|---|---|
| Prep time | `Tutorial.prepMinutes` | "10 min" / "1 hr 10 min". Hidden if null. |
| Cook time | `Tutorial.cookMinutes` | Same formatting. Hidden if null. |
| Total time | `Tutorial.totalMinutes` | Always shown if any time field is present. |
| Servings | `Tutorial.servings` | "Serves 4" or "Makes 12". Reads `servings` plus a noun lookup keyed off `mealType` (drinks → "Makes", baking → "Makes", everything else → "Serves"). |
| Difficulty | `Tutorial.difficulty` | Existing field. |
| Cuisine | `Tutorial.cuisine` | Single enum. Shown as label only when set. |
| Meal type | `Tutorial.mealType` | Single enum. |
| Dietary | `Tutorial.dietaryFlags[]` (derived) | Up to 7 chips: vegetarian, vegan, gluten-free, dairy-free, halal, kosher, nut-free. Pills, sage outline. Auto-computed from ingredient flags but overridable on the tutorial row. |
| Freezable | `Tutorial.freezable` | Single badge "freezable". Sage solid. Renders even when other badges are off. |
| Batchable | `Tutorial.batchable` | "good for batch-cooking". |
| Make-ahead | `Tutorial.makeAheadNotes != null` | "make-ahead". Tooltip on hover reveals first line of notes. |
| Published date | `Tutorial.publishedAt` | "Published 14 March 2026". Italic, small. |

Mood tags (`Tutorial.mood[]`) do not appear in the info bar — they're
search dimensions, not header content. **Open question 2.**

### 2.3 Actions bar

Sits between the info bar and the body, full-width on the body
column. All buttons are pill-shaped, sage outline, 12px letter-spacing
text.

| Button | When | Action |
|---|---|---|
| Save | Always. Signed-out shows the same button — first click goes to `/sign-in?after=…`. | `toggleBookmark` — fills the bookmark glyph + flips label to "Saved". |
| I'm making this | Always when signed-in; absent for signed-out (no project lifecycle for anonymous). | `startProject` → state changes to "In progress" + reveals the project companion sidebar. |
| Scale | Always. Disabled with tooltip when `scalable === false`. | Opens scale selector (see 2.5). |
| Share | Always. | Native share API where available; popover with Twitter / Pinterest / Facebook / Email / Copy link otherwise. |
| Print | Always. | `window.print()` — see § 6. |

### 2.4 Body — excerpt and intro

The recipe body starts with a single `<p class="lead">`-sized
paragraph — the same string as `Tutorial.excerpt` if present, or the
first paragraph of `Tutorial.body` if not. After that, the method
narrative begins.

### 2.5 Body — structured ingredients

A new TipTap block `ingredientsList` (Phase 8 Step 3). Replaces the
free-text `suppliesCard` for recipes.

**Block shape:**

```ts
type IngredientsListBlock = {
  type: 'ingredientsList'
  attrs: {
    label?: string             // e.g. "For the béchamel" — groups within a single recipe
  }
  content: IngredientRow[]
}

type IngredientRow = {
  ingredientId: string         // FK → master Ingredient
  amount: number | null        // null = "to taste" or "a knob of"
  unit: string | null          // g, ml, tbsp, each, pinch, …
  prepNote: string | null      // "finely sliced", "at room temperature"
  freeText: string | null      // fallback when the ingredient isn't in the master table
  tokenId: string | null       // used by method narrative to inject the scaled amount
}
```

**Render:**

- Section heading "Ingredients" (or a list of group labels if there
  are multiple `ingredientsList` blocks with `attrs.label`).
- Each row: amount + unit + ingredient name (linked to a future
  `/ingredients/{slug}` page once that ships) + prep note in italics.
- "To taste" rows show no quantity column; just the name plus prep
  note ("salt, to taste").
- Hover state: faint sage background. Click toggles a "have it"
  state synced to the project companion supplies list.

**Scaling:**

- Inline scale selector above the list: `1× · 2× · 4× · 6× · Servings:
  [—] [4] [+]`. Re-renders amounts live.
- Method narrative uses `{{tokenId}}` references; the renderer
  substitutes the scaled amount inline. ("Sift the {{flour}} into…"
  becomes "Sift the 300 g flour into…" at 1× and "Sift the 600 g
  flour into…" at 2×.)
- Non-scalable recipes hide the selector and render a tooltip on the
  disabled "Scale" button: "Bakery recipes work by ratios — scaling
  changes the result." Specific copy lives next to the field.

### 2.6 Body — equipment

A new block `equipmentList` (also Phase 8 Step 3 or close behind).
Same shape as `ingredientsList` but rows point at master `Tool` rows.

- Rendered as a checklist below the ingredients on desktop, or
  collapsed under "What you'll need" on mobile.
- Each row links to a future `/tools/{slug}` page.
- Recipes can mark individual tools optional (`RecipeTool.optional`).
- Equipment block is optional per recipe — a simple bake might not
  declare equipment beyond "an oven, a bowl, a spoon", in which case
  the block is absent.

### 2.7 Body — method narrative

Numbered steps. Same TipTap rich-text the editor produces today,
extended with:

- `{{tokenId}}` substitution from the structured ingredients block.
- Inline glossary tooltips (`glossaryTooltip` mark on selected text).
- Inline `infoPanel` blocks (tip / warning / info) for sidebars within
  the method.
- `subTutorialCard` blocks where a step references a technique.
- `pullQuote` blocks for editorial breath between sections.

The body should remain readable as a top-to-bottom narrative — no
forced step numbering bar (numbered list is a regular `<ol>`).

### 2.8 Body — make-ahead, freezer, batch notes

Three dedicated block types, each rendered as a slim aside with a
small sage label.

| Block type | Source field | Label | When |
|---|---|---|---|
| `makeAheadNotes` | `Tutorial.makeAheadNotes` | "Made ahead" | Renders if the field is non-empty. |
| `freezeNotes` | `Tutorial.freezeNotes` | "From the freezer" | Renders if `Tutorial.freezable` is true and notes exist. |
| `batchNotes` | `Tutorial.batchNotes` | "Cooking for the week" | Renders if `Tutorial.batchable` is true. |

These render automatically at the foot of the method narrative if
the corresponding field is set on the Tutorial. Authors don't insert
them by hand — they fill the metadata field, and the renderer places
the block.

### 2.9 Body — embedded custom blocks

All eight existing TipTap blocks work inside a recipe:

| Block | Behaviour in a recipe |
|---|---|
| InfoPanel | Tip / warning / info side note. Used freely. |
| SuppliesCard | **Deprecated for recipes.** New recipe drafts use `ingredientsList` + `equipmentList`. Existing recipe drafts authored before Phase 8 Step 3 fall back to SuppliesCard. |
| GlossaryTooltip | Inline term highlight; popover on hover, inline expansion in beginner mode. |
| SubTutorialCard | Links to a technique page. Graceful no-op when the target tutorial is unpublished. |
| PullQuote | Editorial pull quote with optional attribution. |
| ProductCard | A specific tool or ingredient with description and what-to-look-for copy. **Price / retailer / URL fields stay empty until the marketplace lands** (`feedback_homemade_voice.md`). |
| VarietiesPanel | Variations on the dish ("Six pasta shapes that work", "Three takes on a custard"). Used sparingly. |
| Troubleshooter | Symptom → cause → fix rows. The single most useful block for cooking; encouraged where the recipe has known pitfalls. |

### 2.10 Sidebar — sticky TOC

Left rail on desktop ≥ 1280px. Sits beneath the site header at
`top: 88px`. Generated from `<h2>` and `<h3>` headings inside
`.tutorial-content`.

- Active section highlighted via `IntersectionObserver`.
- Hidden below 1280px width; collapses to an inline `<details>` at
  the top of the body on tablet and below.
- Mobile: a floating "On this page" trigger that opens a bottom
  sheet listing the same sections.

### 2.11 Sidebar — project companion (right rail)

Right rail on desktop ≥ 1100px. Sticky at `top: 88px`. Renders only
when the signed-in reader has an `IN_PROGRESS` `UserProject` against
this tutorial.

**Project pane:**

- Heading: "Your {dish name} project".
- Status pill: "In progress · started 12 March".
- Mark complete button (primary sage).
- Set aside button (secondary outline).

**Supplies pane (the structured ingredients):**

- Pulls from the recipe's `ingredientsList` rows.
- Each row shows amount (at current scale) + name + a "have it"
  toggle.
- "Cost to complete" total stays hidden until the marketplace lands;
  the locked rule in `feedback_homemade_voice.md` forbids speculative
  prices. The reference HTML's £-rollup is aspirational, not
  Phase-8.

**Notes pane:**

- Free textarea. Debounced auto-save via `updateProjectNotes`.
- Private to the reader.

**Settings pane:**

- Beginner mode toggle (re-renders the body — `User.beginnerMode`).
- Reading size: small / medium / large (CSS variable on the page
  root). New from this spec; see § 7.
- Future: temperature unit (°C / °F), measurement system (metric /
  imperial). Both deferred to Step 12 once we have a way to convert
  on the server.

The companion collapses to a mobile sheet under 1100px width: a
fixed pill bottom-right opens a slide-up modal with the same tabs.

### 2.12 Sidebar — Saved recipes mini-list

A small block under the project companion (still right rail). Shows
the reader's three most recently bookmarked recipes as one-line links
with thumbnails. Absent when the reader has zero bookmarks. Hidden in
print.

### 2.13 Footer — sources / provenance

Renders below the body. Reads `Tutorial.sourceType` + `sourceNotes`.

- `TESTED` → "Tested in the Homemade kitchen."
- `CLASSIC` → "A classic recipe, cross-referenced across {n} sources."
  with the notes appended.
- `SYNTHESISED` → "Synthesised from {sources}." with the notes.
- `PUBLIC_DOMAIN` → "From {source}. Public domain."
- `CREATOR` → "From {creatorName}." with byline link.

Sources sit inside an `<aside class="sources">` with a small sage
label. Print-visible.

### 2.14 Footer — reviews block

Existing `ReviewsBlock` component. Section heading "From people who
actually made it". Shows:

- Star average + distribution bars.
- Count of completed projects + count of reviews.
- Review composer (gated to readers with a `COMPLETED` `UserProject`).
- Sorted list of reviews with author, photo (if attached), date,
  helpful count.
- "Report this review" link per row.

### 2.15 Footer — Made by others (UGC photos)

Existing `PhotosBlock` component. Section heading "Made by readers".
Grid of moderated `UGCPhoto` rows.

- Upload form for signed-in readers with `IN_PROGRESS` or `COMPLETED`
  projects.
- Each photo links to the reader's `/makers/{handle}` profile.
- **Photo uploads are gated off in production** until the legal
  pages land — surface stays visible with an explanatory empty state.

### 2.16 Footer — Q&A block

Existing `QaBlock` component. Section heading "Questions and answers".

- Per-question composer for any signed-in reader.
- Per-answer composer beneath each question.
- "From Homemade" badge on answers authored by ADMIN / EDITOR / creator.
- Upvote toggle per question (one per reader).

### 2.17 Footer — errata link

Existing `ErrataLink` component. Single small button: "Something wrong
with this recipe?" → modal with a textarea → `submitErrata`.

### 2.18 Footer — related recipes

Three-card grid at the foot of the page. Source:

- Primary: same `cuisine`, descending `publishedAt`.
- Secondary: same `mealType`.
- Tertiary: ingredient overlap with the current recipe (count of
  shared `RecipeIngredient.ingredientId` rows, descending). **Phase 8
  Step 4 dependency — only meaningful once the master ingredient
  list is seeded.**

Hidden when fewer than three published recipes match. Hidden in
print.

### 2.19 Footer — leftover bridge

A single-card editorial block: "When you've cooked one of these,
this is what to do with the leftovers." Manually curated by the
author per recipe via `Tutorial.leftoverTutorialId: String?` (added
in the schema migration alongside the rest of the recipe metadata
fields). Renders only when set; hidden in print.

## 3. Technique page

A `TECHNIQUE` Tutorial. Same route, same `TutorialChrome` layout.
The page differs from a recipe in body sections and in the metadata
fields surfaced.

### 3.1 Header / hero zone

- Breadcrumb, eyebrow ("A technique"), title, subtitle.
- Author byline same rules as recipe.
- **Hero image is a hand-drawn botanical illustration, not editorial
  photography.** Locked in `project_content_pipeline.md`. The
  difference is enforced by the AI prompt at authoring time; the
  schema doesn't carry a separate `heroStyle` field. `Tutorial.type`
  plus the authoring prompt are enough to pick the right visual
  style when image generation runs pre-launch.

### 3.2 Info bar

Reduced set compared to a recipe:

| Field | Source | Behaviour |
|---|---|---|
| Difficulty | `Tutorial.difficulty` | Same. |
| Time | `Tutorial.timeMinutes` | "About 5 min", "10 to 15 min". The technique-page version of total time. |
| Category | `Category.name` + `SubCategory.name` | Where this technique sits — "Knife skills", "Mother sauces", "Foundation breads". |
| Foundational? | `Tutorial.foundational` (new bool) | "Foundational technique" badge for the 500–700 truly core entries. **Open question 5 — confirm the field is worth carrying separately from category.** |
| Published date | `Tutorial.publishedAt` | Same as recipe. |

No prep / cook / total / servings / dietary / freezable / batchable
/ cuisine / meal type / mood — irrelevant to a technique.

### 3.3 Actions bar

Trimmed compared to a recipe:

- Save → bookmark same as recipe.
- I'm learning this → project starter. Same lifecycle as a recipe
  project, but the framing is reference learning rather than a
  cooked output. Companion supplies pane is hidden — see 3.8.
- Share — same.
- Print — same.

No scale button (no scaling on a technique).

### 3.4 Body — excerpt and intro

Same as recipe.

### 3.5 Body — no ingredients block

A technique describes a method, not a yield. No `ingredientsList`,
no `equipmentList`. Where supplies are mentioned ("a sharp paring
knife, a chopping board") the author uses the existing free-text
`suppliesCard` block or a `productCard` for specific kit
recommendations.

### 3.6 Body — method narrative

Diagram-led where possible, photo-led where not. Inline hand-drawn
botanical watercolours (locked visual style) carry the demonstration
across most steps. The same TipTap renderer powers the body.

Custom blocks available in a technique:

| Block | Recipe? | Technique? | Notes |
|---|---|---|---|
| InfoPanel | ✅ | ✅ | Same behaviour. |
| SuppliesCard | 🟡 (deprecated for new recipes) | ✅ | Primary supplies surface on a technique. |
| GlossaryTooltip | ✅ | ✅ | Same. |
| SubTutorialCard | ✅ | ✅ | A technique can link to a more foundational technique (e.g. "Beurre blanc" → "Emulsifying butter"). |
| PullQuote | ✅ | ✅ | Same. |
| ProductCard | ✅ | ✅ | Same rules — generic title, empty price / retailer fields until marketplace. |
| VarietiesPanel | ✅ | ✅ | Varieties of knife, of flour, of crochet hook. Common on techniques. |
| Troubleshooter | ✅ | ✅ | Heavy on techniques — common failures and fixes. |
| ingredientsList | ✅ | ❌ | Recipe-only. |
| equipmentList | ✅ | ❌ | Recipe-only. The technique-side equivalent is SuppliesCard. |

### 3.7 Body — linked-from recipes panel

A new dynamic block. Renders at the foot of the technique body, above
the sources aside. Queries:

```sql
SELECT * FROM Tutorial
WHERE type = 'RECIPE'
  AND status = 'PUBLISHED'
  AND body @> jsonb_build_array(
    jsonb_build_object('type', 'subTutorialCard',
                       'attrs', jsonb_build_object('tutorialId', $1)))
ORDER BY publishedAt DESC
LIMIT 12;
```

(Or equivalent — the actual query lives in the renderer, this is
illustrative.)

- Heading: "Recipes that use this".
- Grid of recipe cards (same shape as the related-recipes grid).
- Hidden when zero results.
- Hidden in print.

**Open question 6 — should this query run at request time
(invalidating on tutorial publish / unpublish) or pre-compute on a
nightly job? Request-time is simpler but adds a JSONB scan per page
load.**

### 3.8 Sidebar — project companion (right rail)

Renders when a signed-in reader has an `IN_PROGRESS` project against
this technique. The companion runs in a reduced mode:

- Project pane (heading, started date, mark complete, set aside) —
  same as recipe.
- Supplies pane — hidden. Technique projects are about reading and
  practising, not about gathering supplies in advance.
- Notes pane — same as recipe.
- Settings pane — same as recipe.

### 3.9 Footer — sources / provenance

Same component, same sourceType labels.

### 3.10 Footer — reviews / photos / Q&A / errata

Reviews work the same — a reader who marked the technique
`COMPLETED` can write a review.

Photos use the same block: readers post pictures of, say, their
chiffonade attempt. Same gating.

Q&A and errata: identical to recipe.

### 3.11 Footer — related techniques

Three-card grid. Source:

- Same `SubCategory` first (knife skills → other knife skills).
- Same `Category` second.
- Manual editorial relations via a future `RelatedTutorial` join
  table — not part of Phase 8. Until then, automatic only.

Hidden when fewer than three published techniques match.

## 4. Shared components

Both pages render through the same `TutorialChrome` (see
[apps/web/src/components/public/tutorial-chrome.tsx](apps/web/src/components/public/tutorial-chrome.tsx)).
The chrome is responsible for: the breadcrumb, the hero, the info
bar, the actions bar, the three-column layout, the body container,
the sources aside, and the footer slot.

### 4.1 Site header

`apps/web/src/app/(public)/header.tsx` provides:

- Wordmark linking to `/`.
- Primary nav: top-level Category names (Cooking, Baking, Gardening,
  Crochet, Knitting).
- Search bar (icon-only on tablet, inline input on desktop).
- Auth state: "Sign in" pill for signed-out; avatar disc + greeting
  menu for signed-in.

The header is sticky and blurs on scroll.

### 4.2 Reading progress bar

`ReadingProgress` ([tutorial-reader/reading-progress.tsx](apps/web/src/components/public/tutorial-reader/reading-progress.tsx)).

- 2 px sage bar fixed at the top of the viewport, beneath the site
  header.
- Renders for signed-in readers with an `IN_PROGRESS` project on
  this tutorial.
- Tracks scroll position of the body container; persists to
  `UserProject.readingProgressPercent` every 5 seconds.
- Hidden when no project, hidden in print.

### 4.3 Reader interactives

Existing components — no changes needed:

- `BookmarkButton` — bookmark toggle.
- `ProjectButton` — start / resume / complete / abandon.
- `StickyToc` — generated TOC.
- `ProjectCompanion` — right-rail sidebar.
- `ScrollDepthTracker` — analytics at 25 / 50 / 75 / 100 %.
- `ShareButton` — native share or popover.
- `BeginnerHelpFooter` — beginner-mode footer (see § 7).

### 4.4 Error states

| State | Behaviour |
|---|---|
| Tutorial doesn't exist | `notFound()` from Next.js → standard 404 page. |
| Tutorial isn't `PUBLISHED` | Same 404. No "this tutorial is in draft" leak. |
| Slug mismatch (correct id, wrong slug) | Redirect to the canonical path. |
| Hero media missing | Render placeholder sage gradient with title in display type. |
| Body parse error | Render the body as-is with a small editorial banner: "We're sorting an issue with this page." |
| `subTutorialCard` referencing a deleted tutorial | Render nothing (graceful no-op via the renderer's existing strip-and-snapshot logic). |

### 4.5 Empty states

| State | Behaviour |
|---|---|
| No reviews | "First to make this? Leave a review when you do." Hidden composer block visible to readers with a `COMPLETED` project. |
| No photos | "Made it? Add a photo." Same gating. |
| No Q&A | "Ask the first question." Composer visible to all signed-in readers. |
| No related recipes / techniques | Block hidden entirely. |
| No bookmarks (mini-list) | Block hidden entirely. |

## 5. Mobile-specific rules

Active below 1100 px viewport width. Tested at 390 px (iPhone 13),
744 px (iPad portrait), 1024 px (iPad landscape).

### 5.1 Layout

- Three-column grid collapses to single column.
- Sticky TOC becomes a "On this page" trigger pinned bottom-left
  that opens a bottom sheet.
- Project companion becomes a slide-up sheet triggered from a
  bottom-right floating pill.
- Reading progress bar stays.
- Hero image aspect goes 4:3 (≥ 1100 px) → 16:9 (900–1100 px) → 3:2
  (< 900 px).
- Title scales 64 px → 44 px.
- Standfirst scales 21 px → 18 px.

### 5.2 Info bar

- Wraps to two rows.
- Dietary chips drop into a single row at the bottom of the info
  bar; tap reveals all flags if there are more than five.
- "Freezable", "Batchable", "Make-ahead" remain visible as small
  badges with icons.

### 5.3 Ingredients on mobile

When a recipe is open and the reader scrolls past the ingredients
list into the method, the list itself doesn't follow. Instead:

- A condensed "Ingredients" trigger appears in the same bottom-left
  pill area as the TOC trigger.
- Tapping opens a bottom sheet with the structured ingredients at
  the current scale.
- The scale selector stays inside this sheet so the reader can
  re-scale without leaving the method.

This is preferable to a pinned-to-top sticky ingredients list (which
shrinks the reading area). **Open question 7 — is the bottom-sheet
pattern enough, or do we also want a "stick the current step's
ingredients to the top" micro-feature once the body is parsed for
step-level metadata?**

### 5.4 Companion (sheet mode)

- Triggered by a bottom-right floating pill labelled "Your project".
- Slide-up sheet with the same four tabs (Project / Supplies / Notes
  / Settings).
- Dismissible by tap-outside, swipe-down, or X button.
- State (selected tab) persists across sheet open / close.

### 5.5 Action bar on mobile

- Save and "I'm making this" stay primary.
- Scale, Share, Print collapse into a "··· more" trigger that opens
  a small dropdown.

## 6. Print-specific rules

A reader prints a recipe to keep it next to the stove. Print is a
first-class output, not an afterthought.

`@media print` rules live in
[apps/web/src/app/(public)/tutorial-print.css](apps/web/src/app/(public)/tutorial-print.css)
(new file in Phase 8 Step 3).

### 6.1 What disappears in print

- Site header (sticky nav, search, sign-in pill).
- Site footer.
- Reading progress bar.
- Sticky TOC (left rail).
- Project companion (right rail).
- Action bar (save / make / scale / share / print).
- Reviews block.
- Photos block.
- Q&A block.
- Errata link.
- Related recipes grid.
- Leftover bridge.
- Linked-from recipes panel (technique pages).
- Mood / dietary chips — keep dietary; drop mood.

### 6.2 What's kept

- Title, subtitle, hero image (single column, full width, monochrome
  if printer is black-and-white).
- Info bar — prep / cook / total / servings / difficulty / dietary
  flags / freezable badge. Cuisine and meal type are kept.
- Body in full (intro, ingredients, equipment, method, embedded
  blocks).
- Sources aside.
- Make-ahead / freezer / batch notes if present.

### 6.3 Print layout

- Single-column body, max-width determined by paper size (A4 default
  in the user's print dialog).
- Ingredients laid out in two columns side by side to avoid a single
  long list that orphans onto a second page.
- Equipment list moves under ingredients (same two-column treatment).
- Page break before the method section so ingredients + equipment
  ideally fit on page one of the printout.
- 12 pt body type. 16 pt H2. 24 pt title.
- Black ink only, no sage / cream backgrounds.
- Footer line on every page: "Homemade — homemade.education" + the
  recipe's canonical URL + the page number.
- Date of print: rendered at the foot of the first page as small
  italic text.

### 6.4 Scaling and print

The reader chooses scale before pressing Print. The print stylesheet
reads the current scale and renders the chosen amounts. No "print
at 1×" override — what's on screen is what prints.

### 6.5 Technique-page print

Same rules apply. Techniques have no ingredients, so the ingredients
column treatment is irrelevant; the method narrative takes the full
column width. Hand-drawn illustrations print at print resolution if
available; fall back to grayscale if not.

## 7. Beginner-mode surface

Triggered by `User.beginnerMode = true` (toggled in `/me/settings` or
in the companion's Settings pane). Re-renders the body server-side
so the surface is consistent.

### 7.1 What lights up

| Surface | Source | Effect |
|---|---|---|
| GlossaryTooltip | `glossary-tooltip.tsx:23` | Definition expands inline below the term instead of being a hover popover. |
| InfoPanel | `info-panel.tsx:33` | Label changes from "{tone}" to "for beginners — {tone}". Visual weight increases (heavier border + slightly larger label). |
| SuppliesCard | `supplies-card.tsx:43` | Substitutions render inline ("or rice flour", "or olive oil"). |
| ProjectCompanion supplies | `project-companion.tsx:104` | Same substitution rendering. |
| `ingredientsList` (new) | New block | Each row carries a `beginnerNote: string?` from the master Ingredient row; renders below the amount when set ("'plain flour' in the UK, 'all-purpose flour' in the US"). |
| BeginnerHelpFooter | `beginner-help-footer.tsx` | Renders at the foot of the body. Lists every glossary term used in the tutorial with full definition; links to "easier {category}" filtered by difficulty=BEGINNER. |
| Reading size | New | Default reading size for beginner mode is "large" (CSS variable `--reader-size: 1.1`). Reader can override in the companion settings pane. |

### 7.2 What stays unchanged

- The body order, the method numbering, the sections themselves —
  beginner mode adds context, doesn't reorder content.
- Custom block content is identical; only the chrome (labels,
  weight, expansion) shifts.
- The TOC, companion sidebar, and footer blocks are the same.

### 7.3 Triggering beginner mode

- `/me/settings` toggle (existing).
- Project companion → Settings pane toggle (new from this spec).
- First-time signup default: off. The "Welcome" email post-Phase 8b
  may surface the toggle for users who flagged themselves as
  beginners.

## 8. Search and filter dimensions

Every field the public `/search` page (and the home / category
pages) filters on. The Typesense `tutorial` collection schema in
[packages/search/src/schemas.ts](packages/search/src/schemas.ts) is
the source of truth — this section is the design target.

### 8.1 Free-text search

| Field | Weight | Notes |
|---|---|---|
| `title` | High | Exact-match boosted. |
| `subtitle` | Medium | |
| `excerpt` | Medium | |
| `bodyText` | Low | Extracted plain text from TipTap JSON, includes block titles / bodies. |
| `tagSlugs` | Low | Exact tag matches lift relevance. |
| `ingredientNames` (new) | Medium | Joined `RecipeIngredient → Ingredient.name` strings, indexed once Step 4 ships. Lets "aubergine" find every recipe using one. |
| `cuisine` | Medium | Exact match. |
| `mealType` | Medium | Exact match. |

### 8.2 Faceted filters

Filterable, multi-select where it makes sense:

| Facet | Type | Multi-select? | Page surfaces |
|---|---|---|---|
| Type (RECIPE / TECHNIQUE) | enum | No | `/search`, `/cooking` |
| Category | slug | No | `/search`, every category index |
| SubCategory | slug | No | `/search`, category page |
| Cuisine | enum | Yes | `/search`, future `/cuisines/{slug}` |
| Meal type | enum | Yes | `/search` |
| Mood | enum[] | Yes | `/search`, future `/moods/{slug}` |
| Dietary flag | enum[] | Yes (AND across) | `/search` |
| Difficulty | enum | Yes | `/search` |
| Season | enum | Yes | `/search` |
| Freezable | bool | No | `/search` |
| Batchable | bool | No | `/search` |
| Make-ahead | bool | No | `/search` |
| Scalable | bool | No | `/search` — rarely surfaced; useful when someone explicitly wants a scalable recipe. |
| Total time | int (range) | Range | `/search` — "under 30 min", "30–60 min", "over 60 min". |
| Tag | slug[] | Yes | Tags surface on /search after they're explicitly added; not in the default filter strip. |
| Ingredient | slug[] | Yes (AND) | "Cupboard mode" search — future page `/use-what-i-have`. |

### 8.3 Sort options

| Sort | Default? | Use case |
|---|---|---|
| Newest | Yes for `/search` and home recent grid | Default. |
| Oldest | No | Editorial pages. |
| Most cooked (project count) | No | Future, once enough projects exist. |
| Highest rated (`Review.rating` average) | No | Future. |
| Quickest | No | "Total time ascending" — useful for weeknight filtering. |

## 9. Gap analysis

Every component listed above, scored against the current code.

**Legend.** ✅ shipped today. 🟡 partially shipped — gap identified.
❌ not in code yet.

### 9.1 Recipe page

| Component | Status | Notes |
|---|---|---|
| Breadcrumb | ✅ | [tutorial-chrome.tsx:120](apps/web/src/components/public/tutorial-chrome.tsx) |
| Eyebrow ("A recipe" / "A technique") | ❌ | Not in the current header. Add to `TutorialChrome` based on `Tutorial.type`. |
| Title + subtitle | ✅ | [tutorial-chrome.tsx:130](apps/web/src/components/public/tutorial-chrome.tsx) |
| Hero image (food photography) | ✅ | Schema field present; visual style enforced at authoring time, not in code. |
| Author byline | ✅ | [tutorial-chrome.tsx:195](apps/web/src/components/public/tutorial-chrome.tsx) — Homemade / creator |
| Social proof strip (counts) | ❌ | Reference HTML shows this; not in current code. Defer until we have project / review counts to back it up. |
| Info bar — difficulty | ✅ | [tutorial-chrome.tsx:156](apps/web/src/components/public/tutorial-chrome.tsx) |
| Info bar — `timeMinutes` (single field) | 🟡 | Single field today. Need separate `prepMinutes` + `cookMinutes` + `totalMinutes` — Phase 8 Step 2. |
| Info bar — servings | ❌ | Field missing on `Tutorial`. Phase 8 Step 2. |
| Info bar — season | ✅ | Renders today; surfaces meaningfully on gardening, not so much on cooking. Keep it. |
| Info bar — cuisine | ❌ | Field missing. Phase 8 Step 2. |
| Info bar — meal type | ❌ | Field missing. Phase 8 Step 2. |
| Info bar — dietary flags | ❌ | Field missing; auto-derive from ingredients later. |
| Info bar — freezable / batchable / make-ahead badges | ❌ | All three fields missing. Phase 8 Step 2. |
| Info bar — published date | ✅ | [tutorial-chrome.tsx:185](apps/web/src/components/public/tutorial-chrome.tsx) |
| Action — Save (bookmark) | ✅ | [bookmark-button.tsx:11](apps/web/src/components/public/tutorial-reader/bookmark-button.tsx) |
| Action — I'm making this | ✅ | [project-button.tsx:26](apps/web/src/components/public/tutorial-reader/project-button.tsx) |
| Action — Scale | ❌ | No scale UI. Phase 8 Step 3. |
| Action — Share | ✅ | [share-button.tsx:43](apps/web/src/components/public/tutorial-reader/share-button.tsx) |
| Action — Print | ❌ | No print button; no print stylesheet. Add both. |
| Body — excerpt / intro paragraph | ✅ | First paragraph of TipTap body, with `Tutorial.excerpt` as the standfirst above. |
| Body — structured ingredients block | ❌ | Block type doesn't exist. Phase 8 Step 3. |
| Body — equipment list block | ❌ | Block type doesn't exist. Phase 8 Step 3 or shortly after. |
| Body — method narrative | ✅ | [tutorial-content.tsx](apps/web/src/components/public/tutorial-content/tutorial-content.tsx) |
| Body — scaling tokens (`{{flour}}`) | ❌ | Renderer doesn't substitute. Phase 8 Step 8 dependency. |
| Body — make-ahead / freezer / batch notes blocks | ❌ | Fields + auto-rendering blocks not present. |
| Body — 8 custom blocks | ✅ | [tutorial-content/blocks/](apps/web/src/components/public/tutorial-content/blocks/) — all eight render. |
| Sidebar — sticky TOC | ✅ | [sticky-toc.tsx:16](apps/web/src/components/public/tutorial-reader/sticky-toc.tsx) |
| Sidebar — project companion | 🟡 | [project-companion.tsx:26](apps/web/src/components/public/tutorial-reader/project-companion.tsx) — has supplies / notes / status. Missing the Settings tab (beginner-mode toggle, reading size). |
| Sidebar — saved recipes mini-list | ❌ | Not rendered today. Cheap addition. |
| Footer — sources | ✅ | [tutorial-chrome.tsx:200](apps/web/src/components/public/tutorial-chrome.tsx) |
| Footer — reviews | ✅ | [reviews-block.tsx:34](apps/web/src/components/public/ugc/reviews-block.tsx) |
| Footer — photos (UGC) | ✅ | [photos-block.tsx:81](apps/web/src/components/public/ugc/photos-block.tsx) — uploads gated off in prod pending legal pages. |
| Footer — Q&A | ✅ | [qa-block.tsx:37](apps/web/src/components/public/ugc/qa-block.tsx) |
| Footer — errata link | ✅ | [errata-link.tsx:6](apps/web/src/components/public/ugc/errata-link.tsx) |
| Footer — related recipes | ❌ | Not rendered today. Build once cuisine + ingredient overlap fields are seeded. |
| Footer — leftover bridge | ❌ | Field doesn't exist. Deferred per **Open question 3**. |

### 9.2 Technique page

| Component | Status | Notes |
|---|---|---|
| Same chrome as recipe | ✅ | Single `TutorialChrome`. |
| Hero — botanical illustration style | 🟡 | Enforced at authoring prompt, not in schema. **Open question 4.** |
| Info bar — reduced field set | ❌ | Same info bar renders today regardless of type. Need a `type`-aware variant. |
| `type` discriminator on Tutorial | ❌ | Field doesn't exist. Phase 8 Step 2. |
| `foundational` flag | ❌ | Field doesn't exist. **Open question 5.** |
| Action — I'm learning this (project) | ✅ | `ProjectButton` works on both page types today; the label change is a copy tweak. |
| No scaling on technique | ✅ | Scale button doesn't exist anywhere today; lands gated by type when it does. |
| Body — no ingredients block | ✅ | Trivially — the block doesn't exist yet. |
| Body — SuppliesCard for kit | ✅ | Existing block works. |
| Body — 8 custom blocks | ✅ | Same renderer. |
| Linked-from recipes panel | ❌ | New dynamic block. Phase 8 Step 3 or 4 dependency once `subTutorialCard` references can be queried by target. |
| Companion — supplies pane hidden | 🟡 | Current companion always renders supplies; type-aware hide needed. |
| Related techniques | ❌ | Same status as related recipes — not rendered. |

### 9.3 Shared

| Component | Status | Notes |
|---|---|---|
| Site header | ✅ | [(public)/header.tsx](apps/web/src/app/(public)/header.tsx) |
| Reading progress bar | ✅ | [reading-progress.tsx:20](apps/web/src/components/public/tutorial-reader/reading-progress.tsx) |
| Scroll-depth tracker | ✅ | [scroll-depth-tracker.tsx:16](apps/web/src/components/public/tutorial-reader/scroll-depth-tracker.tsx) |
| Beginner help footer | ✅ | [beginner-help-footer.tsx:16](apps/web/src/components/public/tutorial-reader/beginner-help-footer.tsx) |
| Error states (404 / mismatched slug) | ✅ | [page.tsx](apps/web/src/app/(public)/[categorySlug]/[tutorialSlug]/page.tsx) — `notFound()` flow. |
| Empty states (no reviews / photos / Q&A) | ✅ | UGC blocks each render empty composer. |

### 9.4 Mobile

| Rule | Status | Notes |
|---|---|---|
| Hero aspect responsive | 🟡 | Hero collapses at 900px; need a 1100px intermediate aspect. |
| Title scale | ✅ | 64 → 44 at 900px. |
| Info bar wrap | ✅ | Flex wrap. |
| Dietary chips row on mobile | ❌ | Chips don't exist yet (field missing). Build with the field. |
| TOC bottom-sheet trigger | ❌ | Currently TOC is `<details>` inline on mobile; need a floating trigger + sheet. |
| Companion as bottom sheet | ❌ | Companion hides under 1100px today. Reference HTML calls for a floating pill + slide-up sheet — not yet built. |
| Ingredients sheet trigger | ❌ | Bottom-left ingredients pill not yet built. New for Phase 8. |
| Action bar overflow menu | ❌ | Current action buttons stay inline. With 5 actions, build a "··· more" trigger under 600px width. |

### 9.5 Print

| Rule | Status | Notes |
|---|---|---|
| Any `@media print` rules | ❌ | None in the codebase. |
| Print button | ❌ | Not present in the action bar. |
| Two-column ingredients in print | ❌ | New stylesheet. |
| Page break before method | ❌ | New stylesheet. |
| Print footer line | ❌ | New stylesheet. |
| Print at chosen scale | ❌ | Requires scale state to be readable from CSS or a print-prep handler. |

### 9.6 Beginner mode

| Surface | Status | Notes |
|---|---|---|
| GlossaryTooltip inline expansion | ✅ | [glossary-tooltip.tsx:23](apps/web/src/components/public/tutorial-content/blocks/glossary-tooltip.tsx) |
| InfoPanel beginner labelling | ✅ | [info-panel.tsx:33](apps/web/src/components/public/tutorial-content/blocks/info-panel.tsx) |
| SuppliesCard substitutions | ✅ | [supplies-card.tsx:43](apps/web/src/components/public/tutorial-content/blocks/supplies-card.tsx) |
| ProjectCompanion substitutions | ✅ | [project-companion.tsx:104](apps/web/src/components/public/tutorial-reader/project-companion.tsx) |
| BeginnerHelpFooter | ✅ | [beginner-help-footer.tsx:16](apps/web/src/components/public/tutorial-reader/beginner-help-footer.tsx) |
| `ingredientsList` beginner notes | ❌ | Block doesn't exist; `beginnerNote` field on master `Ingredient` not yet designed (Phase 8 Step 4). |
| Reading size variable | ❌ | No CSS variable plumbing yet. |
| Companion Settings pane | ❌ | Companion has Project + Supplies + Notes but no Settings. |

### 9.7 Search and filters

| Dimension | Status | Notes |
|---|---|---|
| Free-text on title / subtitle / excerpt / body | ✅ | [packages/search/src/schemas.ts](packages/search/src/schemas.ts) |
| Filter — Category / SubCategory | ✅ | Schema facetable. |
| Filter — Difficulty | ✅ | Schema facetable. |
| Filter — Season | ✅ | Schema facetable. |
| Filter — Tag | ✅ | Schema facetable. |
| Filter — Type (RECIPE / TECHNIQUE) | ❌ | Field doesn't exist on Tutorial. |
| Filter — Cuisine | ❌ | Field doesn't exist. |
| Filter — Meal type | ❌ | Field doesn't exist. |
| Filter — Mood | ❌ | Field doesn't exist. |
| Filter — Dietary | ❌ | Field doesn't exist. |
| Filter — Freezable / Batchable / Make-ahead | ❌ | Fields don't exist. |
| Filter — Total time range | ❌ | Single `timeMinutes` exists; range query needs the field. |
| Filter — Ingredient (cupboard mode) | ❌ | Master ingredient table doesn't exist. |
| Sort — Most cooked | ❌ | Needs project count denormalisation. |
| Sort — Highest rated | ❌ | Needs review average denormalisation. |

## 10. Locked decisions

Decisions made in the page-design review session on 2026-05-13.

1. **Social proof strip.** Show only when ≥ 5 completed projects
   exist. Hide entirely below that threshold. No "first to make
   this" placeholder copy.
2. **Mood in the info bar.** Do not show. Moods stay as a search
   filter (the user browses "comfort food" or "weeknight"), but
   they're never surfaced on the recipe page header. Spec § 2.2
   and § 8.2 already match this.
3. **Leftover bridge field.** `Tutorial.leftoverTutorialId: String?`
   added in the schema migration alongside every other recipe
   metadata field. Rebecca's standing preference: all fields added
   up-front; no follow-up migrations to backfill metadata.
4. **Hero style discriminator.** No `heroStyle` schema field. The
   recipe-vs-technique split (food photography vs hand-drawn
   illustration) is enforced by the AI authoring prompt when image
   generation runs pre-launch; `Tutorial.type` plus the prompt are
   enough.
5. **Foundational flag.** Add `Tutorial.foundational: Boolean`
   (default false). Used for the "Foundational technique" info-bar
   badge on the ~500–700 core techniques (knife skills, mother
   sauces, foundation breads). Lets a future `/foundations`
   editorial page exist without further schema work.
6. **Linked-from recipes panel query.** Request-time JSONB scan
   against `Tutorial.body` for `subTutorialCard` references, backed
   by a covering GIN index. Revisit if measured latency forces a
   pre-computed index.
7. **Mobile ingredients pattern.** Bottom-sheet trigger pinned to
   the corner. Step-level pinned ingredients is a later iteration
   once the body parses into discrete steps with metadata.
