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
    description:
      'A fitted bodice block for women, drafted to your bust, waist, and hip with optional high-bust adjustment. Use it as the base for your own designs or as a fit check before you cut a new pattern.',
    freesewingPackage: '@freesewing/bella',
    importer: () => import('@freesewing/bella'),
    designExportName: 'Bella',
    genderFamily: 'WOMENS',
    skillLevel: 'IMPROVER',
    requiredMeasurements: BELLA_REQUIRED,
    optionalMeasurements: [],
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'How much room sits between the bodice and your chest.',
        default: 4,
        min: -4,
        max: 20,
        step: 0.5,
      },
      waistEase: {
        type: 'pct',
        label: 'Waist ease',
        description: 'Ease at the waist. Negative values draw the bodice in.',
        default: 3,
        min: -4,
        max: 20,
        step: 0.5,
      },
      hipsEase: {
        type: 'pct',
        label: 'Hip ease',
        description: 'How much room sits between the bodice and your hips.',
        default: 4,
        min: -4,
        max: 20,
        step: 0.5,
      },
      draftForHighBust: {
        type: 'bool',
        label: 'Adjust for high bust',
        description:
          'On if your full-bust measurement is much larger than your high-bust. Drafts to high-bust then grades the bust dart.',
        default: false,
      },
    },
  },
  brian: {
    slug: 'brian',
    name: 'Brian body block',
    description:
      'A men’s body block for a fitted woven top. Use it as a starting point for shirts, tunics, and outerwear or as a fit check before cutting your own design.',
    freesewingPackage: '@freesewing/brian',
    importer: () => import('@freesewing/brian'),
    designExportName: 'Brian',
    genderFamily: 'MENS',
    skillLevel: 'IMPROVER',
    requiredMeasurements: BRIAN_REQUIRED,
    optionalMeasurements: BRIAN_OPTIONAL,
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'Room between the bodice and your chest.',
        default: 8,
        min: -4,
        max: 25,
        step: 0.5,
      },
      bicepsEase: {
        type: 'pct',
        label: 'Biceps ease',
        description: 'Room around the upper arm.',
        default: 15,
        min: 0,
        max: 30,
        step: 0.5,
      },
      shoulderEase: {
        type: 'pct',
        label: 'Shoulder ease',
        description: 'Width added to the shoulder line.',
        default: 0,
        min: -2,
        max: 10,
        step: 0.5,
      },
      collarEase: {
        type: 'pct',
        label: 'Collar ease',
        description: 'Room around the neck.',
        default: 5,
        min: 0,
        max: 15,
        step: 0.5,
      },
      lengthBonus: {
        type: 'pct',
        label: 'Length bonus',
        description: 'Body length added below the waist.',
        default: 0,
        min: -10,
        max: 25,
        step: 0.5,
      },
      sleeveLengthBonus: {
        type: 'pct',
        label: 'Sleeve length bonus',
        description: 'Sleeve length added past the wrist.',
        default: 0,
        min: -20,
        max: 50,
        step: 0.5,
      },
    },
  },
  aaron: {
    slug: 'aaron',
    name: 'Aaron knit A-shirt',
    description:
      'A simple knit A-shirt with shoulder straps and a scooped neckline. Beginner-friendly, works in light jersey or stretch fabrics.',
    freesewingPackage: '@freesewing/aaron',
    importer: () => import('@freesewing/aaron'),
    designExportName: 'Aaron',
    genderFamily: 'UNISEX',
    skillLevel: 'BEGINNER',
    requiredMeasurements: AARON_REQUIRED,
    optionalMeasurements: BRIAN_OPTIONAL,
    verifyTolerance: 0.05,
    options: {
      chestEase: {
        type: 'pct',
        label: 'Chest ease',
        description: 'Knit fabrics often want negative ease for a fitted look.',
        default: -4,
        min: -10,
        max: 10,
        step: 0.5,
      },
      lengthBonus: {
        type: 'pct',
        label: 'Length bonus',
        description: 'Body length added below the waist.',
        default: 4,
        min: -10,
        max: 25,
        step: 0.5,
      },
      armholeDrop: {
        type: 'pct',
        label: 'Armhole drop',
        description: 'How deep the armhole sits below the shoulder line.',
        default: 4,
        min: 0,
        max: 15,
        step: 0.5,
      },
      shoulderStrapWidth: {
        type: 'pct',
        label: 'Shoulder strap width',
        description: 'Width of the strap across the shoulder.',
        default: 15,
        min: 5,
        max: 30,
        step: 0.5,
      },
      shoulderStrapPlacement: {
        type: 'pct',
        label: 'Shoulder strap placement',
        description: 'How far in from the shoulder edge the strap sits.',
        default: 40,
        min: 20,
        max: 80,
        step: 1,
      },
      backlineBend: {
        type: 'pct',
        label: 'Back neckline curve',
        description: 'How deeply the back neckline curves down.',
        default: 10,
        min: 0,
        max: 40,
        step: 1,
      },
      necklineDrop: {
        type: 'pct',
        label: 'Front neckline drop',
        description: 'How low the front neckline sits.',
        default: 20,
        min: 0,
        max: 50,
        step: 1,
      },
    },
  },
}

export type RegisteredDesignSlug = keyof typeof SEWING_DESIGN_REGISTRY

export function getDesignConfig(slug: string): SewingDesignConfig | null {
  return SEWING_DESIGN_REGISTRY[slug] ?? null
}

/**
 * Snapshot of every registered design. The personalisation Studio's
 * picker page reads this; the registry is the single source of truth so
 * adding a design = adding a registry entry, no other change required.
 */
export function listDesigns(): SewingDesignConfig[] {
  return Object.values(SEWING_DESIGN_REGISTRY)
}

/**
 * Resolve the per-option default value for a design. Returns an object
 * keyed by option name with the option's documented default. The Studio
 * pre-fills its option panel with this, and the wrapper falls back to it
 * when an option is missing from the request.
 */
export function getDesignDefaults(
  slug: string,
): Record<string, number | string | boolean> {
  const cfg = getDesignConfig(slug)
  if (!cfg || !cfg.options) return {}
  const out: Record<string, number | string | boolean> = {}
  for (const [name, meta] of Object.entries(cfg.options)) {
    if (meta.type === 'pct') {
      // Freesewing accepts percentages as fractions (4% -> 0.04).
      out[name] = Number((meta.default / 100).toFixed(4))
    } else if (meta.type === 'mm') {
      out[name] = meta.default
    } else if (meta.type === 'bool') {
      out[name] = meta.default
    } else {
      out[name] = meta.default
    }
  }
  return out
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
