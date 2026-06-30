/**
 * Dense 100+ colour showpiece tier on Flux 1.1 Pro.
 *   gate (default): generate Pro art (1 call/slug, cached) + render BOTH denoise
 *                   variants (none / median3) full-size + crop, report counts.
 *   emit <none|median3>: write final <slug>.pro.data.json + <slug>.pro.thumb.png
 *                   for the chosen recipe (consumed by the main publish step).
 *   cd apps/web && npx tsx scripts/xs-pro-showpieces.ts [gate | emit none|median3]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
function loadEnv(p:string){try{for(const l of readFileSync(p,'utf8').split(/\r?\n/)){const m=/^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(l);if(m&&m[1]&&!process.env[m[1]])process.env[m[1]]=m[2]!.replace(/^["']|["']$/g,'')}}catch{}}
loadEnv(process.env.HOMEMADE_ENV_FILE ?? 'C:/Users/Rebecca/Projects/code/homemade/.env.credentials')
import sharp from 'sharp'
import { fluxIllustrationPro } from '@/lib/studio/generation/sources'
import { photoToPatternData } from '@/lib/studio/photo-to-pattern'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { stitchedBoundingBox } from '@/components/studio/chart/render-helpers'
import type { PatternData } from '@homemade/db/pattern'
import { BRIEFS, SRC_SAT, FABRIC, proSizeFor } from './xs-volume-gen'

const DIR = resolve(process.cwd(),'../../.loom-scratch/needlework/volume/M')
const TARGETS=['m-big-fairy-garden','m-big-botanical-garden','m-big-cottage-market']
type Denoise='none'|'median3'

async function proArt(slug:string,prompt:string,w:number,h:number):Promise<Buffer>{
  const p=resolve(DIR,`${slug}.flux-pro.png`)
  if(existsSync(p))return readFileSync(p)
  console.log(`  · Flux 1.1 Pro generating ${slug} …`)
  const src=await fluxIllustrationPro(prompt, proSizeFor(w,h))
  writeFileSync(p,src.buffer);return src.buffer
}
async function convert(slug:string,dn:Denoise){
  const b=BRIEFS.find(x=>x.slug===slug)!
  const raw=await proArt(slug,b.prompt,b.w,b.h)
  const base=dn==='median3'?sharp(raw).median(3):sharp(raw)
  const img=await base.modulate({saturation:SRC_SAT[b.style]}).png().toBuffer()
  const {data}=await photoToPatternData(img,{width:b.w,height:b.h,colours:b.colours,fabricCount:14,brand:'DMC',confettiMin:'high',backgroundRemoval:false,maxColours:b.colours,flossRange:'full'})
  data.fabric.colourRgb=FABRIC
  return {b,data}
}
function regionOf(data:PatternData){const bb=stitchedBoundingBox(data);const mg=2;return bb?{x:Math.max(0,bb.minX-mg),y:Math.max(0,bb.minY-mg),width:Math.min(data.grid.width,bb.maxX+1+mg)-Math.max(0,bb.minX-mg),height:Math.min(data.grid.height,bb.maxY+1+mg)-Math.max(0,bb.minY-mg)}:undefined}
async function gateFull(data:PatternData,file:string){const region=regionOf(data);const rw=region?.width??data.grid.width;const cellPx=rw<=70?26:rw<=130?16:10;const svg=renderPatternSvgString(data,{mode:'beauty',cellPx,showSymbols:false,showGrid:false,showCentreCrosshairs:false,padding:Math.round(cellPx*0.8),region});await sharp(Buffer.from(svg)).modulate({saturation:1.3}).resize(1200,1200,{fit:'inside'}).png().toFile(resolve(DIR,file))}
async function crop(data:PatternData,file:string){const cw=64,ch=64,cx=Math.round(data.grid.width/2-cw/2),cy=Math.round(data.grid.height/2-ch/2);const svg=renderPatternSvgString(data,{mode:'beauty',cellPx:15,showSymbols:false,showGrid:false,showCentreCrosshairs:false,padding:10,region:{x:cx,y:cy,width:cw,height:ch}});await sharp(Buffer.from(svg)).modulate({saturation:1.3}).png().toFile(resolve(DIR,file))}
async function thumb(data:PatternData,file:string){const region=regionOf(data);const rw=region?.width??data.grid.width;const cellPx=rw<=70?26:rw<=130?16:10;const svg=renderPatternSvgString(data,{mode:'beauty',cellPx,showSymbols:false,showGrid:false,showCentreCrosshairs:false,padding:Math.round(cellPx*0.8),region});await sharp(Buffer.from(svg)).modulate({saturation:1.3}).resize(1000,1000,{fit:'inside'}).png({quality:90}).toFile(resolve(DIR,file))}

async function main(){
  const mode=process.argv[2]??'gate'
  if(mode==='gate'){
    for(const slug of TARGETS){
      for(const dn of ['none','median3'] as Denoise[]){
        const {b,data}=await convert(slug,dn)
        console.log(`${slug} [${dn}] (${b.w}×${b.h}, asked ${b.colours}) -> ${data.palette.length} distinct flosses`)
        await gateFull(data,`${slug}.PRO-${dn}.png`)
        await crop(data,`${slug}.PRO-${dn}.crop.png`)
      }
    }
  } else if(mode==='emit'){
    const dn=(process.argv[3] as Denoise)??'none'
    for(const slug of TARGETS){
      const {data}=await convert(slug,dn)
      writeFileSync(resolve(DIR,`${slug}.pro.data.json`),JSON.stringify(data))
      await thumb(data,`${slug}.pro.thumb.png`)
      console.log(`emit ${slug} [${dn}] -> ${data.palette.length} flosses · data.json + thumb.png`)
    }
  } else { throw new Error('mode must be gate|emit') }
}
main().catch(e=>{console.error('FAILED:',e instanceof Error?(e.stack??e.message):String(e));process.exit(1)})
