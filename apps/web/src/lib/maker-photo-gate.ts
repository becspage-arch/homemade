import 'server-only'
import { prisma, UserPhotoStatus } from '@homemade/db'
import { anthropicConfigured, anthropicJson, GATE_MODEL } from '@/lib/anthropic'
import { makerPhotoGateMode, type PhotoGateMode } from '@/lib/studio/generation/bulk/autopilot-state'
import { MAKER_PHOTO_RULES, MAKER_PHOTO_NOT_A_REJECT } from '@/lib/maker-photo-rules'

/**
 * THE MAKER-PHOTO GATE — the check a member's finished-project photo passes
 * before it appears under a pattern.
 *
 * TWO MODES, one bar. The rules below are the whole bar and both modes judge
 * against exactly these three; the only difference is WHO looks and WHEN.
 *
 * 'api' (the default) — the check runs on upload, so a member who has just
 *   photographed a finished piece gets an answer while they are still standing
 *   there. This is Rebecca's call of 6 September 2026 and the one deliberate
 *   exception to "no per-token model calls": a person is waiting, and hours of
 *   silence is a worse product than a fraction of a penny.
 * 'routine' — the photo stays PENDING behind "Checking your photo" and the
 *   scheduled cross-stitch judging session works the queue with
 *   `apps/web/scripts/maker-photos-judge.ts`, judging against these same three
 *   rules. Zero spend, hours of latency.
 *
 * Either way a photo is PENDING until something has looked at it, and a PENDING
 * photo appears nowhere public. Nothing is auto-approved, ever.
 */

export type PhotoVerdict = 'approve' | 'reject'

export interface PhotoGateResult {
  verdict: PhotoVerdict
  /** Short reasons, shown to the member on a reject and stored on the row. */
  reasons: string[]
}

const SYSTEM = `You check photographs that members of a craft community upload of things they have made, so they can appear under the pattern they made them from. You are checking for SAFETY and HONESTY, not for photography.

A photo passes only if ALL THREE of these are YES:
1. ${MAKER_PHOTO_RULES[0]}
2. ${MAKER_PHOTO_RULES[1]}
3. ${MAKER_PHOTO_RULES[2]}

WHAT IS NOT A REJECT. ${MAKER_PHOTO_NOT_A_REJECT}

Reply ONLY with compact JSON, at most TWO short reasons (each under 12 words), each written so it could be shown to the member:
{"verdict":"approve|reject","reasons":["..."]}`

/** True when the API gate can actually run. */
export function photoGateConfigured(): boolean {
  return anthropicConfigured()
}

/**
 * Judge one photo against the three rules. Throws if the client is not wired —
 * callers check `photoGateConfigured()` first.
 *
 * Fails to REJECT, not approve, on an unparseable answer: a photo held back
 * wrongly is a message to a member, a photo let through wrongly is on the site.
 */
export async function judgeMakerPhoto(
  image: Buffer,
  ctx: { mediaType?: 'image/png' | 'image/jpeg' | 'image/webp'; caption?: string | null } = {},
): Promise<PhotoGateResult> {
  if (!anthropicConfigured()) {
    throw new Error('judgeMakerPhoto: ANTHROPIC_API_KEY not set')
  }
  const caption = ctx.caption?.trim()
  const prompt = `A member uploaded this photo of something they made.${caption ? ` Their caption: "${caption.slice(0, 300)}".` : ''}
Judge it against the three rules and reply with the JSON verdict only.`

  let raw: { verdict?: string; reasons?: unknown }
  try {
    raw = await anthropicJson<{ verdict?: string; reasons?: unknown }>({
      model: GATE_MODEL,
      system: SYSTEM,
      prompt,
      images: [{ buffer: image, mediaType: ctx.mediaType ?? 'image/jpeg' }],
      maxTokens: 400,
    })
  } catch (err) {
    return {
      verdict: 'reject',
      reasons: [`check could not run: ${err instanceof Error ? err.message.slice(0, 80) : 'error'}`],
    }
  }
  const verdict: PhotoVerdict = raw.verdict === 'approve' ? 'approve' : 'reject'
  const reasons = Array.isArray(raw.reasons) ? raw.reasons.map((r) => String(r).slice(0, 160)).slice(0, 4) : []
  return { verdict, reasons }
}

/** What the member is told the moment their upload lands. */
export const PHOTO_PENDING_MESSAGE = 'Checking your photo. It will appear under the pattern once it is through.'
export const PHOTO_APPROVED_MESSAGE = 'Your photo is up under the pattern.'

export interface PhotoGateOutcome {
  mode: PhotoGateMode
  status: UserPhotoStatus
  message: string
  reasons: string[]
}

/**
 * Run whichever gate is in force over one just-uploaded photo.
 *
 * NEVER THROWS. A photo whose check falls over stays PENDING and waits for the
 * routine or a person — an upload must not fail because a judge was
 * unreachable, and it must not be approved because one was either.
 */
export async function gateMakerPhoto(args: {
  photoId: string
  bytes: Buffer
  mimeType: string
  caption?: string | null
}): Promise<PhotoGateOutcome> {
  const mode = await makerPhotoGateMode().catch(() => 'api' as PhotoGateMode)
  const pending: PhotoGateOutcome = {
    mode,
    status: UserPhotoStatus.PENDING,
    message: PHOTO_PENDING_MESSAGE,
    reasons: [],
  }
  // In routine mode nothing is called: the photo waits for the scheduled
  // session, exactly as the cross-stitch candidates do.
  if (mode === 'routine') return pending
  if (!photoGateConfigured()) return pending

  const mediaType =
    args.mimeType === 'image/png' ? 'image/png' : args.mimeType === 'image/webp' ? 'image/webp' : 'image/jpeg'
  let result: PhotoGateResult
  try {
    result = await judgeMakerPhoto(args.bytes, { mediaType, caption: args.caption })
  } catch (err) {
    console.warn(`[maker-photo-gate] ${args.photoId} check threw`, err)
    return pending
  }

  try {
    await prisma.userPatternPhoto.update({
      where: { id: args.photoId },
      select: { id: true },
      data: {
        status: result.verdict === 'approve' ? UserPhotoStatus.APPROVED : UserPhotoStatus.REJECTED,
        reviewedAt: new Date(),
        reviewNotes: result.reasons.length ? result.reasons.join('; ').slice(0, 400) : null,
      },
    })
  } catch (err) {
    console.warn(`[maker-photo-gate] ${args.photoId} could not be recorded`, err)
    return pending
  }

  return result.verdict === 'approve'
    ? { mode, status: UserPhotoStatus.APPROVED, message: PHOTO_APPROVED_MESSAGE, reasons: result.reasons }
    : {
        mode,
        status: UserPhotoStatus.REJECTED,
        message: result.reasons[0] ?? 'That photo cannot go up.',
        reasons: result.reasons,
      }
}
