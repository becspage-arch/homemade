import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'C:/Users/Rebecca/Projects/code/homemade/docs/home-repair-bulk-011-briefs'

function findAndFix(nodes, oldStr, newStr) {
  for (const n of nodes) {
    if (n.type === 'text' && n.text && n.text.includes(oldStr)) {
      n.text = n.text.replace(oldStr, newStr)
      return true
    }
    if (n.content && findAndFix(n.content, oldStr, newStr)) return true
  }
  return false
}

const fixes = [
  // File 20: body.content[4] (Step 1, measure the back opening)
  { file: '20-fitting-a-plywood-back-panel-to-open-back-kitchen-cabinets.json',
    old: 'Measure the back opening of the cabinet: width between the inner faces of the side panels, and height between the inner faces of the top and bottom panels. If the cabinet has a rebate, measure the rebate opening (the usable inner dimension). If there is no rebate, the panel will be face-fixed and should be cut to fit exactly between the outer faces of the side, top, and bottom panels; it will then be visible as a face-fixed element on all four edges.',
    fix: 'Measure the width between the inner side panels and the height between the inner top and bottom panels. If the cabinet has a rebate, measure the rebate opening. If there is no rebate, cut the panel to fit between the outer faces of the side, top, and bottom panels. A face-fixed panel will be visible on all four edges.' },
  // Also fix body.content[8] (Step 3 - Apply PVA)
  { file: '20-fitting-a-plywood-back-panel-to-open-back-kitchen-cabinets.json',
    old: 'Apply PVA glue to the rebate (or the rear edges of the side, top, and bottom panels for a face-fixed back). Press the panel into position and check it sits square in the opening; equal diagonals means square. Drive 20 mm panel pins at 150 mm centres around all four edges, keeping the pins 10 mm from the edge to avoid splitting the plywood edge grain. Allow the glue to cure for 2 hours before hanging the cabinet.',
    fix: 'Apply PVA glue to the rebate, or to the rear edges of the side, top, and bottom panels for a face-fixed back. Press the panel in and check it is square: equal diagonals means square. Drive 20 mm panel pins at 150 mm centres around all four edges, keeping pins 10 mm from the edge. Allow the glue to dry for 2 hours before hanging the cabinet.' },

  // File 24: body.content[4] (Step 1, diagnose)
  { file: '24-repairing-a-continuously-running-wc-cistern.json',
    old: 'Lift the cistern lid and look: if water is running out of the overflow (either into the pan via an internal overflow or out through an external overflow pipe), the float valve is the problem; it is not shutting off before the water reaches overflow level. If the cistern fills but water still trickles into the pan, the diaphragm or drop valve seal is the problem; add food dye to the cistern water and watch the pan to confirm the seep before disassembly.',
    fix: 'Lift the cistern lid and look. If water runs out of the overflow into the pan or out through an external pipe, the float valve is the problem: it is not shutting off at the right level. If the cistern fills but water trickles into the pan, the diaphragm or drop valve seal is the problem. Add food dye to the cistern water and watch the pan. If colour appears without flushing, water is seeping through.' },

  // File 30: body.content[8] (Recurring trips)
  { file: '30-understanding-rcd-mcb-and-rcbo-protection-in-a-consumer-unit.json',
    old: 'An MCB that trips repeatedly on the same circuit when no fault is present (no overloaded appliance, no short circuit) may be undersized for the load. An RCD that trips for no apparent reason (nuisance tripping) may be detecting very small genuine leakage across several appliances cumulatively: older electric cooker elements, washing machine heater elements, and submersible pump motors are common sources. An electrician can measure the total leakage current on the circuit before condemning the RCD.',
    fix: 'An MCB that trips repeatedly on the same circuit may be undersized for the load. An RCD that trips for no clear reason (nuisance tripping) may be picking up very small leakage from several appliances combined. Old cooker elements, washing machine heater elements, and submersible pump motors are common sources. An electrician can measure the total leakage current before the RCD is condemned.' },

  // File 37: body.content[10] (Matte versus gloss)
  { file: '37-applying-polyurethane-varnish-to-bare-wood-furniture.json',
    old: 'Gloss polyurethane gives the hardest film; matte and satin versions contain matting agents that slightly reduce the film hardness. Use the matte or satin finish on the final coat only; the intermediate coats can be gloss regardless of the final finish, as the final coat\'s sheen level is what the viewer sees. Apply a matte final coat over gloss intermediate coats for maximum durability with a low-sheen appearance.',
    fix: 'Gloss polyurethane gives the hardest film. Matte and satin versions contain matting agents that reduce hardness slightly. Use the matte or satin finish on the final coat only. The intermediate coats can be gloss regardless of the final finish. Only the last coat\'s sheen is visible. A matte final coat over gloss intermediate coats gives maximum durability with a low sheen.' },
  // Also fix body.content[8] - 'cured' that might still be there
  { file: '37-applying-polyurethane-varnish-to-bare-wood-furniture.json',
    old: 'Sand the cured first coat lightly with 240-grit',
    fix: 'Sand the dried first coat lightly with 240-grit' },

  // File 40: body.content[4] (Step 1, when to use shellac)
  { file: '40-applying-shellac-sanding-sealer-before-varnishing-or-painting.json',
    old: 'Apply a shellac sealer before any topcoat when: (1) the timber has knots or resin streaks (which bleed through paint and varnish); (2) a stain has been applied and a water-based topcoat follows; (3) multiple incompatible products need separating; or (4) the timber is very porous (open-grained oak, ash, or mahogany) and a more uniform base is needed before a finish that relies on a level surface.',
    fix: 'Apply shellac before any topcoat when: the timber has knots or resin streaks that bleed through paint or varnish; a stain has been applied and a water-based topcoat follows; incompatible products need to be separated; or the timber is very porous (oak, ash, or mahogany) and a more uniform base is needed.' },
]

const fileCache = {}
for (const fix of fixes) {
  if (!fileCache[fix.file]) fileCache[fix.file] = JSON.parse(readFileSync(join(dir, fix.file), 'utf8'))
  const found = findAndFix(fileCache[fix.file].body.content, fix.old, fix.fix)
  console.log((found ? 'FIXED' : 'MISS ') + ': ' + fix.file.slice(0,2) + ' | ' + fix.old.slice(0, 60))
}
for (const [fn, data] of Object.entries(fileCache)) {
  writeFileSync(join(dir, fn), JSON.stringify(data, null, 2), 'utf8')
}
console.log('Done.')
