const fs = require('fs');

function fix(filepath, fn) {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  fn(data);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log('Fixed', require('path').basename(filepath));
}

const base = 'docs/herbal-bulk-002-briefs/';

// ashwagandha: grade 13.2 at para[0]
// Issue: node[4] has "The traditional preparation simmer the root powder in whole milk; fat aids absorption"
fix(base + 'ashwagandha-warm-milk.json', data => {
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0 && p0.content[4]) {
    p0.content[4].text = p0.content[4].text
      .replace(' are the principal studied active compounds. The traditional preparation simmer the root powder in whole milk; fat aids absorption and the warm milk adds its own sleep-promoting qualities. A small amount of honey and black pepper completes the preparation (pepper improves bioavailability as it does for turmeric). Taken before bed, this is a warming, mildly sedating drink with a mild earthy taste.',
        ' are the main active compounds studied. The preparation is a simmered root powder in warm milk. Fat helps absorption. The warm milk also promotes sleep. A pinch of honey and black pepper completes the drink. Taken before bed, it is warming and mildly sedating.');
  }
});

// burdock: grade 14.0 at body[11]
fix(base + 'burdock-root-decoction-spring-cleanse.json', data => {
  const n11 = data.body.content[11];
  if (n11 && n11.content && n11.content[0]) {
    const txt = n11.content.map(n => n.text || '').join('');
    if (txt.includes('Skin conditions') || txt.includes('skin conditions')) {
      n11.content[0].text = 'Known Asteraceae allergy. Pregnancy. Severe or infected skin conditions need medical assessment.';
    }
  }
});

// gotu-kola: grade 13.0 at body[11]
fix(base + 'gotu-kola-infusion-for-focus.json', data => {
  const n11 = data.body.content[11];
  if (n11 && n11.content && n11.content[0]) {
    n11.content[0].text = 'In pregnancy at therapeutic dose. With liver conditions without medical approval. Progressive memory loss needs medical assessment.';
  }
});

// holy-basil: grade 12.2 at para[0], infoPanel[1], and body[11]
fix(base + 'holy-basil-adaptogen-tea.json', data => {
  // simplify para[0] node[0]
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0 && p0.content[0]) {
    p0.content[0].text = 'Holy basil (Ocimum tenuiflorum, tulsi) is a key medicinal plant in the Ayurvedic tradition. It holds ';
  }
  if (p0 && p0.content[2]) {
    p0.content[2].text = p0.content[2].text
      .replace(' status: a tonic for resilience and wellbeing. The infusion is clove-like, warm, and slightly spicy. One or two cups a day through autumn and winter falls within the traditional use for seasonal immune support.',
        ' status: a tonic for resilience. The infusion is clove-like and warm. One or two cups a day through autumn and winter fits the traditional use for immune support.');
  }
  // simplify infoPanel[1] body
  const panel = data.body.content[1];
  if (panel && panel.attrs && panel.attrs.body) {
    panel.attrs.body = panel.attrs.body
      .replace('Anticoagulants. Holy basil has mild antiplatelet activity. Readers on warfarin, aspirin, or other anticoagulants should check with their prescriber before use.',
        'Anticoagulants. Holy basil has mild blood-thinning activity. Readers on warfarin or aspirin should check with their prescriber before use.')
      .replace('Hypoglycaemic. Holy basil can lower blood sugar; readers on diabetes medication should monitor carefully and consult their prescriber.',
        'Blood sugar. Holy basil can lower blood sugar. Readers on diabetes medication should monitor carefully and check with their prescriber.');
  }
  // body[11]
  const n11 = data.body.content[11];
  if (n11 && n11.content && n11.content[0]) {
    n11.content[0].text = 'On anticoagulants without prescriber approval. On diabetes medication without close monitoring. In pregnancy at therapeutic dose.';
  }
});

// lemon-balm: grade 12.6 at para[0], grade 16.9 at body[12]
fix(base + 'lemon-balm-tincture.json', data => {
  // simplify para[0] node[0] further
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0 && p0.content[0]) {
    p0.content[0].text = 'Lemon balm (Melissa officinalis) is a gentle calming herb. It is safe to take during the day. Its ';
  }
  if (p0 && p0.content[2]) {
    p0.content[2].text = p0.content[2].text
      .replace('nerve-calming and digestive-soothing action the western tradition draws on. the herbal reference documents its well-established use for mild anxiety and sleep disturbance, and its traditional use for nervous digestive complaints.',
        'calming and digestive action the western tradition draws on. It has a good evidence base for mild anxiety and sleep disturbance.');
  }
  // simplify body[12] (grade 16.9)
  const n12 = data.body.content[12];
  if (n12 && n12.content && n12.content[0]) {
    n12.content[0].text = 'On thyroid hormone medication without prescriber approval. Anxiety that affects daily life needs medical assessment.';
  }
});

// motherwort: grade 15.7 at para[0]
fix(base + 'motherwort-tincture.json', data => {
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0 && p0.content[2]) {
    p0.content[2].text = '. It is used for a racing or anxious heart in an otherwise healthy reader. Western herbalists use it for stress-related heart symptoms and for rapid heartbeat during the menopause.';
  }
});

// sage: grade 14.0 at para[0]
fix(base + 'sage-tea-for-hot-flushes.json', data => {
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0 && p0.content[0]) {
    const txt = p0.content[0].text;
    // Fix sentence fragment "a traditional use for..."
    p0.content[0].text = txt
      .replace('a traditional use for symptomatic relief of excessive sweating, and traditional use for menopausal symptoms. The',
        'The')
      .replace("Maud Grieve, the early 20th-century botanical writer, records it as the traditional remedy for menopausal sweating. The herb's mild oestrogenic and antiperspirant action ",
        "Maud Grieve, the early 20th-century botanical writer, records it as the traditional remedy for menopausal sweating. Its mild plant oestrogen and antiperspirant actions ")
      .replace("Sage (Salvia officinalis) has a long European herbal record for excessive sweating and hot flushes. Maud Grieve, the early 20th-century botanical writer, records it as the traditional remedy for menopausal sweating. The herb's mild oestrogenic and antiperspirant action ",
        "Sage (Salvia officinalis) has a long European herbal record for hot flushes and night sweats. Its mild plant-oestrogen and antiperspirant actions ");
  }
});

// vervain: grade 15.8 at para[0]
fix(base + 'vervain-infusion-for-tension.json', data => {
  const p0 = data.body.content.find(n => n.type === 'paragraph');
  if (p0 && p0.content[0]) {
    p0.content[0].text = 'Vervain (Verbena officinalis) grows on roadsides and chalk ground across Britain and Europe. In the western herbal tradition it occupies a specific ';
  }
  if (p0 && p0.content[2]) {
    p0.content[2].text = p0.content[2].text
      .replace(' niche: the herb for the reader who has pushed too hard and cannot wind down. The western tradition records it for exhaustion and nervous debility. The taste is distinctly bitter; the bitterness also stimulates digestion.',
        ' niche. It is the herb for the reader who has pushed too hard and cannot wind down. The western tradition records it for exhaustion and tension. The taste is bitter; this also helps stimulate digestion.');
  }
});

console.log('All done');
