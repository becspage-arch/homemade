/**
 * Character motifs — the lovable creatures that make a design subject-led ("I
 * want to make THAT"). Authored as clean vector shapes so the proportions that
 * make an animal read as CUTE (big head, big eyes, small body, fluffy tail) are
 * exact and controllable — the opposite of tracing a raster, where proportion is
 * whatever the picture happened to be.
 *
 * Local coordinates: origin at the character's chest, "up" = −y, roughly within
 * x[−1.5, 1.5]. Drawn back-to-front (later elements render on top).
 */

import type { StitchedElement } from '../../loom/render/renderPattern'
import { dmcRamp } from '../engine/author'
import { type Pt, type Placement, cubic, quad, ellipse } from './geometry'
import { satin, shaded, line, knot } from './elements'
import type { FoxPalette } from './palette'

function close(...segs: Pt[][]): Pt[] {
  const out: Pt[] = []
  for (const s of segs) for (const p of s) out.push(p)
  return out
}

/**
 * A sitting front-facing fox — the hero character. Big triangular head with a
 * white heart muzzle, perky black-tipped ears, a compact body with a cream bib,
 * little paws, and a big fluffy tail curling across the front with a white tip.
 */
export function fox(pl: Placement, C: FoxPalette): StitchedElement[] {
  const fur = dmcRamp(C.furRamp[0], C.furRamp[2], 5)
  const els: StitchedElement[] = []

  // ── body + cream bib ──
  const body = close(
    [[-0.4, 0.08]],
    cubic([-0.4, 0.08], [-0.74, 0.34], [-0.86, 0.74], [-0.74, 1.04], 14),
    quad([-0.74, 1.04], [0, 1.32], [0.74, 1.04], 14),
    cubic([0.74, 1.04], [0.86, 0.74], [0.74, 0.34], [0.4, 0.08], 14),
  )
  els.push(shaded(body, pl, fur, [0.3, 1.2]))
  // chest blaze set LOW on the body, with an orange neck above it so it never
  // joins the white muzzle into one streak
  const bib = close(
    [[0, 0.66]],
    quad([0, 0.66], [0.34, 0.86], [0.28, 1.06], 12),
    quad([0.28, 1.06], [0, 1.16], [-0.28, 1.06], 12),
    quad([-0.28, 1.06], [-0.34, 0.86], [0, 0.66], 12),
  )
  els.push(satin(bib, pl, C.cream))

  // ── tail (method B): worked a touch lighter than the body and shaded in its
  //    own direction, with a fine defining line in a darker fox-rust where it
  //    meets the body — so it reads as a separate bushy tail instead of blurring
  //    into the same-colour body. No outline anywhere else. ──
  // worked a lighter, paler ORANGE than the body (not cream) so it reads as its
  // own russet tail, finished with a clear cream tip + a defining line
  const tailFur = dmcRamp('#f2b074', '#f8d3ae', 4)
  const tailInner = cubic([-0.58, 0.44], [-0.3, 0.72], [0.14, 1.12], [0.5, 0.92], 22)
  const tail = close(
    cubic([0.55, 0.66], [1.18, 0.94], [1.22, 1.48], [0.64, 1.64], 18),
    cubic([0.64, 1.64], [0.0, 1.8], [-0.74, 1.62], [-1.04, 1.1], 18),
    cubic([-1.04, 1.1], [-1.36, 0.6], [-1.0, 0.3], [-0.58, 0.44], 18),
    tailInner,
    quad([0.5, 0.92], [0.6, 0.78], [0.55, 0.66], 8),
  )
  els.push(shaded(tail, pl, tailFur, [0.7, 0.9]))
  // a generous cream tip (the universal fox-tail signal)
  const tip = close(
    cubic([-1.04, 1.1], [-1.36, 0.6], [-1.0, 0.3], [-0.58, 0.44], 16),
    cubic([-0.58, 0.44], [-0.34, 0.74], [-0.34, 1.04], [-0.5, 1.28], 16),
    quad([-0.5, 1.28], [-0.8, 1.24], [-1.04, 1.1], 12),
  )
  els.push(satin(tip, pl, C.cream))
  els.push(line(tailInner, pl, '#7a2f12', 'embroidery-stem'))
  // two little paws peeking at the front
  for (const sx of [-1, 1]) {
    els.push(satin(ellipse(sx * 0.2, 1.04, 0.16, 0.1, 0, 18), pl, C.cream))
    els.push(satin(ellipse(sx * 0.2, 1.08, 0.09, 0.05, 0, 14), pl, C.dark))
  }

  // ── ears: large triangular fox ears, angled out, with dark backs ──
  for (const sx of [-1, 1]) {
    els.push(satin([[sx * 0.64, -0.84], [sx * 1.12, -1.76], [sx * 0.2, -1.12]], pl, C.furRamp[1]))
    els.push(satin([[sx * 0.62, -0.94], [sx * 0.96, -1.54], [sx * 0.34, -1.1]], pl, C.dark))
  }

  // ── head: an inverted-triangle fox mask tapering to a POINTED SNOUT (this is
  //    what reads "fox" not "owl" — a projecting muzzle, not a flat round face) ──
  const head = close(
    cubic([-0.86, -0.9], [-0.56, -1.42], [0.56, -1.42], [0.86, -0.9], 16),
    cubic([0.86, -0.9], [0.94, -0.4], [0.52, -0.02], [0.3, 0.22], 14),
    quad([0.3, 0.22], [0.18, 0.44], [0, 0.5], 10),
    quad([0, 0.5], [-0.18, 0.44], [-0.3, 0.22], 10),
    cubic([-0.3, 0.22], [-0.52, -0.02], [-0.94, -0.4], [-0.86, -0.9], 14),
  )
  els.push(shaded(head, pl, fur, [0, -1.2]))

  // a SMALL contained white muzzle (not a long streak), with an orange snout tip
  // below it
  const muzzle = close(
    quad([-0.28, 0.0], [0, -0.04], [0.28, 0.0], 10),
    quad([0.28, 0.0], [0.2, 0.3], [0, 0.46], 10),
    quad([0, 0.46], [-0.2, 0.3], [-0.28, 0.0], 10),
  )
  els.push(satin(muzzle, pl, C.cream))

  // eyes — big and round for adorable baby-fox cuteness, with just a hint of an
  // outward slant (the snout already says "fox", so round eyes won't read owl)
  for (const sx of [-1, 1]) {
    els.push(satin(ellipse(sx * 0.4, -0.52, 0.175, 0.16, sx * -12, 22), pl, C.dark))
    els.push(satin(ellipse(sx * 0.45, -0.58, 0.06, 0.055, 0, 12), pl, C.glint))
  }

  // ── face detail (method C): a defined dark nose at the snout tip with a small
  //    highlight so it reads as a nose, NOT a line running down into the body ──
  els.push(
    satin(close([[-0.15, 0.22], [0.15, 0.22]], quad([0.15, 0.22], [0, 0.46], [-0.15, 0.22], 12)), pl, C.dark),
  )
  els.push(satin(ellipse(-0.045, 0.29, 0.042, 0.034, 0, 10), pl, C.glint))

  return els
}

