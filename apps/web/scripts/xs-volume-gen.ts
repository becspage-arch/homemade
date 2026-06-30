/**
 * NORTH STAR volume generation — batches of varied gems for the cross-stitch
 * refill. Generic-generation LANES ONLY (no maps / outline-fill / typographics —
 * those are specialist sessions). Each batch deliberately mixes SUBJECT and SHAPE
 * (small square character, wide band, tall, circular wreath, big showpiece) and
 * renders with the saturation boost so floss reads vivid.
 *
 *   cd apps/web && npx tsx scripts/xs-volume-gen.ts --batch A [--regen]
 *
 * Writes Flux + render PNGs to ../../.loom-scratch/needlework/volume/<batch>/.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile(path: string): void {
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
      if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
    }
  } catch { /* env from shell */ }
}
loadEnvFile(process.env.HOMEMADE_ENV_FILE ?? 'C:/Users/Rebecca/Projects/code/homemade/.env.credentials')

import sharp from 'sharp'
import { fluxIllustration } from '@/lib/studio/generation/sources'
import { photoToPatternData } from '@/lib/studio/photo-to-pattern'
import { renderPatternSvgString } from '@/components/studio/chart/render-svg-string'
import { stitchedBoundingBox } from '@/components/studio/chart/render-helpers'

const ROOT = resolve(process.cwd(), '../../.loom-scratch/needlework/volume')

export const STYLE = {
  bright: 'bright cheerful modern cross-stitch illustration, bold saturated multicolour palette, crisp clean shapes, high contrast, clean white background',
  cute: 'adorable storybook character, soft but bright saturated palette, sweet expressive face, bold clear outline, lots of personality, clean white background',
  pastel: 'pretty storybook illustration, clear bold outlines with soft cheerful fills, refined palette, crisp detail, clean white background',
  botanical: 'delicate elegant botanical illustration, sophisticated muted-yet-rich palette, airy negative space, fine clear detail, clean white background',
  wreath: 'a lush circular wreath/ring composition with a clear open centre, bright saturated palette, crisp clear elements evenly arranged, clean white background',
  showpiece: 'richly detailed charming storybook scene packed with little story details, bold clear outlines, warm saturated layered palette, full coverage',
  fun: 'funny cheeky characterful cartoon with a witty visual joke, bold bright saturated colours, expressive face, lots of personality, clean white background',
  scene: 'bold FLAT paint-by-numbers illustration, clean graphic areas of solid colour, limited harmonious palette, a complete stylish painted SCENE with full background, modern and witty (diy-artclub / paint-by-numbers style), NOT photographic, NOT heavily shaded',
  popart: 'minimalist FLAT vector pop-art portrait, bold clean areas of solid colour, elegant and stylish, limited sophisticated palette, simple plain background, NOT photographic',
  artface: 'a striking fine-art portrait illustration of a beautiful face adorned with flowers, THE WHOLE HEAD AND FOREHEAD CLEARLY VISIBLE with anatomically correct features and both eyes, bold clean areas of colour with elegant detail, sophisticated rich harmonious palette, gallery-art feel, plain background, stylised NOT photographic',
  icon: 'a bold stylised flat pop-art portrait of a historical figure, iconic and recognisable, the whole head clearly visible with correct features, clean areas of colour, limited sophisticated palette, plain background, NOT photographic',
  dogportrait: 'a clean realistic illustrated portrait of the dog, head and shoulders, accurate breed features and markings, crisp detailed but flat-shaded illustration (NOT photographic, NOT painterly), the dog is the hero on a soft plain warm background',
  fantasy: 'an enchanting fairytale illustration, storybook fantasy, soft glowing magical light, bold clear outlines with rich saturated jewel-tone fills, whimsical and charming, crisp clear detail, NOT photographic, NOT muddy',
}
// Per-lane SOURCE saturation — pre-saturate the Flux art before it's quantised into
// floss so the palette itself is bold (Flux trends soft/pastel → washed otherwise).
// The elegant botanical lane is deliberately muted, so barely touched.
export const SRC_SAT: Record<keyof typeof STYLE, number> = {
  bright: 1.5, cute: 1.45, pastel: 1.28, botanical: 1.12, wreath: 1.45, showpiece: 1.4, fun: 1.5, scene: 1.3, popart: 1.25, artface: 1.25, icon: 1.25, dogportrait: 1.18, fantasy: 1.38,
}
// Bright ivory aida (was a dull #F5EBD8 oatmeal that greyed every colour).
export const FABRIC = '#FCFAF6'
export interface Brief { slug: string; batch: string; w: number; h: number; colours: number; style: keyof typeof STYLE; prompt: string }
const B = (batch: string, slug: string, w: number, h: number, colours: number, style: keyof typeof STYLE, subject: string): Brief =>
  ({ slug, batch, w, h, colours, style, prompt: `${subject}, ${STYLE[style]}, clean composition, centred` })

