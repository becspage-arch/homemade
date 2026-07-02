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
import { fluxIllustration, fluxIllustrationPro } from '@/lib/studio/generation/sources'
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
// `sat` (optional) overrides the per-lane source saturation for THIS brief AND skips the
// post-render saturation boost. Use it for skin-heavy portraits: the compound boost
// (srcSat ~1.25 × post 1.3 ≈ 1.6×) cooks brown/tan skin into orange/coral. sat:1.0 keeps
// the raw Flux skin true; ~1.1 keeps a little punch for pop-art backgrounds.
export interface Brief { slug: string; batch: string; w: number; h: number; colours: number; style: keyof typeof STYLE; prompt: string; sat?: number }
const B = (batch: string, slug: string, w: number, h: number, colours: number, style: keyof typeof STYLE, subject: string, sat?: number): Brief =>
  ({ slug, batch, w, h, colours, style, prompt: `${subject}, ${STYLE[style]}, clean composition, centred`, ...(sat != null ? { sat } : {}) })

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
  B('M', 'm-big-fairy-garden', 230, 250, 150, 'showpiece', 'a hugely detailed enchanted fairy garden packed with toadstool cottages, lanterns, many tiny fairies, glowing flowers, a winding stream and fireflies, full coverage'),
  B('M', 'm-big-enchanted-forest', 240, 240, 150, 'showpiece', 'an intricate richly detailed enchanted forest scene with fairy mushroom houses, fireflies, deer, a stream, owls and twisting trees, dense full coverage'),
  B('M', 'm-big-cat-bookshop', 220, 240, 150, 'showpiece', 'a charming corner cat bookshop façade packed with little story details: sleeping cats on the sign, books in arched windows, roses over the door, lanterns and a chalkboard, warm full coverage'),
  B('M', 'm-big-botanical-garden', 220, 260, 150, 'showpiece', 'a lush full-coverage cottage garden border densely packed with many species of flowers, bees, butterflies and songbirds, intricate and richly coloured'),
  B('M', 'm-big-cottage-market', 235, 220, 150, 'showpiece', 'a bustling cottage village market street with stalls of flowers, fruit and bread, striped awnings, bunting, lamp posts and many little shoppers, intricate full coverage'),

  // ─────────── BATCH N — PRIORITY: pop art/portraits, faces (deep→fair), fairies/
  //             fantasy, animals-as-humans, beautiful florals + HUGE 100+ colour
  //             showpieces. Deliberate complexity RANGE: small/simple (14–18) →
  //             medium (22–46) → huge dense Flux-1.1-Pro (150-brief → 100+ floss). ───────────
  // ── quick + simple small (BEGINNER, ~14–18 colours) ──
  B('N', 'n-cute-chick-daisy', 110, 110, 14, 'cute', 'a fluffy yellow chick holding a single white daisy'),
  B('N', 'n-cute-hedgehog-heart', 112, 112, 16, 'cute', 'a tiny round hedgehog cuddling a little red heart'),
  B('N', 'n-cute-axolotl-bubble', 115, 115, 16, 'cute', 'a smiling pink axolotl blowing a shiny round bubble'),
  B('N', 'n-cute-frog-crown', 110, 118, 16, 'cute', 'a cheerful little green frog wearing a tiny gold crown on a lily pad'),
  B('N', 'n-cute-bat-moon', 115, 120, 16, 'fantasy', 'a cute round-eared bat hanging upside-down from a crescent moon among stars'),
  // ── fairies & fantasy (medium → large) ──
  B('N', 'n-fantasy-dragon-stars', 120, 125, 20, 'fantasy', 'a chubby baby dragon curled asleep on a cloud among twinkling stars'),
  B('N', 'n-fantasy-mushroom-house', 140, 160, 30, 'fantasy', 'a glowing fairy toadstool cottage with tiny lit windows, a round door and flowers, at dusk'),
  B('N', 'n-fantasy-unicorn-galaxy', 150, 150, 30, 'fantasy', 'a gentle unicorn with a flowing galaxy-coloured mane standing among glowing stars and flowers'),
  B('N', 'n-fantasy-phoenix', 160, 200, 44, 'fantasy', 'a graceful phoenix rising with magnificent flame-coloured plumage in red, orange and gold against a deep night sky'),
  B('N', 'n-fantasy-mermaid-moon', 165, 205, 46, 'fantasy', 'a serene mermaid with long flowing hair sitting on a rock under a huge full moon, glowing jellyfish drifting around her'),
  // ── pop art & portraits (popart) ──
  B('N', 'n-popart-vinyl-girl', 150, 195, 22, 'popart', 'a cool retro woman with a sleek bob holding a vinyl record up beside her face, bold orange background'),
  B('N', 'n-popart-redhead-freckles', 150, 195, 22, 'popart', 'a striking woman with wavy red hair, freckles and green eyes, sage-green background'),
  B('N', 'n-popart-gent-bowtie', 150, 195, 22, 'popart', 'a dapper black man with short cropped hair, round glasses and a polka-dot bow tie, mustard background'),
  B('N', 'n-popart-bobblehat', 150, 195, 22, 'popart', 'a woman in a chunky knitted bobble hat with rosy cheeks holding a steaming mug, a clear clean evenly-lit smooth face with both eyes symmetrical and correct, tidy neat hair, no shadows or smudges on the face, teal background'),
  B('N', 'n-popart-redlips-wink', 150, 195, 22, 'popart', 'a glamorous woman winking with bold red lipstick and a flicked fringe, blush-pink background'),
  // ── fabulous faces (artface) — skin tones DEEP → FAIR ──
  B('N', 'n-face-orchid-deep', 160, 205, 44, 'artface', 'a woman with deep dark ebony skin and a lavish crown of purple orchids and gold leaves, jewel tones, a serene beautiful evenly-lit face with smooth even skin and gentle natural features, no face paint, no markings, no tribal patterns on the face'),
  B('N', 'n-face-rose-darkbrown', 160, 205, 42, 'artface', 'a woman with rich dark brown skin, a crown of red roses and a blue butterfly resting on her cheek, a serene beautiful front-facing evenly-lit face with smooth even skin and gentle natural features, both eyes symmetrical, clean flat shading, no markings or blotches on the face'),
  B('N', 'n-face-poppy-brown', 160, 205, 40, 'artface', 'a woman with warm brown skin and a crown of red poppies and golden wheat, a serene beautiful evenly-lit face with smooth even skin and soft natural features, both eyes symmetrical, gentle clean flat shading, no harsh orange patches or streaks on the face, warm summer palette'),
  B('N', 'n-face-bluebird-tan', 160, 205, 38, 'artface', 'a woman with a natural tan skin tone, a little bluebird and trailing forget-me-nots and blossom beside her face, a serene beautiful evenly-lit face with smooth even skin, gentle clean flat shading, both eyes symmetrical, natural skin colour not orange, not loose or painterly'),
  B('N', 'n-face-magnolia-fair', 160, 205, 38, 'artface', 'a woman with fair skin, a crown of pink magnolia blossoms and a soft luna moth, pale dawn palette'),
  // ── animals doing human things, FULL SCENES (scene, flat detailed) ──
  B('N', 'n-scene-cat-bookshop', 150, 190, 40, 'scene', 'a cat in round glasses reading a book at the window of a cosy bookshop, stacks of books and a lamp'),
  B('N', 'n-scene-fox-teagarden', 150, 190, 38, 'scene', 'a fox in a waistcoat having afternoon tea at a little table in a flower garden with a teapot and cakes'),
  B('N', 'n-scene-otter-painter', 150, 190, 38, 'scene', 'a cute otter in a paint-smock painting at an easel on a riverbank, the otter fills the frame with a clear sweet face and both eyes clearly visible, tidy whiskers, paint pots and bulrushes, clean full composition'),
  B('N', 'n-scene-hedgehog-greenhouse', 150, 190, 38, 'scene', 'a hedgehog in dungarees watering potted plants in a sunny greenhouse full of flowers and tools'),
  B('N', 'n-scene-mouse-postman', 150, 190, 36, 'scene', 'a mouse postman in a little cap delivering tiny letters at a flowery cottage door with a red postbox'),
  // ── beautiful florals (medium–large, richer palettes) ──
  B('N', 'n-floral-rose-bouquet', 160, 170, 42, 'bright', 'a luxurious bouquet of garden roses, ranunculus and sweet peas in blush, peach and cream with trailing greenery'),
  B('N', 'n-wre-blossom-wreath', 165, 165, 40, 'wreath', 'a fresh spring wreath of pink cherry blossom, tulips and green leaves with a little bird'),
  // ── HUGE detailed showpieces (XL, 150-brief → Flux 1.1 Pro, 100+ floss) ──
  B('N', 'n-big-flower-market', 240, 220, 150, 'showpiece', 'a bustling flower-market scene packed with stalls of colourful blooms in buckets, hanging baskets, striped awnings, lamp posts and many little shoppers, intricate full coverage'),
  B('N', 'n-big-fairy-treehouse', 220, 250, 150, 'showpiece', 'a hugely detailed enchanted fairy treehouse village built into a great twisting tree, tiny lit windows, rope bridges, lanterns, many little fairies, glowing flowers and fireflies, dense full coverage'),
  B('N', 'n-big-cottage-kitchen', 235, 220, 150, 'showpiece', 'a richly detailed cosy cottage kitchen packed with hanging herbs and copper pots, a dresser of crockery, jars on shelves, fresh bread and cakes, a sleeping cat by the range, warm full coverage'),
  B('N', 'n-big-secret-garden', 220, 255, 150, 'showpiece', 'a lush walled secret garden densely packed with climbing roses, foxgloves and many flower species, a stone fountain, butterflies, songbirds and an arched gate, intricate full coverage'),

  // ─────────── BATCH O — PRIORITY: pop art/portraits, faces (deep→fair, clean-face
  //             brief baked in from N's learning), fairies/fantasy, animals-as-humans,
  //             beautiful florals + HUGE 100+ Flux-1.1-Pro showpieces. Full RANGE 12→150. ───────────
  // ── quick + simple small (BEGINNER, ~12–18 colours) ──
  B('O', 'o-cute-owlet-moon', 112, 120, 16, 'cute', 'a tiny fluffy owlet perched on a crescent moon among little stars'),
  B('O', 'o-cute-piglet-daisy', 110, 110, 14, 'cute', 'a sweet little rosy-pink piglet holding a white daisy, soft even lighting, clear friendly face with both eyes symmetrical, rounded rich pink shading with no blown-out white highlights, clean pale background'),
  B('O', 'o-cute-narwhal-star', 115, 115, 14, 'cute', 'a chubby baby narwhal balancing a yellow star on its horn'),
  B('O', 'o-cute-kitten-teacup', 112, 118, 16, 'cute', 'an adorable fluffy grey kitten peeking out of a pink floral teacup, big clear symmetrical eyes and a sweet clean face, soft pastel palette, clean white background'),
  B('O', 'o-cute-dragon-cupcake', 118, 118, 18, 'cute', 'a cute chubby green baby dragon holding a little pink frosted cupcake, clear friendly face with both eyes symmetrical, soft even lighting, clean pale background'),
  // ── fairies & fantasy (medium → large) ──
  B('O', 'o-fantasy-fairy-lantern', 130, 155, 26, 'fantasy', 'a sweet fairy with luminous gauzy wings holding a glowing lantern in a moonlit forest glade, a clear pretty face with both eyes symmetrical, soft luminous lighting so the scene reads brightly, airy not muddy'),
  B('O', 'o-fantasy-mushroom-village', 150, 150, 30, 'fantasy', 'a cheerful cluster of red-and-white toadstool cottages with cosy lit windows and winding paths among ferns and flowers, bright daylight, clear crisp little cottages, airy and colourful not dark or muddy'),
  B('O', 'o-fantasy-dragon-castle', 160, 160, 34, 'fantasy', 'a friendly jewel-scaled dragon curled around a fairytale castle tower under the stars'),
  B('O', 'o-fantasy-mermaid-treasure', 165, 200, 44, 'fantasy', 'a graceful mermaid with flowing hair beside an open treasure chest of pearls, with colourful fish and coral'),
  B('O', 'o-fantasy-pegasus-clouds', 165, 200, 42, 'fantasy', 'a graceful white winged pegasus soaring among soft pink clouds and glowing stars at dusk'),
  // ── pop art & portraits (popart — reliable clean lane) ──
  B('O', 'o-popart-headscarf-blue', 150, 195, 22, 'popart', 'a chic woman in a blue polka-dot headscarf with bold red lips, warm coral background'),
  B('O', 'o-popart-man-turtleneck', 150, 195, 22, 'popart', 'a stylish man with short dark hair in a black turtleneck and clear round glasses, sage background'),
  B('O', 'o-popart-cat-lady', 150, 195, 24, 'popart', 'an elegant woman with an updo holding a sleek black cat, mustard-yellow background'),
  B('O', 'o-popart-sunglasses-red', 150, 195, 22, 'popart', 'a glamorous woman in big round red sunglasses and a headband, teal background'),
  B('O', 'o-popart-braids-gold', 150, 195, 24, 'popart', 'a striking Black woman with long box braids and large gold hoop earrings, deep plum background'),
  // ── fabulous faces (artface, deep→fair) — CLEAN-FACE brief baked in ──
  B('O', 'o-face-sunflower-deep', 160, 205, 42, 'artface', 'a beautiful woman with warm deep brown skin lit brightly and evenly with soft luminous highlights so the whole face reads clearly, a golden crown of sunflowers, serene front-facing, both eyes symmetrical, clean flat shading, no muddy dark shadows and no markings or patches on the face'),
  B('O', 'o-face-tulip-darkbrown', 160, 205, 40, 'artface', 'a woman with rich dark brown skin and a crown of pink and red tulips, a serene beautiful evenly-lit face with smooth even skin, both eyes symmetrical, clean flat shading, no markings or patches on the face'),
  B('O', 'o-face-lavender-tan', 160, 205, 38, 'artface', 'a beautiful woman with soft natural light-brown skin (a gentle warm beige, definitely not orange or tanned-orange), a crown of lavender and little bees, serene evenly-lit face with smooth even skin, both eyes symmetrical, gentle clean flat shading, natural believable skin colour'),
  B('O', 'o-face-cherry-fair', 160, 205, 38, 'artface', 'a woman with fair skin and a crown of pink cherry blossom, a serene beautiful evenly-lit face with smooth even skin, both eyes symmetrical, clean soft shading, no markings or patches on the face'),
  B('O', 'o-face-holly-pale', 160, 205, 38, 'artface', 'a beautiful woman with pale porcelain skin and a winter crown of holly and frosted pine, a little red robin perched on the greenery to one side beside her head (not on her face), serene evenly-lit face with smooth even skin, both eyes symmetrical, clean shading, cool palette'),
  // ── animals doing human things, FULL SCENES (scene, flat detailed) ──
  B('O', 'o-scene-cat-noodles', 150, 190, 38, 'scene', 'a cat chef in an apron cooking a steaming bowl of noodles at a cosy little food stall with lanterns'),
  B('O', 'o-scene-hare-violin', 150, 190, 36, 'scene', 'a hare in a waistcoat playing a violin on a little wooden stage with warm spotlights and flowers'),
  B('O', 'o-scene-mouse-teashop', 150, 190, 40, 'scene', 'a mouse in an apron serving tea and cakes in a tiny cosy teashop full of shelves and teapots'),
  B('O', 'o-scene-owl-professor', 150, 190, 36, 'scene', 'a wise owl professor in round glasses at a chalkboard in a cosy study full of books and globes'),
  B('O', 'o-scene-pig-gardener', 150, 190, 38, 'scene', 'a cheerful pig in dungarees and a straw hat tending a vegetable garden with a wheelbarrow and sunflowers'),
  // ── beautiful florals (medium–large, richer palettes) ──
  B('O', 'o-floral-peony-vase', 150, 175, 40, 'bright', 'a generous arrangement of blush and coral peonies in a blue-and-white china vase'),
  B('O', 'o-wre-autumn-lush', 165, 165, 44, 'wreath', 'a lush autumn wreath of orange and gold leaves, rosehips, acorns, berries and little pumpkins'),
  // ── HUGE detailed showpieces (XL, 150-brief → Flux 1.1 Pro, 100+ floss) ──
  B('O', 'o-big-cat-cafe', 235, 220, 150, 'showpiece', 'a bustling cosy cat café packed with many cats lounging on shelves and chairs, cake stands, hanging plants, teapots, fairy lights and little tables, intricate warm full coverage'),
  B('O', 'o-big-enchanted-library', 220, 250, 150, 'showpiece', 'a vast enchanted library with towering bookshelves, rolling ladders, glowing floating books, lanterns, a spiral staircase and a small friendly dragon, dense richly-coloured full coverage'),
  B('O', 'o-big-seaside-town', 240, 220, 150, 'showpiece', 'a colourful seaside harbour town with tiers of pastel cottages, fishing boats, a lighthouse, market stalls, gulls and many little people, intricate full coverage'),
  B('O', 'o-big-butterfly-garden', 220, 255, 150, 'showpiece', 'a densely packed summer butterfly garden with hundreds of flowers in every colour, many butterflies, bees, a birdbath and trailing blooms, intricate full coverage'),

  // ═══════════════ BATCH P (2026-07-01) — priorities: pop art & portraits (deep→fair via the RELIABLE
  //             popart lane, since artface can't converge on deep/tan skin), fabulous faces (artface =
  //             FAIR/PALE only), animals-as-humans, fairies/fantasy, beautiful florals + HUGE 100+
  //             Flux-1.1-Pro showpieces. Full RANGE 14 → 113. ───────────────────────────────────────
  // ── quick + simple small cuties (BEGINNER, ~14–18 colours) ──
  B('P', 'p-cute-bunny-carrot', 112, 118, 16, 'cute', 'a fluffy white bunny with soft grey shading and a clear grey outline so it reads on pale fabric, hugging a bright orange carrot (solid orange, no pink), clear friendly face with both eyes symmetrical, clean pale background'),
  B('P', 'p-cute-fox-cub-leaf', 112, 118, 16, 'cute', 'a tiny sitting orange fox cub with a clean white chest and one clear red maple leaf held beside it, tidy solid fills, sweet clean face with both eyes symmetrical, clean pale background'),
  B('P', 'p-cute-penguin-scarf', 110, 120, 15, 'cute', 'a round fluffy baby penguin wearing a cosy striped knitted scarf, clear sweet face with both eyes symmetrical, clean white background'),
  B('P', 'p-cute-lamb-bow', 112, 112, 16, 'cute', 'a fluffy little cream lamb with soft grey-brown wool shading and a clear outline so it reads on pale fabric, a pastel blue bow, sweet clean face with both eyes symmetrical, clean white background'),
  B('P', 'p-cute-panda-bamboo', 112, 118, 16, 'cute', 'an adorable roly-poly baby panda holding a green bamboo shoot, clear friendly face with both eyes symmetrical, clean white background'),
  // ── fairies & fantasy (medium → large) ──
  B('P', 'p-fantasy-fairy-toadstool', 130, 160, 26, 'fantasy', 'a sweet little fairy with luminous gauzy wings sitting on a bright red spotted toadstool in a sunlit flower glade, a clear pretty well-defined face with both eyes symmetrical and normal-sized, crisp clean bold outlines, bright airy daylight, NOT muddy NOT hazy'),
  B('P', 'p-fantasy-wizard-cat', 140, 160, 30, 'fantasy', 'a whimsical wizard cat in a starry pointed hat and robe holding a glowing spellbook, warm magical light, clear friendly face, crisp clear detail'),
  B('P', 'p-fantasy-genie-lamp', 150, 160, 30, 'fantasy', 'a friendly smiling genie with a jewelled turban swirling up out of a golden lamp in a puff of magic, rich jewel-tone palette, clear face with both eyes symmetrical'),
  B('P', 'p-fantasy-unicorn-rainbow', 160, 175, 32, 'fantasy', 'a graceful white unicorn with a flowing rainbow mane and tail on a flowery hilltop beneath a rainbow, soft dreamy pastel-and-jewel palette, crisp clear detail'),
  B('P', 'p-fantasy-snow-queen', 160, 200, 36, 'fantasy', 'an elegant snow queen with fair skin in an icy-blue gown and crystal crown in a glittering winter palace, cool sparkling palette, a clear beautiful face with both eyes symmetrical'),
  // ── pop art & portraits (popart — reliable across ALL skin tones, deep→fair) ──
  B('P', 'p-popart-afro-gold', 150, 195, 20, 'popart', 'a striking woman with a big natural afro and gold hoop earrings, rich dark chocolate-brown skin (deep and clearly brown, absolutely not pink coral or orange), bold teal background', 1.1),
  B('P', 'p-popart-hijab-emerald', 150, 195, 20, 'popart', 'an elegant woman in a flowing rich emerald-green hijab (clearly green) with bold red lips, warm mid-brown skin (natural believable brown, not orange), warm coral-pink background', 1.1),
  B('P', 'p-popart-beard-cap', 150, 195, 20, 'popart', 'a handsome man with a neat dark beard and a flat cap, mid-brown skin in a natural believable tone, mustard-yellow background'),
  B('P', 'p-popart-curls-red', 150, 195, 20, 'popart', 'a stylish woman with voluminous red curly hair and green eyes, fair freckled skin, deep plum background'),
  B('P', 'p-popart-bald-earring', 150, 195, 18, 'popart', 'a striking confident bald woman with one big statement earring and bold lips, deep brown skin in a natural believable tone, sage-green background'),
  // ── fabulous faces (artface — FAIR/PALE skin ONLY; the lane will not converge on deep/tan) ──
  B('P', 'p-face-rose-fair', 160, 205, 28, 'artface', 'a woman with fair skin and a crown of red and pink roses, a serene beautiful evenly-lit face with smooth even skin, both eyes symmetrical, clean soft shading, no orange patches or streaks on the face, natural skin', 1.0),
  B('P', 'p-face-daisy-pale', 160, 205, 24, 'artface', 'a woman with pale porcelain skin and a crown of white daisies and greenery, a serene beautiful evenly-lit face with smooth even skin, both eyes symmetrical, clean soft shading, no markings or patches on the face'),
  B('P', 'p-face-poppy-fair', 160, 205, 28, 'artface', 'a woman with fair skin and a crown of red poppies and golden wheat, a serene beautiful evenly-lit face with smooth even skin, both eyes symmetrical, clean flat shading, no orange patches or streaks on the face, natural skin', 1.0),
  // ── animals doing human things, FULL SCENES (scene, flat detailed) ──
  B('P', 'p-scene-rabbit-baker', 150, 190, 34, 'scene', 'a cheerful rabbit baker in an apron and chef hat pulling a fresh loaf from a brick oven in a cosy bakery full of breads and cakes'),
  B('P', 'p-scene-bear-fisherman', 150, 190, 32, 'scene', 'a big friendly bear in a fishing hat and waders standing in a river holding a fishing rod, with pine trees and mountains behind'),
  B('P', 'p-scene-squirrel-artist', 150, 190, 34, 'scene', 'a red squirrel with a big bushy tail (clearly a squirrel), in a paint-smock and beret, painting at an easel in a bright cosy studio with paint pots and canvases, crisp clean shapes, clear and not hazy'),
  B('P', 'p-scene-frog-banjo', 150, 190, 30, 'scene', 'a cheerful frog in dungarees playing a banjo on a lily pad at a moonlit pond with cattails and fireflies'),
  B('P', 'p-scene-badger-gardener', 150, 190, 34, 'scene', 'a kindly badger in a gardening apron potting flowers at a wooden potting bench in a sunny cottage-garden greenhouse'),
  // ── beautiful florals + a bright bird (medium–large, richer palettes) ──
  B('P', 'p-floral-sunflower-jug', 150, 175, 34, 'bright', 'a cheerful bunch of sunflowers and white daisies in a rustic blue enamel jug'),
  B('P', 'p-floral-tulip-basket', 150, 165, 34, 'bright', 'a pretty woven basket overflowing with pink, yellow and red tulips'),
  B('P', 'p-wre-lavender-wild', 165, 165, 40, 'wreath', 'a lush wreath of lavender, white wild daisies, blue cornflowers and trailing eucalyptus'),
  B('P', 'p-bright-hummingbird', 130, 150, 24, 'bright', 'a jewel-bright emerald hummingbird hovering at a spray of pink trumpet flowers'),
  // ── HUGE detailed showpieces (XL, 150-brief → Flux 1.1 Pro, 100+ floss) ──
  B('P', 'p-big-christmas-village', 240, 220, 150, 'showpiece', 'a magical snowy Christmas village at night with twinkling lit cottages, a little church, a decorated tree in the square, carol singers, a horse and sleigh, snowy pines and softly falling snow, intricate warm full coverage'),
  B('P', 'p-big-japanese-garden', 235, 220, 150, 'showpiece', 'a serene Japanese garden in spring with a red arched bridge over a koi pond, blossoming cherry trees, a stone lantern, a pagoda and maples, intricate richly-coloured full coverage'),
  B('P', 'p-big-coral-reef', 240, 220, 150, 'showpiece', 'a vibrant tropical coral reef teeming with clownfish, angelfish, a sea turtle, seahorses, starfish and swaying anemones in clear blue water, intricate full coverage'),
  B('P', 'p-big-cosy-bookshop', 220, 250, 150, 'showpiece', 'a cosy multi-storey bookshop café interior packed with towering bookshelves, rolling ladders, reading nooks, hanging lamps, potted plants, a sleeping cat and steaming mugs, intricate warm full coverage'),

  // ─────────── BATCH Q — priorities: portraits/faces ACROSS skin tones (per-brief `sat`
  //             now makes deep skin shippable in popart), animals-as-humans (NO red/orange
  //             fur in the high-sat scene lane — it cooks to magenta), fantasy, florals +
  //             HUGE 100+ Flux-1.1-Pro showpieces. Full RANGE 13 → 106. ───────────────────
  // ── quick + simple small cuties (BEGINNER, ~13–16 colours) ──
  B('Q', 'q-cute-otter-shell', 118, 112, 15, 'cute', 'an adorable baby sea otter floating on its back holding a little shell on its tummy, clean sweet face with both eyes symmetrical, soft blue water, clean pale background'),
  B('Q', 'q-cute-duckling-umbrella', 112, 120, 14, 'cute', 'a fluffy yellow duckling sheltering under a bright red umbrella, sweet clean face with both eyes symmetrical, clean white background'),
  B('Q', 'q-cute-kitten-yarn', 118, 115, 15, 'cute', 'a playful grey tabby kitten with a clear outline patting a ball of pink yarn, sweet clean face with both eyes symmetrical, clean white background'),
  B('Q', 'q-cute-hedgehog-mushroom', 115, 115, 15, 'cute', 'a little round hedgehog standing beside a red spotted mushroom among a few autumn leaves, sweet clean face with both eyes symmetrical, clean pale background'),
  B('Q', 'q-cute-seal-pup', 118, 112, 13, 'cute', 'a fluffy white baby seal pup with big dark eyes lying on pale blue ice, clear soft grey outline so it reads on pale fabric, sweet clean face with both eyes symmetrical, clean background'),
  // ── fairies & fantasy (medium → large) ──
  B('Q', 'q-fantasy-mermaid-pearl', 150, 185, 32, 'fantasy', 'a beautiful mermaid with fair skin and flowing auburn hair cradling a glowing pearl in a coral grotto, shimmering teal-and-coral jewel palette, a clear pretty face with both eyes symmetrical, crisp clean outlines'),
  B('Q', 'q-fantasy-dragon-baby', 130, 140, 26, 'fantasy', 'a cute chubby baby dragon hatching from a cracked speckled egg, big friendly eyes, bright emerald-and-gold jewel tones, crisp clean bold outlines, bright airy light, NOT muddy'),
  B('Q', 'q-fantasy-witch-cauldron', 140, 165, 30, 'fantasy', 'a friendly little witch with fair skin in a starry pointed hat stirring a bubbling green cauldron with floating sparkles and stars, warm magical light, a clear sweet face with both eyes symmetrical, crisp clear detail'),
  B('Q', 'q-fantasy-phoenix', 150, 175, 34, 'fantasy', 'a majestic phoenix with outstretched wings rising in swirling flame, brilliant crimson-orange-and-gold jewel tones against a deep indigo sky, crisp clean bold outlines, NOT muddy NOT hazy'),
  B('Q', 'q-fantasy-fairy-lantern', 140, 170, 30, 'fantasy', 'a graceful fairy with fair skin and luminous gauzy wings holding up a glowing golden lantern among bluebells at bright twilight, luminous clear bright jewel colours, a clear pretty well-defined face with both eyes symmetrical and normal-sized, crisp clean bold outlines, bright and vivid, NOT dark NOT hazy NOT muddy'),
  // ── pop art & portraits (popart — reliable across ALL skin tones; deep skin uses sat:1.1) ──
  B('Q', 'q-popart-locs-teal', 150, 195, 20, 'popart', 'a handsome man with long neat locs and a trimmed beard, rich dark chocolate-brown skin (deep and clearly brown, absolutely not pink coral or orange), bold teal background', 1.1),
  B('Q', 'q-popart-headwrap-orange', 150, 195, 20, 'popart', 'an elegant woman in a bold patterned headwrap with large gold hoop earrings, rich dark chocolate-brown skin (deep and clearly brown, absolutely not pink coral or orange), warm plum background', 1.1),
  B('Q', 'q-popart-glasses-blue', 150, 195, 20, 'popart', 'a stylish man with round tortoiseshell glasses and a neat side part, mid-brown skin in a natural believable tone, soft blue background'),
  B('Q', 'q-popart-bob-black', 150, 195, 18, 'popart', 'a chic woman with a sleek jet-black bob and bold red lips, fair skin in a natural believable tone, mustard-yellow background'),
  B('Q', 'q-popart-freckles-ginger', 150, 195, 20, 'popart', 'a fresh-faced woman with wavy ginger hair and lots of freckles and green eyes, fair skin, sage-green background'),
  // ── fabulous faces (artface — FAIR/PALE skin ONLY; sat:1.0 keeps skin true) ──
  B('Q', 'q-face-sunflower-fair', 160, 205, 28, 'artface', 'a woman with fair skin and a crown of golden sunflowers, a serene beautiful face in bright even frontal daylight with minimal shadow, smooth clean even fair skin, the whole forehead clearly visible above the brows, both eyes symmetrical, soft flat shading, no grey shadows or patches on the face, natural skin', 1.0),
  B('Q', 'q-face-wisteria-pale', 160, 205, 26, 'artface', 'a woman with pale porcelain skin and a crown of trailing lilac wisteria, a serene beautiful evenly-lit face with smooth even skin, both eyes symmetrical, clean soft shading, no markings or patches on the face', 1.0),
  B('Q', 'q-face-holly-fair', 160, 205, 26, 'artface', 'a woman with fair skin and a winter crown of holly leaves and red berries and pinecones, a serene beautiful evenly-lit face with smooth even skin, both eyes symmetrical, clean flat shading, no orange patches on the face, natural skin', 1.0),
  // ── animals doing human things, FULL SCENES (scene lane — NO red/orange fur here) ──
  B('Q', 'q-scene-hedgehog-tea', 150, 190, 32, 'scene', 'a dapper hedgehog in a waistcoat pouring tea at a pretty set table with a cake stand and teapot in a cosy cottage parlour'),
  B('Q', 'q-scene-otter-boat', 150, 190, 30, 'scene', 'a cheerful otter in a striped jumper rowing a little wooden boat down a leafy river with reeds and dragonflies'),
  B('Q', 'q-scene-owl-librarian', 150, 190, 32, 'scene', 'a wise owl librarian in half-moon glasses on a rolling ladder among towering bookshelves in a grand cosy library'),
  B('Q', 'q-scene-mole-tailor', 150, 190, 32, 'scene', 'a kindly mole tailor in a waistcoat sewing a jacket at a workbench in a snug workshop full of fabric bolts, threads and a mannequin'),
  B('Q', 'q-scene-tortoise-postman', 150, 190, 30, 'scene', 'a friendly tortoise postman in a cap and satchel delivering letters along a cobbled village lane with little cottages and flowerpots'),
  // ── beautiful florals + a bright bird (medium–large, richer palettes) ──
  B('Q', 'q-floral-peony-jug', 150, 175, 34, 'bright', 'a lavish bunch of blush-pink and coral peonies in a white ceramic jug'),
  B('Q', 'q-floral-daffodil-basket', 150, 165, 30, 'bright', 'a cheerful woven basket of bright yellow daffodils and narcissi with spring greenery'),
  B('Q', 'q-wre-poppy-cornflower', 165, 165, 40, 'wreath', 'a lush summer wreath of red poppies, blue cornflowers, white daisies and golden wheat'),
  B('Q', 'q-bright-kingfisher', 130, 150, 24, 'bright', 'a brilliant kingfisher with electric-blue and orange plumage perched on a reed above a stream'),
  // ── HUGE detailed showpieces (XL, 150-brief → Flux 1.1 Pro, 100+ floss) ──
  B('Q', 'q-big-autumn-market', 240, 220, 150, 'showpiece', 'a bustling autumn farmers market at golden hour with stalls of pumpkins, apples, flowers and bread, striped awnings, bunting, shoppers and baskets, falling leaves, intricate warm full coverage'),
  B('Q', 'q-big-fairy-village', 220, 245, 150, 'showpiece', 'a magical fairy village built into a giant old tree at twilight with glowing lantern-lit toadstool houses, tiny rope bridges, winding stairs, fireflies and flitting fairies, intricate jewel-toned full coverage'),
  B('Q', 'q-big-venice-canal', 240, 220, 150, 'showpiece', 'a sun-drenched Venice canal scene with gondolas, an arched stone bridge, weathered pastel palazzos with flower balconies, reflections in the water and a distant church dome, intricate richly-coloured full coverage'),
  B('Q', 'q-big-tropical-jungle', 235, 220, 150, 'showpiece', 'a lush tropical rainforest teeming with colourful parrots and toucans, a monkey, a tiger peeking through, exotic flowers, giant leaves and a cascading waterfall, intricate saturated full coverage'),

  // ─────────── BATCH R — same priorities: more deep-skin popart portraits (sat:1.1 reliable),
  //             fabulous faces (fair, sat:1.0), animal-as-human scenes (NO red/orange fur),
  //             fantasy, florals + HUGE 100+ Flux-1.1-Pro showpieces. Full RANGE 12 → 120. ───
  // ── quick + simple small cuties (BEGINNER, ~12–16 colours) ──
  B('R', 'r-cute-red-panda', 118, 118, 16, 'cute', 'an adorable red panda curled up holding its fluffy ringed tail, sweet clean face with both eyes symmetrical, a few green leaves, clean pale background'),
  B('R', 'r-cute-baby-elephant', 120, 112, 14, 'cute', 'a sweet grey baby elephant with big ears holding a pink lotus flower in its trunk, clear soft outline so it reads on pale fabric, sweet clean face with both eyes symmetrical, clean white background'),
  B('R', 'r-cute-pug-puppy', 115, 115, 15, 'cute', 'an adorable fawn pug puppy sitting with a little blue collar, sweet wrinkly clean face with both eyes symmetrical, clean white background'),
  B('R', 'r-cute-chick-egg', 112, 118, 12, 'cute', 'a fluffy yellow chick just hatched sitting in a cracked eggshell, sweet clean face with both eyes symmetrical, clean white background'),
  B('R', 'r-cute-baby-turtle', 118, 112, 14, 'cute', 'a cute little green sea turtle swimming with a happy face, soft blue water and a bubble or two, both eyes symmetrical, clean pale background'),
  // ── fairies & fantasy (medium → large) ──
  B('R', 'r-fantasy-unicorn-foal', 140, 160, 28, 'fantasy', 'a tiny adorable baby unicorn foal with a pastel-rainbow mane sitting in a flowery meadow under a sparkle of stars, soft dreamy pastel-and-jewel palette, a clear sweet face with both eyes symmetrical, crisp clean outlines'),
  B('R', 'r-fantasy-dragon-treasure', 150, 165, 32, 'fantasy', 'a friendly little dragon curled proudly on a glittering hoard of gold coins and jewels in a cave, warm torchlight, rich emerald-and-gold jewel tones, clear face, crisp clean bold outlines, NOT muddy'),
  B('R', 'r-fantasy-fairy-ring', 150, 170, 32, 'fantasy', 'two little fairies with luminous wings dancing around a ring of red spotted toadstools in a sunlit glade with bluebells, a clear pretty face on each with both eyes symmetrical and normal-sized, bright airy daylight, crisp clean bold outlines, NOT hazy'),
  B('R', 'r-fantasy-wizard-owl', 140, 165, 30, 'fantasy', 'a wise wizard owl in a starry pointed hat perched on a stack of spellbooks with a glowing crystal, warm magical light, clear friendly face, crisp clear detail, NOT muddy'),
  B('R', 'r-fantasy-snow-fox', 130, 150, 26, 'fantasy', 'a magical white arctic fox with a glowing frost-blue aura sitting in a sparkling snowy forest under the northern lights, cool sparkling jewel palette, clear sweet face with both eyes symmetrical, crisp clean outlines'),
  // ── pop art & portraits (popart — deep skin sat:1.1, reliable across tones) ──
  B('R', 'r-popart-turban-man', 150, 195, 20, 'popart', 'a distinguished man in a richly patterned turban with a neat grey beard, rich dark chocolate-brown skin (deep and clearly brown, absolutely not pink coral or orange), warm teal background', 1.1),
  B('R', 'r-popart-braids-blue', 150, 195, 20, 'popart', 'a beautiful woman with long box braids gathered up and gold jewellery, rich dark chocolate-brown skin (deep and clearly brown, absolutely not pink coral or orange), deep blue background', 1.1),
  B('R', 'r-popart-updo-elegant', 150, 195, 20, 'popart', 'an elegant woman with a sleek high updo bun and large statement gold earrings and bold red lips, deep brown skin in a natural believable tone (not orange), warm dusky-rose background', 1.1),
  B('R', 'r-popart-pixie-blonde', 150, 195, 18, 'popart', 'a chic woman with a short blonde pixie cut and bold red lips, fair skin in a natural believable tone, coral-pink background'),
  B('R', 'r-popart-moustache-vintage', 150, 195, 20, 'popart', 'a dapper vintage gentleman with a curled moustache and a bow tie and round glasses, mid-brown skin in a natural believable tone, mustard-yellow background'),
  // ── fabulous faces (artface — FAIR/PALE skin ONLY; sat:1.0) ──
  B('R', 'r-face-cherry-fair', 160, 205, 28, 'artface', 'a woman with fair skin and a crown of pink cherry blossom, a serene beautiful face in bright even frontal daylight with minimal shadow, smooth clean even fair skin, the whole forehead clearly visible, both eyes symmetrical, soft flat shading, no grey shadows or patches on the face, natural skin', 1.0),
  B('R', 'r-face-autumn-pale', 160, 205, 26, 'artface', 'a woman with pale skin and a crown of autumn leaves, red berries and little pumpkins, a serene beautiful face in bright flat even studio lighting with NO grey contouring shadows, clean smooth matte even skin, the whole head and full forehead clearly visible above the brows, both eyes symmetrical, soft flat clean shading, no grey shadows or muddy patches around the eyes or cheeks, natural skin', 1.0),
  B('R', 'r-face-lily-fair', 160, 205, 26, 'artface', 'a woman with fair skin and a crown of white lilies and green foliage, a serene beautiful face in bright even light with minimal shadow, smooth clean even skin, the whole forehead clearly visible, both eyes symmetrical, soft flat shading, no orange patches on the face, natural skin', 1.0),
  // ── animals doing human things, FULL SCENES (scene lane — NO red/orange fur) ──
  B('R', 'r-scene-cat-baker', 150, 190, 30, 'scene', 'a cheerful grey tabby cat in an apron and chef hat rolling dough at a floury counter in a cosy cottage kitchen with pies and jars on shelves'),
  B('R', 'r-scene-sheep-knitter', 150, 190, 28, 'scene', 'a cosy sheep in spectacles knitting a long scarf in a comfy armchair by a crackling fireplace with baskets of wool'),
  B('R', 'r-scene-penguin-skater', 150, 190, 26, 'scene', 'a jolly penguin in a woolly hat and scarf ice-skating on a frozen pond ringed with snowy pines and little lanterns'),
  B('R', 'r-scene-panda-chef', 150, 190, 30, 'scene', 'a happy giant panda in a chef hat cooking dumplings at a steaming bamboo steamer in a snug little noodle kitchen'),
  B('R', 'r-scene-duck-sailor', 150, 190, 28, 'scene', 'a cheerful duck in a striped sailor top and cap at the wheel of a little sailboat on a breezy blue sea with gulls and a lighthouse'),
  // ── beautiful florals + a bright bird (medium–large, richer palettes) ──
  B('R', 'r-floral-rose-bouquet', 150, 175, 34, 'bright', 'a romantic bouquet of red and cream roses with baby\'s breath tied with a ribbon'),
  B('R', 'r-floral-hydrangea-vase', 150, 170, 30, 'bright', 'a full bunch of blue and lilac hydrangeas in a white ceramic vase'),
  B('R', 'r-wre-wildflower-summer', 165, 165, 40, 'wreath', 'a lush summer wreath of mixed wildflowers — daisies, buttercups, red clover, cornflowers and grasses'),
  B('R', 'r-bright-robin-berries', 130, 150, 22, 'bright', 'a plump red-breasted robin perched on a snowy branch with red winter berries'),
  // ── HUGE detailed showpieces (XL, 150-brief → Flux 1.1 Pro, 100+ floss) ──
  B('R', 'r-big-fairytale-castle', 235, 220, 150, 'showpiece', 'a magnificent fairytale castle on a crag with soaring turrets and flags, a winding path and stone bridge, a waterfall, forests and a rainbow sky, intricate richly-coloured full coverage'),
  B('R', 'r-big-cherry-festival', 240, 220, 150, 'showpiece', 'a joyful spring cherry-blossom festival with paper lanterns, food stalls, a little shrine and a bridge over a stream, people in kimono and drifting pink petals, intricate full coverage'),
  B('R', 'r-big-christmas-parlour', 220, 245, 150, 'showpiece', 'a cosy Christmas living room at night with a decorated tree, wrapped presents, stockings on a glowing fireplace, garlands, a sleeping cat and softly lit windows, intricate warm full coverage'),
  B('R', 'r-big-mermaid-kingdom', 220, 245, 150, 'showpiece', 'a magical underwater mermaid kingdom with a coral palace, mermaids, seahorses, dolphins, treasure chests, glowing jellyfish and shafts of light, intricate jewel-toned full coverage'),

  // ─────────── BATCH S — same priorities: more deep-skin popart (sat:1.1), fabulous faces
  //             (fair, sat:1.0, bright FLAT lighting), animal-as-human scenes (NO red/orange
  //             fur), fantasy, florals + HUGE 100+ Flux-1.1-Pro showpieces. RANGE 11 → 120. ──
  // ── quick + simple small cuties (BEGINNER, ~11–16 colours) ──
  B('S', 's-cute-sloth-branch', 118, 118, 14, 'cute', 'an adorable smiling sloth hanging from a leafy branch, sweet clean face with both eyes symmetrical, clean pale background'),
  B('S', 's-cute-llama-flowers', 115, 122, 16, 'cute', 'a cute fluffy llama with a little garland of flowers around its neck, sweet clean face with both eyes symmetrical, clean white background'),
  B('S', 's-cute-hamster-seed', 112, 112, 13, 'cute', 'an adorable chubby-cheeked hamster nibbling a sunflower seed, sweet clean face with both eyes symmetrical, clean white background'),
  B('S', 's-cute-baby-owl', 112, 120, 14, 'cute', 'a tiny fluffy baby owl with big round eyes perched on a little branch, sweet clean face with both eyes symmetrical, clean white background'),
  B('S', 's-cute-dolphin-splash', 120, 112, 12, 'cute', 'a cheerful little dolphin leaping from sparkling blue water with a splash, both eyes symmetrical, clean pale background'),
  // ── fairies & fantasy (medium → large) ──
  B('S', 's-fantasy-pegasus-foal', 140, 160, 28, 'fantasy', 'a sweet baby pegasus foal with soft feathery wings standing in a cloud meadow of stars, soft dreamy pastel-and-jewel palette, a clear sweet face with both eyes symmetrical, crisp clean outlines'),
  B('S', 's-fantasy-gnome-mushroom', 130, 150, 26, 'fantasy', 'a jolly little garden gnome with a red pointed hat sitting on a spotted toadstool beside a snail, warm storybook light, a clear friendly face, crisp clean bold outlines, NOT muddy'),
  B('S', 's-fantasy-unicorn-night', 150, 170, 30, 'fantasy', 'a graceful unicorn with a starry mane rearing on a moonlit hilltop under a sky of constellations, deep indigo-and-silver jewel palette with soft glow, crisp clean outlines, NOT muddy'),
  B('S', 's-fantasy-dragon-egg-nest', 140, 160, 28, 'fantasy', 'two adorable baby dragons hatching from speckled eggs in a cosy straw nest, each dragon clearly defined with big friendly eyes and tiny wings, bold clean outlines, bright emerald-and-gold jewel tones, a simple clean uncluttered background, crisp and clear, NOT a chaotic jumble, NOT muddy'),
  B('S', 's-fantasy-fairy-teacup', 130, 150, 28, 'fantasy', 'a cute little fairy with luminous wings perched on the rim of a pretty flowered teacup, the fairy clearly defined with a sweet face and both eyes symmetrical, a couple of roses beside it, bold clean crisp high-contrast outlines, bright and clear, a simple clean uncluttered pale background, NOT hazy NOT washed-out NOT busy'),
  // ── pop art & portraits (popart — deep skin sat:1.1) ──
  B('S', 's-popart-cornrows-man', 150, 195, 20, 'popart', 'a handsome man with neat cornrows and a short beard, rich dark chocolate-brown skin (deep and clearly brown, absolutely not pink coral or orange), warm ochre background', 1.1),
  B('S', 's-popart-afropuff-woman', 150, 195, 20, 'popart', 'a beautiful woman with two big afro puffs and gold jewellery and bold lips, rich dark chocolate-brown skin (deep and clearly brown, absolutely not pink coral or orange), teal background', 1.1),
  B('S', 's-popart-curlybob-woman', 150, 195, 20, 'popart', 'an elegant woman with a chin-length curly bob and hoop earrings, deep brown skin in a natural believable tone (not orange), coral-pink background', 1.1),
  B('S', 's-popart-fedora-man', 150, 195, 20, 'popart', 'a cool man in a felt fedora and a roll-neck jumper, mid-brown skin in a natural believable tone, sage-green background'),
  B('S', 's-popart-turtleneck-woman', 150, 195, 18, 'popart', 'a chic woman with a sleek dark ponytail in a black turtleneck and bold red lips, fair skin in a natural believable tone, deep teal background'),
  // ── fabulous faces (artface — FAIR/PALE skin ONLY; sat:1.0, bright FLAT lighting) ──
  B('S', 's-face-peony-fair', 160, 205, 28, 'artface', 'a woman with fair skin and a crown of blush-pink peonies, a serene beautiful face in bright FLAT even studio lighting with NO grey contouring shadows, clean smooth matte even fair skin, the whole head and full forehead clearly visible above the brows, both eyes symmetrical, soft flat clean shading, no grey shadows or patches on the face, natural skin', 1.0),
  B('S', 's-face-forgetmenot-pale', 160, 205, 26, 'artface', 'a woman with pale skin and a crown of blue forget-me-nots and greenery, a serene beautiful face in bright FLAT even studio lighting with NO grey contouring shadows, clean smooth matte even skin, the whole head and full forehead clearly visible above the brows, both eyes symmetrical, soft flat clean shading, no grey patches on the face, natural skin', 1.0),
  B('S', 's-face-marigold-fair', 160, 205, 26, 'artface', 'a woman with fair skin and a crown of orange and yellow marigolds, a serene beautiful face in bright FLAT even studio lighting with NO grey contouring shadows, clean smooth matte even fair skin, the whole head and full forehead clearly visible above the brows, both eyes symmetrical, soft flat clean shading, no grey shadows or orange patches on the face, natural skin', 1.0),
  // ── animals doing human things, FULL SCENES (scene lane — NO red/orange fur) ──
  B('S', 's-scene-rabbit-painter', 150, 190, 30, 'scene', 'a cheerful white rabbit in a smock and beret painting a landscape at an easel in a bright sunny studio with canvases and paint pots'),
  B('S', 's-scene-bear-baker', 150, 190, 30, 'scene', 'a friendly brown bear in an apron and chef hat piping icing onto a tiered cake in a cosy bakery full of pastries and jars'),
  B('S', 's-scene-hedgehog-postman', 150, 190, 28, 'scene', 'a busy little hedgehog postman in a cap and satchel delivering letters along a cobbled village lane with cottages and flowerpots'),
  B('S', 's-scene-owl-teacher', 150, 190, 30, 'scene', 'a kindly owl schoolteacher in spectacles standing by a green chalkboard that has a simple chalk drawing of a smiling sun, a few stars and a flower on it (NO written words, NO letters, NO text at all), in a cosy little classroom with desks, books and a globe'),
  B('S', 's-scene-beaver-carpenter', 150, 190, 30, 'scene', 'a hardworking beaver in dungarees sawing wood at a workbench in a busy little carpentry workshop full of tools and timber'),
  // ── beautiful florals + a bright bird (medium–large, richer palettes) ──
  B('S', 's-floral-iris-vase', 150, 175, 32, 'bright', 'a striking bunch of purple and blue irises with green blades in a tall ceramic vase'),
  B('S', 's-floral-magnolia-branch', 150, 165, 26, 'bright', 'an elegant branch of pink and white magnolia blossom against a soft sky'),
  B('S', 's-wre-spring-blossom', 165, 165, 38, 'wreath', 'a fresh spring wreath of cherry blossom, tulips, daffodils and green leaves'),
  B('S', 's-bright-goldfinch-thistle', 130, 150, 22, 'bright', 'a bright yellow goldfinch perched on a purple thistle'),
  // ── HUGE detailed showpieces (XL, 150-brief → Flux 1.1 Pro, 100+ floss) ──
  B('S', 's-big-enchanted-forest', 235, 220, 150, 'showpiece', 'a magical enchanted forest at dusk with glowing lanterns and fairy lights strung between ancient twisted trees, toadstools, a little stream, deer and fireflies, intricate jewel-toned full coverage'),
  B('S', 's-big-paris-street', 220, 245, 150, 'showpiece', 'a charming Parisian street scene with a corner café, striped awnings, flower boxes, cyclists, the Eiffel Tower beyond and a golden-hour sky, intricate richly-coloured full coverage'),
  B('S', 's-big-cottage-garden', 240, 220, 150, 'showpiece', 'a glorious English cottage garden in full summer bloom with a thatched cottage, hollyhocks, roses climbing a trellis, a winding path, a birdbath and butterflies, intricate full coverage'),
  B('S', 's-big-safari-savanna', 240, 220, 150, 'showpiece', 'a sweeping African savanna at golden hour with elephants, giraffes, zebras and lions at a watering hole, acacia trees and a big warm sky, intricate richly-coloured full coverage'),

  // ─────────── BATCH T — timed reference batch (~10 gems, full range) for the cron cadence. ──
  B('T', 't-cute-baby-deer', 118, 118, 15, 'cute', 'an adorable spotted baby deer fawn sitting among ferns and a few flowers, sweet clean face with both eyes symmetrical, clean pale background'),
  B('T', 't-cute-chinchilla', 112, 115, 13, 'cute', 'an adorable fluffy grey chinchilla holding a tiny flower, clear soft outline so it reads on pale fabric, sweet clean face with both eyes symmetrical, clean white background'),
  B('T', 't-popart-headtie-man', 150, 195, 20, 'popart', 'a distinguished older man with a short grey beard and a woven kufi cap, rich dark chocolate-brown skin (deep and clearly brown, absolutely not pink coral or orange), warm ochre background', 1.1),
  B('T', 't-popart-beret-woman', 150, 195, 18, 'popart', 'a chic woman with a dark bob and a red beret and bold red lips, fair skin in a natural believable tone, teal background'),
  B('T', 't-face-bluebell-fair', 160, 205, 26, 'artface', 'a woman with fair skin and a crown of blue bluebells and greenery, a serene beautiful face in bright FLAT even studio lighting with NO grey contouring shadows, clean smooth matte even fair skin, the whole head and full forehead clearly visible above the brows, both eyes symmetrical, soft flat clean shading, no grey shadows or patches on the face, natural skin', 1.0),
  B('T', 't-fantasy-mermaid-moon', 150, 175, 30, 'fantasy', 'a graceful mermaid with fair skin and flowing teal hair sitting on a rock by a moonlit turquoise sea, bright luminous jewel colours, a clear pretty face with both eyes symmetrical, crisp clean bold outlines, bright and vivid, NOT dark NOT muddy'),
  B('T', 't-scene-mouse-baker', 150, 190, 28, 'scene', 'a sweet little grey mouse in an apron and chef hat icing tiny cupcakes at a floury counter in a cosy miniature bakery with jars and rolling pins'),
  B('T', 't-scene-cat-gardener', 150, 190, 30, 'scene', 'a happy grey tabby cat in a straw hat and apron watering flowers with a little watering can in a sunny cottage garden full of blooms and pots'),
  B('T', 't-floral-poppy-vase', 150, 175, 32, 'bright', 'a cheerful bunch of red and orange poppies with green foliage in a blue ceramic vase'),
  B('T', 't-big-alpine-village', 240, 220, 150, 'showpiece', 'a picturesque alpine village in summer with wooden chalets, flower-filled window boxes, a church steeple, a winding lane, cows in a meadow and snow-capped mountains behind, intricate richly-coloured full coverage'),
  B('T', 't-big-butterfly-meadow', 235, 220, 150, 'showpiece', 'a radiant summer wildflower meadow filled with butterflies of every colour, poppies, daisies, cornflowers and lavender under a bright blue sky, intricate saturated full coverage'),
  // ─────────── BATCH 07012204 (auto cron) ───────────
  B('07012204', 'b07012204-cute-koala-eucalyptus', 115, 120, 17, 'cute', 'an adorable fluffy grey koala clinging to a green eucalyptus branch, a bold clear dark-grey outline around the whole body so the grey koala reads clearly on pale fabric, two clearly separated round dark eyes and a distinct dark oval nose that do NOT merge into one blob, sweet round face with both eyes symmetrical, clean white background'),
  B('07012204', 'b07012204-cute-raccoon-acorn', 118, 118, 17, 'cute', 'an adorable little grey raccoon holding a tiny acorn in both paws, bushy ringed tail, sweet clean face with both eyes symmetrical, clean white background'),
  B('07012204', 'b07012204-cute-polar-bear-cub', 115, 120, 17, 'cute', 'an adorable fluffy white polar bear cub sitting on a bright blue ice floe with soft blue snow shadows, a bold clear dark grey-blue outline all around the body so the white fur reads clearly on pale fabric, cool blue-grey shading on the white fur, two clear dark eyes and a small black nose, sweet face with both eyes symmetrical'),
  B('07012204', 'b07012204-popart-goldturban-woman', 155, 200, 22, 'popart', 'an elegant woman with a bold gold turban and large hoop earrings, rich dark chocolate-brown skin (deep and clearly brown, absolutely not pink coral or orange), deep teal background', 1.1),
  B('07012204', 'b07012204-popart-flatcap-man', 150, 195, 20, 'popart', 'a handsome young man in a tweed flat cap with a light stubble, fair skin in a natural believable tone, mustard yellow background'),
  B('07012204', 'b07012204-face-dahlia-fair', 160, 205, 26, 'artface', 'a woman with fair skin and a crown of pink and coral dahlias with greenery, a serene beautiful face in bright FLAT even frontal studio lighting with absolutely NO grey or green contouring shadows, clean smooth matte even fair skin in a warm healthy tone, the whole head and full forehead clearly visible above the brows, both eyes symmetrical and bright with NO dark hollows underneath, soft flat even shading, no grey or green patches anywhere on the face or neck, natural clean skin', 1.0),
  B('07012204', 'b07012204-fantasy-fairy-swing', 150, 175, 30, 'fantasy', 'a sweet little fairy with fair skin and gossamer wings sitting on a flower-garland swing among bright blossoms, a clear well-defined pretty face with a sweet friendly expression and both eyes symmetrical and NORMAL-SIZED (not oversized, not huge black eyes), bright vivid luminous jewel colours, crisp clean BOLD high-contrast outlines, NOT muddy NOT hazy NOT washed-out'),
  B('07012204', 'b07012204-fantasy-seahorse-magic', 140, 165, 28, 'fantasy', 'a magical glowing seahorse with a curling tail drifting through a bright coral reef with luminous bubbles and sea flowers, vivid turquoise and pink jewel tones, crisp clean bold outlines, bright and vivid, NOT dark NOT muddy'),
  B('07012204', 'b07012204-scene-rabbit-florist', 150, 190, 30, 'scene', 'a sweet white rabbit in a striped apron arranging a bouquet of flowers in a cosy little flower shop with tin buckets of blooms, hanging plants and a wooden counter'),
  B('07012204', 'b07012204-scene-owl-astronomer', 150, 190, 28, 'scene', 'a wise brown owl in a pointed cap peering through a brass telescope on a hilltop at night, simple wordless chalk-drawn stars and a crescent moon in the sky, cosy and whimsical, no lettering'),
  B('07012204', 'b07012204-bright-blue-tit', 150, 165, 30, 'bright', 'a cheerful little blue tit with bright blue and yellow plumage perched on a pink blossom branch'),
  B('07012204', 'b07012204-big-lavender-farm', 240, 220, 150, 'showpiece', 'a picturesque Provence lavender farm in summer with long rows of purple lavender, a golden stone farmhouse, tall cypress trees, sunflowers, a little cart and rolling hills under a bright blue sky, intricate richly-coloured full coverage'),
  B('07012204', 'b07012204-big-hot-air-balloons', 235, 220, 150, 'showpiece', 'a festival of dozens of colourful striped hot air balloons floating over patchwork green fields, a winding river, a little village with red roofs and distant hills under a bright blue sky, intricate saturated full coverage'),
  // ─────────── BATCH 07020854 (auto cron) ───────────
  B('07020854', 'b07020854-cute-quokka-leaf', 116, 118, 17, 'cute', 'an adorable little brown quokka with a happy smiling face holding a green leaf in both paws, a bold clear dark outline around the whole body so it reads on pale fabric, two clearly separated round dark eyes and a small dark nose, sweet round face with both eyes symmetrical, clean white background'),
  B('07020854', 'b07020854-cute-wombat-flower', 116, 118, 16, 'cute', 'an adorable chubby grey-brown baby wombat sniffing a little pink flower, a bold clear dark outline around the whole body, two clear round dark eyes and a soft nose, sweet face with both eyes symmetrical, clean white background'),
  B('07020854', 'b07020854-cute-capybara-orange', 118, 118, 16, 'cute', 'an adorable calm brown capybara sitting in a warm bath with a little yellow rubber duck and a slice of orange on its head, a bold clear dark outline, two gentle dark eyes symmetrical, clean white background'),
  B('07020854', 'b07020854-popart-beads-woman', 155, 200, 22, 'popart', 'an elegant woman with short cropped natural hair and layered colourful beaded necklaces, rich dark chocolate-brown skin (deep and clearly brown, absolutely not pink coral or orange), warm terracotta background', 1.1),
  B('07020854', 'b07020854-popart-bob-blonde', 150, 195, 20, 'popart', 'a chic young woman with a sleek blonde bob and bold red lipstick, fair skin in a natural believable tone, dusty rose pink background'),
  B('07020854', 'b07020854-face-camellia-fair', 160, 205, 26, 'artface', 'a woman with fair skin and a crown of white and blush-pink camellias with glossy green leaves, a serene beautiful face in bright FLAT even frontal studio lighting with absolutely NO grey or green contouring shadows, clean smooth matte even fair skin in a warm healthy tone, the whole head and full forehead clearly visible above the brows, both eyes symmetrical and bright with NO dark hollows underneath, soft flat even shading, no grey or green patches anywhere on the face or neck, natural clean skin', 1.0),
  B('07020854', 'b07020854-fantasy-griffin-cub', 140, 160, 30, 'fantasy', 'a sweet fluffy baby griffin cub with a distinct white eagle head and small golden beak, soft brown feathered wings and a tawny lion body, sitting on green grass against a clear bright SKY-BLUE background so it stands out sharply, a clear well-defined friendly face with both eyes symmetrical and normal-sized, strong dark outline all around the body so it does not blend into the background, bright vivid HIGH-CONTRAST jewel colours, crisp clean BOLD outlines, NOT muddy NOT hazy NOT washed-out, NOT all one colour'),
  B('07020854', 'b07020854-fantasy-fairy-bee', 145, 170, 30, 'fantasy', 'a cheerful little garden fairy with fair skin and gossamer wings riding on the back of a friendly fuzzy bumblebee among giant bright daisies and bluebells, a clear well-defined pretty face with a sweet friendly expression and both eyes symmetrical and NORMAL-SIZED, bright vivid luminous jewel colours, crisp clean bold high-contrast outlines, NOT muddy NOT hazy'),
  B('07020854', 'b07020854-scene-mouse-cheese', 150, 190, 30, 'scene', 'a cheerful little grey mouse in a striped apron standing behind the counter of a cosy cheese shop stacked with round wheels and wedges of cheese, hanging herbs and a little scale, warm and whimsical, no lettering'),
  B('07020854', 'b07020854-scene-bear-beekeeper', 150, 190, 30, 'scene', 'a friendly brown bear beekeeper in a wide straw hat with netting and gloves gently tending a row of white and pastel beehives in a sunny flowery meadow with buzzing bees and wildflowers, warm and whimsical, no lettering'),
  B('07020854', 'b07020854-bright-wren-foxglove', 150, 170, 30, 'bright', 'a single small plump brown wren with a warm russet-brown body, pale speckled breast and a perky upturned tail, perched clearly on a slender stem to one side with a bold clean dark outline so the whole bird reads sharply and separately against a clean white background, one tall spire of soft pink and purple foxglove bell-flowers with green leaves beside it, the bird NOT overlapping or merging into the flowers, crisp and clear'),
  B('07020854', 'b07020854-wre-eucalyptus-berry', 155, 155, 34, 'wreath', 'a lush circular wreath of silvery-green eucalyptus leaves, red winterberries and small white blossoms evenly arranged around a clear open centre'),
  B('07020854', 'b07020854-big-moroccan-souk', 240, 220, 150, 'showpiece', 'a bustling Moroccan souk marketplace with colourful pyramids of spices, hanging metal lanterns, stacks of patterned rugs and pottery, keyhole archways, striped awnings and traders in robes, warm terracotta and jewel tones, intricate richly-coloured full coverage'),
  B('07020854', 'b07020854-big-tuscan-vineyard', 235, 220, 150, 'showpiece', 'a golden Tuscan vineyard at harvest time with long rows of grapevines, a warm stone villa with a terracotta roof, tall dark cypress trees, silvery olive groves, sunflowers and rolling hills under a bright blue sky, intricate saturated full coverage'),
  // ─────────── BATCH 07020918 (auto cron) ───────────
  B('07020918', 'b07020918-cute-badger-cub', 116, 118, 17, 'cute', 'an adorable little badger cub sitting up in green grass, a soft pale-grey rounded body with a bold clear dark outline all around it so it reads clearly on pale fabric, a clean white face with two bold black stripes, two clearly separated round dark eyes symmetrical and a distinct black nose that do NOT merge into the stripes or into one blob, sweet friendly face, clean white background, crisp and clear NOT muddy NOT hazy'),
  B('07020918', 'b07020918-cute-penguin-chick', 115, 120, 17, 'cute', 'an adorable fluffy grey baby penguin chick with a round downy body and a black-and-white face, standing on a bright blue ice floe, a bold clear dark grey-blue outline around the whole body so the pale chick reads clearly on pale fabric, two clear round dark eyes symmetrical and a small orange beak, sweet face, clean white background'),
  B('07020918', 'b07020918-cute-kitten-basket', 118, 118, 17, 'cute', 'an adorable fluffy grey tabby kitten peeking out of a cosy woven basket with a soft blanket, sweet round face with both eyes symmetrical, big bright eyes and a little pink nose, bright and cheerful, clean white background'),
  B('07020918', 'b07020918-popart-hoops-woman', 155, 200, 22, 'popart', 'an elegant woman with a neat rounded afro and large gold hoop earrings, her face large and clearly centred with correct human proportions, both eyes symmetrical and normal-sized, a defined nose and full lips, a calm serene expression, a smooth clear brown neck below the face, rich dark chocolate-brown skin (deep and clearly brown, absolutely not pink coral or orange), deep plum-purple background', 1.1),
  B('07020918', 'b07020918-popart-beanie-man', 150, 195, 20, 'popart', 'a handsome young man in a chunky knitted winter beanie with a short neat beard, fair skin in a natural believable tone, teal blue background'),
  B('07020918', 'b07020918-face-anemone-fair', 160, 205, 26, 'artface', 'a woman with fair skin and a crown of deep red and white anemones with dark centres and green foliage, a serene beautiful face in bright FLAT even frontal studio lighting with absolutely NO grey or green contouring shadows, clean smooth matte even fair skin in a warm healthy tone, the whole head and full forehead clearly visible above the brows, both eyes symmetrical and bright with NO dark hollows underneath, soft flat even shading, no grey or green patches anywhere on the face or neck, natural clean skin', 1.0),
  B('07020918', 'b07020918-fantasy-unicorn-meadow', 150, 175, 30, 'fantasy', 'a graceful white unicorn foal with a pastel rainbow mane and a golden horn standing in a sunny green flower meadow, a clear well-defined gentle face with both eyes symmetrical and NORMAL-SIZED, a STRONG bold dark outline around the whole white body and legs so it reads sharply and does not blend into the background, set against a bright blue sky, bright vivid HIGH-CONTRAST luminous colours, crisp clean BOLD outlines, NOT hazy NOT washed-out NOT muddy'),
  B('07020918', 'b07020918-fantasy-mermaid-shell', 145, 170, 30, 'fantasy', 'a pretty little mermaid with fair skin and a shimmering teal tail sitting on a large pink scallop shell in a bright coral reef with starfish and rising bubbles, a clear well-defined pretty face with a sweet friendly expression and both eyes symmetrical and NORMAL-SIZED, bright vivid turquoise and pink jewel tones, crisp clean bold high-contrast outlines, NOT muddy NOT hazy'),
  B('07020918', 'b07020918-scene-frog-fishing', 150, 190, 30, 'scene', 'a cheerful little green frog in dungarees and a straw hat sitting on a broad lily pad fishing with a bamboo rod in a sunny pond, cattails, dragonflies and pink water lilies around, warm and whimsical, no lettering'),
  B('07020918', 'b07020918-scene-mole-gardener', 150, 190, 30, 'scene', 'a friendly grey mole in dungarees and gardening gloves tending a neat vegetable patch with carrots, cabbages and tall sunflowers, a little red wheelbarrow and a watering can, cosy and whimsical, no lettering'),
  B('07020918', 'b07020918-wre-hydrangea-ring', 155, 155, 34, 'wreath', 'a lush circular wreath of blue and pink hydrangea blooms with green leaves and small sprigs of white gypsophila evenly arranged around a clear open centre'),
  B('07020918', 'b07020918-bright-nuthatch', 150, 170, 30, 'bright', 'a single plump blue-grey nuthatch bird with a black eye-stripe and warm buff underparts, perched clearly on ONE simple mossy branch across the lower part, a bold clean dark outline so the whole bird reads sharply against a clean plain white background, just two or three green leaves attached to that same branch, absolutely NO floating disconnected leaves and NO stray smudges anywhere, clean uncluttered composition, crisp and clear'),
  B('07020918', 'b07020918-big-desert-oasis', 240, 220, 150, 'showpiece', 'a lush desert oasis at golden hour with tall date palms around a clear blue pool, a caravan of camels, striped Bedouin tents, rolling sand dunes and a distant sandstone city under a warm glowing sky, intricate richly-coloured full coverage'),
  B('07020918', 'b07020918-big-mountain-lake-cabin', 235, 220, 150, 'showpiece', 'a serene mountain lake in autumn with a cosy log cabin, a wooden jetty and a little red canoe, tall pine and golden birch forest, snow-capped peaks and a clear mirror reflection in the still water, intricate saturated full coverage'),

  B('07021337', 'b07021337-cute-lamb', 116, 118, 16, 'cute', 'an adorable fluffy white baby lamb standing on a solid patch of bright green grass with a few little flowers, a soft creamy-white woolly body with a BOLD solid dark charcoal outline drawn clearly all the way around the entire body, head, ears and legs so the white lamb stands out crisply and high-contrast and does NOT blend or ghost into the pale background, a sweet grey face with two clearly separated round dark eyes symmetrical and a little pink nose, a small blue ribbon bow at its neck, plain white background, strong bold and crisp NOT washed-out NOT hazy NOT faded'),
  B('07021337', 'b07021337-cute-lop-bunny', 118, 118, 16, 'cute', 'an adorable fluffy grey lop-eared bunny sitting up in green grass, long soft floppy ears down each side, a rounded silver-grey body with a bold clear dark outline so it reads clearly on pale fabric, a sweet round face with both eyes symmetrical and a tiny pink nose, holding a little orange carrot, bright and cheerful, clean white background'),
  B('07021337', 'b07021337-cute-corgi-puppy', 118, 118, 17, 'cute', 'an adorable fluffy corgi puppy sitting and smiling with its tongue out, warm tan-and-white fur with a bold clear dark outline so it reads clearly on pale fabric, big upright ears, a sweet friendly face with both eyes symmetrical and a little black nose, a red collar for a spot of colour, bright and cheerful, clean white background'),
  B('07021337', 'b07021337-popart-gele-woman', 155, 200, 22, 'popart', 'an elegant woman wearing a tall bright orange-and-gold patterned gele head-wrap, her face large and clearly centred and filling the frame with correct human proportions, both eyes clearly drawn and symmetrical and normal-sized with visible dark-brown irises and pupils looking straight forward (absolutely NOT blank white eyes, NOT empty eye sockets), clearly drawn dark eyebrows, a clearly defined nose with a visible bridge and nostrils, defined full lips, all facial features clearly and boldly outlined and fully visible on the dark skin, a calm serene expression, a smooth clear brown neck below the face, rich dark chocolate-brown skin (deep and clearly brown, absolutely not pink coral or orange), deep teal-blue background', 1.1),
  B('07021337', 'b07021337-popart-redscarf-woman', 150, 195, 20, 'popart', 'a stylish young woman with softly waved auburn hair and a bright red winter scarf, a warm friendly smile, fair skin in a natural believable tone, mustard-yellow background'),
  B('07021337', 'b07021337-face-lavender-fair', 160, 205, 26, 'artface', 'a woman with fair skin and a crown of soft purple lavender sprigs and small white daisies with green foliage, a serene beautiful face in bright FLAT even frontal studio lighting with absolutely NO grey or green contouring shadows, clean smooth matte even fair skin in a warm healthy tone, the whole head and full forehead clearly visible above the brows, both eyes symmetrical and bright with NO dark hollows underneath, soft flat even shading, no grey or green patches anywhere on the face or neck, natural clean skin', 1.0),
  B('07021337', 'b07021337-fantasy-fairy-toadstool', 145, 175, 30, 'fantasy', 'a pretty little garden fairy with fair skin, delicate translucent wings and a green leaf dress sitting on a big red-and-white spotted toadstool in a sunny woodland glade with bluebells and buttercups, a clear well-defined pretty face with a sweet friendly expression and both eyes symmetrical and NORMAL-SIZED (not huge black eyes), bright vivid HIGH-CONTRAST luminous colours, crisp clean BOLD outlines, NOT hazy NOT washed-out NOT muddy'),
  B('07021337', 'b07021337-fantasy-baby-dragon', 140, 160, 28, 'fantasy', 'a cute chubby baby dragon with bright emerald-green scales, tiny wings and a friendly smile sitting on a pile of gold coins and gems in a sunny cave mouth, a clear well-defined face with both eyes symmetrical and NORMAL-SIZED, a STRONG bold dark outline around the whole body so it reads sharply, bright vivid jewel tones, crisp clean BOLD high-contrast outlines, NOT muddy NOT hazy NOT all-dark'),
  B('07021337', 'b07021337-scene-mouse-clockmaker', 150, 190, 30, 'scene', 'a friendly little grey mouse clockmaker in a leather apron and round spectacles, carefully mending an old brass pocket-watch at a cluttered wooden workbench with tiny cogs, tools and lit candle lanterns, warm and cosy and whimsical, no lettering'),
  B('07021337', 'b07021337-scene-owl-baker', 150, 190, 30, 'scene', 'a cheerful plump brown owl baker in a white apron and chef hat holding a wooden tray of golden loaves and buns in a cosy bakery with a stone oven, a rolling pin, flour sacks and hanging herbs, warm and whimsical, blank signs with no lettering'),
  B('07021337', 'b07021337-bright-bullfinch', 150, 170, 30, 'bright', 'a single plump bullfinch with a rosy-pink breast, black cap, grey back and a short dark beak, perched clearly on ONE simple branch to one side with a bold clean dark outline so the whole bird reads sharply against a clean plain white background, just two or three green leaves and a small cluster of red berries attached to that same branch, absolutely NO floating disconnected leaves and NO stray smudges, clean uncluttered composition, crisp and clear'),
  B('07021337', 'b07021337-big-japanese-garden', 240, 220, 150, 'showpiece', 'a tranquil Japanese garden in spring with a red arched moon bridge over a koi pond, blossoming pink cherry trees, a stone lantern, a wooden pagoda, raked gravel, purple wisteria and vivid maples reflected in the still water, intricate richly-coloured full coverage'),
  B('07021337', 'b07021337-big-cozy-bookshop', 235, 220, 150, 'showpiece', 'a cosy vintage bookshop interior with tall wooden shelves crammed with colourful books, a rolling ladder, a sleeping ginger-free grey cat on a windowsill, warm brass reading lamps, a comfy armchair, stacks of books and a steaming teapot, warm golden light, intricate saturated full coverage, blank book spines with no lettering'),
]

