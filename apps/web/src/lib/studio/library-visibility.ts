import { Visibility } from '@homemade/db'

/**
 * IS THIS A LIBRARY PATTERN — one the house publishes, that anyone may open?
 *
 * The rule used to be "house-owned and not PRIVATE", which quietly included
 * UNLISTED. That was harmless while UNLISTED meant "in the admin review queue",
 * and stopped being harmless the moment the autopilot started PARKING UNLISTED
 * candidates by the dozen: every one of them would have been openable in the
 * Studio, downloadable as a PDF and readable as a floss list by anyone who knew
 * its id, hours before a single person had looked at it.
 *
 * So the rule is PUBLIC, and only PUBLIC. An un-judged candidate is not a
 * library pattern in any sense a customer would recognise, and the surfaces that
 * hand out chart data are exactly the ones that must agree with the surfaces
 * that list it.
 *
 * An owner reaching their OWN pattern is a separate check, unchanged: this
 * function is only about the house catalogue.
 */
export function isLibraryPattern(row: { ownerUserId: string | null; visibility: Visibility }): boolean {
  return row.ownerUserId === null && row.visibility === Visibility.PUBLIC
}
