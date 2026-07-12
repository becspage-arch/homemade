/**
 * Amigurumi COMPOSITION proofs — build 2 Part B. Real finished 3D objects
 * assembled from the locked round/sphere builders: each part is a genuinely
 * stitched, audit-gated crocheted ball; the composition layer stacks them into
 * one staged object (as a real amigurumi is several pieces sewn together).
 *
 * Run through scripts/loom-pattern.ts (the same pipeline as the flat proofs):
 *   cd apps/web && npx tsx scripts/loom-pattern.ts amigurumi-ball [yr] [--no-hero]
 *   cd apps/web && npx tsx scripts/loom-pattern.ts amigurumi-creature [yr] [--no-hero]
 */

import type { CompositionProgram } from '../src/lib/loom/crochet/engine/composition'

// The canonical audit-clean ball (equator 30) — the proof-ball profile.
const BODY = [6, 12, 18, 24, 30, 30, 30, 30, 30, 24, 18, 12, 6]
// A smaller ball for a head (equator 18).
const HEAD = [6, 12, 18, 18, 18, 12, 6]
// Tiny balls for ears (equator 12).
const EAR = [6, 12, 12, 6]

// ── The smaller genuine win first: ONE stuffed ball, staged as a finished 3D
//    object on a clean ground (the staging path proven before the multi-part
//    stack). ────────────────────────────────────────────────────────────────
const amigurumiBall: CompositionProgram = {
  name: 'amigurumi-ball',
  yarnWeight: 'worsted',
  tiltDeg: 20,
  parts: [{ name: 'ball', stitch: 'sc', rounds: BODY, colourHex: '#c25a3c', place: { on: 'ground' } }],
  gaugeText: 'sc worked in the round, stuffed firm',
  finishedSizeMm: { width: 70, height: 70 },
  hookMm: 4,
  notes: 'A simple stuffed crochet ball — the amigurumi primitive, worked as a continuous spiral from a magic ring.',
}

// ── The composition: a body ball + a smaller head ball + two ears — one staged
//    amigurumi creature. ──────────────────────────────────────────────────────
const amigurumiCreature: CompositionProgram = {
  name: 'amigurumi-creature',
  yarnWeight: 'worsted',
  tiltDeg: 22,
  parts: [
    { name: 'body', stitch: 'sc', rounds: BODY, colourHex: '#c2843c', place: { on: 'ground' } },
    // The head nestles into the top of the body.
    { name: 'head', stitch: 'sc', rounds: HEAD, colourHex: '#c2843c', place: { on: 'body', overlap: 10 } },
    // Two ears poke up from the upper sides of the head.
    { name: 'ear-l', stitch: 'sc', rounds: EAR, colourHex: '#8a5a34', place: { on: 'head', overlap: 12, offset: { x: -7, z: 4 } } },
    { name: 'ear-r', stitch: 'sc', rounds: EAR, colourHex: '#8a5a34', place: { on: 'head', overlap: 12, offset: { x: 7, z: 4 } } },
  ],
  gaugeText: 'sc worked in the round, each piece stuffed and joined',
  finishedSizeMm: { width: 80, height: 120 },
  hookMm: 4,
  notes: 'A simple amigurumi creature: a stuffed body ball, a smaller head, and two little ears — each crocheted as a spiral from a magic ring and sewn together.',
}

export const COMPOSITION_PROOFS: Record<string, CompositionProgram> = {
  'amigurumi-ball': amigurumiBall,
  'amigurumi-creature': amigurumiCreature,
}
