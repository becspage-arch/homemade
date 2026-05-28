/**
 * Targeted text rewrites for voice-retrofit-2026-05-28-batch20.
 *
 * For each entry, find the offending text inside the named JSON file and
 * replace it. Aborts on any miss so the worker can spot it.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '../../..')
const dir = resolve(root, 'docs/voice-retrofit-2026-05-28-batch20')

interface Rewrite {
  slug: string
  from: string
  to: string
}

const rewrites: Rewrite[] = [
  // 1. heading too long — simplify
  {
    slug: 'what-it-means-to-steward-wealth-journal',
    from: 'What recent opportunity have you had to use money with love, integrity, or generosity?',
    to: 'When did I last use money in a way I am proud of?',
  },
  // 2. academic-style sources paragraph
  {
    slug: 'what-wisdom-do-i-have-now-that-i-didnt-at-30-journal',
    from: "Written for homemade.education, drawing on Erik Erikson's model of adult development (particularly his 'generativity vs stagnation' and 'integrity vs despair' stages) and contemporary positive-ageing writing.",
    to: "Written for homemade.education. It draws on the work of Erik Erikson on the stages of adult life, and on recent writing about ageing well.",
  },
  // 3. heading too long
  {
    slug: 'what-would-i-give-if-generosity-always-returned-journal',
    from: 'If generosity always multiplied my abundance, what would I do differently today?',
    to: 'If giving always came back to me, what would I do today?',
  },
  // 4. compound long sentence
  {
    slug: 'when-a-parent-dies-grief-reading',
    from: 'When a parent dies, several things are lost simultaneously: the person themselves; the role they played (buffer, witness, repository of family history); the particular relationship that existed between child and parent, which is never the same as any other relationship; and, often, the childhood home and its emotional weight. These compound losses are part of what makes parental grief heavier than its cultural treatment would suggest.',
    to: 'When a parent dies, several things are lost at once. The person themselves. The role they played: buffer, witness, keeper of family history. The bond between child and parent, which is never quite like any other bond. Often the childhood home and its weight too. These layered losses are part of what makes parental grief heavier than the culture treats it.',
  },
  // 5. "Written for..." source body block
  {
    slug: 'when-a-parent-dies-grief-reading',
    from: "Written for homemade.education. The reading draws on grief research including work on continuing bonds, the concept of the 'buffer' generation in bereavement studies, and accounts of parental grief across a range of settings.",
    to: "Written for homemade.education. The reading draws on grief research, including work on continuing bonds, the 'buffer' generation idea in bereavement studies, and accounts of parental grief across many settings.",
  },
  // 6.
  {
    slug: 'when-did-i-last-trust-my-body-fully-journal',
    from: 'Write what it actually is: monitoring, checking, frustration, hope, resignation, whatever is true.',
    to: 'Write what it really is. Watching. Checking. Frustration. Hope. Quiet resignation. Whatever is true.',
  },
  // 7.
  {
    slug: 'when-did-i-last-trust-my-body-fully-journal',
    from: 'Write the specific belief, not a general positive attitude but the exact conviction that is currently missing.',
    to: 'Write the exact belief. Not a general good attitude. The specific belief that is missing right now.',
  },
  // 8. has long sentence with two long clauses
  {
    slug: 'when-money-arrives-what-do-i-do',
    from: 'From Day 4 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025), where ending the feast-or-famine cycle is the focus. Journal-prompt practice as a self-inquiry tool is a public-domain technique documented across therapeutic and journaling traditions.',
    to: 'From Day 4 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). The focus there is ending the feast-or-famine cycle. Using journal prompts to inquire is a public-domain technique. It shows up across therapy and journaling traditions.',
  },
  // 9.
  {
    slug: 'when-the-home-becomes-the-work',
    from: 'The home has become, in contemporary Western culture, an unusually loaded object. It signals financial status, aesthetic taste, level of care given to children, relationship with domesticity, and environmental awareness simultaneously. That is too much for a house to carry.',
    to: 'The home has become an unusually loaded object in Western culture. It signals money status, taste, care given to children, how someone feels about domestic life, and care for the planet, all at the same time. That is too much for a house to carry.',
  },
  // 10.
  {
    slug: 'when-the-home-becomes-the-work',
    from: 'The practices for this are mostly acts of reduction: reducing the comparison inputs where possible, naming the invisible load explicitly (which makes it distributable), and deciding deliberately what the home is actually for. A home that is primarily for living in has different standards than a home that is meant to perform.',
    to: 'The practices here are mostly acts of reduction. Cut down on comparison inputs where you can. Name the invisible load out loud, which is what makes it shareable. Decide on purpose what the home is for. A home that is first for living in has different standards than a home that is meant to perform.',
  },
  // 11. has (1989) year-in-body + grade level. sourceNotes already has the year, so remove (1989) from body.
  {
    slug: 'when-the-home-becomes-the-work',
    from: "Written for homemade.education, drawing on the invisible-labour research including Arlie Hochschild's The Second Shift (1989) and subsequent work on the mental load in domestic life.",
    to: "Written for homemade.education. It draws on research on invisible labour, including Arlie Hochschild's book The Second Shift, and later work on the mental load in domestic life.",
  },
  // 12.
  {
    slug: 'when-two-money-histories-share-a-bank-account-reading',
    from: 'Each person in a partnership arrives with a fully formed relationship with money built from years of experience before the partnership began. When two money histories share a bank account, the same disagreement tends to keep returning, because the argument is never really about the amount; it is about what the amount means. This reading walks a paired writing practice, a Release/Allow pair, and a journal-prompt set to break the loop.',
    to: 'Each person in a partnership arrives with a money story already built. It took shape from years of life before the partnership began. When two money histories share a bank account, the same disagreement keeps coming back. The argument is never really about the amount. It is about what the amount means. This reading walks through a paired writing practice, a Release/Allow pair, and a set of journal prompts to break the loop.',
  },
  // 13.
  {
    slug: 'when-women-trigger-each-other-about-money',
    from: 'Original to homemade.education. Draws on social-comparison research, female friendship literature, and money-psychology work on the comparison response.',
    to: 'Original to homemade.education. It draws on research about social comparison, on writing about women and friendship, and on money psychology work about the comparison response.',
  },
  // 14.
  {
    slug: 'when-womens-friendships-disappear-in-midlife',
    from: 'Research on adult friendship consistently identifies three conditions that facilitate friendship formation: proximity, unplanned interaction, and the conditions for vulnerability. These are precisely the conditions that dissolve in the thirties. Moving for work or partnership creates geographic distance from existing friends. Children and full-time work reduce unplanned time available. The combination of exhaustion and compressed social time makes the depth of interaction required for close friendship harder to access.',
    to: 'Research on adult friendship points to three conditions that build it. Being close by. Unplanned time together. The chance to be open. These are the conditions that fall away in the thirties. Moving for work or partnership puts distance between old friends. Children and full-time work cut into unplanned time. Tiredness and tight social windows make the depth that close friendship needs harder to reach.',
  },
  // 15.
  {
    slug: 'when-womens-friendships-disappear-in-midlife',
    from: "The research on adult friendship formation points to the same factors: repeated exposure in a context that allows for depth, and the willingness to be the first one to reach for depth. Structured repeated contact (a class, a group, a regular arrangement) recreates the proximity condition that casual encounters don't provide. The willingness to move past pleasant surface interaction is the initiating act that almost everyone says they were waiting for the other person to make first.",
    to: "Research on how adult friendships form points to the same things. Seeing each other again and again in a setting that lets depth happen. And being the one to reach for depth first. A regular class, a group, a standing arrangement, all of these rebuild the closeness that casual meetings miss. Moving past pleasant surface chat is the first step that almost everyone says they were waiting for the other person to take.",
  },
  // 16.
  {
    slug: 'when-you-cant-forgive',
    from: 'Forgiveness research describes it as a shift in the person doing the forgiving: a reduction in the hostility, resentment, and desire for revenge that follows a genuine wrong. That shift is for the benefit of the person forgiving, not the person forgiven. The research on its effects is consistent: people who move toward forgiveness report lower anxiety and better sleep. The benefit accrues internally, independent of anything the other person does.',
    to: 'Research on forgiveness sees it as a shift inside the person who forgives. A drop in the anger, resentment, and wish for revenge that follows a real wrong. The shift is for the one forgiving, not the one forgiven. The research on its effects is steady. People who move toward forgiveness report less anxiety and better sleep. The benefit happens on the inside, no matter what the other person does.',
  },
  // 17.
  {
    slug: 'when-you-cant-forgive',
    from: "Draws on Robert Enright's process model of forgiveness and Everett Worthington's REACH model, both published in peer-reviewed psychology literature. Framing is original to homemade.education.",
    to: "Draws on the work of Robert Enright on the stages of forgiveness, and on Everett Worthington's REACH model. Both sit in mainstream psychology. The framing here is original to homemade.education.",
  },
  // 18.
  {
    slug: 'where-did-fast-and-now-come-from',
    from: "Written for homemade.education. Draws on cultural criticism around diet culture, body image, and the commercialisation of women's self-improvement.",
    to: "Written for homemade.education. It draws on cultural writing about diet culture, body image, and the way women's self-improvement got sold back to them.",
  },
  // 19.
  {
    slug: 'where-to-start-with-money-work',
    from: "Go directly to the stuck-on sections: pricing, asking for more, spouse disagreements, the guilt about having more than your parents, the inherited money that doesn't feel like yours yet. These are each built around one specific stuck point with the full set of practices, tapping, energy statement, journal prompts, and a reading.",
    to: "Go straight to the stuck section. Pricing. Asking for more. Money fights with a partner. The guilt of having more than your parents. The inherited money that does not feel like yours yet. Each one is built around a single stuck point with the full set of practices. Tapping. An energy statement. Journal prompts. A reading.",
  },
  // 20.
  {
    slug: 'where-to-start-with-money-work',
    from: 'Start with the relationship sections, spouse-money disagreements, the trigger when another woman succeeds, the parents-and-money complexity. Relationship money work is often the most pressing and least addressed.',
    to: 'Start with the relationship sections. Money fights with a partner. The pang when another woman does well. The tangle of money with parents. Relationship money work is often the most urgent and the least worked on.',
  },
  // 21.
  {
    slug: 'where-to-start-with-money-work',
    from: 'Written for homemade.education as an entry point into the money section of the Mindset library.',
    to: 'Written for homemade.education as a way in to the money section of the Mindset library.',
  },
  // 22.
  {
    slug: 'who-do-i-become-as-the-start-of-the-new-line-journal',
    from: 'Not a value or a concept, a specific habit, a specific behaviour, a specific belief about money.',
    to: 'Not a value. Not an idea. A specific habit. A specific behaviour. A specific belief about money.',
  },
  // 23.
  {
    slug: 'who-in-the-family-said-we-never-get-ahead-journal',
    from: 'Drawn from The Money Journal: 12 Weeks to Peace, Freedom & Overflow (Rebecca J Page, 2025), Week 2, which addresses breaking generational money patterns through structured reflection.',
    to: 'Drawn from The Money Journal: 12 Weeks to Peace, Freedom & Overflow (Rebecca J Page, 2025), Week 2. The week works on breaking family money patterns through guided writing.',
  },
  // 24.
  {
    slug: 'whole-grilled-bream-greek',
    from: 'Whisk the remaining {{extra-virgin-olive-oil}} with the juice of the second {{lemon}}. Pour over the fish, scatter {{oregano-dried}} and {{parsley-flat}} over, and serve immediately.',
    to: 'Whisk the rest of the {{extra-virgin-olive-oil}} with the juice of the second {{lemon}}. Pour it over the fish. Scatter {{oregano-dried}} and {{parsley-flat}} on top. Serve right away.',
  },
  // 25.
  {
    slug: 'whole-grilled-bream-greek',
    from: 'Whole grilled sea bream is the fish taverna standard of the Greek islands and mainland coast: the default order when the fish is fresh, presented whole, drizzled with ladolemono (lemon-oil dressing) and served with nothing more than a salad and bread. The simplicity is the point. It requires good fish and a hot grill, and beyond that there is nothing to improve on. Greek aquaculture produces large quantities of farmed sea bream (and sea bass, which can be substituted directly), making both fish available across Europe year-round, though the flavour of wild or line-caught fish from cleaner Mediterranean waters is noticeably better.',
    to: 'Whole grilled sea bream is the standard fish-taverna dish of the Greek islands and mainland coast. It is the default order when the fish is fresh. The fish goes out whole, drizzled with ladolemono (lemon-oil dressing), and served with nothing more than a salad and bread. The simplicity is the point. It needs good fish and a hot grill. Beyond that there is nothing to add. Greek fish farms put out a lot of sea bream (and sea bass, which can stand in for it), so both are around in Europe all year. The flavour of wild or line-caught fish from cleaner Mediterranean water is noticeably better.',
  },
  // 26.
  {
    slug: 'why-autonomy-matters-even-in-a-happy-partnership-reading',
    from: "Financial autonomy is the experience of having money that is yours to decide with, not contingent on asking, not dependent on approval, not a favour. Research on women's wellbeing consistently finds that the presence or absence of this experience affects confidence, self-regard, and mental health independently of how much money is available or how generous a partner is.",
    to: "Financial autonomy is the feeling of having money that is yours to choose with. Not money you have to ask for. Not money that needs approval. Not a favour. Research on women's wellbeing keeps finding the same thing. Whether this feeling is there shapes confidence, self-regard, and mental health. And it shapes them whatever the total money in the home is, and whatever a partner gives.",
  },
  // 27.
  {
    slug: 'why-autonomy-matters-even-in-a-happy-partnership-reading',
    from: 'A woman can be deeply loved and financially dependent and still carry the psychological weight of that dependency. Not because her partner is withholding, but because not having money that is unambiguously hers erodes something in her sense of herself as a capable adult.',
    to: 'A woman can be deeply loved and still carry the weight of being financially dependent. Not because her partner is mean. Because not having money that is clearly hers wears down her sense of herself as a capable adult.',
  },
  // 28.
  {
    slug: 'why-autonomy-matters-even-in-a-happy-partnership-reading',
    from: 'It means having a portion of household money agreed to be yours to decide with, without reporting back. It means having the confidence to make a financial decision: to invest in your business, to buy something for yourself, to allocate money toward what you care about, without guilt that requires managing.',
    to: 'It means having a slice of the household money that is yours to decide with, with no need to report back. It means having the confidence to make a money choice. To invest in your business. To buy something for yourself. To put money where you care, with no guilt to manage afterwards.',
  },
  // 29.
  {
    slug: 'why-debt-obsession-grows-in-the-dark',
    from: 'The avoidance-rumination cycle is documented across cognitive-behavioural therapy literature and anxiety research. The specific debt-avoidance pattern described here is adapted from Day 6 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025), which addresses debt obsession as a pattern that tapping can interrupt.',
    to: 'The avoidance-rumination cycle is well documented in cognitive-behavioural therapy and in anxiety research. The specific debt-avoidance pattern here is adapted from Day 6 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). The day treats debt obsession as a pattern that tapping can break.',
  },
  // 30.
  {
    slug: 'why-huge-wealth-feels-impossible-to-picture',
    from: 'Most wealth ceilings form during childhood and early adulthood, through three main routes: comparison, inherited narrative, and conditional worthiness.',
    to: 'Most wealth ceilings take shape during childhood and early adulthood. Three main routes set them. Comparison. Inherited family story. Conditional worth.',
  },
  // 31.
  {
    slug: 'why-huge-wealth-feels-impossible-to-picture',
    from: "This reading is original to homemade.education, drawing on The Money Zone (Rebecca Page, 2024) and aligned with Day 24 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). The wealth ceiling concept appears in various forms across the money mindset literature, most notably in Gay Hendricks' work on upper limiting. The conditioned response framing draws on standard behavioural psychology.",
    to: "This reading is original to homemade.education. It draws on The Money Zone (Rebecca Page, 2024) and lines up with Day 24 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). The wealth ceiling idea shows up in different forms across money mindset writing, most notably in Gay Hendricks' work on upper limiting. The conditioned response framing draws on standard behavioural psychology.",
  },
]

let okCount = 0
let missCount = 0
const misses: string[] = []

for (const r of rewrites) {
  const path = resolve(dir, `${r.slug}.json`)
  let raw: string
  try {
    raw = readFileSync(path, 'utf8')
  } catch (e) {
    console.error(`[MISS] ${r.slug} — file not found`)
    missCount++
    misses.push(r.slug)
    continue
  }

  // Encode "from" and "to" the way they appear in the JSON file:
  // - " becomes \"
  // - \ becomes \\
  // (No special chars beyond those — no newlines, no control chars in these.)
  const enc = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  const fromEnc = enc(r.from)
  const toEnc = enc(r.to)

  if (!raw.includes(fromEnc)) {
    console.error(`[MISS] ${r.slug} — text not found in file`)
    console.error(`  expected: ${fromEnc.slice(0, 100)}...`)
    missCount++
    misses.push(r.slug)
    continue
  }

  // Replace only the first occurrence to be safe.
  const idx = raw.indexOf(fromEnc)
  const updated = raw.slice(0, idx) + toEnc + raw.slice(idx + fromEnc.length)
  writeFileSync(path, updated, 'utf8')
  console.log(`[OK]   ${r.slug}`)
  okCount++
}

console.log(`\nDone: ${okCount} ok, ${missCount} missed`)
if (misses.length > 0) {
  for (const m of misses) console.log(`  - ${m}`)
  process.exit(1)
}
