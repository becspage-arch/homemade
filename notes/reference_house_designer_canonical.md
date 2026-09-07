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
`homemade-needlework`). Merged 2026-06-30 into the single `homemade` row and the helper
now keeps it from recurring.

**Checked 2026-09-06 against the live database:** exactly two Designer rows exist —
`homemade` (isHouseDesigner true, 1,219 patterns, 1,085 of them PUBLIC) and
`stitching-mama` (isHouseDesigner false, 36 patterns, 35 PUBLIC). The "537 cross-stitch
patterns" figure above was the count at the 2026-06-30 merge; it has grown with the fill.
`xs-volume-publish.ts` and `xs-volume-gen.ts` no longer exist (the local generator was
retired); the live publish paths are the bulk pipeline in
`apps/web/src/lib/studio/generation/bulk/` and the sampler publisher
`apps/web/scripts/xs-samplers-publish.ts`.

isHouseDesigner is load-bearing: the premium gate keys "independent designer ⇒
premium" off it — `isIndependentDesignerContent` / `isPremiumContent` in
`apps/web/src/lib/entitlements.ts` — and the designer spotlight on the pattern landing is
independent-only, so the house row must never flip to false. Stitching Mama
(`stitching-mama`) is still the one independent cross-stitch designer; its patterns are
premium and it powers the spotlight. See [[project/project_premium_free_spec]],
[[reference_script_env_dotenv_path]]. ([[project_business_model]] and
[[project_cross_stitch]] are not in notes/.)
