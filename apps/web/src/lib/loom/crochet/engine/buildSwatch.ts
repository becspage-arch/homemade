/**
 * The ONE recipe for building + relaxing a stitch swatch. The render driver, the
 * audit, and the loom-stitch pipeline all call this, so what gets audited is
 * exactly what gets rendered. All per-stitch values come from the dictionary
 * (SWATCH_RECIPES) — the single source of truth.
 */

import { buildContinuous, type BuiltContinuous } from './yarnPath'
import { buildShaped, buildRounds, buildSphere } from './shaping'
import { buildKnit } from './knitPath'
import { relax } from './relax'
import { SWATCH_RECIPES, type SwatchArg, type SwatchRecipe, type StitchId } from './dictionary'

export interface BuiltSwatch {
  built: BuiltContinuous
  recipe: SwatchRecipe
}

export function isSwatchArg(arg: string): arg is SwatchArg {
  return arg in SWATCH_RECIPES
}

/** Build the standard swatch for a stitch/pattern and relax it to its settled shape. */
export function buildRelaxedSwatch(arg: SwatchArg, W: number, yr: number): BuiltSwatch {
  const recipe = SWATCH_RECIPES[arg]
  const rows: StitchId[] = Array(recipe.rows).fill(recipe.stitch) as StitchId[]
  const built =
    recipe.builder === 'shaped'
      ? buildShaped(recipe.stitch, recipe.shapeRows!, W, yr)
      : recipe.builder === 'round'
        ? buildRounds(recipe.stitch, recipe.roundCounts!, yr)
        : recipe.builder === 'sphere'
          ? buildSphere(recipe.stitch, recipe.equatorCount ?? 30, yr)
          : recipe.builder === 'knit'
            ? buildKnit(recipe.rows, W, yr, recipe.knitFace ?? (recipe.knitFlip ? 'garter' : 'stockinette'))
            : buildContinuous(rows, W, yr, { stitchAt: recipe.pattern, noTurn: recipe.noTurn, gaugeYr: recipe.gaugeYr })

  // Collision is what HOLDS the interlock (yarn can't pass through yarn), so it
  // runs firm and long. No plane pull for worked fabric — the +z/−z relief at each
  // hook IS the interlock; flattening it would unlink the rows.
  if (recipe.relaxProfile === 'surface') {
    // A curved surface (sphere/tube): worked-fabric relax, "stuffed" to its
    // worked shape — each node held at its worked latitude along the local
    // meridian tangent only (normal relief + the angular direction stay free) —
    // resting on the table.
    relax(built.model, {
      collMinDist: yr * 1.25,
      collK: 0.28,
      collAdjacency: 9,
      planeZ: 0,
      planeK: 0,
      layoutK: 0.06,
      layoutMode: 'surface',
      floorZ: 0,
      iterations: 520, // a ~4k-node closed surface settles slower than a flat swatch — at 400 one knife-edge hook was still 0.05yr shy of depth
    })
  } else if (recipe.relaxProfile === 'round') {
    // Work in the round: the same worked-fabric relax, but "blocked" to each
    // round's worked RADIUS instead of a row line — plus the TABLE. No-turn
    // fabric piles every round's relief on the same face (nothing alternates to
    // cancel it), and with z totally free the disc bulged into coiled-rope lumps.
    // The one-sided floor is the engine's own flattener (§9: flatten with the
    // table, never a symmetric plane pull) — a photographed disc lies pressed
    // flat on one.
    relax(built.model, {
      collMinDist: yr * 1.25,
      collK: 0.28,
      collAdjacency: 9,
      planeZ: 0,
      planeK: 0,
      layoutK: 0.06,
      layoutMode: 'radial',
      floorZ: -yr * 1.3,
      iterations: 360,
    })
  } else if (recipe.relaxProfile === 'chain') {
    // A chain's links are consecutive along the strand, so collision must act between
    // NEAR neighbours (low adjacency) to hold each loop threaded through the previous
    // and to snug each head around the next stitch's two pulled-through strands.
    relax(built.model, {
      collMinDist: yr * 1.0, // SOFT — a drawn-tight chain squashes its yarn; firmer than this and the loop can't contain the two strands pulled through it
      collK: 0.3,
      collAdjacency: 2,
      planeZ: 0,
      planeK: 0.01, // barely any symmetric pull — the TABLE does the flattening, one-sided, so the front/back layering survives
      layoutK: 0,
      floorZ: -yr * 1.6, // the table the chain lies on — deep enough for the bump layer, or the back overcrowds
      iterations: 400,
    })
  } else {
    relax(built.model, {
      collMinDist: yr * 1.25,
      collK: 0.28,
      collAdjacency: 9, // a post's own two legs (≤9 apart) stay a tight pair; cross-row interlock is ~a full row apart, so it still collides
      planeZ: 0,
      planeK: 0,
      layoutK: 0.06, // blocked flat — holds rows at their worked height so posts stand
      iterations: 320,
    })
  }

  return { built, recipe }
}
