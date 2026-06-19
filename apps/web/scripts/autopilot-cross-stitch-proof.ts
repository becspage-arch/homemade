import { config as loadEnv } from 'dotenv'
loadEnv({ path: 'C:/Users/Rebecca/Projects/code/homemade/.env.credentials' })
loadEnv()
import { prisma, parsePatternData } from '@homemade/db'
import { runBatch, type PatternSpec } from '@/lib/studio/generation/autopilot'
import { metImage, commonsImage, fluxIllustration } from '@/lib/studio/generation/sources'
import { sayingPoster, alphabetSampler } from '@/lib/studio/generation/procedural'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { stitchedBoundingBox } from '@/components/studio/chart/render-helpers'
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const HOMEMADE = 'cmqkjybwo0000ncv4bcjgwgtm'

const SPECS: PatternSpec[] = [
  // Heritage — image
  { slug: 'xs-proof-landscape', name: 'Mount Fuji', theme: 'Landscape (heritage)', kind: 'image', acquire: () => metImage('Hiroshige Mount Fuji'), convert: { longestCells: 140, colours: 22, preprocess: { saturation: 1.2 } } },
  { slug: 'xs-proof-flamingo', name: 'Flamingo', theme: 'Birds (heritage)', kind: 'image', acquire: () => commonsImage('Audubon-Flamingo.jpg'), convert: { longestCells: 150, colours: 22 } },
  // Fine-art reproduction (free PD)
  { slug: 'xs-proof-starrynight', name: 'The Starry Night', theme: 'Fine-art repro', kind: 'image', acquire: () => commonsImage('Van Gogh Starry Night', { titleMust: /starry/i }), convert: { longestCells: 150, colours: 24 } },
  // Procedural
  { slug: 'xs-proof-saying', name: 'Read more, worry less', theme: 'Sayings poster', kind: 'procedural', design: () => sayingPoster(['READ MORE', 'WORRY', 'LESS'], 0), width: 130, height: 162 },
  { slug: 'xs-proof-alphabet', name: 'Alphabet sampler', theme: 'Alphabet', kind: 'procedural', design: () => alphabetSampler(1), width: 150, height: 116 },
  // Tier E (AI)
  { slug: 'xs-proof-giraffe', name: 'Bubble bath giraffe', theme: 'Character (Tier E)', kind: 'image', acquire: () => fluxIllustration('an anthropomorphic giraffe wearing a yellow towel turban and round red glasses and a bathrobe, relaxing in a bubble bath with rubber ducks, lush botanical floral wallpaper'), convert: { longestCells: 165, colours: 34, preprocess: { saturation: 1.1 } } },
  { slug: 'xs-proof-xmas', name: 'Christmas jumper cat', theme: 'Seasonal (Tier E)', kind: 'image', acquire: () => fluxIllustration('a cat wearing a red and white Christmas jumper and a santa hat holding a steaming mug of cocoa, snowy window with fairy lights and a decorated tree, festive red green gold palette'), convert: { longestCells: 160, colours: 28, preprocess: { saturation: 1.1 } } },
  { slug: 'xs-proof-delft', name: 'Delft blue hare', theme: 'Monochrome (Tier E)', kind: 'image', acquire: () => fluxIllustration('a hare in Delft blue and white porcelain style, intricate cobalt-blue floral patterning on cream, tonal monochrome blue', { imageSize: 'square_hd' }), convert: { longestCells: 140, colours: 12, preprocess: { saturation: 1.1 } } },
]

async function main() {
  const results = await runBatch(HOMEMADE, SPECS)
  console.log('\n=== PROOF BATCH RESULTS ===')
  for (const r of results) {
    if (!r.ok) { console.log(`  ERROR ${r.slug}: ${r.error}`); continue }
    const flag = r.held ? 'HOLD' : 'pass'
    console.log(`  [${flag}] ${r.theme.padEnd(22)} ${r.size} ${r.colours}col conf=${((r.confettiRatio ?? 0) * 100).toFixed(0)}%  ${r.reasons.join('; ')}`)
    // render for vision review
    if (r.id) {
      const row = await prisma.pattern.findUnique({ where: { id: r.id }, select: { data: true } })
      if (row) {
        const data = parsePatternData(row.data)
        const bb = stitchedBoundingBox(data); const mg = 2
        const region = bb ? { x: Math.max(0, bb.minX - mg), y: Math.max(0, bb.minY - mg), width: Math.min(data.grid.width, bb.maxX + 1 + mg) - Math.max(0, bb.minX - mg), height: Math.min(data.grid.height, bb.maxY + 1 + mg) - Math.max(0, bb.minY - mg) } : undefined
        const rw = region?.width ?? data.grid.width; const cp = rw <= 60 ? 30 : rw <= 120 ? 18 : 10
        writeFileSync(`C:/tmp/proof-${r.slug}.png`, await sharp(Buffer.from(renderPatternSvgString(data, { mode: 'beauty', cellPx: cp, showSymbols: false, showGrid: false, showCentreCrosshairs: false, padding: Math.round(cp * 0.8), region }))).resize(520, 640, { fit: 'inside', background: { r: 245, g: 240, b: 232 } }).png().toBuffer())
      }
    }
  }
  console.log(`\nIDs: ${results.filter((r) => r.id).map((r) => `${r.slug}=${r.id}`).join('  ')}`)
}
main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); process.exit(1) })
