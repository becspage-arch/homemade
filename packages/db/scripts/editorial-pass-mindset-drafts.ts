/**
 * Editorial pass + publish for the 11 DRAFT mindset tutorials authored
 * before the 2026-05-18 voice rules locked. Rewrites titles, subtitles,
 * excerpts, and bodies against the current `feedback_mindset_voice.md`
 * rules; sources a hero image where it can (mindset somatic types go
 * straight to Flux; others try Unsplash / Pexels first); falls through
 * to PROCEDURAL_CARD when sourcing returns no usable image. Snapshots a
 * TutorialVersion before each mutation and writes a single summary
 * AuditLog row at the end.
 *
 * Idempotent: re-running on an already-PUBLISHED row just updates the
 * editorial content and refreshes audit.
 *
 * Run:
 *   pnpm --filter @homemade/db exec tsx scripts/editorial-pass-mindset-drafts.ts [--dry-run] [--skip-images]
 */

import { config as loadEnv } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { existsSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
{
  let dir = __dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma, r2Upload } from '../src'
import type { Prisma } from '@prisma/client'
import { sourceHeroImage } from '../../../apps/web/src/lib/image-sourcing/orchestrator'

interface CliFlags { dryRun: boolean; skipImages: boolean }

function parseFlags(argv: string[]): CliFlags {
  return {
    dryRun: argv.includes('--dry-run'),
    skipImages: argv.includes('--skip-images'),
  }
}

type Node = { type: string; attrs?: Record<string, unknown>; content?: Node[]; marks?: { type: string; attrs?: Record<string, unknown> }[]; text?: string }
type Doc = { type: 'doc'; content: Node[] }

const p = (text: string): Node => ({ type: 'paragraph', content: [{ type: 'text', text }] })
const h = (level: 2 | 3 | 4, text: string): Node => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text }] })
const ul = (items: Node[][]): Node => ({ type: 'bulletList', content: items.map((c) => ({ type: 'listItem', content: c })) })
const pullQuote = (quote: string, attribution: string | null = null): Node => ({ type: 'pullQuote', attrs: { quote, attribution } })

function pBoldThen(boldText: string, plainText: string): Node {
  return {
    type: 'paragraph',
    content: [
      { type: 'text', text: boldText, marks: [{ type: 'bold' }] },
      { type: 'text', text: plainText },
    ],
  }
}

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
  title: string
  subtitle: string
  excerpt: string
  body: Doc
  /** PRACTICE | READING — corrects rows where it was wrong before. */
  expectedType: 'PRACTICE' | 'READING'
}

