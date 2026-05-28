/**
 * Batch rewrites for voice-retrofit-2026-05-28-batch18.
 *
 * For each entry, find the offending text inside the named JSON file and
 * replace it. Aborts on any miss so the worker can spot it.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../../..')
const dir = resolve(root, 'docs/voice-retrofit-2026-05-28-batch18')

interface Rewrite {
  slug: string
  from: string
  to: string
}

const rewrites: Rewrite[] = [
  {
    slug: 'two-voices-on-the-same-budget-activity',
    from: 'Original to homemade.education. Draws on relationship-therapy literature on financial conflict and the \\"speaker / listener\\" structured-dialogue model used in couples work.',
    to: 'Original to homemade.education. It draws on therapy work about money conflict in relationships, and on the \\"speaker / listener\\" turn-taking model used in couples work.',
  },
  {
    slug: 'ultimate-spaghetti-carbonara',
    from: 'Add them to a powerful blender together with the hot water, nutritional yeast, mustard, garlic, turmeric, onion powder and black salt.',
    to: 'Add them to a strong blender. Pour in the hot water, nutritional yeast, mustard, garlic, turmeric, onion powder, and black salt.',
  },
  {
    slug: 'vaca-frita',
    from: 'Vaca frita works on a simple principle: boil the beef until it can be shredded easily, then fry the shredded strands as hard as possible until they are crisp and dark at the edges. The two-stage process takes patience but the result is crunchy beef with caramelised edges and tender interior fibres, one of the better things in Cuban cooking.',
    to: 'Vaca frita works in two steps. Boil the beef until it pulls apart in shreds. Then fry the shreds hard until they are crisp and dark at the edges. The two steps take patience. The result is crunchy beef with caramelised edges and tender meat inside, one of the best things in Cuban cooking.',
  },
  {
    slug: 'vanessa-s-quiche',
    from: 'Vegetarian: swap meat for roasted Mediterranean vegetables (courgette, pepper, aubergine) and crumbled feta.',
    to: 'Vegetarian: swap the meat for roasted veg (courgette, pepper, aubergine) and crumbled feta.',
  },
  {
    slug: 'vanilla-ice-cream',
    from: "Custard-based vanilla ice cream follows the French tradition of glace à la vanille, where a cooked anglaise base is churned to produce a rich, smooth frozen cream. The French technique became the international standard for premium ice cream in the nineteenth and twentieth centuries, adopted by Italian gelaterie, British dairy ice cream producers, and American artisan makers alike. The vanilla pod itself became the quality marker that distinguishes custard-based ice cream from the artificially flavoured alternatives. The vanilla used in this recipe should have visible seeds, what cooks often call 'real vanilla'.",
    to: "Custard-based vanilla ice cream follows the French tradition of glace à la vanille. A cooked custard base is churned into a rich, smooth frozen cream. The method became the standard for fine ice cream in the nineteenth and twentieth centuries, taken up by Italian gelaterie, British dairy makers, and American small-batch makers. The vanilla pod itself became the mark of quality that sets custard-based ice cream apart from the fake-flavour kind. The vanilla here should show its seeds, what cooks call 'real vanilla'.",
  },
  {
    slug: 'vareniki',
    from: 'Vareniki dough is made with boiling water rather than egg and soured cream, which produces a softer, more pliable result that is slightly easier to seal than the Polish pierogi dough. The filling is plain: potato mashed with caramelised onion, seasoned assertively. The fried onion served on top is what ties everything together, its sweetness and char against the neutral potato filling is the flavour contrast that makes this dish work.',
    to: 'Vareniki dough is made with boiling water instead of egg and soured cream. That gives a softer, more flexible result, a touch easier to seal than the Polish pierogi dough. The filling is plain: mashed potato with caramelised onion, seasoned well. The fried onion on top is what ties it together. Its sweetness and char against the plain potato is the flavour contrast that makes the dish work.',
  },
  {
    slug: 'vareniki',
    from: 'Vareniki are central to Ukrainian food culture in a way that goes beyond recipe. They appear in literature, folklore, and the national imagination as a symbol of home cooking and domestic comfort. They are made at family gatherings, at Christmas (for the sweet cherry version), and on ordinary weeknights when something filling is needed. The fried onion on top is not a garnish but a structural part of the dish: the caramelised sweetness against the bland potato and sour cream is the combination that defines the flavour.',
    to: 'Vareniki are central to Ukrainian food culture in a way that goes past any recipe. They show up in stories, folklore, and the national mind as a symbol of home cooking and comfort. They are made at family gatherings, at Christmas (for the sweet cherry version), and on weeknights when something filling is needed. The fried onion on top is not a garnish but part of the dish. The caramelised sweetness against the plain potato and sour cream is the mix that defines the flavour.',
  },
  {
    slug: 'veal-paprikash',
    from: 'Paprikás borjú sits in the same family as chicken paprikash but comes out lighter in flavour because veal, with its mild, milky character, lets the paprika come through without the richer fat and bone flavour of chicken thighs. You get a sauce that is almost coral in colour, vivid and fragrant, with pieces of veal that have braised down to a yielding tenderness over an hour on the hob.',
    to: 'Paprikás borjú sits in the same family as chicken paprikash, but comes out lighter. Veal is mild and milky, so the paprika comes through clean, without the richer fat and bone notes of chicken thighs. You get a sauce that is almost coral in colour, bright and aromatic. The veal braises down to a tender give over an hour on the hob.',
  },
  {
    slug: 'veal-paprikash',
    from: "Paprikás is one of the definitive preparations of the Hungarian kitchen, built around the country's most important spice export. The sweet paprika grown around Kalocsa and Szeged in southern Hungary has a gentle, rounded fruitiness distinct from the smoked Spanish variety. Veal paprikash appears on the menus of the grand old restaurants of Budapest (Gundel especially) but it is also a straightforward family dish, cooked throughout the week across central Hungary and in the Hungarian diaspora communities of Slovakia, Romania, and Austria.",
    to: "Paprikás is one of the core dishes of the Hungarian kitchen. It is built around the country's most important spice export. The sweet paprika grown around Kalocsa and Szeged in southern Hungary has a gentle, rounded fruitiness, different from the smoked Spanish kind. Veal paprikash sits on the menus of the grand old Budapest restaurants (Gundel especially), but it is also an everyday family dish. It is cooked through the week across central Hungary and in the Hungarian communities of Slovakia, Romania, and Austria.",
  },
  {
    slug: 'vegetable-frittata',
    from: 'The frittata sits in Italian cooking as the practical egg preparation: it uses whatever is available, scales up or down without adjustment, and serves equally well at breakfast, lunch, or supper. The fact that it is better at room temperature than hot makes it useful for occasions when timing is uncertain. Spanish tortilla, Persian kuku sabzi, and North African shakshuka occupy similar roles in their respective cuisines, the frittata is Britain\\u2019s adopted version of the concept, now common enough to appear on café menus and packed lunches across the country.',
    to: 'The frittata is the practical egg dish in Italian cooking. It uses whatever is to hand, scales up or down without fuss, and works at breakfast, lunch, or supper. It is better at room temperature than hot, which makes it useful when the timing is not fixed. Spanish tortilla, Persian kuku sabzi, and North African shakshuka fill the same role in their cuisines. The frittata is Britain\\u2019s adopted version of the idea, common enough now to show up on café menus and packed lunches across the country.',
  },
  {
    slug: 'vegetable-samosa',
    from: 'The vegetable samosa is the standard vegetarian starter across British Indian restaurants, appearing alongside onion bhaji as the starter pairing of the traditional curry-house meal. Making samosas at home involves more work than most curry-house dishes (the folding and sealing requires patience) but the result is noticeably fresher than shop-bought versions. The freeze-and-fry-from-frozen method means the labour is not required on the same day as serving.',
    to: 'The vegetable samosa is the standard vegetarian starter at British Indian restaurants. It sits alongside onion bhaji as the starter pair of the classic curry-house meal. Making samosas at home takes more work than most curry-house dishes. The folding and sealing want some patience, but the result is much fresher than shop-bought. The freeze-and-fry-from-frozen method means the work is not needed on the day you serve them.',
  },
  {
    slug: 'vegetarian-kedgeree',
    from: 'A spoon of single cream folded in just before serving turns the dish richer; not Beeton-era but a kitchen-friendly variant.',
    to: 'A spoon of single cream folded in just before serving turns the dish richer; not from the Victorian household manual by Mrs Beeton, but a kitchen-friendly twist.',
  },
  {
    slug: 'vegetarian-kedgeree',
    from: "Kedgeree is one of the central dishes of the Anglo-Indian breakfast canon; alongside devilled kidneys, kippers, and mulligatawny, the dishes that returning colonial families brought back to Britain and folded into Victorian breakfast spreads. Mrs Beeton's 1861 Book of Household Management gives a kedgeree close to the smoked-fish version; earlier British cookery manuals have plainer versions closer to the Indian khichdi original.",
    to: "Kedgeree is one of the central dishes of the Anglo-Indian breakfast canon. It sits alongside devilled kidneys, kippers, and mulligatawny: the dishes that returning colonial families brought back to Britain and folded into Victorian breakfast spreads. The Victorian cookery manual by Mrs Beeton (1861) gives a kedgeree close to the smoked-fish version. Earlier British cookery manuals have plainer versions, closer to the Indian khichdi original.",
  },
  {
    slug: 'vegetarian-kedgeree',
    from: 'Modern British kedgeree drifted from breakfast to brunch over the twentieth century, and the dish appears on Sunday menus across the country alongside eggs Benedict and full English plates. The vegetarian version reads as a quieter cousin: the same gentle spice, the same fluffy rice, with the eggs alone carrying the protein where smoked haddock once led.',
    to: 'Modern British kedgeree drifted from breakfast to brunch over the twentieth century. The dish now turns up on Sunday menus across the country alongside eggs Benedict and full English plates. The vegetarian version reads as a quieter cousin: the same gentle spice, the same fluffy rice, with the eggs alone carrying the protein where smoked haddock once led.',
  },
  {
    slug: 'vegetarian-mulligatawny',
    from: 'Mulligatawny began as milagu tannir (pepper water), a thin, sour, deeply spiced broth from Tamil Nadu that was used as a digestive and condiment. British colonial officers adopted it, thickened it with lentils and meat, sweetened it with apple and onion, and sent it home to England as the defining soup of the Anglo-Indian table. By the nineteenth century it appeared in every British cookery book and club menu, often bearing only a distant resemblance to the original.',
    to: 'Mulligatawny began as milagu tannir (pepper water), a thin, sour, well-spiced broth from Tamil Nadu used as a digestive and a condiment. British colonial officers picked it up, thickened it with lentils and meat, sweetened it with apple and onion, and sent it home to England as the main soup of the Anglo-Indian table. By the nineteenth century it was in every British cookery book and club menu, often a long way from the original.',
  },
  {
    slug: 'vegetarian-mulligatawny',
    from: "This version is vegetarian and leans closer to the soup's southern Indian origins: red lentils for body, a spiced base of onion, carrot, and apple, coconut milk for richness, and enough acidity from lemon to sharpen the finish. It is faster and lighter than the chicken or lamb variants and works equally well as a starter or a bowl with bread.",
    to: "This version is vegetarian and leans closer to the soup's southern Indian roots. Red lentils give it body. A spiced base of onion, carrot, and apple builds the flavour. Coconut milk adds richness. Lemon sharpens the finish. It is faster and lighter than the chicken or lamb kind, and works as a starter or as a bowl with bread.",
  },
  {
    slug: 'vegetarian-mulligatawny',
    from: 'Mulligatawny was the great Anglo-Indian import to the Victorian table and the first curry many British people ever tasted, encountered in club dining rooms and middle-class households throughout the nineteenth century. It appears in every major Victorian cookery manual, from Mrs Beeton onwards, usually with a meat component added. The vegetarian version reclaims something of the original Tamil pepper-water tradition, which was meatless and intended as a digestive, before it was enriched and Anglicised into the thick soup familiar today.',
    to: 'Mulligatawny was the great Anglo-Indian import to the Victorian table. It was the first curry many British people ever tasted, served in club dining rooms and middle-class homes through the nineteenth century. It appears in every major Victorian cookery manual, from Mrs Beeton onwards, usually with meat added. The vegetarian version goes back closer to the Tamil pepper-water root, which was meatless and meant as a digestive, before it was enriched and turned into the thick British soup of today.',
  },
  {
    slug: 'veggie-full-english',
    from: 'The full English is a nineteenth-century construction built around the idea that breakfast should be substantial enough to sustain physical labour until the evening. The vegetarian version shares the same principle without the meat, and works because eggs, toast, beans, and roasted vegetables already provide the protein and satisfaction the meal is built around. Portobello mushrooms became the standard meat substitute because their flavour deepens with heat in a way that raw mushrooms do not.',
    to: 'The full English is a nineteenth-century plate, built around the idea that breakfast should be filling enough to last a working day. The vegetarian version keeps the same idea without the meat. It works because eggs, toast, beans, and roasted vegetables already give the protein and the staying power the meal is built around. Portobello mushrooms became the usual meat swap because their flavour deepens with heat in a way raw mushrooms do not.',
  },
  {
    slug: 'vinaigrette-salad',
    from: 'Vinegret is one of the great salads of the Russian table, simple in construction, striking in colour, and much improved by being made the day before. The word comes from the French vinaigrette, but the dish is unmistakably Russian in composition: boiled root vegetables, sauerkraut, pickled cucumber, and a dressing of sunflower oil and vinegar that ties the earthiness of the beetroot and potato together with the sharpness of the fermented vegetables.',
    to: "Vinegret is one of the great salads of the Russian table. It is simple to make, striking in colour, and much better the day after. The word comes from the French vinaigrette, but the dish is plainly Russian in its mix: boiled root veg, sauerkraut, pickled cucumber, and a dressing of sunflower oil and vinegar. The oil and vinegar tie the earthy beetroot and potato to the sharp fermented veg.",
  },
  {
    slug: 'vinaigrette-salad',
    from: "Vinegret appears at the Russian table in virtually every context: as part of the zakuski spread before a formal dinner, as an everyday lunch dish, and as a standard offering at the New Year's table alongside Olivier salad and herring under a fur coat. Elena Molokhovets, whose cookbook guided Russian middle-class households through the second half of the nineteenth century, includes several variations on the boiled-root-and-pickle salad. The version most familiar today (beetroot, potato, carrot, sauerkraut, onion) has been more or less stable since then.",
    to: "Vinegret turns up at the Russian table in almost every setting: as part of the zakuski spread before a formal dinner, as an everyday lunch, and as a fixture at the New Year's table next to Olivier salad and herring under a fur coat. Elena Molokhovets, whose cookbook guided Russian middle-class homes through the second half of the nineteenth century, gives several versions of the boiled-root-and-pickle salad. The version known today (beetroot, potato, carrot, sauerkraut, onion) has been more or less stable since then.",
  },
  {
    slug: 'vindaloo-chicken',
    from: 'Chicken vindaloo developed alongside the pork original as a version accessible to communities that do not eat pork, and it became standard on British Indian restaurant menus from the 1970s onwards. In Goa today both pork and chicken versions are common, though the pork dish retains its place as the original and the most culturally significant version. The chicken variant has the advantage of a much shorter cook time and is the more practical option on a weeknight.',
    to: 'Chicken vindaloo grew up alongside the pork original as a version for people who do not eat pork. It became standard on British Indian restaurant menus from the 1970s onwards. In Goa today both pork and chicken versions are common, though the pork dish stays the original and the more meaningful one. The chicken version has a much shorter cook time and is the more workable option on a weeknight.',
  },
  {
    slug: 'vindaloo',
    from: 'The paste is made by grinding dried chillies, garlic, and spices with red wine vinegar (a practical substitute for the original palm vinegar) into a thick, brick-red paste. The pork marinates in this for at least two hours, then braises covered with a small amount of water until the meat is tender and the sauce has reduced to coat it.',
    to: 'The paste is made by grinding dried chillies, garlic, and spices with red wine vinegar (a good stand-in for the original palm vinegar) into a thick, brick-red paste. The pork sits in this for at least two hours, then braises covered with a little water until the meat is tender and the sauce has reduced to coat it.',
  },
  {
    slug: 'vindaloo',
    from: 'Vindaloo is one of the clearest examples of colonial food exchange: a Portuguese preservation method (meat marinated in wine and garlic to extend its life at sea) adopted by Goan cooks, spiced with ingredients the Portuguese had themselves introduced to India, and returned to Europe as something entirely transformed. British troops stationed in Goa encountered it in the nineteenth century, and it travelled home with Anglo-Indian households and later with the first wave of Goan migrants to Britain. By the 1970s it had become a benchmark of British curry-house heat, a reputation that has overshadowed its original character as a sour and complex braise.',
    to: 'Vindaloo is one of the clearest examples of colonial food exchange. A Portuguese keeping method (meat in wine and garlic to last at sea) was taken up by Goan cooks, spiced with ingredients the Portuguese had themselves brought to India, and sent back to Europe as something else entirely. British troops in Goa came across it in the nineteenth century. It travelled home with Anglo-Indian families and later with the first wave of Goan migrants to Britain. By the 1970s it had become a marker of British curry-house heat, a reputation that has overshadowed its first character as a sour and layered braise.',
  },
  {
    slug: 'visible-is-safe-visible-is-allowed',
    from: 'A two-sentence affirmation from Day 18 of the MONEY program. It targets the deeply ingrained pattern of making yourself invisible around money: keeping wins quiet, avoiding questions about finances, treating wealth as something that needs to stay hidden.',
    to: 'A two-sentence affirmation from Day 18 of the MONEY program. It targets the deep pattern of making yourself invisible around money: keeping wins quiet, dodging money questions, treating wealth as something that needs to stay hidden.',
  },
  {
    slug: 'visualise-the-sleep-space',
    from: 'Grounded sensory attention to the sleep environment as a pre-sleep practice is documented across sleep-hygiene research and mindfulness traditions. The specific room-attending form used here is adapted from SLEEP: A 30-Day Tapping Intensive (Rebecca J Page, 2025), which uses attention practices to help the nervous system settle before sleep.',
    to: 'Grounded sensory attention to the sleep space as a pre-sleep practice is set out across sleep-hygiene research and mindfulness work. The specific room-attending form used here is adapted from SLEEP: A 30-Day Tapping Intensive (Rebecca J Page, 2025), which uses attention work to help the nervous system settle before sleep.',
  },
  {
    slug: 'waffles',
    from: 'Fill the grid generously; a Belgian-style iron produces thick waffles, a standard American iron produces thinner ones',
    to: 'Fill the grid well; a Belgian-style iron makes thick waffles, a standard American iron makes thinner ones',
  },
  {
    slug: 'waffles',
    from: "Waffles arrived in North America with Dutch and Belgian settlers and were a common domestic preparation by the eighteenth century, cooked in long-handled iron moulds held over an open fire. The electric waffle iron made them a practical everyday item from the early twentieth century onward, and they became fixed on the American breakfast table alongside pancakes, similar in ingredients but different in character, with the crisp grid and the deep pockets that hold syrup. The deeper Belgian-style waffle was introduced to a wider American audience at the 1964 World's Fair and gradually became the dominant home-cooking version.",
    to: "Waffles arrived in North America with Dutch and Belgian settlers. By the eighteenth century they were a common home dish, cooked in long-handled iron moulds held over an open fire. The electric waffle iron made them a practical everyday item from the early twentieth century onwards. They became fixed on the American breakfast table next to pancakes: similar in ingredients but different in feel, with the crisp grid and deep pockets that hold syrup. The deeper Belgian-style waffle was shown to a wider American audience at the 1964 World's Fair, and slowly became the main home-cooking version.",
  },
  {
    slug: 'walking-into-the-room-wearing-the-thing-you-bought-yourself',
    from: 'A five-minute visualisation for practising financial visibility in a safe imagined space. The image is simple: you, walking into a room, wearing or carrying something you bought without apology, feeling easy about it.',
    to: 'A five-minute visualisation for working with money visibility in a safe imagined space. The image is simple: you walking into a room, wearing or carrying something you bought without apology, feeling easy about it.',
  },
  {
    slug: 'walking-into-the-room-wearing-the-thing-you-bought-yourself',
    from: 'Original to homemade.education as a companion visualisation for Day 18 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). Mental rehearsal of this kind draws on standard imagery practice in performance psychology.',
    to: 'Original to homemade.education as a companion visualisation for Day 18 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). Mental rehearsal of this kind draws on standard imagery work in performance psychology.',
  },
]

function unescape(s: string): string {
  return s
    .replace(/\\"/g, '"')
    .replace(/\\u2019/g, '’')
    .replace(/\\\\/g, '\\')
}

let ok = 0
let miss = 0
for (const rw of rewrites) {
  const path = resolve(dir, `${rw.slug}.json`)
  const raw = readFileSync(path, 'utf8')
  const from = unescape(rw.from)
  const to = unescape(rw.to)
  if (!raw.includes(from)) {
    console.error(`[MISS] ${rw.slug}: pattern not found:\n  ${from.slice(0, 100)}...`)
    miss++
    continue
  }
  const next = raw.replace(from, to)
  writeFileSync(path, next, 'utf8')
  console.log(`[OK]   ${rw.slug}`)
  ok++
}

console.log(`\nDone: ${ok} replaced, ${miss} missed`)
process.exit(miss > 0 ? 1 : 0)
