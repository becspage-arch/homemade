/**
 * Seed three photographic-density library patterns for the cross-stitch
 * gallery, built from public-domain Wikimedia Commons photos through
 * the same photo-to-chart pipeline real users hit. The point is to
 * show what the hero renderer does with the kind of dense subject
 * matter that the Stitching Mama catalogue import (Phase C) will land
 * — flowers and animals with 30+ colour transitions, not the simple
 * 3-6 colour craft seeds.
 *
 * Idempotent on Pattern.slug. Re-running upserts.
 *
 *   pnpm --filter @homemade/web exec tsx scripts/seed-photographic-patterns.ts
 *
 * The fetched photos hit Wikimedia upload servers directly; URLs are
 * stable and the licences (CC0 / CC-BY) permit commercial use with
 * attribution noted in the pattern description.
 *
 * The deploy workflow runs this after migrate:deploy so the production
 * library always has these three demo patterns present.
 */

import {
  prisma,
  computePatternMetrics,
  Visibility,
} from '@homemade/db'
import { photoToPatternData } from '../src/lib/studio/photo-to-pattern'

interface PhotoSeed {
  slug: string
  name: string
  description: string
  photoUrl: string
  width: number
  height: number
  colours: number
  confettiMin: 'low' | 'medium' | 'high'
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  estimatedHours: number
}

const PHOTOS: PhotoSeed[] = [
  {
    slug: 'demo-blue-hydrangea',
    name: 'Blue hydrangea',
    description:
      'A single blue hydrangea bloom against a clean background. Built from a Wikimedia Commons photograph through Homemade\'s photo-to-chart pipeline. Demonstrates how dense photographic patterns render in the library.',
    photoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Hydrangea_macrophylla_-_Hortensia_hydrangea.jpg/1024px-Hydrangea_macrophylla_-_Hortensia_hydrangea.jpg',
    width: 120,
    height: 120,
    colours: 36,
    confettiMin: 'medium',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 40,
  },
  {
    slug: 'demo-pink-peony',
    name: 'Pink peony',
    description:
      'A full pink peony in close-up, every petal layer visible. Built from a Wikimedia Commons photograph through the photo-to-chart pipeline. Shows how the renderer handles soft pink-to-cream colour transitions across many shades.',
    photoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Paeonia_lactiflora_-_Karl_Rosenfield_-_Topsalo_-_2.jpg/1024px-Paeonia_lactiflora_-_Karl_Rosenfield_-_Topsalo_-_2.jpg',
    width: 130,
    height: 130,
    colours: 40,
    confettiMin: 'medium',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 45,
  },
  {
    slug: 'demo-african-elephant',
    name: 'African elephant',
    description:
      'An adult African elephant in profile against a soft savanna sky. Built from a Wikimedia Commons photograph. Shows how the photo-to-chart pipeline handles greys and the natural textural detail of skin.',
    photoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/1024px-African_Bush_Elephant.jpg',
    width: 140,
    height: 110,
    colours: 28,
    confettiMin: 'medium',
    difficulty: 'INTERMEDIATE',
    estimatedHours: 38,
  },
]

async function main() {
  const designer = await prisma.designer.upsert({
    where: { slug: 'stitching-mama' },
    create: {
      slug: 'stitching-mama',
      displayName: 'Stitching Mama',
      isHouseDesigner: true,
    },
    update: {},
    select: { id: true },
  })

  const subCategory = await prisma.subCategory.findFirst({
    where: { category: { slug: 'cross-stitch' }, slug: { in: ['florals', 'animals'] } },
    select: { id: true, slug: true },
  })
  // Two themes; we'll route each pattern to its right sub-cat below.
  const subCats = await prisma.subCategory.findMany({
    where: { category: { slug: 'cross-stitch' } },
    select: { id: true, slug: true },
  })
  const subCatBySlug = new Map(subCats.map((s) => [s.slug, s.id]))
  void subCategory

  for (const photo of PHOTOS) {
    console.log(`\n→ ${photo.slug} (${photo.name})`)
    console.log(`  Fetching ${photo.photoUrl}`)
    const res = await fetch(photo.photoUrl, {
      headers: { 'User-Agent': 'homemade.education photographic-seed (rebecca@homemade.education)' },
    })
    if (!res.ok) {
      console.error(`  ✗ Fetch failed: ${res.status} ${res.statusText}`)
      continue
    }
    const buf = Buffer.from(await res.arrayBuffer())
    console.log(`  Quantising ${photo.width}×${photo.height} @ ${photo.colours} colours…`)
    const t0 = Date.now()
    const { data } = await photoToPatternData(buf, {
      width: photo.width,
      height: photo.height,
      colours: photo.colours,
      fabricCount: 16,
      brand: 'DMC',
      confettiMin: photo.confettiMin,
      backgroundRemoval: false,
    })
    const elapsed = Date.now() - t0
    const metrics = computePatternMetrics(data)
    console.log(`  ✓ Generated in ${elapsed}ms — ${metrics.colourCount} surviving colours, ${metrics.totalStitches.toLocaleString()} stitches`)

    const subCatSlug = photo.slug.includes('elephant') ? 'animals' : 'florals'
    const subCategoryId = subCatBySlug.get(subCatSlug) ?? null

    const upserted = await prisma.pattern.upsert({
      where: { slug: photo.slug },
      create: {
        slug: photo.slug,
        type: 'CROSS_STITCH',
        name: photo.name,
        description: photo.description,
        data: data as unknown as object,
        designerId: designer.id,
        subCategoryId,
        difficulty: photo.difficulty,
        estimatedHours: photo.estimatedHours,
        visibility: Visibility.PUBLIC,
        publishedAt: new Date(),
        widthCells: metrics.widthCells,
        heightCells: metrics.heightCells,
        colourCount: metrics.colourCount,
        totalStitches: metrics.totalStitches,
        hasBackstitch: metrics.hasBackstitch,
        hasFrenchKnots: metrics.hasFrenchKnots,
        hasBeads: metrics.hasBeads,
        hasQuarterStitches: metrics.hasQuarterStitches,
        fabricCountSuggested: data.fabric.count,
      },
      update: {
        name: photo.name,
        description: photo.description,
        data: data as unknown as object,
        difficulty: photo.difficulty,
        estimatedHours: photo.estimatedHours,
        widthCells: metrics.widthCells,
        heightCells: metrics.heightCells,
        colourCount: metrics.colourCount,
        totalStitches: metrics.totalStitches,
        hasBackstitch: metrics.hasBackstitch,
        hasFrenchKnots: metrics.hasFrenchKnots,
        hasBeads: metrics.hasBeads,
        hasQuarterStitches: metrics.hasQuarterStitches,
        fabricCountSuggested: data.fabric.count,
      },
      select: { id: true, slug: true, name: true },
    })
    console.log(`  ✓ ${upserted.slug} → Pattern ${upserted.id}`)
  }

  console.log('\nDone.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
