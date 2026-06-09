const fs = require('fs');
const base = 'docs/herbal-bulk-002-briefs/';

function fixFile(filename, fn) {
  const data = JSON.parse(fs.readFileSync(base + filename, 'utf8'));
  fn(data);
  fs.writeFileSync(base + filename, JSON.stringify(data, null, 2));
  console.log('Fixed', filename);
}

function simplify(data, bodyIdx, nodeIdx, replacements) {
  const n = data.body.content[bodyIdx];
  if (!n) return;
  const target = n.content ? n.content[nodeIdx] : null;
  if (!target) {
    // Try attrs.body for infoPanels
    if (n.attrs && n.attrs.body) {
      let b = n.attrs.body;
      for (const [from, to] of replacements) b = b.replace(from, to);
      n.attrs = { ...n.attrs, body: b };
    }
    return;
  }
  if (!target.marks && target.text) {
    for (const [from, to] of replacements) {
      target.text = target.text.replace(from, to);
    }
  }
}

// TURMERIC
fixFile('turmeric-profile.json', data => {
  // body[5] node[0]: "active active" double
  simplify(data, 5, 0, [
    ['primary active active compounds', 'primary active compounds'],
    ['The primary active compounds are the curcuminoids: curcumin (the principal compound), demethoxycurcumin, and bisdemethoxycurcumin.',
      'The primary active compounds are the curcuminoids, with curcumin as the main form.'],
    ['They make up roughly 2-5% of the dried root.', 'They make up roughly 2-5% of the dried root.'],
  ]);
  // body[5] node[4]: simplify if it has long sentences
  const n5 = data.body.content[5];
  if (n5 && n5.content && n5.content[4]) {
    n5.content[4].text = n5.content[4].text
      .replace('Western herbalists draw on the inflammation-calming action, the liver-supporting action, and the antioxidant activity.', 'Western herbalists draw on the inflammation-calming, liver-supporting, and antioxidant properties.')
      .replace('Curcumin absorbs poorly on its own. Traditional preparations combine it with fat and black pepper (piperine improves absorption). The food tradition preserved this long before the chemistry was understood.',
        'Curcumin absorbs poorly on its own. Traditional preparations combine it with fat and black pepper to improve absorption.');
  }
  // body[7] node[0]: grade 12.2
  const n7 = data.body.content[7];
  if (n7 && n7.content && n7.content[0]) {
    n7.content[0].text = n7.content[0].text
      .replace('Ayurveda records turmeric as a digestive, a blood-purifier, and a wound herb. The classical texts use it for skin conditions, digestive complaints, respiratory congestion, liver and gallbladder complaints, and to support recovery after childbirth.',
        'Ayurveda records turmeric as a digestive, blood-purifying, and wound herb, used for skin, digestive, and respiratory complaints, liver, gallbladder, and recovery after childbirth.');
  }
  // body[9] node[0]: garbled text
  const n9 = data.body.content[9];
  if (n9 && n9.content && n9.content[0]) {
    n9.content[0].text = 'Western herbal practice adopted turmeric later than Asian traditions. Modern western herbalists use it for inflammation and sluggish digestion. The traditional use covers relief of mild digestive complaints.';
  }
  // body[11]: simplify
  const n11 = data.body.content[11];
  if (n11 && n11.content) {
    n11.content.forEach((node, i) => {
      if (!node.marks && node.text) {
        node.text = node.text
          .replace('The classic domestic form is the golden milk blend: ground turmeric simmered in whole milk with black pepper and fat, the preparation that best preserves bioavailability.',
            'The classic form is golden milk: ground turmeric simmered in whole milk with black pepper and fat, the preparation that best preserves absorption.')
          .replace('Decoctions of fresh or dried root in water are used in TCM and Ayurveda; the addition of black pepper and oil remains the standard advice for enhancing absorption.',
            'Decoctions in water are used in TCM and Ayurveda. Adding black pepper and oil remains standard for improving absorption.')
          .replace('bioavailability', 'absorption');
      }
    });
  }
  // body[13] node[0]: simplify
  const n13 = data.body.content[13];
  if (n13 && n13.content && n13.content[0]) {
    n13.content[0].text = n13.content[0].text
      .replace('Anticoagulants: as above, keep to culinary quantities if on any blood-thinning medication. Gallstones: avoid concentrated preparations if stones are diagnosed. Pregnancy: culinary turmeric in food is safe. Medicinal preparations are outside the culinary safe range; check with your midwife.',
        'Blood thinners: keep to culinary amounts. Gallstones: avoid concentrated preparations if diagnosed. Pregnancy: culinary turmeric is safe. Medicinal preparations are outside this safe range; check with your midwife.');
  }
});

