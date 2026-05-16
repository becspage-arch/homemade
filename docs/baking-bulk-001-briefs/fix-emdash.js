const fs = require('fs');

const fixes = [

  // bara-brith.json
  ['bara-brith.json',
    'the baker\'s percentages here — 65% hydration (including the soaked fruit\'s moisture), 2% salt, 1.4% yeast — are adapted to account for the tea-plumped fruit.',
    'the baker\'s percentages here are adapted to account for the tea-plumped fruit: 65% hydration (including the soaked fruit\'s moisture), 2% salt, 1.4% yeast.'],
  ['bara-brith.json',
    '— speckled bread in Welsh —',
    '(speckled bread in Welsh)'],

  // battenberg-cake.json
  ['battenberg-cake.json',
    '— two pink squares diagonally opposite two yellow squares on every cut face —',
    ', which shows two pink squares diagonally opposite two yellow squares on every cut face,'],
  ['battenberg-cake.json',
    '— four strips total —',
    '(four strips total)'],
  ['battenberg-cake.json',
    '— pink over plain, plain over pink —',
    '(pink over plain, plain over pink)'],

  // biscotti-almond.json
  ['biscotti-almond.json',
    '— almond biscotti in the form most widely recognised —',
    ', the almond biscotti most widely recognised,'],
  ['biscotti-almond.json',
    '— no soft centre —',
    'with no soft centre'],

  // brioche-loaf.json
  ['brioche-loaf.json',
    '— 50% egg, 50% butter relative to flour —',
    '(50% egg and 50% butter relative to flour)'],
  ['brioche-loaf.json',
    '— rich French bread, pain de luxe, Vienna bread —',
    '(rich French bread, pain de luxe, Vienna bread)'],

  // carrot-cake-layered.json
  ['carrot-cake-layered.json',
    '— two sponges, sandwiched and iced with cream cheese frosting —',
    ': two sponges sandwiched and iced with cream cheese frosting'],
  ['carrot-cake-layered.json',
    'Leave to cool completely — at least 1 hour — before icing.',
    'Leave to cool completely, at least 1 hour, before icing.'],

  // cheese-scones-cheddar.json
  ['cheese-scones-cheddar.json',
    ' — pressing straight down without twisting — ',
    ', pressing straight down without twisting, '],

  // chicken-and-mushroom-pie.json
  ['chicken-and-mushroom-pie.json',
    '— chicken thighs, mushrooms, leek, and a cream sauce —',
    'of chicken thighs, mushrooms, leek, and a cream sauce'],

  // chocolate-eclairs.json (excerpt)
  ['chocolate-eclairs.json',
    '— first on the hob, then in the oven —',
    '(first on the hob, then in the oven)'],

  // ciabatta-high-hydration.json
  ['ciabatta-high-hydration.json',
    '— hydration 82%, salt 2%, yeast 0.4% total (split between poolish and final dough) —',
    ': hydration 82%, salt 2%, yeast 0.4% total (split between poolish and final dough).'],
  ['ciabatta-high-hydration.json',
    '— like folding a letter —',
    '(like folding a letter)'],

  // coffee-and-walnut-cake.json
  ['coffee-and-walnut-cake.json',
    '— the Victoria sponge ratio of equal weights flour, butter, sugar, and eggs, flavoured with coffee —',
    ': the Victoria sponge ratio of equal weights flour, butter, sugar, and eggs, flavoured with dissolved coffee'],
  ['coffee-and-walnut-cake.json',
    '— equal weights of butter, sugar, flour, and eggs —',
    'of equal weights of butter, sugar, flour, and eggs'],
  ['coffee-and-walnut-cake.json',
    '— not just mixed —',
    '(not just mixed)'],

  // dundee-cake.json
  ['dundee-cake.json',
    '— sultanas, currants, glacé cherries —',
    ': sultanas, currants, and glacé cherries'],

  // english-muffins-griddle.json
  ['english-muffins-griddle.json',
    '— the rough, nook-filled interior —',
    ': the rough, nook-filled interior'],
  ['english-muffins-griddle.json',
    'it should feel warm held 5 cm above it, not scorching. Cook the muffins',
    'it should feel warm held 5 cm above it, not scorching; cook the muffins'],

  // florentines.json
  ['florentines.json',
    '— about 5 minutes —',
    '(about 5 minutes)'],

  // fondant-covering-layer-cake.json
  ['fondant-covering-layer-cake.json',
    'Elephant skin (cracked surface): the fondant dried out during rolling — knead in a little white vegetable shortening next time and roll faster.',
    'Elephant skin (cracked surface): the fondant dried out during rolling. Knead in a little white vegetable shortening next time and roll faster.'],

  // fudge-vanilla.json
  ['fudge-vanilla.json',
    '— done off the heat —',
    '(done off the heat)'],

  // ginger-biscuits.json
  ['ginger-biscuits.json',
    'documents the melted-method technique — fat, sugar, and syrup melted together before the dry ingredients are incorporated — as the standard approach for spiced rolled biscuits in British domestic cookery.',
    'documents the melted-method technique as the standard approach for spiced rolled biscuits in British domestic cookery: fat, sugar, and syrup are melted together before the dry ingredients are incorporated.'],
  ['ginger-biscuits.json',
    '— still pale and slightly soft in the centre —',
    ', still pale and slightly soft in the centre,'],

  // gingerbread-loaf-dark.json
  ['gingerbread-loaf-dark.json',
    '— about 10 folds per addition —',
    '(about 10 folds per addition)'],

  // jammy-dodgers.json
  ['jammy-dodgers.json',
    '— a window cut through the lid to reveal a jam filling —',
    ', with a window cut through the lid to reveal the jam filling,'],

  // lemon-meringue-pie.json
  ['lemon-meringue-pie.json',
    'The meringue topping — whisked egg whites and sugar — is',
    'The meringue topping of whisked egg whites and sugar is'],

  // malted-granary-loaf.json
  ['malted-granary-loaf.json',
    '— 65% hydration, 2% salt, 1.4% yeast — are the same straight-dough anchor',
    ': 65% hydration, 2% salt, 1.4% yeast. These are the same straight-dough anchor'],
  ['malted-granary-loaf.json',
    '— the surface should be visibly moist —',
    '(the surface should be visibly moist)'],

  // marble-loaf-cake.json
  ['marble-loaf-cake.json',
    '— a figure-of-eight or an S-shape through the length of the tin —',
    ': a figure-of-eight or an S-shape through the length of the tin'],

  // marshmallows-vanilla.json
  ['marshmallows-vanilla.json',
    '— away from the whisk —',
    ', keeping well away from the whisk,'],

  // nougat-soft-honey.json
  ['nougat-soft-honey.json',
    '— honey cooked to soft ball stage poured into egg whites, followed by a firmer sugar syrup —',
    ': honey is cooked to soft ball stage and poured into egg whites, followed by a firmer sugar syrup'],

  // oat-flapjacks.json
  ['oat-flapjacks.json',
    '— rolled oats, butter, sugar, golden syrup —',
    'of rolled oats, butter, sugar, and golden syrup'],
  ['oat-flapjacks.json',
    '— 4 cuts one way and 3 cuts the other —',
    '(4 cuts one way and 3 cuts the other)'],

  // orange-and-almond-cake-flourless.json
  ['orange-and-almond-cake-flourless.json',
    '— flesh, juice, skin, seeds removed —',
    ': flesh, juice, and skin (seeds removed)'],
  ['orange-and-almond-cake-flourless.json',
    '— skin, flesh, and all the juice —',
    ': skin, flesh, and all the juice'],

  // parker-house-rolls.json
  ['parker-house-rolls.json',
    '— 60% hydration (low for the tender crumb), 8% butter, 8% sugar, 2% salt —',
    ': 60% hydration (low for the tender crumb), 8% butter, 8% sugar, 2% salt'],

  // quiche-lorraine.json
  ['quiche-lorraine.json',
    '— do this on the oven shelf to avoid spilling as you carry it. Bake',
    '; do this on the oven shelf to avoid spilling. Bake'],

  // rye-and-caraway-loaf.json
  ['rye-and-caraway-loaf.json',
    '— 70% hydration (rye absorbs more water than wheat), 2% salt, 1.4% yeast — follow',
    ': 70% hydration (rye absorbs more water than wheat), 2% salt, 1.4% yeast. These follow'],
  ['rye-and-caraway-loaf.json',
    '— 10 g of seeds per 500 g of flour —',
    '(10 g of seeds per 500 g of flour)'],

  // scottish-tablet.json
  ['scottish-tablet.json',
    '— two degrees above the fudge target —',
    '(two degrees above the fudge target)'],
  ['scottish-tablet.json',
    '— when the mixture turns opaque and thickens suddenly —',
    ': the mixture turns opaque and thickens suddenly'],

  // sourdough-country-loaf.json
  ['sourdough-country-loaf.json',
    '— the levain —',
    ': the levain'],
  ['sourdough-country-loaf.json',
    '— domed, bubbly, passing the float test —',
    ', domed, bubbly, and passing the float test,'],

  // sticky-toffee-traybake.json
  ['sticky-toffee-traybake.json',
    '— dates, muscovado sugar, bicarbonate of soda, butter —',
    'of dates, muscovado sugar, bicarbonate of soda, and butter'],
  ['sticky-toffee-traybake.json',
    '— butter, cream, and dark sugar —',
    'of butter, cream, and dark sugar'],

  // swiss-roll-jam-cream.json
  ['swiss-roll-jam-cream.json',
    'documents the whisked sponge method — eggs and sugar beaten to a ribbon before the flour is folded in — that this recipe uses.',
    'documents the whisked sponge method used here: eggs and sugar beaten to a ribbon before the flour is folded in.'],
];

let fixed = 0;
let errors = 0;
for (const [file, oldText, newText] of fixes) {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes(oldText)) {
    fs.writeFileSync(file, content.replace(oldText, newText), 'utf8');
    console.log('FIXED: ' + file + ' -> ' + oldText.substring(0, 70));
    fixed++;
  } else {
    console.log('NOT FOUND: ' + file + ' -> ' + oldText.substring(0, 70));
    errors++;
  }
}
console.log('\nDone: ' + fixed + ' fixed, ' + errors + ' not found');
