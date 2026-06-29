/**
 * Generate Homemade-ORIGINAL surface-embroidery designs from the design registry
 * (motifs/designs.ts), each run through the identical method (motifs/METHOD.md):
 *
 *   build() -> composeDesign() -> *.pattern.json
 *                              -> colour guide + transfer template (Step-3 validate)
 *                              -> clean illustration
 *               --render -> renderHero (Blender+Fal) finished-item proof
 *
 *   cd apps/web && npx tsx scripts/needlework-generate.ts [slug ...] [--render]
 *   (no slug = every design; --render also produces the loom hero)
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

import { DESIGNS, composeDesign } from '../src/lib/needlework/motifs'
import { buildPatternDocument } from '../src/lib/needlework/engine/document'
import { patternToGuideSvg } from '../src/lib/needlework/engine/guide'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(__dirname, '../../../.loom-scratch/needlework')

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true })
  const args = process.argv.slice(2)
  const render = args.includes('--render')
  const slugs = args.filter((a) => !a.startsWith('--'))
  const designs = slugs.length ? DESIGNS.filter((d) => slugs.includes(d.slug)) : DESIGNS

  for (const d of designs) {
    const pattern = composeDesign(d)
    const doc = buildPatternDocument(pattern.stitchedElements, pattern.finishedSizeMm, { title: d.name })
    console.log(
      `\n[${d.slug}] ${d.name} — ${pattern.stitchedElements.length} elements · ${doc.flossKey.length} DMC colours · ` +
        `${doc.stitchKey.length} stitch types · ${pattern.finishedSizeMm.width}×${Math.round(pattern.finishedSizeMm.height)}mm`,
    )

    const fixture = {
      name: d.name,
      slug: d.slug,
      description: d.description,
      designer: 'homemade-needlework',
      discipline: 'SURFACE_EMBROIDERY',
      patternFormat: 'SURFACE_VECTOR',
      frameType: pattern.frameType,
      fabricSpec: pattern.fabricSpec,
      defaultThread: pattern.defaultThread,
      threadTypes: ['stranded-cotton'],
      finishedSizeMm: pattern.finishedSizeMm,
      tameWarm: d.tameWarm,
      stitchedElements: pattern.stitchedElements,
    }
    writeFileSync(resolve(OUT, `${d.slug}.pattern.json`), JSON.stringify(fixture, null, 2))

    await sharp(Buffer.from(doc.colourGuideSvg)).resize({ width: 1000 }).png().toFile(resolve(OUT, `${d.slug}.colour-guide.png`))
    await sharp(Buffer.from(doc.technicalChartSvg)).resize({ width: 1000 }).png().toFile(resolve(OUT, `${d.slug}.template.png`))
    const illo = patternToGuideSvg(pattern.stitchedElements, pattern.finishedSizeMm, {
      mode: 'colour',
      background: pattern.fabricSpec?.colourHex ?? '#ece4d2',
      directionHints: false,
    })
    await sharp(Buffer.from(illo)).resize({ width: 1000 }).png().toFile(resolve(OUT, `${d.slug}.illustration.png`))
    console.log(`[${d.slug}] line drawings -> ${d.slug}.colour-guide.png / .template.png / .illustration.png`)

    if (render) {
      const { renderHero } = await import('./loom-render-hero')
      console.log(`[${d.slug}] rendering finished-item proof (Blender + Fal)…`)
      const hero = await renderHero(
        {
          name: d.slug,
          stitchedElements: pattern.stitchedElements,
          finishedSizeMm: pattern.finishedSizeMm,
          fabricHex: pattern.fabricSpec?.colourHex ?? undefined,
          frameType: pattern.frameType,
          defaultThread: pattern.defaultThread,
          strands: 6,
        },
        { persist: false, tameWarm: d.tameWarm },
      )
      console.log(`[${d.slug}] finished proof -> ${hero.localHeroPath} (${hero.pathTaken.kind})`)
    }
  }
}

main().catch((e) => {
  console.error('[needlework-generate] FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e))
  process.exit(1)
})
