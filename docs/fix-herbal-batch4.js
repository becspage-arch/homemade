const fs = require('fs');
const path = require('path');

function fix(filepath, fn) {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  fn(data);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log('Fixed', path.basename(filepath));
}

const base = 'docs/herbal-bulk-002-briefs/';

// ashwagandha: simplify para0 node[2] + body[11]
fix(base + 'ashwagandha-warm-milk.json', data => {
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0 && p0.content[2]) {
    p0.content[2].text = ': traditionally used by those recovering from illness, under stress, or dealing with fatigue. Its ';
  }
  const n11 = data.body.content[11];
  if (n11 && n11.content && n11.content[0]) {
    n11.content[0].text = 'In pregnancy. On thyroid medication without prescriber approval. With autoimmune disease without herbalist guidance. Severe fatigue with unexplained weight loss or night sweats needs medical investigation.';
  }
});

// burdock: simplify para0 + fix decoction + body[11]
fix(base + 'burdock-root-decoction-spring-cleanse.json', data => {
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0) {
    p0.content[0].text = 'Burdock root (Arctium lappa) is one of the classic cleansing herbs of the western tradition. ';
    if (p0.content[2]) {
      p0.content[2].text = ' herbs. The Eclectic physicians used it for chronic skin conditions and sluggish lymphatic function. Maud Grieve, the early 20th-century botanical writer, records it as a traditional spring herb. The simmered preparation is made from the dried root. It tastes slightly sweet, slightly bitter, and earthy.';
    }
  }
  const n11 = data.body.content[11];
  if (n11 && n11.content && n11.content[0]) {
    n11.content[0].text = 'Known Asteraceae allergy. Pregnancy. Severe, infected, or rapidly worsening skin conditions need medical assessment.';
  }
});

// gotu-kola: simplify para0 + body[11]
fix(base + 'gotu-kola-infusion-for-focus.json', data => {
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0) {
    p0.content[0].text = 'Gotu kola (Centella asiatica) is one of the traditional cognitive-tonic herbs in the Ayurvedic system. ';
    if (p0.content[2]) {
      p0.content[2].text = ' herbs. Western herbalists class it as a nerve-calming and stress-supporting herb. The infusion is mild and slightly bitter. A morning cup is the traditional approach for focus and mental clarity. The herb is calming without causing drowsiness.';
    }
  }
  const n11 = data.body.content[11];
  if (n11 && n11.content && n11.content[0]) {
    n11.content[0].text = 'In pregnancy at therapeutic dose. With liver conditions without medical approval. Progressive memory loss or cognitive decline needs medical assessment.';
  }
});

// holy-basil: simplify para0 node[0] + infoPanel + body[11]
fix(base + 'holy-basil-adaptogen-tea.json', data => {
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0) {
    p0.content[0].text = 'Holy basil (Ocimum tenuiflorum, tulsi) is a major medicinal plant in the Ayurvedic tradition. It holds ';
    if (p0.content[2]) {
      p0.content[2].text = p0.content[2].text
        .replace(' status: a herb taken as a general tonic to support resilience and wellbeing. In modern western herbal practice it is categorised as a stress-supporting herb. The infusion is pleasant and aromatic: clove-like, warm, slightly spicy from the eugenol and rosmarinic acid content. Taken through the autumn and winter months, once or twice a day, it sits within the traditional use for seasonal immune support and stress resilience.',
          ' status: a tonic for resilience and wellbeing. The infusion is clove-like, warm, and slightly spicy. One or two cups a day through autumn and winter falls within the traditional use for seasonal immune support.');
    }
  }
  const panel = data.body.content[1];
  if (panel && panel.attrs && panel.attrs.body) {
    panel.attrs.body = panel.attrs.body
      .replace('Readers on warfarin, aspirin at therapeutic dose, or other anticoagulants should not use this preparation without checking with their prescriber.',
        'Readers on warfarin, aspirin, or other anticoagulants should check with their prescriber before use.');
  }
  const n11 = data.body.content[11];
  if (n11 && n11.content && n11.content[0]) {
    n11.content[0].text = 'On anticoagulants without prescriber approval. On diabetes medication without close blood sugar monitoring. In pregnancy at therapeutic dose.';
  }
});

