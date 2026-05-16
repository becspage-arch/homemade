# Master ingredient list

Generated from `packages/db/scripts/data/ingredients.ts` — that file is the
source of truth, the database upsert reads it directly. Run
`pnpm --filter "@homemade/db" exec tsx scripts/generate-ingredient-master-md.ts`
to regenerate this view after editing.

Counts: 634 ingredients across 18 categories.

UK conventions throughout — "plain flour" not "all-purpose flour",
"coriander" not "cilantro". US and regional names live in the aliases column.

Dietary flags are per-ingredient; recipes AND-derive their own flags at
index time from the ingredients they use. Halal and kosher are not applied
at ingredient level — those depend on slaughter or certification context
and are set on the recipe by the author.

## Flours

26 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 00 flour | `00-flour` | doppio zero, tipo 00, pasta flour, pizza flour | g | vegetarian, vegan, dairyFree, nutFree | gluten | Italian flour grade; finely milled. Use the pasta grade for fresh pasta and the pizza grade (higher protein) for Neapolitan-style pizza. |
| Almond flour | `almond-flour` | ground almonds, almond meal | g | vegetarian, vegan, glutenFree, dairyFree | nuts | UK "ground almonds" usually means almond meal (skin off). US "almond flour" tends finer. |
| Brown rice flour | `brown-rice-flour` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Buckwheat flour | `buckwheat-flour` | sarrasin | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Not wheat — naturally gluten-free. Check the packet for cross-contamination if coeliac. |
| Chickpea flour | `chickpea-flour` | gram flour, besan | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Used for socca, pakoras, and as a binder in vegan cooking. |
| Coconut flour | `coconut-flour` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Highly absorbent — never swap 1:1 for wheat flour. Recipes are written specifically for it. |
| Cornflour | `cornflour` | cornstarch, arrowroot | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | UK "cornflour" = US "cornstarch". Not US "corn flour", which is finely milled cornmeal. |
| Einkorn flour | `einkorn-flour` | — | g | vegetarian, vegan, dairyFree, nutFree | gluten |  |
| Filo pastry | `filo-pastry` | phyllo pastry | sheet | vegetarian, vegan, dairyFree, nutFree | gluten | Paper-thin sheets. Keep covered with a damp cloth as you work — it dries fast. |
| Fine semolina | `fine-semolina` | semolina flour, rimacinata | g | vegetarian, vegan, dairyFree, nutFree | gluten |  |
| Khorasan flour | `khorasan-flour` | Kamut flour | g | vegetarian, vegan, dairyFree, nutFree | gluten |  |
| Masa harina | `masa-harina` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Nixtamalised corn flour for tortillas and tamales. Not polenta, not cornmeal — both will fail. |
| Oat flour | `oat-flour` | — | g | vegetarian, vegan, dairyFree, nutFree | — | Naturally gluten-free if certified — otherwise oats are often cross-contaminated. Not flagged glutenFree here for that reason. |
| Plain flour | `plain-flour` | all-purpose flour, AP flour | g | vegetarian, vegan, dairyFree, nutFree | gluten | UK plain flour is roughly equivalent to US AP flour. Slightly lower protein than US AP. |
| Polenta | `polenta` | cornmeal, maize meal | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Coarse-ground yellow corn. Buy quick-cook for weeknights, the slow kind for proper texture. |
| Puff pastry | `puff-pastry` | ready-rolled puff pastry | g | vegetarian, nutFree | gluten | Buy ready-made unless you have an afternoon. All-butter brands taste better. |
| Rice flour | `rice-flour` | white rice flour | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Rye flour | `rye-flour` | — | g | vegetarian, vegan, dairyFree, nutFree | gluten | Lower gluten than wheat; makes denser, sourer breads. |
| Self-raising flour | `self-raising-flour` | self-rising flour | g | vegetarian, vegan, dairyFree, nutFree | gluten | Plain flour with baking powder and salt added. Add 2 tsp baking powder + ½ tsp salt per 200 g plain flour to make your own. |
| Semolina | `semolina` | durum semolina | g | vegetarian, vegan, dairyFree, nutFree | gluten | Coarse durum wheat. Used for pasta, dusting pizza peels, and gnocchi alla romana. |
| Shortcrust pastry | `shortcrust-pastry` | — | g | vegetarian, nutFree | gluten | Buy ready-made or rub butter into flour 1:2 by weight, bind with cold water. |
| Spelt flour | `spelt-flour` | — | g | vegetarian, vegan, dairyFree, nutFree | gluten | Ancient wheat relative. Still contains gluten despite the "easier to digest" reputation. |
| Strong bread flour | `strong-bread-flour` | bread flour, high-protein flour | g | vegetarian, vegan, dairyFree, nutFree | gluten | Higher protein (12-14%) for gluten structure in bread. |
| Tapioca flour | `tapioca-flour` | tapioca starch | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Wholemeal bread flour | `wholemeal-bread-flour` | whole wheat bread flour | g | vegetarian, vegan, dairyFree, nutFree | gluten |  |
| Wholemeal flour | `wholemeal-flour` | whole wheat flour, wholewheat | g | vegetarian, vegan, dairyFree, nutFree | gluten |  |

## Dairy and eggs

46 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Almond milk | `almond-milk` | — | ml | vegetarian, vegan, dairyFree | nuts | Plant milk; the staple for dairy-free baking. Check for added sugar. |
| Brie | `brie` | — | g | vegetarian, glutenFree, nutFree | milk |  |
| Buttermilk | `buttermilk` | cultured buttermilk | ml | vegetarian, nutFree | milk | Make at a pinch: 250 ml milk + 1 tbsp lemon juice or white vinegar, rest 10 minutes. |
| Camembert | `camembert` | — | g | vegetarian, glutenFree, nutFree | milk |  |
| Cheddar | `cheddar` | mature cheddar, tasty cheese | g | vegetarian, glutenFree, nutFree | milk | British block cheese. "Mature" means aged for sharpness. |
| Clotted cream | `clotted-cream` | Cornish cream, Devon cream | g | vegetarian, glutenFree, nutFree | milk | ~55% fat. For scones with jam. |
| Comté | `comte` | comte | g | vegetarian, glutenFree, nutFree | milk |  |
| Condensed milk | `condensed-milk` | sweetened condensed milk | g | vegetarian, glutenFree, nutFree | milk | For caramel, fudge, banoffee pie. |
| Cottage cheese | `cottage-cheese` | — | g | vegetarian, glutenFree, nutFree | milk |  |
| Cream cheese | `cream-cheese` | soft cheese, Philadelphia | g | vegetarian, glutenFree, nutFree | milk | Philadelphia is the supermarket default in the UK. |
| Crème fraîche | `creme-fraiche` | — | g | vegetarian, glutenFree, nutFree | milk | Higher fat than soured cream so it won't split in a hot sauce. |
| Double cream | `double-cream` | heavy cream | ml | vegetarian, glutenFree, nutFree | milk | ~48% fat. Whips firm. US heavy cream is ~36% — closer to UK whipping than UK double. |
| Egg whites | `egg-whites` | — | each | vegetarian, glutenFree, dairyFree, nutFree | eggs | Roughly 33 g each from a large UK egg. Freeze leftovers up to 3 months. |
| Egg yolks | `egg-yolks` | — | each | vegetarian, glutenFree, dairyFree, nutFree | eggs | Roughly 18 g each from a large UK egg. |
| Eggs | `eggs` | hen eggs, chicken eggs | each | vegetarian, glutenFree, dairyFree, nutFree | eggs | Default is large free-range UK (~58 g). US "large" is ~57 g — close enough. |
| Emmental | `emmental` | Swiss cheese | g | vegetarian, glutenFree, nutFree | milk |  |
| Evaporated milk | `evaporated-milk` | — | ml | vegetarian, glutenFree, nutFree | milk | Unsweetened; reduces in fat from a fresh milk by about 60%. |
| Feta | `feta` | — | g | vegetarian, glutenFree, nutFree | milk | PDO Greek brined sheep's/goat's cheese. Vegetarian rennet. |
| Ghee | `ghee` | clarified butter | g | vegetarian, glutenFree, nutFree | milk | Cooked-out clarified butter. Higher smoke point than butter, lactose-very-low. |
| Goat's cheese | `goats-cheese` | chèvre | g | vegetarian, glutenFree, nutFree | milk |  |
| Gorgonzola | `gorgonzola` | — | g | vegetarian, glutenFree, nutFree | milk |  |
| Grana Padano | `grana-padano` | — | g | glutenFree, nutFree | milk | Younger, cheaper sibling of parmesan. Also rennet — not vegetarian unless labelled. |
| Greek yoghurt | `greek-yoghurt` | Greek yogurt, strained yoghurt | g | vegetarian, glutenFree, nutFree | milk | Strained. Full-fat unless stated. |
| Gruyère | `gruyere` | gruyere | g | vegetarian, glutenFree, nutFree | milk |  |
| Halloumi | `halloumi` | — | g | vegetarian, glutenFree, nutFree | milk | High-melt-point Cypriot cheese. Grills and fries without melting. |
| Mascarpone | `mascarpone` | — | g | vegetarian, glutenFree, nutFree | milk |  |
| Mozzarella | `mozzarella` | cow mozzarella | g | vegetarian, glutenFree, nutFree | milk | Cow-milk block mozzarella for pizza. Different beast from fresh buffalo. |
| Mozzarella di bufala | `mozzarella-di-bufala` | buffalo mozzarella, fresh mozzarella | g | vegetarian, glutenFree, nutFree | milk | Wet ball, water-packed. Tear, don't slice. |
| Oat milk | `oat-milk` | — | ml | vegetarian, vegan, dairyFree, nutFree | — | Plant milk; the barista versions foam best for coffee. |
| Paneer | `paneer` | — | g | vegetarian, glutenFree, nutFree | milk | Fresh Indian cheese. Doesn't melt — cubes hold their shape in curries. |
| Parmesan | `parmesan` | Parmigiano-Reggiano, parmigiano | g | glutenFree, nutFree | milk | Not vegetarian — made with animal rennet. Look for "vegetarian hard cheese" if you need that. |
| Pecorino Romano | `pecorino-romano` | pecorino | g | glutenFree, nutFree | milk | Sheep's-milk, saltier and punchier than parmesan. Animal rennet too. |
| Plain yoghurt | `plain-yoghurt` | plain yogurt, natural yoghurt | g | vegetarian, glutenFree, nutFree | milk |  |
| Red Leicester | `red-leicester` | — | g | vegetarian, glutenFree, nutFree | milk |  |
| Ricotta | `ricotta` | — | g | vegetarian, glutenFree, nutFree | milk | Drain in a sieve for 30 minutes before baking if the supermarket tub is wet. |
| Roquefort | `roquefort` | — | g | vegetarian, glutenFree, nutFree | milk |  |
| Salted butter | `salted-butter` | — | g | vegetarian, glutenFree, nutFree | milk | For spreading and sautéing. In baking, subtract a pinch of added salt per 100 g. |
| Semi-skimmed milk | `semi-skimmed-milk` | 2% milk, green-top milk | ml | vegetarian, nutFree | milk | ~1.7% fat. UK green-top, US ~2% reduced fat. |
| Single cream | `single-cream` | light cream, pouring cream | ml | vegetarian, glutenFree, nutFree | milk | ~18% fat. Won't whip. Will split if boiled. |
| Skimmed milk | `skimmed-milk` | skim milk, red-top milk, fat-free milk | ml | vegetarian, nutFree | milk |  |
| Soured cream | `soured-cream` | sour cream | g | vegetarian, glutenFree, nutFree | milk |  |
| Soya milk | `soya-milk` | soy milk | ml | vegetarian, vegan, dairyFree, nutFree | soybeans | Highest-protein plant milk. Curdles with acidic ingredients. |
| Stilton | `stilton` | blue stilton | g | vegetarian, glutenFree, nutFree | milk |  |
| Unsalted butter | `unsalted-butter` | sweet butter | g | vegetarian, glutenFree, nutFree | milk | Default for baking — lets you control salt independently. |
| Whipping cream | `whipping-cream` | — | ml | vegetarian, glutenFree, nutFree | milk | ~36% fat. Closest UK equivalent to US "heavy cream". |
| Whole milk | `whole-milk` | full-fat milk, blue-top milk | ml | vegetarian, nutFree | milk | ~3.5% fat. UK blue-top. |