const REWRITES: Rewrite[] = [
  // 1. THE DEPOSIT COIN — the one Rebecca used as the reference example.
  {
    slug: 'the-deposit-coin',
    title: 'The deposit coin',
    subtitle: 'A manifestation activity for a specific house, flat, or piece of land.',
    excerpt:
      'A manifestation activity for a specific house, flat, or piece of land you\'d like to own. Leave a coin on the property line as if you are putting a deposit down. The goal is a real feeling of actually purchasing. A physical and energetic deposit towards what you want.',
    body: {
      type: 'doc',
      content: [
        p('A manifestation activity for a specific house, flat, or piece of land you\'d like to own. Leave a coin on the property line as if you are putting a deposit down. The goal is a real feeling of actually purchasing. A physical and energetic deposit towards what you want.'),
        h(2, 'What you\'ll need'),
        p('One coin. The denomination doesn\'t matter; the choice does. The address of a property you can reach.'),
        h(2, 'The practice'),
        h(3, 'Walk to the property'),
        p('Set out with the coin. On the way, picture that you\'re going to put the deposit down. A specific picture, not a vague one: the meeting, who you\'re meeting, the paperwork on the table when you arrive. You\'re not pretending; you\'re rehearsing.'),
        h(3, 'Place the coin'),
        p('At the property, find a spot on the property line where the coin can sit out of the way. The corner of a wall, tucked into a hedge, behind a fence post. As you place it, picture that you\'re handing the deposit over. One sentence in the mind or under the breath: "This is mine. This is the deposit."'),
        p('Don\'t hide the coin permanently. Someone else finding it is part of how the activity moves the energy.'),
        h(3, 'Walk away'),
        p('Turn and walk away from the property. As you walk, picture that the purchase is confirmed. The deposit is down. The paperwork is signed. The next step is moving in. Walk for at least two minutes in this state before checking the phone or starting the car. The walk-away is the bit that does the work.'),
        h(2, 'How it adapts'),
        p('If the property is too far to walk or drive to, place the coin on a printed photograph of it at home and walk away from the table for two minutes.'),
        p('If you can\'t reach the property line without being seen, post the coin through the letterbox, slip it under a stone near the boundary, drop it into a hedge by the gate, or leave it on a doorstep.'),
        p('If the target isn\'t a house, place the coin on what stands in for the target. On the land, for a piece of land. On the doorstep, for business premises. In the doorway of a school, for a child\'s place. On the spine of a book, for a course or qualification.'),
        p('If you don\'t have a coin to hand, a small object you would notice losing works the same way: a ring, a pebble, a key from an old set. The point is that the object cost you something, not that the object is currency.'),
        h(2, 'Where this practice comes from'),
        p('Deposit-token activities and walk-by manifestation practices appear across folk magic, property-manifesting communities, and energetic-deposit traditions. The pattern is documented in self-help and folk-craft sources going back decades. The specific staged version here (walk, place, walk away) is original to the homemade.education library.'),
      ],
    },
    expectedType: 'PRACTICE',
  },

  // 2. I AM ALLOWED TO WANT THIS — energy statement, three-min.
  {
    slug: 'i-am-allowed-to-want-this',
    title: 'I am allowed to want this',
    subtitle: 'A release-and-allow pair for the moment guilt arrives alongside a real want.',
    excerpt:
      'A pair of energy statements for the moment a real want surfaces and the guilt arrives with it. Three repetitions of each. Use on self-worth, money, or abundance wants.',
    body: {
      type: 'doc',
      content: [
        p('A pair of energy statements for the moment a real want surfaces and the guilt arrives with it. Three repetitions of each. Use on self-worth, money, or abundance wants.'),
        pLink('New to energy statements? Read ', 'how energy statements work', '/mindset/how-energy-statements-work', ' first.'),
        h(2, 'The practice'),
        h(3, 'Release (repeat x3)'),
        pullQuote('I am ready to release the belief that wanting this much is wrong. I release it now. I release it now. I release it now.'),
        h(3, 'Allow (repeat x3)'),
        pullQuote('I am ready to align with and allow myself to want this fully. I allow it now. I allow it now. I allow it now.'),
        p('Say each three times, slow, out loud or in your mind.'),
        h(2, 'How it adapts'),
        p('Swap "wanting this much is wrong" for the wording that names what\'s actually true for you. "Wanting this much is greedy." "Wanting this kind of life is selfish." "Women in my family don\'t want things like this." Specificity makes the Release land.'),
        p('When the Allow doesn\'t land — when the words go past without registering — name a smaller truer version first. "I am ready to consider allowing myself to want this." Build up from what is true.'),
        p('Do this silently when you\'re somewhere you can\'t speak. The three repetitions still work; the mouthed or held-in-mind version is the standard form for daytime use.'),
        p('When the guilt is loud enough that the Allow won\'t land at all, tap first. The tapping rounds in the library work the named feeling; once the charge has dropped, the Allow lands more easily.'),
        h(2, 'When this isn\'t working'),
        pLink('', 'Tapping for daily money panic', '/mindset/tapping-for-daily-money-panic', ' covers the morning version. Tap, then return to these statements.'),
        h(2, 'Where this practice comes from'),
        p('The Release / Allow structure is from The Money Zone (Rebecca Page, 2024), chapters 2 through 5. The theme — releasing guilt around wanting wealth — is adapted from Day 15 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). The combination is original to the homemade.education library.'),
      ],
    },
    expectedType: 'PRACTICE',
  },

  // 3. THE CALM & SAFE MONEY RESET — ritual.
  {
    slug: 'the-calm-and-safe-money-reset',
    title: 'The Calm & Safe Money Reset',
    subtitle: 'A weekly ritual that closes the week\'s accumulated money stress.',
    excerpt:
      'A Sunday-evening ritual that closes the week\'s accumulated money stress and sets the next week up. Five parts: Prepare, Release, Allow, Integrate, Anchor.',
    body: {
      type: 'doc',
      content: [
        p('A Sunday-evening ritual that closes the week\'s accumulated money stress and sets the next week up. Five parts: Prepare, Release, Allow, Integrate, Anchor.'),
        pLink('New to rituals? Read ', 'how rituals work', '/mindset/how-rituals-work', ' first.'),
        h(2, 'What you\'ll need'),
        p('A candle and a match (a glass of water if no candle is to hand). A pen and one line of paper. Ten or fifteen minutes alone, somewhere quiet.'),
        h(2, 'The practice'),
        h(3, 'Prepare'),
        p('Sit somewhere quiet. Light the candle. Take three slow breaths. Picture the week\'s bills, accounts, money conversations, and unresolved transfers in front of you. Not the resolved version, the actual version.'),
        h(3, 'Release (repeat x3)'),
        pullQuote('I am ready to release all fear, stress, and survival energy around money. I release it now. I release it now. I release it now.'),
        h(3, 'Allow (repeat x3)'),
        pullQuote('I am ready to align with and allow calm, peace, and safety with money. I allow it now. I allow it now. I allow it now.'),
        h(3, 'Integrate'),
        p('Close your eyes. Picture a warm light filling the body, head to foot. Sit with the image for a minute. One slow breath in, one slow breath out.'),
        h(3, 'Anchor'),
        p('Open your eyes. Write the anchor sentence in your own handwriting on the line of paper:'),
        pullQuote('This week, I am grateful that I am learning to feel safe with money.'),
        p('Say the sentence aloud, once. Put the paper somewhere you\'ll see it during the week (a kitchen surface, the inside of a notebook, the wallet). Blow out the candle.'),
        h(2, 'How it adapts'),
        p('Run it on a different evening if Sunday isn\'t right. The "close one week, open the next" framing works on any day; pick the day that genuinely marks the gap between two weeks for you.'),
        p('If no candle is to hand, a glass of water reads the same way for the Prepare and Integrate steps. The flame on a phone screen also works.'),
        p('If you can\'t write the anchor sentence on paper, type it into a note that you\'ll see during the week. The handwritten version lands more firmly; the typed version still anchors.'),
        p('If there\'s no privacy at home, run it in the bathroom (door locked, glass of water on the side) or in the car after parking. The five parts run in ten minutes anywhere.'),
        p('Substitute the wording where it fits the week. "I am ready to release the panic about the tax bill." "I am ready to align with and allow steady income from the new contract." Specificity makes the rite land.'),
        h(2, 'Where this practice comes from'),
        p('From Week 1 of The Money Journal: 12 Weeks to Peace, Freedom & Overflow (Rebecca J Page, 2025). The five-part Prepare / Release / Allow / Integrate / Anchor structure runs across all twelve weekly rituals in the source. The Release and Allow statements are reproduced from the source ritual; the anchor sentence is from the same source.'),
      ],
    },
    expectedType: 'PRACTICE',
  },

  // 4. TAPPING FOR DAILY MONEY PANIC — tapping script.
  {
    slug: 'tapping-for-daily-money-panic',
    title: 'Tapping for daily money panic',
    subtitle: 'A morning script for the moment money worry has already arrived.',
    excerpt:
      'A short tapping script for the morning. Use when money worry has already arrived: checking the bank balance, running the numbers, the feeling of being behind before the day starts. One karate-chop set-up, one tapping round, one reframe round.',
    body: {
      type: 'doc',
      content: [
        p('A tapping script for recurring morning money worry. The script targets the kind of worry that surfaces before the day starts: checking the bank balance, running the numbers in the shower, the feeling of being behind before anything has happened.'),
        pLink('New to tapping? Read ', 'how EFT tapping works', '/mindset/how-eft-tapping-works', ' first.'),
        h(2, 'The practice'),
        h(3, 'Karate chop'),
        ul([
          [p('Even though I wake up worrying about money, I deeply and completely accept myself.')],
          [p('Even though I feel a knot in my stomach when I think about bills, I deeply and completely accept myself.')],
          [p('Even though it feels like there\'s never enough, I deeply and completely accept myself.')],
        ]),
        h(3, 'Tapping round'),
        ul([
          [pBoldThen('Eyebrow:', ' I wake up already stressed about money.')],
          [pBoldThen('Side of eye:', ' I keep running numbers in my head.')],
          [pBoldThen('Under eye:', ' I feel pressure before the day begins.')],
          [pBoldThen('Under nose:', ' I\'m scared of not covering everything.')],
          [pBoldThen('Chin:', ' It feels like I\'m always behind.')],
          [pBoldThen('Collarbone:', ' I\'m tired of living in this tension.')],
          [pBoldThen('Under arm:', ' I feel trapped by constant worry.')],
          [pBoldThen('Top of head:', ' This money panic sits heavy in my chest.')],
        ]),
        h(3, 'Reframe round'),
        ul([
          [pBoldThen('Eyebrow:', ' I give myself permission to breathe right now.')],
          [pBoldThen('Side of eye:', ' I choose calm even before anything changes.')],
          [pBoldThen('Under eye:', ' I am here, in this moment.')],
          [pBoldThen('Under nose:', ' I allow a sense of ease with money.')],
          [pBoldThen('Chin:', ' I trust solutions can unfold step by step.')],
          [pBoldThen('Collarbone:', ' I welcome support I can\'t yet see.')],
          [pBoldThen('Under arm:', ' I open to steady income and relief.')],
          [pBoldThen('Top of head:', ' I invite peace around money today.')],
        ]),
        p('Tap each round three times before moving on. Total: about five minutes.'),
        h(2, 'How it adapts'),
        p('Rewrite the lines to name what\'s actually true today. "I keep running numbers" can become "I keep checking the overdraft" or "I\'m bracing for the rent direct debit." The eight-point structure holds; the words are adjustable.'),
        p('When you can\'t tap aloud — on the train, in the office bathroom, in bed next to a sleeping partner — say the lines silently. The tapping itself still works.'),
        p('When the hands are full or cold, tap one-sided with the same hand cycling through the points. The script works the same way.'),
        p('When five minutes isn\'t available, run the karate chop and one tapping round only. Skip the reframe. The shorter version takes ninety seconds and takes the edge off.'),
        h(2, 'When this isn\'t working'),
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'If a tapping round on its own isn\'t shifting the worry, pair it with an energy statement. ' },
            { type: 'text', text: 'I am allowed to want this', marks: [{ type: 'link', attrs: { href: '/mindset/i-am-allowed-to-want-this' } }] },
            { type: 'text', text: ' works well after this script. For a weekly reset rather than a daily one, use ' },
            { type: 'text', text: 'the Calm & Safe Money Reset', marks: [{ type: 'link', attrs: { href: '/mindset/the-calm-and-safe-money-reset' } }] },
            { type: 'text', text: '.' },
          ],
        },
        h(2, 'Where this practice comes from'),
        p('From Day 1 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025), p. 29. The eight-line tapping round and the eight-line reframe round are reproduced from the source; the surrounding framing is condensed for the library.'),
      ],
    },
    expectedType: 'PRACTICE',
  },

  // 5. BODY SCAN FOR SLEEP — meditation script.
  {
    slug: 'body-scan-for-sleep',
    title: 'Body scan for sleep',
    subtitle: 'A body scan from soles to crown, used as a wind-down rather than a sleep technique.',
    excerpt:
      'A guided body scan from the soles of the feet to the top of the head, used in bed as the last ten or fifteen minutes before sleep. Falling asleep mid-scan is the intended use.',
    body: {
      type: 'doc',
      content: [
        p('A guided body scan from the soles of the feet to the top of the head, used in bed as the last ten or fifteen minutes before sleep. Attention moves slowly through the body, one region at a time. Most people fall asleep mid-scan; that\'s the intended use.'),
        pLink('New to body-based meditation? Read ', 'body-based meditation', '/mindset/body-based-meditation', ' first.'),
        h(2, 'The practice'),
        h(3, 'Setting up'),
        p('Lie down in bed, on your back. A pillow under the knees if your lower back is tender. Arms by your sides, palms up. Eyes closed.'),
        p('Three slow breaths. Inhale through the nose, exhale through the mouth.'),
        h(3, 'The scan'),
        p('Bring your attention to the soles of your feet. Notice what\'s there — warmth, coolness, pressure against the sheet. Don\'t try to change anything. Two breaths.'),
        p('Move up through the body, two breaths at each region:'),
        ul([
          [p('the tops of the feet, the ankles')],
          [p('the calves, behind the knees')],
          [p('the thighs')],
          [p('the hips, the lower back')],
          [p('the belly, rising and falling with the breath')],
          [p('the chest, rising and falling with the breath')],
          [p('the fingertips, the hands, the wrists')],
          [p('the forearms, the elbows, the upper arms')],
          [p('the shoulders')],
          [p('the neck, the back of the head')],
          [p('the jaw, the cheeks, the small muscles around the eyes')],
          [p('the forehead, the top of the head')],
        ]),
        p('When the attention wanders, notice that it has wandered. Bring it back to the region you were on.'),
        h(3, 'Coming back'),
        p('If you\'ve reached the top of the head and you\'re still awake, rest the attention on the whole body for a few breaths. Lengthen each exhale: in for four, out for six. Then four, out for seven. Then four, out for eight.'),
        h(2, 'How it adapts'),
        p('Sitting at a desk rather than in bed: shorten to five minutes and stop at the shoulders. The scan still resets the nervous system; the bedtime extension into the head and jaw is for the wind-down.'),
        p('Restless legs or chronic ankle pain: start at the belly and move up, then come back to the legs at the end. Some people find the leg regions easier to hold last rather than first.'),
        p('Too tired to follow the order: rest the attention on whichever region holds tension — usually the jaw, shoulders, or belly. Two breaths there, then let go. The whole-body order is the standard; an attention-to-one-region version is the short fallback.'),
        p('Awake at 3am: the same scan works in the middle of the night. Falling asleep again mid-scan is the intended use here too.'),
        h(2, 'Where this practice comes from'),
        p('Body scan meditation has multiple contemplative lineages. The form used here is the secular MBSR adaptation developed by Jon Kabat-Zinn at the University of Massachusetts in the late 1970s. The bedtime framing — body scan as sleep wind-down rather than as a daytime mindfulness sit — was contributed by Rebecca Page, from Day 3 of SLEEP: A 30-Day Tapping Intensive (2025).'),
      ],
    },
    expectedType: 'PRACTICE',
  },

  // 6. FEAST AND FAMINE JOURNAL PROMPTS — journal prompt set.
  {
    slug: 'feast-and-famine-journal-prompts',
    title: 'Feast and famine journal prompts',
    subtitle: 'A six-prompt set for the money pattern of big inflows followed by long dry months.',
    excerpt:
      'A journal prompt set on the feast-and-famine money cycle. Two warm-up prompts to orient, then four narrower questions that walk the pattern down to where it lives. About thirty minutes, five minutes per prompt against a timer.',
    body: {
      type: 'doc',
      content: [
        p('A six-prompt set on the feast-and-famine money cycle: the pattern where a big inflow arrives, then disappears, and the next one doesn\'t have a date. Six questions. Two warm-up, four narrower. About thirty minutes total, five minutes per prompt against a timer.'),
        pLink('New to this style of journal practice? Read ', 'journal prompts as practice', '/mindset/journal-prompts-as-practice', ' first.'),
        h(2, 'The prompts'),
        h(3, 'Warm-up'),
        h(4, '1. What does money feel like to me right now?'),
        p('Just notice. The feeling in the body when you think about your accounts today. No need to fix it or interpret it. Write whatever comes.'),
        h(4, '2. Where am I in the cycle right now?'),
        p('Just-after a big inflow? In the middle of a dry month? Waiting for something to land? Write where the money sits this week.'),
        h(3, 'Closer in'),
        h(4, '3. The last time the money came in, what did I do with it?'),
        p('Be specific. The actual transactions, in order, with what feeling. Don\'t soften the relief-spends or the panic-spends.'),
        h(4, '4. What did I expect to feel when the money arrived, and what did I actually feel?'),
        p('The gap between the expected feeling and the actual one is often where the cycle holds. Write the gap.'),
        h(4, '5. When did the cycle start? Can I trace it back?'),
        p('Some people remember the year, the job, the relationship. Others remember a parent who lived this way before them. Write whatever you can find.'),
        h(4, '6. Who in my life would have called a steady, large, sitting bank balance a problem?'),
        p('Not who would have envied it. Who would have called it a problem. Write the names. Write the lines they used.'),
        h(2, 'After the prompts'),
        p('Close the notebook. Take one slow breath. You don\'t have to do anything with what you wrote. The act of writing it down is the practice; the insight tends to arrive over the next few days rather than at the end of the page.'),
        p('If a line in your writing made you emotional, that\'s the line to come back to next week. Open the notebook to that page and write for five more minutes on it.'),
        h(2, 'How it adapts'),
        p('Other cycles, same shape: creative-work cycles, paid-leave cycles, commission cycles, royalty cycles. Substitute "the big inflow" for whatever the lump arrival is in your work, and the warm-up plus four narrower prompts still walk the pattern down.'),
        p('Shorter version: just prompts 1, 3, and 6. Fifteen minutes total. Use when the full set is too much for the day but the pattern is still loud.'),
        p('Spoken version: if you can\'t write — driving, walking, in the bath — speak the prompts aloud to a voice memo and answer the same way. The free-write principle still applies: don\'t edit, don\'t re-listen during the session.'),
        p('Couple\'s version: each person writes their own answers in separate notebooks, then exchanges only what they want to share. Don\'t read each other\'s pages; the writing is for the writer.'),
        h(2, 'Where this practice comes from'),
        p('Theme adapted from Day 4 of MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025). The free-write method comes from across The Money Journal (Rebecca J Page, 2025), which holds 84 daily prompts. The general-to-specific six-prompt walk is original to the homemade.education library.'),
      ],
    },
    expectedType: 'PRACTICE',
  },

  // 7. HOW EFT TAPPING WORKS — reading.
  {
    slug: 'how-eft-tapping-works',
    title: 'How EFT tapping works',
    subtitle: 'The eight points, the three rounds, and the short setup statement.',
    excerpt:
      'A reference article for the tapping practices in the library. Covers what EFT is, where the eight points are, and how a session is structured. Read once; the practice scripts assume it.',
    body: {
      type: 'doc',
      content: [
        p('EFT (Emotional Freedom Technique) is a self-regulation practice that pairs light finger-tapping on eight specific points with short spoken statements. It was developed by Gary Craig in the mid-1990s, building on Roger Callahan\'s earlier Thought Field Therapy. The version used across this library follows Craig\'s standard shorthand.'),
        p('Every tapping practice in the library has the same shape. A short set-up at the karate chop point, a round through the eight tapping points, and a reframe round through the same eight points. The reading below covers each part so the individual practice scripts can stay tight and get on with the work.'),
        h(2, 'The eight points'),
        p('The script moves through these eight points in order. Each line is tapped about five to seven times, lightly but firmly, with two or three fingers of either hand. Either side of the body works.'),
        ul([
          [pBoldThen('Eyebrow.', ' The inner edge of the brow, just above the bridge of the nose.')],
          [pBoldThen('Side of eye.', ' On the bone at the outer corner of the eye.')],
          [pBoldThen('Under eye.', ' On the bone directly below the pupil, on the upper cheek.')],
          [pBoldThen('Under nose.', ' The hollow between the base of the nose and the upper lip.')],
          [pBoldThen('Chin.', ' The crease between the lower lip and the chin.')],
          [pBoldThen('Collarbone.', ' About 2 cm down from the inner end of the collarbone, where the rib meets the sternum.')],
          [pBoldThen('Under arm.', ' About 10 cm below the armpit, on the side of the body, level with the nipple line.')],
          [pBoldThen('Top of head.', ' The crown of the head, in line with the ears.')],
        ]),
        h(2, 'The karate chop point'),
        p('The set-up of a tapping session uses a ninth point: the karate chop point. It\'s the soft fleshy edge of the hand, on the side of the palm under the little finger. Tap it with two or three fingers of the other hand while reading the three set-up statements aloud (or under the breath, or in the mind — whichever the situation allows).'),
        h(2, 'How a session runs'),
        p('Every tapping practice in the library has the same three-part structure.'),
        pBoldThen('1. Karate chop.', ' Tap the karate chop point while reading the three set-up statements once each. The set-up statements are of the form "Even though I [name the feeling], I deeply and completely accept myself." They name what the round is about — the specific worry or pattern being worked with — and acknowledge it before the rounds start.'),
        pBoldThen('2. Tapping round.', ' Tap the eight points in order, one line per point, five to seven taps per point. Each line states the current feeling. Go through the round three times before moving on.'),
        pBoldThen('3. Reframe round.', ' Tap the same eight points in the same order again, this time reading the reframe line for each point. The reframe lines move the script from the current state toward where the user is going. Three passes through the reframe round.'),
        p('Total time: five to ten minutes for a typical script. Twenty minutes for a longer one.'),
        h(2, 'Using your own words'),
        p('The scripts in the library are templates. If a line doesn\'t fit the situation, change it. Use the wording that names what\'s actually true. The structure — eight points, three rounds, reframe round — is what holds; the words are adjustable.'),
        h(2, 'Where this comes from'),
        p('EFT was developed by Gary Craig in the mid-1990s as a simplified version of Roger Callahan\'s Thought Field Therapy. The eight-point shorthand has remained stable for nearly thirty years and is the format used by the EFT community internationally. The three-part script style in this library (set-up statements, tapping round, reframe round) was contributed by Rebecca Page, drawn from across her four tapping books published in 2025.'),
      ],
    },
    expectedType: 'READING',
  },

  // 8. HOW ENERGY STATEMENTS WORK — reading.
  {
    slug: 'how-energy-statements-work',
    title: 'How energy statements work',
    subtitle: 'A release-and-allow method you can use in many situations.',
    excerpt:
      'A reference article for the energy-statement practices in the library. Covers the Release / Allow pair, why each is repeated three times, and how the statements work alongside tapping or rituals.',
    body: {
      type: 'doc',
      content: [
        p('Energy statements are short spoken practices. The shape is simple: two statements, said three times each. One releases the resistance you can feel. One allows what you want. The pair is enough to work most situations the practice is for: money worry, self-worth, the guilt of wanting more.'),
        h(2, 'The two statements'),
        pBoldThen('Release.', ' "I am ready to release [name what you are releasing]. I release it now. I release it now. I release it now." Said three times in total, slowly.'),
        pBoldThen('Allow.', ' "I am ready to align with and allow [name what you are allowing]. I allow it now. I allow it now. I allow it now." Said three times in total, slowly.'),
        h(2, 'Why each is said three times'),
        p('The triple repetition is the structure of the practice. Three appears across the wider library: three set-up statements in tapping, three repetitions of release and allow, three rounds of a tapping script. Once is too quick to register. Twice can feel like a stumble. Three lands.'),
        h(2, 'Present tense, positive construction'),
        p('Statements are first-person, present tense, positive construction. "I allow it now" not "I will allow it" — future tense pushes the new reality away. "I am safe with money" not "I am not afraid of money" — negation reinforces the noun being negated.'),
        p('Where the truth of a present-tense statement feels far away, name a smaller truer version. "I am safe with money" may not land yet; "I am safe right now" usually does. Build up from what is true.'),
        h(2, 'Using your own words'),
        p('The statements in the library are templates. Change the wording where it fits the situation better. The structure — release first, allow second, three times each, present tense, positive construction — is what holds.'),
        h(2, 'Alongside tapping'),
        p('Energy statements work on their own and they pair well with tapping. The pattern is to find the resistance using a body cue, do the Release statement, check that the resistance has cleared, then do the Allow. A tapping round in the middle is optional but often useful for stronger resistance: tap the named feeling first, then say the statements.'),
        h(2, 'Where this comes from'),
        p('The Release / Allow structure is set out in chapters 2 through 5 of The Money Zone: How To Release Hidden Resistance, Allow Flow And Manifest Millions (Rebecca Page, 2024). The wider Zone Method has five steps; the two statements are the spoken practice surface.'),
      ],
    },
    expectedType: 'READING',
  },

  // 9. HOW RITUALS WORK — reading.
  {
    slug: 'how-rituals-work',
    title: 'How rituals work',
    subtitle: 'A five-part shape you can adapt to any topic.',
    excerpt:
      'A reference article for the ritual practices in the library. Covers the five-part Prepare, Release, Allow, Integrate, Anchor structure, what each step does, and how to adapt a ritual to a different topic.',
    body: {
      type: 'doc',
      content: [
        p('Rituals in the library follow a five-part shape. The same shape works for a money reset, a wealth-identity activation, a forgiveness rite, a closing of one month and an opening of the next. Each step does a specific piece of work; the shape is what lets the rite fit ten or fifteen minutes.'),
        h(2, 'The five parts'),
        pBoldThen('1. Prepare.', ' The set-up. Sit somewhere quiet. Light a candle if you have one. Take a few slow breaths. Picture the specific thing the ritual is for — the week behind you, the money in the accounts, the relationship that needs tending — resting in front of you. Concrete, not abstract.'),
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '2. Release.', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' Say the release statement aloud or in the mind, three times. The statement names what the ritual is letting go of — fear, survival energy, a specific belief, an inherited pattern. Follows the release-and-allow shape; see ' },
            { type: 'text', text: 'how energy statements work', marks: [{ type: 'link', attrs: { href: '/mindset/how-energy-statements-work' } }] },
            { type: 'text', text: '.' },
          ],
        },
        pBoldThen('3. Allow.', ' Say the allow statement aloud or in the mind, three times. The statement names what the ritual is making room for. Same shape as the release: first-person, present tense, positive construction.'),
        pBoldThen('4. Integrate.', ' One slow breath. An image specific to the ritual: golden light, warm water, a held bowl, or a candle flame. Sit with it for a minute. This step gives the body and the mind time to register what\'s just happened.'),
        pBoldThen('5. Anchor.', ' The single take-away sentence, written in your own handwriting on paper if you have it, said aloud if you don\'t. The anchor sentence is what carries the ritual forward into the week.'),
        h(2, 'How long it takes'),
        p('Ten to fifteen minutes for a typical ritual. Slower is better than faster: the integration step in particular needs space. The five parts can run shorter, but cutting integration usually means the ritual doesn\'t land.'),
        h(2, 'Materials'),
        p('Most rituals in the library need one or two of: a candle, a glass of water, a pen and paper, a small object (a coin, a note, a ring). The specific items are listed in each ritual\'s body. A candle is the most common; a glass of water substitutes when no candle is to hand.'),
        h(2, 'Adapting a ritual'),
        p('The five-part shape is portable. To adapt a ritual from one topic to another, keep Prepare, Integrate, and Anchor; rewrite the Release and Allow statements to name the new topic. Weekly money rituals across the source book work this way: each week\'s ritual uses the same shape with a different release-and-allow pair drawn from that week\'s theme.'),
        h(2, 'Where this comes from'),
        p('The five-part structure is used across The Money Journal: 12 Weeks to Peace, Freedom & Overflow (Rebecca J Page, 2025). The Release / Allow statements inside the ritual draw on her Money Zone method (2024). The wider lineage of weekly ritual practice — taking five or ten minutes to close one week and open the next — predates her work and appears across many contemplative and folk traditions.'),
      ],
    },
    expectedType: 'READING',
  },

  // 10. BODY-BASED MEDITATION — reading.
  {
    slug: 'body-based-meditation',
    title: 'Body-based meditation',
    subtitle: 'The body scan, breath work, and image-led practices used across the library.',
    excerpt:
      'A reference article for the meditation practices in the library. Covers the body scan (multiple lineages), 4-7-8 and box breathing, and the image-led practices. The individual meditations assume this reading; read it first.',
    body: {
      type: 'doc',
      content: [
        p('The meditations in the library are short body-led practices. They aren\'t classical sitting meditations of the kind that take forty minutes on a cushion. They\'re five to fifteen minutes long, mostly done in bed or in a chair, and they pair well with the tapping and ritual practices that surround them. This reading covers the three families the library uses: the body scan, breath counts, and image-led meditations.'),
        h(2, 'The body scan'),
        p('The body scan moves attention from one part of the body to the next, one region at a time. The reader notices what\'s there at each region: warmth or coolness, pressure against the bed, the skin against fabric. No attempt to change anything. A typical scan starts at the soles of the feet and works up to the top of the head, taking a few breaths at each region. Twenty to thirty regions covered in ten minutes.'),
        p('When the attention wanders (which it will, often), the practice is to notice the wandering and bring the attention back to the region you were on. The wandering isn\'t a problem; the noticing is the practice.'),
        p('The body scan has multiple contemplative lineages — it appears in Buddhist insight meditation and several other traditions. The form most familiar in the West passed through Jon Kabat-Zinn\'s Mindfulness-Based Stress Reduction programme at the University of Massachusetts in the late 1970s. The secular bedtime adaptation, where falling asleep mid-scan is expected, is the form used across the SLEEP-targeted practices in this library.'),
        h(2, 'Breath counts'),
        p('Two breath counts feature in the library.'),
        pBoldThen('4-7-8.', ' Inhale through the nose for four seconds. Hold the breath for seven. Exhale through the mouth for eight, with a soft audible sound. Four rounds is one session. Developed by Andrew Weil from pranayama practice; in widespread use as a calming and sleep-induction exercise.'),
        pBoldThen('Box breathing.', ' Four equal sides. Inhale four seconds, hold four, exhale four, hold four. Adopted by US Navy SEALs as a pre-performance calming exercise and now widely used in stress-regulation training. Less effective than 4-7-8 for sleep induction; more effective for a daytime reset between meetings.'),
        p('Both breath counts work because the lengthened exhale — or the held exhale, in the box — shifts the body from sympathetic to parasympathetic mode. The nervous system reads it as a sign to slow the heart rate. The mechanism is the same; the specific count is the difference.'),
        h(2, 'Image-led meditations'),
        p('A handful of meditations in the library are image-led: the reader follows a single image through a short sequence (water filling a glass, light moving across a room, a cloud passing). They work the same way the breath counts do, but with a visual anchor instead of a numeric one.'),
        h(2, 'When to use which'),
        p('Body scan: best in bed, ten or fifteen minutes before sleep, for the night where the body is wired and the mind is still running. Falling asleep mid-scan is fine.'),
        p('4-7-8: thirty seconds before bed, or any time the system is in acute panic. Four rounds is enough to slow the heart rate.'),
        p('Box breathing: between meetings, after a hard conversation, before walking into a room. Daytime use.'),
        p('Image-led: when a feeling needs a visual anchor — the morning after a hard sleep, when the head won\'t focus on a count, when the image carries more weight than the number.'),
        h(2, 'Where this comes from'),
        p('Body scan: secular MBSR adaptation, Jon Kabat-Zinn et al., late 1970s onwards. 4-7-8: Andrew Weil\'s adaptation of pranayama. Box breathing: US-military adaptation, widely public. The framings used across the library (body scan as sleep wind-down, breath counts as daytime reset) were contributed by Rebecca Page, from SLEEP (2025) and The Money Zone (2024).'),
      ],
    },
    expectedType: 'READING',
  },

  // 11. JOURNAL PROMPTS AS PRACTICE — reading.
  {
    slug: 'journal-prompts-as-practice',
    title: 'Journal prompts as practice',
    subtitle: 'Single-question free-writes, against a timer, with no editing.',
    excerpt:
      'A reference article for the journal prompt practices in the library. Covers the free-write style, why prompts are specific questions rather than blank pages, and how to work a prompt set in fifteen to thirty minutes.',
    body: {
      type: 'doc',
      content: [
        p('Journal prompts in the library are specific questions, not blank pages. Each prompt names one thing to write about. You write for five minutes without stopping, don\'t re-read or edit, and move on. A prompt set holds two to six prompts that walk a single feeling through; fifteen to thirty minutes for a full set.'),
        h(2, 'The method'),
        p('Set a timer for five minutes before each prompt. Read the prompt once. Start writing. Don\'t stop, don\'t re-read, don\'t edit. If the page goes blank, keep the pen moving: write "I don\'t know what to write" until something else comes. When the timer ends, close the notebook. Move to the next prompt or stop for the day.'),
        p('The timer matters. It tells the body that the writing has a stop point, and that loosens the writing. Without it, the page becomes another open-ended task and the writing stays cautious.'),
        p('The no-editing rule matters too. Re-reading interrupts the work. Most of the useful realisation in a free-write lands two or three days after the writing, not at the end of the page. Close the notebook; come back to it later if at all.'),
        h(2, 'Why specific questions, not blank pages'),
        p('A blank-page prompt ("How do you feel about money?") gives the head too much room to perform. A specific question ("When did \'we never get ahead\' first become true for my family?") points the writing at a particular memory, story, or sentence. The specificity gets past the rehearsed answer.'),
        h(2, 'Warm-up before narrow'),
        p('Most prompt sets in the library open with one or two wider questions ("What does money feel like to me right now?") before the narrower ones ("Who in my life would have called a steady bank balance a problem?"). The warm-up orients the writing. Going straight to a narrow question can be too much too fast.'),
        h(2, 'What to do with what you wrote'),
        p('Most of what comes up in a free-write doesn\'t need anything done with it. The writing is the practice. Sometimes you\'ll write a line that makes you emotional: a name, a phrase, a memory that hits harder than the rest. That line is worth coming back to. Open the notebook to that page next week and write for five more minutes on it.'),
        p('When a journal session is paired with tapping, write first. Whatever line made you emotional becomes the named feeling in the tapping set-up statement; the rounds work it through.'),
        h(2, 'Materials'),
        p('A notebook and a pen. A timer (any phone). Somewhere you won\'t be interrupted for fifteen to thirty minutes. Most users keep one notebook for Mindset journal work; some keep separate notebooks per topic. Both work.'),
        h(2, 'Where this comes from'),
        p('The single-question, timed, no-editing free-write is the method used across The Money Journal: 12 Weeks to Peace, Freedom & Overflow (Rebecca J Page, 2025), which holds 84 daily prompts and 12 weekly reflections. The wider lineage of free-writing as a practice has multiple sources; Julia Cameron\'s morning pages in The Artist\'s Way (1992) and Peter Elbow\'s freewriting (Writing Without Teachers, 1973) are the most prominent in English-language writing instruction.'),
      ],
    },
    expectedType: 'READING',
  },
]

