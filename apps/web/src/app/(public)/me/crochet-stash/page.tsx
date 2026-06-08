import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { prisma } from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { CrochetStashShell } from './stash-shell'
import './stash.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your crochet stash · homemade',
  description: 'Yarns and hooks you own. Pre-fills future projects.',
  robots: { index: false, follow: false },
}

interface StashYarn {
  id: string
  label: string
  weightSlug?: string
  yardage?: number
  colourHex?: string
  colourName?: string
  leftoverYardage?: number
  notes?: string
}

export default async function CrochetStashPage() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in?redirect_url=/me/crochet-stash')

  const yarns = parseYarns(user.myYarns)
  const hookSlugs = Array.isArray(user.myHooks) ? user.myHooks : []

  const [hooks, allHooks, yarnWeights] = await Promise.all([
    prisma.crochetHook.findMany({
      where: { slug: { in: hookSlugs } },
      select: { slug: true, canonicalName: true, mmSize: true, ukSize: true, usSize: true },
      orderBy: { mmSize: 'asc' },
    }),
    prisma.crochetHook.findMany({
      select: { slug: true, canonicalName: true, mmSize: true, ukSize: true, usSize: true },
      orderBy: { mmSize: 'asc' },
    }),
    prisma.yarnWeight.findMany({
      select: { slug: true, canonicalName: true, standardCategory: true },
      orderBy: { standardCategory: 'asc' },
    }),
  ])

  return (
    <CrochetStashShell
      yarns={yarns}
      hooks={hooks}
      allHooks={allHooks}
      yarnWeights={yarnWeights}
    />
  )
}

function parseYarns(raw: unknown): StashYarn[] {
  if (!Array.isArray(raw)) return []
  const out: StashYarn[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const obj = item as Record<string, unknown>
    if (typeof obj.id !== 'string' || typeof obj.label !== 'string') continue
    out.push({
      id: obj.id,
      label: obj.label,
      weightSlug: typeof obj.weightSlug === 'string' ? obj.weightSlug : undefined,
      yardage: typeof obj.yardage === 'number' ? obj.yardage : undefined,
      colourHex: typeof obj.colourHex === 'string' ? obj.colourHex : undefined,
      colourName: typeof obj.colourName === 'string' ? obj.colourName : undefined,
      leftoverYardage: typeof obj.leftoverYardage === 'number' ? obj.leftoverYardage : undefined,
      notes: typeof obj.notes === 'string' ? obj.notes : undefined,
    })
  }
  return out
}
