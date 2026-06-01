/**
 * qc-manual-fix-2026-06-01 — manual rewrite pass for tutorials that
 * the mechanical qc-fix cannot resolve (body-rewrite cases).
 *
 * 20 slugs targeted this fire:
 *  - 14 sustainability entries: replace placeholder method section with real steps
 *  - 6  sustainability entries: fix real paragraph grade-level issues + placeholder
 *
 * Run: pnpm --filter @homemade/db exec tsx scripts/qc-manual-fix-2026-06-01.ts
 */

import { config as loadEnv } from 'dotenv'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
let dir = __dirname
for (let depth = 0; depth < 12; depth++) {
  const candidate = resolve(dir, '.env.credentials')
  if (existsSync(candidate)) { loadEnv({ path: candidate, override: true }); break }
  const parent = dirname(dir); if (parent === dir) break; dir = parent
}

import { prisma } from '../src/index.js'

// ─── TipTap helpers ──────────────────────────────────────────────────────────

type TNode = { type: string; text?: string; marks?: any[]; attrs?: any; content?: TNode[] }

function textNode(text: string): TNode {
  return { type: 'text', text, marks: [] }
}

function para(...texts: string[]): TNode {
  return { type: 'paragraph', content: texts.map(textNode) }
}

function li(...paragraphs: TNode[]): TNode {
  return { type: 'listItem', content: paragraphs }
}

function ol(items: TNode[]): TNode {
  return { type: 'orderedList', content: items }
}

// Recursively walk and replace matching text nodes
function replaceText(node: TNode, oldText: string, newText: string): TNode {
  if (node.type === 'text' && node.text === oldText) {
    return { ...node, text: newText }
  }
  if (node.content) {
    return { ...node, content: node.content.map(c => replaceText(c, oldText, newText)) }
  }
  return node
}

// Replace a matching paragraph (by its full text content) with a replacement node
function replaceParagraph(node: TNode, matchText: string, replacement: TNode): TNode {
  if (node.type === 'paragraph') {
    const text = (node.content || []).filter(c => c.type === 'text').map(c => c.text || '').join('')
    if (text.startsWith(matchText.slice(0, 60))) return replacement
  }
  if (node.content) {
    return { ...node, content: node.content.map(c => replaceParagraph(c, matchText, replacement)) }
  }
  return node
}

// Replace the placeholder orderedList method section with real steps
function replaceMethodPlaceholder(body: TNode, steps: TNode[]): { body: TNode; changed: boolean } {
  const PLACEHOLDER_PREFIX = 'Step-by-step instructions for '
  let changed = false

  function walk(node: TNode): TNode {
    if (node.type === 'orderedList' && node.content?.length === 1) {
      const li0 = node.content[0]
      if (li0?.type === 'listItem' && li0.content?.length === 1) {
        const p0 = li0.content[0]
        if (p0?.type === 'paragraph' && p0.content?.length === 1) {
          const t = p0.content[0]
          if (t?.type === 'text' && typeof t.text === 'string' && t.text.startsWith(PLACEHOLDER_PREFIX)) {
            changed = true
            return ol(steps)
          }
        }
      }
    }
    if (node.content) {
      return { ...node, content: node.content.map(walk) }
    }
    return node
  }

  const newBody = walk(body)
  return { body: newBody, changed }
}

// ─── Method steps per slug ───────────────────────────────────────────────────

