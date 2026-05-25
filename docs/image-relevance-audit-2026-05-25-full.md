# Image relevance audit — 2026-05-25

Source queue: `C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/pedantic-taussig-b5bb26/docs/image-relevance-queue-all.json`
Verdicts: `C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/pedantic-taussig-b5bb26/docs/image-relevance-verdicts-all.json`
Scored: **2390** (unscored in queue: 2)

## Overall

| Tier | Count | Share |
|------|------:|------:|
| EXACT | 599 | 25.1% |
| PARTIAL | 781 | 32.7% |
| WRONG | 1010 | 42.3% |

## Per category

| Category | Total | EXACT | PARTIAL | WRONG | WRONG% |
|----------|------:|------:|--------:|------:|-------:|
| cooking | 1137 | 318 (28%) | 372 (32.7%) | 447 (39.3%) | 39.3% |
| baking | 572 | 166 (29%) | 146 (25.5%) | 260 (45.5%) | 45.5% |
| fibre-arts | 127 | 15 (11.8%) | 50 (39.4%) | 62 (48.8%) | 48.8% |
| home-repair | 83 | 12 (14.5%) | 29 (34.9%) | 42 (50.6%) | 50.6% |
| paper-word | 82 | 13 (15.9%) | 24 (29.3%) | 45 (54.9%) | 54.9% |
| animals-smallholding | 82 | 17 (20.7%) | 39 (47.6%) | 26 (31.7%) | 31.7% |
| sustainability | 82 | 15 (18.3%) | 27 (32.9%) | 40 (48.8%) | 48.8% |
| wood-natural-craft | 80 | 10 (12.5%) | 29 (36.3%) | 41 (51.3%) | 51.3% |
| natural-home | 42 | 15 (35.7%) | 19 (45.2%) | 8 (19%) | 19% |
| herbal-medicine | 42 | 9 (21.4%) | 26 (61.9%) | 7 (16.7%) | 16.7% |
| pottery-ceramics | 42 | 2 (4.8%) | 13 (31%) | 27 (64.3%) | 64.3% |
| mindset | 19 | 7 (36.8%) | 7 (36.8%) | 5 (26.3%) | 26.3% |

## Per source

| Source | Total scored | WRONG | WRONG% |
|--------|-------------:|------:|-------:|
| pixabay | 1194 | 731 | 61.2% |
| wikimedia | 250 | 78 | 31.2% |
| flux-schnell | 162 | 36 | 22.2% |
| pexels | 620 | 136 | 21.9% |
| unsplash | 164 | 29 | 17.7% |

## Lenient-rubric disagreements

114 tutorials had Media.verificationStatus = VERIFIED (passed the existing 2-tier rubric) but the strict relevance scorer marked them WRONG or PARTIAL. This is the volume of subject-mismatch that the existing rubric let through.

