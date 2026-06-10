// SPDX-License-Identifier: MIT
// Design registry. The single place where freesewing designs are
// catalogued. Adding a new design = adding an entry here; no change to
// grader.ts is needed.
//
// The importer is lazy so production bundles don't pay the cost for
// designs nobody is drafting in this process.

import type { SewingDesignConfig } from './types'

// Bella body block — measurements required by `bella.back.measurements`
// in @freesewing/bella@4.9.0. Verified at install time from the package
// source.
const BELLA_REQUIRED = [
  'highBust',
  'chest',
  'underbust',
  'waist',
  'waistBack',
  'bustSpan',
  'neck',
  'hpsToBust',
  'hpsToWaistFront',
  'hpsToWaistBack',
  'shoulderToShoulder',
  'shoulderSlope',
]

// Brian body block — measurements per `brian.base.measurements` in
// @freesewing/brian@4.9.0. highBust is an optional measurement that
// enables the draftForHighBust option.
const BRIAN_REQUIRED = [
  'biceps',
  'chest',
  'hpsToBust',
  'hpsToWaistBack',
  'neck',
  'shoulderToShoulder',
  'shoulderSlope',
  'waistToArmpit',
  'waistToHips',
]
const BRIAN_OPTIONAL = ['highBust']

// Aaron knit T-shirt — inherits brian.front + brian.back via design
// composition. front.measurements adds 'hips'.
const AARON_REQUIRED = [...BRIAN_REQUIRED, 'hips']

export const SEWING_DESIGN_REGISTRY: Record<string, SewingDesignConfig> = {
  bella: {
    slug: 'bella',
    name: 'Bella body block',
    freesewingPackage: '@freesewing/bella',
    importer: () => import('@freesewing/bella'),
    designExportName: 'Bella',
    genderFamily: 'WOMENS',
    skillLevel: 'IMPROVER',
    requiredMeasurements: BELLA_REQUIRED,
    optionalMeasurements: [],
    verifyTolerance: 0.05,
  },
  brian: {
    slug: 'brian',
    name: 'Brian body block',
    freesewingPackage: '@freesewing/brian',
    importer: () => import('@freesewing/brian'),
    designExportName: 'Brian',
    genderFamily: 'MENS',
    skillLevel: 'IMPROVER',
    requiredMeasurements: BRIAN_REQUIRED,
    optionalMeasurements: BRIAN_OPTIONAL,
    verifyTolerance: 0.05,
  },
  aaron: {
    slug: 'aaron',
    name: 'Aaron knit T-shirt',
    freesewingPackage: '@freesewing/aaron',
    importer: () => import('@freesewing/aaron'),
    designExportName: 'Aaron',
    genderFamily: 'UNISEX',
    skillLevel: 'BEGINNER',
    requiredMeasurements: AARON_REQUIRED,
    optionalMeasurements: BRIAN_OPTIONAL,
    verifyTolerance: 0.05,
  },
}

export type RegisteredDesignSlug = keyof typeof SEWING_DESIGN_REGISTRY

export function getDesignConfig(slug: string): SewingDesignConfig | null {
  return SEWING_DESIGN_REGISTRY[slug] ?? null
}

/**
 * Lazily load a design's freesewing constructor. Throws if the slug is
 * unknown so callers see a clean error rather than an opaque undefined
 * later in `new Design(...)`.
 */
export async function loadDesignConstructor(slug: string): Promise<unknown> {
  const cfg = getDesignConfig(slug)
  if (!cfg) throw new Error(`Unknown freesewing design slug: ${slug}`)
  const mod = await cfg.importer()
  const ctor = mod[cfg.designExportName]
  if (typeof ctor !== 'function') {
    throw new Error(
      `Design constructor ${cfg.designExportName} not found in ${cfg.freesewingPackage}`,
    )
  }
  return ctor
}
