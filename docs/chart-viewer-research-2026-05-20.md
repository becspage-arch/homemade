# Chart-viewer research — 2026-05-20

Research-only synthesis to inform a future build session that designs
Homemade's interactive chart-viewer component. No code in scope. Covers
cross-stitch + counted-thread embroidery primarily; carries implications
for the existing knitting / crochet / weaving / origami / calligraphy /
macramé renderers.

The static SVG chart that ships today (`crossStitchChart` node →
[cross-stitch.ts](apps/web/src/lib/chart-renderers/cross-stitch.ts)) reads
on desktop and falls flat on mobile. Modern needlework users expect a
chart-tracker UX: pinch-zoom, pan, mark-stitched, symbol-only / colour
toggles, colour-isolate, print-tile, sync. This doc maps the market and
recommends which of those features Homemade should build, in what order,
across which renderers.

---

## Executive summary

The chart-tracker market splits into three tiers — mobile-first readers
(Pattern Keeper, MarkUp Rx-P, knitCompanion, Cross Stitch Saga), web/
desktop designers (PCStitch, Inkstitch, Pic2Pat), and pro digitising
suites (Hatch, Bernina, Wilcom). The readers converge on a tight feature
set: free pinch-zoom + one-finger pan, tap-to-mark-stitch, drag to mark
runs, tap-symbol-in-legend to highlight every instance, per-colour
remaining-stitch count, dark mode, customisable grid. The differentiators
that drive paid conversion are: multi-page PDF stitched into one
continuous chart, photo-of-paper-chart auto-digitisation, persistent
historical stats, cross-device sync, "magic-markers" symbol search, and a
greyed-out-non-current-row "rule mode" borrowed from knitting.

Ravelry — the elephant in the knitting space — explicitly punts on chart
rendering: it stores PDFs and lets third-party apps wrap them. **That is
the market gap.** Homemade owns the chart definition end-to-end (JSON,
not PDF), so it can render structurally — vectors that zoom cleanly, cells
that respond to tap, layers that toggle — without any of the PDF
heuristics that Pattern Keeper and friends are wrestling with. Homemade
ships the cleanest chart-reader on the market simply by building from JSON
instead of pixels.

The recommended shape: a single shared client viewer component that wraps
each per-craft SVG renderer with a common interaction layer (zoom, pan,
fullscreen, print, toggles, progress marking). Free tier gets the
interaction-layer essentials; premium gates the progress-tracking,
cross-device sync, print-tile-to-PDF, and alternative-palette preview.

---

## Per-app feature table

Pricing in GBP/USD where given. "—" means the app doesn't ship that
feature.

