import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import {
  listPlannerProjects,
  listPlannerStash,
  getPlannerMaterials,
} from '@/lib/planner/service'
import { PlannerShell } from './planner-shell'
import './planner.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your project planner · homemade',
  description: 'Plan your cross-stitch projects, work out the floss you need, and track your stash.',
  robots: { index: false, follow: false },
}

// The planner is cross-craft by design, but cross-stitch is the only craft with
// a materials provider today, so the page scopes its premium panel to it. As
// each craft signs off, its adapter lights this up with no page change.
const CRAFT = 'CROSS_STITCH' as const

export default async function PlannerPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in?redirect_url=/me/planner')

  const premium = hasPremium(user)

  const [projects, materials, stash] = await Promise.all([
    listPlannerProjects(user.id),
    premium ? getPlannerMaterials(user.id, CRAFT) : Promise.resolve(null),
    premium ? listPlannerStash(user.id, CRAFT) : Promise.resolve([]),
  ])

  return (
    <PlannerShell
      craft={CRAFT}
      projects={projects}
      premium={premium}
      materials={materials}
      stash={stash}
    />
  )
}
