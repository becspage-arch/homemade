import 'server-only'
import { anthropicConfigured, anthropicJson, GATE_MODEL } from '@/lib/anthropic'
import {
  makerPhotoGateMode,
  type PhotoGateMode,
} from '@/lib/studio/generation/bulk/autopilot-state'
import {
  MAKER_PHOTO_NOT_A_REJECT,
  MAKER_PHOTO_RULES,
  parseGateVerdict,
  type GateDecision,
} from './maker-photo-rules'

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
 *
 * TWO MODES, ONE BAR. `MAKER_PHOTO_RULES` below is the whole bar, and both
 * modes judge against exactly those three rules; the only difference is who
 * looks and when.
 *
 * 'api' (the default) — this gate runs on upload, so a member who has just
 *   photographed a finished piece gets an answer while they are still standing
 *   there.
 * 'routine' — nothing is called on upload. The photo stays
 *   PENDING_MODERATION behind "Checking your photo" and the scheduled judging
 *   session works the queue with `apps/web/scripts/maker-photos-judge.ts`,
 *   against these same rules. Zero spend, hours of latency.
 *
 * The upload path asks `makerPhotoGateRunsOnUpload()` before it fetches any
 * bytes, so 'routine' mode reaches neither the network nor the model.
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

1. ${MAKER_PHOTO_RULES[0]}

2. ${MAKER_PHOTO_RULES[1]}

3. ${MAKER_PHOTO_RULES[2]}

${MAKER_PHOTO_NOT_A_REJECT}

Reply with compact JSON only:
{"decision":"approve","reasons":[]}
{"decision":"reject","reasons":["...","..."]}

On reject give one or two reasons, each a short plain sentence under 14 words, addressed to the member and saying what is wrong. British English. No jargon, no apology, no advice about lighting or composition.`

/** True when the gate can actually run. */
export function makerPhotoGateConfigured(): boolean {
  return anthropicConfigured()
}

/**
 * Whether the gate runs inline on upload ('api', the default) or the photo
 * waits for the scheduled judging session ('routine'). The upload path checks
 * this BEFORE it fetches any image bytes, so in 'routine' mode nothing is
 * fetched and the Anthropic client is never called; the photo simply stays
 * PENDING_MODERATION, which is the same "Checking your photo" state a member
 * already sees when the gate cannot run.
 *
 * Never throws: an unreadable switch falls back to 'api', the default.
 */
export async function makerPhotoGateRunsOnUpload(): Promise<boolean> {
  const mode = await makerPhotoGateMode().catch(() => 'api' as PhotoGateMode)
  return mode !== 'routine'
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
