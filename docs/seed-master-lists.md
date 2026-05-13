# Seeding the master ingredient and tool lists

The TypeScript files in `packages/db/scripts/data/` are the source of truth
for both the master Ingredient and Tool tables. The seed scripts read them
directly and upsert idempotently — re-runs only touch rows whose fields
changed.

## What's there

- `packages/db/scripts/data/types.ts` — shared `IngredientSeed` and
  `ToolSeed` types plus the literal unions for categories, units,
  dietary flags, allergens, storage.
- `packages/db/scripts/data/ingredients.ts` — 547 rows across all 18
  ingredient categories. The TS is the source of truth.
- `packages/db/scripts/data/tools.ts` — 179 rows across all 17 tool
  categories.
- `packages/db/scripts/seed-ingredients.ts` — validates every row
  up-front (slug shape, category / unit / dietary / allergen / storage
  enum membership, that every `commonSubstitute` slug exists in the
  master list) then upserts. Reports created / updated / unchanged
  counts at the end.
- `packages/db/scripts/seed-tools.ts` — same pattern.
- `packages/db/scripts/generate-ingredient-master-md.ts` and
  `generate-tools-master-md.ts` — regenerate
  `docs/ingredient-master.md` and `docs/tools-master.md` from the TS
  sources.

## Local / dev dry-run

Use `--dry-run` to validate without writing. The script reports a
per-category count and exits.

```bash
pnpm --filter "@homemade/db" exec tsx scripts/seed-ingredients.ts --dry-run
pnpm --filter "@homemade/db" exec tsx scripts/seed-tools.ts --dry-run
```

## Dev seeding

Set `DATABASE_URL` to the dev Neon branch in `.env.credentials`, then:

```bash
pnpm --filter "@homemade/db" exec tsx scripts/seed-ingredients.ts
pnpm --filter "@homemade/db" exec tsx scripts/seed-tools.ts
```

Re-running is safe — unchanged rows skip the update.

## Production seeding (Rebecca runs this)

This is the only place that writes to prod. Worker sessions don't run
it; Rebecca does, with prod credentials in `.env.credentials`.

```bash
# Confirm DATABASE_URL points at production (not dev) — check the host
grep ^DATABASE_URL .env.credentials

# Optional sanity check
pnpm --filter "@homemade/db" exec tsx scripts/seed-ingredients.ts --dry-run
pnpm --filter "@homemade/db" exec tsx scripts/seed-tools.ts --dry-run

# Run for real
pnpm --filter "@homemade/db" exec tsx scripts/seed-ingredients.ts
pnpm --filter "@homemade/db" exec tsx scripts/seed-tools.ts
```

The script prints `done: N created, M updated, K unchanged`. First run
will be ~547 created for ingredients and ~179 for tools. Subsequent
runs after edits show created at 0 and the rest split between updated
and unchanged.

## Editing the lists

Edit the TS file. Add aliases for newly discovered regional or
brand-shorthand names. Add `commonSubstitutes` only as slugs that
already exist in the same file (the validator fails the run otherwise).

After editing:

```bash
pnpm --filter "@homemade/db" exec tsx scripts/generate-ingredient-master-md.ts
pnpm --filter "@homemade/db" exec tsx scripts/generate-tools-master-md.ts
```

Commit the TS and the regenerated markdown together. Re-run the seed
against dev (and prod, once happy) to apply the changes.