type FluxSize = 'square_hd' | 'landscape_4_3' | 'portrait_4_3'
export function imageSizeFor(w: number, h: number): FluxSize {
  if (w / h >= 1.25) return 'landscape_4_3'
  if (h / w >= 1.25) return 'portrait_4_3'
  return 'square_hd'
}

/** Pixel dims for Flux Pro, longest side 1440, chart aspect preserved, /16. */
export function proSizeFor(w: number, h: number): { width: number; height: number } {
  const round16 = (n: number) => Math.max(512, Math.round(n / 16) * 16)
  return w >= h
    ? { width: 1440, height: round16(1440 * (h / w)) }
    : { width: round16(1440 * (w / h)), height: 1440 }
}

async function fluxCached(dir: string, slug: string, prompt: string, size: FluxSize, regen: boolean): Promise<Buffer> {
  const p = resolve(dir, `${slug}.flux.png`)
  if (regen && existsSync(p)) rmSync(p)
  if (existsSync(p)) return readFileSync(p)
  const src = await fluxIllustration(prompt, { imageSize: size })
  writeFileSync(p, src.buffer)
  return src.buffer
}

/** Dense-tier source via Flux 1.1 Pro, cached separately so it never collides
 *  with a schnell `.flux.png`. The whole point of the dense tier is Pro's richer
 *  colour content; schnell plateaus ~88 stands, Pro reaches 100+. */
