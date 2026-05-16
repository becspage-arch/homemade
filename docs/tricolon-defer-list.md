# Tricolon manual-review list — 2026-05-16

The 2026-05-16 cross-category audit flagged tricolon warnings (three parallel items in a row: "X, Y, and Z"). The fixup session attempted a deterministic rewrite but found that almost every flagged tricolon is a content list — ingredients, recipe steps, place names — where dropping the third item would delete real information. This file dumps every match with surrounding context so a focused manual-review session can decide per-snippet whether to rewrite, split, leave alone, or tighten the voice-check regex itself.

## How to use

- For each snippet decide: **leave** (content list — accept the false positive), **rewrite** (genuine voice tell — drop the third item or break the sentence), **split** (three items genuinely deserve being a numbered list).
- Update the tutorial body via the admin editor (preferred — preserves marks) or via a Prisma update if the change is purely a text-node rewrite.
- Consider tightening `voice-check-lib.ts` `containsTricolon` to exclude recipe-instruction patterns and ingredient lists — that would shrink this list significantly on the next audit run.

---

### `afghan-cookies` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `air-fryer-chips` (cooking) — 1 hit

- **paragraph**
  - `o steam rather than crisp. Maris Piper is the right potato: **floury, high in dry matter, and the reason British chip** shops taste the way they do.`

### `air-fryer-fish-fillets` (cooking) — 1 hit

- **paragraph**
  - ` air fryer are the weeknight alternative to fish and chips: **quicker, less messy, and healthier without sacrificing the** satisfaction of a crisp crust. Serve with oven chips and ta`

### `air-fryer-french-fries` (cooking) — 1 hit

- **paragraph**
  - `potato}} peeled potatoes into even strips, about 1 cm wide. **Put in a bowl, cover with cold water, and leave for** 10 minutes. Drain and rinse under cold running water until `

### `air-fryer-roast-potatoes` (cooking) — 1 hit

- **paragraph**
  - `eled and cut into walnut-sized chunks. Par-boiled in salted **water for ten minutes, drained, and shaken hard in the** colander to rough the surfaces into fluffy edges. Tossed wi`

### `air-fryer-salmon` (cooking) — 1 hit

- **paragraph**
  - `Well-done **salmon is opaque throughout, firm, and flakes easily**. Medium salmon has an opaque exterior and a slightly transl`

### `air-fryer-tofu` (cooking) — 1 hit

- **paragraph**
  - `p, so the texture stays visible. It pairs particularly well **with a sesame-ginger dressing, pickled cucumber, and a bowl of jasmine** rice.`

### `albondigas-en-salsa` (cooking) — 1 hit

- **paragraph**
  - `The sauce here **is built on onion, smoked paprika, and tinned tomatoes** — simpler than a long-cooked ragù, thicker and more paprika`

### `american-beef-stew` (cooking) — 1 hit

- **paragraph**
  - `etely tender and the vegetables are soft. Remove the herbs, **taste and adjust seasoning, scatter with parsley, and serve**.`

### `apple-chutney` (cooking) — 4 hits

- **paragraph**
  - `peeled and chopped, simmered with two big onions, sultanas, **cider vinegar, light brown sugar, and a warming spice mix** of mustard seeds, ground ginger, allspice, and a small drie`
  - `ight brown sugar, and a warming spice mix of mustard seeds, **ground ginger, allspice, and a small dried chilli**. Stirred occasionally for 90 minutes until the mixture is t`
- **paragraph**
  - `o jelly bag, no pectin worry, no setting-point thermometer. **Just a heavy pot, patience, and a careful eye on** the bottom of the pan so nothing catches and burns. Vinegar`
- **heading**
  - `**Add the apple, fruit, and vinegar**`

### `apple-pie-double-crust` (baking) — 2 hits

- **paragraph**
  - `than the other (base needs more pastry than the lid). Press **each into a disc, wrap, and refrigerate for** 30 minutes.`
- **paragraph**
  - `ish, leaving overhang. Prick the base all over with a fork. **Line with baking paper, fill with baking beans, and bake for** 12 minutes. Remove the beans and paper and bake for a furth`

### `apple-turnovers` (baking) — 1 hit

- **paragraph**
  - `e with a round-bladed knife until it begins to clump. Press **into a rough rectangle, wrap, and refrigerate for** 20 minutes.`

### `avgolemono-soup` (cooking) — 4 hits

- **paragraph**
  - `ens it into something between a broth and a light custard — **silky, rich, and sharp without any cream**. It is the kind of soup that reads as complicated until you`
- **paragraph**
  - `mines the soup. A good homemade stock from a whole chicken, **boiled with onion, celery, and bay then strained**, gives the best result. Good shop-bought stock works too; a`
- **paragraph**
  - `. Do not boil the soup again — the eggs will curdle. Season **with salt and pepper, scatter with parsley, and serve immediately**.`
- **paragraph**
  - `n approximate but not replicate. It is the soup Greeks make **when someone is ill, when it is cold, and when there is leftover** chicken in the fridge — a dish that covers most of the occa`

### `baba-ganoush` (cooking) — 4 hits

- **paragraph**
  - ` Taste; adjust salt and lemon. The flavour should be smoky, **tangy, garlicky, and creamy in equal measure**.`
- **paragraph**
  - `gin-olive-oil}} of olive oil. Scatter with {{parsley-flat}} **of chopped parsley, the sumac if using, and the pomegranate seeds**. Eat with warm flatbread, raw vegetables, or as part of a m`
- **paragraph**
  - `Baba ganoush is a staple of mezze across Lebanon, **Syria, Jordan, and Palestine**. The Greek and Turkish versions, melitzanosalata and patlıc`
  - `t but vary in finish and seasoning. Serve alongside hummus, **labneh, tabbouleh, and warm flatbread for a** generous summer lunch.`

### `bacon-spaghetti-squash-fritters` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`

### `baked-vanilla-cheesecake` (baking) — 3 hits

- **paragraph**
  - `ard with a biscuit base. The filling is cream cheese, eggs, **soured cream, sugar, and vanilla**, whisked together and baked low and slow until the proteins`
  - ` in common with a no-bake cheesecake set with gelatine; the **baked version is richer, denser, and significantly more satisfying**.`
- **paragraph**
  - `he eggs one at a time, mixing well after each. The finished **batter should be smooth, glossy, and completely lump-free**. Do not over-mix once the eggs are in; excessive mixing inc`

### `banana-bread-loaf` (baking) — 1 hit

- **paragraph**
  - `method is the standard loaf cake approach: melt the butter, **mix with eggs, sugar, and mashed banana**, fold in the sifted dry ingredients, bake. The main failure`

### `banana-oatmeal-smoothie` (cooking) — 2 hits

- **paragraph**
  - `**Add the banana, milk, and cinnamon**, and blend until completely smooth and combined.`
- **paragraph**
  - `**Pour into a glass, serve, and enjoy**!`

### `bangers-and-mash` (cooking) — 1 hit

- **paragraph**
  - `The whole dish hangs on three things: **good sausages, dry mash, and onions cooked properly**. Cheap sausages are mostly rusk and water; they shed liquid`

### `banoffee-pie` (cooking) — 2 hits

- **paragraph**
  - `**Beat the heavy cream, sugar, and vanilla on medium-high speed** in a stand mixer fitted with the whisk attachment until med`
  - `eaks start to form, usually around 3-4 minutes. The whipped **cream should be light, fluffy, and a good consistency for** piping. Be careful not to overbeat to stiff peaks.`

### `battenberg-cake` (baking) — 1 hit

- **paragraph**
  - ` one side of the divided tin. Bake for 25–30 minutes, until **the sponges are golden, spring back when pressed, and a skewer comes out** clean. Cool in the tin for 10 minutes, then transfer to a r`

### `bechamel-the-basic-white-sauce` (cooking) — 6 hits

- **paragraph**
  - `uce. The ingredients fit on one shelf: butter, flour, milk, **salt, white pepper, and a piece of nutmeg**. The whole tutorial is really about three things — the temp`
- **pullQuote.quote**
  - `Béchamel — the most important **of all white sauces, the basis of many, and itself a finished sauce** of great delicacy.`
- **paragraph**
  - `Pour the milk into the small pan over a low heat. If you **have a bay leaf, an onion quarter, and a couple of cloves**, stud the onion with the cloves and drop the lot in. You ar`
- **infoPanel.body**
  - `**Bay leaf, onion, and cloves perfume the milk** while it cools and lift the finished sauce out of the dairy`
- **paragraph**
  - `ok it gently for two or three minutes, stirring constantly. **The paste will loosen, smell biscuity, and stay pale** — a sort of magnolia colour. That is what you want.`
- **paragraph**
  - `alt to taste. Grind in white pepper. Grate a small drift of **nutmeg over the top, stir, and taste again**. Nutmeg is the one classical seasoning that lifts béchamel `

### `beef-enchiladas` (cooking) — 5 hits

- **paragraph**
  - `d enchilada lives on three components: a chilli sauce built **from ancho and cumin, a spiced beef filling, and tortillas that absorb both**. The sauce goes on the bottom of the dish, around the rolls`
  - `ling, and tortillas that absorb both. The sauce goes on the **bottom of the dish, around the rolls, and over the top**. The cheese melts as a blanket across the surface. The whol`
- **paragraph**
  - `Tear the {{ancho-chilli}} **of ancho chillies open, shake out the seeds, and tip into a small** bowl. Cover with boiling water and weigh down with a saucer`
- **paragraph**
  - `Bake for 25 minutes until **the cheese is melted, bubbling, and starting to brown at** the edges. Rest 10 minutes before serving. Scatter with cho`
- **paragraph**
  - `Beef enchiladas are the centre of the Tex-Mex Sunday plate, **served alongside refried beans, rice, and a small heap of** shredded lettuce dressed with lime. The cheese-blanketed Te`

### `beef-goulash` (cooking) — 1 hit

- **paragraph**
  - `{{bay-leaves}} of bay leaves and {{sea-salt-fine}} of salt. **Bring to a simmer, cover, and cook on the lowest** possible heat for 1.5 to 2 hours until the beef is very ten`

### `beef-wellington` (cooking) — 2 hits

- **paragraph**
  - `ute. Slice into thick rounds with a long sharp knife. Serve **with a red-wine jus, mashed potatoes, and a heap of buttered** greens.`
- **paragraph**
  - `Beef Wellington is the British dinner-party finale, **eaten at Christmas, on important anniversaries, and at the kind of** restaurant where the bill arrives in a folded card. The for`

### `beetroot-feta-walnut-salad` (cooking) — 1 hit

- **paragraph**
  - `**A large chopping board, a knife, and a small dry frying** pan for toasting the walnuts.`

### `belgium-waffles` (cooking) — 2 hits

- **paragraph**
  - `**Whisk eggs, melted butter, and vanilla into the yeast** mixture until evenly blended; set aside.`
- **paragraph**
  - `Savoury: skip the sugar in the batter; **top with smoked salmon, cream cheese, and chives**.`

### `berry-smoothie` (cooking) — 1 hit

- **paragraph**
  - `and banana combination is the most common domestic version: **inexpensive, quick, and consistent across seasons in** a way that a fresh fruit version cannot be.`

### `best-french-toast` (cooking) — 1 hit

- **paragraph**
  - `Savoury: skip the sugar in the batter; **top with smoked salmon, cream cheese, and chives**.`

### `bigos` (cooking) — 3 hits

- **paragraph**
  - `ed of itself overnight. The same pot then comes back to the **table on day three, four, and five**, each reheat adding to the depth. Polish hunters carried bi`
- **paragraph**
  - `ge, roughly half and half. Use more than one kind of meat — **pork shoulder, smoked sausage, and a piece of beef** or game work classically. And cook it slowly enough that yo`
- **paragraph**
  - `p in the shredded fresh cabbage and the drained sauerkraut. **Drain the soaked porcini, chop roughly, and add along with their** soaking liquid (strain through a sieve first to leave any g`

### `biscotti-almond` (baking) — 2 hits

- **paragraph**
  - ` double-baking drives out all moisture, producing a biscuit **that is completely dry, hard, and keeps for up to** a month in a tin. The texture is not palatably hard on its `
- **paragraph**
  - `ds, smooth the tops and sides. Bake for 22–25 minutes until **the logs are golden, set, and cracked on top** — they should feel firm when pressed but not completely har`

### `biscuits-and-gravy` (cooking) — 2 hits

- **paragraph**
  - `Heat the oven to 220 °C fan. Whisk {{plain-flour}} of flour **with the baking powder, bicarbonate of soda, and salt**. Rub in {{butter-unsalted}} of cold butter cubes until the `
- **paragraph**
  - `tantly. Simmer for 3–4 minutes until thickened. Season very **generously with black pepper, salt, and cayenne**. Split the warm biscuits and ladle the gravy over. Serve im`

### `boeuf-bourguignon` (cooking) — 7 hits

- **paragraph**
  - `nds good organisation — the browning stages must be done in **sequence and the lardons, beef, and garnish vegetables all need** separate attention. Nothing is difficult, but cutting corne`
- **paragraph**
  - `Heat the oven to 160 °C fan. Pat {{beef-chuck}} **of beef dry, season, and dust with flour**. In a large casserole, render {{lardons}} of lardons over a`
  - `ardons}} of lardons over a medium heat until crisp. Remove. **Increase to high heat, add olive oil, and brown the beef in** batches — 3–4 minutes per side until deeply coloured. Remov`
- **paragraph**
  - `aping the base clean. Add {{beef-stock}} of hot beef stock. **Tie the thyme, bay leaves, and parsley stalks into a** bouquet garni and add it. Return the beef and lardons, cove`
  - ` and parsley stalks into a bouquet garni and add it. Return **the beef and lardons, cover, and transfer to the oven**.`
