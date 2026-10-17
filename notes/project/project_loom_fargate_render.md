---
name: project_loom_fargate_render
description: "The loom's Blender base render runs on AWS Fargate (live since 5 July 2026): how renderHero selects it, the pieces, and the rule that jobs use the probe task def. Trimmed 17 October 2026."
metadata:
  type: project
---

# Loom: Fargate render (trimmed 17 October 2026)

Live since 5 July 2026, deploy-verified. It is the same Blender render moved to a container, not a new one. The old "Rebecca-only steps" list is done and has been removed; the history is in git.

## How it is selected
- `renderHero` renders locally by default. `LOOM_RENDER=fargate` (or `renderMode: 'fargate'`) sends the base render through `apps/web/scripts/loom-fargate-render.ts`. The Fal finish, fidelity gate and R2 upload still run in the caller.
- Transport is a short-lived S3 scratch bucket with task-role access. No secrets go in the container.

## Pieces
- Image: `apps/web/scripts/loom-render/` (Dockerfile, entrypoint, README). Built by GitHub Actions (`.github/workflows/loom-render-image.yml`), not by the deploy workflow.
- Infra in `infra/lib/homemade-stack.ts`: ECR repo, scratch bucket, log group, an on-demand Fargate task def (not a standing service).

## Rules
- Crochet jobs render on the probe task def `homemade-loom-render-probe`, each under its own S3 `jobs/<job>-<n>/` prefix. Never touch the production task def, service or image.
- Very large scenes (pile hairs above about 4 million) run the probe out of memory. Lighten the scene; don't register a bigger task def.
- Before any `cdk deploy`, read [CDK deploy gotchas](../deploy_cdk_gotchas.md).
