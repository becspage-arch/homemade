const fs = require('fs');
const path = require('path');

const base = 'docs/herbal-bulk-002-briefs/';

function fixFile(filename, fn) {
  const data = JSON.parse(fs.readFileSync(base + filename, 'utf8'));
  fn(data);
  fs.writeFileSync(base + filename, JSON.stringify(data, null, 2));
  console.log('Fixed', filename);
}

// Helper: fix node[0] text of a body content node
function fixNodeText(data, bodyIdx, nodeIdx, replaceFrom, replaceTo) {
  const n = data.body.content[bodyIdx];
  if (!n) return;
  if (n.content && n.content[nodeIdx]) {
    n.content[nodeIdx].text = n.content[nodeIdx].text.replace(replaceFrom, replaceTo);
  }
}

// Helper: simplify all text nodes in a body content node
function simplifyNode(data, bodyIdx, fn) {
  const n = data.body.content[bodyIdx];
  if (!n || !n.content) return;
  n.content = n.content.map(node => {
    if (!node.marks && node.text) {
      return Object.assign({}, node, {text: fn(node.text)});
    }
    return node;
  });
}

// --- DANDELION ---
fixFile('dandelion-profile.json', data => {
  // body[5]: "sesquiterpene lactone" → simplify
  simplifyNode(data, 5, t => t
    .replace('taraxacin (a bitter sesquiterpene lactone responsible for the digestive bitter action)',
      'taraxacin (a bitter compound responsible for the digestive bitter action)')
    .replace('inulin (a prebiotic fibre, most abundant in autumn-harvested root), sterols, and phenolic acids. The root is the cholagogue: the bitterness stimulates bile secretion and flow, supporting fat digestion and hepatic clearing.',
      'inulin (a prebiotic fibre, most abundant in autumn-harvested root), sterols, and phenolic acids. The root is the bile-stimulating herb: the bitterness stimulates bile flow, supporting fat digestion and liver clearing.')
    .replace('hepatic clearing', 'liver clearing')
  );
  // body[7]: simplify long sentence
  simplifyNode(data, 7, t => t
    .replace('describes dandelion root as among the most important of the hepatic herbs, traditionally prescribed for liver, gallbladder, and spleen complaints and as a digestive remedy for constipation and sluggish digestion.',
      'describes dandelion root as one of the most important liver herbs, used for liver, gallbladder, and spleen complaints and as a digestive remedy.')
    .replace('He notes the Welsh and French traditions of eating the young leaves as a spring tonic.',
      'He also records the tradition of eating the young leaves as a spring tonic.')
    .replace('The King\'s American Dispensatory (1898) records the Eclectic use for hepatic torpor, jaundice, and as a gentle laxative through its bile-stimulating action.',
      'The Eclectic tradition (King\'s Dispensatory) records the use for liver torpor, jaundice, and as a gentle laxative through its bile-stimulating action.')
  );
  // body[8]: simplify
  simplifyNode(data, 8, t => t
    .replace('Chinese medicine uses Taraxacum mongolicum (a close relative) for liver-heat presentations, urinary tract problems, and skin conditions with an underlying inflammatory component.',
      'Chinese medicine uses a related dandelion species for liver-heat states, urinary problems, and skin conditions.')
    .replace('Western herbal practice draws primarily on the European and Eclectic traditions.',
      'Western herbal practice draws on the European and Eclectic traditions.')
  );
});

