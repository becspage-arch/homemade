---
name: reference_category_visibility_enforcer
description: "Taking a category public is a CODE change (enforce-launch-visibility.ts), not a DB flip — a direct isPublicVisible write is reverted on the next deploy"
metadata: 
  node_type: memory
  type: reference
  originSessionId: c6e375ff-689c-4184-96e3-d56d41c92b17
---

The canonical "make a category public" switch is the `LAUNCH_VISIBLE_CATEGORY_SLUGS`
array in `packages/db/scripts/enforce-launch-visibility.ts`. That script runs LAST
among the deploy's visibility steps and forces `Category.isPublicVisible = true` for
exactly the slugs in that array and `= false` for every other category, every deploy.

So a direct `prisma.category.update({ isPublicVisible: true })` (or an admin toggle)
is authoritative only until the next deploy, which silently re-hides the category.
This bit the needlework go-live: a manual flip showed /needlework live, then the next
deploy reverted it to 404.

To take a category live durably: add its slug to `LAUNCH_VISIBLE_CATEGORY_SLUGS`,
commit, and (for an immediate flip without waiting for the deploy) run
`pnpm --filter @homemade/db exec tsx scripts/enforce-launch-visibility.ts` against
prod from a worktree. As of needlework go-live the visible set is
cooking, baking, cross-stitch, needlework.

The older per-category `flip-*-public.ts` scripts are deprecated — this enforcer owns
the dimension. Relates to [[project_category_signoff_flow]] and [[playbook_category_signoff]].
