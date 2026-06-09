import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{ let dir = __dirname; for (let d=0;d<8;d++){const c=resolve(dir,'.env.credentials');if(existsSync(c)){loadEnv({path:c,override:true});break}const p=dirname(dir);if(p===dir)break;dir=p} }

async function main() {
  const { prisma } = await import('../src/index.js')
  const tools = await prisma.tool.findMany({
    where: { slug: { in: [
      'compost-thermometer','compost-aerator','soil-moisture-meter','thermal-imaging-camera',
      'energy-monitor','foam-strip-gun','draught-excluder-strip','letterbox-brush-strip',
      'silicone-sealant-gun','rainwater-diverter-kit','tap-flow-restrictor',
      'tape-measure','tape-measure-5m','tape-measure-8m','spirit-level','spirit-level-1200mm',
      'cordless-drill-18v','drill','garden-fork','spade','compost-sieve','bucket-10l',
      'aquarium-pump','energy-monitor','multimeter','battery-hydrometer','screwdriver',
      'drill-driver','stanley-knife','panel-saw','pipe-cutter','pipe-lagging','submersible-pump',
      'paintbrush','straightedge','heat-gun','utility-knife','tenon-saw','jigsaw-power',
    ]}},
    select: { slug: true, name: true }
  })
  for (const t of tools) console.log(`${t.slug} → ${t.name}`)
  await prisma.$disconnect()
}
main().catch(e => { console.error(e); process.exit(1) })
