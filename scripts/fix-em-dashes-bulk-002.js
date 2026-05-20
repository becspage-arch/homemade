const fs = require('fs');
const path = require('path');

const BASE = 'C:/Users/Rebecca/Projects/code/homemade/docs/fibre-arts-bulk-002-briefs';

const fixes = [
  ['blending-fibres-on-drum-carder.json',
    ['Blend colours — two-pass method', 'Blend colours using the two-pass method'],
    ['Feeding too fast or too thickly — fibre is jamming the licker-in.', 'Feeding too fast or too thickly: fibre is jamming the licker-in.'],
  ],
  ['combing-fleece-with-hand-combs.json',
    ['Load loosely — about 30 g per pass.', 'Load loosely: about 30 g per pass.'],
    ['front quarter of the tines — do not push the comb deep into the mass on the first pass.', 'front quarter of the tines; do not push the comb deep into the mass on the first pass.'],
  ],
  ['e-spinner-for-beginners.json',
    ['low physical demand — useful for people', 'low physical demand, useful for people'],
    ['even twist insertion — the main learning', 'even twist insertion; the main learning'],
    ['per length of drafted fibre — useful for fine yarn and lace. Slower speed inserts less twist — appropriate for bulky', 'per length of drafted fibre, useful for fine yarn and lace. Slower speed inserts less twist, appropriate for bulky'],
    ['Take-up tension too high — the bobbin is pulling', 'Take-up tension too high: the bobbin is pulling'],
  ],
  ['felting-with-pre-felt-batt.json',
    [' cut to a silhouette — a leaf, a circle, a geometric shape — and placed as an ', ' cut to a silhouette (a leaf, a circle, or a geometric shape) and placed as an '],
  ],
  ['freeform-weaving-frame-loom.json',
    ['with its own conventions — it is not weaving without care but weaving without a predetermined structure.', 'with its own conventions: it is not weaving without care but weaving without a predetermined structure.'],
  ],
  ['half-hitch-left-macrame.json',
    ['the knot does not lock — a slight tug on the working cord will slide it along the carrier.', 'the knot does not lock: a slight tug on the working cord will slide it along the carrier.'],
    ['Direction has been swapped accidentally — one or more knots were tied right over left instead of left over right.', 'Direction has been swapped accidentally: one or more knots were tied right over left instead of left over right.'],
  ],
  ['leno-weave-frame-loom.json',
    ['the twisting is done by hand on each row — no heddle required.', 'the twisting is done by hand on each row, with no heddle required.'],
  ],
  ['log-cabin-weave-rigid-heddle.json',
    ['two B threads together — this breaks the log cabin structure.', 'two B threads together: this breaks the log cabin structure.'],
    ['vice versa — the important thing is consistency, not which is which', 'vice versa: the important thing is consistency, not which is which'],
  ],
  ['navajo-ply-from-singles.json',
    ['The name is a misnomer — it is not a traditional Navajo technique.', 'The name is a misnomer: it is not a traditional Navajo technique.'],
  ],
  ['needle-felted-mushroom-set.json',
    ['Three caps of different sizes — roughly 3 cm, 2.5 cm, and 2 cm in diameter — create', 'Three caps of different sizes (roughly 3 cm, 2.5 cm, and 2 cm in diameter) create'],
    ['Insufficient needling — the core of the cylinder is still loose.', 'Insufficient needling: the core of the cylinder is still loose.'],
    ['Replace broken needles immediately — a broken tip inside the felt is a hazard.', 'Replace broken needles immediately: a broken tip inside the felt is a hazard.'],
  ],
  ['pickup-stick-patterns-rigid-heddle.json',
    ['float patterns — diamonds, chevrons, and spot motifs — without', 'float patterns (diamonds, chevrons, and spot motifs) without'],
    ['Method — spot motif (simplest pickup pattern)', 'Method: spot motif (simplest pickup pattern)'],
    ['below the slot holes — the threads passing through the holes of the heddle are down.', 'below the slot holes: the threads passing through the holes of the heddle are down.'],
  ],
  ['shaping-wet-felted-hat-without-block.json',
    [' stage — once the ', ' stage: once the '],
  ],
  ['soumak-stitch-tapestry.json',
    ['Weft tension too tight — the wrapping pulls the warp inward.', 'Weft tension too tight: the wrapping pulls the warp inward.'],
  ],
  ['spinning-lace-weight-on-wheel.json',
    ['at 30 to 40 WPI — thin enough', 'at 30 to 40 WPI, thin enough'],
    ['to the lightest possible — lace singles are fragile', 'to the lightest possible: lace singles are fragile'],
    ['if allowed to hang free) — this twist relaxes', 'if allowed to hang free), and this twist relaxes'],
  ],
  ['supported-spindle-spinning.json',
    ['different spinning methods — roll against the thigh', 'different spinning methods: roll against the thigh'],
  ],
  ['tablet-weaving-a-basic-band.json',
    ['two colours — one through holes A and B, one through holes C and D — produce', 'two colours (one through holes A and B, one through holes C and D) produce'],
    ['S or Z threading — the direction of the thread as it enters the hole', 'S or Z threading: the direction of the thread as it enters the hole'],
  ],
  ['wet-felted-dryer-balls.json',
    ['the layers are too loose — wind more roving over the top.', 'the layers are too loose: wind more roving over the top.'],
  ],
  ['wet-felted-pebble-soap-dish.json',
    ['with no resist — the shaping happens after fulling', 'with no resist; the shaping happens after fulling'],
    ['pressed between the fingers — a soap dish needs to be fully dense', 'pressed between the fingers: a soap dish needs to be fully dense'],
  ],
  ['wet-felted-vessel-over-balloon.json',
    ['at the very bottom of the balloon — this is where you will release the balloon later.', 'at the very bottom of the balloon; this is where you will release the balloon later.'],
    ['leave the irregular edge as a design feature — many basket-style vessels look intentional', 'leave the irregular edge as a design feature: many basket-style vessels look intentional'],
  ],
  ['woollen-vs-worsted-draw.json',
    ['they are not just different techniques — they start from different fibre preparations.', 'they are not just different techniques; they start from different fibre preparations.'],
    ['depends on the fibre — fine merino woollen draw is soft enough', 'depends on the fibre: fine merino woollen draw is soft enough'],
  ],
];

let totalFixed = 0;
const notFound = [];

for (const [filename, ...replacements] of fixes) {
  const fullpath = path.join(BASE, filename);
  let content = fs.readFileSync(fullpath, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
      totalFixed++;
      console.log('FIXED ' + filename + ': ...' + from.substring(0, 45) + '...');
    } else {
      notFound.push(filename + ': ' + from.substring(0, 50));
    }
  }
  if (changed) fs.writeFileSync(fullpath, content, 'utf8');
}

console.log('\nTotal fixed: ' + totalFixed);
if (notFound.length > 0) {
  console.log('Not found (' + notFound.length + '):');
  notFound.forEach(x => console.log('  ' + x));
}
