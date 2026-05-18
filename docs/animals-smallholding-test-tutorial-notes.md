# Animals & smallholding — test DRAFT tutorial notes

Two test tutorials are seeded as DRAFT under the new
animals-smallholding pipeline. Both are kept in
`packages/db/scripts/drafts/` alongside the existing cooking +
crafts drafts.

| Slug | Type | Sub-category | Season | Difficulty | Tests |
|---|---|---|---|---|---|
| `inspecting-a-beehive-in-summer` | TECHNIQUE | bees | SUMMER | INTERMEDIATE | short, season-bound, glossary-dense, single procedure |
| `setting-up-a-chicken-coop-for-first-time-keepers` | PATTERN | poultry | SPRING | BEGINNER | larger scope, decision-heavy, multi-step setup with no project arc |

## How to upload them to the database

The pipeline-setup commit does not upload these. To land them as
DRAFT once Rebecca has reviewed the notes:

```bash
# Seed sub-cats + glossary first
pnpm --filter "@homemade/db" exec tsx scripts/seed-animals-smallholding-taxonomy.ts

# Re-seed the master Tools table to pick up the new animals tools
pnpm --filter "@homemade/db" exec tsx scripts/seed-tools.ts

# Upload the two drafts
pnpm --filter "@homemade/db" exec tsx scripts/upload-tutorial.ts \
  scripts/drafts/inspecting-a-beehive-in-summer.json

pnpm --filter "@homemade/db" exec tsx scripts/upload-tutorial.ts \
  scripts/drafts/setting-up-a-chicken-coop-for-first-time-keepers.json
```

The upload script defaults to `--status DRAFT`. Do **not** pass
`--status PUBLISHED` on these — they stay DRAFT until Rebecca has
read them in admin and given the go-ahead.

Heroes ship unset. The image-sourcing orchestrator will source on
the first publish run; `priorityFor` has an animals-smallholding
branch that prefers Pexels then Wikimedia.

---

## Self-critique — `inspecting-a-beehive-in-summer`

- **Voice:** Calm, season-anchored, no editorial wrapping around
  the steps. The four-question framing (queen, laying, swarm,
  room) carries the inspection.
- **Factual claims:** Cross-referenced against NBU Beekeeper's
  Toolkit and BBKA Bee Craft. The "1,500 eggs a day" peak,
  "15 kg full National super," "60-second wait after smoke,"
  and "midday in still air > 15°C" are all standard UK references.
- **Glossary coverage:** 12 terms registered, 12 used inline
  (verified with the script in the test-tutorial review). All
  pre-seeded by `seed-animals-smallholding-taxonomy.ts` — no
  net-new terms on this tutorial.
- **Technique link:** One critical link to
  `lighting-a-bee-smoker` (technique tutorial not yet authored;
  link falls back to plain text until it is).
- **Season:** SUMMER. Body opens with "Summer is the working
  season" and references the May / June / July rhythm. Aligned.
- **Welfare framing:** Welfare is in the steps — "bees rolled or
  crushed at the frame edge are how queens get killed," the
  veil-only caveat for inexperienced keepers. No "consult a
  mentor" wrapping. Passes the welfare-framing rule.
- **Tools:** Six entries; all resolve against the new tools added
  to `data/tools.ts`. The bee-brush is optional in practice but
  listed as a working part of the inspection kit.
- **Image:** Will source on first publish run via the orchestrator;
  Pexels has reliable beekeeper-suit-and-frame photography under
  "beekeeper inspection" / "honey bee frame".

## Self-critique — `setting-up-a-chicken-coop-for-first-time-keepers`

- **Voice:** Practical and unfussy. The "three to six hens"
  framing keeps scope tight; the "you will end up with seven by
  the third spring" line is the kind of dry observation the
  author prompt asks for.
- **Factual claims:** DEFRA welfare code, BHWT resettlement guide,
  current Country Smallholding columns. Space sizing (1 m² coop
  per 3 birds; 4 m² run per bird) cites DEFRA. Hybrid layer
  output range (280–300 eggs / yr) is the current commercial
  figure for ISA / Lohmann / Bovans brown.
- **Glossary coverage:** 12 terms registered, 12 used inline.
  Notable additions wrapped into prose so the troubleshooter
  (which only takes plain-string fields) doesn't have to do the
  coverage work: `broody` in the moving-in paragraph, `moult` in
  the monthly-routine paragraph.
- **Technique link:** One link to `fitting-electric-poultry-netting`
  in the predator-proofing section. Critical-techniques list left
  empty — the coop will work without electric netting if the
  garden boundary is already solid.
