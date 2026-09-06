// The grader route's contract, kept out of the route file so it can be read
// and tested without pulling in Prisma, Clerk or Next's request plumbing.
//
// Two things live here: what a grade request is allowed to say, and who is
// allowed to have the custom-size half of the answer. The free/paid line is
// the whole point of the second one — every standard size is free on screen,
// regrading to the maker's own measurements and gauge is premium — so it is
// written once, here, rather than inline in a handler.

import { z } from 'zod'

import { hasPremium, type PremiumEntitlementFields } from '@/lib/entitlements'
import { getStudioGateCopy } from '@/lib/studio/premium-gates'
import type { ShapeOptions } from './types'
import type { SockOptions } from '../sock/types'

export const GaugeSchema = z.object({
  stitchesPer10cm: z.number().positive().max(120),
  rowsPer10cm: z.number().positive().max(200),
})

export const EasePresetSchema = z.enum([
  'NEGATIVE_4', 'NEGATIVE_2', 'ZERO', 'POSITIVE_2', 'POSITIVE_4',
  'POSITIVE_6', 'POSITIVE_8', 'GENEROUS_10', 'GENEROUS_15',
])

export const DominantFabricSchema = z.enum([
  'STOCKINETTE', 'GARTER', 'RIB_1X1', 'RIB_2X2', 'CABLE', 'LACE', 'BRIOCHE',
  'COLOURWORK_STRANDED',
])

export const ShapeOptionsSchema = z
  .object({
    backNeckWidth: z.number().min(0.05).max(0.45),
    raglanLineSlope: z.number().int().min(1).max(8),
    sleeveCuffRatio: z.number().min(0.2).max(1),
    yarnWeightCategory: z.number().int().min(1).max(7),
    hemAllowanceCm: z.number().min(-20).max(30),
    bodyLengthAdjustCm: z.number().min(-30).max(40),
    dominantFabric: DominantFabricSchema,
  })
  .partial()

export const SockOptionsSchema = z
  .object({
    legLengthCm: z.number().min(2).max(60),
    footEaseCm: z.number().min(-8).max(4),
    heelFlapRows: z.number().int().min(4).max(120),
    yarnWeightCategory: z.number().int().min(1).max(5),
  })
  .partial()

export const GarmentSpecSchema = z.object({
  kind: z.literal('GARMENT'),
  constructionShape: z.enum([
    'TOP_DOWN_RAGLAN', 'TOP_DOWN_YOKE', 'BOTTOM_UP_SET_IN', 'DROP_SHOULDER',
    'SIDE_TO_SIDE', 'CONTIGUOUS_SET_IN',
  ]),
  garmentType: z.enum(['PULLOVER', 'CARDIGAN', 'VEST', 'TANK', 'TUNIC', 'DRESS']),
  options: ShapeOptionsSchema.optional(),
})

export const SockSpecSchema = z.object({
  kind: z.literal('SOCK'),
  construction: z.enum(['CUFF_DOWN', 'TOE_UP']),
  heelStyle: z.enum([
    'FLAP_AND_GUSSET', 'SHORT_ROW_GERMAN', 'SHORT_ROW_JAPANESE',
    'SHORT_ROW_DUTCH', 'AFTERTHOUGHT',
  ]),
  options: SockOptionsSchema.optional(),
})

/** The maker's own body, in centimetres. Bounds are sanity bounds, wide
 *  enough for every real body and narrow enough to catch a millimetre or an
 *  inch typed into a centimetre box. */
export const BodyMeasurementsSchema = z.object({
  bust: z.number().min(30).max(250),
  waist: z.number().min(30).max(250),
  hip: z.number().min(30).max(250),
  backLengthToWaist: z.number().min(10).max(80),
  bodyLength: z.number().min(15).max(120),
  shoulderWidth: z.number().min(15).max(80),
  armLength: z.number().min(10).max(110),
  upperArm: z.number().min(10).max(80),
  neck: z.number().min(15).max(70),
  wrist: z.number().min(8).max(40),
  head: z.number().min(25).max(75).optional(),
})

export const FootMeasurementsSchema = z.object({
  footLengthCm: z.number().min(8).max(40),
  footCircumferenceCm: z.number().min(8).max(40),
  ankleCircumferenceCm: z.number().min(8).max(50),
  calfCircumferenceCm: z.number().min(10).max(70),
  label: z.string().max(80).optional(),
})

export const GradeRequestSchema = z
  .object({
    /** A published pattern to grade. The row supplies the construction,
     *  gauge, ease and size run unless the request overrides them. */
    slug: z.string().min(1).max(200).optional(),
    /** A bare construction + stitch-pattern spec, for grading with no stored
     *  pattern behind it. */
    spec: z.discriminatedUnion('kind', [GarmentSpecSchema, SockSpecSchema]).optional(),
    gauge: GaugeSchema.optional(),
    easePreset: EasePresetSchema.optional(),
    sizes: z.array(z.string().min(1).max(60)).min(1).max(24).optional(),
    /** The maker's own measurements. Present means "grade my size too", which
     *  is the premium half of this route. */
    customMeasurements: z.unknown().optional(),
  })
  .refine((v) => Boolean(v.slug) || Boolean(v.spec), {
    message: 'Give either a pattern slug or a construction spec.',
  })

export type GradeRequest = z.infer<typeof GradeRequestSchema>

// ── The free / paid line ────────────────────────────────────────────────────

export type CustomFitDecision =
  | { allowed: true }
  | {
      allowed: false
      status: 401 | 402
      error: string
      rationale?: string
      gate?: 'KNITTING_CUSTOM_FIT'
    }

/**
 * Who gets the custom-size worked pattern. Standard sizes never come through
 * here — they are free, signed in or not. This decides the one premium output.
 */
export function decideCustomFit(
  user: PremiumEntitlementFields | null | undefined,
): CustomFitDecision {
  if (!user) {
    return {
      allowed: false,
      status: 401,
      error: 'Sign in to fit a pattern to your own measurements.',
    }
  }
  if (!hasPremium(user)) {
    const copy = getStudioGateCopy('KNITTING_CUSTOM_FIT')
    return {
      allowed: false,
      status: 402,
      error: copy.message,
      rationale: copy.rationale,
      gate: 'KNITTING_CUSTOM_FIT',
    }
  }
  return { allowed: true }
}

// ── Option conversions ──────────────────────────────────────────────────────

/** Zod hands back plain numbers; the library wants the CYC category literals. */
export function toShapeOptions(
  options: z.infer<typeof ShapeOptionsSchema> | undefined,
): ShapeOptions {
  if (!options) return {}
  const { yarnWeightCategory, ...rest } = options
  return yarnWeightCategory
    ? { ...rest, yarnWeightCategory: yarnWeightCategory as 1 | 2 | 3 | 4 | 5 | 6 | 7 }
    : rest
}

export function toSockOptions(
  options: z.infer<typeof SockOptionsSchema> | undefined,
): SockOptions {
  if (!options) return {}
  const { yarnWeightCategory, ...rest } = options
  return yarnWeightCategory
    ? { ...rest, yarnWeightCategory: yarnWeightCategory as 1 | 2 | 3 | 4 | 5 }
    : rest
}
