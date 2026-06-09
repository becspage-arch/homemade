// Central shape-math router.
//
// Author prompts compose multi-piece patterns by calling specific
// shape primitives directly. This helper exposes a single entry point
// for tooling that wants to switch shape dynamically.

import type { AmigurumiGauge, AmigurumiPiece, AmigurumiShape } from './types'
import { sphere } from './shapes/sphere'
import { cylinder } from './shapes/cylinder'
import { cone } from './shapes/cone'
import { capsule } from './shapes/capsule'
import { oval } from './shapes/oval'
import { pear } from './shapes/pear'

export type ShapeParams =
  | { shape: 'SPHERE'; diameterCm: number; gauge: AmigurumiGauge; label?: string }
  | { shape: 'CYLINDER'; diameterCm: number; heightCm: number; gauge: AmigurumiGauge; closeBothEnds?: boolean; label?: string }
  | { shape: 'CONE'; baseDiameterCm: number; heightCm: number; gauge: AmigurumiGauge; label?: string }
  | { shape: 'CAPSULE'; diameterCm: number; lengthCm: number; gauge: AmigurumiGauge; label?: string }
  | { shape: 'OVAL'; longAxisCm: number; shortAxisCm: number; gauge: AmigurumiGauge; label?: string }
  | { shape: 'PEAR'; maxDiameterCm: number; topDiameterCm: number; heightCm: number; gauge: AmigurumiGauge; label?: string }

export function buildShape(params: ShapeParams): AmigurumiPiece {
  switch (params.shape) {
    case 'SPHERE': return sphere(params)
    case 'CYLINDER': return cylinder(params)
    case 'CONE': return cone(params)
    case 'CAPSULE': return capsule(params)
    case 'OVAL': return oval(params)
    case 'PEAR': return pear(params)
  }
}

export type { AmigurumiPiece, AmigurumiGauge, AmigurumiShape } from './types'
export { sphere, cylinder, cone, capsule, oval, pear }
