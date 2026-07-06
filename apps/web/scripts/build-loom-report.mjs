import fs from 'node:fs'

const dir = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/loom-stitch-engine/.loom-scratch/crochet'
const out = 'C:/Users/Rebecca/AppData/Local/Temp/claude/C--Users-Rebecca-Projects-code-homemade--claude-worktrees-suspicious-ptolemy-8b8a92/9c755188-bb4e-4d4c-9437-abee84dc3688/scratchpad/loom-report.html'

const b64 = (name) => fs.readFileSync(`${dir}/${name}`).toString('base64')

const scblo = b64('report-scblo.jpg')
const scflo = b64('report-scflo.jpg')
const postrib = b64('report-postrib.jpg')

const css = `
@font-face {
  font-family: 'Iosevka Web';
  src: local('Iosevka');
}
:root {
  --ink: #26231f;
  --paper: #efece4;
  --panel: #ffffff;
  --line: #d9d3c4;
  --wool: #b8763f;
  --wool-dark: #8a5628;
  --ok: #3d6b4f;
  --no: #9a3a2e;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: -apple-system, "Segoe UI", "Inter", Arial, sans-serif;
  line-height: 1.5;
}
.wrap {
  max-width: 980px;
  margin: 0 auto;
  padding: 48px 24px 96px;
}
header {
  margin-bottom: 40px;
  border-bottom: 2px solid var(--ink);
  padding-bottom: 20px;
}
header .eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: var(--wool-dark);
  font-weight: 600;
}
header h1 {
  font-size: 30px;
  margin: 6px 0 8px;
  text-wrap: balance;
}
header p {
  margin: 0;
  color: #55504a;
  max-width: 65ch;
}
.stitch-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 4px;
  margin-bottom: 32px;
  overflow: hidden;
}
.stitch-card .head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  border-bottom: 1px solid var(--line);
}
.stitch-card h2 {
  font-size: 20px;
  margin: 0;
}
.verdict {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 10px;
  border-radius: 100px;
  white-space: nowrap;
}
.verdict.pass { background: #e4efe7; color: var(--ok); }
.verdict.no { background: #f4e4e1; color: var(--no); }
.render {
  display: block;
  width: 100%;
  max-height: 560px;
  object-fit: contain;
  background: #1a1611;
}
.body {
  padding: 20px 22px 22px;
}
.body p { margin: 0 0 10px; }
.body p:last-child { margin-bottom: 0; }
.refline {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed var(--line);
}
.refline a {
  color: var(--wool-dark);
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid var(--wool);
}
.refline a:hover { color: var(--wool); }
.refline .label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8a8477;
}
footer {
  font-size: 13px;
  color: #8a8477;
  margin-top: 8px;
}
`

const card = ({ id, title, img, imgAlt, verdict, verdictText, body, refUrl }) => `
<section class="stitch-card">
  <div class="head">
    <h2>${title}</h2>
    <span class="verdict ${verdict}">${verdictText}</span>
  </div>
  <img class="render" src="data:image/jpeg;base64,${img}" alt="${imgAlt}" />
  <div class="body">
    ${body}
    <div class="refline">
      <span class="label">Reference</span>
      <a href="${refUrl}" target="_blank" rel="noopener">${refUrl}</a>
    </div>
  </div>
</section>
`

const html = `<style>${css}</style>
<div class="wrap">
  <header>
    <div class="eyebrow">Loom stitch engine — reference re-verification</div>
    <h1>scblo / scflo / postrib vs. real swatch photos</h1>
    <p>Our renders (embedded below, full pipeline hero output) compared against the real reference photo each stitch is calibrated against. Reference photos are linked, not embedded — copyright their owners, used only for calibration.</p>
  </header>

  ${card({
    title: 'postrib — front/back post ribbing',
    img: postrib,
    imgAlt: 'Our postrib render: alternating raised and recessed vertical post columns',
    verdict: 'pass',
    verdictText: 'Reads as ribbing',
    body: `
      <p>The alternating front-post/back-post construction shows up clearly as distinct raised, braided-looking vertical columns separated by recessed valleys — the defining feature of post-stitch ribbing, legible at a glance.</p>
      <p>Gap to the reference: ours is more open (visible gaps between columns; the reference's columns pack tight with no gaps between them). The reference is also more of a decorative cable/colourwork demo than a plain rib swatch, so it's not a perfect apples-to-apples match. Core construction reads correctly.</p>
    `,
    refUrl: 'https://moralefiber.blog/wp-content/uploads/2017/10/fringepost9-1.jpg',
  })}

  ${card({
    title: 'scblo — back-loop-only single crochet',
    img: scblo,
    imgAlt: 'Our scblo render: dense bulky stitch texture, ridge feature not clearly distinct',
    verdict: 'no',
    verdictText: 'Not a clean pass',
    body: `
      <p>Found and fixed a real construction bug: the floating-loop ridge was nudged into place <em>after</em> the yarn was already laid down, which fights the relaxer's distance constraints and gets mostly crushed back — measured at ~0.25 yarn-radii of surviving separation (well under one yarn diameter, effectively invisible). Rebuilt so the proud/tucked split is baked in at creation time with correct constraint lengths; separation roughly tripled to ~0.6 yarn-radii.</p>
      <p>It now shows as a faint band in the render, but still doesn't read as the crisp, distinct ridge line the reference shows — it gets buried in the generally chunky/knotted texture already present in the currently-locked plain <code>sc</code>. Reads as generic bulky crochet, not clearly "back-loop-only." Not calling this done.</p>
    `,
    refUrl: 'https://blog.annettepetavy.com/wp-content/uploads/2020/05/image0101200px-500x375.jpg',
  })}

  ${card({
    title: 'scflo — front-loop-only single crochet',
    img: scflo,
    imgAlt: 'Our scflo render: dense bulky stitch texture, ridge feature not clearly distinct',
    verdict: 'no',
    verdictText: 'Not a clean pass',
    body: `
      <p>Same underlying bug as scblo, plus scflo had the proud/tucked direction hardcoded backwards (built as if every stitch were blo), so it was floating the wrong loop entirely before this fix.</p>
      <p>Same result as scblo after the fix: measurable improvement, still not a clean read against the reference's crisp ridge line.</p>
    `,
    refUrl: 'https://blog.annettepetavy.com/wp-content/uploads/2020/05/image0091200px-500x375.jpg',
  })}

  <footer>Renders downsized to JPEG for this report only; pipeline output (full-res PNG + numeric audit) lives in <code>.loom-scratch/crochet/</code> in the worktree.</footer>
</div>
`

fs.writeFileSync(out, html)
console.log('wrote', out, fs.statSync(out).size, 'bytes')
