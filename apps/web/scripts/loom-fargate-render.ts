/**
 * fargateRenderBase — the server-side twin of `blenderRenderBase`.
 *
 * The loom's photoreal base render is Blender (CPU Cycles, headless). Locally
 * that's `blender.exe` spawned by loom-render-hero.ts. To let pattern
 * generation run standalone (off Rebecca's PC), the SAME render also runs in a
 * container on AWS Fargate — same pinned Blender, the same render script
 * (`loom_render.py` for needlework, `loom_render_crochet.py` for crochet —
 * both ship in the image, picked with `options.script`), same scene.json +
 * samples. This module is the caller side: it hands the scene to
 * the Fargate task and gets the identical PNG back.
 *
 * It is a drop-in for `blenderRenderBase(scenePath, basePath, samples)` — same
 * inputs (a scene.json path + an output PNG path + samples), same result (a
 * base PNG on disk). renderHero picks between the two by config/env; the rest
 * of the pipeline (Fal upscale, fidelity gate, R2) is unchanged.
 *
 * ── SYNCHRONOUS AND ASYNCHRONOUS ──────────────────────────────────────────
 * `fargateRenderBase` WAITS the seven to nine minutes the render takes. On a
 * worker box that is exactly right. Inside a server request it is impossible:
 * an Inngest step is one HTTP request and Cloudflare and the ALB end a request
 * at about a hundred seconds, which is why the needlework batch was paused and
 * the crochet one shipped switched off.
 *
 * So the render is also published as its three separate, each-quick pieces:
 *
 *   startFargateRender(scene, opts)  -> a JSON handle  (upload + run-task)
 *   pollFargateRender(handle)        -> RUNNING | STOPPED | FAILED
 *   fetchFargateRender(outKey, path) -> the PNG on disk
 *
 * A server-side caller runs them in three different requests with a sleep in
 * between (Inngest: step.run -> step.sleep/step.run loop -> step.run), so no
 * single request is ever longer than one AWS call. `fargateRenderBase` is now
 * just those three with a wait around them, so both paths run the same render.
 * Everything crossing a step boundary is plain JSON, because Inngest memoises a
 * step's result and may replay it into a step running in another container.
 *
 * Transport is a short-lived S3 bucket: the scene goes up, the task renders,
 * the PNG comes down. The task is run ON-DEMAND via `aws ecs run-task` (no
 * long-running service) and we poll it to completion. Every aws-cli call here
 * is async so a BATCH of renders can be launched and awaited together — a cold
 * task is 7-8 minutes, so patterns are always rendered as a batch, never one
 * at a time (see scripts/loom-render-batch.ts). The AWS CLI is used
 * (rather than an SDK dependency) because this is build-time tooling that
 * already runs where the Homemade AWS creds live (loaded by loadCredentials()
 * from .env.credentials, same as FAL_KEY).
 *
 * Config — set these from the CDK stack outputs (see scripts/loom-render/README.md):
 *   LOOM_RENDER=fargate            select this path (renderHero default: local)
 *   LOOM_RENDER_S3_BUCKET          scratch bucket (CfnOutput LoomRenderScratchBucket)
 *   LOOM_RENDER_CLUSTER            cluster arn/name (LoomRenderClusterArn)
 *   LOOM_RENDER_TASKDEF            task def arn/family (LoomRenderTaskDefArn)
 *   LOOM_RENDER_SUBNETS            comma-separated public subnet ids (LoomRenderSubnets)
 *   LOOM_RENDER_SECURITY_GROUP     security group id (LoomRenderSecurityGroup)
 *   LOOM_RENDER_CONTAINER          container name (default 'loom-render')
 *   LOOM_RENDER_REGION             AWS region (default $AWS_REGION or eu-west-2)
 *   LOOM_RENDER_TIMEOUT_SEC        max wait for the task (default 1500 = 25 min)
 */

import { execFile } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { resolve } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export interface FargateRenderConfig {
  bucket: string
  cluster: string
  taskDef: string
  subnets: string[]
  securityGroup: string
  container: string
  region: string
  timeoutSec: number
}

/** Read + validate the Fargate render config from the environment. */
export function readFargateConfig(): FargateRenderConfig {
  const need = (name: string): string => {
    const v = process.env[name]
    if (!v || v.trim().length === 0) {
      throw new Error(
        `${name} is required for LOOM_RENDER=fargate. Set the loom-render env ` +
          'vars from the CDK stack outputs (see apps/web/scripts/loom-render/README.md).',
      )
    }
    return v.trim()
  }
  return {
    bucket: need('LOOM_RENDER_S3_BUCKET'),
    cluster: need('LOOM_RENDER_CLUSTER'),
    taskDef: need('LOOM_RENDER_TASKDEF'),
    subnets: need('LOOM_RENDER_SUBNETS')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    securityGroup: need('LOOM_RENDER_SECURITY_GROUP'),
    container: process.env.LOOM_RENDER_CONTAINER?.trim() || 'loom-render',
    region: process.env.LOOM_RENDER_REGION?.trim() || process.env.AWS_REGION?.trim() || 'eu-west-2',
    timeoutSec: Number(process.env.LOOM_RENDER_TIMEOUT_SEC) || 1500,
  }
}

