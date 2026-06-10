import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { prisma, type SewingPlanStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { PlansShell } from './plans-shell'
import './sewing-plans.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your sewing plans · homemade',
  description: 'Project plans for your sewing, with materials, cutting, and steps in one place.',
  robots: { index: false, follow: false },
}

export interface PlanSummary {
  id: string
  title: string
  status: SewingPlanStatus
  patternSlug: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export default async function SewingPlansPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in?redirect_url=/me/sewing-plans')

  const plans = await prisma.userSewingPlan.findMany({
    where: { userId: user.id, status: { not: 'ARCHIVED' } },
    select: {
      id: true,
      title: true,
      status: true,
      patternSlug: true,
      startedAt: true,
      completedAt: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  const summaries: PlanSummary[] = plans.map((p) => ({
    ...p,
    startedAt: p.startedAt?.toISOString() ?? null,
    completedAt: p.completedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  return <PlansShell initial={summaries} />
}
