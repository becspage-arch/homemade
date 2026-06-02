# Cooking — bulk-batch-038 — report

**Date:** 2026-06-02
**Category:** cooking
**Batch:** 038
**Entries uploaded:** 40 PUBLISHED (40 uploaded, all confirmed PUBLISHED in DB)
**Net new PUBLISHED (cooking):** 1,240 → 1,276 (+36 net; 4 were upserts of existing records)

## Slice

Italian: pasta, risotto, and meat mains.

**Italian pasta (12 entries — 01–12):** pappardelle-ai-funghi-misti, spaghetti-alle-vongole, spaghetti-alle-vongole-in-bianco, trenette-al-pesto, rigatoni-alla-genovese, rigatoni-alla-norcina, rigatoni-con-polpettine, orecchiette-con-salsiccia, tagliatelle-ai-funghi, pasta-alla-zozzona, farfalle-al-salmone, conchiglie-al-pesto

**Italian risotto (5 entries — 13–17):** risotto-alla-milanese, risotto-al-barolo, risotto-alla-pescatora, risotto-allo-zafferano, risotto-al-tartufo

**Italian meat mains (23 entries — 18–40):** scaloppine-al-limone, scaloppine-al-marsala, cotoletta-alla-milanese, tagliata-di-manzo, polpette-al-sugo, polpettone, spezzatino-di-manzo, pollo-con-peperoni, pollo-alla-milanese, pollo-alla-romana, coniglio-in-umido, porchetta, maiale-al-latte, salsiccia-e-fagioli, coda-alla-vaccinara, brasato-al-barolo, stracotto, coniglio-alla-cacciatora, agnello-in-fricassea, abbacchio-alla-romana, suppli, arancini-al-burro, polpo-alla-luciana

## Voice-check fixes

Pre-upload fixes required across the batch:

- **Em-dashes** — 7 files had em-dashes in body prose (files 01, 02, 07, 11, 15, 30, 40). Replaced with commas, semicolons, colons, or restructured sentences.
- **Grade-level errors** — 16 files had "Where this dish lives" paragraphs scoring above grade 12. Simplified vocabulary and shortened sentences across all 16.
- **Banned phrase "genuinely"** — file 33 (brasato-al-barolo). Replaced.
- **Medical claim "treats"** — file 27 (pollo-alla-romana). Replaced with "uses".
- **servings-yield conflict** — files 38 (suppli) and 39 (arancini-al-burro). Removed `servings`, kept `yieldDescription`.
- **Glossary term mismatch** — file 16 (risotto-allo-zafferano) had a glossary term slug "alloro" not referenced in body. Removed the term.

Final result: all 40 files 0 errors before upload.

## Hero fill

40 heroes sourced (26 Unsplash, 14 Pexels, 0 failed). Relevance queue written to `docs/image-relevance-queue-cooking-bulk-038.json`.

## QC fix

Post-publish qc-fix: 4 auto-fixed, 36 still blocked (handed to hourly qc-fix-batch).

## Ingredient notes

- **Veal**: not in ingredient lookup. Scaloppine and cotoletta made with chicken-breast and pork-chop respectively (noted in recipes).
- **Pine nuts**: not in ingredient lookup. Omitted from coda-alla-vaccinara (noted in infoPanel).
- **Cocoa / unsweetened cocoa**: not in ingredient lookup. Omitted from coda-alla-vaccinara (noted in infoPanel).
- **Radicchio**: not in ingredient lookup. Replaced risotto-al-radicchio with risotto-allo-zafferano.
- **Hare, guinea fowl, wild boar**: not in ingredient lookup. Substituted with other dishes from the Italian backlog.
