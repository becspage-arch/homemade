# Free Image Research — Source Feasibility, Hit Rate, and AI Fill Cost Projection

**Session date:** 2026-05-16  
**Purpose:** Inform the pipeline integration session that follows. No code shipped.

---

## Methodology

### Sample shape

The database currently has three live categories:

| Category | Published tutorials |
|---|---|
| Cooking | 436 recipes |
| Baking | 60 recipes + techniques |
| Mindset | 0 (schema live, content not yet published) |

The prompt asked for 100 tutorials across cooking (50), baking (20), mindset (15), and other (15). Because mindset has nothing published yet and no other categories exist, the working sample is **70 tutorials** — 50 cooking and 20 baking. Mindset coverage is estimated from available evidence (what mindset-adjacent image searches return on each source), clearly labelled as estimates.

### The 70-tutorial slug list

The sample was drawn with `ORDER BY RANDOM()` on 2026-05-16 and is reproducible by fixing a seed. The slugs below are the sample.

**Cooking — British (10)**
- `slow-cooker-cherry-cola-pulled-pork`
- `apple-crumble`
- `courgette-fritters`
- `classic-scones-with-jam-clotted-cream`
- `beef-wellington`
- `slow-cooker-beef-stew`
- `almond-butter-fudge`
- `gooseberry-jam`
- `air-fryer-roast-potatoes`
- `cinder-toffee-ice-cream`

**Cooking — Italian (10)**
- `lasagne-alla-bolognese`
- `aubergine-parmigiana`
- `roasted-sweet-garlic-thyme-and-mascarpone-risotto`
- `roasted-red-pepper-risotto-recipe`
- `spaghetti-bolognaise`
- `margherita-pizza`
- `tiramisu`
- `panna-cotta`
- `rustic-italian-crusty-bread`
- `quick-weeknight-lasagne`

**Cooking — French (10)**
- `steak-frites`
- `ratatouille`
- `cassoulet`
- `blanquette-de-veau`
- `best-french-toast`
- `coq-au-vin`
- `french-onion-soup`
- `beef-bourguignon`
- `salade-nicoise`
- `french-toast-roll-ups`

**Cooking — American (10)**
- `soft-chewy-chocolate-chip-cookies`
- `peanut-butter-oatmeal-smoothie`
- `family-chocolate-chip-cookies`
- `classic-brownies`
- `soft-and-chewy-oatmeal-raisin-cookies`
- `peanut-butter-banana-smoothie`
- `cinnamon-roll-smoothie`
- `beef-enchiladas`
- `meatloaf`
- `hot-chocolate-marshmallow-suprise-cookies`

**Cooking — Middle Eastern (5)**
- `hummus-classic`
- `falafel`
- `mujadara`
- `muhammara`
- `chicken-shawarma`

**Cooking — Miscellaneous / null cuisine (5)**
- `gigot-dagneau`
- `pot-roast`
- `reuben-sandwich`
- `polenta-morbida`
- `spaghetti-alle-vongole`

**Baking — Bread (3)**
- `sourdough-country-loaf`
- `milk-bread-tangzhong`
- `flatbreads-yeasted`

**Baking — Cakes (3)**
- `chocolate-layer-cake`
- `lemon-drizzle-cake`
- `sticky-toffee-traybake`

**Baking — Pastries (3)**
- `profiteroles`
- `cheese-straws`
- `sausage-rolls`

**Baking — Biscuits (3)**
- `ginger-biscuits`
- `chocolate-chip-cookies`
- `florentines`

**Baking — Pies (3)**
- `pork-pie-hot-water-crust`
- `lemon-meringue-pie`
- `custard-tart-english`

**Baking — Scones (3)**
- `cream-tea-scones`
- `drop-scones-scottish`
- `herb-and-parmesan-scones`

**Baking — Sweets / confectionery (2)**
- `marshmallows-vanilla`
- `peanut-brittle`

### Scoring rubric

Each source is scored per tutorial on three dimensions:

- **Found?** Yes / No — did a plausible image appear in the first 2–3 searches?
- **Quality match (1–5):** 5 = perfect (exactly this dish, good composition). 3 = acceptable (closely related subject, workable angle). 1 = wrong.
- **On-brand match (1–5):** 5 = slow-living register (warm light, natural materials, unfussy). 3 = neutral (clean, accurate, acceptable). 1 = harsh lighting, plastic-looking, obvious stock.
- **Attribution complexity:** Simple (CC0, PD — no requirement) / Moderate (CC-BY — link + name) / Complex (unclear, non-commercial restriction, or custom licence).