// --- PASSIONFLOWER ---
fixFile('passionflower-profile.json', data => {
  // para[0]: simplify
  simplifyNode(data, 0, t => t
    .replace('(Passiflora incarnata, family Passifloraceae) is a vigorous climbing vine native to the south-eastern United States, where it grows in disturbed ground, roadsides, and forest edges from Virginia to Florida and west to Kansas.',
      '(Passiflora incarnata) is a climbing vine native to the south-eastern United States.')
    .replace('The flowers are extraordinary: ten white or pale-lavender petals arranged beneath a dense corona of purple-and-white filaments, which is how the plant got its name (the corona reminded Spanish missionaries in the sixteenth century of the instruments of the Passion).',
      'The flowers are striking: white petals beneath a corona of purple-and-white filaments (this gave the plant its name, reminding early observers of the Passion).')
    .replace('The fruits, called maypops, are edible.',
      'The fruits (maypops) are edible.')
    .replace('For herbal medicine, the aerial parts (leaf, stem, and flower) are used, harvested when flowering.',
      'For herbal medicine, the aerial parts (leaf, stem, flower) are used.')
  );
  // infoPanel[1] body: simplify
  const panel = data.body.content[1];
  if (panel && panel.attrs && panel.attrs.body) {
    panel.attrs.body = panel.attrs.body
      .replace('Passionflower potentiates benzodiazepines, barbiturates, and other CNS depressants.',
        'Passionflower potentiates benzodiazepines and other CNS drugs.')
      .replace('Passionflower is avoided in pregnancy at therapeutic doses because of traditional concerns about uterine stimulation.',
        'Passionflower is avoided in pregnancy at therapeutic doses.')
      .replace('Do not drive or operate machinery after taking therapeutic doses, particularly when first using the herb.',
        'Do not drive after taking this preparation, especially on first use.')
      .replace('Not for children under twelve without specialist herbalist advice.',
        'Not for children under twelve without specialist advice.');
  }
  // body[5]: simplify chemistry
  simplifyNode(data, 5, t => t
    .replace('The flavonoids (particularly chrysin, orientin, and vitexin) are the primary studied active compounds, alongside harman alkaloids (harman, harmine, harmaline) and the iridoid glycoside maltol.',
      'The flavonoids (chrysin, orientin, vitexin) are the primary studied active compounds, alongside harman alkaloids and iridoid compounds.')
    .replace('The nerve-calming herb and anxiolytic actions are the ones western herbalists draw on. The antispasmodic action (relaxing smooth muscle) is noted in Eclectic tradition for restless nervous conditions accompanied by muscular tension.',
      'The nerve-calming and anxiolytic actions are the ones western herbalists draw on. The muscle-relaxing action is noted in the Eclectic tradition for nervous conditions with muscular tension.')
    .replace('Limited clinical trial evidence supports passionflower for generalised anxiety (compared against low-dose oxazepam in one small RCT; approximately equivalent effect, fewer cognitive side effects); larger, higher-quality trials are still needed.',
      'Limited study evidence supports passionflower for anxiety compared against low-dose oxazepam (roughly equal effect, fewer cognitive side effects). Larger trials are still needed.')
    .replace('antispasmodic', 'muscle-relaxing')
    .replace('approximately', 'roughly')
  );
  // body[7]: grade 21.3 - simplify drastically
  simplifyNode(data, 7, t => t
    .replace('Native American peoples of the south-eastern US used passionflower root as a weaning aid and for boils and ear problems.',
      'Native American peoples of the south-eastern US used passionflower root for boils and ear problems.')
    .replace('The Eclectic physicians of nineteenth-century America are the source of the nerve-calming herb tradition: Felter and Lloyd\'s King\'s American Dispensatory (1898) describes passionflower as a remedy for insomnia, nervous restlessness, and neuralgia, noting its particular value for the kind of sleeplessness that comes from mental over-activity rather than physical exhaustion.',
      'The Eclectic physicians of 19th-century America established the nerve-calming tradition. Their King\'s Dispensatory (1898) describes passionflower for insomnia, nervous restlessness, and neuralgia, especially for sleeplessness from mental over-activity.')
  );
  // body[8]: simplify
  simplifyNode(data, 8, t => t
    .replace('Western herbal medicine adopted the Eclectic use, and passionflower became a standard nerve-calming herb in European herbal medicine through the twentieth century.',
      'Western herbal medicine adopted the Eclectic use. Passionflower became a standard European nervine through the 20th century.')
    .replace('Traditional western herbal use covers the relief of mild symptoms of mental stress and to aid sleep, and a traditional use for the same.',
      'Traditional use covers relief of mild mental stress and sleep aid.')
    .replace('This is one of the stronger evidence-supported nervine herbs available to the home herbalist.',
      'It is one of the better-evidenced nervine herbs available.')
  );
});

