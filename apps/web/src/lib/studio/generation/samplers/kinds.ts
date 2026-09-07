/**
 * THE FIVE THINGS PEOPLE STITCH A SAMPLER FOR.
 *
 * A birth, a wedding, a new house, a name with a date on it, and an
 * anniversary. Each kind knows the handful of things the maker has to type and
 * nothing else: a sampler is a short piece of writing on cloth, and every extra
 * field is another chance to get it wrong.
 *
 * Pure data and pure functions only — no fonts, no files, no Prisma. The form
 * in the browser and the chart builder on the server both read this module, so
 * the labels a maker fills in and the words that end up stitched can never
 * drift apart.
 */

export type SamplerKind = 'birth' | 'wedding' | 'new-home' | 'name-and-date' | 'anniversary'

export const SAMPLER_KIND_IDS: SamplerKind[] = [
  'birth',
  'wedding',
  'new-home',
  'name-and-date',
  'anniversary',
]

export function isSamplerKind(value: unknown): value is SamplerKind {
  return typeof value === 'string' && (SAMPLER_KIND_IDS as string[]).includes(value)
}

export interface SamplerField {
  key: string
  /** Short and ordinary. It sits above a text box, not in a brochure. */
  label: string
  /** What the field wants, when the label alone is not enough. */
  hint?: string
  type: 'text' | 'date'
  optional?: boolean
  maxLength: number
}

export interface SamplerKindSpec {
  label: string
  /** One line under the section heading. */
  blurb: string
  fields: SamplerField[]
  /** The values the catalogue pieces are charted with. */
  sample: Record<string, string>
}

export const SAMPLER_KINDS: Record<SamplerKind, SamplerKindSpec> = {
  birth: {
    label: 'Birth',
    blurb: 'A name and a date, with the weight and length if you want them.',
    fields: [
      { key: 'name', label: 'Their name', type: 'text', maxLength: 40 },
      { key: 'date', label: 'The date', type: 'date', maxLength: 10 },
      { key: 'weight', label: 'Weight', hint: 'Optional', type: 'text', optional: true, maxLength: 20 },
      { key: 'length', label: 'Length', hint: 'Optional', type: 'text', optional: true, maxLength: 20 },
    ],
    sample: { name: 'Amelia Rose', date: '2026-03-12', weight: '3.4 kg', length: '51 cm' },
  },
  wedding: {
    label: 'Wedding',
    blurb: 'Two names, the date, and the place if it belongs on there.',
    fields: [
      { key: 'nameOne', label: 'One name', type: 'text', maxLength: 30 },
      { key: 'nameTwo', label: 'The other name', type: 'text', maxLength: 30 },
      { key: 'date', label: 'The date', type: 'date', maxLength: 10 },
      { key: 'place', label: 'The place', hint: 'Optional', type: 'text', optional: true, maxLength: 34 },
    ],
    sample: { nameOne: 'Rosie', nameTwo: 'Tom', date: '2026-06-20', place: "St Mary's, Rye" },
  },
  'new-home': {
    label: 'New home',
    blurb: 'The house name or the address, and the date they got the keys.',
    fields: [
      { key: 'home', label: 'House name or address', type: 'text', maxLength: 36 },
      { key: 'date', label: 'The date', type: 'date', optional: true, maxLength: 10 },
      { key: 'names', label: 'Whose home', hint: 'Optional', type: 'text', optional: true, maxLength: 34 },
    ],
    sample: { home: '14 Rowan Lane', date: '2026-04-03', names: 'The Harpers' },
  },
  'name-and-date': {
    label: 'Name and date',
    blurb: 'One name, one date, and a short line underneath if you want one.',
    fields: [
      { key: 'name', label: 'The name', type: 'text', maxLength: 40 },
      { key: 'date', label: 'The date', type: 'date', maxLength: 10 },
      { key: 'line', label: 'A short line', hint: 'Optional', type: 'text', optional: true, maxLength: 40 },
    ],
    sample: { name: 'Amelia Rose', date: '2026-03-12', line: 'Stitched with love' },
  },
  anniversary: {
    label: 'Anniversary',
    blurb: 'Two names, the date they married, and the number of years.',
    fields: [
      { key: 'nameOne', label: 'One name', type: 'text', maxLength: 30 },
      { key: 'nameTwo', label: 'The other name', type: 'text', maxLength: 30 },
      { key: 'date', label: 'The date', type: 'date', maxLength: 10 },
      { key: 'years', label: 'Years', hint: 'Optional', type: 'text', optional: true, maxLength: 18 },
    ],
    sample: { nameOne: 'Margaret', nameTwo: 'John', date: '1986-09-06', years: 'Forty years' },
  },
}

