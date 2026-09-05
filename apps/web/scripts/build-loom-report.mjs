import fs from 'node:fs'

const dir = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/loom-stitch-engine/.loom-scratch/crochet'
const out = 'C:/Users/Rebecca/AppData/Local/Temp/claude/C--Users-Rebecca-Projects-code-homemade--claude-worktrees-suspicious-ptolemy-8b8a92/9c755188-bb4e-4d4c-9437-abee84dc3688/scratchpad/loom-report.html'

const b64 = (name) => fs.readFileSync(`${dir}/${name}`).toString('base64')

const scblo = b64('report-scblo-yr2.jpg')
const scflo = b64('report-scflo-yr2.jpg')
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
    <div class="eyebrow">Loom stitch engine — reference re-verification, round 2 (worsted, yr=2.0)</div>
    <h1>scblo / scflo / postrib vs. real swatch photos</h1>
    <p>Round 2: widened the blo/flo ridge split further (committed 922a2a52) and re-rendered at worsted weight with a calmer twist. postrib compared against a cleaner reference. Reference photos are linked, not embedded — copyright their owners, used only for calibration.</p>
  </header>

  ${card({
    title: 'postrib — front/back post ribbing',
    img: postrib,
    imgAlt: 'Our postrib render: alternating raised and recessed vertical post columns',
    verdict: 'pass',
    verdictText: 'Reads as ribbing',
    body: `
      <p>The alternating front-post/back-post construction shows up clearly as distinct raised, braided-looking vertical columns separated by recessed valleys — the defining feature of post-stitch ribbing, legible at a glance.</p>
      <p>Swapped the reference for a clean plain 1x1 fpdc/bpdc rib swatch (the old one was a decorative cable/colourwork demo). Against this fairer reference the density gap is clearer: their columns pack fully tight with zero gaps; ours still shows visible gaps between columns. Core construction still reads correctly — density is the remaining gap.</p>
    `,
    refUrl: 'https://doradoes.co.uk/wp-content/uploads/2021/04/double-front-post-back-post-dc-rib-1024x1024.jpg',
  })}

  ${card({
    title: 'scblo — back-loop-only single crochet (worsted, yr=2.0)',
    img: scblo,
    imgAlt: 'Our scblo render: a distinct raised band of loops now visible mid-swatch',
    verdict: 'no',
    verdictText: 'Closer, not there yet',
    body: `
      <p>Round 1 fixed a real construction bug (the ridge was nudged into place after the yarn was already laid down, so relaxation crushed most of it) and roughly tripled the separation, but it still read as a faint band buried in generic bulk.</p>
      <p>Round 2: widened the split further (verified numerically first — settled gap 0.594yr &rarr; 0.762yr, about 38% of a yarn diameter) and dropped the twist for less fibre noise. This is a real, visible step forward — a genuine raised band of loops now stands out from the surrounding stitches, unlike either earlier attempt. It's heavier and more rope-like than the reference's clean, thin, evenly-spaced ridge line, and it's not equally prominent on every row (strongest in the middle rows). Not calling this done, but it's no longer buried.</p>
    `,
    refUrl: 'https://blog.annettepetavy.com/wp-content/uploads/2020/05/image0101200px-500x375.jpg',
  })}

  ${card({
    title: 'scflo — front-loop-only single crochet (worsted, yr=2.0)',
    img: scflo,
    imgAlt: 'Our scflo render: a distinct raised band of loops now visible',
    verdict: 'no',
    verdictText: 'Closer, not there yet',
    body: `
      <p>Same round-2 fix as scblo (scflo's own numbers came out even better: 0.880yr settled gap). Same result: a genuinely visible raised-loop cluster now reads as a distinct feature, still rope-like rather than a crisp thin ridge, and not even across every row.</p>
    `,
    refUrl: 'https://blog.annettepetavy.com/wp-content/uploads/2020/05/image0091200px-500x375.jpg',
  })}

  <footer>Renders downsized to JPEG for this report only; pipeline output (full-res PNG + numeric audit) lives in <code>.loom-scratch/crochet/</code> in the worktree. This round's Blender renders ran unusually slowly due to CPU contention with a sibling session's concurrent render (resolved partway through, not a bug).</footer>
</div>
`

fs.writeFileSync(out, html)
console.log('wrote', out, fs.statSync(out).size, 'bytes')
