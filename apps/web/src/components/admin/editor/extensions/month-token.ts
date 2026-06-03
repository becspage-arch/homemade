/**
 * monthToken mark — wraps a span of month text with both hemispheres'
 * values baked in. The public renderer reads the user's hemisphere and
 * picks the right one server-side.
 *
 * Phase location_climate_paper_001 — body-prose silent month rewrite.
 *
 * Authors set both `monthsN` and `monthsS` at write time. The mark
 * renders as `<span data-month-token="..." data-months-n="..." data-months-s="...">`
 * in the editor HTML so paste round-trips preserve the values. Inside
 * the editor it's invisible (no styling) — it's a data carrier.
 *
 * Example use, hand-edited TipTap JSON:
 *
 *   {
 *     "type": "text",
 *     "text": "Sow indoors Feb-Mar",
 *     "marks": [
 *       { "type": "monthToken", "attrs": { "monthsN": "Feb-Mar", "monthsS": "Aug-Sep" } }
 *     ]
 *   }
 *
 * A reader in the southern hemisphere sees "Sow indoors Aug-Sep".
 *
 * Authoring UI (toolbar button + dialog) is a follow-up; for now the
 * extension exists so the public renderer can act on tutorials that
 * have been hand-marked or batch-rewritten by a script.
 */

import { Mark, mergeAttributes } from '@tiptap/core'

export interface MonthTokenAttrs {
  monthsN: string
  monthsS: string
}

export const MonthToken = Mark.create({
  name: 'monthToken',
  inclusive: false,

  addAttributes() {
    return {
      monthsN: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-months-n') ?? '',
        renderHTML: (attrs) => ({ 'data-months-n': (attrs as MonthTokenAttrs).monthsN ?? '' }),
      },
      monthsS: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-months-s') ?? '',
        renderHTML: (attrs) => ({ 'data-months-s': (attrs as MonthTokenAttrs).monthsS ?? '' }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-month-token]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-month-token': 'true' }), 0]
  },
})
