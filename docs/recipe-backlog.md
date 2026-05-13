# Recipe backlog

The recipe map. ~2,000 complete-dish recipes organised by cuisine, category, and
method. Drives bulk authoring in Phase 8 (steps 10-12 of the content pipeline
build queue in `BUILD_PROGRESS.md`).

Each entry is a single bullet:

```
- Title — one-line scope. tags: [cuisine, mealType, mood, dietary, difficulty]
```

Tag arrays use the enum values that exist on the Tutorial recipe metadata
(`cuisine`, `mealType`, `mood[]`, `dietaryFlags[]`, plus the existing
`Difficulty` enum). Use lowercase, hyphenated values.

Cuisine sections cover **mains, stews, pies, roasts, and regional traditional
dinners**. Baking, desserts, preserves, soups, salads, breakfasts, and drinks
are their own H2 sections that cross cuisines — so a Victoria sponge sits
under Baking and a tiramisu sits under Desserts, not under their parent
cuisine. Vegetarian and vegan variants live as sibling entries to the parent
dish (lasagna → vegetarian butternut lasagna), not in a standalone section,
so SEO doesn't splinter.

Air-fryer, slow-cooker, and pressure-cooker recipes are their own H2 sections
with primary entries because UK search demand for those terms is huge — they
overlap conceptually with cuisine sections but the method changes the recipe.

Cross-cutting use-cases (Sunday roast, weeknight, batch-cook, lunchbox,
kid-friendly, Christmas, Friday pizza night, curry night, comfort food) are
**indices** at the tail of the file — they reference recipes by title, no
new entries.

Voice rules apply (`feedback_homemade_voice.md`): no banned phrases or
openers, British English, specific over abstract, no prices, no fake
retailers, no medical thresholds. Worldwide-friendly idiom.

---

## British

Beeton, Hartley, Grigson, Slater, and Hopkinson are the spine. Mrs Beeton
(Project Gutenberg #10136) sits in public domain for the 1861 baseline.
Modern British home cooking — the post-war canon and the curry-house
hybrid tradition — sits alongside. British baking is heavy enough that it
lives in its own H2 (Baking → British baking).

### Sunday roasts and big-tray mains

- Roast beef sirloin — salt-rubbed, rested, served pink with Yorkshire puddings and roast potatoes. tags: [british, dinner, sunday-lunch, comfort-food, intermediate]
- Roast beef rib on the bone — slow-roasted three-bone rib for a crowd of eight. tags: [british, dinner, sunday-lunch, festive, intermediate]
- Topside roast — leaner cut, slow-cooked at a low temperature for slicing. tags: [british, dinner, sunday-lunch, comfort-food, beginner]
- Roast leg of lamb — studded with garlic and rosemary, served with mint sauce. tags: [british, dinner, sunday-lunch, comfort-food, beginner]
- Slow-roast shoulder of lamb — seven-hour roast that pulls apart with a fork. tags: [british, dinner, sunday-lunch, comfort-food, beginner]
- Roast rack of lamb — herb-crusted, served pink, three cutlets per person. tags: [british, dinner, dinner-party, intermediate]
- Roast crown of lamb — fashioned from two French-trimmed racks for special occasions. tags: [british, dinner, festive, advanced]
- Roast pork loin with crackling — scored skin, dry overnight, hot oven start. tags: [british, dinner, sunday-lunch, comfort-food, intermediate]
- Roast pork belly — slow-cooked, blistered crackling, apple sauce. tags: [british, dinner, sunday-lunch, comfort-food, intermediate]
- Roast shoulder of pork — eight-hour pulled-pork-style roast. tags: [british, dinner, batch-cook, comfort-food, beginner]
- Roast leg of pork — traditional Sunday joint with sage and onion stuffing. tags: [british, dinner, sunday-lunch, comfort-food, beginner]
- Roast chicken — buttered breast, lemon and thyme in the cavity. tags: [british, dinner, sunday-lunch, comfort-food, beginner]
- Roast spatchcock chicken — flattened bird, faster, more even cooking. tags: [british, dinner, weeknight, beginner]
- Roast poussin — single-serving roast with bread sauce. tags: [british, dinner, dinner-party, intermediate]
- Roast duck with orange — crispy skin, fat rendered for roast potatoes. tags: [british, dinner, dinner-party, intermediate]
- Roast goose at Christmas — apple and prune stuffing, sage gravy. tags: [british, dinner, festive, advanced]
- Roast turkey — Christmas Day classic with chestnut stuffing. tags: [british, dinner, festive, intermediate]
- Brined roast turkey — overnight brine for moist meat. tags: [british, dinner, festive, intermediate]
- Crown of turkey — boneless option for smaller gatherings. tags: [british, dinner, festive, intermediate]
- Roast pheasant — bacon-wrapped, served with game chips and bread sauce. tags: [british, dinner, dinner-party, intermediate]
- Roast partridge — quick, hot roast for two birds per person. tags: [british, dinner, dinner-party, intermediate]
- Roast grouse — twelfth-of-August tradition with watercress and gravy. tags: [british, dinner, dinner-party, advanced]
- Roast venison haunch — marinated in juniper and red wine. tags: [british, dinner, festive, intermediate]
- Yorkshire puddings — the proper tall, crisp version with smoking-hot fat. tags: [british, dinner, sunday-lunch, vegetarian, beginner]
- Toad in the hole — Yorkshire pudding batter around sausages. tags: [british, dinner, comfort-food, kid-friendly, beginner]
- Roast potatoes — duck fat, par-boiled and shaken for crisp edges. tags: [british, dinner, sunday-lunch, vegetarian, beginner]
- Goose-fat roast potatoes — Christmas-day standard. tags: [british, dinner, festive, vegetarian, beginner]
- Hasselback potatoes — fan-cut, herb-buttered, golden edges. tags: [british, dinner, sunday-lunch, vegetarian, beginner]
- Boulangère potatoes — sliced potatoes baked in stock under the roast. tags: [british, dinner, sunday-lunch, vegetarian, beginner]
- Roast parsnips — honey-roasted, the sweet companion to a Sunday roast. tags: [british, dinner, sunday-lunch, vegetarian, beginner]
- Roast carrots — whole carrots, butter and thyme. tags: [british, dinner, sunday-lunch, vegetarian, beginner]
- Honey-roast carrots and parsnips — Christmas-trimmings staple. tags: [british, dinner, festive, vegetarian, beginner]
- Cauliflower cheese — proper cheese sauce, browned breadcrumb top. tags: [british, dinner, sunday-lunch, vegetarian, comfort-food, beginner]
- Braised red cabbage — slow-cooked with apple, vinegar, and clove. tags: [british, dinner, festive, vegetarian, vegan, beginner]
- Sage and onion stuffing — the proper bread-based version, baked in a tray. tags: [british, dinner, sunday-lunch, vegetarian, beginner]
- Chestnut and sausagemeat stuffing — the Christmas standard. tags: [british, dinner, festive, beginner]
- Bread sauce — bread, milk, onion, clove. The roast-bird companion. tags: [british, dinner, sunday-lunch, vegetarian, beginner]
- Cranberry sauce — fresh berries, orange zest, port. tags: [british, dinner, festive, vegetarian, vegan, beginner]
- Mint sauce — fresh mint, vinegar, sugar, the lamb companion. tags: [british, dinner, sunday-lunch, vegetarian, vegan, beginner]
- Apple sauce — Bramleys cooked down with a knob of butter. tags: [british, dinner, sunday-lunch, vegetarian, beginner]
- Horseradish cream — fresh-grated root folded into double cream. tags: [british, dinner, sunday-lunch, vegetarian, beginner]
- Onion gravy — slow-caramelised, the sausage-and-mash companion. tags: [british, dinner, sunday-lunch, vegetarian, vegan, beginner]
- Red-wine gravy — built on the roast pan drippings. tags: [british, dinner, sunday-lunch, intermediate]
- Pigs in blankets — chipolatas wrapped in streaky bacon. tags: [british, dinner, festive, kid-friendly, beginner]

### Pies — meat, fish, and game

- Steak and ale pie — chuck steak braised in stout, suet pastry lid. tags: [british, dinner, comfort-food, freezable, intermediate]
- Steak and kidney pie — the proper version with ox kidney and a hot-water-crust base. tags: [british, dinner, comfort-food, intermediate]
- Steak and kidney pudding — suet-pastry steamed in a basin for four hours. tags: [british, dinner, comfort-food, intermediate]
- Steak and mushroom pie — chestnut mushrooms and red wine. tags: [british, dinner, comfort-food, freezable, beginner]
- Chicken and mushroom pie — white-sauce filling, puff-pastry lid. tags: [british, dinner, comfort-food, freezable, beginner]
- Chicken and leek pie — gentler version with leeks and tarragon. tags: [british, dinner, comfort-food, freezable, beginner]
- Chicken and ham pie — leftover-roast-chicken classic. tags: [british, dinner, comfort-food, batch-cook, beginner]
- Cottage pie — minced beef, gravy, mashed-potato top. tags: [british, dinner, comfort-food, kid-friendly, freezable, beginner]
- Shepherd's pie — the lamb version, with rosemary. tags: [british, dinner, comfort-food, kid-friendly, freezable, beginner]
- Vegetarian shepherd's pie — green lentil and mushroom base. tags: [british, dinner, comfort-food, vegetarian, freezable, beginner]
- Vegan cottage pie — lentil and red wine base, olive-oil-mashed top. tags: [british, dinner, comfort-food, vegetarian, vegan, freezable, beginner]
- Fish pie — smoked haddock, salmon, prawns under mashed-potato crust. tags: [british, dinner, comfort-food, freezable, intermediate]
- Smoked haddock and leek pie — single-fish version. tags: [british, dinner, comfort-food, freezable, beginner]
- Salmon and dill pie — fresh-salmon-only, lighter take. tags: [british, dinner, comfort-food, freezable, beginner]
- Pork pie — proper hot-water-crust raised pie with jellied stock. tags: [british, lunch, picnic, advanced]
- Melton Mowbray pie — the protected-name version with chopped pork shoulder. tags: [british, lunch, picnic, advanced]
- Gala pie — boiled egg running through the centre. tags: [british, lunch, picnic, intermediate]
- Game pie — venison, pheasant, partridge in raised pastry. tags: [british, lunch, festive, advanced]
- Cornish pasty — beef skirt, swede, potato, onion in shortcrust. tags: [british, lunch, lunchbox, freezable, intermediate]
- Cheese and onion pasty — vegetarian sibling of the Cornish. tags: [british, lunch, lunchbox, vegetarian, freezable, beginner]
- Beef and stilton pasty — modern variant. tags: [british, lunch, lunchbox, freezable, beginner]
- Forfar bridie — Scottish pasty with mince and onion. tags: [british, lunch, lunchbox, freezable, intermediate]
- Sausage roll — proper butter-puff with sage-and-onion sausagemeat. tags: [british, snack, picnic, freezable, beginner]
- Vegetarian sausage roll — Glamorgan-style cheese and leek. tags: [british, snack, picnic, vegetarian, freezable, beginner]
- Vegan sausage roll — lentil-and-mushroom version. tags: [british, snack, picnic, vegetarian, vegan, freezable, beginner]
- Scotch pie — double-crust mutton pie with a high pastry rim. tags: [british, lunch, lunchbox, freezable, intermediate]
- Stargazy pie — Cornish pilchard pie with fish heads poking through. tags: [british, dinner, regional, advanced]
- Squab pie — West Country lamb, apple, and onion pie. tags: [british, dinner, comfort-food, intermediate]
- Mutton pie — the older country relative of the steak pie. tags: [british, dinner, comfort-food, freezable, intermediate]
- Rabbit pie — old-school country pie with smoky bacon. tags: [british, dinner, comfort-food, intermediate]
- Beef Wellington — fillet wrapped in mushroom duxelles, parma ham, and golden puff pastry. tags: [british, dinner, festive, advanced]
- Salmon en croûte — Wellington logic with whole salmon fillet, spinach, and dill. tags: [british, dinner, festive, intermediate]
- Vegetarian Wellington — mushroom, chestnut, and spinach in puff pastry. tags: [british, dinner, festive, vegetarian, intermediate]
- Vegan Wellington — squash and lentil filling, vegan puff. tags: [british, dinner, festive, vegetarian, vegan, intermediate]

### Pub classics and traditional mains

- Fish and chips — beer-battered cod, twice-fried chips, mushy peas. tags: [british, dinner, comfort-food, intermediate]
- Beer-battered haddock — chip-shop classic with proper crisp batter. tags: [british, dinner, comfort-food, intermediate]
- Goujons — strip-cut fish in panko for kids. tags: [british, dinner, kid-friendly, beginner]
- Scampi — breaded langoustine tails, lemon and tartare. tags: [british, dinner, comfort-food, beginner]
- Bangers and mash — Cumberland sausages, buttery mash, onion gravy. tags: [british, dinner, comfort-food, kid-friendly, beginner]
- Toad in the hole — see Sunday-roast section. tags: [british, dinner, comfort-food, kid-friendly, beginner]
- Sausage and mash with caramelised onions — pub-menu standard. tags: [british, dinner, comfort-food, beginner]
- Pork chops with cider and apples — Somerset style. tags: [british, dinner, weeknight, beginner]
- Pork chops with mustard cream sauce — Slater-style midweek. tags: [british, dinner, weeknight, beginner]
- Liver and onions — calf's or lamb's liver, sage, gravy. tags: [british, dinner, weeknight, beginner]
- Faggots — minced offal patties in onion gravy. tags: [british, dinner, comfort-food, intermediate]
- Black pudding hash — cubed black pudding fried with potato and onion. tags: [british, breakfast, comfort-food, beginner]
- Bubble and squeak — leftover roast potatoes and greens fried into a cake. tags: [british, breakfast, comfort-food, vegetarian, beginner]
- Corned beef hash — tinned corned beef, potato, fried egg. tags: [british, dinner, comfort-food, weeknight, beginner]
- Welsh rarebit — cheese, mustard, beer, grilled on toast. tags: [british, lunch, comfort-food, vegetarian, beginner]
- Buck rarebit — Welsh rarebit with a poached egg on top. tags: [british, lunch, comfort-food, vegetarian, beginner]
- Cheese on toast — the proper grilled version with worcestershire and mustard. tags: [british, snack, comfort-food, vegetarian, beginner]
- Ploughman's lunch — cheddar, pickle, pork pie, apple, crusty bread. tags: [british, lunch, picnic, beginner]
- Coronation chicken — cold chicken in curried mayonnaise with apricot. tags: [british, lunch, picnic, beginner]
- Coronation chicken sandwich — the proper lunchbox version. tags: [british, lunch, lunchbox, beginner]
- Cheese and pickle sandwich — cheddar with Branston, on granary. tags: [british, lunch, lunchbox, vegetarian, beginner]
- Egg and cress sandwich — boiled egg, salad cress, on white. tags: [british, lunch, lunchbox, vegetarian, beginner]
- Prawn cocktail — Marie Rose sauce, iceberg, on a wedge of lemon. tags: [british, dinner, retro, beginner]
- Devilled eggs — paprika, mustard, chive. tags: [british, snack, party, vegetarian, beginner]
- Devilled kidneys — quick lambs' kidneys with worcestershire and mustard. tags: [british, breakfast, beginner]
- Kedgeree — smoked haddock, rice, boiled egg, curry-house spices. tags: [british, breakfast, comfort-food, intermediate]
- Smoked-haddock chowder — milky, leek-based bowl. tags: [british, lunch, comfort-food, beginner]
- Cullen skink — Scottish smoked-haddock, potato, leek soup. tags: [british, lunch, comfort-food, regional, beginner]
- Scotch broth — mutton, barley, root vegetable soup. tags: [british, lunch, comfort-food, batch-cook, beginner]
- Cock-a-leekie — Scottish chicken, leek, prune broth. tags: [british, dinner, comfort-food, regional, beginner]
- Welsh cawl — slow-cooked lamb, root veg, leek broth. tags: [british, dinner, comfort-food, regional, beginner]
- Lancashire hotpot — sliced lamb, potato lid, all-day oven. tags: [british, dinner, comfort-food, batch-cook, intermediate]
- Irish stew — proper lamb-neck, potato, onion stew. tags: [british, dinner, comfort-food, freezable, beginner]
- Beef stew with herb dumplings — winter Sunday classic. tags: [british, dinner, comfort-food, freezable, beginner]
- Beef and Guinness stew — slow-braised, dark and rich. tags: [british, dinner, comfort-food, freezable, beginner]
- Oxtail stew — gelatinous and deep, served with mash. tags: [british, dinner, comfort-food, freezable, intermediate]
- Boiled bacon and cabbage — Irish farmhouse plate with parsley sauce. tags: [british, dinner, comfort-food, regional, beginner]
- Bacon chop with parsley sauce — old-school plate dinner. tags: [british, dinner, weeknight, beginner]
- Gammon with parsley sauce — boiled and baked, served with peas. tags: [british, dinner, comfort-food, beginner]
- Gammon with pineapple — retro grill-pan version. tags: [british, dinner, retro, weeknight, beginner]
- Devilled mackerel — grilled with mustard butter. tags: [british, dinner, weeknight, beginner]
- Potted shrimp — Morecambe Bay tradition, spiced butter, toast. tags: [british, snack, picnic, beginner]
- Potted crab — Cromer-style, hot-cayenne butter. tags: [british, snack, picnic, beginner]
- Dressed crab — picked white and brown meat, served in the shell. tags: [british, lunch, picnic, intermediate]
- Crab linguine — see Italian. tags: [british, dinner, weeknight, beginner]

### Casseroles, hotpots, and one-pot dinners

- Beef stroganoff — see French / international. tags: [british, dinner, weeknight, intermediate]
- Beef and ale casserole — Slater-style with mustard mash. tags: [british, dinner, comfort-food, freezable, beginner]
- Brown stew — country-style root-and-meat braise. tags: [british, dinner, comfort-food, freezable, beginner]
- Chicken casserole with cider and tarragon — light supper braise. tags: [british, dinner, weeknight, beginner]
- Coq au vin — see French. tags: [british, dinner, comfort-food, intermediate]
- Chicken chasseur — pub-favourite tomato and mushroom braise. tags: [british, dinner, comfort-food, beginner]
- Hunter's chicken — Anglicised version with bacon, BBQ sauce, melted cheese. tags: [british, dinner, kid-friendly, comfort-food, beginner]
- Sausage casserole — sausages braised with butter beans and tomato. tags: [british, dinner, weeknight, kid-friendly, freezable, beginner]
- Lamb tagine — see Moroccan. tags: [british, dinner, comfort-food, freezable, beginner]
- Lamb hotpot with kidneys — Lancashire revival. tags: [british, dinner, comfort-food, intermediate]
- Pork and apple casserole — Bramleys, cider, mustard. tags: [british, dinner, comfort-food, freezable, beginner]
- Brown Windsor soup — Victorian beef-and-veg pottage. tags: [british, dinner, retro, beginner]
- Mulligatawny soup — Anglo-Indian curried lentil and meat broth. tags: [british, dinner, comfort-food, freezable, beginner]
- Beef and barley stew — Scottish farmhouse winter pot. tags: [british, dinner, comfort-food, freezable, beginner]
- Pearl-barley risotto with mushroom — British twist on Italian rice. tags: [british, dinner, vegetarian, weeknight, beginner]

### Regional specialities

- Yorkshire parkin — sticky oat-and-treacle traybake for Bonfire Night. tags: [british, dessert, regional, festive, vegetarian, beginner]
- Eccles cakes — currants, butter, puff pastry. tags: [british, dessert, regional, vegetarian, beginner]
- Banbury cakes — older cousin of the Eccles. tags: [british, dessert, regional, vegetarian, beginner]
- Bakewell tart — almond frangipane over raspberry jam. tags: [british, dessert, regional, vegetarian, beginner]
- Bakewell pudding — older version with set custard rather than frangipane. tags: [british, dessert, regional, vegetarian, intermediate]
- Maids of honour — Richmond curd tartlets. tags: [british, dessert, regional, vegetarian, intermediate]
- Singin' hinnies — Northumbrian griddle scones. tags: [british, dessert, regional, vegetarian, beginner]
- Pikelets — Yorkshire-style flat crumpets. tags: [british, breakfast, regional, vegetarian, beginner]
- Fat rascals — Yorkshire fruit-and-spice rock cakes. tags: [british, dessert, regional, vegetarian, beginner]
- Cornish saffron buns — yeasted, fruited, golden. tags: [british, breakfast, regional, vegetarian, intermediate]
- Cornish fairings — ginger biscuits with golden syrup. tags: [british, dessert, regional, vegetarian, beginner]
- Welsh cakes — griddle-cooked currant scones. tags: [british, dessert, regional, vegetarian, beginner]
- Bara brith — Welsh tea bread with overnight-soaked fruit. tags: [british, dessert, regional, vegetarian, beginner]
- Glamorgan sausages — leek, cheese, breadcrumb sausages. tags: [british, dinner, regional, vegetarian, beginner]
- Welsh rarebit — see Pub classics. tags: [british, lunch, regional, vegetarian, beginner]
- Laverbread — boiled seaweed, oatmeal, fried with bacon. tags: [british, breakfast, regional, beginner]
- Bara lawr — the Welsh-name version of laverbread. tags: [british, breakfast, regional, beginner]
- Scottish tablet — sandy-textured sweet fudge. tags: [british, dessert, regional, vegetarian, intermediate]
- Cranachan — toasted oats, raspberries, cream, whisky. tags: [british, dessert, regional, vegetarian, beginner]
- Atholl brose — whisky, cream, honey, oats. tags: [british, drink, regional, vegetarian, beginner]
- Drop scones — Scottish pancake-style griddle cakes. tags: [british, breakfast, regional, vegetarian, beginner]
- Stovies — beef-dripping potato hash. tags: [british, dinner, regional, comfort-food, beginner]
- Rumbledethumps — Scottish potato-and-cabbage bake. tags: [british, dinner, regional, vegetarian, beginner]
- Clootie dumpling — boiled-in-a-cloth fruit pudding. tags: [british, dessert, regional, vegetarian, intermediate]
- Dundee cake — fruit cake topped with whole almonds. tags: [british, dessert, regional, vegetarian, intermediate]
- Soda farls — Northern Irish skillet bread. tags: [british, breakfast, regional, vegetarian, beginner]
- Boxty — Irish potato pancakes. tags: [british, breakfast, regional, vegetarian, beginner]
- Colcannon — mashed potato with cabbage and butter. tags: [british, dinner, regional, vegetarian, beginner]
- Champ — mashed potato with spring onion. tags: [british, dinner, regional, vegetarian, beginner]
- Irish soda bread — see Baking. tags: [british, breakfast, regional, vegetarian, beginner]
- Brown soda bread — wholemeal Irish variant. tags: [british, breakfast, regional, vegetarian, beginner]

### British curry-house and Anglo-Asian comfort

- Chicken tikka masala — buttery tomato-cream sauce, charred chicken. tags: [british, indian-anglo, dinner, comfort-food, freezable, intermediate]
- Chicken korma — mild creamy almond curry. tags: [british, indian-anglo, dinner, kid-friendly, comfort-food, beginner]
- Chicken jalfrezi — bright, sharp curry with peppers and tomato. tags: [british, indian-anglo, dinner, weeknight, beginner]
- Lamb rogan josh — Anglicised Kashmiri-style, deep-red, fragrant. tags: [british, indian-anglo, dinner, freezable, intermediate]
- Lamb bhuna — thick, dry-fried curry. tags: [british, indian-anglo, dinner, freezable, beginner]
- Lamb dhansak — curry-house lentil-and-meat curry. tags: [british, indian-anglo, dinner, freezable, intermediate]
- Lamb madras — fiery red curry-house staple. tags: [british, indian-anglo, dinner, freezable, intermediate]
- Lamb vindaloo — chilli-vinegar-garlic Anglo version. tags: [british, indian-anglo, dinner, intermediate]
- Beef vindaloo — beef-cubed alternative. tags: [british, indian-anglo, dinner, intermediate]
- Phaal — extreme-chilli curry-house dare-dish. tags: [british, indian-anglo, dinner, advanced]
- Chicken pathia — sweet, sour, hot, fenugreek-led. tags: [british, indian-anglo, dinner, intermediate]
- Chicken dopiaza — onion-heavy, two-stage-onion curry. tags: [british, indian-anglo, dinner, beginner]
- Chicken passanda — almond and cream, mildest of mild. tags: [british, indian-anglo, dinner, kid-friendly, beginner]
- Chicken biryani — Anglicised one-pot rice dish. tags: [british, indian-anglo, dinner, comfort-food, intermediate]
- Lamb biryani — slow-cooked, saffron-and-mint topped. tags: [british, indian-anglo, dinner, comfort-food, intermediate]
- King prawn balti — small-bowl, hot, fragrant curry. tags: [british, indian-anglo, dinner, weeknight, beginner]
- Chicken tikka — yoghurt-marinated grilled cubes. tags: [british, indian-anglo, dinner, weeknight, beginner]
- Tandoori chicken — Anglicised, oven-baked version. tags: [british, indian-anglo, dinner, weeknight, beginner]
- Onion bhaji — gram-flour fritters with sliced onion. tags: [british, indian-anglo, snack, vegetarian, vegan, beginner]
- Vegetable samosa — fried, potato-and-pea-filled triangles. tags: [british, indian-anglo, snack, vegetarian, vegan, intermediate]
- Lamb samosa — minced-lamb filling. tags: [british, indian-anglo, snack, intermediate]
- Bombay potato — turmeric, mustard-seed, cumin potatoes. tags: [british, indian-anglo, side, vegetarian, vegan, beginner]
- Saag aloo — spinach and potato side. tags: [british, indian-anglo, side, vegetarian, vegan, beginner]
- Saag paneer — spinach with cubes of paneer. tags: [british, indian-anglo, dinner, vegetarian, beginner]
- Tarka dhal — yellow split lentils with cumin-tempered ghee. tags: [british, indian-anglo, dinner, vegetarian, vegan, beginner]
- Chana masala — chickpea curry, tomato-led. tags: [british, indian-anglo, dinner, vegetarian, vegan, freezable, beginner]
- Aloo gobi — potato and cauliflower dry curry. tags: [british, indian-anglo, dinner, vegetarian, vegan, beginner]
- Mushroom bhaji — quick dry-fry mushroom curry. tags: [british, indian-anglo, side, vegetarian, vegan, beginner]
- Pilau rice — yellow, cardamom-scented rice. tags: [british, indian-anglo, side, vegetarian, vegan, beginner]
- Mushroom rice — quick takeaway-style rice. tags: [british, indian-anglo, side, vegetarian, beginner]
- Peshwari naan — sweet coconut-and-sultana stuffed naan. tags: [british, indian-anglo, side, vegetarian, intermediate]
- Garlic naan — quick yoghurt-dough naan in a pan. tags: [british, indian-anglo, side, vegetarian, beginner]
- Plain naan — base-recipe griddle naan. tags: [british, indian-anglo, side, vegetarian, beginner]
- Raita — yoghurt, cucumber, mint side. tags: [british, indian-anglo, side, vegetarian, beginner]
- Mango chutney — see Preserves. tags: [british, indian-anglo, side, vegetarian, vegan, beginner]
- Mint sauce (Indian-style) — fresh-mint, yoghurt curry-house dip. tags: [british, indian-anglo, side, vegetarian, beginner]

### Quick and weeknight British plates

- Spaghetti bolognese — UK home version with mince, tomato, herbs. tags: [british, italian, dinner, weeknight, kid-friendly, freezable, beginner]
- Cottage pie jacket potato — leftover-mince mash-up. tags: [british, dinner, weeknight, kid-friendly, beginner]
- Jacket potato with cheese and beans — Tuesday-night classic. tags: [british, dinner, weeknight, kid-friendly, vegetarian, beginner]
- Jacket potato with tuna mayo and sweetcorn — kid-friendly. tags: [british, dinner, weeknight, kid-friendly, beginner]
- Jacket potato with prawn and Marie Rose. tags: [british, dinner, weeknight, beginner]
- Jacket potato with chilli con carne. tags: [british, dinner, weeknight, kid-friendly, beginner]
- Cheesy pasta bake — penne, tomato, cheddar top. tags: [british, dinner, weeknight, kid-friendly, freezable, beginner]
- Tuna pasta bake — store-cupboard standard. tags: [british, dinner, weeknight, kid-friendly, freezable, beginner]
- Macaroni cheese — proper British béchamel-and-cheddar. tags: [british, dinner, comfort-food, kid-friendly, vegetarian, freezable, beginner]
- Cauliflower mac and cheese — vegetable-led version. tags: [british, dinner, comfort-food, vegetarian, beginner]
- Spaghetti hoops on toast — tinned, retro, comfort. tags: [british, breakfast, comfort-food, kid-friendly, vegetarian, beginner]
- Beans on toast — proper version with butter and pepper. tags: [british, breakfast, comfort-food, kid-friendly, vegetarian, beginner]
- Beans on toast with cheese — melted-cheddar elevation. tags: [british, breakfast, kid-friendly, vegetarian, beginner]
- Egg and chips — fried egg, oven chips, salt. tags: [british, dinner, comfort-food, weeknight, vegetarian, beginner]
- Sausage sandwich — proper white-bread, brown-sauce version. tags: [british, breakfast, comfort-food, beginner]
- Bacon sandwich — white bread, butter, brown sauce or ketchup. tags: [british, breakfast, comfort-food, beginner]
- Bacon and egg sandwich — runny yolk on white. tags: [british, breakfast, comfort-food, beginner]
- Fish-finger sandwich — proper white-bread version, tartare and lettuce. tags: [british, lunch, comfort-food, kid-friendly, beginner]
- Chip butty — chips, butter, white bread. tags: [british, snack, comfort-food, kid-friendly, vegetarian, beginner]
- Crisp sandwich — Walker's salt-and-vinegar on white bread. tags: [british, snack, comfort-food, vegetarian, beginner]
- Sausage and chips — chip-shop weekday tea. tags: [british, dinner, comfort-food, weeknight, beginner]
- Pie and chips — chip-shop steak pie with chips and curry sauce. tags: [british, dinner, comfort-food, weeknight, beginner]
- Pie and mash with liquor — East End classic. tags: [british, dinner, regional, comfort-food, intermediate]
- Saveloy with chips — pink-sausage chippy classic. tags: [british, dinner, comfort-food, weeknight, beginner]
- Battered sausage — chip-shop staple. tags: [british, dinner, comfort-food, weeknight, beginner]
- Chip-shop curry sauce — savoury, mild, ketchup-coloured. tags: [british, side, comfort-food, vegetarian, vegan, beginner]

### Tea-time and high-tea savouries

- Cucumber sandwich — proper crustless triangles. tags: [british, snack, picnic, vegetarian, beginner]
- Egg-mayo and cress sandwich — high-tea standard. tags: [british, snack, picnic, vegetarian, beginner]
- Smoked-salmon sandwich — brown bread, butter, dill. tags: [british, snack, picnic, beginner]
- Tea sandwiches — finger-cut variety platter. tags: [british, snack, party, beginner]
- Devilled-ham sandwich — old-school spicy ham-paste filling. tags: [british, snack, picnic, beginner]
- Sausage-and-egg pie — cold-cut picnic loaf. tags: [british, lunch, picnic, freezable, intermediate]
- Picnic pie — slab pie of cold meats and pickles. tags: [british, lunch, picnic, freezable, advanced]

---

## Italian

Marcella Hazan, Anna Del Conte, the Silver Spoon, and Pellegrino Artusi
(`La scienza in cucina`, 1891, public domain in Italy) sit as the spine.
Pasta dominates by volume; regional pasta dishes get their own sub-sections
since the cuisine is regional, not national.

### Pasta — long shapes

- Spaghetti alle vongole — clams, garlic, parsley, dry white wine. tags: [italian, dinner, weeknight, intermediate]
- Spaghetti alle vongole in bianco — no-tomato version, traditional. tags: [italian, dinner, weeknight, intermediate]
- Spaghetti alle vongole rosso — tomato-led southern variant. tags: [italian, dinner, weeknight, intermediate]
- Spaghetti aglio, olio, e peperoncino — garlic, oil, chilli, parsley. tags: [italian, dinner, weeknight, vegetarian, vegan, beginner]
- Spaghetti carbonara — guanciale, egg yolk, pecorino, black pepper. No cream. tags: [italian, dinner, weeknight, comfort-food, intermediate]
- Spaghetti alla gricia — carbonara's eggless older relative. tags: [italian, dinner, weeknight, intermediate]
- Spaghetti cacio e pepe — pecorino, black pepper, pasta water. tags: [italian, dinner, weeknight, vegetarian, intermediate]
- Spaghetti alla puttanesca — tomato, olive, caper, anchovy. tags: [italian, dinner, weeknight, beginner]
- Spaghetti alla Norma — fried aubergine, tomato, ricotta salata. tags: [italian, dinner, weeknight, vegetarian, beginner]
- Spaghetti al tonno — tinned-tuna, tomato, caper. tags: [italian, dinner, weeknight, beginner]
- Spaghetti con bottarga — grated cured grey-mullet roe. tags: [italian, dinner, dinner-party, intermediate]
- Spaghetti al limone — lemon zest, butter, parmesan. tags: [italian, dinner, weeknight, vegetarian, beginner]
- Spaghetti al pomodoro — Hazan's three-ingredient tomato sauce. tags: [italian, dinner, weeknight, vegetarian, vegan, beginner]
- Spaghetti alle cozze — mussels, garlic, parsley, white wine. tags: [italian, dinner, weeknight, beginner]
- Spaghetti ai ricci di mare — sea-urchin, butter, lemon. tags: [italian, dinner, dinner-party, advanced]
- Spaghetti alla nerano — courgette, basil, provolone. tags: [italian, dinner, weeknight, vegetarian, beginner]
- Linguine al pesto — basil pesto with green beans and potato. tags: [italian, dinner, weeknight, vegetarian, beginner]
- Linguine alle vongole — flat-noodle vongole. tags: [italian, dinner, weeknight, intermediate]
- Linguine al granchio — brown-and-white crab, lemon, chilli. tags: [italian, dinner, weeknight, intermediate]
- Linguine all'astice — whole lobster, tomato, brandy. tags: [italian, dinner, dinner-party, advanced]
- Linguine ai gamberi — prawns, garlic, white wine. tags: [italian, dinner, weeknight, beginner]
- Bucatini all'amatriciana — guanciale, tomato, pecorino. tags: [italian, dinner, weeknight, intermediate]
- Bucatini alla puttanesca — long-tube version. tags: [italian, dinner, weeknight, beginner]
- Fettuccine alfredo — proper Roman version, just butter and parmesan. tags: [italian, dinner, weeknight, vegetarian, beginner]
- Fettuccine al burro e salvia — sage-butter ribbons. tags: [italian, dinner, weeknight, vegetarian, beginner]
- Fettuccine ai funghi porcini — dried-porcini cream sauce. tags: [italian, dinner, weeknight, vegetarian, beginner]
- Tagliatelle al ragù bolognese — the proper, slow-cooked Bolognese. tags: [italian, dinner, comfort-food, freezable, intermediate]
- Tagliatelle al tartufo — fresh-truffle ribbons, butter, parmesan. tags: [italian, dinner, dinner-party, advanced]
- Tagliatelle ai funghi — mixed-mushroom and parsley. tags: [italian, dinner, weeknight, vegetarian, beginner]
- Pappardelle al cinghiale — Tuscan wild-boar ragù. tags: [italian, dinner, comfort-food, freezable, intermediate]
- Pappardelle al ragù di lepre — hare ragù. tags: [italian, dinner, dinner-party, freezable, advanced]
- Pappardelle al ragù di anatra — duck ragù. tags: [italian, dinner, comfort-food, freezable, intermediate]
- Pappardelle ai porcini — wide-ribbon porcini. tags: [italian, dinner, weeknight, vegetarian, beginner]
- Pappardelle ai funghi misti — mixed-mushroom version. tags: [italian, dinner, weeknight, vegetarian, beginner]
- Trofie al pesto — Ligurian twisted pasta with potato, green beans, and pesto. tags: [italian, dinner, weeknight, vegetarian, beginner]
- Trenette al pesto — flat-noodle Ligurian version. tags: [italian, dinner, weeknight, vegetarian, beginner]
- Pici cacio e pepe — Tuscan hand-rolled noodles in pecorino. tags: [italian, dinner, weeknight, vegetarian, intermediate]
- Pici all'aglione — Tuscan giant-garlic and tomato. tags: [italian, dinner, weeknight, vegetarian, vegan, beginner]
- Pici con le briciole — sardines, breadcrumbs, fennel. tags: [italian, dinner, weeknight, intermediate]

### Pasta — short shapes

- Penne all'arrabbiata — tomato, garlic, chilli, parsley. tags: [italian, dinner, weeknight, vegetarian, vegan, beginner]
- Penne alla vodka — tomato, vodka, cream. tags: [italian, dinner, weeknight, beginner]
- Penne alla boscaiola — mushroom, sausage, peas. tags: [italian, dinner, weeknight, beginner]
- Penne al salmone — smoked salmon, cream, dill. tags: [italian, dinner, weeknight, beginner]
- Penne ai quattro formaggi — four-cheese sauce. tags: [italian, dinner, weeknight, vegetarian, beginner]
- Penne con melanzane — fried-aubergine and tomato. tags: [italian, dinner, weeknight, vegetarian, vegan, beginner]
- Penne con broccoli — chilli, garlic, anchovy. tags: [italian, dinner, weeknight, beginner]
- Penne con tonno e olive — tinned-tuna and black olive. tags: [italian, dinner, weeknight, beginner]
- Rigatoni all'amatriciana — short-tube Amatriciana. tags: [italian, dinner, weeknight, intermediate]
- Rigatoni alla pajata — Roman offal classic. tags: [italian, dinner, regional, advanced]
- Rigatoni alla genovese — slow-cooked onion-and-beef sauce. tags: [italian, dinner, comfort-food, intermediate]
- Rigatoni alla norcina — sausage and cream, with truffle if you've got it. tags: [italian, dinner, weeknight, intermediate]
- Rigatoni con polpettine — tiny meatballs, tomato. tags: [italian, dinner, kid-friendly, beginner]
- Ziti al forno — Neapolitan baked pasta. tags: [italian, dinner, comfort-food, freezable, intermediate]
- Pasta alla zozzona — Roman pile-up of guanciale, sausage, egg, tomato. tags: [italian, dinner, comfort-food, intermediate]
- Orecchiette con cime di rapa — Pugliese broccoli-rabe and anchovy. tags: [italian, dinner, weeknight, beginner]
- Orecchiette con salsiccia — sausage-and-broccoli short. tags: [italian, dinner, weeknight, beginner]
- Conchiglie al pesto — shell pasta with classic basil pesto. tags: [italian, dinner, weeknight, vegetarian, beginner]
- Farfalle al salmone — bowtie pasta, smoked salmon, cream. tags: [italian, dinner, weeknight, beginner]
- Farfalle estive — cold pasta salad with tomato, mozzarella, basil. tags: [italian, lunch, lunchbox, vegetarian, beginner]
- Fusilli alla caprese — cold tomato-mozzarella pasta. tags: [italian, lunch, lunchbox, vegetarian, beginner]
- Mezze maniche alla gricia — short-tube gricia. tags: [italian, dinner, weeknight, intermediate]
- Mezze maniche cacio e pepe — short-tube cacio e pepe. tags: [italian, dinner, weeknight, vegetarian, intermediate]
- Paccheri al ragù di pesce — giant tubes, fish ragù. tags: [italian, dinner, dinner-party, intermediate]
- Lumache al sugo — snail-shell pasta with slow-cooked tomato. tags: [italian, dinner, weeknight, vegetarian, vegan, beginner]
- Cavatelli con i broccoli — Pugliese broccoli-and-pasta. tags: [italian, dinner, weeknight, vegetarian, beginner]

### Pasta — stuffed and baked

- Lasagne alla bolognese — proper layered version, ragù, béchamel, pasta. tags: [italian, dinner, comfort-food, freezable, intermediate]
- Lasagne verdi — green spinach pasta lasagne. tags: [italian, dinner, comfort-food, intermediate]
- Quick weeknight lasagne — passata-based, quick béchamel, 30-minute oven. tags: [italian, dinner, weeknight, kid-friendly, beginner]
- Vegetarian butternut lasagne — squash and spinach in béchamel. tags: [italian, dinner, vegetarian, comfort-food, freezable, intermediate]
- Vegan lasagne — lentil ragù, cashew béchamel. tags: [italian, dinner, vegetarian, vegan, comfort-food, freezable, intermediate]
- Aubergine lasagne — fried aubergine in place of meat. tags: [italian, dinner, vegetarian, comfort-food, intermediate]
- Mushroom lasagne — porcini and chestnut mushroom layers. tags: [italian, dinner, vegetarian, comfort-food, intermediate]
- Seafood lasagne — prawn, crab, salmon in béchamel. tags: [italian, dinner, dinner-party, intermediate]
- Cannelloni di ricotta e spinaci — ricotta-and-spinach stuffed tubes. tags: [italian, dinner, vegetarian, comfort-food, freezable, intermediate]
- Cannelloni di carne — minced-beef-and-veal filling. tags: [italian, dinner, comfort-food, freezable, intermediate]
- Manicotti — Italian-American crepe version. tags: [italian, dinner, comfort-food, freezable, intermediate]
- Ravioli di ricotta e spinaci — fresh-pasta classic. tags: [italian, dinner, vegetarian, dinner-party, intermediate]
- Ravioli di zucca — Mantuan pumpkin and amaretti. tags: [italian, dinner, vegetarian, dinner-party, intermediate]
- Ravioli al burro e salvia — sage-butter ravioli. tags: [italian, dinner, vegetarian, dinner-party, beginner]
- Ravioli all'uovo — single-yolk-filled fresh ravioli. tags: [italian, dinner, dinner-party, advanced]
- Tortellini in brodo — pork-stuffed tortellini in capon broth. tags: [italian, dinner, comfort-food, advanced]
- Tortelloni di ricotta — fresh, hand-formed pillows. tags: [italian, dinner, vegetarian, dinner-party, intermediate]
- Agnolotti al plin — Piemontese pinched stuffed pasta. tags: [italian, dinner, dinner-party, advanced]
- Pansotti con salsa di noci — Ligurian stuffed pasta in walnut sauce. tags: [italian, dinner, vegetarian, dinner-party, intermediate]
- Culurgiones — Sardinian potato-mint-pecorino stuffed pasta. tags: [italian, dinner, vegetarian, dinner-party, advanced]

### Pasta — fresh and shapes from scratch

- Egg pasta — flour, yolk, salt; rolling pin or machine. tags: [italian, technique-related, vegetarian, beginner]
- Semolina pasta — water-and-semolina southern dough. tags: [italian, technique-related, vegetarian, vegan, beginner]
- Tagliatelle — fresh ribbon cut. tags: [italian, technique-related, vegetarian, beginner]
- Tagliolini — fine fresh ribbons. tags: [italian, technique-related, vegetarian, beginner]
- Pappardelle — wide hand-cut ribbons. tags: [italian, technique-related, vegetarian, beginner]
- Garganelli — hand-ridged tubes. tags: [italian, technique-related, vegetarian, intermediate]
- Cavatelli — hand-rolled semolina shells. tags: [italian, technique-related, vegetarian, vegan, intermediate]
- Strozzapreti — hand-twisted Romagna pasta. tags: [italian, technique-related, vegetarian, intermediate]
- Pici — fat hand-rolled Tuscan noodles. tags: [italian, technique-related, vegetarian, intermediate]
- Trofie — Ligurian hand-rolled twists. tags: [italian, technique-related, vegetarian, vegan, intermediate]
- Orecchiette — Pugliese ear-shaped pasta. tags: [italian, technique-related, vegetarian, vegan, intermediate]
- Maltagliati — "badly-cut" off-cut shapes for soup. tags: [italian, technique-related, vegetarian, beginner]

### Rice, risotti, polenta

- Risotto alla milanese — saffron, beef-marrow, butter. tags: [italian, dinner, dinner-party, intermediate]
- Risotto ai funghi porcini — dried-porcini, parmesan. tags: [italian, dinner, comfort-food, vegetarian, intermediate]
- Risotto ai funghi misti — mixed-mushroom. tags: [italian, dinner, comfort-food, vegetarian, intermediate]
- Risotto al tartufo — fresh-truffle risotto. tags: [italian, dinner, dinner-party, vegetarian, advanced]
- Risotto al barolo — red-wine risotto. tags: [italian, dinner, dinner-party, intermediate]
- Risotto alla pescatora — seafood risotto. tags: [italian, dinner, dinner-party, intermediate]
- Risotto allo zafferano — saffron-only version. tags: [italian, dinner, dinner-party, vegetarian, intermediate]
- Risotto agli asparagi — asparagus risotto, spring. tags: [italian, dinner, weeknight, vegetarian, intermediate]
- Risotto alla zucca — pumpkin-and-amaretti risotto. tags: [italian, dinner, weeknight, vegetarian, intermediate]
- Risotto alle cozze — mussel risotto. tags: [italian, dinner, dinner-party, intermediate]
- Risotto al radicchio — bitter-leaf risotto. tags: [italian, dinner, weeknight, vegetarian, intermediate]
- Risotto al limone — lemon and parsley risotto. tags: [italian, dinner, weeknight, vegetarian, intermediate]
- Risotto al nero di seppia — squid-ink risotto. tags: [italian, dinner, dinner-party, intermediate]
- Risotto con piselli — risi e bisi, Venetian pea risotto. tags: [italian, dinner, weeknight, vegetarian, intermediate]
- Risotto al gorgonzola — blue-cheese risotto. tags: [italian, dinner, weeknight, vegetarian, intermediate]
- Vegan mushroom risotto — olive-oil, no butter, no cheese. tags: [italian, dinner, vegetarian, vegan, intermediate]
- Arancini — Sicilian fried rice balls. tags: [italian, snack, party, intermediate]
- Arancini al ragù — beef-ragù-filled. tags: [italian, snack, party, intermediate]
- Arancini al burro — butter-and-mozzarella filled. tags: [italian, snack, party, vegetarian, intermediate]
- Suppli — Roman rice croquettes with melted mozzarella heart. tags: [italian, snack, party, vegetarian, intermediate]
- Polenta morbida — soft, butter-and-parmesan polenta. tags: [italian, dinner, comfort-food, vegetarian, beginner]
- Polenta with ragù — set polenta, slow-cooked meat sauce. tags: [italian, dinner, comfort-food, intermediate]
- Polenta with mushrooms — porcini polenta. tags: [italian, dinner, comfort-food, vegetarian, intermediate]
- Polenta concia — alpine cheese-melted polenta. tags: [italian, dinner, comfort-food, vegetarian, intermediate]
- Polenta with gorgonzola — Lombardy classic. tags: [italian, dinner, comfort-food, vegetarian, beginner]
- Grilled polenta wedges — set, sliced, charred. tags: [italian, side, comfort-food, vegetarian, beginner]
- Polenta taragna — buckwheat-flour polenta. tags: [italian, dinner, regional, vegetarian, intermediate]

### Pizza

- Pizza margherita — tomato, mozzarella, basil. The benchmark. tags: [italian, dinner, comfort-food, vegetarian, intermediate]
- Pizza marinara — tomato, garlic, oregano. No cheese. tags: [italian, dinner, comfort-food, vegetarian, vegan, beginner]
- Pizza napoletana — proper Neapolitan, slow-rise dough. tags: [italian, dinner, friday-pizza, vegetarian, intermediate]
- Pizza romana — Roman thin-crust. tags: [italian, dinner, friday-pizza, vegetarian, intermediate]
- Pizza siciliana — sfincione-style thick Sicilian. tags: [italian, dinner, friday-pizza, vegetarian, intermediate]
- Pizza al taglio — Roman pan-style by-the-slice. tags: [italian, dinner, friday-pizza, vegetarian, intermediate]
- Pizza in teglia — home-tray Roman style. tags: [italian, dinner, friday-pizza, vegetarian, beginner]
- Pizza bianca — tomato-free oil-and-rosemary base. tags: [italian, snack, friday-pizza, vegetarian, beginner]
- Pizza diavola — spicy salami, chilli. tags: [italian, dinner, friday-pizza, beginner]
- Pizza quattro stagioni — four seasons (ham, mushroom, artichoke, olive). tags: [italian, dinner, friday-pizza, beginner]
- Pizza quattro formaggi — four-cheese. tags: [italian, dinner, friday-pizza, vegetarian, beginner]
- Pizza prosciutto e funghi — ham and mushroom. tags: [italian, dinner, friday-pizza, beginner]
- Pizza capricciosa — ham, mushroom, artichoke, olive, egg. tags: [italian, dinner, friday-pizza, beginner]
- Pizza salame piccante — pepperoni-equivalent. tags: [italian, dinner, friday-pizza, kid-friendly, beginner]
- Pizza prosciutto e rucola — Parma ham, rocket, parmesan after baking. tags: [italian, dinner, friday-pizza, beginner]
- Pizza tonno e cipolla — tuna and onion. tags: [italian, dinner, friday-pizza, beginner]
- Pizza ai frutti di mare — seafood pizza. tags: [italian, dinner, friday-pizza, intermediate]
- Pizza al tartufo — truffle-oil and mushroom. tags: [italian, dinner, friday-pizza, vegetarian, intermediate]
- Pizza fritta — Neapolitan fried pizza. tags: [italian, dinner, friday-pizza, intermediate]
- Calzone — folded pizza turnover. tags: [italian, dinner, friday-pizza, intermediate]
- Calzone ricotta e salame — classic filled calzone. tags: [italian, dinner, friday-pizza, intermediate]
- Calzone di scarola — Pugliese escarole calzone. tags: [italian, dinner, friday-pizza, vegetarian, intermediate]
- Pizza dough — 24-hour slow-rise base recipe. tags: [italian, technique-related, vegetarian, vegan, intermediate]
- Pizza dough — same-day fast-rise. tags: [italian, technique-related, vegetarian, vegan, beginner]
- Sourdough pizza dough — see Baking. tags: [italian, technique-related, vegetarian, vegan, intermediate]
- Sfincione — Sicilian thick-base pizza with breadcrumb. tags: [italian, dinner, regional, vegetarian, intermediate]

### Antipasti and starters

- Bruschetta al pomodoro — tomato, garlic, basil on grilled bread. tags: [italian, snack, party, vegetarian, vegan, beginner]
- Bruschetta with cannellini — white-bean, sage, olive-oil. tags: [italian, snack, party, vegetarian, vegan, beginner]
- Crostini con fegatini — Tuscan chicken-liver toasts. tags: [italian, snack, dinner-party, intermediate]
- Crostini misti — antipasto-platter assorted toasts. tags: [italian, snack, party, intermediate]
- Caprese salad — tomato, mozzarella, basil. tags: [italian, lunch, summer, vegetarian, beginner]
- Burrata with peaches — summer plate. tags: [italian, lunch, summer, vegetarian, beginner]
- Burrata with tomato and basil — peak-summer classic. tags: [italian, lunch, summer, vegetarian, beginner]
- Mozzarella di bufala con prosciutto — assembled antipasto. tags: [italian, lunch, dinner-party, beginner]
- Carpaccio di manzo — sliced raw beef, parmesan, lemon. tags: [italian, dinner, dinner-party, intermediate]
- Carpaccio di tonno — raw-tuna version. tags: [italian, dinner, dinner-party, intermediate]
- Vitello tonnato — cold sliced veal in tuna-caper sauce. tags: [italian, dinner, dinner-party, intermediate]
- Insalata di mare — mixed-seafood salad. tags: [italian, dinner, dinner-party, intermediate]
- Insalata di polpo — octopus, potato, parsley salad. tags: [italian, dinner, dinner-party, intermediate]
- Carciofi alla romana — Roman braised artichokes. tags: [italian, side, vegetarian, vegan, intermediate]
- Carciofi alla giudia — Roman fried artichokes. tags: [italian, side, vegetarian, vegan, advanced]
- Fritto misto — mixed seafood fry. tags: [italian, dinner, party, intermediate]
- Fritto misto di verdure — vegetable fry. tags: [italian, side, vegetarian, intermediate]
- Olive ascolane — stuffed-and-fried olives. tags: [italian, snack, party, advanced]
- Mozzarella in carrozza — mozzarella sandwich, breaded and fried. tags: [italian, snack, party, vegetarian, beginner]
- Crocchette di patate — Italian potato croquettes. tags: [italian, snack, party, vegetarian, beginner]
- Frittata di cipolle — onion frittata. tags: [italian, lunch, weeknight, vegetarian, beginner]
- Frittata di asparagi — asparagus frittata. tags: [italian, lunch, weeknight, vegetarian, beginner]
- Frittata di zucchine — courgette frittata. tags: [italian, lunch, weeknight, vegetarian, beginner]
- Frittata di pasta — leftover-spaghetti frittata. tags: [italian, lunch, lunchbox, vegetarian, beginner]
- Bagna càuda — Piemontese garlic-anchovy dip with vegetables. tags: [italian, snack, dinner-party, regional, intermediate]

### Meat mains

- Osso buco alla milanese — veal-shank braise, gremolata. tags: [italian, dinner, comfort-food, intermediate]
- Osso buco alla gremolata — classic finish. tags: [italian, dinner, comfort-food, intermediate]
- Stracotto — Tuscan slow-braised beef in red wine. tags: [italian, dinner, comfort-food, freezable, intermediate]
- Brasato al barolo — Piemontese Barolo-braised beef. tags: [italian, dinner, comfort-food, freezable, intermediate]
- Bollito misto — northern mixed-boiled-meats platter. tags: [italian, dinner, dinner-party, advanced]
- Saltimbocca alla romana — veal with prosciutto and sage. tags: [italian, dinner, dinner-party, intermediate]
- Scaloppine al limone — veal with lemon and butter. tags: [italian, dinner, weeknight, beginner]
- Scaloppine al marsala — veal in marsala-mushroom sauce. tags: [italian, dinner, weeknight, intermediate]
- Cotoletta alla milanese — bone-in veal cutlet, breaded and fried. tags: [italian, dinner, comfort-food, intermediate]
- Bistecca alla fiorentina — thick T-bone, charred, rare. tags: [italian, dinner, dinner-party, intermediate]
- Tagliata di manzo — sliced steak, rocket, parmesan. tags: [italian, dinner, weeknight, beginner]
- Polpette al sugo — Italian meatballs in tomato sauce. tags: [italian, dinner, kid-friendly, comfort-food, freezable, beginner]
- Polpettone — Italian meatloaf. tags: [italian, dinner, comfort-food, freezable, beginner]
- Spezzatino di manzo — Italian beef stew. tags: [italian, dinner, comfort-food, freezable, beginner]
- Spezzatino di vitello — veal stew. tags: [italian, dinner, comfort-food, freezable, intermediate]
- Coda alla vaccinara — Roman oxtail stew. tags: [italian, dinner, comfort-food, regional, advanced]
- Pollo alla cacciatora — hunter's chicken with tomato, herbs, wine. tags: [italian, dinner, comfort-food, freezable, beginner]
- Pollo al limone — lemon-roast chicken pieces. tags: [italian, dinner, weeknight, beginner]
- Pollo con peperoni — chicken with peppers, Roman classic. tags: [italian, dinner, weeknight, beginner]
- Pollo alla diavola — flattened chicken, chilli, lemon. tags: [italian, dinner, weeknight, beginner]
- Pollo alla milanese — breaded chicken cutlet. tags: [italian, dinner, kid-friendly, beginner]
- Pollo alla romana — Roman chicken with peppers and tomato. tags: [italian, dinner, weeknight, beginner]
- Faraona arrosto — roast guinea fowl. tags: [italian, dinner, dinner-party, intermediate]
- Coniglio in umido — braised rabbit, olive, herb. tags: [italian, dinner, dinner-party, intermediate]
- Coniglio alla cacciatora — hunter's-style rabbit. tags: [italian, dinner, dinner-party, intermediate]
- Cinghiale in umido — Tuscan wild-boar stew. tags: [italian, dinner, freezable, intermediate]
- Porchetta — herb-stuffed roast pork belly. tags: [italian, dinner, festive, intermediate]
- Maiale al latte — pork braised in milk. tags: [italian, dinner, dinner-party, intermediate]
- Salsiccia e fagioli — sausage and bean stew. tags: [italian, dinner, weeknight, freezable, beginner]
- Cotechino con lenticchie — sausage with lentils for New Year. tags: [italian, dinner, festive, intermediate]
- Agnello in fricassea — egg-lemon-thickened lamb stew. tags: [italian, dinner, festive, intermediate]
- Abbacchio alla romana — Roman slow-roast spring lamb. tags: [italian, dinner, festive, intermediate]
- Trippa alla romana — Roman braised tripe. tags: [italian, dinner, regional, advanced]
- Trippa alla fiorentina — Florentine tripe. tags: [italian, dinner, regional, advanced]

### Fish and seafood mains

- Branzino al sale — sea bass baked in salt crust. tags: [italian, dinner, dinner-party, intermediate]
- Branzino al forno — oven-roasted whole sea bass. tags: [italian, dinner, weeknight, beginner]
- Orata al cartoccio — bream in parchment. tags: [italian, dinner, weeknight, beginner]
- Pesce all'acqua pazza — fish in "crazy water" tomato broth. tags: [italian, dinner, weeknight, beginner]
- Acquadelle fritte — fried whitebait. tags: [italian, snack, party, intermediate]
- Sarde a beccafico — Sicilian stuffed sardines. tags: [italian, dinner, regional, intermediate]
- Pasta con le sarde — Sicilian sardine-fennel pasta. tags: [italian, dinner, regional, intermediate]
- Calamari fritti — flour-dusted fried squid. tags: [italian, snack, party, intermediate]
- Calamari ripieni — stuffed squid in tomato. tags: [italian, dinner, dinner-party, intermediate]
- Polpo alla griglia — grilled octopus, lemon, olive oil. tags: [italian, dinner, dinner-party, intermediate]
- Polpo alla luciana — Neapolitan tomato-braised octopus. tags: [italian, dinner, regional, intermediate]
- Cozze alla marinara — mussels in tomato. tags: [italian, dinner, weeknight, beginner]
- Cozze al vino bianco — mussels in white wine. tags: [italian, dinner, weeknight, beginner]
- Vongole in bianco — clams in white wine. tags: [italian, dinner, weeknight, intermediate]
- Zuppa di pesce — Italian fish stew. tags: [italian, dinner, dinner-party, intermediate]
- Cacciucco — Livornese five-fish stew. tags: [italian, dinner, dinner-party, regional, advanced]
- Brodetto — Adriatic fish soup. tags: [italian, dinner, dinner-party, regional, intermediate]
- Baccalà alla vicentina — slow-cooked salt-cod with milk. tags: [italian, dinner, festive, intermediate]
- Baccalà mantecato — Venetian whipped salt cod. tags: [italian, snack, party, intermediate]
- Tonno alla siciliana — pan-seared tuna with olives, capers. tags: [italian, dinner, weeknight, beginner]
- Pesce spada alla siciliana — Sicilian swordfish with capers, tomato. tags: [italian, dinner, weeknight, beginner]
- Pesce spada alla griglia — grilled swordfish, lemon, oregano. tags: [italian, dinner, weeknight, beginner]

### Vegetable mains and sides

- Caponata — Sicilian sweet-sour aubergine. tags: [italian, side, vegetarian, vegan, intermediate]
- Parmigiana di melanzane — baked aubergine, tomato, mozzarella. tags: [italian, dinner, vegetarian, comfort-food, freezable, intermediate]
- Parmigiana di zucchine — courgette version. tags: [italian, dinner, vegetarian, comfort-food, intermediate]
- Melanzane ripiene — stuffed aubergines. tags: [italian, dinner, vegetarian, intermediate]
- Peperoni ripieni — stuffed peppers. tags: [italian, dinner, vegetarian, intermediate]
- Pomodori ripieni di riso — Roman stuffed-rice tomatoes. tags: [italian, dinner, vegetarian, beginner]
- Zucchine ripiene — stuffed courgettes. tags: [italian, dinner, vegetarian, intermediate]
- Cipolle ripiene — stuffed onions. tags: [italian, dinner, vegetarian, intermediate]
- Fritto di verdure — vegetable fry. tags: [italian, side, vegetarian, intermediate]
- Fagioli all'uccelletto — Tuscan cannellini with tomato and sage. tags: [italian, side, vegetarian, vegan, beginner]
- Cicoria ripassata — twice-cooked chicory with garlic and chilli. tags: [italian, side, vegetarian, vegan, beginner]
- Spinaci ripassati — pan-fried spinach, garlic, oil. tags: [italian, side, vegetarian, vegan, beginner]
- Patate al rosmarino — Italian rosemary roast potatoes. tags: [italian, side, vegetarian, vegan, beginner]
- Patate in tegame — pan-fried potatoes with onion. tags: [italian, side, vegetarian, vegan, beginner]
- Finocchi al forno — baked fennel with parmesan. tags: [italian, side, vegetarian, beginner]
- Insalata di finocchi e arance — fennel-and-orange salad. tags: [italian, side, vegetarian, vegan, beginner]
- Insalata di rinforzo — Neapolitan Christmas pickled-cauliflower salad. tags: [italian, side, festive, vegetarian, vegan, intermediate]
- Panzanella — Tuscan tomato-bread salad. tags: [italian, lunch, summer, vegetarian, vegan, beginner]
- Pinzimonio — raw-vegetable platter with olive oil. tags: [italian, snack, summer, vegetarian, vegan, beginner]
- Verdure alla griglia — chargrilled vegetable platter. tags: [italian, side, summer, vegetarian, vegan, beginner]

### Soups (Italian-tradition; cross-references for the Soups H2)

- Minestrone — vegetable, bean, and pasta soup. tags: [italian, lunch, comfort-food, vegetarian, vegan, freezable, beginner]
- Minestrone alla genovese — pesto-finished minestrone. tags: [italian, lunch, comfort-food, vegetarian, beginner]
- Pasta e fagioli — pasta-and-bean soup. tags: [italian, lunch, comfort-food, vegetarian, vegan, freezable, beginner]
- Pasta e ceci — pasta-and-chickpea. tags: [italian, lunch, comfort-food, vegetarian, vegan, beginner]
- Pasta e lenticchie — pasta-and-lentil. tags: [italian, lunch, comfort-food, vegetarian, vegan, beginner]
- Pasta e patate — pasta-and-potato Neapolitan. tags: [italian, lunch, comfort-food, vegetarian, beginner]
- Ribollita — Tuscan re-boiled bread, bean, and kale soup. tags: [italian, lunch, comfort-food, vegetarian, vegan, freezable, beginner]
- Pappa al pomodoro — Tuscan tomato-bread soup. tags: [italian, lunch, comfort-food, vegetarian, vegan, beginner]
- Acquacotta — Tuscan "cooked-water" vegetable and egg soup. tags: [italian, lunch, vegetarian, beginner]
- Stracciatella — Roman egg-drop broth with parmesan. tags: [italian, lunch, vegetarian, beginner]
- Zuppa di farro — farro-and-vegetable soup. tags: [italian, lunch, vegetarian, vegan, beginner]
- Zuppa di funghi — wild-mushroom soup. tags: [italian, lunch, vegetarian, intermediate]
- Tortellini in brodo — see Stuffed pasta. tags: [italian, lunch, comfort-food, advanced]

---

## French

Escoffier (`Le Guide Culinaire`, 1903 — multiple PD editions),
Madame Saint-Ange, Elizabeth David, Julia Child, and Richard Olney form
the spine. Patisserie sits under Baking → French patisserie; sauces
foundational technique stays in `docs/content-backlog.md`. Mains and
classic bistro food live here.

### Bistro and brasserie mains

- Boeuf bourguignon — beef braised in burgundy with bacon, mushrooms, onions. tags: [french, dinner, comfort-food, freezable, intermediate]
- Boeuf en daube — Provençal slow-braised beef with orange peel. tags: [french, dinner, comfort-food, freezable, intermediate]
- Daube de boeuf provençale — same family, anchovy and olive variant. tags: [french, dinner, comfort-food, freezable, intermediate]
- Estouffade de boeuf — Provençal beef stew with red wine. tags: [french, dinner, comfort-food, freezable, intermediate]
- Carbonnade flamande — Flemish beef-and-beer stew. tags: [french, dinner, comfort-food, freezable, intermediate]
- Pot-au-feu — beef and root vegetable boil with marrow bone. tags: [french, dinner, comfort-food, intermediate]
- Blanquette de veau — white veal stew with cream and lemon. tags: [french, dinner, comfort-food, intermediate]
- Veau Marengo — Napoleon-era veal stew with tomato and mushroom. tags: [french, dinner, comfort-food, intermediate]
- Osso buco à la française — French take with herbs and white wine. tags: [french, dinner, comfort-food, intermediate]
- Navarin d'agneau — spring lamb stew with baby vegetables. tags: [french, dinner, comfort-food, intermediate]
- Navarin printanier — peak-spring version with peas, asparagus. tags: [french, dinner, spring, intermediate]
- Gigot d'agneau — French-style roast leg of lamb with garlic. tags: [french, dinner, sunday-lunch, beginner]
- Gigot d'agneau à la cuillère — seven-hour lamb. tags: [french, dinner, dinner-party, intermediate]
- Carré d'agneau — herb-crusted rack of lamb. tags: [french, dinner, dinner-party, intermediate]
- Cassoulet — Languedoc bean-and-duck-and-sausage casserole. tags: [french, dinner, comfort-food, freezable, advanced]
- Cassoulet de Toulouse — Toulouse-style with confit duck. tags: [french, dinner, comfort-food, freezable, advanced]
- Cassoulet de Castelnaudary — pork-rind-heavy traditional version. tags: [french, dinner, regional, advanced]
- Coq au vin — chicken braised in red wine with bacon and mushrooms. tags: [french, dinner, comfort-food, freezable, intermediate]
- Coq au vin jaune — Jura version with vin jaune and morels. tags: [french, dinner, regional, advanced]
- Coq au riesling — Alsace white-wine version. tags: [french, dinner, comfort-food, intermediate]
- Poulet rôti — proper French roast chicken, butter and tarragon. tags: [french, dinner, sunday-lunch, beginner]
- Poulet basquaise — chicken with peppers and tomato. tags: [french, dinner, weeknight, beginner]
- Poulet à la moutarde — mustard-and-cream-braised chicken. tags: [french, dinner, weeknight, intermediate]
- Poulet à l'estragon — tarragon-and-cream chicken. tags: [french, dinner, weeknight, intermediate]
- Poulet chasseur — hunter's chicken with tomato, mushroom, tarragon. tags: [french, dinner, comfort-food, beginner]
- Poulet vallée d'Auge — Normandy chicken with cider, apple, calvados, cream. tags: [french, dinner, comfort-food, intermediate]
- Poulet à la crème — simple cream-braised chicken. tags: [french, dinner, weeknight, beginner]
- Poulet rôti aux 40 gousses d'ail — chicken with forty garlic cloves. tags: [french, dinner, dinner-party, intermediate]
- Poule au pot — Henri IV boiled chicken with vegetables. tags: [french, dinner, comfort-food, intermediate]
- Confit de canard — slow-cooked duck legs in their own fat. tags: [french, dinner, dinner-party, intermediate]
- Magret de canard — pan-seared duck breast. tags: [french, dinner, dinner-party, intermediate]
- Canard à l'orange — duck with bitter-orange sauce. tags: [french, dinner, dinner-party, intermediate]
- Canard aux navets — duck with turnips. tags: [french, dinner, dinner-party, intermediate]
- Canard aux cerises — duck with cherries. tags: [french, dinner, dinner-party, intermediate]
- Cuisse de canard confit aux lentilles — duck-leg confit with Puy lentils. tags: [french, dinner, comfort-food, intermediate]
- Lapin à la moutarde — mustard-rabbit braise. tags: [french, dinner, comfort-food, intermediate]
- Civet de lièvre — hare in red wine with blood-thickened sauce. tags: [french, dinner, dinner-party, advanced]
- Civet de chevreuil — venison stew. tags: [french, dinner, dinner-party, advanced]
- Pintade aux choux — guinea fowl with cabbage. tags: [french, dinner, dinner-party, intermediate]
- Steak frites — minute steak with proper twice-fried chips. tags: [french, dinner, weeknight, beginner]
- Steak au poivre — pepper-crusted steak with cream sauce. tags: [french, dinner, dinner-party, intermediate]
- Steak tartare — raw beef, capers, egg yolk. tags: [french, dinner, dinner-party, intermediate]
- Steak au roquefort — blue-cheese-sauced steak. tags: [french, dinner, dinner-party, intermediate]
- Entrecôte à la bordelaise — entrecôte with marrow and red-wine reduction. tags: [french, dinner, dinner-party, intermediate]
- Côte de boeuf — bone-in rib steak for two. tags: [french, dinner, dinner-party, intermediate]
- Tournedos Rossini — fillet with foie gras and Madeira sauce. tags: [french, dinner, dinner-party, advanced]
- Cuisses de grenouille — frogs' legs with garlic and parsley. tags: [french, dinner, dinner-party, intermediate]
- Escargots de Bourgogne — snails with garlic-parsley butter. tags: [french, snack, dinner-party, intermediate]
- Andouillette à la lyonnaise — tripe sausage with onions. tags: [french, dinner, regional, intermediate]
- Boudin noir aux pommes — black pudding with apple. tags: [french, dinner, weeknight, beginner]
- Boudin blanc — white pudding, traditional Christmas. tags: [french, dinner, festive, intermediate]
- Choucroute garnie — Alsace sauerkraut with sausages and pork. tags: [french, dinner, comfort-food, intermediate]
- Tartiflette — Savoy potato-bacon-reblochon bake. tags: [french, dinner, comfort-food, intermediate]
- Raclette — melted Swiss-French cheese with potatoes and charcuterie. tags: [french, dinner, dinner-party, beginner]
- Fondue savoyarde — Savoy three-cheese fondue. tags: [french, dinner, dinner-party, beginner]
- Croque-monsieur — ham-and-cheese sandwich with béchamel. tags: [french, lunch, comfort-food, beginner]
- Croque-madame — croque-monsieur with a fried egg on top. tags: [french, lunch, comfort-food, beginner]
- Croque-Provençal — tomato-and-pesto version. tags: [french, lunch, weeknight, vegetarian, beginner]
- Croque-Norvégien — smoked salmon variant. tags: [french, lunch, weeknight, beginner]

### Fish and seafood

- Bouillabaisse — Provençal saffron-fish stew with rouille. tags: [french, dinner, dinner-party, regional, advanced]
- Bourride — Provençal fish soup thickened with aioli. tags: [french, dinner, regional, intermediate]
- Moules marinières — mussels in white wine, shallot, parsley. tags: [french, dinner, weeknight, beginner]
- Moules à la crème — mussels in cream sauce. tags: [french, dinner, weeknight, beginner]
- Moules à la Provençale — tomato and herb mussels. tags: [french, dinner, weeknight, beginner]
- Moules au curry — Belgian-French curried mussels. tags: [french, dinner, weeknight, beginner]
- Sole meunière — pan-fried sole with brown butter and lemon. tags: [french, dinner, dinner-party, intermediate]
- Sole à la grenobloise — sole with capers, croutons, lemon. tags: [french, dinner, dinner-party, intermediate]
- Sole bonne femme — sole with mushroom and white-wine sauce. tags: [french, dinner, dinner-party, intermediate]
- Filets de poisson Véronique — fish with grapes and cream. tags: [french, dinner, dinner-party, intermediate]
- Saumon en croûte — salmon in puff pastry. tags: [french, dinner, dinner-party, intermediate]
- Saumon à l'oseille — salmon with sorrel sauce, Troisgros brothers' classic. tags: [french, dinner, dinner-party, intermediate]
- Quenelles de brochet — Lyonnaise pike dumplings in lobster sauce. tags: [french, dinner, regional, advanced]
- Brandade de morue — salt-cod-and-potato purée. tags: [french, dinner, regional, intermediate]
- Truite aux amandes — trout with brown-butter almonds. tags: [french, dinner, weeknight, beginner]
- Aile de raie au beurre noir — skate wing in black butter and capers. tags: [french, dinner, dinner-party, intermediate]
- Coquilles Saint-Jacques — scallops in cream sauce on the shell. tags: [french, dinner, dinner-party, intermediate]
- Plateau de fruits de mer — chilled seafood platter. tags: [french, dinner, dinner-party, intermediate]
- Lobster thermidor — lobster in mustard-cream-cheese sauce. tags: [french, dinner, dinner-party, advanced]
- Lobster Newburg — sherry-cream-egg-yolk lobster. tags: [french, dinner, dinner-party, advanced]
- Sole à la Normande — Normandy version with cider, prawns, mushrooms. tags: [french, dinner, dinner-party, advanced]

### Quiches, tarts, savoury bakes

- Quiche lorraine — proper, no cheese, lardons and cream. tags: [french, lunch, picnic, intermediate]
- Quiche au saumon — salmon quiche with dill. tags: [french, lunch, picnic, intermediate]
- Quiche aux légumes — vegetable quiche. tags: [french, lunch, picnic, vegetarian, intermediate]
- Quiche aux poireaux — leek quiche. tags: [french, lunch, picnic, vegetarian, intermediate]
- Quiche aux épinards — spinach-and-goats-cheese quiche. tags: [french, lunch, picnic, vegetarian, intermediate]
- Quiche au roquefort et noix — blue-cheese-and-walnut quiche. tags: [french, lunch, picnic, vegetarian, intermediate]
- Tarte à l'oignon — Alsace onion tart. tags: [french, lunch, picnic, vegetarian, intermediate]
- Tarte flambée — Alsace flatbread with crème fraîche, lardons, onion. tags: [french, dinner, regional, intermediate]
- Pissaladière — Niçoise onion-anchovy-olive flatbread. tags: [french, dinner, regional, intermediate]
- Tarte tatin aux tomates — savoury tomato tarte tatin. tags: [french, lunch, summer, vegetarian, intermediate]
- Pâté en croûte — terrine in pastry. tags: [french, lunch, dinner-party, advanced]
- Pâté de campagne — coarse country pâté. tags: [french, lunch, picnic, intermediate]
- Rillettes de porc — slow-cooked shredded pork preserve. tags: [french, lunch, picnic, intermediate]
- Rillettes de canard — duck rillettes. tags: [french, lunch, picnic, intermediate]
- Terrine de campagne — country terrine. tags: [french, lunch, dinner-party, intermediate]

### Vegetable mains and sides

- Ratatouille — Provençal vegetable stew, slow-cooked. tags: [french, dinner, vegetarian, vegan, freezable, beginner]
- Ratatouille confit byaldi — Keller's layered version. tags: [french, dinner, vegetarian, vegan, intermediate]
- Pommes Anna — sliced-potato cake baked in butter. tags: [french, side, dinner-party, vegetarian, intermediate]
- Pommes dauphinoise — sliced potatoes baked in cream and garlic. tags: [french, side, dinner-party, vegetarian, intermediate]
- Pommes boulangère — sliced potatoes baked in stock with onion. tags: [french, side, sunday-lunch, vegetarian, vegan, beginner]
- Pommes de terre sarladaises — duck-fat-fried potatoes with garlic and parsley. tags: [french, side, dinner-party, intermediate]
- Pommes purée — Robuchon-style butter-heavy mash. tags: [french, side, dinner-party, vegetarian, beginner]
- Pommes frites — proper twice-fried chips. tags: [french, side, comfort-food, vegetarian, vegan, intermediate]
- Pommes allumettes — matchstick fries. tags: [french, side, comfort-food, vegetarian, vegan, intermediate]
- Pommes pont neuf — thick-cut chips. tags: [french, side, comfort-food, vegetarian, vegan, intermediate]
- Pommes Pommes — pan-fried sautéed potatoes. tags: [french, side, weeknight, vegetarian, vegan, beginner]
- Gratin de courgettes — courgette gratin with cream. tags: [french, side, weeknight, vegetarian, beginner]
- Gratin de poireaux — leek gratin. tags: [french, side, weeknight, vegetarian, beginner]
- Gratin de cardons — Lyonnaise cardoon gratin. tags: [french, side, regional, vegetarian, intermediate]
- Petits pois à la française — peas with lettuce, spring onion, butter. tags: [french, side, vegetarian, spring, beginner]
- Haricots verts à la française — green beans with shallot and butter. tags: [french, side, weeknight, vegetarian, beginner]
- Salsifis à la crème — salsify in cream. tags: [french, side, dinner-party, vegetarian, intermediate]
- Endives au jambon — chicory rolled in ham, baked in béchamel. tags: [french, dinner, comfort-food, intermediate]
- Endives braisées — braised chicory with butter and sugar. tags: [french, side, weeknight, vegetarian, beginner]
- Champignons à la Grecque — pickled-style mushroom side. tags: [french, side, picnic, vegetarian, vegan, beginner]
- Soupe à l'oignon — proper French onion soup with cheese-toast crouton. tags: [french, dinner, comfort-food, vegetarian, intermediate]
- Soupe au pistou — Provençal vegetable soup with pistou. tags: [french, lunch, summer, vegetarian, vegan, beginner]
- Vichyssoise — chilled leek-potato soup. tags: [french, lunch, summer, vegetarian, beginner]
- Soupe de poisson — Provençal blended fish soup. tags: [french, lunch, regional, intermediate]
- Bisque de homard — lobster bisque. tags: [french, dinner, dinner-party, advanced]
- Bisque de crevettes — prawn bisque. tags: [french, dinner, dinner-party, intermediate]
- Velouté de champignons — mushroom velouté. tags: [french, lunch, weeknight, vegetarian, beginner]
- Velouté de potiron — pumpkin velouté. tags: [french, lunch, weeknight, vegetarian, beginner]
- Velouté de cresson — watercress velouté. tags: [french, lunch, weeknight, vegetarian, beginner]
- Crème de châtaignes — chestnut soup. tags: [french, lunch, festive, vegetarian, beginner]

### Eggs and bistro lunch

- Oeufs en cocotte — baked eggs with cream, ramekin classic. tags: [french, breakfast, weeknight, vegetarian, beginner]
- Oeufs Bénédicte — French take on eggs Benedict. tags: [french, breakfast, weekend, intermediate]
- Oeufs en meurette — poached eggs in red-wine sauce. tags: [french, breakfast, dinner-party, intermediate]
- Oeufs mimosa — French deviled eggs. tags: [french, snack, picnic, vegetarian, beginner]
- Omelette aux fines herbes — three-herb omelette. tags: [french, breakfast, weeknight, vegetarian, beginner]
- Omelette aux champignons — mushroom omelette. tags: [french, breakfast, weeknight, vegetarian, beginner]
- Omelette au fromage — gruyère omelette. tags: [french, breakfast, weeknight, vegetarian, beginner]
- Omelette aux fruits de mer — seafood omelette. tags: [french, breakfast, dinner-party, intermediate]
- Pipérade — Basque pepper, tomato, egg scramble. tags: [french, breakfast, weeknight, vegetarian, beginner]
- Pissenlit aux lardons — dandelion salad with bacon and croutons. tags: [french, salad, spring, intermediate]
- Salade lyonnaise — frisée with bacon, croutons, poached egg. tags: [french, salad, intermediate]
- Salade niçoise — proper Niçoise with tuna, anchovy, egg, beans. tags: [french, salad, summer, intermediate]
- Salade composée — composed bistro salad. tags: [french, salad, lunch, beginner]
- Salade de chèvre chaud — warm goats' cheese on greens. tags: [french, salad, weeknight, vegetarian, beginner]
- Salade de gésiers — confit-gizzard salad. tags: [french, salad, dinner-party, intermediate]
- Salade de betteraves — beetroot salad with shallot and vinaigrette. tags: [french, salad, vegetarian, vegan, beginner]
- Salade de carottes râpées — grated-carrot salad. tags: [french, salad, lunchbox, vegetarian, vegan, beginner]
- Céleri rémoulade — celeriac in mustard-mayonnaise. tags: [french, salad, lunchbox, vegetarian, beginner]

### Regional French (Provence, Brittany, Alsace, Normandy, Lyon)

- Aïoli garni — Provençal feast plate with cod, vegetables, aioli. tags: [french, dinner, regional, intermediate]
- Salade niçoise — see Eggs and bistro lunch. tags: [french, salad, regional, intermediate]
- Tapenade — Provençal olive-anchovy-caper paste. tags: [french, snack, party, vegetarian, beginner]
- Tapenade verte — green-olive variant. tags: [french, snack, party, vegetarian, beginner]
- Anchoïade — Provençal anchovy dip. tags: [french, snack, party, beginner]
- Soupe au pistou — see Vegetable mains. tags: [french, lunch, regional, vegetarian, vegan, beginner]
- Daube provençale — see Bistro mains. tags: [french, dinner, regional, intermediate]
- Bouillabaisse — see Fish. tags: [french, dinner, regional, advanced]
- Bourride — see Fish. tags: [french, dinner, regional, intermediate]
- Galette de sarrasin — Breton buckwheat galette with ham, cheese, egg. tags: [french, lunch, regional, intermediate]
- Galette complète — classic ham-cheese-egg galette. tags: [french, lunch, regional, intermediate]
- Galette aux champignons — mushroom galette. tags: [french, lunch, regional, vegetarian, intermediate]
- Far breton — Breton prune flan. tags: [french, dessert, regional, vegetarian, intermediate]
- Kouign-amann — see French patisserie under Baking. tags: [french, dessert, regional, vegetarian, advanced]
- Coquilles Saint-Jacques à la bretonne — Breton scallop. tags: [french, dinner, regional, intermediate]
- Tarte flambée — see Quiches. tags: [french, dinner, regional, intermediate]
- Choucroute garnie — see Bistro mains. tags: [french, dinner, regional, intermediate]
- Baeckeoffe — Alsace lamb-pork-beef-and-potato casserole. tags: [french, dinner, regional, intermediate]
- Spätzle alsacien — Alsace egg-noodle pasta. tags: [french, side, regional, vegetarian, intermediate]
- Munster on cumin bread — Alsace tradition. tags: [french, snack, regional, vegetarian, beginner]
- Tarte normande — Normandy apple tart with frangipane. tags: [french, dessert, regional, vegetarian, intermediate]
- Teurgoule — Norman slow-baked rice pudding. tags: [french, dessert, regional, vegetarian, beginner]
- Tripes à la mode de Caen — Norman tripe stew. tags: [french, dinner, regional, advanced]
- Sole à la Normande — see Fish. tags: [french, dinner, regional, advanced]
- Tartiflette — see Bistro mains. tags: [french, dinner, regional, intermediate]
- Fondue savoyarde — see Bistro mains. tags: [french, dinner, regional, beginner]
- Diots au vin blanc — Savoy sausage stew. tags: [french, dinner, regional, intermediate]
- Quenelles de brochet — see Fish. tags: [french, dinner, regional, advanced]
- Salade lyonnaise — see Eggs. tags: [french, salad, regional, intermediate]
- Tablier de sapeur — Lyonnais breaded tripe. tags: [french, dinner, regional, advanced]
- Andouillette à la lyonnaise — see Bistro mains. tags: [french, dinner, regional, intermediate]
- Cervelle de canut — Lyon herbed-cheese spread. tags: [french, snack, regional, vegetarian, beginner]

---

## American

The Joy of Cooking, Edna Lewis, Marion Cunningham, James Beard, the WPA
state-cookery surveys, and Fannie Farmer (PD) form the spine. American
covers classic diner food, the Southern canon, Cajun and Creole, Tex-Mex
(the Anglicised version of Mexican cookery as it lives in the UK
mind-share too), New England seafood, BBQ, and the Italian-American
hyphenate. Sufficient depth that it has the same volume target as
British.

### Diner classics and shorthand cooking

- Cheeseburger — proper smash-style with American cheese. tags: [american, dinner, comfort-food, kid-friendly, beginner]
- Smashburger — thin-patty griddle method. tags: [american, dinner, weeknight, beginner]
- Double-stack cheeseburger — diner classic. tags: [american, dinner, comfort-food, beginner]
- Bacon cheeseburger — with crisp streaky bacon. tags: [american, dinner, comfort-food, beginner]
- Slider — small steamed griddle burger. tags: [american, snack, party, beginner]
- Patty melt — burger on rye with grilled onions. tags: [american, dinner, comfort-food, intermediate]
- Cheesesteak — Philly-style ribeye, onion, cheese-whiz roll. tags: [american, dinner, regional, intermediate]
- French dip — roast beef on baguette with au jus. tags: [american, lunch, dinner-party, intermediate]
- Reuben — corned beef, sauerkraut, swiss, on rye. tags: [american, lunch, comfort-food, beginner]
- Rachel — turkey-coleslaw variant of Reuben. tags: [american, lunch, weeknight, beginner]
- Pastrami sandwich — proper New York-deli build. tags: [american, lunch, comfort-food, intermediate]
- Tuna melt — diner classic on rye. tags: [american, lunch, weeknight, beginner]
- Grilled cheese sandwich — buttered, cheddar-and-American. tags: [american, snack, comfort-food, kid-friendly, vegetarian, beginner]
- Grilled cheese with tomato soup — peak comfort lunch. tags: [american, lunch, comfort-food, vegetarian, beginner]
- Monte Cristo — fried ham-turkey-cheese sandwich. tags: [american, lunch, dinner-party, intermediate]
- BLT — proper bacon-lettuce-tomato. tags: [american, lunch, weeknight, beginner]
- Club sandwich — three-tier with chicken, bacon, lettuce, tomato. tags: [american, lunch, weeknight, beginner]
- Lobster roll — Maine-style with mayonnaise. tags: [american, lunch, regional, intermediate]
- Lobster roll Connecticut — warm-butter version. tags: [american, lunch, regional, intermediate]
- Po' boy with shrimp — New Orleans seafood sandwich. tags: [american, lunch, regional, intermediate]
- Po' boy with oysters — fried-oyster po' boy. tags: [american, lunch, regional, intermediate]
- Po' boy with roast beef — gravy-soaked sandwich. tags: [american, lunch, regional, intermediate]
- Sloppy joe — sweet-ground-beef sandwich on a bun. tags: [american, dinner, kid-friendly, weeknight, beginner]
- Manwich — old-school tinned variant. tags: [american, dinner, kid-friendly, weeknight, beginner]
- Hot dog — proper boiled, ketchup-mustard-relish. tags: [american, snack, party, beginner]
- Chili dog — chilli-topped hot dog. tags: [american, snack, party, beginner]
- Chicago dog — poppy-seed bun, dragged-through-the-garden. tags: [american, regional, party, beginner]
- New York dog — sauerkraut-and-mustard street version. tags: [american, regional, party, beginner]
- Coney dog — Michigan chilli-and-onion dog. tags: [american, regional, party, beginner]
- Corn dog — battered hot dog on a stick. tags: [american, snack, party, kid-friendly, beginner]
- Pancakes — classic American buttermilk stack. tags: [american, breakfast, kid-friendly, vegetarian, beginner]
- Buttermilk pancakes — tall, fluffy. tags: [american, breakfast, kid-friendly, vegetarian, beginner]
- Blueberry pancakes — fruit-studded. tags: [american, breakfast, kid-friendly, vegetarian, beginner]
- Banana pancakes — kid-friendly. tags: [american, breakfast, kid-friendly, vegetarian, beginner]
- Chocolate-chip pancakes — weekend treat. tags: [american, breakfast, kid-friendly, vegetarian, beginner]
- Silver-dollar pancakes — small-stack. tags: [american, breakfast, kid-friendly, vegetarian, beginner]
- Waffles — proper Belgian-style. tags: [american, breakfast, kid-friendly, vegetarian, beginner]
- Buttermilk waffles — Southern style. tags: [american, breakfast, kid-friendly, vegetarian, beginner]
- Chicken and waffles — Soul-food diner staple. tags: [american, breakfast, regional, intermediate]
- French toast — egg-soaked thick bread. tags: [american, breakfast, kid-friendly, vegetarian, beginner]
- Stuffed French toast — cream-cheese filling. tags: [american, breakfast, vegetarian, intermediate]
- Brioche French toast — diner upgrade. tags: [american, breakfast, vegetarian, intermediate]
- Hash browns — shredded-potato breakfast classic. tags: [american, breakfast, kid-friendly, vegetarian, beginner]
- Home fries — diced, pan-fried potato. tags: [american, breakfast, weekend, vegetarian, vegan, beginner]
- Eggs Benedict — poached eggs, ham, English muffin, hollandaise. tags: [american, breakfast, weekend, intermediate]
- Eggs Florentine — spinach swap. tags: [american, breakfast, weekend, vegetarian, intermediate]
- Eggs Royale — smoked-salmon swap. tags: [american, breakfast, weekend, intermediate]
- Huevos rancheros — eggs over tortilla in salsa. tags: [american, breakfast, weekend, vegetarian, beginner]
- Breakfast burrito — eggs, beans, cheese, salsa wrapped in tortilla. tags: [american, breakfast, weekend, beginner]
- Biscuits and gravy — Southern buttermilk biscuits, sausage gravy. tags: [american, breakfast, weekend, comfort-food, intermediate]
- Sausage gravy — country-style breakfast gravy. tags: [american, breakfast, weekend, comfort-food, beginner]
- Country-fried steak — breaded, pan-fried with gravy. tags: [american, dinner, comfort-food, intermediate]
- Chicken-fried steak — Texan steak in egg-and-flour-fry. tags: [american, dinner, regional, intermediate]

### Mains — meat, poultry, casseroles

- Meatloaf — proper ketchup-glazed Sunday-night classic. tags: [american, dinner, comfort-food, kid-friendly, freezable, beginner]
- Mom's meatloaf — old-school onion-soup-mix version. tags: [american, dinner, comfort-food, freezable, beginner]
- Salisbury steak — beef patty in mushroom gravy. tags: [american, dinner, comfort-food, freezable, beginner]
- Swedish meatballs — beef-pork balls in cream-dill gravy. tags: [american, dinner, comfort-food, freezable, beginner]
- Beef stroganoff — beef strips in mushroom-sour-cream gravy on egg noodle. tags: [american, dinner, comfort-food, beginner]
- Hamburger Helper-style skillet — pasta, ground beef, cheese. tags: [american, dinner, weeknight, kid-friendly, beginner]
- Stuffed peppers — peppers filled with rice, ground beef, tomato. tags: [american, dinner, comfort-food, freezable, beginner]
- Stuffed cabbage rolls — golabki-style with tomato sauce. tags: [american, dinner, comfort-food, freezable, intermediate]
- Chicken pot pie — proper pastry-topped chicken-and-vegetable pie. tags: [american, dinner, comfort-food, freezable, intermediate]
- Chicken and dumplings — Southern-style chicken stew with biscuit dumplings. tags: [american, dinner, comfort-food, intermediate]
- Chicken and rice casserole — cream-of-mushroom mid-century classic. tags: [american, dinner, comfort-food, kid-friendly, beginner]
- King ranch chicken — Texas tortilla-and-chicken-casserole classic. tags: [american, dinner, regional, freezable, intermediate]
- Green-bean casserole — Thanksgiving fried-onion classic. tags: [american, side, festive, vegetarian, beginner]
- Sweet-potato casserole with marshmallow — Thanksgiving standard. tags: [american, side, festive, vegetarian, beginner]
- Cornbread stuffing — Southern Thanksgiving stuffing. tags: [american, side, festive, vegetarian, beginner]
- Roast turkey, American style — Thanksgiving centerpiece. tags: [american, dinner, festive, intermediate]
- Brined Thanksgiving turkey — wet-brine method. tags: [american, dinner, festive, intermediate]
- Deep-fried turkey — peanut-oil tradition. tags: [american, dinner, festive, advanced]
- Spatchcocked turkey — flat-roasted faster bird. tags: [american, dinner, festive, intermediate]
- Roast ham with glaze — bourbon-and-brown-sugar Easter ham. tags: [american, dinner, festive, beginner]
- Honey-baked ham — sweet-glazed spiral. tags: [american, dinner, festive, beginner]
- Pot roast — chuck braised with carrot, potato, onion. tags: [american, dinner, comfort-food, freezable, beginner]
- Yankee pot roast — vinegar-and-stock New England version. tags: [american, dinner, regional, intermediate]
- Mississippi pot roast — pepperoncini-and-ranch slow-cooker classic. tags: [american, dinner, comfort-food, beginner]
- Italian beef — Chicago slow-roasted beef in jus on a roll. tags: [american, dinner, regional, intermediate]
- Beef stew, American — hearty winter pot. tags: [american, dinner, comfort-food, freezable, beginner]
- Beef and noodles — Midwestern comfort plate. tags: [american, dinner, comfort-food, beginner]
- Beef stroganoff with egg noodle — full plate. tags: [american, dinner, comfort-food, beginner]
- Mac and cheese, baked — proper Southern soul-food version. tags: [american, side, comfort-food, kid-friendly, vegetarian, beginner]
- Stovetop mac and cheese — quick midweek version. tags: [american, dinner, comfort-food, kid-friendly, vegetarian, beginner]
- Tuna casserole — egg noodle, cream of mushroom, peas. tags: [american, dinner, weeknight, kid-friendly, beginner]
- Chicken tetrazzini — pasta-and-mushroom bake. tags: [american, dinner, comfort-food, beginner]
- King ranch chicken — see above. tags: [american, dinner, comfort-food, intermediate]
- Sloppy joe — see Diner. tags: [american, dinner, kid-friendly, beginner]
- Chili con carne — proper Texan chilli with beef chunks and chillies. tags: [american, dinner, comfort-food, freezable, intermediate]
- Texas red chilli — purist, no beans. tags: [american, dinner, regional, freezable, intermediate]
- Cincinnati chilli — spiced beef on spaghetti, cheese, onion. tags: [american, dinner, regional, intermediate]
- White chicken chilli — green-chilli-and-white-bean stew. tags: [american, dinner, freezable, beginner]
- Five-way chilli — Cincinnati Skyline-style. tags: [american, dinner, regional, intermediate]

### Southern, Cajun, Creole

- Fried chicken — buttermilk-brined, double-dredged. tags: [american, dinner, comfort-food, intermediate]
- Nashville hot chicken — chilli-oil-soaked fried chicken. tags: [american, dinner, regional, intermediate]
- Buttermilk-bath fried chicken — Edna Lewis style. tags: [american, dinner, regional, intermediate]
- Korean-American fried chicken — see notes. tags: [american, dinner, regional, intermediate]
- Chicken-fried steak — see Diner. tags: [american, dinner, comfort-food, intermediate]
- Smothered pork chops — slow-cooked in onion-mushroom gravy. tags: [american, dinner, comfort-food, beginner]
- Smothered chicken — gravy-smothered braised chicken. tags: [american, dinner, comfort-food, beginner]
- Country ham with red-eye gravy — coffee-deglazed pan sauce. tags: [american, breakfast, regional, intermediate]
- Pulled pork — slow-cooked Boston butt, low-and-slow oven or smoker. tags: [american, dinner, batch-cook, comfort-food, freezable, intermediate]
- Pulled-pork sliders — leftover-style buns. tags: [american, snack, party, beginner]
- Burnt ends — twice-smoked brisket cubes. tags: [american, dinner, regional, advanced]
- Brisket — Texas-style low-and-slow smoked brisket. tags: [american, dinner, regional, advanced]
- Brisket sandwich — Texas pile-up on white bread. tags: [american, dinner, regional, intermediate]
- BBQ ribs — St Louis-style pork ribs. tags: [american, dinner, comfort-food, advanced]
- Memphis dry-rub ribs — no-sauce style. tags: [american, dinner, regional, intermediate]
- Kansas City ribs — sweet, sticky, sauced. tags: [american, dinner, regional, intermediate]
- Carolina pulled pork — vinegar-sauced. tags: [american, dinner, regional, intermediate]
- Carolina mustard BBQ sauce — yellow South Carolina classic. tags: [american, side, regional, vegetarian, vegan, beginner]
- Carolina vinegar sauce — Eastern Carolina sauce. tags: [american, side, regional, vegetarian, vegan, beginner]
- Kansas City sauce — sweet tomato classic. tags: [american, side, regional, vegetarian, vegan, beginner]
- Texas mop sauce — peppery beef-fat dressing. tags: [american, side, regional, beginner]
- Brunswick stew — Georgia / Virginia game-and-vegetable stew. tags: [american, dinner, regional, freezable, intermediate]
- Burgoo — Kentucky stew. tags: [american, dinner, regional, freezable, intermediate]
- Hoppin' John — black-eyed peas and rice for New Year. tags: [american, dinner, regional, vegetarian, beginner]
- Red beans and rice — Monday-night New Orleans classic. tags: [american, dinner, regional, vegetarian, freezable, beginner]
- Jambalaya — Cajun rice with andouille, chicken, prawns. tags: [american, dinner, regional, freezable, intermediate]
- Creole jambalaya — tomato-based New Orleans version. tags: [american, dinner, regional, intermediate]
- Gumbo with chicken and andouille — proper roux-based. tags: [american, dinner, regional, freezable, intermediate]
- Seafood gumbo — prawns, crab, okra. tags: [american, dinner, regional, intermediate]
- Gumbo z'herbes — Lent green-gumbo. tags: [american, dinner, regional, vegetarian, intermediate]
- Étouffée with crawfish — proper Louisiana smother. tags: [american, dinner, regional, intermediate]
- Shrimp étouffée — prawn version. tags: [american, dinner, regional, intermediate]
- Boudin — Cajun rice-and-pork sausage. tags: [american, dinner, regional, advanced]
- Boudin balls — fried boudin nuggets. tags: [american, snack, regional, intermediate]
- Dirty rice — chicken-liver-and-rice Cajun classic. tags: [american, side, regional, intermediate]
- Andouille and red bean stew — Mardi Gras pot. tags: [american, dinner, regional, freezable, intermediate]
- Blackened catfish — Prudhomme spice rub. tags: [american, dinner, regional, intermediate]
- Blackened redfish — original Prudhomme dish. tags: [american, dinner, regional, intermediate]
- Catfish po' boy — fried catfish on French bread. tags: [american, lunch, regional, intermediate]
- Shrimp and grits — Charleston classic. tags: [american, breakfast, regional, intermediate]
- Cheese grits — buttery side. tags: [american, breakfast, regional, vegetarian, beginner]
- Hush puppies — fried-cornmeal balls. tags: [american, snack, regional, vegetarian, beginner]
- Cornbread — Southern skillet, unsweetened. tags: [american, side, regional, vegetarian, beginner]
- Sweet cornbread — Northern, sugared. tags: [american, side, vegetarian, beginner]
- Spoonbread — soufflé-textured cornmeal. tags: [american, side, regional, vegetarian, intermediate]
- Hoecakes — fried cornmeal pancakes. tags: [american, breakfast, regional, vegetarian, beginner]
- Collard greens — slow-cooked with ham hock. tags: [american, side, regional, intermediate]
- Mustard greens — quick-cooked with smoked turkey. tags: [american, side, regional, beginner]
- Black-eyed peas — slow-cooked with ham hock. tags: [american, side, regional, beginner]
- Pinto beans — slow-cooked Southern. tags: [american, side, regional, vegetarian, beginner]
- Fried green tomatoes — cornmeal-fried slices. tags: [american, side, regional, vegetarian, beginner]
- Okra and tomato — Southern stewed side. tags: [american, side, regional, vegetarian, vegan, beginner]
- Fried okra — buttermilk-cornmeal coating. tags: [american, side, regional, vegetarian, beginner]
- Pimento cheese — Southern cheddar-mayonnaise-pimento spread. tags: [american, snack, regional, vegetarian, beginner]
- Deviled eggs — Southern picnic standard. tags: [american, snack, picnic, vegetarian, beginner]
- Crab cakes, Maryland-style — proper jumbo lump. tags: [american, dinner, regional, intermediate]
- Crab boil — New England-style steamed pot. tags: [american, dinner, regional, intermediate]
- Low-country boil — shrimp, sausage, corn, potato boil. tags: [american, dinner, regional, intermediate]
- Shrimp boil — Cajun spiced. tags: [american, dinner, regional, intermediate]
- Clam chowder, New England — milky and thick. tags: [american, lunch, regional, intermediate]
- Manhattan clam chowder — tomato-based variant. tags: [american, lunch, regional, intermediate]
- Lobster bisque — buttery puréed. tags: [american, dinner, regional, intermediate]
- Cioppino — San Francisco-Italian seafood stew. tags: [american, dinner, regional, intermediate]
- Bouillabaisse San Francisco-style — see Cioppino. tags: [american, dinner, regional, intermediate]
- Fried clams — Massachusetts whole-belly. tags: [american, snack, regional, intermediate]
- Steamed clams — drawn butter. tags: [american, dinner, regional, beginner]
- Clambake — pit-cooked New England feast. tags: [american, dinner, regional, advanced]
- Lobster roll — see Diner. tags: [american, lunch, regional, intermediate]

### Tex-Mex (Anglicised Mexican as it lives in the UK / US household)

- Beef tacos — proper crispy-shell US tacos. tags: [american, dinner, kid-friendly, weeknight, beginner]
- Soft beef tacos — flour-tortilla version. tags: [american, dinner, kid-friendly, weeknight, beginner]
- Chicken tacos — shredded-chicken filling. tags: [american, dinner, kid-friendly, weeknight, beginner]
- Pulled-pork tacos — slow-cooked with chipotle. tags: [american, dinner, kid-friendly, weeknight, beginner]
- Carnitas tacos — Tex-Mex pork. tags: [american, dinner, weeknight, intermediate]
- Fish tacos — beer-battered cod, slaw, chipotle mayo. tags: [american, dinner, weeknight, intermediate]
- Shrimp tacos — quick-fried prawn version. tags: [american, dinner, weeknight, beginner]
- Walking tacos — Doritos-bag tacos for parties. tags: [american, snack, party, kid-friendly, beginner]
- Beef enchiladas — rolled tortillas in red sauce. tags: [american, dinner, comfort-food, freezable, intermediate]
- Chicken enchiladas, red — classic Tex-Mex. tags: [american, dinner, comfort-food, freezable, intermediate]
- Chicken enchiladas, green — verde sauce. tags: [american, dinner, comfort-food, freezable, intermediate]
- Cheese enchiladas — vegetarian. tags: [american, dinner, vegetarian, freezable, intermediate]
- Enchiladas suizas — cream-sauced. tags: [american, dinner, comfort-food, intermediate]
- Beef burrito — rice-and-bean rolled tortilla. tags: [american, dinner, weeknight, kid-friendly, beginner]
- Chicken burrito — grilled-chicken filling. tags: [american, dinner, weeknight, kid-friendly, beginner]
- Bean and rice burrito — vegetarian classic. tags: [american, dinner, vegetarian, vegan, weeknight, beginner]
- Wet burrito — California-style smothered in sauce. tags: [american, dinner, regional, intermediate]
- Mission burrito — San Francisco-style overstuffed. tags: [american, dinner, regional, intermediate]
- Chimichanga — deep-fried burrito. tags: [american, dinner, comfort-food, intermediate]
- Quesadilla, cheese — basic griddled. tags: [american, snack, kid-friendly, vegetarian, beginner]
- Quesadilla, chicken and cheese. tags: [american, dinner, kid-friendly, weeknight, beginner]
- Quesadilla, steak. tags: [american, dinner, weeknight, beginner]
- Quesadilla, vegetable — peppers, mushrooms, beans. tags: [american, dinner, vegetarian, weeknight, beginner]
- Nachos supreme — loaded tortilla chip platter. tags: [american, snack, party, kid-friendly, beginner]
- Beef nachos — chilli-beef-and-cheese. tags: [american, snack, party, beginner]
- Chicken nachos — pulled-chicken-and-cheese. tags: [american, snack, party, beginner]
- Vegetarian nachos — bean-and-cheese. tags: [american, snack, party, vegetarian, beginner]
- Loaded fries — chilli-cheese fries. tags: [american, snack, party, beginner]
- Cheesy fries — diner-style. tags: [american, snack, party, vegetarian, beginner]
- Chilli cheese fries — chili-con-carne topping. tags: [american, snack, party, beginner]
- Fajitas, beef — sizzling skirt steak. tags: [american, dinner, party, kid-friendly, intermediate]
- Fajitas, chicken — marinated grilled chicken. tags: [american, dinner, weeknight, kid-friendly, beginner]
- Fajitas, prawn — quick version. tags: [american, dinner, weeknight, beginner]
- Fajitas, vegetable — peppers and onions. tags: [american, dinner, vegetarian, weeknight, beginner]
- Taco soup — slow-cooker chilli with tortilla. tags: [american, dinner, comfort-food, freezable, beginner]
- Tortilla soup — chicken-and-tomato Tex-Mex soup. tags: [american, dinner, weeknight, freezable, beginner]
- Seven-layer dip — refried bean, sour cream, guac, salsa. tags: [american, snack, party, vegetarian, beginner]
- Guacamole — proper avocado, lime, coriander, onion. tags: [american, snack, party, vegetarian, vegan, beginner]
- Pico de gallo — fresh tomato salsa. tags: [american, snack, party, vegetarian, vegan, beginner]
- Salsa roja — cooked red salsa. tags: [american, snack, party, vegetarian, vegan, beginner]
- Salsa verde — tomatillo green salsa. tags: [american, snack, party, vegetarian, vegan, beginner]
- Queso dip — Velveeta-and-Rotel classic. tags: [american, snack, party, vegetarian, beginner]
- Refried beans — pinto-bean side. tags: [american, side, vegetarian, beginner]
- Mexican rice (Tex-Mex) — tomato-and-cumin rice. tags: [american, side, weeknight, vegetarian, vegan, beginner]
- Texas chili — see chili. tags: [american, dinner, regional, intermediate]

### Italian-American (separate from Italian above)

- Spaghetti and meatballs — proper Italian-American version. tags: [american, dinner, comfort-food, kid-friendly, freezable, intermediate]
- Chicken parmesan — breaded chicken, tomato, mozzarella. tags: [american, dinner, comfort-food, kid-friendly, intermediate]
- Veal parmesan — original. tags: [american, dinner, comfort-food, intermediate]
- Eggplant parmesan — vegetarian American take. tags: [american, dinner, vegetarian, comfort-food, intermediate]
- Chicken cacciatore — Italian-American hunter's chicken. tags: [american, dinner, comfort-food, freezable, intermediate]
- Chicken marsala — Italian-American Marsala mushroom. tags: [american, dinner, weeknight, intermediate]
- Chicken piccata — lemon-caper. tags: [american, dinner, weeknight, intermediate]
- Linguine with clam sauce — Italian-American version. tags: [american, dinner, weeknight, intermediate]
- Baked ziti — meatball-and-mozzarella pasta bake. tags: [american, dinner, comfort-food, kid-friendly, freezable, intermediate]
- Stuffed shells — ricotta-stuffed conchiglie bake. tags: [american, dinner, vegetarian, freezable, intermediate]
- Lasagna, Italian-American — meat-sauce-cheese-ricotta version. tags: [american, dinner, comfort-food, freezable, intermediate]
- Manicotti — ricotta-stuffed crepe-like pasta. tags: [american, dinner, vegetarian, freezable, intermediate]
- Sunday gravy — slow-cooked meat-tomato sauce. tags: [american, dinner, comfort-food, intermediate]
- Sausage and peppers — Italian-American sandwich filling. tags: [american, dinner, weeknight, beginner]
- Calzone, Italian-American — overstuffed. tags: [american, dinner, friday-pizza, intermediate]
- Stromboli — rolled pizza-bread with meats and cheese. tags: [american, dinner, friday-pizza, intermediate]
- New York pizza — fold-style thin-crust slice. tags: [american, dinner, friday-pizza, intermediate]
- Detroit pizza — pan-style with crispy edges. tags: [american, dinner, friday-pizza, intermediate]
- Chicago deep-dish pizza — corn-meal-edged thick pan pizza. tags: [american, dinner, friday-pizza, advanced]
- Chicago thin-crust pizza — tavern-style. tags: [american, dinner, friday-pizza, intermediate]
- Buffalo chicken pizza — Buffalo-wing-flavoured. tags: [american, dinner, friday-pizza, beginner]
- White pizza — ricotta-and-garlic. tags: [american, dinner, friday-pizza, vegetarian, beginner]
- Hawaiian pizza — Canadian-Australian origin, American spread, ham and pineapple. tags: [american, dinner, friday-pizza, kid-friendly, beginner]
- Garlic bread, American-style — buttered, parsley-topped. tags: [american, side, friday-pizza, vegetarian, beginner]
- Garlic knots — pizza-dough knots in garlic butter. tags: [american, side, friday-pizza, vegetarian, beginner]

### Wings, snacks, party plates

- Buffalo wings — proper Frank's-and-butter sauced. tags: [american, snack, party, intermediate]
- Honey-garlic wings — popular variant. tags: [american, snack, party, intermediate]
- BBQ wings — sticky-sauce wings. tags: [american, snack, party, intermediate]
- Lemon-pepper wings — dry-rub. tags: [american, snack, party, intermediate]
- Chipotle wings — smoky-chilli. tags: [american, snack, party, intermediate]
- Korean-style fried wings — see Korean (deferred v2). tags: [american, snack, party, intermediate]
- Boneless wings — chicken-tender style. tags: [american, snack, party, kid-friendly, beginner]
- Buffalo cauliflower — vegetarian wings. tags: [american, snack, party, vegetarian, beginner]
- Chicken tenders — buttermilk-fried strips. tags: [american, snack, kid-friendly, beginner]
- Chicken nuggets, home version. tags: [american, snack, kid-friendly, freezable, beginner]
- Mozzarella sticks — breaded fried mozzarella. tags: [american, snack, party, vegetarian, intermediate]
- Jalapeño poppers — cream-cheese-stuffed and bacon-wrapped. tags: [american, snack, party, intermediate]
- Stuffed mushrooms — sausage or cream-cheese filling. tags: [american, snack, party, intermediate]
- Pigs in a blanket — American version with hot dogs in dough. tags: [american, snack, party, kid-friendly, beginner]
- Spinach-artichoke dip — baked, cheese-melted. tags: [american, snack, party, vegetarian, beginner]
- Buffalo chicken dip — wing-flavour dip with cream cheese. tags: [american, snack, party, beginner]
- Onion dip — Lipton-soup-mix party classic. tags: [american, snack, party, vegetarian, beginner]
- Ranch dip — creamy herb dip. tags: [american, snack, party, vegetarian, beginner]
- Cheese ball — port-wine cheese spread. tags: [american, snack, party, vegetarian, intermediate]
- Deviled eggs — see Southern. tags: [american, snack, picnic, vegetarian, beginner]
- Pretzel bites — soft baked. tags: [american, snack, party, vegetarian, intermediate]
- Soft pretzels with cheese sauce — mall classic. tags: [american, snack, party, vegetarian, intermediate]
- Loaded baked potato skins — bacon, cheese, sour cream. tags: [american, snack, party, beginner]
- Onion rings — beer-battered. tags: [american, side, party, vegetarian, intermediate]
- Onion rings, panko — crisp coating. tags: [american, side, party, vegetarian, beginner]
- Mac and cheese balls — fried mac-and-cheese bites. tags: [american, snack, party, vegetarian, intermediate]

### New England seafood

- Lobster boil — Maine tradition. tags: [american, dinner, regional, intermediate]
- Steamed lobster — drawn butter. tags: [american, dinner, regional, beginner]
- Baked stuffed lobster — Ritz-cracker-stuffed. tags: [american, dinner, regional, intermediate]
- Lobster Newburg — see French / international. tags: [american, dinner, dinner-party, advanced]
- Lobster mac and cheese — luxe version. tags: [american, dinner, comfort-food, intermediate]
- Lobster bisque — see Clam chowder neighbours. tags: [american, dinner, regional, intermediate]
- New England fish chowder — proper smoked-fish-and-potato chowder. tags: [american, lunch, regional, intermediate]
- Cape Cod cod cakes — proper New England fish cakes. tags: [american, dinner, regional, intermediate]
- Maryland crab cakes — see Southern. tags: [american, dinner, regional, intermediate]
- Crab dip, hot — old-school New England. tags: [american, snack, regional, intermediate]
- Steamed Maine mussels. tags: [american, dinner, regional, beginner]
- Fried clam strips — Howard Johnson's classic. tags: [american, dinner, regional, intermediate]
- Boston baked beans — molasses-and-pork bean pot. tags: [american, side, regional, comfort-food, beginner]
- Boston brown bread — steamed cornmeal-rye loaf. tags: [american, side, regional, vegetarian, intermediate]
- Indian pudding — corn-meal-and-molasses dessert. tags: [american, dessert, regional, vegetarian, intermediate]

### Slow-cooker classics (cross-references — these recipes also appear in slow-cooker section)

- Mississippi pot roast — see Mains. tags: [american, dinner, slow-cooker, comfort-food, beginner]
- Pulled-pork shoulder — see Mains. tags: [american, dinner, slow-cooker, batch-cook, beginner]
- Chilli con carne — see Mains. tags: [american, dinner, slow-cooker, freezable, beginner]
- White chicken chilli — see Mains. tags: [american, dinner, slow-cooker, freezable, beginner]
- Sloppy joes — see Diner. tags: [american, dinner, slow-cooker, kid-friendly, beginner]
- Chicken tacos — see Tex-Mex. tags: [american, dinner, slow-cooker, kid-friendly, beginner]

---

## Mediterranean

Greek, Spanish, and the Levantine fringe where it overlaps geographically.
Spain has plenty of depth here; Levantine core sits in Middle Eastern.
Tessa Kiros, Claudia Roden, and Elizabeth David anchor the references.

### Greek

- Moussaka — proper aubergine, lamb, béchamel layered bake. tags: [mediterranean, greek, dinner, comfort-food, freezable, intermediate]
- Vegetarian moussaka — lentil-and-mushroom version. tags: [mediterranean, greek, dinner, vegetarian, freezable, intermediate]
- Pastitsio — Greek baked pasta with béchamel and lamb. tags: [mediterranean, greek, dinner, comfort-food, freezable, intermediate]
- Souvlaki, pork — marinated, skewered, grilled. tags: [mediterranean, greek, dinner, weeknight, beginner]
- Souvlaki, chicken — yoghurt-marinated. tags: [mediterranean, greek, dinner, weeknight, beginner]
- Souvlaki, lamb — herb-marinated. tags: [mediterranean, greek, dinner, weeknight, intermediate]
- Gyros, pork — slow-cooked stacked meat. tags: [mediterranean, greek, dinner, comfort-food, intermediate]
- Gyros, chicken — yoghurt-spiced. tags: [mediterranean, greek, dinner, weeknight, beginner]
- Greek salad — proper village-style, no lettuce. tags: [mediterranean, greek, salad, summer, vegetarian, beginner]
- Horiatiki salad — Greek country salad. tags: [mediterranean, greek, salad, summer, vegetarian, beginner]
- Spanakopita — spinach-feta filo pie. tags: [mediterranean, greek, lunch, vegetarian, freezable, intermediate]
- Tiropita — cheese filo triangles. tags: [mediterranean, greek, snack, vegetarian, intermediate]
- Kreatopita — Greek meat pie. tags: [mediterranean, greek, dinner, intermediate]
- Hortopita — wild-greens filo pie. tags: [mediterranean, greek, lunch, vegetarian, intermediate]
- Dolmades — vine-leaf-wrapped rice. tags: [mediterranean, greek, snack, vegetarian, vegan, intermediate]
- Stuffed peppers and tomatoes (yemista) — rice-filled baked vegetables. tags: [mediterranean, greek, dinner, vegetarian, intermediate]
- Briam — Greek roasted-vegetable tray. tags: [mediterranean, greek, dinner, vegetarian, vegan, beginner]
- Gigantes plaki — baked butter beans in tomato. tags: [mediterranean, greek, dinner, vegetarian, vegan, freezable, beginner]
- Fasolada — Greek bean soup. tags: [mediterranean, greek, lunch, vegetarian, vegan, freezable, beginner]
- Avgolemono soup — chicken, rice, egg-lemon. tags: [mediterranean, greek, lunch, comfort-food, beginner]
- Kakavia — Greek fisherman's soup. tags: [mediterranean, greek, lunch, intermediate]
- Stifado — slow-cooked beef-and-onion stew. tags: [mediterranean, greek, dinner, comfort-food, freezable, intermediate]
- Kleftiko — paper-wrapped slow-cooked lamb. tags: [mediterranean, greek, dinner, comfort-food, intermediate]
- Lamb fricassee — egg-lemon-thickened lamb. tags: [mediterranean, greek, dinner, intermediate]
- Saganaki — pan-fried halloumi or kefalograviera. tags: [mediterranean, greek, snack, vegetarian, beginner]
- Tzatziki — yoghurt-cucumber-garlic dip. tags: [mediterranean, greek, snack, vegetarian, beginner]
- Tirokafteri — spicy feta dip. tags: [mediterranean, greek, snack, vegetarian, beginner]
- Taramasalata — proper Greek cod-roe dip. tags: [mediterranean, greek, snack, intermediate]
- Skordalia — Greek garlic-potato dip. tags: [mediterranean, greek, snack, vegetarian, vegan, beginner]
- Melitzanosalata — smoky aubergine dip. tags: [mediterranean, greek, snack, vegetarian, vegan, beginner]
- Octopus in red wine — slow-cooked Greek classic. tags: [mediterranean, greek, dinner, dinner-party, intermediate]
- Grilled octopus, Greek-style — lemon, oregano, olive oil. tags: [mediterranean, greek, dinner, dinner-party, intermediate]
- Whole grilled bream with lemon — taverna classic. tags: [mediterranean, greek, dinner, weeknight, beginner]
- Greek-style roast lamb — Easter-Sunday slow-roast leg. tags: [mediterranean, greek, dinner, festive, beginner]
- Lemonato — lemon-roasted potatoes with lamb juices. tags: [mediterranean, greek, side, vegetarian, beginner]
- Lemon potatoes — oven-roast with stock, lemon, oregano. tags: [mediterranean, greek, side, vegetarian, vegan, beginner]
- Soutzoukakia — Smyrna-style cumin meatballs. tags: [mediterranean, greek, dinner, weeknight, freezable, beginner]
- Keftedes — Greek meatballs, fried. tags: [mediterranean, greek, snack, party, beginner]
- Bifteki — Greek hamburger steak. tags: [mediterranean, greek, dinner, weeknight, beginner]
- Soupies krasates — wine-braised cuttlefish. tags: [mediterranean, greek, dinner, dinner-party, intermediate]

### Spanish

- Paella valenciana — proper rabbit, chicken, snail paella. tags: [mediterranean, spanish, dinner, regional, intermediate]
- Paella mixta — chicken, prawn, mussel paella. tags: [mediterranean, spanish, dinner, dinner-party, intermediate]
- Paella de marisco — seafood-only paella. tags: [mediterranean, spanish, dinner, dinner-party, intermediate]
- Paella vegetariana — vegetable paella. tags: [mediterranean, spanish, dinner, vegetarian, intermediate]
- Arroz negro — squid-ink rice. tags: [mediterranean, spanish, dinner, dinner-party, intermediate]
- Fideuà — short-pasta paella. tags: [mediterranean, spanish, dinner, intermediate]
- Gazpacho andaluz — chilled tomato soup. tags: [mediterranean, spanish, summer, vegetarian, vegan, beginner]
- Salmorejo — thicker bread-tomato puree. tags: [mediterranean, spanish, summer, vegetarian, vegan, beginner]
- Ajoblanco — almond-and-garlic chilled soup. tags: [mediterranean, spanish, summer, vegetarian, vegan, beginner]
- Tortilla española — Spanish potato omelette. tags: [mediterranean, spanish, breakfast, vegetarian, beginner]
- Tortilla with onion — sweeter classic. tags: [mediterranean, spanish, breakfast, vegetarian, beginner]
- Patatas bravas — fried potatoes with brava sauce. tags: [mediterranean, spanish, snack, party, vegetarian, beginner]
- Patatas aliñadas — Andalusian dressed potato salad. tags: [mediterranean, spanish, side, summer, vegetarian, vegan, beginner]
- Pan con tomate — tomato-rubbed grilled bread. tags: [mediterranean, spanish, breakfast, summer, vegetarian, vegan, beginner]
- Pimientos de Padrón — blistered green peppers. tags: [mediterranean, spanish, snack, party, vegetarian, vegan, beginner]
- Croquetas de jamón — ham croquettes. tags: [mediterranean, spanish, snack, party, intermediate]
- Croquetas de pollo — chicken croquettes. tags: [mediterranean, spanish, snack, party, intermediate]
- Croquetas de bacalao — salt-cod croquettes. tags: [mediterranean, spanish, snack, party, intermediate]
- Gambas al ajillo — garlic-and-chilli prawns. tags: [mediterranean, spanish, snack, party, beginner]
- Gambas pil-pil — sizzling-oil prawns. tags: [mediterranean, spanish, snack, party, beginner]
- Boquerones en vinagre — fresh anchovies in vinegar. tags: [mediterranean, spanish, snack, party, beginner]
- Boquerones fritos — fried fresh anchovies. tags: [mediterranean, spanish, snack, party, intermediate]
- Calamares a la romana — fried squid rings. tags: [mediterranean, spanish, snack, party, intermediate]
- Chorizo al vino tinto — chorizo cooked in red wine. tags: [mediterranean, spanish, snack, party, beginner]
- Chorizo and butter-bean stew — slow-cooked. tags: [mediterranean, spanish, dinner, comfort-food, freezable, beginner]
- Fabada asturiana — Asturian bean-and-pork stew. tags: [mediterranean, spanish, dinner, regional, freezable, intermediate]
- Cocido madrileño — Madrid chickpea-and-meat stew. tags: [mediterranean, spanish, dinner, regional, intermediate]
- Pisto manchego — Spanish ratatouille. tags: [mediterranean, spanish, dinner, vegetarian, vegan, beginner]
- Migas — fried-bread shepherd's dish. tags: [mediterranean, spanish, breakfast, regional, intermediate]
- Albóndigas en salsa — Spanish meatballs in tomato. tags: [mediterranean, spanish, dinner, comfort-food, freezable, beginner]
- Empanada gallega — Galician fish-and-pepper pie. tags: [mediterranean, spanish, lunch, regional, intermediate]
- Pulpo a la gallega — Galician octopus with paprika. tags: [mediterranean, spanish, dinner, dinner-party, intermediate]
- Pollo al ajillo — garlic-and-sherry chicken. tags: [mediterranean, spanish, dinner, weeknight, beginner]
- Pollo en pepitoria — almond-and-saffron chicken. tags: [mediterranean, spanish, dinner, intermediate]
- Cordero al chilindrón — Aragonese lamb with peppers. tags: [mediterranean, spanish, dinner, regional, intermediate]
- Bacalao al pil-pil — Basque salt-cod in emulsified olive oil. tags: [mediterranean, spanish, dinner, regional, advanced]
- Bacalao a la vizcaína — salt-cod in Biscay sauce. tags: [mediterranean, spanish, dinner, regional, intermediate]
- Romesco sauce — Catalan pepper-almond sauce. tags: [mediterranean, spanish, side, vegetarian, vegan, beginner]
- Allioli — Catalan garlic mayonnaise. tags: [mediterranean, spanish, side, vegetarian, beginner]
- Sangria — wine, fruit, brandy. tags: [mediterranean, spanish, drink, party, vegetarian, vegan, beginner]

---

## Middle Eastern

Levantine core (Lebanese, Syrian, Palestinian, Jordanian) plus Persian and
Turkish. Claudia Roden, Sami Tamimi, Yotam Ottolenghi, Naomi Duguid, and
Margaret Shaida (`The Legendary Cuisine of Persia`) anchor the references.

### Levantine

- Hummus — proper smooth tahini-and-chickpea. tags: [middle-eastern, lebanese, snack, party, vegetarian, vegan, beginner]
- Hummus with chickpeas — whole-chickpea topping. tags: [middle-eastern, lebanese, snack, party, vegetarian, vegan, beginner]
- Hummus bi tahini — straight, with olive oil and paprika. tags: [middle-eastern, lebanese, snack, vegetarian, vegan, beginner]
- Musabaha — warm chickpea-tahini bowl. tags: [middle-eastern, palestinian, lunch, vegetarian, vegan, beginner]
- Foul medames — slow-cooked broad beans with lemon and garlic. tags: [middle-eastern, egyptian, breakfast, vegetarian, vegan, beginner]
- Mutabal — smoked aubergine-tahini dip. tags: [middle-eastern, lebanese, snack, vegetarian, vegan, beginner]
- Baba ghanoush — smoky aubergine dip. tags: [middle-eastern, lebanese, snack, vegetarian, vegan, beginner]
- Muhammara — Aleppine roasted-pepper walnut dip. tags: [middle-eastern, syrian, snack, vegetarian, vegan, beginner]
- Labneh — strained yoghurt cheese. tags: [middle-eastern, lebanese, snack, vegetarian, beginner]
- Labneh with za'atar and olive oil — classic mezze. tags: [middle-eastern, lebanese, snack, vegetarian, beginner]
- Labneh balls in olive oil — preserved cheese. tags: [middle-eastern, lebanese, snack, vegetarian, intermediate]
- Tabbouleh — proper Lebanese parsley-heavy. tags: [middle-eastern, lebanese, salad, vegetarian, vegan, beginner]
- Fattoush — sumac and toasted-bread salad. tags: [middle-eastern, lebanese, salad, vegetarian, vegan, beginner]
- Falafel — chickpea or broad-bean fritters. tags: [middle-eastern, lebanese, snack, vegetarian, vegan, intermediate]
- Falafel wrap — pita with falafel, tahini, salad. tags: [middle-eastern, lebanese, lunch, vegetarian, vegan, beginner]
- Shawarma, chicken — spiced grilled chicken in wrap. tags: [middle-eastern, lebanese, dinner, weeknight, beginner]
- Shawarma, lamb — slow-cooked lamb shoulder shawarma. tags: [middle-eastern, lebanese, dinner, intermediate]
- Manakish za'atar — flatbread with za'atar and oil. tags: [middle-eastern, lebanese, breakfast, vegetarian, vegan, intermediate]
- Manakish cheese — akawi-cheese topped flatbread. tags: [middle-eastern, lebanese, breakfast, vegetarian, intermediate]
- Manakish lahm bi ajeen — Lebanese-style minced-meat flatbread. tags: [middle-eastern, lebanese, dinner, intermediate]
- Lahmacun — Turkish thin-pizza with spiced lamb. tags: [middle-eastern, turkish, snack, intermediate]
- Sfiha — Levantine open meat pies. tags: [middle-eastern, lebanese, snack, intermediate]
- Fatayer — spinach-stuffed triangle pies. tags: [middle-eastern, lebanese, snack, vegetarian, vegan, intermediate]
- Kibbeh — bulgur-and-lamb shells. tags: [middle-eastern, lebanese, snack, advanced]
- Kibbeh nayyeh — raw bulgur-and-lamb tartare. tags: [middle-eastern, lebanese, snack, advanced]
- Kibbeh bil sanieh — tray-baked kibbeh. tags: [middle-eastern, lebanese, dinner, intermediate]
- Mujadara — lentil-and-rice with fried onion. tags: [middle-eastern, levantine, dinner, vegetarian, vegan, beginner]
- Mujaddara with bulgur — bulgur variant. tags: [middle-eastern, levantine, dinner, vegetarian, vegan, beginner]
- Maqluba — Palestinian upside-down rice with chicken and aubergine. tags: [middle-eastern, palestinian, dinner, comfort-food, intermediate]
- Mansaf — Jordanian lamb with jameed yoghurt and rice. tags: [middle-eastern, jordanian, dinner, festive, intermediate]
- Musakhan — Palestinian sumac-onion chicken on flatbread. tags: [middle-eastern, palestinian, dinner, intermediate]
- Kafta meatballs — grilled spiced minced lamb. tags: [middle-eastern, lebanese, dinner, weeknight, beginner]
- Kafta bil sanieh — tray-baked kafta in tomato. tags: [middle-eastern, lebanese, dinner, weeknight, beginner]
- Shish taouk — chicken kebab, yoghurt-marinated. tags: [middle-eastern, lebanese, dinner, weeknight, beginner]
- Shish kebab — grilled marinated lamb cubes. tags: [middle-eastern, levantine, dinner, weeknight, beginner]
- Stuffed vine leaves with lamb — warm dish. tags: [middle-eastern, lebanese, dinner, intermediate]
- Stuffed courgettes (koosa mahshi) — rice and lamb. tags: [middle-eastern, lebanese, dinner, intermediate]
- Stuffed cabbage rolls (malfouf) — vinegar and garlic. tags: [middle-eastern, lebanese, dinner, intermediate]
- Bamia — okra and lamb stew. tags: [middle-eastern, levantine, dinner, comfort-food, freezable, intermediate]
- Molokhia — jute-leaf soup with chicken. tags: [middle-eastern, egyptian, dinner, comfort-food, intermediate]
- Koshari — Egyptian rice, lentil, pasta. tags: [middle-eastern, egyptian, dinner, vegetarian, vegan, intermediate]
- Foul mudammas — see Egyptian breakfast. tags: [middle-eastern, egyptian, breakfast, vegetarian, vegan, beginner]
- Shakshuka — eggs poached in tomato-pepper sauce. tags: [middle-eastern, levantine, breakfast, vegetarian, beginner]
- Green shakshuka — spinach, chard, leek base. tags: [middle-eastern, levantine, breakfast, vegetarian, beginner]

### Persian

- Tahdig — crispy-bottom Persian rice. tags: [middle-eastern, persian, side, vegetarian, intermediate]
- Saffron rice (chelow) — proper steam-tahdig. tags: [middle-eastern, persian, side, vegetarian, intermediate]
- Zereshk polo — barberry-saffron rice with chicken. tags: [middle-eastern, persian, dinner, intermediate]
- Adas polo — lentil-and-rice with dates. tags: [middle-eastern, persian, dinner, vegetarian, intermediate]
- Baghali polo — fava-and-dill rice with lamb. tags: [middle-eastern, persian, dinner, intermediate]
- Albaloo polo — sour-cherry rice with chicken. tags: [middle-eastern, persian, dinner, intermediate]
- Sabzi polo — herb-rice for new year. tags: [middle-eastern, persian, side, festive, vegetarian, intermediate]
- Lubia polo — green-bean rice. tags: [middle-eastern, persian, dinner, intermediate]
- Khoresh ghormeh sabzi — herb-kidney-bean lamb stew. tags: [middle-eastern, persian, dinner, comfort-food, freezable, intermediate]
- Khoresh fesenjan — pomegranate-walnut chicken stew. tags: [middle-eastern, persian, dinner, comfort-food, intermediate]
- Khoresh gheymeh — split-pea-and-lamb stew. tags: [middle-eastern, persian, dinner, comfort-food, intermediate]
- Khoresh karafs — celery-lamb stew. tags: [middle-eastern, persian, dinner, intermediate]
- Khoresh bademjan — aubergine-lamb stew. tags: [middle-eastern, persian, dinner, comfort-food, intermediate]
- Khoresh-e mast — Isfahan yoghurt-lamb stew. tags: [middle-eastern, persian, dinner, intermediate]
- Mast-o khiar — yoghurt-cucumber dip. tags: [middle-eastern, persian, snack, vegetarian, beginner]
- Mast-o musir — yoghurt-shallot dip. tags: [middle-eastern, persian, snack, vegetarian, beginner]
- Kashk-e bademjan — aubergine-and-whey dip. tags: [middle-eastern, persian, snack, vegetarian, intermediate]
- Kuku sabzi — Persian herb-egg cake. tags: [middle-eastern, persian, lunch, vegetarian, beginner]
- Kuku sibzamini — potato cake. tags: [middle-eastern, persian, lunch, vegetarian, beginner]
- Ash-e reshteh — herb-bean-noodle soup. tags: [middle-eastern, persian, lunch, vegetarian, freezable, intermediate]
- Ash-e jow — barley-bean herb soup. tags: [middle-eastern, persian, lunch, vegetarian, beginner]
- Aash-e anar — pomegranate soup. tags: [middle-eastern, persian, lunch, intermediate]
- Halim — wheat-and-meat porridge. tags: [middle-eastern, persian, breakfast, intermediate]
- Kebab koobideh — minced-lamb skewers. tags: [middle-eastern, persian, dinner, intermediate]
- Joojeh kebab — saffron-lemon chicken kebab. tags: [middle-eastern, persian, dinner, beginner]
- Kebab barg — fillet-of-lamb kebab. tags: [middle-eastern, persian, dinner, intermediate]
- Kebab soltani — koobideh-and-barg combo. tags: [middle-eastern, persian, dinner, intermediate]
- Salad-e shirazi — cucumber-tomato-onion-mint salad. tags: [middle-eastern, persian, salad, summer, vegetarian, vegan, beginner]
- Naan-e barbari — Persian flatbread. tags: [middle-eastern, persian, side, vegetarian, vegan, intermediate]
- Naan-e taftoon — thin sesame-topped flatbread. tags: [middle-eastern, persian, side, vegetarian, vegan, intermediate]
- Naan-e sangak — pebble-baked stone bread. tags: [middle-eastern, persian, side, vegetarian, vegan, advanced]

### Turkish

- Köfte, izmir — Turkish meatballs with peppers. tags: [middle-eastern, turkish, dinner, comfort-food, intermediate]
- Köfte, çiğ — raw bulgur köfte. tags: [middle-eastern, turkish, snack, intermediate]
- Adana kebabı — minced-lamb skewer. tags: [middle-eastern, turkish, dinner, intermediate]
- Urfa kebabı — milder version. tags: [middle-eastern, turkish, dinner, intermediate]
- Iskender kebab — sliced doner on bread with yoghurt and butter. tags: [middle-eastern, turkish, dinner, intermediate]
- Mantı — Turkish lamb dumplings with yoghurt. tags: [middle-eastern, turkish, dinner, advanced]
- Pide, kıymalı — boat-shaped flatbread with mince. tags: [middle-eastern, turkish, dinner, intermediate]
- Pide, peynirli — cheese pide. tags: [middle-eastern, turkish, dinner, vegetarian, intermediate]
- Pide, sucuklu — sucuk-and-cheese pide. tags: [middle-eastern, turkish, dinner, intermediate]
- Lahmacun — see Levantine. tags: [middle-eastern, turkish, snack, intermediate]
- Mercimek çorbası — red-lentil soup. tags: [middle-eastern, turkish, lunch, vegetarian, vegan, beginner]
- Yayla çorbası — yoghurt-rice soup. tags: [middle-eastern, turkish, lunch, vegetarian, beginner]
- Ezogelin çorbası — bulgur-lentil-tomato soup. tags: [middle-eastern, turkish, lunch, vegetarian, beginner]
- İmam bayıldı — stuffed aubergine in olive oil. tags: [middle-eastern, turkish, dinner, vegetarian, vegan, intermediate]
- Karnıyarık — stuffed aubergine with mince. tags: [middle-eastern, turkish, dinner, intermediate]
- Dolma, yaprak — vine-leaf rice rolls. tags: [middle-eastern, turkish, snack, vegetarian, vegan, intermediate]
- Dolma, biber — stuffed peppers. tags: [middle-eastern, turkish, dinner, vegetarian, intermediate]
- Cacık — Turkish tzatziki. tags: [middle-eastern, turkish, snack, vegetarian, beginner]
- Patlıcan salatası — smoked-aubergine salad. tags: [middle-eastern, turkish, salad, vegetarian, vegan, beginner]
- Çoban salatası — shepherd's salad. tags: [middle-eastern, turkish, salad, summer, vegetarian, vegan, beginner]
- Sigara böreği — cigarette pastries with cheese. tags: [middle-eastern, turkish, snack, vegetarian, intermediate]
- Su böreği — water pastry with cheese. tags: [middle-eastern, turkish, snack, vegetarian, advanced]
- Menemen — Turkish-style scrambled eggs with tomato and pepper. tags: [middle-eastern, turkish, breakfast, vegetarian, beginner]
- Sucuklu yumurta — sucuk and eggs. tags: [middle-eastern, turkish, breakfast, beginner]

---

## North African

Moroccan, Tunisian, Egyptian. Paula Wolfert's `Moroccan Cuisine` and
`The Cooking of the Eastern Mediterranean` anchor; Claudia Roden's
`Book of Jewish Food` covers North African Jewish cookery.

### Moroccan

- Tagine of lamb with prunes and almonds — sweet-savoury classic. tags: [north-african, moroccan, dinner, comfort-food, freezable, intermediate]
- Tagine of lamb with apricot — autumn version. tags: [north-african, moroccan, dinner, freezable, intermediate]
- Tagine of lamb with quince — autumn version. tags: [north-african, moroccan, dinner, freezable, intermediate]
- Tagine of chicken with preserved lemon and olives — bright and salty. tags: [north-african, moroccan, dinner, freezable, intermediate]
- Tagine of chicken with figs — sweeter spiced. tags: [north-african, moroccan, dinner, freezable, intermediate]
- Tagine of beef with sweet potato — autumn version. tags: [north-african, moroccan, dinner, freezable, intermediate]
- Tagine of fish — chermoula-marinated. tags: [north-african, moroccan, dinner, intermediate]
- Vegetable tagine — seven-vegetable Friday tagine. tags: [north-african, moroccan, dinner, vegetarian, vegan, intermediate]
- Couscous royale — seven-vegetable couscous with merguez and lamb. tags: [north-african, moroccan, dinner, dinner-party, intermediate]
- Couscous with chicken and chickpeas — Friday-couscous. tags: [north-african, moroccan, dinner, comfort-food, beginner]
- Couscous with fish — coastal version. tags: [north-african, moroccan, dinner, intermediate]
- Vegetable couscous — seven-vegetable version. tags: [north-african, moroccan, dinner, vegetarian, vegan, beginner]
- Harira — Ramadan lamb-chickpea-lentil soup. tags: [north-african, moroccan, lunch, comfort-food, freezable, intermediate]
- Pastilla, chicken — sweet-savoury filo pie. tags: [north-african, moroccan, dinner, festive, advanced]
- Pastilla, pigeon — traditional version. tags: [north-african, moroccan, dinner, festive, advanced]
- Pastilla, seafood — modern version. tags: [north-african, moroccan, dinner, dinner-party, advanced]
- Mrouzia — sweet honey-spiced lamb tagine. tags: [north-african, moroccan, dinner, festive, intermediate]
- Tangia — Marrakech slow-cooked clay-pot meat. tags: [north-african, moroccan, dinner, intermediate]
- Mechoui — Moroccan whole-roast lamb. tags: [north-african, moroccan, dinner, festive, advanced]
- Kefta tagine — meatballs in tomato-and-egg. tags: [north-african, moroccan, dinner, weeknight, beginner]
- Kefta skewers — grilled spiced minced lamb. tags: [north-african, moroccan, dinner, weeknight, beginner]
- Bissara — Moroccan broad-bean soup. tags: [north-african, moroccan, breakfast, vegetarian, vegan, beginner]
- Zaalouk — Moroccan aubergine-tomato salad. tags: [north-african, moroccan, salad, vegetarian, vegan, beginner]
- Taktouka — green-pepper-tomato salad. tags: [north-african, moroccan, salad, vegetarian, vegan, beginner]
- Mechouia — Tunisian-style grilled pepper salad. tags: [north-african, tunisian, salad, vegetarian, vegan, beginner]
- Carrot salad with cumin and lemon — Moroccan cooked. tags: [north-african, moroccan, salad, vegetarian, vegan, beginner]
- Chermoula — herb-and-spice marinade. tags: [north-african, moroccan, side, vegetarian, vegan, beginner]
- Harissa — Tunisian chilli paste. tags: [north-african, tunisian, side, vegetarian, vegan, beginner]
- Ras el hanout — spice-blend reference. tags: [north-african, moroccan, side, vegetarian, vegan, beginner]
- Khobz — round Moroccan bread. tags: [north-african, moroccan, side, vegetarian, vegan, intermediate]
- Msemen — square laminated flatbread. tags: [north-african, moroccan, breakfast, vegetarian, intermediate]
- Baghrir — Moroccan thousand-hole pancake. tags: [north-african, moroccan, breakfast, vegetarian, intermediate]
- Sfenj — Moroccan doughnut. tags: [north-african, moroccan, breakfast, vegetarian, intermediate]
- B'stilla, m'hencha and other filo coils — see Baking. tags: [north-african, moroccan, dessert, vegetarian, intermediate]

### Tunisian

- Brik — Tunisian filo with egg and tuna. tags: [north-african, tunisian, snack, intermediate]
- Brik à l'oeuf — egg-only brik. tags: [north-african, tunisian, snack, vegetarian, intermediate]
- Couscous à la tunisienne — fish-and-vegetable couscous. tags: [north-african, tunisian, dinner, intermediate]
- Lablabi — Tunisian chickpea soup with egg and bread. tags: [north-african, tunisian, breakfast, vegetarian, intermediate]
- Slata mechouia — see Moroccan section. tags: [north-african, tunisian, salad, vegetarian, vegan, beginner]
- Tunisian shakshuka — harissa-laced. tags: [north-african, tunisian, breakfast, vegetarian, beginner]
- Kefteji — Tunisian fried-vegetable mash. tags: [north-african, tunisian, dinner, vegetarian, intermediate]
- Ojja — egg-and-tomato pan with merguez. tags: [north-african, tunisian, breakfast, intermediate]
- Merguez — North African spiced lamb sausage. tags: [north-african, tunisian, dinner, intermediate]
- Tajine tunisienne — Tunisian-style baked omelette tajine. tags: [north-african, tunisian, dinner, vegetarian, intermediate]

### Egyptian

- Koshari — see Levantine. tags: [north-african, egyptian, dinner, vegetarian, vegan, intermediate]
- Foul mudammas — slow-cooked broad beans. tags: [north-african, egyptian, breakfast, vegetarian, vegan, beginner]
- Ta'ameya — Egyptian broad-bean falafel. tags: [north-african, egyptian, snack, vegetarian, vegan, intermediate]
- Molokhia — see Levantine. tags: [north-african, egyptian, dinner, intermediate]
- Ful nabed — Egyptian white-bean stew. tags: [north-african, egyptian, dinner, vegetarian, vegan, beginner]
- Hawawshi — Egyptian spiced-meat-stuffed flatbread. tags: [north-african, egyptian, dinner, intermediate]
- Mahshi cromb — stuffed cabbage rolls. tags: [north-african, egyptian, dinner, intermediate]
- Mahshi felfel — stuffed peppers, Egyptian style. tags: [north-african, egyptian, dinner, vegetarian, intermediate]
- Bessara — Egyptian pea soup. tags: [north-african, egyptian, lunch, vegetarian, vegan, beginner]
- Roz bi laban — rice pudding with milk and cinnamon. tags: [north-african, egyptian, dessert, vegetarian, beginner]

---

## Caribbean

Jamaican, Trinidadian, Bajan, Cuban, and Hispanic Caribbean. Levi Roots,
Riaz Phillips (`Belly Full`), Helen Willinsky for the jerk canon.

### Jamaican and English-speaking Caribbean

- Jerk chicken — proper allspice-and-scotch-bonnet-marinated, charred. tags: [caribbean, jamaican, dinner, comfort-food, intermediate]
- Jerk chicken with rice and peas — full plate. tags: [caribbean, jamaican, dinner, comfort-food, intermediate]
- Jerk pork — slow-cooked jerk shoulder. tags: [caribbean, jamaican, dinner, comfort-food, intermediate]
- Jerk fish — whole grilled red snapper. tags: [caribbean, jamaican, dinner, intermediate]
- Curry goat — Jamaican curry-house favourite. tags: [caribbean, jamaican, dinner, comfort-food, freezable, intermediate]
- Curry chicken — Jamaican curry-powder version. tags: [caribbean, jamaican, dinner, weeknight, beginner]
- Brown stew chicken — caramelised-sugar braise. tags: [caribbean, jamaican, dinner, comfort-food, freezable, beginner]
- Stew peas — kidney bean, salt beef, dumplings. tags: [caribbean, jamaican, dinner, comfort-food, freezable, intermediate]
- Oxtail and butter beans — slow-cooked classic. tags: [caribbean, jamaican, dinner, comfort-food, freezable, intermediate]
- Ackee and saltfish — Jamaican national dish. tags: [caribbean, jamaican, breakfast, intermediate]
- Saltfish fritters (stamp-and-go) — Jamaican breakfast cake. tags: [caribbean, jamaican, breakfast, intermediate]
- Callaloo — leafy-green stew, Jamaican-style. tags: [caribbean, jamaican, side, vegetarian, vegan, beginner]
- Rice and peas — proper coconut-and-kidney-bean rice. tags: [caribbean, jamaican, side, vegetarian, vegan, beginner]
- Festival dumplings — sweet fried cornmeal dumplings. tags: [caribbean, jamaican, side, vegetarian, intermediate]
- Bammy — cassava-flatbread. tags: [caribbean, jamaican, side, vegetarian, vegan, beginner]
- Hard-dough bread — sweet Caribbean white loaf. tags: [caribbean, jamaican, side, vegetarian, intermediate]
- Plantain, fried — savoury and sweet ripeness. tags: [caribbean, side, vegetarian, vegan, beginner]
- Patties, Jamaican beef — flaky turmeric-pastry patties. tags: [caribbean, jamaican, snack, freezable, intermediate]
- Patties, Jamaican chicken. tags: [caribbean, jamaican, snack, freezable, intermediate]
- Patties, Jamaican vegetable. tags: [caribbean, jamaican, snack, vegetarian, freezable, intermediate]
- Escovitch fish — fried fish in vinegar-pepper escabeche. tags: [caribbean, jamaican, dinner, intermediate]
- Jamaican fish tea — clear, fiery fish broth. tags: [caribbean, jamaican, lunch, beginner]
- Pepperpot soup — Guyanese / Caribbean meat-and-greens stew. tags: [caribbean, guyanese, dinner, comfort-food, freezable, intermediate]

### Trinidadian

- Doubles — Trinidadian curried-chickpea-and-fried-flatbread. tags: [caribbean, trinidadian, breakfast, vegetarian, vegan, intermediate]
- Roti, dhalpuri — split-pea-stuffed flatbread. tags: [caribbean, trinidadian, side, vegetarian, vegan, intermediate]
- Roti, paratha (buss-up-shut) — flaky, torn flatbread. tags: [caribbean, trinidadian, side, vegetarian, vegan, intermediate]
- Curry chicken Trinidadian — turmeric-led. tags: [caribbean, trinidadian, dinner, comfort-food, beginner]
- Curry goat, Trini — different spice mix to Jamaican. tags: [caribbean, trinidadian, dinner, freezable, intermediate]
- Curry duck — pepper-heavy. tags: [caribbean, trinidadian, dinner, intermediate]
- Curry crab and dumpling — Tobago classic. tags: [caribbean, trinidadian, dinner, regional, intermediate]
- Pelau, beef — caramelised-sugar rice with beef and pigeon peas. tags: [caribbean, trinidadian, dinner, comfort-food, beginner]
- Pelau, chicken — chicken version. tags: [caribbean, trinidadian, dinner, comfort-food, beginner]
- Macaroni pie, Trinidadian — baked mac and cheese, Caribbean style. tags: [caribbean, trinidadian, side, comfort-food, vegetarian, beginner]
- Bake and shark — Maracas Beach fried-shark sandwich. tags: [caribbean, trinidadian, lunch, regional, intermediate]
- Bake (fry bake) — fried flat bread for breakfast. tags: [caribbean, trinidadian, breakfast, vegetarian, intermediate]

### Cuban / Hispanic Caribbean

- Ropa vieja — Cuban shredded-beef stew. tags: [caribbean, cuban, dinner, comfort-food, freezable, intermediate]
- Cuban black beans — slow-cooked frijoles negros. tags: [caribbean, cuban, side, vegetarian, vegan, freezable, beginner]
- Cuban rice and black beans — moros y cristianos. tags: [caribbean, cuban, side, vegetarian, vegan, beginner]
- Cuban sandwich — pressed ham, pork, swiss, pickle, mustard. tags: [caribbean, cuban, lunch, intermediate]
- Lechón asado — slow-roast Cuban mojo pork shoulder. tags: [caribbean, cuban, dinner, festive, intermediate]
- Mojo marinade — citrus-garlic-cumin. tags: [caribbean, cuban, side, vegetarian, vegan, beginner]
- Picadillo — Cuban spiced-mince with olives and raisins. tags: [caribbean, cuban, dinner, comfort-food, freezable, beginner]
- Tostones — twice-fried plantain slices. tags: [caribbean, side, vegetarian, vegan, beginner]
- Maduros — sweet ripe plantain slices. tags: [caribbean, side, vegetarian, vegan, beginner]
- Mofongo — Puerto Rican mashed plantain with pork crackling. tags: [caribbean, puerto-rican, dinner, intermediate]
- Arroz con pollo — Caribbean-Spanish chicken and rice. tags: [caribbean, dinner, comfort-food, intermediate]
- Mango chow — Trinidadian green-mango snack. tags: [caribbean, trinidadian, snack, vegetarian, vegan, beginner]

---

## Eastern European

Polish, Hungarian, Russian, Czech, Ukrainian. Anya von Bremzen, Olia
Hercules, George Lang (`The Cuisine of Hungary`), and Władysław Łoziński
on the historical Polish side.

### Polish

- Pierogi ruskie — potato-and-cheese dumplings. tags: [eastern-european, polish, dinner, vegetarian, freezable, intermediate]
- Pierogi z miesem — meat-stuffed pierogi. tags: [eastern-european, polish, dinner, freezable, intermediate]
- Pierogi z grzybami — wild-mushroom pierogi. tags: [eastern-european, polish, dinner, vegetarian, intermediate]
- Pierogi z kapustą — sauerkraut-and-mushroom pierogi. tags: [eastern-european, polish, dinner, vegetarian, vegan, intermediate]
- Pierogi z owocami — sweet fruit pierogi. tags: [eastern-european, polish, dessert, vegetarian, intermediate]
- Bigos — hunter's-stew with sauerkraut, sausage, pork. tags: [eastern-european, polish, dinner, comfort-food, freezable, intermediate]
- Kotlety mielone — Polish meat patties. tags: [eastern-european, polish, dinner, comfort-food, freezable, beginner]
- Kotlety schabowe — breaded pork cutlet. tags: [eastern-european, polish, dinner, comfort-food, intermediate]
- Gołąbki — stuffed cabbage rolls with mince and rice. tags: [eastern-european, polish, dinner, freezable, intermediate]
- Żurek — sour-rye soup with sausage. tags: [eastern-european, polish, lunch, regional, intermediate]
- Barszcz czerwony — clear beetroot soup. tags: [eastern-european, polish, lunch, vegetarian, vegan, beginner]
- Barszcz biały — white-rye soup. tags: [eastern-european, polish, lunch, comfort-food, beginner]
- Zupa pomidorowa — Polish tomato-rice soup. tags: [eastern-european, polish, lunch, vegetarian, beginner]
- Rosół — Polish chicken broth with noodles. tags: [eastern-european, polish, lunch, comfort-food, beginner]
- Krupnik — barley-and-vegetable soup. tags: [eastern-european, polish, lunch, vegetarian, beginner]
- Placki ziemniaczane — potato pancakes. tags: [eastern-european, polish, breakfast, vegetarian, beginner]
- Mizeria — cucumber-sour-cream salad. tags: [eastern-european, polish, salad, summer, vegetarian, beginner]
- Surówka z kapusty — pickled-cabbage salad. tags: [eastern-european, polish, salad, vegetarian, vegan, beginner]
- Śledzie w oleju — herring in oil. tags: [eastern-european, polish, snack, festive, intermediate]
- Karp w galarecie — jellied carp for Christmas Eve. tags: [eastern-european, polish, dinner, festive, advanced]
- Kapusta z grochem — sauerkraut with split peas. tags: [eastern-european, polish, side, vegetarian, vegan, beginner]
- Zapiekanka — Polish street-food cheese-and-mushroom open sandwich. tags: [eastern-european, polish, snack, vegetarian, beginner]

### Hungarian

- Goulash — paprika beef stew with potatoes. tags: [eastern-european, hungarian, dinner, comfort-food, freezable, intermediate]
- Pörkölt — drier paprika stew, no potato. tags: [eastern-european, hungarian, dinner, comfort-food, freezable, intermediate]
- Paprikash, chicken — paprika cream sauce, served with nokedli. tags: [eastern-european, hungarian, dinner, comfort-food, intermediate]
- Paprikash, veal. tags: [eastern-european, hungarian, dinner, intermediate]
- Töltött káposzta — stuffed cabbage rolls. tags: [eastern-european, hungarian, dinner, comfort-food, freezable, intermediate]
- Halászlé — Hungarian fisherman's soup. tags: [eastern-european, hungarian, lunch, regional, intermediate]
- Lecsó — pepper and tomato stew. tags: [eastern-european, hungarian, dinner, vegetarian, vegan, beginner]
- Tarhonya — Hungarian egg-barley with paprika. tags: [eastern-european, hungarian, side, vegetarian, beginner]
- Lángos — Hungarian fried-dough flatbread. tags: [eastern-european, hungarian, snack, vegetarian, intermediate]
- Hortobágyi palacsinta — savoury crepe with paprika sauce. tags: [eastern-european, hungarian, dinner, intermediate]
- Korhelyleves — sauerkraut hangover soup. tags: [eastern-european, hungarian, lunch, comfort-food, intermediate]

### Russian and Ukrainian

- Borscht — Ukrainian beetroot soup with sour cream and dill. tags: [eastern-european, ukrainian, lunch, comfort-food, freezable, beginner]
- Cold borscht — summer chilled version. tags: [eastern-european, ukrainian, lunch, summer, beginner]
- Shchi — Russian cabbage soup. tags: [eastern-european, russian, lunch, comfort-food, beginner]
- Solyanka — Russian sour-pickled-soup. tags: [eastern-european, russian, lunch, comfort-food, intermediate]
- Beef stroganoff — Russian-Soviet classic. tags: [eastern-european, russian, dinner, comfort-food, beginner]
- Pelmeni — Siberian meat dumplings. tags: [eastern-european, russian, dinner, comfort-food, freezable, intermediate]
- Vareniki — Ukrainian dumplings with potato or cherry. tags: [eastern-european, ukrainian, dinner, vegetarian, freezable, intermediate]
- Olivier salad — Russian potato-and-pickle salad. tags: [eastern-european, russian, salad, festive, beginner]
- Vinaigrette salad (vinegret) — Russian beetroot-vegetable salad. tags: [eastern-european, russian, salad, vegetarian, vegan, beginner]
- Sel'yodka pod shuboy — herring under a fur coat, layered salad. tags: [eastern-european, russian, salad, festive, intermediate]
- Cabbage piroshki — yeasted hand pies. tags: [eastern-european, russian, snack, vegetarian, intermediate]
- Meat piroshki — beef-stuffed hand pies. tags: [eastern-european, russian, snack, intermediate]
- Blini — yeasted Russian pancakes with smoked salmon and sour cream. tags: [eastern-european, russian, breakfast, dinner-party, intermediate]
- Buckwheat blini — traditional gluten-light version. tags: [eastern-european, russian, breakfast, intermediate]
- Kasha — buckwheat porridge with butter. tags: [eastern-european, russian, breakfast, vegetarian, beginner]
- Holodets — Russian aspic-set meat. tags: [eastern-european, russian, dinner, festive, advanced]
- Stroganina — Siberian frozen-fish shavings. tags: [eastern-european, russian, regional, intermediate]
- Cabbage rolls (golubtsy) — Russian-style. tags: [eastern-european, russian, dinner, comfort-food, freezable, intermediate]
- Chicken Kiev — butter-stuffed breaded chicken breast. tags: [eastern-european, ukrainian, dinner, comfort-food, intermediate]
- Salo — cured pork fat. tags: [eastern-european, ukrainian, snack, intermediate]
- Pampushky — Ukrainian garlic-butter bread rolls. tags: [eastern-european, ukrainian, side, vegetarian, intermediate]
- Holubtsi — Ukrainian stuffed cabbage rolls. tags: [eastern-european, ukrainian, dinner, freezable, intermediate]

### Czech

- Svíčková na smetaně — Czech sirloin in cream-vegetable sauce with dumplings. tags: [eastern-european, czech, dinner, comfort-food, intermediate]
- Vepřo-knedlo-zelo — roast pork, dumplings, sauerkraut. tags: [eastern-european, czech, dinner, comfort-food, intermediate]
- Goulash, Czech-style — beefy, with bread dumplings. tags: [eastern-european, czech, dinner, comfort-food, freezable, intermediate]
- Knedlíky, bread dumplings — sliced steamed Czech bread loaf. tags: [eastern-european, czech, side, vegetarian, intermediate]
- Knedlíky, potato — potato-flour dumpling. tags: [eastern-european, czech, side, vegetarian, intermediate]
- Kulajda — Czech sour-cream soup with mushrooms and dill. tags: [eastern-european, czech, lunch, vegetarian, intermediate]
- Smažený sýr — fried-cheese with tartare. tags: [eastern-european, czech, snack, vegetarian, beginner]
- Bramboráky — Czech potato pancakes. tags: [eastern-european, czech, breakfast, vegetarian, beginner]

---

## Indian — Anglo-Indian canon only

The British curry-house and Beeton-era Indian tradition. Modern regional
Indian (South Indian, modern Punjabi, modern Bengali, Goan beyond the
Vindaloo classic) is deferred to v2. Sources: Mrs Beeton (PG #10136),
the Hobson-Jobson glossary, and Anglo-Indian cookbooks of the Raj era;
plus the British-Bangladeshi curry-house canon that grew out of post-war
immigration to the UK.

The bulk of British curry-house dishes are listed under British → British
curry-house and Anglo-Asian comfort. This section adds older Anglo-Indian
recipes (kedgeree, mulligatawny, country captain, etc.) that don't fit
that section, and a few of the more refined curry-house preparations.

### Anglo-Indian classics

- Mulligatawny soup — Anglo-Indian curried lentil soup with chicken. tags: [indian-anglo, lunch, comfort-food, freezable, intermediate]
- Vegetarian mulligatawny — meat-free version. tags: [indian-anglo, lunch, vegetarian, freezable, beginner]
- Kedgeree — smoked haddock, rice, boiled egg. tags: [indian-anglo, breakfast, comfort-food, intermediate]
- Vegetarian kedgeree — egg-only version. tags: [indian-anglo, breakfast, vegetarian, beginner]
- Country captain — Anglo-Indian spiced chicken with raisins and almonds. tags: [indian-anglo, dinner, comfort-food, intermediate]
- Anglo-Indian fish curry — coriander, cumin, coconut milk. tags: [indian-anglo, dinner, weeknight, intermediate]
- Beef Madras — proper hot curry-house version. tags: [indian-anglo, dinner, freezable, intermediate]
- Vindaloo, Anglicised — chilli-vinegar pork curry. tags: [indian-anglo, dinner, intermediate]
- Vindaloo, chicken — milder bird version. tags: [indian-anglo, dinner, freezable, intermediate]
- Anglicised dhansak — sweet-sour curry-house lentil curry. tags: [indian-anglo, dinner, freezable, intermediate]
- Mughlai chicken — almond-and-cream Anglo Mughlai. tags: [indian-anglo, dinner, dinner-party, intermediate]
- Anglo-Indian rabbit curry — old colonial pot. tags: [indian-anglo, dinner, intermediate]
- Anglo-Indian devilled eggs — kedgeree-spiced. tags: [indian-anglo, snack, picnic, vegetarian, beginner]
- Devilled chicken livers — Anglo-Indian breakfast. tags: [indian-anglo, breakfast, intermediate]
- Anglo-Indian smoked-fish ball — Raj canteen classic. tags: [indian-anglo, breakfast, intermediate]
- Hot pickle (achaar) — Anglicised lime pickle. tags: [indian-anglo, side, vegetarian, vegan, intermediate]
- Tamarind chutney — see Preserves. tags: [indian-anglo, side, vegetarian, vegan, beginner]
- Coriander chutney — see Preserves. tags: [indian-anglo, side, vegetarian, vegan, beginner]
- Mango chutney — see Preserves. tags: [indian-anglo, side, vegetarian, vegan, beginner]
- Bombay duck — air-dried fish appetiser. tags: [indian-anglo, snack, intermediate]
- Anglo-Indian curry powder — Beeton-era spice blend. tags: [indian-anglo, side, vegetarian, vegan, beginner]
- Major Grey's chutney — Raj-era sweet mango chutney. tags: [indian-anglo, side, vegetarian, vegan, intermediate]
- Anglicised lassi — sweetened mango or salty mint. tags: [indian-anglo, drink, vegetarian, beginner]
- Bombay mix — spiced gram-flour and lentil snack. tags: [indian-anglo, snack, party, vegetarian, vegan, intermediate]
- Anglo-Indian raisin and almond pulao — sweetened rice. tags: [indian-anglo, side, vegetarian, intermediate]
- Anglo-Indian beef chop — onion-tomato-spiced minced cutlet. tags: [indian-anglo, dinner, weeknight, intermediate]
- Goan-British vindaloo — proper recipe with vinegar-toddy. tags: [indian-anglo, dinner, regional, intermediate]
- Anglo-Indian fish kedgeree pie — pastry-topped version. tags: [indian-anglo, dinner, regional, intermediate]
- Coronation chicken — see British. tags: [indian-anglo, lunch, picnic, beginner]
- Anglo-Indian rice and lentil pudding (kheer) — sweet rice. tags: [indian-anglo, dessert, vegetarian, beginner]

### Curry-house plate-build (cross-references to British → curry-house section)

- Chicken tikka masala — see British. tags: [indian-anglo, dinner, comfort-food, intermediate]
- Chicken korma — see British. tags: [indian-anglo, dinner, kid-friendly, beginner]
- Chicken jalfrezi — see British. tags: [indian-anglo, dinner, weeknight, beginner]
- Lamb rogan josh — see British. tags: [indian-anglo, dinner, freezable, intermediate]
- Pilau rice — see British. tags: [indian-anglo, side, vegetarian, vegan, beginner]
- Plain naan — see British. tags: [indian-anglo, side, vegetarian, beginner]
- Onion bhaji — see British. tags: [indian-anglo, snack, vegetarian, vegan, beginner]
- Samosa — see British. tags: [indian-anglo, snack, vegetarian, intermediate]
- Bombay potato — see British. tags: [indian-anglo, side, vegetarian, vegan, beginner]
- Tarka dhal — see British. tags: [indian-anglo, dinner, vegetarian, vegan, beginner]

---

## Baking

Breads, cakes, biscuits, scones, traybakes, pastries — across cuisines.
Mary Berry, Delia Smith, Nigel Slater, Dan Lepard, Claire Saffitz, James
Beard. Mrs Beeton (PG #10136) covers the historic British baseline.
The mother-method technique entries (foundation breads, foundation
pastries) stay in `docs/content-backlog.md`.

### Breads — yeasted and quick

- Basic white sandwich loaf — proper everyday tin loaf. tags: [baking, bread, vegetarian, vegan, beginner]
- Wholemeal sandwich loaf — 100% wholemeal. tags: [baking, bread, vegetarian, vegan, beginner]
- Granary-style malted loaf — UK supermarket favourite. tags: [baking, bread, vegetarian, beginner]
- Multigrain seeded loaf — sunflower, linseed, pumpkin. tags: [baking, bread, vegetarian, beginner]
- Cottage loaf — twin-tier white. tags: [baking, bread, vegetarian, intermediate]
- Bloomer — split-top oval white. tags: [baking, bread, vegetarian, beginner]
- Soft white rolls — burger or table. tags: [baking, bread, vegetarian, beginner]
- Brioche buns for burgers — eggy, soft, golden. tags: [baking, bread, vegetarian, intermediate]
- Milk-bread buns — tangzhong-soft. tags: [baking, bread, vegetarian, intermediate]
- Pretzel rolls — lye- or soda-dipped. tags: [baking, bread, vegetarian, intermediate]
- Hot dog buns — soft American-style. tags: [baking, bread, vegetarian, beginner]
- Dinner rolls — pull-apart tray. tags: [baking, bread, vegetarian, beginner]
- Knot rolls — twisted. tags: [baking, bread, vegetarian, beginner]
- Cloverleaf rolls — three-ball muffin-tin. tags: [baking, bread, vegetarian, beginner]
- Parker House rolls — buttery folded American. tags: [baking, bread, vegetarian, beginner]
- Six-strand challah — plaited egg loaf. tags: [baking, bread, vegetarian, intermediate]
- Round challah for Rosh Hashanah — sweet and raisined. tags: [baking, bread, vegetarian, intermediate]
- Bagels, New York-style — boiled-then-baked. tags: [baking, bread, vegetarian, intermediate]
- Bagels, Montreal-style — honey-water bath, wood oven. tags: [baking, bread, vegetarian, intermediate]
- Pretzels — lye-dipped Bavarian. tags: [baking, bread, vegetarian, advanced]
- Pretzels — baking-soda home version. tags: [baking, bread, vegetarian, beginner]
- English muffins — griddle-baked. tags: [baking, bread, vegetarian, intermediate]
- Crumpets — yeasted holey-top. tags: [baking, bread, vegetarian, intermediate]
- Pikelets — Yorkshire flat crumpets. tags: [baking, bread, vegetarian, beginner]
- Welsh oven-bottom muffins — griddle-cooked. tags: [baking, bread, vegetarian, beginner]
- Hokkaido milk bread — tangzhong square loaf. tags: [baking, bread, vegetarian, intermediate]
- Shokupan — Japanese square-tin milk bread. tags: [baking, bread, vegetarian, intermediate]
- Taiwanese pineapple bun — sweet-topped milk bread. tags: [baking, bread, vegetarian, intermediate]
- Brioche, classic Parisian — eggy and rich. tags: [baking, bread, vegetarian, intermediate]
- Brioche Nanterre — in a tin. tags: [baking, bread, vegetarian, intermediate]
- Brioche à tête — fluted-pan version. tags: [baking, bread, vegetarian, intermediate]
- Babka, chocolate — twisted Jewish loaf. tags: [baking, bread, vegetarian, intermediate]
- Babka, cinnamon. tags: [baking, bread, vegetarian, intermediate]
- Babka, savoury with cheese and herbs. tags: [baking, bread, vegetarian, intermediate]
- Krantz cake — Israeli twisted babka. tags: [baking, bread, vegetarian, intermediate]
- Stollen at Christmas — German fruit-and-marzipan loaf. tags: [baking, bread, festive, vegetarian, intermediate]
- Hot cross buns — proper Easter spiced. tags: [baking, bread, festive, vegetarian, beginner]
- Hot cross buns — chocolate variant. tags: [baking, bread, festive, vegetarian, beginner]
- Chelsea buns — currant-swirled sticky buns. tags: [baking, bread, vegetarian, intermediate]
- Cinnamon rolls — American mall-style. tags: [baking, bread, vegetarian, intermediate]
- Cinnamon rolls — Scandinavian kanelbullar. tags: [baking, bread, vegetarian, intermediate]
- Cardamom buns — Swedish kardemummabullar. tags: [baking, bread, vegetarian, intermediate]
- Iced finger buns — schoolyard treat. tags: [baking, bread, vegetarian, beginner]
- Bath buns — sweet-yeasted with crushed-sugar. tags: [baking, bread, vegetarian, intermediate]
- Cornish saffron buns — see British regional. tags: [baking, bread, vegetarian, intermediate]
- Swedish lussekatter — saffron-S-buns. tags: [baking, bread, festive, vegetarian, intermediate]
- Bara brith — see British regional. tags: [baking, bread, vegetarian, beginner]
- Lardy cake — yeasted West-Country sweet bread. tags: [baking, bread, vegetarian, intermediate]
- Pizza dough — see Italian pizza. tags: [baking, bread, vegetarian, vegan, intermediate]
- Focaccia, plain — see Italian pizza neighbours. tags: [baking, bread, vegetarian, vegan, intermediate]
- Focaccia, rosemary and sea salt. tags: [baking, bread, vegetarian, vegan, intermediate]
- Focaccia, tomato and olive — summer. tags: [baking, bread, summer, vegetarian, vegan, intermediate]
- Focaccia, onion and thyme. tags: [baking, bread, vegetarian, vegan, intermediate]
- Ciabatta — high-hydration with biga. tags: [baking, bread, vegetarian, vegan, intermediate]
- Pane di Altamura — Pugliese semolina loaf. tags: [baking, bread, vegetarian, vegan, advanced]
- Pane Pugliese — high-hydration country loaf. tags: [baking, bread, vegetarian, vegan, intermediate]
- Pane di casa — Italian country loaf. tags: [baking, bread, vegetarian, vegan, beginner]
- Schiacciata all'uva — focaccia with wine grapes. tags: [baking, bread, autumn, vegetarian, vegan, intermediate]
- Pain de campagne — French country loaf. tags: [baking, bread, vegetarian, vegan, intermediate]
- Miche — large French wholegrain country loaf. tags: [baking, bread, vegetarian, vegan, advanced]
- Tartine-style country loaf — modern San Francisco method. tags: [baking, bread, vegetarian, vegan, intermediate]
- Baguette, traditional — straight-folded crisp crust. tags: [baking, bread, vegetarian, vegan, advanced]
- Pain rustique — slack-dough rustic baguette. tags: [baking, bread, vegetarian, vegan, intermediate]
- Fougasse — Provençal leaf-shaped flatbread. tags: [baking, bread, vegetarian, vegan, intermediate]
- Pain au lait — soft milk-bread rolls. tags: [baking, bread, vegetarian, intermediate]
- Vollkornbrot — German wholegrain rye. tags: [baking, bread, vegetarian, vegan, advanced]
- Borodinsky — Russian dark rye. tags: [baking, bread, vegetarian, vegan, advanced]
- Pumpernickel — long-baked German rye. tags: [baking, bread, vegetarian, vegan, advanced]
- Roggenbrot — German rye sandwich loaf. tags: [baking, bread, vegetarian, intermediate]
- Brioche Saint-Genix — pink-praline brioche. tags: [baking, bread, vegetarian, intermediate]
- Sourdough country loaf — basic boule. tags: [baking, bread, vegetarian, vegan, intermediate]
- Sourdough sandwich loaf — tinned. tags: [baking, bread, vegetarian, vegan, intermediate]
- Sourdough ciabatta. tags: [baking, bread, vegetarian, vegan, intermediate]
- Sourdough focaccia. tags: [baking, bread, vegetarian, vegan, intermediate]
- Whole-wheat sourdough. tags: [baking, bread, vegetarian, vegan, intermediate]
- Rye sourdough — 100%. tags: [baking, bread, vegetarian, vegan, advanced]
- Spelt sourdough. tags: [baking, bread, vegetarian, vegan, intermediate]
- Einkorn sourdough — ancient-grain. tags: [baking, bread, vegetarian, vegan, advanced]
- Sourdough discard crackers. tags: [baking, bread, vegetarian, vegan, beginner]
- Sourdough discard pancakes — see Breakfasts. tags: [baking, bread, vegetarian, beginner]
- Sourdough discard crumpets. tags: [baking, bread, vegetarian, intermediate]
- Sourdough discard banana bread. tags: [baking, bread, vegetarian, beginner]
- Sourdough discard waffles. tags: [baking, bread, vegetarian, beginner]
- Beer bread — quick yeast-free loaf with beer. tags: [baking, bread, vegetarian, beginner]
- Soda bread, white. tags: [baking, bread, vegetarian, beginner]
- Soda bread, brown wholemeal. tags: [baking, bread, vegetarian, beginner]
- Soda farls — Northern Irish four-quarter. tags: [baking, bread, vegetarian, beginner]
- Treacle soda bread. tags: [baking, bread, vegetarian, beginner]
- Banana bread, classic. tags: [baking, bread, vegetarian, beginner]
- Banana bread with walnut. tags: [baking, bread, vegetarian, beginner]
- Banana bread, vegan. tags: [baking, bread, vegetarian, vegan, beginner]
- Courgette bread — summer-glut. tags: [baking, bread, vegetarian, beginner]
- Courgette and lemon loaf. tags: [baking, bread, vegetarian, beginner]
- Carrot cake loaf — see Cakes. tags: [baking, bread, vegetarian, beginner]
- Date and walnut loaf — proper Edwardian tea-loaf. tags: [baking, bread, vegetarian, beginner]
- Sticky lemon-poppyseed loaf. tags: [baking, bread, vegetarian, beginner]
- Pumpkin bread — American autumn classic. tags: [baking, bread, autumn, vegetarian, beginner]
- Beer-cheese quick bread. tags: [baking, bread, vegetarian, beginner]
- Cornbread — Southern. tags: [baking, bread, vegetarian, beginner]
- Sweet cornbread — Northern. tags: [baking, bread, vegetarian, beginner]
- Spoonbread. tags: [baking, bread, vegetarian, intermediate]
- Boston brown bread. tags: [baking, bread, vegetarian, intermediate]
- Damper — Australian bushman's bread. tags: [baking, bread, vegetarian, beginner]

### Cakes — Victoria sponges, sandwich cakes, and all-rounders

- Victoria sponge — proper jam-and-cream sandwich. tags: [baking, cake, vegetarian, beginner]
- Victoria sponge with buttercream — alternative finish. tags: [baking, cake, vegetarian, beginner]
- Lemon drizzle cake — classic loaf with sugar-lemon crust. tags: [baking, cake, vegetarian, beginner]
- Lemon and poppyseed cake. tags: [baking, cake, vegetarian, beginner]
- Lemon polenta cake — gluten-free Italian almond and polenta. tags: [baking, cake, vegetarian, gluten-free, beginner]
- Orange polenta cake. tags: [baking, cake, vegetarian, gluten-free, beginner]
- Almond cake, flourless. tags: [baking, cake, vegetarian, gluten-free, beginner]
- Olive-oil cake — classic Italian. tags: [baking, cake, vegetarian, beginner]
- Orange and almond cake — Sephardic-style. tags: [baking, cake, vegetarian, gluten-free, intermediate]
- Coffee and walnut cake — Mary Berry standard. tags: [baking, cake, vegetarian, beginner]
- Coffee cake, American — cinnamon-streusel-topped. tags: [baking, cake, vegetarian, beginner]
- Cinnamon-swirl coffee cake. tags: [baking, cake, vegetarian, beginner]
- Carrot cake — proper cream-cheese-frosted. tags: [baking, cake, vegetarian, beginner]
- Carrot and walnut cake. tags: [baking, cake, vegetarian, beginner]
- Vegan carrot cake — egg-free, dairy-free. tags: [baking, cake, vegetarian, vegan, beginner]
- Apple cake — German-style with cinnamon. tags: [baking, cake, autumn, vegetarian, beginner]
- Dorset apple cake — classic. tags: [baking, cake, regional, vegetarian, beginner]
- French apple cake — chunked-apple, eggy. tags: [baking, cake, vegetarian, beginner]
- Bramley apple cake — UK orchard variety. tags: [baking, cake, autumn, vegetarian, beginner]
- Sticky toffee pudding cake — slicing version. tags: [baking, cake, vegetarian, intermediate]
- Sticky ginger cake — Yorkshire parkin's cousin. tags: [baking, cake, vegetarian, beginner]
- Yorkshire parkin — sticky oat-and-treacle. tags: [baking, cake, regional, vegetarian, beginner]
- Ginger loaf with crystallised ginger. tags: [baking, cake, vegetarian, beginner]
- Gingerbread loaf, sticky. tags: [baking, cake, vegetarian, beginner]
- Battenberg cake — pink-and-yellow chequer with marzipan. tags: [baking, cake, vegetarian, intermediate]
- Madeira cake — proper plain butter-cake. tags: [baking, cake, vegetarian, beginner]
- Marble cake — chocolate-vanilla swirl. tags: [baking, cake, vegetarian, beginner]
- Marble loaf — loaf-tin version. tags: [baking, cake, vegetarian, beginner]
- Tea loaf — overnight-soaked dried fruit. tags: [baking, cake, vegetarian, beginner]
- Welsh bara brith — see British. tags: [baking, cake, regional, vegetarian, beginner]
- Boiled fruit cake — quick simmer-then-bake. tags: [baking, cake, vegetarian, beginner]
- Christmas cake — proper aged, fed with brandy. tags: [baking, cake, festive, vegetarian, intermediate]
- Christmas cake, last-minute — no-feed version. tags: [baking, cake, festive, vegetarian, beginner]
- Christmas cake, fruit-and-nut top. tags: [baking, cake, festive, vegetarian, intermediate]
- Simnel cake — Easter marzipan-topped fruit cake. tags: [baking, cake, festive, vegetarian, intermediate]
- Wedding fruit cake — three-tier base. tags: [baking, cake, festive, vegetarian, advanced]
- Dundee cake — see British regional. tags: [baking, cake, regional, vegetarian, intermediate]
- Genoa cake — light fruit cake with almond top. tags: [baking, cake, vegetarian, intermediate]
- Black Forest cake — chocolate, cherry, kirsch. tags: [baking, cake, festive, vegetarian, intermediate]
- Devil's food cake — deep cocoa American layer. tags: [baking, cake, vegetarian, intermediate]
- Chocolate fudge cake — buttery, dense. tags: [baking, cake, vegetarian, beginner]
- Chocolate Guinness cake — Nigella standard. tags: [baking, cake, vegetarian, beginner]
- Death by chocolate cake — extreme version. tags: [baking, cake, vegetarian, intermediate]
- Chocolate sponge — basic. tags: [baking, cake, vegetarian, beginner]
- Chocolate sandwich with buttercream. tags: [baking, cake, vegetarian, beginner]
- Triple-chocolate cake — milk, dark, white. tags: [baking, cake, vegetarian, intermediate]
- Chocolate orange cake — Terry's-style. tags: [baking, cake, vegetarian, beginner]
- Chocolate-and-beetroot cake — fudgy. tags: [baking, cake, vegetarian, beginner]
- Chocolate-and-courgette cake — sneaks-vegetables version. tags: [baking, cake, vegetarian, beginner]
- Chocolate-and-Guinness cake. tags: [baking, cake, vegetarian, beginner]
- Vegan chocolate cake — depression-era oil-water-cocoa. tags: [baking, cake, vegetarian, vegan, beginner]
- Gluten-free chocolate cake. tags: [baking, cake, vegetarian, gluten-free, intermediate]
- Red velvet cake — cream-cheese-frosted. tags: [baking, cake, vegetarian, intermediate]
- Cassata siciliana — sponge, ricotta, candied fruit. tags: [baking, cake, festive, vegetarian, advanced]
- Tres leches cake — Latin-American three-milk sponge. tags: [baking, cake, vegetarian, intermediate]
- Lamington — Australian coconut-chocolate sponge cubes. tags: [baking, cake, vegetarian, intermediate]
- Pavlova — large meringue with cream and fruit. tags: [baking, cake, vegetarian, gluten-free, intermediate]
- Berry pavlova — summer. tags: [baking, cake, summer, vegetarian, gluten-free, intermediate]
- Lemon-curd pavlova — winter. tags: [baking, cake, vegetarian, gluten-free, intermediate]
- Mini pavlovas — individual portions. tags: [baking, cake, vegetarian, gluten-free, intermediate]
- Eton mess — broken meringue, cream, strawberries. tags: [baking, dessert, summer, vegetarian, gluten-free, beginner]
- Knickerbocker glory — layered ice-cream sundae. tags: [baking, dessert, summer, vegetarian, beginner]
- Angel-food cake — egg-white-only American. tags: [baking, cake, vegetarian, intermediate]
- Chiffon cake — vegetable-oil, egg-yolk, foam. tags: [baking, cake, vegetarian, intermediate]
- Genoise — classic foam sponge. tags: [baking, cake, vegetarian, intermediate]
- Swiss roll — jam-and-cream rolled sponge. tags: [baking, cake, vegetarian, intermediate]
- Chocolate Swiss roll. tags: [baking, cake, vegetarian, intermediate]
- Bûche de Noël — Christmas chocolate yule-log Swiss roll. tags: [baking, cake, festive, vegetarian, advanced]
- Roulade, hazelnut. tags: [baking, cake, vegetarian, intermediate]
- Roulade, lemon meringue. tags: [baking, cake, vegetarian, intermediate]
- Madeleines — fluted French sponge cakes. tags: [baking, biscuit, vegetarian, intermediate]
- Financiers — almond brown-butter cakes. tags: [baking, biscuit, vegetarian, intermediate]
- Cupcakes, vanilla. tags: [baking, cake, kid-friendly, vegetarian, beginner]
- Cupcakes, chocolate. tags: [baking, cake, kid-friendly, vegetarian, beginner]
- Cupcakes, red velvet. tags: [baking, cake, kid-friendly, vegetarian, beginner]
- Cupcakes, lemon. tags: [baking, cake, kid-friendly, vegetarian, beginner]
- Fairy cakes — UK simpler version with glacé icing. tags: [baking, cake, kid-friendly, vegetarian, beginner]
- Butterfly cakes — wings-on-top fairy cake. tags: [baking, cake, kid-friendly, vegetarian, beginner]

### Cheesecakes

- Baked vanilla cheesecake — proper New York-style. tags: [baking, cake, vegetarian, intermediate]
- New York cheesecake with sour-cream top. tags: [baking, cake, vegetarian, intermediate]
- Lemon baked cheesecake. tags: [baking, cake, vegetarian, intermediate]
- Burnt Basque cheesecake — caramelised top, no crust. tags: [baking, cake, vegetarian, intermediate]
- No-bake vanilla cheesecake — biscuit-base, set in fridge. tags: [baking, cake, vegetarian, beginner]
- No-bake lemon cheesecake. tags: [baking, cake, vegetarian, beginner]
- No-bake chocolate cheesecake. tags: [baking, cake, vegetarian, beginner]
- No-bake strawberry cheesecake. tags: [baking, cake, summer, vegetarian, beginner]
- Banoffee cheesecake — banana-and-toffee. tags: [baking, cake, vegetarian, beginner]
- Mini cheesecakes. tags: [baking, cake, vegetarian, beginner]
- Sicilian ricotta cheesecake. tags: [baking, cake, vegetarian, intermediate]
- Polish sernik — proper Polish baked cheesecake. tags: [baking, cake, regional, vegetarian, intermediate]
- Vegan cheesecake — cashew-based. tags: [baking, cake, vegetarian, vegan, intermediate]

### Biscuits, cookies, and shortbreads

- Shortbread, all-butter rounds — the proper Scottish way. tags: [baking, biscuit, vegetarian, beginner]
- Shortbread fingers — gift-tin classic. tags: [baking, biscuit, vegetarian, beginner]
- Petticoat tails — wedge-cut shortbread. tags: [baking, biscuit, regional, vegetarian, beginner]
- Millionaire's shortbread — caramel and chocolate. tags: [baking, biscuit, vegetarian, beginner]
- Twix-style traybake — chocolate-caramel. tags: [baking, biscuit, vegetarian, beginner]
- Empire biscuits — jam-sandwiched iced biscuits. tags: [baking, biscuit, regional, vegetarian, intermediate]
- Custard creams — homemade. tags: [baking, biscuit, vegetarian, intermediate]
- Bourbon biscuits — chocolate-cream-sandwich. tags: [baking, biscuit, vegetarian, intermediate]
- Garibaldi biscuits — currant-filled. tags: [baking, biscuit, vegetarian, beginner]
- Digestives — proper wholemeal version. tags: [baking, biscuit, vegetarian, beginner]
- Chocolate digestives — milk-chocolate-coated. tags: [baking, biscuit, vegetarian, beginner]
- Hobnobs — oaty British biscuits. tags: [baking, biscuit, vegetarian, beginner]
- Ginger nuts — crunchy spiced. tags: [baking, biscuit, vegetarian, beginner]
- Cornish fairings — golden-syrup ginger biscuits. tags: [baking, biscuit, regional, vegetarian, beginner]
- Cornish biscuits — currant rounds. tags: [baking, biscuit, regional, vegetarian, beginner]
- Easter biscuits — currant-and-spice. tags: [baking, biscuit, festive, vegetarian, beginner]
- Anzac biscuits — Australian oat-and-syrup. tags: [baking, biscuit, vegetarian, beginner]
- Florentines — fruit-and-nut lace, half-dipped in chocolate. tags: [baking, biscuit, vegetarian, intermediate]
- Brandy snaps — rolled lace biscuits with cream. tags: [baking, biscuit, vegetarian, intermediate]
- Tuile, almond — thin curled almond wafer. tags: [baking, biscuit, vegetarian, intermediate]
- Lebkuchen — German Christmas spice biscuit. tags: [baking, biscuit, festive, vegetarian, intermediate]
- Pfeffernüsse — German pepper-spice biscuit. tags: [baking, biscuit, festive, vegetarian, intermediate]
- Gingerbread biscuits — proper cookie-cutter. tags: [baking, biscuit, festive, vegetarian, beginner]
- Gingerbread men — iced. tags: [baking, biscuit, kid-friendly, festive, vegetarian, beginner]
- Gingerbread house — large project bake. tags: [baking, biscuit, festive, vegetarian, advanced]
- Springerle — embossed German aniseed biscuit. tags: [baking, biscuit, festive, vegetarian, advanced]
- Speculaas — spiced Dutch biscuit. tags: [baking, biscuit, festive, vegetarian, intermediate]
- Stroopwafels — Dutch syrup waffles. tags: [baking, biscuit, vegetarian, intermediate]
- Biscotti, almond — twice-baked Italian. tags: [baking, biscuit, vegetarian, vegan, intermediate]
- Biscotti, chocolate-and-hazelnut. tags: [baking, biscuit, vegetarian, intermediate]
- Cantucci — Tuscan almond biscotti. tags: [baking, biscuit, regional, vegetarian, vegan, intermediate]
- Amaretti, soft. tags: [baking, biscuit, vegetarian, gluten-free, beginner]
- Amaretti, crisp. tags: [baking, biscuit, vegetarian, gluten-free, intermediate]
- Pizzelle — Italian wafer iron-baked. tags: [baking, biscuit, vegetarian, intermediate]
- Macarons — proper French double-meringue. tags: [baking, biscuit, vegetarian, gluten-free, advanced]
- Macaron, chocolate ganache. tags: [baking, biscuit, vegetarian, gluten-free, advanced]
- Macaron, raspberry. tags: [baking, biscuit, vegetarian, gluten-free, advanced]
- Macaron, pistachio. tags: [baking, biscuit, vegetarian, gluten-free, advanced]
- Sablé Breton — French butter-shortcake biscuit. tags: [baking, biscuit, vegetarian, intermediate]
- Palmiers — caramelised puff hearts. tags: [baking, biscuit, vegetarian, intermediate]
- Chocolate-chip cookies — proper American style. tags: [baking, biscuit, kid-friendly, vegetarian, beginner]
- NYC-style cookies — Levain-style giant. tags: [baking, biscuit, vegetarian, intermediate]
- Brown-butter chocolate-chip cookies. tags: [baking, biscuit, vegetarian, intermediate]
- Vegan chocolate-chip cookies. tags: [baking, biscuit, vegetarian, vegan, beginner]
- Gluten-free chocolate-chip cookies. tags: [baking, biscuit, vegetarian, gluten-free, beginner]
- Oatmeal raisin cookies. tags: [baking, biscuit, vegetarian, beginner]
- Peanut-butter cookies — fork-marked. tags: [baking, biscuit, kid-friendly, vegetarian, beginner]
- Snickerdoodles — cinnamon-sugar rolled. tags: [baking, biscuit, kid-friendly, vegetarian, beginner]
- Sugar cookies, rolled and iced. tags: [baking, biscuit, kid-friendly, vegetarian, beginner]
- Iced biscuits — cookie-cutter shapes. tags: [baking, biscuit, kid-friendly, vegetarian, beginner]
- Snowball cookies — Mexican wedding cookies. tags: [baking, biscuit, festive, vegetarian, beginner]
- Russian tea cakes — same family. tags: [baking, biscuit, festive, vegetarian, beginner]
- Kourabiedes — Greek almond Christmas biscuits. tags: [baking, biscuit, festive, vegetarian, intermediate]
- Melomakarona — Greek honey-walnut biscuits. tags: [baking, biscuit, festive, vegetarian, vegan, intermediate]
- Krumkake — Norwegian cone biscuit. tags: [baking, biscuit, festive, vegetarian, intermediate]
- Pepparkakor — Swedish ginger thins. tags: [baking, biscuit, festive, vegetarian, intermediate]
- Rosettes — Scandinavian deep-fried iron cookies. tags: [baking, biscuit, festive, vegetarian, advanced]

### Scones and drop bakes

- Plain scones — proper UK afternoon-tea. tags: [baking, scone, vegetarian, beginner]
- Fruit scones — sultana classic. tags: [baking, scone, vegetarian, beginner]
- Cheese scones — savoury cheddar. tags: [baking, scone, vegetarian, beginner]
- Cherry scones. tags: [baking, scone, vegetarian, beginner]
- Buttermilk scones — fluffy American style. tags: [baking, scone, vegetarian, beginner]
- Treacle scones — Scottish dark-sugar. tags: [baking, scone, regional, vegetarian, beginner]
- Sourdough scones. tags: [baking, scone, vegetarian, beginner]
- Vegan scones — coconut-oil-based. tags: [baking, scone, vegetarian, vegan, beginner]
- Welsh cakes — see British regional. tags: [baking, scone, regional, vegetarian, beginner]
- American biscuits — buttermilk flakers. tags: [baking, scone, vegetarian, beginner]
- Cathead biscuits — Southern large flake. tags: [baking, scone, regional, vegetarian, beginner]
- Cheddar-and-chive American biscuits. tags: [baking, scone, vegetarian, beginner]
- Drop scones (Scotch pancakes) — see Breakfasts. tags: [baking, scone, vegetarian, beginner]
- Singin' hinnies — see British regional. tags: [baking, scone, regional, vegetarian, beginner]
- Rock cakes — fat rascals. tags: [baking, scone, vegetarian, beginner]
- Fat rascals — Yorkshire cherry-and-fruit. tags: [baking, scone, regional, vegetarian, beginner]

### Traybakes and slices

- Brownies — fudgy, intense chocolate. tags: [baking, traybake, vegetarian, beginner]
- Brownies — cakey, lighter. tags: [baking, traybake, vegetarian, beginner]
- Triple-chocolate brownies. tags: [baking, traybake, vegetarian, beginner]
- Salted-caramel brownies. tags: [baking, traybake, vegetarian, intermediate]
- Vegan brownies — depression-era. tags: [baking, traybake, vegetarian, vegan, beginner]
- Gluten-free brownies. tags: [baking, traybake, vegetarian, gluten-free, beginner]
- Cream-cheese-swirled brownies. tags: [baking, traybake, vegetarian, intermediate]
- Peanut-butter brownies. tags: [baking, traybake, vegetarian, beginner]
- Blondies — vanilla-brown-sugar tray. tags: [baking, traybake, vegetarian, beginner]
- Cookie bars — chocolate-chip in slab form. tags: [baking, traybake, vegetarian, beginner]
- Flapjacks — golden-syrup oat slice. tags: [baking, traybake, vegetarian, beginner]
- Vegan flapjacks. tags: [baking, traybake, vegetarian, vegan, beginner]
- Caramel-and-chocolate flapjacks. tags: [baking, traybake, vegetarian, beginner]
- Cherry bakewell traybake. tags: [baking, traybake, vegetarian, intermediate]
- Lemon-and-blueberry traybake. tags: [baking, traybake, vegetarian, beginner]
- Coffee-and-walnut traybake — slicing version. tags: [baking, traybake, vegetarian, beginner]
- Sticky-toffee traybake. tags: [baking, traybake, vegetarian, intermediate]
- Tiffin — fridge-set chocolate biscuit. tags: [baking, traybake, vegetarian, beginner]
- Chocolate crackle — Rice-Krispie chocolate. tags: [baking, traybake, kid-friendly, vegetarian, beginner]
- Caramel shortbread — see Millionaire's. tags: [baking, traybake, vegetarian, beginner]
- Lemon bars — proper sharp custard slice. tags: [baking, traybake, vegetarian, intermediate]
- Coconut ice — no-bake set. tags: [baking, traybake, vegetarian, beginner]
- Rocky-road slice — chocolate, marshmallow, biscuit. tags: [baking, traybake, kid-friendly, vegetarian, beginner]
- Hello dolly bars — Magic-cookie-bar. tags: [baking, traybake, vegetarian, beginner]
- Dream bars — toffee-coconut bar. tags: [baking, traybake, vegetarian, intermediate]
- Pumpkin bars with cream-cheese frosting. tags: [baking, traybake, autumn, vegetarian, beginner]
- Date squares (matrimonial cake) — Canadian. tags: [baking, traybake, vegetarian, beginner]
- Mince pie tray slice — Christmas frangipane mince-pie tray. tags: [baking, traybake, festive, vegetarian, intermediate]

### Tarts and pies — sweet

- Bakewell tart — see British regional. tags: [baking, tart, vegetarian, beginner]
- Bakewell pudding — older custard version. tags: [baking, tart, regional, vegetarian, intermediate]
- Treacle tart — golden-syrup-and-breadcrumb. tags: [baking, tart, vegetarian, beginner]
- Treacle tart with lattice top. tags: [baking, tart, vegetarian, intermediate]
- Manchester tart — pastry, jam, custard, banana, coconut. tags: [baking, tart, regional, vegetarian, intermediate]
- Lemon-meringue pie — sharp curd and toasted meringue. tags: [baking, tart, vegetarian, intermediate]
- Banoffee pie — biscuit base, dulce de leche, banana, cream. tags: [baking, tart, vegetarian, beginner]
- Key lime pie — Florida classic. tags: [baking, tart, vegetarian, beginner]
- Lemon tart — tarte au citron, sharp and set. tags: [baking, tart, vegetarian, intermediate]
- Tarte Tatin — caramelised upside-down apple. tags: [baking, tart, vegetarian, intermediate]
- Tarte aux pommes — open-face French apple. tags: [baking, tart, vegetarian, intermediate]
- Apple pie, double-crust American. tags: [baking, tart, vegetarian, intermediate]
- Apple pie, Dutch with streusel top. tags: [baking, tart, vegetarian, beginner]
- Apple crumble pie. tags: [baking, tart, vegetarian, beginner]
- Apple and blackberry pie — autumn. tags: [baking, tart, autumn, vegetarian, beginner]
- Apple-and-pear pie. tags: [baking, tart, autumn, vegetarian, beginner]
- Apple turnovers — puff-pastry hand pies. tags: [baking, tart, kid-friendly, vegetarian, beginner]
- Hand pies, blueberry. tags: [baking, tart, vegetarian, beginner]
- Hand pies, peach. tags: [baking, tart, vegetarian, beginner]
- Hand pies, sour cherry. tags: [baking, tart, vegetarian, intermediate]
- Cherry pie — proper double-crust. tags: [baking, tart, vegetarian, intermediate]
- Blueberry pie. tags: [baking, tart, vegetarian, intermediate]
- Strawberry-rhubarb pie. tags: [baking, tart, summer, vegetarian, intermediate]
- Mixed-berry pie. tags: [baking, tart, summer, vegetarian, intermediate]
- Peach pie. tags: [baking, tart, summer, vegetarian, intermediate]
- Mince pies — proper traditional. tags: [baking, tart, festive, vegetarian, beginner]
- Mince pies with frangipane top. tags: [baking, tart, festive, vegetarian, intermediate]
- Mincemeat — see Preserves. tags: [baking, tart, festive, vegetarian, beginner]
- Pumpkin pie — proper American Thanksgiving. tags: [baking, tart, festive, vegetarian, intermediate]
- Sweet-potato pie — Southern. tags: [baking, tart, regional, vegetarian, intermediate]
- Pecan pie — proper sticky-filled. tags: [baking, tart, festive, vegetarian, intermediate]
- Bourbon pecan pie. tags: [baking, tart, festive, vegetarian, intermediate]
- Chess pie — Southern sugar pie. tags: [baking, tart, regional, vegetarian, intermediate]
- Buttermilk pie. tags: [baking, tart, regional, vegetarian, intermediate]
- Sugar cream pie — Indiana classic. tags: [baking, tart, regional, vegetarian, intermediate]
- Shoofly pie — Pennsylvania-Dutch molasses. tags: [baking, tart, regional, vegetarian, intermediate]
- Chocolate cream pie. tags: [baking, tart, vegetarian, beginner]
- Mississippi mud pie. tags: [baking, tart, vegetarian, intermediate]
- French silk pie — silky chocolate cream. tags: [baking, tart, vegetarian, intermediate]
- Custard tart — proper Portuguese-style. tags: [baking, tart, vegetarian, intermediate]
- Portuguese custard tarts (pastéis de nata). tags: [baking, tart, vegetarian, intermediate]
- Egg custard tart — Mrs Beeton's. tags: [baking, tart, vegetarian, intermediate]
- Bakewell-style raspberry frangipane tart. tags: [baking, tart, vegetarian, intermediate]
- Frangipane and pear tart. tags: [baking, tart, vegetarian, intermediate]
- Frangipane and plum tart. tags: [baking, tart, autumn, vegetarian, intermediate]
- Tarte aux fraises — French strawberry tart with crème pâtissière. tags: [baking, tart, summer, vegetarian, intermediate]
- Tarte aux poires Bourdaloue — pear-and-frangipane French. tags: [baking, tart, vegetarian, intermediate]
- Tarte aux framboises — raspberry crème pâtissière. tags: [baking, tart, summer, vegetarian, intermediate]
- Tarte au chocolat — set chocolate ganache. tags: [baking, tart, vegetarian, intermediate]
- Galette des Rois — frangipane Twelfth-Night cake. tags: [baking, tart, festive, vegetarian, intermediate]
- Free-form galettes — French rustic. tags: [baking, tart, vegetarian, beginner]
- Cherry clafoutis — see Desserts. tags: [baking, tart, vegetarian, beginner]
- Crostata di marmellata — Italian jam tart. tags: [baking, tart, vegetarian, beginner]
- Crostata di ricotta — Italian ricotta tart. tags: [baking, tart, vegetarian, intermediate]
- Pastiera napoletana — Neapolitan Easter wheat-ricotta tart. tags: [baking, tart, festive, vegetarian, advanced]
- Crostata di pere e cioccolato — pear-and-chocolate Italian tart. tags: [baking, tart, vegetarian, intermediate]
- Crostata di nutella — Italian chocolate-spread tart. tags: [baking, tart, vegetarian, beginner]

### Pastries — choux, puff, croissant, danish

- Choux pastry base — éclair / profiterole base. tags: [baking, pastry, vegetarian, intermediate]
- Éclairs, chocolate — proper crème-pâtissière-filled. tags: [baking, pastry, vegetarian, intermediate]
- Éclairs, coffee. tags: [baking, pastry, vegetarian, intermediate]
- Profiteroles — choux puffs in chocolate sauce. tags: [baking, pastry, vegetarian, intermediate]
- Croquembouche — choux-puff tower. tags: [baking, pastry, festive, vegetarian, advanced]
- Paris-Brest — choux ring with praline cream. tags: [baking, pastry, vegetarian, advanced]
- Salambo — kirsch-cream choux. tags: [baking, pastry, vegetarian, advanced]
- Religieuses — stacked éclair "nuns". tags: [baking, pastry, vegetarian, advanced]
- Gougères — savoury cheese choux. tags: [baking, pastry, snack, vegetarian, beginner]
- Cream puffs — basic. tags: [baking, pastry, vegetarian, beginner]
- Croissants — proper laminated. tags: [baking, pastry, vegetarian, advanced]
- Pain au chocolat — chocolate-filled laminated. tags: [baking, pastry, vegetarian, advanced]
- Pain aux raisins — laminated with custard and raisin. tags: [baking, pastry, vegetarian, advanced]
- Almond croissants — leftover croissants soaked and re-filled. tags: [baking, pastry, vegetarian, intermediate]
- Kouign-amann — Breton butter-laminated cake. tags: [baking, pastry, regional, vegetarian, advanced]
- Cinnamon morning buns — laminated cinnamon swirl. tags: [baking, pastry, vegetarian, advanced]
- Danish pastry, plain. tags: [baking, pastry, vegetarian, advanced]
- Danish pastry, raspberry. tags: [baking, pastry, vegetarian, advanced]
- Danish pastry, apricot custard. tags: [baking, pastry, vegetarian, advanced]
- Apple turnover (chausson aux pommes). tags: [baking, pastry, vegetarian, intermediate]
- Pithivier — almond-paste-stuffed puff pastry. tags: [baking, pastry, festive, vegetarian, intermediate]
- Mille-feuille — puff-pastry napoleon. tags: [baking, pastry, vegetarian, advanced]
- Vanilla slice — UK custard slice. tags: [baking, pastry, vegetarian, intermediate]
- Eccles cake — see British regional. tags: [baking, pastry, regional, vegetarian, beginner]
- Banbury cake. tags: [baking, pastry, regional, vegetarian, beginner]
- Sausage rolls — see British. tags: [baking, pastry, snack, beginner]
- Vol-au-vents, classic — puff cups. tags: [baking, pastry, vegetarian, intermediate]
- Pithivier savoury — sausage / mushroom centre. tags: [baking, pastry, intermediate]
- Strudel, apple — proper paper-thin. tags: [baking, pastry, regional, vegetarian, advanced]
- Strudel, cherry. tags: [baking, pastry, regional, vegetarian, advanced]
- Strudel, savoury cabbage. tags: [baking, pastry, regional, vegetarian, advanced]
- Baklava, walnut. tags: [baking, pastry, vegetarian, intermediate]
- Baklava, pistachio. tags: [baking, pastry, vegetarian, intermediate]
- Baklava, almond. tags: [baking, pastry, vegetarian, intermediate]
- Bird's nest baklava (kataifi). tags: [baking, pastry, vegetarian, intermediate]
- Kunafa with cheese — Levantine cheese pastry. tags: [baking, pastry, vegetarian, intermediate]
- Knafeh nabulsiyeh — Palestinian kunafa. tags: [baking, pastry, regional, vegetarian, intermediate]
- Ma'amoul — date / pistachio Levantine biscuits. tags: [baking, pastry, festive, vegetarian, intermediate]
- Ma'amoul mad — slab Levantine version. tags: [baking, pastry, festive, vegetarian, intermediate]
- M'hencha — Moroccan coiled almond pastry. tags: [baking, pastry, regional, vegetarian, intermediate]
- Brik à l'oeuf — see Tunisian. tags: [baking, pastry, snack, vegetarian, intermediate]
- Filo triangles, sweet — almond and orange-blossom. tags: [baking, pastry, vegetarian, intermediate]

### Doughnuts and fried sweet bakes

- Classic ring doughnuts. tags: [baking, doughnut, kid-friendly, vegetarian, intermediate]
- Doughnut holes (timbits). tags: [baking, doughnut, kid-friendly, vegetarian, intermediate]
- Filled doughnuts, jam. tags: [baking, doughnut, kid-friendly, vegetarian, intermediate]
- Filled doughnuts, custard. tags: [baking, doughnut, kid-friendly, vegetarian, intermediate]
- Bombolone — Italian-style jam-filled doughnut. tags: [baking, doughnut, vegetarian, intermediate]
- Beignets — New Orleans square doughnuts. tags: [baking, doughnut, regional, vegetarian, intermediate]
- Sfenj — see Moroccan. tags: [baking, doughnut, regional, vegetarian, intermediate]
- Loukoumades — Greek honey-glazed doughnuts. tags: [baking, doughnut, regional, vegetarian, intermediate]
- Zeppole — Italian doughnut. tags: [baking, doughnut, regional, vegetarian, intermediate]
- Sufganiyot — Hanukkah jam-filled doughnut. tags: [baking, doughnut, festive, vegetarian, intermediate]
- Berliner — German jam-filled doughnut. tags: [baking, doughnut, regional, vegetarian, intermediate]
- Pączki — Polish doughnut. tags: [baking, doughnut, regional, vegetarian, intermediate]
- Churros with chocolate sauce. tags: [baking, doughnut, regional, vegetarian, intermediate]
- Funnel cake — American carnival treat. tags: [baking, doughnut, kid-friendly, vegetarian, intermediate]
- Fried dough / elephant ears. tags: [baking, doughnut, kid-friendly, vegetarian, intermediate]
- Apple fritters — battered chunks or rings. tags: [baking, doughnut, autumn, vegetarian, intermediate]
- Banana fritters. tags: [baking, doughnut, kid-friendly, vegetarian, intermediate]
- Pineapple fritters — UK chip-shop classic. tags: [baking, doughnut, retro, vegetarian, intermediate]

---

## Preserves

Jams, jellies, marmalades, chutneys, pickles, ferments, curds, cordials,
syrups. The technique foundations (water-bath canning, pH and food
safety, sugar ratios, pectin) stay in `docs/content-backlog.md`. The
recipes live here.

Sources: Pam Corbin's `Preserves`, the NCHFP at the University of
Georgia (PD), USDA preservation guides (PD), Mrs Beeton (PG #10136),
Diana Henry's `Salt Sugar Smoke`.

### Jams and conserves

- Strawberry jam — classic British set. tags: [preserves, jam, summer, vegetarian, vegan, beginner]
- Strawberry and rhubarb jam. tags: [preserves, jam, summer, vegetarian, vegan, beginner]
- Strawberry and balsamic jam. tags: [preserves, jam, summer, vegetarian, vegan, intermediate]
- Raspberry jam, seedless. tags: [preserves, jam, summer, vegetarian, vegan, beginner]
- Raspberry jam, classic. tags: [preserves, jam, summer, vegetarian, vegan, beginner]
- Raspberry and redcurrant jam. tags: [preserves, jam, summer, vegetarian, vegan, beginner]
- Blackberry jam — wild-picked autumn. tags: [preserves, jam, autumn, vegetarian, vegan, beginner]
- Blackberry and apple jam. tags: [preserves, jam, autumn, vegetarian, vegan, beginner]
- Bramble and elderberry jam. tags: [preserves, jam, autumn, vegetarian, vegan, intermediate]
- Blueberry jam. tags: [preserves, jam, summer, vegetarian, vegan, beginner]
- Loganberry jam — Victorian summer. tags: [preserves, jam, summer, vegetarian, vegan, beginner]
- Tayberry jam — Scottish hybrid. tags: [preserves, jam, summer, vegetarian, vegan, beginner]
- Gooseberry jam. tags: [preserves, jam, summer, vegetarian, vegan, intermediate]
- Gooseberry and elderflower jam. tags: [preserves, jam, summer, vegetarian, vegan, intermediate]
- Plum jam — Victoria-plum classic. tags: [preserves, jam, autumn, vegetarian, vegan, beginner]
- Damson jam — wild damson tang. tags: [preserves, jam, autumn, vegetarian, vegan, intermediate]
- Greengage jam. tags: [preserves, jam, summer, vegetarian, vegan, beginner]
- Mirabelle plum jam. tags: [preserves, jam, summer, vegetarian, vegan, beginner]
- Apricot jam. tags: [preserves, jam, summer, vegetarian, vegan, beginner]
- Apricot and almond jam. tags: [preserves, jam, summer, vegetarian, vegan, beginner]
- Peach jam. tags: [preserves, jam, summer, vegetarian, vegan, beginner]
- Peach and vanilla jam. tags: [preserves, jam, summer, vegetarian, vegan, beginner]
- Cherry jam, dark Morello. tags: [preserves, jam, summer, vegetarian, vegan, intermediate]
- Cherry and kirsch conserve. tags: [preserves, jam, summer, vegetarian, vegan, intermediate]
- Rhubarb and ginger jam. tags: [preserves, jam, spring, vegetarian, vegan, beginner]
- Rhubarb and rose-petal jam. tags: [preserves, jam, spring, vegetarian, vegan, intermediate]
- Rhubarb and orange jam. tags: [preserves, jam, spring, vegetarian, vegan, beginner]
- Fig jam — fresh-fig conserve. tags: [preserves, jam, autumn, vegetarian, vegan, beginner]
- Fig and walnut conserve. tags: [preserves, jam, autumn, vegetarian, vegan, intermediate]
- Apple butter — slow-cooked dark spread. tags: [preserves, jam, autumn, vegetarian, vegan, intermediate]
- Apple and cider butter. tags: [preserves, jam, autumn, vegetarian, vegan, intermediate]
- Pear butter. tags: [preserves, jam, autumn, vegetarian, vegan, intermediate]
- Pumpkin butter. tags: [preserves, jam, autumn, vegetarian, vegan, intermediate]
- Quince paste (membrillo). tags: [preserves, jam, autumn, vegetarian, vegan, intermediate]
- Quince jam. tags: [preserves, jam, autumn, vegetarian, vegan, intermediate]
- Medlar jelly. tags: [preserves, jam, autumn, vegetarian, vegan, intermediate]
- Rosehip jelly. tags: [preserves, jam, autumn, vegetarian, vegan, intermediate]
- Rowan jelly. tags: [preserves, jam, autumn, vegetarian, vegan, intermediate]
- Crab-apple jelly. tags: [preserves, jam, autumn, vegetarian, vegan, intermediate]
- Mint jelly — for lamb. tags: [preserves, jam, vegetarian, vegan, intermediate]
- Redcurrant jelly — for game. tags: [preserves, jam, summer, vegetarian, vegan, intermediate]
- Bramble jelly. tags: [preserves, jam, autumn, vegetarian, vegan, intermediate]
- Hot pepper jelly — for cheese. tags: [preserves, jam, vegetarian, vegan, intermediate]
- Tomato jam. tags: [preserves, jam, summer, vegetarian, vegan, intermediate]

### Marmalades

- Seville orange marmalade — proper January Dundee-cut. tags: [preserves, marmalade, winter, vegetarian, vegan, intermediate]
- Three-fruit marmalade — orange, lemon, grapefruit. tags: [preserves, marmalade, winter, vegetarian, vegan, intermediate]
- Grapefruit marmalade. tags: [preserves, marmalade, winter, vegetarian, vegan, intermediate]
- Lemon marmalade. tags: [preserves, marmalade, winter, vegetarian, vegan, intermediate]
- Lime marmalade — sharp and dark. tags: [preserves, marmalade, vegetarian, vegan, intermediate]
- Whisky marmalade. tags: [preserves, marmalade, winter, vegetarian, vegan, intermediate]
- Ginger marmalade. tags: [preserves, marmalade, winter, vegetarian, vegan, intermediate]
- Dark-chunk Oxford marmalade. tags: [preserves, marmalade, winter, vegetarian, vegan, intermediate]
- Fine-shred Cooper's-style marmalade. tags: [preserves, marmalade, winter, vegetarian, vegan, intermediate]
- Blood-orange marmalade. tags: [preserves, marmalade, winter, vegetarian, vegan, intermediate]
- Tangerine marmalade. tags: [preserves, marmalade, winter, vegetarian, vegan, intermediate]

### Curds

- Lemon curd. tags: [preserves, curd, vegetarian, beginner]
- Lime curd. tags: [preserves, curd, vegetarian, beginner]
- Orange curd. tags: [preserves, curd, winter, vegetarian, beginner]
- Passion-fruit curd. tags: [preserves, curd, vegetarian, beginner]
- Blood-orange curd. tags: [preserves, curd, winter, vegetarian, beginner]
- Raspberry curd. tags: [preserves, curd, summer, vegetarian, beginner]
- Strawberry curd. tags: [preserves, curd, summer, vegetarian, beginner]
- Rhubarb curd. tags: [preserves, curd, spring, vegetarian, beginner]
- Apple curd — old-fashioned. tags: [preserves, curd, autumn, vegetarian, beginner]
- Blackberry curd. tags: [preserves, curd, autumn, vegetarian, beginner]

### Chutneys

- Mango chutney — proper Anglo-Indian. tags: [preserves, chutney, vegetarian, vegan, intermediate]
- Major Grey's mango chutney. tags: [preserves, chutney, vegetarian, vegan, intermediate]
- Apple chutney. tags: [preserves, chutney, autumn, vegetarian, vegan, beginner]
- Spiced apple and date chutney. tags: [preserves, chutney, autumn, vegetarian, vegan, beginner]
- Tomato chutney. tags: [preserves, chutney, summer, vegetarian, vegan, beginner]
- Green-tomato chutney — end-of-summer. tags: [preserves, chutney, autumn, vegetarian, vegan, beginner]
- Red-onion chutney. tags: [preserves, chutney, vegetarian, vegan, beginner]
- Caramelised onion chutney. tags: [preserves, chutney, vegetarian, vegan, beginner]
- Beetroot chutney. tags: [preserves, chutney, autumn, vegetarian, vegan, beginner]
- Pear and ginger chutney. tags: [preserves, chutney, autumn, vegetarian, vegan, beginner]
- Plum chutney. tags: [preserves, chutney, autumn, vegetarian, vegan, beginner]
- Mixed-fruit chutney — autumn glut. tags: [preserves, chutney, autumn, vegetarian, vegan, beginner]
- Hot mango chutney with mustard seeds. tags: [preserves, chutney, vegetarian, vegan, intermediate]
- Cranberry-and-orange chutney. tags: [preserves, chutney, festive, vegetarian, vegan, beginner]
- Pumpkin chutney. tags: [preserves, chutney, autumn, vegetarian, vegan, beginner]
- Spiced pear and walnut chutney. tags: [preserves, chutney, autumn, vegetarian, vegan, beginner]
- Brinjal pickle — Anglo-Indian. tags: [preserves, chutney, vegetarian, vegan, intermediate]
- Lime pickle — Indian-style chilli oil. tags: [preserves, chutney, vegetarian, vegan, intermediate]
- Coriander chutney — fresh, North-Indian. tags: [preserves, chutney, vegetarian, vegan, beginner]
- Mint chutney. tags: [preserves, chutney, vegetarian, vegan, beginner]
- Tamarind chutney. tags: [preserves, chutney, vegetarian, vegan, beginner]
- Branston-style chutney — sweet pickle. tags: [preserves, chutney, vegetarian, vegan, intermediate]
- Piccalilli — proper British mustard pickle. tags: [preserves, chutney, vegetarian, vegan, intermediate]

### Pickles and ferments

- Pickled onions — Branston-style brown vinegar. tags: [preserves, pickle, vegetarian, vegan, beginner]
- Pickled shallots. tags: [preserves, pickle, vegetarian, vegan, beginner]
- Bread-and-butter pickles — American sweet cucumber. tags: [preserves, pickle, vegetarian, vegan, beginner]
- Dill pickles — fermented full-sour. tags: [preserves, pickle, vegetarian, vegan, intermediate]
- Dill pickles, fridge — quick. tags: [preserves, pickle, vegetarian, vegan, beginner]
- Pickled beetroot. tags: [preserves, pickle, autumn, vegetarian, vegan, beginner]
- Pickled red cabbage. tags: [preserves, pickle, autumn, vegetarian, vegan, beginner]
- Pickled cauliflower. tags: [preserves, pickle, vegetarian, vegan, beginner]
- Pickled gherkins. tags: [preserves, pickle, vegetarian, vegan, beginner]
- Pickled walnuts — green-walnut classic. tags: [preserves, pickle, vegetarian, vegan, advanced]
- Pickled eggs. tags: [preserves, pickle, vegetarian, beginner]
- Pickled chillies. tags: [preserves, pickle, vegetarian, vegan, beginner]
- Pickled jalapeños — taqueria-style. tags: [preserves, pickle, vegetarian, vegan, beginner]
- Pickled lemons — preserved lemons. tags: [preserves, pickle, vegetarian, vegan, intermediate]
- Preserved lemons with chilli and bay. tags: [preserves, pickle, vegetarian, vegan, intermediate]
- Pickled ginger (gari-style). tags: [preserves, pickle, vegetarian, vegan, beginner]
- Sauerkraut, plain. tags: [preserves, ferment, vegetarian, vegan, intermediate]
- Sauerkraut with caraway. tags: [preserves, ferment, vegetarian, vegan, intermediate]
- Curtido — Salvadoran cabbage-and-carrot kraut. tags: [preserves, ferment, vegetarian, vegan, intermediate]
- Kimchi, napa cabbage. tags: [preserves, ferment, vegetarian, intermediate]
- Kimchi, cucumber (oi sobagi). tags: [preserves, ferment, vegetarian, intermediate]
- Kimchi, radish (kkakdugi). tags: [preserves, ferment, vegetarian, intermediate]
- Vegan kimchi — fish-sauce-free. tags: [preserves, ferment, vegetarian, vegan, intermediate]
- Miso, white — short-aged. tags: [preserves, ferment, vegetarian, vegan, advanced]
- Miso, red — long-aged. tags: [preserves, ferment, vegetarian, vegan, advanced]
- Tepache — Mexican pineapple ferment. tags: [preserves, ferment, vegetarian, vegan, beginner]
- Kvass — Russian rye ferment. tags: [preserves, ferment, vegetarian, vegan, intermediate]
- Honey-fermented garlic. tags: [preserves, ferment, vegetarian, intermediate]
- Lacto-fermented carrots. tags: [preserves, ferment, vegetarian, vegan, beginner]
- Lacto-fermented green beans. tags: [preserves, ferment, vegetarian, vegan, beginner]
- Lacto-fermented hot sauce. tags: [preserves, ferment, vegetarian, vegan, intermediate]
- Garlic-dill cucumbers, fermented. tags: [preserves, ferment, vegetarian, vegan, intermediate]
- Kombucha, plain. tags: [preserves, ferment, vegetarian, vegan, intermediate]
- Kombucha, ginger-and-lemon second-ferment. tags: [preserves, ferment, vegetarian, vegan, intermediate]
- Water kefir. tags: [preserves, ferment, vegetarian, vegan, intermediate]
- Milk kefir. tags: [preserves, ferment, vegetarian, intermediate]

### Cordials, syrups, vinegars

- Elderflower cordial. tags: [preserves, cordial, summer, vegetarian, vegan, beginner]
- Elderflower champagne — wild-yeast. tags: [preserves, cordial, summer, vegetarian, vegan, intermediate]
- Lemon cordial. tags: [preserves, cordial, summer, vegetarian, vegan, beginner]
- Lime cordial — Rose's-style. tags: [preserves, cordial, vegetarian, vegan, beginner]
- Blackcurrant cordial. tags: [preserves, cordial, summer, vegetarian, vegan, beginner]
- Strawberry cordial. tags: [preserves, cordial, summer, vegetarian, vegan, beginner]
- Rhubarb cordial. tags: [preserves, cordial, spring, vegetarian, vegan, beginner]
- Rhubarb and rose cordial. tags: [preserves, cordial, spring, vegetarian, vegan, beginner]
- Raspberry cordial. tags: [preserves, cordial, summer, vegetarian, vegan, beginner]
- Mint and lime cordial. tags: [preserves, cordial, summer, vegetarian, vegan, beginner]
- Ginger and lime cordial. tags: [preserves, cordial, vegetarian, vegan, beginner]
- Rosehip syrup — high vitamin C autumn. tags: [preserves, cordial, autumn, vegetarian, vegan, intermediate]
- Hawthorn-berry syrup. tags: [preserves, cordial, autumn, vegetarian, vegan, intermediate]
- Sloe gin. tags: [preserves, cordial, autumn, vegetarian, intermediate]
- Damson gin. tags: [preserves, cordial, autumn, vegetarian, intermediate]
- Blackberry whisky. tags: [preserves, cordial, autumn, vegetarian, intermediate]
- Limoncello. tags: [preserves, cordial, vegetarian, intermediate]
- Vin d'orange — Provençal aperitif. tags: [preserves, cordial, vegetarian, intermediate]
- Raspberry vinegar. tags: [preserves, vinegar, summer, vegetarian, vegan, beginner]
- Strawberry vinegar. tags: [preserves, vinegar, summer, vegetarian, vegan, beginner]
- Tarragon vinegar. tags: [preserves, vinegar, vegetarian, vegan, beginner]
- Chilli vinegar. tags: [preserves, vinegar, vegetarian, vegan, beginner]
- Apple-scrap vinegar — kitchen-scrap. tags: [preserves, vinegar, vegetarian, vegan, intermediate]
- Shrub, raspberry-balsamic. tags: [preserves, drink-base, summer, vegetarian, vegan, intermediate]
- Shrub, blackberry. tags: [preserves, drink-base, autumn, vegetarian, vegan, intermediate]
- Shrub, pineapple-jalapeño. tags: [preserves, drink-base, vegetarian, vegan, intermediate]

### Larder essentials

- Mincemeat — traditional for Christmas. tags: [preserves, festive, vegetarian, intermediate]
- Vegan mincemeat. tags: [preserves, festive, vegetarian, vegan, intermediate]
- Tomato passata — bottled summer-glut. tags: [preserves, larder, summer, vegetarian, vegan, intermediate]
- Slow-roast tomato paste. tags: [preserves, larder, summer, vegetarian, vegan, intermediate]
- Sun-dried tomatoes in oil. tags: [preserves, larder, summer, vegetarian, vegan, intermediate]
- Roasted-pepper preserve in oil. tags: [preserves, larder, vegetarian, vegan, beginner]
- Chimichurri — Argentine herb sauce. tags: [preserves, larder, vegetarian, vegan, beginner]
- Pesto, classic Genovese — preserve in oil. tags: [preserves, larder, summer, vegetarian, intermediate]
- Wild-garlic pesto. tags: [preserves, larder, spring, vegetarian, intermediate]
- Salsa verde Italian — preserved in oil. tags: [preserves, larder, vegetarian, beginner]
- Ras el hanout — see North African. tags: [preserves, larder, vegetarian, vegan, beginner]
- Garam masala — Anglo-Indian. tags: [preserves, larder, vegetarian, vegan, beginner]
- Za'atar mix. tags: [preserves, larder, vegetarian, vegan, beginner]
- Dukkah — Egyptian nut-seed mix. tags: [preserves, larder, vegetarian, vegan, beginner]
- Confit garlic. tags: [preserves, larder, vegetarian, vegan, beginner]
- Confit chicken. tags: [preserves, larder, intermediate]
- Confit duck — see French. tags: [preserves, larder, intermediate]

---

## Desserts (beyond baking)

Puddings, custards, ice creams, parfaits, trifles, sorbets — set-pieces
and cold sweets. Baked sweets live in Baking; this section is everything
else.

### Hot puddings — British

- Sticky toffee pudding — proper Cartmel-style. tags: [dessert, pudding, comfort-food, vegetarian, intermediate]
- Treacle sponge pudding — steamed. tags: [dessert, pudding, comfort-food, vegetarian, intermediate]
- Spotted dick — suet-and-currant steamed. tags: [dessert, pudding, comfort-food, vegetarian, intermediate]
- Jam roly-poly — suet-pastry-rolled, steamed. tags: [dessert, pudding, comfort-food, vegetarian, intermediate]
- Marmalade pudding. tags: [dessert, pudding, comfort-food, vegetarian, intermediate]
- Spotted dog. tags: [dessert, pudding, comfort-food, vegetarian, intermediate]
- Steamed lemon pudding. tags: [dessert, pudding, vegetarian, intermediate]
- Christmas pudding — proper aged, brandied. tags: [dessert, pudding, festive, vegetarian, advanced]
- Last-minute Christmas pudding — no-feed shortcut. tags: [dessert, pudding, festive, vegetarian, intermediate]
- Sussex pond pudding — whole-lemon-in-suet. tags: [dessert, pudding, regional, vegetarian, advanced]
- Clootie dumpling — Scottish boiled fruit. tags: [dessert, pudding, regional, vegetarian, intermediate]
- Bread-and-butter pudding — proper Mrs Beeton. tags: [dessert, pudding, comfort-food, vegetarian, beginner]
- Brioche bread-and-butter pudding. tags: [dessert, pudding, vegetarian, intermediate]
- Croissant pudding — leftover-croissant version. tags: [dessert, pudding, vegetarian, beginner]
- Rice pudding, baked — proper Mrs Beeton. tags: [dessert, pudding, comfort-food, vegetarian, beginner]
- Stovetop rice pudding. tags: [dessert, pudding, comfort-food, vegetarian, beginner]
- Tapioca pudding. tags: [dessert, pudding, vegetarian, beginner]
- Semolina pudding. tags: [dessert, pudding, comfort-food, vegetarian, beginner]
- Chocolate self-saucing pudding. tags: [dessert, pudding, vegetarian, beginner]
- Lemon delicious pudding — self-saucing. tags: [dessert, pudding, vegetarian, beginner]
- Queen of puddings — meringue-topped jam-and-bread pudding. tags: [dessert, pudding, retro, vegetarian, intermediate]
- Apple crumble — proper UK with oat-streusel top. tags: [dessert, pudding, autumn, vegetarian, beginner]
- Apple-and-blackberry crumble. tags: [dessert, pudding, autumn, vegetarian, beginner]
- Rhubarb crumble. tags: [dessert, pudding, spring, vegetarian, beginner]
- Plum crumble. tags: [dessert, pudding, autumn, vegetarian, beginner]
- Vegan crumble — oat-based. tags: [dessert, pudding, vegetarian, vegan, beginner]
- Apple cobbler — American biscuit-topped. tags: [dessert, pudding, autumn, vegetarian, beginner]
- Peach cobbler — Southern. tags: [dessert, pudding, summer, regional, vegetarian, beginner]
- Berry cobbler. tags: [dessert, pudding, summer, vegetarian, beginner]
- Apple charlotte — bread-cased baked apple. tags: [dessert, pudding, autumn, vegetarian, intermediate]
- Apple brown betty — American breadcrumb pudding. tags: [dessert, pudding, autumn, regional, vegetarian, beginner]
- Apple turnovers. tags: [dessert, pudding, vegetarian, beginner]
- Baked apples with mincemeat or sultanas. tags: [dessert, pudding, autumn, vegetarian, beginner]
- Pears in red wine — poached. tags: [dessert, pudding, autumn, vegetarian, vegan, beginner]
- Pears poached in syrup with cardamom. tags: [dessert, pudding, vegetarian, vegan, beginner]
- Poached white peaches in muscat. tags: [dessert, pudding, summer, vegetarian, intermediate]
- Poached rhubarb in elderflower. tags: [dessert, pudding, spring, vegetarian, vegan, beginner]

### Custards, creams, mousses, set desserts

- Crème brûlée — proper vanilla. tags: [dessert, custard, vegetarian, intermediate]
- Crème brûlée, lavender. tags: [dessert, custard, vegetarian, intermediate]
- Crème brûlée, orange. tags: [dessert, custard, vegetarian, intermediate]
- Crème caramel — set-on-caramel. tags: [dessert, custard, vegetarian, intermediate]
- Flan — Spanish-style crème caramel. tags: [dessert, custard, vegetarian, intermediate]
- Crème pâtissière — pastry cream base recipe. tags: [dessert, custard, vegetarian, intermediate]
- Crème anglaise — pouring custard. tags: [dessert, custard, vegetarian, intermediate]
- Crème diplomate — cream + crème pâtissière. tags: [dessert, custard, vegetarian, intermediate]
- Pots de crème, chocolate. tags: [dessert, custard, vegetarian, intermediate]
- Pots de crème, vanilla. tags: [dessert, custard, vegetarian, intermediate]
- Pots de crème, coffee. tags: [dessert, custard, vegetarian, intermediate]
- Cream caramel ramekins. tags: [dessert, custard, vegetarian, intermediate]
- Burnt cream — Trinity Cambridge brûlée. tags: [dessert, custard, regional, vegetarian, intermediate]
- Zabaglione — Italian Marsala-and-egg-yolk. tags: [dessert, custard, vegetarian, intermediate]
- Sabayon — French equivalent. tags: [dessert, custard, vegetarian, intermediate]
- Floating islands — meringue on crème anglaise. tags: [dessert, custard, vegetarian, intermediate]
- Île flottante — French floating-islands. tags: [dessert, custard, vegetarian, intermediate]
- Panna cotta, vanilla. tags: [dessert, set-dessert, vegetarian, beginner]
- Panna cotta, buttermilk. tags: [dessert, set-dessert, vegetarian, beginner]
- Panna cotta, coffee. tags: [dessert, set-dessert, vegetarian, beginner]
- Panna cotta, lemon. tags: [dessert, set-dessert, vegetarian, beginner]
- Vegan panna cotta — coconut milk + agar. tags: [dessert, set-dessert, vegetarian, vegan, beginner]
- Posset, lemon. tags: [dessert, set-dessert, vegetarian, beginner]
- Posset, lime. tags: [dessert, set-dessert, vegetarian, beginner]
- Posset, orange. tags: [dessert, set-dessert, vegetarian, beginner]
- Syllabub, lemon — old-English wine-cream. tags: [dessert, set-dessert, vegetarian, beginner]
- Tiramisu — proper mascarpone, sponge, coffee. tags: [dessert, set-dessert, vegetarian, intermediate]
- Tiramisu, alcohol-free. tags: [dessert, set-dessert, vegetarian, beginner]
- Tiramisu, strawberry. tags: [dessert, set-dessert, vegetarian, intermediate]
- Tiramisu, lemon. tags: [dessert, set-dessert, vegetarian, intermediate]
- Trifle — proper sherry-soaked Victorian. tags: [dessert, set-dessert, festive, vegetarian, intermediate]
- Sherry trifle. tags: [dessert, set-dessert, festive, vegetarian, intermediate]
- Strawberry trifle. tags: [dessert, set-dessert, summer, vegetarian, intermediate]
- Black-Forest trifle. tags: [dessert, set-dessert, vegetarian, intermediate]
- Lemon trifle. tags: [dessert, set-dessert, vegetarian, intermediate]
- Christmas trifle with mince pies. tags: [dessert, set-dessert, festive, vegetarian, intermediate]
- Chocolate mousse — proper French dark-chocolate. tags: [dessert, mousse, vegetarian, intermediate]
- Chocolate mousse, milk. tags: [dessert, mousse, kid-friendly, vegetarian, beginner]
- Chocolate mousse, white. tags: [dessert, mousse, vegetarian, intermediate]
- Vegan chocolate mousse — aquafaba. tags: [dessert, mousse, vegetarian, vegan, intermediate]
- Lemon mousse. tags: [dessert, mousse, vegetarian, beginner]
- Mango mousse. tags: [dessert, mousse, vegetarian, beginner]
- Raspberry mousse. tags: [dessert, mousse, summer, vegetarian, beginner]
- Coffee mousse. tags: [dessert, mousse, vegetarian, beginner]
- Strawberry fool. tags: [dessert, set-dessert, summer, vegetarian, beginner]
- Raspberry fool. tags: [dessert, set-dessert, summer, vegetarian, beginner]
- Gooseberry fool. tags: [dessert, set-dessert, summer, vegetarian, beginner]
- Rhubarb fool. tags: [dessert, set-dessert, spring, vegetarian, beginner]
- Cranachan — see British regional. tags: [dessert, set-dessert, regional, vegetarian, beginner]
- Atholl brose pudding. tags: [dessert, set-dessert, regional, vegetarian, beginner]
- Charlotte russe — molded cream classic. tags: [dessert, set-dessert, vegetarian, advanced]

### Ice creams, sorbets, parfaits

- Vanilla ice cream — proper custard-base. tags: [dessert, ice-cream, vegetarian, intermediate]
- Strawberry ice cream. tags: [dessert, ice-cream, summer, vegetarian, intermediate]
- Chocolate ice cream. tags: [dessert, ice-cream, vegetarian, intermediate]
- Mint choc-chip ice cream. tags: [dessert, ice-cream, kid-friendly, vegetarian, intermediate]
- Salted-caramel ice cream. tags: [dessert, ice-cream, vegetarian, intermediate]
- Coffee ice cream. tags: [dessert, ice-cream, vegetarian, intermediate]
- Pistachio ice cream. tags: [dessert, ice-cream, vegetarian, intermediate]
- Hazelnut ice cream. tags: [dessert, ice-cream, vegetarian, intermediate]
- Ginger ice cream. tags: [dessert, ice-cream, vegetarian, intermediate]
- Rum-and-raisin ice cream. tags: [dessert, ice-cream, vegetarian, intermediate]
- Cookies-and-cream ice cream. tags: [dessert, ice-cream, kid-friendly, vegetarian, beginner]
- Banana ice cream — Philadelphia-style. tags: [dessert, ice-cream, vegetarian, beginner]
- Brown-bread ice cream — old-English. tags: [dessert, ice-cream, retro, vegetarian, intermediate]
- No-churn ice cream — condensed-milk method. tags: [dessert, ice-cream, vegetarian, beginner]
- Vegan ice cream — coconut milk base. tags: [dessert, ice-cream, vegetarian, vegan, beginner]
- Lemon sorbet. tags: [dessert, sorbet, vegetarian, vegan, intermediate]
- Raspberry sorbet. tags: [dessert, sorbet, summer, vegetarian, vegan, intermediate]
- Blackcurrant sorbet. tags: [dessert, sorbet, summer, vegetarian, vegan, intermediate]
- Mango sorbet. tags: [dessert, sorbet, vegetarian, vegan, intermediate]
- Pear-and-rosemary sorbet. tags: [dessert, sorbet, autumn, vegetarian, vegan, intermediate]
- Champagne sorbet. tags: [dessert, sorbet, vegetarian, vegan, intermediate]
- Granita, lemon. tags: [dessert, sorbet, summer, vegetarian, vegan, beginner]
- Granita, coffee — Sicilian. tags: [dessert, sorbet, vegetarian, vegan, beginner]
- Granita, watermelon. tags: [dessert, sorbet, summer, vegetarian, vegan, beginner]
- Affogato — espresso poured on vanilla ice cream. tags: [dessert, ice-cream, vegetarian, beginner]
- Knickerbocker glory. tags: [dessert, ice-cream, kid-friendly, vegetarian, beginner]
- Banana split. tags: [dessert, ice-cream, kid-friendly, vegetarian, beginner]
- Sundae, hot fudge. tags: [dessert, ice-cream, kid-friendly, vegetarian, beginner]
- Sundae, banoffee. tags: [dessert, ice-cream, vegetarian, beginner]
- Choc-ices, homemade. tags: [dessert, ice-cream, kid-friendly, vegetarian, intermediate]
- Magnum-style chocolate ice-cream bars. tags: [dessert, ice-cream, vegetarian, intermediate]
- Ice-cream sandwich, brownie-and-vanilla. tags: [dessert, ice-cream, kid-friendly, vegetarian, intermediate]
- Lollies — orange-juice ice lolly. tags: [dessert, ice-cream, kid-friendly, vegetarian, vegan, beginner]
- Strawberry lollies — yoghurt-fruit. tags: [dessert, ice-cream, kid-friendly, vegetarian, beginner]
- Fruit-pop lollies. tags: [dessert, ice-cream, kid-friendly, vegetarian, vegan, beginner]
- Parfait, chocolate. tags: [dessert, ice-cream, vegetarian, intermediate]
- Parfait, raspberry. tags: [dessert, ice-cream, summer, vegetarian, intermediate]
- Parfait, vanilla bombe. tags: [dessert, ice-cream, festive, vegetarian, intermediate]
- Cassata gelato — frozen Sicilian. tags: [dessert, ice-cream, festive, vegetarian, intermediate]
- Bombe Alaska — flaming meringue-and-ice-cream. tags: [dessert, ice-cream, festive, vegetarian, advanced]
- Baked Alaska — flat platter version. tags: [dessert, ice-cream, festive, vegetarian, intermediate]

### Other classic desserts — international

- Clafoutis — cherry batter pudding. tags: [dessert, set-dessert, summer, vegetarian, intermediate]
- Far breton — see French regional. tags: [dessert, set-dessert, regional, vegetarian, intermediate]
- Tarte Tatin — see Baking tarts. tags: [dessert, set-dessert, vegetarian, intermediate]
- Galette des Rois — see Baking pastries. tags: [dessert, festive, vegetarian, intermediate]
- Beignets soufflés — choux fritters in syrup. tags: [dessert, doughnut, regional, vegetarian, intermediate]
- Soufflé, chocolate. tags: [dessert, set-dessert, vegetarian, advanced]
- Soufflé, Grand Marnier. tags: [dessert, set-dessert, vegetarian, advanced]
- Soufflé, raspberry. tags: [dessert, set-dessert, summer, vegetarian, advanced]
- Soufflé, lemon. tags: [dessert, set-dessert, vegetarian, advanced]
- Crepes Suzette — pancakes flambéed in orange. tags: [dessert, dinner-party, vegetarian, intermediate]
- Crêpes with lemon and sugar — UK pancake-day classic. tags: [dessert, pancakes, vegetarian, beginner]
- Crêpes with maple syrup. tags: [dessert, pancakes, vegetarian, beginner]
- Crêpes with chocolate-hazelnut spread. tags: [dessert, pancakes, kid-friendly, vegetarian, beginner]
- Banana-and-toffee crêpes. tags: [dessert, pancakes, vegetarian, beginner]
- Cannoli, Sicilian — ricotta-filled fried shells. tags: [dessert, pastry, regional, vegetarian, advanced]
- Sfogliatelle — Neapolitan layered pastry. tags: [dessert, pastry, regional, vegetarian, advanced]
- Babà au rhum — yeasted rum-soaked Neapolitan cake. tags: [dessert, cake, regional, vegetarian, advanced]
- Saint-Honoré — choux-and-puff cake. tags: [dessert, pastry, vegetarian, advanced]
- Opera cake — chocolate-coffee-almond layered. tags: [dessert, cake, vegetarian, advanced]
- Sachertorte — Viennese chocolate cake. tags: [dessert, cake, regional, vegetarian, intermediate]
- Black Forest cake — see Baking. tags: [dessert, cake, vegetarian, intermediate]
- Strudel, apple — see Baking. tags: [dessert, pastry, regional, vegetarian, advanced]
- Mille-feuille — see Baking. tags: [dessert, pastry, vegetarian, advanced]
- Croquembouche — see Baking. tags: [dessert, pastry, festive, vegetarian, advanced]
- Cornish split — cream tea bun. tags: [dessert, set-dessert, regional, vegetarian, intermediate]
- Pavlova — see Baking. tags: [dessert, cake, vegetarian, gluten-free, intermediate]
- Banoffee pie — see Baking. tags: [dessert, tart, vegetarian, beginner]
- Knafeh — see Baking. tags: [dessert, pastry, vegetarian, intermediate]
- Baklava — see Baking. tags: [dessert, pastry, vegetarian, intermediate]
- Halva, tahini-based. tags: [dessert, set-dessert, regional, vegetarian, vegan, intermediate]
- Loukoumi — Cypriot Turkish-delight. tags: [dessert, set-dessert, regional, vegetarian, vegan, intermediate]
- Turkish delight, rose. tags: [dessert, set-dessert, regional, vegetarian, vegan, intermediate]
- Turkish delight, lemon. tags: [dessert, set-dessert, regional, vegetarian, vegan, intermediate]
- Rice pudding, Middle Eastern (sahlab). tags: [dessert, pudding, regional, vegetarian, beginner]
- Muhalabieh — rose-water milk pudding. tags: [dessert, pudding, regional, vegetarian, beginner]
- Mahalabia with pistachio. tags: [dessert, pudding, regional, vegetarian, beginner]
- Phirni — Anglo-Indian ground-rice pudding. tags: [dessert, pudding, indian-anglo, vegetarian, beginner]
- Gulab jamun — Anglicised milk-solid doughnut. tags: [dessert, indian-anglo, vegetarian, intermediate]
- Ras malai — Anglicised cheese-in-cream-syrup. tags: [dessert, indian-anglo, vegetarian, intermediate]
- Falooda — Anglo-Indian rose-vermicelli drink-dessert. tags: [dessert, indian-anglo, vegetarian, intermediate]
- Mango kulfi — Anglo-Indian-style ice cream. tags: [dessert, ice-cream, indian-anglo, vegetarian, intermediate]
- Pistachio kulfi. tags: [dessert, ice-cream, indian-anglo, vegetarian, intermediate]

---

## Soups

Standalone soup section (cuisines cross-referenced). Stock-making
foundations stay in `docs/content-backlog.md`.

### Clear and brothy

- Chicken noodle soup — proper home-made. tags: [soup, lunch, comfort-food, beginner]
- Chicken-and-rice soup. tags: [soup, lunch, comfort-food, beginner]
- Egg-drop soup. tags: [soup, lunch, weeknight, beginner]
- Stracciatella — see Italian. tags: [soup, lunch, vegetarian, beginner]
- French onion soup — see French. tags: [soup, dinner, comfort-food, vegetarian, intermediate]
- Mulligatawny — see British curry-house. tags: [soup, lunch, comfort-food, freezable, intermediate]
- Pho — Vietnamese-influenced beef-or-chicken broth (note: simplified, Anglicised). tags: [soup, dinner, weeknight, intermediate]
- Wonton soup — Anglicised, dumpling broth. tags: [soup, dinner, weeknight, intermediate]
- Hot-and-sour soup — Anglo-Chinese. tags: [soup, dinner, weeknight, intermediate]
- Italian wedding soup — meatball-and-greens. tags: [soup, lunch, comfort-food, beginner]
- Scotch broth — see British regional. tags: [soup, lunch, comfort-food, freezable, beginner]
- Cock-a-leekie — see British regional. tags: [soup, dinner, regional, beginner]
- Cawl — see British regional. tags: [soup, dinner, regional, beginner]
- Avgolemono — see Greek. tags: [soup, lunch, comfort-food, beginner]
- Rosół — see Polish. tags: [soup, lunch, comfort-food, beginner]
- Brown Windsor — see British retro. tags: [soup, lunch, retro, beginner]

### Puréed and creamed

- Tomato soup — proper roasted-tomato. tags: [soup, lunch, comfort-food, vegetarian, vegan, beginner]
- Cream of tomato soup. tags: [soup, lunch, comfort-food, vegetarian, beginner]
- Roasted-red-pepper soup. tags: [soup, lunch, vegetarian, vegan, beginner]
- Pepper and tomato soup. tags: [soup, lunch, vegetarian, vegan, beginner]
- Carrot and coriander soup. tags: [soup, lunch, vegetarian, vegan, beginner]
- Carrot and ginger soup. tags: [soup, lunch, vegetarian, vegan, beginner]
- Carrot and orange soup. tags: [soup, lunch, vegetarian, vegan, beginner]
- Carrot and parsnip soup. tags: [soup, lunch, vegetarian, vegan, beginner]
- Parsnip soup with curry spices. tags: [soup, lunch, vegetarian, vegan, beginner]
- Roasted parsnip and apple soup. tags: [soup, lunch, autumn, vegetarian, vegan, beginner]
- Butternut-squash soup. tags: [soup, lunch, autumn, vegetarian, vegan, beginner]
- Butternut and chilli soup. tags: [soup, lunch, autumn, vegetarian, vegan, beginner]
- Pumpkin soup — slow-roasted. tags: [soup, lunch, autumn, vegetarian, vegan, beginner]
- Pumpkin and sage soup. tags: [soup, lunch, autumn, vegetarian, vegan, beginner]
- Leek and potato soup. tags: [soup, lunch, vegetarian, vegan, beginner]
- Vichyssoise — see French. tags: [soup, lunch, summer, vegetarian, beginner]
- Cauliflower soup, creamed. tags: [soup, lunch, vegetarian, beginner]
- Cauliflower and cheese soup. tags: [soup, lunch, vegetarian, beginner]
- Broccoli and stilton soup. tags: [soup, lunch, vegetarian, intermediate]
- Pea and ham soup. tags: [soup, lunch, comfort-food, freezable, beginner]
- Pea and mint soup. tags: [soup, lunch, spring, vegetarian, beginner]
- Watercress soup — see French velouté. tags: [soup, lunch, vegetarian, beginner]
- Spinach soup with nutmeg. tags: [soup, lunch, vegetarian, beginner]
- Spinach and pea soup. tags: [soup, lunch, vegetarian, vegan, beginner]
- Asparagus soup, creamed. tags: [soup, lunch, spring, vegetarian, intermediate]
- Mushroom soup, creamed. tags: [soup, lunch, vegetarian, beginner]
- Wild-mushroom and chestnut soup. tags: [soup, lunch, autumn, vegetarian, intermediate]
- Beetroot soup — roasted. tags: [soup, lunch, autumn, vegetarian, vegan, beginner]
- Sweet-potato soup. tags: [soup, lunch, autumn, vegetarian, vegan, beginner]
- Sweet-potato and peanut soup — West African-inspired. tags: [soup, lunch, vegetarian, vegan, beginner]
- Celeriac and apple soup. tags: [soup, lunch, autumn, vegetarian, vegan, beginner]
- Fennel and apple soup. tags: [soup, lunch, autumn, vegetarian, vegan, beginner]
- Jerusalem-artichoke soup. tags: [soup, lunch, autumn, vegetarian, beginner]
- Crab bisque — see French. tags: [soup, dinner, dinner-party, intermediate]
- Lobster bisque — see French. tags: [soup, dinner, dinner-party, advanced]
- Prawn bisque — see French. tags: [soup, dinner, dinner-party, intermediate]

### Chunky, bean, and pulse

- Minestrone — see Italian. tags: [soup, lunch, comfort-food, vegetarian, vegan, freezable, beginner]
- Pasta e fagioli — see Italian. tags: [soup, lunch, vegetarian, vegan, freezable, beginner]
- Pasta e ceci — see Italian. tags: [soup, lunch, vegetarian, vegan, beginner]
- Ribollita — see Italian. tags: [soup, lunch, comfort-food, vegetarian, vegan, freezable, beginner]
- Soupe au pistou — see French. tags: [soup, lunch, summer, vegetarian, vegan, beginner]
- Ribollita with kale. tags: [soup, lunch, comfort-food, vegetarian, vegan, beginner]
- French lentil soup — Puy lentil, cream. tags: [soup, lunch, vegetarian, beginner]
- Turkish red-lentil soup — see Turkish. tags: [soup, lunch, vegetarian, vegan, beginner]
- Egyptian lentil soup. tags: [soup, lunch, vegetarian, vegan, beginner]
- Dahl soup — Anglo-Indian. tags: [soup, lunch, vegetarian, vegan, beginner]
- Coconut and red lentil soup. tags: [soup, lunch, vegetarian, vegan, beginner]
- Lentil and bacon soup. tags: [soup, lunch, comfort-food, freezable, beginner]
- White-bean and rosemary soup. tags: [soup, lunch, vegetarian, vegan, beginner]
- Bean-and-greens soup — Italian-inspired. tags: [soup, lunch, vegetarian, vegan, beginner]
- Black-bean soup, Cuban. tags: [soup, lunch, vegetarian, vegan, freezable, beginner]
- Tuscan white-bean soup. tags: [soup, lunch, vegetarian, vegan, beginner]
- Split-pea soup — proper smoked-bone. tags: [soup, lunch, comfort-food, freezable, beginner]
- Yellow split-pea soup with bacon. tags: [soup, lunch, comfort-food, freezable, beginner]
- Bean-and-sausage soup. tags: [soup, lunch, comfort-food, beginner]
- Fasolada — see Greek. tags: [soup, lunch, vegetarian, vegan, freezable, beginner]
- Harira — see Moroccan. tags: [soup, lunch, vegetarian, intermediate]
- Ash-e reshteh — see Persian. tags: [soup, lunch, vegetarian, intermediate]
- Mexican tortilla soup. tags: [soup, lunch, weeknight, beginner]
- Posole — Mexican hominy soup. tags: [soup, lunch, regional, intermediate]
- Chicken-and-corn chowder. tags: [soup, lunch, comfort-food, beginner]
- Sweetcorn chowder. tags: [soup, lunch, vegetarian, beginner]
- Clam chowder — see American. tags: [soup, lunch, regional, intermediate]
- Manhattan clam chowder. tags: [soup, lunch, regional, intermediate]
- Cullen skink — see British. tags: [soup, lunch, regional, comfort-food, beginner]
- Smoked-haddock chowder — see British. tags: [soup, lunch, comfort-food, beginner]
- Fish stew (cioppino) — see American. tags: [soup, dinner, regional, intermediate]
- Bouillabaisse — see French. tags: [soup, dinner, regional, advanced]
- Bourride — see French. tags: [soup, dinner, regional, intermediate]
- Borscht — see Russian. tags: [soup, lunch, comfort-food, freezable, beginner]
- Shchi — see Russian. tags: [soup, lunch, comfort-food, beginner]
- Goulash soup — see Hungarian. tags: [soup, lunch, comfort-food, freezable, intermediate]
- Żurek — see Polish. tags: [soup, lunch, regional, intermediate]
- Barszcz — see Polish. tags: [soup, lunch, vegetarian, vegan, beginner]
- Pho — see Clear. tags: [soup, dinner, weeknight, intermediate]

### Chilled summer soups

- Gazpacho — see Spanish. tags: [soup, summer, vegetarian, vegan, beginner]
- Salmorejo — see Spanish. tags: [soup, summer, vegetarian, vegan, beginner]
- Ajoblanco — see Spanish. tags: [soup, summer, vegetarian, vegan, beginner]
- Cold borscht — see Russian. tags: [soup, summer, vegetarian, beginner]
- Chilled cucumber soup. tags: [soup, summer, vegetarian, beginner]
- Chilled pea-and-mint soup. tags: [soup, summer, vegetarian, beginner]
- Cold tomato-and-watermelon soup. tags: [soup, summer, vegetarian, vegan, beginner]
- Chilled avocado soup. tags: [soup, summer, vegetarian, vegan, beginner]
- Cold beet-yoghurt soup (tarator-style). tags: [soup, summer, vegetarian, beginner]

---

## Salads

Standalone salad section. Cuisines cross-referenced where relevant.

### Composed and main-course

- Cobb salad — chicken, bacon, blue cheese, egg, avocado. tags: [salad, lunch, weeknight, beginner]
- Chef's salad — diner-style. tags: [salad, lunch, weeknight, beginner]
- Caesar salad — proper anchovy and parmesan. tags: [salad, lunch, weeknight, beginner]
- Caesar salad with chicken. tags: [salad, lunch, weeknight, beginner]
- Vegan Caesar — cashew-based. tags: [salad, lunch, vegetarian, vegan, beginner]
- Nicoise salad — see French. tags: [salad, lunch, summer, intermediate]
- Salade lyonnaise — see French. tags: [salad, lunch, regional, intermediate]
- Caprese — see Italian. tags: [salad, lunch, summer, vegetarian, beginner]
- Greek salad — see Greek. tags: [salad, lunch, summer, vegetarian, beginner]
- Fattoush — see Middle Eastern. tags: [salad, lunch, vegetarian, vegan, beginner]
- Tabbouleh — see Middle Eastern. tags: [salad, lunch, vegetarian, vegan, beginner]
- Panzanella — see Italian. tags: [salad, lunch, summer, vegetarian, vegan, beginner]
- Waldorf salad — apple, walnut, celery, mayonnaise. tags: [salad, lunch, weeknight, vegetarian, beginner]
- Apple-and-celeriac slaw — Christmas-trim. tags: [salad, side, festive, vegetarian, beginner]
- Coleslaw — proper. tags: [salad, side, vegetarian, beginner]
- Coleslaw, KFC-style. tags: [salad, side, vegetarian, beginner]
- Coleslaw, Asian-style with sesame. tags: [salad, side, vegetarian, vegan, beginner]
- Coleslaw, red cabbage with apple. tags: [salad, side, vegetarian, vegan, beginner]
- Vegan coleslaw. tags: [salad, side, vegetarian, vegan, beginner]
- Potato salad — proper mayonnaise-and-mustard. tags: [salad, side, picnic, vegetarian, beginner]
- Potato salad, vinegar dressing — German-style. tags: [salad, side, picnic, vegetarian, vegan, beginner]
- New-potato salad with chive. tags: [salad, side, summer, vegetarian, beginner]
- Potato-and-egg salad. tags: [salad, side, picnic, vegetarian, beginner]
- Tuna pasta salad — mayonnaise dressing. tags: [salad, lunchbox, lunch, beginner]
- Tuna and bean salad — Italian. tags: [salad, lunch, vegetarian, beginner]
- Pasta salad with pesto. tags: [salad, lunchbox, vegetarian, beginner]
- Pasta salad with tomato-and-mozzarella. tags: [salad, lunchbox, summer, vegetarian, beginner]
- Pasta salad with chicken-and-sweetcorn. tags: [salad, lunchbox, kid-friendly, beginner]
- Couscous salad with roasted vegetables. tags: [salad, lunchbox, vegetarian, vegan, beginner]
- Couscous salad with feta and olive. tags: [salad, lunchbox, vegetarian, beginner]
- Bulgur-and-herb salad. tags: [salad, lunchbox, vegetarian, vegan, beginner]
- Rice salad — Edna Lewis classic. tags: [salad, side, vegetarian, beginner]
- Wild-rice salad with cranberry. tags: [salad, side, festive, vegetarian, vegan, beginner]
- Quinoa-and-roasted-vegetable salad. tags: [salad, lunchbox, vegetarian, vegan, beginner]
- Lentil-and-feta salad. tags: [salad, lunchbox, vegetarian, beginner]
- Lentil-and-goats-cheese salad. tags: [salad, lunchbox, vegetarian, beginner]
- Lentil-and-mushroom salad. tags: [salad, lunchbox, vegetarian, vegan, beginner]
- Chickpea salad with lemon. tags: [salad, lunchbox, vegetarian, vegan, beginner]
- Bean salad — three-bean. tags: [salad, side, vegetarian, vegan, beginner]
- Roast-vegetable salad with feta. tags: [salad, lunch, vegetarian, beginner]
- Roast-pepper salad with anchovy. tags: [salad, side, summer, intermediate]
- Roast-cauliflower salad with tahini. tags: [salad, lunch, vegetarian, vegan, beginner]
- Roast-aubergine salad with pomegranate. tags: [salad, lunch, vegetarian, vegan, beginner]
- Beetroot, feta, walnut salad. tags: [salad, lunch, autumn, vegetarian, beginner]
- Beetroot, orange, watercress salad. tags: [salad, lunch, vegetarian, beginner]
- Carrot-and-orange salad — Moroccan-style. tags: [salad, side, vegetarian, vegan, beginner]
- Watermelon, feta, mint salad. tags: [salad, summer, vegetarian, beginner]
- Tomato-and-mozzarella salad. tags: [salad, summer, vegetarian, beginner]
- Tomato-and-onion salad — Anglo-Indian. tags: [salad, side, vegetarian, vegan, beginner]
- Cucumber salad — Mizeria, see Polish. tags: [salad, side, vegetarian, beginner]
- Smashed cucumber salad — Chinese-Anglo. tags: [salad, side, vegetarian, vegan, beginner]
- Fennel, orange, olive salad. tags: [salad, side, winter, vegetarian, vegan, beginner]
- Fennel-and-celery slaw. tags: [salad, side, vegetarian, vegan, beginner]
- Slaw, broccoli-and-bacon. tags: [salad, side, beginner]
- Slaw, kale-and-apple. tags: [salad, side, vegetarian, vegan, beginner]
- Burrata-and-peach salad. tags: [salad, summer, vegetarian, beginner]
- Burrata-and-tomato salad. tags: [salad, summer, vegetarian, beginner]
- Goats-cheese and roasted-beetroot salad. tags: [salad, vegetarian, beginner]
- Chicken Caesar wrap — see Caesar. tags: [salad, lunch, kid-friendly, beginner]
- Chicken-and-bacon salad. tags: [salad, lunch, beginner]
- Chicken-and-mango salad. tags: [salad, lunch, weeknight, beginner]
- Smoked-mackerel salad with horseradish. tags: [salad, lunch, beginner]
- Smoked-salmon-and-new-potato salad. tags: [salad, lunch, beginner]
- Prawn-and-avocado salad — Marie Rose. tags: [salad, lunch, beginner]
- Crab-and-cucumber salad. tags: [salad, lunch, intermediate]
- Bavarian sausage salad — wurstsalat. tags: [salad, lunch, regional, beginner]
- Ham hock and pea salad. tags: [salad, lunch, beginner]
- Olivier salad — see Russian. tags: [salad, lunch, festive, beginner]
- Salade composée — see French. tags: [salad, lunch, beginner]

---

## Breakfasts

Standalone breakfast section. Cross-references to cuisines where the
dish lives there too.

### Hot, savoury, weekend

- Full English breakfast — proper plate-build. tags: [breakfast, weekend, comfort-food, beginner]
- Veggie full English. tags: [breakfast, weekend, vegetarian, beginner]
- Vegan full English. tags: [breakfast, weekend, vegetarian, vegan, beginner]
- Full Scottish breakfast — with black pudding and tattie scones. tags: [breakfast, weekend, regional, beginner]
- Full Irish breakfast — with white and black pudding. tags: [breakfast, weekend, regional, beginner]
- Full Welsh breakfast — with laverbread and cockles. tags: [breakfast, weekend, regional, beginner]
- Bacon sandwich — see British. tags: [breakfast, weekend, comfort-food, beginner]
- Sausage sandwich — see British. tags: [breakfast, weekend, comfort-food, beginner]
- Bacon-and-egg sandwich — see British. tags: [breakfast, weekend, comfort-food, beginner]
- Eggs Benedict — see American. tags: [breakfast, weekend, intermediate]
- Eggs Florentine — see American. tags: [breakfast, weekend, vegetarian, intermediate]
- Eggs Royale — see American. tags: [breakfast, weekend, intermediate]
- Eggs Hussarde — Brennan's New Orleans variant. tags: [breakfast, weekend, regional, intermediate]
- Eggs Sardou — New Orleans artichoke variant. tags: [breakfast, weekend, regional, intermediate]
- Shakshuka — see Middle Eastern. tags: [breakfast, weekend, vegetarian, beginner]
- Green shakshuka — spinach. tags: [breakfast, weekend, vegetarian, beginner]
- Menemen — see Turkish. tags: [breakfast, weekend, vegetarian, beginner]
- Huevos rancheros — see American. tags: [breakfast, weekend, vegetarian, beginner]
- Migas — see Spanish. tags: [breakfast, regional, intermediate]
- Foul medames — see Middle Eastern. tags: [breakfast, vegetarian, vegan, beginner]
- Kedgeree — see British. tags: [breakfast, comfort-food, intermediate]
- Bubble and squeak — see British. tags: [breakfast, comfort-food, vegetarian, beginner]
- Hash browns — see American. tags: [breakfast, kid-friendly, vegetarian, beginner]
- Home fries — see American. tags: [breakfast, vegetarian, vegan, beginner]
- Corned-beef hash — see British. tags: [breakfast, comfort-food, beginner]
- Breakfast burrito — see American. tags: [breakfast, weekend, beginner]
- Breakfast tacos — Texan. tags: [breakfast, weekend, regional, beginner]
- Migas with chorizo. tags: [breakfast, regional, intermediate]
- Sausage gravy and biscuits — see American. tags: [breakfast, weekend, comfort-food, intermediate]
- Shrimp and grits — see American. tags: [breakfast, regional, intermediate]
- Chicken and waffles — see American. tags: [breakfast, regional, intermediate]
- Cheese-and-bacon scones — savoury weekend. tags: [breakfast, weekend, beginner]
- Stuffed mushrooms with garlic butter. tags: [breakfast, weekend, vegetarian, beginner]

### Eggs

- Scrambled eggs — proper soft, slow. tags: [breakfast, weeknight, vegetarian, beginner]
- Scrambled eggs with smoked salmon. tags: [breakfast, weekend, beginner]
- Scrambled eggs with chive. tags: [breakfast, weeknight, vegetarian, beginner]
- Cloud eggs — whipped-white baked. tags: [breakfast, weekend, vegetarian, beginner]
- Fried egg, runny-yolk. tags: [breakfast, weeknight, vegetarian, beginner]
- Poached eggs — proper vinegar-vortex. tags: [breakfast, weeknight, vegetarian, beginner]
- Boiled eggs, soft. tags: [breakfast, weeknight, vegetarian, beginner]
- Boiled eggs with soldiers — kid-friendly classic. tags: [breakfast, kid-friendly, vegetarian, beginner]
- Boiled egg, jammy six-minute. tags: [breakfast, weeknight, vegetarian, beginner]
- Hard-boiled eggs — perfect peeling. tags: [breakfast, vegetarian, beginner]
- Coddled eggs — Edwardian classic. tags: [breakfast, weekend, vegetarian, beginner]
- Omelette, plain three-egg. tags: [breakfast, weeknight, vegetarian, beginner]
- Omelette, ham-and-cheese. tags: [breakfast, weeknight, beginner]
- Omelette, mushroom. tags: [breakfast, weeknight, vegetarian, beginner]
- Omelette, smoked salmon and dill. tags: [breakfast, weekend, beginner]
- Omelette aux fines herbes — see French. tags: [breakfast, weeknight, vegetarian, beginner]
- Spanish tortilla — see Spanish. tags: [breakfast, weekend, vegetarian, beginner]
- Frittata, vegetable — see Italian. tags: [breakfast, weeknight, vegetarian, beginner]
- Frittata, pasta — see Italian. tags: [breakfast, lunchbox, vegetarian, beginner]
- Egg-white omelette. tags: [breakfast, weekend, vegetarian, beginner]
- Soft-boiled-egg-and-asparagus-soldiers — spring. tags: [breakfast, spring, vegetarian, intermediate]
- Devilled kidneys — see British. tags: [breakfast, weekend, intermediate]
- Kippers with butter. tags: [breakfast, weekend, beginner]
- Smoked-haddock with poached egg. tags: [breakfast, weekend, intermediate]
- Smoked-salmon with cream cheese on bagel. tags: [breakfast, weekend, beginner]

### Sweet and stack

- Pancakes — see American (buttermilk). tags: [breakfast, weekend, kid-friendly, vegetarian, beginner]
- British thin pancakes — Shrove-Tuesday classic. tags: [breakfast, weekend, kid-friendly, vegetarian, beginner]
- Crêpes — see Desserts. tags: [breakfast, weekend, vegetarian, beginner]
- Scotch pancakes (drop scones) — see British regional. tags: [breakfast, weekend, kid-friendly, vegetarian, beginner]
- Welsh pancakes — see British regional. tags: [breakfast, regional, vegetarian, beginner]
- Blueberry pancakes — see American. tags: [breakfast, weekend, kid-friendly, vegetarian, beginner]
- Banana pancakes — see American. tags: [breakfast, weekend, kid-friendly, vegetarian, beginner]
- Buckwheat pancakes — Russian-style. tags: [breakfast, weekend, vegetarian, beginner]
- Sourdough pancakes — discard-based. tags: [breakfast, weekend, vegetarian, beginner]
- Vegan pancakes — banana-flour. tags: [breakfast, weekend, vegetarian, vegan, beginner]
- Waffles — see American. tags: [breakfast, weekend, kid-friendly, vegetarian, beginner]
- Liège waffles — Belgian sugar-pearl. tags: [breakfast, weekend, vegetarian, intermediate]
- French toast — see American. tags: [breakfast, weekend, kid-friendly, vegetarian, beginner]
- Brioche French toast — see American. tags: [breakfast, weekend, vegetarian, intermediate]
- Croissant French toast. tags: [breakfast, weekend, vegetarian, beginner]
- Pain perdu — French eggy bread. tags: [breakfast, weekend, vegetarian, beginner]
- Stuffed French toast — see American. tags: [breakfast, weekend, vegetarian, intermediate]
- Cinnamon-sugar dusted French toast. tags: [breakfast, weekend, kid-friendly, vegetarian, beginner]

### Porridge, oats, grains, breakfast bakes

- Porridge — proper Scottish steel-cut. tags: [breakfast, weeknight, comfort-food, vegetarian, beginner]
- Overnight oats — basic. tags: [breakfast, weeknight, vegetarian, beginner]
- Overnight oats with peanut butter and banana. tags: [breakfast, weeknight, vegetarian, beginner]
- Overnight oats with berries. tags: [breakfast, weeknight, vegetarian, beginner]
- Bircher muesli — Swiss original. tags: [breakfast, weeknight, vegetarian, beginner]
- Granola — proper crunchy oat-and-honey. tags: [breakfast, batch-cook, vegetarian, beginner]
- Maple-pecan granola. tags: [breakfast, batch-cook, vegetarian, beginner]
- Coconut-and-almond granola. tags: [breakfast, batch-cook, vegetarian, vegan, beginner]
- Chocolate-and-hazelnut granola. tags: [breakfast, batch-cook, vegetarian, beginner]
- Vegan granola — agave-syrup-based. tags: [breakfast, batch-cook, vegetarian, vegan, beginner]
- Muesli — Swiss-style nutty mix. tags: [breakfast, vegetarian, beginner]
- Toasted muesli. tags: [breakfast, vegetarian, beginner]
- Baked-oats traybake. tags: [breakfast, batch-cook, vegetarian, beginner]
- Baked oats with apple and cinnamon. tags: [breakfast, batch-cook, vegetarian, beginner]
- Baked oats with banana and chocolate. tags: [breakfast, batch-cook, vegetarian, beginner]
- Porridge with grated apple and cinnamon. tags: [breakfast, weeknight, vegetarian, beginner]
- Porridge with peanut butter and banana. tags: [breakfast, kid-friendly, vegetarian, beginner]
- Porridge with maple syrup and pecan. tags: [breakfast, weekend, vegetarian, beginner]
- Porridge with honey and seeds. tags: [breakfast, weeknight, vegetarian, beginner]
- Vegan porridge — oat milk and almond butter. tags: [breakfast, weeknight, vegetarian, vegan, beginner]
- Cream of wheat — semolina breakfast. tags: [breakfast, weeknight, vegetarian, beginner]
- Grits — Southern breakfast. tags: [breakfast, regional, vegetarian, beginner]
- Sweet rice pudding for breakfast. tags: [breakfast, comfort-food, vegetarian, beginner]
- Chia pudding — overnight. tags: [breakfast, weeknight, vegetarian, vegan, beginner]
- Chia pudding with raspberries. tags: [breakfast, weeknight, vegetarian, vegan, beginner]
- Sahlab — see Middle Eastern. tags: [breakfast, regional, vegetarian, beginner]

### Yoghurt and fruit

- Yoghurt with honey and walnuts — Greek. tags: [breakfast, weeknight, vegetarian, beginner]
- Yoghurt parfait with granola. tags: [breakfast, weeknight, vegetarian, beginner]
- Yoghurt bowl with fresh fruit. tags: [breakfast, weeknight, vegetarian, beginner]
- Yoghurt with stewed rhubarb. tags: [breakfast, spring, vegetarian, beginner]
- Yoghurt with poached apricots. tags: [breakfast, summer, vegetarian, beginner]
- Fruit salad, classic. tags: [breakfast, summer, vegetarian, vegan, beginner]
- Tropical fruit salad. tags: [breakfast, summer, vegetarian, vegan, beginner]
- Berry compote. tags: [breakfast, summer, vegetarian, vegan, beginner]
- Apple compote with cinnamon. tags: [breakfast, autumn, vegetarian, vegan, beginner]
- Pear compote. tags: [breakfast, autumn, vegetarian, vegan, beginner]
- Plum compote. tags: [breakfast, autumn, vegetarian, vegan, beginner]
- Smoothie bowl — açai-style. tags: [breakfast, weeknight, vegetarian, vegan, beginner]
- Smoothie, green. tags: [breakfast, drink, vegetarian, vegan, beginner]
- Smoothie, berry. tags: [breakfast, drink, vegetarian, vegan, beginner]
- Smoothie, banana-peanut. tags: [breakfast, drink, kid-friendly, vegetarian, beginner]

### Bread, breakfast bakes, and continental

- Toast with marmalade. tags: [breakfast, weeknight, vegetarian, beginner]
- Toast with honey. tags: [breakfast, weeknight, vegetarian, beginner]
- Toast with butter and Marmite. tags: [breakfast, weeknight, vegetarian, beginner]
- Crumpets with butter. tags: [breakfast, weekend, vegetarian, beginner]
- Crumpets with cheese. tags: [breakfast, weekend, vegetarian, beginner]
- Bagels with cream cheese. tags: [breakfast, weekend, vegetarian, beginner]
- Bagel with lox. tags: [breakfast, weekend, beginner]
- Croissant with butter and jam. tags: [breakfast, weekend, vegetarian, beginner]
- Pain au chocolat. tags: [breakfast, weekend, vegetarian, beginner]
- Almond croissant. tags: [breakfast, weekend, vegetarian, beginner]
- Continental cheese-and-meat plate — German-style. tags: [breakfast, regional, beginner]
- English muffin with butter. tags: [breakfast, weekend, vegetarian, beginner]

---

## Drinks

Cordials and syrups appear in Preserves; this section is finished drinks
(hot, cold, alcoholic, non-alcoholic).

### Hot drinks

- Filter coffee — proper drip. tags: [drink, beverage, vegetarian, vegan, beginner]
- French-press coffee. tags: [drink, beverage, vegetarian, vegan, beginner]
- Pour-over coffee — V60 method. tags: [drink, beverage, vegetarian, vegan, beginner]
- Aeropress coffee. tags: [drink, beverage, vegetarian, vegan, beginner]
- Espresso — proper extraction. tags: [drink, beverage, vegetarian, vegan, intermediate]
- Macchiato. tags: [drink, beverage, vegetarian, beginner]
- Cortado. tags: [drink, beverage, vegetarian, beginner]
- Flat white. tags: [drink, beverage, vegetarian, beginner]
- Latte. tags: [drink, beverage, vegetarian, beginner]
- Cappuccino. tags: [drink, beverage, vegetarian, beginner]
- Mocha. tags: [drink, beverage, vegetarian, beginner]
- Affogato — see Desserts. tags: [drink, dessert, vegetarian, beginner]
- Iced coffee — cold-brew. tags: [drink, summer, vegetarian, vegan, beginner]
- Iced latte. tags: [drink, summer, vegetarian, beginner]
- Greek-style frappé. tags: [drink, summer, regional, vegetarian, beginner]
- Turkish coffee — proper unfiltered. tags: [drink, regional, vegetarian, vegan, intermediate]
- Cuban coffee — sweet espresso. tags: [drink, regional, vegetarian, vegan, beginner]
- Vietnamese egg coffee — Anglicised note. tags: [drink, regional, vegetarian, intermediate]
- English breakfast tea. tags: [drink, beverage, vegetarian, vegan, beginner]
- Earl Grey tea. tags: [drink, beverage, vegetarian, vegan, beginner]
- Yorkshire tea — strong builders'. tags: [drink, beverage, vegetarian, vegan, beginner]
- Masala chai — Anglo-Indian sweet milk tea. tags: [drink, beverage, vegetarian, beginner]
- Ginger-spiced chai. tags: [drink, beverage, vegetarian, beginner]
- Lemon-honey hot drink. tags: [drink, winter, vegetarian, beginner]
- Hot chocolate — proper Spanish-style thick. tags: [drink, winter, comfort-food, vegetarian, beginner]
- Hot chocolate, American — Hershey-style. tags: [drink, winter, kid-friendly, vegetarian, beginner]
- Hot chocolate with chilli — Aztec-style. tags: [drink, winter, vegetarian, beginner]
- Vegan hot chocolate. tags: [drink, winter, vegetarian, vegan, beginner]
- Mulled wine — proper Christmas. tags: [drink, winter, festive, vegetarian, vegan, beginner]
- Mulled cider. tags: [drink, winter, festive, vegetarian, vegan, beginner]
- Glühwein — German mulled wine. tags: [drink, winter, festive, vegetarian, vegan, beginner]
- Hot toddy — whisky-and-lemon. tags: [drink, winter, beginner]
- Hot buttered rum. tags: [drink, winter, beginner]
- Tom and Jerry — old American Christmas. tags: [drink, festive, vegetarian, intermediate]
- Atholl brose — see British regional. tags: [drink, regional, vegetarian, beginner]
- Wassail — traditional spiced cider drink. tags: [drink, winter, festive, vegetarian, vegan, intermediate]

### Cold drinks — non-alcoholic

- Lemonade — proper homemade. tags: [drink, summer, kid-friendly, vegetarian, vegan, beginner]
- Pink lemonade. tags: [drink, summer, kid-friendly, vegetarian, vegan, beginner]
- Cloudy lemonade. tags: [drink, summer, vegetarian, vegan, beginner]
- St Clement's — orange-and-lemon. tags: [drink, summer, vegetarian, vegan, beginner]
- Ginger beer — fermented. tags: [drink, summer, vegetarian, vegan, intermediate]
- Ginger fizz — quick non-ferment. tags: [drink, summer, vegetarian, vegan, beginner]
- Elderflower fizz. tags: [drink, summer, vegetarian, vegan, beginner]
- Iced tea — proper Southern. tags: [drink, summer, vegetarian, vegan, beginner]
- Sweet tea — Southern US. tags: [drink, summer, regional, vegetarian, vegan, beginner]
- Arnold Palmer — half iced tea, half lemonade. tags: [drink, summer, vegetarian, vegan, beginner]
- Mint iced tea. tags: [drink, summer, vegetarian, vegan, beginner]
- Hibiscus tea (agua de jamaica). tags: [drink, summer, vegetarian, vegan, beginner]
- Horchata — Spanish tiger-nut. tags: [drink, summer, regional, vegetarian, vegan, beginner]
- Aguas frescas, watermelon. tags: [drink, summer, vegetarian, vegan, beginner]
- Lassi, mango. tags: [drink, indian-anglo, vegetarian, beginner]
- Lassi, salt-and-mint. tags: [drink, indian-anglo, vegetarian, beginner]
- Lassi, rose. tags: [drink, indian-anglo, vegetarian, beginner]
- Strawberry milkshake — diner-style. tags: [drink, summer, kid-friendly, vegetarian, beginner]
- Chocolate milkshake. tags: [drink, kid-friendly, vegetarian, beginner]
- Vanilla milkshake. tags: [drink, kid-friendly, vegetarian, beginner]
- Banana milkshake. tags: [drink, kid-friendly, vegetarian, beginner]
- Banoffee milkshake. tags: [drink, vegetarian, beginner]
- Milkshake, peanut-butter. tags: [drink, kid-friendly, vegetarian, beginner]
- Iced chocolate. tags: [drink, summer, vegetarian, beginner]
- Iced mocha. tags: [drink, summer, vegetarian, beginner]
- Berry-vanilla milkshake. tags: [drink, summer, vegetarian, beginner]
- Mocktail, virgin mojito. tags: [drink, summer, vegetarian, vegan, beginner]
- Mocktail, fruit punch. tags: [drink, party, kid-friendly, vegetarian, vegan, beginner]
- Mocktail, virgin pina colada. tags: [drink, summer, vegetarian, beginner]

### Alcoholic — cocktails and classics

- Negroni — classic. tags: [drink, party, vegetarian, vegan, beginner]
- Aperol spritz. tags: [drink, summer, party, vegetarian, vegan, beginner]
- Bellini — peach prosecco. tags: [drink, summer, vegetarian, vegan, beginner]
- Mimosa — orange-juice champagne. tags: [drink, party, vegetarian, vegan, beginner]
- Old fashioned. tags: [drink, party, vegetarian, vegan, beginner]
- Manhattan. tags: [drink, party, vegetarian, vegan, beginner]
- Martini, dry gin. tags: [drink, party, vegetarian, vegan, beginner]
- Martini, vodka. tags: [drink, party, vegetarian, vegan, beginner]
- Martini, dirty. tags: [drink, party, vegetarian, beginner]
- Espresso martini. tags: [drink, party, vegetarian, intermediate]
- Margarita, classic. tags: [drink, party, vegetarian, vegan, beginner]
- Frozen margarita. tags: [drink, summer, party, vegetarian, vegan, beginner]
- Tommy's margarita — agave-syrup version. tags: [drink, party, vegetarian, vegan, beginner]
- Mojito, classic. tags: [drink, summer, party, vegetarian, vegan, beginner]
- Daiquiri, classic. tags: [drink, party, vegetarian, vegan, beginner]
- Frozen daiquiri. tags: [drink, summer, party, vegetarian, vegan, beginner]
- Cosmopolitan. tags: [drink, party, vegetarian, vegan, beginner]
- Whisky sour. tags: [drink, party, vegetarian, beginner]
- Pisco sour. tags: [drink, regional, vegetarian, beginner]
- Sazerac — New Orleans whisky cocktail. tags: [drink, regional, vegetarian, vegan, intermediate]
- Sidecar — brandy classic. tags: [drink, party, vegetarian, vegan, beginner]
- Tom Collins. tags: [drink, party, vegetarian, vegan, beginner]
- Gimlet — gin-and-lime. tags: [drink, party, vegetarian, vegan, beginner]
- Dark and stormy. tags: [drink, party, vegetarian, vegan, beginner]
- Moscow mule. tags: [drink, party, vegetarian, vegan, beginner]
- Bloody Mary. tags: [drink, weekend, vegetarian, vegan, beginner]
- Pimm's — classic UK summer jug. tags: [drink, summer, party, vegetarian, vegan, beginner]
- Sangria — see Spanish. tags: [drink, summer, party, vegetarian, vegan, beginner]
- Punch, rum. tags: [drink, party, vegetarian, vegan, intermediate]
- Punch, Christmas. tags: [drink, festive, party, vegetarian, vegan, intermediate]

### Country wines and home-brews

- Elderflower wine — see Preserves cordial. tags: [drink, summer, vegetarian, vegan, advanced]
- Elderberry wine. tags: [drink, autumn, vegetarian, vegan, advanced]
- Rosehip wine. tags: [drink, autumn, vegetarian, vegan, advanced]
- Damson wine. tags: [drink, autumn, vegetarian, vegan, advanced]
- Blackberry wine. tags: [drink, autumn, vegetarian, vegan, advanced]
- Country mead, plain. tags: [drink, vegetarian, advanced]
- Spiced metheglin mead. tags: [drink, vegetarian, advanced]
- Apple cider — wild-ferment. tags: [drink, autumn, vegetarian, vegan, advanced]
- Hard cider — controlled-yeast. tags: [drink, autumn, vegetarian, vegan, advanced]
- Pear perry. tags: [drink, autumn, vegetarian, vegan, advanced]
- Hedgerow gin — sloe, damson, hawthorn. tags: [drink, autumn, vegetarian, intermediate]
- Limoncello — see Preserves cordial. tags: [drink, vegetarian, intermediate]
- Cherry brandy. tags: [drink, autumn, vegetarian, intermediate]

---

## Air-fryer

Heavy section. UK search demand for "air fryer [ingredient]" is enormous;
investing here unlocks an SEO surface area roughly the size of a cuisine.
Recipes here are method-led: each is written specifically for the air
fryer, with cook times and temperatures tuned to common-sized models
(Ninja Foodi, Tower T17, Cosori, Instant Vortex). Where a cuisine recipe
also works in an air fryer, the entry here is a stand-alone version, not
an index reference.

### Chicken and poultry

- Air-fryer chicken thighs — bone-in, skin-on, crisp. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer chicken thighs, boneless. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer chicken breasts — juicy, brined. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer whole chicken — under 1.5 kg. tags: [air-fryer, dinner, sunday-lunch, intermediate]
- Air-fryer spatchcock chicken. tags: [air-fryer, dinner, sunday-lunch, intermediate]
- Air-fryer chicken drumsticks. tags: [air-fryer, dinner, weeknight, kid-friendly, beginner]
- Air-fryer chicken wings, plain. tags: [air-fryer, snack, party, beginner]
- Air-fryer buffalo wings. tags: [air-fryer, snack, party, beginner]
- Air-fryer BBQ wings. tags: [air-fryer, snack, party, beginner]
- Air-fryer salt-and-pepper wings. tags: [air-fryer, snack, party, beginner]
- Air-fryer lemon-pepper wings. tags: [air-fryer, snack, party, beginner]
- Air-fryer honey-garlic wings. tags: [air-fryer, snack, party, beginner]
- Air-fryer Korean-style wings — gochujang-glazed. tags: [air-fryer, snack, party, beginner]
- Air-fryer breaded chicken tenders. tags: [air-fryer, dinner, kid-friendly, weeknight, beginner]
- Air-fryer chicken nuggets — proper homemade. tags: [air-fryer, snack, kid-friendly, freezable, beginner]
- Air-fryer chicken Kyiv — frozen-product method. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer chicken parmesan. tags: [air-fryer, dinner, comfort-food, kid-friendly, intermediate]
- Air-fryer chicken katsu — Anglo-Japanese. tags: [air-fryer, dinner, weeknight, intermediate]
- Air-fryer chicken shawarma. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer chicken fajitas — peppers and chicken in basket. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer chicken tikka. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer tandoori chicken. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer Cornish hen. tags: [air-fryer, dinner, dinner-party, intermediate]
- Air-fryer duck breast. tags: [air-fryer, dinner, dinner-party, intermediate]
- Air-fryer duck legs — confit-style. tags: [air-fryer, dinner, dinner-party, intermediate]
- Air-fryer turkey breast — boneless. tags: [air-fryer, dinner, festive, intermediate]
- Air-fryer turkey crown — small bird. tags: [air-fryer, dinner, festive, intermediate]

### Beef, lamb, pork

- Air-fryer steak — ribeye or sirloin. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer rump steak. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer fillet steak. tags: [air-fryer, dinner, dinner-party, intermediate]
- Air-fryer beef burgers. tags: [air-fryer, dinner, kid-friendly, weeknight, beginner]
- Air-fryer turkey burgers. tags: [air-fryer, dinner, kid-friendly, weeknight, beginner]
- Air-fryer meatballs, beef. tags: [air-fryer, dinner, kid-friendly, freezable, beginner]
- Air-fryer meatballs, Swedish. tags: [air-fryer, dinner, comfort-food, freezable, beginner]
- Air-fryer kofta — Middle-Eastern minced lamb. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer kebab skewers. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer roast beef — small joint. tags: [air-fryer, dinner, sunday-lunch, intermediate]
- Air-fryer pork chops. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer pork belly slices — crispy crackling. tags: [air-fryer, dinner, weeknight, intermediate]
- Air-fryer pork tenderloin. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer pork loin chops — apple-glazed. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer pork ribs — sticky. tags: [air-fryer, dinner, comfort-food, intermediate]
- Air-fryer roast pork joint — crackling on top. tags: [air-fryer, dinner, sunday-lunch, intermediate]
- Air-fryer ham steaks. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer lamb chops. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer rack of lamb. tags: [air-fryer, dinner, dinner-party, intermediate]
- Air-fryer lamb meatballs. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer sausages. tags: [air-fryer, dinner, kid-friendly, weeknight, beginner]
- Air-fryer cumberland sausages. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer chorizo. tags: [air-fryer, snack, weeknight, beginner]
- Air-fryer bacon. tags: [air-fryer, breakfast, weeknight, beginner]
- Air-fryer streaky bacon — crisp. tags: [air-fryer, breakfast, weeknight, beginner]
- Air-fryer black pudding slices. tags: [air-fryer, breakfast, beginner]
- Air-fryer Scotch eggs. tags: [air-fryer, snack, picnic, intermediate]

### Fish and seafood

- Air-fryer salmon fillet. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer cod fillet. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer haddock fillet. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer sea bass — whole fillet. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer tuna steak. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer breaded fish fillets. tags: [air-fryer, dinner, kid-friendly, weeknight, beginner]
- Air-fryer fish fingers. tags: [air-fryer, dinner, kid-friendly, beginner]
- Air-fryer mackerel fillets. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer prawns — garlic and butter. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer scampi. tags: [air-fryer, snack, weeknight, beginner]
- Air-fryer breaded prawns. tags: [air-fryer, snack, kid-friendly, beginner]
- Air-fryer crab cakes. tags: [air-fryer, dinner, weeknight, intermediate]
- Air-fryer fish cakes — UK-style. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer scallops. tags: [air-fryer, dinner, dinner-party, intermediate]
- Air-fryer calamari rings. tags: [air-fryer, snack, party, beginner]
- Air-fryer sardines, whole. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer mussels. tags: [air-fryer, dinner, weeknight, intermediate]

### Vegetables and sides

- Air-fryer chips, frozen. tags: [air-fryer, side, kid-friendly, vegetarian, vegan, beginner]
- Air-fryer chips, fresh-cut. tags: [air-fryer, side, vegetarian, vegan, beginner]
- Air-fryer skinny fries. tags: [air-fryer, side, vegetarian, vegan, beginner]
- Air-fryer chunky chips. tags: [air-fryer, side, vegetarian, vegan, beginner]
- Air-fryer sweet-potato fries. tags: [air-fryer, side, vegetarian, vegan, beginner]
- Air-fryer wedges — Cajun-spiced. tags: [air-fryer, side, vegetarian, vegan, beginner]
- Air-fryer hasselback potatoes. tags: [air-fryer, side, vegetarian, beginner]
- Air-fryer baby potatoes. tags: [air-fryer, side, vegetarian, vegan, beginner]
- Air-fryer roast potatoes — proper crisp Sunday-lunch. tags: [air-fryer, side, sunday-lunch, vegetarian, beginner]
- Air-fryer jacket potatoes. tags: [air-fryer, side, vegetarian, beginner]
- Air-fryer mash-stuffed potato skins. tags: [air-fryer, snack, vegetarian, intermediate]
- Air-fryer hash browns. tags: [air-fryer, breakfast, vegetarian, beginner]
- Air-fryer potato pancakes (rösti). tags: [air-fryer, breakfast, vegetarian, beginner]
- Air-fryer onion rings — beer-battered. tags: [air-fryer, side, vegetarian, intermediate]
- Air-fryer breaded mushrooms. tags: [air-fryer, snack, vegetarian, beginner]
- Air-fryer stuffed mushrooms. tags: [air-fryer, snack, party, vegetarian, beginner]
- Air-fryer roasted mushrooms — garlic and thyme. tags: [air-fryer, side, vegetarian, vegan, beginner]
- Air-fryer cauliflower wings — buffalo. tags: [air-fryer, snack, party, vegetarian, beginner]
- Air-fryer roast cauliflower — whole-head. tags: [air-fryer, side, vegetarian, vegan, beginner]
- Air-fryer cauliflower florets, breaded. tags: [air-fryer, snack, vegetarian, beginner]
- Air-fryer broccoli — quick-roast. tags: [air-fryer, side, vegetarian, vegan, beginner]
- Air-fryer Brussels sprouts, halved. tags: [air-fryer, side, vegetarian, vegan, beginner]
- Air-fryer Brussels sprouts with bacon. tags: [air-fryer, side, festive, beginner]
- Air-fryer asparagus. tags: [air-fryer, side, spring, vegetarian, vegan, beginner]
- Air-fryer green beans. tags: [air-fryer, side, vegetarian, vegan, beginner]
- Air-fryer carrots — honey-roast. tags: [air-fryer, side, vegetarian, beginner]
- Air-fryer parsnips. tags: [air-fryer, side, sunday-lunch, vegetarian, vegan, beginner]
- Air-fryer beetroot. tags: [air-fryer, side, vegetarian, vegan, beginner]
- Air-fryer aubergine — slices, salt-cured. tags: [air-fryer, side, vegetarian, vegan, beginner]
- Air-fryer courgette slices. tags: [air-fryer, side, summer, vegetarian, vegan, beginner]
- Air-fryer roasted peppers. tags: [air-fryer, side, summer, vegetarian, vegan, beginner]
- Air-fryer roasted tomatoes. tags: [air-fryer, side, summer, vegetarian, vegan, beginner]
- Air-fryer butternut-squash cubes. tags: [air-fryer, side, autumn, vegetarian, vegan, beginner]
- Air-fryer roast pumpkin. tags: [air-fryer, side, autumn, vegetarian, vegan, beginner]
- Air-fryer kale chips. tags: [air-fryer, snack, vegetarian, vegan, beginner]
- Air-fryer halloumi slices. tags: [air-fryer, snack, vegetarian, beginner]
- Air-fryer halloumi fries. tags: [air-fryer, snack, party, vegetarian, beginner]
- Air-fryer paneer cubes. tags: [air-fryer, dinner, vegetarian, beginner]
- Air-fryer falafel — see Middle Eastern. tags: [air-fryer, snack, vegetarian, vegan, intermediate]
- Air-fryer tofu cubes — crispy. tags: [air-fryer, dinner, vegetarian, vegan, beginner]

### Snacks, pastry, and finishes

- Air-fryer samosas, frozen. tags: [air-fryer, snack, vegetarian, beginner]
- Air-fryer spring rolls, frozen. tags: [air-fryer, snack, vegetarian, beginner]
- Air-fryer sausage rolls — frozen and fresh. tags: [air-fryer, snack, beginner]
- Air-fryer Cornish pasty. tags: [air-fryer, lunch, regional, beginner]
- Air-fryer pork pie — reheat. tags: [air-fryer, lunch, beginner]
- Air-fryer mozzarella sticks, frozen. tags: [air-fryer, snack, party, vegetarian, beginner]
- Air-fryer pizza, frozen. tags: [air-fryer, dinner, kid-friendly, beginner]
- Air-fryer pita pizza — quick version. tags: [air-fryer, dinner, kid-friendly, vegetarian, beginner]
- Air-fryer naan pizza. tags: [air-fryer, dinner, kid-friendly, vegetarian, beginner]
- Air-fryer tortilla pizza. tags: [air-fryer, dinner, kid-friendly, vegetarian, beginner]
- Air-fryer flatbreads — from scratch. tags: [air-fryer, side, vegetarian, vegan, beginner]
- Air-fryer naan — from frozen. tags: [air-fryer, side, vegetarian, beginner]
- Air-fryer toast — quick. tags: [air-fryer, breakfast, vegetarian, beginner]
- Air-fryer cheese toastie. tags: [air-fryer, lunch, vegetarian, beginner]
- Air-fryer croque-monsieur. tags: [air-fryer, lunch, intermediate]
- Air-fryer quesadilla. tags: [air-fryer, lunch, kid-friendly, vegetarian, beginner]
- Air-fryer cinnamon rolls — refrigerated dough. tags: [air-fryer, breakfast, vegetarian, beginner]
- Air-fryer croissants — reheat. tags: [air-fryer, breakfast, vegetarian, beginner]
- Air-fryer baked apples. tags: [air-fryer, dessert, autumn, vegetarian, beginner]
- Air-fryer apple turnovers. tags: [air-fryer, dessert, vegetarian, beginner]
- Air-fryer doughnuts — refrigerated biscuit dough. tags: [air-fryer, dessert, kid-friendly, vegetarian, beginner]
- Air-fryer chocolate-chip cookies. tags: [air-fryer, dessert, kid-friendly, vegetarian, beginner]
- Air-fryer brownies — small batch. tags: [air-fryer, dessert, vegetarian, beginner]
- Air-fryer banana bread mini-loaf. tags: [air-fryer, dessert, vegetarian, beginner]
- Air-fryer cheese scones. tags: [air-fryer, side, vegetarian, beginner]
- Air-fryer plain scones. tags: [air-fryer, dessert, vegetarian, beginner]
- Air-fryer hard-boiled eggs. tags: [air-fryer, breakfast, vegetarian, beginner]
- Air-fryer poached eggs in ramekin. tags: [air-fryer, breakfast, vegetarian, beginner]
- Air-fryer baked eggs in avocado halves. tags: [air-fryer, breakfast, vegetarian, beginner]
- Air-fryer breakfast sandwich. tags: [air-fryer, breakfast, weeknight, beginner]

### Air-fryer meal builds (cross-cuisine)

- Air-fryer crispy katsu chicken with rice. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer Thai-style crispy chicken (Anglicised). tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer Korean-style crispy tofu (Anglicised). tags: [air-fryer, dinner, weeknight, vegetarian, vegan, beginner]
- Air-fryer salmon teriyaki. tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer chicken biryani-style rice (no rice cooked in fryer — chicken only). tags: [air-fryer, dinner, weeknight, beginner]
- Air-fryer crispy fish tacos. tags: [air-fryer, dinner, weeknight, intermediate]
- Air-fryer chicken Caesar wrap. tags: [air-fryer, lunch, weeknight, beginner]
- Air-fryer roast-vegetable traybake — peppers, courgette, onion. tags: [air-fryer, dinner, vegetarian, vegan, beginner]
- Air-fryer cheesy potato bake. tags: [air-fryer, side, comfort-food, vegetarian, beginner]
- Air-fryer mac-and-cheese — single-serve. tags: [air-fryer, dinner, comfort-food, vegetarian, beginner]
- Air-fryer chilli-cheese fries. tags: [air-fryer, snack, party, beginner]

---

## Slow-cooker

Slow-cooker recipes are written for a 3.5-litre / 6-litre standard
British slow-cooker. Same SEO weight as the air-fryer section. Long
cooking times trade well for weekday convenience: build the pot in the
morning, dinner ready in the evening.

### Beef

- Slow-cooker beef stew with dumplings. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker beef bourguignon — see French. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker beef and ale stew. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker steak and kidney. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker beef brisket. tags: [slow-cooker, dinner, comfort-food, batch-cook, freezable, beginner]
- Slow-cooker beef cheeks in red wine. tags: [slow-cooker, dinner, comfort-food, freezable, intermediate]
- Slow-cooker oxtail stew. tags: [slow-cooker, dinner, comfort-food, freezable, intermediate]
- Slow-cooker beef short ribs. tags: [slow-cooker, dinner, comfort-food, intermediate]
- Slow-cooker pot roast — proper. tags: [slow-cooker, dinner, comfort-food, beginner]
- Slow-cooker Mississippi pot roast. tags: [slow-cooker, dinner, comfort-food, beginner]
- Slow-cooker shredded beef for tacos. tags: [slow-cooker, dinner, weeknight, beginner]
- Slow-cooker Italian beef — Chicago-style. tags: [slow-cooker, dinner, weeknight, beginner]
- Slow-cooker French-dip sandwich filling. tags: [slow-cooker, lunch, weeknight, beginner]
- Slow-cooker chilli con carne. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker white chicken chilli. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker beef ragù. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker bolognese sauce. tags: [slow-cooker, dinner, kid-friendly, freezable, beginner]
- Slow-cooker meatballs in tomato sauce. tags: [slow-cooker, dinner, kid-friendly, freezable, beginner]
- Slow-cooker Swedish meatballs. tags: [slow-cooker, dinner, comfort-food, beginner]
- Slow-cooker beef stroganoff. tags: [slow-cooker, dinner, comfort-food, beginner]
- Slow-cooker beef goulash. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker beef and barley stew. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker beef and onion casserole. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]

### Lamb

- Slow-cooker lamb shoulder — seven-hour. tags: [slow-cooker, dinner, sunday-lunch, batch-cook, beginner]
- Slow-cooker shoulder of lamb with rosemary and garlic. tags: [slow-cooker, dinner, sunday-lunch, beginner]
- Slow-cooker lamb shanks in red wine. tags: [slow-cooker, dinner, comfort-food, freezable, intermediate]
- Slow-cooker Moroccan lamb tagine. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker rogan josh. tags: [slow-cooker, dinner, freezable, beginner]
- Slow-cooker lamb madras. tags: [slow-cooker, dinner, freezable, intermediate]
- Slow-cooker Irish stew. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker Scotch broth — see British. tags: [slow-cooker, lunch, comfort-food, freezable, beginner]
- Slow-cooker lamb hotpot. tags: [slow-cooker, dinner, comfort-food, beginner]
- Slow-cooker lamb biryani-style stew. tags: [slow-cooker, dinner, comfort-food, beginner]
- Slow-cooker lamb kleftiko. tags: [slow-cooker, dinner, comfort-food, intermediate]

### Pork

- Slow-cooker pulled pork shoulder. tags: [slow-cooker, dinner, batch-cook, beginner]
- Slow-cooker pulled-pork sliders. tags: [slow-cooker, snack, party, beginner]
- Slow-cooker char-siu pork (Anglicised). tags: [slow-cooker, dinner, weeknight, beginner]
- Slow-cooker pork loin with apple cider. tags: [slow-cooker, dinner, weeknight, beginner]
- Slow-cooker pork belly. tags: [slow-cooker, dinner, comfort-food, intermediate]
- Slow-cooker pork ribs. tags: [slow-cooker, dinner, comfort-food, intermediate]
- Slow-cooker bacon-and-bean casserole. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker sausage casserole. tags: [slow-cooker, dinner, kid-friendly, freezable, beginner]
- Slow-cooker gammon — sweet-glazed. tags: [slow-cooker, dinner, festive, intermediate]
- Slow-cooker ham in cola. tags: [slow-cooker, dinner, festive, beginner]
- Slow-cooker ham in cider. tags: [slow-cooker, dinner, festive, beginner]
- Slow-cooker hot-dogs in BBQ sauce. tags: [slow-cooker, snack, party, kid-friendly, beginner]

### Chicken

- Slow-cooker whole chicken. tags: [slow-cooker, dinner, sunday-lunch, beginner]
- Slow-cooker chicken thighs in tomato sauce. tags: [slow-cooker, dinner, weeknight, beginner]
- Slow-cooker coq au vin — see French. tags: [slow-cooker, dinner, comfort-food, freezable, intermediate]
- Slow-cooker chicken cacciatore. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker chicken curry — Anglo-Indian. tags: [slow-cooker, dinner, weeknight, freezable, beginner]
- Slow-cooker butter chicken — Anglicised. tags: [slow-cooker, dinner, weeknight, freezable, beginner]
- Slow-cooker chicken tikka masala. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker chicken korma. tags: [slow-cooker, dinner, kid-friendly, freezable, beginner]
- Slow-cooker chicken jalfrezi. tags: [slow-cooker, dinner, freezable, beginner]
- Slow-cooker Moroccan chicken with olives. tags: [slow-cooker, dinner, comfort-food, freezable, beginner]
- Slow-cooker Italian chicken with peppers. tags: [slow-cooker, dinner, weeknight, beginner]
- Slow-cooker honey-mustard chicken. tags: [slow-cooker, dinner, kid-friendly, beginner]
- Slow-cooker BBQ chicken. tags: [slow-cooker, dinner, kid-friendly, beginner]
- Slow-cooker BBQ chicken sliders. tags: [slow-cooker, snack, party, kid-friendly, beginner]
- Slow-cooker creamy garlic chicken. tags: [slow-cooker, dinner, comfort-food, beginner]
- Slow-cooker lemon chicken. tags: [slow-cooker, dinner, weeknight, beginner]
- Slow-cooker chicken fajitas. tags: [slow-cooker, dinner, weeknight, kid-friendly, beginner]
- Slow-cooker chicken tacos. tags: [slow-cooker, dinner, weeknight, kid-friendly, beginner]
- Slow-cooker chicken enchilada filling. tags: [slow-cooker, dinner, freezable, beginner]
- Slow-cooker chicken-and-rice soup. tags: [slow-cooker, lunch, comfort-food, freezable, beginner]
- Slow-cooker chicken noodle soup. tags: [slow-cooker, lunch, comfort-food, beginner]
- Slow-cooker chicken stew with dumplings. tags: [slow-cooker, dinner, comfort-food, beginner]
- Slow-cooker chicken cassoulet (Anglicised). tags: [slow-cooker, dinner, comfort-food, beginner]
- Slow-cooker chicken-and-mushroom pie filling. tags: [slow-cooker, dinner, freezable, beginner]
- Slow-cooker turkey breast. tags: [slow-cooker, dinner, festive, intermediate]
- Slow-cooker turkey chilli. tags: [slow-cooker, dinner, freezable, beginner]
- Slow-cooker turkey meatballs. tags: [slow-cooker, dinner, kid-friendly, freezable, beginner]

### Vegetarian / vegan

- Slow-cooker vegetable curry. tags: [slow-cooker, dinner, vegetarian, vegan, freezable, beginner]
- Slow-cooker chickpea curry. tags: [slow-cooker, dinner, vegetarian, vegan, freezable, beginner]
- Slow-cooker dhal — tarka. tags: [slow-cooker, dinner, vegetarian, vegan, freezable, beginner]
- Slow-cooker mushroom stroganoff. tags: [slow-cooker, dinner, vegetarian, comfort-food, beginner]
- Slow-cooker ratatouille — see French. tags: [slow-cooker, dinner, vegetarian, vegan, freezable, beginner]
- Slow-cooker mushroom bourguignon. tags: [slow-cooker, dinner, vegetarian, vegan, freezable, beginner]
- Slow-cooker lentil bolognese. tags: [slow-cooker, dinner, vegetarian, vegan, kid-friendly, freezable, beginner]
- Slow-cooker lentil chilli. tags: [slow-cooker, dinner, vegetarian, vegan, freezable, beginner]
- Slow-cooker three-bean chilli. tags: [slow-cooker, dinner, vegetarian, vegan, freezable, beginner]
- Slow-cooker minestrone — see Italian. tags: [slow-cooker, lunch, vegetarian, vegan, freezable, beginner]
- Slow-cooker pumpkin soup. tags: [slow-cooker, lunch, autumn, vegetarian, vegan, beginner]
- Slow-cooker butternut-squash soup. tags: [slow-cooker, lunch, autumn, vegetarian, vegan, beginner]
- Slow-cooker tomato soup. tags: [slow-cooker, lunch, vegetarian, vegan, beginner]
- Slow-cooker leek-and-potato soup. tags: [slow-cooker, lunch, vegetarian, beginner]
- Slow-cooker carrot-and-coriander soup. tags: [slow-cooker, lunch, vegetarian, vegan, beginner]
- Slow-cooker French-onion soup — see French. tags: [slow-cooker, lunch, comfort-food, vegetarian, beginner]
- Slow-cooker split-pea soup. tags: [slow-cooker, lunch, comfort-food, freezable, beginner]
- Slow-cooker lentil-and-bacon soup. tags: [slow-cooker, lunch, freezable, beginner]
- Slow-cooker chicken stock. tags: [slow-cooker, side, batch-cook, beginner]
- Slow-cooker beef stock. tags: [slow-cooker, side, batch-cook, beginner]
- Slow-cooker vegetable stock. tags: [slow-cooker, side, vegetarian, vegan, batch-cook, beginner]
- Slow-cooker baked beans. tags: [slow-cooker, side, vegetarian, vegan, beginner]
- Slow-cooker Boston baked beans. tags: [slow-cooker, side, vegetarian, beginner]
- Slow-cooker porridge — overnight. tags: [slow-cooker, breakfast, vegetarian, beginner]
- Slow-cooker steel-cut oats. tags: [slow-cooker, breakfast, vegetarian, beginner]
- Slow-cooker mashed potatoes. tags: [slow-cooker, side, vegetarian, beginner]
- Slow-cooker scalloped potatoes. tags: [slow-cooker, side, vegetarian, beginner]
- Slow-cooker macaroni cheese. tags: [slow-cooker, dinner, comfort-food, kid-friendly, vegetarian, beginner]
- Slow-cooker stuffed peppers. tags: [slow-cooker, dinner, comfort-food, vegetarian, beginner]
- Slow-cooker risotto-style rice (note: not true risotto). tags: [slow-cooker, dinner, vegetarian, beginner]

### Slow-cooker desserts and bakes

- Slow-cooker rice pudding. tags: [slow-cooker, dessert, comfort-food, vegetarian, beginner]
- Slow-cooker bread-and-butter pudding. tags: [slow-cooker, dessert, comfort-food, vegetarian, beginner]
- Slow-cooker chocolate fudge cake. tags: [slow-cooker, dessert, vegetarian, beginner]
- Slow-cooker chocolate self-saucing pudding. tags: [slow-cooker, dessert, vegetarian, beginner]
- Slow-cooker lemon-self-saucing pudding. tags: [slow-cooker, dessert, vegetarian, beginner]
- Slow-cooker apple crumble. tags: [slow-cooker, dessert, autumn, vegetarian, beginner]
- Slow-cooker apple sauce. tags: [slow-cooker, side, autumn, vegetarian, vegan, beginner]
- Slow-cooker poached pears in red wine. tags: [slow-cooker, dessert, autumn, vegetarian, vegan, beginner]
- Slow-cooker stewed apples. tags: [slow-cooker, breakfast, autumn, vegetarian, vegan, beginner]
- Slow-cooker mulled wine — see Drinks. tags: [slow-cooker, drink, winter, festive, vegetarian, vegan, beginner]
- Slow-cooker mulled cider. tags: [slow-cooker, drink, winter, festive, vegetarian, vegan, beginner]

---

## Pressure-cooker (Instant Pot)

Lower SEO demand than air-fryer / slow-cooker but still substantial.
Tuned for 6-litre Instant Pot or stovetop pressure-cooker; cooking times
listed are pressure-cook times, not total times.

- Pressure-cooker chicken stock — 45 minutes. tags: [pressure-cooker, side, batch-cook, beginner]
- Pressure-cooker beef stock — 90 minutes. tags: [pressure-cooker, side, batch-cook, beginner]
- Pressure-cooker bone broth. tags: [pressure-cooker, side, batch-cook, beginner]
- Pressure-cooker chicken risotto-style — 8 minutes. tags: [pressure-cooker, dinner, weeknight, beginner]
- Pressure-cooker mushroom risotto-style. tags: [pressure-cooker, dinner, vegetarian, beginner]
- Pressure-cooker beef short ribs — 45 minutes. tags: [pressure-cooker, dinner, comfort-food, intermediate]
- Pressure-cooker beef stew. tags: [pressure-cooker, dinner, comfort-food, freezable, beginner]
- Pressure-cooker beef bourguignon. tags: [pressure-cooker, dinner, comfort-food, freezable, intermediate]
- Pressure-cooker chilli con carne. tags: [pressure-cooker, dinner, freezable, beginner]
- Pressure-cooker pulled pork — 60 minutes. tags: [pressure-cooker, dinner, batch-cook, beginner]
- Pressure-cooker shredded chicken — 8 minutes. tags: [pressure-cooker, dinner, weeknight, beginner]
- Pressure-cooker whole chicken. tags: [pressure-cooker, dinner, weeknight, beginner]
- Pressure-cooker chicken curry. tags: [pressure-cooker, dinner, weeknight, beginner]
- Pressure-cooker butter chicken. tags: [pressure-cooker, dinner, comfort-food, beginner]
- Pressure-cooker chicken tikka masala. tags: [pressure-cooker, dinner, freezable, beginner]
- Pressure-cooker chickpea curry. tags: [pressure-cooker, dinner, vegetarian, vegan, beginner]
- Pressure-cooker dried beans — 30 minutes. tags: [pressure-cooker, side, vegetarian, vegan, batch-cook, beginner]
- Pressure-cooker chickpeas from dried. tags: [pressure-cooker, side, vegetarian, vegan, batch-cook, beginner]
- Pressure-cooker black beans. tags: [pressure-cooker, side, vegetarian, vegan, batch-cook, beginner]
- Pressure-cooker red lentil dhal. tags: [pressure-cooker, dinner, vegetarian, vegan, freezable, beginner]
- Pressure-cooker risotto. tags: [pressure-cooker, dinner, vegetarian, beginner]
- Pressure-cooker beef brisket. tags: [pressure-cooker, dinner, comfort-food, intermediate]
- Pressure-cooker pork ribs. tags: [pressure-cooker, dinner, comfort-food, intermediate]
- Pressure-cooker hard-boiled eggs — 5-5-5 method. tags: [pressure-cooker, breakfast, vegetarian, beginner]
- Pressure-cooker oatmeal — overnight. tags: [pressure-cooker, breakfast, vegetarian, beginner]
- Pressure-cooker steel-cut oats. tags: [pressure-cooker, breakfast, vegetarian, beginner]
- Pressure-cooker mashed potato. tags: [pressure-cooker, side, vegetarian, beginner]
- Pressure-cooker beetroot — 25 minutes. tags: [pressure-cooker, side, vegetarian, vegan, beginner]
- Pressure-cooker artichokes. tags: [pressure-cooker, side, vegetarian, vegan, beginner]
- Pressure-cooker corned beef. tags: [pressure-cooker, dinner, comfort-food, intermediate]
- Pressure-cooker yoghurt. tags: [pressure-cooker, breakfast, vegetarian, intermediate]
- Pressure-cooker bone-broth chicken soup. tags: [pressure-cooker, lunch, comfort-food, beginner]
- Pressure-cooker minestrone. tags: [pressure-cooker, lunch, vegetarian, vegan, freezable, beginner]
- Pressure-cooker French onion soup. tags: [pressure-cooker, lunch, vegetarian, beginner]
- Pressure-cooker split-pea soup. tags: [pressure-cooker, lunch, comfort-food, freezable, beginner]
- Pressure-cooker squash soup. tags: [pressure-cooker, lunch, autumn, vegetarian, vegan, beginner]
- Pressure-cooker lasagna soup. tags: [pressure-cooker, lunch, comfort-food, beginner]
- Pressure-cooker pho-style broth (Anglicised). tags: [pressure-cooker, dinner, weeknight, intermediate]
- Pressure-cooker congee — Anglicised rice porridge. tags: [pressure-cooker, breakfast, vegetarian, vegan, beginner]
- Pressure-cooker rice — base white. tags: [pressure-cooker, side, vegetarian, vegan, beginner]
- Pressure-cooker brown rice. tags: [pressure-cooker, side, vegetarian, vegan, beginner]
- Pressure-cooker quinoa. tags: [pressure-cooker, side, vegetarian, vegan, beginner]
- Pressure-cooker farro. tags: [pressure-cooker, side, vegetarian, vegan, beginner]
- Pressure-cooker poached salmon. tags: [pressure-cooker, dinner, weeknight, beginner]
- Pressure-cooker cheesecake — water-bath method. tags: [pressure-cooker, dessert, vegetarian, intermediate]
- Pressure-cooker bread pudding. tags: [pressure-cooker, dessert, vegetarian, beginner]
- Pressure-cooker apple sauce. tags: [pressure-cooker, side, autumn, vegetarian, vegan, beginner]
- Pressure-cooker poached pears. tags: [pressure-cooker, dessert, autumn, vegetarian, vegan, beginner]
- Pressure-cooker dulce de leche — condensed-milk method. tags: [pressure-cooker, dessert, vegetarian, beginner]

---

## Cross-cutting indices

Recipes can appear in more than one of these — they're navigation lists,
not new entries. The slugs / titles below should match an entry from the
cuisine, category, or method sections above. Indices help users find the
right thing on a Tuesday-night search and inform the homepage / category
page builds.

### Sunday roasts

- Roast beef sirloin
- Roast beef rib on the bone
- Roast leg of lamb
- Slow-roast shoulder of lamb
- Roast pork loin with crackling
- Roast pork belly
- Roast chicken
- Roast duck with orange
- Roast goose at Christmas
- Roast turkey
- Yorkshire puddings
- Toad in the hole
- Roast potatoes — duck fat
- Goose-fat roast potatoes
- Hasselback potatoes
- Honey-roast carrots and parsnips
- Cauliflower cheese
- Braised red cabbage
- Sage and onion stuffing
- Bread sauce
- Mint sauce
- Apple sauce
- Onion gravy
- Red-wine gravy
- Pigs in blankets
- Pommes boulangère
- Gigot d'agneau
- Cassoulet
- Slow-cooker lamb shoulder — seven-hour

### Weeknight dinners

- Spaghetti aglio, olio, e peperoncino
- Spaghetti carbonara
- Spaghetti al pomodoro
- Spaghetti al limone
- Penne all'arrabbiata
- Penne alla vodka
- Linguine al pesto
- Spaghetti and meatballs
- Tuna pasta bake
- Cheesy pasta bake
- Macaroni cheese
- Stovetop mac and cheese
- Chicken caesar salad
- Chicken pot pie
- Sausage and mash with caramelised onions
- Bangers and mash
- Toad in the hole
- Pork chops with cider and apples
- Lemon roast chicken pieces (pollo al limone)
- Chicken jalfrezi
- Chicken korma
- Stir-fry-style chicken in tomato (Italian pollo con peperoni)
- Sausage casserole
- Salmon en croûte (quick weeknight version)
- Air-fryer salmon fillet
- Air-fryer chicken thighs
- Air-fryer chicken breasts
- Sloppy joes
- Tortilla soup
- Tacos, beef
- Quesadilla, chicken and cheese
- Burger, classic cheeseburger
- Fish-finger sandwich
- Beans on toast
- Egg and chips
- Jacket potato with cheese and beans
- Spanish tortilla
- Frittata, vegetable
- Omelette aux fines herbes
- Couscous with chicken and chickpeas
- Pho-style broth
- Pressure-cooker shredded chicken

### Batch-cook and freezer

- Lasagne alla bolognese
- Vegetarian butternut lasagne
- Vegan lasagne
- Cannelloni di ricotta e spinaci
- Beef stew with herb dumplings
- Beef and Guinness stew
- Oxtail stew
- Lancashire hotpot
- Cassoulet
- Bigos
- Goulash
- Slow-cooker beef brisket
- Slow-cooker pulled pork
- Chicken-and-mushroom pie
- Cottage pie
- Shepherd's pie
- Vegan cottage pie
- Vegan lentil chilli
- Chili con carne
- Bolognese sauce
- Sausage casserole
- Chicken curry — base
- Chicken tikka masala
- Lamb rogan josh
- Vegetable curry
- Chickpea curry (chana masala)
- Dhal — tarka
- Minestrone
- Pasta e fagioli
- Ribollita
- Borscht
- Mulligatawny
- Harira
- Strawberry jam
- Marmalade
- Apple chutney
- Tomato passata

### Lunchbox

- Tuna pasta salad
- Pasta salad with pesto
- Pasta salad with chicken-and-sweetcorn
- Couscous salad with roasted vegetables
- Bulgur-and-herb salad
- Quinoa-and-roasted-vegetable salad
- Lentil-and-feta salad
- Tabbouleh
- Cobb salad
- Coronation chicken sandwich
- Cheese and pickle sandwich
- Egg and cress sandwich
- BLT
- Club sandwich
- Falafel wrap
- Chicken Caesar wrap
- Cornish pasty
- Cheese and onion pasty
- Beef and stilton pasty
- Sausage roll
- Vegetarian sausage roll
- Vegan sausage roll
- Frittata di pasta
- Scotch eggs
- Pork pie

### Kid-friendly

- Spaghetti bolognese
- Spaghetti and meatballs
- Macaroni cheese
- Cheesy pasta bake
- Tuna pasta bake
- Chicken nuggets — homemade
- Chicken tenders
- Air-fryer chicken nuggets
- Air-fryer fish fingers
- Air-fryer chicken tenders
- Fish-finger sandwich
- Beans on toast
- Toad in the hole
- Hunter's chicken
- Pizza margherita
- Cheese pizza
- Sloppy joes
- Sausage casserole
- Sausage and mash with caramelised onions
- Quesadilla, cheese
- Quesadilla, chicken and cheese
- Tacos, beef
- Buttermilk pancakes
- Banana pancakes
- Chocolate-chip cookies
- Cupcakes, vanilla
- Fairy cakes
- Butterfly cakes
- Banana milkshake
- Strawberry milkshake

### Christmas + festive

- Roast turkey
- Brined roast turkey
- Crown of turkey
- Roast goose at Christmas
- Roast ham with glaze
- Roast rib of beef
- Roast leg of lamb
- Roast pork loin with crackling
- Gammon with cider
- Beef Wellington
- Salmon en croûte
- Vegetarian Wellington
- Yorkshire puddings
- Sage and onion stuffing
- Chestnut and sausagemeat stuffing
- Pigs in blankets
- Braised red cabbage
- Honey-roast carrots and parsnips
- Roast potatoes (goose fat)
- Cranberry sauce
- Bread sauce
- Mince pies
- Christmas pudding
- Christmas cake
- Trifle (sherry)
- Christmas trifle with mince pies
- Stollen
- Bûche de Noël
- Mulled wine
- Mulled cider
- Sloe gin
- Damson gin
- Cassata siciliana
- Panettone
- Tortellini in brodo
- Cotechino con lenticchie
- Pastéis de nata
- Pavlova (winter, lemon-curd)

### Friday pizza night

- Pizza margherita
- Pizza marinara
- Pizza diavola
- Pizza quattro stagioni
- Pizza quattro formaggi
- Pizza prosciutto e funghi
- Pizza capricciosa
- Pizza salame piccante
- Pizza prosciutto e rucola
- Pizza tonno e cipolla
- Pizza ai frutti di mare
- Pizza al tartufo
- Pizza fritta
- Calzone
- New York pizza
- Detroit pizza
- Chicago deep-dish pizza
- Chicago thin-crust pizza
- Buffalo chicken pizza
- White pizza
- Hawaiian pizza
- Pizza dough — 24-hour slow-rise
- Pizza dough — same-day fast-rise
- Sourdough pizza dough
- Tarte flambée
- Pissaladière
- Pizza al taglio
- Pizza bianca
- Garlic bread, American-style
- Garlic knots
- Air-fryer pita pizza

### Curry night

- Chicken tikka masala
- Chicken korma
- Chicken jalfrezi
- Lamb rogan josh
- Lamb madras
- Lamb vindaloo
- Phaal
- Chicken pathia
- Chicken dopiaza
- Chicken passanda
- Chicken biryani
- Lamb biryani
- King prawn balti
- Beef Madras
- Onion bhaji
- Vegetable samosa
- Lamb samosa
- Bombay potato
- Saag aloo
- Saag paneer
- Tarka dhal
- Chana masala
- Aloo gobi
- Pilau rice
- Mushroom rice
- Peshwari naan
- Garlic naan
- Plain naan
- Raita
- Mango chutney
- Lime pickle

### Comfort food

- Cottage pie
- Shepherd's pie
- Lancashire hotpot
- Beef stew with dumplings
- Toad in the hole
- Bangers and mash
- Macaroni cheese
- Mac and cheese, baked
- Spaghetti bolognese
- Spaghetti carbonara
- Lasagne alla bolognese
- Risotto ai funghi porcini
- Steak and ale pie
- Steak and kidney pudding
- Chicken pot pie
- Chicken and dumplings
- Coq au vin
- Cassoulet
- Boeuf bourguignon
- French onion soup
- Sticky toffee pudding
- Treacle sponge pudding
- Bread-and-butter pudding
- Apple crumble
- Cinnamon rolls
- Hot chocolate
- Cullen skink
- Goulash
- Borscht
- Bigos
- Tartiflette
- Mac and cheese, lobster
- Chicken parmesan
- Beef stroganoff
- Pierogi ruskie
- Pasta e fagioli
- Ribollita

---

## Deferred to v2

These cuisines have huge depth but are out of scope for the initial
~2,000-recipe launch backlog. They get drafted as their own backlogs
once v1 is shipped and we have UK / global reader signal on what's
landing. Listed here so future sessions don't draft duplicates into
the current backlog.

### Cuisines deferred

- **Korean** — bulgogi, bibimbap, japchae, kimchi-based mains, K-fried-chicken canon, jjigae stews.
- **Vietnamese** — pho, bun cha, banh mi, summer rolls, caramel-braised mains, herb-heavy bowls.
- **Thai** — green / red / massaman / panang curries, pad thai, larb, tom yum, papaya salad.
- **Modern regional Japanese** — sushi, sashimi, ramen, donburi, izakaya plates. Western-Japanese basics that have landed in UK culture (katsu curry, teriyaki) sit in v1 under American or British curry-house.
- **Modern regional Indian** — South Indian (dosa, sambar, idli, rasam), modern Punjabi (paneer makhani, real-deal saag, real-deal biryani), modern Bengali (machher jhol, mishti doi), Gujarati, Kerala, Hyderabadi.
- **Modern regional Mexican** — proper mole, tlayudas, regional adobos. The Tex-Mex Anglicised mexican tradition lands in v1 under American.
- **Modern regional Latin American** — Peruvian (ceviche, lomo saltado), Brazilian (feijoada, moqueca), Argentine (asado, chimichurri-led plates).
- **Modern Chinese regional** — Sichuan, Cantonese, Hunan, Beijing. Anglo-Chinese takeaway-tradition dishes (sweet-and-sour, chow mein) may pull forward into v1 under British curry-house-equivalent.
- **Filipino** — adobo, sinigang, lumpia, kare-kare.
- **Indonesian, Malaysian, Singaporean** — nasi goreng, rendang, laksa, char kuey teow.
- **Ethiopian / Eritrean** — injera, doro wat, kitfo, shiro.
- **Senegalese / West African** — jollof, thieboudienne, peanut stew (one peanut-stew recipe sits in v1 under cross-cutting "soups", but the regional canon defers).
- **Modern Russian / Georgian / Armenian / Azerbaijani** — khachapuri, khinkali, dolma traditions outside the Levantine.

### Sub-cuisines / formats deferred

- **Modern fine-dining home-cook adaptations** — Heston / Adrià / Redzepi-style technique-led plates.
- **Modernist preservation** — sous-vide curing, equilibrium brines past basic ratios.
- **Plant-based "meat-replica" cookery** — Beyond / Impossible-style recipes. Where vegan variants of UK / UK-Italian / UK-curry-house dishes make sense they live as siblings to the parent dish. A standalone "vegan replica" canon defers.

### Pre-1928 cookbook source coverage to scout

Once v1 is in flight, mine these PD sources for blind spots:

- Mrs Beeton's `Book of Household Management` (1861, PG #10136) — already core.
- Eliza Acton's `Modern Cookery for Private Families` (1845, PD).
- Hannah Glasse's `The Art of Cookery Made Plain and Easy` (1747, PD).
- The Settlement Cook Book (1901, PD US).
- Fannie Farmer's `The Boston Cooking-School Cook Book` (1896, PD US).
- The White House Cook Book (1887, PD US).
- Escoffier's `Le Guide Culinaire` (1903, PD France).
- Brillat-Savarin's `Physiologie du goût` (1825, PD France).
- Pellegrino Artusi's `La scienza in cucina e l'arte di mangiar bene` (1891, PD Italy).
- USDA preservation guides (PD, perpetual).
- National Center for Home Food Preservation (NCHFP) at University of Georgia (PD, US extension service).
