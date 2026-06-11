/**
 * Post-S-5e DB verification block. Prints the mandatory verification
 * surface the worker hand-off cites.
 */
import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  for (let depth = 0; depth < 12; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
}

import { prisma } from '@homemade/db'

async function main(): Promise<void> {
  console.log('───────────────── Category.sewing ─────────────────')
  const cat = await prisma.category.findUnique({
    where: { slug: 'sewing' },
    select: {
      slug: true,
      pipelineStatus: true,
      isPublicVisible: true,
    },
  })
  console.log(JSON.stringify(cat, null, 2))

  console.log('\n─────── freesewing SewingPattern rows ───────')
  const fs = await prisma.sewingPattern.findMany({
    where: { isFreesewingDesign: true },
    select: {
      slug: true,
      freesewingDesignSlug: true,
      freesewingVersion: true,
      garmentCategory: true,
      visibility: true,
      premium: true,
    },
    orderBy: { freesewingDesignSlug: 'asc' },
  })
  console.log(`total isFreesewingDesign rows: ${fs.length}`)
  for (const r of fs) {
    console.log(
      `  ${r.freesewingDesignSlug?.padEnd(10) ?? '?'} slug=${r.slug.padEnd(40)} garmentCategory=${r.garmentCategory.padEnd(20)} visibility=${r.visibility}`,
    )
  }

  console.log('\n─────── sample three rows (full ────────')
  const sample = await prisma.sewingPattern.findMany({
    where: { isFreesewingDesign: true },
    take: 3,
    select: {
      slug: true,
      name: true,
      garmentCategory: true,
      skillLevel: true,
      subCategoryId: true,
      freesewingDesignSlug: true,
      freesewingVersion: true,
      requiredMeasurements: true,
      techniqueSlugs: true,
      criticalTechniques: true,
      aliases: true,
      availableFormats: true,
      visibility: true,
      attributionText: true,
    },
  })
  console.log(JSON.stringify(sample, null, 2))

  console.log('\n─────── SewingPattern PUBLISHED counts ───────')
  const counts = await prisma.sewingPattern.groupBy({
    by: ['visibility', 'isFreesewingDesign'],
    _count: true,
  })
  console.log(JSON.stringify(counts, null, 2))

  console.log('\n─────── SewingPatternDraftCache row count ───────')
  const cache = await prisma.sewingPatternDraftCache.count()
  console.log(`draft-cache rows: ${cache}`)
  const cacheByDesign = await prisma.sewingPatternDraftCache.groupBy({
    by: ['designSlug'],
    _count: true,
    orderBy: { designSlug: 'asc' },
  })
  for (const r of cacheByDesign) {
    console.log(`  ${r.designSlug.padEnd(12)} ${r._count} entries`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err)
    return prisma.$disconnect().then(() => process.exit(1))
  })
