/**
 * WHERE the loom's deterministic base render runs — the one place the crochet
 * pipelines choose between Rebecca's local Blender and the Fargate container.
 *
 * The render itself is identical either side: the same pinned Blender 4.2.9,
 * the same python script, the same scene.json and sample count. Only the
 * machine changes. That is the whole point — a pattern can hero itself from a
 * cloud session with no Blender on the box, and the output is the same PNG.
 *
 *   LOOM_RENDER=fargate   run the render in the container (needs the
 *                         LOOM_RENDER_* config — see loom-fargate-render.ts)
 *   (unset / anything)    spawn the local Blender
 *   LOOM_BLENDER          path to the local blender executable; defaults to
 *                         the known Windows box so Rebecca's machine is
 *                         unchanged with nothing set
 *
 * Mirrors the selection loom-render-hero.ts already makes for the needlework
 * loom, so both crafts read the same two env vars.
 */

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import {
  fargateRenderBase,
  startFargateRender,
  pollFargateRender,
  fetchFargateRender,
  type FargateRenderHandle,
  type FargatePollResult,
} from './loom-fargate-render'

/** The Blender python scripts that ship both locally and in the render image. */
export type LoomRenderScript = 'loom_render.py' | 'loom_render_crochet.py'

const DEFAULT_BLENDER = 'C:/Users/Rebecca/blender/blender-4.2.9-windows-x64/blender.exe'

/** 'fargate' when LOOM_RENDER says so, else the local Blender. */
export function loomRenderMode(): 'fargate' | 'local' {
  return process.env.LOOM_RENDER === 'fargate' ? 'fargate' : 'local'
}

/** The local Blender executable (env override, else the known box). */
export function localBlenderExe(): string {
  return process.env.LOOM_BLENDER?.trim() || DEFAULT_BLENDER
}

/**
 * Render `scenePath` to `basePng` at `samples`, locally or on Fargate. Throws
 * if the PNG is not produced, so every caller's existing error path is
 * unchanged.
 */
export async function renderBase(
  scenePath: string,
  basePng: string,
  samples: number,
  script: LoomRenderScript = 'loom_render_crochet.py',
): Promise<void> {
  if (loomRenderMode() === 'fargate') {
    await fargateRenderBase(scenePath, basePng, samples, { script })
    if (!existsSync(basePng)) throw new Error(`Fargate render did not produce ${basePng}`)
    return
  }

  const exe = localBlenderExe()
  const r = spawnSync(
    exe,
    [
      '--background',
      '--factory-startup',
      '--python',
      resolve(__dirname, script),
      '--',
      resolve(scenePath),
      resolve(basePng),
      String(samples),
    ],
    { stdio: ['ignore', 'ignore', 'inherit'] },
  )
  if (r.error && (r.error as NodeJS.ErrnoException).code === 'ENOENT') {
    throw new Error(
      `Blender not found at ${exe}. Set $LOOM_BLENDER, or set LOOM_RENDER=fargate ` +
        'to render in the container instead.',
    )
  }
  if (r.status !== 0 || !existsSync(basePng)) throw new Error(`Blender render did not produce ${basePng}`)
}

// ── The same render, driven ASYNCHRONOUSLY ──────────────────────────────────
//
// `renderBase` above WAITS for the render. That is right on a worker box and
// impossible inside a server request: a render is seven to nine minutes and the
// proxy in front of the site ends a request at about a hundred seconds. A
// server-side caller therefore drives the render in three separate requests —
// start it, sleep and poll until it stops, then fetch the PNG — and these three
// are that, with the same "where does the render run" decision in front of them.
//
// Fargate only, on purpose. The local Blender is a synchronous child process
// with nothing to poll, and every server-side caller already refuses to run at
// all unless LOOM_RENDER=fargate.

/** Refuse clearly, rather than half-start something the caller cannot follow. */
function requireFargate(what: string): void {
  if (loomRenderMode() !== 'fargate') {
    throw new Error(
      `${what} needs LOOM_RENDER=fargate. The asynchronous render follows an ECS task; ` +
        'the local Blender is a child process with nothing to poll, so use renderBase() there.',
    )
  }
}

/** Start the base render and return at once. Quick enough for one HTTP request. */
export async function startBaseRender(
  scenePath: string,
  samples: number,
  script: LoomRenderScript = 'loom_render_crochet.py',
): Promise<FargateRenderHandle> {
  requireFargate('startBaseRender')
  return startFargateRender(scenePath, samples, { script })
}

/** One describe-tasks call: has the render finished, and did it work? */
export async function pollBaseRender(handle: FargateRenderHandle): Promise<FargatePollResult> {
  return pollFargateRender(handle)
}

/** Bring the finished PNG down to `basePng`. Throws if the render produced none. */
export async function finishBaseRender(handle: FargateRenderHandle, basePng: string): Promise<void> {
  await fetchFargateRender(handle.outKey, basePng, { bucket: handle.bucket, region: handle.region })
  if (!existsSync(basePng)) throw new Error(`Fargate render did not produce ${basePng}`)
}
