/**
 * Scene/object hero motifs that aren't animals — a sleepy crescent moon, a
 * toadstool fairy cottage, and a smiling sunflower. Same conventions as the
 * character motifs: clean authored vectors, the subject-defining feature made
 * unmistakable, internal definition not outer outlines, snapped to real DMC.
 */

import type { StitchedElement } from '../../loom/render/renderPattern'
import { dmcRamp } from '../engine/author'
import { type Pt, type Placement, cap as capShape, column, petal, leaf as leafShape, ellipse, quad, cubic } from './geometry'
import { satin, shaded, line, knot } from './elements'

function close(...segs: Pt[][]): Pt[] {
  const out: Pt[] = []
  for (const s of segs) for (const p of s) out.push(p)
  return out
}

// ── Crescent moon ───────────────────────────────────────────────────────────
function crescentPoly(): Pt[] {
  const r1 = 1
  const cx = 0.55
  const r2 = 0.95
  const deg = (d: number): number => (d * Math.PI) / 180
  const pts: Pt[] = []
  const a0 = deg(68.7)
  const a1 = deg(291.3)
  for (let i = 0; i <= 28; i++) {
    const a = a0 + (a1 - a0) * (i / 28)
    pts.push([Math.cos(a) * r1, Math.sin(a) * r1])
  }
  const b0 = deg(258.7)
  const b1 = deg(101.3)
  for (let i = 0; i <= 22; i++) {
    const b = b0 + (b1 - b0) * (i / 22)
    pts.push([cx + Math.cos(b) * r2, Math.sin(b) * r2])
  }
  return pts
}

/** A sleepy crescent moon with a soft face. */
export function crescentMoon(pl: Placement): StitchedElement[] {
  const moon = dmcRamp('#e7cf84', '#f7edc6', 4)
  const FACE = '#7a5f3a'
  const CHEEK = '#edb7a6'
  const els: StitchedElement[] = []
  els.push(shaded(crescentPoly(), pl, moon, [0.5, -0.5]))
  // a small sleepy face on the FAT part of the crescent (the solid left bulge),
  // sized to sit inside the narrow shape: two closed eyes, rosy cheeks, a smile
  els.push(line([[-0.78, -0.1], [-0.71, -0.03], [-0.64, -0.1]], pl, FACE, 'embroidery-stem'))
  els.push(line([[-0.56, -0.1], [-0.49, -0.03], [-0.42, -0.1]], pl, FACE, 'embroidery-stem'))
  els.push(satin(ellipse(-0.82, 0.06, 0.07, 0.05, 0, 12), pl, CHEEK))
  els.push(satin(ellipse(-0.46, 0.06, 0.07, 0.05, 0, 12), pl, CHEEK))
  els.push(line([[-0.69, 0.13], [-0.6, 0.21], [-0.51, 0.13]], pl, FACE, 'embroidery-stem'))
  return els
}

// ── Toadstool cottage ────────────────────────────────────────────────────────
function houseBody(): Pt[] {
  return close(
    [[-0.6, -0.12], [0.6, -0.12]],
    quad([0.6, -0.12], [0.68, 0.9], [0.5, 1.32], 10),
    quad([0.5, 1.32], [0, 1.44], [-0.5, 1.32], 10),
    quad([-0.5, 1.32], [-0.68, 0.9], [-0.6, -0.12], 10),
  )
}
function doorPoly(): Pt[] {
  return close(
    [[-0.17, 1.36], [-0.17, 0.86]],
    quad([-0.17, 0.86], [0, 0.66], [0.17, 0.86], 8),
    [[0.17, 1.36]],
  )
}

/** A fairy cottage built into a red toadstool — red spotted cap roof, a cream
 *  trunk with a door and two glowing windows. */