/**
 * A plump bumblebee in flight — yellow body with black bands, a dark head with a
 * smile, two cream wings and antennae. The stripes + wings make it unmistakably
 * a bee. Local origin = body centre, up = −y.
 */
export function bee(pl: Placement): StitchedElement[] {
  const Y = '#f4c128'
  const BK = '#2c2723'
  const W = '#f1ece0'
  const EYE = '#fbf7ec'
  const els: StitchedElement[] = []
  // wings behind the body (cream, spread up and out)
  els.push(satin(ellipse(-0.74, -0.32, 0.52, 0.34, -32, 22), pl, W))
  els.push(satin(ellipse(0.74, -0.32, 0.52, 0.34, 32, 22), pl, W))
  els.push(line(ellipse(-0.74, -0.32, 0.52, 0.34, -32, 22), pl, '#d9d2c0', 'embroidery-back'))
  els.push(line(ellipse(0.74, -0.32, 0.52, 0.34, 32, 22), pl, '#d9d2c0', 'embroidery-back'))
  // yellow body
  els.push(satin(ellipse(0, 0.2, 0.72, 0.96, 0, 36), pl, Y))
  // black bands across the body (kept inside the body width) + tail tip
  els.push(satin(ellipse(0, -0.18, 0.6, 0.17, 0, 22), pl, BK))
  els.push(satin(ellipse(0, 0.26, 0.64, 0.18, 0, 22), pl, BK))
  els.push(satin(ellipse(0, 0.68, 0.5, 0.17, 0, 22), pl, BK))
  els.push(satin(ellipse(0, 1.0, 0.26, 0.2, 0, 18), pl, BK))
  // head + face
  els.push(satin(ellipse(0, -0.92, 0.46, 0.42, 0, 26), pl, BK))
  els.push(satin(ellipse(-0.16, -1.0, 0.1, 0.12, 0, 14), pl, EYE))
  els.push(satin(ellipse(0.16, -1.0, 0.1, 0.12, 0, 14), pl, EYE))
  els.push(line([[-0.15, -0.78], [0, -0.72], [0.15, -0.78]], pl, EYE, 'embroidery-back'))
  // antennae
  els.push(line([[-0.16, -1.3], [-0.3, -1.52]], pl, BK, 'embroidery-stem'))
  els.push(line([[0.16, -1.3], [0.3, -1.52]], pl, BK, 'embroidery-stem'))
  els.push(knot([-0.31, -1.54], pl, BK))
  els.push(knot([0.31, -1.54], pl, BK))
  return els
}

