/**
 * Concise working steps for the crochet stitch cheat sheet.
 *
 * These are the short, imperative "how to work it" steps — the quick
 * reminder a maker wants mid-pattern — NOT the descriptive `Stitch.notes`
 * (which explains what a stitch is for) and NOT the long teaching
 * tutorials (which cover tension, shaping and variations).
 *
 * The steps describe the physical motion, so they read correctly in
 * either UK or US terminology — only the stitch's *name* changes with the
 * toggle, the motion does not. Authored UK-canonical, so a stitch sits
 * under its UK name: e.g. the "three loops on the hook" method belongs to
 * the TREBLE (UK tr = US dc), while DOUBLE CROCHET (UK dc = US sc) is the
 * shorter two-loop method.
 *
 * Only stitches that belong on a quick card have steps here. Specialty
 * stitches (Tunisian, hairpin, broomstick, crocodile, Irish motif, seams)
 * are full techniques with their own lessons and are intentionally left
 * out — the surfaces fall back to a short note + "how to" link for those.
 *
 * Keyed by the master Stitch slug.
 */

export const STITCH_WORKING_STEPS: Record<string, string[]> = {
  // ── Foundations & basics ──────────────────────────────────────────
  'crochet-chain': [
    'Make a slip knot on the hook.',
    'Yarn over.',
    'Pull the yarn through the loop on the hook. One chain made.',
    'Repeat for the number of chains needed.',
  ],
  'crochet-slip-stitch': [
    'Insert the hook into the next stitch.',
    'Yarn over.',
    'Pull the yarn through both the stitch and the loop on the hook in one motion. One loop remains.',
  ],
  'crochet-double-uk': [
    'Insert the hook under both top loops of the next stitch.',
    'Yarn over.',
    'Pull the yarn through the stitch. Two loops on the hook.',
    'Yarn over.',
    'Pull the yarn through both loops. One loop remains.',
  ],
  'crochet-half-treble': [
    'Yarn over.',
    'Insert the hook under both top loops of the next stitch.',
    'Yarn over.',
    'Pull the yarn through the stitch. Three loops on the hook.',
    'Yarn over.',
    'Pull the yarn through all three loops. One loop remains.',
  ],
  'crochet-treble': [
    'Yarn over.',
    'Insert the hook under both top loops of the next stitch.',
    'Yarn over.',
    'Pull the yarn through the stitch. Three loops on the hook.',
    'Yarn over.',
    'Pull the yarn through the first two loops. Two loops on the hook.',
    'Yarn over.',
    'Pull the yarn through both remaining loops. One loop remains.',
  ],
  'crochet-double-treble': [
    'Yarn over twice.',
    'Insert the hook under both top loops of the next stitch.',
    'Yarn over. Pull the yarn through the stitch. Four loops on the hook.',
    'Yarn over. Pull through the first two loops. Three loops remain.',
    'Yarn over. Pull through the next two loops. Two loops remain.',
    'Yarn over. Pull through the last two loops. One loop remains.',
  ],
  'crochet-triple-treble': [
    'Yarn over three times.',
    'Insert the hook into the next stitch. Yarn over and pull up a loop. Five loops on the hook.',
    'Yarn over and pull through two loops.',
    'Repeat "yarn over, pull through two" three more times until one loop remains.',
  ],
  'crochet-magic-ring': [
    'Wrap the yarn around two fingers to form a ring, crossing the tail over the working yarn.',
    'Insert the hook into the ring, yarn over, and pull up a loop.',
    'Chain one to secure — this does not count as a stitch.',
    'Work the required stitches into the ring, over the tail.',
    'Pull the tail firmly to draw the ring closed.',
  ],
  'crochet-chainless-foundation-treble': [
    'Chain three to begin.',
    'Yarn over, insert the hook into the third chain from the hook, yarn over and pull up a loop.',
    'Yarn over, pull through one loop — this makes the chain at the base.',
    'Yarn over, pull through two loops; yarn over, pull through the last two. One treble with its own foundation chain made.',
    'For the next stitch, work into the chain at the base of the stitch just made, repeating from step two.',
  ],

  // ── Decreases ─────────────────────────────────────────────────────
  'crochet-dc2tog': [
    'Insert the hook into the next stitch, yarn over, and pull up a loop. Two loops on the hook.',
    'Insert the hook into the following stitch, yarn over, and pull up a loop. Three loops on the hook.',
    'Yarn over and pull through all three loops. Two stitches become one.',
  ],
  'crochet-invisible-decrease': [
    'Insert the hook into the front loop only of the next stitch. Two loops on the hook.',
    'Insert the hook into the front loop only of the following stitch. Three loops on the hook.',
    'Yarn over and pull through the first two loops. Two loops on the hook.',
    'Yarn over and pull through both loops. A neat, nearly invisible decrease.',
  ],

  // ── Working into loops ────────────────────────────────────────────
  'crochet-front-loop-only': [
    'Work the stitch as usual, but insert the hook under the front loop only — the loop nearest you — instead of both top loops.',
  ],
  'crochet-back-loop-only': [
    'Work the stitch as usual, but insert the hook under the back loop only — the loop furthest from you — instead of both top loops.',
  ],
  'crochet-third-loop-htr': [
    'Work a half treble, but insert the hook into the third loop — the horizontal bar sitting just behind the two top loops.',
    'This leaves the usual top loops as a visible ridge across the front.',
  ],

  // ── Textured stitches ─────────────────────────────────────────────
  'crochet-bobble': [
    'Into the same stitch, work the stated number of trebles (usually five), stopping each one before its final yarn-over so its last loop stays on the hook.',
    'When all are made, yarn over and pull through every loop on the hook at once.',
    'Push the bobble to the front of the work.',
  ],
  'crochet-popcorn': [
    'Work the stated number of complete trebles into the same stitch (usually five).',
    'Slip the hook out of the last loop.',
    'Insert the hook into the top of the first treble, pick up the dropped loop, and pull it through to draw the group into a raised popcorn.',
  ],
  'crochet-puff': [
    'Yarn over, insert the hook into the stitch, yarn over, and pull up a tall loop.',
    'Repeat into the same stitch three or four times, keeping all the loops on the hook.',
    'Yarn over and pull through all the loops.',
    'Chain one to close the puff.',
  ],
  'crochet-treble-cluster': [
    'Begin each treble of the cluster but stop before its final yarn-over, leaving one loop of each on the hook.',
    'Work them across the stated stitches, or all into one stitch as the pattern says.',
    'Yarn over and pull through all the loops on the hook to join them into a single cluster.',
  ],
  'crochet-granny-cluster': [
    'Into the same space, work three trebles — one classic granny cluster.',
    'Chain one, then work the next cluster of three trebles into the following space.',
  ],
  'crochet-shell': [
    'Work the stated number of trebles (usually five) all into the same stitch or space.',
    'They fan out into a shell. Skip the stitches either side as the pattern directs.',
  ],
  'crochet-v-stitch': [
    'Into the same stitch or space, work one treble.',
    'Chain one (or two, as stated).',
    'Work another treble into the same place. The two trebles form a V.',
  ],
  'crochet-picot': [
    'Chain three (or as stated).',
    'Insert the hook into the third chain from the hook — or back into the base stitch — and work a slip stitch to close it into a small picot.',
  ],
  'crochet-cross-stitch-crochet': [
    'Skip the next stitch and work a treble into the following one.',
    'Work a treble into the skipped stitch, crossing over the front of the first. The two trebles form an X.',
  ],

  // ── Post stitches ─────────────────────────────────────────────────
  'crochet-fpdc': [
    'Yarn over.',
    'Insert the hook from the front, around the post (the vertical bar) of the next stitch, from right to left.',
    'Yarn over, pull up a loop, and finish as a normal stitch. The post sits raised toward you.',
  ],
  'crochet-bpdc': [
    'Yarn over.',
    'Insert the hook from the back, around the post of the next stitch, from right to left.',
    'Yarn over, pull up a loop, and finish as normal. The post is pushed away from you.',
  ],
  'crochet-fptr': [
    'Yarn over twice.',
    'Insert the hook from the front, around the post of the next stitch, from right to left.',
    'Finish as a treble. The taller post stands proud of the fabric.',
  ],
  'crochet-bptr': [
    'Yarn over twice.',
    'Insert the hook from the back, around the post of the next stitch, from right to left.',
    'Finish as a treble. The post recedes behind the fabric.',
  ],
}