export function mushroomCottage(pl: Placement): StitchedElement[] {
  const roof = dmcRamp('#a8281a', '#d4493a', 5)
  const wall = dmcRamp('#d8c7a2', '#f1e7d1', 4)
  const DOOR = '#7a4a24'
  const WIN = '#f2c84b'
  const SPOT = '#f4ecdb'
  const els: StitchedElement[] = []
  els.push(shaded(houseBody(), pl, wall, [-0.6, 0.6]))
  // a soft eave line under the cap
  els.push(line(quad([-0.58, -0.1], [0, 0.06], [0.58, -0.1], 12), pl, '#caa86f', 'embroidery-back'))
  els.push(shaded(capShape(0, -0.12, 1.12, 0.74), pl, roof, [0, 0.4]))
  for (const [sx, sy, r] of [[-0.52, -0.4, 0.17], [0.12, -0.56, 0.2], [0.56, -0.3, 0.15], [-0.12, -0.22, 0.12]] as Array<[number, number, number]>) {
    els.push(satin(ellipse(sx, sy * 1.15, r, r * 0.78, 0, 18), pl, SPOT))
  }
  // door + knob
  els.push(satin(doorPoly(), pl, DOOR))
  els.push(line([[0, 0.92], [0, 1.3]], pl, '#5a3418', 'embroidery-back'))
  els.push(knot([0.1, 1.04], pl, '#3a2412'))
  // windows with frames
  for (const sx of [-1, 1]) {
    els.push(satin(ellipse(sx * 0.33, 0.4, 0.13, 0.15, 0, 18), pl, WIN))
    els.push(line(ellipse(sx * 0.33, 0.4, 0.13, 0.15, 0, 18), pl, DOOR, 'embroidery-back'))
    els.push(line([[sx * 0.33, 0.26], [sx * 0.33, 0.54]], pl, DOOR, 'embroidery-back'))
    els.push(line([[sx * 0.33 - 0.12, 0.4], [sx * 0.33 + 0.12, 0.4]], pl, DOOR, 'embroidery-back'))
  }
  return els
}

// ── Sunflower ────────────────────────────────────────────────────────────────
/** A sunflower bloom. By default a tall flower on a leafy stem rooted below;
 *  `headOnly` draws just the bloom (for a cut flower in a jug); `face:false`
 *  drops the smiley (for the background blooms in a bunch). */
export function sunflower(pl: Placement, opts: { headOnly?: boolean; face?: boolean } = {}): StitchedElement[] {
  const petalRamp = dmcRamp('#e3a017', '#f6cb45', 4)
  const stemRamp = dmcRamp('#4f6a28', '#6f8c3c', 3)
  const CENTRE = '#6b431f'
  const SEED = '#3c2810'
  const FACE = '#3a2a18'
  const CHEEK = '#e69a6a'
  const LEAF = '#5f7a32'
  const els: StitchedElement[] = []
  if (!opts.headOnly) {
    // stem (a thick column rising from below) + two leaves — rooted to the floor
    els.push(shaded(column([0, 0.92], [0, 2.6], 0.11, 0.13), pl, stemRamp, [-0.5, 1.7]))
    els.push(satin(leafShape([0, 1.5], [-0.95, 1.18], 0.24), pl, LEAF))
    els.push(satin(leafShape([0, 1.9], [0.95, 1.62], 0.24), pl, LEAF))
    els.push(line([[0, 1.5], [-0.85, 1.2]], pl, '#41571f', 'embroidery-back'))
    els.push(line([[0, 1.9], [0.85, 1.62]], pl, '#41571f', 'embroidery-back'))
  }
  // petals — two staggered rings, shaded gold fading outward
  for (const [n, rIn, rOut, off] of [[15, 0.52, 1.18, 0], [15, 0.5, 1.0, 0.5]] as Array<[number, number, number, number]>) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + ((i + off) / n) * Math.PI * 2
      const base: Pt = [Math.cos(a) * rIn, Math.sin(a) * rIn]
      const tip: Pt = [Math.cos(a) * rOut, Math.sin(a) * rOut]
      els.push(shaded(petal(base, tip, (rOut - rIn) * 0.26), pl, petalRamp, [0, 0]))
    }
  }
  // seed head
  els.push(satin(ellipse(0, 0, 0.56, 0.56, 0, 34), pl, CENTRE))
  for (let i = 0; i < 26; i++) {
    const a = i * 2.39996
    const rr = 0.5 * Math.sqrt(i / 26)
    els.push(knot([Math.cos(a) * rr, Math.sin(a) * rr], pl, SEED))
  }
  // face — eyes + rosy cheeks + smile (front bloom only)
  if (opts.face ?? true) {
    els.push(satin(ellipse(-0.2, -0.06, 0.1, 0.12, 0, 14), pl, FACE))
    els.push(satin(ellipse(0.2, -0.06, 0.1, 0.12, 0, 14), pl, FACE))
    els.push(satin(ellipse(-0.18, -0.11, 0.035, 0.035, 0, 8), pl, '#fbf7ec'))
    els.push(satin(ellipse(0.22, -0.11, 0.035, 0.035, 0, 8), pl, '#fbf7ec'))
    els.push(satin(ellipse(-0.3, 0.12, 0.08, 0.055, 0, 12), pl, CHEEK))
    els.push(satin(ellipse(0.3, 0.12, 0.08, 0.055, 0, 12), pl, CHEEK))
    els.push(line([[-0.16, 0.2], [0, 0.3], [0.16, 0.2]], pl, FACE, 'embroidery-stem'))
  }
  return els
}