const METHODS: Record<string, TNode[]> = {
  'blown-cellulose-cavity-fill': [
    li(para('Call a CIGA-registered installer and ask for quotes from at least two companies.')),
    li(para('Let the installer survey the wall before booking. They check the cavity width and the state of the outer leaf.')),
    li(para('On the day, they drill small holes in the outer brick, blow in the cellulose through a hose, then plug and repoint each hole.')),
    li(para('Ask for the CIGA guarantee in writing. Keep it with your property records.')),
  ],
  'composting-in-a-community-garden': [
    li(para('Pick a shaded spot with good drainage. Keep the bins away from plot edges.')),
    li(para('Set a rota so all plot holders know when to add waste and who turns the heap.')),
    li(para('Chop or shred coarse material before adding it. Aim for equal parts green waste and dry brown material in each layer.')),
    li(para('Turn the heap every two to three weeks. The centre should feel warm when the compost is active.')),
    li(para('Compost is ready when it is dark, crumbly, and earthy-smelling. This takes three to six months.')),
  ],
  'composting-toilet-urine-diversion': [
    li(para('Fit a urine-diverting toilet seat or unit that collects liquid into a sealed container.')),
    li(para('Check the container level each week. Empty it when it reaches two-thirds full.')),
    li(para('Dilute the liquid ten-to-one with water before use. Apply it to compost, tree bases, or lawns — not to leaf crops.')),
    li(para('Rinse the container with water between uses.')),
  ],
  'dehumidifier-condensate-for-gardens': [
    li(para('Place a clean container under the dehumidifier drain point or drainage hose.')),
    li(para('Empty the container each time it fills. Condensate goes stale if left more than two to three days.')),
    li(para('Check the condensate is clear and odour-free before use. Discard it if it smells.')),
    li(para('Use it to water pots or raised beds. Do not use it on edible leaf crops.')),
  ],
  'dehumidifier-guide-damp-basement': [
    li(para('Measure the room size in square metres. Pick a unit with an output matched to the room volume.')),
    li(para('Place the unit away from walls so air can flow around it. Keep it clear of curtains or shelving.')),
    li(para('Set the target humidity between 50 and 60 per cent.')),
    li(para('Check the tank or drain hose each day for the first week. Empty or clear it before it stops the unit.')),
    li(para('Clean the air filter every four to six weeks. A blocked filter raises running costs.')),
  ],
  'food-date-labels-and-sensory-checking': [
    li(para('Read the date type first. Best before means quality may drop after this date. Use by means there is a safety risk if you eat it after this date.')),
    li(para('For best-before foods, use your nose and eyes. If it smells and looks fine, it is usually good to eat.')),
    li(para('Never rely on smell or sight alone for use-by foods. These have a real safety risk past the date.')),
    li(para('Keep a note of what you throw away each week. Adjust your shop to match so less goes to waste.')),
  ],
  'in-vessel-composting-unit-guide': [
    li(para('Place the unit on a level base with drainage beneath. Outdoors is best; a shed or garage works too.')),
    li(para('Add a mix of kitchen waste and dry brown material in equal parts. Shred or tear large pieces.')),
    li(para('Keep the lid closed between feeds to hold heat in and keep pests out.')),
    li(para('Turn or shake the drum every few days to add air. This speeds the process.')),
    li(para('Compost is ready when it is dark, crumbly, and earthy-smelling. This takes six to twelve weeks depending on the season.')),
  ],
  'lacto-fermentation-for-food-preservation': [
    li(para('Wash all jars and lids with hot soapy water and rinse well.')),
    li(para('Pack the food tightly into the jar. Leave two centimetres of space at the top.')),
    li(para('Make a two per cent salt brine: 20 g of non-iodised salt per litre of water. Pour it over the food until fully covered.')),
    li(para('Weight the food down so it stays below the brine. A small zip-lock bag filled with brine works well.')),
    li(para('Leave the jar at room temperature for three to seven days. Taste from day three.')),
    li(para('When the flavour is sharp enough, move the jar to the fridge to slow the fermentation.')),
  ],
  'led-lighting-upgrade-savings-guide': [
    li(para('Note the pence-per-kWh rate on your electricity bill.')),
    li(para('List each bulb wattage and the hours per day that light is on.')),
    li(para('Multiply: watts × daily hours × 365 ÷ 1000 = kWh per year per fitting. Multiply by the rate to get the cost.')),
    li(para('Do the same for an LED at roughly a quarter of the original wattage.')),
    li(para('The difference between the two figures is your saving per fitting per year. Add up all the fittings to get the annual total.')),
  ],
  'multifoil-insulation-evidence-review': [
    li(para('Read the current NHBC and BBA guidance before you buy. Rely on independent test results, not just the supplier\'s claims.')),
    li(para('Check whether your building control officer will accept multifoil as a standalone insulation layer. In most cases, they will not.')),
    li(para('If your BCO accepts it, confirm the required declared R-value in writing before ordering.')),
    li(para('Fit multifoil to the manufacturer\'s instructions. Leave no gaps at joints and tape all seams.')),
    li(para('Keep the test certificates and BCO approval letters with the property records.')),
  ],
  'off-grid-refrigeration-12v-vs-gas': [
    li(para('Work out how many days you typically go between charges or gas refills.')),
    li(para('For a 12V compressor fridge: measure your battery bank capacity in amp-hours. A 50-litre 12V fridge draws 30 to 50 Ah per day at 20 degrees Celsius. Check that your solar or alternator charge covers this.')),
    li(para('For a gas absorption fridge: confirm the unit sits level at all times. The unit needs ventilation at the top and bottom to work safely.')),
    li(para('Choose a 12V compressor if you have a solid, reliable charge source. Choose gas if you spend long periods without power and can keep the unit level.')),
  ],
  'substrate-inoculation-for-mushroom-compost': [
    li(para('Pasteurise the substrate: heat it to 65 to 75 degrees Celsius for one hour, then cool it to below 25 degrees before inoculating.')),
    li(para('Work in a clean area. Wipe all surfaces with alcohol spray. Wear gloves.')),
    li(para('Mix grain spawn into the cooled substrate at ten to fifteen per cent by weight. Work quickly to reduce contamination risk.')),
    li(para('Fill bags or containers loosely. Seal or tie them off and label with the date.')),
    li(para('Keep the bags at 20 to 25 degrees Celsius. Wait three to four weeks for full colonisation before moving to fruiting conditions.')),
  ],
  'wall-ties-inspection-and-replacement': [
    li(para('Hire a wall-tie specialist to carry out a borescope survey. They drill small holes in the mortar joints to check the tie condition.')),
    li(para('If ties are corroded, the specialist fits stainless steel replacement ties through the outer leaf into the inner leaf.')),
    li(para('The number of ties depends on the wall size and the type of failure. Ask for a written schedule before work starts.')),
    li(para('Once the work is done, ask for a written report and any guarantee. Keep both with the property records.')),
  ],
  'wood-furniture-stripping-and-refinishing': [
    li(para('Work outdoors or in a well-ventilated room. Wear gloves and eye protection.')),
    li(para('Apply a chemical stripper with an old brush. Leave it for the time stated on the tin.')),
    li(para('Scrape off the softened finish with a plastic scraper. Wipe down with white spirit on a cloth.')),
    li(para('Let the wood dry for at least 24 hours. Sand along the grain: start with 80 grit and finish with 180 grit.')),
    li(para('Apply the finish in thin coats. Sand lightly between coats with 240 grit.')),
  ],
  // Multi-issue entries also need method replacement
  'broadband-router-lifespan-extension': [
    li(para('Note the router\'s model and the date you got it. Check the maker\'s website to confirm whether firmware updates are still being released.')),
    li(para('Log into the router admin panel and check the firmware version. If an update is available, apply it.')),
    li(para('If your ISP calls to offer a free router swap, ask them specifically what technical reason makes the new model necessary. Most FTTC upgrades do not require a new router.')),
    li(para('When the router does reach end of support, recycle it at a council WEEE point or through your ISP\'s take-back scheme.')),
  ],
  'digital-footprint-and-data-energy': [
    li(para('List the always-on devices in your home. Check their standby wattage. Switch off at the wall any that draw more than 2 W on standby.')),
    li(para('Go to your cloud storage settings and turn off automatic high-resolution photo upload. Upload manually or at lower resolution instead.')),
    li(para('Lower streaming quality to HD on devices where you do not notice the difference. Standard definition is fine on a phone or small screen.')),
    li(para('When your current device stops working, compare the repair cost with the replacement cost. Repairing almost always has a lower carbon cost.')),
  ],
  'ev-home-charger-installation-types': [
    li(para('Decide between tethered and untethered. Tethered is faster to use each day. Untethered is more flexible if you change car or share the charger.')),
    li(para('Get quotes from at least two OZEV-approved installers. Ask each one to check your consumer unit and earthing system before quoting.')),
    li(para('Choose 7.4 kW single-phase for most homes. Only consider three-phase if your car supports it and your supply already has three-phase.')),
    li(para('After installation, ask for the BS 7671 test certificate and the earth electrode reading. Keep them with the property records.')),
  ],
  'external-shutters-summer-overheating': [
    li(para('Identify the windows that get the most sun between 9 am and 6 pm. South, east, and west-facing windows are the priority.')),
    li(para('Check whether you need planning permission. For most homes in England, external shutters are permitted development. Conservation areas and listed buildings need consent.')),
    li(para('Get quotes from two or three suppliers. Ask each for a g-value for the closed product — below 0.15 is good.')),
    li(para('Fit the shutters or blinds before the summer. Allow two to four weeks for delivery and installation.')),
  ],
  'listed-building-insulation-options': [
    li(para('Ask your local planning authority what works require listed building consent. Draught-proofing and secondary glazing usually do not. Internal wall insulation usually does.')),
    li(para('For works that need consent: prepare a description of the materials and methods, a heritage impact statement, and evidence that the system is breathable and reversible.')),
    li(para('Speak to your conservation officer before you submit. They often know which systems they are likely to approve.')),
    li(para('Once consent is granted, use a specialist contractor familiar with historic buildings. Ask for references from similar listed properties.')),
  ],
}

