import { craftRule, type CategoryRule } from './shared.js'

/** Fibre-arts (spinning, felting, weaving, dyeing): PATTERN + TECHNIQUE rows
 *  must carry steps. Reference / guide prose leans on the generic checks. */
export const rule: CategoryRule = {
  slug: 'fibre-arts',
  check: craftRule(),
}
