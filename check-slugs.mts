import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
const slugs = ['tomatoes-beef','onion-red','sole-fillet','tuna','dry-white-wine','lasagne-sheets','parmesan','dried-chilli','soured-cream','coriander-fresh','corn-husks-dried','bread-stale','stock-vegetable','stock-lamb']
const found = await db.ingredient.findMany({ where: { slug: { in: slugs } }, select: { slug: true } })
const foundSlugs = new Set(found.map((i: { slug: string }) => i.slug))
const missing = slugs.filter(s => !foundSlugs.has(s))
console.log('MISSING:', missing.join(', ') || 'none')
await db.$disconnect()
