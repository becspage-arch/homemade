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
  /** cross-stitch | needlework | crochet — the craft the render is for. */
  craft: 'cross-stitch' | 'needlework' | 'crochet'
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

KILL, do not keep or repair, if ANY of these: the main subject is malformed, ugly, anatomically wrong, or a blobby/melted "AI creature"; the render doesn't clearly read as the requested subject; a face or animal has wrong/duplicated/missing eyes or features; the piece is a generic under-detailed blob. These are the misses that must not reach the catalogue — be strict, a low pass rate is correct.

ALSO KILL:
- FACES. A face — human or animal — that is not clearly APPEALING: dead, dark, muddled, asymmetric or misplaced eyes; smeared or smudged features; a blank or unsettling expression. A sweet subject with a wrong face is a kill, not a repair; the face is the whole product.
- PALE WORK. Pale, pastel-on-cream or low-contrast renders are never "keep". Give it "repair" with more-saturation ONCE; if it comes back still pale, kill it. Cream on cream does not exist as stitching.

Judge as the pickiest Etsy buyer, not as a friend of the designer: if you would scroll past it, kill it.

When in doubt between keep and repair/kill, do NOT keep. Reply ONLY with compact JSON, at most TWO short reasons (each under 12 words):
{"verdict":"keep|repair|kill","reasons":["..."],"repairAction":"reroll|more-saturation|fewer-colours|more-colours|re-centre"}
Omit repairAction unless verdict is "repair".`

/**
 * The per-craft addendum, appended to the rubric above.
 *
 * CROCHET is judged differently from the two converted-illustration crafts, and
 * the difference matters. A crochet hero is not an interpretation of a picture:
 * it is a photograph of the finished object built from the pattern's own stitch
 * program, so the question is not "is this a lovely illustration" but "is this
 * a lovely OBJECT, and is the fabric real". A melted or broken patch of fabric
 * is a construction failure the customer would meet at the hook, not a
 * cosmetic one, so it is a kill rather than a repair. There is no re-roll that
 * changes a crochet render either — the geometry is deterministic — so a fault
 * in the object is terminal and only the staging faults are repairable.
 */
const CRAFT_RUBRIC: Record<GateContext['craft'], string> = {
  'cross-stitch': '',
  needlework: '',
  crochet: `

THIS IS A CROCHET PATTERN'S OWN HERO — a photograph of the finished object, built stitch for stitch from the pattern's stored program. Judge the OBJECT, not an illustration. Extra boxes, every one a YES:
A. IT IS THE THING ASKED FOR. The finished object reads as the item in the brief: a coaster reads as a coaster, a bear reads as a bear, a picture panel shows the picture described. If you could not name it without being told, kill it.
B. THE FABRIC IS REAL AND WHOLE. Continuous crocheted stitches, even rows or rounds, no melted, smeared, torn or missing patch, no gap where the fabric should be solid, no stitch that dissolves into fuzz. A broken patch is a KILL, never a repair: the geometry is deterministic, so a re-roll cannot fix it.
C. THE COLOURS ARE THE PATTERN'S. The yarn colours are the ones the brief asked for, clean and separated. On a striped or tapestry piece the colour boundaries are crisp and the picture reads.
D. IT IS STAGED AS A FINISHED OBJECT. The whole piece sits on a clean pale ground at a sensible product-photo scale, not a macro crop of fabric and not cropped through the object.
E. NOTHING IN THE FRAME BUT THE PATTERN. The photoreal finishing pass sometimes invents a hand holding the piece, a person, a table, a plant, a mug, a pair of scissors or a caption, and the structural check can still pass an image that has one. KILL any hero showing hands, fingers, arms, a person or part of one, furniture, or any prop that is not the pattern's own notions (its safety eyes and nose are the pattern's; everything else is not). KILL any text, lettering, numbers, logo or watermark. This is a kill, never a repair.

Because the render is deterministic, "repair" here means only a STAGING fault worth one fresh render (badly cropped or lopsided framing → re-centre). Anything about the object itself, and anything invented into the frame, is a kill.`,
}

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
      system: `${SYSTEM}${CRAFT_RUBRIC[ctx.craft] ?? ''}`,
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
