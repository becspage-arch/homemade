/**
 * Apply paragraph rewrites for batch19. Each entry specifies a file, the
 * body paragraph index, the original text (verified before writing), and the
 * rewritten text. Aborts if the original does not match: guards against
 * stale rewrite intents.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const batchDir = resolve(worktreeRoot, 'docs/voice-retrofit-2026-05-28-batch19')

interface Rewrite {
  file: string
  paraIdx: number
  oldText: string
  newText: string
}

const REWRITES: Rewrite[] = [
  {
    file: 'washing-money-shame-clean.json',
    paraIdx: 15,
    oldText:
      "Water-as-cleansing imagery is a public-domain lineage across folk-healing and modern therapeutic traditions. The money-shame application is adapted from Day 5 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025), where releasing the weight of past financial decisions is the day's focus.",
    newText:
      "Water as a cleansing image is a public-domain idea, used in folk healing and in modern therapy. The money-shame version is adapted from Day 5 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025), where the focus is letting go of the weight of past money choices.",
  },
  {
    file: 'watering-the-garden-with-the-overflow.json',
    paraIdx: 9,
    oldText:
      'Original to homemade.education. Creative visualisation as a self-development tool draws on public-domain traditions.',
    newText:
      'Original to homemade.education. People have used creative visualisation for self-growth for a long time, across many public-domain traditions.',
  },
  {
    file: 'we-can-want-different-things-and-find-common-ground.json',
    paraIdx: 0,
    oldText:
      'An energy statement for the money tension that comes from two different financial histories sharing one life. The release names the belief that different histories are irreconcilable; the allow names the alternative: a shared financial life where common ground is found rather than imposed.',
    newText:
      'An energy statement for the money tension between two people whose money histories are different. The release names the belief that the two histories cannot meet. The allow names a different path: a shared money life where common ground is found, not forced.',
  },
  {
    file: 'welsh-rarebit.json',
    paraIdx: 8,
    oldText:
      'Welsh rarebit is a lunch dish, a late-night supper, and a savoury to end a dinner when something rich and sharp is wanted after dessert. It is the most sophisticated use of cheese on toast in the British tradition, made with a sauce rather than slices of cheese, and seasoned correctly it has a depth that straight melted cheese cannot match.',
    newText:
      'Welsh rarebit is a lunch dish, a late-night supper, and a savoury after dinner when something rich and sharp is wanted. It is the smartest use of cheese on toast in British cooking, made with a sauce rather than slices of cheese. Seasoned right, it has a depth that plain melted cheese cannot match.',
  },
  {
    file: 'what-am-i-tracking-that-nobody-else-is-journal.json',
    paraIdx: 12,
    oldText:
      'Write specifically what the handover would require: telling them, accepting a different standard, tolerating some messiness. Name the actual obstacle.',
    newText:
      'Write what the handover would actually need. Telling them, accepting a different standard, putting up with some mess. Name the real obstacle.',
  },
  {
    file: 'what-am-i-tracking-that-nobody-else-is-journal.json',
    paraIdx: 14,
    oldText:
      'Written for homemade.education. The mental load concept was popularised by French illustrator Emma in 2017 and draws on earlier feminist work on the invisible labour of household management.',
    newText:
      'Written for homemade.education. The mental load idea was made popular by French illustrator Emma in 2017. It builds on earlier feminist writing about the unseen work of running a home.',
  },
  {
    file: 'what-ancestor-work-means-in-the-money-context.json',
    paraIdx: 2,
    oldText:
      "Money beliefs are transmitted through families in several ways. Explicitly, through what was said out loud: 'money doesn't grow on trees,' 'we can't afford it,' 'rich people are greedy.' Implicitly, through what was modelled: how anxiety was managed, whether bills were spoken about or hidden, what was celebrated, what was shameful. And structurally, through the actual financial circumstances of the previous generation, what they had, what they lost, what they worked toward and never reached.",
    newText:
      "Money beliefs pass through families in several ways. Explicitly, through what was said out loud: 'money doesn't grow on trees,' 'we can't afford it,' 'rich people are greedy.' Implicitly, through what was shown: how anxiety was managed, whether bills were talked about or hidden, what was praised, what was treated as shameful. And structurally, through the actual money lives of the older generation. What they had. What they lost. What they worked for and never reached.",
  },
  {
    file: 'what-do-i-want-this-decade-to-be.json',
    paraIdx: 0,
    oldText:
      'A journal prompt set for the decade boundary: not a bucket list, not a productivity review, but a genuine inquiry into what you want the shape of the next ten years to be.',
    newText:
      'A journal prompt set for the start of a new decade. Not a bucket list. Not a productivity review. The aim is to ask what you want the shape of the next ten years to feel like.',
  },
  {
    file: 'what-does-my-body-do-when-the-number-is-good-journal.json',
    paraIdx: 14,
    oldText:
      'Write a specific action, checking the account and deliberately relaxing, naming the number aloud, pausing before closing the app.',
    newText:
      'Write a specific action. Checking the account and choosing to relax. Saying the number out loud. Pausing before you close the app.',
  },
  {
    file: 'what-does-my-body-want-me-to-know-today-journal.json',
    paraIdx: 16,
    oldText:
      'Adapted from the Day 1 body-listening prompt in WEIGHT LOSS: A 12-Week Tapping Program (Rebecca J Page, 2025), which opens with the principle that change begins from listening to where you are, not from requiring yourself to be somewhere else.',
    newText:
      'Adapted from the Day 1 body-listening prompt in WEIGHT LOSS: A 12-Week Tapping Program (Rebecca J Page, 2025). The Day 1 idea is simple. Change starts from listening to where you are, not from making yourself be somewhere else.',
  },
  {
    file: 'what-does-my-money-want-to-be-asked-journal.json',
    paraIdx: 7,
    oldText:
      "Organisation, awareness, planning, look for one thing already working before asking what isn't.",
    newText:
      "Look for one thing already working: organising, paying attention, planning. Notice that first, before asking what is not working.",
  },
  {
    file: 'what-does-my-mum-guilt-actually-want-from-me-journal.json',
    paraIdx: 16,
    oldText:
      "Written for homemade.education, drawing on the good-enough mother tradition in maternal psychology (originally from D.W. Winnicott's work in the 1950s and 1960s) and contemporary writing on mum guilt as a specific cultural phenomenon.",
    newText:
      "Written for homemade.education. Draws on the good-enough mother idea from maternal psychology. The idea comes from the work of D.W. Winnicott in the 1950s and 1960s. Also draws on recent writing about mum guilt as a cultural pattern.",
  },
  {
    file: 'what-does-prayer-mean-to-me-beyond-childhood-journal.json',
    paraIdx: 16,
    oldText:
      "Written for homemade.education, drawing on broad spiritual literature that understands prayer as a universal human practice taking many forms across traditions, and on developmental psychology's account of how adults revise inherited beliefs.",
    newText:
      "Written for homemade.education. Draws on wide spiritual writing that sees prayer as a human practice with many forms. Also draws on work in adult development on how grown-ups review the beliefs they have inherited.",
  },
  {
    file: 'what-does-sanctuary-mean-to-me-at-home-journal.json',
    paraIdx: 16,
    oldText:
      "Written for homemade.education, drawing on the intentional homemaking tradition and slow-living writing that frames the home as an active practice rather than a backdrop.",
    newText:
      "Written for homemade.education. Draws on the slow-living and intentional homemaking traditions. Both treat the home as a daily practice, not a backdrop.",
  },
  {
    file: 'what-forgiveness-is-what-it-isnt.json',
    paraIdx: 5,
    oldText:
      "Psychologists Fred Luskin and Robert Enright, who have studied forgiveness extensively, converge on a working definition: forgiveness is the decision to let go of resentment, bitterness, and the desire for punishment, for your own benefit. It is the release of the ongoing activation that holding the grievance produces in the nervous system.",
    newText:
      "Psychologists Fred Luskin and Robert Enright have studied forgiveness for years. They agree on a working definition. Forgiveness is the choice to let go of resentment, bitterness, and the wish for punishment, for your own benefit. It is the release of the steady stress response that holding the grievance creates in the body.",
  },
  {
    file: 'what-forgiveness-is-what-it-isnt.json',
    paraIdx: 8,
    oldText:
      "The reason forgiveness is often refused, even when people understand the above, is that it can feel like a further injustice: the person who was wronged is now asked to do the work of releasing the wrongdoer. This is a real tension. The response to it is not to pretend the tension isn't there, but to be clear about what forgiveness is actually asking: not to excuse what happened, but to stop letting it run a stress response in your body for years after the event.",
    newText:
      "People often refuse forgiveness even when they understand the above. It can feel like a further injustice. The person who was wronged is now being asked to do the work of releasing the wrongdoer. This is a real tension. The answer is not to pretend the tension is not there. The answer is to be clear about what forgiveness is actually asking. Not to excuse what happened. Just to stop letting it run a stress response in your body for years after the event.",
  },
  {
    file: 'what-forgiveness-is-what-it-isnt.json',
    paraIdx: 11,
    oldText:
      "Written for homemade.education. Draws on psychological research on forgiveness, including the work of Fred Luskin and Robert Enright.",
    newText:
      "Written for homemade.education. It draws on research about forgiveness, including the work of Fred Luskin and Robert Enright.",
  },
  {
    file: 'what-friendship-am-i-starving-for.json',
    paraIdx: 0,
    oldText:
      "A journal practice for getting specific about the missing friendship. Loneliness is often described as a general condition, but the ache usually points at something specific: a particular kind of understanding, a type of conversation, a way of being known. This practice moves from the general feeling to the specific need, which is the level at which something can be done about it.",
    newText:
      "A journal practice for getting specific about the missing friendship. Loneliness is often spoken of as a general feeling, but the ache usually points to something specific. A particular kind of understanding. A type of conversation. A way of being known. This practice moves from the general feeling to the specific need. That is the level at which you can do something about it.",
  },
  {
    file: 'what-i-want-my-grandchildren-to-inherit.json',
    paraIdx: 16,
    oldText:
      "Drawn from Day 14 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025) and the Week 2 Reflection in The Money Journal: 12 Weeks to Peace, Freedom & Overflow (Rebecca J Page, 2025).",
    newText:
      "Drawn from Day 14 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). Also drawn from the Week 2 Reflection in The Money Journal: 12 Weeks to Peace, Freedom & Overflow (Rebecca J Page, 2025).",
  },
  {
    file: 'what-is-my-debt-story-journal.json',
    paraIdx: 10,
    oldText:
      "From Day 6 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025), where stopping debt obsession and examining the narrative it carries is the focus. Journal-prompt practice as a self-inquiry tool is a public-domain technique documented across therapeutic and journaling traditions.",
    newText:
      "From Day 6 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). Day 6 focuses on stopping debt obsession and looking at the story it carries. Journal prompts as a self-inquiry tool is a public-domain practice, used widely in therapy and in journaling traditions.",
  },
  {
    file: 'what-is-my-health-anxiety-protecting-journal.json',
    paraIdx: 14,
    oldText:
      "Written for homemade.education. The framing of anxiety as functional draws on acceptance and commitment therapy approaches to anxiety, which work with anxiety's function rather than treating it as an error to be eliminated.",
    newText:
      "Written for homemade.education. The view of anxiety as having a function draws on acceptance and commitment therapy. That approach works with anxiety's role rather than treating it as an error to be removed.",
  },
]

let ok = 0
let fail = 0
for (const rw of REWRITES) {
  const filepath = resolve(batchDir, rw.file)
  const data = JSON.parse(readFileSync(filepath, 'utf8'))
  const para = data.body?.content?.[rw.paraIdx]
  if (!para || para.type !== 'paragraph') {
    console.error(`[FAIL] ${rw.file}[${rw.paraIdx}] not a paragraph`)
    fail++
    continue
  }
  const content = para.content
  if (!Array.isArray(content) || content.length !== 1 || content[0].type !== 'text') {
    console.error(`[FAIL] ${rw.file}[${rw.paraIdx}] not a single text leaf`)
    fail++
    continue
  }
  if (content[0].text !== rw.oldText) {
    console.error(`[FAIL] ${rw.file}[${rw.paraIdx}] oldText mismatch`)
    console.error(`  expected: ${rw.oldText.slice(0, 80)}...`)
    console.error(`  found:    ${(content[0].text ?? '').slice(0, 80)}...`)
    fail++
    continue
  }
  content[0].text = rw.newText
  writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log(`[OK]   ${rw.file}[${rw.paraIdx}]`)
  ok++
}

console.log(`\nDone: ${ok} ok, ${fail} failed`)
if (fail > 0) process.exit(1)