interface PerSlugReport {
  slug: string
  beforeStatus: string
  afterStatus: string
  bodyChanged: boolean
  titleChanged: boolean
  subtitleChanged: boolean
  excerptChanged: boolean
  typeChanged: boolean
  heroOutcome: 'attached-real' | 'attached-ai' | 'procedural-fallback' | 'skipped'
  heroSource?: string | null
  heroTried?: string[]
  errorMessage?: string
}

function extFromContentType(ct: string | null): { ext: string; mime: string } {
  const c = (ct ?? '').split(';')[0]?.trim().toLowerCase() ?? ''
  if (c === 'image/png') return { ext: 'png', mime: 'image/png' }
  if (c === 'image/webp') return { ext: 'webp', mime: 'image/webp' }
  if (c === 'image/avif') return { ext: 'avif', mime: 'image/avif' }
  return { ext: 'jpg', mime: 'image/jpeg' }
}

function scanForBannedWords(text: string): string[] {
  const banned: string[] = []
  if (/\bembodied\b/i.test(text)) banned.push('embodied')
  if (/\bsafely\b/i.test(text)) banned.push('safely')
  return banned
}

function walkText(node: Node, out: string[]): void {
  if (node.text) out.push(node.text)
  if (node.content) for (const c of node.content) walkText(c, out)
}