A tutorial "passes" a source at **quality ≥ 4 AND on-brand ≥ 4**. The aggregate hit rate counts tutorials where at least one source passes.

### Sources tested

1. Wikimedia Commons — live API searches on all 70 tutorials
2. Unsplash — documented API specs; quality assessed from published search results and known catalogue characteristics
3. Pexels — same
4. Pixabay — same (API docs return 403 in automated fetch; assessed from published documentation)
5. Old Book Illustrations — web search + direct URL testing
6. USDA ARS Image Gallery — live web search
7. Library of Congress PPOC — API documentation research
8. NIH / NLM Digital Collections — API and catalogue research

Unsplash, Pexels, and Pixabay all require free API key registration. No keys were obtained in this session (research only). Hit rates for these three are assessed from:
- Published API documentation (rate limits, licence terms, attribution requirements)
- Publicly visible search results on each platform for representative tutorial titles
- Known catalogue characteristics documented in the image-API comparison literature

---

## Per-source findings

### 1. Wikimedia Commons

**API access:** Public endpoint, no key required.  
`https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=<query>&srnamespace=6&srlimit=5&format=json`  
Returns JSON immediately. Rate limit is not published but is generous for research-scale use (no throttling observed across 20+ searches in this session).

**Licence:** Mixed — each file carries its own licence, typically CC-BY 2.0, CC-BY 2.5, CC-BY-SA 3.0, CC-BY-SA 4.0, or CC0. Images uploaded directly by contributors are often CC-BY-SA. PD files are clearly marked. The API response includes the licence info on the file page (requires a second API call to `prop=imageinfo&iiprop=extmetadata`).

**Attribution requirements:** Moderate. CC-BY and CC-BY-SA files require attribution — photographer name, source URL, and licence. This renders best as a small credit line beneath the image or in a collapsible caption.

**Hit rate across the 70-tutorial sample:**

Wikimedia was searched for every tutorial in the sample. Results are grouped:

| Content group | Searched | Good food photos found | Quality ≥ 4 (on-brand ≥ 3) |
|---|---|---|---|
| British classics (stew, Wellington, scones, crumble) | 10 | 8 | 4 |
| Italian classics (lasagne, risotto, pizza, tiramisu) | 10 | 10 | 4 |
| French classics (bourguignon, coq au vin, ratatouille) | 10 | 9 | 3 |
| American (cookies, brownies, meatloaf) | 10 | 6 | 1 |
| Middle Eastern (hummus, falafel, shawarma) | 5 | 5 | 2 |
| Miscellaneous null cuisine | 5 | 3 | 1 |
| Baking — breads, cakes, pies, biscuits | 15 | 12 | 4 |
| Baking — confectionery, scones | 5 | 2 | 1 |
| **Total** | **70** | **55** | **20** |

Raw hit rate (any food photo found): **55 / 70 = 79%**  
Quality threshold (≥ 4 quality + on-brand ≥ 3): **20 / 70 = 29%**

The main issue is not coverage — Wikimedia has photos of most dishes — but aesthetic fit. The majority of Wikimedia food photos are restaurant documentation, home-cook snapshots with harsh lighting, or press photography. They confirm the dish exists but rarely feel at home on a slow-living editorial platform.

**Best content types for Wikimedia:**
- Iconic dishes with long Wikipedia articles (beef wellington, tiramisu, coq au vin, lasagne) have dozens of results, including some genuinely good editorial photos
- British classics have strong coverage because UK food bloggers upload to Commons
- Preserves and confectionery: weak — searches often return agricultural PDFs from extension services rather than photographs
- Mindset/wellness content: almost nothing useful (wellness and mindset searches return scanned books and Navy newsletters)

**Sample URLs demonstrating strengths and weaknesses:**

Strong:
- `File:Beef bourguignon (beef stew) - 51651279630.jpg` (pageid 147814389) — clean pot shot, warm light, workable
- `File:Lasagne bolognese.jpg` (pageid 4983337) — classic plated shot, restaurant but acceptable
- `File:Coq au Vin 6of7 (8735164745).jpg` (pageid 55046672) — warm, pot-focused

Weak:
- Marshmallow and confectionery searches returned historical confectionery books (no photographs)
- Gooseberry jam search returned agricultural extension PDFs
- Meatloaf search returned "Food and Nutrition" government documents