- **paragraph**
  - `uce is thin, simmer uncovered on the hob for 10–15 minutes. **Taste, adjust seasoning, and scatter with parsley**.`
- **paragraph**
  - `leaner sauce than you can achieve by skimming a hot liquid. **Refrigerate overnight, skim the surface, and reheat gently on the** hob, covered, over a low heat.`

### `borscht` (cooking) — 3 hits

- **paragraph**
  - `leaves}} bay leaves. Season with {{sea-salt-fine}} of salt. **Bring to the boil, reduce the heat, and simmer for** 20 minutes until the potato is tender. Stir in the grated b`
- **troubleshooter.fix**
  - `Add the vinegar **at the very end, taste, and add more as needed**. The soup should have a noticeable acidic edge.`
- **paragraph**
  - `Borscht is the soup of Ukraine, **Poland, Russia, and the Ashkenazi Jewish diaspora**. Each tradition has its own version: Ukrainian borshch is t`

### `bourbon-biscuits` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `bread-sauce` (cooking) — 3 hits

- **paragraph**
  - `**The onion, cloves, and bay leaves are removed** before the breadcrumbs go in: they are there only to flavou`
- **paragraph**
  - `dium-low heat. Simmer for 10 minutes to infuse, then remove **and discard the onion, cloves, and bay leaves**.`
- **paragraph**
  - ` an older English cookery where stale bread was a thickener **of choice for soups, sauces, and puddings**. That it has survived in association with roast chicken and`

### `brioche-loaf` (baking) — 2 hits

- **paragraph**
  - `y mess. Patience produces a loaf with a dark, glossy crust, **a soft, pillowy crumb, and a keeping quality that** plain white bread can't match.`
- **paragraph**
  - `Transfer the dough to **a lightly floured bowl, cover with cling film, and leave at room temperature** for 90 minutes. The dough should increase by about half — i`

### `broccoli-and-stilton-soup` (cooking) — 1 hit

- **paragraph**
  - ` a cheeseboard cheese is particular to British cookery. The **soup appears across gastropubs, farm shops, and home kitchens throughout the** Midlands and beyond. It is an autumn and winter soup: filli`

### `bubble-and-squeak` (cooking) — 2 hits

- **paragraph**
  - `a board and cut into wedges. Scatter with parsley if using. **Serve with fried eggs, leftover cold meat, and a wedge of grilled** tomato.`
- **paragraph**
  - `onion) and rumbledethumps in Scotland (with cheese on top). **Eat with fried eggs, cold ham, and a dollop of HP** sauce, or a spoonful of piccalilli.`

### `buffalo-chicken-wings` (cooking) — 1 hit

- **paragraph**
  - `n-wings}} of wings completely dry. Toss with baking powder, **salt, pepper, and garlic powder**. Arrange on a wire rack over a baking sheet. Bake at 180 °C`

### `buttermilk-fried-chicken` (cooking) — 4 hits

- **paragraph**
  - `, {{cayenne}} of cayenne, and {{garlic}} of smashed garlic. **Add the chicken pieces, turn to coat, and press a sheet of** cling film down so all the meat is submerged. Refrigerate f`
- **paragraph**
  - ` buttermilk, letting most of it drip off. Lay in the flour, **turn, press, and lift back into the** buttermilk for a 5-second dip. Drop back into the flour and`
- **paragraph**
  - `rushed over the cooked pieces while they rest. Korean-style **cuts the chicken smaller, dredges twice, and dresses with a soy-honey-gochujang** glaze after the second fry. For the classic Edna Lewis Virg`
- **paragraph**
  - ` brought from West African cooking traditions and developed **over generations in Virginia, North Carolina, and Georgia kitchens**. The pan-fried, lard-rich version Edna Lewis recorded in th`

### `buttermilk-pancakes` (cooking) — 1 hit

- **paragraph**
  - `er is thick, like double cream that almost holds its shape. **A hot pan, a small ladle, and ninety seconds a side** gives twelve pancakes in twenty-five minutes.`

### `butternut-squash-soup` (cooking) — 4 hits

- **paragraph**
  - ` the squash goes into a hot oven before it goes into a pot. **Roasting drives off moisture, concentrates the natural sugars, and adds colour that no** amount of simmering achieves. Cut the squash into chunks, r`
- **paragraph**
  - `The coconut milk is optional but recommended. It **rounds off the spice, adds creaminess, and balances the squash**'s sweetness. A tin of light coconut milk is enough; full-fa`
- **paragraph**
  - `**A large roasting tin, a large saucepan, and a stick blender are** what you need. If your tin is too crowded, the squash will `
- **paragraph**
  - ` to 200 °C fan. Spread the squash chunks, onion, {{garlic}} **of unpeeled garlic cloves, ginger slices, and chilli** (if using) across a large roasting tin. Drizzle with {{oliv`

### `cacio-e-pepe` (cooking) — 1 hit

- **paragraph**
  - `s the trick test of Roman pasta. Three ingredients, no oil, **no garlic, no cream, and a knife-edge between glossy** sauce and clumped split mess. The temperature of the bowl a`

### `caprese` (cooking) — 1 hit

- **paragraph**
  - ` the one that puts them on a plate and gets out of the way. **The combination of tomato, mozzarella, and basil represents the colours** of the Italian flag, which has been noted often enough to b`

### `caramelised-biscuit-truffles` (cooking) — 1 hit

- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `caramelized-onion-bacon-and-parmesan-risotto` (cooking) — 3 hits

- **paragraph**
  - `**Caramelized Onion, Bacon, and Parmesan Risotto**. The dish belongs to the Italian home-cooking register: str`
- **paragraph**
  - `e is cooked to your liking, stir in the caramelized onions, **crispy bacon, butter, and grated Parmesan cheese**. Mix until everything is well combined, and the cheese and `
- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `carrot-and-coriander-soup` (cooking) — 1 hit

- **paragraph**
  - `in the country by the 1990s. Its appeal is straightforward: **carrots are cheap, plentiful, and sweet**; coriander is the spice that makes an ordinary vegetable fe`

### `cauliflower-cheese-soup` (cooking) — 2 hits

- **paragraph**
  - `0°C). Cut the top off the garlic bulb to expose the cloves. **Drizzle with olive oil, wrap it in foil, and roast for about** 30 minutes or until the cloves are soft and golden. Allow i`
- **paragraph**
  - `t the Cauliflower - On a baking sheet, toss the cauliflower **florets with olive oil, salt, and pepper**. Roast in the preheated oven for 20-25 minutes or until the`

### `chai-spiced-overnight-oats` (cooking) — 2 hits

- **paragraph**
  - `In a large mixing bowl, **whisk together oats, chia seeds, and chai spice**. (See notes for homemade chai spice instructions)`
- **paragraph**
  - `Add **the plain greek yoghurt, your milk of choice, and maple syrup to the** mixture. Mix well to combine.`

### `chana-masala` (cooking) — 1 hit

- **paragraph**
  - `nned}} of drained chickpeas. Pour in 200 ml of water. Stir, **bring to a simmer, partly cover, and cook for** 15 minutes. Crush a third of the chickpeas against the side`

### `cheese-on-toast` (cooking) — 2 hits

- **paragraph**
  - ` pepper if using. Return to the grill for 2–3 minutes until **the cheese is melted, bubbling, and beginning to brown in** patches. Serve immediately.`
- **paragraph**
  - `osition of comfort food made from what is always available: **bread, hard cheese, and a grill**. The Welsh rarebit tradition adds a sauce; cheese on toast `

### `cheese-scones` (cooking) — 1 hit

- **paragraph**
  - ` g of grated mature cheddar tipped in along with a teaspoon **of English mustard powder, a pinch of paprika, and an extra pinch of** salt. Bound with cold milk, patted, stamped, brushed with m`

### `cheese-scones-cheddar` (baking) — 1 hit

- **heading**
  - `**Pat, cut, and top**`

### `cheese-straws` (baking) — 2 hits

- **paragraph**
  - `with cayenne and English mustard powder. It chills briefly, **rolls thin, cuts into strips, and bakes in** 12 minutes. They should be eaten warm, within an hour of ba`
- **paragraph**
  - `ch addition, until it just comes together in a shaggy ball. **Press into a disc, wrap, and chill for** 20 minutes.`

### `cheeseburger` (cooking) — 2 hits

- **paragraph**
  - `**Spread mustard, ketchup, and mayonnaise on the bun**. Add a lettuce leaf, a slice of tomato, the double patty, s`
  - `yonnaise on the bun. Add a lettuce leaf, a slice of tomato, **the double patty, sliced white onion, and pickles**. Serve immediately.`

### `chermoula-sea-bass` (cooking) — 2 hits

- **paragraph**
  - `paste is bold and fragrant — coriander and parsley forward, **with garlic, cumin, and enough chilli to give** it some heat. It goes on the fish and the fish goes into a `
- **paragraph**
  - `oes on almost everything. It is used as a marinade for fish **before grilling or baking, as a dipping sauce, and as a flavouring for** couscous and vegetables. Sea bass takes it well because the`

### `chicken-and-dumplings` (cooking) — 2 hits

- **paragraph**
  - `erwise, melt {{butter-unsalted}} of butter in the casserole **and cook the onion, celery, and carrot for** 6–7 minutes until soft. Add the garlic for 1 minute, scatte`
  - `s, then pour in the stock gradually. Simmer for 10 minutes. **Add the shredded chicken, cream, and peas**. Season well.`

### `chicken-and-mushroom-pie` (baking) — 2 hits

- **paragraph**
  - `it. The filling is made on the hob first of chicken thighs, **mushrooms, leek, and a cream sauce and** left to cool completely before the pastry lid goes on. The `
- **paragraph**
  - `ld water a tablespoon at a time until the dough just holds. **Press into a disc, wrap, and refrigerate for** 30 minutes.`

### `chicken-fajitas` (cooking) — 2 hits

- **paragraph**
  - ` cut into 2 cm strips, marinated for an hour in lime juice, **oil, garlic, and dried spice**. The pan goes on the highest heat until it smokes faintly. `
- **paragraph**
  - `: the sizzling chicken-and-pepper dish, the warm tortillas, **the soured cream, the wedges of lime, and the chopped coriander**. Build each taco at the table.`

### `chicken-gyoza` (cooking) — 1 hit

- **paragraph**
  - `Chicken Gyoza. Japanese home cooking **that trusts the soy, the dashi, and the patience between them**. Adjustable for what you need.`

### `chicken-jalfrezi` (cooking) — 3 hits

- **paragraph**
  - `d down hard in oil until the colour deepens. What separates **jalfrezi is the pepper, the chunked tomato, and the high-heat stir of** the finished dish, which keeps the vegetables with bite and`
- **paragraph**
  - `nion wedges, {{pepper-red}} of red pepper, {{pepper-green}} **of green pepper, the tomato wedges, and the two whole slit** chillies. Pour in 150 ml of water. Stir, cover, and cook fo`
  - `, and the two whole slit chillies. Pour in 150 ml of water. **Stir, cover, and cook for** 5 minutes over medium heat until the peppers are tender but`

### `chicken-noodle-soup` (cooking) — 2 hits

- **paragraph**
  - `r is a different substance from reconstituted stock powder: **golden, unctuously savoury, and full of gelatin from** the bones. It takes patience but not skill.`
- **paragraph**
  - `Chicken legs rather than breast are the right choice. **They have more flavour, more collagen, and survive the long cooking** without drying out. The meat shreds easily after an hour in`

### `chicken-paprikash` (cooking) — 1 hit

- **paragraph**
  - `Return the chicken to the pan, skin side up. **Bring to a simmer, cover, and cook for** 30 minutes until the chicken is tender and pulls easily at `

### `chicken-pesto-pasta-salad` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`

### `chicken-pot-pie` (cooking) — 2 hits

- **paragraph**
  - `kpot. Add the chunked carrot, chunked celery, halved onion, **bay leaves, thyme sprigs, and peppercorns**. Cover with cold water, about 2.5 litres. Bring to a simmer`
- **paragraph**
  - `ther with a knife or a quick pulse. Tip onto a board, press **into a flat disc, wrap in cling film, and chill** 30 minutes.`

### `chickpea-salad-with-lemon` (cooking) — 3 hits

- **paragraph**
  - `This is a pantry salad: **two tins of chickpeas, a lemon, and whatever is in the** vegetable drawer. The dressing does most of the work. Cumin`
- **paragraph**
  - `A colander **to rinse the chickpeas, a knife and board, and a large mixing bowl**.`
- **paragraph**
  - `Add the drained chickpeas, cucumber, **cherry tomatoes, red onion, and parsley to the dressing**. Toss well. Leave for at least 10 minutes before serving so`

### `chilli-con-carne` (cooking) — 1 hit

- **paragraph**
  - ` the British as much as the American home. It is forgiving, **cheap, better the second day, and serves cheerfully from a** pot on the hob without ceremony. Serve over rice with soure`

### `chilli-jam` (cooking) — 1 hit

- **paragraph**
  - `gh and cook, stirring occasionally, for 20–25 minutes until **the jam is thick, glossy, and falls in sheets from** the spoon rather than running in a thin stream. Pour into t`

### `chocolate-eclairs` (baking) — 3 hits

- **infoPanel.body**
  - `ls inflate from steam pressure inside. Opening the door too **early drops the temperature, the shells collapse, and they will not reinflate**. Once deep golden, prop the door open 1 cm with a wooden sp`
- **paragraph**
  - `the pan and cook over medium heat, stirring with a spatula, **until the custard thickens, comes to a boil, and large bubbles pop at** the surface, about 3 minutes. Remove from the heat. Stir in`
- **paragraph**
  - `st — keep beating, it will smooth out. Stop adding egg when **the paste is smooth, glossy, and falls from a lifted** spoon in a thick, slow V-shape. You may not need all the eg`

