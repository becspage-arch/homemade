import type { Message, MessageParam, TextBlockParam } from '@anthropic-ai/sdk/resources/messages'

import { getAnthropicClient } from './client.js'
import { VOICE_RULES_SYSTEM_PROMPT } from './prompts/voice-rules.js'

export interface BotEditChange {
  path: string
  note: string
}

export interface BotEditResult {
  /** The revised TipTap document. Same shape as the input. */
  revised: unknown
  /** Numbered change log. Empty array if nothing was rewritten. */
  changes: BotEditChange[]
  /** Token usage from the underlying Claude call — for logging / cost tracking. */
  usage: {
    inputTokens: number
    outputTokens: number
    cacheCreationInputTokens?: number
    cacheReadInputTokens?: number
  }
}

export interface BotEditInput {
  /** Tutorial slug — included in the user prompt for editor context. */
  slug: string
  /** Tutorial title. */
  title: string
  /** Optional subtitle — also gets edited. */
  subtitle?: string | null
  /** Optional excerpt — also gets edited. */
  excerpt?: string | null
  /** The TipTap body document. */
  body: unknown
}

const MODEL = 'claude-sonnet-4-5'
const MAX_TOKENS = 16_000

/**
 * Run the bot-as-editor second pass over a draft tutorial.
 *
 * Throws if `ANTHROPIC_API_KEY` is not set or if the model returns a payload
 * we can't parse.
 */
export async function botEdit(input: BotEditInput): Promise<BotEditResult> {
  const client = getAnthropicClient()
  if (!client) {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Add it to .env.credentials before running bot-edit.',
    )
  }

  const userPrompt = buildUserPrompt(input)

  // Wrap the system prompt in a cache_control block so repeated runs (50+
  // recipes in a batch) reuse the cached tokens instead of paying for the
  // long rules block every time.
  const systemBlocks: TextBlockParam[] = [
    {
      type: 'text',
      text: VOICE_RULES_SYSTEM_PROMPT,
      cache_control: { type: 'ephemeral' },
    },
  ]

  const messages: MessageParam[] = [
    {
      role: 'user',
      content: [{ type: 'text', text: userPrompt }],
    },
  ]

  const response: Message = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemBlocks,
    messages,
  })

  const textBlocks = response.content.filter(
    (block): block is Extract<typeof block, { type: 'text' }> => block.type === 'text',
  )
  if (textBlocks.length === 0) {
    throw new Error('bot-edit: model returned no text blocks.')
  }
  const rawText = textBlocks.map((b) => b.text).join('')

  const parsed = parseJsonReply(rawText)

  return {
    revised: parsed.revised,
    changes: parsed.changes,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheCreationInputTokens:
        (response.usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens,
      cacheReadInputTokens:
        (response.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens,
    },
  }
}

function buildUserPrompt(input: BotEditInput): string {
  const lines: string[] = []
  lines.push(`Tutorial slug: ${input.slug}`)
  lines.push(`Title: ${input.title}`)
  if (input.subtitle) lines.push(`Subtitle: ${input.subtitle}`)
  if (input.excerpt) lines.push(`Excerpt: ${input.excerpt}`)
  lines.push('')
  lines.push('Body (TipTap JSON):')
  lines.push('')
  lines.push(JSON.stringify(input.body, null, 2))
  lines.push('')
  lines.push(
    'Rewrite prose where it violates the rules in your instructions. Preserve ingredient amounts, units, timings, temperatures and all numerical values. Return one JSON object with keys "revised" and "changes" — no prose outside the JSON, no code fences.',
  )
  return lines.join('\n')
}

interface ParsedReply {
  revised: unknown
  changes: BotEditChange[]
}

function parseJsonReply(text: string): ParsedReply {
  let payload = text.trim()

  // Strip a stray code fence if the model added one despite instructions.
  const fence = '```'
  if (payload.startsWith(fence)) {
    const firstNewline = payload.indexOf('\n')
    if (firstNewline !== -1) {
      payload = payload.slice(firstNewline + 1)
    }
    if (payload.endsWith(fence)) {
      payload = payload.slice(0, -fence.length)
    }
    payload = payload.trim()
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(payload)
  } catch (err) {
    throw new Error(
      `bot-edit: model reply was not valid JSON: ${err instanceof Error ? err.message : err}`,
    )
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('bot-edit: model reply was not a JSON object.')
  }
  const obj = parsed as { revised?: unknown; changes?: unknown }
  if (obj.revised === undefined) {
    throw new Error('bot-edit: model reply missing "revised" field.')
  }
  const changes = normaliseChanges(obj.changes)
  return { revised: obj.revised, changes }
}

function normaliseChanges(raw: unknown): BotEditChange[] {
  if (!Array.isArray(raw)) return []
  const out: BotEditChange[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as { path?: unknown; note?: unknown }
    const path = typeof e.path === 'string' ? e.path : ''
    const note = typeof e.note === 'string' ? e.note : ''
    if (!note) continue
    out.push({ path: path || '(unspecified)', note })
  }
  return out
}
