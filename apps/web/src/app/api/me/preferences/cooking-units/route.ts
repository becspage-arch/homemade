import { NextResponse } from 'next/server'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'

export const dynamic = 'force-dynamic'

const OVEN = new Set(['FAN_C', 'CONVENTIONAL_C', 'FAHRENHEIT', 'GAS_MARK'])
const WEIGHT = new Set(['METRIC', 'IMPERIAL'])
const VOLUME = new Set(['METRIC', 'IMPERIAL_UK', 'IMPERIAL_US'])

interface CookingUnitPrefs {
  // Each accepts a valid enum value, or null to clear back to the locale default.
  ovenPreference?: string | null
  weightPreference?: string | null
  volumePreference?: string | null
}

/**
 * Read the signed-in user's cooking unit preferences. Null on any field means
 * "use the locale default at render time". Anonymous users get 401.
 */
export async function GET() {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  return NextResponse.json({
    ovenPreference: user.ovenPreference,
    weightPreference: user.weightPreference,
    volumePreference: user.volumePreference,
  })
}

/**
 * Patch the cooking unit preferences. Only the fields present in the body are
 * touched; a valid enum value sets it, explicit null clears it, anything else
 * is ignored. Canonical recipe storage is never affected.
 */
export async function PATCH(req: Request) {
  const user = await getCurrentDbUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  let body: CookingUnitPrefs
  try {
    body = (await req.json()) as CookingUnitPrefs
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  applyEnum(data, 'ovenPreference', body.ovenPreference, OVEN)
  applyEnum(data, 'weightPreference', body.weightPreference, WEIGHT)
  applyEnum(data, 'volumePreference', body.volumePreference, VOLUME)

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data,
    select: { ovenPreference: true, weightPreference: true, volumePreference: true },
  })
  return NextResponse.json(updated)
}

function applyEnum(
  data: Record<string, unknown>,
  key: keyof CookingUnitPrefs,
  value: string | null | undefined,
  allowed: Set<string>,
): void {
  if (value === undefined) return
  if (value === null) { data[key] = null; return }
  if (allowed.has(value)) data[key] = value
}