// PASSIONFLOWER
fixFile('passionflower-profile.json', data => {
  // body[5]: "nervine and anxiolytic" - these should be in tooltips
  // Just simplify the plain text around them
  const n5 = data.body.content[5];
  if (n5 && n5.content) {
    n5.content.forEach(node => {
      if (!node.marks && node.text) {
        node.text = node.text
          .replace('The nervine and anxiolytic actions are the ones western herbalists draw on. The muscle-relaxing action is noted in the Eclectic tradition for nervous conditions with muscular tension.',
            'These are the actions western herbalists draw on. The muscle-relaxing action is noted in the Eclectic tradition for nervous conditions with muscular tension.')
          .replace('Limited study evidence supports passionflower for anxiety compared against low-dose oxazepam (roughly equal effect, fewer cognitive side effects). Larger trials are still needed.',
            'Limited study evidence supports passionflower for anxiety. Larger trials are still needed.');
      }
    });
  }
  // body[7] node[0]: grade 21.0 - radical simplification
  const n7 = data.body.content[7];
  if (n7 && n7.content && n7.content[0]) {
    n7.content[0].text = 'Native American peoples of the south-eastern US used passionflower root for boils and ear problems. The Eclectic physicians of 19th-century America established the nerve-calming tradition with this herb. Their dispensatory describes it for insomnia, nervous restlessness, and neuralgia. They noted its value for sleeplessness from mental over-activity.';
  }
  // body[8] node[0]: remove "nervine"
  const n8 = data.body.content[8];
  if (n8 && n8.content && n8.content[0]) {
    n8.content[0].text = n8.content[0].text
      .replace('Passionflower became a standard European nervine through the 20th century.',
        'Passionflower became a standard European nerve-calming herb through the 20th century.')
      .replace('It is one of the better-evidenced nervine herbs available.',
        'It is one of the better-evidenced calming herbs available.');
  }
  // infoPanel[1]: simplify
  const panel = data.body.content[1];
  if (panel && panel.attrs && panel.attrs.body) {
    panel.attrs.body = panel.attrs.body
      .replace('Not for children under twelve without specialist advice.', 'Not for children under twelve.')
      .replace('Each dose contains a small amount of alcohol (0.8-1.6 ml).', 'Each dose contains a tiny amount of alcohol.')
      .replace('If you must avoid alcohol, use a glycerite or infusion instead.', 'Avoid alcohol: use a glycerite or infusion instead.');
  }
});

// DANDELION
fixFile('dandelion-profile.json', data => {
  // body[5]: "sesquiterpene" compound - simplify
  const n5 = data.body.content[5];
  if (n5 && n5.content) {
    n5.content.forEach(node => {
      if (!node.marks && node.text) {
        node.text = node.text
          .replace('taraxacin (a bitter compound responsible for the digestive bitter action), inulin (a prebiotic fibre, most abundant in autumn-harvested root), sterols, and phenolic acids.',
            'taraxacin (a bitter compound that drives the digestive action), inulin (a prebiotic fibre, most in autumn-harvested root), sterols, and phenolic acids.')
          .replace('The root is the bile-stimulating herb: the bitterness stimulates bile flow, supporting fat digestion and liver clearing.',
            'The root stimulates bile flow, supporting fat digestion and liver function.')
          .replace('The root is the cholagogue: the bitterness stimulates bile secretion and flow, supporting fat digestion and hepatic clearing.',
            'The root stimulates bile flow, supporting fat digestion.')
          .replace('The leaf is the more nutritive, the root the more medicinally active for liver and digestion.',
            'The leaf is more nutritive; the root is more active for liver and digestion.');
      }
    });
  }
  // body[7]: simplify
  const n7 = data.body.content[7];
  if (n7 && n7.content) {
    n7.content.forEach(node => {
      if (!node.marks && node.text) {
        node.text = node.text
          .replace('describes dandelion root as one of the most important liver herbs, used for liver, gallbladder, and spleen complaints and as a digestive remedy.',
            'records dandelion root as an important liver herb, used for liver and gallbladder complaints and as a digestive remedy.')
          .replace('He also records the tradition of eating the young leaves as a spring tonic.',
            'She also records the tradition of eating the young leaves as a spring tonic.')
          .replace('The Eclectic tradition (King\'s Dispensatory) records the use for liver torpor, jaundice, and as a gentle laxative through its bile-stimulating action.',
            'The Eclectic tradition records the use for liver torpor and jaundice.');
      }
    });
  }
  // body[8]: grade 12.4 - barely over, already simplified
  const n8 = data.body.content[8];
  if (n8 && n8.content) {
    n8.content.forEach(node => {
      if (!node.marks && node.text) {
        node.text = node.text
          .replace('Chinese medicine uses a related dandelion species for liver-heat states, urinary problems, and skin conditions.',
            'Chinese medicine uses a related species for liver, urinary, and skin conditions.')
          .replace('Western herbal practice draws on the European and Eclectic traditions.',
            'Western herbal practice follows the European and Eclectic traditions.');
      }
    });
  }
});

