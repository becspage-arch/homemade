import 'server-only'
import { anthropicConfigured, anthropicJson, GATE_MODEL } from '@/lib/anthropic'
import { parseGateVerdict, type GateDecision } from './maker-photo-rules'

export { parseGateVerdict }
export type { GateDecision }

/**
 * The maker-photo gate. Approval is AI-only and binary: a photo is approved and
 * appears, or it is rejected and the member is told why in one or two plain
 * sentences with an "Ask us to look again" button. There is no warning tier and
 * no routine human queue — the appeal is the only queue.
 *
 * Fail closed. Every path that cannot produce a real verdict returns "pending",
 * which leaves the photo invisible and tells the member it is being checked. A
 * photo never publishes un-gated, and a gate that cannot run never reads as a
 * rejection to the person who uploaded.
 */

export interface MakerPhotoGateResult {
  decision: GateDecision
  /** At most two short plain reasons. Empty on approve. */
  reasons: string[]
  /** The model that produced the verdict; null when the gate could not run. */
  model: string | null
}

export interface MakerPhotoGateInput {
  /** The uploaded photo bytes. */
  photo: Buffer
  photoMediaType?: 'image/png' | 'image/jpeg' | 'image/webp'
  /** The title of the thing the photo is supposed to show. */
  itemTitle: string
  /** What kind of made thing it is, in plain words ("cross-stitch pattern"). */
  itemKind: string
  /**
   * For patterns, the chart or design thumbnail, passed as a second image so
   * the gate can judge "does this plausibly depict THIS item".
   */
  reference?: { buffer: Buffer; mediaType?: 'image/png' | 'image/jpeg' | 'image/webp' } | null
}

const SYSTEM = `You check photographs that members of Homemade upload of things they have made: finished craft pieces and dishes of food. You approve or reject. Nothing in between.

Approve only when all three are true:

1. REAL PHOTOGRAPH OF A REAL FINISHED THING. A camera photograph of a physical object that exists. Reject a screenshot, a chart or pattern diagram, a digital render or mock-up, a drawing, a stock or catalogue product photo, a photo of a screen, or an image lifted from a shop listing.

2. PLAUSIBLY THE RIGHT THING. It shows the item described, or something a person could reasonably have made from it. You are given the item's title, and for a pattern you are also given the chart or design as a second image. Judge whether the photograph plausibly depicts that item. Colours, finishing, framing, styling and skill all vary between makers, so allow wide latitude: reject only when it clearly shows something else.

3. SAFE TO SHOW. No nudity or sexual content. No identifiable children. Nothing hateful, violent or abusive. Incidental adults in the background are fine. A photograph whose main subject is a person rather than the made thing is a reject.

Work in progress is fine if the piece is real and recognisable. A dark, blurry or badly lit photo is still a real photo: approve it. Judge whether the photo is true, not whether it is good.

Reply with compact JSON only:
{"decision":"approve","reasons":[]}
{"decision":"reject","reasons":["...","..."]}

On reject give one or two reasons, each a short plain sentence under 14 words, addressed to the member and saying what is wrong. British English. No jargon, no apology, no advice about lighting or composition.`

/** True when the gate can actually run. */
export function makerPhotoGateConfigured(): boolean {
  return anthropicConfigured()
}

/**
 * Judge one uploaded photo. Never throws: a missing key, a network failure, an
 * unparseable reply and a malformed verdict all come back as "pending".
 */
export async function gateMakerPhoto(
  input: MakerPhotoGateInput,
): Promise<MakerPhotoGateResult> {
  if (!anthropicConfigured()) {
    return { decision: 'pending', reasons: [], model: null }
  }

  const images = [
    { buffer: input.photo, mediaType: input.photoMediaType ?? 'image/jpeg' as const },
  ]
  if (input.reference) {
    images.push({
      buffer: input.reference.buffer,
      mediaType: input.reference.mediaType ?? 'image/png',
    })
  }

  const prompt = [
    `The member says this photograph shows their finished ${input.itemKind}: "${input.itemTitle}".`,
    'The first image is the member\'s photograph.',
    input.reference
      ? 'The second image is the pattern chart or design they worked from. Use it to judge whether the photograph plausibly shows that design worked up, allowing for colour, fabric and finishing choices.'
      : '',
    'Judge it and reply with the JSON verdict only.',
  ]
    .filter(Boolean)
    .join('\n')

  let raw: unknown
  try {
    raw = await anthropicJson<unknown>({
      model: GATE_MODEL,
      system: SYSTEM,
      prompt,
      images,
      maxTokens: 400,
      retries: 2,
    })
  } catch {
    // The gate could not run. Hold the photo; the member sees "Checking your
    // photo", not a rejection they did nothing to earn.
    return { decision: 'pending', reasons: [], model: null }
  }

  const parsed = parseGateVerdict(raw)
  return {
    decision: parsed.decision,
    reasons: parsed.reasons,
    model: parsed.decision === 'pending' ? null : GATE_MODEL,
  }
}
