import fs from 'node:fs'

const dir = 'C:/Users/Rebecca/Projects/code/homemade/.claude/worktrees/loom-stitch-engine/.loom-scratch/crochet'
const out = 'C:/Users/Rebecca/AppData/Local/Temp/claude/C--Users-Rebecca-Projects-code-homemade--claude-worktrees-suspicious-ptolemy-8b8a92/9c755188-bb4e-4d4c-9437-abee84dc3688/scratchpad/loom-post-signoff.html'
const b64 = (name) => fs.readFileSync(`${dir}/${name}`).toString('base64')

const css = `
:root{--ink:#26231f;--paper:#efece4;--panel:#fff;--line:#d9d3c4;--wool:#b8763f;--wool-dark:#8a5628;--ok:#3d6b4f;--note:#9a6a2e}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:-apple-system,"Segoe UI",Inter,Arial,sans-serif;line-height:1.5}
.wrap{max-width:980px;margin:0 auto;padding:48px 24px 96px}
header{margin-bottom:36px;border-bottom:2px solid var(--ink);padding-bottom:20px}
header .eyebrow{text-transform:uppercase;letter-spacing:.08em;font-size:12px;color:var(--wool-dark);font-weight:600}
header h1{font-size:28px;margin:6px 0 8px;text-wrap:balance}
header p{margin:0;color:#55504a;max-width:66ch}
.card{background:var(--panel);border:1px solid var(--line);border-radius:4px;margin-bottom:32px;overflow:hidden}
.card .head{display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:18px 22px;border-bottom:1px solid var(--line)}
.card h2{font-size:20px;margin:0}
.verdict{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:3px 10px;border-radius:100px;white-space:nowrap;background:#e4efe7;color:var(--ok)}
.verdict.caveat{background:#f6ecdb;color:var(--note)}
.card img{display:block;width:100%;max-height:520px;object-fit:contain;background:#1a1611}
.body{padding:20px 22px 22px}
.body p{margin:0 0 10px}
.refline{display:flex;align-items:center;gap:10px;margin-top:14px;padding-top:14px;border-top:1px dashed var(--line)}
.refline a{color:var(--wool-dark);font-weight:600;text-decoration:none;border-bottom:1px solid var(--wool)}
.refline .label{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#8a8477}
footer{font-size:13px;color:#8a8477;margin-top:8px}
`

const card = ({ title, img, verdict, vclass, body, ref }) => `
<section class="card">
  <div class="head"><h2>${title}</h2><span class="verdict ${vclass || ''}">${verdict}</span></div>
  <img src="data:image/jpeg;base64,${img}" alt="${title}" />
  <div class="body">${body}
    <div class="refline"><span class="label">Reference</span><a href="${ref}" target="_blank" rel="noopener">${ref}</a></div>
  </div>
</section>`

const html = `<style>${css}</style>
<div class="wrap">
  <header>
    <div class="eyebrow">Loom stitch engine — post-stitch sign-off</div>
    <h1>fpdc / bpdc / postrib vs. reference</h1>
    <p>The three post-stitch swatches, each now compared against a clean single-stitch reference (the old shared reference was a colourwork-cable photo). Our renders embedded; references linked. All at the standard 2.4 gauge.</p>
  </header>

  ${card({
    title: 'fpdc — front-post double crochet',
    img: b64('report-fpdc.jpg'),
    verdict: 'reads correctly',
    body: `<p>Raised vertical posts standing proud as distinct twisted columns, with horizontal step-bars between rows — the front-post signature. The posts pop forward exactly as fpdc should.</p>`,
    ref: 'https://www.acrochetedsimplicity.com/wp-content/uploads/2017/01/fpdc-7-1024x683.jpg',
  })}

  ${card({
    title: 'bpdc — back-post double crochet',
    img: b64('report-bpdc.jpg'),
    verdict: 'reads correctly',
    body: `<p>The posts recede to the back, so the front is dominated by the horizontal step-bars with the posts sunk behind them — the opposite of fpdc, and correct for back-post. The fp/bp distinction is subtle in isolation (as it is in a real all-one-type swatch); its whole point is the contrast you see in postrib and basketweave.</p>`,
    ref: 'https://theloopholefox.com/wp-content/uploads/2022/09/Back-Post-Double-Crochet-12.jpg',
  })}

  ${card({
    title: 'postrib — 1×1 front/back post ribbing',
    img: b64('report-postrib-final.jpg'),
    verdict: 'reads as ribbing · one caveat',
    vclass: 'caveat',
    body: `<p>Alternating fpdc/bpdc columns: raised ribs next to recessed valleys read clearly as post-stitch ribbing — the fp/bp contrast doing its job. <b>Caveat:</b> ours is more open than a tightly-packed real rib (the reference's columns touch with no gaps; ours shows daylight between them). It's recognisably ribbing, just a looser gauge — the one thing short of the reference.</p>`,
    ref: 'https://doradoes.co.uk/wp-content/uploads/2021/04/double-front-post-back-post-dc-rib-1024x1024.jpg',
  })}

  <footer>Renders downsized to JPEG for this report; full-res PNG + numeric audit in <code>.loom-scratch/crochet/</code>. Proposed: lock all three (consistent with the locked dc bar); postrib carries the open-gauge caveat.</footer>
</div>`

fs.writeFileSync(out, html)
console.log('wrote', out, fs.statSync(out).size, 'bytes')
