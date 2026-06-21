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
  const all = slugs.map(s => s.slug);
  const check = ['quiche-au-saumon','quiche-aux-legumes','quiche-aux-epinards','quiche-au-roquefort-et-noix','tarte-a-loignon','tarte-flambee','tarte-tatin-aux-tomates','pate-en-croute','rillettes-de-canard','terrine-de-campagne','phaal','mushroom-rice','garlic-naan','plain-naan','mint-sauce-indian','cheeseburger','smashburger','reuben','blt','french-toast','eggs-benedict','eggs-florentine','hash-browns','home-fries','biscuits-and-gravy','country-fried-steak','sloppy-joe','hot-dog','club-sandwich','lobster-roll','po-boy-shrimp','tuna-melt','breakfast-burrito','huevos-rancheros','patty-melt'];
  const existing = check.filter(s => all.includes(s));
  const missing = check.filter(s => !all.includes(s));
  console.log('Already published:', JSON.stringify(existing));
  console.log('Need authoring:', missing.length, JSON.stringify(missing));
  await prisma.$disconnect();
}
main().catch(e => console.error(e.message));
