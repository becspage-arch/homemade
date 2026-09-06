import 'server-only'
import { anthropicConfigured, anthropicJson, GATE_MODEL } from '@/lib/anthropic'

/**
 * The ruthless keep-or-kill VISION GATE — server-side.
 *
 * This is the anti-junk control from GATE_CHECKLIST.md / AI_DESIGN_SYSTEM.md,
 * lifted out of the manual "a Claude session looks at every render" pass and run
 * as a per-candidate Anthropic vision call so the bulk catalogue routine fills
 * unattended, off Rebecca's PC. It looks at the FINISHED render — the exact
 * artifact that would ship — and returns keep / repair / kill.
 *
 * IMPORTANT: this is the CATALOGUE gate only. It NEVER runs on the customer
 * create-your-own path — a customer's own request is accepted, not judged (see
 * pattern-engine.ts). Only the bulk gem routine calls this.
 */

export type GateVerdict = 'keep' | 'repair' | 'kill'

export interface GateResult {
  verdict: GateVerdict
  /** Short reasons the judge gives (for the batch summary + logs). */
  reasons: string[]
  /**
   * On 'repair', a concrete fix the fault maps to (mirrors GATE_CHECKLIST's
   * repair table) — e.g. 're-roll', 'more-saturation', 'fewer-colours',
   * 'more-colours', 're-centre'. The runner uses it to adjust the re-roll.
   */
  repairAction?: 'reroll' | 'more-saturation' | 'fewer-colours' | 'more-colours' | 're-centre'
}

export interface GateContext {
  /** What we asked Flux for — lets the judge check "did we get the subject". */
  subject: string
  /** cross-stitch | needlework — the craft the render is for. */
  craft: 'cross-stitch' | 'needlework'
  /** Colour count of the converted chart (helps judge mush vs. sparse). */
  colours?: number
  /** Titles/subjects already kept THIS batch — for the near-duplicate check. */
  keptSubjects?: string[]
}

const SYSTEM = `You are the ruthless quality gate for Homemade's pattern catalogue. You judge the FINISHED render of a machine-generated craft pattern — the exact image a customer would receive. Homemade generates in abundance (image generation is cheap) and only gems ship; your job is to keep gems and reject everything else. A LOW pass rate is expected and correct — "is it a gem I'd buy and hang", never "is it ok".

Judge against, per design (every box must be YES):
1. COMPLETE — nothing missing, cut off, or garbled. Faces: forehead present, both eyes, correct proportions. Animals: correct features/snout/eyes, no extra or missing limbs, no floating parts.
2. CRISP — reads cleanly at stitch resolution: no mush, no confetti, no dead/empty patches, no broken outlines.
3. BEST-SELLER BAR — a clear "I'd buy this and hang it", not "it's ok".
4. COLOUR — rich and intentional, not washed-out, muddy, or accidentally pale.
5. COMPOSITION — balanced, centred, intentional; not lopsided, badly cropped, or awkward.
6. ORIGINAL + SAFE — an original design; NOT readable text/lettering/signage (the converter cannot render text), NOT a recognisable copy of a specific shop/celebrity/brand/franchise design.
7. NOT A NEAR-DUPLICATE of anything already kept this batch (you'll be given the kept subjects).

Decide ONE verdict:
- "keep" — passes every box; a gem.
- "repair" — a SINGLE clearly-fixable fault (washed-out → more-saturation; too sparse/simple → more-colours; mushy/confetti → fewer-colours; slightly cropped/lopsided → re-centre). Give the repairAction.
- "kill" — anything else: not best-seller, off-brief (does not clearly depict what was asked), gibberish text, IP-risky, near-duplicate, or multiple faults.

KILL, do not keep or repair, if ANY of these: the main subject is malformed, anatomically wrong, or a blobby/melted "AI creature"; the render doesn't clearly read as the requested subject; the subject is mushy or confetti-ridden ACROSS the piece; readable or garbled text/lettering anywhere; a near-duplicate of something already kept; washed-out after a repair. These are the misses that must not reach the catalogue.

ALSO KILL:
- FACES THAT ARE WRONG. A face — human or animal — whose features are actually WRONG: asymmetric or misplaced eyes, a duplicated or missing eye, smeared or smudged features, a mouth or snout in the wrong place. A sweet subject with a wrong face is a kill, not a repair; the face is the whole product.
- PALE WORK. Pale, pastel-on-cream or low-contrast renders are never "keep". Give it "repair" with more-saturation ONCE; if it comes back still pale, kill it. Cream on cream does not exist as stitching.

WHAT IS NOT A KILL. This is a chart worked in floss and looked at from across a room, not a photograph inspected at 400%. A single small detail that a stitcher would not notice at arm's length is not a kill: a small eye, a face in shadow or turned away, a soft edge on a background element, a prop or a stand that is simplified, one shadowed patch. Judge the piece a customer would hang. Only kill for a detail when the detail IS the subject — the face of a portrait, the one animal in the frame — or when the fault repeats across the whole render.

When in doubt because the WHOLE piece is weak — muddled, dull, badly composed, unclear what it is — do NOT keep. When the doubt is one small thing in an otherwise lovely chart, keep it. Reply ONLY with compact JSON, at most TWO short reasons (each under 12 words):
{"verdict":"keep|repair|kill","reasons":["..."],"repairAction":"reroll|more-saturation|fewer-colours|more-colours|re-centre"}
Omit repairAction unless verdict is "repair".`

