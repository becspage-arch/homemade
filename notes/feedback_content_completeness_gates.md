---
name: feedback_content_completeness_gates
description: Per-category content-completeness gate wired into every publish path so broken/skeleton content can never ship. Apply to every content authoring + publish worker.
metadata: 
  node_type: memory
  type: feedback
  originSessionId: a9f6be73-2820-4c1f-a9b9-577a37e33834
---

## Medical-disclaimer rule removed from checkers (2026-06-16, latest)

The in-body medical-disclaimer requirement is GONE from the PRACTICE, REMEDY,
and HERB_PROFILE makeability checkers (`qc-makeability-rules/practice.ts`,
`remedy.ts`, `herb-profile.ts`). The site-wide disclaimer is the single source;
the mindset voice lock bans in-body disclaimers. Do NOT add it back anywhere
(body, render component, or flag). The retained-and-different rules stay:
PRACTICE keeps "no medical advice/claims", REMEDY keeps "contraindications +
safety section", HERB_PROFILE keeps "cautions / contraindications".
`qc-publish-gate.ts` needed no change (it only delegates to the checkers).
Re-audit of DRAFT PRACTICE/REMEDY/HERB_PROFILE rows: 0 rows were ever
soft-blocked on disclaimer (the old check passed whenever a safety section /
heading was present, which those types require), so 0 republished. Locked
2026-06-16.

## Hard-enforcement run (2026-06-16, later) — current state

The makeability rules were re-hardened to enforce [[feedback_content_completeness_checklist]]
line for line and re-run. Cross-cutting em/en dash + banned phrasing now BLOCK
(no longer kept-and-flagged); the crochet/knitting "chart OR written" clause is
DEAD (chart MANDATORY). New sewing dispatcher `apps/web/src/lib/sewing/getResolvedPattern.ts`
resolves house (DB cols) + freesewing (live draft, CYC defaults) into one shape
that `qc-makeability-rules/pattern-sewing.ts` checks; UNRESOLVED = fail. New
`qcBlockReason` column on Pattern + SewingPattern (migration `..._patterns_001`).
Audit/un-publish runner is `apps/web/scripts/qc-hard-audit.ts --apply` (covers
Tutorials + standalone cross-stitch Pattern + SewingPattern; freesewing only
resolves in apps/web, so the runner lives there, not packages/db).

Result: audited 8,920 PUBLISHED public rows, **1,934 un-published (21.7%)** —
1,850 Tutorial → DRAFT, 39 cross-stitch + 45 sewing → PRIVATE. Remaining live:
6,945 Tutorial, 41 cross-stitch, 0 sewing. Dominant cause: 823 crochet+knitting
patterns are written-instruction-only (only 1 CrochetPattern chart row exists,
0 knitting) so the chart-mandatory rule un-published nearly all of them — the
intended consequence of killing the OR clause. Then recipe null-MEASURED-amount
(319), sewing structural gaps (45), cross-stitch no-attribution (38).