## Meat

55 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Back bacon | `back-bacon` | rashers, Canadian bacon | g | glutenFree, dairyFree, nutFree | sulphites | British breakfast rashers. Closer to gammon than US bacon. |
| Beef brisket | `beef-brisket` | — | g | glutenFree, dairyFree, nutFree | — | For long slow roasts. Two muscles: flat (lean) and point (fattier). |
| Beef chuck | `beef-chuck` | chuck steak, braising steak | g | glutenFree, dairyFree, nutFree | — | UK "braising steak" is usually chuck. The cut for long stews. |
| Beef fillet | `beef-fillet` | filet mignon, tenderloin | g | glutenFree, dairyFree, nutFree | — | Leanest, tenderest cut. Cooks fast — don't overdo. |
| Beef mince | `beef-mince` | ground beef, minced beef | g | glutenFree, dairyFree, nutFree | — | 15-20% fat for burgers, 5-10% for bolognese-style sauces. |
| Beef rib of beef | `beef-rib` | fore rib, standing rib roast, prime rib | g | glutenFree, dairyFree, nutFree | — |  |
| Beef rump steak | `beef-rump` | rump | g | glutenFree, dairyFree, nutFree | — | UK rump ≈ US top sirloin. Lean, flavourful, needs careful cooking. |
| Beef shin | `beef-shin` | beef shank, osso buco cut | g | glutenFree, dairyFree, nutFree | — | Crossed-cut bone-in shin makes osso buco. |
| Beef sirloin | `beef-sirloin` | sirloin joint, striploin | g | glutenFree, dairyFree, nutFree | — | UK sirloin = US strip steak / striploin. UK "rump" ≠ US "sirloin". |
| Black pudding | `black-pudding` | blood pudding | g | dairyFree | gluten | Stornoway and Bury are the heritage British styles. Contains oatmeal — usually gluten-containing. |
| Boneless chicken thighs | `chicken-thighs-boneless` | skinless chicken thighs | each | glutenFree, dairyFree, nutFree | — | Skin and bone removed. More forgiving than breast — stays moist with longer cooking. |
| Chicken breast | `chicken-breast` | chicken supreme | each | glutenFree, dairyFree, nutFree | — |  |
| Chicken drumsticks | `chicken-drumsticks` | — | each | glutenFree, dairyFree, nutFree | — |  |
| Chicken livers | `chicken-livers` | — | g | glutenFree, dairyFree, nutFree | — | For pâté and ragù. Cook through to pink-just. |
| Chicken mince | `chicken-mince` | ground chicken | g | glutenFree, dairyFree, nutFree | — |  |
| Chicken thigh | `chicken-thigh` | — | each | glutenFree, dairyFree, nutFree | — | Bone-in skin-on for roasts; boneless for curries. |
| Chicken wings | `chicken-wings` | — | g | glutenFree, dairyFree, nutFree | — |  |
| Chorizo | `chorizo` | — | g | glutenFree, dairyFree, nutFree | sulphites | Spanish cured paprika sausage. Two main types: cooking (soft) and slicing (cured-firm). |
| Duck breast | `duck-breast` | magret | each | glutenFree, dairyFree, nutFree | — | Cold pan, skin-down, slow render — 8 minutes — then flip for 3. |
| Duck legs | `duck-legs` | — | each | glutenFree, dairyFree, nutFree | — | Slow-cook or confit. |
| Gammon | `gammon` | raw ham | g | glutenFree, dairyFree, nutFree | sulphites | Cured raw — needs cooking. Glaze for Christmas ham. |
| Guanciale | `guanciale` | — | g | glutenFree, dairyFree, nutFree | sulphites | Cured pork cheek. The proper fat for carbonara and amatriciana. |
| Ham hock | `ham-hock` | — | each | glutenFree, dairyFree, nutFree | sulphites | Smoked or fresh. Long simmer for pulled meat and stock. |
| Lamb leg | `lamb-leg` | leg of lamb | g | glutenFree, dairyFree, nutFree | — | Roast pink for a Sunday lunch; slow-cook for a shoulder-style finish. |
| Lamb mince | `lamb-mince` | ground lamb, minced lamb | g | glutenFree, dairyFree, nutFree | — |  |
| Lamb neck | `lamb-neck` | neck of lamb, middle neck | g | glutenFree, dairyFree, nutFree | — | Cheap, fatty, perfect for Lancashire hotpot. |
| Lamb shanks | `lamb-shanks` | — | each | glutenFree, dairyFree, nutFree | — | Bone-in stewing piece. One per person. |
| Lamb shoulder | `lamb-shoulder` | — | g | glutenFree, dairyFree, nutFree | — | Slow-roast cut. Seven hours at low temperature for pull-apart. |
| Lardons | `lardons` | bacon lardons, pancetta lardons | g | glutenFree, dairyFree, nutFree | — | Short cuts of cured pork belly, smoked or unsmoked. For quiche Lorraine and lentil dishes. |
| Merguez | `merguez` | — | each | glutenFree, dairyFree, nutFree | — | North African spiced lamb sausage. |
| Mutton | `mutton` | — | g | glutenFree, dairyFree, nutFree | — | Older sheep. Stronger flavour. Slow-cook. |
| Ox cheek | `ox-cheek` | beef cheek | g | glutenFree, dairyFree, nutFree | — | Cooks down to glossy, sticky strands in stew. Six-hour minimum braise. |
| Ox kidney | `ox-kidney` | beef kidney | g | glutenFree, dairyFree, nutFree | — | Soak in milk for an hour before cooking to mellow the iron. |
| Pancetta | `pancetta` | — | g | glutenFree, dairyFree, nutFree | sulphites | Italian cured pork belly. Cubed for soffritto. |
| Pheasant | `pheasant` | — | each | glutenFree, dairyFree, nutFree | — | In season October–February. Hens are plumper than cocks. |
| Pork belly | `pork-belly` | — | g | glutenFree, dairyFree, nutFree | — | Score the skin and dry overnight uncovered in the fridge for top crackling. |
| Pork loin | `pork-loin` | loin of pork | g | glutenFree, dairyFree, nutFree | — |  |
| Pork mince | `pork-mince` | ground pork, minced pork | g | glutenFree, dairyFree, nutFree | — |  |
| Pork ribs | `pork-ribs` | baby back ribs, spare ribs | g | glutenFree, dairyFree, nutFree | — |  |
| Pork sausages | `sausages-pork` | bangers, links | each | dairyFree | gluten | British sausages usually contain rusk (gluten). Check the label if coeliac. |
| Pork shoulder | `pork-shoulder` | Boston butt, pork butt | g | glutenFree, dairyFree, nutFree | — | For pulled pork and slow roasts. Skin-on for crackling. |
| Pork tenderloin | `pork-tenderloin` | pork fillet | g | glutenFree, dairyFree, nutFree | — |  |
| Prosciutto | `prosciutto` | prosciutto crudo, Parma ham | g | glutenFree, dairyFree, nutFree | — |  |
| Rabbit | `rabbit` | — | each | glutenFree, dairyFree, nutFree | — | Wild = stronger, farmed = milder. Slow-cook for stews. |
| Rack of lamb | `lamb-rack` | french-trimmed rack | each | glutenFree, dairyFree, nutFree | — | Eight ribs per rack, three to four per person. |
| Ribeye steak | `beef-ribeye` | rib-eye, scotch fillet | g | glutenFree, dairyFree, nutFree | — |  |
| Sausage meat | `sausage-meat` | pork sausage meat | g | dairyFree | gluten | Raw seasoned pork mince for sausage rolls, stuffing, and scotch eggs. Usually contains rusk (gluten). |
| Serrano ham | `serrano-ham` | jamón serrano | g | glutenFree, dairyFree, nutFree | — |  |
| Streaky bacon | `streaky-bacon` | American bacon, side bacon | g | glutenFree, dairyFree, nutFree | sulphites | UK streaky = US bacon. Cures crisp. |
| Turkey crown | `turkey-crown` | — | kg | glutenFree, dairyFree, nutFree | — | Boneless breast-only roast for smaller numbers. |
| Turkey mince | `turkey-mince` | ground turkey | g | glutenFree, dairyFree, nutFree | — |  |
| Venison | `venison` | — | g | glutenFree, dairyFree, nutFree | — | Lean, dark, gamey. Don't overcook — pink-medium for steaks and haunch. |
| Whole chicken | `chicken-whole` | roasting chicken | each | glutenFree, dairyFree, nutFree | — | Default 1.6 kg free-range bird serves four. |
| Whole duck | `duck-whole` | — | each | glutenFree, dairyFree, nutFree | — | Score the breast skin in a cross-hatch to render the fat. |
| Whole turkey | `turkey-whole` | — | kg | glutenFree, dairyFree, nutFree | — | Christmas centrepiece. Defrost properly — three days in the fridge for a 5 kg bird. |

