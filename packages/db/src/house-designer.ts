/**
 * The single canonical Homemade house designer.
 *
 * Every publish path (cross-stitch, needlework, future crafts) attaches
 * house-original patterns to ONE designer row, keyed on this slug. Going
 * through `ensureHouseDesigner()` instead of a per-script hardcoded slug is
 * what stops duplicate "Homemade" rows (e.g. `homemade-cross-stitch`,
 * `homemade-needlework`) from drifting back into existence.
 *
 * House status (isHouseDesigner: true) is load-bearing: the premium gate keys
 * "independent designer ⇒ premium" off it, and the designer spotlight features
 * independent designers only — so the house row must never flip to false.
 */
import { prisma } from './index'

export const HOUSE_DESIGNER_SLUG = 'homemade'
const HOUSE_DESIGNER_DISPLAY_NAME = 'Homemade'
const HOUSE_DESIGNER_BIO = 'House-original patterns designed in the Homemade Studio.'

/** Upsert and return the one canonical Homemade house designer. Idempotent. */
export async function ensureHouseDesigner(): Promise<{ id: string; slug: string }> {
  return prisma.designer.upsert({
    where: { slug: HOUSE_DESIGNER_SLUG },
    // Never downgrade an existing row; only guarantee it's flagged as house.
    update: { isHouseDesigner: true },
    create: {
      slug: HOUSE_DESIGNER_SLUG,
      displayName: HOUSE_DESIGNER_DISPLAY_NAME,
      bio: HOUSE_DESIGNER_BIO,
      isHouseDesigner: true,
    },
    select: { id: true, slug: true },
  })
}