| App | Platform | Pricing | Zoom / pan | Mark-stitch | Symbol highlight | Multi-page PDF stitch | Dark mode | Sync | Print | Format support | Standout |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Pattern Keeper** | Android only | $9 one-time | Pinch + double-tap-drag; free zoom | Tap / drag, any direction; whole-10×10 gesture; fills with actual thread colour | Tap legend symbol → translucent highlight all instances | Yes — stitches multi-page PDFs into one chart | — | Manual export/import zip | — | PDF from "supported" designers only | Single best mark-stitch UX; chart visibly turns into the finished piece |
| **MarkUp Rx-P** | iOS + Android | £14.99/yr or $9.99 one-time (in flux) | Pinch + linked single-page mode | Tap / drag; outline-vs-full-cell toggle; erase mode | Symbol search across remaining unmarked | Yes; also accepts photo of paper chart with auto-grid detect | — | Cross-platform account, manual sync | — | PDF + photo of paper; built-in DMC/Anchor/Madeira shade cards | Photo-of-paper-chart import; backstitch + French-knot rendering in native chart |
| **Cross Stitch Saga** | iOS + Android (+ macOS, ChromeOS) | ~$15 | Pinch, vector quality at any scale | Tap / drag; layer toggles per stitch type | Highlight one colour, isolate elements | — | Yes — explicit dark scheme | Dropbox / cloud sync (buggy) | — | XSD, XSP, PAT, OXS, DIZE, CSS, SAGA — but **no PDF, no raster** | Built-in fabric/floss/bead calculator; layer toggles per stitch type |
| **StitchPal** | iOS, Android, MS Store, Amazon | Free + pro tier | n/a — not a chart reader | n/a (photo-journal only) | — | — | Yes | — | — | Photo timeline of progress | Daily photo journal for Instagrammers |
| **Pic2Pat** | Web | Free | n/a (generator) | — | — | — | — | — | PDF output with chart + key | Upload image up to 18 MB | Multi-variant output (10 / 20 / 30 colours side-by-side); skein-count calculation |
| **PCStitch** | Windows | $49.95 one-time | Mouse zoom | Click-to-mark (designer view) | Yes | Native | — | — | **Best-in-class A4 page-tile with cut marks + auto-legend** | .PAT (lock-in); imports photo via Import Wizard | Print-tiling with cut marks; 60+ specialty stitches |
| **Inkstitch** | Linux / Win / Mac (Inkscape extension) | Free, GPL | Inkscape-native | — (digitiser) | — | — | — | — | Yes; operator-vs-client layouts | Many machine-embroidery formats | Animated stitch-out preview; free + cross-platform; operator/client print split |
| **Bernina V9 / Hatch / Wilcom** | Windows desktop | $700–$2100 one-time, or subscription | Pro UI | — (digitiser) | — | — | — | — | Pro print options | All major embroidery formats | Auto-digitise + refine; 3D stitch simulator; CorelDRAW bundled (Wilcom) |
| **knitCompanion** | iOS + Android | Freemium; £0.99/mo or £9.99/yr paid tier | Pinch + pan; survives zoom | Tap to mark row; advance row counter | **Magic Markers** — tap a symbol, light every match | Yes; composite-page from arbitrary pages | Yes; white-point reduction | **iCloud, offline-first** | — | Any PDF including scanned; auto-grid recognition | Inverted "rule mode" (greys non-current row); voice "next"; Bluetooth pedal / Apple Watch advance |
| **My Row Counter** | iOS + Android | Freemium | n/a (PDF + overlay) | Row counter linked to highlight bars | — | — | Yes (follows system) | Apple Watch, Fitbit, Dynamic Island | — | PDF import / crop / recompose | Wrist-haptic row advance via Fitbit |
| **JKnit Pro** | iOS / iPad | Tiered paid | Pinch | Row highlight overlay | — | — | — | Wireless from web portal | — | PDF | Web-portal setup with real keyboard, push to device |
| **PatternGenius** | iOS / iPad / Mac | Free up to 25×25; £24.99/yr | — (authoring) | — | — | — | — | iCloud, Dropbox, Files | PDF export (vector) | Vector symbol set | Author→reader pipeline with knitCompanion (same company) |
| **Stitchminder / Knit Buddy / Crochet Genius** | iOS + Android | Free / one-off | Light | Row counters, linked sub-counters | — | — | varies | varies | — | PDF storage + reference data | Tell-me-which-pattern-row-I'm-on for complex lace |
| **Ravelry** | Web | Free | n/a — PDF host | n/a | n/a | n/a | n/a | Library, queue, project tracker | n/a | PDF download only | **Not a chart viewer.** Catalogue + community + commerce. Punts chart UX entirely to third-party apps |
| **Etsy (marketplace)** | Web + app | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | PDF dominant; some bundle .xsd | Constant complaints: mobile-app can't download files; rasterised PDFs blur on zoom; symbols too similar on phone screen |

