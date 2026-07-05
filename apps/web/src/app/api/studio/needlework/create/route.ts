import { NextResponse } from 'next/server'
import {
  prisma,
  Visibility,
  NeedleworkDiscipline,
  NeedleworkPatternFormat,
  Difficulty,
  NeedleworkFrameType,
} from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import { inngest } from '@/inngest/client'
import {
  convertImageToNeedleworkPattern,
  type NeedleworkCreateSettings,
} from '@/lib/needlework/create-your-own'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/studio/needlework/create — create-your-own, the NEEDLEWORK path.
 *
 * The customer's approved image (a Flux illustration from
 * /api/studio/idea-to-image, or an uploaded photo) → the rigorous surface-
 * embroidery converter (`convertImageToNeedleworkPattern`, the same engine our
 * catalogue routine uses) → saved as THE CUSTOMER'S OWN needlework pattern
 * (ownerUserId = them, PRIVATE — never added to the public catalogue, never run
 * through the bulk gate). It ships the full document our patterns carry
 * (registered outline + dense colour/stitch map + floss key + stitch key +
 * steps), so it opens complete in their needlework Studio the instant this
 * returns.
 *
 * The photoreal loom hero is rendered AFTERWARDS on Fargate (the
 * `needlework/hero.render` Inngest job), off the saved row, so the customer is
 * not held for the minutes a render takes. The pattern is fully usable without
 * it — the hero attaches to the row when the render lands.
 *
 * Create-your-own is premium (the locked spec). The Studio surface shows the
 * upgrade popup to non-premium members; this route enforces the gate itself too
 * since it's the thing that does the work.
 */
export async function POST(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }
  if (!hasPremium(user)) {
    return NextResponse.json(
      { error: 'Homemade Premium is required to design your own needlework pattern.' },
      { status: 402 },
    )
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart form data' }, { status: 400 })
  }

  const file = form.get('image')
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'image is required' }, { status: 400 })
  }
  const imageBytes = Buffer.from(await file.arrayBuffer())

  const name = (String(form.get('name') ?? '').trim() || 'Untitled design').slice(0, 120)
  const widthMm = clampInt(Number(form.get('widthMm') ?? 200), 100, 320, 200)
  const frameStr = String(form.get('frame') ?? 'round')
  const frame: NeedleworkCreateSettings['frame'] =
    frameStr === 'rect' || frameStr === 'none' ? frameStr : 'round'
  const detail = String(form.get('detail') ?? '1') !== '0'
  const fullScene = String(form.get('fullScene') ?? '0') === '1'

  let conversion
  try {
    conversion = await convertImageToNeedleworkPattern(imageBytes, name, {
      widthMm,
      frame,
      detail,
      fullScene,
    })
  } catch (err) {
    console.error('[needlework/create] conversion failed:', err)
    return NextResponse.json(
      { error: 'Could not build a pattern from that image. Try a different image or setting.' },
      { status: 502 },
    )
  }

  // Persist as the customer's OWN pattern: ownerUserId set, PRIVATE, no
  // subCategory (it never shows in the public grid — the public route excludes
  // owned rows). Same discipline/format the catalogue routine writes so it opens
  // identically in the needlework Studio.
  const frameType =
    conversion.frameType === 'NONE'
      ? null
      : conversion.frameType === 'SLATE_FRAME'
        ? NeedleworkFrameType.SLATE_FRAME
        : NeedleworkFrameType.HOOP

  const row = await prisma.needleworkPattern.create({
    data: {
      name,
      discipline: NeedleworkDiscipline.SURFACE_EMBROIDERY,
      patternFormat: NeedleworkPatternFormat.SURFACE_VECTOR,
      vectorData: conversion.vectorData as unknown as object,
      regionAnnotations: conversion.regionAnnotations as unknown as object,
      fabricSpec: conversion.canonical.fabricSpec as unknown as object,
      frameType,
      threadTypes: ['stranded-cotton'],
      colourCount: conversion.colourCount,
      difficulty: Difficulty.INTERMEDIATE,
      ownerUserId: user.id,
      visibility: Visibility.PRIVATE,
    },
    select: { id: true },
  })

  // Kick off the photoreal loom hero render on Fargate, off the saved row. Fire
  // and forget — a queue hiccup must never fail the customer's create, and the
  // pattern is complete + usable without the hero.
  try {
    await inngest.send({
      name: 'needlework/hero.render',
      data: { needleworkPatternId: row.id },
    })
  } catch (err) {
    console.error('[needlework/create] could not enqueue hero render:', err)
  }

  return NextResponse.json({ id: row.id }, { status: 201 })
}

function clampInt(v: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(v)) return fallback
  return Math.max(min, Math.min(max, Math.round(v)))
}