## Fish and shellfish

30 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Anchovies | `anchovies` | — | each | glutenFree, dairyFree, nutFree | fish | Brown salted ones from Italy or Spain. Melt into sauces; the fishiness disappears. |
| Clams | `clams` | palourdes, vongole | g | glutenFree, dairyFree, nutFree | molluscs | Soak in salted water 30 minutes to spit out grit before cooking. |
| Cod fillet | `cod-fillet` | — | each | glutenFree, dairyFree, nutFree | fish | Look for MSC-certified. Flakes white-and-thick when cooked. |
| Cooked prawns | `prawns-cooked` | cooked shrimp | g | glutenFree, dairyFree, nutFree | crustaceans | Add at the end of cooking — they only need warming through. |
| Crab meat | `crab-meat` | white crab, brown crab | g | glutenFree, dairyFree, nutFree | crustaceans | White is delicate, brown is rich and intense. Mix for sandwiches. |
| Fresh sardines | `sardines-fresh` | pilchards | each | glutenFree, dairyFree, nutFree | fish | Grill whole, eat with bread. Three to four per person. |
| Haddock fillet | `haddock-fillet` | — | each | glutenFree, dairyFree, nutFree | fish |  |
| Herring | `herring` | — | each | glutenFree, dairyFree, nutFree | fish |  |
| King prawns | `king-prawns` | jumbo shrimp, tiger prawns | each | glutenFree, dairyFree, nutFree | crustaceans |  |
| Kippers | `kippers` | — | each | glutenFree, dairyFree, nutFree | fish | Cold-smoked herring. Manx and Craster are the heritage British styles. |
| Lobster | `lobster` | — | each | glutenFree, dairyFree, nutFree | crustaceans | Native UK lobster from May–October. Cooked weight ≈ live weight × 0.4. |
| Mackerel | `mackerel` | — | each | glutenFree, dairyFree, nutFree | fish | Oily, cheap, sustainable. Best the day landed. |
| Mussels | `mussels` | — | g | glutenFree, dairyFree, nutFree | molluscs | Scrub and debeard before cooking. Discard any that don't close when tapped. |
| Octopus | `octopus` | — | kg | glutenFree, dairyFree, nutFree | molluscs | Buy ready-poached if available; otherwise simmer two hours. |
| Pollock | `pollock` | saithe, coley | g | glutenFree, dairyFree, nutFree | fish | Sustainable, cheaper, works the same as cod. |
| Raw prawns | `prawns-raw` | raw shrimp | g | glutenFree, dairyFree, nutFree | crustaceans | Shell-on for prawn cocktails, peeled for stir-fries. |
| Salmon fillet | `salmon-fillet` | — | each | glutenFree, dairyFree, nutFree | fish | Buy farmed Scottish or wild Alaskan. Check skin is silver-bright and flesh firm. |
| Scallops | `scallops` | king scallops | each | glutenFree, dairyFree, nutFree | molluscs | Dive-caught, dry-packed. Pat dry, hot pan, ninety seconds a side. |
| Sea bass | `sea-bass` | branzino | each | glutenFree, dairyFree, nutFree | fish |  |
| Sea bream | `sea-bream` | orata, dorade | each | glutenFree, dairyFree, nutFree | fish |  |
| Smoked haddock | `smoked-haddock` | Arbroath smokies, finnan haddie | g | glutenFree, dairyFree, nutFree | fish | For kedgeree and Cullen skink. Avoid bright-yellow dyed — it's a dye, not a smoke. |
| Smoked mackerel | `smoked-mackerel` | — | g | glutenFree, dairyFree, nutFree | fish |  |
| Smoked salmon | `smoked-salmon` | lox | g | glutenFree, dairyFree, nutFree | fish | Scottish cold-smoked. Lox is the close US sibling. |
| Smoked trout | `smoked-trout` | — | g | glutenFree, dairyFree, nutFree | fish |  |
| Squid | `squid` | calamari | g | glutenFree, dairyFree, nutFree | molluscs | Either flash-fast (under two minutes) or long-slow (over thirty). Anything between turns rubber. |
| Tinned sardines | `sardines-tinned` | — | g | glutenFree, dairyFree, nutFree | fish |  |
| Tinned tuna | `tuna-tinned` | canned tuna | g | glutenFree, dairyFree, nutFree | fish | In olive oil for salads, in spring water for sandwiches. Pole-and-line on the label. |
| Trout fillet | `trout-fillet` | rainbow trout, sea trout | each | glutenFree, dairyFree, nutFree | fish |  |
| Tuna steak | `tuna-steak` | yellowfin tuna | each | glutenFree, dairyFree, nutFree | fish | Pole-and-line caught yellowfin only — sustainability matters here. |
| Whole salmon | `salmon-whole` | side of salmon | each | glutenFree, dairyFree, nutFree | fish |  |

## Vegetables

79 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Artichoke hearts | `artichoke-hearts` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Jarred in oil for salads and pizzas. |
| Asparagus | `asparagus` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | British season: late April to June. Snap the woody ends off where they break naturally. |
| Aubergine | `aubergine` | eggplant, brinjal | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | No need to salt modern varieties unless deep-frying. |
| Baby gem lettuce | `baby-gem` | little gem | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Beetroot | `beetroot` | beets | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Roast whole in foil with the skin on; rub off after. |
| Broad beans | `broad-beans` | fava beans | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Double-pod for the tender inner bean. |
| Broccoli | `broccoli` | calabrese | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Butternut squash | `butternut-squash` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Button mushrooms | `mushrooms-button` | white mushrooms | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Carrot | `carrot` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Cauliflower | `cauliflower` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Cavolo nero | `cavolo-nero` | black kale, Tuscan kale, lacinato | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Celeriac | `celeriac` | celery root | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | celery |  |
| Celery | `celery` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | celery | One of the soffritto trio. Allergen — flagged. |
| Chard | `chard` | Swiss chard, rainbow chard | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Stems take longer than leaves — slice stems first. |
| Cherry tomatoes | `cherry-tomatoes` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Chestnut mushrooms | `mushrooms-chestnut` | cremini | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Chestnut mushrooms | `chestnut-mushrooms` | cremini, brown cap mushrooms | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Cos lettuce | `cos-lettuce` | romaine | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Courgette | `courgette` | zucchini | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Courgette flowers | `courgette-flower` | zucchini flowers | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Stuff with ricotta and fry. Use the same day. |
| Cucumber | `cucumber` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Dried porcini | `mushrooms-porcini-dried` | ceps | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Soak in hot water — save the soaking liquid for the stock. |
| Fennel bulb | `fennel` | Florence fennel | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Save the fronds for garnish. |
| Frozen peas | `peas-frozen` | garden peas, petits pois | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Galangal | `galangal` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Thai cousin of ginger. Sharper, more piney. |
| Garlic | `garlic` | garlic bulb | clove | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | A "clove" is one segment of a bulb. New season UK garlic from June. |
| Ginger | `ginger-root` | fresh ginger, ginger root | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Peel with the edge of a teaspoon. |
| Globe artichoke | `globe-artichoke` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Green beans | `green-beans` | French beans, haricots verts | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Green chilli | `chilli-green` | green chili pepper | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Green pepper | `pepper-green` | green bell pepper | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Jalapeño | `jalapeno` | jalapeño | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Jerusalem artichoke | `jerusalem-artichoke` | sunchoke | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Kale | `kale` | curly kale | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Strip leaves from the tough stems before cooking. |
| Leek | `leek` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Slice and rinse in a colander — grit hides between the layers. |
| Lemongrass | `lemongrass` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Bash the white part flat with the back of a knife and slice fine. |
| Lettuce | `lettuce` | round lettuce, butterhead | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Mangetout | `mangetout` | snow peas | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Napa cabbage | `napa-cabbage` | Chinese leaf, wombok | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Okra | `okra` | ladies' fingers, bhindi | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Onion | `onion` | brown onion, yellow onion | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Default for cooking. ~150 g each. |
| Oyster mushrooms | `mushrooms-oyster` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Pak choi | `pak-choi` | bok choy | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Parsnip | `parsnip` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Sweeter after first frost. |
| Portobello mushrooms | `mushrooms-portobello` | portabella, field mushrooms | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Potato | `potato` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Maris Piper for roasting and chips; Charlotte for boiling; King Edward for mash. |
| Pumpkin | `pumpkin` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Cooking pumpkins (Crown Prince, Delica) beat Halloween jack-o-lanterns for flavour. |
| Purple sprouting broccoli | `purple-sprouting-broccoli` | PSB | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | February to April UK classic. |
| Radish | `radish` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Red cabbage | `cabbage-red` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Red chilli | `chilli-red` | red chili pepper | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Default supermarket UK red chilli is moderate-heat finger chilli. |
| Red onion | `red-onion` | Spanish onion | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Sharper raw, milder cooked. Default for salsas and quick-pickles. |
| Red pepper | `pepper-red` | red bell pepper, capsicum | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Rocket | `rocket` | arugula | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Runner beans | `runner-beans` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Allotment classic, July–September UK. |
| Samphire | `samphire` | marsh samphire | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Salty coastal vegetable for serving with fish. Don't add salt — there's plenty in the plant. |
| Savoy cabbage | `cabbage-savoy` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Scotch bonnet | `scotch-bonnet` | habanero | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Fruity Caribbean-style heat. Habanero is the closest swap. |
| Shallot | `shallot` | échalote | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Shiitake mushrooms | `mushrooms-shiitake` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Spinach | `spinach` | baby spinach | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Wilts to a tenth of its raw volume. |
| Spring greens | `spring-greens` | collard greens | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Spring onion | `spring-onion` | scallion, green onion | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Sugar snap peas | `sugar-snap-peas` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Swede | `swede` | rutabaga, neeps | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Scottish "neeps" for haggis night. US "rutabaga". |
| Sweet potato | `sweet-potato` | kumara | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Sweetcorn | `sweetcorn` | corn on the cob | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Tenderstem broccoli | `tenderstem` | broccolini | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Tinned sweetcorn | `sweetcorn-tinned` | canned corn | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Tinned tomatoes | `tinned-tomatoes` | canned tomatoes | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | San Marzano DOP if you can find them, plain Italian plums otherwise. |
| Tomato | `tomato` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Store at room temperature — fridge kills flavour. |
| Tomato passata | `tomato-passata` | strained tomatoes | ml | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Tomato purée | `tomato-puree` | tomato paste | tbsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | UK "tomato purée" = US "tomato paste" — the concentrated tube/tin. Not US "tomato puree" (which is closer to UK passata). |
| Turnip | `turnip` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Watercress | `watercress` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| White cabbage | `cabbage-white` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Default for coleslaw and sauerkraut. |
| Wild garlic | `wild-garlic` | ramsons, bear garlic | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Foraged leaves, March–May. Use leaves like spinach plus a garlic hit. |
| Yellow pepper | `pepper-yellow` | yellow bell pepper | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |

## Fruit

52 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Apricots | `apricots` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Avocado | `avocado` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Hass for cooking, smooth-skinned for slicing. |
| Banana | `banana` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Black-spotted overripe is best for banana bread. |
| Blackberries | `blackberries` | brambles | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Wild from late August through October. Pick before the first frost. |
| Blackcurrants | `blackcurrants` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | For cordial and jam — too tart raw. |
| Blood orange | `blood-orange` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Blueberries | `blueberries` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Bramley apple | `apple-bramley` | cooking apples | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | British cooking apple. Collapses to purée when stewed. |
| Cherries | `cherries` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | British Kent cherries June–July; Morello sour cherries best for cooking. |
| Clementine | `clementine` | satsuma, mandarin | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Coconut cream | `coconut-cream` | — | ml | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Coconut flakes | `coconut-flakes` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Coconut milk | `coconut-milk` | — | ml | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Full-fat tinned for curries. Don't shake the tin if you want to split the thick top off. |
| Conference pear | `pear-conference` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Long, slender variety. Best for tarts as it holds its shape when poached or baked. |
| Currants | `currants` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Small dried Zante currants. Not the same as fresh redcurrants. |
| Damsons | `damsons` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Wild plum cousin. Tart enough that they need cooking. |
| Desiccated coconut | `coconut-desiccated` | shredded coconut | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Desiccated coconut | `desiccated-coconut` | shredded coconut | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Unsweetened, finely shredded. |
| Dried apricots | `dried-apricots` | — | g | vegetarian, vegan, glutenFree, dairyFree | sulphites | Sulphured for bright orange — flagged as a sulphite allergen. |
| Dried blueberries | `dried-blueberries` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Dried cranberries | `dried-cranberries` | Craisins | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Often sweetened. Reads great in salads, granola, baking. |
| Dried currants | `dried-currants` | Zante currants | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Small dried Zante currants. For scones, fruit cakes, and buns. |
| Eating apple | `apple-eating` | dessert apples, Cox, Gala, Braeburn | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Figs | `figs` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Use within two days of buying. |
| Fresh coconut | `coconut-fresh` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Frozen mango | `mango-frozen` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Pre-cut chunks. For smoothies and quick sorbet. |
| Gooseberries | `gooseberries` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Grapefruit | `grapefruit` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Grapes | `grapes` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Lemon | `lemon` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Default for zest and juice. Buy unwaxed if zesting. |
| Lime | `lime` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Mango | `mango` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Alphonso (April–May) is the standout — short season. |
| Medjool dates | `dates-medjool` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Mixed frozen berries | `mixed-frozen-berries` | frozen berry mix | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Nectarines | `nectarines` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Orange | `orange` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Passion fruit | `passion-fruit` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Passion fruit purée | `passion-fruit-puree` | passionfruit pulp, passionfruit purée | ml | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Peaches | `peaches` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Pear | `pear` | Conference, Comice | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Pineapple | `pineapple` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Plums | `plums` | Victoria plums | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Pomegranate | `pomegranate` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Tap the skin with the back of a wooden spoon to release the seeds. |
| Prunes | `prunes` | dried plums | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Quince | `quince` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Inedible raw — needs cooking. For membrillo and jelly. |
| Raisins | `raisins` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Raspberries | `raspberries` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Redcurrants | `redcurrants` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Rhubarb | `rhubarb` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Forced (pink, January–March) and outdoor (red-green, April–July) are different beasts. |
| Seville orange | `seville-orange` | bitter orange, marmalade orange | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Bitter — for marmalade only. Six-week window in January. |
| Strawberries | `strawberries` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | British season May–August. Buy and eat the same day. |
| Sultanas | `sultanas` | golden raisins | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |

## Herbs

29 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Basil | `basil` | sweet basil | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Tear leaves at the last minute. Don't chop unless you have to. |
| Bay leaves | `bay-leaves` | — | leaf | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Fresh works best but dried keeps in the cupboard. Always fish them out before serving. |
| Chervil | `chervil` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Chinese chives | `chives-chinese` | garlic chives | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Chives | `chives` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Coriander | `coriander` | cilantro, Chinese parsley | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | UK "coriander" = US "cilantro" for the fresh leaves. The dried seed is "coriander seed" in both. |
| Curly parsley | `parsley-curly` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Curry leaves | `curry-leaves` | — | leaf | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Bloom in hot oil to release the aroma. Not curry powder — completely different. |
| Dill | `dill` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Dried oregano | `oregano-dried` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Stronger than fresh; halve the quantity. |
| Dried sage | `sage-dried` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | For stuffing and sausage rolls. Use half the quantity of fresh sage called for. |
| Dried thyme | `thyme-dried` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Use half the quantity of fresh thyme called for. |
| Fennel fronds | `fennel-fronds` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Flat-leaf parsley | `parsley-flat` | Italian parsley | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | More flavour than curly. Default for cooking. |
| Fresh oregano | `oregano-fresh` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Fresh thyme | `thyme-fresh` | thyme sprigs | sprig | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Lemon thyme | `lemon-thyme` | — | sprig | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Lovage | `lovage` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Garden herb with intense celery-and-anise flavour. |
| Makrut lime leaves | `kaffir-lime-leaves` | kaffir lime leaves | leaf | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Tear or fine-shred to release the oil. Freeze leftovers up to six months. |
| Marjoram | `marjoram` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Mint | `mint` | spearmint | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Spearmint is the default. Peppermint is for tea. |
| Pandan leaves | `pandan-leaves` | — | leaf | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Rosemary | `rosemary` | — | sprig | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | A sprig is roughly the length of an index finger. |
| Sage | `sage` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Shiso | `shiso` | perilla | leaf | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Sorrel | `sorrel` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Sharp lemon flavour. Wilts and collapses on heat — add at the end. |
| Tarragon | `tarragon` | French tarragon | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Russian tarragon is bitter — buy French. |
| Thai basil | `thai-basil` | holy basil | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Thyme | `thyme` | — | sprig | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |

## Spices