export const BRIEFS: Brief[] = [
  // ─────────── BATCH A — varied subjects × shapes ───────────
  // small/med cute characters (square)
  B('A', 'cute-fox-curl', 120, 120, 18, 'cute', 'an adorable sleeping red fox curled into a ball with its bushy tail wrapped around'),
  B('A', 'cute-bunny-posy', 115, 120, 18, 'cute', 'a sweet little bunny holding a tiny posy of spring flowers'),
  B('A', 'cute-owl-branch', 115, 125, 18, 'cute', 'a round fluffy owl perched on a blossom branch under a crescent moon'),
  B('A', 'cute-koala-leaf', 115, 120, 16, 'cute', 'a cuddly koala hugging a eucalyptus branch'),
  B('A', 'cute-corgi-flowers', 120, 115, 18, 'cute', 'a happy corgi sitting in a patch of daisies'),
  B('A', 'cute-fawn-spring', 120, 130, 20, 'cute', 'a tiny spotted fawn standing among ferns and wildflowers'),
  B('A', 'cute-penguin-scarf', 110, 125, 16, 'cute', 'a little penguin chick wearing a stripy knitted scarf'),
  B('A', 'cute-hedgehog-apple', 115, 115, 18, 'cute', 'a small hedgehog carrying a red apple on its spines among autumn leaves'),
  // seasonal
  B('A', 'seas-easter-bunny', 130, 130, 20, 'bright', 'an Easter bunny with a basket of painted eggs and spring tulips'),
  B('A', 'seas-autumn-squirrel', 130, 130, 22, 'bright', 'a red squirrel gathering acorns among golden autumn leaves and toadstools'),
  B('A', 'seas-xmas-robin', 125, 125, 18, 'bright', 'a plump robin on a snowy holly branch with red berries'),
  B('A', 'seas-halloween-mouse', 125, 130, 20, 'bright', 'a tiny mouse in a witch hat sitting on a pumpkin with candy corn and stars'),
  // florals — square
  B('A', 'flor-peony-bunch', 150, 150, 30, 'bright', 'a generous bunch of blush and coral peonies with eucalyptus'),
  B('A', 'flor-sunflower-trio', 150, 150, 26, 'bright', 'three cheerful sunflowers with leaves and a few bees'),
  // florals — CIRCULAR wreaths
  B('A', 'wre-spring-wreath', 160, 160, 30, 'wreath', 'a spring flower wreath of tulips, daffodils, blossom and fresh leaves'),
  B('A', 'wre-lavender-wreath', 160, 160, 24, 'wreath', 'a lavender and wildflower wreath with sprigs of green'),
  B('A', 'wre-autumn-wreath', 160, 160, 30, 'wreath', 'an autumn wreath of orange leaves, rosehips, acorns and little pumpkins'),
  // botanical — WIDE bands
  B('A', 'bot-wildflower-band', 200, 115, 28, 'botanical', 'a wide low band of mixed wildflowers and grasses growing up from the bottom'),
  B('A', 'bot-lavender-band', 200, 110, 22, 'botanical', 'a wide band of lavender rows receding to a distant hill'),
  B('A', 'bot-herb-band', 195, 115, 24, 'botanical', 'a wide botanical band of garden herbs — rosemary, sage, thyme and chives with labels'),
  // tall
  B('A', 'tall-foxglove', 120, 185, 24, 'botanical', 'a single tall foxglove spire with bees, leaves and buds'),
  B('A', 'tall-delphinium', 120, 185, 24, 'botanical', 'a tall blue delphinium stem with butterflies'),
  // BIG showpieces
  B('A', 'big-cottage-garden', 215, 215, 46, 'showpiece', 'a charming english cottage with a thatched roof, climbing roses, a wooden gate and a packed flower garden'),
  B('A', 'big-tea-shop', 210, 210, 46, 'showpiece', 'a pretty corner tea shop with bunting, cake stands in the window, flower planters and a striped awning'),
  B('A', 'big-greenhouse', 210, 210, 44, 'showpiece', 'a sunny victorian greenhouse full of potted plants, hanging baskets, watering cans and a cat asleep on a chair'),

  // ─────────── BATCH B — varied subjects × shapes ───────────
  B('B', 'cute-bearcub-honey', 120, 125, 18, 'cute', 'a little bear cub holding a dripping honey pot with a bee'),
  B('B', 'cute-duckling-puddle', 115, 115, 16, 'cute', 'a fuzzy yellow duckling splashing in a puddle with little boots'),
  B('B', 'cute-lamb-meadow', 120, 120, 16, 'cute', 'a fluffy spring lamb with a flower crown in a green meadow'),
  B('B', 'cute-hare-moon', 120, 130, 18, 'cute', 'a gentle hare sitting in long grass under a big full moon'),
  B('B', 'cute-otter-shell', 120, 115, 18, 'cute', 'a sweet otter floating on its back holding a little shell'),
  B('B', 'cute-redpanda-branch', 115, 125, 18, 'cute', 'a red panda curled on a branch with bamboo leaves'),
  B('B', 'cute-mouse-strawberry', 110, 120, 18, 'cute', 'a tiny mouse nibbling a big ripe strawberry'),
  B('B', 'cute-frog-lily', 115, 115, 16, 'cute', 'a cheerful little frog sitting on a lily pad with a dragonfly'),
  // seasonal
  B('B', 'seas-winter-fox', 130, 130, 22, 'bright', 'a red fox trotting through falling snow past frosted pine trees'),
  B('B', 'seas-harvest-basket', 135, 130, 24, 'bright', 'an autumn harvest basket of pumpkins, apples, wheat and sunflowers'),
  B('B', 'seas-spring-chicks', 130, 125, 20, 'bright', 'three fluffy easter chicks in a nest with spring blossom'),
  B('B', 'seas-xmas-cocoa', 125, 130, 20, 'bright', 'a steaming mug of cocoa with marshmallows, candy cane and a knitted jumper pattern'),
  // florals + circular
  B('B', 'flor-poppy-field', 150, 150, 26, 'bright', 'a cheerful cluster of red poppies and cornflowers with grasses'),
  B('B', 'flor-mixed-jug', 150, 155, 30, 'bright', 'a rustic jug overflowing with a mixed cottage-garden bouquet'),
  B('B', 'wre-daisy-wreath', 160, 160, 24, 'wreath', 'a fresh white daisy and buttercup wreath with green leaves'),
  B('B', 'wre-berry-wreath', 160, 160, 28, 'wreath', 'a winter wreath of holly, ivy, pinecones and red berries'),
  // pastel architectural — WIDE
  B('B', 'arch-cottage-row', 200, 115, 30, 'pastel', 'a row of four pastel seaside cottages with little chimneys and flower boxes'),
  B('B', 'arch-beach-huts', 205, 110, 26, 'pastel', 'a row of brightly painted beach huts on the sand with bunting'),
  B('B', 'arch-high-street', 205, 115, 32, 'pastel', 'a pretty little high street of shopfronts — bakery, florist and bookshop — with awnings'),
  // tall
  B('B', 'tall-lighthouse', 120, 185, 22, 'bright', 'a candy-striped lighthouse on a rocky headland with gulls and a little sailboat'),
  B('B', 'tall-hollyhock', 120, 185, 24, 'botanical', 'a tall hollyhock stem against a cottage wall with a butterfly'),
  // BIG showpieces
  B('B', 'big-bakery-front', 210, 210, 46, 'showpiece', 'a charming bakery storefront with bread and cakes in the window, a striped awning and flower tubs'),
  B('B', 'big-flower-shop', 210, 210, 48, 'showpiece', 'a corner flower shop bursting with buckets of flowers, hanging baskets and a little dog at the door'),
  B('B', 'big-cosy-library', 215, 215, 46, 'showpiece', 'a cosy reading nook — floor to ceiling books, a wingback chair, a lamp, a sleeping cat and a window seat'),
  B('B', 'big-autumn-village', 215, 200, 48, 'showpiece', 'a cosy autumn village street with pumpkins, bunting, lit windows and trees in red and gold'),

  // ─────────── BATCH C — more animals + food/baking + tea ───────────
  B('C', 'cute-sloth-branch', 115, 125, 16, 'cute', 'a smiling sloth hanging from a leafy branch'),
  B('C', 'cute-pug-jumper', 115, 115, 18, 'cute', 'a happy pug wearing a cosy knitted jumper'),
  B('C', 'cute-panda-bamboo', 118, 118, 16, 'cute', 'a roly-poly panda munching a stalk of bamboo'),
  B('C', 'cute-hamster-seed', 110, 110, 16, 'cute', 'a cheeky hamster with stuffed cheeks holding a sunflower seed'),
  B('C', 'cute-bee-flower', 115, 115, 16, 'cute', 'a fuzzy bumblebee on a big daisy'),
  B('C', 'cute-ladybird-leaf', 110, 110, 14, 'cute', 'a bright ladybird on a dewy green leaf'),
  B('C', 'cute-robin-teacup', 115, 120, 18, 'cute', 'a little robin perched on the rim of a floral teacup'),
  B('C', 'cute-cat-yarn', 120, 120, 18, 'cute', 'a playful kitten tangled in a ball of rainbow yarn'),
  B('C', 'food-cupcake', 120, 130, 20, 'bright', 'a pretty frosted cupcake with sprinkles and a cherry on top'),
  B('C', 'food-teapot-floral', 135, 125, 24, 'bright', 'a charming floral teapot with a rising curl of steam and a teacup'),
  B('C', 'food-macarons', 140, 120, 22, 'bright', 'a little stack of pastel macarons with a sprig of mint'),
  B('C', 'food-strawberry-jam', 120, 135, 20, 'bright', 'a jar of strawberry jam with a gingham lid and fresh strawberries'),
  B('C', 'food-lemon-slice', 120, 120, 18, 'bright', 'a bright lemon cut to show the slice, with blossom and leaves'),
  B('C', 'food-gingerbread', 120, 130, 20, 'bright', 'a smiling gingerbread person decorated with icing and buttons'),
  B('C', 'flor-rose-bunch', 150, 150, 30, 'bright', 'a romantic bunch of red and pink roses with baby’s breath'),
  B('C', 'flor-tulip-row', 195, 110, 24, 'botanical', 'a wide cheerful row of mixed tulips standing in a garden bed'),
  B('C', 'flor-cherry-blossom', 150, 150, 22, 'bright', 'a branch of pink cherry blossom with a little bird'),
  B('C', 'wre-summer-wreath', 160, 160, 30, 'wreath', 'a summer wreath of daisies, cornflowers, poppies and ferns'),
  B('C', 'wre-eucalyptus-wreath', 160, 160, 20, 'wreath', 'an elegant eucalyptus and white-rose wreath'),
  B('C', 'tall-sunflower-single', 120, 185, 20, 'bright', 'a single tall sunflower with a bee and a ladybird on the stem'),
  B('C', 'seas-snowman', 125, 135, 18, 'bright', 'a jolly snowman with a striped scarf, carrot nose and a robin on his hat'),
  B('C', 'seas-conkers-leaves', 130, 125, 22, 'bright', 'an autumn arrangement of conkers, acorns and red-gold leaves'),
  B('C', 'big-flower-cart', 210, 200, 46, 'showpiece', 'a vintage flower cart piled with buckets of colourful blooms and bunting'),
  B('C', 'big-sweet-shop', 210, 210, 46, 'showpiece', 'an old-fashioned sweet shop window full of jars of colourful sweets and a striped awning'),
  B('C', 'big-potting-shed', 210, 205, 44, 'showpiece', 'a charming potting shed with terracotta pots, hanging tools, seed packets and climbing flowers'),

  // ─────────── BATCH D — seasonal + nautical/garden + florals ───────────
  B('D', 'cute-seal-pup', 120, 115, 16, 'cute', 'a fluffy white seal pup on the snow'),
  B('D', 'cute-chick-egg', 110, 120, 14, 'cute', 'a fluffy yellow chick hatching from a speckled egg'),
  B('D', 'cute-squirrel-acorn', 115, 120, 18, 'cute', 'a red squirrel holding an acorn with its bushy tail curled up'),
  B('D', 'cute-hedgehog-mushroom', 115, 115, 18, 'cute', 'a little hedgehog sheltering under a red toadstool in the rain'),
  B('D', 'cute-bunny-carrot', 115, 120, 16, 'cute', 'a sweet bunny holding a big crunchy carrot'),
  B('D', 'cute-owl-graduate', 115, 125, 18, 'cute', 'a wise little owl in a graduation cap on a stack of books'),
  B('D', 'naut-lighthouse-scene', 150, 150, 26, 'bright', 'a cheerful lighthouse on a cliff with sailboats, gulls and waves'),
  B('D', 'naut-sailboat', 140, 130, 22, 'bright', 'a little red sailboat on bright blue waves with a friendly sun'),
  B('D', 'naut-whale-spout', 140, 125, 20, 'bright', 'a happy blue whale spouting water with a few seabirds'),
  B('D', 'gard-watering-can', 130, 140, 24, 'bright', 'a watering can spilling flowers, with a trowel and a robin'),
  B('D', 'gard-veg-patch', 195, 115, 28, 'botanical', 'a wide row of garden vegetables — carrots, lettuces, tomatoes and pumpkins with labels'),
  B('D', 'gard-greenhouse-plants', 145, 145, 28, 'bright', 'a cluster of potted houseplants — monstera, succulents and a cactus in pretty pots'),
  B('D', 'flor-poppy-single', 120, 175, 18, 'botanical', 'a single tall red poppy stem with a bud and a butterfly'),
  B('D', 'flor-hydrangea', 145, 145, 26, 'bright', 'a full blue and pink hydrangea bloom with leaves'),
  B('D', 'flor-daffodil-bunch', 145, 145, 22, 'bright', 'a cheerful bunch of yellow daffodils tied with ribbon'),
  B('D', 'wre-christmas-wreath', 160, 160, 28, 'wreath', 'a festive wreath of pine, holly, red berries, pinecones and a bow'),
  B('D', 'wre-floral-heart', 160, 160, 26, 'wreath', 'a heart-shaped wreath of pink roses and greenery'),
  B('D', 'seas-pumpkin-trio', 140, 125, 22, 'bright', 'three smiling carved pumpkins with candles, leaves and a little bat'),
  B('D', 'seas-easter-basket', 135, 130, 24, 'bright', 'an Easter basket of painted eggs, a bunny and spring flowers'),
  B('D', 'seas-hot-cocoa-cat', 120, 130, 20, 'cute', 'a cat curled up by a mug of cocoa with a knitted blanket and fairy lights'),
  B('D', 'tall-lupin', 120, 185, 22, 'botanical', 'a tall pink lupin spire with leaves and a bee'),
  B('D', 'misc-hot-air-balloon', 130, 150, 24, 'bright', 'a colourful striped hot air balloon drifting over little hills and clouds'),
  B('D', 'big-cottage-snow', 210, 200, 44, 'showpiece', 'a snowy christmas cottage with smoking chimney, wreath on the door, fairy lights and a decorated tree'),
  B('D', 'big-garden-arch', 205, 210, 46, 'showpiece', 'a rose-covered garden arch over a path with a bench, foxgloves and a watering can'),
  B('D', 'big-book-nook', 210, 205, 46, 'showpiece', 'a cosy window reading nook with cushions, a stack of books, a candle, a cat and a rainy window'),

  // ─────────── BATCH E — FUN / funny / quirky (the cheeky tier) ───────────
  B('E', 'fun-tiger-bath', 140, 135, 22, 'fun', 'a happy tiger sitting in a bubble bath with a rubber duck and a shower cap'),
  B('E', 'fun-sloth-yoga', 130, 135, 18, 'fun', 'a sloth doing a wobbly yoga pose on a yoga mat, looking very relaxed'),
  B('E', 'fun-pug-sunlounger', 140, 120, 20, 'fun', 'a pug in tiny sunglasses lounging on a deckchair with a cocktail'),
  B('E', 'fun-highland-cow', 125, 130, 20, 'fun', 'a fluffy highland cow with a long fringe flopping over its eyes'),
  B('E', 'fun-capybara-spa', 140, 125, 22, 'fun', 'a capybara relaxing in a steamy hot spring with a yuzu fruit on its head'),
  B('E', 'fun-dachshund-hotdog', 145, 110, 18, 'fun', 'a long dachshund tucked inside a hotdog bun with a squiggle of mustard'),
  B('E', 'fun-cat-wizard', 130, 140, 22, 'fun', 'a grumpy cat in a tiny wizard hat reading a giant spellbook'),
  B('E', 'fun-frog-tea', 125, 135, 20, 'fun', 'a dapper frog in a top hat sipping tea with its pinky out'),
  B('E', 'fun-llama-party', 125, 140, 22, 'fun', 'a llama wearing a party hat blowing a party horn with confetti'),
  B('E', 'fun-pigeon-chip', 130, 120, 18, 'fun', 'a cheeky pigeon running off with a single chip in its beak'),
  B('E', 'fun-corgi-cape', 125, 130, 20, 'fun', 'a corgi superhero in a tiny red cape striking a heroic pose'),
  B('E', 'fun-hedgehog-skate', 125, 125, 20, 'fun', 'a little hedgehog riding a skateboard wearing a tiny beanie'),
  B('E', 'fun-panda-noodles', 130, 130, 22, 'fun', 'a panda slurping a giant bowl of noodles with chopsticks'),
  B('E', 'fun-flamingo-yoga', 120, 145, 18, 'fun', 'a flamingo balancing in a one-legged yoga pose looking smug'),
  B('E', 'fun-cat-loaf', 130, 120, 16, 'fun', 'a cat sitting like a perfect loaf of bread, literally shaped like a bread loaf'),
  B('E', 'fun-goat-trampoline', 130, 135, 20, 'fun', 'a tiny goat bouncing high on a trampoline with a delighted face'),
  B('E', 'fun-duck-lilo', 140, 120, 20, 'fun', 'a duck in sunglasses floating on a flamingo pool lilo'),
  B('E', 'fun-chinchilla-teacup', 120, 125, 18, 'fun', 'a fluffy chinchilla sitting inside a teacup looking surprised'),
  B('E', 'fun-otter-juggle', 125, 130, 20, 'fun', 'an otter juggling pebbles and clams with a proud grin'),
  B('E', 'fun-sausagedog-jumper', 145, 110, 18, 'fun', 'a dachshund in a knitted jumper that is far too long for its body'),
  B('E', 'fun-raccoon-bin', 130, 135, 22, 'fun', 'a cheeky raccoon raiding a bin and wearing a banana peel as a hat'),
  B('E', 'fun-guineapig-crown', 120, 120, 18, 'fun', 'a guinea pig wearing a tiny gold crown looking regal'),
  B('E', 'fun-axolotl-cake', 125, 125, 20, 'fun', 'a smiling pink axolotl balancing a cupcake on its head'),
  B('E', 'fun-snail-house', 130, 120, 20, 'fun', 'a snail carrying a tiny decorated cottage as its shell, with a little chimney'),
  B('E', 'fun-cat-shark', 130, 130, 18, 'fun', 'a cat wearing a shark costume looking unimpressed'),

  // ─────────── BATCH F — animals doing human things, FULL SCENES (diy-artclub) ───────────
  B('F', 'scene-otter-bathroom', 150, 190, 38, 'scene', 'an otter standing in a pink tiled bathroom holding toilet paper, a toilet and a blossom branch beside it'),
  B('F', 'scene-octopus-bath', 150, 190, 36, 'scene', 'a pink octopus relaxing in a white clawfoot bathtub in a mint-green tiled bathroom full of leafy houseplants and a round mirror'),
  B('F', 'scene-dachshund-wine', 150, 190, 34, 'scene', 'a dachshund in pink heart-shaped sunglasses beside a glass of rosé wine and a stack of pastel books, pink room'),
  B('F', 'scene-cat-newspaper', 150, 190, 38, 'scene', 'a cat sitting in an armchair reading a newspaper with a cup of coffee on a side table, cosy room'),
  B('F', 'scene-flamingo-bath', 150, 190, 34, 'scene', 'a flamingo taking a bubble bath in a stylish bathroom with tropical plants'),
  B('F', 'scene-cow-baking', 150, 190, 40, 'scene', 'a highland cow in an apron baking in a country kitchen with cakes and a rolling pin'),
  B('F', 'scene-goose-chef', 150, 190, 38, 'scene', 'a goose chef in a white hat cooking at a stove in a warm kitchen'),
  B('F', 'scene-frog-tea', 150, 190, 36, 'scene', 'a frog having afternoon tea at a set table with a teapot, cake stand and flowers'),
  B('F', 'scene-pug-spa', 150, 190, 32, 'scene', 'a pug in a white bathrobe with a towel turban, cucumber slices and a face mask at a spa'),
  B('F', 'scene-sloth-hammock', 150, 190, 34, 'scene', 'a sloth lounging in a hammock with a tropical cocktail between two palm trees'),
  B('F', 'scene-fox-library', 150, 190, 40, 'scene', 'a fox reading in a leather armchair in a cosy library with a glass of red wine and tall bookshelves'),
  B('F', 'scene-raccoon-dishes', 150, 190, 36, 'scene', 'a raccoon in rubber gloves doing the washing up at a kitchen sink full of bubbles'),
  B('F', 'scene-duck-pool', 150, 190, 32, 'scene', 'a duck wearing sunglasses floating in a rubber ring in a bright blue swimming pool'),
  B('F', 'scene-bear-hottub', 150, 190, 34, 'scene', 'a brown bear relaxing in a steaming wooden hot tub in the snowy mountains'),
  B('F', 'scene-cat-barista', 150, 190, 38, 'scene', 'a cat barista in an apron making coffee behind the counter of a cosy cafe'),
  B('F', 'scene-rabbit-gardening', 150, 190, 38, 'scene', 'a rabbit in dungarees gardening in a greenhouse with potted plants and a watering can'),
  B('F', 'scene-sheep-knitting', 150, 190, 34, 'scene', 'a sheep knitting a scarf in a rocking chair by a fireplace with a basket of yarn'),
  B('F', 'scene-corgi-icecream', 150, 190, 32, 'scene', 'a corgi at a seaside ice-cream stand holding an ice cream, stripy awning behind'),

  // ─────────── BATCH G — fun POP-ART portraits, UNLICENSED generic figures ───────────
  // IP: generic stylish figures only — NO named celebrity, NO specific copyrighted artwork.
  B('G', 'popart-bubblegum-pearls', 150, 195, 22, 'popart', 'an elegant 1950s woman with a brown beehive updo and a pearl necklace blowing a big pink bubblegum bubble, sage-green background'),
  B('G', 'popart-sunglasses-coffee', 150, 195, 22, 'popart', 'a chic woman in oversized black sunglasses and a headscarf holding a takeaway coffee, cream background'),
  B('G', 'popart-redlips-scarf', 150, 195, 22, 'popart', 'a glamorous woman with bold red lips and a polka-dot headscarf, teal background'),
  B('G', 'popart-mod-eyeliner', 150, 195, 22, 'popart', 'a 1960s mod woman with a blonde bob and dramatic winged eyeliner, mustard background'),
  B('G', 'popart-afro-hoops', 150, 195, 22, 'popart', 'a stylish woman with a natural afro and large gold hoop earrings, terracotta background'),
  B('G', 'popart-flapper', 150, 195, 24, 'popart', 'a 1920s flapper woman with a feather headband and a long pearl necklace, deep blue background'),
  B('G', 'popart-cateye-bubblegum', 150, 195, 22, 'popart', 'a retro woman with red cat-eye glasses and a high ponytail blowing a bubblegum bubble, pink background'),
  B('G', 'popart-turban-earrings', 150, 195, 22, 'popart', 'an elegant woman in a silk turban with bold statement earrings, emerald background'),
  B('G', 'popart-man-beret', 150, 195, 22, 'popart', 'a stylish man in a black beret and round sunglasses with a striped top, grey background'),
  B('G', 'popart-ballerina', 150, 195, 22, 'popart', 'a ballerina in profile with a neat bun and a tutu, blush background'),
  B('G', 'popart-punk-hair', 150, 195, 24, 'popart', 'a cool woman with brightly coloured punk hair and winged eyeliner, charcoal background'),
  B('G', 'popart-veil-hat', 150, 195, 22, 'popart', 'a sophisticated woman in a wide-brim hat with a birdcage veil and red lipstick, ivory background'),

  // ─────────── BATCH H — "fabulous faces" fine-art portraits PILOT (original) ───────────
  B('H', 'artface-flower-crown', 160, 205, 40, 'artface', 'a serene woman with eyes closed wearing a lush crown of bright wildflowers in her hair'),
  B('H', 'artface-poppy-brow', 160, 205, 36, 'artface', 'a striking face with a single large red poppy bloom resting across the brow, deep blue background'),
  B('H', 'artface-butterfly-eyes', 160, 205, 30, 'artface', 'a calm face with a large monarch butterfly resting over the closed eyes, soft neutral background'),
  B('H', 'artface-rose-hair', 160, 205, 42, 'artface', 'a woman whose hair is made entirely of colourful roses and blooms in jewel tones'),
  B('H', 'artface-dragonfly-nose', 160, 205, 34, 'artface', 'a face in three-quarter view with a blue dragonfly perched on the tip of her nose, watercolour feel'),
  B('H', 'artface-golden-wildflower', 160, 205, 38, 'artface', 'a serene face surrounded by wildflowers and warm golden light, eyes gently closed'),

  // ─────────── BATCH I — fabulous faces, scaled, SKIN TONES dark→light ───────────
  B('I', 'face-deepdark-tropical', 160, 205, 40, 'artface', 'a woman with deep dark ebony skin and a crown of vivid tropical flowers — hibiscus, bird of paradise, orchids'),
  B('I', 'face-dark-marigold', 160, 205, 38, 'artface', 'a woman with rich dark skin and a golden halo of marigolds and sunflowers around her head'),
  B('I', 'face-darkbrown-butterfly', 160, 205, 36, 'artface', 'a woman with deep brown skin, a blue morpho butterfly on her cheek and pink roses in her hair'),
  B('I', 'face-brown-lotus', 160, 205, 38, 'artface', 'a woman with warm brown skin, a dragonfly and pink lotus flowers crowning her head'),
  B('I', 'face-brown-peony', 160, 205, 40, 'artface', 'a woman with brown skin and a lush crown of coral peonies and a small songbird'),
  B('I', 'face-tan-wildflower', 160, 205, 38, 'artface', 'a woman with tan skin and a crown of mixed wildflowers, eyes closed, serene'),
  B('I', 'face-olive-autumn', 160, 205, 38, 'artface', 'a woman with olive skin and autumn leaves, berries and rosehips woven through her hair'),
  B('I', 'face-medium-hummingbird', 160, 205, 36, 'artface', 'a woman with medium skin, a hummingbird and trailing hibiscus flowers beside her face'),
  B('I', 'face-fair-poppy', 160, 205, 36, 'artface', 'a woman with fair skin and a crown of red poppies and cornflowers, soft blue background'),
  B('I', 'face-fair-daisies', 160, 205, 36, 'artface', 'a woman with fair skin and white daisies and buttercups woven through loose hair'),
  B('I', 'face-pale-cherryblossom', 160, 205, 34, 'artface', 'a woman with pale porcelain skin and delicate cherry blossom branches in her dark hair'),
  B('I', 'face-pale-lavender', 160, 205, 34, 'artface', 'a woman with pale skin, a crown of lavender and a few bees, soft sage background'),
  B('I', 'face-darkman-leaves', 160, 205, 38, 'artface', 'a man with deep dark skin and a crown of green leaves and bright wildflowers'),
  B('I', 'face-brownman-flowers', 160, 205, 38, 'artface', 'a man with brown skin and a crown of bold tropical flowers, calm expression'),
  B('I', 'face-dark-sunflower', 160, 205, 38, 'artface', 'a woman with dark skin and a single huge sunflower behind her head like a halo, smaller blooms around'),
  B('I', 'face-medium-floralveil', 160, 205, 40, 'artface', 'a woman with medium skin wearing a veil made of cascading flowers framing her face'),

  // ─────────── BATCH J — famous faces, PUBLIC-DOMAIN / out-of-rights only ───────────
  // All centuries-dead historical figures — no publicity/estate rights.
  B('J', 'icon-cleopatra', 155, 195, 26, 'icon', 'Cleopatra, ancient Egyptian queen, with kohl-lined eyes, gold headdress and a cobra diadem'),
  B('J', 'icon-nefertiti', 155, 195, 24, 'icon', 'Queen Nefertiti in her iconic tall blue crown, elegant profile'),
  B('J', 'icon-marie-antoinette', 155, 195, 28, 'icon', 'Marie Antoinette with a towering powdered wig, ribbons and a single rose'),
  B('J', 'icon-queen-victoria', 155, 195, 24, 'icon', 'Queen Victoria in her later years with a lace cap and mourning jewellery'),
  B('J', 'icon-elizabeth-first', 155, 195, 28, 'icon', 'Queen Elizabeth the First with a tall ruff collar, red curls and pearls'),
  B('J', 'icon-joan-of-arc', 155, 195, 24, 'icon', 'Joan of Arc in armour with cropped hair, holding a banner'),
  B('J', 'icon-mozart', 155, 195, 24, 'icon', 'Wolfgang Amadeus Mozart in an 18th-century powdered wig and red coat'),
  B('J', 'icon-beethoven', 155, 195, 24, 'icon', 'Ludwig van Beethoven with wild grey hair and a brooding expression'),
  B('J', 'icon-shakespeare', 155, 195, 22, 'icon', 'William Shakespeare with a receding hairline, earring and a ruff collar'),
  B('J', 'icon-van-gogh', 155, 195, 26, 'icon', 'Vincent van Gogh self-portrait style with red beard and a straw hat, swirling background'),
  B('J', 'icon-jane-austen', 155, 195, 22, 'icon', 'Jane Austen in a Regency bonnet with curls framing her face'),
  B('J', 'icon-napoleon', 155, 195, 24, 'icon', 'Napoleon Bonaparte in his bicorne hat and military coat, hand in jacket'),
  B('J', 'icon-da-vinci', 155, 195, 24, 'icon', 'Leonardo da Vinci as an old man with a long grey beard, Renaissance robes'),
  B('J', 'icon-mona-lisa', 160, 200, 28, 'icon', 'a Mona-Lisa-style Renaissance lady with a faint smile, folded hands, dark landscape behind'),

  // ─────────── BATCH K — higher-detail, REALLY FUN animal scenes (original) ───────────
  B('K', 'bigscene-cat-dinnerparty', 195, 230, 50, 'scene', 'a posh cat hosting a candlelit dinner party at a long table with mouse guests, chandeliers and tiny cakes'),
  B('K', 'bigscene-hedgehog-teaparty', 195, 230, 50, 'scene', 'a group of hedgehogs having a garden tea party with a tiered cake stand, bunting and teapots among the flowers'),
  B('K', 'bigscene-fox-bookshop', 195, 230, 52, 'scene', 'a fox in a waistcoat running a crammed vintage bookshop, climbing ladder, lamps and a cat on the counter'),
  B('K', 'bigscene-penguin-parlour', 195, 230, 48, 'scene', 'penguins queuing at a pastel winter ice-cream parlour with a striped awning and sundae menu'),
  B('K', 'bigscene-sloth-djparty', 195, 230, 50, 'scene', 'a sloth DJ spinning records at a jungle party with disco lights, dancing toucans and fairy lights'),
  B('K', 'bigscene-raccoon-noir', 195, 230, 46, 'scene', 'a raccoon detective in a trench coat at a moody noir office desk with a lamp, files and rain on the window'),
  B('K', 'bigscene-frog-band', 195, 230, 48, 'scene', 'a frog rock band on a lily-pad stage with tiny instruments, spotlights and a cheering pond crowd'),
  B('K', 'bigscene-otter-poolparty', 195, 230, 48, 'scene', 'otters having a summer pool party with inflatables, sunglasses, cocktails and a diving board'),
  B('K', 'bigscene-rabbit-market', 195, 230, 50, 'scene', 'a rabbit running a busy flower-market stall with buckets of blooms, bunting and customers'),
  B('K', 'bigscene-bear-cafe', 195, 230, 50, 'scene', 'a bear barista in a cosy packed cafe making latte art, shelves of jars, hanging plants and chatty customers'),
  B('K', 'bigscene-mice-gingerbread', 195, 230, 48, 'scene', 'a team of mice building and icing a giant gingerbread house with sweets, in a warm kitchen'),
  B('K', 'bigscene-cat-gallery', 195, 230, 46, 'scene', 'cats at a fancy art-gallery opening admiring tiny paintings, holding glasses, on a polished floor'),
  B('K', 'bigscene-pug-yoga', 195, 230, 46, 'scene', 'a class of pugs doing yoga on mats in a bright studio with plants and a goldfish instructor'),
  B('K', 'bigscene-hamster-bakery', 195, 230, 50, 'scene', 'a hamster running a tiny bakery, trays of bread and cakes, a chalkboard menu and a queue'),
  B('K', 'bigscene-dog-wedding', 195, 230, 50, 'scene', 'a charming dog wedding with two dogs under a flower arch, guests in hats and confetti'),
  B('K', 'bigscene-owl-library', 195, 230, 50, 'scene', 'a wise owl librarian on a tall ladder in a grand library of towering bookshelves, lamps and a reading cat'),

  // ─────────── BATCH L — dog breed portraits PILOT (de-risk the realistic lane) ───────────
  B('L', 'dog-labrador-yellow', 160, 170, 32, 'dogportrait', 'a yellow Labrador retriever'),
  B('L', 'dog-cockapoo', 160, 170, 32, 'dogportrait', 'an apricot cockapoo with a fluffy curly coat'),
  B('L', 'dog-dachshund', 165, 160, 30, 'dogportrait', 'a smooth-haired black-and-tan dachshund'),
  B('L', 'dog-frenchbulldog', 160, 165, 30, 'dogportrait', 'a fawn French bulldog with big bat ears'),
  B('L', 'dog-bordercollie', 160, 170, 32, 'dogportrait', 'a black-and-white border collie'),
  B('L', 'dog-goldenretriever', 160, 170, 34, 'dogportrait', 'a golden retriever with a soft smiling face'),

  // ─────────── BATCH M — PRIORITY: pop art/faces, fairies/fantasy, animals-as-humans,
  //             beautiful florals + HUGE 100+ colour showpieces. Deliberate complexity
  //             RANGE: small/simple (14–18) → medium (28–48) → huge dense (100–135). ───────────
  // ── quick + simple small (BEGINNER, ~14–18 colours) ──
  B('M', 'm-cute-bee-heart', 110, 110, 14, 'cute', 'a tiny smiling bumblebee carrying a little red heart'),
  B('M', 'm-cute-cat-moon', 115, 120, 16, 'cute', 'a little sleeping cat curled on a crescent moon among stars'),
  B('M', 'm-cute-mushroom-pair', 110, 115, 16, 'cute', 'two cheerful red toadstools with white spots and a little snail'),
  B('M', 'm-cute-dragon-gem', 118, 118, 18, 'cute', 'a cute chubby baby dragon curled around a glowing gem'),
  B('M', 'm-cute-fairy-toadstool', 120, 130, 20, 'fantasy', 'a sweet little fairy with gauzy wings sitting on a red toadstool'),
  // ── fairies & fantasy (medium → large) ──
  B('M', 'm-unicorn-meadow', 150, 150, 28, 'fantasy', 'a gentle unicorn with a flowing mane standing in a flower meadow under a rainbow'),
  B('M', 'm-fairy-flower-cup', 150, 160, 32, 'fantasy', 'a delicate fairy curled asleep inside the petals of a large bluebell flower'),
  B('M', 'm-mermaid-cove', 165, 200, 44, 'fantasy', 'a graceful mermaid with flowing hair sitting on a rock in a coral cove with fish and shells'),
  B('M', 'm-fairy-ring-dusk', 195, 195, 58, 'fantasy', 'a circle of fairies dancing in a moonlit toadstool ring with glowing lanterns and fireflies'),
  // ── pop art & portraits (popart) ──
  B('M', 'm-popart-headphones', 150, 195, 22, 'popart', 'a cool young woman in big retro headphones with a sleek bob, bold orange background'),
  B('M', 'm-popart-fur-hat', 150, 195, 22, 'popart', 'a glamorous woman in a fluffy fur hat and bold red lipstick, shown head AND shoulders wearing an elegant black coat with a visible collar and neckline, deep teal background'),
  B('M', 'm-popart-gent-pipe', 150, 195, 22, 'popart', 'a dapper gentleman with a neat beard, flat cap and a pipe, mustard background'),
  B('M', 'm-popart-sunhat', 150, 195, 24, 'popart', 'a chic woman in a wide sunhat and cat-eye sunglasses sipping a cocktail, coral background'),
  // ── fabulous faces (artface, detailed, varied skin tones) ──
  B('M', 'm-face-peacock-crown', 160, 205, 46, 'artface', 'a woman with warm brown skin and a magnificent crown of peacock feathers and jewels, rich teal and gold'),
  B('M', 'm-face-autumn-deep', 160, 205, 42, 'artface', 'a woman with deep dark skin and a crown of autumn leaves, rosehips and berries in russet and gold'),
  B('M', 'm-face-lotus-gold', 160, 205, 44, 'artface', 'a woman with brown skin, gold lotus flowers and dragonflies crowning her head, jewel tones'),
  B('M', 'm-face-winter-cardinal', 160, 205, 40, 'artface', 'a woman with fair skin, a crown of frosted pine, holly and a red cardinal, cool icy palette'),
  B('M', 'm-face-sunflower-tan', 160, 205, 38, 'artface', 'a woman with tan skin and a golden halo of sunflowers and wheat, warm summer palette'),
  // ── animals doing human things, FULL SCENES (scene, flat detailed) ──
  B('M', 'm-scene-cat-painter', 150, 190, 40, 'scene', 'a cat in a paint-smeared smock and beret painting at an easel in a sunny art studio'),
  B('M', 'm-scene-fox-tailor', 150, 190, 40, 'scene', 'a fox tailor in glasses sewing a tiny waistcoat in a cosy workshop full of fabric rolls'),
  B('M', 'm-scene-rabbit-baker', 150, 190, 38, 'scene', 'a rabbit baker in an apron pulling a fresh loaf from a country kitchen oven, shelves of bread'),
  B('M', 'm-scene-bear-fishing', 150, 190, 34, 'scene', 'a brown bear in waders and a bucket hat fishing from a riverbank with a picnic basket'),
  B('M', 'm-scene-mouse-clockmaker', 150, 190, 40, 'scene', 'a mouse clockmaker at a workbench mending a pocket watch with tiny tools, walls of clocks'),
  // ── beautiful florals (medium–large, richer palettes) ──
  B('M', 'm-floral-peony-cascade', 160, 170, 42, 'bright', 'a luxurious cascade of blush peonies, garden roses and ranunculus with trailing greenery'),
  B('M', 'm-wre-wildflower-lush', 165, 165, 44, 'wreath', 'a lush wildflower wreath packed with poppies, cornflowers, daisies, ferns and grasses'),
  // ── HUGE detailed showpieces (XL, 100+ colours — Rebecca's favourite tier) ──
  B('M', 'm-big-fairy-garden', 230, 250, 120, 'showpiece', 'a hugely detailed enchanted fairy garden packed with toadstool cottages, lanterns, many tiny fairies, glowing flowers, a winding stream and fireflies, full coverage'),
  B('M', 'm-big-enchanted-forest', 240, 240, 130, 'showpiece', 'an intricate richly detailed enchanted forest scene with fairy mushroom houses, fireflies, deer, a stream, owls and twisting trees, dense full coverage'),
  B('M', 'm-big-cat-bookshop', 220, 240, 120, 'showpiece', 'a charming corner cat bookshop façade packed with little story details: sleeping cats on the sign, books in arched windows, roses over the door, lanterns and a chalkboard, warm full coverage'),
  B('M', 'm-big-botanical-garden', 220, 260, 110, 'showpiece', 'a lush full-coverage cottage garden border densely packed with many species of flowers, bees, butterflies and songbirds, intricate and richly coloured'),
  B('M', 'm-big-cottage-market', 235, 220, 115, 'showpiece', 'a bustling cottage village market street with stalls of flowers, fruit and bread, striped awnings, bunting, lamp posts and many little shoppers, intricate full coverage'),
]

