import fs from 'node:fs'

const dir = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/loom-stitch-engine/.loom-scratch/crochet'
const out = 'C:/Users/Rebecca/AppData/Local/Temp/claude/C--Users-Rebecca-Projects-code-homemade--claude-worktrees-suspicious-ptolemy-8b8a92/9c755188-bb4e-4d4c-9437-abee84dc3688/scratchpad/loom-crossweight.html'

const b64 = (name) => fs.readFileSync(`${dir}/${name}`).toString('base64')

const css = `
:root{--ink:#26231f;--paper:#efece4;--panel:#fff;--line:#d9d3c4;--wool:#b8763f;--wool-dark:#8a5628;--ok:#3d6b4f}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:-apple-system,"Segoe UI",Inter,Arial,sans-serif;line-height:1.5}
.wrap{max-width:1040px;margin:0 auto;padding:48px 24px 96px}
header{margin-bottom:36px;border-bottom:2px solid var(--ink);padding-bottom:20px}
header .eyebrow{text-transform:uppercase;letter-spacing:.08em;font-size:12px;color:var(--wool-dark);font-weight:600}
header h1{font-size:28px;margin:6px 0 8px;text-wrap:balance}
header p{margin:0;color:#55504a;max-width:66ch}
.stitch{margin-bottom:40px}
.stitch h2{font-size:19px;margin:0 0 4px}
.stitch .lead{margin:0 0 16px;color:#55504a;max-width:70ch}
.stitch .lead a{color:var(--wool-dark);font-weight:600;text-decoration:none;border-bottom:1px solid var(--wool)}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}
@media(max-width:680px){.pair{grid-template-columns:1fr}}
.cell{background:var(--panel);border:1px solid var(--line);border-radius:4px;overflow:hidden}
.cell .cap{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:12px 16px;border-bottom:1px solid var(--line)}
.cell .cap b{font-size:14px}
.cell .cap .w{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#8a8477}
.cell .verdict{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--ok);background:#e4efe7;padding:2px 8px;border-radius:100px;white-space:nowrap}
.cell img{display:block;width:100%;max-height:420px;object-fit:contain;background:#1a1611}
footer{margin-top:8px;font-size:13px;color:#8a8477}
`

const cell = (label, weight, img) => `
<div class="cell">
  <div class="cap"><b>${label}</b><span class="w">${weight}</span><span class="verdict">holds up</span></div>
  <img src="data:image/jpeg;base64,${img}" alt="${label} ${weight}" />
</div>`

const stitch = ({ title, lead, ref, fine, worsted }) => `
<section class="stitch">
  <h2>${title}</h2>
  <p class="lead">${lead} <a href="${ref}" target="_blank" rel="noopener">reference</a></p>
  <div class="pair">
    ${cell(title, 'fine · yr 1.3', fine)}
    ${cell(title, 'worsted · yr 2.0', worsted)}
  </div>
</section>`

const html = `<style>${css}</style>
<div class="wrap">
  <header>
    <div class="eyebrow">Loom stitch engine — cross-weight spot-check</div>
    <h1>Locked sc / dc / ch at fine (1.3) and worsted (2.0)</h1>
    <p>Re-rendering the three locked primitives at the two flanking yarn weights to confirm they still read right away from the standard 2.4 gauge. All six hold their identity. Fine weight generally reads a touch crisper (more stitch definition per bundle); the soft fuzzy-wool look is shared across all of them. Our renders embedded; reference photos linked.</p>
  </header>

  ${stitch({
    title: 'sc — single crochet',
    lead: 'Dense, even rows of tidy V-tops, notches not holes — reads as single crochet at both weights.',
    ref: 'https://eyeloveknots.com/wp-content/uploads/2020/07/EYE_SC.jpg',
    fine: b64('report-sc-fine.jpg'),
    worsted: b64('report-sc-worsted.jpg'),
  })}

  ${stitch({
    title: 'dc — double crochet',
    lead: 'Tall vertical posts standing as distinct columns with horizontal V-bars between rows, correctly more open than sc — the crispest of the set at both weights.',
    ref: 'https://eyeloveknots.com/wp-content/uploads/2020/04/ET_DC_25.jpg',
    fine: b64('report-dc-fine.jpg'),
    worsted: b64('report-dc-worsted.jpg'),
  })}

  ${stitch({
    title: 'ch — foundation chain',
    lead: 'The nested-V plait/braid runs cleanly along its length, each loop’s legs forming the row of V’s a chain shows — consistent at both weights.',
    ref: 'https://eyeloveknots.com/wp-content/uploads/2020/04/ET_HowToChain_05B.jpg',
    fine: b64('report-ch-fine.jpg'),
    worsted: b64('report-ch-worsted.jpg'),
  })}

  <footer>Renders downsized to JPEG for this report; full-res PNG + numeric audit in <code>.loom-scratch/crochet/</code>. These stitches were already locked at yr 2.4 — this is a spot-check that they hold across weights, not a re-lock.</footer>
</div>`

fs.writeFileSync(out, html)
console.log('wrote', out, fs.statSync(out).size, 'bytes')
