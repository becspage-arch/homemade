# Cooking bulk-026 batch report

**Date:** 2026-05-19  
**Session:** autopilot-queue  
**Category:** Cooking  
**Count:** 40 recipes PUBLISHED  
**Cooking total:** 969 → 1009

---

## Slugs published

### Italian pasta (20)
- spaghetti-aglio-e-olio
- spaghetti-alla-carbonara
- spaghetti-alla-nerano
- spaghetti-alla-norma
- bucatini-alla-puttanesca
- linguine-ai-gamberi
- linguine-allastice
- linguine-al-pesto
- fettuccine-al-burro-e-salvia
- fettuccine-ai-funghi-porcini
- pappardelle-al-cinghiale
- pappardelle-ai-porcini
- penne-ai-quattro-formaggi
- penne-al-salmone
- trofie-al-pesto
- pici-allaglione
- lasagne-al-forno

### Eastern European (13)
- golubtsy-russian
- kasha
- vinaigrette-salad
- holodets
- salo
- karp-w-galarecie
- knedliky-bread
- knedliky-potato
- goulash-czech-style
- hortobagyi-palacsinta
- veal-paprikash
- tarhonya
- placki-ziemniaczane

### Anglo-Indian & British Indian (7)
- anglicised-dhansak
- anglo-indian-curry-powder
- anglo-indian-fish-curry
- devilled-chicken-livers
- major-greys-chutney
- mughlai-chicken
- vegetarian-mulligatawny
- vindaloo
- vindaloo-chicken
- stroganina

---

## Voice-check fixes

### Em-dash appositive pairs (24 files)
Pattern: `X — Y — Z` → `X (Y) Z` or `X, Y, Z` or `X: Y`

Files fixed: karp-w-galarecie, spaghetti-alla-carbonara, lasagne-al-forno, linguine-allastice, stroganina, goulash-czech-style, knedliky-potato, vegetarian-mulligatawny, vindaloo, anglicised-dhansak, mughlai-chicken, devilled-chicken-livers, anglo-indian-curry-powder, major-greys-chutney, bucatini-alla-puttanesca, fettuccine-al-burro-e-salvia, pappardelle-al-cinghiale, linguine-al-pesto, trofie-al-pesto, pici-allaglione, penne-ai-quattro-formaggi, linguine-ai-gamberi, veal-paprikash, vinaigrette-salad, kasha, golubtsy-russian, holodets, placki-ziemniaczane, anglo-indian-fish-curry.

### Glossary-coverage (8 files)
Terms registered in `glossaryTerms[]` but never used inline as `glossaryTooltip` marks — removed from glossaryTerms:
- karp-w-galarecie: `aspic`
- spaghetti-alla-carbonara: `guanciale`
- lasagne-al-forno: `bechamel`
- fettuccine-al-burro-e-salvia: `beurre-noisette`
- pappardelle-al-cinghiale: `soffritto`
- veal-paprikash: `paprika`
- holodets: `aspic`
- salo: `dry-cure`

### Banned phrases
- vinaigrette-salad: `genuinely` → `much`
- spaghetti-alla-norma: `genuinely` → `distinctly`
- pappardelle-al-cinghiale: `genuinely simmering` → `properly simmering`

### Servings-yield conflicts (4 files)
Files where `yieldDescription` was set but `servings` was not null — fixed by setting `servings: null`:
- knedliky-bread (yields "2 dumpling rolls, 8–10 slices")
- knedliky-potato (yields "8 dumplings")
- anglo-indian-curry-powder (yields "approximately 80 g")
- major-greys-chutney (yields "approximately 500 g")

### Structural fixes
- veal-paprikash: removed stray `<paprika>paprika</paprika>` XML tags embedded in method text
- holodets: `"target window"` (brand-trademark warning) → `"correct"` in troubleshooter fix text
- placki-ziemniaczane: `"Pancakes fall apart"` → `"Pancakes break apart"` (false positive for americanism `fall`)

---

## Upload fixes

### Missing ingredient slugs (24 added to ingredients.ts, re-seeded)

**Pasta shapes (new):** `spaghetti`, `linguine`, `fettuccine`, `pappardelle`, `penne`, `fusilli`

**Cheese (new):** `fontina`, `pecorino`

**Dairy:** `full-fat-yoghurt`

**Fresh herbs:** `parsley`, `coriander-fresh`

**Fresh aromatics:** `ginger-fresh`, `shallots`

**Spices:** `turmeric-ground`, `mustard-seeds`, `cardamom-pods`, `dried-marjoram`

**Fish / seafood:** `raw-king-prawns`, `anchovy-fillets`

**Vegetables / fungi:** `black-olives`, `dried-porcini`

**Nuts:** `ground-almonds`

**Fruit:** `cooking-apple`

**Stock:** `vegetable-stock`

### Missing tool slugs (4 added to tools.ts, re-seeded)
- `frying-pan-28` (28 cm frying pan)
- `roasting-tin`
- `potato-masher`
- `whisk`

---

## Upload result
40 / 40 uploaded as PUBLISHED. 0 failures.