### `chocolate-hazelnut-stuffed-cookies` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `chocolate-layer-cake` (baking) — 3 hits

- **paragraph**
  - ` for 4 to 5 minutes on medium-high with a hand mixer, until **the mixture is pale, fluffy, and almost double in volume**. This is the creaming method; the air whipped into the butt`
- **paragraph**
  - `ld in with a large spatula in a figure-of-eight motion: cut **down through the centre, scrape the base, and lift over the top**. Stop when no dry streaks remain. Every extra stroke after `
- **paragraph**
  - `Leave the tins on a rack for 10 minutes. **Turn the sponges out, peel off the paper, and leave to cool completely** on the rack before filling. This takes at least 30 minutes;`

### `chocolate-overnight-oats` (cooking) — 2 hits

- **paragraph**
  - `or seed butter will work great in chocolate overnight oats. **Almond butter, sunflower butter, and cashew butter all work** great!`
- **paragraph**
  - `Chocolate chips – Semisweet chocolate chips, **milk chocolate chips, cocoa nibs, and peanut butter chips are** all great options for this recipe. If you want to make thes`

### `christmas-salmon` (cooking) — 1 hit

- **paragraph**
  - `ing the pomegranate molasses, maple syrup, butter, vanilla, **rosemary, salt, and pepper to a boil**. Continue to boil for 4 minutes then remove the pan from th`

### `ciabatta-high-hydration` (baking) — 1 hit

- **paragraph**
  - ` each round. For each round: wet your hand, reach under one **side of the dough, lift it up, and fold it over the** top. Rotate the bowl 90° and repeat until you have come all`

### `cinnamon-roasted-almonds` (cooking) — 1 hit

- **paragraph**
  - `In a large bowl, **stir together the cinnamon, Swerve, and salt**.`

### `cinnamon-roll-smoothie` (cooking) — 1 hit

- **paragraph**
  - `In a blender, blend oats, yoghurt, sugar, almond milk, **cinnamon, vanilla, and banana until smooth**.`

### `clam-chowder` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Add the clam meat only **at the final stage, after the cream, and heat very gently**. Clams become rubbery after prolonged cooking.`

### `classic-brownies` (cooking) — 1 hit

- **paragraph**
  - `ownie is one of the great American contributions to baking: **simple, fast, and deeply satisfying**. The fudgy versus cakey debate is long-settled in home kitc`

### `coffee-and-walnut-cake` (baking) — 2 hits

- **paragraph**
  - `tercream. The ratio is the same of equal weights of butter, **sugar, flour, and eggs and the method** is the creaming method that the Victoria sponge uses. What `
- **paragraph**
  - `salted-butter}} softened butter and {{caster-sugar}} caster **sugar together until pale, very fluffy, and roughly doubled in volume** — about 5 minutes at medium-high speed with a stand or hand`

### `cold-salad-explosion-with-quesadillas` (cooking) — 1 hit

- **paragraph**
  - `Mexican **home cooking trusts heat, citrus, and corn**. The dish hits those notes — adjust the chilli to taste and`

### `coleslaw` (cooking) — 2 hits

- **paragraph**
  - `ed cabbage in a large bowl. Sprinkle over {{sea-salt-fine}} **of salt, toss well, and leave for** 30 minutes. The cabbage will wilt and a pool of water will `
- **paragraph**
  - `form in the 1960s and became one of the most commonly eaten **side dishes at barbecues, picnics, and alongside sandwiches**. The homemade version requires very little effort and is si`

### `confit-de-canard` (cooking) — 2 hits

- **paragraph**
  - `aky salt over every surface, along with the crushed garlic, **thyme sprigs, bay leaves, and cracked black pepper**. Cover and refrigerate for at least 12 hours.`
- **paragraph**
  - `eg, warm the container briefly to melt the surrounding fat, **lift the leg out, scrape it clean, and crisp the skin as** above.`

### `cookies-cream-cookies` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `coq-au-vin` (cooking) — 5 hits

- **paragraph**
  - ` pieces marinated overnight in red wine, browned hard, then **braised slowly with lardons, button mushrooms, and small whole onions**. The sauce reduces and thickens with a knob of beurre manié`
- **paragraph**
  - `**Put the chicken thighs, drumsticks, and breasts in a large** bowl. Pour over {{red-wine}} of red wine and {{brandy}} of `
- **troubleshooter.intro**
  - `Coq au vin trips at three points: **dry breast meat, thin sauce, and grey wine flavour from** a poor bottle. Most problems trace back to one of those.`
- **paragraph**
  - `Coq au vin is better the day after. Cook the full **recipe a day ahead, cool quickly, and refrigerate overnight**. Reheat gently on the hob, covered, with a splash of water `
- **paragraph**
  - `The dish is associated above all with Burgundy, **where the wine, the chicken, and the cuisine all meet**. A dinner of coq au vin with mashed potatoes and the rest o`

### `cornish-pasty` (cooking) — 3 hits

- **paragraph**
  - `tected by a PGI designation that specifies the ingredients, **the shape, the crimping method, and the order in which** the filling goes in. Swede, then potato and onion, then raw`
- **paragraph**
  - `lightly stiff, not sticky. Divide into four equal portions, **flatten into discs, wrap in cling film, and refrigerate for** 30 minutes.`
- **paragraph**
  - `lishes the official ingredients and method. The traditional **insistence on raw filling, specific cuts of vegetable, and top-edge crimping distinguishes the** genuine article from the hundreds of derivatives sold elsew`

### `coronation-chicken` (cooking) — 6 hits

- **paragraph**
  - `icken poached gently in a pan of water with carrot, celery, **onion, bay, and peppercorn until just tender**. The meat is stripped from the bone and cooled, then folded`
  - `lded into a sauce of mayonnaise, soured cream, curry paste, **apricot jam, lemon juice, and a teaspoon of red** wine. Slivered toasted almonds at the end, a scattering of `
- **paragraph**
  - `iginal used a fresh curry paste built from softening onion, **garlic, tomato purée, and curry powder**; modern versions can shortcut that with a tablespoon of mil`
- **paragraph**
  - `he chicken in the stockpot. Add the chunked carrot, celery, **halved onion, bay leaves, and peppercorns**. Cover with cold water — about 2.5 litres. Bring to a gentl`
- **paragraph**
  - `ine}} of salt. Taste; the sauce should sit between curried, **fruity, sharp, and creamy**.`
- **paragraph**
  - `on simplifies both. It belongs to the British summer picnic **basket alongside scotch eggs, pork pies, and a pot of homemade** chutney.`

### `cottage-pie` (cooking) — 1 hit

- **paragraph**
  - ` hard and built into a slow gravy of onion, carrot, celery, **tomato purée, red wine, and beef stock**. A thick mash topping, beaten with butter and milk, forked `

### `courgette-fritters` (cooking) — 1 hit

- **paragraph**
  - `ng ingredients: green onion, garlic, parsley, salt, pepper, **eggs, rice flour, and cheese**. Using your hands or a large spoon, mix thoroughly until we`

### `cowboy-butter-chicken-linguine` (cooking) — 4 hits

- **paragraph**
  - `Season chicken with garlic powder, onion powder, paprika, **cayenne, salt, and pepper**. Cook in olive oil until golden and fully cooked. Set aside`
- **paragraph**
  - `Melt butter in the same skillet, add garlic, chicken broth, **heavy cream, Dijon mustard, and red pepper flakes**. Let it simmer and thicken.`
- **paragraph**
  - `Add chicken and pasta to the sauce, tossing to coat. **Stir in Parmesan, parsley, and lemon juice**. Adjust consistency with reserved pasta water if needed.`
- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`

### `cream-tea-scones` (baking) — 2 hits

- **paragraph**
  - `A good cream tea scone has **a clean horizontal split, a golden top, and a crumb that is** short and tender without being cakey. Three things determin`
- **paragraph**
  - `books appear consistently from the mid-19th century onward, **using rubbed-in fat, a raising agent, and milk or buttermilk**. The cream tea serving convention is associated with the We`

### `creamy-bacon-and-mushroom-pasta` (cooking) — 2 hits

- **paragraph**
  - `Add the broth, Italian seasoning, **lemon juice, flour, and Dijon mustard to the** pan. Give it a good stir (only let it cook for about a minu`
- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`

### `creamy-brie-and-mushroom-risotto` (cooking) — 1 hit

- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `creamy-cheesy-broccoli-soup` (cooking) — 1 hit

- **paragraph**
  - `soup as directed above and allow to cool. Divide into quart **or gallon freezer bags, label, and freeze**. To serve: reheat on stove top or microwave until heated th`

### `crepes` (cooking) — 1 hit

- **paragraph**
  - `Savoury: skip the sugar in the batter; **top with smoked salmon, cream cheese, and chives**.`

### `croque-madame` (cooking) — 1 hit

- **paragraph**
  - `} of hot milk. Simmer for 2 minutes until thick and smooth. **Stir in the mustard, salt, and nutmeg**. Set aside.`

### `cullen-skink` (cooking) — 2 hits

- **paragraph**
  - `properly cured, is poached in milk and water for 8 minutes. **The fish comes out, the milk is reserved, and the soup base is** built in the same pan: butter, finely chopped leek and onio`
- **troubleshooter.fix**
  - `Keep the heat low at the final stage — **fish, cream, and salty milk all benefit** from a gentle warm-through, not a boil.`

### `curry-goat` (cooking) — 3 hits

- **paragraph**
  - ` by Indian indentured workers in the nineteenth century and **remade with Scotch bonnet, allspice, and thyme**. The dish travels through Trinidad, Guyana, and the diaspor`
  - `ury and remade with Scotch bonnet, allspice, and thyme. The **dish travels through Trinidad, Guyana, and the diaspora kitchens of** London, New York, and Toronto. Serve with rice and peas (re`
  - `vels through Trinidad, Guyana, and the diaspora kitchens of **London, New York, and Toronto**. Serve with rice and peas (red kidney beans cooked in cocon`

### `custard-tart-english` (baking) — 1 hit

- **paragraph**
  - `A custard tart is judged by its texture: the **custard should be smooth, creamy, and just trembling in the** centre — not cracked, not grainy, not liquid. The technique`

### `dark-caramel` (baking) — 1 hit

- **paragraph**
  - `is one of the most hazardous things a home cook works with. **It sticks to skin, retains heat, and causes serious burns on** contact.`

### `digestive-biscuits-homemade` (baking) — 1 hit

- **heading**
  - `**Roll, cut, and dock**`

### `double-chocolate-peppermint-cookies` (cooking) — 2 hits

- **paragraph**
  - `Add softened, **unsalted butter, light brown sugar, and granulated sugar to a** large bowl. Cream the butter and sugars with an electric mi`
- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `duck-a-lorange` (cooking) — 1 hit

- **paragraph**
  - `ead thermometer in the thickest part of the leg reads 75°C. **Lift onto a board, tent loosely with foil, and rest for** 20 minutes.`

### `dundee-cake` (baking) — 1 hit

- **paragraph**
  - `many other fruit cakes use. The fruit mix here is lighter : **sultanas, currants, and glacé cherries and the** almond comes from ground almonds in the batter rather than `

### `easiest-ever-slow-cooker-lasagna` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`

### `eggs-benedict` (cooking) — 2 hits

- **paragraph**
  - `h the heat off while you poach the eggs. The eggs are last: **hot, fresh, and drained**, they go straight onto the assembled plate and the sauce go`
- **paragraph**
  - `bowl over a pan of barely simmering water. Add {{egg-yolk}} **of egg yolks, the lemon juice, and white wine vinegar**. Whisk constantly for 3–4 minutes until thickened and ribbo`

### `english-muffins-griddle` (baking) — 3 hits

- **paragraph**
  - `in steams rather than baking, and the crust never develops. **Medium-low heat, a heavy pan, and patience produce a muffin** that is cooked all the way through with a thin, pale-gold c`
- **paragraph**
  - ` mixer with a dough hook for 7 minutes on medium speed. The **dough should be smooth, soft, and only faintly tacky** — it should not leave dough on your palm when you pull your`
- **paragraph**
  - `r dipped in flour, pressing straight down without twisting. **Gather the scraps, re-roll once, and cut further rounds until** the dough is used up. Scatter the fine semolina over a baki`

### `escovitch-fish` (cooking) — 2 hits

- **paragraph**
  - ` tablespoons in the pan. Add {{olive-oil}} of olive oil and **fry the sliced onion, peppers, and scotch bonnet over medium** heat for 3–4 minutes until slightly softened but still with`
- **paragraph**
  - `ation properties, and the dish is eaten fresh the same day. **It appears at breakfast, lunch, and dinner**, and at the roadside stalls that line the Jamaican coastal `

### `family-chocolate-chip-cookies` (cooking) — 2 hits

- **paragraph**
  - `**Sift in the flour, baking powder, and salt**. Fold to combine — stop as soon as the flour disappears.`
- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `fattoush` (cooking) — 4 hits

- **paragraph**
  - `l charred at the edges. Soft bread makes a soggy salad. The **bread goes in last, just before serving, and the whole thing is** eaten immediately.`
- **paragraph**
  - `e the torn lettuce, diced cucumber, halved cherry tomatoes, **sliced radish, parsley, and mint**. Pour over the dressing and toss gently. Add the crispy bre`
- **paragraph**
  - ` distinguishing element: the sourness of sumac is different **from lemon or vinegar, fruitier and more complex, and it is what gives** the salad its characteristic character. Fattoush appears on`
  - `salad its characteristic character. Fattoush appears on the **meze table alongside hummus, tabbouleh, and muhammara**, and is also a popular weekday lunch dish on its own.`

### `fettuccine-alfredo` (cooking) — 1 hit

- **paragraph**
  - `Fill a large mixing bowl with boiling water. Leave for 1 **minute, tip out, and dry**. Cook {{fresh-fettuccine}} of fettuccine in generously salt`

### `fish-and-chips` (cooking) — 2 hits

- **paragraph**
  - ` chips have cooled, gives the chip-shop shatter. The batter **wants to be cold, lumpy, and freshly mixed**; resting it kills the carbonation that gives the puffed she`
- **paragraph**
  - `dusting; tap off the excess. Hold a fillet by the tail end, **dip into the batter, lift, and let the excess run** off for two seconds. Lower the fillet gently into the 190°C`

### `flatbreads-yeasted` (baking) — 1 hit

- **paragraph**
  - `is collection. The dough is a straightforward mix of flour, **yeast, salt, and warm water**; it rests for 30 minutes to let the yeast work and the glut`

### `fondant-covering-layer-cake` (baking) — 1 hit

- **infoPanel.body**
  - `ck to room temperature — condensation forms on the surface, **leaving sticky patches, dull spots, and sometimes colour runs**. Store under a cake dome at room temperature for up to 3 da`

### `french-lentil-soup` (cooking) — 1 hit

- **paragraph**
  - `-oil}} of olive oil in a large saucepan over a medium heat. **Add the onion, carrot, and celery**. Season with salt and cook for 10 minutes until softened. A`

### `french-onion-soup` (cooking) — 1 hit

- **paragraph**
  - `cook for an additional 2-3 minutes. Pour in the beef broth, **chicken broth, Worcestershire sauce, and add the bay leaves** and thyme.`

### `french-toast-casserole` (cooking) — 2 hits

- **paragraph**
  - `In a large bowl, combine eggs, milk, **vanilla extract, cinnamon, and brown sugar**. Whisk mixture and mix well. Pour mixture into the casserol`
- **paragraph**
  - `Savoury: skip the sugar in the batter; **top with smoked salmon, cream cheese, and chives**.`

### `fruit-rollups` (cooking) — 1 hit

- **paragraph**
  - `Forest Fruit Flavor: Try **a blend of cherries, blueberries, and raspberries for a gorgeous** color.`

### `fruit-scones-currant` (baking) — 1 hit

- **paragraph**
  - `raight down without twisting. Place on a lined baking tray. **Gather scraps, pat once more, and cut remaining scones**. Brush the tops with {{whole-milk}} milk for a milk top fin`

### `fudge-vanilla` (baking) — 1 hit

- **paragraph**
  - `rring. Beat vigorously with a wooden spoon for 8–12 minutes **until the fudge thickens, loses its gloss, and becomes lighter in colour** — the moment you notice it is difficult to stir and has tak`

### `fudgy-vegan-cookies` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `garlic-beef-bites-potatoes` (cooking) — 3 hits

- **paragraph**
  - `h paper towels to remove excess moisture. Season with salt, **pepper, garlic powder, and smoked paprika**.`
- **paragraph**
  - `Toss the halved or quartered **potatoes with olive oil, salt, and pepper in a large** mixing bowl. This ensures they are evenly seasoned and read`
- **paragraph**
  - `l bowl, whisk together melted butter, minced garlic, thyme, **rosemary, beef broth, and Worcestershire sauce**.`

### `garlic-butter-chicken-bites` (cooking) — 2 hits

- **paragraph**
  - `lace them in a bowl and sprinkle the flour, basil, paprika, **oregano, salt, and pepper on top**. Toss until all the pieces are well covered with the flour `
- **paragraph**
  - `Add flavor: **Add the remaining butter, minced garlic, and parsley**. Cook for one more minute until the chicken is fully cooked`

### `garlic-butter-salmon-pasta` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`

### `garlic-parmesan-pasta` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`

### `giant-chocolate-cornflake-cookies` (cooking) — 2 hits

- **paragraph**
  - `**In a separate bowl, sift the cocoa powder, and mix in the icing** powder so they are combined.`
- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `gigantes-plaki` (cooking) — 2 hits

- **paragraph**
  - ` gently to coat. Pour the remaining olive oil over the top. **Transfer to the oven, uncovered, and bake for** 45–60 minutes. Check after 30 minutes: if the sauce looks v`
- **paragraph**
  - `Gigantes plaki appears on the Greek **meze table alongside olives, bread, and dips**, or as a main dish on its own with a chunk of feta and a gl`

### `gigot-dagneau` (cooking) — 1 hit

- **paragraph**
  - `Transfer **to a warm board, tent with foil, and rest for** 20 minutes. Place the roasting tin over a medium hob heat. `

### `ginger-biscuits` (baking) — 2 hits

- **paragraph**
  - `Ginger biscuits use a melted-method dough: **butter, golden syrup, and sugar are melted together** before the flour and spice go in. The result is a pliable, `
- **paragraph**
  - `r with a spoon until a soft dough forms. It will be sticky. **Press into a disc, wrap, and refrigerate for** 30 minutes until firm.`

### `gingerbread-loaf-dark` (baking) — 1 hit

- **paragraph**
  - `The mixing method is the melted method: **the treacle, sugar, and butter melt together in** a saucepan, then cool before the eggs and dry ingredients a`

### `gooseberry-jam` (cooking) — 1 hit

- **paragraph**
  - `Gooseberries are one of the best jam fruits: **high in pectin, high in acid, and sharp enough to balance** the large amount of sugar required. Use slightly underripe `

### `gouda-quesadillas-with-caramelised-apple` (cooking) — 1 hit

- **paragraph**
  - `Mexican **home cooking trusts heat, citrus, and corn**. The dish hits those notes — adjust the chilli to taste and`

### `gourmet-grilled-cheese-sandwich` (cooking) — 1 hit

- **paragraph**
  - `two slices of sourdough with sliced camembert cheese. Next, **sprinkle the thyme, lemon zest, and ground pepper over the** camembert slices.`

### `granola` (cooking) — 3 hits

- **paragraph**
  - `The recipe below is the base. Once you know the technique, **adjust the nuts, seeds, and spices to taste**. Dried fruit goes in after baking — it turns leathery if ba`
- **paragraph**
  - `Heat the oven to 150 °C fan. **Put the oats, almonds, and pumpkin seeds in a** large bowl. Mix {{honey}} of honey, {{olive-oil}} of olive `
- **paragraph**
  - `e mid-2000s through food blogs and brunch culture, when the **combination of low effort, long shelf life, and obvious quality over commercial** versions made it one of the most widely made batch-cook rec`

### `grilled-caesar-salad` (cooking) — 4 hits

- **paragraph**
  - `hat of a paste. Add the egg yolks, lemon zest, lemon juice, **dijon mustard, black pepper, and olive oil**; blend until completely incorporated. While the blender or `
- **paragraph**
  - `to prevent it from sticking to the grill. Place the lettuce **on the preheated grill, cut side down, and cook for about** 2 to 5 minutes, or until grill marks form. Flip over and co`
- **paragraph**
  - `3. Cut **the baguette in half, lengthwise, and brush with oil**. Place the bread on hot grill, cut side down, and cook for `
  - `baguette in half, lengthwise, and brush with oil. Place the **bread on hot grill, cut side down, and cook for about** 3 to 5 minutes, or until grill marks form. Flip over and co`

### `guacamole` (cooking) — 1 hit

- **paragraph**
  - `Mex Sunday plate. Its place at the centre of a snack table (**alongside salsa, chips, and a cold drink**) is fixed. The Mexican household version is simpler than th`

### `gumbo-with-chicken-and-andouille` (cooking) — 3 hits

- **paragraph**
  - `e — the whole dish depends on the roux being properly dark. **Use a heavy pan, medium heat, and do not leave the** hob.`
- **paragraph**
  - `late coloured. The moment it is done, add the holy trinity (**onion, celery, and green pepper**) all at once. Stir and cook for 5–6 minutes until soft. Add`
- **paragraph**
  - `ll the meat from the bones, and return the meat to the pot. **Remove the bay leaves, taste, and adjust seasoning**. Serve over white rice with spring onions and parsley.`

### `ham-chive-filo-tartlets` (cooking) — 1 hit

- **paragraph**
  - `Make-ahead: assemble **fully the day before, refrigerate, and bake the morning of**.`

### `harira-soup` (cooking) — 2 hits

- **paragraph**
  - `1 litre of water and season with {{sea-salt-fine}} of salt. **Bring to the boil, reduce the heat, and simmer uncovered for** 25–30 minutes until the lentils have dissolved and the soup`
- **paragraph**
  - `inished soup. Each family has its own version; additions of **flour for extra thickness, beaten egg for richness, and lamb pieces are all** common.`

### `herb-and-parmesan-scones` (baking) — 1 hit

- **heading**
  - `**Pat, cut, and bake**, 12–13 minutes`

### `hob-nobs` (cooking) — 1 hit

- **paragraph**
  - `Add the pulsed oats, flour, baking powder, **baking soda, salt, and cinnamon** (if using) to the bowl with the butter mixture. Stir to com`

### `honey-soy-baked-drumsticks` (cooking) — 1 hit

- **paragraph**
  - `In a small bowl, combine the honey, soy sauce, sesame oil, **garlic, ginger, and a pinch of salt** and pepper.`

### `honey-soy-chicken-with-sauce` (cooking) — 1 hit

- **paragraph**
  - `whisk together vegetable oil, soy sauce, sesame oil, honey, **garlic, ground ginger, and pepper**.`

### `honeycomb` (cooking) — 2 hits

- **paragraph**
  - `Place the sugar, golden syrup / **corn syrup, water, and salt in a large** saucepan (this mixture will expand a lot, so use a large po`
- **paragraph**
  - `**Get the prepared pan, whisk, and spatula ready when the** sugar syrup is close to 300°F. You can use an oven mitt for`

### `hot-chocolate` (cooking) — 1 hit

- **paragraph**
  - `e rather than cocoa powder or sachets is a different drink. **It is thicker, richer, and less sweet**, and the salt and vanilla bring out the chocolate rather th`

### `hot-chocolate-marshmallow-suprise-cookies` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `hungarian-goulash` (cooking) — 1 hit

- **paragraph**
  - `tral Europe with the Habsburg Empire, appearing in Austria, **the Czech lands, Slovakia, and southern Germany in various** versions. The Hungarian original remains the most paprika-f`

### `iced-tea-southern` (cooking) — 1 hit

- **paragraph**
  - `in the same way that tea is the signature drink of Britain: **a default, expected, and regional marker**. The Southern food writer Nathalie Dupree has described it `

### `jambalaya` (cooking) — 4 hits

- **paragraph**
  - `The holy trinity (**onion, celery, and green pepper**) is the flavour foundation. Once the rice and stock go in, `
- **paragraph**
  - `Reduce to medium heat. **Cook the onion, celery, and green pepper for** 5–6 minutes. Add the garlic and all the dried spices for 1 `
  - `k}} of hot stock and add the bay leaves. Bring to a simmer, **stir once, cover tightly, and reduce to the lowest** heat. Cook for 20–25 minutes until the liquid is absorbed. `
  - `s until the liquid is absorbed. Rest covered for 5 minutes, **remove the bay leaves, fluff with a fork, and serve scattered with spring** onions and parsley.`

### `jammy-dodgers` (baking) — 2 hits

- **paragraph**
  - `p as soon as it forms a cohesive dough, or it will toughen. **Press into a disc, wrap, and refrigerate for** 30 minutes.`
- **paragraph**
  - `e of each. Arrange all rounds and lids on the baking trays. **Gather all offcuts, including the window circles, and re-roll**.`

### `kafta-meatballs` (cooking) — 3 hits

- **paragraph**
  - `o balls about 4 cm across — you should get 16–20 meatballs. **Place on a tray, cover, and refrigerate for** 30 minutes.`
- **paragraph**
  - `he spiced minced meat mixture that runs through the cooking **of the Middle East, Central Asia, and the Indian subcontinent under** various names: kofta in India and Pakistan, köfte in Turkey`
  - `ndia and Pakistan, köfte in Turkey, keftedes in Greece. The **Levantine version is lamb-based, heavily herbed, and served with tomato sauce** and flatbread. It appears at Lebanese and Syrian family tab`

### `kedgeree` (cooking) — 2 hits

- **paragraph**
  - `a soft-boiled six minutes. The rice cooks in onion that has **been softened with cumin, turmeric, and a teaspoon of mild** curry powder. The three components meet at the end: rice ti`
- **paragraph**
  - `il porridge eaten across the subcontinent. The Anglo-Indian **re-invention added smoked fish, eggs, and the British breakfast clock**. It belongs to the country-house Saturday morning of Edward`

### `khoresh-fesenjan` (cooking) — 1 hit

- **paragraph**
  - `il disperses into the sauce and turns it from a murky brown **paste into something dark, thick, and glossy**, with a sour-sweet depth that cannot really be described in`

### `kibbeh` (cooking) — 2 hits

- **paragraph**
  - ` filling is a separate mixture: more lamb fried with onion, **allspice, cinnamon, and pine nuts**, drained of its fat, then chilled. The shaping takes the mo`
- **paragraph**
  - `Kibbeh is the showpiece of Levantine cooking, with Beirut, **Damascus, Aleppo, and Palestinian villages all claiming** distinct regional versions. The raw kibbeh nayyeh of Lebano`

### `kleftiko` (cooking) — 1 hit

- **paragraph**
  - `he lamb goes into a parcel of greaseproof paper with lemon, **garlic, potatoes, and oregano**, the parcel gets sealed tightly, and the oven does three an`

### `lamb-bhuna` (cooking) — 3 hits

- **paragraph**
  - `ut that stage the curry tastes raw and watery; with it, the **gravy comes out deep, dark, and clings to the meat**.`
- **paragraph**
  - `poon. Cook for 12 minutes over medium heat, stirring often. **The mixture darkens, the water cooks away, and the oil starts to** puddle around the edges of the pan; this is the bhuna point`
- **paragraph**
  - ` Pour in 400 ml of water. Bring to a simmer, lower the heat **to its lowest setting, cover, and cook for** 60 to 75 minutes until the lamb yields to a fork. Stir ever`

### `lamb-dhansak` (cooking) — 2 hits

- **paragraph**
  - `Dhansak is a layered dish — the lentils and vegetables cook **down to a thick, almost smooth base, and the lamb braises in** that base until falling apart. The tamarind and the sweetne`
- **paragraph**
  - `Dhansak is Parsi community food — made **for Parsi new year, for Sundays, and in the British-Indian restaurant** context where it became associated with a particular style `

### `lamb-rogan-josh` (cooking) — 1 hit

- **paragraph**
  - `es the position of the serious Saturday curry: made slowly, **served with basmati rice, raita and flatbread, and reliably better the next** day.`

### `lamb-tagine-with-apricots` (cooking) — 2 hits

- **paragraph**
  - `l. The dish is the slow conversation between lamb shoulder, **ras el hanout, sweet dried apricot, and a final scattering of** toasted almond.`
- **paragraph**
  - `off the heat. Lift out the cinnamon stick. Taste; the sauce **should sit between savoury, warm, and softly sweet**. Scatter with the toasted almonds, {{coriander}} of chopped`

### `lancashire-hotpot` (cooking) — 1 hit

- **paragraph**
  - `-leaves}} of bay. Season. Repeat with the rest of the meat, **vegetables, herbs, and the second bay leaf**. Pour over the {{worcestershire-sauce}} of Worcestershire a`

### `lasagne-alla-bolognese` (cooking) — 6 hits

- **paragraph**
  - `at a time, whisking after each addition until smooth. Bring **to a bare simmer, whisking, and cook for five minutes** until the sauce coats the back of a spoon but still flows f`
- **paragraph**
  - `avy ragù well. A vegetarian version swaps the meat ragù for **a sauce of porcini, chestnut mushrooms, and lentils built on the** same soffritto: brown the mushrooms hard first, deglaze wit`
- **paragraph**
  - `The ragù is better the day after it's made. **Cook it ahead, cool quickly, and store in the fridge** for up to three days or in the freezer for three months. Re`
- **paragraph**
  - `-shouldered region between Modena and Bologna that gave the **world prosciutto di Parma, parmigiano-reggiano, and the bolognese ragù that** defines this lasagne. Pellegrino Artusi's 1891 La Scienza i`
- **paragraph**
  - `cademia Italiana della Cucina in 1982 in a deposited recipe **that names the cuts, the ratios, and the cooking time**.`
- **paragraph**
  - `re is no thick tomato sauce. The richness sits in the meat, **the milk, the butter, and the parmesan**. Each layer is thinner than the slice that arrives on the p`

### `leftover-lamb-tortillas` (cooking) — 1 hit

- **paragraph**
  - `Mexican **home cooking trusts heat, citrus, and corn**. The dish hits those notes — adjust the chilli to taste and`

### `lemon-curd` (cooking) — 1 hit

- **paragraph**
  - `dition. It fills tarts and sandwiches sponge cakes, spreads **on toast and scones, stirs into yoghurt, and folds into whipped cream** for a lemon fool. It also works well as a filling for merin`

### `lemon-drizzle-cake` (baking) — 1 hit

- **paragraph**
  - `zest of both lemons. Beat with a hand mixer on medium for 2 **minutes until smooth, pale, and well combined**. This is the all-in-one method: everything in together, bea`

### `lemon-meringue-pie` (baking) — 1 hit

- **paragraph**
  - `. Continue whisking until the bowl is cool to the touch and **the meringue is stiff, glossy, and holds peaks**, about 5 minutes.`

### `lemonade` (cooking) — 3 hits

- **paragraph**
  - `**A small saucepan, a measuring jug, and a fine sieve**.`
- **paragraph**
  - `Homemade lemonade is a summer ritual in Britain **that sits alongside Wimbledon, fêtes, and back-garden cricket**. The commercial versions that dominate British fridges are `
  - `omemade lemonade tastes so different from the bottled kind: **sharper, more aromatic, and less sweet**. The version here uses a simple sugar syrup and fresh lemon`

### `lentil-and-bacon-soup` (cooking) — 1 hit

- **paragraph**
  - `**Add the onion, carrot, and celery to the bacon** fat in the pan. Cook for 8 minutes over a medium heat, stir`

### `lentil-and-feta-salad` (cooking) — 3 hits

- **paragraph**
  - `rench bistro salade de lentilles. Dress the lentils as soon **as they are drained, while still hot, and leave them to come** to room temperature in the dressing before adding anything `
- **paragraph**
  - `**A medium saucepan, colander, and large mixing bowl**.`
- **paragraph**
  - `**Add the cherry tomatoes, red onion, and parsley to the cooled** lentils. Toss gently. Scatter the crumbled feta over the to`

### `lentil-feta-salad` (cooking) — 2 hits

- **paragraph**
  - `Feta Salad. A Mediterranean dish in the everyday register — **olive oil, lemon, and what came back from** the market. Serves 2.`
- **paragraph**
  - `The dish belongs to the Mediterranean **tradition of olive oil, lemon, and what**'s on hand. No exact ratios — taste, adjust, taste again.`

### `lime-marmalade` (cooking) — 1 hit

- **paragraph**
  - `the whole lot steeped overnight in water. Next day it cooks **down for an hour, sugar goes in, and the marmalade is boiled** hard to setting point: 104°C.`

### `malted-granary-loaf` (baking) — 1 hit

- **paragraph**
  - `d here is the same as a white tin loaf: mix in the evening, **shape into the tin, refrigerate overnight, and bake in the morning** from cold. The fridge slows the yeast and lets the flavour `

### `marshmallows-vanilla` (baking) — 1 hit

- **paragraph**
  - ` high and beat for 8–10 minutes until the mixture is thick, **very white, glossy, and holds soft peaks**. Add {{vanilla-extract}} in the last minute of beating.`

### `masala-chai` (cooking) — 3 hits

- **paragraph**
  - `Put {{water}} of water, the sliced ginger, **crushed cardamom pods, cinnamon stick, and black pepper in a** small saucepan. Bring to a boil, then reduce the heat and s`
- **troubleshooter.fix**
  - `**Start with one tablespoon, taste, and add more**. Adjust next time based on preference.`
- **paragraph**
  - `t a recipe but a practice: a constant, variable preparation **that differs by city, by household, and by the individual who** makes it. The version that arrived in British culture is mo`

### `meatloaf` (cooking) — 1 hit

- **paragraph**
  - `n dinner, recorded in cookbooks from Fannie Farmer onwards. **Served with mashed potato, green beans, and gravy spooned over**. The next day's slices go cold between two pieces of white `

### `millionaire-peach-salad` (cooking) — 2 hits

- **paragraph**
  - `In a large salad bowl, **combine the sliced peaches, halved mozzarella balls, and arugula or mixed greens**.`
- **paragraph**
  - `**Add the toasted walnuts, crumbled feta cheese, and torn basil leaves to** the bowl.`

### `mince-pie-cookies` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `mince-pies` (cooking) — 4 hits

- **paragraph**
  - `Good mince **pie pastry is rich, short, and slightly crumbly rather than** tough. The fat is kept cold, worked in quickly, and the pas`
  - `is rich, short, and slightly crumbly rather than tough. The **fat is kept cold, worked in quickly, and the pastry is chilled** before rolling to prevent shrinkage. Overmixed pastry shrin`
- **paragraph**
  - ` into a smooth dough with a light hand. Do not overwork it. **Flatten to a disc, wrap, and refrigerate for** 30 minutes.`
- **paragraph**
  - ` the filling and sugar increased; by the nineteenth century **the format was small, individual, and entirely sweet**. The debate about whether shop-bought or homemade mince pie`

### `minestrone` (cooking) — 1 hit

- **paragraph**
  - `tto base, seasonal vegetables cut to roughly the same size, **a tin of beans, stock, and pasta or rice**. The Parmesan rind simmered in the broth for an hour gives `

### `mint-jelly` (cooking) — 1 hit

- **paragraph**
  - `clear apple liquid is boiled with sugar and a big bundle of **mint to setting point, strained again, and jarred**.`

### `moules-mariniere` (cooking) — 3 hits

- **paragraph**
  - `ls}} of mussels into a sink of cold water. Scrub each shell **with a kitchen brush, pull off the beard, and discard any that are** cracked. Tap any that are open against the worktop. If they`
- **paragraph**
  - `nd a glass of trappist beer. The French version stays close **to the white wine, the shallot, and the parsley**: four ingredients, eight minutes, and a piece of bread to w`
  - `tays close to the white wine, the shallot, and the parsley: **four ingredients, eight minutes, and a piece of bread** to wipe the bowl.`

### `muhammara` (cooking) — 1 hit

- **paragraph**
  - `resh fesenjan but in a completely different register: cold, **blended, bright, and fast to make**. The jarred roasted red peppers in olive oil that most supe`

### `mujadara` (cooking) — 4 hits

- **paragraph**
  - `full 30 minutes over medium heat, stirring regularly, until **they are deep brown, sweet, and almost crisp at the** edges. This is not a step that can be hurried — pale, soft `
- **paragraph**
  - ` lentils and cover with 900 ml of water. Bring to the boil, **reduce the heat, cover, and simmer for** 15 minutes. Add {{long-grain-rice}} of rinsed rice, {{sea-s`
- **paragraph**
  - `reference to the lentils dotted through the rice. It is the **everyday food of Lebanon, Syria, and Palestine** — made when the fridge is nearly empty, eaten as a main cou`
  - `eople to be one of the most satisfying things you can cook. **The combination of lentils, rice, and caramelised onions creates a** complete protein and a depth of flavour that punches above `

### `mulligatawny-soup` (cooking) — 2 hits

- **paragraph**
  - `}} of chicken stock. Season with {{sea-salt-fine}} of salt. **Bring to the boil, reduce heat, and simmer for** 20 minutes until the lentils are completely soft. Use a sti`
  - `ed chicken if using and warm through for 3 minutes. Squeeze **in the lemon juice, taste for seasoning, and serve with coriander**.`

### `navarin-dagneau` (cooking) — 3 hits

- **paragraph**
  - `our in {{dry-white-wine}} of white wine. Add {{lamb-stock}} **of stock, crushed tomatoes, and a bouquet garni**. Return the lamb, bring to a simmer, cover, and transfer to`
  - `ck, crushed tomatoes, and a bouquet garni. Return the lamb, **bring to a simmer, cover, and transfer to the oven** for 45 minutes.`
- **paragraph**
  - `n-peas}} of peas and leave for 2–3 minutes in the hot stew. **Taste and adjust seasoning, scatter with parsley, and serve from the casserole**.`

### `new-england-lobster-roll` (cooking) — 3 hits

- **paragraph**
  - `obsters of around 700 g each give you 400 g of picked meat: **claws, knuckles, and tails**. The meat goes cold straight away into iced water to stop t`
- **paragraph**
  - `stockpot. Add {{sea-salt-fine}} of salt. Lower the lobsters **head-first into the pot, cover, and bring back to the** boil. Time from when the boil returns: 8 minutes for a 700 `
- **paragraph**
  - `e entirely. Pile the lobster meat into a warmed pan with 80 **g of melted butter, toss to coat, and stuff into the toasted** bun straight from the heat. A crab roll uses 300 g of picke`

### `nougat-soft-honey` (baking) — 1 hit

- **paragraph**
  - ` high speed for 5–8 minutes until the nougat is very thick, **opaque, white, and holds its shape when** the mixer is stopped.`

### `oeufs-en-cocotte` (cooking) — 1 hit

- **paragraph**
  - `id yolk, 12 for a yolk that is just starting to set. Remove **from the bain-marie immediately, scatter with chives, and serve with toast**.`

### `orange-and-almond-cake-flourless` (baking) — 3 hits

- **paragraph**
  - `s this cake different from a cake made with zest and juice. **The peel contributes flavour, body, and a faint bitterness that** prevents the ground almonds from being cloying. The result `
- **paragraph**
  - `feels completely soft. Remove and leave to cool. When cool, **cut in half, remove any seeds, and blend** : skin, flesh, and all the juice to a completely smooth pur`
  - `cool. When cool, cut in half, remove any seeds, and blend : **skin, flesh, and all the juice to** a completely smooth purée with a stick blender or food proc`

### `orange-marmalade` (cooking) — 4 hits

- **paragraph**
  - `oft — this takes about an hour. Once cool enough to handle, **you cut them, remove the pips, and shred the peel to** the thickness you prefer. The pips and pith go back into th`
- **paragraph**
  - `}} lemon in a large saucepan. Cover with 2 litres of water. **Bring to the boil, cover, and simmer for** 1 hour until the skin is completely soft when pierced. Remo`
  - `r. Once cool enough to handle, halve the oranges and lemon. **Scoop out the flesh, pips, and pith into a square** of muslin and tie into a bag. Shred the peel to your prefer`
  - ` plate in the freezer. Return the cooking water to the pan. **Add the shredded peel, the muslin bag, and the juice from the** flesh. Add {{granulated-sugar}} of sugar and stir over low `

### `osso-buco` (cooking) — 1 hit

- **troubleshooter.fix**
  - `the last 20 minutes to let the sauce reduce. Alternatively, **remove the meat, boil the sauce down, and return**.`

### `panna-cotta` (cooking) — 1 hit

- **paragraph**
  - ` melt into a puddle at room temperature within minutes. The **flavour should be cream, vanilla, and very little else**.`

### `parmesan-cheese-crisps-laced-with-zucchini-carrots` (cooking) — 1 hit

- **paragraph**
  - `Gently flatten mixture with the **back of a spoon, if necessary, and move in any loose** shreds.`

### `parsnip-and-pancetta-tagliatelle-with-parmesan-and-butter` (cooking) — 2 hits

- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`
- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `pasta-aglio-e-olio` (cooking) — 1 hit

- **paragraph**
  - `e midnight meal of Naples: the dish made when you come home **late and find pasta, garlic, and a bottle of oil**. Its importance in Italian culinary identity is outsized re`

### `pasta-e-fagioli` (cooking) — 1 hit

- **paragraph**
  - `-oil}} of olive oil in a large saucepan over a medium heat. **Cook the onion, carrot, and celery for** 8–10 minutes until soft. Add {{garlic}} of garlic and rosem`

### `pastitsio` (cooking) — 1 hit

- **paragraph**
  - `most like a custard on top. The result is a dish that holds **together in clean slices, travels well, and is better the next** day once the layers have had time to settle.`

### `patatas-bravas` (cooking) — 3 hits

- **paragraph**
  - ` the potatoes. The potatoes are crisp and golden; the sauce **is hot with chilli, sharp with vinegar, and smoky from pimentón**. Both parts matter, but it is the sauce that earns the name`
- **paragraph**
  - ` if using; stir for 30 seconds. Pour in {{tinned-tomatoes}} **of tinned tomatoes, season with salt, and simmer for** 15 minutes until thick. Add {{sherry-vinegar}} of sherry vi`
  - `d simmer for 15 minutes until thick. Add {{sherry-vinegar}} **of sherry vinegar, taste, and adjust**. Blend until smooth with a stick blender. Keep warm.`

### `peanut-brittle` (baking) — 1 hit

- **paragraph**
  - `the simplest sugar confections: cook to a high temperature, **aerate with bicarbonate, pour over nuts, and leave to set**. The critical point is the hard crack stage at 154°C. At th`

### `peanut-butter-cookies` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `peanut-butter-protein-balls` (cooking) — 1 hit

- **paragraph**
  - `Add the no stir creamy peanut butter, honey, rolled oats, **vanilla protein powder, salt, and mini dark chocolate chips** to a mixing bowl and use a rubber spatula to mix until the `

### `pear-frangipane-tart` (baking) — 3 hits

- **paragraph**
  - `cold water and add just enough to bring the dough together. **Press into a disc, wrap, and refrigerate for** 30 minutes.`
- **paragraph**
  - `t into the fluted sides. Trim the overhang. Prick the base, **line with baking paper, fill with baking beans, and bake for** 15 minutes. Remove the beans and paper and bake for a furth`
- **paragraph**
  - `he top if using. Bake at 180°C fan for 35–40 minutes, until **the frangipane is puffed, golden, and set firm when you** gently shake the tin — no wobble. Cool in the tin for 20 mi`

### `penne-allarrabbiata` (cooking) — 1 hit

- **paragraph**
  - `Remove from the heat, drizzle over the remaining olive oil, **add the parsley, toss, and serve**.`

### `pepper-and-chorizo-picnic-frittata` (cooking) — 3 hits

- **paragraph**
  - `Beat the **eggs with a fork, season, and pour into the pan**, while still on a low heat. Tip the pan around until the eg`
- **paragraph**
  - `Make-ahead: assemble **fully the day before, refrigerate, and bake the morning of**.`
- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `piccalilli` (cooking) — 4 hits

- **paragraph**
  - `calilli is the British mustard pickle: cauliflower florets, **courgette, green beans, and shallots set into a** yellow turmeric sauce stiff with English mustard. Three wee`
- **paragraph**
  - `nd that none of them is so soft it collapses in the brine — **beetroot, tomato, and aubergine all do**, and don't belong here.`
