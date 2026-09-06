---
name: voice-rewrite-dont-over-prune
description: "Voice rewrites fix register, they don't delete entire sections; preserve substance and rewrite language, never strip a section because it has a banned phrase"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 469fdc14-ecef-4ade-8083-66a7ac6fb146
---

When a worker is doing a voice retrofit on existing PUBLISHED content, the job is to FIX the register, not to delete content.

**Why:** Rebecca said directly (2026-05-25 after the voice-pilot) when the worker had stripped calendula's entire "Dosing" and "When NOT to use this salve" sections in pursuit of the no-medical-thresholds rule: "Large quantities of information have been removed from these... The adjustment of wording & voice is excellent but it's not ok to just remove everything else."

The original sections had substance worth keeping (dose amounts, daisy-family allergy guidance, eczema-see-GP note) PLUS specific medical thresholds that violated rules ("burns larger than the size of your palm", "fifteen minutes of pressure"). The right move is to rewrite the language to the canonical safety pattern (immediate action + "seek medical care if needed"), KEEPING the substance.

**How to apply:**
- When a paragraph or section trips a voice rule, REWRITE the offending language; don't delete the section.
- If a whole section is about something the new rules disallow (e.g. a multi-paragraph safety block, when the rule is "max one inline safety line"), compress the section to one line — don't delete the topic. The reader who got value from the original deserves the substance in the new register.
- If a section's content is genuinely banned (e.g. price quotes in a dev product card), remove the offending field but preserve the rest of the block.
- The bar: a reader reading the rewritten page should NOT lose useful information vs the original. They should gain readability, not lose substance.

**Worker prompt template additions:**
Every voice-retrofit worker prompt must include:
- "Rewrite the language, don't delete the section."
- "Preserve all substance — dose amounts, allergy notes, technique tips, etc. — even when the original wording trips a rule."
- "Before committing, count words removed per file. Anything over 20% loss needs an explicit reason or restoration."
