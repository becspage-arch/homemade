# Cooking bulk-014 batch report

**Date:** 2026-05-18  
**Category:** cooking  
**Batch number:** 014  
**Status:** COMPLETE

## Summary

40 recipes authored and uploaded PUBLISHED across four international cuisine blocks: Greek (10), Spanish (10), Eastern European (10), French (10).

**Cooking count:** 582 → 616 (+34 net new; 6 pre-existing entries updated in-place)

## Cuisine breakdown

### Greek (10)
dolmades, yemista, fasolada, taramasalata, skordalia, melitzanosalata, tirokafteri, greek-roast-lamb, soutzoukakia, lemon-potatoes

### Spanish (10)
paella-mixta, croquetas-de-jamon, calamares-a-la-romana, chorizo-al-vino-tinto, patatas-alinadas, pimientos-de-padron, gambas-pil-pil, pulpo-a-la-gallega, empanada-gallega, chorizo-and-butter-bean-stew

### Eastern European (10)
kotlety-mielone, kotlety-schabowe, barszcz-czerwony, rosol, porkolt, lecso, blini, pelmeni, svickova-na-smetane, zurek  
_(Polish × 5, Hungarian × 2, Russian × 2, Czech × 1)_

### French (10)
gigot-d-agneau, poulet-roti, poulet-basquaise, poulet-a-la-moutarde, quiche-lorraine, confit-de-canard, sole-meuniere, steak-au-poivre, pot-au-feu, bouillabaisse

## Difficulty split

~27 BEGINNER / 13 INTERMEDIATE

## New ingredients seeded

- `padron-pepper` (Padrón pepper — for pimientos-de-padron)

## Voice-check and upload issues

~9 of 40 clean on first pass. Categories of errors found and fixed:

### Em-dash pairs (26 files, 30+ instances)
The most pervasive issue. The "Where this dish lives" closing paragraph almost always used em-dash pairs (— X —) to set off appositive phrases. Fixed by converting to parentheses, colons, or commas.

Example pattern:
- Before: `Paella mixta — the combined meat-and-seafood version — developed as the dish spread beyond its region.`
- After: `Paella mixta, the combined meat-and-seafood version, developed as the dish spread beyond its region.`

### JSON parse errors (4 files)
bouillabaisse, confit-de-canard, pot-au-feu, steak-au-poivre all had a stray right-single-quotation-mark `'` at the end of a heading text string (missing closing `"`), making the file invalid JSON. Fixed with raw string replacement before content parsing.

### Banned phrases (3 files)
- `essentially` (kotlety-mielone body[0])
- `genuinely` (tirokafteri body[0], quiche-lorraine troubleshooter fix)

### Ingredient slug corrections (10 files)
- `egg` → `eggs` (plural form: blini, empanada-gallega, lecso, pelmeni, quiche-lorraine, zurek, plus kotlety-mielone, kotlety-schabowe, croquetas-de-jamon, soutzoukakia)
- `breadcrumbs` → `breadcrumbs-fresh` (soaked-in-milk context) or `breadcrumbs-dried` (coating context)
- `cumin` → `cumin-ground` (soutzoukakia)
- `cinnamon` → `cinnamon-ground` (soutzoukakia)

### GlossaryTooltip attr fix (2 files)
dolmades and taramasalata registered glossary terms (`mezze`, `tarama`) with inline marks that used `attrs: { term: "..." }`. The voice-check-lib.ts checks `mark.attrs.termSlug`. Fixed to `attrs: { termSlug: "..." }`.

## Anti-tells to fold back

1. **Em-dash pairs in closing paragraphs.** The "Where this dish lives" paragraph pattern consistently produced em-dash pairs (— X —) when setting off etymological asides, geographic clarifications, or ingredient lists. Rewrite prompt guidance: one em dash per paragraph maximum; use parentheses for inline glosses.
2. **Ingredient slug pluralisation.** Bare ingredient names (`egg`, `breadcrumbs`) need their canonical plural forms from the master table. Pre-author check: grep master list for both singular and plural before using.
3. **Heading text unclosed strings.** Some heading nodes ended with a trailing `'` character instead of a closing `"`. Likely a generation artefact in long-continuation sessions. Post-auth JSON validity check would catch these.
4. **GlossaryTooltip termSlug not term.** When adding inline glossary marks, the attr key is `termSlug` not `term`.
