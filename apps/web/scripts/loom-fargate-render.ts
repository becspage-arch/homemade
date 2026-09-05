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
 * Render the loom base PNG on Fargate. Drop-in for `blenderRenderBase`:
 * uploads the scene, runs the render task, waits for it, downloads the PNG to
 * `basePath`. Throws on any failure (upload, task failure, missing output) so
 * renderHero's existing error path is unchanged.
 */
export async function fargateRenderBase(
  scenePath: string,
  basePath: string,
  samples: number,
  options: FargateRenderOptions = {},
): Promise<void> {
  const cfg = readFargateConfig()
  const jobId = randomUUID()
  const sceneKey = `jobs/${jobId}/scene.json`
  const outKey = `jobs/${jobId}/out.png`
  const r = ['--region', cfg.region]

  // 1. scene.json -> S3
  await aws(['s3', 'cp', resolve(scenePath), `s3://${cfg.bucket}/${sceneKey}`, '--content-type', 'application/json', ...r])

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

  // 3. poll to completion (own loop rather than `aws ecs wait`, whose 10-min
  //    cap can be short for a cold image pull + a heavy render).
  const deadline = Date.now() + cfg.timeoutSec * 1000
  let container: { exitCode?: number; reason?: string } | undefined
  for (;;) {
    await sleep(6000)
    const desc = (await aws(
      ['ecs', 'describe-tasks', '--cluster', cfg.cluster, '--tasks', taskArn, '--output', 'json', ...r],
      true,
    )) as {
      tasks?: Array<{
        lastStatus?: string
        stoppedReason?: string
        containers?: Array<{ name: string; exitCode?: number; reason?: string }>
      }>
    }
    const task = desc.tasks?.[0]
    if (task?.lastStatus === 'STOPPED') {
      container = task.containers?.find((c) => c.name === cfg.container)
      if (container?.exitCode !== 0) {
        throw new Error(
          `loom-render task exited ${container?.exitCode ?? 'unknown'} ` +
            `(reason: ${container?.reason ?? task.stoppedReason ?? 'n/a'}). ` +
            'Check CloudWatch /homemade/loom-render.',
        )
      }
      break
    }
    if (Date.now() > deadline) {
      throw new Error(
        `loom-render task did not finish within ${cfg.timeoutSec}s (last status ` +
          `${task?.lastStatus ?? 'unknown'}). Raise LOOM_RENDER_TIMEOUT_SEC or check the task.`,
      )
    }
  }

  // 4. rendered PNG -> local basePath.
  await aws(['s3', 'cp', `s3://${cfg.bucket}/${outKey}`, resolve(basePath), ...r])
}
