/**
 * Mindset completeness rewriter — applies hand-crafted rewrites to the
 * 13 tutorials flagged by `audit-mindset-completeness.ts` (run on
 * 2026-05-19, PUBLISHED only) for not delivering a practice.
 *
 * For each violator:
 *   1. Snapshot the existing body to the `revisedFrom` JSONB column
 *      (added by migration 20260629000000_phase_mindset_revised_from).
 *   2. Replace `body` with the re-authored content that intro-frames the
 *      situation in 1-2 paragraphs, delivers a practice, and closes with
 *      a forward action.
 *   3. Set status back to DRAFT so Rebecca can review before re-publish.
 *   4. Write a TutorialVersion snapshot of both pre- and post-rewrite
 *      state for the audit trail.
 *
 * Preserves: title, slug, subCategory, hero image, type, practiceType,
 * source attribution. The body is the only field changed.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/rewrite-mindset-violators.ts [--dry-run]
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir); if (parent === dir) break; dir = parent
  }
}

import type { Prisma } from '@prisma/client'

type Node = { type: string; attrs?: Record<string, unknown>; content?: Node[]; marks?: { type: string; attrs?: Record<string, unknown> }[]; text?: string }
type Doc = { type: 'doc'; content: Node[] }

const p = (text: string): Node => ({ type: 'paragraph', content: [{ type: 'text', text }] })
const h = (level: 2 | 3 | 4, text: string): Node => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text }] })
const ul = (items: Node[][]): Node => ({ type: 'bulletList', content: items.map((c) => ({ type: 'listItem', content: c })) })
const ol = (items: Node[][]): Node => ({ type: 'orderedList', content: items.map((c) => ({ type: 'listItem', content: c })) })
const pullQuote = (quote: string, attribution: string | null = null): Node => ({ type: 'pullQuote', attrs: { quote, attribution } })

function pLink(prefix: string, linkLabel: string, href: string, suffix: string): Node {
  return {
    type: 'paragraph',
    content: [
      ...(prefix ? [{ type: 'text' as const, text: prefix }] : []),
      { type: 'text', text: linkLabel, marks: [{ type: 'link', attrs: { href } }] },
      ...(suffix ? [{ type: 'text' as const, text: suffix }] : []),
    ],
  }
}

interface Rewrite {
  slug: string
  body: Doc
  /**
   * Optional: change the tutorial's `type` enum. Used for the situational
   * readings where the right shape is closer to a PRACTICE. Defaults to
   * "keep the existing type".
   */
  setType?: 'PRACTICE' | 'READING'
  /** Optional: set or change the `practiceType` enum. */
  setPracticeType?: 'TAPPING' | 'ENERGY_STATEMENT' | 'AFFIRMATION' | 'SPELL' | 'RITUAL' | 'ACTIVITY' | 'JOURNAL_PROMPT' | 'VISUALISATION' | 'MEDITATION' | 'EMBODIMENT' | 'READING'
  /** Short note that describes the change, surfaced in TutorialVersion + audit log. */
  changeNote: string
}

// ─────────────────────────────────────────────────────────────────────────────
// REWRITES
// ─────────────────────────────────────────────────────────────────────────────