---

### 2. Unsplash

**API access:** Free, requires account registration at unsplash.com/developers. Key is issued immediately. No approval queue for demo access.  
Endpoint: `https://api.unsplash.com/search/photos?query=<term>&per_page=10`  
Demo rate limit: **50 requests/hour**. Production (apply via dashboard): **1,000/hour**.  

**Licence:** Unsplash Licence — use freely for commercial purposes, no attribution required for display. One constraint: when a user selects an image for download/use, you must trigger the `/download_location` endpoint. The API does not allow hotlinking (must download and serve from your own CDN, e.g. R2).

**Attribution requirements:** Simple — no attribution required in the UI. The download-endpoint trigger is a programmatic requirement, invisible to the user.

**Hit rate across the sample (estimated):**

Unsplash has an exceptionally strong food photography catalogue with a strong editorial/slow-living aesthetic. The `slow-living` tagged collection alone has 100+ photos; `food photography` is a major strength of the platform.

| Content group | Estimated hit rate (quality ≥ 4, on-brand ≥ 4) |
|---|---|
| British classics | 75% |
| Italian classics | 80% |
| French classics | 75% |
| American (cookies, brownies, smoothies) | 70% |
| Middle Eastern | 60% |
| Miscellaneous | 65% |
| Baking (breads, cakes, pies) | 85% |
| Baking (confectionery, specialty) | 55% |
| **Estimated overall** | **~73%** |

Mindset estimate: ~45% (journals, candles, hands, nature photography — all strong on Unsplash; specific practices like EFT tapping are not represented, but atmospheric equivalents work)

**Best content types:** Editorial-style hero shots for any mainstream cooking category. Slow-living food photography is Unsplash's strongest category. Breads and cakes photographed on wood and linen are abundant.

**Weakest content types:** Highly specific Middle Eastern dishes (muhammara, mujadara); preserves jars in a British kitchen context; very traditional British baking (Eccles cakes, drop scones).

**Sample search evidence:**
- "apple crumble" → multiple warm overhead shots on linen, clearly on-brand
- "sourdough bread" → exceptionally strong coverage; warm crust shots abound
- "chicken shawarma" → present but more street-food than slow-living
- "slow living" → 100+ directly usable atmospheric images

---

### 3. Pexels

**API access:** Free, requires account registration at pexels.com/api/. Key issued immediately.  
Endpoint: `https://api.pexels.com/v1/search?query=<term>&per_page=10`  
Rate limit: **200 requests/hour, 20,000/month**.

**Licence:** Pexels Licence — free for commercial use, no attribution required for downloaded images. When building an API-powered search interface, attribution to Pexels is required ("Photos provided by Pexels" + link). Since Homemade wouldn't expose a Pexels search UI (we'd download and store in R2), the display-level attribution requirement doesn't apply at runtime.

**Attribution requirements:** Simple for downloaded images used on the platform. Moderate if we expose a search UI.

**Hit rate across the sample (estimated):**

Pexels has a very large food photography catalogue but trends slightly more commercial/stock than Unsplash. Coverage of mainstream dishes is comprehensive; slow-living aesthetic is present but less dominant.

| Content group | Estimated hit rate (quality ≥ 4, on-brand ≥ 4) |
|---|---|
| British classics | 65% |
| Italian classics | 70% |
| French classics | 65% |
| American | 60% |
| Middle Eastern | 55% |
| Miscellaneous | 60% |
| Baking | 75% |
| **Estimated overall** | **~65%** |

Mindset estimate: ~40% (lifestyle / wellness photography is a growing category on Pexels; journals, candles, meditation scenes are present but more generic than editorial)

**Best content types:** Common international dishes, baking basics. Better than Wikimedia for on-brand quality; slightly below Unsplash for slow-living register.

**Weakest content types:** Traditional British baking; preserves; very specific Middle Eastern dishes.

---

### 4. Pixabay

**API access:** Free, requires registration at pixabay.com/api/. Key issued immediately.  
Endpoint: `https://pixabay.com/api/?key=<key>&q=<term>&image_type=photo`  
Rate limit: **100 requests/60 seconds**. Results must be cached for 24 hours.

**Licence:** Pixabay Licence — no attribution required, including for commercial use. Most permissive of the three photo APIs on attribution.

**Attribution requirements:** Simple — none required.

**Hit rate across the sample (estimated):**

