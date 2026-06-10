// SPDX-License-Identifier: MIT
// Attribution + licence helpers for the freesewing wrapper. The footer
// credit is the only place freesewing is named on rendered output.
// Voice-checked: plain English, no em dashes, no marketing language.
//
// Hidden on PROJECTOR mode per the locked sewing decisions — projector
// output stays clean so the grid lays flat on a fabric.

import type { CalibrationMode } from './types'

const FOOTER_CREDIT =
  'This pattern was drafted using freesewing. The freesewing project is MIT-licensed open-source software created by Joost De Cock. https://freesewing.org'

/**
 * MIT licence header for inclusion at the top of every wrapper file.
 * Each wrapper file uses an SPDX-License-Identifier shortform; this
 * helper exists so scripts (seed scripts, future generators) can emit
 * the full block when they need to.
 */
export function getMITHeader(filename: string): string {
  return [
    `// ${filename}`,
    '// SPDX-License-Identifier: MIT',
    '// Part of homemade.education. The freesewing engine called from this',
    '// file is the work of Joost De Cock and the freesewing community,',
    '// licensed under the MIT licence. See THIRD_PARTY_LICENSES.md at the',
    '// repo root for the full notice.',
  ].join('\n')
}

/**
 * Voice-checked footer credit. Rendered on PRINT and BROWSE output;
 * returns an empty string on PROJECTOR per the locked rule.
 *
 * The designSlug parameter exists so future per-design credit overrides
 * (independent designer rows, ported community designs) can branch on
 * slug without changing the caller; today it is unused.
 */
export function getDrafterFooterCredit(
  _designSlug: string,
  calibrationMode: CalibrationMode,
): string {
  if (calibrationMode === 'PROJECTOR') return ''
  return FOOTER_CREDIT
}

/** Constant export for tests + UI inspection. */
export const FOOTER_CREDIT_TEXT = FOOTER_CREDIT