**Calibration principle (learned this run, important):** enforce items that
determine MAKEABILITY hard; detect them ACCURATELY (inline-named materials/tools,
prose method, troubleshooter nodes all count) so the rule fires on GENUINE
absence, not template-shape. A handful of checklist lines are NOT hard-blocked
because they conflict with another lock or are render-layer/conditional:
in-body medical disclaimer (mindset voice bans in-body disclaimers + no render
component exists — site-wide gap keyed off `requiresMedicalDisclaimer`),
what-to-expect/sensory (voice bans vague notice-lists), cut-list/safety
(checklist's own "when applicable" + over-prune non-cutting/low-risk tasks),
materials/tools for husbandry techniques (inapplicable, not absent), reading
conclusion-pointer (reference explainers end on their last section). Each is
flagged so Rebecca can promote to strict. Two single-rule blockers worth her
call: 200 techniques fail ONLY on no-common-mistakes, 44 stitches ONLY on
no-variations — genuine per the checklist, kept blocking.

## Makeability layer (2026-06-16) — the binding rule now

The completeness gate below is the FLOOR (no broken/skeleton bodies). On top of
it sits a stricter **per-TYPE makeability gate** that asks: *could a competent
person actually make this from what is on the page?* A real, non-broken body can
still be unmakeable — a cross-stitch pattern with no chart is the canonical case.

- Rules live one-file-per-TYPE in `packages/db/scripts/qc-makeability-rules/`
  (`shared.ts` helpers + generic checks; `index.ts` = `auditMakeability(ctx)`
  dispatcher keyed on (type, category, subcategory); `loader.ts` resolves linked
  craft-pattern rows + chart body-nodes into real chart facts). Files:
  pattern-cross-stitch / -crochet / -knitting / -needlework-counted /
  -needlework-surface / -project, recipe, technique, stitch, practice,
  growing-guide, remedy, herb-profile, reading.
- **Hard, binary, per type** (un-publish on failure): counted patterns
  (cross-stitch, blackwork, needlepoint, hardanger, sashiko) need a CHART —
  mandatory, no exceptions; recipes need quantified ingredients + method + yield
  + a timing signal; growing guides need sowing time/depth/spacing + climate +
  care + harvest + common problems; herb profiles need Latin binomial +
  identification + habitat + parts used + uses + cautions; techniques + project
  patterns need actionable STEPS; remedies need ingredients + method + dosage +
  safety. Crochet/knitting patterns pass on EITHER a chart OR written row/round
  instructions with stitch counts.
- **Two interpretation locks, learned the hard way (don't re-tighten without
  data):** (1) "Numbered steps" = a clear ACTION SEQUENCE — an orderedList,
  "Step N" headings, OR action-verb-led prose under descriptive headings. The
  Mary Berry voice writes prose method; demanding a literal `<ol>` would
  un-publish thousands of makeable recipes. (2) Detection counts action verbs
  PER BLOCK SEGMENT (paragraph/list-item), never over heading-merged flat text,
  with a broad imperative-verb set — otherwise procedures written under section
  headings ("Catching at night", "Day 7 candling") wrongly fail. Decision /
  comparison guides ("X vs Y", "options", "understanding…") genuinely have no
  procedure and correctly fail (they are READING mis-typed as TECHNIQUE →
  rebuild / re-type, not delete).
- **Kept-and-flagged, NOT un-published** (locked don't-over-prune): `voice:`
  nits (em/en dash, banned phrasing — the voice gate's job, fixed in place) and
  `flag:` improvements (open-ended practice with no stated duration; technique
  with no explicit completion criterion; project pattern with no materials list
  / cut list / clay-body / firing). Applied as hard rules these un-published
  makeable content (a wired light switch, a repair task with nothing to cut, a
  journal prompt), so they are demoted to non-blocking flags.
- **Glossary coverage is NOT re-checked here** — production glossaryTooltip
  marks reference the term by `termId`, not `termSlug`, so the
  [[feedback_glossary_tooltip_termslug]] note is wrong against live data; the
  upload-time voice gate already owns glossary. Re-checking produced only false
  positives.
- Wired via `qc-publish-gate.ts` (`checkRowPublishable` = completeness AND
  makeability) into `gatedPublishDrafts` + `uploadTutorial` (post-write
  pull-back). Audit/un-publish runner: `qc-makeability-audit.ts` (`--apply`).
  First run 2026-06-16: 9,035 PUBLISHED → 240 un-published (2.7%), 8,795 kept,
  467 voice-nit rows kept + flagged.

---

Every tutorial publish path runs a per-category **content-completeness gate**
before a row may go PUBLISHED. If the body fails, the row is HELD at DRAFT with
a structured `Tutorial.qcBlockReason` (`{ blocked, reasons[], rules[],
blockedFromStatus, checkedAt, source }`). Binary block or skip — **no warning
tier** (no one to triage), AI-only (never a human review queue).

**Why:** the autopilot shipped ~1,884 skeleton rows live (audited 2026-06-15).
1,765 carried the literal `Step-by-step instructions for <Title> go here.`
scaffold that `qc-fix.ts`'s `ensureMinimalMethod()` injects; the rest were
pattern skeletons with no row/round instructions, leaked `NaN`/`undefined`, or
broken foundation chains. The pattern-completeness gate existed
(`qc-pattern-completeness.ts`) but was never wired into the publish path, so
broken content kept shipping. This worker fixed the foundation.

**How to apply:**
- Rules live one-file-per-category in
  `packages/db/scripts/qc-completeness-rules/` (`shared.ts` = generic checks +
  rule builders; `index.ts` = `checkCompleteness(ctx)` dispatcher +
  `buildQcBlockReason`). Generic checks (empty / <100 chars / `NaN` /
  `undefined` / placeholder-scaffold) fire on EVERY category; per-category
  rules add structural checks (recipe needs ingredients+method[+yield/timing
  for cooking/baking]; textile PATTERN needs row/round unless counted/charted;
  craft PATTERN/TECHNIQUE need steps; prose categories lean on generic).
- The gate is wired at every publish call site: `uploadTutorial()` (the
  `--status PUBLISHED` path the autopilot + `_batch-upload.ts` use — downgrades
  to DRAFT + records reason), the batch flip scripts via
  `qc-gated-publish.ts` (`gatedPublishDrafts`), `editorial-pass-mindset-drafts`,
  and the admin publish transition (generic check, local mirror). The autopilot
  preflight refreshes `completeness-blocked-queue.json` each cycle.
- `qc-fix.ts --reprocess-blocked --auto-fix` drains the blocked DRAFT backlog:
  runs the fixer, re-checks completeness, re-publishes only rows that now pass
  (clears `qcBlockReason`); the rest stay DRAFT.
- The placeholder regex is **high-precision on purpose** — it matches the
  scaffold ("instructions … go here", lorem ipsum, TODO/TBD/FIXME) but NOT bare
  "placeholder" / "goes here" / "insert … here" (those are legit instructional
  prose and over-matched). Any other skeleton shape is caught by the structural
  checks, so the placeholder rule can stay tight. Keep it that way.
- Authoring workers: a row only goes live once it is genuinely complete. Don't
  rely on `ensureMinimalMethod`'s scaffold as a stand-in — it now fails the
  gate. Write the real method / rows.

Root-cause + rebuild scope: `packages/db/docs/content-rebuild-scope-2026-06-15.md`.
Schema: `Tutorial.qcBlockReason Json?` (migration
`20260915000000_phase_qc_block_reason_001`). Realises the
[[project_master_todo]] §6.5 "QC into the autopilot publish path" item. Related:
[[feedback_no_warning_tiers]], [[feedback_ai_only_moderation]].

(Cross-reference note, 2026-09-06: `[[project_master_todo]]` is not in notes/; the running list is `todo.md`.)
