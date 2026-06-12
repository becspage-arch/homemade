# Natural-home bulk-012 — batch report

**Fired:** 2026-06-12 (autopilot-queue)
**Session:** autopilot-queue
**Model:** Claude Sonnet 4.6

## Result

40 uploaded as PUBLISHED. 32 net new live (404 → 436). 8 slugs already existed in the DB from earlier batches (idempotent update — no harm). 36 tutorials caught by QC still-blocked queue; 38 auto-fixed by qc-fix pass.

## Context

Briefs were authored by a previous autopilot fire that was interrupted before the upload step. This fire completed the cycle: voice-checked all 40 (0 errors), seeded 21 missing ingredients + 3 missing tools, uploaded all 40 as PUBLISHED.

## Slice

40 entries across five sub-categories:

| Sub-category | Count | Entries |
|---|---:|---|
| `soap` | 8 | Goat's milk & honey (cold-process), Hot-process bar, Hemp seed (cold-process), Liquid castile, Shampoo bar, Salt bar, Coffee scrub (cold-process), Cocoa butter & vanilla (cold-process) |
| `candles` | 8 | Coconut wax jar (coconut-lime), Soy (geranium & ylang ylang), Beeswax birthday taper, Soy amber & oud, Layered soy (lavender & vanilla), Travel tin soy, Soy eucalyptus & spearmint, Soy fig & cassis |
| `beauty` | 12 | Dry shampoo powder, Hot oil hair treatment, Exfoliating foot cream, Bay rum aftershave splash, Lavender sleep balm, Glycerin & rosewater face mist, Neem scalp serum, Jojoba cleansing balm, Herbal facial steam blend, Sea salt hair spray, Muscle soak bath salts, Calendula infused oil |
| `cleaning` | 6 | Copper cleaning paste, Dishwasher tablet (homemade), Mould & mildew spray, Oven cleaning paste, Streak-free glass cleaner, Laundry detergent powder |
| `fragrance` | 6 | Rose geranium room spray, Frankincense & myrrh reed diffuser, Lemon verbena sachets, Floral spring simmer pot, Citrus & herb linen spray, Cedar & rose wardrobe sachets |

## Voice-check summary

All 40 passed voice-check (0 errors). 22 clean passes, 18 warnings only. Common warnings: safety-block notes (lye/chemical handling inline rather than a dedicated block), tricolon constructions. No errors required fixing before upload.

## Master list additions

**Ingredients seeded (21 new):** `fragrance-oil-vanilla`, `fragrance-oil-coconut-lime`, `fragrance-oil-amber`, `fragrance-oil-fig`, `fragrance-oil-blackcurrant`, `essential-oil-ylang-ylang`, `essential-oil-spearmint`, `essential-oil-black-pepper`, `essential-oil-myrrh`, `goats-milk-frozen`, `raw-honey`, `vodka-unflavoured`, `dried-bay-leaves`, `allspice-berries`, `calendula-flowers-dried`, `table-salt`, `soap-flakes`, `rose-petals-dried`, `jasmine-flowers-dried`, `lemon-peel`, `rosebuds-dried`

**Tools seeded (3 new):** `silicone-individual-bar-moulds`, `candle-dipping-pot`, `candle-tin-small`

## QC tail

qc-fix ran against `--recently-published --since "2 hours ago"`: 74 candidates, 38 auto-fixed, 36 still blocked. Still-blocked queue picked up by the hourly qc-fix-batch routine.

## Deploy

Commit + push to main follows this report.