- **paragraph**
  - `he salt dissolves. Add the prepared cauliflower, courgette, **green beans, shallots, and cucumber**. Press the vegetables down under the surface of the brine w`
- **paragraph**
  - `The dish settled into the British pickle **canon alongside pickled walnuts, pickled onions, and chutney**, and stayed there. It lives on the cold table: with a Boxin`

### `pierogi` (cooking) — 3 hits

- **paragraph**
  - `Pierogi dough is forgiving — softer and **more elastic than pasta, easy to work with, and very quick to bring** together. The key is to rest it for 30 minutes before rolli`
- **heading**
  - `**Shape, boil, and fry**`
- **paragraph**
  - `around the world tend to carry with them. They were brought **to the United States, Canada, and the United Kingdom in** the 20th century by Polish immigrants and have become so fa`

### `pierogi-with-potato-and-cheese` (cooking) — 2 hits

- **paragraph**
  - `cheese filling is the most everyday version; other fillings **include sauerkraut and mushroom, meat, and sweet versions with cherry** or blueberry. Making pierogi by hand is slow enough to be a`
  - `pierogi by hand is slow enough to be a communal activity: a **table covered in flour, everyone with a task, and a pot of soured** cream at the end.`

### `piped-buttercream-rose` (baking) — 1 hit

