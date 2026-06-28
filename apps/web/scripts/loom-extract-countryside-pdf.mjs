/**
 * Phase A for DMC Countryside (PAT1103S): designer PDF -> our-format pattern.
 *
 * The canonical process (orchestrator): extract VECTOR geometry from the line
 * drawing (page 2) — never rasterise-and-trace — and read stitch + colour from
 * the guides (page 4 legend, page 3 colours, page 1 [stitch][colour] placement
 * labels). Never infer a stitch from a shape; read it from the guide.
 *
 * Output: <out>/countryside.ourformat.json (stitchedElements + metadata) and
 * validation images (geometry line-art + colour line-art) for Step 3.
 *
 *   node scripts/loom-extract-countryside-pdf.mjs "<pdf path>" <outDir>
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
const OPS = pdfjs.OPS
const D = { moveTo: 0, lineTo: 1, curveTo: 2, quad: 3, close: 4 }

const PDF = process.argv[2]
const OUT = resolve(process.argv[3] ?? '../../.loom-scratch/pdf')
mkdirSync(OUT, { recursive: true })

const LETTER_STITCH = { A: 'embroidery-back', B: 'embroidery-detached-chain', C: 'embroidery-french-knot', D: 'embroidery-stem', E: 'embroidery-straight', F: 'embroidery-fern', G: 'embroidery-ribbed-spider-web' }
const NUM_DMC = { 1: 'B5200', 2: '890', 3: '3687', 4: '818', 5: '3345', 6: '211', 7: '988', 8: '581', 9: '740', 10: '972', 11: '3348', 12: '919', 13: '902' }
const DMC_HEX = { B5200: '#fcfcfc', 890: '#243f29', 3687: '#b05a6c', 818: '#f2cdd4', 3345: '#46603a', 211: '#cdbfde', 988: '#74914f', 581: '#9ea03f', 740: '#f0891b', 972: '#fbbe26', 3348: '#bfca84', 919: '#a83c22', 902: '#6e2029' }
const LINE_LETTERS = new Set(['A', 'D', 'E', 'F'])

const mul = (m, n) => [m[0]*n[0]+m[2]*n[1], m[1]*n[0]+m[3]*n[1], m[0]*n[2]+m[2]*n[3], m[1]*n[2]+m[3]*n[3], m[0]*n[4]+m[2]*n[5]+m[4], m[1]*n[4]+m[3]*n[5]+m[5]]
const ap = (m, x, y) => [m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5]]
const bez = (p0, c1, c2, p3, n=6) => { const o=[]; for (let i=1;i<=n;i++){const t=i/n,u=1-t;o.push([u*u*u*p0[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*p3[1]])} return o }

async function pagePaths(doc, pn) {
  const page = await doc.getPage(pn)
  const ol = await page.getOperatorList()
  let ctm = [1,0,0,1,0,0]; const st = []; const paths = []
  for (let k=0;k<ol.fnArray.length;k++){
    const fn = ol.fnArray[k], a = ol.argsArray[k]
    if (fn===OPS.save) st.push(ctm.slice())
    else if (fn===OPS.restore) ctm = st.pop()||[1,0,0,1,0,0]
    else if (fn===OPS.transform) ctm = mul(ctm,a)
    else if (fn===OPS.constructPath){
      const buf = a[1]&&a[1][0]; if(!buf) continue
      let i=0,cur=null
      while(i<buf.length){const op=buf[i++]
        if(op===D.moveTo){const p=ap(ctm,buf[i++],buf[i++]);cur=[p];paths.push(cur)}
        else if(op===D.lineTo){const p=ap(ctm,buf[i++],buf[i++]);if(cur)cur.push(p)}
        else if(op===D.curveTo){const c1=ap(ctm,buf[i++],buf[i++]),c2=ap(ctm,buf[i++],buf[i++]),e=ap(ctm,buf[i++],buf[i++]);if(cur)for(const q of bez(cur[cur.length-1],c1,c2,e))cur.push(q)}
        else if(op===D.quad){const c=ap(ctm,buf[i++],buf[i++]),e=ap(ctm,buf[i++],buf[i++]);if(cur)cur.push(e)}
        else if(op===D.close){if(cur&&cur.length)cur.push(cur[0])}
        else break
      }
    }
  }
  return { paths, page }
}
async function pageLabels(doc, pn) {
  const page = await doc.getPage(pn)
  const t = await page.getTextContent()
  const items = t.items.filter(i=>(i.str||'').trim()).map(i=>({s:i.str.trim(),x:i.transform[4],y:i.transform[5]}))
  // Combine letter + number tokens that are a [A-G] code (some split "A 7", some joined "A5").
  const labels = []
  for (const it of items){
    let m = /^([A-G])\s?(\d{1,2})$/.exec(it.s)
    if (m){ labels.push({ letter:m[1], num:+m[2], x:it.x, y:it.y }); continue }
  }
  // join split letter/number pairs: a lone [A-G] with a nearby lone number
  const lone = items.filter(i=>/^[A-G]$/.test(i.s)).map(i=>({l:i.s,x:i.x,y:i.y}))
  const nums = items.filter(i=>/^\d{1,2}$/.test(i.s)).map(i=>({n:+i.s,x:i.x,y:i.y}))
  for (const L of lone){
    let best=null,bd=1e9
    for (const N of nums){const d=Math.hypot(L.x-N.x,L.y-N.y);if(d<bd){bd=d;best=N}}
    if (best && bd<22) labels.push({ letter:L.l, num:best.n, x:(L.x+best.x)/2, y:(L.y+best.y)/2 })
  }
  return labels
}

const bbox = (pts) => { let X0=1e9,Y0=1e9,X1=-1e9,Y1=-1e9; for(const[x,y]of pts){X0=Math.min(X0,x);Y0=Math.min(Y0,y);X1=Math.max(X1,x);Y1=Math.max(Y1,y)} return {X0,Y0,X1,Y1,w:X1-X0,h:Y1-Y0} }
const centroid = (p) => { let sx=0,sy=0; for(const q of p){sx+=q[0];sy+=q[1]} return [sx/p.length,sy/p.length] }

// Keep the design motif; drop page furniture (border, header/footer rules, the
// DMC logo + social text in the bottom band). The plants are separate clusters,
// so we filter by EXTENT (drop full-page paths) + POSITION (drop the footer/
// header bands), not by "largest cluster".
function keepDesign(paths, pageW, pageH){
  const FOOT = 0.135 * pageH   // y-up: logo + footer text live below this
  const HEAD = 0.90 * pageH    // and the title rule lives above this
  return paths.filter(p=>{
    const b=bbox(p)
    if(b.w>0.8*pageW || b.h>0.8*pageH) return false       // page border / full-width rules
    const c=centroid(p)
    if(c[1] < FOOT || c[1] > HEAD) return false            // footer/logo + header bands
    return true
  })
}

function classify(p, scale){
  const b=bbox(p); const maxmm=Math.max(b.w,b.h)*scale; const minmm=Math.min(b.w,b.h)*scale
  const closed=Math.hypot(p[0][0]-p[p.length-1][0],p[0][1]-p[p.length-1][1])*scale < 0.8
  const aspect=b.w/(b.h||1e-6)
  if(closed && maxmm<3.2) return 'dot'
  if(closed && maxmm>=3.2 && maxmm<=18 && aspect>0.55 && aspect<1.8 && minmm>maxmm*0.45) return 'wheel'
  if(closed && maxmm<9) return 'petal'
  return 'line'
}

async function main(){
  const data=new Uint8Array(readFileSync(PDF))
  const doc=await pdfjs.getDocument({data,isEvalSupported:false,disableFontFace:true,useSystemFonts:false}).promise
  const { paths: rawGeom, page } = await pagePaths(doc, 2)
  const vp=page.getViewport({scale:1})
  const design=keepDesign(rawGeom, vp.width, vp.height)
  const gB=bbox(design.flat())
  // Page-1 carries the placement labels AND the same drawing — but page 1 and
  // page 2 do NOT share coordinates, so align by each page's OWN design bbox.
  const { paths: rawGeom1, page: page1 } = await pagePaths(doc, 1)
  const vp1=page1.getViewport({scale:1})
  const design1=keepDesign(rawGeom1, vp1.width, vp1.height)
  const p1B=bbox(design1.flat())
  const labels=await pageLabels(doc, 1)
  console.log('design paths:',design.length,'of',rawGeom.length,'| p2 bbox:',gB.X0.toFixed(0),gB.Y0.toFixed(0),gB.X1.toFixed(0),gB.Y1.toFixed(0),'| p1 bbox:',p1B.X0.toFixed(0),p1B.Y0.toFixed(0),p1B.X1.toFixed(0),p1B.Y1.toFixed(0))
  console.log('labels:',labels.length, labels.map(l=>`${l.letter}${l.num}`).join(','))

  // scale design width -> 150mm; flip y (PDF y-up -> our y-down)
  const TARGET_W=150
  const scale=TARGET_W/gB.w
  const finishedSizeMm={width:TARGET_W, height:+(gB.h*scale).toFixed(1)}
  const toMM=([x,y])=>[ +((x-gB.X0)*scale).toFixed(2), +((gB.Y1-y)*scale).toFixed(2) ]
  // Map page-1 label coords -> normalized by page-1 design bbox -> page-2 mm space.
  const lab=labels.map(l=>({...l, mx:(l.x-p1B.X0)/p1B.w*TARGET_W, my:(p1B.Y1-l.y)/p1B.h*finishedSizeMm.height}))

  const mmPaths = design.map(p=>p.map(toMM))
  // Deterministic, explicit per-label assignment. No clustering. Each element is
  // typed by its SHAPE (read against the guides) and assigned the nearest label
  // of the matching STITCH CLASS — so a knot can only take a French-knot/daisy
  // colour, a line only a stem/straight/fern/back colour, etc.
  //  - dot   -> nearest C (French knot) or B (lazy-daisy centre)
  //  - wheel -> G12 (the only whipped-wheel label) — the red roses
  //  - petal -> nearest B (lazy daisy)
  //  - line  -> nearest A/D/E/F (back/stem/straight/fern)
  const nearestLabel=(cx,cy,pred)=>{let best=null,bd=1e9;for(const l of lab){if(pred&&!pred(l))continue;const d=Math.hypot(cx-l.mx,cy-l.my);if(d<bd){bd=d;best=l}}return best}
  const gLabel=lab.find(l=>l.letter==='G') || null

  // Explicit plant regions (mm boxes, priority order — first match wins). Each is
  // ONE sprig: line = its stem-green, dot = its flower-knot colour, petal = its
  // lazy-daisy colour, ray = its short straight flower-rays (asters). Read from
  // the page-1 placement labels (page-4 stitches, page-3 colours).
  const REGIONS=[
    { b:[126,150, 20,120], line:'A5', petal:'B5' },               // eucalyptus (hunter green)
    { b:[94,126,  0,98 ], line:'D8', dot:'C4', ray:'E3' },        // asters (moss stems, pink centres, mauve rays)
    { b:[46,102,  0,40 ], line:'E2', dot:'C1' },                  // umbel (dark-green spokes, white knots)
    { b:[70,104, 40,100], line:'D2', dot:'C6' },                  // lily-of-the-valley (dark-green stem, lavender)
    { b:[0,50,   0,148 ], line:'D12', dot:'C13' },               // astilbe (copper stems, garnet berries)
    { b:[40,94,  40,150], line:'F7', dot:'C9', petal:'B10' },     // centre + buttercups (forest stems, tangerine knots, canary daisies)
  ]

  const elements=[]
  const counts={dot:0,wheel:0,petal:0,line:0}
  for(let pi=0; pi<design.length; pi++){
    const p=design[pi]
    const mm=mmPaths[pi]; const [cx,cy]=centroid(mm)
    const b=bbox(mm); const mx=Math.max(b.w,b.h),mn=Math.min(b.w,b.h) // mm (already scaled)
    const closed=Math.hypot(mm[0][0]-mm[mm.length-1][0],mm[0][1]-mm[mm.length-1][1])<0.8
    // Type the element from its shape (mm), read against the stitch guide.
    let cls
    if(!closed) cls='line'
    else if(mx<3.2) cls='dot'                              // French-knot dot
    else if(mx>=5 && mx<=18 && mn>mx*0.6) cls='wheel'      // open-circle rose
    else if(mx<9) cls='petal'                             // small daisy petal loop
    else cls='line'
    counts[cls]++
    // Explicit per-plant region assignment (read from the placement guide). Each
    // sprig is ONE region with ONE stem-green and its flower colour(s), so a sprig
    // can't end up with mixed greens or mixed flower colours. `ray` colours the
    // short straight flower-rays (asters); `line` colours stems/long lines.
    const find=(L,n)=>lab.find(l=>l.letter===L&&l.num===n)
    const inBox=(x,y,b)=>x>=b[0]&&x<=b[1]&&y>=b[2]&&y<=b[3]
    const L=(s)=>find(s[0],+s.slice(1))
    const plen=mm.reduce((s,p,i)=>i?s+Math.hypot(p[0]-mm[i-1][0],p[1]-mm[i-1][1]):0,0)
    let label
    if(cls==='wheel'){ label = gLabel }
    else {
      const reg=REGIONS.find(r=>inBox(cx,cy,r.b))
      if(reg){
        if(cls==='line') label = (reg.ray && plen<11) ? L(reg.ray) : (reg.line?L(reg.line):null)
        else if(cls==='petal') label = reg.petal?L(reg.petal):(reg.dot?L(reg.dot):null)
        else label = reg.dot?L(reg.dot):null   // dot
      }
      // fallback for anything outside the defined regions: nearest compatible label
      if(!label){
        if(cls==='dot') label=nearestLabel(cx,cy,l=>l.letter==='C'||l.letter==='B')
        else if(cls==='petal') label=nearestLabel(cx,cy,l=>l.letter==='B'||l.letter==='C')
        else label=nearestLabel(cx,cy,l=>LINE_LETTERS.has(l.letter))
      }
    }
    if(!label) continue
    const dmc=NUM_DMC[label.num]; const hex=DMC_HEX[dmc]||'#444'
    const stitch=LETTER_STITCH[label.letter]
    if(cls==='dot'){ elements.push({stitchType:'embroidery-french-knot',colourHex:hex,colourRef:`DMC ${dmc}`,thread:null,directionDeg:null,geometry:{kind:'point',at:[+cx.toFixed(2),+cy.toFixed(2)]}}) }
    else if(cls==='wheel'){ const b=bbox(mm); elements.push({stitchType:'embroidery-ribbed-spider-web',colourHex:hex,colourRef:`DMC ${dmc}`,thread:null,directionDeg:null,geometry:{kind:'disc',at:[+cx.toFixed(2),+cy.toFixed(2)],radiusMm:+(Math.max(b.w,b.h)/2).toFixed(2)}}) }
    else if(cls==='petal'){ elements.push({stitchType: label.letter==='B'?'embroidery-detached-chain':'embroidery-french-knot',colourHex:hex,colourRef:`DMC ${dmc}`,thread:null,directionDeg:null,geometry: label.letter==='B'?{kind:'path',points:mm}:{kind:'point',at:[+cx.toFixed(2),+cy.toFixed(2)]}}) }
    else { elements.push({stitchType:stitch,colourHex:hex,colourRef:`DMC ${dmc}`,thread:null,directionDeg:null,geometry:{kind:'path',points:mm}}) }
  }
  console.log('classes:',JSON.stringify(counts),'-> elements:',elements.length)
  const byStitch={}; for(const e of elements)byStitch[e.stitchType]=(byStitch[e.stitchType]||0)+1
  console.log('by stitch:',JSON.stringify(byStitch))

  const out={
    _source:'DMC "Countryside" PAT1103S — INTERNAL licensed fixture. Geometry VECTOR-extracted from page 2; stitch/colour read from pages 1/3/4. Do NOT ship/sell/redistribute.',
    name:'Countryside', designer:'DMC', discipline:'SURFACE_EMBROIDERY', patternFormat:'SURFACE_VECTOR', frameType:'NONE',
    fabricSpec:{material:'natural even-weave linen',colourHex:'#efe9dc',count:null},
    threadTypes:['DMC Perlé Cotton Art. AR115 — No.5 medium'], defaultThread:{type:'perle',weight:'5'},
    finishedSizeMm,
    palette:Object.entries(NUM_DMC).map(([code,dmc])=>({code:+code,dmc,name:dmc,hex:DMC_HEX[dmc],skeins:1})),
    stitchLegend:Object.entries(LETTER_STITCH).map(([letter,stitchId])=>({letter,stitchId,name:stitchId})),
    stitchedElements:elements,
  }
  writeFileSync(resolve(OUT,'countryside.ourformat.json'), JSON.stringify(out))
  console.log('wrote countryside.ourformat.json  finished',finishedSizeMm.width,'x',finishedSizeMm.height,'mm')

  // ---- validation images ----
  const W=finishedSizeMm.width, H=finishedSizeMm.height, PX=6
  const draw=(colourBy)=>{
    let body=''
    for(const e of elements){
      const g=e.geometry; const col=colourBy?e.colourHex:'#1b3a8a'
      if(g.kind==='point') body+=`<circle cx="${g.at[0]*PX}" cy="${g.at[1]*PX}" r="${1.2*PX}" fill="${colourBy?col:'none'}" stroke="${col}" stroke-width="${0.3*PX}"/>`
      else if(g.kind==='disc') body+=`<circle cx="${g.at[0]*PX}" cy="${g.at[1]*PX}" r="${g.radiusMm*PX}" fill="${colourBy?col:'none'}" stroke="${col}" stroke-width="${0.3*PX}"/>`
      else body+=`<polyline points="${g.points.map(([x,y])=>`${(x*PX).toFixed(1)},${(y*PX).toFixed(1)}`).join(' ')}" fill="none" stroke="${col}" stroke-width="${(colourBy?1.4:0.8)*PX*0.3}" stroke-linecap="round"/>`
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W*PX}" height="${H*PX}" viewBox="0 0 ${W*PX} ${H*PX}"><rect width="100%" height="100%" fill="#fff"/>${body}</svg>`
  }
  await sharp(Buffer.from(draw(false))).png().toFile(resolve(OUT,'countryside-validate-geom.png'))
  await sharp(Buffer.from(draw(true))).png().toFile(resolve(OUT,'countryside-validate-colour.png'))

  // SIGN-OFF OVERLAY: the original page-2 line drawing (grey) with every assembled
  // element drawn in its assigned DMC colour + stitch glyph on top — so each
  // element's stitch AND colour can be checked against the original.
  {
    const grey = design.map(p=>`<polyline points="${p.map(toMM).map(([x,y])=>`${(x*PX).toFixed(1)},${(y*PX).toFixed(1)}`).join(' ')}" fill="none" stroke="#cfc8ba" stroke-width="1"/>`).join('')
    let over=''
    for(const e of elements){
      const g=e.geometry, col=e.colourHex
      if(g.kind==='point') over+=`<circle cx="${g.at[0]*PX}" cy="${g.at[1]*PX}" r="${1.3*PX}" fill="${col}" stroke="#3a342a" stroke-width="0.6"/>`
      else if(g.kind==='disc') over+=`<circle cx="${g.at[0]*PX}" cy="${g.at[1]*PX}" r="${g.radiusMm*PX}" fill="${col}" fill-opacity="0.9" stroke="#3a342a" stroke-width="0.8"/>`
      else over+=`<polyline points="${g.points.map(([x,y])=>`${(x*PX).toFixed(1)},${(y*PX).toFixed(1)}`).join(' ')}" fill="none" stroke="${col}" stroke-width="${1.6*PX*0.3}" stroke-linecap="round" stroke-linejoin="round"/>`
    }
    // Linen tint so white (C1) knots are visible for sign-off.
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W*PX}" height="${H*PX}" viewBox="0 0 ${W*PX} ${H*PX}"><rect width="100%" height="100%" fill="#ece6d8"/>${grey}${over}</svg>`
    await sharp(Buffer.from(svg)).png().toFile(resolve(OUT,'countryside-overlay.png'))
    // grid diagnostic — 10mm grid + coord labels, to read plant region boxes
    let grid=''
    for(let x=0;x<=W;x+=20){grid+=`<line x1="${x*PX}" y1="0" x2="${x*PX}" y2="${H*PX}" stroke="#0009" stroke-width="2"/><text x="${x*PX+2}" y="24" font-size="22" font-weight="700" fill="#0000ff">${x}</text>`}
    for(let y=0;y<=H;y+=20){grid+=`<line x1="0" y1="${y*PX}" x2="${W*PX}" y2="${y*PX}" stroke="#0009" stroke-width="2"/><text x="2" y="${y*PX-3}" font-size="22" font-weight="700" fill="#0000ff">${y}</text>`}
    await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W*PX}" height="${H*PX}" viewBox="0 0 ${W*PX} ${H*PX}"><rect width="100%" height="100%" fill="#ece6d8"/>${grey}${over}${grid}</svg>`)).png().toFile(resolve(OUT,'countryside-grid.png'))
  }

  // Diagnostic: the line drawing + every label marker at its mm position, so the
  // per-label regions can be defined against the real geometry.
  {
    let body=''
    for(const p of design){ body+=`<polyline points="${p.map(toMM).map(([x,y])=>`${(x*PX).toFixed(1)},${(y*PX).toFixed(1)}`).join(' ')}" fill="none" stroke="#bbb" stroke-width="1"/>` }
    for(const l of lab){ const x=l.mx*PX,y=l.my*PX; body+=`<circle cx="${x}" cy="${y}" r="9" fill="#fff" stroke="#c00" stroke-width="1.5"/><text x="${x}" y="${y+4}" font-family="sans-serif" font-size="13" font-weight="700" fill="#c00" text-anchor="middle">${l.letter}${l.num}</text>` }
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W*PX}" height="${H*PX}" viewBox="0 0 ${W*PX} ${H*PX}"><rect width="100%" height="100%" fill="#fff"/>${body}</svg>`
    await sharp(Buffer.from(svg)).png().toFile(resolve(OUT,'countryside-labels.png'))
    console.log('mm label positions:', lab.map(l=>`${l.letter}${l.num}@(${l.mx.toFixed(0)},${l.my.toFixed(0)})`).join(' '))
  }
  console.log('wrote validation PNGs')
  process.exit(0)
}
main().catch(e=>{console.error('FAIL',e?.stack||e);process.exit(1)})