// Text fixes for non-placeholder grade-level issues
interface TextFix {
  matchStart: string  // first 50 chars to identify the paragraph
  replacement: string
}

const TEXT_FIXES: Record<string, TextFix[]> = {
  'broadband-router-lifespan-extension': [
    {
      matchStart: 'The router does not support WPA3',
      replacement: 'The router has no WPA3 and you handle sensitive data at home: time to replace it.',
    },
  ],
  'digital-footprint-and-data-energy': [
    {
      matchStart: 'Cryptocurrency and NFTs: proof-of-work coins',
      replacement: 'Crypto and NFTs: proof-of-work coins use a lot of energy per transaction. Much more than normal browsing. Cutting them out makes a real difference to your digital footprint.',
    },
  ],
  'ev-home-charger-installation-types': [
    {
      matchStart: 'Smart charging capability: the unit must meet',
      replacement: 'Smart charging: the charger must meet the EV Smart Charging Standard and allow remote scheduling. Ask for an OZEV-approved installer.',
    },
  ],
  'external-shutters-summer-overheating': [
    {
      matchStart: 'External shutters and blinds are generally permitted',
      replacement: 'External shutters and blinds count as permitted development for most homes in England. They must not stick out past the front wall or project more than 1 m from it. In a conservation area or listed building, you will need consent first.',
    },
  ],
  'floor-insulation-below-service-runs': [
    {
      matchStart: 'Fit rodent mesh or treated timber barriers at the perimeter sleeper walls',
      replacement: 'Fit rodent mesh at the base of each sleeper wall. Use treated timber or mesh around any pipe or cable holes. This keeps pests out of the void.',
    },
  ],
  'listed-building-insulation-options': [
    {
      matchStart: 'Suspended floor draught-sealing:',
      replacement: 'Suspended floor draught-sealing: fit brush seals or flexible strips to the gaps between floor boards. This is usually internal work and does not need consent.',
    },
  ],
}

