import type { PrismaModule } from './upload-tutorial.js'

type PM = typeof import('../src/index.js')
const { prisma } = await import('../src/index.js') as any

const slugs = ['tomatoes-beef','onion-red','sole-fillet','tuna','dry-white-wine','lasagne-sheets','parmesan','dried-chilli','soured-cream','coriander-fresh','corn-husks-dried','bread-stale','stock-vegetable','stock-lamb','egg-yolks','cumin-seeds','coriander-seeds','veal-shoulder','goat-shoulder']
const found = await (prisma as any).ingredient.findMany({ where: { slug: { in: slugs } }, select: { slug: true } })
const foundSlugs = new Set(found.map((i: { slug: string }) => i.slug))
const missing = slugs.filter(s => !foundSlugs.has(s))
console.log('MISSING:', missing.join(', ') || 'none')