/**
 * A soft sitting bunny — round body with a white chest, a round head, two long
 * upright ears with pink centres, and a fluffy cottontail. The long ears +
 * cottontail make it read as a rabbit. Local origin = chest, up = −y.
 */
export function bunny(pl: Placement): StitchedElement[] {
  const fur = dmcRamp('#b8aa92', '#e7dec9', 4)
  const PINK = '#e4a0a8'
  const NOSE = '#cf7f88'
  const DK = '#2e2620'
  const WHITE = '#f7f1e3'
  const els: StitchedElement[] = []
  // ears (behind the head): long upright ellipses with pink inner
  for (const [sx, lean] of [[-1, -8], [1, 8]] as Array<[number, number]>) {
    els.push(satin(ellipse(sx * 0.32, -1.52, 0.25, 0.72, lean, 26), pl, '#ddd2ba'))
    els.push(satin(ellipse(sx * 0.32, -1.46, 0.12, 0.52, lean, 22), pl, PINK))
  }
  // body
  const body = close(
    [[-0.5, -0.08]],
    cubic([-0.5, -0.08], [-0.86, 0.42], [-0.7, 1.06], [-0.4, 1.2], 14),
    quad([-0.4, 1.2], [0, 1.34], [0.4, 1.2], 14),
    cubic([0.4, 1.2], [0.7, 1.06], [0.86, 0.42], [0.5, -0.08], 14),
  )
  els.push(shaded(body, pl, fur, [0.3, 1.2]))
  els.push(satin(ellipse(0, 0.74, 0.34, 0.5, 0, 24), pl, WHITE))
  // head
  els.push(shaded(ellipse(0, -0.55, 0.72, 0.66, 0, 32), pl, fur, [0, -1.2]))
  // white muzzle/cheeks
  els.push(satin(ellipse(0, -0.28, 0.34, 0.26, 0, 22), pl, WHITE))
  // eyes + glint
  els.push(satin(ellipse(-0.3, -0.62, 0.12, 0.15, 0, 16), pl, DK))
  els.push(satin(ellipse(0.3, -0.62, 0.12, 0.15, 0, 16), pl, DK))
  els.push(satin(ellipse(-0.26, -0.67, 0.04, 0.04, 0, 10), pl, '#fbf7ec'))
  els.push(satin(ellipse(0.34, -0.67, 0.04, 0.04, 0, 10), pl, '#fbf7ec'))
  // nose + mouth
  els.push(satin([[-0.09, -0.34], [0.09, -0.34], [0, -0.22]], pl, NOSE))
  els.push(line([[0, -0.22], [0, -0.12]], pl, DK, 'embroidery-back'))
  // paws + cottontail
  els.push(satin(ellipse(-0.2, 1.16, 0.16, 0.1, 0, 18), pl, WHITE))
  els.push(satin(ellipse(0.2, 1.16, 0.16, 0.1, 0, 18), pl, WHITE))
  els.push(satin(ellipse(0.66, 0.96, 0.27, 0.25, 0, 22), pl, WHITE))
  return els
}
