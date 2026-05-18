"""Fix em-dash violations in batch-019 briefs.

Rules: max 1 em-dash per paragraph, max 1 per sentence.
- Parenthetical pairs (— X —) → (X)
- Two standalone em-dashes in same text block: change one to colon
"""

import json
import re
import sys
from pathlib import Path

BRIEFS_DIR = Path(__file__).parent / "bulk-batch-019-briefs"

# Each entry: (filename, old_string, new_string)
# Using exact substring replacement to be safe
FIXES = [
    # beef-madras.json
    ("beef-madras.json",
     "lamb madras — high chilli, tamarind sourness, dark thick sauce — but",
     "lamb madras (high chilli, tamarind sourness, dark thick sauce) but"),
    ("beef-madras.json",
     "Beef also benefits more than lamb from making a day ahead — the sauce penetrates",
     "Beef also benefits more than lamb from making a day ahead: the sauce penetrates"),
    ("beef-madras.json",
     "When made properly — braised until the collagen has broken down and the sauce has had time to develop — beef madras",
     "When made properly, braised until the collagen has broken down and the sauce had time to develop, beef madras"),

    # beef-vindaloo.json
    ("beef-vindaloo.json",
     "in the vindaloo marinade — wine vinegar, large quantities of chilli, garlic, and warming spices — until",
     "in the vindaloo marinade (wine vinegar, large quantities of chilli, garlic, and warming spices) until"),

    # chicken-biryani.json
    ("chicken-biryani.json",
     "parboiled separately to about 70% cooked — no more — so it finishes",
     "parboiled separately to about 70% cooked (no more) so it finishes"),
    ("chicken-biryani.json",
     "The dum stage — sealed cooking in the oven — is not optional",
     "The dum stage (sealed cooking in the oven) is not optional"),
    ("chicken-biryani.json",
     "from other rice dishes — it is served as a complete meal",
     "from other rice dishes: it is served as a complete meal"),

    # chicken-dopiaza.json
    ("chicken-dopiaza.json",
     "at two stages — once to make the sauce base, once as a textural element — is documented",
     "at two stages (once to make the sauce base, once as a textural element) is documented"),
    ("chicken-dopiaza.json",
     "The first batch — finely chopped — must cook",
     "The first batch (finely chopped) must cook"),
    ("chicken-dopiaza.json",
     "The second batch of onions — sliced more coarsely — goes in",
     "The second batch of onions (sliced more coarsely) goes in"),

    # chicken-korma.json
    ("chicken-korma.json",
     "The whole spices — cardamom pods, cinnamon stick, cloves — go into",
     "The whole spices (cardamom pods, cinnamon stick, cloves) go into"),

    # chicken-passanda.json
    ("chicken-passanda.json",
     "show clearly on the plate — a visual signal of its mildness",
     "show clearly on the plate: a visual signal of its mildness"),

    # chicken-pathia.json
    ("chicken-pathia.json",
     "the three elements — sweet, sour, hot — need to be in tension",
     "the three elements (sweet, sour, hot) need to be in tension"),

    # chicken-saag.json
    ("chicken-saag.json",
     "The spinach sauce is built first — onion caramelised, spices added, spinach wilted and blended — and then",
     "The spinach sauce is built first (onion caramelised, spices added, spinach wilted and blended) and then"),

    # chicken-tikka.json
    ("chicken-tikka.json",
     "The goal is surface colouration — dark patches where the marinade has caramelised — while",
     "The goal is surface colouration (dark patches where the marinade has caramelised) while"),
    ("chicken-tikka.json",
     "The tikka marinade formula — yoghurt, garlic, ginger, garam masala — is the base",
     "The tikka marinade formula (yoghurt, garlic, ginger, garam masala) is the base"),

    # coronation-chicken.json
    ("coronation-chicken.json",
     "Season with salt and taste — it should be noticeably spiced, sweet, and tangy.",
     "Season with salt and taste: it should be noticeably spiced, sweet, and tangy."),

    # garlic-naan.json
    ("garlic-naan.json",
     "garlic naan — brushed with garlic butter after cooking — became",
     "garlic naan (brushed with garlic butter after cooking) became"),
    ("garlic-naan.json",
     "Naan dough is soft — softer than bread dough — and needs",
     "Naan dough is soft (softer than bread dough) and needs"),
    ("garlic-naan.json",
     "The naan goes in dry — no oil — and cooks",
     "The naan goes in dry (no oil) and cooks"),

    # kedgeree.json
    ("kedgeree.json",
     "alongside other Anglo-Indian inheritances — mulligatawny soup, coronation chicken — as evidence",
     "alongside other Anglo-Indian inheritances (mulligatawny soup, coronation chicken) as evidence"),

    # keema-matar.json
    ("keema-matar.json",
     "cooks quickly — the mince needs no long braise — and produces",
     "cooks quickly (the mince needs no long braise) and produces"),

    # king-prawn-balti.json
    ("king-prawn-balti.json",
     "defined by speed — the whole dish cooks in under 15 minutes once the sauce is ready — and by",
     "defined by speed (the whole dish cooks in under 15 minutes once the sauce is ready) and by"),

    # lamb-biryani.json
    ("lamb-biryani.json",
     "required for lamb — compared to chicken — produces",
     "required for lamb (compared to chicken) produces"),
    ("lamb-biryani.json",
     "needs a full braise — at least 75 minutes — before it is tender enough",
     "needs a full braise (at least 75 minutes) before it is tender enough"),
    ("lamb-biryani.json",
     "Lamb biryani is the heavier, more complex sibling of chicken biryani — the braised lamb sauce gives",
     "Lamb biryani is the heavier, more complex sibling of chicken biryani: the braised lamb sauce gives"),

    # lamb-samosa.json
    ("lamb-samosa.json",
     "same technique as keema matar — cooked until completely dry — which is essential",
     "same technique as keema matar (cooked until completely dry) which is essential"),

    # mulligatawny.json
    ("mulligatawny.json",
     "oldest Anglo-Indian dishes still in active use — a Victorian-era soup",
     "oldest Anglo-Indian dishes still in active use: a Victorian-era soup"),

    # onion-bhaji.json
    ("onion-bhaji.json",
     "The batter for bhaji is deliberately thin — it coats the onion slices",
     "The batter for bhaji is deliberately thin: it coats the onion slices"),
    ("onion-bhaji.json",
     "the combination — crisp batter, sweet caramelised onion interior, green chilli heat, coriander freshness — is straightforward",
     "the combination (crisp batter, sweet caramelised onion interior, green chilli heat, coriander freshness) is straightforward"),

    # paneer-tikka-masala.json
    ("paneer-tikka-masala.json",
     "as saag paneer — the vegetarian centrepiece — but appeals",
     "as saag paneer (the vegetarian centrepiece) but appeals"),

    # peshwari-naan.json
    ("peshwari-naan.json",
     "alongside mild curries — korma, passanda, butter chicken — and provides",
     "alongside mild curries (korma, passanda, butter chicken) and provides"),

    # plain-naan.json
    ("plain-naan.json",
     "the naan decision — plain, garlic, or peshwari — is typically made",
     "the naan decision (plain, garlic, or peshwari) is typically made"),

    # tandoori-chicken.json
    ("tandoori-chicken.json",
     "into the flesh — three or four cuts per piece — which allows",
     "into the flesh (three or four cuts per piece) which allows"),
    ("tandoori-chicken.json",
     "produces a credible result — charred, smoky, with the marinade caramelised into the surface — within",
     "produces a credible result (charred, smoky, with the marinade caramelised into the surface) within"),

    # tarka-dhal.json
    ("tarka-dhal.json",
     "{{cumin-seeds}} — they will pop immediately.",
     "{{cumin-seeds}}: they will pop immediately."),

    # vegetable-samosa.json
    ("vegetable-samosa.json",
     "The filling is deliberately dry — no sauce — so the pastry stays crisp",
     "The filling is deliberately dry (no sauce) so the pastry stays crisp"),
    ("vegetable-samosa.json",
     "involves more work than most curry-house dishes — the folding and sealing requires patience — but the result",
     "involves more work than most curry-house dishes (the folding and sealing requires patience) but the result"),
]

def apply_fixes():
    applied = 0
    not_found = []

    for filename, old, new in FIXES:
        path = BRIEFS_DIR / filename
        content = path.read_text(encoding="utf-8")
        if old in content:
            content = content.replace(old, new, 1)
            path.write_text(content, encoding="utf-8")
            applied += 1
            print(f"  FIXED  {filename}: {old[:60]}...")
        else:
            not_found.append((filename, old[:60]))
            print(f"  SKIP   {filename}: not found: {old[:60]}...")

    print(f"\nApplied {applied}/{len(FIXES)} fixes.")
    if not_found:
        print(f"Not found ({len(not_found)}):")
        for f, s in not_found:
            print(f"  {f}: {s}")

    return len(not_found) == 0

if __name__ == "__main__":
    ok = apply_fixes()
    sys.exit(0 if ok else 1)
