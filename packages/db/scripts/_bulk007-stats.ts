import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()
import { prisma } from '../src'

const slugs = [
  'wet-felted-phone-case','needle-felted-portrait','multi-layer-nuno-felt-colour-blending','felted-wool-cord','wet-felted-basket-tray','pre-felt-collage-sampler','needle-felted-christmas-ornament','wet-felted-lampshade-cover','reverse-felting-cut-out-design','wet-felted-flower-pin',
  'spinning-angora-fibre','corespinning-with-wire','wheel-tension-and-take-up-guide','spinning-gradient-from-batt','spinning-bamboo-fibre','spinning-mixed-raw-fleece','spinning-bulky-weight-on-wheel','drum-carder-striped-batt','respinning-commercial-yarn','making-a-test-skein',
  'warp-painting-before-weaving','shadow-weave-rigid-heddle','double-weave-floor-loom-pocket','summer-and-winter-weave-four-shaft','weaving-with-handspun-yarn','clasped-warp-colour-gradients','four-shaft-networked-twill','backstrap-loom-plain-weave-band',
  'dyeing-with-st-johns-wort','fermentation-vat-for-woad','exhaust-bath-layered-dyeing','dyeing-with-heather','dyeing-with-lichen','clay-ochre-mordanting','dyeing-cotton-with-alum-acetate',
  'macrame-owl-wall-hanging','macrame-sunburst-wall-art','macrame-rainbow-wall-hanging',
  'hooked-rug-floral-pattern','scandinavian-rya-rug-sample'
]

async function main() {
  const rows = await prisma.tutorial.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, type: true, difficulty: true }
  })
  const typeCounts: Record<string, number> = {}
  const diffCounts: Record<string, number> = {}
  for (const r of rows) {
    typeCounts[r.type] = (typeCounts[r.type] ?? 0) + 1
    diffCounts[r.difficulty] = (diffCounts[r.difficulty] ?? 0) + 1
  }
  console.log('FOUND:' + rows.length)
  console.log('TYPES:' + JSON.stringify(typeCounts))
  console.log('DIFFS:' + JSON.stringify(diffCounts))
  await prisma.$disconnect()
}
main()
