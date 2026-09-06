import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'

import { getCurrentDbUser } from '@/lib/get-current-user'
import { gradeGarment } from '@/lib/knitting/grading/garment-grader'
import { verifyGradedPattern } from '@/lib/knitting/grading/verifier'
import { gradeSock } from '@/lib/knitting/sock/sock-grader'
import { verifyGradedSock } from '@/lib/knitting/sock/verifier'
import {
  BodyMeasurementsSchema,
  FootMeasurementsSchema,
  GradeRequestSchema,
  decideCustomFit,
  toShapeOptions,
  toSockOptions,
} from '@/lib/knitting/grading/grade-request'
import {
  DEFAULT_GARMENT_SIZES,
  DEFAULT_SOCK_SIZES,
  deriveGradableSpec,
  isKnownFootSize,
  isKnownSize,
  type KnittingGradableSpec,
} from '@/lib/knitting/grading/pattern-spec'
import type { GradedPattern } from '@/lib/knitting/grading/types'
import type { SockGradedPattern } from '@/lib/knitting/sock/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// ── Route ───────────────────────────────────────────────────────────────────

/**
 * POST /api/studio/knitting/grade — the knitting grader as a product.
 *
 * Send a pattern slug (or a bare construction spec), optionally a gauge, an
 * ease preset and a size run, and the response carries the fully worked
 * pattern for every standard size: stitch counts at each working point, row
 * counts, yarn needed, finished measurements and the ordered assembly steps.
 * Garments and socks both go through here; the slug's project shape decides
 * which grader runs, and a bare spec says so itself.
 *
 * Standard sizes are free, signed in or not. Send `customMeasurements` and
 * the response adds one more worked pattern graded to those numbers at the
 * maker's own swatch gauge — that is premium, so it needs a signed-in maker
 * with an active entitlement. Typing measurements in is never gated; only the
 * worked custom-size pattern that comes back is.
 *
 * Status codes: 400 bad input, 401 custom fit without signing in, 402 custom
 * fit without premium, 404 no such pattern, 422 the pattern has nothing the
 * grader can work from.
 */