// ───────────────────────────── dates ─────────────────────────────

/**
 * Countries whose written date puts the month first. Everywhere else the site
 * reaches gets "12 March 2026", which is also what an unsigned-in visitor and
 * an account with no country on it get.
 */
const MONTH_FIRST_COUNTRIES = new Set(['US', 'PH', 'FM', 'MH', 'PW'])

export function dateLocaleForCountry(countryCode: string | null | undefined): string {
  const cc = (countryCode ?? '').toUpperCase()
  return MONTH_FIRST_COUNTRIES.has(cc) ? 'en-US' : 'en-GB'
}

/**
 * Render a stored date for stitching. Values are held as `YYYY-MM-DD` so the
 * chart can be re-set in another format later without asking the maker again.
 *
 * Anything that is not a plain ISO date is passed through untouched: makers
 * type "Spring 2026" and "Midsummer" into date boxes, and a sampler should
 * stitch what they meant rather than refusing them.
 */
export function formatSamplerDate(value: string, locale = 'en-GB'): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!m) return value.trim()
  const [, y, mo, d] = m
  const date = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))
  if (Number.isNaN(date.getTime())) return value.trim()
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

/** Just the year, for the pieces that set the year on its own line. */
export function samplerYear(value: string): string {
  const m = /^(\d{4})-\d{2}-\d{2}$/.exec(value.trim())
  return m?.[1] ?? value.trim()
}

// ───────────────────────────── templates ─────────────────────────────

/**
 * Fill a line's template from the maker's values.
 *
 * Two pieces of syntax, both there to handle the boxes people leave blank:
 *
 *   `{key}`   the value, or nothing.
 *   `[...]`   a group that disappears whole if any value inside it is empty.
 *
 * So `Born {date}[ at {place}]` sets "Born 12 March 2026" when the place box is
 * empty and "Born 12 March 2026 at St Mary's" when it is not, and a line whose
 * every value is empty comes back empty and is dropped from the design. That is
 * how a birth sampler loses its weight line rather than stitching the word
 * "Weighing" on its own.
 */
export function fillTemplate(template: string, values: Record<string, string>): string {
  const value = (k: string): string => (values[k] ?? '').trim()

  const resolved = template.replace(/\[([^\[\]]*)\]/g, (_, group: string) => {
    const keys = [...group.matchAll(/\{(\w+)\}/g)].map((m) => m[1] ?? '')
    if (keys.some((k) => !value(k))) return ''
    return group
  })

  const keys = [...resolved.matchAll(/\{(\w+)\}/g)].map((m) => m[1] ?? '')
  if (keys.length > 0 && keys.every((k) => !value(k))) return ''
  const filled = resolved.replace(/\{(\w+)\}/g, (_, k: string) => value(k))
  return filled.replace(/\s+/g, ' ').trim()
}

/**
 * Join a set of values with a separator, skipping the empty ones. For the
 * lines that run two optional facts together ("3.4 kg · 51 cm") and have to
 * read properly when only one of them was filled in.
 */
export function joinValues(
  keys: string[],
  separator: string,
  values: Record<string, string>,
): string {
  return keys
    .map((k) => (values[k] ?? '').trim())
    .filter(Boolean)
    .join(separator)
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Normalise and bound what a maker typed before any of it reaches a chart.
 * Control characters out, whitespace collapsed, length capped at the field's
 * own limit. Unknown keys are dropped: the chart only ever sets the fields its
 * kind declares.
 */
export function cleanSamplerValues(
  kind: SamplerKind,
  raw: Record<string, unknown>,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const field of SAMPLER_KINDS[kind].fields) {
    const value = raw[field.key]
    if (typeof value !== 'string') continue
    const cleaned = value
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, field.maxLength)
    if (cleaned) out[field.key] = cleaned
  }
  return out
}

/** Which required fields are still empty. Empty array means ready to stitch. */
export function missingRequired(kind: SamplerKind, values: Record<string, string>): string[] {
  return SAMPLER_KINDS[kind].fields
    .filter((f) => !f.optional && !(values[f.key] ?? '').trim())
    .map((f) => f.label)
}
