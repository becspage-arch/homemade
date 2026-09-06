# Loom render on Fargate

The loom's photoreal **base** render is Blender (CPU Cycles, headless). Locally
it's `blender.exe`, spawned by `scripts/loom-render-hero.ts`. This directory
containerises the **identical** render so it can run server-side (off Rebecca's
PC) — same pinned Blender (4.2.9), same `loom_render.py`, same `scene.json` +
samples. Nothing about the render changes; only where it runs.

The rest of `renderHero` (Fal creative-upscale, fidelity gate, R2 persist) is
unchanged and runs in the calling process either way.

```
scene.json ──▶ S3 (scene key) ──▶ [Fargate: aws s3 cp → blender → aws s3 cp] ──▶ S3 (out key) ──▶ base.png
                    ▲                                                                    │
   loom-fargate-render.ts (ecs run-task, poll, download)  ◀───────────────────────────┘
```

## Pieces

- `Dockerfile` — Debian + pinned Blender 4.2.9 + AWS CLI + `loom_render.py`.
- `entrypoint.sh` — fetch scene from S3 → headless CPU Blender → upload PNG.
- `../loom-fargate-render.ts` — caller side (`fargateRenderBase`), a drop-in for
  the local `blenderRenderBase`. Selected by `LOOM_RENDER=fargate`.
- CDK (`infra/lib/homemade-stack.ts`) — ECR repo `homemade/loom-render`, scratch
  bucket `homemade-loom-render`, log group `/homemade/loom-render`, and the
  `homemade-loom-render` Fargate task definition (4 vCPU / 8 GB, run on-demand).

## Selecting the Fargate render

`renderHero` runs the local blender.exe by default. To use Fargate, set
`LOOM_RENDER=fargate` (or pass `{ renderMode: 'fargate' }`) plus these env vars,
taken from the CDK stack outputs (put them in `.env.credentials`):

| env var                      | CDK output               |
| ---------------------------- | ------------------------ |
| `LOOM_RENDER_S3_BUCKET`      | `LoomRenderScratchBucket`|
| `LOOM_RENDER_CLUSTER`        | `LoomRenderClusterArn`   |
| `LOOM_RENDER_TASKDEF`        | `LoomRenderTaskDefArn`   |
| `LOOM_RENDER_SUBNETS`        | `LoomRenderSubnets`      |
| `LOOM_RENDER_SECURITY_GROUP` | `LoomRenderSecurityGroup`|
| `LOOM_RENDER_CONTAINER`      | `loom-render` (default)  |
| `LOOM_RENDER_REGION`         | `eu-west-2` (default)    |
| `LOOM_RENDER_TIMEOUT_SEC`    | `1500` (default, 25 min) |

The caller uses the AWS CLI with the Homemade creds already in
`.env.credentials` (`aws ecs run-task` + `aws s3 cp`).

## Build + push the image (needs Docker + Homemade AWS creds)

CDK references the image by ECR tag (`fromEcrRepository(..., 'latest')`), the
same pattern as the web image, so **the image must exist in ECR before the task
can run**. The GitHub deploy does NOT build this image — build + push it
manually (Docker Desktop required; not available in the worktree sandbox).

```bash
# from repo root, with .env.credentials sourced (Homemade account 213615929920)
set -a && . ./.env.credentials && set +a
REPO="$AWS_ACCOUNT_ID.dkr.ecr.eu-west-2.amazonaws.com/homemade/loom-render"

aws ecr get-login-password --region eu-west-2 \
  | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.eu-west-2.amazonaws.com"

# build context is apps/web/scripts (so the image can COPY loom_render.py)
cd apps/web/scripts
docker build --platform linux/amd64 -f loom-render/Dockerfile -t "$REPO:latest" .
docker push "$REPO:latest"
```

The ECR repo is created by `cdk deploy` — run that first (below) if the repo
doesn't exist yet, then build/push, then the task can run.

## Deploy the infra (`cdk deploy`, Homemade creds)

⚠️ A naive `cdk deploy` reconciles the WHOLE `HomemadeStack` and will rip out
production secrets/listeners if the deploy env is incomplete. Follow
`deploy_cdk_gotchas`: pass the full production env, `cdk diff` first, and
confirm the diff shows ONLY the new loom-render resources (ECR repo, S3 bucket,
log group, task def + roles, security group, 6 outputs) — nothing removed or
changed on the web task, ALB, or secrets.