Sources: [Pattern Keeper FAQ](https://patternkeeper.app/faq/), [Pattern Keeper navigation](https://patternkeeper.app/help/navigating-around-your-chart/), [MarkUp Rx-P](https://markuprxp.co.uk/), [Atom Heart comparison](https://www.atomheartcrossstitch.com/post/pattern-keeper-vs-markup-rx-p), [Lord Libidan 23 best apps](https://lordlibidan.com/the-best-apps-for-cross-stitchers/), [knitCompanion FAQs](https://www.knitcompanion.com/ufaqs/), [knitCompanion Magic Markers PDF](https://www.knitcompanion.com/wp-content/uploads/2025/07/Magic-Markers.pdf), [My Row Counter](https://rowcounterapp.com/), [Stitchmate "what makes a good PDF"](https://stitchmate.app/guides/cross-stitch-pattern-pdf-quality), [Ravelry apps directory](https://www.ravelry.com/about/apps), [DMC read-a-chart guide](https://www.dmc.com/US/en/technique-cross-stitch-read-chart), [Inkstitch features](https://inkstitch.org/features/), [Hatch features](https://hatchembroidery.com/products/hatch-embroidery/features), [PCStitch](https://www.pcstitch.com/).

---

## Feature priority list for Homemade

### Free tier — table stakes (must-have at launch of the new viewer)

1. **Free pinch-zoom + one-finger pan** with full-bleed mobile rendering. Initial render is "fit-to-screen overview"; user pinches in. No fixed zoom presets, no minimap (the market doesn't use one and users don't ask for it).
2. **Tap a legend swatch → highlight every cell of that colour** on the chart with a translucent overlay. Symbol stays readable underneath. Universal across leaders.
3. **Symbol-on-colour view as default, with a toggle for colour-only and symbol-only.** Three-state toggle. Symbol-only saves ink for the print-then-stitch user; colour-only is what users want on a tablet they prop up beside them.
4. **Dark mode.** Inherits the site palette. Pattern Keeper's biggest single complaint is the lack of one.
5. **Fullscreen / "expand chart" mode** that takes over the viewport, lockable to landscape orientation on mobile. Hide site chrome.
6. **Persistent grid lines + 10×10 emphasis lines + centre lines.** Customisable colour and weight. Universal.
7. **Accessible legend.** Renders below or beside the chart, sticky on scroll on desktop. Colour swatch + symbol + plain-English name + DMC / Anchor codes (already in the chart-definition schema).

### Premium tier — the conversion drivers

1. **Mark-stitch.** Tap a cell to mark/unmark; drag in any direction to mark a run; the marked cell fills with the assigned thread colour rather than the symbol. Per-colour remaining-stitch tally in the legend updates live. Position persists per-user-per-chart via account.
2. **"Stitched view" / "remaining view" toggle.** Stitched view shows only completed cells (your in-progress photo, basically); remaining view greys completed cells and emphasises what's left. Both are valuable for different mental modes.
3. **Cross-device progress sync.** Same account, mark on phone, open on laptop, continue. **This is the gold-standard premium feature** across knitCompanion, MarkUp Rx-P, and Cross Stitch Saga. Sync the existing-account mark-stitch state — no separate file format.
4. **Print to PDF — page-tiled.** A4 (UK) and US Letter, portrait, 100% actual size, with overlap stitches between pages and cut-marks at trim edges, separate page for the colour key. Three density presets: large ~40×40 stitches per page, medium ~60×70, small ~80×90 — matches the convention. PCStitch is the reference implementation.
5. **Alternative palette preview ("colour-swap").** Apply a different palette to the existing cells — switch from DMC 522 / 924 / 3045 to Anchor equivalents, or to a completely different colour scheme — and re-render in place. Premium because the underlying palette-mapping is the chart-author's work; the reader is just remixing.
6. **Magic-markers symbol search.** Tap any cell to find every cell of the same colour, with a running count. Borrowed from knitCompanion. Different from "tap legend → highlight" in that it works from the chart, not the legend, and it's a stateful focus, not a transient highlight.
7. **Per-chart notes / annotations.** Sticky notes anchored to a cell, scribble layer over the chart. Knitters use this constantly; cross-stitchers less so but the pattern transfers cleanly to a single Comment layer.

### Future / nice-to-have (not in v1 of the new viewer)

1. **Chart-from-image generator** (Homemade's own Pic2Pat). Authoring-side, not viewing-side. Probably belongs in the admin / community-pattern pipeline once that ships.
2. **Voice control** — "next stitch" / "next row" hands-free advance. Knitting-leaning; needlework users have free hands.
3. **Bluetooth pedal support** — keystroke-based advance via AirTurn-style hardware. Knitting-leaning.
4. **Apple Watch / Fitbit haptic** — wrist-tap progress. Niche but a clear premium-of-premium hook for heavy users.
5. **Animated stitch-out preview** — Inkstitch / Hatch's "watch your design embroider before you embroider it." More relevant if Homemade adds an embroidery-machine export path.
6. **Pattern marketplace / queue / library** — Ravelry-style social layer. Out of scope until Maker / community lands.
7. **Stitched-out time estimation** based on user's historical stitch rate. MarkUp Rx-P does this; knitCompanion doesn't. Pleasant retention feature, low priority for v1.

---

## Per-craft mapping

Renderers live under [apps/web/src/lib/chart-renderers/](apps/web/src/lib/chart-renderers/) and the shared knit/crochet/needlework one at [apps/web/src/lib/craft-charts/](apps/web/src/lib/craft-charts/). The public wire-up is in [tutorial-content.tsx:270-353](apps/web/src/components/public/tutorial-content/tutorial-content.tsx:270).

Universal features (zoom, pan, fullscreen, dark mode, print-to-PDF,
legend display) apply to all six renderers. Chart-followed-project
features (mark-stitched, stitched-vs-remaining, magic-markers, cross-device
sync, palette swap) apply only to the renderers below where the user
follows the chart cell-by-cell as a project. Single-reference renderers
(calligraphy exemplar, macramé knot, origami folds) get a lighter
treatment: zoom, fullscreen, print, but no progress tracking.

| Renderer | Node | Renderer file | Zoom / pan | Mark-progress | Stitched / remaining toggle | Palette-swap | Magic-markers | Print-tile | Notes |
|---|---|---|---|---|---|---|---|---|---|
| **Cross-stitch** | `crossStitchChart` | [cross-stitch.ts](apps/web/src/lib/chart-renderers/cross-stitch.ts) | **Yes** | **Per-cell** | **Yes** | **Yes — DMC ↔ Anchor cross-reference is already in the palette schema** | **Yes** | **Yes — A4 tile with cut marks** | The canonical case. Drives the whole design. Schema already carries DMC/Anchor codes + symbol per palette entry. |
| **Knitting** | `craftChart` (flat / round) | [craft-charts/svg-chart.tsx](apps/web/src/lib/craft-charts/svg-chart.tsx) | **Yes** | **Per-row** (not per-cell — knitting works in rows) | **Stitched-rows-greyed-out / current-row-highlighted is the equivalent**; borrow knitCompanion's "rule mode" | **Yes — yarn-swap preview** | Yes — tap a stitch glyph to find every match | Yes | Round charts render as flat rectangle today; that matches the market convention (no app renders true pie-slice). Add an explicit "read right-to-left every row, in the round" header note. |
| **Crochet** | `craftChart` (flat / round) | [craft-charts/svg-chart.tsx](apps/web/src/lib/craft-charts/svg-chart.tsx) | **Yes** | **Per-row** | Same as knitting | **Yes** | Yes | Yes | Crochet charts are usually radial (granny / hexagon) — investigate native pie-slice rendering as a v2 enhancement; nobody else does it well. |
| **Weaving** | `weavingDraft` | weaving-draft.tsx | **Yes** | **Optional — per-pick / per-treadle** for the treadling column; threading rarely tracked | Drawdown-stitched / drawdown-remaining is a stretch; treadling-current-row is the useful axis | Yarn-swap preview useful for warp + weft colour planning | **Yes — tap a shaft / treadle to highlight the row** | Yes; landscape orientation; tie-up + threading on the legend page | The four-quadrant draft is dense; pan + zoom + isolate-quadrant becomes critical on mobile. |
| **Calligraphy exemplar** | `calligraphyExemplar` | calligraphy-exemplar.tsx | **Yes** | **No** — single-glyph reference | n/a | n/a | n/a | **Yes — print the glyph at exact nib-width scale** so the user can hold paper up to the screen | Different UX shape entirely. Add: nib-angle chip stays visible at every zoom; ductus number annotations stay legible. Zoom is the only interaction. |
| **Origami fold diagram** | `origamiFoldDiagram` | origami-fold-basic.tsx | **Yes** | **Per-step** (mark step done as you complete it) | Equivalent to "stitched view": completed steps faded; current step highlighted | n/a | n/a | Yes — print each step on its own page | The animated-step concept is the deferred advanced renderer; v1 is static per-step. Mark-step + step-current highlight is the natural extension. |
| **Macramé knot** | `macrameKnot` | macrame-knot.tsx | **Yes** | **No** — single-knot reference (same pattern as calligraphy exemplar) | n/a | n/a | n/a | Yes | Treat like calligraphy: zoom + print only. The knot diagram is a reference, not a project. |

**Shared client component design implication:** the chart-viewer should be
a single React client component that wraps the existing per-craft SVG /
HTML renderer in a common interaction layer. The renderer keeps producing
the same output it produces today; the wrapper handles zoom transforms,
pan gestures, fullscreen state, toggle UI, mark-stitched overlay, print
preparation, and account-state sync. The seven renderers should not each
implement their own viewer — that way lies inconsistency.

---

## Recommendations on the 5 UX questions

### 1. Zoom — chart is 88×28 cells on desktop, unreadable on mobile

**Recommendation: free pinch-zoom + one-finger pan, no presets, no
mini-map. Initial render is fit-to-screen overview. Add a "Fullscreen"
button on mobile that locks landscape orientation and hides chrome.**

This matches Pattern Keeper / MarkUp Rx-P / Cross Stitch Saga / knit
Companion — every leader uses the same convention. Fixed zoom presets,
viewport indicators, and minimaps have all been tried and dropped. The
mental model is "free zoom like a map app." On desktop add scroll-to-zoom
+ shift-drag pan; mouse users expect that.

**Tablet-specific:** ship a "two-up" mode where the chart and the legend
sit side-by-side in landscape — knitCompanion's linked-views pattern. On
mobile portrait, legend collapses to a bottom sheet.

### 2. Tap-cell behaviour

**Recommendation: cell tap is a no-op by default in the free viewer.
Behind premium, cell tap marks/unmarks; drag marks a run; long-press
opens a context menu with "find all of this colour" (magic markers) and
"add note here."**

The market convention is exactly this: a single tap marks (it's never
"open legend popover" — the legend lives in a panel). Don't overload tap
with multiple behaviours; that breaks the muscle memory users bring from
Pattern Keeper.

Free-tier users get pinch + pan only; the chart is read-only. That keeps
the free experience clean (no "you'd need premium for that" friction
mid-tap) and makes the premium upgrade actually mean something.

### 3. Print — page-tiling for large charts

**Recommendation: ship A4 (UK) and US Letter, portrait, 100% actual size,
with overlap stitches and cut marks. Three density presets: ~40×40,
~60×70, ~80×90 stitches per page. Colour key on its own final page. Both
symbol-only and symbol-on-colour print modes (symbol-only for ink-savers).
Premium feature.**

This is the PCStitch convention and the universal expectation. The
mobile chart-trackers don't print at all — that's a clear gap Homemade
can fill cheaply because it owns the chart JSON and can render
print-quality SVG / PDF without dealing with raster PDFs. Server-side
render to PDF, deliver as download.

For non-cross-stitch crafts: weaving drafts print landscape on a single
page; knitting / crochet charts usually print as one larger page (A3 or
copy-shop) rather than tiled — but Homemade should still offer tiled
print as an option because it's the more accessible default. Calligraphy
exemplars print at exact nib-width scale (already covered in the
per-craft mapping).

### 4. Symbol-only vs colour-only — standard toggle?

**Recommendation: yes, three-state toggle (symbol-only / colour-only /
symbol-on-colour), default to symbol-on-colour on screen, default to
symbol-only on print. Available in free tier — it's a view toggle, not a
project-management feature, and gating it would feel mean.**

Standard but unevenly implemented across the market. Cross Stitch Saga
has the cleanest version (layer toggles); MarkUp Rx-P has display modes;
Pattern Keeper only has highlight transparency. Homemade can do this
cleanly because the chart JSON carries both the symbol and the palette
hex — flipping which one fills the cell is one render decision.

### 5. Tracking progress — per-cell, per-row, or both?

**Recommendation: per-cell is the cross-stitch primitive (universal in
the market). Per-row is the knitting / crochet primitive. The renderer
type determines the granularity:**

- **Cross-stitch (`crossStitchChart`):** per-cell mark, with the
  per-colour remaining-stitch tally in the legend. No row tracking — the
  market doesn't do it for cross-stitch and users don't ask for it.
- **Knitting / crochet (`craftChart`):** per-row mark with a "current
  row" highlight (knitCompanion's rule mode — current row prominent,
  completed rows greyed). Borrow the inverted-marker pattern.
- **Weaving (`weavingDraft`):** per-pick mark for the treadling column
  only; threading is normally a one-time setup not tracked.
- **Origami (`origamiFoldDiagram`):** per-step.
- **Calligraphy + macramé:** no progress tracking — single-reference.

All progress tracking is premium. Per-cell auto-advance and active-region
following is an unmet user need (no one does it well); investigate as a
v1.5 enhancement once the basic mark-stitch ships.

---

## Open questions for Rebecca to decide before any build session fires

1. **Free vs premium boundary — confirm the split above.** The
   recommendation gates progress tracking, sync, print-tile, palette
   swap, magic-markers, and notes behind premium; keeps pinch/pan,
   symbol toggle, dark mode, legend, fullscreen in free. Build-every-
   feature-to-free-standard says "build it all"; the
   business-model memo says cross-stitch is a chart-followed-project
   craft so progress tracking is the obvious paywall. Confirm the line
   before the build session writes any gate logic.

2. **One shared viewer component, or per-craft viewers?** Recommendation
   is one shared wrapper around the existing per-craft renderers. The
   alternative — each craft owning its own viewer — risks divergence but
   lets the calligraphy / macramé "reference" crafts skip the marking UI
   entirely. The shared-wrapper approach handles that with a
   `mode: 'project' | 'reference'` prop. Confirm direction.

3. **Server-rendered vs client-rendered chart?** Today the cross-stitch
   chart is server-rendered SVG via `dangerouslySetInnerHTML`. The new
   interactive viewer almost certainly needs client React for zoom state,
   marking, toggle. Decision: keep the SVG server-rendered and wrap it
   in a client component that adds the interaction layer (the SVG is
   inert HTML the wrapper transforms), OR move all chart rendering
   client-side. Recommendation is the wrap-the-server-SVG approach —
   keeps initial-paint fast, keeps the existing static-renderer path
   working, layers interactivity on top. Confirm.

4. **Mark-stitched persistence storage.** Per-user-per-chart marking
   state. New table on the User domain, keyed by `(userId, tutorialId,
   chartIndex)`, value is a sparse cell-bitmap. Pre-launch checklist
   already has the schema-all-fields-up-front rule — design the table
   once, include all plausibly-useful fields (last-touched timestamp,
   stitch count, time-spent, mark-mode preference, palette override).
   Confirm the table shape lands as part of the same migration as the
   viewer, not a follow-up.

5. **Print PDF generation — server-side via a render service, or
   client-side via something like react-pdf?** Server-side gives
   higher-quality output and works on every browser; client-side avoids
   the infra. Recommendation is server-side — the chart JSON is small,
   PDF rendering is a fast Lambda — but confirm before the build session
   picks a library.

6. **Palette-swap preview — confirm scope.** Two flavours: (a) DMC ↔
   Anchor cross-reference (already in the palette schema; trivial); (b)
   complete-recolour to a user-chosen scheme (harder, needs colour-
   harmony logic). Recommendation: (a) for v1, (b) deferred. Confirm.

7. **Mobile-first vs desktop-first build order.** The whole point of
   this work is the mobile chart-viewer reads badly. But the existing
   desktop renderer is also stale relative to the market. Build mobile
   first and let desktop inherit, or build a single responsive viewer?
   Recommendation: single responsive viewer with mobile as the design
   anchor. Confirm.

---

## Sources

Cross-stitch / embroidery:
- [Pattern Keeper homepage](https://patternkeeper.app/) · [FAQ](https://patternkeeper.app/faq/) · [Help index](https://patternkeeper.app/help/) · [Navigation](https://patternkeeper.app/help/navigating-around-your-chart/) · [Chart settings](https://patternkeeper.app/help/chart-settings/)
- [MarkUp R-XP](https://markuprxp.co.uk/) · [App Store listing](https://apps.apple.com/us/app/markup-r-xp/id1559524491)
- [Cross Stitch Saga](https://apps.apple.com/us/app/cross-stitch-saga/id1440279996) · [StitchPal](https://apps.apple.com/us/app/stitchpal/id1550536005)
- [Pattern Keeper vs MarkUp Rx-P (Atom Heart)](https://www.atomheartcrossstitch.com/post/pattern-keeper-vs-markup-rx-p)
- [23 best apps for cross-stitchers (Lord Libidan)](https://lordlibidan.com/the-best-apps-for-cross-stitchers/)
- [Pattern Keeper alternative for iOS (Notorious Needle)](https://notoriousneedle.com/pattern-keeper-alternative-ios-devices/)
- [Pic2Pat](https://www.pic2pat.com/index.en.php) · [free pattern makers compared (MakeLineArt)](https://makelineart.com/en/blog/best-free-cross-stitch-pattern-makers-compared)
- [What makes a good cross-stitch PDF (Stitchmate)](https://stitchmate.app/guides/cross-stitch-pattern-pdf-quality)
- [Inkstitch features](https://inkstitch.org/features/)
- [Bernina Embroidery Software V9](https://www.bernina.com/en-US/Software-US/Embroidery-Software/BERNINA-Embroidery-Software-9)
- [Hatch pricing](https://hatchembroidery.com/products/hatch-embroidery/pricing) · [Hatch features](https://hatchembroidery.com/products/hatch-embroidery/features)
- [Wilcom EmbroideryStudio Decorating](https://wilcom.com/embroiderystudio/decorating)
- [How to read a cross-stitch chart (DMC)](https://www.dmc.com/US/en/technique-cross-stitch-read-chart)

Knitting / crochet / Ravelry / Etsy:
- [knitCompanion](https://www.knitcompanion.com/) · [FAQs](https://www.knitcompanion.com/ufaqs/) · [App Store](https://apps.apple.com/us/app/knitcompanion-knitting-more/id1058142783) · [Magic Markers PDF](https://www.knitcompanion.com/wp-content/uploads/2025/07/Magic-Markers.pdf)
- [knitCompanion for cross-stitch (Lissylaine)](https://lissylaine.com/2022/01/04/knitcompanion-for-cross-stitch/)
- [JKnit Pro](https://www.jakrosoft.com/jknit-pro.html) · [JKnit HD Lite](https://www.jakrosoft.com/jknit-hd-lite.html)
- [My Row Counter app](https://rowcounterapp.com/) · [features](https://rowcounterapp.com/counter.html)
- [PatternGenius](https://www.patterngenius.com/)
- [Ravelry apps directory](https://www.ravelry.com/about/apps) · [Ravelry pattern downloads](https://www.ravelry.com/help/search?query=Downloading++patterns)
- [Etsy: patterns undownloadable on mobile](https://community.etsy.com/t5/Technical-Issues/Patterns-are-undownloadable-Etsy-needs-to-fix-this/td-p/140717491)
- [Reading charts flat vs in-the-round (Brooklyn Tweed)](https://brooklyntweed.com/pages/reading-charts) · [Tin Can Knits](https://blog.tincanknits.com/2014/06/06/how-to-read-a-knitting-chart/)
- [Intwined Pattern Studio](https://intwinedstudio.com/) · [EnvisioKnit](https://www.envisioknit.com/)
- [AirTurn BT-105 row-counter pedal](https://gschoppe.com/projects/knitting-row-counter/pedals.html)
- [Hidden features in knitting apps (Silly Monkey)](https://www.sillymonkey.us/post/hidden-features-in-knitting-apps-you-might-not-know-about)
- [Best mobile apps for knitters (FiberArtsy)](https://www.fiberartsy.com/free-mobile-apps-for-knitters/)

Marketplace / safety:
- [Crochet pattern scams on Etsy (The Loophole Fox)](https://theloopholefox.com/crochet-scams/)
- [6 tips to avoid pattern scammers (Cilla Crochets)](https://www.cillacrochets.com/crochet-community/scammers-on-etsy)
