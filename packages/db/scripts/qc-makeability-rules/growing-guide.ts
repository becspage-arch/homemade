import { bodyText, compose, hasNodeType, headings, type MakeabilityContext, type MakeabilityResult } from './shared.js'

/**
 * GROWING_GUIDE (garden) — the "GROWING_GUIDE" checklist section, every item a
 * hard block. Region metadata derives at render (translation-is-free lock), so
 * the sowing window / hardiness are read from the body prose.
 */
export function auditTutorial(ctx: MakeabilityContext): MakeabilityResult {
  const reasons: string[] = []
  const text = bodyText(ctx.body)

  // Latin binomial (Genus species). The common name is the title, always present.
  if (!/\b[A-Z][a-z]+\s+[a-z]{3,}\b/.test(text)) reasons.push('no Latin binomial (Genus species)')

  const sowingTime =
    /\b(sow|plant|propagat|cutting|seed|divide|transplant)/i.test(text) &&
    /\b(spring|summer|autumn|fall|winter|march|april|may|june|july|august|september|october|november|december|february|january|early|late|month|after the last frost|when the soil|week)/i.test(text)
  if (!sowingTime) reasons.push('no sowing window (months / season)')

  const depth = /\b\d+(?:\.\d+)?\s*(?:mm|cm|inch|in\b|")\b[^.]{0,15}\bdeep\b|\bsow\b[^.]{0,30}\bdeep(?:ly)?\b|\bdepth\b|\bdrill\b[^.]{0,20}\d|\bsurface[- ]?sow|barely cover|\bthin layer\b|cover (?:with|lightly|them)|do(?:n'?t| not) bury|press (?:them |the seeds? )?in|lightly cover|just below the surface|scatter.{0,20}cover|insert (?:the )?cuttings?\b|push (?:the )?cuttings?|crown (?:at|level|sits|on)|at soil level|fork'?s depth|same depth as|to the depth of|deep enough to|plant (?:them )?(?:so|with|at|to)|bury the (?:lower|stem)/i.test(text)
  if (!depth) reasons.push('no sowing depth')

  const spacing = /\bapart\b|\bspac(?:e|ing|ed)\b|\b\d+\s*(?:cm|mm|inch|in\b|")\b[^.]{0,15}(?:apart|between)|\brows?\b[^.]{0,20}\d|around the edge|per (?:pot|module|cell|plant|square metre|m2|sq m)|one (?:per|to a)|thin to|station sow|broadcast|scatter|seeds? per|sow (?:thinly|thickly|densely)|density|drills?\b/i.test(text)
  if (!spacing) reasons.push('no spacing (between plants + rows)')

  const climate = /\b(hardiness|hardy|zone|climate|frost|tender|half-hardy|overwinter|temperature|° ?c|perennial|biennial|annual|cold[- ]?(?:hardy|tolerant)|survives? (?:the )?winter|mild|warm|cool|shelter)\b/i.test(text)
  if (!climate) reasons.push('no hardiness / climate guidance')

  const sun = /\b(full sun|partial shade|part shade|dappled shade|full shade|sunny|sheltered|south[- ]facing|\bsun\b|\bshade\b)\b/i.test(text)
  if (!sun) reasons.push('no sun requirements')

  const water = /\b(water|watering|moist|drought|irrigat|keep.{0,15}(?:moist|damp|watered)|do not let.{0,15}dry)\b/i.test(text)
  if (!water) reasons.push('no water requirements')

  const soil = /\b(soil|compost|loam|well[- ]drained|free[- ]draining|ph\b|acidic|alkaline|fertile|humus|mulch|ground)\b/i.test(text)
  if (!soil) reasons.push('no soil preferences')

  const care = /\b(water|feed|mulch|weed|prune|stake|pinch|care|maintain|fertilis|fertiliz|hoe|thin (?:out|to)|liquid feed|deadhead|earth up)\b/i.test(text)
  if (!care) reasons.push('no care instructions')

  const harvestHeading = headings(ctx.body).some((h) => /harvest|pick|crop|cut|lift|gather|through the season|cropping|day \d|seasona/i.test(h))
  const harvestTime = harvestHeading ||
    /\b(harvest|pick|crop|lift|gather|cut|ready|take[s]?|mature)\b[^.]{0,40}\b(when|after|from|in|once|\d+\s*(?:to\s*\d+\s*)?(?:weeks?|days?|months?)|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|spring|summer|autumn|winter)/i.test(text) ||
    /\bday\s*\d+\b[^.]{0,40}(harvest|cut|pick|ready)/i.test(text) ||
    /\b\d+\s*(?:to\s*\d+\s*)?days?\b/i.test(text) && /\b(harvest|cut|pick|crop|ready|mature|microgreen|shoot)\b/i.test(text)
  if (!harvestTime) reasons.push('no harvest timing')

  // Signs of readiness — often folded into the harvest section (pick young /
  // outer leaves, cut spikes in bud, lift when the tops die back, pull when
  // ripe). Credit a Harvest section plus any readiness cue.
  const readiness = harvestHeading ||
    /\bready (?:to|when|for)\b|\bwhen (?:they|the|it).{0,40}\b(ready|ripe|red|golden|firm|swell|plump|big enough|full size)\b|\bsigns?\b|\bharvest when\b|\blooks?\b[^.]{0,20}\bready\b|\bfeel.{0,15}firm\b|\bcome away\b|\beasily\b|\b(ripe|ripen|turn(?:s|ing)? (?:red|golden|colour)|fully (?:coloured|grown)|plump|swollen|pull(?:s)? away|lifts? (?:easily|cleanly)|firm to the touch|colour up|young leaves|outer leaves|in bud|before the flowers|tender|tops? (?:die|yellow|flop)|big enough|cotyledons?|true leaves|first leaves|\d+\s*(?:to\s*\d+\s*)?cm tall|fully open|shoots? are|when the (?:majority|shoots))\b/i.test(text)
  if (!readiness) reasons.push('no signs of harvest readiness')

  const problems =
    hasNodeType(ctx.body, 'troubleshooter') ||
    headings(ctx.body).some((h) => /problem|mistake|pest|disease|trouble|what can go wrong|watch (?:for|out)/i.test(h)) ||
    /\b(problem|pest|disease|aphid|slug|snail|mildew|\brot\b|bolt|blight|caterpillar|black ?fly|white ?fly|bird|mouse|mice|mould|botrytis|grey mould|what can go wrong|trouble|remedy|net(?:ting)? against|protect (?:against|from)|if (?:the|they|it)|too (?:wet|dry|hot|cold))\b/i.test(text)
  if (!problems) reasons.push('no common problems + remedies')

  return compose(ctx, 'garden:growing-guide', reasons)
}
