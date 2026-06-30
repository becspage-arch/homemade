/** Throwaway: render the DEFAULT cross-stitch browse surface (popularityScore desc,
 *  publishedAt desc) into a contact sheet — what a customer sees first. Run from MAIN. */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
function loadEnvFile(p: string){try{for(const l of readFileSync(p,'utf8').split(/\r?\n/)){const m=/^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(l);if(m&&m[1]&&!process.env[m[1]])process.env[m[1]]=m[2]!.replace(/^["']|["']$/g,'')}}catch{}}
loadEnvFile('C:/Users/Rebecca/Projects/code/homemade/.env.credentials')
import sharp from 'sharp'
import { prisma } from '@homemade/db'

const S = 'C:/Users/Rebecca/AppData/Local/Temp/claude/C--Users-Rebecca-Projects-code-homemade--claude-worktrees-jolly-visvesvaraya-564eb8/a77e9b9e-ee18-4618-899c-bbd75803d8b3/scratchpad'
const CACHE = resolve(S, 'default-view'); mkdirSync(CACHE, { recursive: true })
const BASE = 'https://media.homemade.education'

async function main(){
  const rows = await prisma.pattern.findMany({
    where: { type:'CROSS_STITCH', visibility:'PUBLIC' },
    orderBy: [{ popularityScore: 'desc' }, { publishedAt: 'desc' }],
    take: 36,
    select: { slug:true, name:true, thumbnail:{ select:{ r2Key:true } }, hero:{ select:{ r2Key:true } } },
  })
  const COLS=6, CW=250, IMGH=210, LABELH=26, CH=IMGH+LABELH
  const comps: sharp.OverlayOptions[]=[]; const labels:string[]=[]
  for(let i=0;i<rows.length;i++){
    const r=rows[i]!; const key=r.hero?.r2Key??r.thumbnail?.r2Key; if(!key) continue
    const f=resolve(CACHE, `${r.slug}.png`)
    if(!existsSync(f)){ const res=await fetch(`${BASE}/${key}`); if(res.ok) writeFileSync(f, Buffer.from(await res.arrayBuffer())) }
    if(!existsSync(f)) continue
    const x=(i%COLS)*CW, y=Math.floor(i/COLS)*CH
    const img=await sharp(f).resize(CW-6,IMGH-6,{fit:'contain',background:{r:255,g:255,b:255}}).png().toBuffer()
    const meta=await sharp(img).metadata()
    comps.push({input:img,left:x+3+Math.round(((CW-6)-(meta.width??CW-6))/2),top:y+3})
    const nm=(r.name||r.slug).slice(0,30)
    labels.push(`<rect x="${x}" y="${y+IMGH}" width="${CW}" height="${LABELH}" fill="#1a1a1a"/><text x="${x+5}" y="${y+IMGH+17}" font-family="Arial" font-size="12" fill="#fff">${nm.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`)
  }
  const W=COLS*CW, H=Math.ceil(rows.length/COLS)*CH
  const svg=`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${labels.join('')}</svg>`
  const out=await sharp({create:{width:W,height:H,channels:3,background:{r:250,g:248,b:244}}}).composite([...comps,{input:Buffer.from(svg),left:0,top:0}]).png().toBuffer()
  writeFileSync(resolve(S,'default-view.png'), out)
  console.log('wrote default-view.png ·', rows.length, 'tiles')
  await prisma.$disconnect()
}
main().catch(e=>{console.error('FAIL',e instanceof Error?e.message:String(e));process.exit(1)})