- **Season:** SPRING. The setup story is a weekend project that
  lands the birds in late spring once frosts have eased; SPRING is
  the obvious tag. Could equally be YEAR_ROUND — see open
  questions below.
- **Welfare framing:** Welfare lives in steps — feed sizing, perch
  height, ventilation, predator-proofing. No "please consult a
  vet" wrapping. The first-month troubleshooter pairs symptoms
  with practical responses, not disclaimers.
- **Tools:** Nine entries (two flagged optional with notes:
  pop-hole auto-opener and electric poultry netting). All resolve
  in `data/tools.ts`.
- **Legal touch:** No CPH number needed for back-garden chickens
  under 50 birds, so no legal-touchpoint mention. Correct for
  this scope.
- **Project schedule:** Empty. The setup is a one-weekend project;
  the multi-week chicks-to-POL arc lives in a separate future
  tutorial.

---

## Open questions for Rebecca

1. **Tutorial types for animals-smallholding.** I used `TECHNIQUE`
   for the bee inspection and `PATTERN` for the coop setup. PATTERN
   was originally added for sewing/crochet/knitting; the upload
   validator allows it under any category and only requires the
   craft metadata block when the category is craft. The coop tutorial
   feels closer to "project" than to "technique" — but if you prefer
   one consistent type across the animals category, I'd switch the
   coop tutorial to `TECHNIQUE`. (No new tutorial-type value added;
   I considered "PROJECT" but the existing TutorialType enum doesn't
   include it and adding one is a migration.)

2. **Sub-category structure.** Six chosen: `bees`, `poultry`,
   `sheep-and-goats`, `rabbits`, `pigs`, `smallholding-skills`. The
   pairing of sheep-and-goats is conventional (similar husbandry,
   similar kit, similar parasite picture). Splitting into separate
   sub-categories would reduce per-page tutorial counts in the
   early library. I'm comfortable with the pairing; flag if you'd
   prefer separate sub-cats.

3. **Animals metadata block.** I did NOT add a new Tutorial-schema
   block for animals (species, count, multi-week-arc weeks,
   movement-required flag). The brief said to be conservative;
   existing `season`, `difficulty`, `timeMinutes`, `techniqueSlugs`,
   `projectSchedule`, `recipeTools` carry everything the two test
   tutorials need. If the autopilot run surfaces a recurring need
   for one of those fields, adding it later is a single migration.
   The `feedback_schema_all_fields_upfront.md` rule cuts the other
   way — happy to add an `animals` block in a follow-up session if
   you want the categorical insurance up-front.

4. **Image sourcing — USDA path.** The brief mentioned USDA as the
   first preference for livestock photos. There's no `usda.ts`
   adapter in `image-sourcing/`. Adding one is a meaningful piece
   of infrastructure (new env vars, search adapter, source-slug
   enum value, attribution metadata). I left it out of scope and
   set the orchestrator's animals priority to Pexels → Wikimedia →
   Unsplash → Pixabay → Flux. Pexels carries strong livestock
   photography in practice; Wikimedia covers the public-domain
   vintage-husbandry plates. Want a USDA adapter in a follow-up?

5. **Anti-tells file.** No `docs/animals-smallholding-anti-tells.md`
   was written. Other categories have one; the convention is to
   write it after the first pilot batch surfaces 3+ recurring
   patterns. Easier to write from real evidence than to predict.
   Flagging that the author prompt references it as if it exists;
   that reference is forward-pointing.

6. **Voice — "calm, knowing, slightly dry."** I leaned into the
   smallholder-comparing-notes voice but did not add any author
   citations the way Garden / Mindset do. Smallholding writing has
   a thinner canon. If you want a fixed reference voice (Seymour
   first, Fearnley-Whittingstall as the modern anchor, Carla Emery
   as the unfussy reference), I can lock those into the author
   prompt as the canonical voice references in a small follow-up.

7. **Hero image attribution for the coop test.** A coop-setup hero
   ideally shows a real UK back-garden coop with a treadle feeder
   and a covered run — niche enough that Pexels / Unsplash search
   may surface generic chicken portraits instead. Worth a manual
   image-sweep when this one moves toward publish.

---

## What the autopilot will pick up next

When you (Rebecca) are ready, the flip script does the work:

```bash
pnpm --filter "@homemade/db" exec tsx scripts/flip-animals-smallholding-ready.ts
```

It sets `pipelineStatus = READY` and nulls `lastAutopilotRunAt` so
the round-robin queue picks animals-smallholding on its next fire.
Until then `pipelineStatus = NOT_READY` and the autopilot skips it.
