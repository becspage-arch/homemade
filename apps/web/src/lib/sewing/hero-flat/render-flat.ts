// SPDX-License-Identifier: MIT
// Hero-flat renderer entry point. The batch script + tests go through
// this one function. Adding a new archetype: add the renderer to the
// right archetypes-*.ts file, plus a case in renderArchetype below.

import { createHash } from 'node:crypto'

import {
  renderBikiniTop, renderBodiceFitted, renderCoat, renderCorset,
  renderHoodie, renderJumpsuit, renderKidsTshirt, renderShirtButtonDown,
  renderTank, renderTopSetInSleeve,
} from './archetypes-garments'
import {
  renderSkirtFlared, renderSkirtPencil, renderTrousers, renderTrousersWrap,
} from './archetypes-bottoms'
import {
  renderBagBackpack, renderBagBucket, renderBagDrawstring, renderBagPouchZip,
  renderBagSling, renderBagTote,
} from './archetypes-bags'
import {
  renderApron, renderBabyBlanket, renderCurtainEyelet, renderCurtainRodPocket,
  renderCushion, renderLampshadeDrum, renderPillowcase, renderPotHolderSet,
  renderTableRunner, renderTeaTowel, renderThrowBlanket,
} from './archetypes-home'
import {
  renderBabyBib, renderBelt, renderBowTie, renderHeadband, renderScarfInfinity,
  renderScrunchie, renderSnood, renderSunHat, renderTie,
} from './archetypes-accessories'
import { twoViewSvg } from './geometry'
import { resolveArchetype } from './pattern-archetype-map'
import type { ArchetypeId, RenderedFlat, RenderInput, RenderResult } from './types'

/** Pinned renderer version. Bump to invalidate every cached hero flat.
 *  The batch script compares this against SewingPattern.heroRendererVersion
 *  and re-renders any row that lags behind. */
export const RENDERER_VERSION = 1

export function renderArchetype(input: RenderInput): RenderResult {
  switch (input.archetype) {
    // Garments.
    case 'bodice-fitted': return renderBodiceFitted()
    case 'top-set-in-sleeve': return renderTopSetInSleeve()
    case 'shirt-button-down': return renderShirtButtonDown()
    case 'hoodie': return renderHoodie()
    case 'tank': return renderTank()
    case 'bikini-top': return renderBikiniTop()
    case 'coat': return renderCoat({ variant: 'womens' })
    case 'corset': return renderCorset()
    case 'jumpsuit': return renderJumpsuit()
    case 'kids-tshirt': return renderKidsTshirt()
    // Bottoms.
    case 'skirt-pencil': return renderSkirtPencil()
    case 'skirt-flared': return renderSkirtFlared()
    case 'trousers': return renderTrousers()
    case 'trousers-wrap': return renderTrousersWrap()
    // Bags.
    case 'bag-tote': return renderBagTote()
    case 'bag-drawstring': return renderBagDrawstring()
    case 'bag-pouch-zip': return renderBagPouchZip()
    case 'bag-backpack': return renderBagBackpack()
    case 'bag-bucket': return renderBagBucket()
    case 'bag-sling': return renderBagSling()
    // Home.
    case 'pillowcase': return renderPillowcase()
    case 'cushion': return renderCushion()
    case 'tea-towel': return renderTeaTowel()
    case 'table-runner': return renderTableRunner()
    case 'throw-blanket': return renderThrowBlanket()
    case 'baby-blanket': return renderBabyBlanket()
    case 'curtain-rod-pocket': return renderCurtainRodPocket()
    case 'curtain-eyelet': return renderCurtainEyelet()
    case 'apron': return renderApron()
    case 'pot-holder-set': return renderPotHolderSet()
    case 'lampshade-drum': return renderLampshadeDrum()
    // Accessories.
    case 'headband': return renderHeadband()
    case 'scrunchie': return renderScrunchie()
    case 'belt': return renderBelt()
    case 'tie': return renderTie()
    case 'bow-tie': return renderBowTie()
    case 'scarf-infinity': return renderScarfInfinity()
    case 'snood': return renderSnood()
    case 'sun-hat': return renderSunHat()
    case 'baby-bib': return renderBabyBib()
    default: {
      const _exhaustive: never = input.archetype
      throw new Error(`Unknown archetype: ${String(_exhaustive)}`)
    }
  }
}

/** Render a SewingPattern slug to a standalone SVG, or return null if the
 *  slug is not mapped to an archetype (caller sets heroNeedsFlatHand). */
export function renderFlatForSlug(slug: string, customisation?: Record<string, unknown>): RenderedFlat | null {
  const archetype = resolveArchetype(slug)
  if (!archetype) return null
  const inner = renderArchetype({ archetype })
  const svg = twoViewSvg(inner.front, inner.back, inner.viewHeightPx)
  const cacheKey = computeCacheKey(archetype, customisation)
  return { svg, cacheKey, rendererVersion: RENDERER_VERSION }
}

export function computeCacheKey(
  archetype: ArchetypeId,
  customisation?: Record<string, unknown>,
): string {
  const sortedKeys = customisation ? Object.keys(customisation).sort() : []
  const sorted: Record<string, unknown> = {}
  for (const k of sortedKeys) sorted[k] = customisation![k]
  const canonical = JSON.stringify({ a: archetype, c: sorted, v: RENDERER_VERSION })
  return createHash('sha256').update(canonical).digest('hex')
}
