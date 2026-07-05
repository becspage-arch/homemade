import 'server-only'

/**
 * Minimal Anthropic Messages client — build-time / server catalogue tooling ONLY.
 *
 * This is deliberately a thin `fetch` wrapper, NOT the `@anthropic-ai/sdk`
 * package. Homemade's rule is "no paid AI SDK in the repo" ([[feedback_no_api_spend]]);
 * the carve-out that permits this is narrow and explicit: the SERVER-SIDE bulk
 * catalogue routine (cross-stitch + needlework gem generation) runs a per-candidate
 * vision judge + a per-batch brief planner. Those are the ruthless keep-or-kill
 * gate and the batch composer that used to run inside a Claude Code session on
 * Rebecca's PC. They are pennies-per-batch, build-time, and never touch the
 * customer request path. Nothing here runs for a normal page/API request.
 *
 * Degrades cleanly: if ANTHROPIC_API_KEY is unset the client is "not configured"
 * and every caller treats that as "the gate can't run, so publish nothing" — the
 * bulk job no-ops rather than shipping un-judged patterns.
 */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

/**
 * Model for the per-candidate vision gate. Sonnet 5 by default: in testing Haiku
 * 4.5 let off-brief / malformed candidates through, and the whole point of the
 * gate is a world-class bar, so the extra fraction-of-a-penny per image is worth
 * it. Override with BULK_GATE_MODEL (e.g. the Haiku id) to trade strictness for cost.
 */
export const GATE_MODEL = process.env.BULK_GATE_MODEL ?? 'claude-sonnet-5'
/** Slightly stronger tier for the per-batch brief planner (runs once per batch). */
export const PLANNER_MODEL = process.env.BULK_PLANNER_MODEL ?? 'claude-sonnet-5'

export function anthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export interface AnthropicImage {
  /** Raw image bytes; encoded to base64 for the request. */
  buffer: Buffer
  mediaType?: 'image/png' | 'image/jpeg' | 'image/webp'
}

export interface AnthropicMessageOptions {
  model: string
  /** System prompt (instructions / rubric). */
  system?: string
  /** The user text prompt. */
  prompt: string
  /** Optional images shown alongside the prompt (vision). */
  images?: AnthropicImage[]
  maxTokens?: number
  /** How many times to retry a transient (5xx / 429 / network) failure. */
  retries?: number
}

interface AnthropicContentBlock {
  type: string
  text?: string
}
interface AnthropicResponse {
  content?: AnthropicContentBlock[]
  error?: { message?: string }
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/**
 * One Anthropic Messages call. Returns the concatenated text of the response.
 * Throws if the key is missing (callers should check `anthropicConfigured`
 * first) or if the request fails after its retries.
 */
export async function anthropicMessage(opts: AnthropicMessageOptions): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('anthropicMessage: ANTHROPIC_API_KEY not set')

  const content: Array<Record<string, unknown>> = []
  for (const img of opts.images ?? []) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: img.mediaType ?? 'image/png',
        data: img.buffer.toString('base64'),
      },
    })
  }
  content.push({ type: 'text', text: opts.prompt })

  // NOTE: `temperature` is intentionally NOT sent — the current models (Sonnet 5
  // etc.) reject it ("temperature is deprecated for this model"). The API default
  // is fine for both the gate and the planner.
  const body = {
    model: opts.model,
    max_tokens: opts.maxTokens ?? 1024,
    ...(opts.system ? { system: opts.system } : {}),
    messages: [{ role: 'user', content }],
  }

  const retries = opts.retries ?? 3
  let lastErr: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': ANTHROPIC_VERSION,
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`anthropic ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`)
        await sleep(1500 * (attempt + 1))
        continue
      }
      if (!res.ok) {
        throw new Error(`anthropic ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`)
      }
      const json = (await res.json()) as AnthropicResponse
      const text = (json.content ?? [])
        .filter((b) => b.type === 'text' && typeof b.text === 'string')
        .map((b) => b.text as string)
        .join('')
        .trim()
      if (!text) throw new Error('anthropic: empty response')
      return text
    } catch (err) {
      lastErr = err
      if (attempt < retries) await sleep(1500 * (attempt + 1))
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('anthropicMessage: failed')
}

/**
 * Call the model and parse a single JSON value from its reply. Tolerates the
 * model wrapping the JSON in prose or a ```json fence. Throws if no JSON parses.
 */
export async function anthropicJson<T>(opts: AnthropicMessageOptions): Promise<T> {
  const text = await anthropicMessage(opts)
  return extractJson<T>(text)
}

export function extractJson<T>(text: string): T {
  // Prefer a fenced block, else the first {...} or [...] span.
  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(text)
  const candidate = fence?.[1]?.trim() ?? sliceJson(text)
  if (!candidate) throw new Error(`anthropicJson: no JSON found in reply: ${text.slice(0, 160)}`)
  return JSON.parse(candidate) as T
}

function sliceJson(text: string): string | null {
  const firstObj = text.indexOf('{')
  const firstArr = text.indexOf('[')
  const start =
    firstArr === -1 ? firstObj : firstObj === -1 ? firstArr : Math.min(firstObj, firstArr)
  if (start === -1) return null
  const open = text[start]
  const close = open === '{' ? '}' : ']'
  const end = text.lastIndexOf(close)
  if (end <= start) return null
  return text.slice(start, end + 1)
}
