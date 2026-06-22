/**
 * Materials-provider registry. The planner core looks a provider up by craft;
 * adding a craft is registering one adapter here, nothing else.
 */

import type { PlannerCraft } from '@homemade/db'
import type { MaterialsProvider } from './types'
import { crossStitchProvider } from './providers/cross-stitch'

const PROVIDERS: Partial<Record<PlannerCraft, MaterialsProvider>> = {
  CROSS_STITCH: crossStitchProvider,
  // CROCHET / KNITTING / NEEDLEWORK / SEWING adapters land with their own
  // category sign-offs — each is one entry here plus a providers/ file.
}

export function getMaterialsProvider(craft: PlannerCraft): MaterialsProvider | null {
  return PROVIDERS[craft] ?? null
}

/** Crafts with a working materials provider (queue + materials + stash). */
export function craftHasMaterials(craft: PlannerCraft): boolean {
  return getMaterialsProvider(craft) !== null
}