// ─── Apply text fix to a body ────────────────────────────────────────────────

function applyTextFixes(body: TNode, fixes: TextFix[]): { body: TNode; changed: boolean } {
  let changed = false

  function getText(node: TNode): string {
    if (node.type === 'text') return node.text || ''
    if (node.content) return node.content.map(getText).join('')
    return ''
  }

  function walk(node: TNode): TNode {
    if (node.type === 'paragraph') {
      const text = getText(node)
      for (const fix of fixes) {
        if (text.startsWith(fix.matchStart.slice(0, 50))) {
          changed = true
          return para(fix.replacement)
        }
      }
    }
    if (node.content) {
      return { ...node, content: node.content.map(walk) }
    }
    return node
  }

  return { body: walk(body), changed }
}

// ─── Main ────────────────────────────────────────────────────────────────────

const snapshotDir = resolve(__dirname, '../../docs/qc-fixes-2026-06-01')
mkdirSync(snapshotDir, { recursive: true })

async function main() {
  const slugs = Object.keys(METHODS)
  console.log('qc-manual-fix: processing', slugs.length, 'slugs')

  let passed = 0
  let failed: string[] = []

  for (const slug of slugs) {
    const t = await prisma.tutorial.findUnique({
      where: { slug },
      select: { id: true, slug: true, title: true, body: true, voiceRetrofittedAt: true },
    })
    if (!t) { console.log('  SKIP ' + slug + ' (not found)'); continue }

    let body = t.body as TNode
    let changed = false

    // Snapshot before first touch
    const snapshotPath = resolve(snapshotDir, `${slug}.manual.before.json`)
    if (!existsSync(snapshotPath)) {
      writeFileSync(snapshotPath, JSON.stringify({ slug, capturedAt: new Date().toISOString(), body }, null, 2), 'utf8')
    }

    // 1. Replace method placeholder with real steps
    const methodSteps = METHODS[slug]
    if (methodSteps) {
      const { body: newBody, changed: methodChanged } = replaceMethodPlaceholder(body, methodSteps)
      if (methodChanged) {
        body = newBody
        changed = true
      }
    }

    // 2. Apply text-level fixes
    const textFixes = TEXT_FIXES[slug]
    if (textFixes) {
      const { body: newBody, changed: textChanged } = applyTextFixes(body, textFixes)
      if (textChanged) {
        body = newBody
        changed = true
      }
    }

    if (!changed) {
      console.log('  NO_CHANGE ' + slug + ' (placeholder not found — may already be fixed)')
      passed++ // already clean
      continue
    }

    // Save to DB
    await prisma.tutorial.update({
      where: { id: t.id },
      data: {
        body: body as any,
        voiceRetrofittedAt: new Date(),
      },
    })

    console.log('  UPDATED ' + slug)
    passed++
  }

  console.log('\nqc-manual-fix: done. updated=' + (passed - failed.length) + ' failed=' + failed.length)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
