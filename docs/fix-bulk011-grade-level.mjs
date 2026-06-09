import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'C:/Users/Rebecca/Projects/code/homemade/docs/home-repair-bulk-011-briefs'

// Patch individual text nodes (not full paragraph text)
const fixes = [
  // File 09: plain text nodes in para[0]
  { file: '09-tanking-a-cellar-wall-with-waterproofing-slurry.json',
    old: ' is the standard method for stopping minor to moderate water ingress through brick or block basement walls. It is suitable for walls that are damp but not actively leaking under pressure (active water leaks through cracks require the cracks to be plugged first with a rapid-setting hydraulic cement before tanking). The slurry bonds chemically to the masonry and can withstand both ',
    fix: ' stops water ingress through brick or block basement walls. Walls must be damp but not actively leaking. If water flows through a crack, plug it first with rapid-setting hydraulic cement. The slurry bonds to the masonry and resists both ' },
  { file: '09-tanking-a-cellar-wall-with-waterproofing-slurry.json',
    old: '. The critical detail is continuity: any gap, particularly at the floor-to-wall joint, allows water to track around the membrane.',
    fix: '. The critical rule is continuity: any gap in the coating, especially at the floor-to-wall joint, lets water pass.' },

  // File 17: plain text node in para[0] - after the tooltip for 'full-extension'
  { file: '17-fitting-a-pull-out-larder-drawer-unit.json',
    old: ' wire basket or timber drawer carcase. The unit makes the cabinet\'s full depth accessible with one pull, which fixed shelves never achieve at the back. Proprietary units (Häfele, Blum, Ninka) come with runners to suit; the fitting is straightforward if the cabinet internal width and depth match the unit specification.',
    fix: ' wire basket or drawer that extends to the full cabinet depth. One pull gives access to everything at the back. Fixed shelves cannot do this. Units from Häfele, Blum, or Ninka come with runners included. The fitting is straightforward if the cabinet dimensions match the unit.' },

  // File 20: single plain text node
  { file: '20-fitting-a-plywood-back-panel-to-open-back-kitchen-cabinets.json',
    old: 'Some kitchen cabinets (particularly older units, stripped-back secondhand kitchens, or budget site-assembled carcases) have no back panel. Without a back, the cabinet cannot be hung squarely from a wall bracket (the carcase racks), moisture from the wall passes directly into the cabinet, and loose items fall behind shelves. A 6 mm plywood or 3 mm hardboard back panel, glued and pinned into the ',
    fix: 'Some kitchen cabinets have no back panel. This is common with older units, secondhand kitchens, and budget carcases. Without a back, the cabinet racks on its wall bracket, moisture from the wall gets in, and items fall behind shelves. A 6 mm plywood or 3 mm hardboard back panel, glued and pinned into the ' },

  // File 21: opening plain text node
  { file: '21-fitting-an-electric-shower-unit.json',
    old: 'An instantaneous electric shower heats water as it flows through the unit, using only the cold mains supply. It is the most common shower type in UK homes. Fitting one involves two distinct trades: plumbing (connecting the cold mains supply to the unit) and electrical (running a dedicated ',
    fix: 'An instantaneous electric shower heats water as it passes through the unit. It uses only the cold mains supply. It is the most common shower type in UK homes. Fitting one involves two separate jobs: plumbing (connecting the cold supply) and electrical (running a dedicated ' },
  { file: '21-fitting-an-electric-shower-unit.json',
    old: ' from the consumer unit). The installation is ',
    fix: ' from the consumer unit). This installation is ' },
  { file: '21-fitting-an-electric-shower-unit.json',
    old: '; plan for Building Control notification or use a registered electrician for the electrical element.',
    fix: '. Plan for Building Control notification, or use a registered electrician for the wiring.' },

  // File 24: opening plain text node
  { file: '24-repairing-a-continuously-running-wc-cistern.json',
    old: 'A continuously running WC wastes between 200 and 800 litres of water per day; detectable by the sound of water running, by water visible in the pan, or by adding food dye to the cistern water and watching whether colour appears in the pan within 15 minutes without flushing. The cause is almost always one of two components: the ',
    fix: 'A running WC wastes 200 to 800 litres of water per day. You can detect it by the sound of running water, by water in the pan, or by adding food dye to the cistern. If colour appears in the pan within 15 minutes without flushing, the cistern is leaking. The cause is almost always one of two parts: the ' },

  // File 25: second plain text node (after bibcock tooltip)
  { file: '25-fitting-a-bibcock-garden-tap-on-a-copper-supply-pipe.json',
    old: ' is mandatory under the Water Fittings Regulations; it prevents hose-contaminated water being drawn back into the mains if the supply pressure drops. An isolating valve inside the building lets you drain the garden tap for winter.',
    fix: ' is required by the Water Fittings Regulations. It stops hose-contaminated water from being drawn back into the mains if pressure drops. An isolating valve inside the building lets you drain the tap each winter.' },

  // File 28: second plain text node (after 'room-thermostat-wiring' tooltip)
  { file: '28-fitting-a-programmable-room-thermostat.json',
    old: ' is correct and the new unit accepts the same wiring configuration. Most UK room thermostats use the same 3-terminal or 4-terminal connection layout; the new thermostat is mapped to the existing terminals without re-routing cable. The job is reversible and there are no sparks; the thermostat circuit is low-voltage switching, not a power circuit.',
    fix: ' is correct and the new unit accepts the same wiring. Most UK thermostats use a 3-terminal or 4-terminal connection. The new thermostat maps to the existing terminals without re-routing any cable. The job is reversible. The thermostat circuit is low-voltage switching, not a power circuit, so there are no sparks.' },

  // File 29: second plain text node (after PIR sensor tooltip)
  { file: '29-fitting-an-indoor-pir-motion-sensor-light-switch.json',
    old: ' replaces a standard light switch in a back-box and fits in the same single-gang position. It is particularly useful in hallways, cloakrooms, utility rooms, and cupboards; places where lights are left on accidentally. The main installation consideration is whether the existing switch cable includes a ',
    fix: ' replaces a standard light switch in the same back-box. It is most useful in hallways, cloakrooms, utility rooms, and cupboards where lights are often left on by accident. The key check before buying is whether the existing switch cable includes a ' },
  { file: '29-fitting-an-indoor-pir-motion-sensor-light-switch.json',
    old: ': most PIR switches need one to power their electronics.',
    fix: '. Most PIR switches need a neutral wire to power their electronics.' },

  // File 32: second plain text node (between gusset and clipping tooltips)
  { file: '32-fitting-a-gusset-panel-to-a-box-cushion-cover.json',
    old: ' that joins them and gives the cushion its depth. The gusset is the part that novice sewers most often get wrong: it needs to ease accurately around the corners of the top panel, and the seam allowance at each corner needs ',
    fix: ' that gives the cushion its depth. The gusset must ease around the corners of the top panel. The seam allowance at each corner needs ' },
  { file: '32-fitting-a-gusset-panel-to-a-box-cushion-cover.json',
    old: ' so the corners sit square when the cover is turned right-side out and filled. This tutorial covers a simple rectangular cushion with a continuous gusset and a zip or hand-stitched opening at the back.',
    fix: ' so the corners sit square when turned and filled. This tutorial covers a rectangular cushion with a continuous gusset and a zip opening at the back.' },

  // File 34: opening text node and last text node
  { file: '34-making-a-leather-luggage-tag.json',
    old: 'A leather luggage tag is one of the simplest leatherwork projects: it requires only a leatherwork knife, a hole punch, an edge beveller, a burnisher, and a short length of thin veg-tan leather. The ',
    fix: 'A leather luggage tag is one of the simplest leatherwork projects. It needs a leatherwork knife, a hole punch, an edge beveller, a burnisher, and a short piece of thin veg-tan leather. The ' },
  { file: '34-making-a-leather-luggage-tag.json',
    old: ' and the rounded corners are the two skills the project teaches; both translate directly to other leatherwork.',
    fix: ' and rounded corners are the two skills the project teaches. Both apply to other leatherwork.' },

  // File 36: last plain text node (after pull-up-leather tooltip)
  { file: '36-cleaning-and-conditioning-a-leather-jacket.json',
    old: ' is: dry wipe only (no water cleaner), then an oil or wax conditioner. The most common mistake is using household cleaning products; saddle soap is too alkaline for most garment leather; water-based shoe cleaners may contain silicone that prevents future conditioning.',
    fix: ' needs dry wiping only (no water cleaner), then an oil or wax conditioner. The most common mistake is using household cleaning products. Saddle soap is too alkaline for garment leather. Water-based shoe cleaners may contain silicone that blocks future conditioning.' },

  // File 38: remaining 'cures' instances
  { file: '38-repairing-a-loose-chair-leg-with-a-corner-glue-block.json',
    old: 'while the glue cures. Allow 2 hours minimum before testing. Do not load the repaired chair until the glue has cured for 24 hours.',
    fix: 'while the glue sets. Allow 2 hours minimum before testing. Do not load the repaired chair until the glue has dried for 24 hours.' },
  { file: '38-repairing-a-loose-chair-leg-with-a-corner-glue-block.json',
    old: 'so both the injection and the block cure together.',
    fix: 'so both the injection and the block set together.' },

  // File 40: 'cures' instances
  { file: '40-applying-shellac-sanding-sealer-before-varnishing-or-painting.json',
    old: 'Allow the first coat to cure for 20 to 30 minutes.',
    fix: 'Allow the first coat to dry for 20 to 30 minutes.' },
  { file: '40-applying-shellac-sanding-sealer-before-varnishing-or-painting.json',
    old: 'Any topcoat can be applied over cured shellac',
    fix: 'Any topcoat can be applied over dry shellac' },
  { file: '40-applying-shellac-sanding-sealer-before-varnishing-or-painting.json',
    old: 'Allow the shellac to cure for a full hour',
    fix: 'Allow the shellac to dry for a full hour' },
]

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

const fileCache = {}
let fixCount = 0
let missCount = 0

for (const fix of fixes) {
  if (!fileCache[fix.file]) {
    fileCache[fix.file] = JSON.parse(readFileSync(join(dir, fix.file), 'utf8'))
  }
  const data = fileCache[fix.file]
  const found = findAndFix(data.body.content, fix.old, fix.fix)
  if (found) { console.log('FIXED: ' + fix.file.slice(0,2) + ' | ' + fix.old.slice(0,60)); fixCount++ }
  else { console.log('MISS:  ' + fix.file.slice(0,2) + ' | ' + fix.old.slice(0,60)); missCount++ }
}

for (const [fn, data] of Object.entries(fileCache)) {
  writeFileSync(join(dir, fn), JSON.stringify(data, null, 2), 'utf8')
}
console.log(`\nFixed: ${fixCount}, Missed: ${missCount}`)
