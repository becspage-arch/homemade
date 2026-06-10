import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { prisma, type SewingPlanStatus } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { PlanEditorShell } from './editor-shell'
import './plan-detail.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sewing plan · homemade',
  robots: { index: false, follow: false },
}

interface Ctx {
  params: Promise<{ id: string }>
}

export interface InitialPlan {
  id: string
  title: string
  status: SewingPlanStatus
  patternSlug: string | null
  fabricList: unknown
  notionsList: unknown
  threadList: unknown
  cuttingPlan: unknown
  stepsList: unknown
  notes: string | null
  startedAt: string | null
  completedAt: string | null
  updatedAt: string
}

export default async function SewingPlanDetailPage({ params }: Ctx) {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in?redirect_url=/me/sewing-plans')

  const { id } = await params
  const plan = await prisma.userSewingPlan.findFirst({
    where: { id, userId: user.id },
  })
  if (!plan) notFound()

  const initial: InitialPlan = {
    id: plan.id,
    title: plan.title,
    status: plan.status,
    patternSlug: plan.patternSlug,
    fabricList: plan.fabricList ?? [],
    notionsList: plan.notionsList ?? [],
    threadList: plan.threadList ?? [],
    cuttingPlan: plan.cuttingPlan ?? null,
    stepsList: plan.stepsList ?? [],
    notes: plan.notes,
    startedAt: plan.startedAt?.toISOString() ?? null,
    completedAt: plan.completedAt?.toISOString() ?? null,
    updatedAt: plan.updatedAt.toISOString(),
  }

  return <PlanEditorShell initial={initial} />
}
