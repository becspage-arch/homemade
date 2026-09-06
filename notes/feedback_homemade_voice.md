---
name: Anti-AI voice rules apply to all Homemade-published content
description: Brand voice rules that apply to any text written FOR THE HOMEMADE PRODUCT (tutorials, marketing, microcopy, emails) — not to dev chat with the user.
type: feedback
originSessionId: 5bc8ac16-5989-4c22-83d0-2e81109cbf3f
---
Any text I generate that will end up on homemade.education (tutorials, marketing copy, email templates, microcopy, push notifications, error messages, empty states, error pages, marketing site copy, App Store listings) MUST follow the 9 anti-AI rules in the brand direction doc Section 6b.

**Why:** The brand's edge is sounding like a real person who knows what she's talking about. AI slop is about to flood the homemaking internet; Homemade's positioning is the opposite. One slip-through undermines the brand.

**How to apply:**
- Banned phrases — never use: "delve into", "at its core", "in the realm of", "in today's fast-paced world", "tapestry of", "a testament to", "a beacon of", "navigate the complexities", "unlock the secrets", "treasure trove", "honestly/honest", "vibes", "frankly", "genuinely" (as filler), "embrace/elevate" (metaphorical), "foster" (non-literal), "cultivate/nurture" (metaphorical), "game-changer", "speaks volumes", "resonates with". Full list in Section 6b.
- Banned sentence openers: "in conclusion", "furthermore", "moreover", "additionally", "with that said", "having explored", "let's dive in", "picture this".
- **Em dashes: ZERO in body content AND ZERO in titles. HARD STOP (strengthened 2026-05-19, title-loophole closed 2026-05-20).** Long dashes are the single most common AI-tell across published Homemade content. Use brackets, commas, full stops, colons, or rewording instead. Any draft containing `—` (em dash) or `–` (en dash) anywhere — body, title, subtitle, headings — is rejected. The previous title exception is closed: autopilot abused it. Title patterns to use instead of em dashes: colon ("Magic ring: the adjustable starting loop"), restructure ("The adjustable starting loop, called the magic ring"), or just drop the qualifier ("Magic ring").
- No negation patterns ("not just X, but Y", "it's not about X, it's about Y", stacked negations). State things directly.
- Vary paragraph and sentence length. Avoid tricolons. Avoid topic-sentence-plus-three pattern.
- Specificity over abstraction. Concrete numbers, concrete things.
- No wrap-up endings. Just stop when done. No "Happy baking!" or "Remember, [philosophical takeaway]".
- British English spelling. Worldwide-friendly idiom (see below).
- Voice references: Alice Waters, Monty Don, Erin Boyle, Nigel Slater, Vita Sackville-West.

**No medical, financial, OR safety advice — HARD RULE (safety added 2026-05-19).**

Homemade is not a doctor. Homemade is not a financial adviser. Copy must never instruct, prescribe, or threshold-test on either.

- ❌ "Seek medical attention for any burn larger than a 50p coin or any blistering."
- ❌ "If symptoms persist for more than 48 hours, contact your GP."
- ❌ "Consult your doctor before starting this diet."
- ❌ "This will save you £200 a year on your grocery bill."
- ❌ "Bulk-buying flour is a good investment."
- ❌ "Take care, and get medical help if you need it." — too soft, sounds patronising / mum-ish

Use clean, calm, take-care language. One sentence. No moralising. No thresholds. No prices saved.

- ✅ "If jam touches skin, run cold water over it for at least ten minutes and seek medical care if needed." (the canonical pattern: state the action, then "and seek medical care if needed")
- ✅ "Run cold water over a burn and seek medical care if needed."
- ✅ "Buying in bulk may suit you, depending on your storage and use." (Not "you'll save £200".)

The pattern for safety lines: describe the immediate action in concrete terms, then add "and seek medical care if needed" as a single clause. Don't split into two sentences. Don't add "take care" softeners. Never quote specific medical thresholds (sizes, durations, symptom severities) and never quote specific financial outcomes (savings amounts, ROI claims, "investment" language). If a regulator or insurance company would treat the line as advice, cut or soften it.

**No prices, no fake retailers, no fake marketplace links — HARD RULE.**

The marketplace and creator program don't exist yet (planned for Phase 7). Until they do, copy must not pretend they do.