- **paragraph**
  - `stand mixer and whisk on high speed for 10–12 minutes until **the meringue is thick, glossy, and the bowl is completely** cool to the touch. Switch to the paddle attachment. Add the`

### `plain-scones` (cooking) — 2 hits

- **paragraph**
  - `ickly with a knife, turned out, patted to a 3 cm thickness, **stamped into rounds, brushed with milk, and slid into a screaming** hot oven for 12 minutes. Risen tall and golden, served warm`
- **paragraph**
  - `eat melts it into pockets of air. A light touch; overworked **scones come out tough, flat, and chewy**. Pat the dough rather than roll, stamp with a sharp cutter `

### `polenta-morbida` (cooking) — 1 hit

- **paragraph**
  - `ladle the topping over. It is also excellent cold — left to **set in a tin, sliced, and pan-fried in butter until** golden on both sides.`

### `pollo-alla-cacciatora` (cooking) — 2 hits

- **paragraph**
  - `bout 2 minutes. Add the crushed tomatoes, {{chicken-stock}} **of chicken stock, rosemary, and thyme**. Bring to a simmer, then return the chicken skin-side up, t`
- **paragraph**
  - ` the chicken is cooked through and the sauce has thickened. **Remove the herb sprigs, taste and adjust seasoning, and serve from the pan**.`

### `polpette-al-sugo` (cooking) — 1 hit

- **paragraph**
  - `soaked breadcrumbs, egg, {{parmesan}} of Parmesan, parsley, **garlic, salt, and pepper**. Mix gently with your hands until just combined. Shape into`

### `pommes-dauphinoise` (cooking) — 1 hit

- **paragraph**
  - `an with 2 crushed garlic cloves until just below simmering. **Season with salt, pepper, and a light grating of** nutmeg. Remove the garlic.`

### `pork-loin-mustard-cream` (cooking) — 2 hits

- **paragraph**
  - `n British home cooking. It requires nothing that isn't in a **standard fridge and cupboard, it takes twenty minutes, and the technique teaches the** pan sauce principle that applies equally to chicken, veal, `
  - `tes, and the technique teaches the pan sauce principle that **applies equally to chicken, veal, and fish**. The Norman cooking tradition that produced it was built on`

### `porridge` (cooking) — 1 hit

- **paragraph**
  - `ge in the Scottish Highlands, has run since 1994. Arguments **about the right consistency, the right toppings, and whether sugar or salt** should finish it are unresolved and likely to stay that way`

### `pot-roast` (cooking) — 2 hits

- **paragraph**
  - ` base of everything that follows. Sear all four flat sides (**bottom, top, and both long sides**) until deeply, confidently brown. This takes 16–20 minutes `
- **paragraph**
  - `k}} of hot stock and Worcestershire sauce. Return the beef, **add herbs, cover, and braise for** 2 hours.`

### `potato-salad` (cooking) — 3 hits

- **paragraph**
  - `ato salad is a picnic and barbecue constant across Britain, **Germany, the United States, and most of northern Europe**. The British version favours mayonnaise and mustard where t`
  - `weet pickle. The recipe here occupies the British register: **creamy, mustardy, and finished with chives rather** than dill. It goes with cold meats, smoked fish, and most t`
  - `my, mustardy, and finished with chives rather than dill. It **goes with cold meats, smoked fish, and most things cooked over** a fire.`

### `poulet-a-la-moutarde` (cooking) — 2 hits

- **paragraph**
  - `eat breaks the emulsion and can make the sauce grainy. Add, **stir, taste, and serve**.`
- **paragraph**
  - `ape up the fond. Add {{chicken-stock}} of hot stock. Return **the chicken skin-side up, cover, and simmer gently for** 30–35 minutes.`

### `poulet-roti` (cooking) — 1 hit

- **paragraph**
  - ` tearing. Season generously with salt and pepper. Stuff the **cavity with the thyme, garlic, and squeezed lemon half**. Place breast-side down in the roasting tin and roast for 2`

### `quiche-lorraine` (baking) — 3 hits

- **paragraph**
  - `s warm. The two parts are a blind-baked shortcrust case and **a custard of eggs, cream, and smoked lardons**. The only thing that goes wrong is a soggy base, which is e`
- **paragraph**
  - `gradually, pressing the dough together until it just holds. **Press into a disc, wrap, and refrigerate for** 30 minutes.`
- **paragraph**
  - `to cut off the excess. Prick the base all over with a fork. **Line with baking paper, fill with baking beans, and bake for** 15 minutes. Remove the beans and paper and bake for a furth`

### `quick-pickled-red-onions` (cooking) — 1 hit

- **paragraph**
  - `ything. They are the standard accompaniment to pulled pork, **tacos, falafel, and grain bowls**. They cut through fatty or rich dishes (pork belly, lamb, s`

### `quick-poached-egg-garlic-spinach-bagel` (cooking) — 1 hit

- **paragraph**
  - `Gently lower the ramekin **into the boiling water, tipping out the egg, and as you lift the** ramekin back out sweep it up and back over the egg to keep `

### `raspberry-jam` (cooking) — 1 hit

- **infoPanel.body**
  - `tray and dry in a 140°C oven for 15 minutes. Lids the same. **Fill jars hot, with hot jam, and seal at once**. Cold jars and hot jam crack on contact.`

### `ratatouille` (cooking) — 1 hit

- **paragraph**
  - `olds together in the stew. Ten minutes is enough. The final **dish should be silky, fragrant with herbs, and collapsing at the touch** of a spoon without being a purée.`

### `red-beans-and-rice` (cooking) — 3 hits

- **paragraph**
  - `art can prevent the bean skins from softening properly. The **holy trinity of onion, celery, and green pepper is the** flavour base: cook it properly before anything else goes in`
- **heading**
  - `**Season, thicken, and serve**`
- **paragraph**
  - `r. Mash 2–3 spoonfuls of beans and stir back in to thicken. **Remove the ham hock, pull the meat, and return it**. Remove the bay leaves. Serve over {{long-grain-rice}} of c`

### `ribollita` (cooking) — 4 hits

- **paragraph**
  - `Ribollita is better on the second day. **Make it, refrigerate it, and reheat it the next** day with a splash of water. The name refers to this second `
- **paragraph**
  - `olive-oil}} of olive oil in a large pot over a medium heat. **Add the onion, carrot, and celery and cook for** 10 minutes until soft. Add {{garlic}} of garlic and cook fo`
  - `until soft. Add {{garlic}} of garlic and cook for 1 minute. **Add the tinned tomatoes, thyme, and bay leaves**. Cook for 5 minutes.`
- **troubleshooter.fix**
  - `**Cook the onion, carrot, and celery base for a** full 10 minutes. Season generously — ribollita needs more s`

### `rice-and-peas` (cooking) — 3 hits

- **paragraph**
  - `l over medium-high heat, stir once, then reduce the heat to **the very lowest setting, cover tightly, and cook for** 18 minutes. Remove from the heat without lifting the lid an`
- **troubleshooter.fix**
  - `If the rice is still firm, add **a splash of water, replace the lid, and cook for** 5 more minutes. Do not lift the lid again until the full ti`
- **paragraph**
  - `cken in the British-Caribbean restaurant context, though in **Jamaica it accompanies stews, curried goat, and roasted meats of all** kinds.`

### `risotto-ai-funghi-porcini` (cooking) — 2 hits

- **paragraph**
  - `of dried porcini in 300 ml of boiling water for 20 minutes. **Lift them out, squeeze, and chop roughly**. Strain the soaking liquor through a fine sieve lined with `
- **paragraph**
  - `hould turn glossy and creamy. Cover and rest for 2 minutes. **Taste, adjust seasoning, and serve immediately in warm** bowls with parsley scattered over.`

### `roast-beef-sirloin` (cooking) — 3 hits

- **paragraph**
  - `in the fridge for at least eight hours, ideally a full day. **The surface dries, the salt penetrates, and the crust browns hard** in the oven.`
- **paragraph**
  - `Lift the joint **onto a warm plate, tent loosely with foil, and rest for** 30 minutes. The juices that flooded the cut edges retreat b`
- **paragraph**
  - `r the joint to catch the dripping. The combination of beef, **Yorkshire, gravy, and potatoes is the architecture** of a British weekend. Serve with goose-fat roast potatoes, `

### `roast-chicken-sunday` (cooking) — 2 hits

- **paragraph**
  - `ity scent the bird from the inside out. The roasting pan is **set up with onion, carrot, and celery underneath**, which lift the bird off the base and become the pan gravy `
- **paragraph**
  - ` sitting unwrapped in the fridge overnight to dry the skin. **The butter, lemon, and herbs can go on** the morning of the roast; the bird then sits in the fridge `

### `roast-leg-of-lamb` (cooking) — 4 hits

- **paragraph**
  - `Transfer the leg **to a warm plate, tent loosely with foil, and rest for at least** 30 minutes. A rested leg holds its juices; a carved-too-soo`
