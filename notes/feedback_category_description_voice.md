---
name: Category descriptions — pure factual lists, no framing
description: Category descriptions should be a plain list of what's inside, written for the user's curiosity, not editorial framing
type: feedback
originSessionId: 6c0cfe69-6a03-4d34-a559-3fe119b4afe7
---
Category descriptions on homemade.education are a list of what's inside the category. Nothing else.

**Banned:**
- Identity statements ("the craft of...", "the practice of...", "yarn worked with a single hook into fabric")
- Source provenance ("Public-domain pattern reference") — users don't care where patterns come from as long as they're not plagiarised
- Defensive disclaimers ("Practical, non-medical", "not medical advice", "Home apothecary basics") — kills the vibe and signals legal anxiety where the user wanted to browse
- Editorial scoping ("British and European canon plus...") — "canon" is jargon, scope is implicit from content
- Process trivia ("Weights in grams, conventional °C temperatures, classical and modern methods") — that's a recipe-rendering decision, not what the user wants to know about the category
- Connective phrasing ("the techniques that support them") — weird, reads as AI
- Anything aspirational, emotional, or framing the craft's significance

**Allowed:** A list. Items separated by commas. Optionally a trailing "Plus X, Y" if a sub-set sits slightly apart.

**Why:** Rebecca explicitly rejected the "factual anchor + list" pattern as still AI-feeling. She prefers terse lists like "Cross-stitch, tatting, lacemaking, and needlepoint." over anything richer. Descriptions should answer "what's in here?" not "what does this mean?"

**How to apply:** When drafting or editing category / subcategory descriptions in `packages/db/scripts/seed-categories.ts`, strip everything that isn't a list of what's inside. Apply to subcategory descriptions too (mindset practice types, etc.).
