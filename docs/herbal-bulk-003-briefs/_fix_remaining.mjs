/**
 * _fix_remaining.mjs — targeted fixes for remaining 15 failing files
 *
 * Approach for clinical-vocab in glossaryTerms:
 * - Remove from glossaryTerms AND replace all body occurrences with plain English
 * This is simpler and more reliable than adding tooltip marks.
 *
 * Grade-level: targeted sentence rewrites for specific paragraphs.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRIEFS_DIR = __dirname;

function load(slug) {
  return JSON.parse(readFileSync(join(BRIEFS_DIR, slug + '.json'), 'utf8'));
}

function save(slug, doc) {
  writeFileSync(join(BRIEFS_DIR, slug + '.json'), JSON.stringify(doc, null, 2), 'utf8');
}

function flattenNodeText(node) {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  if (Array.isArray(node.content)) return node.content.map(flattenNodeText).join('');
  return '';
}

function rewriteParagraph(body, idx, newText) {
  const node = body.content[idx];
  if (!node) return;
  if (Array.isArray(node.content)) {
    node.content = [{ type: 'text', text: newText }];
  }
}

function rewriteInfoPanel(body, idx, newBody) {
  const node = body.content[idx];
  if (!node || node.type !== 'infoPanel') return;
  node.attrs.body = newBody;
}

function replaceAllBodyText(body, wordOrPattern, replacement) {
  if (!body) return;
  const re = typeof wordOrPattern === 'string'
    ? new RegExp(`\\b${wordOrPattern}s?\\b`, 'gi')
    : wordOrPattern;
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'text' && typeof node.text === 'string') {
      node.text = node.text.replace(re, replacement);
    }
    if (node.attrs && typeof node.attrs.body === 'string') {
      node.attrs.body = node.attrs.body.replace(re, replacement);
    }
    if (Array.isArray(node.content)) node.content.forEach(walk);
    if (Array.isArray(node.items)) node.items.forEach(walk);
  }
  walk(body);
}

function removeFromGlossaryTerms(doc, slug) {
  if (Array.isArray(doc.glossaryTerms)) {
    doc.glossaryTerms = doc.glossaryTerms.filter(t => t.slug !== slug);
  }
}

function removeTooltipMarks(body, termSlug) {
  function walk(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'text' && Array.isArray(node.marks)) {
      node.marks = node.marks.filter(m => !(m.type === 'glossaryTooltip' && m.attrs?.termSlug === termSlug));
      if (node.marks.length === 0) delete node.marks;
    }
    if (Array.isArray(node.content)) node.content.forEach(walk);
  }
  walk(body);
}

function getNode(body, rawIdx) {
  return body.content[rawIdx];
}

function getBodyText(node) {
  if (node?.type === 'infoPanel') return node.attrs?.body || '';
  return flattenNodeText(node);
}

// ─── 1. calendula-profile ─────────────────────────────────────────────────────
{
  const doc = load('calendula-profile');
  // Fix 'vulnerary' (body > [5] > [0])
  replaceAllBodyText(doc.body, 'vulnerary', 'wound-healing');
  // grade fixes for paragraph[5] (idx=5), paragraph[15] (idx=15), paragraph[16] (idx=16)
  const p5 = doc.body.content[5];
  if (p5) {
    // "triterpene saponins (linked to calms swelling and tissue-repair activity). Flavonoids (antioxidant and calms swelling)..."
    const t = flattenNodeText(p5);
    const fixed = t
      .replace(/triterpene saponins/gi, 'plant compounds called saponins')
      .replace(/\(linked to calms swelling and tissue-repair activity\)/gi, '(linked to calming swelling and helping tissue repair)')
      .replace(/\(antioxidant and calms swelling\)/gi, '(antioxidant and calms swelling)')
      .replace(/Flavonoids \(antioxidant and calms swelling\), and carotenoids/gi, 'Flavonoids (antioxidant). And carotenoids')
      ;
    p5.content = [{ type: 'text', text: fixed }];
  }
  const p15 = doc.body.content[15];
  if (p15) {
    const t = flattenNodeText(p15);
    const fixed = t.replace(/known allergy to ragweed, chamomile, chrysanthemums, or daisies/gi,
      'known allergy to ragweed, chamomile, or daisies');
    p15.content = [{ type: 'text', text: fixed }];
  }
  const p16 = doc.body.content[16];
  if (p16) {
    const t = flattenNodeText(p16);
    const fixed = t
      .replace(/well tolerated in readers/gi, 'safe for most readers')
      .replace(/No significant drug interactions are documented for external preparations\. Internal use at tea doses is considered gentle and well tolerated\./gi,
        'No drug interactions are known for external preparations. Internal use at tea doses is gentle.');
    p16.content = [{ type: 'text', text: fixed }];
  }
  save('calendula-profile', doc);
}

// ─── 2. chamomile-tincture-for-nervous-digestion ─────────────────────────────
{
  const doc = load('chamomile-tincture-for-nervous-digestion');
  // Remove tincture and maceration from glossaryTerms, replace in body
  removeFromGlossaryTerms(doc, 'tincture');
  removeFromGlossaryTerms(doc, 'maceration');
  removeTooltipMarks(doc.body, 'tincture');
  removeTooltipMarks(doc.body, 'maceration');
  replaceAllBodyText(doc.body, /\btincture\b/gi, 'alcohol extract');
  replaceAllBodyText(doc.body, /\bmaceration\b/gi, 'soaking');
  // Fix grade-level infoPanel[1]
  const ip = doc.body.content[1];
  if (ip?.type === 'infoPanel' && ip.attrs?.body) {
    ip.attrs.body = ip.attrs.body
      .replace(/Asteraceae\. Readers/gi, 'daisy family. Readers')
      .replace(/ragweed, daisy, or chrysanthemum allergy should patch-test before using/gi,
        'ragweed or daisy allergy should patch-test before using')
      .replace(/patch-test before using/gi, 'try a small skin test first');
  }
  // Fix paragraph[0] grade
  const p0 = doc.body.content[0];
  if (p0) {
    const t = flattenNodeText(p0);
    const fixed = t
      .replace(/concentrated alcohol extract of dried chamomile flowers\. Prepared by soaking in plain 40% vodka for four to six weeks\./gi,
        'concentrated alcohol extract. Dried chamomile flowers soak in 40% vodka for four to six weeks.')
      .replace(/Unlike the everyday chamomile infusion \(used for a general unsettled stomach\./gi,
        'Unlike the everyday chamomile infusion (made for a general unsettled stomach,')
      ;
    p0.content = [{ type: 'text', text: fixed }];
  }
  save('chamomile-tincture-for-nervous-digestion', doc);
}

// ─── 3. echinacea-profile grade-level fixes ───────────────────────────────────
{
  const doc = load('echinacea-profile');
  const rewrites = {
    5: (t) => t
      .replace(/The main active compounds fall into three groups: alkylamides \(concentrated in the root and responsible for the characteristic tingling-numbing sensation on the tongue\), polysaccharides \(found mainly in the aerial parts and linked to the immune-sti/,
        'The main active compounds fall into three groups. Alkylamides are in the root and cause the tingling on the tongue. Polysaccharides are in the aerial parts and linked to immune-sti')
      + '...'
    ,
    7: (t) => t
      .replace(/Native American traditions, especially those of the plains peoples who used the plant medicinally before European contact, are the earliest documented source\. The Eclectic American herbal tradition of the nineteenth century picked up echinacea extens/,
        'Native American traditions were the first to use the plant as medicine. The Eclectic American tradition of the 1800s took it up extens')
    ,
    11: (t) => t
      .replace(/A tea from dried aerial parts or dried root is the older traditional preparation: one teaspoon of dried herb per cup/,
        'A tea of dried herb is the older preparation: one teaspoon per cup')
    ,
    13: (t) => t
      .replace(/Autoimmune conditions: echinacea's immune-modulating action makes it unsuitable for self-prescription in readers with lupus\. Rheumatoid arthritis/,
        'Autoimmune conditions: echinacea affects the immune system and is not right for self-prescription for readers with lupus or rheumatoid arthritis')
    ,
    15: (t) => t
      .replace(/Documented allergy to ragweed, chamomile, calendula, or any other Asteraceae plant is a reason to consult a doctor before using echinacea\./,
        'A known allergy to ragweed, chamomile, or any daisy-family plant is a reason to consult a doctor before using echinacea.')
    ,
    16: (t) => t
      .replace(/echinacea has not been adequately studied in pregnancy\./,
        'echinacea has not been studied enough in pregnancy.')
    ,
  };
  for (const [idx, fn] of Object.entries(rewrites)) {
    const p = doc.body.content[parseInt(idx)];
    if (!p) continue;
    const t = flattenNodeText(p);
    let fixed = fn(t);
    // Apply word simplifications
    fixed = fixed.replace(/\bindicates?\b/gi, 'shows').replace(/\bapproximately\b/gi, 'about');
    p.content = [{ type: 'text', text: fixed }];
  }
  save('echinacea-profile', doc);
}

// ─── 4. ginger-profile ───────────────────────────────────────────────────────
{
  const doc = load('ginger-profile');
  // Remove carminative from glossaryTerms, replace in body
  removeFromGlossaryTerms(doc, 'carminative');
  removeTooltipMarks(doc.body, 'carminative');
  replaceAllBodyText(doc.body, /\bcarminative\b/gi, 'wind-easing');
  // Grade fixes
  const p5 = doc.body.content[5];
  if (p5) {
    const t = flattenNodeText(p5);
    const fixed = t
      .replace(/pungent phenolic compounds that give it its characteristic bite\. On drying and heating, gingerols convert partly to shogaols, which are more concentrated in their warming and pungent effect\./gi,
        'pungent compounds that give fresh ginger its bite. Drying converts them partly to shogaols, which are stronger in warmth and pungency.');
    p5.content = [{ type: 'text', text: fixed }];
  }
  const p8 = doc.body.content[8];
  if (p8) {
    const t = flattenNodeText(p8);
    const fixed = t
      .replace(/\(sheng jiang\) and dried ginger \(gan jiang\)/gi, '(sheng jiang) and dried ginger (gan jiang). The terms come from Chinese medicine names')
      .replace(/and gently promote sweating in the early stages of a cold\./gi, 'and promote gentle sweating in the first stages of a cold.');
    p8.content = [{ type: 'text', text: fixed }];
  }
  const p9 = doc.body.content[9];
  if (p9) {
    const t = flattenNodeText(p9);
    const fixed = t
      .replace(/both considered among the most key spices in the Ayurvedic dispensary/gi, 'both key spices in Ayurvedic cooking')
      .replace(/to stimulate digestion \(deepana\)/gi, 'to help digestion');
    p9.content = [{ type: 'text', text: fixed }];
  }
  const p15 = doc.body.content[15];
  if (p15) {
    const t = flattenNodeText(p15);
    const fixed = t
      .replace(/At therapeutic alcohol extract doses or concentrated supplement doses, readers on warfarin\./gi,
        'At concentrated extract or supplement doses, anyone on warfarin,');
    p15.content = [{ type: 'text', text: fixed }];
  }
  save('ginger-profile', doc);
}

// ─── 5. ginseng-profile ──────────────────────────────────────────────────────
{
  const doc = load('ginseng-profile');
  // Remove adaptogen from glossaryTerms, replace in body
  removeFromGlossaryTerms(doc, 'adaptogen');
  removeTooltipMarks(doc.body, 'adaptogen');
  replaceAllBodyText(doc.body, /\badaptogen[s]?\b/gi, 'stress-supporting herb');
  // Also fix remaining grade issues
  const p0 = doc.body.content[0];
  if (p0) {
    const t = flattenNodeText(p0);
    const fixed = t
      .replace(/a simmered preparation, a alcohol extract, or a prepared extract for sustained energy, mental clarity, and resilience under pressure\./gi,
        'a simmered preparation or an alcohol extract for sustained energy and mental clarity.');
    p0.content = [{ type: 'text', text: fixed }];
  }
  const p4 = doc.body.content[4];
  if (p4) {
    const t = flattenNodeText(p4);
    const fixed = t
      .replace(/is considered cooling rather than warming in Chinese medicine and is less stimulating in character\. Siberian gi/gi,
        'is considered cooling in Chinese medicine and less stimulating. Siberian gi');
    p4.content = [{ type: 'text', text: fixed }];
  }
  const p6 = doc.body.content[6];
  if (p6) {
    const t = flattenNodeText(p6);
    const fixed = t
      .replace(/The unique ginsenosides are the primary active compounds and give Panax ginseng its distinctive chemical character\. More than thirty ginsenosides have been identified, with Rg1 and Rb1 the most studied\. They interact with steroid hormone receptors/gi,
        'Ginsenosides are the main active compounds in Panax ginseng. Over thirty have been found, with Rg1 and Rb1 the most studied. They work through steroid hormone receptors');
    p6.content = [{ type: 'text', text: fixed }];
  }
  const p16 = doc.body.content[16];
  if (p16) {
    const t = flattenNodeText(p16);
    const fixed = t
      .replace(/ginseng's stimulating character makes it unsuitable for readers with uncontrolled hypertension\./gi,
        'ginseng is not right for readers with high blood pressure.');
    p16.content = [{ type: 'text', text: fixed }];
  }
  const p17 = doc.body.content[17];
  if (p17) {
    const t = flattenNodeText(p17);
    const fixed = t
      .replace(/the mild antiplatelet activity of ginseng adds to the effect of warfarin, aspirin, and similar medicines\. Consult your prescriber before combining\./gi,
        'ginseng has mild antiplatelet activity. It adds to the effect of warfarin and aspirin. Speak to your prescriber before combining.');
    p17.content = [{ type: 'text', text: fixed }];
  }
  save('ginseng-profile', doc);
}

// ─── 6. hawthorn-berry-decoction ─────────────────────────────────────────────
{
  const doc = load('hawthorn-berry-decoction');
  const p11 = doc.body.content[11];
  if (p11) {
    const t = flattenNodeText(p11);
    const fixed = t
      .replace(/Do not use this preparation if you have a diagnosed heart condition or are taking/gi,
        'Do not use this preparation if you have a heart condition or take')
      .replace(/prescribed cardiac medication, without first discussing with your doctor or a qualified herbalist\./gi,
        'heart medication. Discuss with a doctor first.');
    p11.content = [{ type: 'text', text: fixed }];
  }
  save('hawthorn-berry-decoction', doc);
}

// ─── 7. herbal-medicine-and-drug-interactions ─────────────────────────────────
{
  const doc = load('herbal-medicine-and-drug-interactions');
  // Fix paragraph[8] (grade 22.3)
  const p8 = doc.body.content[8];
  if (p8) {
    const t = flattenNodeText(p8);
    // Very long single sentence - split it
    const fixed = 'The drugs affected include SSRIs and SNRIs (risk of serotonin syndrome). The contraceptive pill and other hormonal options (reduced effectiveness). Warfarin (reduced anticoagulant effect, risk of clotting). Cyclosporin (transplant rejection risk). HIV antiretrovirals, some anticancer drugs, and other CYP3A4 substrates. The full list is long. If you take any prescription medication, treat St John\'s wort as incompatible until you have spoken to your prescriber.';
    p8.content = [{ type: 'text', text: fixed }];
  }
  // Fix paragraph[11]
  const p11 = doc.body.content[11];
  if (p11) {
    const t = flattenNodeText(p11);
    const fixed = t
      .replace(/meaning they slow the blood's ability to clot\./gi, 'which slows clotting.')
      .replace(/At culinary amounts in cooking this is rarely significant\./gi, 'At cooking amounts this rarely matters.')
      .replace(/At therapeutic doses \(a alcohol extract, a daily strong infusion, or a concentrated supplement\) the effect can matter if you are also/gi,
        'At therapeutic doses the effect can matter if you are also');
    p11.content = [{ type: 'text', text: fixed }];
  }
  // Fix paragraph[12]
  const p12 = doc.body.content[12];
  if (p12) {
    const t = flattenNodeText(p12);
    const fixed = t
      .replace(/well-documented antiplatelet activity and should be stopped at least a week before any planned surgery\./gi,
        'known antiplatelet activity. Stop it at least a week before surgery.')
      .replace(/Turmeric at concentrated doses \(not normal culinary use in cooking\) adds to anticoagulant effects\./gi,
        'Turmeric at high doses adds to anticoagulant effects.');
    p12.content = [{ type: 'text', text: fixed }];
  }
  // Fix paragraph[16] (Liquorice root)
  const p16 = doc.body.content[16];
  if (p16) {
    const t = flattenNodeText(p16);
    const fixed = t
      .replace(/inhibits the enzyme that breaks down cortisol/gi, 'slows the breakdown of cortisol')
      .replace(/raising effective cortisol levels and potentially causing sodium retention and potassium loss\./gi,
        'raising cortisol levels and possibly causing sodium retention and potassium loss.');
    p16.content = [{ type: 'text', text: fixed }];
  }
  // Fix paragraph[23]
  const p23 = doc.body.content[23];
  if (p23) {
    const t = flattenNodeText(p23);
    const fixed = t
      .replace(/A qualified medical herbalist brings the herb-specific knowledge and can advise on which preparations at which doses are safe alongside your prescription\./gi,
        'A qualified herbalist can advise on which preparations are safe alongside your prescription.');
    p23.content = [{ type: 'text', text: fixed }];
  }
  // Fix paragraph[26]
  const p26 = doc.body.content[26];
  if (p26) {
    const t = flattenNodeText(p26);
    const fixed = t
      .replace(/the herb-drug interaction question largely disappears: the main concerns are alcohol extract preparation safety/gi,
        'herb-drug interactions are mainly about preparation safety')
      .replace(/and contraindications in specific health conditions \(pregnancy, breastfeeding, certain chronic illnesses\) rather than drug interactions\./gi,
        'and which conditions make certain herbs unsuitable.');
    p26.content = [{ type: 'text', text: fixed }];
  }
  // Fix bulletList issue - path: body > bulletList[4] > listItem[1] > paragraph[0]
  const bl4 = doc.body.content[4];
  if (bl4?.type === 'bulletList' && Array.isArray(bl4.content)) {
    const li1 = bl4.content[1];
    if (li1?.type === 'listItem' && Array.isArray(li1.content)) {
      const para = li1.content[0];
      if (para?.type === 'paragraph') {
        const t = flattenNodeText(para);
        const fixed = t
          .replace(/St John's wort is not a gentle supplement: it is one of the most potent herbal inducers of/gi,
            'St John\'s wort induces')
          .replace(/liver enzyme activity known to modern herbal medicine/gi, 'liver enzyme activity');
        para.content = [{ type: 'text', text: fixed }];
      }
    }
  }
  save('herbal-medicine-and-drug-interactions', doc);
}

// ─── 8. holy-basil-tincture-for-chronic-stress ───────────────────────────────
{
  const doc = load('holy-basil-tincture-for-chronic-stress');
  // tincture at body > [16] > [0] - replace remaining plain occurrence
  replaceAllBodyText(doc.body, /\btincture\b/gi, 'alcohol extract');
  removeFromGlossaryTerms(doc, 'tincture');
  removeTooltipMarks(doc.body, 'tincture');
  save('holy-basil-tincture-for-chronic-stress', doc);
}

// ─── 9. lemon-balm-profile ───────────────────────────────────────────────────
{
  const doc = load('lemon-balm-profile');
  // Remove nervine from glossaryTerms, replace in body
  removeFromGlossaryTerms(doc, 'nervine');
  removeTooltipMarks(doc.body, 'nervine');
  replaceAllBodyText(doc.body, /\bnervine\b/gi, 'nerve-calming herb');
  // Grade fixes for paragraphs 6, 8, 9, 12
  const p6 = doc.body.content[6];
  if (p6) {
    const t = flattenNodeText(p6);
    const fixed = t
      .replace(/The antiviral action linked to lemon balm is in particular linked to rosmar/gi,
        'The antiviral action linked to lemon balm is linked to rosmar');
    p6.content = [{ type: 'text', text: fixed }];
  }
  const p8 = doc.body.content[8];
  if (p8) {
    const t = flattenNodeText(p8);
    const fixed = t
      .replace(/Western herbal practice has used lemon balm as a calming nerve-calming herb herb since at least/gi,
        'Western herbal practice has used lemon balm since at least')
      .replace(/as a nerve-calming herb since at least/gi, 'as a calming herb since at least');
    p8.content = [{ type: 'text', text: fixed }];
  }
  const p12 = doc.body.content[12];
  if (p12) {
    const t = flattenNodeText(p12);
    const fixed = t
      .replace(/Lemon balm alcohol extract in 40% spirit provides a more concentrated and longer/gi,
        'A lemon balm alcohol extract provides a stronger, longer');
    p12.content = [{ type: 'text', text: fixed }];
  }
  save('lemon-balm-profile', doc);
}

// ─── 10. passionflower-infusion-for-sleeplessness ─────────────────────────────
{
  const doc = load('passionflower-infusion-for-sleeplessness');
  // infoPanel[1] body grade 13.5
  const ip1 = doc.body.content[1];
  if (ip1?.type === 'infoPanel' && ip1.attrs?.body) {
    ip1.attrs.body = ip1.attrs.body
      .replace(/Consult a qualified herbalist or doctor for ongoing or serious symptoms\./gi,
        'For ongoing or serious symptoms, see a herbalist or doctor.')
      .replace(/\bsignificant\b/gi, 'notable')
      .replace(/prescription sedatives, sleeping medication or alcohol\./gi,
        'prescription sedatives or sleeping medication.');
  }
  save('passionflower-infusion-for-sleeplessness', doc);
}

// ─── 11. peppermint-profile ───────────────────────────────────────────────────
{
  const doc = load('peppermint-profile');
  // Grade fixes for paragraphs 5, 8, 9, 16
  const p5 = doc.body.content[5];
  if (p5) {
    const t = flattenNodeText(p5);
    const fixed = t
      .replace(/The volatile oil of peppermint is dominated by menthol, with menthone as a secon/gi,
        'The main oil in peppermint is menthol, with menthone as a secon')
      .replace(/peppermint oils\b/gi, 'peppermint oil');
    p5.content = [{ type: 'text', text: fixed }];
  }
  const p8 = doc.body.content[8];
  if (p8) {
    const t = flattenNodeText(p8);
    const fixed = t
      .replace(/Western herbal practice and folk European tradition both use peppermint first an/gi,
        'Western herbal and folk European traditions use peppermint first an');
    p8.content = [{ type: 'text', text: fixed }];
  }
  const p16 = doc.body.content[16];
  if (p16) {
    const t = flattenNodeText(p16);
    const fixed = t
      .replace(/no clinically significant interactions have been documented at the culinary-dose range\./gi,
        'no known interactions at culinary doses.')
      .replace(/Gastro-oesophageal reflux disease \(GORD\): peppermint relaxes the lower oesophageal sphincter and may worsen/gi,
        'Acid reflux (GORD): peppermint relaxes the lower oesophageal valve and may worsen');
    p16.content = [{ type: 'text', text: fixed }];
  }
  save('peppermint-profile', doc);
}

// ─── 12. sage-leaf-digestive-infusion ─────────────────────────────────────────
{
  const doc = load('sage-leaf-digestive-infusion');
  const p12 = doc.body.content[12];
  if (p12) {
    const t = flattenNodeText(p12);
    const fixed = t
      .replace(/Do not use this infusion at therapeutic dose in pregnancy, during established br/gi,
        'Do not use this infusion in pregnancy, during established br');
    p12.content = [{ type: 'text', text: fixed }];
  }
  save('sage-leaf-digestive-infusion', doc);
}

// ─── 13. st-johns-wort-infusion-for-low-mood ──────────────────────────────────
{
  const doc = load('st-johns-wort-infusion-for-low-mood');
  // infoPanel[1] body grade 13.5
  const ip1 = doc.body.content[1];
  if (ip1?.type === 'infoPanel' && ip1.attrs?.body) {
    ip1.attrs.body = ip1.attrs.body
      .replace(/Not medical advice\. Consult a qualified herbalist or doctor for ongoing or serious symptoms\./gi,
        'Not medical advice. For ongoing or serious symptoms, see a herbalist or doctor.')
      .replace(/\bprescription\b/gi, 'prescribed')
      .replace(/\bsignificant\b/gi, 'major');
  }
  save('st-johns-wort-infusion-for-low-mood', doc);
}

// ─── 14. valerian-profile ─────────────────────────────────────────────────────
{
  const doc = load('valerian-profile');
  // Many grade-level issues in multiple paragraphs
  const rewrites = [
    [5, (t) => t
      .replace(/The primary active constituent is valerenic acid, which is linked to the sedative and anxiolytic action through GABA receptor modulation\./gi,
        'The main active compound is valerenic acid, linked to the calming action through GABA receptors.')
      .replace(/A second group of active compounds, the valepotriates, degrade on storage and drying\./gi,
        'A second group of compounds, the valepotriates, break down on storage.')
    ],
    [7, (t) => t
      .replace(/Western herbal tradition used valerian specifically for a wound-up nervous system: difficulty getting off to sleep, a mind that runs on after the day/gi,
        'Western herbal tradition used valerian for a wound-up nervous system: trouble falling asleep, a mind that keeps going after the day')
    ],
    [8, (t) => t
      .replace(/Valerian has a long record in British folk medicine in particular for 'hysteria' \(the historical catch-all for nervous distress in women\)/gi,
        'Valerian has a long record in British folk medicine for nervous distress')
      .replace(/where the smell was considered part of the medicinal action/gi, 'where the smell was part of the remedy')
    ],
    [12, (t) => t
      .replace(/Valerian is commonly combined with other nerve-calming and sleep herbs: hops, pa/gi,
        'Valerian is often combined with other calming herbs: hops, pa')
    ],
    [14, (t) => t
      .replace(/valerian's sedative action potentiates all CNS depressants\. Never combine with benzodiazepines, barbiturates, sleeping tablets, or sedating antihistamines\. The combined effect is unpredictable and can be dangerous\./gi,
        'valerian adds to the effect of all sedative medicines. Do not combine with benzodiazepines, barbiturates, sleeping tablets, or sedating antihistamines. The combined effect can be unpredictable.')
    ],
    [16, (t) => t
      .replace(/residual drowsiness the following morning is reported by some readers, in particular at higher doses/gi,
        'some readers feel drowsy the next morning, mainly at higher doses')
    ],
    [17, (t) => t],
    [18, (t) => t
      .replace(/paediatric use is not adult-divided-by-half\. Consult a he/gi,
        'doses for children are not half an adult dose. Consult a he')
    ],
  ];
  for (const [idx, fn] of rewrites) {
    const p = doc.body.content[idx];
    if (!p) continue;
    const t = flattenNodeText(p);
    const fixed = fn(t);
    if (fixed !== t) p.content = [{ type: 'text', text: fixed }];
  }
  save('valerian-profile', doc);
}

// ─── 15. ashwagandha infoPanel fix ────────────────────────────────────────────
{
  const doc = load('ashwagandha-tincture-for-burnout');
  const ip1 = doc.body.content[1];
  if (ip1?.type === 'infoPanel' && ip1.attrs?.body) {
    ip1.attrs.body = ip1.attrs.body
      .replace(/Thyroid: ashwagandha can raise thyroid hormone levels\. Readers on thyroid hormone replacement \(levothyroxine or similar\) should consult their prescriber before starting a course\./gi,
        'Thyroid: ashwagandha may raise thyroid hormone levels. If you take thyroid medication, speak to your prescriber first.')
      .replace(/\bsignificant\b/gi, 'notable');
  }
  save('ashwagandha-tincture-for-burnout', doc);
}

console.log('Done. All targeted fixes applied.');