- **paragraph**
  - `tern style soup: cover with cold water, simmer three hours, **add chickpeas, cumin, and lemon**.`
- **paragraph**
  - `o beef, suited to the smaller household with a modest oven. **The combination of garlic, rosemary, and lamb arrived in British** domestic cooking through French influence in the nineteenth`
  - `for mint sauce only. It sits best alongside roast potatoes, **mint sauce, peas, and a light gravy** — the full Sunday roast plate where the lamb takes the cent`

### `roast-pork-belly` (cooking) — 1 hit

- **paragraph**
  - `Crackling requires three things: **dry skin, deep scoring, and a very high initial** temperature. Salt draws moisture from the skin overnight. S`

### `roast-pork-loin-with-crackling` (cooking) — 1 hit

- **paragraph**
  - `**Peel, core, and roughly chop** 3 Bramley apples. Cook them in a covered pan with a splash `

### `roast-turkey` (cooking) — 2 hits

- **paragraph**
  - `. Rub the remainder over the outside of the bird. Stuff the **cavity with the lemon, onion, and bay leaves**.`
- **paragraph**
  - `Transfer the **turkey to a board, tent loosely with foil, and rest for at least** 30 minutes before carving. Pour the resting juices into the`

### `roasted-chicken-drumsticks-with-parsley-garlic` (cooking) — 1 hit

- **paragraph**
  - `Generously season the drumsticks with salt and pepper. When **the butter is foaming, drop in the drumsticks, and fry until lightly browned** all over.`

### `roasted-garlic-and-potato-soup` (cooking) — 3 hits

- **paragraph**
  - `acon in a large saucepan over medium-high heat until crisp. **Add onion, carrot, and minced garlic**, and sauté 5 minutes. Add potato, broth, salt, pepper, and `
  - ` and minced garlic, and sauté 5 minutes. Add potato, broth, **salt, pepper, and bay leaf**; bring to a boil. Cover, reduce heat, and simmer for 20 min`
  - `potato, broth, salt, pepper, and bay leaf; bring to a boil. **Cover, reduce heat, and simmer for** 20 minutes or until potato is tender; remove bay leaf.`

### `roasted-red-pepper-risotto-recipe` (cooking) — 1 hit

- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `roasted-squash-pancetta-risotto` (cooking) — 1 hit

- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `roasted-sweet-garlic-thyme-and-mascarpone-risotto` (cooking) — 1 hit

- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `rough-puff-pastry` (baking) — 4 hits

- **paragraph**
  - `The method's one firm requirement is cold. Cold butter, **cold water, a cold working surface, and the discipline to put** the dough back in the fridge whenever it feels warm or stic`
- **paragraph**
  - `Shape the dough **into a rough rectangle, wrap in cling film, and refrigerate for** 30 minutes. The rest allows the gluten to relax and the but`
- **paragraph**
  - `Roll, **fold, turn, and chill again for** 30 minutes. By now the dough should feel cohesive and rolla`
- **paragraph**
  - `ribed it as the household economy method in 1861: full puff **required a marble slab, considerable time, and a consistent cold**. Rough-puff asks for the same rests but tolerates a less pr`

### `rustic-italian-crusty-bread` (cooking) — 1 hit

- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `salmon-teriyaki` (cooking) — 1 hit

- **paragraph**
  - `Salmon Teriyaki. Japanese home cooking **that trusts the soy, the dashi, and the patience between them**. Serves 2.`

### `sausage-casserole` (cooking) — 1 hit

- **paragraph**
  - `th enough space for each sausage to sit flat. Once browned, **the tomatoes, beans, and aromatics go in and** the heat drops. The casserole needs about 25 minutes of gen`

### `sausage-roll` (cooking) — 2 hits

- **paragraph**
  - `content, and takes about fifteen extra minutes. The filling **needs to be well-seasoned, slightly sticky, and cool before it goes** into the pastry — a warm filling makes the pastry collapse.`
- **paragraph**
  - `nely diced onion and cook over medium-low heat for 10 to 12 **minutes until soft, golden, and sweet**. Cool completely. Mix the cooled onion with the sausagemeat`

### `sausage-rolls` (baking) — 2 hits

- **paragraph**
  - `that separate in the oven where the butter has steamed. The **filling needs only sage, a little mustard, and good seasoning** — the pork sausage meat is the whole point.`
- **paragraph**
  - `ith a round-bladed knife until the dough just clumps. Press **into a rough rectangle, wrap, and refrigerate for** 15 minutes.`

### `scottish-tablet` (baking) — 1 hit

- **paragraph**
  - `15 minutes. The mixture will be liquid and glossy at first, **then begin to thicken, lighten in colour, and take on an opaque**, sandy appearance — this is grain set beginning. The moment`

### `shepherds-pie` (cooking) — 4 hits

- **paragraph**
  - `Browned lamb mince **cooked slowly with onion, carrot, and a deep slug of** Worcestershire sauce, all built into a tomato-and-stock gra`
- **infoPanel.body**
  - ` mash slumps into the meat and gives you grey mush. A stiff **mash holds its peaks, crisps on top, and parts cleanly from the** gravy below. Beat the boiled potatoes dry over a low hob fo`
- **paragraph**
  - `A wide sauté pan, a roomy **saucepan for the potatoes, a masher, and a** 24 × 30 cm baking tin. Nothing else.`
- **paragraph**
  - ` cabbage on the side. The cook who masters this dish learns **to brown mince properly, build a slow gravy, and mash a potato**; three of the cornerstone skills of plain British cookery.`

### `shortbread` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `shrimp-and-grits` (cooking) — 1 hit

- **paragraph**
  - `ka for 1 minute. Add the tinned tomatoes, {{chicken-stock}} **of stock, Worcestershire sauce, and hot sauce**. Simmer for 5 minutes.`

### `sloppy-joe-s-pasta-bake` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`

### `slow-cooker-bbq-chicken-wings` (cooking) — 1 hit

- **paragraph**
  - `ugar, paprika, mustard, cumin, garlic powder, onion powder, **cayenne, salt, and pepper together**. Place ingredients in a large plastic zip-lock bag. Dump ch`

### `slow-cooker-beef-brisket` (cooking) — 3 hits

- **paragraph**
  - `chewy and dry. Cook it low and slow for eight hours and the **collagen dissolves into gelatin, the fibres relax, and the meat pulls apart** into unctuous, deeply flavoured shreds. This is what the sl`
- **paragraph**
  - `ften. Add {{garlic}} of crushed garlic and {{tomato-puree}} **of tomato purée, stir, and cook for** 1 minute more. Add {{stock-beef}} of beef stock and {{worce`
- **paragraph**
  - `Slow-cooked brisket appears **in British pot-roast tradition, American Jewish cooking, and Texas barbecue culture** — all different expressions of the same observation that th`

### `slow-cooker-beef-stew` (cooking) — 1 hit

- **paragraph**
  - `up any browned bits. Pour over the beef in the slow cooker. **Add the carrots, potatoes, and thyme sprigs**. Cover and cook on LOW for 7–8 hours or HIGH for 4–5 hours `

### `slow-cooker-cherry-cola-pulled-pork` (cooking) — 3 hits

- **paragraph**
  - `Place pork in a greased slow cooker. Rub with salt, pepper, **garlic powder, onion powder, and liquid smoke**.`
- **paragraph**
  - `Add cola **to the slow cooker, cover, and cook for** 8 hours on low.`
- **paragraph**
  - `**Shred with two forks, stir in bbq sauce, and serve over rice or** on a burger bun with more bbq sauce.`

### `slow-cooker-chicken-cacciatore` (cooking) — 1 hit

- **paragraph**
  - `chovies. The version here is broadly Sicilian in character, **with olives, capers, and tomatoes**. None is more correct than another — the dish is defined by`

### `slow-cooker-chinese-beef-and-broccoli` (cooking) — 1 hit

- **paragraph**
  - ` a mixing bowl, whisk together the beef consume, soy sauce, **dark brown sugar, sesame oil, and garlic**.`

### `slow-cooker-italian-beef-ragu` (cooking) — 2 hits

- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`
- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `slow-cooker-italian-chicken-pasta` (cooking) — 3 hits

- **paragraph**
  - `Add diced onion, garlic, chicken breasts, **cream cheese, marinara sauce, and some seasonings into a** cold slow cooker.`
- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`
- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `slow-cooker-korean-beef` (cooking) — 1 hit

- **paragraph**
  - `Add sesame oil, minced garlic, soy sauce, beef broth, **brown sugar, onion, and red pepper flakes to** the slow cooker. Stir ingredients.`

### `slow-cooker-lamb-curry` (cooking) — 2 hits

- **paragraph**
  - `Indian lamb curry is the dish that arrived in British homes **through the spice trade, the empire, and the great postwar wave** of South Asian migration. This version is a slow-cooker ada`
  - ` Asian migration. This version is a slow-cooker adaptation: **practical, affordable, and far better on day** two. Serve for a Friday dinner or set it on a Saturday morn`

### `slow-cooker-pea-and-ham-soup` (cooking) — 2 hits

- **paragraph**
  - ` off the bone. Shred the meat back in and that is the soup: **thick, smoky, and unapologetically filling**.`
- **paragraph**
  - `e shredded ham to the pot. Remove the bay leaves and thyme. **Stir, taste for seasoning, and add salt only if** needed. The soup should be thick and almost porridge-like; `

### `slow-cooker-pulled-bbq-chicken` (cooking) — 1 hit

- **paragraph**
  - `pple cider vinegar, olive oil, garlic powder, onion powder, **smoked paprika, chipotle chilli powder, and ground white pepper**. Use a whisk to stir and combine.`

### `slow-cooker-pulled-pork` (cooking) — 2 hits

- **paragraph**
  - `Mix together the smoked paprika, garlic powder, **caster sugar, salt, and black pepper**. Rub the mixture all over the pork shoulder, pressing it in`
- **paragraph**
  - `ll in a covered pan over low heat. Leftovers work in tacos, **quesadillas, fried rice, and jacket potatoes**. Freeze in the cooking juices for up to three months.`

### `slow-cooker-teriyaki-chicken` (cooking) — 2 hits

- **paragraph**
  - `Slow Cooker Teriyaki Chicken. Japanese home cooking **that trusts the soy, the dashi, and the patience between them**. Adjustable for what you need.`
- **paragraph**
  - `ne soy sauce, water, brown sugar, rice vinegar, sesame oil, **ginger, garlic, and honey in a medium** bowl. Whisk everything together and set it aside.`

### `smoky-lamb-and-chickpea-stew` (cooking) — 3 hits

- **paragraph**
  - `Drop the heat to medium. Add the onions, **carrots, celery, and a pinch of salt**. Sweat with the lid on for ten minutes, stirring occasional`
- **paragraph**
  - `Stir in the garlic, rosemary, **thyme, cumin, and smoked paprika**. Cook for one minute — the spices should bloom into the oil`
- **paragraph**
  - `Return the lamb. Add the lemon zest and juice, **the chickpeas, the tomatoes, and the stock**. Bring to a simmer.`

### `soda-bread-irish` (baking) — 2 hits

- **paragraph**
  - `mb its characteristic slight tang. Handle it briefly, shape **it into a round, score it, and bake it**. More than a minute of working the dough toughens it.`
- **paragraph**
  - `ve strokes. Stop when the flour is incorporated — the dough **is rough and shaggy, not smooth, and that is correct**. Overworking develops the gluten, which toughens a soda loa`

### `soft-and-chewy-oatmeal-raisin-cookies` (cooking) — 3 hits

- **paragraph**
  - `In a large bowl, whisk together the flour, **cinnamon, baking soda, and salt**. Stir in the old-fashioned rolled oats and set aside.`
- **paragraph**
  - `ttachment or in a large mixing bowl using a handheld mixer, **beat the butter, brown sugar, and granulated sugar together for** 1 to 2 minutes or until well combined. Add the egg and vani`
- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `soft-chewy-chocolate-chip-cookies` (cooking) — 2 hits

- **paragraph**
  - `**Cream the butter, brown sugar, and caster sugar together until** pale and fluffy — three or four minutes by stand mixer or v`
- **paragraph**
  - `In a separate bowl, whisk the flour, **cornflour, bicarb, and salt together**. Tip into the wet mix and fold until just combined — stop t`

### `soupe-a-loignon` (cooking) — 1 hit

- **paragraph**
  - `medium, and let it bubble for 2 minutes. Add {{beef-stock}} **of hot beef stock, the thyme sprigs, and the bay leaf**. Season. Simmer for 15 minutes. Remove the herbs.`

### `sourdough-country-loaf` (baking) — 5 hits

- **infoPanel.body**
  - `Sourdough fermentation times vary with temperature, **flour protein content, starter activity, and humidity**. The times given here are guides for a kitchen at about 22°`
- **paragraph**
  - `and 50 ml of room-temperature water in a jar or small bowl. **Stir thoroughly, cover loosely, and leave at room temperature** for 4–8 hours. The levain is ready when it has doubled in v`
- **paragraph**
  - ` each round. For each round: wet your hand, reach under one **side of the dough, lift it fully, and fold it over the** top. Rotate the bowl 90° and repeat three more times — that`
- **paragraph**
  - `eates the ear; a vertical slash produces a flatter opening. **Place the lid on, return to the oven, and bake for** 25 minutes with the lid on. Remove the lid and bake for a f`
- **troubleshooter.fix**
  - `The levain must be at its peak , **domed, bubbly, and passing the float test**, before you use it. Under-ripe levain produces a sluggish d`

### `spaghetti-aglio-olio-e-peperoncino` (cooking) — 1 hit

- **paragraph**
  - `Remove from the heat, scatter **over the chopped parsley, toss once more, and serve immediately in warm** bowls.`

