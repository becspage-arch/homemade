/**
 * _fix_final.mjs — final targeted fixes for remaining 10 failing files
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
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

// Fix all body text at once via JSON string manipulation
function fixDocText(doc, slug) {
  let json = JSON.stringify(doc);

  // ── Fix double-gloss artifacts ───────────────────────────────────────────────
  json = json.replace(/the 17th-century herbalist Nicholas the 17th-century herbalist Nicholas Culpeper/g,
    'the 17th-century herbalist Nicholas Culpeper');
  json = json.replace(/Maud Grieve, the early 20th-century botanical writer, the early 20th-century botanical writer,/g,
    'Maud Grieve, the early 20th-century botanical writer,');

  // ── Fix nervine→"nerve-calming herb" replacement artifacts ────────────────────
  json = json.replace(/nerve-calming herb herbs/g, 'nerve-calming herbs');
  json = json.replace(/nerve-calming herb herb\b/g, 'nerve-calming herb');
  json = json.replace(/nerve-calming herb action/g, 'nerve-calming action');
  json = json.replace(/nerve-calming herb tea\b/g, 'nerve-calming tea');
  json = json.replace(/calming nerve-calming herb\b/g, 'calming herb');
  json = json.replace(/a calming nerve-calming herb\b/g, 'a calming herb');
  json = json.replace(/"nervines"/g, '"calming herbs"');
  json = json.replace(/\bnervines\b/g, 'calming herbs');
  json = json.replace(/nerve-calming herb herb\b/g, 'nerve-calming herb');

  // ── Fix fall→autumn on idioms ────────────────────────────────────────────────
  json = json.replace(/autumn asleep/g, 'fall asleep');
  json = json.replace(/autumn into/g, 'fall into');
  json = json.replace(/autumn under/g, 'fall under');
  json = json.replace(/autumn through/g, 'fall through');
  json = json.replace(/autumn back/g, 'fall back');

  // ── Fix "an stress-supporting" → "a stress-supporting" ────────────────────────
  json = json.replace(/\ban stress-supporting/g, 'a stress-supporting');

  // ── Fix double-replacement artifacts ────────────────────────────────────────
  json = json.replace(/points to asleep/g, 'points to sleep');
  json = json.replace(/shows asleep/g, 'shows sleep');
  json = json.replace(/help asleep/g, 'help sleep');

  // ── Fix "Paraediatric" typo in st-johns-wort ───────────────────────────────
  json = json.replace(/Paraediatric/g, 'Paediatric');

  // ── Fix "no clinically significant" → simpler ─────────────────────────────
  json = json.replace(/no clinically significant interactions have been documented/g,
    'no notable interactions have been found');

  return JSON.parse(json);
}

// Re-apply the fix to all files
const files = readdirSync(BRIEFS_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
let changed = 0;

for (const f of files) {
  const slug = f.replace('.json', '');
  const doc = load(slug);
  const fixed = fixDocText(doc, slug);
  const orig = JSON.stringify(doc);
  const fixedStr = JSON.stringify(fixed);
  if (orig !== fixedStr) {
    save(slug, fixed);
    changed++;
    process.stdout.write('.');
  }
}

console.log('\nFixed ' + changed + ' files with artifact corrections.');

// Now do targeted grade-level rewrites for the remaining specific paragraphs
function getNode(body, rawIdx) {
  return body.content[rawIdx];
}

function rewrite(doc, idx, newText) {
  const p = doc.body.content[idx];
  if (!p) return false;
  if (Array.isArray(p.content)) {
    p.content = [{ type: 'text', text: newText }];
    return true;
  }
  return false;
}

function rewriteInfoPanel(doc, idx, newBody) {
  const ip = doc.body.content[idx];
  if (!ip || ip.type !== 'infoPanel') return false;
  ip.attrs.body = newBody;
  return true;
}

// ── chamomile-tincture infoPanel[1] ───────────────────────────────────────────
{
  const doc = load('chamomile-tincture-for-nervous-digestion');
  // Shorten the infoPanel body
  const ip = doc.body.content[1];
  if (ip?.type === 'infoPanel' && ip.attrs?.body) {
    const t = ip.attrs.body;
    // Simplify long sentences
    let fixed = t
      .replace(/Sedative potentiation: chamomile alcohol extract at this dose has mild sedative properties\. Readers who take prescription sedatives, sleeping tablets, or anti-anxiety medication should consult their prescriber before combining them with regular chamomile alcohol extract\./g,
        'Sedative note: chamomile extract has mild sedating properties. Speak to your prescriber before combining with sleeping tablets or anxiety medication.')
      .replace(/alcohol extract is a concentrated preparation and the alcohol content adds a further consideration\. Consult a herbalist or your midwife before using this alcohol extract in pregnancy or while breastfeeding\./g,
        'This is a concentrated preparation. Consult a herbalist or your midwife before using it in pregnancy or while breastfeeding.')
      .replace(/Paediatric use is not adult-divided-by-half\. Consult a herbalist who specialises in children's herbal medicine, or a paediatric doctor, before using any herbal preparation in children under twelve\./g,
        'Do not use herbal preparations in children under twelve without guidance from a herbalist or paediatric doctor.');
    ip.attrs.body = fixed;
  }
  save('chamomile-tincture-for-nervous-digestion', doc);
}

// ── echinacea-profile remaining grade issues ──────────────────────────────────
{
  const doc = load('echinacea-profile');

  // paragraph[5] - still complex
  const p5 = doc.body.content[5];
  if (p5 && p5.type === 'paragraph') {
    const t = p5.content?.map(c => c.text || '').join('') || '';
    // Remove the very complex pharmacology sentences
    const fixed = 'The main active compounds fall into three groups. Alkylamides in the root cause the distinctive tingling on the tongue and are the best-extracted in alcohol. Polysaccharides in the aerial parts are linked to activity on immune cells when extracted in water. Caffeic acid derivatives (including echinacoside) are higher in E. angustifolia and E. pallida roots. The overall picture is one of immune modulation. More a shift in immune activity than a simple stimulation.';
    p5.content = [{ type: 'text', text: fixed }];
  }

  // paragraph[11] - tea prep description
  const p11 = doc.body.content[11];
  if (p11 && p11.type === 'paragraph') {
    const fixed = 'A tea of dried herb is the older preparation: one teaspoon per cup, steeped for ten minutes, up to three times a day. The tea extracts the polysaccharides well. The alkylamides from the root extract better in alcohol than in water.';
    p11.content = [{ type: 'text', text: fixed }];
  }

  // paragraph[13] - autoimmune conditions
  const p13 = doc.body.content[13];
  if (p13 && p13.type === 'paragraph') {
    const fixed = 'Autoimmune conditions: echinacea affects the immune system. It is not right for self-prescription in readers with lupus, rheumatoid arthritis, multiple sclerosis, or other autoimmune conditions without a herbalist\'s guidance. Immune activity that is already out of balance may respond in unpredictable ways.';
    p13.content = [{ type: 'text', text: fixed }];
  }

  // paragraph[15] - Asteraceae allergy
  const p15 = doc.body.content[15];
  if (p15 && p15.type === 'paragraph') {
    const fixed = 'Asteraceae allergy: echinacea is in the daisy family. A known allergy to ragweed, chamomile, or any daisy-family plant is a reason to consult a doctor first.';
    p15.content = [{ type: 'text', text: fixed }];
  }

  save('echinacea-profile', doc);
}

// ── ginger-profile paragraph[5] and [15] ─────────────────────────────────────
{
  const doc = load('ginger-profile');

  const p5 = doc.body.content[5];
  if (p5 && p5.type === 'paragraph') {
    const fixed = 'The primary active compounds of fresh ginger are gingerols, pungent compounds that give fresh ginger its bite. Drying converts them partly to shogaols, which are stronger in warmth and pungency. Zingiberene carries most of the aromatic quality. These compounds are linked to the wind-easing action, the circulatory warming effect, and the best-studied action: easing nausea. Limited trial evidence supports the use for morning sickness and post-operative nausea. The calms swelling action comes from gingerol effects on prostaglandin pathways, but the effect at kitchen doses is modest.';
    p5.content = [{ type: 'text', text: fixed }];
  }

  const p15 = doc.body.content[15];
  if (p15 && p15.type === 'paragraph') {
    const fixed = 'Anticoagulant medicines: ginger has mild antiplatelet activity. At cooking amounts this is rarely a concern. At concentrated extract or supplement doses, anyone on warfarin, aspirin, or blood-thinning medicines should speak to their prescriber. The risk is additive, not dramatic.';
    p15.content = [{ type: 'text', text: fixed }];
  }

  save('ginger-profile', doc);
}

// ── ginseng-profile remaining issues ─────────────────────────────────────────
{
  const doc = load('ginseng-profile');

  const p4 = doc.body.content[4];
  if (p4 && p4.type === 'paragraph') {
    const fixed = 'American ginseng (Panax quinquefolius) is a separate species. It has a different compound profile and a different traditional role: it is considered cooling in Chinese medicine and less stimulating than Asian ginseng. Siberian ginseng (Eleutherococcus senticosus) is not a true Panax at all. It is a different plant with a different compound profile that shares only the common name.';
    p4.content = [{ type: 'text', text: fixed }];
  }

  const p9 = doc.body.content[9];
  if (p9 && p9.type === 'paragraph') {
    const fixed = 'Western herbal practice adopted ginseng in the twentieth century. It was framed as a stress-supporting herb: a herb that helps the body manage sustained physical and mental stress. The western uses centre on fatigue, sustained mental demand, and a sense of running on empty. Trial evidence supports the traditional use for cognitive function in older adults. Evidence for physical performance is more mixed.';
    p9.content = [{ type: 'text', text: fixed }];
  }

  const p17 = doc.body.content[17];
  if (p17 && p17.type === 'paragraph') {
    const fixed = 'Anticoagulant medicines: ginseng has mild antiplatelet activity. It adds to the effect of warfarin and aspirin. Speak to your prescriber before combining.';
    p17.content = [{ type: 'text', text: fixed }];
  }

  save('ginseng-profile', doc);
}

// ── herbal-medicine-and-drug-interactions remaining issues ─────────────────────
{
  const doc = load('herbal-medicine-and-drug-interactions');

  // bulletList[4] > listItem[1] > paragraph[0]
  const bl4 = doc.body.content[4];
  if (bl4?.type === 'bulletList' && Array.isArray(bl4.content)) {
    const li1 = bl4.content[1];
    if (li1?.type === 'listItem' && Array.isArray(li1.content)) {
      const para = li1.content[0];
      if (para?.type === 'paragraph') {
        para.content = [{ type: 'text', text: 'St John\'s wort induces liver enzymes. It lowers the blood level of many medicines, sometimes to the point of treatment failure.' }];
      }
    }
  }

  // paragraph[11]
  const p11 = doc.body.content[11];
  if (p11) {
    p11.content = [{ type: 'text', text: 'Several kitchen herbs slow blood clotting. At cooking amounts this rarely matters. At therapeutic doses it can matter if you also take anticoagulant medication.' }];
  }

  // paragraph[14]
  const p14 = doc.body.content[14];
  if (p14) {
    p14.content = [{ type: 'text', text: 'Valerian, hops, and passionflower all have mild sedating effects. They add to the effect of sleeping tablets, anxiety medication, and other sedating drugs. Do not combine them with prescription sedatives without telling your prescriber. The same caution applies to driving.' }];
  }

  // paragraph[16]
  const p16 = doc.body.content[16];
  if (p16) {
    p16.content = [{ type: 'text', text: 'Liquorice root at therapeutic doses slows cortisol breakdown. This raises blood pressure and lowers potassium levels. It greatly interacts with digoxin and antihypertensives. Anyone on cardiac medication should avoid therapeutic liquorice doses.' }];
  }

  // paragraph[23]
  const p23 = doc.body.content[23];
  if (p23) {
    p23.content = [{ type: 'text', text: 'A qualified herbalist can help with herb-specific knowledge. They are most useful for complex prescriptions or for herbs not in standard pharmacist databases.' }];
  }

  // paragraph[26]
  const p26 = doc.body.content[26];
  if (p26) {
    p26.content = [{ type: 'text', text: 'If you take no prescription medication, the herb-drug interaction risk is much lower. Read each herb\'s safety notes for allergen flags, pregnancy guidance, and any over-the-counter interactions. The high-stakes interactions are mainly for readers on prescription drugs.' }];
  }

  save('herbal-medicine-and-drug-interactions', doc);
}

// ── lemon-balm-profile remaining issues ───────────────────────────────────────
{
  const doc = load('lemon-balm-profile');

  // paragraph[5] - complex active compounds
  const p5 = doc.body.content[5];
  if (p5) {
    p5.content = [{ type: 'text', text: 'The main active compounds are rosmarinic acid, citral, and a range of flavonoids. The calming action is linked to the flavonoids and rosmarinic acid working on GABA pathways in the nervous system. At tea doses the effect is mild and calming. Combined with valerian or passionflower, lemon balm is long used for sleep where the main obstacle is an overactive mind.' }];
  }

  // paragraph[6] - antiviral
  const p6 = doc.body.content[6];
  if (p6) {
    p6.content = [{ type: 'text', text: 'The antiviral action of lemon balm is linked to rosmarinic acid and its effect on herpes simplex virus. Limited trial evidence supports lemon balm cream applied to cold sores at the first tingle: it may reduce duration and severity. Internal lemon balm tea does not have the same concentrated topical effect at the site of infection.' }];
  }

  // paragraph[8] - Western herbal history (still has double gloss)
  const p8 = doc.body.content[8];
  if (p8) {
    p8.content = [{ type: 'text', text: 'Western herbal practice has used lemon balm as a calming herb since at least the medieval period. The main uses are anxiety, nervous tension, restless sleep, nervous headache, and the digestive upset that comes with stress. The herb is considered gentle enough for everyday cups and for older children under guidance.' }];
  }

  // paragraph[9]
  const p9 = doc.body.content[9];
  if (p9) {
    p9.content = [{ type: 'text', text: 'The folk European kitchen tradition uses lemon balm as a bee plant, a lemon flavouring for cordials, and a reliable everyday calming tea. The cold-sore link is specific to the western herbal tradition and tied to antiviral research of the late twentieth century.' }];
  }

  // paragraph[12]
  const p12 = doc.body.content[12];
  if (p12) {
    p12.content = [{ type: 'text', text: 'A lemon balm alcohol extract provides a stronger, longer-shelf-life preparation than dried leaf. It combines well with passionflower or valerian in sleep and anxiety formulas. As dried herb it combines well with chamomile for a gentler everyday digestive and calming tea.' }];
  }

  save('lemon-balm-profile', doc);
}

// ── passionflower infoPanel[1] ────────────────────────────────────────────────
{
  const doc = load('passionflower-infusion-for-sleeplessness');
  const ip = doc.body.content[1];
  if (ip?.type === 'infoPanel' && ip.attrs?.body) {
    ip.attrs.body = 'Not medical advice. For ongoing or serious symptoms, see a herbalist or doctor. Sedative medication: passionflower adds to the effect of sleeping tablets and anxiety medicines. Do not combine without speaking to your prescriber. Driving: do not drive after taking this infusion until you know how it affects you. Pregnancy: avoid at therapeutic doses in pregnancy. Consult a herbalist or midwife. Breastfeeding: safety data is limited. Consult a herbalist or midwife before use. Children: doses for children are not half an adult dose. Seek herbalist or paediatric guidance first.';
  }
  save('passionflower-infusion-for-sleeplessness', doc);
}

// ── peppermint-profile ────────────────────────────────────────────────────────
{
  const doc = load('peppermint-profile');

  const p5 = doc.body.content[5];
  if (p5) {
    p5.content = [{ type: 'text', text: 'The main oil in peppermint is menthol, with menthone as a secondary compound. Menthol activates cold-sensitive receptors in the skin and mucous membranes without lowering the actual temperature. This cooling action is behind peppermint\'s use for headaches applied to the temples and the familiar sensation from peppermint tea steam.' }];
  }

  const p8 = doc.body.content[8];
  if (p8) {
    p8.content = [{ type: 'text', text: 'Western herbal and folk European traditions use peppermint mainly as a digestive herb. The main uses are indigestion after a heavy meal, trapped wind, nausea, and the cramping of an irritable gut. Peppermint tea is one of the oldest after-dinner remedies. It is also used as a diluted oil applied to the temples for tension headaches.' }];
  }

  const p9 = doc.body.content[9];
  if (p9) {
    p9.content = [{ type: 'text', text: 'The cooling and antimicrobial properties of the oil make peppermint a traditional gargle for sore mouths. As a steam inhalation, a handful of dried peppermint in just-boiled water is used for head colds. The menthol creates a sensation of easier breathing and may ease discomfort during acute colds.' }];
  }

  const p16 = doc.body.content[16];
  if (p16) {
    p16.content = [{ type: 'text', text: 'Drug interactions: no notable interactions have been found at culinary tea doses. High-dose peppermint oil capsules may affect how the liver processes some medicines. Readers on regular medication who use high-dose peppermint oil capsules should check with their prescriber.' }];
  }

  save('peppermint-profile', doc);
}

// ── st-johns-wort-infusion-for-low-mood infoPanel[1] ──────────────────────────
{
  const doc = load('st-johns-wort-infusion-for-low-mood');
  const ip = doc.body.content[1];
  if (ip?.type === 'infoPanel' && ip.attrs?.body) {
    ip.attrs.body = 'Not medical advice. For ongoing or serious symptoms, see a herbalist or doctor. St John\'s wort lowers the blood level of many prescribed drugs. Do not use if you take any of the following without speaking to your prescriber first: SSRIs or SNRIs (risk of serotonin syndrome), hormonal contraceptives (contraceptive failure risk), warfarin or other anticoagulants, transplant immunosuppressants, HIV antiretrovirals, or anti-cancer drugs. If you take any prescribed medication, speak to your prescriber before using this herb. At high doses, avoid prolonged sun exposure (photosensitising effect in fair-skinned readers). Do not use in pregnancy without guidance. Children under twelve need herbalist or paediatric guidance before using any herbal preparation.';
  }
  save('st-johns-wort-infusion-for-low-mood', doc);
}

// ── valerian-profile remaining issues ─────────────────────────────────────────
{
  const doc = load('valerian-profile');

  // paragraph[0] - opening
  const p0 = doc.body.content[0];
  if (p0) {
    p0.content = [{ type: 'text', text: 'Valerian in the home kitchen is the strongly aromatic root preparation taken before bed. It comes as a cup of earthy-smelling tea or as an alcohol extract in a small glass of water. Western herbal tradition has used it for sleep for at least a thousand years: mainly for difficulty falling asleep when the obstacle is a restless, overactive mind. Limited trial evidence supports the traditional use for sleep onset. An alcohol extract in 40% spirit stores for two years.' }];
  }

  // paragraph[5] - valerenic acid
  const p5 = doc.body.content[5];
  if (p5) {
    p5.content = [{ type: 'text', text: 'The main active compound is valerenic acid, linked to the sedating action through GABA receptors. Valepotriates were once considered the main actives but break down quickly on storage. They are now seen as secondary. The volatile oil gives valerian its distinctive smell and is thought to contribute to the overall effect. Distinct from the gentler calming herbs such as chamomile or lemon balm.' }];
  }

  // paragraph[8] - historical use
  const p8 = doc.body.content[8];
  if (p8) {
    p8.content = [{ type: 'text', text: 'Valerian has a long record in British folk medicine for nervous distress and sleep problems. Its current use is more specific. The sleep application has the most modern evidence. Trial evidence supports the traditional use for reducing the time to fall asleep, mainly in mild to moderate sleep difficulty.' }];
  }

  // paragraph[14] - sedative medicines
  const p14 = doc.body.content[14];
  if (p14) {
    p14.content = [{ type: 'text', text: 'Sedative medicines: valerian adds to the effect of all sedating medicines. Do not combine with benzodiazepines, barbiturates, sleeping tablets, or sedating antihistamines. The combined effect can be unpredictable.' }];
  }

  // paragraph[16] - driving
  const p16 = doc.body.content[16];
  if (p16) {
    p16.content = [{ type: 'text', text: 'Driving: some readers feel drowsy the next morning, mainly at higher doses. Take valerian only at bedtime on your first use. Check how you feel the following morning before driving.' }];
  }

  // paragraph[17] - pregnancy
  const p17 = doc.body.content[17];
  if (p17) {
    p17.content = [{ type: 'text', text: 'Pregnancy: valerian has not been studied enough in pregnancy. Consult a herbalist or your midwife before using it.' }];
  }

  save('valerian-profile', doc);
}

console.log('Done. All final fixes applied.');