function scanRewriteForBanned(r: Rewrite): string[] {
  const buf: string[] = [r.title, r.subtitle, r.excerpt]
  for (const n of r.body.content) walkText(n, buf)
  const violations: string[] = []
  for (const t of buf) {
    for (const v of scanForBannedWords(t)) violations.push(`${v} in: "${t.slice(0, 60)}..."`)
  }
  return violations
}

async function main(): Promise<void> {
  const flags = parseFlags(process.argv.slice(2))
  console.log(`editorial-pass-mindset: dryRun=${flags.dryRun}, skipImages=${flags.skipImages}`)

  // Self-check banned words across the rewrites before touching the DB.
  let violationFound = false
  for (const r of REWRITES) {
    const vs = scanRewriteForBanned(r)
    if (vs.length > 0) {
      violationFound = true
      console.error(`✗ ${r.slug}:`)
      for (const v of vs) console.error(`    - ${v}`)
    }
  }
  if (violationFound) {
    throw new Error('Banned words found in rewrite content. Fix before running.')
  }
  console.log('✓ Voice scan: no banned words in rewrites.')

  // Title em-dash sweep.
  for (const r of REWRITES) {
    if (r.title.includes('—')) throw new Error(`Title contains em-dash: ${r.slug}`)
  }
  console.log('✓ Em-dash sweep: no em-dashes in titles.')

  const author = await prisma.user.findUnique({
    where: { email: 'rebecca@homemade.education' },
    select: { id: true },
  })
  if (!author) throw new Error('Author rebecca@homemade.education not found.')

  const drafts = await prisma.tutorial.findMany({
    where: {
      category: { slug: 'mindset' },
      slug: { in: REWRITES.map((r) => r.slug) },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      subtitle: true,
      excerpt: true,
      body: true,
      status: true,
      type: true,
      heroMediaId: true,
      categoryId: true,
      subCategoryId: true,
      category: { select: { slug: true } },
      subCategory: { select: { slug: true } },
    },
  })
  if (drafts.length !== REWRITES.length) {
    const found = new Set(drafts.map((d) => d.slug))
    const missing = REWRITES.map((r) => r.slug).filter((s) => !found.has(s))
    throw new Error(`Missing tutorial rows for: ${missing.join(', ')}`)
  }
  console.log(`Found ${drafts.length} target rows.`)

  const report: PerSlugReport[] = []

  for (const r of REWRITES) {
    const existing = drafts.find((d) => d.slug === r.slug)!
    const tag = `[${r.slug}]`
    const before = {
      title: existing.title,
      subtitle: existing.subtitle ?? '',
      excerpt: existing.excerpt ?? '',
      bodyStr: JSON.stringify(existing.body),
      type: existing.type,
    }
    const newBodyStr = JSON.stringify(r.body)
    const titleChanged = before.title !== r.title
    const subtitleChanged = before.subtitle !== r.subtitle
    const excerptChanged = before.excerpt !== r.excerpt
    const bodyChanged = before.bodyStr !== newBodyStr
    const typeChanged = before.type !== r.expectedType

    let heroOutcome: PerSlugReport['heroOutcome'] = 'skipped'
    let heroMediaId: string | null = existing.heroMediaId
    let heroSource: string | null = null
    let heroTried: string[] | undefined
    let heroStrategy: 'REAL_PHOTO' | 'AI_GENERATED' | 'PROCEDURAL_CARD' = 'PROCEDURAL_CARD'
    let heroErr: string | undefined

    if (!flags.skipImages && !existing.heroMediaId) {
      try {
        const result = await sourceHeroImage({
          title: r.title,
          category: 'mindset',
          subCategory: existing.subCategory?.slug ?? null,
          ingredients: [],
        })
        heroTried = result.triedSources.slice()
        if (result.outcome === 'failed' || !result.image) {
          heroOutcome = 'procedural-fallback'
          heroStrategy = 'PROCEDURAL_CARD'
          console.log(`${tag} hero: procedural (tried ${heroTried.join(', ') || 'none'})`)
        } else {
          const img = result.image
          if (flags.dryRun) {
            heroOutcome = result.outcome === 'ai-generated' ? 'attached-ai' : 'attached-real'
            heroSource = img.source
            console.log(`${tag} hero DRY ${result.outcome} via ${img.source} (${img.width}x${img.height})`)
          } else {
            const dl = await fetch(img.url, {
              headers: {
                'User-Agent': 'Homemade/1.0 (https://homemade.education; rebecca@homemade.education)',
                Accept: 'image/*,*/*;q=0.8',
              },
            })
            if (!dl.ok) throw new Error(`download ${dl.status}`)
            const buf = Buffer.from(await dl.arrayBuffer())
            if (buf.length === 0) throw new Error('empty body')
            const { ext, mime } = extFromContentType(dl.headers.get('content-type'))
            const filename = `${r.slug}-hero.${ext}`
            const { key } = await r2Upload(buf, mime, { filename, prefix: 'tutorials/mindset-editorial' })
            const media = await prisma.media.create({
              data: {
                r2Key: key,
                type: 'ILLUSTRATION',
                status: 'READY',
                filename,
                mimeType: mime,
                width: img.width,
                height: img.height,
                bytes: buf.length,
                source: img.source,
                sourceUrl: img.pageUrl,
                creatorName: img.creatorName,
                licenceCode: img.licenceCode,
                licenceUrl: img.licenceUrl,
                requiresAttribution: img.requiresAttribution,
              },
            })
            heroMediaId = media.id
            heroSource = img.source
            heroOutcome = result.outcome === 'ai-generated' ? 'attached-ai' : 'attached-real'
            heroStrategy = img.source === 'flux-schnell' ? 'AI_GENERATED' : 'REAL_PHOTO'
            console.log(`${tag} hero: ${heroStrategy} via ${img.source} (${img.width}x${img.height})`)
          }
        }
      } catch (err) {
        heroErr = err instanceof Error ? err.message : String(err)
        heroOutcome = 'procedural-fallback'
        heroStrategy = 'PROCEDURAL_CARD'
        console.warn(`${tag} hero sourcing errored: ${heroErr} — falling through to procedural`)
      }
    } else if (existing.heroMediaId) {
      heroOutcome = 'skipped'
      console.log(`${tag} hero: already attached (${existing.heroMediaId})`)
    } else {
      heroOutcome = 'procedural-fallback'
      heroStrategy = 'PROCEDURAL_CARD'
    }

    if (flags.dryRun) {
      console.log(`${tag} DRY: would update + publish. titleChanged=${titleChanged} subtitleChanged=${subtitleChanged} excerptChanged=${excerptChanged} bodyChanged=${bodyChanged} typeChanged=${typeChanged}`)
      report.push({
        slug: r.slug,
        beforeStatus: existing.status,
        afterStatus: 'DRAFT',
        bodyChanged, titleChanged, subtitleChanged, excerptChanged, typeChanged,
        heroOutcome, heroSource, heroTried, errorMessage: heroErr,
      })
      continue
    }

    await prisma.$transaction(async (tx) => {
      await tx.tutorialVersion.create({
        data: {
          tutorialId: existing.id,
          title: existing.title,
          subtitle: existing.subtitle,
          excerpt: existing.excerpt,
          body: existing.body as Prisma.InputJsonValue,
          status: existing.status,
          authorId: author.id,
          changeNote: 'editorial-pass-mindset-drafts: pre-rewrite snapshot',
        },
      })
      await tx.tutorial.update({
        where: { id: existing.id },
        data: {
          title: r.title,
          subtitle: r.subtitle,
          excerpt: r.excerpt,
          body: r.body as unknown as Prisma.InputJsonValue,
          type: r.expectedType,
          status: 'PUBLISHED',
          publishedAt: new Date(),
          heroMediaId,
          heroImageStrategy: heroStrategy,
        },
      })
      await tx.tutorialVersion.create({
        data: {
          tutorialId: existing.id,
          title: r.title,
          subtitle: r.subtitle,
          excerpt: r.excerpt,
          body: r.body as unknown as Prisma.InputJsonValue,
          status: 'PUBLISHED',
          authorId: author.id,
          changeNote: 'editorial-pass-mindset-drafts: rewritten to 2026-05-18 voice rules + published',
        },
      })
    })

    report.push({
      slug: r.slug,
      beforeStatus: existing.status,
      afterStatus: 'PUBLISHED',
      bodyChanged, titleChanged, subtitleChanged, excerptChanged, typeChanged,
      heroOutcome, heroSource, heroTried, errorMessage: heroErr,
    })
    console.log(`${tag} PUBLISHED`)
  }

  const reportFile = resolve(__dirname, '..', '..', '..', 'docs', 'mindset-editorial-pass-report.json')
  writeFileSync(reportFile, JSON.stringify({ runDate: new Date().toISOString(), dryRun: flags.dryRun, report }, null, 2), 'utf8')
  console.log(`\nReport written to ${reportFile}`)

  if (!flags.dryRun) {
    await prisma.auditLog.create({
      data: {
        actorId: author.id,
        action: 'tutorial.editorial-pass-mindset-drafts',
        resource: 'tutorials',
        metadata: {
          runDate: new Date().toISOString().slice(0, 10),
          count: report.length,
          published: report.filter((r) => r.afterStatus === 'PUBLISHED').length,
          slugs: report.map((r) => r.slug),
          heroOutcomes: {
            real: report.filter((r) => r.heroOutcome === 'attached-real').length,
            ai: report.filter((r) => r.heroOutcome === 'attached-ai').length,
            procedural: report.filter((r) => r.heroOutcome === 'procedural-fallback').length,
            skipped: report.filter((r) => r.heroOutcome === 'skipped').length,
          },
        } as Prisma.InputJsonValue,
      },
    })
  }

  console.log('\nDONE')
  for (const r of report) {
    console.log(`  ${r.slug}: ${r.beforeStatus} → ${r.afterStatus}, hero=${r.heroOutcome}${r.heroSource ? ` (${r.heroSource})` : ''}`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    return prisma.$disconnect().finally(() => process.exit(1))
  })
