---
name: reference_house_designer_canonical
description: "one canonical Homemade house designer (slug 'homemade'); publish paths must use ensureHouseDesigner()"
metadata: 
  node_type: memory
  type: reference
  originSessionId: 4d0de1cf-5dc1-4ca9-91f2-6fe91b5a468a
---

There is ONE canonical Homemade house designer: **slug `homemade`**, displayName
"Homemade", `isHouseDesigner: true`. Every publish path attaches house-original
patterns through **`ensureHouseDesigner()` from `@homemade/db`** (src/house-designer.ts)
— never a hardcoded `prisma.designer.upsert({ slug: ... })`.

Why: publish scripts each used to hardcode their own slug, which drifted into
duplicate "Homemade" rows (`homemade` 294 + `homemade-cross-stitch` 243 + an empty
`homemade-needlework`). Merged 2026-06-30 into the single `homemade` row (537
cross-stitch patterns) and the helper now keeps it from recurring. ai-crossstitch-publish,
xs-volume-publish and needlework-counted-proof all call the helper.

isHouseDesigner is load-bearing: the premium gate keys "independent designer ⇒
premium" off it ([[project_business_model]]), and the designer spotlight on the
pattern landing is independent-only — so the house row must never flip to false.
Stitching Mama (`stitching-mama`) is the one independent cross-stitch designer; its
patterns are premium and it powers the spotlight. See [[project_cross_stitch]],
[[reference_script_env_dotenv_path]].