// lemon-balm: fix tincture + simplify para0 + body[12]
fix(base + 'lemon-balm-tincture.json', data => {
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0) {
    p0.content[0].text = 'Lemon balm (Melissa officinalis) is a gentle nerve-calming herb. It is mild enough to take during the day without causing drowsiness. Its ';
    if (p0.content[2]) {
      p0.content[2].text = p0.content[2].text
        .replace('The herbal tincture preserves the herb year-round and provides a more convenient form for daytime use than brewing a fresh cup each time.',
          'A spirit extraction preserves the herb year-round and is a convenient daytime form.')
        .replace('nerve-calming herb and wind-easing herb (digestive-calming) action',
          'nerve-calming and digestive-soothing action');
    }
  }
  const n12 = data.body.content[12];
  if (n12 && n12.content && n12.content[0]) {
    n12.content[0].text = 'On thyroid hormone replacement medication without prescriber approval. Anxiety that significantly affects daily life needs medical assessment.';
  }
});

// motherwort: simplify para0 + fix tincture at body[5] + body[11]
fix(base + 'motherwort-tincture.json', data => {
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0 && p0.content[2]) {
    p0.content[2].text = ': the herb for stress-related palpitations in an otherwise healthy heart. Western herbalists use it for nervous palpitations and perimenopausal heart-rate symptoms.';
  }
  if (data.body.content[5] && data.body.content[5].content) {
    data.body.content[5].content = data.body.content[5].content.map(n => {
      if (!n.marks && n.text) {
        n = Object.assign({}, n, {text: n.text.replace(/The herbal tincture/g, 'This spirit extraction').replace(/the herbal tincture/g, 'this spirit extraction')});
      }
      return n;
    });
  }
  const n11 = data.body.content[11];
  if (n11 && n11.content && n11.content[0]) {
    n11.content[0].text = 'In pregnancy. On cardiac medication. Before palpitations have been medically assessed. Seek urgent care for palpitations with chest pain, breathlessness, or dizziness.';
  }
});

// sage: fix para0 text + prescriptive verb + body[11]
fix(base + 'sage-tea-for-hot-flushes.json', data => {
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0 && p0.content[0]) {
    const txt = p0.content[0].text;
    if (txt.includes('Maud Grieve')) {
      p0.content[0].text = txt
        .replace('Maud Grieve (the early 20th-century botanical writer) (the early 20th-century botanical writer), the early 20th-century botanical writer, records it as the traditional remedy for night sweats and the perspiration of menopause. a tradi',
          'Maud Grieve, the early 20th-century botanical writer, records it as the traditional remedy for menopausal sweating. The herb\'s mild oestrogenic and antiperspirant action ')
        .replace('a traditional use for menopausal symptoms. The',
          'traditional use for menopausal symptoms. The');
    }
  }
  data.body.content.forEach(n => {
    if (n.type === 'paragraph' && n.content) {
      n.content.forEach(c => {
        if (!c.marks && c.text && c.text.includes('consult your GP')) {
          c.text = c.text.replace('consult your GP about additional options including HRT', 'speak to your GP about all options including HRT');
        }
      });
    }
  });
  const n11 = data.body.content[11];
  if (n11 && n11.content && n11.content[0]) {
    n11.content[0].text = 'In pregnancy. During active breastfeeding. With oestrogen-sensitive cancer or conditions without specialist guidance. Hot flushes with unexplained weight change, night sweats, or palpitations need medical evaluation.';
  }
});

// vervain: simplify para0 node[2] + infoPanel + body[11]
fix(base + 'vervain-infusion-for-tension.json', data => {
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0 && p0.content[2]) {
    p0.content[2].text = p0.content[2].text
      .replace(' niche: it is the herb for the reader who has pushed too hard, is running on empty, and has forgotten how to slow down. Maud Grieve (the early 20th-century botanical writer), the early 20th-century botanical writer, records it as a nerve-calming herb for exhaustion and nervous debility; the Eclectic tradition uses it for tension states with an underlying over-stimulated quality. The taste is distinctly bitter; the bitterness is also part of the preparation\'s action, stimulating digestive function alongside the nervous-system calming.',
        ' niche: the herb for the reader who has pushed too hard and cannot wind down. The western tradition records it for exhaustion and nervous debility. The taste is distinctly bitter; the bitterness also stimulates digestion.');
  }
  const panel = data.body.content[1];
  if (panel && panel.attrs && panel.attrs.body) {
    panel.attrs.body = panel.attrs.body
      .replace('Burnout and exhaustion. Vervain is a nerve-calming herb for mild tension and over-busyness, not for clinical burnout, clinical anxiety disorder, or depressive illness. If tension is significantly affecting daily life or is accompanied by mood disturbance, seek medical assessment.',
        'Burnout. Vervain is for mild tension and over-busyness, not for clinical burnout or depression. Tension that affects daily life or comes with mood disturbance needs medical assessment.');
  }
  const n11 = data.body.content[11];
  if (n11 && n11.content && n11.content[0]) {
    n11.content[0].text = 'In pregnancy: do not use. Tension with chest pain, palpitations, or breathlessness needs medical assessment.';
  }
});

console.log('All done');