/**
 * Run an aws-cli command, returning stdout (parsed as JSON when `json`).
 *
 * ASYNC on purpose: a batch launches many renders at once and awaits them
 * together, so nothing here may block the event loop (a spawnSync would
 * serialise every poll and upload across the whole batch).
 */
async function aws(args: string[], json = false): Promise<unknown> {
  let stdout: string
  try {
    const res = await execFileAsync('aws', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
    stdout = res.stdout
  } catch (e) {
    const err = e as { code?: unknown; stdout?: string; stderr?: string; message?: string }
    if (err.code === 'ENOENT') {
      throw new Error(
        `Could not run the AWS CLI ('aws ${args[0]} ${args[1]}'): ${err.message}. ` +
          'The Fargate render path needs the AWS CLI v2 on PATH.',
      )
    }
    const tail = `${err.stdout ?? ''}\n${err.stderr ?? ''}`.trim().slice(-800)
    throw new Error(`aws ${args[0]} ${args[1]} failed (exit ${String(err.code)}):\n${tail}`)
  }
  return json ? JSON.parse(stdout) : stdout
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

/**
 * Grade env forwarded to the task for parity with the local run (a local
 * spawnSync inherits process.env, so if any of these are set they'd apply
 * locally too). Defaults live in loom_render.py; we only forward when set.
 *
 * loom_render_crochet.py reads NO environment at all — its whole grade (view
 * transform, exposure, saturation, background, tilt, margin) travels inside
 * scene.json's `view` block — so the crochet path needs nothing extra here.
 * Callers can still pass per-render env through `options.env`.
 */
function forwardedGradeEnv(): Array<{ name: string; value: string }> {
  return ['LOOM_VIEW', 'LOOM_SAT', 'LOOM_EXP', 'LOOM_AMBIENT']
    .filter((k) => process.env[k] != null && process.env[k] !== '')
    .map((k) => ({ name: k, value: String(process.env[k]) }))
}


export interface FargateRenderOptions {
  /**
   * Which Blender python script inside the image renders the scene. A bare
   * filename; the image carries `loom_render.py` (needlework, the default) and
   * `loom_render_crochet.py` (crochet yarn fabric). Same script the local box
   * runs, so the output is the same render either side.
   */
  script?: string
  /** Extra environment forwarded to the render task, on top of the grade env. */
  env?: Record<string, string>
}

/**
 * Everything a later, SEPARATE process needs to follow a render it did not
 * start. Deliberately plain JSON — an Inngest step memoises its result and
 * replays it into the next step, which may run in a different container, so
 * nothing here may be a Buffer, a handle or a local path.
 */
export interface FargateRenderHandle {
  taskArn: string
  sceneKey: string
  outKey: string
  bucket: string
  cluster: string
  container: string
  region: string
}

/** Where a started render has got to. STOPPED means finished cleanly. */
export type FargateRenderState = 'RUNNING' | 'STOPPED' | 'FAILED'

export interface FargatePollResult {
  state: FargateRenderState
  /** ECS's own word for it (PROVISIONING / PENDING / RUNNING / STOPPED). */
  lastStatus: string | null
  /** The render container's exit code once the task has stopped. */
  exitCode: number | null
  /** Why it failed — the container's reason, else the task's stoppedReason. */
  reason: string | null
}

/** The slice of `aws ecs describe-tasks` this module reads. */
export interface DescribeTasksPayload {
  tasks?: Array<{
    lastStatus?: string
    stoppedReason?: string
    containers?: Array<{ name?: string; exitCode?: number; reason?: string }>
  }>
  failures?: Array<{ arn?: string; reason?: string; detail?: string }>
}

/**
 * The poll STATE MACHINE, as a pure function of one describe-tasks payload.
 *
 * Pure on purpose: it is the one piece of the async render that has to be right
 * every time (a mis-read "still running" hangs a batch for twenty minutes; a
 * mis-read "finished" downloads a PNG that was never written), and this way it
 * is unit-testable without AWS. See loom-fargate-render.test.ts.
 *
 * The four cases that matter:
 *   - the task is not in the payload at all — ECS lost it, or the arn is wrong.
 *     FAILED, with whatever `failures` says. Never "still running": waiting on a
 *     task that does not exist is how a run burns its whole ceiling.
 *   - lastStatus is anything but STOPPED — RUNNING (PROVISIONING and PENDING
 *     included; a cold image pull sits in PENDING for minutes).
 *   - STOPPED with the render container exit 0 — STOPPED, the PNG is in S3.
 *   - STOPPED any other way — FAILED. A task killed before its container ever
 *     ran (a failed image pull, no capacity) has NO exit code at all, so a
 *     missing exit code is a failure, not a pass.
 */
export function fargateTaskState(desc: DescribeTasksPayload, container: string): FargatePollResult {
  const task = desc.tasks?.[0]
  if (!task) {
    const failure = desc.failures?.[0]
    const reason = failure ? [failure.reason, failure.detail].filter(Boolean).join(': ') : null
    return { state: 'FAILED', lastStatus: null, exitCode: null, reason: reason || 'task not found' }
  }
  const lastStatus = task.lastStatus ?? null
  if (lastStatus !== 'STOPPED') return { state: 'RUNNING', lastStatus, exitCode: null, reason: null }

  // Named container first; a task definition with one container that got
  // renamed should still report its exit code rather than read as a failure.
  const c = task.containers?.find((x) => x.name === container) ?? task.containers?.[0]
  const exitCode = typeof c?.exitCode === 'number' ? c.exitCode : null
  if (exitCode === 0) return { state: 'STOPPED', lastStatus, exitCode, reason: null }
  return {
    state: 'FAILED',
    lastStatus,
    exitCode,
    reason: c?.reason ?? task.stoppedReason ?? null,
  }
}

/** A one-line description of a failed poll, for an error message. */
export function describePollFailure(poll: FargatePollResult): string {
  return (
    `loom-render task exited ${poll.exitCode ?? 'without an exit code'} ` +
    `(status ${poll.lastStatus ?? 'unknown'}, reason: ${poll.reason ?? 'n/a'}). ` +
    'Check CloudWatch /homemade/loom-render.'
  )
}

/**
 * STEP 1 of the async render: upload the scene and START the ECS task, then
 * return immediately. Quick (two aws-cli calls, no waiting), so it fits inside
 * one Inngest step / one HTTP request.
 *
 * The returned handle is all a later step needs to follow the task, and it
 * carries its own bucket/cluster/region rather than re-reading the environment
 * later — a render must not change machines halfway through because someone
 * redeployed with different config between two steps.
 */
export async function startFargateRender(
  scenePath: string,
  samples: number,
  options: FargateRenderOptions = {},
): Promise<FargateRenderHandle> {
  const cfg = readFargateConfig()
  const jobId = randomUUID()
  const sceneKey = `jobs/${jobId}/scene.json`
  const outKey = `jobs/${jobId}/out.png`
  const r = ['--region', cfg.region]

  // 1. scene.json -> S3
  await aws([
    's3', 'cp', resolve(scenePath), `s3://${cfg.bucket}/${sceneKey}`,
    '--content-type', 'application/json', ...r,
  ])

  // 2. run the render task with the job's env overrides.
  const overrides = {
    containerOverrides: [
      {
        name: cfg.container,
        environment: [
          { name: 'LOOM_S3_BUCKET', value: cfg.bucket },
          { name: 'LOOM_SCENE_KEY', value: sceneKey },
          { name: 'LOOM_OUT_KEY', value: outKey },
          { name: 'LOOM_SAMPLES', value: String(samples) },
          { name: 'LOOM_SCRIPT', value: options.script ?? 'loom_render.py' },
          ...forwardedGradeEnv(),
          ...Object.entries(options.env ?? {}).map(([name, value]) => ({ name, value: String(value) })),
        ],
      },
    ],
  }
  const network = {
    awsvpcConfiguration: {
      subnets: cfg.subnets,
      securityGroups: [cfg.securityGroup],
      // Public subnets, no NAT (matches the web stack) — a public IP lets the
      // task pull the image from ECR and reach S3.
      assignPublicIp: 'ENABLED',
    },
  }
  const run = (await aws(
    [
      'ecs', 'run-task',
      '--cluster', cfg.cluster,
      '--task-definition', cfg.taskDef,
      '--launch-type', 'FARGATE',
      '--count', '1',
      '--overrides', JSON.stringify(overrides),
      '--network-configuration', JSON.stringify(network),
      '--output', 'json',
      ...r,
    ],
    true,
  )) as { tasks?: Array<{ taskArn?: string }>; failures?: unknown[] }
  const taskArn = run.tasks?.[0]?.taskArn
  if (!taskArn) {
    throw new Error(`ecs run-task started no task. failures=${JSON.stringify(run.failures ?? [])}`)
  }

  return {
    taskArn,
    sceneKey,
    outKey,
    bucket: cfg.bucket,
    cluster: cfg.cluster,
    container: cfg.container,
    region: cfg.region,
  }
}

/**
 * STEP 2 of the async render: ONE `describe-tasks` call, no waiting. Cheap
 * enough to call from an Inngest step every sixty seconds for the length of a
 * render.
 *
 * Takes the handle `startFargateRender` returned, or a bare task arn when the
 * caller only has that (the cluster/container/region then come from the
 * environment, as they did before the split).
 */
export async function pollFargateRender(handle: FargateRenderHandle | string): Promise<FargatePollResult> {
  const { taskArn, cluster, container, region } =
    typeof handle === 'string'
      ? (() => {
          const cfg = readFargateConfig()
          return { taskArn: handle, cluster: cfg.cluster, container: cfg.container, region: cfg.region }
        })()
      : handle
  const desc = (await aws(
    ['ecs', 'describe-tasks', '--cluster', cluster, '--tasks', taskArn, '--output', 'json', '--region', region],
    true,
  )) as DescribeTasksPayload
  return fargateTaskState(desc, container)
}

/**
 * STEP 3 of the async render: bring the finished PNG down to `localPath`. One
 * `s3 cp`, seconds for a render-sized image inside the VPC.
 */
export async function fetchFargateRender(
  outKey: string,
  localPath: string,
  options: { bucket?: string; region?: string } = {},
): Promise<void> {
  return getFargateScratch(outKey, localPath, options)
}

/** Bring any scratch-bucket object down to a local file. */
export async function getFargateScratch(
  key: string,
  localPath: string,
  options: { bucket?: string; region?: string } = {},
): Promise<void> {
  const cfg = readFargateConfig()
  const bucket = options.bucket ?? cfg.bucket
  const region = options.region ?? cfg.region
  await aws(['s3', 'cp', `s3://${bucket}/${key}`, resolve(localPath), '--region', region])
}

/**
 * A key beside a render's own output, in the same job folder — so anything a
 * later step parks for the step after it expires on the same one-day clock as
 * the scene and the PNG, and a culled candidate cleans itself up.
 */
export function scratchSibling(outKey: string, filename: string): string {
  const slash = outKey.lastIndexOf('/')
  return slash < 0 ? filename : `${outKey.slice(0, slash + 1)}${filename}`
}

/**
 * Put a local file INTO the scratch bucket under an arbitrary key.
 *
 * The scratch bucket is how two Inngest steps hand a picture to each other: the
 * web service runs two tasks, so a later step is very likely a different
 * container and anything written to local disk is simply gone. Objects here
 * expire after a day (the CDK lifecycle rule), so a candidate that never
 * publishes leaves nothing behind.
 */
export async function putFargateScratch(
  localPath: string,
  key: string,
  options: { contentType?: string; bucket?: string; region?: string } = {},
): Promise<void> {
  const cfg = readFargateConfig()
  const bucket = options.bucket ?? cfg.bucket
  const region = options.region ?? cfg.region
  await aws([
    's3', 'cp', resolve(localPath), `s3://${bucket}/${key}`,
    '--content-type', options.contentType ?? 'application/octet-stream',
    '--region', region,
  ])
}

/**
 * Render the loom base PNG on Fargate and WAIT for it — the drop-in for
 * `blenderRenderBase` the CLI and the batch scripts use.
 *
 * A thin wrapper over the three pieces above: start, poll every few seconds,
 * fetch. It blocks for the seven to nine minutes a render takes, which is fine
 * on a worker box and fatal inside an HTTP request — a server-side caller
 * (Inngest) drives start/poll/fetch itself across separate steps instead.
 */
export async function fargateRenderBase(
  scenePath: string,
  basePath: string,
  samples: number,
  options: FargateRenderOptions = {},
): Promise<void> {
  const cfg = readFargateConfig()
  const handle = await startFargateRender(scenePath, samples, options)

  // Poll on our own loop rather than `aws ecs wait`, whose 10-min cap can be
  // short for a cold image pull plus a heavy render.
  const deadline = Date.now() + cfg.timeoutSec * 1000
  for (;;) {
    await sleep(6000)
    const poll = await pollFargateRender(handle)
    if (poll.state === 'STOPPED') break
    if (poll.state === 'FAILED') throw new Error(describePollFailure(poll))
    if (Date.now() > deadline) {
      throw new Error(
        `loom-render task did not finish within ${cfg.timeoutSec}s (last status ` +
          `${poll.lastStatus ?? 'unknown'}). Raise LOOM_RENDER_TIMEOUT_SEC or check the task.`,
      )
    }
  }

  await fetchFargateRender(handle.outKey, basePath, { bucket: handle.bucket, region: handle.region })
}