// --- PLANTAIN ---
fixFile('plantain-profile.json', data => {
  // body[0]: simplify intro
  simplifyNode(data, 0, t => t
    .replace('(Plantago major, family Plantaginaceae) is one of the most common plants in Britain, growing in lawns, paths, verges, and compacted ground everywhere from city park to country footpath.',
      '(Plantago major) is one of the most common plants in Britain, growing in lawns, paths, and verges.')
    .replace('It forms a flat rosette of oval, distinctly ribbed leaves (the ribs carry strong fibrous cords that pull out when you tear the leaf across), and sends up slender spikes of tiny greenish flowers in summer.',
      'It forms a flat rosette of ribbed leaves and sends up slender spikes of tiny greenish flowers in summer.')
    .replace('Despite its ubiquitous weed status, it has a longer record of use in medicine than most garden plants.',
      'Despite its weed status, it has a long record in medicine.')
    .replace('Culpeper calls it one of the most commonly-used herbs in English folk medicine.',
      'It is one of the most commonly-used herbs in English folk medicine.')
    .replace('The smaller ribwort plantain (Plantago lanceolata) has narrower leaves and is used interchangeably in most traditions.',
      'Ribwort plantain (Plantago lanceolata) is used the same way.')
  );
  // body[5]: fix garbled "a active compounds" + simplify
  simplifyNode(data, 5, t => t
    .replace('Allantoin (a active compounds that supports cell proliferation, shared with comfrey leaf)',
      'Allantoin (a compound found in comfrey leaf, linked to cell repair)')
    .replace('soothing gel (the demulcent component), aucubin (an iridoid glycoside with mild inflammation-calming activity), and tannins (the astringent component)',
      'soothing gel (the demulcent part), aucubin (with mild calming activity), and tannins (the astringent part)')
    .replace('The vulnerary action on minor skin wounds is attributed to the allantoin and soothing gel working together.',
      'The wound-supporting action on minor skin wounds comes from the allantoin and soothing gel.')
    .replace('The demulcent action on coughs and irritated airways comes from the soothing gel.',
      'The soothing action on coughs comes from the soothing gel.')
    .replace('The astringent tannins help stop minor bleeding, which is why the fresh poultice is the traditional instant first aid for a minor cut or insect sting.',
      'The tannins help stop minor bleeding, making the fresh poultice a traditional first aid for minor cuts and stings.')
  );
  // body[7]: simplify long Grieve/Culpeper sentence
  simplifyNode(data, 7, t => t
    .replace('devotes a substantial entry to broadleaf plantain, documenting its use as a wound herb in European folk medicine and its use internally as a cough remedy and for kidney and bladder complaints.',
      'records plantain as a wound herb in European folk medicine, used internally for coughs and kidney complaints.')
    .replace('Culpeper (the 17th-century herbalist) recommends it for wounds, bleeding, ulcers of the mouth and throat, and for the stings of insects.',
      'Culpeper, the 17th-century herbalist, recommends it for wounds, bleeding, and insect stings.')
    .replace('The King\'s American Dispensatory (1898) describes the North American Eclectic use for mucous membrane irritation, chronic catarrh, and minor wounds.',
      'The Eclectic tradition records its use for mucous membrane irritation and minor wounds.')
  );
  // body[8]: grade 21.6 - simplify
  simplifyNode(data, 8, t => t
    .replace('Native American peoples throughout North America used plantain (which arrived with European settlers and was sometimes called \'white man\'s foot\' because it followed European settlement) for wounds, stings, and bites, confirming independently what European folk medicine had established.',
      'Native American peoples used plantain (called "white man\'s foot" as it followed European settlers) for wounds, stings, and bites. This confirmed what European folk medicine had already established.')
  );
});

