// Central sock grading entry point. Routes to the appropriate
// construction module and returns the structured SockGradedPattern.
//
// Author prompts and personalisation call `gradeSock()` for a single
// foot size + heel style; `gradeAllFootSizes()` loops across a list.
//
// Heel-style + construction compatibility:
//
//   construction | flap-and-gusset | short-row | afterthought
//   -------------|-----------------|-----------|--------------
//   CUFF_DOWN    | yes (canonical) | yes       | yes
//   TOE_UP       | yes (gussets    | yes       | yes
//                | before heel)    |           |
//
// All ten combinations are supported. The verifier flags mismatched
// pairings — e.g. if a pattern claims FLAP_AND_GUSSET but provides
// zero gusset rows.

import type {
  SockGradedPattern,
  SockGradeInput,
} from './types'
import type { FootSizeName } from './sock-sizes'
import { gradeCuffDownSock } from './construction/cuff-down'
import { gradeToeUpSock } from './construction/toe-up'

export function gradeSock(input: SockGradeInput): SockGradedPattern {
  switch (input.construction) {
    case 'CUFF_DOWN':
      return gradeCuffDownSock({
        size: input.size,
        gauge: input.gauge,
        heelStyle: input.heelStyle,
        options: input.options,
        footMeasurements: input.footMeasurements,
      })
    case 'TOE_UP':
      return gradeToeUpSock({
        size: input.size,
        gauge: input.gauge,
        heelStyle: input.heelStyle,
        options: input.options,
        footMeasurements: input.footMeasurements,
      })
  }
}

export function gradeAllFootSizes(
  sizes: (FootSizeName | string)[],
  base: Omit<SockGradeInput, 'size'>,
): SockGradedPattern[] {
  return sizes.map(size => gradeSock({ ...base, size }))
}

export type {
  SockGradedPattern,
  SockGradeInput,
  SockConstruction,
  SockHeelStyle,
  SockOptions,
} from './types'
export type { FootSizeName, FootMeasurements } from './sock-sizes'
export { getFootMeasurements, listAllFootSizes } from './sock-sizes'
