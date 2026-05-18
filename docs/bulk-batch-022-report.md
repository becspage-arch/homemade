# Cooking bulk-024 — batch report

**Date:** 2026-05-18  
**Category:** Cooking  
**Cuisine focus:** Eastern European  
**Entries published:** 40  
**Cooking total before:** 890 (after bulk-022 British classics + bulk-023 slow-cooker ran concurrently)  
**Cooking total after:** 929  

---

## Entries

| Slug | Country | Difficulty | Meal type |
|---|---|---|---|
| barszcz-bialy | Polish | BEGINNER | lunch |
| bramboraky | Czech | BEGINNER | lunch |
| buckwheat-blini | Russian | INTERMEDIATE | breakfast |
| cabbage-piroshki | Russian | INTERMEDIATE | snack |
| cold-borscht | Russian/Ukrainian | BEGINNER | starter |
| czech-goulash | Czech | INTERMEDIATE | dinner |
| golabki | Polish | INTERMEDIATE | dinner |
| gulyasleves | Hungarian | BEGINNER | lunch |
| halaszle | Hungarian | INTERMEDIATE | dinner |
| holubtsi | Ukrainian | INTERMEDIATE | dinner |
| hortobagyi-palacsinta | Hungarian | INTERMEDIATE | dinner |
| kapusta-z-grochem | Polish | BEGINNER | lunch |
| knedliky | Czech | INTERMEDIATE | side |
| korhelyleves | Hungarian | BEGINNER | lunch |
| krupnik | Polish | BEGINNER | lunch |
| kulajda | Czech | BEGINNER | lunch |
| langos | Hungarian | INTERMEDIATE | snack |
| meat-piroshki | Russian | INTERMEDIATE | snack |
| meggyleves | Hungarian | BEGINNER | starter |
| mizeria | Polish | BEGINNER | starter |
| okroshka | Russian | BEGINNER | lunch |
| olivier-salad | Russian | BEGINNER | starter |
| pampushky | Ukrainian | INTERMEDIATE | side |
| pashtet | Russian | BEGINNER | starter |
| pierogi-z-grzybami | Polish | INTERMEDIATE | dinner |
| pierogi-z-kapusta | Polish | INTERMEDIATE | dinner |
| pierogi-z-owocami | Polish | INTERMEDIATE | dessert |
| rassolnik | Russian | BEGINNER | lunch |
| selyodka-pod-shuboy | Russian | BEGINNER | starter |
| shchi | Russian | BEGINNER | lunch |
| sledzie-w-oleju | Polish | BEGINNER | starter |
| smazeny-syr | Czech | BEGINNER | lunch |
| solyanka | Russian | INTERMEDIATE | lunch |
| surowka-z-kapusty | Polish | BEGINNER | starter |
| toltott-kaposzta | Hungarian | INTERMEDIATE | dinner |
| vareniki | Ukrainian | INTERMEDIATE | dinner |
| vepro-knedlo-zelo | Czech | INTERMEDIATE | dinner |
| vinegret | Russian | BEGINNER | starter |
| zapiekanka | Polish | BEGINNER | snack |
| zupa-pomidorowa | Polish | BEGINNER | lunch |

---

## Fixes applied

### Voice-check fixes
- **Em-dash pairs** (16 files): converted all `— X —` appositive pairs to parentheses, commas, or colons. Affected: czech-goulash, halaszle, holubtsi, kulajda, okroshka, rassolnik, shchi, vinegret, vepro-knedlo-zelo, buckwheat-blini, langos, meat-piroshki, pampushky, selyodka-pod-shuboy, knedliky, and sourceNotes fields.
- **Banned phrase "genuinely"** (2 files): halaszle, meggyleves.

### Slug fixes (ingredientSlug field values + body prose template tokens)
All fixes applied globally via `sed` across all 40 files:

| Wrong slug | Correct slug |
|---|---|
| `potato-floury` | `potato` |
| `potato-waxy` | `potato` |
| `full-fat-milk` | `whole-milk` |
| `smoked-sausage` | `smoked-pork-sausage` |
| `salmon-smoked` | `smoked-salmon` |
| `white-fish-fillets` | `cod-fillet` |
| `chicken-thighs` | `chicken-thigh` |
| `yellow-split-peas` | `split-peas-yellow` |
| `breadcrumbs-fine` | `breadcrumbs-dried` |
| `lardons-smoked` | `lardons` |
| `cloves-whole` | `cloves` |
| `bacon-smoked` | `streaky-bacon` |

### Tool slug fixes

| Wrong slug | Correct slug | File |
|---|---|---|
| `blender` | `stick-blender` | cold-borscht |
| `casserole-dish` | `dutch-oven` | golabki, holubtsi |
| `frying-pan` | `frying-pan-26` | zapiekanka |
| `roasting-tin` | `roasting-pan` | vepro-knedlo-zelo |

### Schema fixes
- **Season enum**: 8 files had lowercase season values (`"summer"`, `"winter"`). Fixed to `"SUMMER"`, `"WINTER"` to match the Prisma enum. Files: barszcz-bialy, cold-borscht, meggyleves, mizeria, okroshka, pierogi-z-grzybami, pierogi-z-owocami, toltott-kaposzta.
- **yieldDescription**: 16 files had non-null `yieldDescription` alongside a non-null `servings` (mutually exclusive). All set to `null`.

---

## Coverage notes

Czech: vepro-knedlo-zelo (national dish), czech-goulash, bramboraky, knedliky, kulajda, smazeny-syr, korhelyleves (plus Czech influence on halaszle).  
Polish: golabki, pierogi ×3 (z-grzybami, z-kapusta, z-owocami), barszcz-bialy, kapusta-z-grochem, krupnik, mizeria, sledzie-w-oleju, surowka-z-kapusty, zapiekanka, zupa-pomidorowa.  
Russian: olivier-salad, selyodka-pod-shuboy (New Year classics), shchi, rassolnik, solyanka (the three great Russian soups), vinegret, okroshka, pashtet, buckwheat-blini, meat-piroshki, cabbage-piroshki.  
Hungarian: gulyasleves, halaszle, hortobagyi-palacsinta, toltott-kaposzta, meggyleves, langos, korhelyleves (overlap with Czech).  
Ukrainian: holubtsi, vareniki, pampushky, cold-borscht.
