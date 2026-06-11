import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getDesignConfig } from '@/lib/sewing/grading/design-registry'
import { PersonalisationProjectorClient } from '@/components/studio/sewing/personalise/PersonalisationProjectorClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Projector view · homemade',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ designSlug: string }>
}

export default async function PersonalisationProjectorPage({ params }: PageProps) {
  const { designSlug } = await params
  const cfg = getDesignConfig(designSlug)
  if (!cfg) notFound()
  return (
    <PersonalisationProjectorClient
      designSlug={cfg.slug}
      designName={cfg.name}
    />
  )
}
