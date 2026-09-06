import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { listPlannerStash } from '@/lib/planner/service'
import { FlossStashShell } from './stash-shell'
import './stash.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your floss stash · homemade',
  description: 'The floss colours you already own, counted against every pattern you open.',
  robots: { index: false, follow: false },
}

/**
 * The free floss stash, sibling to /me/crochet-stash and /me/knitting-stash.
 *
 * Rows are PlannerStashItem for craft CROSS_STITCH, the same table the planner
 * reads, so a skein added here counts in the premium roll-up as well and a
 * skein added there shows up on this page. Keeping the stash is free; the
 * cross-project roll-up and the printable shopping list stay premium.
 */
const CRAFT = 'CROSS_STITCH' as const

export default async function FlossStashPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in?redirect_url=/me/floss-stash')

  const stash = await listPlannerStash(user.id, CRAFT)

  return (
    <FlossStashShell
      craft={CRAFT}
      stash={stash.map((item) => ({
        id: item.id,
        brand: item.brand,
        code: item.code,
        name: item.name,
        colourRgb: item.colourRgb,
        quantityOwned: item.quantityOwned,
        notes: item.notes,
      }))}
    />
  )
}