- ❌ `productCard` blocks with `price: "12"`, `currency: "£"`. We don't sell anything.
- ❌ "About £18 from a kitchen shop, less online." (sounds like a quote we don't have data for)
- ❌ Brand names for retailers we don't have an affiliate or sale relationship with.

Product / kit recommendation blocks describe the kit and what to look for in it. Leave `price`, `currency`, `retailerName`, `productUrl` empty until the marketplace is wired up. When it is, those fields populate from the central Tool / Ingredient row, not from the tutorial body.

- ✅ Product card describes: what the tool does, what to look for, why it matters. Title is generic ("Balloon whisk, 25 cm" not "Mauviel balloon whisk").
- ✅ Once the marketplace lands, the same card auto-populates with the real product, real price, real link.

**Worldwide-friendly references — HARD RULE.**

Homemade is read globally. The audience reads English but isn't all British. Copy must work for a reader in London, New York, Sydney, Toronto, Mumbai, or Cape Town without translation.

- ❌ "Halve any strawberry larger than a 50p piece." (UK currency; meaningless to anyone else.)
- ❌ "A piece roughly the size of a quarter." (US currency; meaningless to anyone else.)
- ❌ "About the size of a tennis ball" is fine; "about the size of a cricket ball" is not.
- ❌ "Your nearest Lakeland / Williams-Sonoma." (Regional retailers.)
- ❌ "Pint glass" without qualifying (UK pint = 568 ml; US pint = 473 ml).

Use either:
- **Universal measurements** — cm, mm, g, kg, ml, l, °C with °F in brackets where the recipe is mostly American in origin.
- **Universal physical comparisons** — "the size of a small plum", "the diameter of a saucer", "the width of a thumb", "the size of an egg", "a teaspoon-sized piece".

For currency, only mention if necessary and put it in context ("around £2 / $2.50 / equivalent locally"). For retailers, name the type of shop ("any cookware shop") not the chain.

Spelling stays British (colour, flavour, sieve, knob of butter). Idiom goes neutral.

**Medical disclaimer — locked single-line phrasing (added 2026-05-20).**

When a tutorial genuinely needs a medical disclaimer (herbal-medicine, anything that could be confused for treatment advice), use this EXACT sentence and nothing else:

> "Not medical advice. Consult a medical professional for ongoing or serious symptoms."

NOT "consult a qualified herbalist or doctor" (too specific, implies herbalist is an alternative to medical care).
NOT "consult your GP" (UK-specific).
NOT "consult your physician" (US-specific).
NOT longer paragraphs about drug interactions, dose, demographics, pregnancy, paediatrics.

One sentence, positioned once at the bottom of the tutorial (or in sources block). That's it. The site-wide terms cover the rest.

**Reading level — grade 6-8 across body text. HARD RULE (added 2026-05-21).**

The bulk of every tutorial must read at grade 6-8 level (~11-14 year old reading). This is the Barbara O'Neill / Martha Stewart register: warm, plain-spoken, confident expertise without academic gloss. Not dumbed down — accessible.

Concrete tests for whether a paragraph is in register:

- Could a 12-year-old read it aloud and roughly understand?
- Are the longest words 3 syllables or fewer (with rare exceptions for unavoidable craft terms, all tooltipped)?
- Are sentences mostly 8-15 words?
- Does it sound like a knowledgeable friend explaining at the kitchen table?

Banned exemplar (real published thyme cough syrup intro — what NOT to do):

> "Thyme simmered in water, strained, cooled, and stirred into honey. This is the kitchen's oldest cough remedy, the combination of thyme's antispasmodic and expectorant action with honey's coating and preserving properties makes a syrup that soothes a dry, tickling cough and helps loosen stubborn mucus. Culpeper (1652) prescribed thyme for coughs and chest complaints; the German Commission E, which reviews traditional herbal medicines, confirms its traditional use for upper respiratory catarrh."

Rewrite the same content in register:

> "Thyme syrup is a kitchen tradition for coughs. Simmer fresh thyme in water, strain it, cool it, and stir the liquid into honey. The thyme soothes the throat and helps thin sticky mucus; the honey coats it and keeps the syrup good for months in the fridge. About 40 minutes from start to finished jar."

Note what changed:
- "antispasmodic and expectorant action" → "soothes the throat and helps thin sticky mucus"
- "Culpeper (1652)" → cut (goes in Sources block)
- "German Commission E" → cut (goes in Sources block)
- "upper respiratory catarrh" → "sticky mucus" / "chest"
- Sentence length down, vocab simpler
- Same information, accessible register

**References move to Sources block — HARD RULE (reinforced 2026-05-21).** Historical figures (Culpeper, de Dillmont, Beeton), years (1652, 1882), institutional names (German Commission E, BHP, FDA, MHRA, NHS, RHS), studies, citations — none of these appear in body text. They live at the bottom in the Sources block where the reader can find them if they want reassurance the content isn't plagiarised. Bulk of the page is plain English.

**Steps must be numbered — HARD RULE (added 2026-05-21).** Sequential instructions (steps to make something, steps to do a technique) must use TipTap orderedList with numbered items, not prose paragraphs or bullets. A reader scanning the page must be able to count steps and find their place. Authors who write "First, simmer the thyme. Then strain it. Add the honey." in prose are doing it wrong — that's a 3-item ordered list.

Exception: orientation paragraphs, finishing notes, "what to try next", and other non-sequential content stays as prose.

**No unexplained technical / historical / institutional references in body text — HARD RULE (added 2026-05-20).**

A reader new to the topic should not hit jargon, historical references, or institutional names without explanation. If you need to reference one, either explain it inline OR move it to the Sources block. Don't pepper the intro with academic citations.

Examples from real published tutorials that broke this rule:

- ❌ "Culpeper (1652) prescribed thyme for coughs and chest complaints; the German Commission E, which reviews traditional herbal medicines, confirms its traditional use for upper respiratory catarrh."

   The newcomer doesn't know who Culpeper is, what "1652" implies, what the German Commission E is, or what "upper respiratory catarrh" means. Four unexplained terms in one sentence. This is the kind of writing that signals "academic textbook" not "approachable home reference".

- ✅ "Thyme has been used in home kitchens as a cough remedy for centuries — Nicholas Culpeper documented it in his 17th-century herbal — and the modern German government's herbal-medicine review board lists it as a traditional treatment for chest congestion."

   Or simpler:

- ✅ "Thyme is a long-standing home remedy for coughs and chest congestion."

   Historical / institutional references go in the Sources block at the bottom — they don't belong in the orientation paragraph.

**Words to either explain inline or replace with plain English:**
- "catarrh" → "chest congestion" / "mucus build-up"
- "expectorant" → "loosens phlegm" / "helps clear chest mucus"
- "emmenagogue" → don't use at all in body; explain in sources if relevant
- "anti-spasmodic" → "calms muscle spasms" / "soothes cramping"
- "decoction" / "infusion" / "maceration" → either explain inline or rely on a tooltip
- Year-only references (1652, 1882, 1908) → put the context first ("the 17th-century herbalist Culpeper", "Victorian needlework manuals")
- Institutional / regulatory bodies (German Commission E, BHP, FDA, MHRA) → don't reference in body; sources block only

**Traditional / cultural framing for remedies + traditional practices — HARD RULE (added 2026-05-19).**

For herbal medicine, traditional remedies, folk practices, and anything where someone might want to know "what is this and what's it for" but we can't make medical or efficacy claims:

The description must say what the thing IS and what people have traditionally used it for, in factual + cultural framing. NO claims of efficacy. NO medical advice. NO instructions to take for a specific condition.

- ❌ "Elderberry syrup is the kitchen's winter standby." (Means nothing to a newcomer. What does it standby for? Why winter?)
- ❌ "Elderberry syrup boosts immunity." (Efficacy claim.)
- ❌ "Take elderberry syrup at the first sign of a cold." (Medical advice.)
- ❌ "Elderberry has been clinically proven to..." (Medical advice + claim.)

- ✅ "Elderberry syrup is a sweet, dark concentrate of cooked elderberries with sugar or honey. A kitchen tradition long associated with the cold months: taken by the spoonful as a tonic, stirred into hot water, or drizzled over porridge."
- ✅ "Calendula-infused oil is a slow extraction of dried calendula flowers in a carrier oil. Long made at home and used in balms, salves, and skincare preparations."
- ✅ "Bay leaves have been used in folk magic for protection and money workings."

The pattern: describe the thing (texture / form / how it's made), then state factually what tradition has used it for ("a tradition long associated with...", "long used as...", "long made at home for..."). Don't quantify, don't promise, don't prescribe. The reader gets enough orientation to know whether the tutorial is for them.

**Safety advice — extended HARD RULE (added 2026-05-19).**

Everything safety-related is covered by the site-wide terms + disclaimers when a Maker enters the site. Body content stays focused on the craft. No "Before you start" safety sections, no PPE lists in body, no "do NOT wear gloves while operating the saw" warnings, no first-aid advice, no A&E vs plaster guidance.

The maximum acceptable safety mention is ONE compressed line if genuinely necessary for the craft (e.g. drilling, lye handling, hot wax). Example:

- ❌ The whole multi-paragraph "Before you start cutting or drilling / Eye protection / Gloves / First aid / Workspace" block.
- ✅ "Before you start cutting or drilling ensure you have eye protection, gloves and a clear & safe workspace."

If a craft genuinely requires a safety step (e.g. "add lye to water, not water to lye" in soap making), that is a STEP, not a safety section. It goes inline in the practice with the rest of the steps. No callout, no warning panel, no special framing.

**No false specificness — HARD RULE (added 2026-05-19).**

Don't reach for detail that isn't needed. If a Maker could reasonably substitute or vary it, don't pin it.

- ❌ "Keep it on the windowsill" — the Maker chooses their own storage location.
- ❌ "Nitrile gloves" — when "protective gloves" would do.
- ❌ "Dacron upholstery wadding" — when "upholstery wadding" would do.
- ❌ "A small tin for the windowsill" → just "One small tin".
- ❌ Brand-specific tools when category-generic would work.
- ✅ Pin specificity ONLY when it materially affects the outcome (e.g. "conventional °C not fan", "weights in grams not cups", "lye not soda crystals").

If a specific material genuinely is required, explain why and offer the closest reasonable substitute. Don't ship unfamiliar brand or material names without a one-line explanation.

**Word precision per category — HARD RULE (added 2026-05-19).**

Each category has its appropriate verb. Don't borrow another domain's word.

- Cooking → "cooking" (and "preparing", "making", "preserving" where appropriate)
- Baking → "baking" (and "proving", "shaping", "mixing")
- Natural home → "making" (NOT "cooking" — soap is made, not cooked, even if there's heat involved)
- Sewing → "sewing", "stitching", "making"
- Knitting / crochet → "knitting", "crocheting", "working", "making"
- Pottery → "throwing", "hand-building", "firing", "making"
- Mindset → "practising", "doing", "working with" — NOT "exercising" (gym connotation), NOT "performing"
- Garden → "growing", "sowing", "planting", "harvesting"
- Home & repair → "building", "repairing", "fixing", "working"
- Sustainability → context-specific
- Animals & smallholding → "keeping", "raising", "tending"

"Batch cooking" in natural home is wrong. "Batch making" is right.

**Glossary coverage — strengthened (extended 2026-05-19).**

Every entry in Tutorial.glossaryTerms[] must appear inline at least once wrapped in `glossaryTooltip` mark per existing `feedback_inline_glossary_coverage.md`. Strengthening:

- Every domain-specific term in the body must be EITHER in plain English OR wrapped in a tooltip that actually explains it. No unflagged jargon.
- Tooltips must explain the term in plain English. "Pullet" with an empty tooltip is broken. "Pullet" with "A young hen, typically under one year old" is correct.
- The author prompt rejects any draft where: (a) a domain term appears unflagged, or (b) a glossaryTerms entry has an empty / unhelpful tooltip definition.

**Sensible time units — HARD RULE (added 2026-05-19).**

Time durations must read at the right scale for the duration.

- Under 48 hours: hours only ("45 minutes", "6 hours", "36 hours")
- 48 hours to 7 days: days + hours ("3 days, 4 hours" — only when hours add meaningful precision; otherwise just days)
- 7 days to 28 days: days only ("14 days") — never hours
- Over 28 days: weeks + days ("4 weeks, 2 days") — never hours

"1009 hours" is unreadable. "6 weeks" is readable. The renderer / author must convert.

**Orientation before depth — HARD RULE (added 2026-05-19).**

Every tutorial must open with a plain-English orientation paragraph BEFORE diving into domain terminology. The reader might never have done this craft before.

- Bad: "Inspecting a beehive in summer. Smoke the entrance, lift the crown board, check each frame for queen cells and supersedure signs."
- Good: "A beehive inspection in summer means opening the hive to check the bees are healthy, have space to grow, and aren't preparing to swarm. You'll need a smoker (which calms the bees), a hive tool (to ease apart frames stuck with propolis), and protective clothing. Smoke the entrance, lift the crown board, then check each frame for queen cells and supersedure signs."

Locked tutorial shape:
1. **Orientation paragraph** — plain English: what this is, why you'd do it
2. **What you need** — tools + materials, with tooltips on first use of any domain term
3. **The practice / steps** — the craft itself, ordered
4. **Close** — forward action (what to do next, or how to come back to this)

**Consistent formatting across categories — HARD RULE (added 2026-05-19).**

Troubleshooter sections, "How it adapts" sections, sources sections, supplies cards — same TipTap block type across every category. Each category's author prompt references the canonical block schemas, not local variants. If a category's author prompt has invented its own block shape, fix it to use the canonical one.

**Pre-publish:** for any non-trivial published copy, run the Section 6b checklist (search for banned phrases/openers, count em dashes, check for negation patterns, check opening and ending).

**Scope:** the full anti-AI rule set (Section 6b) is the gold standard for any text Homemade users will see (tutorials, marketing, microcopy, emails). For internal text (dev chat with Rebecca, code comments, commit messages, PR descriptions, internal docs) the bar is lower but the **banned-phrase list still applies**. Specifically these are banned even in dev chat: "honest"/"honestly"/"to be honest"/"I'll be honest", "frankly", "truthfully", "genuinely" (as filler), "delve into", "at its core", "tapestry of", "a testament to", "a beacon of", "treasure trove", "game-changer", "navigate the complexities". They're tics regardless of audience. The "honest" word is the most flagged: it implies the rest is dishonest, which is weird and undermining. Cut it always.

The em-dash, negation-pattern, and conclusion rules are good-writing principles too — apply them in dev chat where they help — but they're guidance, not hard rules in that register.
