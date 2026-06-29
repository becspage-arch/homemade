# The Gate — explicit judge-and-FIX checklist

The gate is the anti-junk control (see AI_DESIGN_SYSTEM.md). It is run by LOOKING
at the FINISHED render of every design — the exact artifact that would ship, never
a preview or an earlier render. It does not just pass/fail; **on a fixable fault it
repairs, and only culls what can't be fixed.**

## Per-design — every box must be YES or the design is REPAIRED

1. **Complete.** Nothing missing, dropped, cut off or garbled. No half-formed
   element, no lost face/eye/limb, no jagged unfinished edge, no stark unintended
   block of one colour. Every part of the subject is fully there.
2. **Crisp conversion.** Reads cleanly at stitch resolution — no mush, no confetti,
   no dead/empty patches, no broken outlines.
3. **Best-seller bar.** A clear "I'd buy this and hang it," not "it's ok."
4. **Colour.** Rich and intentional — not washed-out, muddy, or accidentally pale.
5. **Composition.** Balanced, centred, intentional — not lopsided, cropped or awkward.
6. **Original + safe.** Homemade-original; no shop/celebrity/brand/franchise IP.

## Set-level — judged across the whole batch

7. **Variety.** The set spans **size** (small/medium/large), **complexity**
   (single bold motif → dense detailed scene) and **style** (fun, cheery, cheeky,
   childlike, kawaii, vintage/old-fashioned, modern/minimalist, folk-art, gothic…).
   A set that comes out samey FAILS even if each piece is fine.
8. **No near-duplicates.** No two too alike in subject AND look.

## REPAIR actions (fix first; cull only when unfixable)

| Fault | Fix (re-generate that one design with…) |
|---|---|
| washed-out / pale | prompt "rich saturated bold colours" |
| too sparse / too simple | more colours + "detailed, intricate" |
| missing / cut-off / garbled element | **re-roll** (fresh Flux generation; it's stochastic) |
| mushy / confetti at size | fewer colours OR a bolder, flatter prompt |
| lopsided / bad crop | re-roll, or prompt "centred, full subject in frame" |
| too similar to another / off-brief style | re-brief that slug with a distinct style/subject/size |

Re-judge after every repair. Cap at ~3 repair attempts per design; if it still
fails, cull it (and, for a set, replace it with a fresh varied brief so the set
size + variety hold). **Nothing publishes until it passes every box.**

## How it runs today

A Claude vision pass (this session) over the batch's finished renders. Generate →
render → look → repair the fails (re-run those slugs with adjusted settings) →
re-look → publish only the all-YES designs. The driver supports per-design size +
colour settings and a `--regen` to re-roll a single slug, so the repair loop is
concrete, not hand-wavy.