58 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Aleppo pepper | `aleppo-pepper` | pul biber | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Mild fruity Turkish/Syrian flake. Sweet warmth, not sharp heat. |
| Allspice | `allspice` | Jamaican pepper, pimento | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Ancho chilli | `ancho-chilli` | dried poblano | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Dark, raisin-y, mild Mexican dried chilli. Rehydrate in hot water. |
| Asafoetida | `asafoetida` | hing | pinch | vegan, vegetarian, dairyFree, nutFree | gluten | Sub for onion and garlic in Jain cooking. Often cut with wheat starch — check for gluten. |
| Baharat | `baharat` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Middle Eastern warm blend. Cinnamon-cardamom-clove backbone. |
| Black cardamom | `cardamom-black` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Smoky, savoury — not a swap for green. Use whole in slow-cooked curries. |
| Black mustard seeds | `mustard-seeds-black` | rai | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | mustard | Pop them in hot oil for South Indian tarka. |
| Black pepper | `black-pepper` | peppercorns | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Grind fresh — pre-ground loses its bite within weeks. |
| Caraway seeds | `caraway-seeds` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Cayenne pepper | `cayenne` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Celery salt | `celery-salt` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | celery |  |
| Chai spice blend | `chai-spice` | masala chai spice | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Cinnamon, cardamom, ginger, cloves, black pepper. Make your own or buy pre-mixed. |
| Chilli flakes | `chilli-flakes` | red pepper flakes, crushed chillies | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Chilli powder | `chilli-powder` | chili powder | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | UK chilli powder is pure dried chilli. US "chili powder" is usually a blend with cumin and oregano — different beast. |
| Chinese five spice | `chinese-five-spice` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Chipotle chilli | `chipotle` | smoked jalapeño | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Cinnamon stick | `cinnamon-stick` | cassia | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Most supermarket "cinnamon" is cassia. True cinnamon (Ceylon) is paler and more delicate. |
| Cloves | `cloves` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Whole into the bread sauce onion, ground into mincemeat. A little goes a long way. |
| Coriander seeds | `coriander-seeds` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Cumin seeds | `cumin-seeds` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Toast in a dry pan before grinding for the full flavour. |
| Curry powder | `curry-powder` | mild curry powder, Madras curry powder | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Anglo-Indian invention. Buy a brand you trust — quality varies hugely. |
| Dried fenugreek leaves | `fenugreek-leaves` | kasoori methi, kasuri methi | tbsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Crumble in at the end of a curry for the takeaway-style aroma. |
| Fennel seeds | `fennel-seeds` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Toast for sausage rubs and Italian fritto misto. |
| Fenugreek seeds | `fenugreek-seeds` | methi seeds | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Fine sea salt | `sea-salt-fine` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Garam masala | `garam-masala` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Stir in at the end of a curry — it's a finishing blend, not a base. |
| Garlic powder | `garlic-powder` | granulated garlic | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | For dry rubs and seasonings where fresh would burn. |
| Green cardamom | `cardamom-green` | cardamom pods | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Bash to crack, fish out before serving, or grind the seeds for baking. |
| Ground black pepper | `black-pepper-ground` | ground pepper, black pepper | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Ground cinnamon | `cinnamon-ground` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Ground coriander | `coriander-ground` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Ground cumin | `cumin-ground` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Ground ginger | `ginger-ground` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | For baking — gingerbread, parkin, biscuits. |
| Ground nutmeg | `nutmeg-ground` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Ground turmeric | `turmeric` | haldi | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Stains everything yellow. Bloom in fat first to mellow the raw edge. |
| Hot paprika | `paprika-hot` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Italian seasoning | `italian-seasoning` | dried mixed italian herbs, mixed italian herbs, italian herb blend | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Dried oregano, basil, thyme, rosemary blend. |
| Juniper berries | `juniper-berries` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | For game, sauerkraut, and brining pork. |
| Kosher salt | `kosher-salt` | — | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | US recipe staple. Diamond Crystal weighs roughly half what UK fine sea salt weighs by volume — use weight not volume. |
| Mace | `mace` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | The outer husk of nutmeg. Lighter and more floral than nutmeg itself. |
| MSG | `msg` | monosodium glutamate, Ajinomoto | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Pure umami. A pinch lifts savoury dishes; the long-debunked allergy panic was a myth. |
| Nigella seeds | `nigella-seeds` | kalonji, black onion seeds | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Old Bay | `old-bay` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Chesapeake seasoning for crab and seafood boils. |
| Onion powder | `onion-powder` | granulated onion | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Ras el hanout | `ras-el-hanout` | — | tbsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | North African house blend — up to 30 spices in the best examples. |
| Saffron | `saffron` | saffron strands | pinch | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Steep in warm water for ten minutes to extract the colour. |
| Sea salt flakes | `sea-salt-flakes` | Maldon, flaky salt | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | For finishing. Maldon is the British standard. |
| Sichuan pepper | `sichuan-pepper` | Szechuan pepper | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Numbing-tingly, not hot. Buy whole and toast. |
| Smoked paprika | `paprika-smoked` | pimentón, pimenton | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Spanish. Buy dulce (sweet) or picante (hot) by intent. |
| Star anise | `star-anise` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Sumac | `sumac` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Tart, fruity, deep crimson. Scatter at the end. |
| Sweet paprika | `paprika-sweet` | Hungarian paprika | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Table salt | `salt-table` | fine salt | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Vanilla pod | `vanilla-pod` | vanilla bean | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Split lengthways and scrape out the seeds with a knife tip. Pop the empty pod into sugar. |
| White pepper | `white-pepper` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | For pale sauces where black flecks show. |
| Whole nutmeg | `nutmeg-whole` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Grate fresh — the flavour fades fast once ground. |
| Yellow mustard seeds | `mustard-seeds-yellow` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | mustard | For pickling and tarka. |
| Za'atar | `za-atar` | zaatar | tbsp | vegetarian, vegan, dairyFree, nutFree | sesame | Levantine thyme-sumac-sesame mix. Often contains wheat — check the packet. |

## Condiments, sauces, and vinegars

50 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Anchovy paste | `anchovy-paste` | — | tsp | glutenFree, dairyFree, nutFree | fish |  |
| Apricot jam | `apricot-jam` | apricot preserve, apricot conserve | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Sieved and warmed, used as a glaze on cakes and to adhere fondant. |
| Balsamic glaze | `balsamic-glaze` | balsamic reduction | tbsp | vegetarian, vegan, dairyFree, nutFree | sulphites | Reduced balsamic vinegar, thicker and sweeter than the vinegar itself. For drizzling. |
| Balsamic vinegar | `balsamic-vinegar` | aceto balsamico | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | sulphites | Supermarket-grade is fine for dressings. Save aged tradizionale for finishing. |
| Beef stock | `stock-beef` | beef broth | ml | glutenFree, dairyFree, nutFree | — |  |
| Black olives | `olives-black` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Bouillon powder | `bouillon-powder` | Marigold bouillon | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Marigold Swiss Vegetable Bouillon is the British standard. |
| Brown sauce | `hp-sauce` | HP sauce, daddies sauce | tbsp | vegan, vegetarian, dairyFree, nutFree | gluten | British brown sauce. For bacon sandwiches. |
| Caesar dressing | `caesar-dressing` | — | ml | — | eggs | Classical Caesar contains anchovies and parmesan; vegan versions use cashew/miso. |
| Capers | `capers` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Salt-packed beat brine. Rinse before using. |
| Chicken stock | `stock-chicken` | chicken broth | ml | glutenFree, dairyFree, nutFree | — | Homemade beats a cube. The two-hour simmer is worth it. |
| Chicken stock | `chicken-stock` | chicken broth | ml | glutenFree, dairyFree, nutFree | — | Homemade beats a cube. |
| Cider vinegar | `cider-vinegar` | apple cider vinegar | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | sulphites |  |
| Cornichons | `cornichons` | — | each | vegan, vegetarian, glutenFree, dairyFree, nutFree | sulphites |  |
| Dark soy sauce | `soy-sauce-dark` | — | tbsp | vegan, vegetarian, dairyFree, nutFree | soybeans | Aged, thicker, less salty. For colour in stews and stir-fries. |
| Dijon mustard | `dijon-mustard` | — | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | mustard |  |
| Doubanjiang | `doubanjiang` | Pixian chilli bean paste | tbsp | vegan, vegetarian, dairyFree, nutFree | soybeans | Sichuan fermented broad bean and chilli paste. Backbone of mapo tofu. |
| English mustard | `english-mustard` | Colman's | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | mustard | Punchy heat. For ham and roast beef. |
| English mustard powder | `english-mustard-powder` | — | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | mustard | For cauliflower cheese, dressings, dry rubs. |
| Fish sauce | `fish-sauce` | nam pla, nuoc mam | tbsp | glutenFree, dairyFree, nutFree | fish | Thai or Vietnamese. Smells fierce, tastes magic. |
| Fish stock | `stock-fish` | fish fumet, fish broth | ml | glutenFree, dairyFree, nutFree | fish |  |
| Gherkins | `gherkins` | pickles | each | vegan, vegetarian, glutenFree, dairyFree, nutFree | sulphites |  |
| Gochujang | `gochujang` | — | tbsp | vegan, vegetarian, dairyFree, nutFree | soybeans | Korean fermented chilli paste. Most contain wheat — check the label. |
| Green olives | `olives-green` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Harissa | `harissa` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Tunisian chilli paste. Rose harissa is the Belazu standard. |
| Hoisin sauce | `hoisin-sauce` | — | tbsp | vegan, vegetarian, dairyFree, nutFree | soybeans | Sweet, dark, soy-based. For duck pancakes. |
| Kalamata olives | `olives-kalamata` | black olives | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Greek purple-black olive. For Greek salad and tapenade. |
| Light soy sauce | `soy-sauce-light` | shoyu | tbsp | vegan, vegetarian, dairyFree, nutFree | soybeans | For seasoning. Most contain wheat — buy tamari if coeliac. |
| Louisiana-style hot sauce | `louisiana-hot-sauce` | hot sauce, Tabasco, tabasco sauce | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Vinegar-based fermented-chilli hot sauce. |
| Malt vinegar | `malt-vinegar` | brown vinegar | ml | vegan, vegetarian, dairyFree, nutFree | gluten | For chips. Made from barley — contains gluten. |
| Marmite | `marmite` | — | tsp | vegan, vegetarian, dairyFree, nutFree | gluten | Yeast extract. Hidden umami in stews and gravies. |
| Mayonnaise | `mayonnaise` | mayo | tbsp | vegetarian, glutenFree, dairyFree, nutFree | eggs |  |
| Nutritional yeast | `nutritional-yeast` | nutritional yeast flakes, nooch | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Deactivated yeast flakes; savoury, cheesy, vegan parmesan stand-in. |
| Oyster sauce | `oyster-sauce` | — | tbsp | dairyFree, nutFree | molluscs | Most contain wheat. Vegetarian "mushroom oyster sauce" is the standard swap. |
| Raspberry jam | `raspberry-jam` | raspberry preserve | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For Swiss rolls, jammy dodgers, and Victoria sponges. |
| Red miso | `miso-red` | aka miso | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | soybeans | Longer-aged, saltier, deeper. For braises and aubergine glazes. |
| Red wine vinegar | `red-wine-vinegar` | — | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | sulphites |  |
| Rice vinegar | `rice-vinegar` | rice wine vinegar | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Mild and slightly sweet. Use the unseasoned kind for sushi rice — add sugar and salt yourself. |
| Sherry vinegar | `sherry-vinegar` | vinagre de Jerez | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | sulphites |  |
| Sriracha | `sriracha` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Stock cube | `stock-cube` | bouillon cube, OXO cube | each | — | — | Concentrated stock. One cube usually makes 500 ml of stock. |
| Sun-dried tomatoes | `sun-dried-tomatoes` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | sulphites | Buy in oil for direct use; dry for rehydrating. |
| Tahini | `tahini` | sesame paste | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | sesame | Lebanese or Palestinian brands tend to be smoother than industrial ones. Stir the oil back in before using. |
| Tamari | `tamari` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | soybeans | Japanese wheat-free soy. Coeliac-safe by default — but always check the label. |
| Tomato ketchup | `ketchup` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Vegetable stock | `stock-vegetable` | vegetable broth | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| White miso | `miso-white` | shiro miso | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | soybeans | Sweet, mild. The default for dressings. |
| White wine vinegar | `white-wine-vinegar` | — | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | sulphites |  |
| Wholegrain mustard | `wholegrain-mustard` | — | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | mustard |  |
| Worcestershire sauce | `worcestershire-sauce` | — | tsp | dairyFree, nutFree | fish | Contains anchovies — not vegetarian. Vegan versions exist. |