export async function POST(req: Request) {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = GradeRequestSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 })
  }
  const body = parsed.data

  // ── Resolve the spec: the stored pattern, then the request's overrides ──
  let spec: KnittingGradableSpec | null = null
  let patternName: string | null = null
  let patternSlug: string | null = null

  if (body.slug) {
    const pattern = await prisma.knittingPattern.findUnique({
      where: { slug: body.slug },
      select: {
        slug: true,
        name: true,
        loomRenderStatus: true,
        loomHeroMediaId: true,
        projectShape: true,
        constructionDirection: true,
        inTheRoundMethod: true,
        techniqueDisciplines: true,
        craftTechniqueTags: true,
        specialStitchesUsed: true,
        easePresetSlug: true,
        gaugeInPatternStitch: true,
        gaugeText: true,
        yarnWeightStandard: true,
        sizesGraded: true,
      },
    })
    // No knitting pattern is a pattern until the loom has rendered it and the
    // photo has been judged. A row without a successful render and its own
    // hero is answered exactly like a row that does not exist, so nothing
    // about it leaks through the grader. SUCCESS is the status the loom
    // render-on-publish path writes.
    if (
      !pattern ||
      pattern.loomRenderStatus !== 'SUCCESS' ||
      !pattern.loomHeroMediaId
    ) {
      return NextResponse.json({ error: 'No knitting pattern with that slug.' }, { status: 404 })
    }
    patternName = pattern.name
    patternSlug = pattern.slug
    spec = deriveGradableSpec({
      ...pattern,
      // A gauge sent with the request stands in for the stored one, so a
      // pattern whose gauge was never recorded still grades once the maker
      // has swatched.
      gaugeText: body.gauge ? gaugeSentence(body.gauge) : pattern.gaugeText,
      gaugeInPatternStitch: body.gauge ?? pattern.gaugeInPatternStitch,
    })
    if (!spec) {
      return NextResponse.json(
        {
          error:
            'This pattern does not record enough to grade: it needs a gauge and a construction the grader knows.',
        },
        { status: 422 },
      )
    }
  }

  if (body.spec) {
    const gauge = body.gauge ?? (spec ? spec.gauge : null)
    if (!gauge) {
      return NextResponse.json(
        { error: 'A gauge is needed to grade from a spec.' },
        { status: 400 },
      )
    }
    spec =
      body.spec.kind === 'GARMENT'
        ? {
            kind: 'GARMENT',
            constructionShape: body.spec.constructionShape,
            garmentType: body.spec.garmentType,
            gauge,
            easePreset: body.easePreset ?? 'ZERO',
            sizes: DEFAULT_GARMENT_SIZES,
            options: toShapeOptions(body.spec.options),
          }
        : {
            kind: 'SOCK',
            construction: body.spec.construction,
            heelStyle: body.spec.heelStyle,
            gauge,
            sizes: DEFAULT_SOCK_SIZES,
            options: toSockOptions(body.spec.options),
          }
  }

  if (!spec) {
    return NextResponse.json({ error: 'Nothing to grade.' }, { status: 400 })
  }

  if (body.gauge) spec = { ...spec, gauge: body.gauge }
  if (spec.kind === 'GARMENT' && body.easePreset) {
    spec = { ...spec, easePreset: body.easePreset }
  }

  // ── The size run ─────────────────────────────────────────────────────────
  if (body.sizes) {
    const wanted = body.sizes
    if (spec.kind === 'GARMENT') {
      const known = wanted.filter(isKnownSize)
      if (known.length === 0) {
        return NextResponse.json(
          { error: 'None of those sizes are in the standard size charts.' },
          { status: 400 },
        )
      }
      spec = { ...spec, sizes: known }
    } else {
      const known = wanted.filter(isKnownFootSize)
      if (known.length === 0) {
        return NextResponse.json(
          { error: 'None of those foot sizes are in the standard size charts.' },
          { status: 400 },
        )
      }
      spec = { ...spec, sizes: known }
    }
  }

  const resolved: KnittingGradableSpec = spec

  // ── The premium half: the maker's own size ───────────────────────────────
  const wantsCustom = body.customMeasurements !== undefined && body.customMeasurements !== null
  let custom: GradedPattern | SockGradedPattern | null = null

  if (wantsCustom) {
    const decision = decideCustomFit(await getCurrentDbUser())
    if (!decision.allowed) {
      return NextResponse.json(
        { error: decision.error, rationale: decision.rationale, gate: decision.gate },
        { status: decision.status },
      )
    }

    if (resolved.kind === 'GARMENT') {
      const measured = BodyMeasurementsSchema.safeParse(body.customMeasurements)
      if (!measured.success) {
        return NextResponse.json({ error: measured.error.message }, { status: 400 })
      }
      custom = gradeGarment({
        constructionShape: resolved.constructionShape,
        size: 'CUSTOM',
        gauge: resolved.gauge,
        easePreset: resolved.easePreset,
        garmentType: resolved.garmentType,
        options: resolved.options,
        bodyMeasurements: measured.data,
      })
    } else {
      const measured = FootMeasurementsSchema.safeParse(body.customMeasurements)
      if (!measured.success) {
        return NextResponse.json({ error: measured.error.message }, { status: 400 })
      }
      custom = gradeSock({
        construction: resolved.construction,
        heelStyle: resolved.heelStyle,
        size: 'CUSTOM',
        gauge: resolved.gauge,
        options: resolved.options,
        footMeasurements: {
          ...measured.data,
          label: measured.data.label ?? 'Your measurements',
        },
      })
    }
  }

  // ── Grade every standard size ────────────────────────────────────────────
  if (resolved.kind === 'GARMENT') {
    const sizes = resolved.sizes.map((size) =>
      gradeGarment({
        constructionShape: resolved.constructionShape,
        size,
        gauge: resolved.gauge,
        easePreset: resolved.easePreset,
        garmentType: resolved.garmentType,
        options: resolved.options,
      }),
    )
    return NextResponse.json({
      craft: 'GARMENT' as const,
      pattern: { slug: patternSlug, name: patternName },
      spec: {
        kind: 'GARMENT' as const,
        constructionShape: resolved.constructionShape,
        garmentType: resolved.garmentType,
        gauge: resolved.gauge,
        easePreset: resolved.easePreset,
        options: resolved.options,
      },
      sizes,
      verification: verifyGradedPattern(sizes),
      custom: custom as GradedPattern | null,
      customFit: { requested: wantsCustom, granted: Boolean(custom) },
    })
  }

  const sizes = resolved.sizes.map((size) =>
    gradeSock({
      construction: resolved.construction,
      heelStyle: resolved.heelStyle,
      size,
      gauge: resolved.gauge,
      options: resolved.options,
    }),
  )
  return NextResponse.json({
    craft: 'SOCK' as const,
    pattern: { slug: patternSlug, name: patternName },
    spec: {
      kind: 'SOCK' as const,
      construction: resolved.construction,
      heelStyle: resolved.heelStyle,
      gauge: resolved.gauge,
      options: resolved.options,
    },
    sizes,
    verification: verifyGradedSock(sizes),
    custom: custom as SockGradedPattern | null,
    customFit: { requested: wantsCustom, granted: Boolean(custom) },
  })
}

/** Put a request gauge back into the sentence form the spec reader parses,
 *  so one code path reads gauge whatever its source. */
function gaugeSentence(gauge: { stitchesPer10cm: number; rowsPer10cm: number }): string {
  return `${gauge.stitchesPer10cm} sts x ${gauge.rowsPer10cm} rows = 10 cm`
}