```bash
set -a && . ./.env.credentials && set +a
export CDK_DEFAULT_ACCOUNT="$AWS_ACCOUNT_ID"
export CDK_DEFAULT_REGION=eu-west-2

# The full production deploy env (see deploy_cdk_gotchas):
export ORIGIN_CERT_ARN=arn:aws:acm:eu-west-2:213615929920:certificate/0d005b14-a834-45bf-b4ee-eaee93d135a1
export HTTP_PORT_80_REDIRECT=1
export MOUNT_CLERK_WEBHOOK_SECRET=1 MOUNT_PHASE1_SECRETS=1 MOUNT_TYPESENSE_SECRETS=1 \
       MOUNT_IMAGE_SOURCING_SECRETS=1 MOUNT_STRIPE_SECRETS=1
# ...plus NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (pk_live), the Stripe price ids,
#    CLOUDFLARE_IMAGES_DELIVERY_HASH, UNSPLASH_APPLICATION_ID — all in .env.credentials.

pnpm --filter @homemade/infra exec cdk diff    # inspect: ONLY loom-render adds
pnpm --filter @homemade/infra exec cdk deploy
```

Then copy the six `LoomRender*` outputs into `.env.credentials`.

## Verify a fixture renders identically

```bash
# 1. Local golden (base only) — this is the reference:
cd apps/web && npx tsx scripts/loom-render-hero.ts \
  src/lib/loom/fixtures/countryside.pattern.json countryside --no-persist
#    → .loom-scratch/heroes/countryside.base.png  (+ countryside.scene.json)

# 2. Fargate render of the SAME scene, then compare with the fidelity gate:
LOOM_RENDER=fargate npx tsx scripts/loom-render-hero.ts \
  src/lib/loom/fixtures/countryside.pattern.json countryside-fg --no-persist
npx tsx scripts/loom-fidelity-gate.ts \
  .loom-scratch/heroes/countryside.base.png .loom-scratch/heroes/countryside-fg.base.png
```

The gate compares edge structure + colour; the two should match to a near-1.0
structure score. Note: the local render is Windows Blender and the container is
Linux Blender — same version + script + scene, so the image is visually
identical, but Cycles CPU is not guaranteed bit-identical across OS/CPU. It's
the same pipeline, not a byte-for-byte pixel clone.

## Proving a render-script change before the merge

The container only runs the scripts baked into the image, and the image is only
rebuilt by `loom-render-image.yml` on a push to **main**. So a change to
`loom_render_crochet.py` / `loom_render.py` is normally unprovable until after
it has merged — and a Blender-side change that silently does nothing looks
exactly like one that worked (STITCH_ENGINE §8e-2 Part C: a compositor branch
shipped, rebuilt, re-rendered every hero, logged all of its operations, and
changed not one pixel).

`probe-run.sh` closes that gap. It runs the CANDIDATE script out of S3 on the
current image, sweeping one `view` value and uploading a PNG per step:

```bash
set -a && . ./.env.credentials && set +a
B=homemade-loom-render; P=jobs/probe1

# 1. candidate script + a real scene.json + the runner into the scratch bucket
aws s3 cp apps/web/scripts/loom_render_crochet.py s3://$B/$P/render.py
aws s3 cp apps/web/scripts/loom-render/probe-run.sh s3://$B/$P/run.sh
aws s3 cp .loom-scratch/crochet/patterns/<slug>.json s3://$B/$P/coaster.json

# 2. a throwaway task def: the production one with a bash entryPoint.
#    Same image, same roles, same log group; register ONCE, reuse after that.
#    (Take taskRoleArn/executionRoleArn from
#     `aws ecs describe-task-definition --task-definition homemade-loom-render`.)
aws ecs register-task-definition --cli-input-json file://probe-taskdef.json

# 3. run the ramp (~1 min for five 420px/24-sample steps)
aws ecs run-task --cluster homemade --task-definition homemade-loom-render-probe \
  --launch-type FARGATE --count 1 --network-configuration "$NET" \
  --overrides '{"containerOverrides":[{"name":"loom-render",
    "command":["aws s3 cp s3://$LOOM_S3_BUCKET/$PROBE_PREFIX/run.sh /tmp/run.sh && bash /tmp/run.sh"],
    "environment":[{"name":"LOOM_S3_BUCKET","value":"homemade-loom-render"},
                   {"name":"PROBE_PREFIX","value":"jobs/probe1"},
                   {"name":"PROBE_SCENE","value":"coaster"},
                   {"name":"PROBE_RES","value":"420"},
                   {"name":"PROBE_SAMPLES","value":"24"},
                   {"name":"PROBE_KS","value":"1 4 8 12 16"}]}]}'

# 4. pull the PNGs and measure. Always include the no-op step (x1) — if it does
#    not reproduce the currently-served number, the probe itself is wrong.
aws s3 cp s3://$B/$P/ . --recursive --exclude '*' --include '*.png'
```

Then re-run the winning value at the scene's production `resY` and samples for
the number that goes in the handbook. `probe-run.sh` sweeps `view.groundWhite`;
edit the key it writes to sweep a different one.

The probe task definition is a separate family — it never touches
`homemade-loom-render`, which the render pipeline pins. Clean up the S3 prefix
afterwards; scene JSONs run to tens of MB.