/**
 * True when the gate can actually run (the Anthropic key is wired). The bulk
 * runner checks this before generating so it never produces un-gated output.
 */
export function gateConfigured(): boolean {
  return anthropicConfigured()
}

/**
 * Judge one finished render. `png` is the exact thumbnail/hero that would ship.
 * Throws if the gate isn't configured — callers must check `gateConfigured()`.
 */
export async function visionGate(png: Buffer, ctx: GateContext): Promise<GateResult> {
  if (!anthropicConfigured()) {
    throw new Error('visionGate: ANTHROPIC_API_KEY not set — cannot judge, refusing to publish un-gated')
  }
  const kept = ctx.keptSubjects?.length
    ? `Already kept this batch (reject near-duplicates of these): ${ctx.keptSubjects.join('; ')}.`
    : 'Nothing kept yet this batch.'
  const prompt = `This is a finished ${ctx.craft} pattern render.
We asked the illustrator for: "${ctx.subject}".${ctx.colours ? ` The converted chart uses ${ctx.colours} colours.` : ''}
${kept}
Judge it and reply with the JSON verdict only.`

  let raw: { verdict?: string; reasons?: unknown; repairAction?: string }
  try {
    raw = await anthropicJson<{ verdict?: string; reasons?: unknown; repairAction?: string }>({
      model: GATE_MODEL,
      system: SYSTEM,
      prompt,
      images: [{ buffer: png, mediaType: 'image/png' }],
      maxTokens: 600,
    })
  } catch (err) {
    // An unparseable/truncated verdict must never publish — fail safe to kill.
    return { verdict: 'kill', reasons: [`gate response unparseable: ${err instanceof Error ? err.message.slice(0, 80) : 'error'}`] }
  }

  const verdict: GateVerdict =
    raw.verdict === 'keep' || raw.verdict === 'repair' || raw.verdict === 'kill'
      ? raw.verdict
      : 'kill'
  const reasons = Array.isArray(raw.reasons)
    ? raw.reasons.map((r) => String(r)).slice(0, 6)
    : []
  const repairAction =
    verdict === 'repair' &&
    (raw.repairAction === 'reroll' ||
      raw.repairAction === 'more-saturation' ||
      raw.repairAction === 'fewer-colours' ||
      raw.repairAction === 'more-colours' ||
      raw.repairAction === 're-centre')
      ? raw.repairAction
      : undefined

  // A 'repair' verdict with no actionable hint can't be repaired — treat as kill.
  if (verdict === 'repair' && !repairAction) {
    return { verdict: 'kill', reasons: reasons.length ? reasons : ['repair with no actionable fault'] }
  }
  return { verdict, reasons, repairAction }
}
