// SPDX-License-Identifier: MIT
// Slug -> archetype map for all 48 production sewing patterns. New
// patterns add an entry here; the renderer skips any slug not listed
// (heroNeedsFlatHand = true on the SewingPattern row).

import type { ArchetypeId } from './types'

export const PATTERN_ARCHETYPE_MAP: Record<string, ArchetypeId> = {
  // Freesewing showcase (18 patterns).
  'freesewing-bella-body-block': 'bodice-fitted',
  'freesewing-noble-bodice': 'bodice-fitted',
  'freesewing-brian-body-block': 'top-set-in-sleeve',
  'freesewing-bent-body-block': 'top-set-in-sleeve',
  'freesewing-diana-draped-top': 'top-set-in-sleeve',
  'freesewing-simon-button-down-shirt': 'shirt-button-down',
  'freesewing-huey-hoodie': 'hoodie',
  'freesewing-aaron-knit-a-shirt': 'tank',
  'freesewing-bee-bikini-top': 'bikini-top',
  'freesewing-carlita-coat': 'coat',
  'freesewing-carlton-coat': 'coat',
  'freesewing-cathrin-corset': 'corset',
  'freesewing-charlie-chinos': 'trousers',
  'freesewing-titan-trouser-block': 'trousers',
  'freesewing-waralee-wrap-pants': 'trousers-wrap',
  'freesewing-onyx-one-piece': 'jumpsuit',
  'freesewing-penelope-pencil-skirt': 'skirt-pencil',
  'freesewing-sandy-circle-skirt': 'skirt-flared',

  // Bags (8 patterns).
  'sewing-tote-bag-interfaced-handles': 'bag-tote',
  'sewing-drawstring-storage-bag': 'bag-drawstring',
  'sewing-project-bag-drawstring-handle': 'bag-drawstring',
  'sewing-simple-backpack-drawstring': 'bag-backpack',
  'sewing-pencil-case-zip': 'bag-pouch-zip',
  'sewing-makeup-pouch-boxed-corners': 'bag-pouch-zip',
  'sewing-bucket-bag-magnetic-closure': 'bag-bucket',
  'sewing-sling-bag-adjustable-strap': 'bag-sling',

  // Home (10 patterns).
  'sewing-pillowcase-housewife-french-seam': 'pillowcase',
  'sewing-cushion-cover-envelope-back': 'cushion',
  'sewing-tea-towel-mitred-corners': 'tea-towel',
  'sewing-kitchen-apron-cross-back': 'apron',
  'sewing-pot-holder-oven-mitt-set': 'pot-holder-set',
  'sewing-table-runner-mitred-border': 'table-runner',
  'sewing-rod-pocket-curtain-panel': 'curtain-rod-pocket',
  'sewing-eyelet-curtain-heading': 'curtain-eyelet',
  'sewing-throw-blanket-binding': 'throw-blanket',
  'sewing-drum-lampshade-cover': 'lampshade-drum',

  // Accessories + babies (12 patterns).
  'sewing-knit-headband-twist-front': 'headband',
  'sewing-hair-scrunchie': 'scrunchie',
  'sewing-belt-d-ring-closure': 'belt',
  'sewing-mens-tie-standard': 'tie',
  'sewing-bow-tie-self-tie': 'bow-tie',
  'sewing-knit-infinity-scarf': 'scarf-infinity',
  'sewing-snood-ribbed-cuffs': 'snood',
  'sewing-sun-hat-wide-brim': 'sun-hat',
  'sewing-baby-bib-snap-closure': 'baby-bib',
  'sewing-baby-blanket-mitred-binding': 'baby-blanket',
  'sewing-kids-apron-one-size': 'apron',
  'sewing-kids-tshirt-nested-sizes': 'kids-tshirt',
}

export function resolveArchetype(slug: string): ArchetypeId | null {
  return PATTERN_ARCHETYPE_MAP[slug] ?? null
}
