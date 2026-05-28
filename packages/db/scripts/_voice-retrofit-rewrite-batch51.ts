/**
 * Apply the targeted rewrites for voice-retrofit batch 2026-05-28-batch8.
 *
 * Each rewrite is a (slug, oldText, newText) triple. The script does a
 * direct string replacement on the JSON file content; oldText must appear
 * exactly once.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const BATCH_ID = '2026-05-28-batch8'
const batchDir = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)

interface Rewrite {
  slug: string
  old: string
  next: string
}

const REWRITES: Rewrite[] = [
  {
    slug: 'macaroni-and-cheese',
    old: "Macaroni and cheese has an American culinary history that spans from Thomas Jefferson's documented enthusiasm for pasta and cheese after his time in France and Italy, through Fannie Farmer's baked version at the end of the nineteenth century, to the invention of Kraft Dinner in 1937, which made it a ubiquitous household staple. It occupies an unusual position in the food culture: simultaneously a children's food of the most basic kind, a comfort food for adults who grew up on the boxed version, and, in its proper béchamel form, a sophisticated baked dish. The gap between the packet version and the homemade version is wider than for almost any other American comfort food.",
    next: "Macaroni and cheese has a long American story. Thomas Jefferson loved pasta and cheese after his time in France and Italy. Fannie Farmer printed a baked version at the end of the nineteenth century. Kraft Dinner arrived in 1937 and made the dish a household staple. The result sits in an odd place in food culture. It is a children's food at its simplest. It is a comfort food for adults who grew up on the boxed version. And in its proper béchamel form, it is a baked dish for a dinner table. The gap between the packet version and the homemade version is wider than for almost any other American comfort food.",
  },
  {
    slug: 'macaroni-cheese',
    old: "Macaroni cheese arrived in Britain in the eighteenth century as an Italian fashion, appearing first in the tables of the aristocracy before filtering down into the everyday kitchen by the mid-Victorian period. Eliza Acton's 1845 version used Parmesan and cream; Mrs Beeton's 1861 version pulled it firmly into the British domestic register with a flour-thickened white sauce. The breadcrumb top came later, sometime in the twentieth century, and is now so standard that a macaroni cheese without it reads as unfinished.",
    next: "Macaroni cheese arrived in Britain in the eighteenth century as an Italian fashion. It first appeared on aristocratic tables. It moved into everyday kitchens by the mid-Victorian period. The nineteenth-century cookery writer Eliza Acton built her 1845 version with Parmesan and cream. The Victorian cookbook writer Mrs Beeton pulled hers firmly into the British home in 1861, using a flour-thickened white sauce. The breadcrumb top came later, sometime in the twentieth century. It is now so standard that a macaroni cheese without it reads as unfinished.",
  },
  {
    slug: 'macaroni-pie-trinidad',
    old: "Macaroni pie is one of the fixed points of the Trinidadian Sunday table. Alongside stew chicken, rice and peas (or pelau), plantain, and coleslaw, it appears at every Sunday lunch and at every family occasion. The sliceable, set texture makes it convenient for packed lunches and for the cricket-ground picnics that are a fixture of Trinidadian life. In Britain the Trinidadian diaspora makes macaroni pie as a Sunday staple and for gatherings, a dish that is immediately recognisable as specifically Trinidadian rather than the saucer-style American mac and cheese that most British people know.",
    next: "Macaroni pie is a fixed point of the Trinidadian Sunday table. It sits alongside stew chicken, rice and peas (or pelau), plantain, and coleslaw. It appears at every Sunday lunch and at every family event. The sliceable, set texture suits packed lunches. It also suits the cricket-ground picnics that are part of Trinidadian life. In Britain the Trinidadian diaspora makes it as a Sunday staple and for big gatherings. The dish reads as Trinidadian on sight, not as the saucer-style American mac and cheese that most British people know.",
  },
  {
    slug: 'magret-de-canard',
    old: "Gascony, in the south-west of France, is duck country. The foie gras industry produces magret as a by-product: the breast of a force-fed duck is large, intensely flavoured, and well-marbled with subcutaneous fat in a way that ordinary duck breast is not. When André Daguin began cooking magret as a steak rather than as a component of a confit, he introduced a cooking style borrowed from beef cookery: high heat, rare centre, quick rest, diagonal slice. The approach spread from Gascony into the broader French restaurant world and became one of the signature dishes of French nouvelle cuisine in the 1970s.",
    next: "Gascony, in the south-west of France, is duck country. The foie gras trade produces magret as a by-product. The breast of a force-fed duck is large and full of flavour. It is well-marbled with fat just under the skin in a way that ordinary duck breast is not. When André Daguin began cooking magret as a steak rather than as part of a confit, he borrowed a method from beef cookery: high heat, rare centre, quick rest, diagonal slice. The approach spread from Gascony into the wider French restaurant world. It became one of the signature dishes of French nouvelle cuisine in the 1970s.",
  },
  {
    slug: 'mahshi-felfel',
    old: "Mahshi felfel is part of the Egyptian tradition of filling vegetables with spiced rice and meat. The same technique applied to courgettes produces mahshi kousa, to cabbage leaves produces mahshi cromb, to grape leaves produces warak dawali. In Egypt, making mahshi is a semi-ceremonial domestic activity, preparing a large quantity of different stuffed vegetables together for a family meal. Outside Egypt, stuffed peppers in tomato sauce are found across the Mediterranean, but the Egyptian spice combination of cumin and cinnamon is distinctive.",
    next: "Mahshi felfel is part of the Egyptian way of filling vegetables with spiced rice and meat. The same method on courgettes makes mahshi kousa. On cabbage leaves it makes mahshi cromb. On grape leaves it makes warak dawali. In Egypt, making mahshi is a quiet family ritual. You prepare a big batch of stuffed vegetables together for one meal. Stuffed peppers in tomato sauce show up across the Mediterranean. The Egyptian mix of cumin and cinnamon is what marks this version out.",
  },
  {
    slug: 'major-greys-chutney',
    old: "Major Grey's chutney is not a specific recipe but a style: a sweet, mild mango and raisin preserve with ginger, spiced mildly and finished with enough vinegar to give it a clean sharpness. It became the most commercially successful Anglo-Indian condiment ever made, the Crosse and Blackwell version was exported worldwide from the 1870s and for most British households of the nineteenth and twentieth centuries it was the only chutney they knew.",
    next: "Major Grey's chutney is not one recipe but a style. It is a sweet, mild mango and raisin preserve with ginger. It is spiced lightly and finished with enough vinegar to give it a clean sharpness. It became the most successful Anglo-Indian condiment ever sold. The Crosse and Blackwell version was shipped worldwide from the 1870s. For most British homes of the nineteenth and twentieth centuries it was the only chutney they knew.",
  },
  {
    slug: 'major-greys-chutney',
    old: "The legend of Major Grey, the British officer in colonial India who is said to have created the recipe, is almost certainly apocryphal, a marketing invention of the kind common to Victorian food products. What is certain is that mango chutneys of this style were made in Anglo-Indian households throughout the nineteenth century and exported to Britain as bottled condiments, where they became the standard accompaniment to cold meats, cheese, and the curries that Anglo-Indian households introduced to British cooking. The name became a generic trademark in the United States; in Britain it describes a style rather than a specific product.",
    next: "The legend of Major Grey, the British officer in colonial India said to have made the recipe, is almost certainly invented. It is the kind of marketing story common to Victorian food products. What is real is that mango chutneys of this style were made in Anglo-Indian households throughout the nineteenth century. They were shipped to Britain in bottles. They became the standard match for cold meats, cheese, and the curries that Anglo-Indian homes brought into British cooking. The name became a generic trademark in the United States. In Britain it now describes a style rather than one product.",
  },
  {
    slug: 'manakish-zaatar',
    old: "Manakish are the Lebanese equivalent of a morning pastry: quick to make or buy, eaten on the go, deeply satisfying. In Beirut, bakeries producing manakish on a large circular saj griddle are a neighbourhood institution: the flatbreads are sold by the piece, folded around olives, fresh mint, and tomato, and eaten standing at the counter or taken in paper to eat walking. The za'atar version is universal; a cheese version with akawi or halloumi is also common, as is a combination of the two. Za'atar itself varies by producer, some are heavy on sumac and sharp, others are more thyme-forward. The Levantine habit of dipping bread in olive oil then za'atar is the same flavour in a different form.",
    next: "Manakish are the Lebanese answer to a morning pastry. They are quick to make or buy, eaten on the move, and deeply satisfying. In Beirut, bakeries that bake manakish on a wide round saj griddle are a fixture of every neighbourhood. The flatbreads are sold by the piece. People fold them around olives, fresh mint, and tomato. They eat them at the counter or take them in paper to eat walking. The za'atar version is the most common one. A cheese version with akawi or halloumi is popular too, as is a mix of the two. Za'atar itself varies by producer. Some blends are heavy on sumac and sharp. Others lean more on thyme. The Levantine habit of dipping bread in olive oil then za'atar is the same flavour in a different form.",
  },
  {
    slug: 'manti',
    old: "Mantı traces its lineage through Central Asia, where similar dumpling traditions (manti in Turkish and Kazakh, buuz in Mongolian, jiaozi in Chinese) share common nomadic roots and the practical logic of wrapping meat in portable dough. It entered Anatolia with Turkic migrations and became entrenched in Ottoman palace cooking, documented in imperial kitchen records from the fifteenth century. Today it is particularly associated with Kayseri in central Turkey, where the competitive standard is how small you can make the dumplings. The defining dressing (cold garlic yoghurt, hot paprika butter, dried mint, and sumac) is the same across the region and is what makes mantı distinctly Turkish rather than simply a dumpling.",
    next: "Mantı traces back through Central Asia. Similar dumpling traditions share common nomadic roots and the simple logic of wrapping meat in dough you can carry. The Turkish and Kazakh manti, the Mongolian buuz, and the Chinese jiaozi all sit in that family. It entered Anatolia with Turkic migrations. It became fixed in Ottoman palace cooking and was written down in palace kitchen records from the fifteenth century. Today it is most linked to Kayseri in central Turkey. The local pride is in how small you can make the dumplings. The dressing is the same across the region: cold garlic yoghurt, hot paprika butter, dried mint, and sumac. That is what makes mantı read as Turkish and not just as a dumpling.",
  },
  {
    slug: 'maqluba',
    old: "Maqluba is one of the great dishes of Palestinian cooking, made for celebrations, family gatherings, and weddings, brought to the table with the drama of the inversion in front of guests. The name ('upside-down') captures both the technique and something of the pleasure: a dish that conceals its contents until the moment of serving, then reveals them in a layered tower of rice, aubergine, and meat. It is claimed as a national dish in Palestine, Jordan, and to a lesser extent Lebanon and Syria, reflecting the shared Levantine culinary inheritance of the region.",
    next: "Maqluba is one of the great dishes of Palestinian cooking. It is made for celebrations, family gatherings, and weddings. It is brought to the table and turned out in front of guests for the drama of it. The name means 'upside-down'. The word fits both the method and the pleasure of the dish. It hides its layers until the moment of serving. Then it reveals a tower of rice, aubergine, and meat. It is claimed as a national dish in Palestine and in Jordan. It is also made in Lebanon and Syria. This is the shared Levantine food culture of the region.",
  },
  {
    slug: 'masala-chai',
    old: "Chai in India is not a recipe but a practice: a constant, variable preparation that differs by city, by household, and by the individual who makes it. The version that arrived in British culture is more standardised than any Indian household version, partly because it came through restaurants and partly because British taste preferences shaped what stuck. The homemade version here is closer to a North Indian street chai than to the commercial 'chai latte' served in coffee shops, which typically uses a pre-made syrup and steamed milk.",
    next: "Chai in India is not a recipe but a practice. It is a daily drink that shifts by city, by household, and by the person making it. The version that arrived in Britain is more fixed than any Indian home version. That is partly because it came through restaurants. It is also partly because British taste shaped what stuck. The version here sits closer to a North Indian street chai. It is not the 'chai latte' served in coffee shops, which usually uses a ready-made syrup and steamed milk.",
  },
  {
    slug: 'mast-o-khiar',
    old: "Mast-o khiar is one of the masts (yoghurt-based dips and side dishes) that appear throughout Persian cooking. The other well-known versions include mast-o moosir (with dried shallots) and mast-e khiar ba gol-e mohammadi (with rose petals). The cucumber and yoghurt combination appears across the Middle East and Central Asia in slightly different forms: the Greek tzatziki, the Indian raita, the Turkish cacik, but the dried mint and walnuts give the Persian version its specific character. Served cold alongside spiced rice and grilled meat, it performs the essential function of every yoghurt condiment: cooling, refreshing, balancing.",
    next: "Mast-o khiar is one of the masts that run through Persian cooking. A mast is a yoghurt-based dip or side. Other well-known versions are mast-o moosir, with dried shallots, and mast-e khiar ba gol-e mohammadi, with rose petals. The mix of cucumber and yoghurt shows up across the Middle East and Central Asia in slightly different forms. The Greek tzatziki, the Indian raita, and the Turkish cacik all belong to the same family. The dried mint and walnuts give the Persian version its own character. Served cold alongside spiced rice and grilled meat, it does what every yoghurt side does: cools, refreshes, and balances.",
  },
  {
    slug: 'the-fund-with-your-family-name-on-it',
    old: "Original to homemade.education. Creative visualisation as a self-development tool draws on public-domain traditions.",
    next: "Original to homemade.education. The shape draws on long-standing visualisation work used in self-help books.",
  },
  {
    slug: 'the-hand-on-heart-money-breath',
    old: "The five-part Prepare / Release / Allow / Integrate / Anchor ritual structure is Rebecca J Page's framework, drawn from the twelve weekly ceremonies in The Money Journal (2025). The hand-on-heart anchor is public-domain somatic practice with a long lineage across body-based mindfulness traditions, popularised in modern form through Kristin Neff's self-compassion work (2003 onwards). The five-round paced-breath count, as a daytime money reset, is original to the homemade.education library.",
    next: "The five-part Prepare / Release / Allow / Integrate / Anchor shape is Rebecca J Page's. It is drawn from the twelve weekly ceremonies in The Money Journal. The hand-on-heart anchor is a public-domain body practice. It has a long line across body-based mindfulness work. Kristin Neff popularised the form in her self-compassion work. The five-round paced-breath count, as a daytime money reset, is original to the homemade.education library.",
  },
  {
    slug: 'the-if-i-had-more-money-i-would-trap',
    old: "Original to homemade.education. Draws on identity-first manifestation literature and on the receiving threads in MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025).",
    next: "Original to homemade.education. The piece draws on identity-first manifestation writing. It also draws on the receiving threads in MONEY: A 12-Week Tapping Program by Rebecca J Page.",
  },
  {
    slug: 'the-instagram-home-performance',
    old: "Written for homemade.education. Draws on cultural commentary about social media, domestic aesthetics, and the commercialisation of home.",
    next: "Written for homemade.education. The piece draws on cultural writing about social media. It also draws on writing about the home and how it is sold.",
  },
  {
    slug: 'the-investing-isnt-for-me-lie-and-where-it-came-from',
    old: "Retail investing, including pensions, ISAs, and brokerage accounts, became widely accessible to ordinary households in the UK and US in the 1980s and 1990s. The marketing that accompanied this expansion was targeted at a specific demographic: men, typically white, typically middle-class, often shown in suits or golf clothes. The language was authoritative, technical, and signalled that a certain level of existing wealth was the starting point.",
    next: "Retail investing became open to ordinary households in the UK and US in the 1980s and 1990s. That includes pensions, ISAs, and brokerage accounts. The marketing that came with it was aimed at one group of people. The audience was men, usually white, usually middle-class. They were often shown in suits or golf clothes. The language was firm and technical. It signalled that a certain level of wealth was the starting point.",
  },
  {
    slug: 'the-investing-isnt-for-me-lie-and-where-it-came-from',
    old: "Women, working-class households, and immigrants were not the primary target audience. The financial services sector was, and in many ways remains, demographically concentrated at the senior level in ways that shaped product design, distribution, and marketing for decades.",
    next: "Women, working-class households, and immigrants were not the main target. The financial services sector still concentrates at the top in ways that shaped product design and marketing for decades.",
  },
  {
    slug: 'the-investing-isnt-for-me-lie-and-where-it-came-from',
    old: "Research from multiple countries consistently shows that women invest less than men and, when they do invest, start later. The most commonly cited reasons are confidence and knowledge, women report feeling less knowledgeable and less confident than men about financial products. What the research sometimes doesn't note is that confidence and knowledge in a domain follow exposure, and women have systematically had less exposure.",
    next: "Research from many countries shows the same pattern. Women invest less than men. When they do invest, they start later. The reasons most often cited are confidence and knowledge. Women report feeling less sure than men about financial products. What the research sometimes leaves out is simple. Confidence and knowledge in any field follow exposure. Women have had less exposure.",
  },
  {
    slug: 'the-investing-isnt-for-me-lie-and-where-it-came-from',
    old: "Girls were less likely to grow up in households where investing was discussed. Women in partnerships have historically been less likely to be the primary person managing investments, even when both partners work. The gender investment gap is real, and it is primarily an access-and-exposure gap, not a capability gap.",
    next: "Girls were less likely to grow up in homes where investing was talked about. Women in couples have, in the past, been less likely to be the main person managing the money, even when both partners work. The gender investment gap is real. It is an access-and-exposure gap, not a skill gap.",
  },
  {
    slug: 'the-investing-isnt-for-me-lie-and-where-it-came-from',
    old: "Written for homemade.education. Draws on public-domain literature on the history of retail investing, the gender investment gap, and financial literacy research.",
    next: "Written for homemade.education. The reading draws on public-domain work on retail investing, on the gender investment gap, and on financial literacy research.",
  },
  {
    slug: 'the-invisible-mid-life-woman-myth-and-reality',
    old: "The 'invisible woman' framing became prominent in popular writing about mid-life in the 1990s and 2000s and is now so widely repeated that many women arrive at their forties expecting to disappear. The cultural basis is real: advertising and entertainment underrepresent women over 40, consumer markets treat older women as a problem demographic rather than a primary one, and the cultural gaze that centres on young women's appearance does ease as women age out of that bracket.",
    next: "The 'invisible woman' framing rose in popular writing about mid-life in the 1990s and 2000s. It is now so often repeated that many women arrive at their forties expecting to fade. The cultural basis is real. Advertising and entertainment under-show women over 40. Consumer markets treat older women as a problem group rather than a main one. The cultural gaze on young women's looks does ease as women age out of that bracket.",
  },
  {
    slug: 'the-invisible-mid-life-woman-myth-and-reality',
    old: "The experience of reduced attention from strangers in public, reduced presence in advertising, and reduced cultural representation is not imagined. For women whose sense of self was partly organised around being seen and responded to in those ways, the shift can be disorienting.",
    next: "The shift in attention from strangers in public is not imagined. Nor is the drop in advertising or in cultural presence. For women whose sense of self was tied to being seen and replied to in those ways, the change can throw them.",
  },
  {
    slug: 'the-invisible-mid-life-woman-myth-and-reality',
    old: "There is also a class and race dimension. The invisibility narrative is largely a white, middle-class story about losing a particular kind of legibility in consumer culture. Women of colour, working-class women, and women outside Western contexts have different accounts of visibility and invisibility across the life course. The narrative presents one experience as universal when it is not.",
    next: "There is also a class and race side to this. The invisibility story is largely a white, middle-class one about losing a certain kind of pull in consumer culture. Women of colour, working-class women, and women outside Western settings tell different stories of being seen and not seen over the life course. The story presents one experience as the shared one when it is not.",
  },
  {
    slug: 'the-invisible-mid-life-woman-myth-and-reality',
    old: "Studies of wellbeing and life satisfaction tend to show that women in their forties and fifties report higher life satisfaction than women in their twenties. The U-shaped happiness curve, which shows wellbeing dipping in mid-life before recovering, is widely cited but the data are more complicated than the summary suggests: many women report that mid-life brings a clarity about what matters that is not available earlier.",
    next: "Studies of wellbeing and life satisfaction often show a clear pattern. Women in their forties and fifties report higher life satisfaction than women in their twenties. The U-shaped happiness curve is often cited. It shows wellbeing dipping in mid-life before coming back up. The data are more mixed than that short summary suggests. Many women report that mid-life brings a clarity about what matters that was not there before.",
  },
  {
    slug: 'the-invisible-mid-life-woman-myth-and-reality',
    old: "The useful question is not 'am I visible?' but 'visible to whom, and does it matter?' If the answer is that the visibility you want is the attention of the people close to you, your professional peers, the communities you are part of: most women in mid-life find that kind of visibility intact or growing. If the visibility you want is in the general cultural sphere, the answer is more complicated, and the work is partly about whether that sphere's attention is the right measure.",
    next: "The useful question is not 'am I visible?'. It is 'visible to whom, and does it matter?'. If the answer is the people close to you, your work peers, and the communities you sit in, most women in mid-life find that kind of visibility steady or growing. If the answer is the wider cultural sphere, the picture is more mixed. The work is partly about whether that sphere's attention is the right measure.",
  },
  {
    slug: 'the-invisible-mid-life-woman-myth-and-reality',
    old: "Written for homemade.education. The reading draws on Ashton Applewhite's work on ageism and the social construction of older women as invisible (This Chair Rocks, 2019), alongside sociological research into gendered ageing and life-satisfaction studies across the adult lifespan.",
    next: "Written for homemade.education. The reading draws on Ashton Applewhite's work on ageism and the social construction of older women as invisible, set out in her book This Chair Rocks. It also draws on social-science research into gendered ageing and on life-satisfaction studies across adult life.",
  },
  {
    slug: 'the-line-of-women-hands-open',
    old: "Original to homemade.education, developed alongside the generational money pattern work in Week 2 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). Ancestral release visualisations draw on a long public-domain contemplative tradition; this version is shaped for the specific inherited-fear pattern the program addresses.",
    next: "Original to homemade.education. Built alongside the generational money pattern work in Week 2 of MONEY: A 12-Week Tapping Program by Rebecca J Page. Ancestral release visualisations sit in a long public-domain quiet-practice tradition. This version is shaped for the inherited-fear pattern that the program works with.",
  },
  {
    slug: 'white-tin-loaf-overnight-cold-proof',
    old: "A wholemeal version takes 350 g strong bread flour plus 150 g wholemeal bread flour and an extra 15 ml of water, wholemeal drinks more. A seeded version takes a tablespoon each of sunflower seeds, linseeds and sesame seeds folded in after the eight-minute knead; brush the top with water and press more seeds onto the surface before the final proof.",
    next: "A wholemeal version takes 350 g strong bread flour plus 150 g wholemeal bread flour. It also takes an extra 15 ml of water, since wholemeal drinks more. A seeded version takes a tablespoon each of sunflower seeds, linseeds and sesame seeds. Fold them in after the eight-minute knead. Brush the top with water and press more seeds onto the surface before the final proof.",
  },
  {
    slug: 'white-tin-loaf-overnight-cold-proof',
    old: "The household tin loaf is the British baking baseline. Beeton's 1861 chapter on bread runs the same shape: strong flour, water, salt, yeast, a tin. The change since is in pace, not method, modern domestic ovens are hotter, modern yeasts work harder, and the fridge gives us a long flavour build her kitchen had to compensate for with sponges and pre-ferments. The recipe here is the household loaf with one modern adaptation: an overnight cold retard for the flavour she had to coax in other ways.",
    next: "The household tin loaf is the British baking baseline. The Victorian cookery writer Mrs Beeton's 1861 chapter on bread runs the same shape: strong flour, water, salt, yeast, a tin. The change since is in pace, not method. Modern home ovens are hotter. Modern yeasts work harder. The fridge gives us a long flavour build her kitchen had to compensate for with sponges and pre-ferments. The recipe here is the household loaf with one modern step added: an overnight cold retard for the flavour she had to coax in other ways.",
  },
  {
    slug: 'whole-wheat-sourdough',
    old: "Thirty percent wholemeal flour changes the character of a sourdough loaf without overwhelming it: the crumb stays open, the flavour becomes slightly nutty, and the crust has more colour than an all-white loaf. At higher wholemeal percentages the gluten network weakens and the crumb closes; 30% is the practical sweet spot for a home baker who wants a recognisably wholegrain loaf without sacrificing structure.",
    next: "Thirty percent wholemeal flour changes the character of a sourdough loaf without taking it over. The crumb stays open. The flavour becomes a little nutty. The crust has more colour than an all-white loaf. At higher wholemeal levels the gluten network weakens and the crumb closes. 30% is the sweet spot for a home baker who wants a clearly wholegrain loaf without losing structure.",
  },
]

async function main() {
  const slugs = new Set(REWRITES.map((r) => r.slug))
  let ok = 0
  let fail = 0
  const failures: { slug: string; reason: string }[] = []

  for (const slug of slugs) {
    const filePath = resolve(batchDir, `${slug}.json`)
    if (!existsSync(filePath)) {
      console.error(`[FAIL] ${slug} — file not found`)
      fail++
      failures.push({ slug, reason: 'file not found' })
      continue
    }
    let content = readFileSync(filePath, 'utf8')
    const myRewrites = REWRITES.filter((r) => r.slug === slug)
    let failedThisFile = false
    for (const r of myRewrites) {
      const escapedOld = JSON.stringify(r.old).slice(1, -1)
      const escapedNew = JSON.stringify(r.next).slice(1, -1)
      if (!content.includes(escapedOld)) {
        console.error(`[FAIL] ${slug} — old text not found for one rewrite`)
        console.error(`       searched for: ${escapedOld.slice(0, 80)}...`)
        failures.push({ slug, reason: 'old text not found' })
        failedThisFile = true
        break
      }
      const occurrences = content.split(escapedOld).length - 1
      if (occurrences > 1) {
        console.error(`[FAIL] ${slug} — old text appears ${occurrences}x (must be unique)`)
        failures.push({ slug, reason: `old text not unique (${occurrences}x)` })
        failedThisFile = true
        break
      }
      content = content.replace(escapedOld, escapedNew)
    }
    if (failedThisFile) {
      fail++
      continue
    }
    writeFileSync(filePath, content, 'utf8')
    console.log(`[OK]   ${slug}`)
    ok++
  }

  console.log(`\nDone: ${ok} ok, ${fail} failed`)
  if (failures.length > 0) {
    console.log('Failures:')
    for (const f of failures) console.log(`  - ${f.slug}: ${f.reason}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