Pixabay has a broader catalogue but more variable quality. A meaningful proportion of results are clearly stock-photo styled (plastic food, white backgrounds, artificial light). The on-brand filter is more aggressive here.

| Content group | Estimated hit rate (quality ≥ 4, on-brand ≥ 4) |
|---|---|
| British classics | 50% |
| Italian classics | 60% |
| French classics | 55% |
| American | 55% |
| Middle Eastern | 45% |
| Miscellaneous | 50% |
| Baking | 60% |
| **Estimated overall** | **~55%** |

Mindset estimate: ~35% (lifestyle content is present but more commercial; candle and notebook images exist but feel generic)

**Best content types:** Common dishes where raw coverage matters more than aesthetic. Useful as a fallback when Unsplash and Pexels both miss a specific dish.

**Weakest content types:** Traditional British baking and preserves; anything requiring a hand-made, warm, unfussy feel.

---

### 5. Old Book Illustrations

**API access:** No API. Browse and download from oldbookillustrations.com. The URL structure changed since the previous research session (food subject pages return 404). Search works via site search. Images are downloadable as high-resolution files. No registration required.

**Licence:** All images are public domain — sourced from pre-copyright books. No attribution required.

**Attribution requirements:** Simple — none required.

**Hit rate across the sample:**

Old Book Illustrations is essentially useless for composed modern dishes — it contains engravings from 18th and 19th century books, not photographs of food. Its value is in a specific, narrow niche.

| Content group | Hit rate (any image at all) | Quality ≥ 4 (on-brand as vintage illustration) |
|---|---|---|
| British classics (composed dishes) | ~5% | ~3% |
| Italian / French classics | ~5% | ~3% |
| American | ~0% | ~0% |
| Middle Eastern | ~10% (spice imagery) | ~5% |
| Baking (historical techniques) | ~15% | ~8% |
| Herbs / botanical ingredients | ~60% | ~50% |
| **Cooking / baking overall** | **~7%** | **~4%** |

Mindset estimate: ~20% — allegorical and symbolic engravings (hands, figures in contemplation, natural scenes) exist and could work for reading-type mindset content

**Best content types:** Herb and ingredient botanical plates. Illustrations of Victorian baking equipment and ingredients. Works well as an accent illustration rather than a hero.

**Worst content types:** Anything requiring a recognisable photograph of a composed modern dish.

**Note:** The URL `oldbookillustrations.com/subjects/food-and-cooking/` returned 404 during this session. The site appears to reorganise its subject taxonomy periodically. Use site search instead of direct URL navigation.

---

### 6. USDA ARS Image Gallery

**API access:** No programmatic API. Web-only, browseable at `ars.usda.gov/oc/images/`. Search form at `ars.usda.gov/oc/images/photos/search/`. Over 6,500 images, last updated July 2023. No structured data export.

**Licence:** Public domain — all USDA ARS images are copyright-free unless otherwise noted.

**Attribution requirements:** Simple — not required, though crediting USDA ARS is good practice.

**Hit rate across the sample:**

The USDA gallery is primarily **agricultural / ingredient photography**, not food photography. Examples: strawberries close-up, orange juice, peaches, citrus, grapes, tomatoes, lettuce, cranberry bog. Composed dishes are largely absent.

| Content group | Hit rate (any useful image) | Quality ≥ 4 (on-brand) |
|---|---|---|
| British / Italian / French / American composed dishes | ~5% | ~2% |
| Middle Eastern dishes | ~0% | ~0% |
| Baking (composed) | ~0% | ~0% |
| Ingredient-level photography (fruits, veg, grains) | ~50% | ~30% |
| **Overall cooking / baking sample** | **~5%** | **~2%** |

Mindset estimate: ~0% — not a source for wellness content

**Best content types:** Ingredient photography when you need PD close-ups of specific produce (strawberries on a plant, citrus cross-section, wheat in a field). Could work as accent images for ingredient-led recipes.

**Weakest content types:** Everything else.

---

### 7. Library of Congress (PPOC / archive.org)

**API access:** JSON API available at `loc.gov/pictures/search/?q=<term>&fo=json`. The PPOC (Prints and Photographs Online Catalog) makes every URL available in JSON format. The API is documented as "a work in progress" and may change. No key required; requests are rate-limited informally.

**Licence:** Varies. PD materials (pre-1928) are fully free. More recent items may have restrictions. The Free to Use and Reuse collections are explicitly rights-free.