// --- YARROW ---
fixFile('yarrow-profile.json', data => {
  // body[0]: simplify intro
  simplifyNode(data, 0, t => t
    .replace('(Achillea millefolium, family Asteraceae) grows in meadows, roadsides, and rough grass across temperate Europe, Asia, and North America.',
      '(Achillea millefolium) grows in meadows, roadsides, and rough grass across temperate Europe, Asia, and North America.')
    .replace('Its leaves are feathery and deeply divided (millefolium means a thousand leaves), carried on upright stems topped by flat-topped clusters of small white or occasionally pink flowers from June to November.',
      'Its leaves are feathery and deeply divided. Upright stems carry flat-topped clusters of small white or pink flowers from June to November.')
    .replace('The plant is unmistakably aromatic when you bruise a leaf.',
      'The plant smells strongly when you bruise a leaf.')
    .replace('Its Latin name refers to Achilles, who, according to myth, used it to stop the bleeding of his soldiers\' wounds at Troy.',
      'Its Latin name refers to Achilles, who in myth used it to stop his soldiers\' wounds bleeding.')
    .replace('Whether or not the myth is history, the use as a wound herb is real and ancient: yarrow has been found at Neanderthal burial sites, apparently placed there deliberately.',
      'The wound herb use is real and ancient: yarrow has been found at Neanderthal burial sites.')
  );
  // body[5]: simplify chemistry
  simplifyNode(data, 5, t => t
    .replace('The key active compounds include the aromatic oil (azulene, cineole, camphor), the sesquiterpene lactones, flavonoids, achilleine (an alkaloid associated with the styptic action), and tannins.',
      'The key active compounds include the aromatic oil (azulene, cineole, camphor), sesquiterpene compounds, flavonoids, achilleine (associated with the styptic action), and tannins.')
    .replace('The sweat-promoting action (promoting sweating in fever) comes from the aromatic oil and flavonoids.',
      'The sweat-promoting action in fever comes from the aromatic oil and flavonoids.')
    .replace('The anti-inflammatory action is associated with the sesquiterpene lactones and flavonoids.',
      'The inflammation-calming action is associated with sesquiterpene compounds and flavonoids.')
    .replace('The astringent action (tightening tissues) from the tannins reinforces both the wound-staunching use and the traditional use in heavy menstrual bleeding.',
      'The astringent action from the tannins supports both the wound-staunching use and the use for heavy menstrual bleeding.')
    .replace('sesquiterpene lactones', 'sesquiterpene compounds')
  );
  // body[7]: simplify
  simplifyNode(data, 7, t => t
    .replace('documents yarrow as a wound herb used to staunch bleeding in cuts and grazes, as a sweat-promoting for fevers and colds, and as an astringent for heavy menstrual bleeding.',
      'documents yarrow as a wound herb for staunching bleeding in cuts, as a sweat-promoting herb for fevers, and as an astringent for heavy menstrual bleeding.')
    .replace('She records it as one of the most widely-used herbs in old English country medicine.',
      'She records it as one of the most widely-used herbs in English country medicine.')
    .replace('Culpeper (the 17th-century herbalist) calls it a reliable wound herb, good for bleeding of all kinds, and describes a febrifuge use for ague (recurrent fever).',
      'Culpeper, the 17th-century herbalist, calls it a reliable wound herb and records a use for recurrent fever.')
  );
  // body[8]: grade 16.7 - simplify
  simplifyNode(data, 8, t => t
    .replace('Native American peoples across the continent used yarrow for wounds, fever, and colds, often the same uses as the European tradition developed independently.',
      'Native American peoples used yarrow for wounds, fever, and colds: the same uses the European tradition developed independently.')
    .replace('The Eclectic American physicians (King\'s Dispensatory, 1898) document the haemostatic and sweat-promoting uses as well-established.',
      'The Eclectic American physicians document the haemostatic and sweat-promoting uses as well-established.')
  );
  // body[12]: simplify if it's a Cautions paragraph
  const n12 = data.body.content[12];
  if (n12 && n12.content) {
    simplifyNode(data, 12, t => t
      .replace('Pregnancy: avoid therapeutic doses. Asteraceae allergy: avoid. Photosensitivity: as above, handling fresh herb in sunlight rarely causes skin reactions in very sensitive individuals. Any heavy or abnormal bleeding, persistent fever, or significant wound needs medical assessment, not herbal first aid.',
        'Pregnancy: avoid therapeutic doses. Asteraceae allergy: avoid. Photosensitivity: handling fresh herb in sunlight can rarely cause skin reactions. Any heavy bleeding, persistent fever, or significant wound needs medical assessment.')
    );
  }
});