## Baking

33 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Agar agar | `agar-agar` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Vegan setting agent. Sets firmer than gelatine and stays set at room temperature. |
| Almond extract | `almond-extract` | — | tsp | vegan, vegetarian, glutenFree, dairyFree | nuts | A few drops is plenty. |
| Baking powder | `baking-powder` | — | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Two-action. Replace within a year of opening or the rise dies. |
| Bicarbonate of soda | `bicarbonate-of-soda` | baking soda, sodium bicarbonate | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Needs an acid (lemon, buttermilk, vinegar) to react. |
| Chocolate chips | `chocolate-chips` | — | g | vegetarian, glutenFree, nutFree | milk |  |
| Cocoa powder | `cocoa-powder` | unsweetened cocoa | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Dutch-process for darker cakes; natural for soda-bread brownies. |
| Cream of tartar | `cream-of-tartar` | potassium bitartrate | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Stabilises egg whites. For meringues and soda bread. |
| Custard powder | `custard-powder` | Birds custard powder | g | vegetarian, glutenFree, dairyFree, nutFree | — | Cornflour-based instant custard mix. |
| Dark chocolate | `dark-chocolate` | plain chocolate, bittersweet chocolate | g | vegan, vegetarian, glutenFree, nutFree | milk | 70% cocoa is the workhorse for baking. Check the label — most contains milk traces. |
| Dried yeast | `yeast-dried` | instant yeast, fast-action yeast | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Sachet = 7 g. Add direct to flour. UK fast-action ≈ US instant. |
| Fast-action dried yeast | `yeast-fast-action` | instant yeast, easy-blend yeast, active dry yeast, rapid yeast | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | The default supermarket yeast — 7 g sachets. 1 sachet = 14 g fresh yeast. |
| Fondant icing | `fondant-icing` | ready-to-roll icing | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Food colouring | `food-colouring` | gel food colour | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Gel beats liquid — won't water down icing or batter. |
| Fresh yeast | `yeast-fresh` | cake yeast | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Ask at the supermarket bakery counter — usually free. |
| Gelatine leaves | `gelatine-leaves` | leaf gelatin | sheet | glutenFree, dairyFree, nutFree | — | Soak in cold water until floppy; squeeze out before dissolving. |
| Glacé cherries | `glace-cherries` | candied cherries | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Rinse the syrup off and pat dry so they don't sink in a cake batter. |
| Glacé cherries | `cherries-glace` | candied cherries | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | For fruitcakes and bakewells. |
| Icing sugar | `icing-sugar` | powdered sugar, confectioner's sugar | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Sift before using — clumps are inevitable. |
| Marzipan | `marzipan` | — | g | vegan, vegetarian, glutenFree, dairyFree | nuts |  |
| Milk chocolate | `milk-chocolate` | — | g | vegetarian, glutenFree, nutFree | milk |  |
| Mincemeat | `mincemeat` | fruit mincemeat | g | vegetarian, nutFree | sulphites | Spiced dried-fruit and suet mix for mince pies. Modern jars use vegetable suet. |
| Mixed peel | `mixed-peel` | candied peel | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Mixed spice | `mixed-spice` | British mixed spice | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For mince pies, hot cross buns, simnel cake. Not the same as US pumpkin spice. |
| Orange blossom water | `orange-blossom-water` | — | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Pectin | `pectin` | jam sugar pectin | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For setting low-pectin fruit jams (strawberry, peach). High-pectin fruits like quince and apple don't need extra. |
| Powdered gelatine | `gelatine-powder` | — | g | glutenFree, dairyFree, nutFree | — | 1 sheet ≈ 2 g powder. |
| Pumpkin spice | `pumpkin-spice` | — | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | US blend leaning on cinnamon, ginger, nutmeg, clove. Not interchangeable with UK mixed spice. |
| Rose water | `rose-water` | — | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Sourdough starter | `sourdough-starter` | levain | g | vegan, vegetarian, dairyFree, nutFree | gluten | Wild-yeast wheat-flour culture. Feed weekly in the fridge, daily on the counter. |
| Vanilla bean paste | `vanilla-bean-paste` | vanilla paste | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Thick paste with visible seeds. One teaspoon equals one vanilla pod. |
| Vanilla extract | `vanilla-extract` | — | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Real extract, not "essence" — the latter is synthetic. |
| Vanilla paste | `vanilla-paste` | vanilla bean paste | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| White chocolate | `white-chocolate` | — | g | vegetarian, glutenFree, nutFree | milk |  |

## Pulses

21 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Baked beans | `baked-beans` | — | g | vegan, vegetarian, dairyFree, nutFree | gluten | Heinz is the UK default. On toast, for breakfast. |
| Black beans | `black-beans` | turtle beans | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For Cuban black bean soup and feijoada. |
| Black beluga lentils | `lentils-black-beluga` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Black-eyed beans | `black-eyed-beans` | black-eyed peas | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Borlotti beans | `borlotti-beans` | cranberry beans | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Brown lentils | `lentils-brown` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Butter beans | `butter-beans` | lima beans | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Big creamy. Brindisa jarred beats supermarket tins for texture. |
| Cannellini beans | `cannellini-beans` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Dried chickpeas | `chickpeas-dried` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Soak overnight with a pinch of bicarb for the best hummus. |
| Firm tofu | `tofu-firm` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | soybeans | Press for 30 minutes to drain before frying. |
| Green lentils | `lentils-green` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Green split peas | `split-peas-green` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Haricot beans | `haricot-beans` | navy beans | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For baked beans and cassoulet. |
| Kidney beans | `kidney-beans` | red kidney beans | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For chilli con carne. Always boil dried ones hard for 10 minutes to break down toxins. |
| Pinto beans | `pinto-beans` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For refried beans and Tex-Mex chilli. |
| Puy lentils | `puy-lentils` | French green lentils | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Hold their shape for salads and ragùs. |
| Red lentils | `red-lentils` | masoor dal | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Collapse to mush in 20 minutes. For dal and soups. |
| Silken tofu | `tofu-silken` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | soybeans | Custardy. For miso soup and Japanese desserts. |
| Tempeh | `tempeh` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | soybeans | Fermented soybean cake. Nuttier and firmer than tofu. |
| Tinned chickpeas | `chickpeas-tinned` | garbanzo beans | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Save the aquafaba for vegan baking. |
| Yellow split peas | `split-peas-yellow` | chana dal | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For dal and pease pudding. |

## Grains and pasta

