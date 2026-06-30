/**
 * Publish the Pro dense-showpiece re-renders OVER the existing live rows.
 * Runs from the MAIN checkout (where @homemade/db resolves). Consumes the
 * pre-built artifacts the WORKTREE produced (xs-pro-showpieces.ts emit none):
 *   <VOL>/M/<slug>.pro.data.json  + <slug>.pro.thumb.png
 * Updates ONLY data + metric columns + thumbnail for the existing slug — never
 * touches name / description / subCategory / visibility / heroMediaId.
 *
 *   XS_VOL_DIR=<abs>/.loom-scratch/needlework/volume \
 *   npx tsx apps/web/scripts/xs-publish-pro-showpieces.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
function loadEnv(p:string){try{for(const l of readFileSync(p,'utf8').split(/\r?\n/)){const m=/^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(l);if(m&&m[1]&&!process.env[m[1]])process.env[m[1]]=m[2]!.replace(/^["']|["']$/g,'')}}catch{}}
loadEnv(process.env.HOMEMADE_ENV_FILE ?? 'C:/Users/Rebecca/Projects/code/homemade/.env.credentials')
import sharp from 'sharp'
import { prisma, computePatternMetrics, r2Upload } from '@homemade/db'
import { parsePatternData } from '@homemade/db/pattern'

const VOL = process.env.XS_VOL_DIR ?? resolve(process.cwd(), '.loom-scratch/needlework/volume')
const SLUGS = ['m-big-fairy-garden','m-big-botanical-garden','m-big-cottage-market']
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms))
async function r2UploadRetry(png:Buffer,opts:{prefix:string;filename:string}){let e:unknown;for(let i=0;i<4;i++){try{return await r2Upload(png,'image/png',opts)}catch(err){e=err;await sleep(1500*(i+1))}}throw e}

async function main(){
  const { buildPatternDoc } = await import('@homemade/db/search-docs')
  const { syncPatternDoc } = await import('@homemade/search')
  let done=0; const failed:string[]=[]
  for(const slug of SLUGS){
   try{
    const data = parsePatternData(JSON.parse(readFileSync(resolve(VOL,'M',`${slug}.pro.data.json`),'utf8')))
    const png = readFileSync(resolve(VOL,'M',`${slug}.pro.thumb.png`))
    const existing = await prisma.pattern.findUnique({ where:{ slug }, select:{ id:true, colourCount:true } })
    if(!existing) { failed.push(`${slug} (not live)`); console.log(`[skip] ${slug} not found live`); continue }
    const m = computePatternMetrics(data)
    const meta = await sharp(png).metadata()
    const { key, publicUrl } = await r2UploadRetry(png,{ prefix:'pattern-thumbnails', filename:`${existing.id}.png` })
    const media = await prisma.media.create({ data:{ type:'ILLUSTRATION', mimeType:'image/png', r2Key:key, width:meta.width??1000, height:meta.height??1000, bytes:png.byteLength, status:'READY', source:'original', alt:`${slug} cross-stitch chart` }, select:{ id:true } })
    await prisma.pattern.update({ where:{ id:existing.id }, data:{
      data: data as unknown as object,
      widthCells:m.widthCells, heightCells:m.heightCells, colourCount:m.colourCount, totalStitches:m.totalStitches,
      hasBackstitch:m.hasBackstitch, hasFrenchKnots:m.hasFrenchKnots, hasBeads:m.hasBeads, hasQuarterStitches:m.hasQuarterStitches,
      fabricCountSuggested:data.fabric.count, thumbnailMediaId:media.id,
    }})
    const doc = await buildPatternDoc(existing.id); if(doc) await syncPatternDoc(doc)
    done++
    console.log(`[live] ${slug}: ${existing.colourCount} -> ${m.colourCount} colours · ${m.widthCells}x${m.heightCells} · ${publicUrl}`)
   }catch(e){ failed.push(slug); console.log(`[FAIL] ${slug}: ${e instanceof Error?e.message:String(e)}`) }
  }
  console.log(`updated ${done}/${SLUGS.length}${failed.length?` · failed: ${failed.join(', ')}`:''}`)
  await prisma.$disconnect()
}
main().catch(e=>{console.error('[publish-pro] FAILED:',e instanceof Error?(e.stack??e.message):String(e));process.exit(1)})