// --- TURMERIC ---
fixFile('turmeric-profile.json', data => {
  // body[5]: "active active compounds" double + simplify
  simplifyNode(data, 5, t => t
    .replace('The primary active active compounds are the curcuminoids: curcumin (the principal compound), demethoxycurcumin, and bisdemethoxycurcumin.',
      'The primary active compounds are the curcuminoids: curcumin (the principal compound), and two related forms.')
    .replace('They account for roughly 2-5% of the dry weight of the rhizome.',
      'They make up roughly 2-5% of the dried root.')
    .replace('Turmerone, a sesquiterpene aromatic oil, contributes to the flavour and some traditional uses.',
      'Turmerone, an aromatic oil compound, contributes to the flavour and some traditional uses.')
    .replace('Western herbalists draw on the anti-inflammatory action (associated with curcumin\'s modulation of inflammatory pathways), the hepatic action (traditional use for supporting liver and digestive function), and the antioxidant activity identified in modern research.',
      'Western herbalists draw on the inflammation-calming action, the liver-supporting action, and the antioxidant activity.')
    .replace('Curcumin has poor bioavailability on its own; traditional preparations combine it with fat (ghee, coconut oil, whole milk) and black pepper (piperine increases absorption substantially), a combination the food tradition preserved long before the pharmacology was understood.',
      'Curcumin absorbs poorly on its own. Traditional preparations combine it with fat and black pepper (piperine improves absorption). The food tradition preserved this long before the chemistry was understood.')
  );
  // body[7]: grade 12.2 - barely over
  simplifyNode(data, 7, t => t
    .replace('The classical texts use it for skin conditions, digestive complaints, respiratory congestion, liver and gallbladder complaints, and to support recovery after childbirth. the Ayurvedic Pharmacopoeia of India lists specific preparations and dosing guidance that has carried into modern practice.',
      'The classical texts use it for skin, digestive, respiratory, liver and gallbladder complaints, and recovery after childbirth.')
  );
  // body[8]: grade 15.5
  simplifyNode(data, 8, t => t
    .replace('Chinese herbal medicine (TCM) uses Curcuma longa and related Curcuma species for moving qi and blood, relieving pain, and supporting liver and gallbladder function. the World Health Organisation reference entry notes that TCM uses include dysmenorrhoea, chest and abdominal distension, and liver and gallbladder complaints.',
      'Chinese herbal medicine (TCM) uses turmeric for moving qi and blood, relieving pain, and supporting the liver. TCM uses include period pain, chest and abdominal tightness, and liver complaints.')
    .replace('dysmenorrhoea', 'period pain')
  );
  // body[9]: grade 20.4
  simplifyNode(data, 9, t => t
    .replace('Western herbal practice adopted turmeric relatively recently compared with Asian traditions, but the modern western herbal pharmacopoeia treats it as an inflammation-calming and liver-supporting herb, particularly for inflammatory joint conditions and sluggish digestion.',
      'Western herbal practice adopted turmeric later than Asian traditions. Modern western herbalists use it for inflammation and sluggish digestion.')
    .replace('The the European herbal standard reference entry notes a well-established use for symptomatic relief of mild digestive complaints, and traditional use for the same.',
      'The traditional use covers relief of mild digestive complaints.')
    .replace('The European herbal standard entry notes a well-established use for symptomatic relief of mild digestive complaints, and traditional use for the same.',
      'The traditional use covers relief of mild digestive complaints.')
  );
  // body[11]: grade 16.0
  simplifyNode(data, 11, t => t
    .replace('Anticoagulants: as above, keep to culinary quantities if on any blood-thinning medication. Gallstones: avoid concentrated preparations if stones are diagnosed. Pregnancy: culinary turmeric in food is standard and safe throughout pregnancy; the the European herbal standard entry notes no safety concerns at culinary doses. Medicinal-dose preparations, concentrated extracts, or supplement capsules are outside the culinary safe-use context and should not be taken in pregnancy without specialist advice.',
      'Blood thinners: keep to culinary amounts. Gallstones: avoid concentrated preparations if diagnosed. Pregnancy: culinary turmeric in food is safe. Medicinal-dose preparations are outside this safe range; check with your midwife.')
    .replace('Anticoagulants: as above, keep to culinary quantities if on any blood-thinning medication.',
      'Blood thinners: keep to culinary amounts.')
    .replace('Medicinal-dose preparations, concentrated extracts, or supplement capsules are outside the culinary safe-use context and should not be taken in pregnancy without specialist advice.',
      'Medicinal preparations are outside the culinary safe range; check with your midwife.')
  );
  // body[13]: grade 15.8 - check what it is
  const n13 = data.body.content[13];
  if (n13 && n13.content) {
    simplifyNode(data, 13, t => t
      .replace('Standard culinary use is well tolerated. High-dose isolated-curcumin supplements (1 g+ curcumin daily) have generated isolated reports of liver harm in susceptible individuals. The food form at culinary doses does not carry this risk.',
        'Standard culinary use is well tolerated. High-dose curcumin supplements have generated rare reports of liver harm. Food-level doses do not carry this risk.')
    );
  }
});

console.log('All batch 7 fixes done');