| Tutorial | Category | Relevance | Reason |
|----------|----------|-----------|--------|
| air-fryer-aubergine | cooking | PARTIAL | Roasted aubergine halves with caramelised browning, but no obvious miso glaze that defines… |
| air-fryer-cauliflower | cooking | PARTIAL | Plate of cauliflower with broccoli and carrot dusted in paprika — right vegetable and spic… |
| air-fryer-chips | cooking | PARTIAL | French-fry style chips with ketchup — chips/fries class but skinny shoestring rather than … |
| air-fryer-roast-carrots | cooking | PARTIAL | Mixed roast root vegetables (carrots, parsnips, beetroot) — carrots present but mixed, not… |
| apple-turnovers | baking | PARTIAL | Pile of sugar-coated half-moon hand pies that could be apple turnovers, but no apple filli… |
| avocado-bacon-chicken-salad | cooking | PARTIAL | A salad with grilled chicken and vegetables — right class (chicken salad) but no clear avo… |
| baked-brown-sugar-chicken-wings | cooking | PARTIAL | A tray of baked seasoned chicken pieces — looks more like chicken breasts than wings, and … |
| banana-crisps | cooking | PARTIAL | Image shows grilled/fried plantain slices on trays — banana-family but cooked plantain str… |
| beef-bourguignon | cooking | PARTIAL | Bowl of generic brown beef and root-vegetable stew with bread — a beef stew of the right c… |
| beef-enchiladas | cooking | PARTIAL | Plate of enchiladas under a pale cheese/cream sauce with rice and refried beans — enchilad… |
| beef-goulash | cooking | PARTIAL | Bowl of red tomato-based beef stew — reads more tomato-ragu than paprika-orange Hungarian … |
| beef-stew-with-herb-dumplings | cooking | WRONG | Bowl of green herby Caribbean-style soup with potato chunks — not a brown beef stew, and n… |
| best-french-toast | cooking | WRONG | Croque-madame style stack with ham, melted cheese and a fried egg on toast — a different F… |
| bircher-muesli | cooking | PARTIAL | Bowl of oats/granola with yogurt and fresh berries — reads more like a granola breakfast b… |
| boozy-irish-cream-cheesecake | cooking | PARTIAL | Shows a chocolate mousse-like dessert slice with biscuits and gypsophila; right class (cho… |
| caramelised-biscuit-truffles | cooking | PARTIAL | Chocolate-covered round candies on yellow background look truffle-shaped with biscuit cent… |
| cassoulet | cooking | PARTIAL | Bowl of brown beans in broth with white bread on a homely table — bean stew in spirit, but… |
| celeriac-and-apple-soup | cooking | PARTIAL | Bowl of pale cream soup topped with croutons and dill — right class of soup but no clear c… |
| cheddar-broccoli-rice-cups | cooking | PARTIAL | Two small ramekins of cheesy rice / pasta with broccoli — the right ingredient mix but ren… |
| chermoula-sea-bass | cooking | PARTIAL | Pan-seared sea bass fillet plated with vegetables and potatoes but no visible chermoula gr… |
| chicken-bhuna | cooking | PARTIAL | Whole spiced chicken leg in a runny sauce on a plate, not the dry-fried cut-up chicken in … |
| chicken-chasseur | cooking | PARTIAL | Chicken with mushrooms on a pale, creamy noodle-like base — missing chasseur's tomato-and-… |
| chicken-tagine-with-preserved-lemon | cooking | PARTIAL | Braised chicken in a dish with lemon slices, herbs, and small orange globes that may be ol… |
| chocolate-eclairs | baking | PARTIAL | Two choux fingers (éclairs) with pale cream/white icing and meringue dots, not the chocola… |
| chocolate-layer-cake | baking | PARTIAL | Two-layer chocolate sponge topped with caramel/dulce de leche and fresh berries — chocolat… |
| cinder-toffee-ice-cream | cooking | PARTIAL | Ice cream slab with golden caramel/toffee sauce and crunchy pieces — looks ice-cream-with-… |
| cinnamon-bun-overnight-oats | cooking | PARTIAL | Bowl of yogurt with oats and sliced strawberries — oat-and-cream class, but no cinnamon-bu… |
| clam-chowder | cooking | PARTIAL | Mirepoix with bacon in a pot with liquid being poured in — the chowder base in progress bu… |
| classic-brownies | cooking | PARTIAL | Square chocolate cake with walnuts on top — brownie-class but lacks the fudgy texture and … |
| cookies-cream-cookies | cooking | PARTIAL | Pale puffy cookies dusted with icing sugar — cookies, but no visible crushed dark biscuit … |
| cornbread | cooking | WRONG | Hands serving a Romanian-style polenta/mămăligă cake outdoors with cheese — not American S… |
| courgette-parmesan-crisps | cooking | PARTIAL | Plate of golden, cheese-flecked crisps with sage — they look like parmesan crisps but no c… |
| cream-tea-scones | baking | PARTIAL | Close-up of fruit/cranberry scones — they are scones with a golden crust but studded with … |
| creamy-bacon-and-mushroom-pasta | cooking | PARTIAL | Plate of fettuccine with what look like sliced mushrooms, grated cheese and parsley — past… |
| crispy-baked-shoestring-sweet-potato-fries | cooking | PARTIAL | Roasted sweet-potato wedges with rosemary — sweet potato cooked in oil and salt, but wedge… |
| custard-tart-english | baking | PARTIAL | Pastéis de nata-style puff-pastry custard tarts with charred tops — the Portuguese custard… |
| double-chocolate-peppermint-cookies | cooking | PARTIAL | Chocolate-dough crinkle cookies dusted in icing sugar — chocolate cookies but no peppermin… |
| duck-a-lorange | cooking | PARTIAL | Whole roasted duck on a glass plate — duck is correct but no orange glaze or fruit garnish… |
| extra-crispy-chicken-wraps | cooking | PARTIAL | Image shows chicken-filled wraps on a plate but the chicken lacks the visible crispy bread… |
| flatbreads-yeasted | baking | PARTIAL | Image shows pale rounds on a parchment sheet that look like flatbread dough or lightly bak… |
| french-lentil-soup | cooking | PARTIAL | Lentil soup with carrots and herbs but with chunks of meat — looks more like a German Lins… |
| fudgy-vegan-cookies | cooking | PARTIAL | Chocolate-chip cookies arranged around the word COOKIES in flour — cookies of the right cl… |
| gazpacho | cooking | PARTIAL | Cup of tomato-red liquid with tomatoes and mint beside it — could be gazpacho but reads mo… |
| giant-chocolate-cornflake-cookies | cooking | PARTIAL | Stacked cookies with melted-chocolate fissures — cookies of the right family but no visibl… |
| gingerbread-loaf-dark | baking | PARTIAL | Sliced wholemeal/brown loaf on a board with butter, not the dark treacle-coloured gingerbr… |
| gouda-quesadillas-with-caramelised-apple | cooking | PARTIAL | Cheese quesadillas on a plate with chips and salad — quesadilla class but no caramelised a… |
| grilled-caesar-salad | cooking | PARTIAL | A bowl of Caesar-style salad with chicken, lettuce, croutons and dressing — Caesar salad c… |
| gumbo-with-chicken-and-andouille | cooking | PARTIAL | Chicken with carrots and potatoes in a brown gravy — a chicken stew but missing the charac… |
| ham-and-cream-cheese-wraps | cooking | PARTIAL | A tortilla wrap on a board with cream cheese spilling out, but ham is not clearly visible … |
| honey-garlic-glazed-salmon | cooking | PARTIAL | Grilled salmon fillet plated with vegetables and butter sauce, but no honey-garlic glaze v… |
| _… 64 more in .json_ |  |  |  |

## Samples per tier per category

### mindset

**EXACT**

- `how-rituals-work` — How rituals work
  - source: unsplash, existing: UNVERIFIED, confidence: 0.8
  - reason: Person carrying a flower-and-offering tray on their head in a smoky street procession, an actual ritual being performed, which matches a reference article on how rituals work.
  - image: https://media.homemade.education/tutorials/mindset-editorial/bc0baff5-0d47-41aa-a44e-fb01bca463a5.jpg
- `body-scan-for-sleep` — Body scan for sleep
  - source: unsplash, existing: UNVERIFIED, confidence: 0.9
  - reason: Woman lying peacefully on her side in a bed of white sheets, eyes closed, in soft window light — directly evokes a wind-down body scan used in bed before sleep.
  - image: https://media.homemade.education/tutorials/mindset-editorial/de3c40d3-8d2d-484c-b466-de19ca389eed.jpg
- `the-deposit-coin` — The deposit coin
  - source: unsplash, existing: UNVERIFIED, confidence: 0.85
  - reason: A single gold coin standing on edge in moody bokeh lighting, which is the literal manifestation object the tutorial centres on (the deposit coin).
  - image: https://media.homemade.education/tutorials/mindset-editorial/c4daae1f-d966-4461-b18d-70b680d3aa72.jpg
- `journal-prompts-as-practice` — Journal prompts as practice
  - source: unsplash, existing: UNVERIFIED, confidence: 0.9
  - reason: Open blank journal with a sharpened pencil resting across the page — directly shows the journal-prompt practice surface ready for free-writing.
  - image: https://media.homemade.education/tutorials/mindset-editorial/ed437078-e8f7-4569-919b-97afee1a897a.jpg
- `feast-and-famine-journal-prompts` — Feast and famine journal prompts
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Woman in a red dress writing in a journal on her lap outdoors; shows the journaling-practice subject the prompts feed into.
  - image: https://media.homemade.education/tutorials/mindset-editorial/863363bf-4938-4f31-8682-99f49cfc1658.jpg

**PARTIAL**

- `box-breathing-equal-sides` — Box breathing, equal sides
  - source: pexels, existing: UNVERIFIED, confidence: 0.7
  - reason: Man sitting cross-legged with eyes closed and hands in a meditation mudra among cardboard boxes; shows meditation/breathwork generically but not specifically the four-count box-breathing pattern.
  - image: https://media.homemade.education/tutorials/hero-fill/ef178e52-f1bf-40dd-a00b-2a122a645363.jpg
- `i-am-an-investor-in-training-i-am-an-investor` — I Am an Investor in Training. I Am an Investor.
  - source: pexels, existing: UNVERIFIED, confidence: 0.6
  - reason: Sticky notes reading 'START UP' and '1. Find investors 2. Change the world' on a laptop; touches the investor theme but shows a startup-funding tableau rather than the affirmation of personal investor identity.
  - image: https://media.homemade.education/tutorials/hero-fill/20b29553-5c76-49d9-a145-8067b38e0b7b.jpg
- `my-wealth-lifts-the-room-affirmation` — My Wealth Lifts the Room
  - source: pexels, existing: UNVERIFIED, confidence: 0.6
  - reason: Two businessmen laughing, one fanning out $100 bills with feet on the desk; gestures at wealth/money but the tone is showy money rather than the generous-presence wealth identity in the affirmation.
  - image: https://media.homemade.education/tutorials/hero-fill/88369901-eee8-4f7f-acbf-2d22887ed7c7.jpg
- `i-am-allowed-to-want-this` — I am allowed to want this
  - source: flux-schnell, existing: UNVERIFIED, confidence: 0.7
  - reason: Generic serene scene of hand on an open book with a candle — mindset-class mood image, not the specific energy-statement practice.
  - image: https://media.homemade.education/tutorials/mindset-editorial/410873df-f219-4d74-9e0e-6596d5debc0a.jpg
- `the-calm-and-safe-money-reset` — The Calm & Safe Money Reset
  - source: flux-schnell, existing: UNVERIFIED, confidence: 0.55
  - reason: Image shows a woman reading with a candle in a calm setting, evocative of a mindset ritual but not the specific money reset practice.
  - image: https://media.homemade.education/tutorials/mindset-editorial/26fa30d3-bf26-40dd-8cc6-578dee9ee281.jpg

**WRONG**

- `4-7-8-breath-four-rounds` — 4-7-8 Breath: Four Rounds
  - source: pexels, existing: UNVERIFIED, confidence: 0.75
  - reason: Woman in a white prayer hijab with hand on cheek looking thoughtful against a plain backdrop; no breath, sleep, or counted-breathing cue visible.
  - image: https://media.homemade.education/tutorials/hero-fill/3421446c-be58-4461-aa7a-dd84c853e30f.jpg
- `how-eft-tapping-works` — How EFT tapping works
  - source: unsplash, existing: UNVERIFIED, confidence: 0.95
  - reason: Clinical EEG-style electrode headset being fitted to a person's head — not EFT finger tapping.
  - image: https://media.homemade.education/tutorials/mindset-editorial/8ca6e2d4-f629-4770-84ae-240749b557a9.jpg
- `how-energy-statements-work` — How energy statements work
  - source: unsplash, existing: UNVERIFIED, confidence: 0.98
  - reason: Scrabble tiles spelling HOW TEAMWORK — keyword-only overlap, no relation to energy statements.
  - image: https://media.homemade.education/tutorials/mindset-editorial/62b8bb8e-e1f8-414e-9cec-b906d99321c1.jpg
- `tapping-for-daily-money-panic` — Tapping for daily money panic
  - source: flux-schnell, existing: UNVERIFIED, confidence: 0.85
  - reason: A hand resting on an open book by a candle — no EFT tapping points or face/hand tapping action visible.
  - image: https://media.homemade.education/tutorials/mindset-editorial/574f0344-d432-41fc-9bf3-1ea6016e50da.jpg
- `the-loop-that-visits-you-most-journal` — The loop that visits you most
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Image shows a roller coaster mid-loop, not a journalling subject or mental loop in any literal sense.
  - image: https://media.homemade.education/tutorials/hero-fill/3f9b0813-3356-4e0a-bca6-7ab3cc8f3b7f.jpg

### paper-word

**EXACT**

- `copperplate-basic-strokes` — Copperplate, shade and hairline fundamentals
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Sheet of copperplate calligraphy practice with a dip pen and pointed nib visible — directly the pressure-and-release pointed-nib subject of the tutorial.
  - image: https://media.homemade.education/tutorials/hero-fill/4d23af35-4a6f-46f9-83e1-2ba16e3b8457.jpg
- `copperplate-lower-case-alphabet` — Copperplate lower-case alphabet — a to z
  - source: unsplash, existing: UNVERIFIED, confidence: 0.85
  - reason: Sheet with the word 'Copperplate' rendered in flourished copperplate script on a purple ground with white blossoms — shows the named alphabet hand directly.
  - image: https://media.homemade.education/tutorials/hero-fill/e0d277b9-84cd-43f6-84dc-3cc0bc7dacdc.jpg
- `carrageenan-bath-acrylic-marbling` — Carrageenan-bath acrylic marbling
  - source: pexels, existing: UNVERIFIED, confidence: 0.8
  - reason: Swirled orange / pink / green marbled pattern matching the look of acrylic paper marbling.
  - image: https://media.homemade.education/tutorials/hero-fill/25d300aa-e1b3-40be-8491-62a4e5d727f3.jpg
- `case-binding-introduction` — Case binding, how it works
  - source: wikimedia, existing: UNVERIFIED, confidence: 0.8
  - reason: Ornate jewelled / gilt book cover photographed straight-on — a case-bound book cover.
  - image: https://media.homemade.education/tutorials/hero-fill/25079a0a-505c-4aca-8181-a8fc15dc6601.jpg
- `covering-boards-with-paper` — Covering boards with paper
  - source: wikimedia, existing: UNVERIFIED, confidence: 0.9
  - reason: An open book showing both boards cleanly wrapped in a printed floral decorative paper — the named bookbinding technique's result.
  - image: https://media.homemade.education/tutorials/hero-fill/b2a00455-6c66-4aec-b02e-ac6608e387cc.jpg

**PARTIAL**

- `accordion-fold-book` — Accordion fold book
  - source: pexels, existing: UNVERIFIED, confidence: 0.65
  - reason: Folded printed-page paper sculptures on a black background — paper/book material in the right class but presented as art objects rather than a finished accordion-fold codex with covers.
  - image: https://media.homemade.education/tutorials/hero-fill/54b82fd3-e7ba-4203-b512-ca7087359217.jpg
- `ephemera-mounting-techniques` — Ephemera mounting techniques
  - source: pexels, existing: UNVERIFIED, confidence: 0.65
  - reason: Stack of vintage card-stock pieces and aged paper on wood; shows ephemera-style materials in the right class but no mounting onto scrapbook pages is visible.
  - image: https://media.homemade.education/tutorials/hero-fill/c2e5c05e-31ec-456a-916f-ea6982ef0ad0.jpg
- `abaca-fibre-sheet-forming` — Abaca fibre sheet forming
  - source: pexels, existing: UNVERIFIED, confidence: 0.8
  - reason: Image shows raw abaca fibre bundles, not the sheet-forming process or a finished sheet.
  - image: https://media.homemade.education/tutorials/hero-fill/55f80db2-a474-4918-a698-974e64d35fd9.jpg
- `bullet-journal-weekly-spread` — Bullet journal weekly spread
  - source: pexels, existing: UNVERIFIED, confidence: 0.6
  - reason: Hand-lettered bullet-journal page with a 'May' header and weekday columns; right journal style but appears to be a monthly spread rather than a weekly.
  - image: https://media.homemade.education/tutorials/hero-fill/bda9d1f2-66a8-4431-81bb-bdf9ff4be66f.jpg
- `choosing-paper-for-bookbinding` — Choosing paper for bookbinding
  - source: pexels, existing: UNVERIFIED, confidence: 0.65
  - reason: Stack of cloth-bound hardback notebooks/books, related to bookbinding but not showing paper selection.
  - image: https://media.homemade.education/tutorials/hero-fill/95eae1e2-044b-47aa-a0d1-77ae17288224.jpg

**WRONG**

- `spanish-wave-marbling` — Spanish wave marbling
  - source: wikimedia, existing: UNVERIFIED, confidence: 0.95
  - reason: Interior of the Mezquita-Cathedral of Córdoba with red-and-white striped Moorish arches; this is Spanish architecture, not paper marbling, and shows no marbled paper at all.
  - image: https://media.homemade.education/tutorials/hero-fill/a1e02e3a-4891-4806-96ec-930761bea8cc.jpg
- `accordion-fold-zine` — Accordion fold zine
  - source: pixabay, existing: UNVERIFIED, confidence: 0.9
  - reason: Crumpled blank white tissue paper photographed as texture; no folded zine, no panels, no printing.
  - image: https://media.homemade.education/tutorials/hero-fill/701b96d3-6737-4a44-b60c-c0362402c5ca.jpg
- `waterbomb-base` — Waterbomb base
  - source: pixabay, existing: UNVERIFIED, confidence: 0.95
  - reason: 3D-rendered cartoon lightbulb-headed robot character plugging itself into a wall outlet; nothing to do with origami or paper folding.
  - image: https://media.homemade.education/tutorials/hero-fill/d726dfa9-2b6a-4b5d-ad53-6d7acfd4e46d.jpg
- `paper-inclusions-flowers-and-leaves` — Paper inclusions, flowers and leaves
  - source: wikimedia, existing: UNVERIFIED, confidence: 0.95
  - reason: Streetside photo of a commercial building with a 'Tas Paper — Burnie' sign; the keyword 'paper' overlaps but the subject is a corporate building, not papermaking with botanical inclusions.
  - image: https://media.homemade.education/tutorials/hero-fill/49ae7136-6864-47b5-8e3c-43d13d02805d.jpg
- `sewing-on-tapes` — Sewing signatures on tapes
  - source: pixabay, existing: UNVERIFIED, confidence: 0.9
  - reason: Pink dressmaking thread spools, a tape measure, and pink tulle; this is garment sewing with a measuring tape, not signatures sewn onto linen bookbinding tapes.
  - image: https://media.homemade.education/tutorials/hero-fill/fb6542e5-e407-4870-bfdf-6885769e7377.jpg

### animals-smallholding

**EXACT**

- `hand-shearing-a-small-flock` — Hand shearing a small flock
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Person holding blade shears next to a sheep mid-shear with wool falling around it on a wooden barn floor — directly the hand-shearing technique named in the title.
  - image: https://media.homemade.education/tutorials/hero-fill/1e80da05-3002-4162-abc7-26147a793fd3.jpg
- `inspecting-a-beehive-in-summer` — Inspecting a beehive in summer
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Beekeeper in a yellow suit and veil holding a honey frame next to a row of painted hives in summer foliage — directly the summer-hive inspection subject.
  - image: https://media.homemade.education/tutorials/hero-fill/d28453f4-3e46-4e13-a01a-f38d1e846d64.jpg
- `adding-a-honey-super` — Adding a honey super
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Suited beekeeper handling stacked hive boxes (supers) at a colony, exactly the action of adding a super.
  - image: https://media.homemade.education/tutorials/hero-fill/be98ff83-d84c-46f4-af6b-fc3a0c292d3d.jpg
- `breaking-a-broody-hen` — Breaking a broody hen
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Fluffed-up hen sitting tightly on a straw nest, classic broody-hen pose for a breaking-broody tutorial.
  - image: https://media.homemade.education/tutorials/hero-fill/e3a60f91-2e48-4feb-9665-ba70a9327c4a.jpg
- `breeding-management-meat-rabbits` — Breeding management for meat rabbits
  - source: pexels, existing: UNVERIFIED, confidence: 0.8
  - reason: Multiple plump meat-type rabbits in a pen on straw and grass, fitting a meat-rabbit breeding/management tutorial.
  - image: https://media.homemade.education/tutorials/hero-fill/d77b46cb-9ceb-464a-aaca-befe819d0e72.jpg

**PARTIAL**

- `keeping-smallholding-livestock-records` — Keeping smallholding livestock records
  - source: pexels, existing: UNVERIFIED, confidence: 0.7
  - reason: Black ram and a white chicken standing by a wooden shed; the right smallholding livestock class but no records, paperwork, or record-keeping system shown.
  - image: https://media.homemade.education/tutorials/hero-fill/516bfd50-be63-4dc3-8d1d-fd865c516ebe.jpg
- `pre-tupping-ewe-management` — Pre-tupping ewe management
  - source: pixabay, existing: UNVERIFIED, confidence: 0.8
  - reason: Two young lambs nuzzling in a sunny field; right species but the wrong life stage — lambs, not ewes being conditioned before tupping.
  - image: https://media.homemade.education/tutorials/hero-fill/bed3ba21-8eea-411a-a1d1-d0339deaecdb.jpg
- `treating-red-mite-in-a-chicken-coop` — Treating red mite in a chicken coop
  - source: pixabay, existing: UNVERIFIED, confidence: 0.7
  - reason: Five hens and a rooster lined up on a perch; the right poultry class for a coop tutorial but no red mite, no coop treatment, no Dermanyssus shown.
  - image: https://media.homemade.education/tutorials/hero-fill/46bd6f46-3aa8-4ad0-8a45-c145fee867ff.jpg
- `emergency-queen-cell-management` — Emergency queen cell management
  - source: pexels, existing: UNVERIFIED, confidence: 0.65
  - reason: Beekeeper holding a frame covered in worker bees and brood; right hive-inspection class but no queen cells (the elongated peanut-shaped emergency cells) are visible.
  - image: https://media.homemade.education/tutorials/hero-fill/dbe27dc4-0596-405e-9660-fd265ca5d2c7.jpg
- `abattoir-booking-and-movement-paperwork` — Abattoir booking and movement paperwork for pigs
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Two pigs in a pen, no abattoir booking or movement paperwork visible.
  - image: https://media.homemade.education/tutorials/hero-fill/d5bfb863-332a-44b0-b6b9-bc7adbd2c15b.jpg

**WRONG**

- `varroa-mite-count` — Varroa mite count
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Macro of a bright red velvet mite (Trombidiidae) on a green leaf; this is a plant-dwelling mite, not Varroa destructor on bees or in a hive.
  - image: https://media.homemade.education/tutorials/hero-fill/22b42bfd-ccf8-4ea8-8239-cc17ded83536.jpg
- `fitting-electric-poultry-netting` — Fitting electric poultry netting
  - source: pexels, existing: UNVERIFIED, confidence: 0.7
  - reason: Close-up of black square mesh against an orange-red clay surface, reading as a tennis-court fence or sport netting; no electric energiser, posts, or poultry visible.
  - image: https://media.homemade.education/tutorials/hero-fill/5e47edc8-1b43-41d5-842b-a11055ab3b3a.jpg
- `kittens-from-birth-to-weaning` — Kittens from birth to weaning
  - source: pexels, existing: UNVERIFIED, confidence: 0.95
  - reason: Black cat curled around its small black-and-white feline kittens on a sofa; the tutorial is about rabbit kittens (a meat-rabbit doe and her young), not cats.
  - image: https://media.homemade.education/tutorials/hero-fill/be2e6270-345a-404b-86f9-4d7fac871497.jpg
- `autumn-feeding-sugar-syrup-to-bees` — Autumn feeding: sugar syrup for winter stores
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Snowy maple-syrup sugar shack with metal sap buckets hanging on trees in late winter; this is maple sugaring, not autumn sugar-syrup feeding of a beehive.
  - image: https://media.homemade.education/tutorials/hero-fill/131beed7-16a3-48e1-906f-aae3e638760a.jpg
- `building-a-hay-rack-for-livestock` — Building a hay rack for livestock
  - source: pixabay, existing: UNVERIFIED, confidence: 0.95
  - reason: Two pigs sleeping in straw; no hay rack visible.
  - image: https://media.homemade.education/tutorials/hero-fill/8fdc5c98-ac28-4b24-87f1-8ae845d1187a.jpg

### cooking

**EXACT**

- `baked-raspberry-cheesecake` — Baked Raspberry Cheesecake
  - source: pexels, existing: VERIFIED, confidence: 0.92
  - reason: A round mini cheesecake topped with fresh raspberries on a marble board, clearly the finished baked raspberry cheesecake.
  - image: https://media.homemade.education/tutorials/hero-fill/c4bf3f8b-8d7a-49ff-b876-666e093a1ccb.jpg
- `sloppy-joe-s-pasta-bake` — Sloppy Joe’s Pasta Bake
  - source: pexels, existing: VERIFIED, confidence: 0.88
  - reason: A baked penne dish with meat sauce and melted cheese in a white oval baker, clearly a meaty pasta bake matching Sloppy Joe's Pasta Bake.
  - image: https://media.homemade.education/tutorials/verification-regen/9b2c5d21-15c9-4803-bf28-3f13e47f0584.jpg
- `ratatouille` — Ratatouille
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: A close-up of roasted aubergine, courgette, tomato and pepper with herbs, the defining components of ratatouille.
  - image: https://media.homemade.education/tutorials/hero-fill/cd27d8ab-9fed-4aa2-8b52-917dfe642fb8.jpg
- `double-crunch-honey-garlic-chicken` — Double Crunch Honey Garlic Chicken
  - source: pexels, existing: VERIFIED, confidence: 0.85
  - reason: Crispy glazed chicken pieces with visible garlic slices and sesame seeds in a sticky honey-soy glaze, matching honey garlic chicken.
  - image: https://media.homemade.education/tutorials/hero-fill/05855bb7-33f7-446e-9420-da4234144217.jpg
- `adana-kebabi` — Adana kebabı
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Long skewer of grilled minced lamb plated with flatbread, parsley, peppers and onion — the classic Adana presentation.
  - image: https://media.homemade.education/tutorials/hero-fill/3de743c6-8972-4756-ac1a-6ee7c532bb4d.jpg

**PARTIAL**

- `risotto-agli-asparagi` — Risotto agli asparagi
  - source: pixabay, existing: UNVERIFIED, confidence: 0.6
  - reason: A creamy risotto with green vegetable pieces and tomato/parsley flecks, but the green vegetable reads more as courgette than asparagus tips so the specific asparagus dish is not unambiguous.
  - image: https://media.homemade.education/tutorials/hero-fill/d390beed-4fea-4747-acb3-39bcdbdea64e.jpg
- `sada-roti` — Sada roti
  - source: pixabay, existing: UNVERIFIED, confidence: 0.7
  - reason: An oval ridged flatbread that looks like Persian/Turkish barbari rather than the round, plain Trinidadian sada roti the title names.
  - image: https://media.homemade.education/tutorials/hero-fill/805d4319-b031-4a9b-8ec6-8688545d4d1d.jpg
- `acqua-pazza` — Acqua pazza
  - source: pixabay, existing: UNVERIFIED, confidence: 0.85
  - reason: Raw white fish fillets only, no poaching broth or tomatoes that define acqua pazza.
  - image: https://media.homemade.education/tutorials/hero-fill/2199498e-a8c5-4b18-af8b-8fa89320480c.jpg
- `adas-polo` — Adas polo
  - source: pixabay, existing: UNVERIFIED, confidence: 0.85
  - reason: Uncooked basmati rice with tomatoes — raw ingredient, not the cooked Persian lentil-rice dish.
  - image: https://media.homemade.education/tutorials/hero-fill/ad3244fa-26f8-4a3b-bf82-c3925d2ac9ab.jpg
- `air-fryer-aubergine` — Air-fryer aubergine
  - source: unsplash, existing: VERIFIED, confidence: 0.7
  - reason: Roasted aubergine halves with caramelised browning, but no obvious miso glaze that defines the tutorial.
  - image: https://media.homemade.education/tutorials/hero-fill/c9726e5f-433b-49de-a3b4-b9978d43e54d.jpg

**WRONG**

- `patlican-salatasi` — Patlıcan salatası
  - source: pixabay, existing: UNVERIFIED, confidence: 0.85
  - reason: Shows aubergine baked with tomato sauce and melted cheese (parmigiana-style), not the smoked aubergine salad with garlic and lemon named in the title.
  - image: https://media.homemade.education/tutorials/hero-fill/d2fc438d-146a-4c21-bf77-3581eb8689c2.jpg
- `beef-wellington` — Beef Wellington
  - source: pixabay, existing: UNVERIFIED, confidence: 0.95
  - reason: Shows sliced rare beef tenderloin with rosemary on a slate, with no pastry casing or mushroom duxelles, so it is not a Wellington.
  - image: https://media.homemade.education/tutorials/hero-fill/5e484e7d-b0a0-42be-a820-61a3fba1e642.jpg
- `steak-au-poivre` — Steak au Poivre
  - source: pixabay, existing: UNVERIFIED, confidence: 0.85
  - reason: Shows raw red steak with peppercorns and rosemary, not the cooked French pepper steak with brandy cream sauce that defines Steak au Poivre.
  - image: https://media.homemade.education/tutorials/hero-fill/47c3cd24-06f2-45e7-9383-b94e2311e69d.jpg
- `slow-cooker-lentil-bolognese` — Slow-cooker lentil bolognese
  - source: pixabay, existing: UNVERIFIED, confidence: 0.8
  - reason: Shows a chunky lentil and meat stew/soup with potato and carrot, not a tomato-based lentil bolognese sauce.
  - image: https://media.homemade.education/tutorials/hero-fill/e85bf9c9-336f-4fb3-b8ce-43dc687a7050.jpg
- `ackee-and-saltfish` — Ackee and saltfish
  - source: pixabay, existing: UNVERIFIED, confidence: 0.95
  - reason: A worker shoveling sea salt at a salt-pan harvest, not the Jamaican ackee-and-saltfish dish.
  - image: https://media.homemade.education/tutorials/hero-fill/0cf9c0a6-2c6c-40b9-a43c-1ae143d9ff01.jpg

### sustainability

**EXACT**

- `reading-your-water-meter` — Reading your water meter
  - source: pixabay, existing: UNVERIFIED, confidence: 0.95
  - reason: A close-up of a domestic water meter showing the digit dials and rotating indicator, exactly the subject of the tutorial.
  - image: https://media.homemade.education/tutorials/hero-fill/bdca2470-6fb1-4ae7-a85f-878915483d62.jpg
- `calculating-loft-insulation-depth` — Calculating how much loft insulation you need
  - source: unsplash, existing: UNVERIFIED, confidence: 0.85
  - reason: Person in an attic kneeling on installed blown loft insulation between rafters; spot-on for a loft-insulation tutorial.
  - image: https://media.homemade.education/tutorials/hero-fill/e9b1d28d-35f1-4526-85d9-70d2206e2152.jpg
- `choosing-between-solar-pv-and-solar-thermal` — Solar PV vs solar thermal: which to fit
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Tight grid of polycrystalline photovoltaic solar panels — the PV side of the named PV-vs-thermal comparison.
  - image: https://media.homemade.education/tutorials/hero-fill/d8556bd4-5810-419d-8d6a-583128d9fbc6.jpg
- `cold-compost-heap-from-pallets` — Building a cold compost heap from pallets
  - source: unsplash, existing: UNVERIFIED, confidence: 0.85
  - reason: Wooden slatted three-bay compost bins outdoors filled with garden waste — exactly a pallet-style cold compost heap.
  - image: https://media.homemade.education/tutorials/hero-fill/ab7f14ac-ecba-411e-8ad6-1de238707a10.jpg
- `drip-irrigation-from-a-water-butt` — Setting up gravity drip irrigation from a water butt
  - source: pexels, existing: UNVERIFIED, confidence: 0.88
  - reason: Black drip irrigation line laid along the soil beside a pepper seedling — drip irrigation in a vegetable bed.
  - image: https://media.homemade.education/tutorials/hero-fill/af6e15b2-f190-477e-a8e5-0458f26f3ca3.jpg

**PARTIAL**

- `sorting-kerbside-recycling-correctly` — Sorting kerbside recycling correctly
  - source: pixabay, existing: UNVERIFIED, confidence: 0.65
  - reason: Shows bowls of sorted coloured plastic bottle caps, recycling-adjacent imagery but not kerbside-bin sorting or a recycling bin in use.
  - image: https://media.homemade.education/tutorials/hero-fill/a336e2f7-3282-4863-a43b-df6fe33875e0.jpg
- `bokashi-second-stage` — What to do with fermented bokashi waste
  - source: unsplash, existing: UNVERIFIED, confidence: 0.55
  - reason: Person handling green leaves over a metal bucket outside — adjacent food-waste / composting imagery but not fermented bokashi waste being buried.
  - image: https://media.homemade.education/tutorials/hero-fill/919310c3-e3ba-4518-8179-b9d0e55ad13c.jpg
- `cavity-wall-insulation-decision-guide` — Cavity wall insulation: when to fill and when to leave it
  - source: unsplash, existing: UNVERIFIED, confidence: 0.55
  - reason: Painted brick wall close-up — a brick wall is the subject of cavity-wall insulation but no cavity, insulation, or decision-guide content is visible.
  - image: https://media.homemade.education/tutorials/hero-fill/6950895c-f1f5-4103-9f21-fce8d80fa5d2.jpg
- `cistern-displacement-device-install` — Fitting a cistern displacement device
  - source: unsplash, existing: UNVERIFIED, confidence: 0.55
  - reason: Bathroom water-pipe and valve assembly with a meter — plumbing context but not a toilet cistern with a save-a-flush device fitted.
  - image: https://media.homemade.education/tutorials/hero-fill/90419740-24ed-4eb2-a563-094256eafc33.jpg
- `draught-strip-sash-windows` — Fitting draught strip to sash windows
  - source: unsplash, existing: UNVERIFIED, confidence: 0.7
  - reason: Lower portion of a sash window with peeling paint on the sill — sash window is shown but no draught strip or pile seal being fitted.
  - image: https://media.homemade.education/tutorials/hero-fill/cd341af9-84ab-4ca5-8996-e26412f008c5.jpg

**WRONG**

- `compost-in-a-small-garden` — Composting in a small garden
  - source: unsplash, existing: UNVERIFIED, confidence: 0.85
  - reason: Shows bark mulch on the ground with a small mushroom, not a compost bin, compost heap, or vegetable scraps being composted.
  - image: https://media.homemade.education/tutorials/hero-fill/3736928a-e2ad-4a79-a73e-0bda20f82e5d.jpg
- `wood-stove-installation-decision-guide` — Wood stove installation: what the process involves
  - source: flux-schnell, existing: UNVERIFIED, confidence: 0.98
  - reason: Shows a rustic bowl of pale cream/sauce with thyme and a fried egg, completely unrelated to wood stove installation.
  - image: https://media.homemade.education/tutorials/hero-fill/e2851c54-c671-43d4-9ac0-c22a01ccbdca.jpg
- `composting-toilet-decision-guide` — Composting toilets: what the decision involves
  - source: unsplash, existing: UNVERIFIED, confidence: 0.98
  - reason: Shows three white American kerbside post-mailboxes numbered 312/314/316, not a composting toilet.
  - image: https://media.homemade.education/tutorials/hero-fill/34aa74ae-5e13-47f8-941c-36ab1454bfe2.jpg
- `water-hardness-and-scale` — Managing hard water and limescale
  - source: flux-schnell, existing: UNVERIFIED, confidence: 0.9
  - reason: Shows a bowl of milky liquid with a spoon and herbs in a styled flat-lay, not water hardness, limescale, or an appliance affected by scale.
  - image: https://media.homemade.education/tutorials/hero-fill/e441fed2-a6a8-4420-b006-ec7e7ddafaad.jpg
- `draught-sealing-a-letterbox` — Draught-sealing a letterbox
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Shows three exterior American post-mailboxes on a stand in a garden, not a UK letterbox slot being draught-sealed with brush or cover plate.
  - image: https://media.homemade.education/tutorials/hero-fill/0a2e948e-96bb-48b6-9645-24efed40405f.jpg

### baking

**EXACT**

- `pane-di-casa` — Pane di casa
  - source: pixabay, existing: UNVERIFIED, confidence: 0.8
  - reason: A rustic round country loaf with a crisp dusty crust, matching a simple Italian house bread.
  - image: https://media.homemade.education/tutorials/hero-fill/e74d9f5c-16e8-4635-80ed-669d10cde89b.jpg
- `fruit-scones-sultana` — Fruit scones
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Close-up of golden scones studded with dried fruit/currants, matching sultana-studded fruit scones.
  - image: https://media.homemade.education/tutorials/hero-fill/96c4e021-d92e-4d89-8031-ec74d253a538.jpg
- `genoise-sponge-classic` — Génoise sponge
  - source: pexels, existing: UNVERIFIED, confidence: 0.8
  - reason: A plain, light, evenly-risen round sponge cake on a wire cooling rack, matching a Génoise.
  - image: https://media.homemade.education/tutorials/hero-fill/f4ee14b9-d26e-4284-9c34-9ec14d611243.jpg
- `almond-flourless-cake` — Almond flourless cake
  - source: pixabay, existing: UNVERIFIED, confidence: 0.8
  - reason: Close-up of cake top with flaked almonds and golden crust — reads as an almond cake.
  - image: https://media.homemade.education/tutorials/hero-fill/0eeb54b1-99b5-4d67-8bee-3f9b5ffbd52a.jpg
- `amaretti-crisp` — Amaretti, crisp
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Cracked icing-sugar dusted round biscuits on a board — matches crisp amaretti.
  - image: https://media.homemade.education/tutorials/hero-fill/a11ae43c-7628-4e55-b3a2-fbf832a1b717.jpg

**PARTIAL**

- `singin-hinnies-griddle` — Singin' hinnies
  - source: pixabay, existing: UNVERIFIED, confidence: 0.55
  - reason: Close-up of currant-studded rock-cake style bakes, the right class of British currant bake but not the flat griddled hinnie form.
  - image: https://media.homemade.education/tutorials/hero-fill/f008bad1-78bd-4057-9e70-79ccf29add25.jpg
- `marbled-bundt-cake` — Marbled bundt cake
  - source: pixabay, existing: UNVERIFIED, confidence: 0.6
  - reason: A bundt-shaped cake dusted with icing sugar on a wire rack, right cake shape but no visible vanilla/chocolate marble swirl since the top is fully dusted.
  - image: https://media.homemade.education/tutorials/hero-fill/30442b3e-686f-4d0b-807b-f8e1e76e5023.jpg
- `triple-chocolate-brownies` — Triple chocolate brownies
  - source: pexels, existing: UNVERIFIED, confidence: 0.6
  - reason: Dark fudgy chocolate brownies drizzled with chocolate, but only one chocolate type is clearly visible (no obvious milk or white chocolate chunks/swirl).
  - image: https://media.homemade.education/tutorials/hero-fill/163ee01e-8ef7-47a5-8ef4-b425a98939fe.jpg
- `almond-financiers` — Almond financiers
  - source: flux-schnell, existing: UNVERIFIED, confidence: 0.75
  - reason: Almond-style baked goods with icing-sugar dusting, but they are round biscuits / scones, not the small rectangular financier shape.
  - image: https://media.homemade.education/tutorials/hero-fill/a680014b-8131-4a78-b401-7dc392737f3d.jpg
- `american-apple-pie` — American apple pie
  - source: pixabay, existing: UNVERIFIED, confidence: 0.55
  - reason: Image shows a fruit pie being pulled from the oven, consistent with apple pie form but the filling/topping isn't clearly identifiable as apple.
  - image: https://media.homemade.education/tutorials/hero-fill/9a2dde5b-e962-48cb-9188-84f1e8acdbf7.jpg

**WRONG**

- `paris-brest` — Paris-Brest
  - source: wikimedia, existing: UNVERIFIED, confidence: 0.98
  - reason: Shows cyclists at the Paris-Brest-Paris bicycle race, not the choux pastry ring with hazelnut praline cream.
  - image: https://media.homemade.education/tutorials/hero-fill/80df2325-c810-44a9-8702-19cb65abfbdd.jpg
- `damper-australian` — Damper
  - source: pixabay, existing: UNVERIFIED, confidence: 0.98
  - reason: Shows a chrome supercharger with three pink butterfly valves on a car bonnet, the engine 'damper' meaning, not the Australian campfire bread.
  - image: https://media.homemade.education/tutorials/hero-fill/afc20940-d09d-482f-a4a4-bbc6ac26c76b.jpg
- `honeycomb` — Honeycomb
  - source: pixabay, existing: UNVERIFIED, confidence: 0.95
  - reason: Shows a honeybee on a beeswax honeycomb, the insect-and-comb meaning, not the brittle caramel sponge candy 'honeycomb' confection.
  - image: https://media.homemade.education/tutorials/hero-fill/5603c4da-03d6-468c-bbe3-f44a8b530dc5.jpg
- `chocolate-collar` — Chocolate collar
  - source: pixabay, existing: UNVERIFIED, confidence: 0.9
  - reason: Shows broken sheets of nut-studded chocolate bark/bars, not a tempered chocolate band wrapped around a cake.
  - image: https://media.homemade.education/tutorials/hero-fill/d84d2fd7-91c9-4f72-a762-d221c2318747.jpg
- `afghans-biscuits` — Afghans biscuits
  - source: pixabay, existing: UNVERIFIED, confidence: 0.98
  - reason: Portrait of an Afghan man — keyword match only, no biscuits in the image.
  - image: https://media.homemade.education/tutorials/hero-fill/f0521800-4956-4963-ba26-88657afd6593.jpg

### natural-home

**EXACT**

- `coffee-sugar-scrub` — Coffee and brown sugar body scrub
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Woman scrubbing her leg with coarse dark coffee-ground exfoliant taken from a clear jar — unambiguously a coffee body scrub in use.
  - image: https://media.homemade.education/tutorials/hero-fill/3f3b851f-aaf9-4b74-bf37-824737f2849d.jpg
- `lavender-moth-sachet` — Lavender moth sachets
  - source: pixabay, existing: UNVERIFIED, confidence: 0.9
  - reason: Linen/muslin drawstring sachet tied with fresh lavender sprigs against a wooden background — this is a lavender sachet, exactly the named subject.
  - image: https://media.homemade.education/tutorials/hero-fill/4377f0cd-cb67-43d9-aeba-e027f410d402.jpg
- `bath-bombs-fizzing` — Fizzing bath bombs
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Three pastel-coloured spherical bath bombs held in hands above a bathtub edge — clearly bath bombs, the named product.
  - image: https://media.homemade.education/tutorials/hero-fill/0d2a6111-a639-445d-91af-1f8b877aeefa.jpg
- `goats-milk-honey-soap` — Goat's milk and honey soap
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Styled product shot of a goat-milk soap bar with branded honey-themed packaging, a honey jar and a bowl of milk on a wooden board — clearly goat's milk and honey soap.
  - image: https://media.homemade.education/tutorials/hero-fill/02aa7fae-76a5-4cbb-a61b-4bff9849e80f.jpg
- `beeswax-taper-candles` — Rolled beeswax taper candles
  - source: pexels, existing: UNVERIFIED, confidence: 0.95
  - reason: Tall yellow beeswax candles with visible honeycomb-sheet texture — rolled beeswax tapers exactly as named.
  - image: https://media.homemade.education/tutorials/hero-fill/e298db9c-80ae-4a9c-9412-6a8fe72e9845.jpg

**PARTIAL**

- `basic-hand-cream-lotion` — Basic hand cream
  - source: pexels, existing: UNVERIFIED, confidence: 0.65
  - reason: Person dispensing a thin amber liquid (looks like oil) from a pump bottle onto their palm; right class (skin-care application) but reads as a body oil, not the thick oil-in-water hand-cream emulsion named.
  - image: https://media.homemade.education/tutorials/hero-fill/1d93d000-8ea4-4f00-ac48-11fbc337d935.jpg
- `deodorant-paste` — Natural deodorant paste
  - source: pexels, existing: UNVERIFIED, confidence: 0.7
  - reason: Cracked-open coconuts on dark wood; shows a key ingredient (coconut, source of the coconut oil base) but not the deodorant paste itself.
  - image: https://media.homemade.education/tutorials/hero-fill/9c0fb73b-f3e6-40ac-afc6-2cbce85f763e.jpg
- `cold-process-oatmeal-soap` — Cold-process oatmeal soap
  - source: pexels, existing: UNVERIFIED, confidence: 0.75
  - reason: A labelled cold-process bar (organic natural soap with coconut/olive/essential oils) styled with eucalyptus and lavender; right class but no visible oats or oatmeal texture.
  - image: https://media.homemade.education/tutorials/hero-fill/b79aa69a-6af5-41d1-bc80-c21770890792.jpg
- `all-purpose-surface-spray` — All-purpose surface spray
  - source: pexels, existing: UNVERIFIED, confidence: 0.75
  - reason: Person spraying a multi-purpose cleaner bottle on a surface — generic cleaning spray rather than the specific vinegar / tea-tree DIY.
  - image: https://media.homemade.education/tutorials/hero-fill/c8121160-dc24-441a-840d-e656133b9952.jpg
- `bath-salts-lavender` — Lavender bath salts
  - source: pexels, existing: UNVERIFIED, confidence: 0.75
  - reason: Open jar of coarse white salt crystals — right product class but no lavender colour, flowers or labelling visible.
  - image: https://media.homemade.education/tutorials/hero-fill/40319a32-85e2-425a-8c03-ee8a1eb23356.jpg

**WRONG**

- `beeswax-honeycomb-sheet-candle` — Beeswax honeycomb sheet pillar
  - source: pexels, existing: UNVERIFIED, confidence: 0.8
  - reason: Close-up of raw honeycomb texture in a beehive; not a layered honeycomb-sheet pillar candle nor a flat foundation sheet ready for rolling.
  - image: https://media.homemade.education/tutorials/hero-fill/5ce4ec29-de7c-4607-8d1b-cce5ec039275.jpg
- `toilet-cleaning-fizz-tabs` — Toilet cleaning fizz tabs
  - source: pixabay, existing: UNVERIFIED, confidence: 0.9
  - reason: An unrolled white toilet paper roll on a white background — toilet-adjacent but no fizz tabs, no bicarbonate, no toilet bowl.
  - image: https://media.homemade.education/tutorials/hero-fill/fdc438e2-4683-4590-9ade-a36885697bb2.jpg
- `soft-floor-cleaner` — Natural floor cleaner
  - source: pixabay, existing: UNVERIFIED, confidence: 0.85
  - reason: A pump-top hand-soap dispenser on a bathroom sink next to a bathtub; cleaning-adjacent but it is hand soap, not a diluted castile floor cleaner, and no floor is shown.
  - image: https://media.homemade.education/tutorials/hero-fill/6f4be023-86c0-43f5-8df7-f2089d977f1c.jpg
- `arnica-balm` — Arnica muscle balm
  - source: pexels, existing: UNVERIFIED, confidence: 0.97
  - reason: Image shows olives on a branch, not an arnica balm or arnica flowers.
  - image: https://media.homemade.education/tutorials/hero-fill/b9be07c0-a96e-4582-8ed7-5b58feb8dc85.jpg
- `calendula-lip-balm` — Calendula lip balm
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Branded paperboard lip-balm tubes labelled mango, honey-almond, apricot and saffron; none is calendula.
  - image: https://media.homemade.education/tutorials/hero-fill/4ab8fa23-9552-4876-af27-beec7f8788e0.jpg

### fibre-arts

**EXACT**

- `indigo-vat-dyeing-basics` — Indigo vat dyeing basics
  - source: pexels, existing: UNVERIFIED, confidence: 0.95
  - reason: Hands stained dark blue plunging a fabric bundle into a deep-blue vat outdoors — unambiguously indigo vat dyeing in action.
  - image: https://media.homemade.education/tutorials/hero-fill/f595c4e8-b778-4d5b-ad7c-be245aecf993.jpg
- `threading-four-shaft-floor-loom` — Threading and dressing a four-shaft floor loom
  - source: pixabay, existing: UNVERIFIED, confidence: 0.85
  - reason: Close-up of a dressed multicoloured warp on a loom (yellow ground with pink, blue and dark stripes) — the loom is threaded and beamed, exactly the named subject.
  - image: https://media.homemade.education/tutorials/hero-fill/2d707a67-dde9-4e8c-b22b-8b2ae593a7e9.jpg
- `bundled-solar-dyeing` — Bundled solar dyeing
  - source: pexels, existing: UNVERIFIED, confidence: 0.8
  - reason: A tightly bound fabric bundle with rubber bands and undyed cotton yarn beside it; the prep stage of bundle dyeing.
  - image: https://media.homemade.education/tutorials/hero-fill/f5171317-c7c9-4aa5-adde-369d2d15c0ae.jpg
- `dyeing-with-indigo-on-cotton` — Dyeing with indigo on cotton
  - source: wikimedia, existing: UNVERIFIED, confidence: 0.9
  - reason: Folded pile of indigo-blue patterned cotton textiles — indigo on cotton, the named subject.
  - image: https://media.homemade.education/tutorials/hero-fill/669605dc-4af8-44b2-81bc-fe4b32820ace.jpg
- `dyeing-with-onion-skins` — Dyeing with onion skins
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Onions in a clay dish surrounded by yarn balls in gold, bronze, rust and complementary natural-dye colours — classic onion-skin dye demonstration.
  - image: https://media.homemade.education/tutorials/hero-fill/386671c0-d28c-470c-9fe0-facf0b77ebac.jpg

**PARTIAL**

- `spinning-on-a-top-whorl-drop-spindle` — Spinning on a top-whorl drop spindle
  - source: wikimedia, existing: UNVERIFIED, confidence: 0.75
  - reason: Two views of an ancient stone spindle whorl with a measuring scale — it is a spindle whorl artefact but not a top-whorl drop spindle in spinning use.
  - image: https://media.homemade.education/tutorials/hero-fill/34f9b02c-4303-4c20-b648-bb158477ee5e.jpg
- `alternating-square-knot-macrame` — The alternating square knot
  - source: unsplash, existing: UNVERIFIED, confidence: 0.7
  - reason: Macramé-style decorative knots tied in two-colour cord — knotted cord but not specifically an alternating-square-knot lattice.
  - image: https://media.homemade.education/tutorials/hero-fill/600a9331-73a9-458d-9b37-8e0668c40082.jpg
- `alum-pre-mordant-for-wool` — Alum pre-mordant for wool
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Pile of raw wool fibres — named material but no mordanting process or dye-bath visible.
  - image: https://media.homemade.education/tutorials/hero-fill/89004ffe-1b22-4ab7-ab21-a36f99acffea.jpg
- `blending-fibres-on-drum-carder` — Blending fibres on a drum carder
  - source: pexels, existing: UNVERIFIED, confidence: 0.8
  - reason: Hands winding yarn onto a ball winder beside skeins — fibre-arts equipment, but a ball winder and finished yarn rather than a drum carder blending raw fibre.
  - image: https://media.homemade.education/tutorials/hero-fill/c183a1bc-051f-46bb-b148-47dada9bc433.jpg
- `calculating-handspun-yardage` — Calculating handspun yardage
  - source: pexels, existing: UNVERIFIED, confidence: 0.5
  - reason: Hands working in a ledger beside a calculator under lamp light; the act of calculating is right but no spinning, yarn or fibre context.
  - image: https://media.homemade.education/tutorials/hero-fill/50165f54-f788-4180-8f6f-813ccc50ae26.jpg

**WRONG**

- `navajo-ply-from-singles` — Navajo plying (chain plying) from a single cop
  - source: pixabay, existing: UNVERIFIED, confidence: 0.98
  - reason: A slot canyon (Antelope Canyon style sandstone walls) — entirely unrelated to Navajo chain-plying or any spinning technique.
  - image: https://media.homemade.education/tutorials/hero-fill/47a58b90-12b2-450c-a20b-3f3fbfc8475c.jpg
- `cobweb-felt-technique` — Cobweb felt
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: A pile of dense, multi-coloured wet-felted pom-pom beads; right craft family but the opposite of cobweb felt's gauzy single-wisp sheet.
  - image: https://media.homemade.education/tutorials/hero-fill/c5e7c364-3b61-4383-9729-90784462b489.jpg
- `tapestry-butterfly-bobbin` — The tapestry butterfly bobbin
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Four vintage wooden sewing-thread spools of cream, navy, white and orange thread — not the small figure-eight hand-wound butterfly bobbin used in tapestry weaving.
  - image: https://media.homemade.education/tutorials/hero-fill/12430b3f-1fb2-49ac-9b94-a1eb96180a15.jpg
- `shaping-wet-felted-hat-without-block` — Shaping a wet-felted hat without a hat block
  - source: pixabay, existing: UNVERIFIED, confidence: 0.95
  - reason: A manufactured straw boater hat floating in a wheat field — not a wet-felted hat and no shaping over pot/bowl/balloon.
  - image: https://media.homemade.education/tutorials/hero-fill/dd762068-433a-48f2-a526-ff9b184d4b37.jpg
- `macrame-belt` — Macrame belt
  - source: pixabay, existing: UNVERIFIED, confidence: 0.95
  - reason: A manufactured black leather belt with a brass buckle on jeans — a belt but not macrame; no square knots or cotton cord visible.
  - image: https://media.homemade.education/tutorials/hero-fill/9d530af2-7ec6-4838-b5cb-340c882ed896.jpg

### home-repair

**EXACT**

- `fitting-a-door-lock-and-cylinder` — Fitting a mortise lock and euro-cylinder
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Close-up of a euro-cylinder lock barrel with its key inserted, branded HOPPE — this is the euro-cylinder component named in the title.
  - image: https://media.homemade.education/tutorials/hero-fill/a5b5c517-5124-49ea-a09f-a3cfc4ae2ea8.jpg
- `applying-skim-coat-to-plasterboard` — Applying a skim coat to plasterboard
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Wide shot of a wall part-coated with a thin grey-white plaster skim showing trowel strokes and partial coverage — clearly a skim coat in progress.
  - image: https://media.homemade.education/tutorials/hero-fill/8b25f137-8543-4538-b018-625ad4644179.jpg
- `applying-a-second-coat-of-paint` — Cutting in and rolling a wall
  - source: pexels, existing: UNVERIFIED, confidence: 0.92
  - reason: Person holding a paint roller against a taped wall edge, the named cut-in-and-rolling action.
  - image: https://media.homemade.education/tutorials/hero-fill/322b14c0-41b7-4e0f-87f0-2a4f09bd8bb0.jpg
- `filling-a-window-board-gap` — Filling a window-board gap
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Image shows a gloved hand applying acoustical sealant to a window-board joint with insulation in the cavity.
  - image: https://media.homemade.education/tutorials/hero-fill/04db3c04-f602-42eb-be6f-6f38f83efb7c.jpg
- `fitting-a-thermostatic-radiator-valve` — Fitting a thermostatic radiator valve
  - source: pexels, existing: UNVERIFIED, confidence: 0.95
  - reason: Image shows a hand holding a thermostatic radiator valve head against a radiator, matching the TRV fitting subject.
  - image: https://media.homemade.education/tutorials/hero-fill/7c5f037c-0e16-4635-b17d-ca8f3b03e212.jpg

**PARTIAL**

- `cutting-a-housing-joint` — Cutting a housing joint
  - source: pexels, existing: UNVERIFIED, confidence: 0.7
  - reason: Two men sawing through a length of bamboo with a handsaw in a street — wood-cutting adjacent but not the marking, sawing of shoulders and chiselling out of a dado that defines a housing joint.
  - image: https://media.homemade.education/tutorials/hero-fill/1dc2b4a4-f4e1-4b3a-bed8-c3083f90363e.jpg
- `grouting-ceramic-tiles` — Grouting ceramic tiles
  - source: pexels, existing: UNVERIFIED, confidence: 0.75
  - reason: Beige tile adhesive combed in ridges with a notched trowel beside laid tiles and blue levelling clips — tile-laying adjacent but the wrong stage; this is bedding mortar, not grout being pressed into the joints.
  - image: https://media.homemade.education/tutorials/hero-fill/be0e4526-8abd-4ab8-8fe8-233be91e2c9a.jpg
- `applying-a-limewash-finish` — Applying a limewash finish
  - source: pexels, existing: UNVERIFIED, confidence: 0.55
  - reason: Cracked, distressed pale wall surface consistent with a limewashed/lime-plastered finish, but no application action shown.
  - image: https://media.homemade.education/tutorials/hero-fill/4e9d6411-bc64-4d64-b382-5e2fe2d068a7.jpg
- `basic-leather-care-cleaning-and-conditioning` — Basic leather care: cleaning and conditioning
  - source: pexels, existing: UNVERIFIED, confidence: 0.6
  - reason: Person cleaning a car interior with a microfibre cloth — leather seats may be involved but the photo reads as general car detailing rather than the named leather-care subject.
  - image: https://media.homemade.education/tutorials/hero-fill/a85682ca-aa0b-4d08-b837-bb3168e8814c.jpg
- `bleeding-a-radiator` — Bleeding a radiator
  - source: pexels, existing: UNVERIFIED, confidence: 0.7
  - reason: Old cast-iron radiator by a window — the named appliance, but no bleed key, valve detail or water-drip step visible.
  - image: https://media.homemade.education/tutorials/hero-fill/5213a910-1aae-4a97-91b8-180fda6898a0.jpg

**WRONG**

- `using-ptfe-tape-and-jointing-compound` — Using PTFE tape and jointing compound
  - source: pixabay, existing: UNVERIFIED, confidence: 0.98
  - reason: Macro photo of a house fly on a green leaf — entirely unrelated to PTFE tape, jointing compound or BSP fittings.
  - image: https://media.homemade.education/tutorials/hero-fill/28146cac-0287-4291-a7aa-b78ec3852215.jpg
- `understanding-the-consumer-unit` — Understanding the consumer unit
  - source: pixabay, existing: UNVERIFIED, confidence: 0.95
  - reason: Dramatic black-and-white close-up of clay-coated or oil-coated hands cradling something — no consumer unit, no MCBs, no electrical hardware visible.
  - image: https://media.homemade.education/tutorials/hero-fill/bd6afa56-a361-4b77-874f-f8729402a486.jpg
- `sanding-wooden-floors-by-machine` — Sanding a wooden floor by machine
  - source: pixabay, existing: UNVERIFIED, confidence: 0.9
  - reason: A flat wood-plank background texture with no person, no sander and no sanding action visible — wood-adjacent but not floor sanding.
  - image: https://media.homemade.education/tutorials/hero-fill/3c9e242d-d365-41d4-b4ad-7569a0c1f70a.jpg
- `hanging-an-internal-door` — Hanging an internal door
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: A closed white panelled front door dressed with a Christmas wreath, jingle bells and a wooden welcome sign — door shown decoratively but no fitting, planing or hinging.
  - image: https://media.homemade.education/tutorials/hero-fill/d2132a4a-ec8b-4835-b24a-1ae86477adb6.jpg
- `painting-over-mould-and-damp-stains` — Painting over mould and damp stains
  - source: pixabay, existing: UNVERIFIED, confidence: 0.98
  - reason: A massive Icelandic waterfall (Skogafoss-style) with a tiny figure on a black-gravel beach — entirely unrelated to mould treatment or wall painting.
  - image: https://media.homemade.education/tutorials/hero-fill/26bee62e-6775-4ff4-8358-03978cdf833a.jpg

### wood-natural-craft

**EXACT**

- `carved-birch-kuksa` — Carved birch kuksa
  - source: wikimedia, existing: UNVERIFIED, confidence: 0.95
  - reason: Image shows a finished carved birch kuksa with the characteristic hooked handle and hollowed bowl, exactly the named subject.
  - image: https://media.homemade.education/tutorials/hero-fill/7ee10772-ab06-413f-8026-e526e5d2554f.jpg
- `whittled-ash-honey-dipper` — Whittled ash honey dipper
  - source: pexels, existing: UNVERIFIED, confidence: 0.95
  - reason: Image shows a wooden honey dipper with characteristic turned rings dripping honey into a pot, exactly the named subject.
  - image: https://media.homemade.education/tutorials/hero-fill/d114d9fa-9188-4910-bc77-4339a7f67c65.jpg
- `carved-cherry-dessert-spoon` — Carved cherry dessert spoon
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Hands holding a small hand-carved wooden spoon with decorative finial — matches a carved dessert spoon.
  - image: https://media.homemade.education/tutorials/hero-fill/2590dc65-cf43-4985-a604-5c46bf91fad9.jpg
- `carved-sycamore-cheese-board` — Carved sycamore cheese board
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Wooden round serving board with assorted cheeses and grapes — a cheese board in use.
  - image: https://media.homemade.education/tutorials/hero-fill/9894ac33-fd64-4e4d-8ee0-c0a84fb39e25.jpg
- `carved-sycamore-salad-servers` — Carved sycamore salad servers
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Wooden serving spoon and fork (salad-server pair) laid on white linen — exactly the named subject.
  - image: https://media.homemade.education/tutorials/hero-fill/295c40e1-8a62-4401-b493-1a5cbd17f7a5.jpg

**PARTIAL**

- `wood-grain-reading` — Reading wood grain
  - source: pexels, existing: UNVERIFIED, confidence: 0.6
  - reason: Image shows a pair of glasses resting on a dark wooden board; wood is visible but grain direction is not being read or demonstrated.
  - image: https://media.homemade.education/tutorials/hero-fill/522cd450-1bf6-465f-a225-dbdd1454fb93.jpg
- `rush-woven-table-mat` — Rush-woven table mat
  - source: pexels, existing: UNVERIFIED, confidence: 0.55
  - reason: Image shows hands setting a plate on a woven placemat; the mat looks like patterned fabric/woven cloth rather than a twisted-bulrush chequerboard rush mat.
  - image: https://media.homemade.education/tutorials/hero-fill/80bbdcba-c123-4a64-94f4-1602d0e65d63.jpg
- `carved-beech-bread-board` — Carved beech bread board
  - source: pexels, existing: UNVERIFIED, confidence: 0.55
  - reason: Image shows sliced bread on a slatted wooden serving board; it is a bread-serving board but flat-slatted, not the carved beech round with raised rim described.
  - image: https://media.homemade.education/tutorials/hero-fill/65cb1127-facb-400b-b912-a1af5bb859cb.jpg
- `mortise-tenon-oak-picture-frame` — Mortise and tenon oak picture frame
  - source: pexels, existing: UNVERIFIED, confidence: 0.55
  - reason: Image shows a light wooden picture frame with a vase of oak leaves beside it; a frame is present but no mortise and tenon joinery is visible.
  - image: https://media.homemade.education/tutorials/hero-fill/e34acdab-0af3-4ede-acb8-34e1fe526ffa.jpg
- `riven-oak-chair-leg` — Riven oak chair leg
  - source: pixabay, existing: UNVERIFIED, confidence: 0.55
  - reason: Image shows a cut log end-grain with a single radial split — a riven-like split in oak-coloured wood, but it is a tree cross-section, not a shaped chair leg.
  - image: https://media.homemade.education/tutorials/hero-fill/1fe7a082-4cce-4217-b472-3d2328e36044.jpg

**WRONG**

- `carved-cherry-serving-spoon` — Carved cherry serving spoon
  - source: pexels, existing: UNVERIFIED, confidence: 0.95
  - reason: Image shows pasta with a cherry tomato and basil on a metal spoon — a food shot, not a carved cherry wooden serving spoon.
  - image: https://media.homemade.education/tutorials/hero-fill/f256cf98-b201-4e2d-b5e4-e9d4353f37ef.jpg
- `green-wood-stool-leg` — Green-wood stool leg
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Image shows a studio scene with a bar stool draped in fake grapes and a small still-life — a finished mass-produced stool, not a green-wood drawknifed stool leg.
  - image: https://media.homemade.education/tutorials/hero-fill/6acd94ec-c9a3-476f-9b39-fb6f4529bccc.jpg
- `stop-cut-technique` — The stop cut
  - source: pexels, existing: UNVERIFIED, confidence: 0.98
  - reason: Image shows a woman's legs on a wooden beach chair beside a sandal on sand — a holiday scene unrelated to a wood-carving stop cut.
  - image: https://media.homemade.education/tutorials/hero-fill/b50fdd75-e5d2-4f04-88b6-8f91b13e4082.jpg
- `carved-birch-butter-spreader` — Carved birch butter spreader
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Broken baguette with a metal knife and a pat of butter on marble — no carved birch butter spreader.
  - image: https://media.homemade.education/tutorials/hero-fill/5cc15802-e635-483a-b749-1991680cff20.jpg
- `carved-sycamore-egg-cup` — Carved sycamore egg cup
  - source: pexels, existing: UNVERIFIED, confidence: 0.95
  - reason: Two patterned porcelain egg cups holding dyed Easter eggs — ceramic egg cups, not a carved sycamore one.
  - image: https://media.homemade.education/tutorials/hero-fill/c3ecd71a-5a25-4e03-b004-b9bd9fd4d2fe.jpg

### herbal-medicine

**EXACT**

- `how-herbal-infusions-work` — How herbal infusions work
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Image shows a glass jar of red infusion with a mesh tea ball steeping inside and herbs/flowers beside it — the extraction process the tutorial explains.
  - image: https://media.homemade.education/tutorials/hero-fill/6212988f-5834-4d74-942f-c39090bcb4b1.jpg
- `elderberry-profile` — Elderberry
  - source: unsplash, existing: UNVERIFIED, confidence: 0.95
  - reason: Image shows a hanging cluster of black elderberries on red stems with elderberry foliage — clearly identifiable Sambucus nigra, matching the profile subject.
  - image: https://media.homemade.education/tutorials/hero-fill/e096bc51-0e5d-4f1c-a24f-b12335e5f7b8.jpg
- `chamomile-infusion-for-tension-headache` — Chamomile infusion for tension headache
  - source: pexels, existing: UNVERIFIED, confidence: 0.75
  - reason: Hands cupping a glass of water with small daisy-like flowers floating in it — reads as a chamomile infusion.
  - image: https://media.homemade.education/tutorials/hero-fill/70770df4-90e6-4990-8d6d-afd7789d4fd3.jpg
- `garlic-infusion-for-colds` — Garlic and lemon infusion for colds
  - source: unsplash, existing: UNVERIFIED, confidence: 0.8
  - reason: A steaming cup of pale infusion next to garlic bulbs and citrus (limes substituting for lemon) — a garlic-and-citrus warming brew.
  - image: https://media.homemade.education/tutorials/hero-fill/7d899ece-4a39-479a-9e45-d5dd9dc87caf.jpg
- `ginger-profile` — Ginger, herb profile
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Fresh ginger rhizomes prominently displayed in front of ginger-beer crates and spirit bottles — a herb-profile image of ginger.
  - image: https://media.homemade.education/tutorials/hero-fill/cdad14b5-e5bc-4cfc-9f44-2c50fe467606.jpg

**PARTIAL**

- `chamomile-eye-compress` — Chamomile eye compress for tired or irritated eyes
  - source: unsplash, existing: UNVERIFIED, confidence: 0.8
  - reason: Image shows a plate piled with fresh chamomile flowers — the named botanical alone, with no compress or eye preparation visible.
  - image: https://media.homemade.education/tutorials/hero-fill/6629cef9-dbab-47c5-84ce-3c290a56c25b.jpg
- `garlic-honey-for-cold` — Garlic honey for colds
  - source: unsplash, existing: UNVERIFIED, confidence: 0.8
  - reason: Image shows whole garlic bulbs from above with no honey or maceration jar visible — one named ingredient alone.
  - image: https://media.homemade.education/tutorials/hero-fill/840b8913-ff9f-4974-814f-5253acc7c067.jpg
- `calendula-compress-for-minor-wounds` — Calendula compress for minor cuts and grazes
  - source: unsplash, existing: UNVERIFIED, confidence: 0.85
  - reason: Image shows calendula flowers growing in a garden — the named botanical alone, with no compress or wound-care preparation visible.
  - image: https://media.homemade.education/tutorials/hero-fill/a693dc51-979b-4db2-9673-268f10f41e38.jpg
- `lavender-compress-for-insect-bites` — Lavender compress for insect bites
  - source: pixabay, existing: UNVERIFIED, confidence: 0.85
  - reason: Image shows a lavender field at sunset — the named botanical alone, with no compress or bite-care preparation visible.
  - image: https://media.homemade.education/tutorials/hero-fill/8f2e9b48-7714-4b62-89ad-800b7e151b0c.jpg
- `when-not-to-use-home-herbal-remedies` — When NOT to use a home herbal remedy
  - source: flux-schnell, existing: UNVERIFIED, confidence: 0.55
  - reason: Image shows a jar of dried herbs/seeds with sprig and nuts on linen — a generic herbal-preparation flat lay rather than anything depicting red-flag/safety warnings.
  - image: https://media.homemade.education/tutorials/hero-fill/820281c6-1935-4f05-bbf5-d83af03a7dda.jpg

**WRONG**

- `ginger-infusion-for-nausea` — Ginger infusion for nausea
  - source: pexels, existing: UNVERIFIED, confidence: 0.9
  - reason: Image shows commercial ginger-beer gift packs with bottles and raw ginger root on a display table — a product shot, not a homemade ginger infusion.
  - image: https://media.homemade.education/tutorials/hero-fill/2d63fb83-3917-4124-a641-d382a19f8fca.jpg
- `chamomile-profile` — Chamomile
  - source: unsplash, existing: UNVERIFIED, confidence: 0.7
  - reason: Single large white-petalled flower with big yellow disc — an oxeye daisy / Leucanthemum, not Matricaria chamomile.
  - image: https://media.homemade.education/tutorials/hero-fill/bd8e1db4-f524-4be9-a6d4-59888cb13ede.jpg
- `ginger-warming-bath` — Ginger warming bath for aching muscles
  - source: pixabay, existing: UNVERIFIED, confidence: 0.98
  - reason: A ginger-coloured cat sitting on a doorstep — pure keyword overlap on "ginger", nothing to do with a warming herbal bath.
  - image: https://media.homemade.education/tutorials/hero-fill/9ed53677-c80e-4475-b6b9-46671ac5397b.jpg
- `lavender-salt-bath-for-muscle-tension` — Lavender and Epsom salt bath for muscle tension
  - source: pixabay, existing: UNVERIFIED, confidence: 0.9
  - reason: A worker shovelling sea salt at a salt-pan harvest — not an Epsom salt and lavender bath preparation.
  - image: https://media.homemade.education/tutorials/hero-fill/60a4c6e2-59a5-4e06-95dc-e098aee94396.jpg
- `marshmallow-gargle-for-sore-throat` — Marshmallow root gargle for sore throat
  - source: pixabay, existing: UNVERIFIED, confidence: 0.95
  - reason: Macro of orange flower stamens (looks like hibiscus pistil/stamens) — not marshmallow root and not a gargle preparation.
  - image: https://media.homemade.education/tutorials/hero-fill/82473e00-9800-439a-b498-935345e79256.jpg

### pottery-ceramics

**EXACT**

- `hump-moulded-plate-air-dry-clay` — Hump-moulded plate in air-dry clay
  - source: pexels, existing: UNVERIFIED, confidence: 0.78
  - reason: A shallow handmade pottery plate with rustic uneven rim — consistent with a hump-moulded plate.
  - image: https://media.homemade.education/tutorials/hero-fill/5958e3a7-8993-4ae8-af9f-240d361b93f2.jpg
- `wedging-clay-spiral-method` — Wedging clay, the spiral method
  - source: wikimedia, existing: UNVERIFIED, confidence: 0.85
  - reason: Hand kneading a mass of white clay on a patterned surface, wedging in action.
  - image: https://media.homemade.education/tutorials/hero-fill/1832ba59-f60f-438b-a49a-cdc520857064.jpg

**PARTIAL**

- `coil-built-planter-air-dry-clay` — Coil-built planter in air-dry clay
  - source: pexels, existing: UNVERIFIED, confidence: 0.7
  - reason: Image shows hands forming raw clay coils on a workbench — the coil-building technique is visible, but no planter form has been built yet.
  - image: https://media.homemade.education/tutorials/hero-fill/d8564a53-110a-4acb-904c-bd37d33ebbf0.jpg
- `flat-slab-wall-hanging` — Flat slab wall hanging in air-dry clay
  - source: pexels, existing: UNVERIFIED, confidence: 0.5
  - reason: Image shows a wrapped block of clay with brushes, palette knives and a slip dish — pottery materials laid out flat, but no flat slab wall hanging is shown.
  - image: https://media.homemade.education/tutorials/hero-fill/04eef435-b3b5-4bb5-979e-2cefc14ccc3a.jpg
- `incised-name-sign-clay` — Incised name sign in air-dry clay
  - source: pexels, existing: UNVERIFIED, confidence: 0.6
  - reason: Image shows a ceramic street-name plaque (Triq San Duminku) mounted on stone — a ceramic name sign, but the lettering is painted rather than incised into clay.
  - image: https://media.homemade.education/tutorials/hero-fill/bdbf2013-d97c-4617-b504-e9896f79521b.jpg
- `drape-moulded-bowl-air-dry-clay` — Drape-moulded bowl in air-dry clay
  - source: pexels, existing: UNVERIFIED, confidence: 0.7
  - reason: Hands shaping a clay vessel and a clay coil — clay working is the right class but no upturned bowl drape mould visible.
  - image: https://media.homemade.education/tutorials/hero-fill/13187b19-5cd8-450c-bbde-a1be35189cca.jpg
- `joining-clay-score-and-slip` — Joining clay with score and slip
  - source: pexels, existing: UNVERIFIED, confidence: 0.75
  - reason: Pottery wheel with clay and a bucket of slip — clay and slip are present but no actual scoring or joining of pieces shown.
  - image: https://media.homemade.education/tutorials/hero-fill/c166ada1-899e-4f93-a4b1-fe5b569a8cee.jpg

**WRONG**

- `slab-jewellery-dish` — Slab jewellery dish in air-dry clay
  - source: pixabay, existing: UNVERIFIED, confidence: 0.9
  - reason: Image shows a fired ceramic bowl filled with bean sprouts and sauce — a food dish, not a slab-built jewellery dish in air-dry clay.
  - image: https://media.homemade.education/tutorials/hero-fill/e3013e17-20f8-4120-8eef-f99602ffa9a8.jpg
- `slab-vase-air-dry-clay` — Slab-built vase in air-dry clay
  - source: pixabay, existing: UNVERIFIED, confidence: 0.9
  - reason: Image shows a vase being thrown on a potter's wheel with a rib tool — wheel-thrown construction is the opposite of the named slab-built panel assembly.
  - image: https://media.homemade.education/tutorials/hero-fill/553d2dba-3dab-42d9-b327-2829ff0c7fa3.jpg
- `paper-clay-name-plaque` — Name plaque in paper clay
  - source: pixabay, existing: UNVERIFIED, confidence: 0.9
  - reason: Image shows a workshop bench of small wheel-thrown jugs and pots in raw clay — pottery vessels rather than a flat paper-clay name plaque.
  - image: https://media.homemade.education/tutorials/hero-fill/4965da44-2b89-41ea-8764-f9ac3567db07.jpg
- `rolling-a-clay-slab` — Rolling a clay slab
  - source: pixabay, existing: UNVERIFIED, confidence: 0.9
  - reason: Image shows the same bench of small wheel-thrown jugs and pots in raw clay — none of it is a flat clay slab being rolled out.
  - image: https://media.homemade.education/tutorials/hero-fill/03677370-e203-4c42-a39c-89fbdaf7983f.jpg
- `pinch-pot-tea-light-holder` — Pinch-pot tea-light holder
  - source: pexels, existing: UNVERIFIED, confidence: 0.85
  - reason: Image shows a turned dark-wood/burl ball-shaped vessel holding a tealight — wooden, not pinched clay, and with no pierced light-projecting holes.
  - image: https://media.homemade.education/tutorials/hero-fill/d9b905f1-c8fe-431d-9a65-5573b443ebdd.jpg