44 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Arborio rice | `arborio-rice` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For risotto. Do not rinse. |
| Bagel | `bagel` | — | each | vegetarian, vegan, dairyFree, nutFree | gluten |  |
| Baguette | `baguette` | french bread, french stick | each | vegetarian, vegan, dairyFree, nutFree | gluten | French stick. About 250 g. |
| Basmati rice | `basmati-rice` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Rinse until the water runs clear. For Indian and Persian dishes. |
| Bread | `bread` | loaf | slice | vegan, vegetarian, dairyFree, nutFree | gluten | Bread is bread. Default is a white sandwich loaf for breadcrumbs. |
| Brown rice | `brown-rice` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | 40-minute cook time. Soak for an hour first to speed it up. |
| Bulgur wheat | `bulgur-wheat` | bulgar, cracked wheat | g | vegan, vegetarian, dairyFree, nutFree | gluten | For tabbouleh and kibbeh. |
| Caramelised biscuit | `caramelised-biscuit` | speculoos, Biscoff, Biscoff biscuit, Lotus biscuit, speculaas | each | vegetarian, vegan, dairyFree, nutFree | gluten | Belgian caramelised spiced biscuit. The Lotus Biscoff brand is the British supermarket default. |
| Carnaroli rice | `carnaroli-rice` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Higher amylose than arborio — more forgiving for risotto. |
| Chocolate sandwich biscuit | `chocolate-sandwich-biscuit` | Oreo, Oreos, cookies and cream biscuit | each | vegetarian, vegan, dairyFree, nutFree | gluten | Two dark chocolate biscuits sandwiching a white cream filling. The Oreo brand is the British supermarket default. |
| Corn tortilla | `corn-tortilla` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Smaller and stiffer than flour. Warm before serving so they bend without cracking. |
| Cornflakes | `cornflakes` | — | g | vegetarian, vegan, dairyFree, nutFree | — | For coatings and crispy toppings as well as breakfast. |
| Couscous | `couscous` | — | g | vegan, vegetarian, dairyFree, nutFree | gluten | Just pour boiling water over and cover for five minutes. |
| Croissant | `croissant` | — | each | vegetarian, nutFree | gluten |  |
| Digestive biscuit | `digestive-biscuit` | McVities digestive | each | vegetarian, nutFree | gluten | British biscuit base for cheesecakes and tarts. Close US equivalent: graham cracker. |
| Dried breadcrumbs | `breadcrumbs-dried` | — | g | vegan, vegetarian, dairyFree, nutFree | gluten |  |
| Dried pasta | `pasta-dried` | — | g | vegan, vegetarian, dairyFree, nutFree | gluten | Bronze-die for sauce-holding texture. De Cecco or Rummo are reliable supermarket choices. |
| Egg noodles | `noodles-egg` | — | g | vegetarian, dairyFree, nutFree | gluten |  |
| Fresh pasta | `pasta-fresh` | — | g | vegetarian, dairyFree, nutFree | gluten | Cook in 2-3 minutes. Egg-based — not vegan unless labelled. |
| Giant couscous | `giant-couscous` | mograbiah, pearl couscous | g | vegan, vegetarian, dairyFree, nutFree | gluten |  |
| Graham cracker | `graham-cracker` | — | each | vegetarian, nutFree | gluten | US biscuit base. UK equivalent: digestive biscuit. |
| Granola | `granola` | — | g | vegetarian, vegan, dairyFree | — | Toasted oat cereal with nuts and sweetener. Use the cinnamon or honey kind for breakfast bowls. |
| Jasmine rice | `jasmine-rice` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For Thai food. |
| Jumbo oats | `jumbo-oats` | — | g | vegan, vegetarian, dairyFree, nutFree | — | Bigger flakes. For granola and flapjacks. |
| Lasagne sheets | `lasagne-sheets` | lasagna sheets | sheet | vegan, vegetarian, dairyFree, nutFree | gluten |  |
| Long-grain rice | `long-grain-rice` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Muesli | `muesli` | — | g | vegetarian, vegan, dairyFree | — |  |
| Naan bread | `naan-bread` | naan | each | vegetarian, nutFree | gluten | Buttery Indian flatbread. |
| Paella rice | `paella-rice` | bomba rice, calasparra | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Short stubby Spanish rice. Absorbs three times its volume. |
| Panko breadcrumbs | `panko` | — | g | vegan, vegetarian, dairyFree, nutFree | gluten | Japanese-style flake. Crispier than regular dried crumbs. |
| Pearl barley | `pearl-barley` | — | g | vegan, vegetarian, dairyFree, nutFree | gluten | For Scotch broth and beef and barley stews. |
| Pitta bread | `pitta-bread` | pita bread | each | vegetarian, vegan, dairyFree, nutFree | gluten |  |
| Porridge oats | `porridge-oats` | rolled oats, old-fashioned oats | g | vegan, vegetarian, dairyFree, nutFree | — | Naturally gluten-free if certified — otherwise oats are often cross-contaminated. |
| Quinoa | `quinoa` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Rinse first to remove the bitter saponin coating. |
| Rice cake | `rice-cake` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Rice Krispies | `rice-krispies` | rice cereal, puffed rice cereal | g | vegetarian, vegan, dairyFree, nutFree | — |  |
| Rice noodles | `noodles-rice` | rice vermicelli | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Soak in just-boiled water, don't boil — they go gluey. |
| Rolled oats | `rolled-oats` | old-fashioned oats, oat flakes | g | vegan, vegetarian, dairyFree, nutFree | — | Steamed and rolled. For flapjacks, crumbles, and oat cookies. Gluten-free if certified. |
| Shortbread biscuit | `shortbread-biscuit` | — | each | vegetarian, nutFree | gluten |  |
| Soba noodles | `noodles-soba` | — | g | vegan, vegetarian, dairyFree, nutFree | gluten | Buckwheat — most brands also contain wheat. Check the label if coeliac. |
| Sushi rice | `sushi-rice` | short-grain Japanese rice | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Tortilla wrap | `tortilla-wrap` | flour tortilla, tortilla | each | vegetarian, vegan, dairyFree, nutFree | gluten | Soft flour tortillas for fajitas and wraps. |
| Udon noodles | `noodles-udon` | — | g | vegan, vegetarian, dairyFree, nutFree | gluten |  |
| Wild rice | `wild-rice` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |

## Nuts

16 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Almonds | `almonds` | — | g | vegan, vegetarian, glutenFree, dairyFree | nuts |  |
| Blanched almonds | `blanched-almonds` | — | g | vegan, vegetarian, glutenFree, dairyFree | nuts | Skin removed by blanching in boiling water. For nougat, marzipan, and Bakewell tart. |
| Brazil nuts | `brazil-nuts` | — | g | vegan, vegetarian, glutenFree, dairyFree | nuts |  |
| Cashews | `cashews` | — | g | vegan, vegetarian, glutenFree, dairyFree | nuts | Soak in boiling water for an hour to blend into vegan cream. |
| Chestnuts | `chestnuts` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Vacuum-packed cooked is fine — roasting fresh is a winter ritual but slow. |
| Cooked chestnuts | `chestnut-cooked` | vacuum-packed chestnuts | g | vegetarian, vegan, glutenFree, dairyFree | nuts | Vacuum-packed, ready to use. For stuffing and side dishes. |
| Flaked almonds | `almonds-flaked` | slivered almonds | g | vegan, vegetarian, glutenFree, dairyFree | nuts | Toast in a dry pan to bring out the flavour. |
| Flaked almonds | `flaked-almonds` | slivered almonds | g | vegan, vegetarian, glutenFree, dairyFree | nuts | For Dundee cake tops and tart decoration. Toast first. |
| Hazelnuts | `hazelnuts` | cobnuts, filberts | g | vegan, vegetarian, glutenFree, dairyFree | nuts | British cobnuts late August through October. |
| Macadamia nuts | `macadamia-nuts` | — | g | vegan, vegetarian, glutenFree, dairyFree | nuts |  |
| Peanut butter | `peanut-butter` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree | peanuts | For satay sauce and biscuits. Smooth or crunchy by recipe. |
| Peanuts | `peanuts` | groundnuts | g | vegan, vegetarian, glutenFree, dairyFree | peanuts | Technically a legume. Separate UK 14-allergen category from tree nuts. |
| Pecans | `pecans` | — | g | vegan, vegetarian, glutenFree, dairyFree | nuts |  |
| Pine nuts | `pine-nuts` | pignoli | g | vegan, vegetarian, glutenFree, dairyFree | nuts | Expensive but essential for pesto. Mediterranean ones beat Chinese. |
| Pistachios | `pistachios` | — | g | vegan, vegetarian, glutenFree, dairyFree | nuts | Sicilian Bronte or Iranian for baking — supermarket are often too salty. |
| Walnuts | `walnuts` | — | g | vegan, vegetarian, glutenFree, dairyFree | nuts |  |

## Seeds

10 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Black sesame seeds | `black-sesame-seeds` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | sesame |  |
| Chia seeds | `chia-seeds` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | 1 tbsp + 3 tbsp water = vegan egg replacement, rest 15 minutes. |
| Flaxseed | `flaxseed` | linseed | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Grind before use — whole passes through undigested. |
| Hemp seeds | `hemp-seeds` | hemp hearts | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Mixed seed blend | `caraway-seed-blend` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Mixed seeds | `mixed-seeds` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | sesame | Sunflower, pumpkin, sesame, linseed — for topping breads. |
| Poppy seeds | `poppy-seeds` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Pumpkin seeds | `pumpkin-seeds` | pepitas | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Sesame seeds | `sesame-seeds` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | sesame |  |
| Sunflower seeds | `sunflower-seeds` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |

## Oils and fats

14 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Beef dripping | `beef-dripping` | tallow | g | glutenFree, dairyFree, nutFree | — | The proper fat for roast potatoes and Yorkshire puddings. |
| Chilli oil | `chilli-oil` | rayu, chiu chow chilli oil | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Coconut oil | `coconut-oil` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Solid below ~25°C. For Sri Lankan and Caribbean cooking, and as a dairy-free fat in baking. |
| Cooking spray | `cooking-spray` | Frylight | ml | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Aerosol oil for greasing tins and pans. |
| Duck fat | `duck-fat` | goose fat | g | glutenFree, dairyFree, nutFree | — | Goose fat is the Christmas standard for roasties. Save the rendered fat from a duck roast. |
| Extra-virgin olive oil | `extra-virgin-olive-oil` | EVOO | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For dressing and finishing. Buy single-estate if you can. |
| Groundnut oil | `groundnut-oil` | peanut oil | ml | vegan, vegetarian, glutenFree, dairyFree | peanuts | High smoke point for deep-frying and stir-fries. |
| Lard | `lard` | pig fat | g | glutenFree, dairyFree, nutFree | — | For hot-water-crust pastry and the flakiest pie tops. |
| Olive oil | `olive-oil` | — | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For cooking. The basic refined kind, not extra-virgin. |
| Rapeseed oil | `rapeseed-oil` | canola oil | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | British equivalent of canola. High smoke point. |
| Sunflower oil | `sunflower-oil` | — | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Toasted sesame oil | `sesame-oil` | — | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | sesame | For finishing. Burns at high heat — don't fry in it. |
| Vegetable oil | `vegetable-oil` | — | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Usually rapeseed or a blend. For deep-frying. |
| Walnut oil | `walnut-oil` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree | nuts | For dressings only — burns at low heat. |

