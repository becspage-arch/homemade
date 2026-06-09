// Joiner - describes the technique notes for each common amigurumi
// assembly joint.
//
// Patterns reference the join method by name; the renderer (and the
// author prompt) calls this helper to expand the join into a full
// instruction.

import type { JoinMethod } from './types'

export interface JoinTechnique {
  name: string
  description: string
  whenToUse: string
}

const TECHNIQUES: Record<JoinMethod, JoinTechnique> = {
  LADDER_STITCH: {
    name: 'ladder stitch',
    description: 'Thread the tail through a darning needle. Bring the needle up through a stitch on one piece, then across to the matching stitch on the other piece, alternating side to side as if climbing a ladder. Pull snug every few stitches to draw the seam closed invisibly.',
    whenToUse: 'Invisible seam where two stuffed pieces meet, e.g. attaching a head to a body.',
  },
  MATTRESS_STITCH: {
    name: 'mattress stitch',
    description: 'Place the two pieces side by side with the seam running between them. Thread the needle through one bar of stitches on the left piece, then the matching bar on the right, alternating. Pull snug to close the seam without visible ridges.',
    whenToUse: 'Joining two flat panels side by side, e.g. closing a flat-worked body section.',
  },
  WHIP_STITCH: {
    name: 'whip stitch',
    description: 'Hold the two pieces with the seam edges aligned. Insert the needle through the back loop of one piece then the front loop of the other and pull through. Repeat along the seam.',
    whenToUse: 'Fast functional join where the seam will be hidden under embellishments.',
  },
  SLIP_STITCH: {
    name: 'slip-stitched join',
    description: 'Hold the two pieces together. Insert the hook through both edge stitches at once, yarn over, and pull through both stitches and the loop on the hook in one move.',
    whenToUse: 'Joining two pieces while continuing in yarn, e.g. closing the final round of a sphere or attaching a ring at the join point.',
  },
  PICK_UP_AND_CONTINUE: {
    name: 'picked-up join',
    description: 'Without breaking the yarn, insert the hook into the joining stitch of the second piece, work a single crochet to anchor, then continue working into the second piece.',
    whenToUse: 'Seamless transition from one piece directly into another, e.g. continuing from torso into head without a separate join step.',
  },
}

export function describeJoin(method: JoinMethod): JoinTechnique {
  const t = TECHNIQUES[method]
  if (!t) throw new Error(`Unknown join method: ${method}`)
  return t
}

export function listJoinMethods(): JoinMethod[] {
  return Object.keys(TECHNIQUES) as JoinMethod[]
}
