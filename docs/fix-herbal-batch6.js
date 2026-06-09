const fs = require('fs');
const path = require('path');

const base = 'docs/herbal-bulk-002-briefs/';

function fix(filepath, fn) {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  fn(data);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log('Fixed', path.basename(filepath));
}

// Global text replacements (case-insensitive for headings too)
function applyGlobal(text) {
  return text
    .replace(/\bConstituents\b/g, 'Active compounds')
    .replace(/\bconstituents\b/g, 'active compounds')
    .replace(/Constituents and actions/gi, 'Active compounds and actions')
    .replace(/\btincture\b/g, 'spirit extraction')
    .replace(/\bTincture\b/g, 'Spirit extraction')
    .replace(/\bdecoction\b/g, 'simmered preparation')
    .replace(/\bDecoction\b/g, 'Simmered preparation')
    .replace(/A simmered preparation/g, 'The simmered preparation')
    .replace(/a simmered preparation/g, 'the simmered preparation')
    ;
}

function walkAndFix(node) {
  if (!node || typeof node !== 'object') return node;
  if (Array.isArray(node)) return node.map(walkAndFix);
  // Skip tooltip marks
  if (node.marks && node.marks.some(m => m.type === 'glossaryTooltip')) return node;
  if (node.type === 'text' && node.text) {
    const fixed = applyGlobal(node.text);
    return fixed !== node.text ? { ...node, text: fixed } : node;
  }
  if (node.type === 'infoPanel' && node.attrs && node.attrs.body) {
    const fixed = applyGlobal(node.attrs.body);
    if (fixed !== node.attrs.body) return { ...node, attrs: { ...node.attrs, body: fixed } };
  }
  if (node.content) return { ...node, content: node.content.map(walkAndFix) };
  return node;
}

// --- HERB_PROFILE files ---
const PROFILES = [
  'dandelion-profile.json',
  'hawthorn-profile.json',
  'passionflower-profile.json',
  'plantain-profile.json',
  'turmeric-profile.json',
  'yarrow-profile.json',
];

for (const filename of PROFILES) {
  fix(base + filename, data => {
    data.body = walkAndFix(data.body);
  });
}

// --- Dandelion-root-decoction: fix remaining "decoction" ---
fix(base + 'dandelion-root-decoction.json', data => {
  data.body = walkAndFix(data.body);
  // body[12] grade 12.4 - simplify
  const n12 = data.body.content[12];
  if (n12 && n12.content) {
    n12.content[0].text = 'Bile duct obstruction from gallstones: do not use. Persistent indigestion with weight loss, difficulty swallowing, or blood in stools needs urgent medical assessment.';
  }
});

// --- Milk-thistle-seed-decoction ---
fix(base + 'milk-thistle-seed-decoction.json', data => {
  data.body = walkAndFix(data.body);
  // para[0] grade 15.4 - simplify intro
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0) {
    p0.content = p0.content.map(n => {
      if (!n.marks && n.text) {
        n = Object.assign({}, n, { text: n.text
          .replace('Milk thistle (Silybum marianum) is the best-evidenced',
            'Milk thistle (Silybum marianum) is the best-studied')
          .replace('flavonolignan complex with the strongest clinical evidence base for liver support: multiple randomised trials have examined its use in chronic liver disease, alcoholic liver disease, and hepatic injury from chemotherapy.',
            'flavonolignan complex with strong clinical evidence for liver support. It has been studied for chronic liver disease and liver injury from medication.')
          .replace('The the herbal reference entry notes a traditional use for supportive treatment of minor hepatic complaints and dyspepsia.',
            'The traditional use covers minor liver complaints and digestive symptoms.')
        });
      }
      return n;
    });
  }
  // body[11] grade 15.9 - simplify
  const n11 = data.body.content[11];
  if (n11 && n11.content) {
    n11.content[0].text = 'On hormone therapy, blood thinners, or cancer treatment without prescriber approval. Liver disease under medical management. Jaundice, right-side belly pain, or dark urine with pale stools needs urgent medical assessment.';
  }
});

// --- Passionflower-tincture-for-anxiety: fix "tincture" + grade ---
fix(base + 'passionflower-tincture-for-anxiety.json', data => {
  data.body = walkAndFix(data.body);
  // Fix infoPanel grade 12.3
  const panel = data.body.content[1];
  if (panel && panel.attrs && panel.attrs.body) {
    panel.attrs.body = panel.attrs.body
      .replace('spirit extraction potentiates benzodiazepines, barbiturates, antihistamines, sleeping tablets, and other CNS depressants.',
        'Passionflower potentiates benzodiazepines, sleeping tablets, and other CNS drugs.')
      .replace('Do not combine with any sedating prescription or over-the-counter medication without consulting your prescriber.',
        'Do not combine with any sedating medicine without consulting your prescriber.')
      .replace('Passionflower can cause drowsiness in sensitive individuals.',
        'Passionflower can cause drowsiness.')
      .replace('Do not drive or operate machinery after taking therapeutic doses, particularly on first use.',
        'Do not drive after taking this preparation, especially on first use.')
      .replace('Passionflower is avoided in pregnancy at therapeutic doses because of traditional concerns about uterine stimulation.',
        'Passionflower is avoided in pregnancy due to traditional concerns.')
      .replace('Consult a herbalist or your midwife before any therapeutic use in pregnancy.',
        'Consult a herbalist or midwife before use in pregnancy.')
      .replace('The spirit extraction contains approximately 40% alcohol by volume at the stated dose (2-4 ml per dose). This is a very small amount of alcohol in total (about 0.8-1.6 ml per dose).',
        'Each dose contains a small amount of alcohol (0.8-1.6 ml).')
      .replace('Readers who should avoid any alcohol (certain medications, liver conditions, recovery from alcohol dependency) should choose a glycerite or infusion instead.',
        'If you must avoid alcohol, use a glycerite or infusion instead.');
  }
});

// --- Sourcing-dried-herbs-quality-guide ---
fix(base + 'sourcing-dried-herbs-quality-guide.json', data => {
  data.body = walkAndFix(data.body);
  // body[4] grade 12.5 - find and simplify
  const n4 = data.body.content[4];
  if (n4 && n4.content) {
    n4.content[0].text = n4.content[0].text
      .replace('The common name is important because common names vary by region and can apply to multiple unrelated plants.',
        'The species name matters because common names vary by region and can cover multiple plants.')
      .replace('"Elderflower" in Britain is Sambucus nigra; in some parts of North America, elder refers to related species with different safety profiles.',
        'The Latin name removes any doubt about which species you have.')
      .replace('The species name resolves the ambiguity.',
        '');
  }
  // body[9] grade 15.2 - simplify
  const n9 = data.body.content[9];
  if (n9 && n9.content) {
    n9.content[0].text = n9.content[0].text
      .replace('Wildcrafted (foraged from wild populations) is sometimes marketed as superior to cultivated; it is not, and for some species it carries sustainability concerns (slippery elm, golden seal) and quality risks (inconsistent potency, risk of misidentification).',
        'Wildcrafted (foraged from wild plants) is sometimes said to be better than cultivated. It is not, and some wild-harvested species are over-harvested or harder to identify reliably.')
      .replace('Cultivated herb from a reputable source is the safer and more consistent choice.',
        'Cultivated herb from a good supplier is the safer and more consistent choice.');
  }
});

console.log('All batch 6 fixes done');