type FluxSize = 'square_hd' | 'landscape_4_3' | 'portrait_4_3'
export function imageSizeFor(w: number, h: number): FluxSize {
  if (w / h >= 1.25) return 'landscape_4_3'
  if (h / w >= 1.25) return 'portrait_4_3'
  return 'square_hd'
}

async function fluxCached(dir: string, slug: string, prompt: string, size: FluxSize, regen: boolean): Promise<Buffer> {
  const p = resolve(dir, `${slug}.flux.png`)
  if (regen && existsSync(p)) rmSync(p)
  if (existsSync(p)) return readFileSync(p)
  const src = await fluxIllustration(prompt, { imageSize: size })
  writeFileSync(p, src.buffer)
  return src.buffer
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const regen = args.includes('--regen')
  const bi = args.indexOf('--batch')
  const batch = bi >= 0 ? args[bi + 1] : null
  if (!batch) throw new Error('usage: --batch <name>')
  const dir = resolve(ROOT, batch)
  mkdirSync(dir, { recursive: true })
  const briefs = BRIEFS.filter((b) => b.batch === batch)
  if (briefs.length === 0) throw new Error(`no briefs for batch ${batch}`)

  let ok = 0
  for (const b of briefs) {
    try {
      const raw = await fluxCached(dir, b.slug, b.prompt, imageSizeFor(b.w, b.h), regen)
      // Pre-saturate the source so the floss palette is bold, not pastel.
      const img = await sharp(raw).modulate({ saturation: SRC_SAT[b.style] }).png().toBuffer()
      const { data } = await photoToPatternData(img, { width: b.w, height: b.h, colours: b.colours, fabricCount: 14, brand: 'DMC', confettiMin: 'medium', backgroundRemoval: false })
      data.fabric.colourRgb = FABRIC
      const bb = stitchedBoundingBox(data)
      const mg = 2
      const region = bb ? { x: Math.max(0, bb.minX - mg), y: Math.max(0, bb.minY - mg), width: Math.min(data.grid.width, bb.maxX + 1 + mg) - Math.max(0, bb.minX - mg), height: Math.min(data.grid.height, bb.maxY + 1 + mg) - Math.max(0, bb.minY - mg) } : undefined
      const rw = region?.width ?? data.grid.width
      const cellPx = rw <= 70 ? 26 : rw <= 130 ? 16 : 10
      const colours = data.palette.length
      const svg = renderPatternSvgString(data, { mode: 'beauty', cellPx, showSymbols: false, showGrid: false, showCentreCrosshairs: false, padding: Math.round(cellPx * 0.8), region })
      // post-process saturation (matches the publish step) so floss reads vivid.
      await sharp(Buffer.from(svg)).modulate({ saturation: 1.3 }).resize(1000, 1000, { fit: 'inside' }).png().toFile(resolve(dir, `${b.slug}.render.png`))
      ok++
      console.log(`[${batch}] ${b.slug} · ${data.grid.width}×${data.grid.height} · ${colours} colours${colours <= 2 ? ' ⚠️FLAT' : ''} -> ${b.slug}.render.png`)
    } catch (e) {
      console.log(`[${batch}] ${b.slug} FAILED: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  console.log(`batch ${batch} done: ${ok}/${briefs.length} rendered`)
}
// Only auto-run when invoked directly (not when imported for BRIEFS/consts).
if (process.argv[1] && /xs-volume-gen\.ts$/.test(process.argv[1])) {
  main().catch((e) => { console.error('[volume] FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })
}