async function fluxProCached(dir: string, slug: string, prompt: string, w: number, h: number, regen: boolean): Promise<Buffer> {
  const p = resolve(dir, `${slug}.flux-pro.png`)
  if (regen && existsSync(p)) rmSync(p)
  if (existsSync(p)) return readFileSync(p)
  const src = await fluxIllustrationPro(prompt, proSizeFor(w, h))
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
      const dense = b.colours > 96
      const raw = dense
        ? await fluxProCached(dir, b.slug, b.prompt, b.w, b.h, regen)
        : await fluxCached(dir, b.slug, b.prompt, imageSizeFor(b.w, b.h), regen)
      // Dense showpiece tier (150-colour briefs): source from Flux 1.1 Pro (above) and
      // map into the full ~458-colour DMC range with the 96 ceiling lifted, so the brief
      // lands 100+ genuinely-distinct stands instead of re-merging onto the sparse curated
      // set. Pro's clean inference needs NO denoise (unlike 4-step schnell, whose grain
      // would confetti) — keeping every colour. confettiMin 'high' tidies stray singles.
      const img = await sharp(raw).modulate({ saturation: b.sat ?? SRC_SAT[b.style] }).png().toBuffer()
      const { data } = await photoToPatternData(img, { width: b.w, height: b.h, colours: b.colours, fabricCount: 14, brand: 'DMC', confettiMin: dense ? 'high' : 'medium', backgroundRemoval: false, ...(dense ? { maxColours: b.colours, flossRange: 'full' as const } : {}) })
      data.fabric.colourRgb = FABRIC
      const bb = stitchedBoundingBox(data)
      const mg = 2
      const region = bb ? { x: Math.max(0, bb.minX - mg), y: Math.max(0, bb.minY - mg), width: Math.min(data.grid.width, bb.maxX + 1 + mg) - Math.max(0, bb.minX - mg), height: Math.min(data.grid.height, bb.maxY + 1 + mg) - Math.max(0, bb.minY - mg) } : undefined
      const rw = region?.width ?? data.grid.width
      const cellPx = rw <= 70 ? 26 : rw <= 130 ? 16 : 10
      const colours = data.palette.length
      const svg = renderPatternSvgString(data, { mode: 'beauty', cellPx, showSymbols: false, showGrid: false, showCentreCrosshairs: false, padding: Math.round(cellPx * 0.8), region })
      // post-process saturation (matches the publish step) so floss reads vivid. A per-brief
      // `sat` override (skin-heavy portraits) skips this boost so skin stays true.
      await sharp(Buffer.from(svg)).modulate({ saturation: b.sat != null ? 1 : 1.3 }).resize(1000, 1000, { fit: 'inside' }).png().toFile(resolve(dir, `${b.slug}.render.png`))
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