// YARROW
fixFile('yarrow-profile.json', data => {
  // body[5]: simplify
  const n5 = data.body.content[5];
  if (n5 && n5.content) {
    n5.content.forEach(node => {
      if (!node.marks && node.text) {
        node.text = node.text
          .replace('The key active compounds include the aromatic oil (azulene, cineole, camphor), the sesquiterpene compounds, flavonoids, achilleine (an alkaloid associated with the styptic action), and tannins.',
            'The key active compounds include the aromatic oil (azulene, cineole), sesquiterpene compounds, flavonoids, achilleine (associated with styptic action), and tannins.')
          .replace('The astringent action from the tannins supports both the wound-staunching use and the use for heavy menstrual bleeding.',
            'Tannins support both the wound-staunching use and the use for heavy menstrual bleeding.');
      }
    });
  }
  // body[8]: grade 15.8 - simplify
  const n8 = data.body.content[8];
  if (n8 && n8.content) {
    n8.content.forEach(node => {
      if (!node.marks && node.text) {
        node.text = node.text
          .replace('Native American peoples used yarrow for wounds, fever, and colds: the same uses the European tradition developed independently.',
            'Native American peoples used yarrow for wounds, fever, and colds, the same uses the European tradition developed.')
          .replace('The Eclectic American physicians document the haemostatic and sweat-promoting uses as well-established.',
            'The Eclectic American physicians also document the wound-staunching and sweat-promoting uses.');
      }
    });
  }
  // body[12]: grade 13.3 - simplify
  const n12 = data.body.content[12];
  if (n12 && n12.content) {
    n12.content.forEach(node => {
      if (!node.marks && node.text) {
        node.text = node.text
          .replace('Pregnancy: avoid therapeutic doses. Asteraceae allergy: avoid. Photosensitivity: handling fresh herb in sunlight can rarely cause skin reactions. Any heavy bleeding, persistent fever, or significant wound needs medical assessment.',
            'Pregnancy: avoid therapeutic doses. Daisy allergy: avoid. Fresh herb rarely causes sun-sensitivity. Any heavy bleeding, persistent fever, or significant wound needs medical assessment.');
      }
    });
  }
});

// PLANTAIN
fixFile('plantain-profile.json', data => {
  // body[5]: grade 12.7 - simplify
  const n5 = data.body.content[5];
  if (n5 && n5.content) {
    n5.content.forEach(node => {
      if (!node.marks && node.text) {
        node.text = node.text
          .replace('Allantoin (a compound found in comfrey leaf, linked to cell repair), soothing gel (the demulcent component), aucubin (an iridoid glycoside with mild inflammation-calming activity), and tannins (the astringent component) are the key active compounds.',
            'Allantoin (linked to cell repair), soothing gel, aucubin (with mild calming activity), and tannins (the astringent part) are the key active compounds.')
          .replace('The wound-supporting action on minor skin wounds comes from the allantoin and soothing gel.',
            'The allantoin and soothing gel support wound healing.')
          .replace('The soothing action on coughs comes from the soothing gel.',
            'The soothing gel soothes coughs.')
          .replace('The tannins help stop minor bleeding, making the fresh poultice a traditional first aid for minor cuts and stings.',
            'Tannins help stop minor bleeding, making the fresh poultice a traditional first aid for cuts and stings.');
      }
    });
  }
  // body[7]: grade 14.2 - simplify
  const n7 = data.body.content[7];
  if (n7 && n7.content) {
    n7.content.forEach(node => {
      if (!node.marks && node.text) {
        node.text = node.text
          .replace('records plantain as a wound herb in European folk medicine, used internally for coughs and kidney complaints.',
            'records plantain as a wound herb, used for coughs and kidney complaints.')
          .replace('recommends it for wounds, bleeding, and insect stings.',
            'recommends it for wounds and insect stings.')
          .replace('The Eclectic tradition records its use for mucous membrane irritation and minor wounds.',
            'The Eclectic tradition records its use for irritated mucous membranes and minor wounds.');
      }
    });
  }
});

console.log('All batch 8 fixes done');