// ── Landscape + still-life elements ──────────────────────────────────────────
/** A simple round-canopy tree (trunk + lumpy green crown). */
export function tree(pl: Placement): StitchedElement[] {
  const trunk = dmcRamp('#6e4a28', '#8a6438', 3)
  const crown = dmcRamp('#3e5a26', '#6e8a3e', 4)
  return [
    shaded(column([0, 0.2], [0, 1.1], 0.09, 0.13), pl, trunk, [-0.4, 0.6]),
    shaded(ellipse(0, -0.5, 0.66, 0.58, 0, 28), pl, crown, [0, 0.2]),
    shaded(ellipse(-0.42, -0.18, 0.42, 0.4, 0, 24), pl, crown, [-0.4, 0.1]),
    shaded(ellipse(0.42, -0.18, 0.42, 0.4, 0, 24), pl, crown, [0.4, 0.1]),
    line([[-0.3, -0.28], [0.12, -0.62]], pl, '#33491d', 'embroidery-back'),
    line([[0.3, -0.2], [-0.05, -0.5]], pl, '#33491d', 'embroidery-back'),
  ]
}

/** A small sun with rays (landscape sky corner). */
export function sun(pl: Placement): StitchedElement[] {
  const S = '#f2c84b'
  const out: StitchedElement[] = [satin(ellipse(0, 0, 0.58, 0.58, 0, 26), pl, S)]
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    out.push(line([[Math.cos(a) * 0.72, Math.sin(a) * 0.72], [Math.cos(a) * 1.02, Math.sin(a) * 1.02]], pl, S, 'embroidery-straight'))
  }
  return out
}

/** A tiny far-off bird (an "m" of two little arcs). */
export function bird(pl: Placement): StitchedElement[] {
  return [
    line([[-0.5, 0.12], [-0.22, -0.12], [0, 0.06]], pl, '#5a5048', 'embroidery-stem'),
    line([[0, 0.06], [0.22, -0.12], [0.5, 0.12]], pl, '#5a5048', 'embroidery-stem'),
  ]
}

/** A round-bellied ceramic jug for a still-life — blue-on-cream, on its base. */
export function jug(pl: Placement): StitchedElement[] {
  const body = dmcRamp('#cdd8de', '#eef3f5', 4)
  const BAND = '#5b7ba6'
  const poly = close(
    [[-0.34, -0.95], [0.34, -0.95]],
    quad([0.34, -0.95], [0.32, -0.66], [0.52, -0.36], 8),
    cubic([0.52, -0.36], [0.8, 0.16], [0.64, 0.74], [0.4, 0.96], 12),
    quad([0.4, 0.96], [0, 1.06], [-0.4, 0.96], 8),
    cubic([-0.4, 0.96], [-0.64, 0.74], [-0.8, 0.16], [-0.52, -0.36], 12),
    quad([-0.52, -0.36], [-0.32, -0.66], [-0.34, -0.95], 8),
  )
  return [
    shaded(poly, pl, body, [-0.7, 0.2]),
    line(quad([-0.52, -0.34], [0, -0.42], [0.52, -0.34], 12), pl, BAND, 'embroidery-stem'),
    line(quad([-0.66, 0.34], [0, 0.46], [0.66, 0.34], 12), pl, BAND, 'embroidery-stem'),
    line(ellipse(0, 0.0, 0.16, 0.16, 0, 16), pl, BAND, 'embroidery-back'),
    knot([0, 0], pl, BAND),
  ]
}