### `spaghetti-al-pomodoro` (cooking) — 2 hits

- **paragraph**
  - `s until fragrant but not coloured. Add the crushed tomatoes **with all their juice, a few basil leaves, and salt**. Bring to a gentle simmer.`
- **paragraph**
  - `1 minute. Remove from the heat, add the remaining olive oil **and the fresh basil, toss once more, and serve immediately**.`

### `spaghetti-alla-puttanesca` (cooking) — 4 hits

- **paragraph**
  - `The salt in this dish comes from three sources — **the anchovies, the capers, and the pasta water**. Do not add extra salt to the sauce without tasting first, `
- **paragraph**
  - `lavour. Add the garlic and chilli flakes for 1 minute, then **add the crushed tomatoes, chopped olives, and drained capers**. Cook for 10–12 minutes until the sauce has thickened.`
- **paragraph**
  - `. Taste for seasoning — you will likely need no extra salt. **Add the parsley, toss, and serve**.`
- **paragraph**
  - `pletely during cooking. The result does not taste of fish — **it tastes savoury, deep, and salty in a way** that is difficult to pinpoint. If serving to guests who usu`

### `spaghetti-alle-vongole` (cooking) — 1 hit

- **paragraph**
  - ` 2–3 minutes. Remove from the heat, add the remaining olive **oil and the parsley, toss once more, and serve immediately**.`

### `spaghetti-bolognaise` (cooking) — 2 hits

- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`
- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `spaghetti-carbonara` (cooking) — 2 hits

- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`
- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `spiced-red-cabbage` (cooking) — 4 hits

- **paragraph**
  - `he few Christmas side dishes that improves over a few days. **The vinegar, sugar, and spice continue to meld** after the first day, and what starts out sharp and sweet be`
- **paragraph**
  - `ar}} of cider vinegar, {{dark-brown-sugar}} of brown sugar, **cinnamon stick, star anise, and cloves**. Season with {{sea-salt-fine}} of salt and {{black-pepper}}`
- **paragraph**
  - `**Remove the cinnamon stick, star anise, and cloves**. Taste and adjust the balance of vinegar and sugar. Serve h`
- **paragraph**
  - `ther when everything else is frantic. It takes no attention **once in the pan, reheats without deteriorating, and pairs with almost every** roast meat on the table. Its German and Nordic origins sit `

### `spinach-and-feta-pinwheels` (cooking) — 4 hits

- **paragraph**
  - ` Pinwheels. A Mediterranean dish in the everyday register — **olive oil, lemon, and what came back from** the market. Adjustable for what you need.`
- **paragraph**
  - `s with baking paper. Next, make sure the spinach is air and **paper towel-dried very well, squeeze any excess liquid, and then in a bowl** combine the spinach, green onion, feta, parmesan, salt, and`
  - ` and then in a bowl combine the spinach, green onion, feta, **parmesan, salt, and pepper**. Combine well enough that it becomes like a thick paste rea`
- **paragraph**
  - `The dish belongs to the Mediterranean **tradition of olive oil, lemon, and what**'s on hand. No exact ratios — taste, adjust, taste again.`

### `spinach-quiche` (cooking) — 1 hit

- **paragraph**
  - `Make-ahead: assemble **fully the day before, refrigerate, and bake the morning of**.`

### `spotted-dick` (cooking) — 2 hits

- **paragraph**
  - `ion to the water level: the pan must never run dry. Keep it **at a steady simmer, not a furious boil, and top up with boiling** water from a kettle every 30 minutes. The two-hour steam is`
- **paragraph**
  - `ing basin. Cover with a double layer of baking paper with a **pleat in the centre, then foil, and tie securely with string**. Set in a large saucepan and pour in boiling water to come `

### `steak-and-ale-pie` (cooking) — 2 hits

- **paragraph**
  - `d for two and a half hours with onions, chestnut mushrooms, **thyme, bay, and a generous pour of** stout. The gravy reduces to a dark glossy sauce; the meat r`
- **paragraph**
  - `Toss {{beef-chuck}} of cubed beef with {{plain-flour}} **of flour, salt, and pepper**. Heat {{rapeseed-oil}} of oil in a heavy Dutch oven over a `

### `steak-and-kidney-pie` (cooking) — 3 hits

- **paragraph**
  - `ubstitute replicates. Ox kidney is the traditional choice — **stronger, more assertive, and more gelatinous than lamb** kidney. Those new to kidney should start here rather than a`
- **paragraph**
  - `astry. This is a two-session recipe in practice: braise the **filling the evening before, refrigerate overnight, and top with pastry on** the day. The filling must be completely cold before the pas`
- **paragraph**
  - `nique: the braise is forgiving, the pastry straightforward. **Serve with mashed potato, buttered greens, and a glass of stout** to match the gravy.`

### `steak-au-poivre` (cooking) — 2 hits

- **paragraph**
  - `absolute hottest before the steaks go in — no exceptions. A **correctly hot pan sears, seals, and colours in** 2–3 minutes per side; an insufficiently hot pan steams. Dry`
- **paragraph**
  - `Crack {{black-peppercorns}} of black peppercorns coarsely. **Pat the steaks dry, season with salt, and press both sides firmly** into the cracked pepper. Heat a heavy frying pan over the h`

### `sticky-toffee-pudding` (cooking) — 1 hit

- **paragraph**
  - `Leave the pudding to stand for about 30 minutes before **serving with ice cream, double cream or custard, and the remaining toffee sauce**.`

### `sticky-toffee-traybake` (baking) — 1 hit

- **paragraph**
  - `s. The dark muscovado sugar provides the caramel depth. The **toffee sauce of butter, cream, and dark sugar goes on** top immediately after baking, while the sponge is still hot`

### `strawberry-jam` (cooking) — 2 hits

- **paragraph**
  - `eshly-fruity result is the target. Jam that has been cooked **too long turns dark, brown at the edges, and tastes of caramel rather** than strawberries.`
- **paragraph**
  - `Sterilise four 340 g jars by washing **in hot soapy water, rinsing, and placing upright in an** oven at 120°C for 15 minutes. Place a small plate in the fr`

### `strawberry-jam-open-pan-method` (cooking) — 3 hits

- **infoPanel.body**
  - `Setting needs three things: **pectin, sugar, and acid**. Strawberries supply the sugar and most of the volume but v`
- **paragraph**
  - `an a small plum; leave smaller ones whole. Weigh the hulled **fruit on the scales, because punnets vary, and adjust the sugar to** 80% of the hulled weight.`
- **varietiesPanel.description**
  - `fast and firm. Use a touch more sugar (900 g to 1 kg fruit) **to balance the tartness, no lemon, and watch the rolling boil** closely.`

### `street-corn-salad` (cooking) — 2 hits

- **paragraph**
  - `m bowl, whisk together the mayo, sour cream, grated garlic, **lime zest and juice, chili powder, and salt until smooth**.`
- **paragraph**
  - `corn and place them in a large mixing bowl. Add the cheese, **scallions, cilantro, and jalapeño**. Pour the dressing over top and toss well to coat.`

### `sweet-potato-soup` (cooking) — 2 hits

- **paragraph**
  - `ing first can taste one-dimensional: sweet but not complex. **Roasting adds caramelised edges, a deeper sweetness, and some char at the** tips that gives the blended soup something to work against.`
- **paragraph**
  - `**A large roasting tin, a large saucepan, and a stick blender**.`

### `tagliatelle-with-spinach-mascarpone-and-parmesan` (cooking) — 3 hits

- **paragraph**
  - `Bring a large pan of salted **water to the boil, add the pasta, and cook according to the** packet instructions. Meanwhile, get a frying pan or wok war`
- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`
- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `tandoori-chicken` (cooking) — 1 hit

- **paragraph**
  - `nt — the juices should run clear. Rest for 5 minutes before **serving with lemon wedges, sliced raw onion, and coriander**.`

### `teriyaki-mushroom-rice-bowls` (cooking) — 2 hits

- **paragraph**
  - `Teriyaki Mushroom Rice Bowls. Japanese home cooking **that trusts the soy, the dashi, and the patience between them**. Adjustable for what you need.`
- **paragraph**
  - `hile, combine soy sauce, rice vinegar, miso, coconut sugar, **garlic, ginger, and chilli flakes in a** small saucepan over medium heat. Cook, stirring frequently,`

### `tomato-soup` (cooking) — 2 hits

- **paragraph**
  - `to soup made properly starts in a hot oven, not on the hob. **Roasting concentrates the tomatoes, caramelises their edges, and drives off the thin** watery liquid that makes raw-blended versions taste flat. T`
- **paragraph**
  - ` need a large roasting tin to hold the tomatoes cut-side up **in a single layer, a large saucepan, and a stick blender**. A jug blender works but creates more washing up.`

### `tortilla-espanola` (cooking) — 1 hit

- **paragraph**
  - `rown. After draining and combining with egg, the mixture is **returned to the pan, set over low heat, and flipped once**, carefully, to finish the second side.`

### `treacle-tart` (cooking) — 1 hit

- **paragraph**
  - `rt is the sweet end of the British school dinner tradition: **simple, filling, and inseparable from a specific** kind of childhood comfort. Outside Britain it is virtually `

### `treacle-tart-classic` (baking) — 2 hits

- **paragraph**
  - `Treacle tart has four components: shortcrust pastry, **golden syrup, breadcrumbs, and lemon**. The proportions matter. Too few breadcrumbs and the fillin`
- **paragraph**
  - `ogether — 3 to 4 tablespoons is usually enough. Flatten the **dough into a disc, wrap in cling film, and refrigerate for** 30 minutes.`

### `tuna-pasta-salad` (cooking) — 2 hits

- **paragraph**
  - `**A medium saucepan, a colander, and a large mixing bowl**.`
- **paragraph**
  - `wn cocktail — popular, unfussy, eaten without ceremony. The **Italian combination of tuna, oil, and capers that appears in** tonnato sauces and antipasto platters travelled into Britis`

### `ultimate-gingerbread` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `ultimate-spaghetti-carbonara` (cooking) — 2 hits

- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`
- **paragraph**
  - `The dish sits in the Italian home-cooking tradition: **a few good ingredients, a long unhurried cook, and a pan that has** fed the family for years. Worth keeping its roots in mind w`

### `vanessa-s-quiche` (cooking) — 1 hit

- **paragraph**
  - `Make-ahead: assemble **fully the day before, refrigerate, and bake the morning of**.`

### `vegan-chocolate-chip-cookies` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `vegan-peanut-butter-cookies` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Use **a heavier baking tray, line with baking paper, and bake on the middle** shelf.`

### `vegetable-biryani` (cooking) — 3 hits

- **paragraph**
  - `table. Stir gently to mix the layers as you serve. Eat with **a raita of yoghurt, cucumber, and mint**.`
- **paragraph**
  - `Biryani is **the dish of weddings, celebrations, and Sunday lunches across the** subcontinent. The Hyderabadi style (kacchi biryani, where r`
  - `echnique, where the masala is fully cooked before layering. **Serve with raita, a wedge of lemon, and a green chilli pickle** to one side.`

### `vegetable-frittata` (cooking) — 1 hit

- **paragraph**
  - `hot makes it useful for occasions when timing is uncertain. **Spanish tortilla, Persian kuku sabzi, and North African shakshuka occupy** similar roles in their respective cuisines — the frittata i`

### `veggie-full-english` (cooking) — 1 hit

- **paragraph**
  - `he same principle without the meat, and works because eggs, **toast, beans, and roasted vegetables already provide** the protein and satisfaction the meal is built around. Port`

### `vichyssoise` (cooking) — 1 hit

- **heading**
  - `**Blend, sieve, and chill**`

### `welsh-rarebit` (cooking) — 1 hit

- **paragraph**
  - `Grill for 3 to 5 minutes close to the heat element until **the surface puffs up, bronzes in patches, and blisters at the edges**. Watch it: the change from perfectly done to overdone takes`

### `whatever-floats-your-boat-brownies` (cooking) — 1 hit

- **paragraph**
  - `Gather large marshmallows, **drinking straws, chocolate, and red nonpareil sprinkles**.`

### `white-bean-and-rosemary-soup` (cooking) — 1 hit

- **paragraph**
  - `nellini beans, dried rosemary or a sprig from the garden, a **few cloves of garlic, stock, and good olive oil to** finish. Nothing else is needed. The part-blending technique`

### `world-s-best-cheesy-garlic-bread` (cooking) — 1 hit

- **paragraph**
  - `In a small bowl, mix together butter, minced garlic, **garlic powder, parsley, and parmesan cheese**.`

### `yakitori-chicken` (cooking) — 1 hit

- **paragraph**
  - `Yakitori Chicken. Japanese home cooking **that trusts the soy, the dashi, and the patience between them**. Adjustable for what you need.`

### `yorkshire-puddings` (cooking) — 4 hits

- **paragraph**
  - `**Equal volumes of egg, milk, and flour is the canonical** ratio. Measure the eggs in the jug first, then match flour `
- **paragraph**
  - `en the door for the first 18 minutes. The puddings are done **when they are tall, deep gold, and have risen up dramatically** into curved-edged towers. Eat straight from the oven with r`
  - `ramatically into curved-edged towers. Eat straight from the **oven with roast beef, gravy, and horseradish cream**.`
- **paragraph**
  - `re puddings sit on the Sunday roast plate next to the beef, **the potatoes, the carrots and parsnips, and the gravy**. Hannah Glasse's 1747 "dripping pudding" was the ancestor: `

### `zucchini-pine-nut-cranberry-paleo-pasta` (cooking) — 1 hit

- **troubleshooter.fix**
  - `Cook a minute less **than the packet says, drain, and finish in the sauce**. Time it so the pasta meets the sauce in the pan, not the c`

---

Total hits: **574** across **312** tutorials.