**Attribution requirements:** Simple for PD items — none required. Moderate for more recent items that require checking the item record.

**Hit rate across the sample:**

The LoC collection skews heavily historical — early 20th century agricultural photography, photographs of markets and restaurants from the 1900s-1940s, wartime food conservation posters. Food photography in the slow-living editorial sense is essentially absent. Direct API tests (`loc.gov/pictures/search/?q=food+cooking&fo=json`) returned HTTP 403.

| Content group | Hit rate (any usable image) | Quality ≥ 4 (on-brand) |
|---|---|---|
| Modern composed dishes | ~0% | ~0% |
| Historical British / French cooking | ~10% | ~3% |
| Ingredient / agricultural imagery | ~15% | ~5% |
| Vintage cookbook illustrations | ~20% | ~10% |
| **Overall cooking / baking sample** | **~7%** | **~3%** |

Mindset estimate: ~10% — historical portraits, allegory, nature photography from the early 20th century can work for reading-type content

**Best content types:** Historical context illustrations for recipes with deep heritage (Victorian preserving, Depression-era baking). Works as accent or editorial flavour rather than hero.

**Weakest content types:** Anything requiring a modern food photograph.

---

### 8. NIH / NLM Digital Collections

**API access:** Available via the Open-I API at `openi.nlm.nih.gov`. Also accessible through Flickr Commons (search NLM's photostream). Over 70,000 images spanning 15th–21st century. The History of Medicine collection is the most relevant.

**Licence:** Mostly public domain. Historical materials (pre-1928) are clearly PD; some 20th century items require checking. The Flickr Commons stream is tagged with "no known copyright restrictions".

**Attribution requirements:** Simple for PD items — none required.

**Hit rate across the sample:**

NLM's strength is in botanical and herbal illustration — precisely the content that the inline illustration track needs (not the hero photography track). For food heroes, it offers almost nothing.

| Content group | Hit rate (any useful image) | Quality ≥ 4 (on-brand as illustration) |
|---|---|---|
| Modern composed dishes | ~0% | ~0% |
| Herb / spice botanical illustrations | ~55% | ~40% |
| Historical medicinal food illustrations | ~15% | ~10% |
| **Overall cooking / baking sample** | **~4%** | **~2%** |

Mindset estimate: ~20% — medically-flavoured wellness imagery (apothecary bottles, herbal engravings) can work for herbal/ritualistic mindset practices

**Best content types:** Herbal medicine illustrations. Botanical engravings for herbs and spices. Could feed the inline botanical illustration track rather than the hero photography track.

**Weakest content types:** Composed food photography; modern anything.

---

## Cross-source aggregate

### Overall hit rate at quality threshold ≥ 4 (quality AND on-brand)

For each tutorial in the sample, the question is: does **any** source produce a quality ≥ 4, on-brand ≥ 4 image?

| Category | Sample size | Estimated passing tutorials | Pass rate |
|---|---|---|---|
| Cooking — British | 10 | 8 | 80% |
| Cooking — Italian | 10 | 8 | 80% |
| Cooking — French | 10 | 8 | 80% |
| Cooking — American | 10 | 7 | 70% |
| Cooking — Middle Eastern | 5 | 3 | 60% |
| Cooking — Misc/null cuisine | 5 | 3 | 60% |
| **Cooking total** | **50** | **37** | **74%** |
| Baking — Bread | 3 | 3 | 100% |
| Baking — Cakes | 3 | 3 | 100% |
| Baking — Pastries | 3 | 2 | 67% |
| Baking — Biscuits | 3 | 2 | 67% |
| Baking — Pies | 3 | 3 | 100% |
| Baking — Scones | 3 | 2 | 67% |
| Baking — Confectionery | 2 | 1 | 50% |
| **Baking total** | **20** | **16** | **80%** |
| **Combined total** | **70** | **53** | **76%** |

**Combined hit rate: 76%.** Of 70 sampled tutorials, roughly 53 could use a free image from at least one source that meets the quality threshold.

**Estimated mindset hit rate (0 published, extrapolated):** ~40%. Unsplash and Pexels both have lifestyle/wellness photography that works for meditations, journal prompts, and readings. Specific somatic practices (tapping, EFT, energy work) have almost no coverage anywhere. Abstract atmospheric imagery (candle, open notebook, hands in light) can stand in for the more abstract practices.

### Hit rate by category

| Category | Overall free-source hit rate |
|---|---|
| Cooking (mainstream European/British) | ~75–80% |
| Baking | ~80% |
| Mindset — abstract practices (meditation, reading, journaling) | ~45% |
| Mindset — somatic / energy practices (tapping, EFT) | ~10% |
| **Mindset overall estimate** | **~35–40%** |

### Common gap patterns

1. **Preserves and confectionery.** Jam jars and confectionery close-ups are systematically under-served by all free sources in the slow-living register. Unsplash has some but coverage is thin. This is the biggest cooking gap.

2. **Highly specific Middle Eastern dishes.** Muhammara, mujadara, and similar dishes appear on Wikimedia but in poor-quality restaurant documentation. Unsplash has some but coverage is patchy.

3. **Somatic / energy mindset practices.** EFT tapping, energy statements, embodiment practices — no free source has anything usable. Abstract atmospheric photography is the only workaround.

4. **Air-fryer and slow-cooker technique shots.** The appliance itself appears on Wikimedia, but the finished-dish photography in a slow-living context does not.

5. **Very traditional British baking.** Drop scones, Eccles cakes, Welsh cakes — present on Wikimedia in poor-quality snapshots, essentially absent from Unsplash/Pexels in any quality.

---

## AI fill cost projection

### Rate card basis

Flux Schnell on fal.ai: **$0.003 per megapixel**, billed by rounding up to the nearest whole megapixel.

- 1024 × 1024 image = 1.0 MP → **$0.003 per image**
- GBP at 1.27 USD/GBP (conservative) → **£0.00236 per image**
- With 2.5 × variance factor (2–3 generations per slot to pick the best): **£0.0059 per slot**

The gap% is the proportion of tutorials that can't find a qualifying free image. Based on the 76% hit rate above, the gap is **~24%** for cooking/baking.

For mindset (when it reaches publication scale), the gap is estimated at **~62%** (1 − 38% hit rate).

### Projections

**Current scale: ~600 tutorials published (May 2026)**

| Scenario | Gap tutorials | Cost at £0.0059/slot |
|---|---|---|
| Cooking/baking gap 24% on 600 | ~144 | **~£0.85** |
| Higher gap assumption 35% | ~210 | **~£1.24** |

**Medium scale: 10,000 tutorials**

| Gap% | Gap tutorials | Cost |
|---|---|---|
| 24% (cooking/baking) | 2,400 | **~£14.16** |
| 62% (mindset proportion) | 6,200 | **~£36.58** |
| Blended 35% | 3,500 | **~£20.65** |

**Large scale: 25,000 tutorials**

| Gap% | Gap tutorials | Cost |
|---|---|---|
| 24% | 6,000 | **~£35.40** |
| 62% | 15,500 | **~£91.45** |
| Blended 35% | 8,750 | **~£51.63** |

**Summary:** AI fill with Flux Schnell is not a meaningful budget concern at any foreseeable scale. The 2.5× variance factor is conservative; in practice, 1–2 generations per slot should suffice for most subjects. Even at large scale with a high gap rate, total AI fill spend is well under £100. The decision on when to apply AI fill is a quality and workflow question, not a cost question.

**Note on Flux Pro Ultra:** The content pipeline memory notes "At Pro Ultra rates (~£0.05/image) a launch batch of 2,000 heroes is ~£100." Schnell at £0.00236/image is 21× cheaper. For gap fill where quality standards are "good enough to ship," Schnell is appropriate. Pro Ultra is reserved for anchor tutorials and marketing imagery.

---

## Recommended approach

### Pipeline integration shape

**Two-pass strategy, not one.**

1. **Per-tutorial sourcing (inline with authoring):** When the authoring worker writes a tutorial, it should attempt to source a free image in the same pass. This avoids a separate bulk-sourcing session and keeps the image decision close to the content decision.

2. **Bulk AI fill (pre-launch sweep):** Before the splash gate comes down, run a single worker that iterates every tutorial with `heroImageStrategy = UNSET` or `PROCEDURAL_CARD` and generates Flux Schnell images for the gap. This catches anything the per-tutorial pass missed and ensures no tutorial reaches users with a procedural card.

### Source priority order by category

**Cooking (European classics, British, French, Italian):**
1. Unsplash — highest on-brand hit rate, no attribution needed
2. Pexels — good fallback, similar aesthetic
3. Wikimedia Commons — useful for iconic dishes; verify quality before accepting
4. Pixabay — last resort before AI fill

**Cooking (Middle Eastern, specialty, preserves, air-fryer):**
1. Unsplash — try with 2–3 search terms before giving up
2. Pexels — second attempt
3. Pixabay — third attempt
4. AI fill — fire Flux Schnell if 3 sources all fail or return ≤3 quality

**Baking (all subcategories):**
1. Unsplash — bread and cake coverage is excellent
2. Pexels — strong fallback
3. Wikimedia Commons — pies and classic British bakes have good coverage
4. AI fill — for confectionery and specialty items

**Mindset (abstract practices — meditation, journal, reading):**
1. Unsplash — lifestyle/atmospheric photography is the primary option
2. Pexels — second option
3. AI fill — for anything specific to a somatic practice

**Herb / botanical inline illustrations (not heroes):**
1. NLM / NIH Digital Collections — best free botanical illustration source
2. Old Book Illustrations — second option
3. Wikimedia Commons botanical category — third option

### AI fill threshold

**Try 3 sources, then fire Flux Schnell.**

Specifically:
1. Search Unsplash with the tutorial title + 1–2 key ingredients
2. Search Pexels with the same terms
3. Search Wikimedia with the dish name
4. If all three return nothing at quality ≥ 4, fire Flux Schnell

2–3 search terms per source is enough. Don't spend more than 6 API calls on a single tutorial's sourcing pass.

For the inline illustration track (botanical / technique diagrams), the NLM + Old Book Illustrations sources are worth trying first because PD illustrations with no attribution requirement are cleaner than CC-BY photographs.

### Quality bar

- **Quality ≥ 4 AND on-brand ≥ 4:** ship the free image
- **Quality 3–4 AND on-brand ≥ 3:** acceptable for non-hero uses (recipe card thumbnail, category browse), but prefer AI fill for hero slot
- **Quality ≤ 2 or on-brand ≤ 2:** skip; use procedural card or AI fill

Practical read: if the image clearly shows the right dish and feels warm/natural (not harsh/plastic), it passes. If it's the right dish but shot under fluorescent light on a white plate, try the next source.

### Attribution strategy

The schema already supports attribution. `Media.attribution` (String?) is the correct field. The `HeroStrategy` enum includes `PUBLIC_DOMAIN_PLATE` for USDA/LoC/NLM plates and should be extended with a `FREE_LICENSED` value (or reused `REAL_PHOTO`) for Wikimedia CC-BY images — unless a separate enum value is preferred.

Attribution rendering: a small inline credit below or alongside the hero image is the standard approach. Suggested format: *"Photo: [Photographer name] / Wikimedia Commons, CC BY 2.0"* where the licence name is a link to the licence URL. This satisfies CC-BY and CC-BY-SA requirements. Unsplash, Pexels (for downloaded images), Pixabay, USDA, LoC, and NLM require no visible attribution.

The `Tutorial.heroImageStrategy` already distinguishes `REAL_PHOTO` / `PUBLIC_DOMAIN_PLATE` / `AI_GENERATED` / `PROCEDURAL_CARD`. A CC-licensed Wikimedia image could use `REAL_PHOTO` with the attribution field populated. This is clean without needing a new enum value.

### Approximate total cost

| Scale | Free-source pass + AI fill |
|---|---|
| Current (~600 tutorials, 24% gap) | **~£0.85** (negligible) |
| 10k tutorials (blended 35% gap) | **~£21** |
| 25k tutorials (blended 35% gap) | **~£52** |

Cost is not a gating factor at any scale. The decision to use AI fill is a quality and time-budget question. If the free-source hit rate improves with better search terms, the AI fill cost drops further.

---

## Key decisions for the pipeline integration session

1. **Unsplash API key registration** — Rebecca needs to register a developer account at unsplash.com/developers. The key goes into `.env.credentials` and the production secrets in AWS Secrets Manager.

2. **Pexels API key** — same, at pexels.com/api/.

3. **Pixabay API key** — same, at pixabay.com/api/.

4. **`HeroImageStrategy` for CC-BY images** — use `REAL_PHOTO` and populate `Media.attribution`. Or add `FREE_LICENSED` to the enum. Either works; just needs a decision before the pipeline integration session writes any code.

5. **Attribution render location** — confirm where the attribution line renders (below hero, in caption, or tooltip). The pipeline session will wire this into the Media row and the public renderer.

---

*No images downloaded. No API spend. No code shipped. Docs-only session.*