const REWRITES: Rewrite[] = [
  // ── ENERGY STATEMENTS (existing bodies deliver affirmation-shape sets,
  //    not the Release/Allow pair that ENERGY_STATEMENT requires) ───────────

  {
    slug: 'my-wanting-is-sacred',
    changeNote: 'mindset-completeness: re-authored with Release/Allow pair (was affirmation-shape set)',
    body: {
      type: 'doc',
      content: [
        p('A three-minute pair of energy statements for Day 15 of the money arc. Use when the guilt of wanting more has arrived alongside the want itself.'),
        pLink('New to energy statements? Read ', 'how energy statements work', '/mindset/how-energy-statements-work', ' first.'),
        h(2, 'The practice'),
        h(3, 'Release (repeat x3)'),
        pullQuote('I am ready to release the belief that my wanting is greedy or wrong. I release it now. I release it now. I release it now.'),
        h(3, 'Allow (repeat x3)'),
        pullQuote('I am ready to align with and allow my wanting as a sacred signal of direction. I allow it now. I allow it now. I allow it now.'),
        p('Say each three times, slow, out loud or in your mind.'),
        h(2, 'When this isn\'t working'),
        p('If the Allow lands as a lie on a particular day, the guilt is louder than the want. Tap on the named guilt first, then return to the Allow. The Allow lands more easily once the charge has dropped.'),
        h(2, 'Where this practice comes from'),
        p('The Release / Allow structure is from The Money Zone (Rebecca Page, 2024), chapters 2 through 5. The Day 15 theme — wanting as direction, not greed — is from MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). The combination as a daily reset is original to the homemade.education library.'),
      ],
    },
  },

  {
    slug: 'what-is-available-to-her-is-available-to-me',
    changeNote: 'mindset-completeness: re-authored with Release/Allow pair (was affirmation-shape set)',
    body: {
      type: 'doc',
      content: [
        p('A three-minute pair of energy statements for Day 16 of the money arc. Use when another woman\'s win has triggered the feeling that abundance is for everyone except you.'),
        pLink('New to energy statements? Read ', 'how energy statements work', '/mindset/how-energy-statements-work', ' first.'),
        h(2, 'The practice'),
        h(3, 'Release (repeat x3)'),
        pullQuote('I am ready to release the belief that I am the exception, that abundance flows to others but not to me. I release it now. I release it now. I release it now.'),
        h(3, 'Allow (repeat x3)'),
        pullQuote('I am ready to align with and allow my full inclusion in the flow of wealth. I allow it now. I allow it now. I allow it now.'),
        p('Say each three times, slow, out loud or in your mind.'),
        h(2, 'When this isn\'t working'),
        p('If the Allow won\'t land, name the specific woman whose win triggered the feeling. Say the Release with her name in it: "I am ready to release the belief that what is available to [her name] is not also available to me." Specific names land more clearly than general ones.'),
        h(2, 'Where this practice comes from'),
        p('The Release / Allow structure is from The Money Zone (Rebecca Page, 2024), chapters 2 through 5. The Day 16 theme — letting go of "others can, not me" — is from MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). The trigger-from-another-woman framing is original to the homemade.education library.'),
      ],
    },
  },

  // ── ACTIVITIES (existing bodies have practice content but too thin to
  //    register as delivered; rewrite with numbered steps + close) ──────────

  {
    slug: 'two-voices-on-the-same-budget-activity',
    changeNote: 'mindset-completeness: re-authored with numbered steps + closing forward action',
    body: {
      type: 'doc',
      content: [
        p('A structured shared activity for couples who look at the same financial picture and see different things. One person narrates while the other listens; then they switch; then they name the differences. Twenty minutes total.'),
        pLink('New to activity practices? Read ', 'activities as practice', '/mindset/activities-as-practice', ' first.'),
        h(2, 'What you\'ll need'),
        ul([
          [p('One shared real financial document: the monthly budget, a bank-account summary, a savings statement, the credit-card bill. Not hypothetical numbers.')],
          [p('Twenty minutes together with no phones and no interruptions.')],
          [p('A timer.')],
        ]),
        h(2, 'The practice'),
        ol([
          [p('Sit together with the document between you. Set the timer for five minutes.')],
          [p('Pick who narrates first. The first person speaks: what do you see? What feels good in the numbers? What feels tight? What does the picture mean to you? The other person listens without responding, without correcting, without sighing. Just listens.')],
          [p('When the timer ends, swap. Reset for five minutes. The second person narrates what they see, in the same way. The first person now listens without correcting.')],
          [p('When the second timer ends, take three slow breaths together.')],
          [p('Now name the differences out loud. Not who was right. What each of you was responding to. "You went straight to the savings number. I went straight to the recurring outgoings." "You felt the bills were heavy. I felt the income was steady." That difference is the data.')],
          [p('Write down one specific thing each of you would like the other to know about how you read money. One sentence each. Keep the sentences.')],
        ]),
        h(2, 'How it adapts'),
        p('Living apart, or doing it remotely: open the same shared document on screen and run the practice on a video call. The structure is the same. Listen without responding still applies.'),
        p('When the differences feel too sharp to discuss in one sitting, stop after step 5. Sit with the data for a few days. The follow-up conversation works better when both sides have had time to absorb the other person\'s frame.'),
        p('Solo version, if your partner won\'t do it with you: write both narrations yourself, in two columns. Your reading on the left; what you imagine your partner\'s reading would be on the right. The exercise of trying to write their version slowly shifts the way you hear them when you next talk about money.'),
        h(2, 'After the practice'),
        p('Plan one specific follow-up: a money conversation, a small decision you\'ll make together, a habit you\'ll try for a month. Put it in the diary. The practice has built the shared ground; the follow-up is where you stand on it.'),
        h(2, 'Where this practice comes from'),
        p('Original to homemade.education. Draws on relationship-therapy literature on financial conflict and the "speaker / listener" structured-dialogue model used in couples work.'),
      ],
    },
  },

  {
    slug: 'write-the-price-you-want-next-to-the-price-you-charge-activity',
    changeNote: 'mindset-completeness: re-authored with numbered steps + closing forward action',
    body: {
      type: 'doc',
      content: [
        p('A short written activity for naming the pricing gap on paper. You write your current price, the price you actually want, and one sentence about what sits between them. Five minutes.'),
        pLink('New to activity practices? Read ', 'activities as practice', '/mindset/activities-as-practice', ' first.'),
        h(2, 'What you\'ll need'),
        ul([
          [p('A notebook and a pen. Handwriting matters here — the typed version doesn\'t land the same way.')],
          [p('Five minutes alone, undisturbed.')],
        ]),
        h(2, 'The practice'),
        ol([
          [p('Pick one specific thing you sell or offer: a service, a product, an hourly rate, a package. One only.')],
          [p('Write its current price on the page. Write it in full — not the rounded version, not "around X" — the exact number you actually charge today.')],
          [p('On the next line, write the price you would charge if the wobble weren\'t there. The number that has appeared in your head before and then shrunk back to the current one. Write the full version of that number too.')],
          [p('Below the two numbers, write one sentence about what sits between them. Not a paragraph. One sentence. "I\'m afraid of losing the next client." "I think my work isn\'t worth it." "I don\'t want to be seen as greedy." Whatever is true.')],
          [p('Read all three lines back to yourself. Notice the body — where does it hold? Where does it ease?')],
          [p('Close the notebook. The activity is complete.')],
        ]),
        h(2, 'How it adapts'),
        p('For multiple offers, do the exercise three times in one sitting — one page per offer. The sentence underneath each will tell you whether the wobble is offer-specific or pattern-wide.'),
        p('For employed work, substitute "the salary you would ask for in your next review" for the current price. The structure is the same.'),
        p('When the wanted number doesn\'t come — when the page stays blank under the current price — write "I don\'t know yet" and a date. Come back to the page in a week. The number often arrives once the question has been formally asked.'),
        h(2, 'After the practice'),
        p('The sentence you wrote is the starting point. Use the journal prompts on pricing wobble, or the tapping scripts on self-worth, to work with what the sentence names. Come back to the page after that practice and notice whether the gap between the two numbers has changed.'),
        h(2, 'Where this practice comes from'),
        p('Original to homemade.education. The named-gap exercise is a common shape across business coaching and self-worth literature on pricing.'),
      ],
    },
  },

  // ── SITUATIONAL READINGS (kept type=READING, body now condenses the
  //    framing and delivers a practice — journal prompts most fit the
  //    reflective situational topics) ──────────────────────────────────────

  {
    slug: 'pricing-as-energy-not-strategy-reading',
    changeNote: 'mindset-completeness: condensed framing + delivered journal-prompt practice',
    body: {
      type: 'doc',
      content: [
        p('Most people who chronically underprice already know they underprice. The strategy advice (calculate costs, research market, anchor higher) is widely read and understood. The price still drops at the last moment — because something below the strategy level overrides the plan. That something is usually a fear of being seen as greedy, of being rejected, or of overestimating your own worth. This reading frames the wobble and then walks a journal-prompt practice that names it specifically.'),
        h(2, 'What the wobble is doing'),
        p('Lowering the price before anyone objects removes the risk of an explicit no. It also removes the income, but that feels secondary to the emotional management. For many women the wobble also connects to older material: the belief that wanting more is unbecoming, that wealth draws negative attention, that asking for the full amount is the same as being difficult. The price becomes a proxy for how much space you\'re willing to take up.'),
        h(2, 'The practice'),
        p('Six journal prompts. Five minutes per prompt against a timer. Don\'t edit, don\'t re-read mid-session, don\'t move on early. ~30 minutes for the full set.'),
        h(3, '1. What is the price I would charge if there were no wobble?'),
        p('Write the full number. Don\'t round it. If the number changes as you write, write the version that came first AND the version that arrived to soften it.'),
        h(3, '2. Where did I first learn that asking for the full amount was risky?'),
        p('A specific memory, a parent\'s phrase, a teacher\'s reaction, a job where wanting more got punished. Write whatever comes.'),
        h(3, '3. Who in my life would call my wanted price "too much"?'),
        p('Names, not types. Write the names. Write the line they would use.'),
        h(3, '4. What am I afraid would happen if I charged the wanted price?'),
        p('The specific scenario, not the general fear. Who walks away? What do they say? What does it cost me?'),
        h(3, '5. What does charging the wanted price say about who I think I am?'),
        p('The identity question is usually the load-bearing one. Write what the higher price would make true about you, and notice whether that\'s the thing being avoided.'),
        h(3, '6. If the fear were gone, what would I write on the invoice tomorrow?'),
        p('Write the exact line. The full amount. The wording you\'d use.'),
        h(2, 'After the prompts'),
        p('Close the notebook. Set the pen down. One slow breath. The prompts don\'t change the price tomorrow on their own — they make visible what is overriding the price. Pair with the energy statements or tapping in this library to reduce the charge. Then write the invoice.'),
        h(2, 'Where this practice comes from'),
        p('Original to homemade.education. Draws on pricing-psychology literature and on the self-worth threads across MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025).'),
      ],
    },
  },

  {
    slug: 'teaching-children-about-money-without-passing-on-scarcity-reading',
    changeNote: 'mindset-completeness: condensed framing + delivered journal-prompt practice',
    body: {
      type: 'doc',
      content: [
        p('Most of the money education children receive is not deliberate. It arrives in the ambient data of household life: the flinch at a price, the silence when a number is too large or too small, the way adults leave the room when money talk gets difficult. Children absorb this before they have words for it — and the work the parent does on themselves changes the ambient register more than any deliberate money education does. This reading sketches the transmission, then walks a journal practice for the parent who wants to interrupt the pattern they noticed they were passing on.'),
        h(2, 'What children are absorbing'),
        p('Children read the emotional register of money, not the content. A household where money is never mentioned teaches one thing. A household where money is mentioned only with fear teaches another. By age seven or eight, most children have formed beliefs about money — is there enough, is it safe to want, do people like us have it — that run quietly in the background for decades.'),
        h(2, 'Why scarcity passes down more easily than ease'),
        p('Scarcity runs in the body: the flinch, the silence, the instinct to apologise for spending. Children copy the body before the words. A parent who says "we have plenty" while their jaw tightens at the card reader will not produce children who believe there is plenty. The deliberate moves work best when congruent with internal work; one matter-of-fact sentence in an ordinary moment teaches more than a formal lesson delivered over the top of the old pattern.'),
        h(2, 'The practice'),
        p('Five journal prompts for the parent doing the inner work. Five minutes per prompt against a timer. Write without editing.'),
        h(3, '1. What was the ambient money register of the household I grew up in?'),
        p('Tight, anxious, silent, generous, performative, controlled, chaotic? Pick the words that fit. Not the version told publicly — the version felt in the body when money came up at home.'),
        h(3, '2. Which of those registers do I notice in my own house now?'),
        p('Be specific. The actual moments. The expression on my face when the supermarket total comes up. The way I talk about prices in front of the children. The conversations I avoid.'),
        h(3, '3. What do I want my child to feel about money by the time they leave home?'),
        p('Not what I want them to know — what I want them to feel. Safe? Resourced? Capable of asking for what they need? Write the felt experience, not the curriculum.'),
        h(3, '4. What\'s the one small change in my own behaviour that would shift the ambient register most?'),
        p('Not adding a lesson. Subtracting a flinch, or replacing a silence with one sentence said calmly. The smallest concrete thing.'),
        h(3, '5. What sentence about money would I like my child to hear me say this week?'),
        p('One sentence. Said in an ordinary moment. Write the sentence. Write the moment.'),
        h(2, 'After the prompts'),
        p('Close the notebook. Carry the sentence from prompt 5 into the next week. Say it once, in the ordinary moment you named. Notice what happens in your body when you say it, and what happens in the room. Come back to the prompts in a month to track the shift.'),
        h(2, 'Where this practice comes from'),
        p('Original to homemade.education. Draws on developmental research on financial socialisation in children and on Brad Klontz\'s money-scripts literature.'),
      ],
    },
  },

  {
    slug: 'the-feast-and-famine-cycle-and-how-to-widen-the-floor',
    changeNote: 'mindset-completeness: condensed framing + delivered journal-prompt practice',
    body: {
      type: 'doc',
      content: [
        p('The feast-and-famine cycle is one of the most common patterns among self-employed people. A good month, then a slow one. A launch that works, then a lull. The cycle persists regardless of how established the business is, because it\'s not primarily a marketing problem. This reading frames the floor-and-ceiling mechanism and walks a journal practice for finding your current floor.'),
        h(2, 'What keeps the cycle in place'),
        p('Two internal patterns sustain it. The ceiling is an internal cap on how much income feels safe; when income approaches it, the energy around marketing and sales pulls back, and something always seems to go wrong at the same level. The floor is the lowest income you\'ve tolerated and recovered from; when income drops back to it, action restarts. The crisis motivates. The floor is learned, and it doesn\'t rise on its own.'),
        h(2, 'Why raising the ceiling isn\'t the goal'),
        p('Most people try to fix the cycle by chasing a higher ceiling: a better launch, a bigger audience, more offers. The pattern reasserts. The ceiling raises slightly, then income drops back proportionally. The swing just gets bigger. The work that actually breaks the cycle is raising the floor — making the old lowest level unacceptable as the new normal, through genuine identity shift rather than discipline.'),
        h(2, 'The practice'),
        p('Six journal prompts for finding your current floor and starting the work of raising it. Five minutes per prompt against a timer.'),
        h(3, '1. What is the lowest income month I have tolerated and recovered from in the last three years?'),
        p('The actual number. Not the worst-ever number — the recent floor. The one that comes back round.'),
        h(3, '2. How did I respond when income dropped to that level?'),
        p('Practically and emotionally. What did I do, what did I cut, what did I tell myself about why this was happening?'),
        h(3, '3. What is the lowest income month I would refuse to tolerate now?'),
        p('Not the one I would resent, the one I would refuse. Below this number, what changes? What action becomes non-negotiable?'),
        h(3, '4. What income identity am I currently running?'),
        p('Steady earner, feast-and-famine earner, "always one launch away", "self-employment is inherently volatile". Name it plainly.'),
        h(3, '5. What income identity do I want to be running by this time next year?'),
        p('Write the identity, not the number. "Someone whose income is reliably above £X." "Someone who saves a fixed amount every month regardless of revenue." "Someone for whom dry months don\'t feel like a threat."'),
        h(3, '6. What is one concrete action I would take this week to live as the new identity?'),
        p('The smallest thing. Set up an auto-transfer. Raise a rate. Decline one underpaid piece of work. Write what it is.'),
        h(2, 'After the prompts'),
        p('Do the one action from prompt 6 this week. Come back to the prompts in a month to track whether the floor has moved.'),
        h(2, 'Where this practice comes from'),
        p('Original to homemade.education. Adapted from the Phase 2 identity work in MONEY v2 (Rebecca J Page, 2025) and from public-domain literature on self-employment income volatility.'),
      ],
    },
  },

  {
    slug: 'the-feast-and-famine-money-cycle-explained',
    changeNote: 'mindset-completeness: condensed framing + delivered energy-statement practice',
    body: {
      type: 'doc',
      content: [
        p('The feast-and-famine cycle is partly practical — irregular income is irregular — and partly nervous system: the body has learned to expect the swing and braces for it even in months where the income is steady. This reading sketches the cycle\'s mechanism and walks a Release/Allow energy-statement pair for the gap period when the bracing has arrived too early.'),
        h(2, 'How the cycle develops'),
        p('When income arrives unreliably often enough, the nervous system adapts. It stops treating money as a stable resource and starts treating it as a scarce one — present sometimes, absent other times, unpredictable by default. The body\'s response to scarcity is preparation: hoard, spend before it disappears, brace for the shortage. The adaptation made sense when the income was historically unreliable. The problem is that it persists after the income stabilises, because the pattern of bracing is now the default.'),
        h(2, 'Why the cycle maintains itself'),
        p('In the flush period, the relief of money arriving combines with the anxiety that it won\'t last. The impulse is to spend it before it disappears, which depletes the period faster than necessary and confirms the pattern. In the gap period, the bracing learned in previous gaps returns even if the bank balance is still positive — the body is in scarcity mode before the scarcity is real. The cycle is a nervous-system state more than a budgeting problem.'),
        h(2, 'The practice'),
        p('A three-minute pair of energy statements for the gap period — when the bracing has arrived too early and the body is in scarcity mode before the bills are.'),
        pLink('New to energy statements? Read ', 'how energy statements work', '/mindset/how-energy-statements-work', ' first.'),
        h(3, 'Release (repeat x3)'),
        pullQuote('I am ready to release the bracing my body has learned for the famine month. I release it now. I release it now. I release it now.'),
        h(3, 'Allow (repeat x3)'),
        pullQuote('I am ready to align with and allow steady income and a level pool. I allow it now. I allow it now. I allow it now.'),
        p('Say each three times, slow, out loud or in your mind. Hand on chest.'),
        h(2, 'When this isn\'t working'),
        p('If the Allow lands as a lie because the next inflow date genuinely is unknown, that\'s real material — not resistance. Tap on the named uncertainty first. Once the charge of the unknown has reduced, the Allow lands more easily.'),
        h(2, 'Where this practice comes from'),
        p('The nervous-system framing of income irregularity is documented across stress physiology and somatic-therapy literature. The Release / Allow pair is from The Money Zone (Rebecca Page, 2024). The feast-or-famine focus is from Day 4 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025).'),
      ],
    },
  },

  {
    slug: 'the-if-i-had-more-money-i-would-trap',
    changeNote: 'mindset-completeness: condensed framing + delivered journal-prompt practice',
    body: {
      type: 'doc',
      content: [
        p('The "if I had more money I would" sentence is one of the most common money patterns there is. The holiday that waits for the raise. The business idea shelved until there\'s a runway. The thing you actually want, deferred to a future version of your finances that may or may not arrive. This reading frames the deferral mechanism and walks a journal-prompt practice for identifying what specifically is being held.'),
        h(2, 'Why it works as a trap'),
        p('The trap has two mechanisms. First, deferring what you want creates the internal experience of scarcity — the exact energetic state that keeps money away. Your baseline is one of not having; functionally, that\'s what persists. Second, the deferred thing is often evidence of the identity you\'re waiting to inhabit. The holiday, the course, the studio space are markers of the version of yourself that already has the money. Waiting for the money first reverses the causal order; identity usually comes before external reality matches it.'),
        h(2, 'The difference between deferral and practicality'),
        p('Not all waiting is the trap. Saving a deposit for a house is practical planning. The trap is when the waiting is indefinite, tied to a threshold that keeps moving, or attached to things that could be done now in a smaller form. If the sentence has been there for three years and the threshold hasn\'t been reached, that\'s the pattern.'),
        h(2, 'The practice'),
        p('Five journal prompts for naming what is being deferred and why. Five minutes per prompt against a timer.'),
        h(3, '1. What are three "if I had more money I would" sentences I am currently running?'),
        p('Write the three. The specific ones. The trip, the course, the move, the rest. The actual deferred things.'),
        h(3, '2. How long has each of those been on the list?'),
        p('A year, three years, ten? Write the years. Notice which ones have been there longest.'),
        h(3, '3. What\'s the smallest version of each that I could do right now?'),
        p('Not the full version. The smallest practical version that would touch the same identity. A day trip instead of a fortnight away. A library book instead of a course. A weekend retreat instead of the studio.'),
        h(3, '4. What identity is the deferred thing a marker of?'),
        p('What kind of person owns / does / takes that thing? Write the identity, not the activity. "Someone who travels for pleasure." "Someone who invests in their own growth." "Someone whose work has space."'),
        h(3, '5. What would actually change if I let myself live a version of that identity now, at a smaller scale?'),
        p('Practical change and felt change. Not theoretical — the actual difference in the body of stopping the deferral, even at a smaller scale.'),
        h(2, 'After the prompts'),
        p('Pick one of the three sentences from prompt 1 and do its smallest version this week. The deferral pattern breaks through action at any scale, not through waiting for the right scale.'),
        h(2, 'Where this practice comes from'),
        p('Original to homemade.education. Draws on identity-first manifestation literature and on the receiving threads in MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025).'),
      ],
    },
  },

  {
    slug: 'when-the-money-flow-reverses-supporting-your-parents-reading',
    changeNote: 'mindset-completeness: re-authored to deliver tapping + Release/Allow + journal practice for the role-shift grief (Rebecca\'s flagged example)',
    body: {
      type: 'doc',
      content: [
        p('At some point for many women, the financial flow reverses. The people who provided for you begin to need provision. The role reversal carries a specific tangle of guilt, obligation, resentment, and fear — none of which makes you a bad daughter. This reading walks a tapping round, a Release/Allow pair, and a journal-prompt set for the role-shift grief itself.'),
        h(2, 'The feelings that arrive with the logistics'),
        p('Guilt about having more than the people who raised you. Obligation, sometimes indistinguishable from love. Resentment that builds quietly when giving is expected rather than chosen. Fear underneath all of it: that supporting them will compromise what you have built, and the further fear that noticing the fear makes you a bad daughter. The emotional complexity is proportionate to the situation.'),
        h(2, 'The practice'),
        pLink('New to tapping? Read ', 'how EFT tapping works', '/mindset/how-eft-tapping-works', ' first.'),
        h(3, 'Tapping round on the role-shift'),
        h(4, 'Karate chop'),
        ul([
          [p('Even though the flow has reversed and I am now the one providing, I deeply and completely accept myself.')],
          [p('Even though I feel guilt and resentment alongside the love, I deeply and completely accept myself.')],
          [p('Even though I am afraid this will cost me what I\'ve built, I deeply and completely accept myself.')],
        ]),
        h(4, 'Tapping round'),
        ul([
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Eyebrow:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' They should still be the strong ones.' }] }],
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Side of eye:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' I am the one carrying this now.' }] }],
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Under eye:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' The grief of the role shift.' }] }],
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Under nose:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' Guilt that I have more.' }] }],
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Chin:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' Resentment I am not allowed to speak.' }] }],
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Collarbone:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' Fear of what this will cost me.' }] }],
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Under arm:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' This is heavier than I expected.' }] }],
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Top of head:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' The role has reversed and I am here.' }] }],
        ]),
        h(4, 'Reframe round'),
        ul([
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Eyebrow:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' I release the feeling that they should still be the strong ones.' }] }],
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Side of eye:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' I allow myself to be the one who carries this now.' }] }],
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Under eye:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' I can grieve the shift and still give.' }] }],
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Under nose:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' I am allowed to keep what I have built.' }] }],
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Chin:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' I can name my limits without losing my love.' }] }],
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Collarbone:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' I trust that giving is sustainable when it has limits.' }] }],
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Under arm:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' I can be a good daughter and still protect my life.' }] }],
          [{ type: 'paragraph', content: [{ type: 'text', text: 'Top of head:', marks: [{ type: 'bold' }] }, { type: 'text', text: ' I am the one who carries this, and I am supported too.' }] }],
        ]),
        p('Three passes through each round. Five to seven taps per point.'),
        h(3, 'Energy statement pair'),
        pullQuote('I release the feeling that they should still be the strong one. I release it now. I release it now. I release it now.'),
        pullQuote('I allow myself to be the one who carries this now, without losing my own life. I allow it now. I allow it now. I allow it now.'),
        h(3, 'Journal prompts'),
        p('Three prompts. Five minutes each against a timer. Write without editing.'),
        h(4, '1. What changed in the relationship when the flow reversed?'),
        p('Practically and emotionally. Write specifically.'),
        h(4, '2. What feels right about being able to give back?'),
        p('Don\'t skip this one even if the resentment is loud. There is usually something true here.'),
        h(4, '3. What is one specific limit I need to set on what I can give, said calmly and clearly?'),
        p('Write the limit. Write the sentence you would use. Then read it back.'),
        h(2, 'After the practice'),
        p('Have the conversation with your parent this month if you haven\'t had it yet. Use the sentence from prompt 3 as the line. Come back to this practice when the resentment or grief feels heavy again.'),
        h(2, 'Where this practice comes from'),
        p('Original to homemade.education. The role-shift grief framing is adapted from feedback_mindset_voice.md reference shape "When the Money Flow Reverses". The Release / Allow structure is from The Money Zone (Rebecca Page, 2024).'),
      ],
    },
  },

  {
    slug: 'when-the-sleepless-years-leave-a-mark',
    changeNote: 'mindset-completeness: re-authored to deliver Release/Allow pair + journal practice for the sleep-recovery residue',
    body: {
      type: 'doc',
      content: [
        p('When sleep difficulty lasts a long time, it tends to leave something behind after the nights improve. Resentment toward the body that didn\'t cooperate. Hypervigilance that monitors sleep and holds the nervous system in a light alert state. Shame about the years it took to fix. This reading frames the residue and walks a Release/Allow pair and a journal-prompt practice for releasing it.'),
        h(2, 'What the difficult years leave behind'),
        p('Low-level resentment toward the body, because it lets you down in a way with real, visible consequences. Hypervigilance — monitoring sleepiness, calculating hours, dreading the gap between getting into bed and actually sleeping. Shame, because sleep difficulty isn\'t well understood by people who haven\'t experienced it. Many people carry a private conviction that they should have been able to fix it by sheer will.'),
        h(2, 'What forgiving it actually means'),
        p('Not a verdict that the years were fine. They weren\'t fine. The fatigue was real, the cost was real, and you are allowed to know that. Forgiveness, more practically: releasing the ongoing charge. The patterns formed in response to something real, but they\'re now running past their useful life. The body was doing its best with what it had.'),
        h(2, 'The practice'),
        pLink('New to energy statements? Read ', 'how energy statements work', '/mindset/how-energy-statements-work', ' first.'),
        h(3, 'Release (repeat x3)'),
        pullQuote('I am ready to release the body-blame, the hypervigilance, and the shame I have carried since the sleepless years. I release it now. I release it now. I release it now.'),
        h(3, 'Allow (repeat x3)'),
        pullQuote('I am ready to align with and allow trust in my body and rest as my new normal. I allow it now. I allow it now. I allow it now.'),
        p('Say each three times, slow, hand on heart, before bed.'),
        h(3, 'Journal prompts'),
        p('Four prompts. Five minutes each against a timer. Use a single evening when the nights have been mostly stable for a few weeks.'),
        h(4, '1. What did the sleepless years cost me that I have never named out loud?'),
        p('Write the specific costs. Missed events, missed sharpness, missed self. The full list.'),
        h(4, '2. Which of those costs am I still angry about, and at whom (or what)?'),
        p('The body, the doctors, the situation, the period of life. Write the names.'),
        h(4, '3. What patterns from those years am I still running even though the sleep has improved?'),
        p('The hypervigilance, the bedtime rituals built from fear, the dread before getting in. Name them.'),
        h(4, '4. What would I like my body to know now that the emergency is over?'),
        p('Write the sentence. Read it back. Say it aloud once, hand on chest.'),
        h(2, 'After the practice'),
        p('Carry the sentence from prompt 4 into the next week. Say it once each night as you get into bed. Come back to the prompts in a month to notice what has shifted.'),
        h(2, 'Where this practice comes from'),
        p('Original to homemade.education. Draws on the Day 16 tapping framework from SLEEP: A 30-Day Tapping Intensive (Rebecca J Page, 2025), and on self-compassion research (Kristin Neff and colleagues).'),
      ],
    },
  },

  {
    slug: 'when-two-money-histories-share-a-bank-account-reading',
    changeNote: 'mindset-completeness: re-authored to deliver paired-activity + Release/Allow + journal practice for couples (Rebecca\'s flagged example)',
    body: {
      type: 'doc',
      content: [
        p('Each person in a partnership arrives with a fully formed relationship with money built from years of experience before the partnership began. When two money histories share a bank account, the same disagreement tends to keep returning — because the argument is never really about the amount; it is about what the amount means. This reading walks a paired writing practice, a Release/Allow pair, and a journal-prompt set to break the loop.'),
        h(2, 'Money histories don\'t merge at the wedding'),
        p('One person grew up with scarcity and learned that money is precarious; the other grew up with enough and learned that money is manageable. One learned that spending is how you show love; the other learned that saving is how you show care. These aren\'t opinions about money — they are money identities, built early and held deeply. When they share a financial life, they tend to produce the same argument repeatedly, because each person is responding from a different frame and the frames are different.'),
        h(2, 'The practice'),
        h(3, 'Paired writing — money histories on paper'),
        p('Each of you, separately and at the same time, writes three sentences about how money was handled in your childhood home. Not opinions, not analysis — three plain sentences. Specific incidents, atmospheres, repeated phrases. Take five minutes each.'),
        p('Then trade pages. Read each other\'s three sentences aloud, slowly. Don\'t interrupt. Don\'t respond. Just hear them.'),
        h(3, 'Release / Allow pair'),
        pLink('New to energy statements? Read ', 'how energy statements work', '/mindset/how-energy-statements-work', ' first.'),
        pullQuote('I am ready to release the feeling that we should agree on everything about money. I release it now. I release it now. I release it now.'),
        pullQuote('I am ready to align with and allow our two histories as part of how we build our home together. I allow it now. I allow it now. I allow it now.'),
        p('Say each three times, separately. Each of you, on your own page.'),
        h(3, 'Journal prompts'),
        p('Five prompts. Five minutes each. Each partner answers separately, in their own notebook.'),
        h(4, '1. Which money habit of theirs was I quick to judge?'),
        p('Be specific. Name the habit. Notice the judgement.'),
        h(4, '2. What does that habit actually keep safe for them?'),
        p('Their childhood frame. What did the habit do for them when it was formed?'),
        h(4, '3. Which money habit of mine have they pushed back on?'),
        p('The one you defend hardest is often the one most worth examining.'),
        h(4, '4. What does my habit actually keep safe for me?'),
        p('Your frame. What it does for you, not what it does for the household.'),
        h(4, '5. What is one habit we could agree on, just for this month?'),
        p('Write the habit. Small. Specific. Trial-shaped, not forever-shaped.'),
        h(2, 'After the practice'),
        p('Have the conversation this weekend. Use the answers to prompt 5 as the starting point. The aim is not to resolve every difference — it is to share one habit for one month and see what changes.'),
        h(2, 'Where this practice comes from'),
        p('Original to homemade.education. The paired-history writing practice is adapted from couples-therapy literature on financial conflict. The Release / Allow structure is from The Money Zone (Rebecca Page, 2024). The reference shape for this entry is in feedback_mindset_voice.md "When Two Money Histories Share a Bank Account".'),
      ],
    },
  },

  {
    slug: 'when-women-trigger-each-other-about-money',
    changeNote: 'mindset-completeness: condensed framing + delivered journal-prompt practice',
    body: {
      type: 'doc',
      content: [
        p('The triggered feeling when another woman wins financially is common enough to examine without shame. The sense that her win costs you something is rarely about her — it is about the gap between where you are and where you want to be, which her win makes more visible. This reading frames the mechanism and walks a journal practice for what the trigger is pointing at in you.'),
        h(2, 'Why same-group comparison is sharper'),
        p('Social comparison research consistently shows that people compare more sharply within their own group than across distant groups. A woman who earns roughly what you earn is a more potent comparison point than a billionaire whose situation feels irrelevant. Her win sits at just the right distance: close enough to feel adjacent, successful enough to feel like a measurement. This is why a friend\'s business success can produce more discomfort than a news story about a stranger\'s wealth.'),
        h(2, 'The scarcity model runs underneath'),
        p('The trigger often runs on an implicit model that money is finite in a way that makes one person\'s gain another\'s loss. The model isn\'t conscious. Most people who experience the comparison trigger would, if asked, say that logically her success doesn\'t affect their chances. The logic doesn\'t help because the model is running below the level of conscious reasoning, with roots in household experience where money was limited in real terms and one person\'s having something did mean another\'s going without.'),
        h(2, 'What the trigger points at'),
        p('The feeling is usually most acute when something in your own money situation feels stuck, behind, or not moving at the pace you wanted. The trigger isn\'t really about her — it\'s about the gap between where you are and where you want to be, which her win made more visible. That makes it useful rather than embarrassing. It is pointing at something specific.'),
        h(2, 'The practice'),
        p('Five journal prompts for when the trigger has just landed. Five minutes per prompt against a timer. Write without editing.'),
        h(3, '1. Whose recent win triggered this?'),
        p('Her name. The specific win. Don\'t soften it.'),
        h(4, '2. What about her win, specifically, hit me?'),
        p('The number? The ease with which it happened? The visibility? The age she got there? Write the specific element.'),
        h(4, '3. What is the gap in my own situation that her win made visible?'),
        p('The thing that\'s stuck, behind, or not moving. Name it concretely.'),
        h(4, '4. What is the scarcity-model story I noticed running when the trigger hit?'),
        p('"There\'s only room for so many." "If she has it, I won\'t." "I missed my chance." Write the story plainly. Notice it.'),
        h(4, '5. What is the one thing in my own situation I could move on this week?'),
        p('Not her work. Mine. The specific action the trigger pointed at.'),
        h(2, 'After the prompts'),
        p('Do the action from prompt 5 this week. The trigger is information — once acted on, the charge drops. Come back to her win in a month and notice whether the feeling has shifted.'),
        h(2, 'Where this practice comes from'),
        p('Original to homemade.education. Draws on social-comparison research, female friendship literature, and money-psychology work on the comparison response.'),
      ],
    },
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// Driver
// ─────────────────────────────────────────────────────────────────────────────

interface PerSlugReport {
  slug: string
  beforeStatus: string
  afterStatus: string
  bodyChanged: boolean
  typeChanged: boolean
  practiceTypeChanged: boolean
  changeNote: string
}

function parseFlags(argv: string[]): { dryRun: boolean } {
  return { dryRun: argv.includes('--dry-run') }
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2))
  console.log(`rewrite-mindset-violators: dryRun=${flags.dryRun}, rewrites=${REWRITES.length}`)

  const { prisma } = await import('../src/index.js')
  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
    select: { id: true },
  })
  if (!author) throw new Error('Author rebecca@homemade.education not found.')

  const existing = await prisma.tutorial.findMany({
    where: { slug: { in: REWRITES.map((r) => r.slug) } },
    select: {
      id: true, slug: true, title: true, subtitle: true, excerpt: true,
      body: true, status: true, type: true, practiceType: true, revisedFrom: true,
    },
  })
  if (existing.length !== REWRITES.length) {
    const found = new Set(existing.map((x) => x.slug))
    const missing = REWRITES.map((r) => r.slug).filter((s) => !found.has(s))
    throw new Error(`Missing rows for: ${missing.join(', ')}`)
  }
  console.log(`Found ${existing.length} target rows.`)

  const report: PerSlugReport[] = []
  for (const r of REWRITES) {
    const ex = existing.find((x) => x.slug === r.slug)!
    const tag = `[${r.slug}]`
    const newBodyStr = JSON.stringify(r.body)
    const oldBodyStr = JSON.stringify(ex.body)
    const bodyChanged = newBodyStr !== oldBodyStr
    const newType = r.setType ?? ex.type
    const typeChanged = newType !== ex.type
    const newPT = r.setPracticeType ?? ex.practiceType
    const practiceTypeChanged = newPT !== ex.practiceType

    if (flags.dryRun) {
      console.log(`${tag} DRY bodyChanged=${bodyChanged} typeChanged=${typeChanged} practiceTypeChanged=${practiceTypeChanged}`)
      report.push({
        slug: r.slug, beforeStatus: ex.status, afterStatus: 'DRAFT',
        bodyChanged, typeChanged, practiceTypeChanged, changeNote: r.changeNote,
      })
      continue
    }

    await prisma.$transaction(async (tx) => {
      // Snapshot pre-rewrite state into TutorialVersion.
      await tx.tutorialVersion.create({
        data: {
          tutorialId: ex.id,
          title: ex.title,
          subtitle: ex.subtitle,
          excerpt: ex.excerpt,
          body: ex.body as Prisma.InputJsonValue,
          status: ex.status,
          authorId: author.id,
          changeNote: `${r.changeNote} (pre-rewrite snapshot)`,
        },
      })
      // Apply rewrite — body replaced, revisedFrom captures old body
      // (only if not already populated by a prior rewrite — idempotent).
      const dataUpdate: Prisma.TutorialUpdateInput = {
        body: r.body as unknown as Prisma.InputJsonValue,
        status: 'DRAFT',
      }
      if (!ex.revisedFrom) {
        dataUpdate.revisedFrom = ex.body as Prisma.InputJsonValue
      }
      if (r.setType) dataUpdate.type = r.setType
      if (r.setPracticeType) dataUpdate.practiceType = r.setPracticeType
      await tx.tutorial.update({ where: { id: ex.id }, data: dataUpdate })
      // Post-rewrite version snapshot.
      await tx.tutorialVersion.create({
        data: {
          tutorialId: ex.id,
          title: ex.title,
          subtitle: ex.subtitle,
          excerpt: ex.excerpt,
          body: r.body as unknown as Prisma.InputJsonValue,
          status: 'DRAFT',
          authorId: author.id,
          changeNote: `${r.changeNote} (post-rewrite, status=DRAFT)`,
        },
      })
    })
    report.push({
      slug: r.slug, beforeStatus: ex.status, afterStatus: 'DRAFT',
      bodyChanged, typeChanged, practiceTypeChanged, changeNote: r.changeNote,
    })
    console.log(`${tag} rewritten, status PUBLISHED → DRAFT`)
  }

  const reportFile = resolve(__dirname, '..', '..', '..', 'docs', 'mindset-completeness-rewrite-report-2026-05-19.json')
  writeFileSync(reportFile, JSON.stringify({ runDate: new Date().toISOString(), dryRun: flags.dryRun, report }, null, 2), 'utf8')
  console.log(`\nReport written: ${reportFile}`)

  if (!flags.dryRun) {
    await prisma.auditLog.create({
      data: {
        actorId: author.id,
        action: 'tutorial.rewrite-mindset-violators',
        resource: 'tutorials',
        metadata: {
          runDate: new Date().toISOString().slice(0, 10),
          rewriteCount: report.length,
          movedToDraft: report.filter((r) => r.afterStatus === 'DRAFT').length,
          slugs: report.map((r) => r.slug),
        } as Prisma.InputJsonValue,
      },
    })
  }
  console.log('\nDONE')
  for (const r of report) console.log(`  ${r.slug}: ${r.beforeStatus} → ${r.afterStatus}`)

  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); process.exit(1) })
