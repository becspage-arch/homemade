---
name: project_loom_fargate_render
description: "Loom Blender base render containerised for AWS Fargate — DEPLOYED + VERIFIED live 2026-07-05 (Claude did the deploy). How renderHero selects it (LOOM_RENDER=fargate), the infra, the GitHub-Actions image build, and the break-glass policy on claude-deploy."
metadata: 
  node_type: memory
  type: project
  originSessionId: c0aec48d-396b-4fa0-9003-48f324fc9d89
---

**LIVE + verified end-to-end 2026-07-05 — Claude did the whole deploy (Rebecca
pointed out Claude has full AWS/GitHub access; the earlier "Rebecca-only steps"
framing below is superseded, kept for context).** What happened:
- `cdk deploy` ran from the session — claude-deploy can assume the CDK bootstrap
  roles (that's the mechanism; it doesn't need broad admin). It reconciled the
  WebTask from CLI-revision :19 to CDK-managed **:20** (pk_live + all MOUNT_*
  secrets preserved — passed the full prod env per [[deploy_cdk_gotchas]]); only
  the loom resources were added; /healthz stayed 200. First attempt failed on a
  non-ASCII em-dash in the SG description (EC2 rejects it) → clean rollback → fixed
  to a hyphen → redeployed green.
- The image is built by **GitHub Actions** (`.github/workflows/loom-render-image.yml`,
  workflow_dispatch + on loom-render/loom_render.py changes) on a Docker runner and
  pushed to ECR `homemade/loom-render:latest`. No local Docker; the GitHub *deploy*
  workflow does NOT build it.
- **Break-glass:** claude-deploy's `HomemadeScopedDeploy` scopes ECR to homemade/web
  only, so a scoped inline policy `LoomRenderBreakGlass` was added to claude-deploy
  (via its BreakGlassSelfPolicyManagement grant): ECR push to homemade/loom-render +
  S3 rw on homemade-loom-render + iam:PassRole on the two loom roles. That's what
  lets the build workflow push + an invoker run-task.
- **Verified:** the golden Countryside scene.json rendered on Fargate; fidelity gate
  vs the local Windows base = structure **1.0** / colour **0** (PASS) — the Linux
  container reproduces the local render essentially pixel-for-pixel. Cold run ~7.4
  min incl. image pull.

The loom's photoreal **base** render (Blender, CPU Cycles, headless) can now run
server-side on AWS Fargate as well as locally — the SAME render relocated, not
redesigned (loom_render.py untouched). This is the piece that lets needlework
generation run off Rebecca's PC. Landed on `main` 2026-07-05 (commit "feat(loom):
containerise the Blender base render for AWS Fargate"), deploy green + /healthz
200. Extends [[project_loom_engine_build_state]] (renderHero pipeline).

**How it's selected:** `renderHero` runs the local `blender.exe` by default;
`LOOM_RENDER=fargate` (or `{ renderMode: 'fargate' }`) routes the base render
through `apps/web/scripts/loom-fargate-render.ts` (`fargateRenderBase`, a drop-in
for the local `blenderRenderBase`). Rest of the chain (Fal upscale → fidelity
gate → R2) is unchanged and runs in the caller. Transport is a short-lived S3
scratch bucket (`homemade-loom-render`), IAM task-role access — no secrets in the
container. The invoker shells out to the AWS CLI (aws ecs run-task + s3 cp), so
it needs the Homemade AWS creds already in `.env.credentials`.

**Pieces:** `apps/web/scripts/loom-render/{Dockerfile,entrypoint.sh,README.md}`
(pinned Blender 4.2.9 Debian image); CDK additions in
`infra/lib/homemade-stack.ts` — ECR repo `homemade/loom-render`, the scratch
bucket, `/homemade/loom-render` log group, and the `homemade-loom-render` Fargate
task def (4 vCPU / 8 GB, run ON-DEMAND, not a standing service).

**NOT LIVE YET — Rebecca-only steps (need Docker Desktop + Homemade creds; can't
be done from a worktree sandbox):**
1. `cdk deploy` the stack (full production env, `cdk diff` first — see
   [[deploy_cdk_gotchas]]) to create the ECR repo, bucket, task def. Diff must
   show ONLY the ~7 new loom resources; nothing removed on the web task/ALB/secrets.
2. `docker build` the image (context `apps/web/scripts`, `-f loom-render/Dockerfile`)
   and push to the ECR repo `:latest`. GitHub deploy does NOT build this image.
3. Copy the six `LoomRender*` CDK outputs into `.env.credentials`
   (LOOM_RENDER_S3_BUCKET/CLUSTER/TASKDEF/SUBNETS/SECURITY_GROUP + set
   LOOM_RENDER=fargate) to activate it.
4. Verify: render the Countryside fixture on Fargate and compare with the
   fidelity gate to the local golden.

**Golden reference for the verify step** (produced locally this session):
`.loom-scratch/heroes/countryside.scene.json` (3852 strokes) + `countryside.base.png`.
Full how-to in `apps/web/scripts/loom-render/README.md`.

**Cross-OS caveat (told Rebecca):** local render is Windows Blender, container is
Linux Blender — same version + script + scene, so visually identical, but Cycles
CPU is not guaranteed bit-identical across OS/CPU. It's the same pipeline, not a
byte-for-byte pixel clone.
