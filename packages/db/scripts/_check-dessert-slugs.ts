import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

async function main(): Promise<void> {
  const cats = await prisma.category.findMany({ where: { slug: 'cooking' }, select: { id: true } })
  const catId = cats[0].id
  const slugs = [
    'sticky-toffee-pudding', 'treacle-sponge-pudding', 'spotted-dick', 'jam-roly-poly',
    'bread-and-butter-pudding', 'queen-of-puddings', 'rhubarb-crumble', 'apple-crumble',
    'tiramisu', 'chocolate-mousse', 'eton-mess', 'floating-islands',
    'creme-brulee', 'panna-cotta-vanilla', 'lemon-posset', 'vanilla-ice-cream',
    'lemon-sorbet', 'zabaglione', 'clafoutis', 'creme-anglaise', 'creme-patissiere',
    'rice-pudding-baked', 'affogato', 'syllabub-lemon', 'strawberry-fool',
    'gooseberry-fool', 'chocolate-ice-cream', 'raspberry-sorbet', 'granita-coffee',
    'baked-alaska', 'creme-caramel', 'pots-de-creme-chocolate', 'no-churn-ice-cream',
    'pears-in-red-wine', 'baked-apples', 'steamed-lemon-pudding', 'spotted-dog',
    'bananas-foster', 'lemon-mousse', 'trifle-sherry',
  ]
  const existing = await prisma.tutorial.findMany({
    where: { categoryId: catId, slug: { in: slugs } },
    select: { slug: true, status: true },
  })
  console.log('Existing slugs:', existing.map(t => `${t.slug} (${t.status})`).join('\n') || 'none')
  console.log('Count:', existing.length)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
