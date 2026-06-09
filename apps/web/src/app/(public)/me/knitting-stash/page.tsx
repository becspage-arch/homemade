import type { Metadata } from 'next'

import { prisma } from '@homemade/db'
import { KnittingStashClient } from '@/components/stash/KnittingStashClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Knitting stash · homemade',
  description:
    'Track the yarn and needles you have on hand. Match them to patterns you want to make.',
  robots: { index: false, follow: false },
}

/**
 * /me/knitting-stash — the maker's yarn + needle inventory.
 *
 * v1 status: a dedicated KnittingStash DB model is K-4 follow-on.
 * Until it lands the client stores entries in localStorage so
 * makers can use the page now; sync to the server is wired the
 * same way the Studio progress autosave is — present in the client
 * code, persistence stubbed.
 */
export default async function KnittingStashPage() {
  const yarnWeights = await prisma.yarnWeight.findMany({
    select: { slug: true, canonicalName: true, standardCategory: true },
    orderBy: { standardCategory: 'asc' },
  })
  const needles = await prisma.knittingNeedle.findMany({
    select: { slug: true, mmSize: true, canonicalName: true, ukSize: true, usSize: true },
    orderBy: { mmSize: 'asc' },
  })

  return <KnittingStashClient yarnWeights={yarnWeights} needles={needles} />
}
