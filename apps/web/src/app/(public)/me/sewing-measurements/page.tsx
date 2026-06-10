import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { ALL_FIELDS, type MeasurementField } from '@/lib/sewing/measurements'
import { MeasurementsShell } from './measurements-shell'
import './sewing-measurements.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your sewing measurements · homemade',
  description: 'Saved body measurements that pre-fill the right size for sewing projects.',
  robots: { index: false, follow: false },
}

export type Measurements = Partial<Record<MeasurementField, number | null>> & {
  notes: string | null
}

export default async function SewingMeasurementsPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in?redirect_url=/me/sewing-measurements')

  const row = await prisma.userSewingMeasurements.findUnique({
    where: { userId: user.id },
  })

  const measurements: Measurements = { notes: row?.notes ?? null }
  for (const field of ALL_FIELDS) {
    const v = row?.[field]
    measurements[field] =
      v === null || v === undefined ? null : Number(v.toString())
  }

  const preference: 'cm' | 'inches' =
    user.measurementPreference === 'inches' ? 'inches' : 'cm'

  return (
    <MeasurementsShell
      initial={measurements}
      preference={preference}
      lastUpdatedAt={row?.lastUpdatedAt?.toISOString() ?? null}
    />
  )
}
