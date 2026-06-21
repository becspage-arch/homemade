import { config as loadEnv } from 'dotenv';
loadEnv({ path: '../../.env.credentials' });
import { prisma } from '../src/index.js';

async function main() {
  const cat = await prisma.category.findUnique({ where: { slug: 'cooking' }, select: { id: true } });
  if (!cat) return;
  const slugs = await prisma.tutorial.findMany({
    where: { categoryId: cat.id, status: 'PUBLISHED' },
    select: { slug: true },
    orderBy: { slug: 'asc' }
  });
  const french = slugs.map(s => s.slug).filter(s => s.includes('quiche') || s.includes('tarte') || s.includes('pissaladiere') || s.includes('pate-') || s.includes('rillettes') || s.includes('terrine') || s.includes('galette') || s.includes('ratatouille') || s.includes('pommes') || s.includes('gratin'));
  const diner = slugs.map(s => s.slug).filter(s => s.includes('pancake') || s.includes('waffle') || s.includes('grilled-cheese') || s.includes('hamburger') || s.includes('meatloaf') || s.includes('mac-and-cheese') || s.includes('mashed-potato') || s.includes('coleslaw') || s.includes('clam-chowder') || s.includes('pot-roast') || s.includes('meatball'));
  console.log('French published:', french.length, JSON.stringify(french));
  console.log('Diner published:', diner.length, JSON.stringify(diner));
  await prisma.$disconnect();
}
main().catch(e => console.error(e.message));
