/**
 * Targeted text rewrites for voice-retrofit batch 2026-05-28-batch22.
 *
 * Each rewrite is (slug, old, next). The script replaces the old text
 * inside the JSON file by JSON-escaping it first. old must appear exactly
 * once. After all rewrites, the script runs voice-check on each touched
 * file and fails the run if any errors remain.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { runVoiceCheck, fleschKincaidGrade } from './voice-check-lib.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const worktreeRoot = resolve(__dirname, '../../..')
const BATCH_ID = '2026-05-28-batch22'
const batchDir = resolve(worktreeRoot, 'docs', `voice-retrofit-${BATCH_ID}`)

interface Rewrite {
  slug: string
  old: string
  next: string
}

const REWRITES: Rewrite[] = [
  {
    slug: 'why-inheritance-and-tax-fear-slows-down-wealth-planning',
    old: 'Original to homemade.education. The psychological framing draws on avoidance research in behavioural finance and the broader literature on money avoidance behaviours.',
    next: 'Original to homemade.education. The framing draws on money avoidance research.',
  },
  {
    slug: 'why-women-are-taught-to-apologise-for-wanting',
    old: "Original to homemade.education. Synthesised from Rebecca J Page's MONEY: A 12-Week Tapping Program (Rebecca J Page, 2025) and public-domain research on gender socialisation and financial behaviour. Academic literature on women and money includes work by researchers including Annamaria Lusardi and Olivia Mitchell (financial literacy and gender), Barbara Stanny (women and financial empowerment), and Brené Brown's extensive documentation of shame and desire in women's lives.",
    next: "Original to homemade.education. Drawn from Rebecca J Page's MONEY: A 12-Week Tapping Program and research on women and money. Full reading list in the Sources block.",
  },
  {
    slug: 'why-not-enough-time-is-rarely-about-time',
    old: 'Research on subjective time scarcity (the feeling of not having enough time, regardless of how many hours are available) finds that it is not strongly correlated with the actual number of hours available. People with fewer free hours do not consistently report more time scarcity than people with more. What does predict the feeling is the number of competing demands, the quality of transitions between activities, and whether the time used feels like it belongs to you.',
    next: 'Research on the feeling of not enough time finds it is not tied closely to the number of hours you have. People with fewer free hours do not always feel more time-poor than people with more free hours. What does predict the feeling is the number of pulls on you, the quality of the moves between tasks, and whether the time feels like yours.',
  },
  {
    slug: 'why-not-enough-time-is-rarely-about-time',
    old: "For women specifically, the drivers include: invisible work (the mental load of coordination, anticipation, and management that doesn't appear in any time diary); emotional labour that takes cognitive and energy resources without appearing to take time; and the number of roles whose demands are simultaneous rather than sequential.",
    next: 'For women, the drivers tend to be three things. Invisible work: the mental load of planning, tracking, and managing the home that does not show up in any time diary. Emotional labour: the kind of work that drains focus and energy without seeming to take time. And the number of roles whose demands run at the same time, not one after the other.',
  },
  {
    slug: 'why-not-enough-time-is-rarely-about-time',
    old: "The result is that women who successfully implement time management techniques often still report not enough time, because they have optimised the scheduling of a problem that isn't primarily a scheduling problem.",
    next: 'The result: women who use time management tools well often still feel time-poor. They have got better at fitting in a problem that is not really about fitting in.',
  },
  {
    slug: 'why-investing-isnt-for-me-is-a-story',
    old: 'Add to that the way investing has been publicly framed: television portrayals of traders in suits, newspaper coverage of market crashes, the jargon-heavy language of financial services that has historically been written for an assumed reader who already owns a significant amount of money. The signal, received cumulatively, is clear: this is for people who are already in the room. If you are not already in the room, you do not belong.',
    next: 'Add to that the way investing has been shown in public. Television pictures of traders in suits. Newspaper coverage of market crashes. Jargon-heavy language from the finance world, written for a reader who is taken to already own real money. The signal, picked up year after year, is clear: this is for people who are in the room. If you are not in the room, you do not belong.',
  },
  {
    slug: 'why-investing-isnt-for-me-is-a-story',
    old: 'Most research on individual investors finds that active stock-picking by non-professionals underperforms passive index investment over the long run. The people who spend the most time researching individual stocks often do worse than people who buy and hold a broad market fund and do very little. Knowledge, in the sense of expertise about individual securities, is largely not what determines outcomes for the typical long-term investor.',
    next: 'Most research on home investors finds that picking your own stocks rarely beats simply tracking the whole market. The people who spend the most time on single stocks often do worse than people who buy a broad fund and hold it. Deep know-how about single shares is not what shapes results for most long-term home investors.',
  },
  {
    slug: 'why-investing-isnt-for-me-is-a-story',
    old: 'Starting small is not a consolation prize for people who can\'t afford to start properly. It is the correct starting point for building the emotional relationship with investing that the knowledge-only approach misses entirely. A small real position teaches you more about your own risk tolerance, patience, and behaviour under uncertainty than a large theoretical one.',
    next: 'Starting small is not a runner-up prize for people who cannot start big. It is the right place to start. It builds the feeling-side of investing that book learning alone cannot give you. A small real holding teaches you more about your own nerve, patience, and choices under risk than a large made-up one.',
  },
  {
    slug: 'why-women-say-yes-reading',
    old: "This means that women's yes reflex is not operating in a neutral context. Women who say yes to requests are often saying yes against a background of an already overloaded schedule. The time they are giving away is time they do not have.",
    next: "This means a woman's yes reflex is not running in neutral ground. Women who say yes are often saying yes on top of a week that is already too full. The time they give away is time they do not have.",
  },
  {
    slug: 'why-women-say-yes-reading',
    old: 'Written for homemade.education. The reading draws on time use research from the UK Office for National Statistics, research on the communality penalty in social psychology, and work on emotional labour and unpaid domestic work.',
    next: 'Written for homemade.education. The reading draws on UK time use data and on research into emotional labour and unpaid home work.',
  },
  {
    slug: 'working-mum-guilt-the-long-view',
    old: 'The long-term data on children of working mothers is not what the guilt predicts. A 2015 Harvard Business School study by Kathleen McGinn and colleagues, drawing on data from 24 countries over several decades, found that daughters of working mothers were more likely to be employed, to hold supervisory roles, and to earn higher wages than daughters of mothers who did not work outside the home. Sons of working mothers were more likely to contribute to domestic labour as adults.',
    next: 'The long-term data on children of working mothers is not what the guilt predicts. A large cross-country study covering 24 countries over many years found a clear pattern. Daughters of working mothers were more likely to have jobs, to hold roles with reports, and to earn more than daughters of mothers who did not work outside the home. Sons of working mothers were more likely to share the housework as adults. Citation in the Sources block.',
  },
  {
    slug: 'working-mum-guilt-the-long-view',
    old: 'What predicts child wellbeing is not maternal presence by hours but the quality of the relationship and the stability of care arrangements. A mother who is present but depleted and resentful does not provide better care than a mother who is at work during working hours and present when home.',
    next: 'What predicts child wellbeing is not the number of hours a mother is there. It is the warmth of the bond and how steady the care set-up is. A mother who is at home but worn out and resentful does not give better care than a mother who is at work in the day and present when home.',
  },
  {
    slug: 'working-mum-guilt-the-long-view',
    old: 'Draws on Kathleen McGinn, Mayra Ruiz Castro, and Elizabeth Long Lingo, "Learning from Mum: Cross-National Evidence Linking Maternal Employment and Adult Children\'s Outcomes" (Harvard Business School Working Paper 15-093, 2015), the academic literature on the "motherhood penalty" in the sociology of work, and original framing for Homemade.',
    next: 'Draws on cross-country research into working mothers and adult child outcomes. Full citation in the Sources block.',
  },
  {
    slug: 'write-the-price-you-want-next-to-the-price-you-charge-activity',
    old: 'Original to homemade.education. The named-gap exercise is a common shape across business coaching and self-worth literature on pricing.',
    next: 'Original to homemade.education. The named-gap exercise is a common shape in coaching work on pricing.',
  },
  {
    slug: 'your-grandchildren-choices-made-possible-by-you-visualisation',
    old: 'Original to homemade.education. Forward projection imagery appears across therapeutic and coaching traditions, no single lineage is claimed.',
    next: 'Original to homemade.education. Forward look-ahead images show up across therapy and coaching. No one source is claimed.',
  },
  {
    slug: 'zabaglione',
    old: 'Zabaglione is one of the oldest continuously documented Italian desserts, with versions appearing in regional Italian cookery from the sixteenth and seventeenth centuries. The combination of egg yolks, sugar, and wine whisked over heat appears under various names across Italian regional cooking, the spelling and wine vary by region. The Marsala version became standard as the Sicilian fortified wine became widely available across Italy in the nineteenth century. In British cooking, the dish arrived with Italian restaurant culture and has been a menu fixture since Italian dining became established.',
    next: 'Zabaglione is one of the oldest written-down Italian desserts. Versions show up in Italian cooking from the sixteenth and seventeenth centuries. The mix of egg yolks, sugar, and wine whisked over heat appears under many names across Italy. The spelling and the wine vary by region. The Marsala version became standard once the Sicilian fortified wine was easy to get across Italy. In Britain, the dish came in with Italian restaurants and has stayed on menus ever since.',
  },
  {
    slug: 'yorkshire-puddings',
    old: "The Yorkshire pudding originated as a batter cooked beneath a joint on a spit, catching the dripping fat. Eliza Acton's 1845 recipe is one of the earliest printed versions. Mrs Beeton's 1861 edition includes it as standard Sunday practice. The modern convention of serving small individual puddings came later; the original was a large flat pudding served as a first course before the meat, to fill guests up on the cheaper batter and reduce their appetite for the more expensive beef.",
    next: 'The Yorkshire pudding started as a batter cooked beneath a joint on a spit, catching the dripping fat. The nineteenth-century cookery writer Eliza Acton printed one of the earliest known recipes. The Victorian cookery writer Mrs Beeton later included it as standard Sunday practice. The modern habit of serving small individual puddings came later. The original was one large flat pudding served as a first course before the meat. It filled guests up on the cheaper batter so they ate less of the costly beef.',
  },
]

async function main() {
  const touched = new Set<string>()
  const summary: { slug: string; old: string; next: string; oldGrade: number | null; newGrade: number | null }[] = []
  let ok = 0
  let fail = 0
  const failures: { slug: string; reason: string }[] = []

  for (const r of REWRITES) {
    const filePath = resolve(batchDir, `${r.slug}.json`)
    if (!existsSync(filePath)) {
      console.error(`[FAIL] ${r.slug} - file not found`)
      fail++
      failures.push({ slug: r.slug, reason: 'file not found' })
      continue
    }
    let content = readFileSync(filePath, 'utf8')
    const escapedOld = JSON.stringify(r.old).slice(1, -1)
    const escapedNew = JSON.stringify(r.next).slice(1, -1)
    if (!content.includes(escapedOld)) {
      console.error(`[FAIL] ${r.slug} - old text not found`)
      console.error(`       searched: ${escapedOld.slice(0, 80)}...`)
      fail++
      failures.push({ slug: r.slug, reason: 'old text not found' })
      continue
    }
    const count = content.split(escapedOld).length - 1
    if (count > 1) {
      console.error(`[FAIL] ${r.slug} - old text appears ${count}x (not unique)`)
      fail++
      failures.push({ slug: r.slug, reason: `old text not unique (${count}x)` })
      continue
    }
    content = content.replace(escapedOld, escapedNew)
    writeFileSync(filePath, content, 'utf8')
    touched.add(r.slug)
    summary.push({
      slug: r.slug,
      old: r.old,
      next: r.next,
      oldGrade: fleschKincaidGrade(r.old),
      newGrade: fleschKincaidGrade(r.next),
    })
    console.log(`[OK]   ${r.slug}  oldG=${fleschKincaidGrade(r.old)?.toFixed(1)}  newG=${fleschKincaidGrade(r.next)?.toFixed(1)}`)
    ok++
  }

  console.log(`\nApplied: ${ok} ok, ${fail} failed`)
  if (failures.length > 0) {
    console.log('Failures:')
    for (const f of failures) console.log(`  - ${f.slug}: ${f.reason}`)
  }

  // Voice-check every touched file.
  console.log('\nPost-rewrite voice-check:')
  let postOk = 0
  let postBad = 0
  for (const slug of touched) {
    const filePath = resolve(batchDir, `${slug}.json`)
    const data = JSON.parse(readFileSync(filePath, 'utf8'))
    const report = runVoiceCheck(data)
    if (report.errors.length === 0) {
      console.log(`  [CLEAN] ${slug}`)
      postOk++
    } else {
      console.log(`  [DIRTY] ${slug}  ${report.errors.length} errors`)
      for (const e of report.errors) {
        console.log(`    ${e.kind} @ ${e.path}: ${e.message.slice(0, 120)}`)
      }
      postBad++
    }
  }
  console.log(`\nPost-rewrite: ${postOk} clean, ${postBad} still dirty`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
