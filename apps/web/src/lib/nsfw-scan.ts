import 'server-only'
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
} from '@aws-sdk/client-rekognition'

export interface NsfwScanResult {
  /** Highest confidence label found, 0-1. `null` means the scanner didn't run. */
  score: number | null
  /** Label name from the scanner (e.g. "Explicit Nudity"). `null` if no label. */
  classification: string | null
  /** True when the scanner was invoked successfully (even if no label fired). */
  scanned: boolean
  /** When the scan was skipped, the reason — surfaced in the admin queue. */
  skippedReason?: string
}

/**
 * Run an automated NSFW pre-screen on a publicly-fetchable image URL.
 *
 * Uses AWS Rekognition's `DetectModerationLabels`. Gracefully no-ops when:
 *   - AWS credentials aren't in the runtime environment (local dev).
 *   - The ECS task role lacks `rekognition:DetectModerationLabels`. The
 *     hardening pass / a follow-up CDK deploy will grant this.
 *   - The image fetch itself fails.
 *
 * On a no-op the photo stays `PENDING_MODERATION` for human review and the
 * NSFW columns stay null.
 */
export async function scanImageForNsfw(imageUrl: string): Promise<NsfwScanResult> {
  const region = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION
  if (!region) {
    return {
      score: null,
      classification: null,
      scanned: false,
      skippedReason: 'AWS region not configured',
    }
  }

  try {
    const res = await fetch(imageUrl, { cache: 'no-store' })
    if (!res.ok) {
      return {
        score: null,
        classification: null,
        scanned: false,
        skippedReason: `image fetch failed (${res.status})`,
      }
    }
    const buf = Buffer.from(await res.arrayBuffer())

    const client = new RekognitionClient({ region })
    const out = await client.send(
      new DetectModerationLabelsCommand({
        Image: { Bytes: buf },
        MinConfidence: 50,
      }),
    )

    const labels = out.ModerationLabels ?? []
    const first = labels[0]
    if (!first) {
      return { score: 0, classification: null, scanned: true }
    }

    const top = labels.reduce(
      (a, b) => ((b.Confidence ?? 0) > (a.Confidence ?? 0) ? b : a),
      first,
    )
    return {
      score: (top.Confidence ?? 0) / 100,
      classification: top.Name ?? null,
      scanned: true,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    // eslint-disable-next-line no-console
    console.warn('rekognition NSFW scan failed', { message })
    return {
      score: null,
      classification: null,
      scanned: false,
      skippedReason: message.slice(0, 160),
    }
  }
}

/** 0.9+ on any label is auto-reject; 0.5-0.9 stays pending but flagged. */
export const NSFW_AUTO_REJECT_THRESHOLD = 0.9
export const NSFW_REVIEW_FLAG_THRESHOLD = 0.5

export function nsfwDecision(
  score: number | null,
): 'auto-reject' | 'flag' | 'clear' | 'unscanned' {
  if (score === null) return 'unscanned'
  if (score >= NSFW_AUTO_REJECT_THRESHOLD) return 'auto-reject'
  if (score >= NSFW_REVIEW_FLAG_THRESHOLD) return 'flag'
  return 'clear'
}
