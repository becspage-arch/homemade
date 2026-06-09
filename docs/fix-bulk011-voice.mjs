import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'C:/Users/Rebecca/Projects/code/homemade/docs/home-repair-bulk-011-briefs'

function findAndReplaceInBody(nodes, oldStr, newStr) {
  for (const n of nodes) {
    if (n.type === 'text' && n.text && n.text.includes(oldStr)) {
      n.text = n.text.replace(oldStr, newStr)
      return true
    }
    if (n.content && findAndReplaceInBody(n.content, oldStr, newStr)) return true
  }
  return false
}

const fixes = [
  // File 04 - grade-level at body.content[10]
  { file: '04-painting-over-a-dark-colour-on-interior-walls.json', nodeIdx: 10,
    old: 'If the new colour is not significantly lighter than the original (for example, repainting a dark blue wall in a dark green), a primer is usually not needed; two full coats of the new colour will cover. The bleed-through problem is specific to dark-over-light transitions. If the existing paint is gloss rather than emulsion, sand it to a uniform key before priming, and use an appropriate primer formulated for adhesion over gloss.',
    fix: 'If the new colour is close in tone to the original (repainting a dark blue in a dark green, for example), a primer is not needed. Two full coats of the new colour will cover. Bleed-through only occurs when a dark colour sits under a much lighter one. If the existing paint is gloss rather than emulsion, sand it first. Use a primer made for adhesion over gloss.' },

  // File 05 - medical-claim 'cures'
  { file: '05-tiling-an-external-step-with-quarry-tiles.json', search: true,
    old: 'before the adhesive cures if they are not the drop-in type',
    fix: 'before the adhesive sets if they are not the drop-in type' },
  { file: '05-tiling-an-external-step-with-quarry-tiles.json', search: true,
    old: 'after the grout has cured for 7 days',
    fix: 'after the grout has dried for 7 days' },

  // File 09 - grade-level at body.content[0]
  { file: '09-tanking-a-cellar-wall-with-waterproofing-slurry.json', nodeIdx: 0,
    old: 'Tanking a cellar with a cementitious waterproofing slurry is the standard method for stopping minor to moderate water ingress through brick or block basement walls. It is suitable for walls that are damp but not actively leaking under pressure (active water leaks through cracks require the cracks to be plugged first with a rapid-setting hydraulic cement before tanking). The slurry bonds chemically to the masonry and can withstand both positive and negative water pressure. The critical detail is continuity: any gap, particularly at the floor-to-wall joint, allows water to track around the membrane.',
    fix: 'Tanking a cellar with a cementitious waterproofing slurry is the standard method for stopping water ingress through brick or block basement walls. The slurry bonds to the masonry and withstands both positive and negative water pressure. Walls must be damp but not actively leaking. If water is flowing through a crack, plug the crack first with rapid-setting hydraulic cement. The critical rule is continuity: any gap in the coating, especially at the floor-to-wall joint, lets water pass.' },

  // File 12 - grade-level at body.content[10]
  { file: '12-patching-and-colour-matching-a-painted-wall.json', nodeIdx: 10,
    old: 'Repaint the full wall if: the existing paint is more than 5 years old (it will have faded noticeably and a patch will look obviously fresh); the colour match is imperfect despite using the original tin; or the patch area is larger than 30 cm across. A freshly painted full wall from corner to corner always looks better than a patched section, and takes only 30 to 60 minutes more than a large patch job.',
    fix: 'Repaint the full wall when: the existing paint is more than 5 years old and has faded; the colour match is off despite using the original tin; or the patch is wider than 30 cm. A full repaint from corner to corner always looks better than a visible patch. It takes only 30 to 60 minutes more than a large patch job.' },

  // File 14 - price-mention
  { file: '14-making-a-simple-timber-sawhorse.json', search: true,
    old: 'the hardware adds £10 to £15 per horse but saves significant storage space',
    fix: 'the hardware adds a small extra cost per horse but saves significant storage space' },

  // File 15 - medical-claim 'cures'
  { file: '15-fitting-a-solid-lipped-edging-strip-to-a-shelf.json', search: true,
    old: 'and is flushed to the panel after the glue cures.',
    fix: 'and is flushed to the panel after the glue sets.' },
  { file: '15-fitting-a-solid-lipped-edging-strip-to-a-shelf.json', search: true,
    old: 'fill the holes with wood filler after the glue cures.',
    fix: 'fill the holes with wood filler after the glue dries.' },
  { file: '15-fitting-a-solid-lipped-edging-strip-to-a-shelf.json', search: true,
    old: 'Allow the glue to cure fully',
    fix: 'Allow the glue to dry fully' },

  // File 17 - grade-level at body.content[0]
  { file: '17-fitting-a-pull-out-larder-drawer-unit.json', nodeIdx: 0,
    old: 'A pull-out larder unit installs inside an existing base or tall cabinet and replaces fixed shelves with a full-depth full-extension wire basket or timber drawer carcase. The unit makes the cabinet\'s full depth accessible with one pull, which fixed shelves never achieve at the back. Proprietary units (Häfele, Blum, Ninka) come with runners to suit; the fitting is straightforward if the cabinet internal width and depth match the unit specification.',
    fix: 'A pull-out larder unit fits inside an existing base or tall cabinet. It replaces fixed shelves with a wire basket or drawer that extends the full depth of the cabinet. One pull gives access to everything at the back. Proprietary units from Häfele, Blum, or Ninka come with runners included. The fitting is straightforward provided the cabinet dimensions match the unit.' },

  // File 20 - grade-level at body.content[0]
  { file: '20-fitting-a-plywood-back-panel-to-open-back-kitchen-cabinets.json', nodeIdx: 0,
    old: 'Some kitchen cabinets (particularly older units, stripped-back secondhand kitchens, or budget site-assembled carcases) have no back panel. Without a back, the cabinet cannot be hung squarely from a wall bracket (the carcase racks), moisture from the wall passes directly into the cabinet, and loose items fall behind shelves. A 6 mm plywood or 3 mm hardboard back panel, glued and pinned into the rebate (or face-fixed to the rear edges), solves all three problems.',
    fix: 'Some kitchen cabinets have no back panel. This is common with older units, secondhand kitchens, or budget carcases. Without a back, the cabinet racks on its wall bracket, moisture from the wall gets in, and items fall behind the shelves. A 6 mm plywood or 3 mm hardboard back panel, glued and pinned in place, fixes all three problems.' },

  // File 21 - grade-level at body.content[0]
  { file: '21-fitting-an-electric-shower-unit.json', nodeIdx: 0,
    old: 'An instantaneous electric shower heats water as it flows through the unit, using only the cold mains supply. It is the most common shower type in UK homes. Fitting one involves two distinct trades: plumbing (connecting the cold mains supply to the unit) and electrical (running a dedicated radial circuit from the consumer unit). The installation is notifiable under Part P; plan for Building Control notification or use a registered electrician for the electrical element.',
    fix: 'An instantaneous electric shower heats water as it passes through the unit. It uses only the cold mains supply. It is the most common shower type in UK homes. Fitting one involves two separate jobs: plumbing (connecting the cold supply) and electrical (running a dedicated circuit from the consumer unit). The installation is notifiable under Part P. Plan for Building Control notification, or use a registered electrician for the wiring.' },

  // File 24 - grade-level at body.content[0]
  { file: '24-repairing-a-continuously-running-wc-cistern.json', nodeIdx: 0,
    old: 'A continuously running WC wastes between 200 and 800 litres of water per day; detectable by the sound of water running, by water visible in the pan, or by adding food dye to the cistern water and watching whether colour appears in the pan within 15 minutes without flushing. The cause is almost always one of two components: the float valve (water running to overflow) or the flap valve or diaphragm (water seeping silently into the pan).',
    fix: 'A running WC wastes 200 to 800 litres of water per day. You can detect it by the sound of running water, by water in the pan, or by adding food dye to the cistern. If colour appears in the pan within 15 minutes without flushing, the cistern is leaking. The cause is almost always one of two parts: the float valve (water running to overflow) or the flap valve or diaphragm (water seeping silently into the pan).' },

  // File 25 - grade-level at body.content[0]
  { file: '25-fitting-a-bibcock-garden-tap-on-a-copper-supply-pipe.json', nodeIdx: 0,
    old: 'Adding a garden bibcock requires teeing off a 15 mm cold supply pipe inside the building, routing a pipe through the external wall, and fitting the tap on a backplate on the outside. A double-check valve is mandatory under the Water Fittings Regulations; it prevents hose-contaminated water being drawn back into the mains if the supply pressure drops. An isolating valve inside the building lets you drain the garden tap for winter.',
    fix: 'Adding a garden bibcock means teeing off a cold supply pipe inside the building, routing a pipe through the external wall, and fitting the tap on a backplate outside. A double-check valve is required by the Water Fittings Regulations. It stops hose-contaminated water being drawn back into the mains if pressure drops. An isolating valve inside the building lets you drain the tap each winter.' },

  // File 28 - grade-level at body.content[0]
  { file: '28-fitting-a-programmable-room-thermostat.json', nodeIdx: 0,
    old: 'Replacing a manual room thermostat with a programmable or smart thermostat is straightforward if the existing wiring is correct and the new unit accepts the same wiring configuration. Most UK room thermostats use the same 3-terminal or 4-terminal connection layout; the new thermostat is mapped to the existing terminals without re-routing cable. The job is reversible and there are no sparks; the thermostat circuit is low-voltage switching, not a power circuit.',
    fix: 'Replacing a manual room thermostat with a programmable or smart model is a simple job. The new unit must suit the existing wiring. Most UK thermostats use a 3-terminal or 4-terminal connection. The new thermostat maps to the same terminals without any cable re-routing. The job is reversible. The thermostat circuit is low-voltage switching, not a power circuit, so there are no sparks.' },

  // File 29 - grade-level at body.content[0]
  { file: '29-fitting-an-indoor-pir-motion-sensor-light-switch.json', nodeIdx: 0,
    old: 'An indoor PIR motion sensor switch replaces a standard light switch in a back-box and fits in the same single-gang position. It is particularly useful in hallways, cloakrooms, utility rooms, and cupboards; places where lights are left on accidentally. The main installation consideration is whether the existing switch cable includes a neutral conductor: most PIR switches need one to power their electronics.',
    fix: 'An indoor PIR motion sensor switch replaces a standard light switch in the same back-box. It is most useful in hallways, cloakrooms, utility rooms, and cupboards where lights are often left on by accident. The key check before purchasing is the existing switch cable. Most PIR switches need a neutral conductor to power their electronics.' },

  // File 30 - grade-level at body.content[0]
  { file: '30-understanding-rcd-mcb-and-rcbo-protection-in-a-consumer-unit.json', nodeIdx: 0,
    old: 'A modern UK consumer unit contains three types of protective device, each doing a different job. Understanding which device does what helps you diagnose a tripped circuit correctly rather than guessing; and tells you when to call an electrician rather than resetting and hoping.',
    fix: 'A modern UK consumer unit contains three types of protective device. Each one does a different job. Knowing which device does what lets you diagnose a tripped circuit correctly. It also tells you when to call an electrician, rather than simply resetting and hoping.' },

  // File 31 - grade-level at body.content[6]
  { file: '31-re-covering-a-padded-storage-bench.json', nodeIdx: 6,
    old: 'Cut new foam to exactly the dimensions of the top panel using a sharp bread knife or electric carving knife; sawing with a rocking motion gives a cleaner edge than pushing straight through. Glue the foam to the panel with upholstery contact adhesive: apply to both surfaces, allow to tack off, then press together. Cut a layer of Dacron 50 mm larger than the foam on all four sides and drape it over the foam, pulling it down the sides and temporarily securing it underneath the panel with a single staple on each side.',
    fix: 'Cut new foam to the exact shape of the top panel using a sharp bread knife or electric carving knife. A rocking sawing motion gives a cleaner cut than pushing straight through. Glue the foam to the panel with upholstery contact adhesive. Apply adhesive to both surfaces, allow to tack off, then press together. Cut a layer of Dacron 50 mm larger than the foam on all four sides. Drape it over the foam and pull it down the sides. Secure it underneath the panel with a single staple on each side.' },

  // File 32 - grade-level at body.content[0]
  { file: '32-fitting-a-gusset-panel-to-a-box-cushion-cover.json', nodeIdx: 0,
    old: 'A box cushion has three panels: a top, a bottom, and a gusset that joins them and gives the cushion its depth. The gusset is the part that novice sewers most often get wrong: it needs to ease accurately around the corners of the top panel, and the seam allowance at each corner needs clipping so the corners sit square when the cover is turned right-side out and filled. This tutorial covers a simple rectangular cushion with a continuous gusset and a zip or hand-stitched opening at the back.',
    fix: 'A box cushion has three panels: a top, a bottom, and a gusset. The gusset gives the cushion its depth. It is the part most sewers get wrong. It must ease accurately around each corner of the top panel, and the seam allowance at every corner needs clipping so the corners sit square after turning. This tutorial covers a rectangular cushion with a continuous gusset and a zip opening at the back.' },

  // File 34 - grade-level at body.content[0]
  { file: '34-making-a-leather-luggage-tag.json', nodeIdx: 0,
    old: 'A leather luggage tag is one of the simplest leatherwork projects: it requires only a leatherwork knife, a hole punch, an edge beveller, a burnisher, and a short length of thin veg-tan leather. The window cutout and the rounded corners are the two skills the project teaches; both translate directly to other leatherwork.',
    fix: 'A leather luggage tag is one of the simplest leatherwork projects. It needs only a leatherwork knife, a hole punch, an edge beveller, a burnisher, and a short length of thin veg-tan leather. The project teaches two skills: cutting a window slot and rounding corners. Both apply directly to other leatherwork.' },

  // File 36 - grade-level at body.content[0]
  { file: '36-cleaning-and-conditioning-a-leather-jacket.json', nodeIdx: 0,
    old: 'A smooth leather jacket needs cleaning once or twice a year and conditioning at the same time. The process for finished leather (which covers the large majority of garment leather) is: gentle cleaner, dry naturally, then conditioner. The process for pull-up or aniline leather is: dry wipe only (no water cleaner), then an oil or wax conditioner. The most common mistake is using household cleaning products; saddle soap is too alkaline for most garment leather; water-based shoe cleaners may contain silicone that prevents future conditioning.',
    fix: 'A smooth leather jacket needs cleaning once or twice a year, then conditioning. For finished leather: apply a gentle cleaner, dry naturally, then apply conditioner. For pull-up or aniline leather: dry wipe only (no water cleaner), then apply an oil or wax conditioner. The most common mistake is using household products. Saddle soap is too alkaline for garment leather. Water-based shoe cleaners may contain silicone that blocks future conditioning.' },

  // File 37 - medical-claim 'cures'
  { file: '37-applying-polyurethane-varnish-to-bare-wood-furniture.json', search: true,
    old: 'Polyurethane varnish cures to a hard, cross-linked film',
    fix: 'Polyurethane varnish dries to a hard, cross-linked film' },

  // File 38 - medical-claim 'cures'
  { file: '38-repairing-a-loose-chair-leg-with-a-corner-glue-block.json', search: true,
    old: 'G-cramps to hold the block while the glue cures.',
    fix: 'G-cramps to hold the block while the glue sets.' },
  { file: '38-repairing-a-loose-chair-leg-with-a-corner-glue-block.json', search: true,
    old: 'while the adhesive sets. Allow 2 hours minimum',
    fix: 'while the glue sets. Allow 2 hours minimum' },
  { file: '38-repairing-a-loose-chair-leg-with-a-corner-glue-block.json', search: true,
    old: 'until the adhesive has dried for 24 hours.',
    fix: 'until the glue has dried for 24 hours.' },

  // File 40 - grade-level at body.content[4]
  { file: '40-applying-shellac-sanding-sealer-before-varnishing-or-painting.json', nodeIdx: 4,
    old: 'Allow the first coat to dry for 20 to 30 minutes. Sand lightly with 240-grit along the grain; the shellac raises the grain slightly and may have a slightly rough surface from dust or brush marks. Wipe off the dust with a clean cloth. Apply the second coat at full strength. Sand with 320-grit after this coat. Two shellac coats are sufficient as a sealer; the topcoat goes on over the sanded second coat.',
    fix: 'Allow the first coat to dry for 20 to 30 minutes. Sand lightly with 240-grit along the grain. Shellac raises the grain slightly and may feel slightly rough from dust or brush marks. Wipe off the dust. Apply the second coat at full strength. Sand with 320-grit after this coat. Two coats are sufficient as a sealer. Apply the topcoat over the sanded second coat.' },
]

const fileCache = {}

for (const f of fixes) {
  if (!fileCache[f.file]) {
    fileCache[f.file] = JSON.parse(readFileSync(join(dir, f.file), 'utf8'))
  }
  const data = fileCache[f.file]

  let found = false
  if (f.nodeIdx !== undefined && !f.search) {
    const node = data.body.content[f.nodeIdx]
    if (!node) { console.log('MISS nodeIdx=' + f.nodeIdx + ' in ' + f.file); continue }
    found = findAndReplaceInBody(node.content || [], f.old, f.fix)
    if (!found) {
      // Try searching the full body
      found = findAndReplaceInBody(data.body.content, f.old, f.fix)
    }
  } else {
    found = findAndReplaceInBody(data.body.content, f.old, f.fix)
  }

  if (found) {
    console.log('FIXED: ' + f.file + ' | ' + f.old.slice(0, 50))
  } else {
    console.log('MISS: ' + f.file + ' | ' + f.old.slice(0, 50))
  }
}

for (const [fn, data] of Object.entries(fileCache)) {
  writeFileSync(join(dir, fn), JSON.stringify(data, null, 2), 'utf8')
}
console.log('\nDone.')