## Sweeteners

19 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Agave syrup | `agave-syrup` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Black treacle | `black-treacle` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | British. Less bitter than US blackstrap molasses. |
| Caster sugar | `caster-sugar` | superfine sugar | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Fine-grain white sugar. UK default for baking; in the US blitz granulated for a few seconds. |
| Dark brown sugar | `dark-brown-sugar` | soft dark brown sugar | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Dark muscovado sugar | `muscovado-dark` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Sticky, treacly. For Christmas cake and parkin. |
| Date syrup | `date-syrup` | silan | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Demerara sugar | `demerara-sugar` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Coarse golden crystals. For sprinkling on top of cakes and biscuits. |
| Dulce de leche | `dulce-de-leche` | boiled condensed milk, caramel sauce | g | vegetarian, glutenFree, nutFree | milk | Long-cooked condensed milk caramel. The Argentine version. |
| Glucose syrup | `glucose-syrup` | corn syrup, liquid glucose | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Prevents crystallisation in sugar work. Essential for nougat, marshmallows, and hard candies. |
| Golden syrup | `golden-syrup` | Lyle's golden syrup | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | British. Lyle's is the standard. For flapjacks and treacle tart. |
| Granulated sugar | `granulated-sugar` | white sugar | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For sweetening tea and coffee, jam-making, and crusts. |
| Honey | `honey` | — | tbsp | vegetarian, glutenFree, dairyFree, nutFree | — | Not vegan. UK supermarket honey is usually blended — local single-source for the real flavour. |
| Jam | `jam` | preserve, fruit preserve | g | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Any flavour. Strawberry, raspberry, apricot for baking. |
| Light brown sugar | `light-brown-sugar` | soft light brown sugar | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Light muscovado sugar | `light-muscovado-sugar` | unrefined light brown sugar | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Unrefined cane sugar with a delicate toffee flavour. Less treacly than dark muscovado. |
| Maple syrup | `maple-syrup` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Grade A amber is the everyday; Grade B darker for cooking. |
| Marshmallows | `marshmallows` | — | g | glutenFree, dairyFree, nutFree | — |  |
| Molasses | `molasses` | blackstrap molasses | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Soft brown sugar | `soft-brown-sugar` | soft brown sugar | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Moist soft sugar with a gentle molasses note. Light or dark depending on the brand. |

## Alcohol

28 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Amaretto | `amaretto` | Disaronno | tbsp | vegan, vegetarian, glutenFree, dairyFree | nuts | Almond-flavoured liqueur. For tiramisu and amaretti. |
| Beer | `beer` | ale | ml | vegan, vegetarian, dairyFree, nutFree | gluten | For batter and beef-and-ale pies. Most contain barley malt — gluten. |
| Brandy | `brandy` | cognac | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For flambéing and mincemeat. |
| Cointreau | `cointreau` | triple sec, orange liqueur | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For crêpes Suzette and Margarita. |
| Dark rum | `rum-dark` | — | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For Christmas cake, rum babas, jerk marinades. |
| Dry cider | `cider-dry` | — | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | sulphites | For pork and mussels Normandy-style. |
| Dry sherry | `sherry-dry` | fino, manzanilla | ml | glutenFree, dairyFree, nutFree | sulphites | For Spanish food and Chinese cooking. |
| Dry white wine | `white-wine-dry` | — | ml | glutenFree, dairyFree, nutFree | sulphites | For risotto and beurre blanc. Sauvignon blanc is reliable. |
| Gin | `gin` | — | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For curing salmon (gin and dill) and sloe gin. |
| Irish cream liqueur | `irish-cream-liqueur` | Baileys, Baileys Irish Cream | ml | vegetarian, glutenFree, nutFree | milk | Cream liqueur. Baileys is the supermarket default. |
| Irish whiskey | `irish-whiskey` | — | ml | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Kirsch | `kirsch` | — | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Cherry eau-de-vie. For fondue, Black Forest gâteau, cherry desserts. |
| Limoncello | `limoncello` | — | ml | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Italian lemon liqueur. Best served ice-cold. |
| Madeira | `fortified-madeira` | — | ml | glutenFree, dairyFree, nutFree | sulphites |  |
| Marsala wine | `fortified-marsala` | — | ml | glutenFree, dairyFree, nutFree | sulphites | For zabaglione and chicken Marsala. Buy dry (secco) for savoury, sweet (dolce) for puddings. |
| Mirin | `mirin` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Sweet Japanese rice wine for glazes and dipping sauces. |
| Passoã | `passoa` | passion fruit liqueur | ml | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Port | `port` | — | ml | glutenFree, dairyFree, nutFree | sulphites | Ruby for cooking, vintage for the cheese course. |
| Prosecco | `prosecco` | — | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | sulphites |  |
| Red wine | `red-wine` | — | ml | glutenFree, dairyFree, nutFree | sulphites | Cook with what you'd drink. Not always vegan — fining agents can be animal-derived. |
| Rosé wine | `rose-wine` | — | ml | glutenFree, dairyFree, nutFree | sulphites |  |
| Sake | `sake` | — | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Shaoxing wine | `shaoxing-wine` | Chinese rice wine | tbsp | vegan, vegetarian, dairyFree, nutFree | gluten | For Chinese cooking. Dry sherry is the standard supermarket swap. |
| Stout | `stout` | Guinness | ml | vegan, vegetarian, dairyFree, nutFree | gluten | For chocolate cake and beef stew. |
| Sweet sherry | `sherry-sweet` | Pedro Ximenez, PX | ml | glutenFree, dairyFree, nutFree | sulphites | Drizzle PX over vanilla ice cream. |
| Vodka | `vodka` | — | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For vodka cream pasta sauce and Bloody Marys. |
| Whisky | `whisky` | whiskey, scotch | ml | vegan, vegetarian, dairyFree, nutFree | gluten | For cranachan and Atholl brose. |
| White rum | `rum-white` | — | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |

## Other

24 entries.

| Name | Slug | Aliases | Unit | Dietary | Allergen | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Almond butter | `almond-butter` | — | g | vegetarian, vegan, glutenFree, dairyFree | nuts | Smooth or crunchy. Stir before using — the oil separates. |
| Apple juice | `apple-juice` | — | ml | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Bonito flakes | `bonito-flakes` | katsuobushi | g | glutenFree, dairyFree, nutFree | fish | For dashi. Steep, don't boil. |
| Caramelised biscuit spread | `caramelised-biscuit-spread` | Biscoff spread, Lotus spread, speculoos spread, cookie butter | g | vegetarian, vegan, dairyFree, nutFree | gluten | Spreadable caramelised biscuit paste. Lotus Biscoff is the British supermarket default. |
| Cashew butter | `cashew-butter` | — | g | vegetarian, vegan, glutenFree, dairyFree | nuts |  |
| Chestnut purée | `chestnut-puree` | sweetened chestnut spread, crème de marrons | g | vegetarian, vegan, glutenFree, dairyFree | nuts | Sweetened or unsweetened. For Mont Blanc, yule logs, baking. |
| Cola | `cola` | Coca-Cola, cherry cola | ml | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Espresso powder | `espresso-powder` | — | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | Concentrated coffee for baking and tiramisu. |
| Fresh horseradish | `horseradish-fresh` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Grate fresh — the heat dies within an hour. |
| Horseradish sauce | `horseradish-sauce` | — | tsp | vegetarian, glutenFree, nutFree | milk | For roast beef. |
| Ice | `ice` | ice cubes | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |
| Instant coffee | `coffee-instant` | coffee granules | tsp | vegetarian, vegan, glutenFree, dairyFree, nutFree | — | For mocha bakes and quick coffees. Espresso powder is stronger. |
| Kombu | `kombu` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For dashi. Wipe — don't rinse — before steeping. |
| Nori | `nori` | — | sheet | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Dried seaweed sheet for sushi. |
| Orange juice | `orange-juice` | — | ml | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Pineapple juice | `pineapple-juice` | — | ml | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Pomegranate molasses | `pomegranate-molasses` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Levantine staple. Sticky, sour, deep red. |
| Sparkling water | `sparkling-water` | fizzy water, soda water | ml | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Tamarind paste | `tamarind-paste` | — | tbsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | For pad Thai, sambar, Worcestershire-style sauces. |
| Tea bag | `tea-bag` | — | each | vegetarian, vegan, glutenFree, dairyFree, nutFree | — |  |
| Truffle paste | `truffle-paste` | — | tsp | vegetarian, glutenFree, dairyFree, nutFree | — | A spoonful is plenty. Check the label — many contain truffle "flavour" oil rather than real truffle. |
| Wakame | `wakame` | — | g | vegan, vegetarian, glutenFree, dairyFree, nutFree | — | Dried seaweed. Rehydrates to ten times its volume. |
| Wasabi paste | `wasabi` | — | tsp | vegan, vegetarian, glutenFree, dairyFree, nutFree | mustard | Supermarket "wasabi" is usually horseradish coloured green. Real wasabi is rare and expensive. |
| Water | `water` | — | ml | vegan, vegetarian, glutenFree, dairyFree, nutFree | — |  |

