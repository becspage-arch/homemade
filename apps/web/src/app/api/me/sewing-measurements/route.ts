import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { pickFields, ALL_FIELDS } from '@/lib/sewing/measurements'

/**
 * Saved body measurements profile. Free for any signed-in user per the
 * locked sign-in carrots. Canonical storage: cm everywhere.
 *
 *   GET   /api/me/sewing-measurements
 *     -> { measurements: {...} | null, measurementPreference: 'cm'|'inches'|null }
 *
 *   PATCH /api/me/sewing-measurements
 *     body: any subset of the field names (cm values, or null to clear)
 *           plus an optional `measurementPreference` and `notes`
 *     -> upserts the row; returns the same shape as GET
 */

function serialise(row: Record<string, unknown> | null) {
  if (!row) return null
  const out: Record<string, unknown> = {}
  for (const field of ALL_FIELDS) {
    const v = row[field]
    if (v === null || v === undefined) {
      out[field] = null
    } else if (typeof v === 'object' && v !== null && 'toString' in v) {
      out[field] = Number(v.toString())
    } else {
      out[field] = Number(v)
    }
  }
  out.notes = row.notes ?? null
  out.lastUpdatedAt =
    row.lastUpdatedAt instanceof Date ? row.lastUpdatedAt.toISOString() : row.lastUpdatedAt
  return out
}

export async function GET() {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const row = await prisma.userSewingMeasurements.findUnique({
    where: { userId: user.id },
  })

  return NextResponse.json({
    measurements: serialise(row as unknown as Record<string, unknown> | null),
    measurementPreference: user.measurementPreference ?? null,
  })
}

export async function PATCH(request: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const payload = pickFields(body)

  if (payload.measurementPreference !== undefined) {
    await prisma.user.update({
      where: { id: user.id },
      data: { measurementPreference: payload.measurementPreference },
    })
  }

  const { measurementPreference: _ignore, ...rest } = payload
  const writeData = { ...rest, lastUpdatedAt: new Date() }

  const row = await prisma.userSewingMeasurements.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...writeData },
    update: writeData,
  })

  return NextResponse.json({
    measurements: serialise(row as unknown as Record<string, unknown>),
    measurementPreference:
      payload.measurementPreference !== undefined
        ? payload.measurementPreference
        : (user.measurementPreference ?? null),
  })
}
