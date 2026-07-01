/**
 * Needlework illustration-guided engine — driver.
 *
 * Flux illustration -> `bitmapToStitches` (src/lib/needlework/illustration-engine, the
 * reusable pure core) -> loom `renderHero`. With `--publish` it persists end-to-end
 * through the SAME pipeline as needlework-seed-pattern.ts (Media + buildPatternDocument
 * + toStoredVectorData + NeedleworkPattern) so the design goes live on its page.
 *
 *   cd apps/web && npx tsx scripts/needlework-paint.ts <slug ...> [--none] [--publish] [--rerender]
 *
 * --none = frameless (else round->hoop). --publish = write to DB + R2 (UNLISTED house
 * pattern). Run from the MAIN checkout (needs node_modules + @homemade/db). Build-time
 * tooling: tsconfig-excluded. See NEEDLEWORK_ENGINE.md for the full process.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
function loadEnv(path: string): void {
  try { for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line)
    if (m && m[1] && !process.env[m[1]]) process.env[m[1]] = m[2]!.replace(/^["']|["']$/g, '')
  } } catch { /* shell env */ }
}
loadEnv('C:/Users/Rebecca/Projects/code/homemade/.env.credentials')

import sharp from 'sharp'
import { fluxIllustration } from '../src/lib/studio/generation/sources'
import { bitmapToStitches } from '../src/lib/needlework/illustration-engine'
import { buildPatternDocument } from '../src/lib/needlework/engine/document'
import { toStoredVectorData, type NeedleworkSurfacePattern } from '../src/lib/needlework/pattern'
import { renderHero } from './loom-render-hero'
import { r2UploadScript } from './import-lib/r2-script'

const OUT = resolve(process.cwd(), '../../.loom-scratch/needlework/paint')
const FABRIC = '#ece4d2'

interface Job {
  slug: string
  prompt: string
  name?: string
  description?: string
  widthMm?: number
  mode?: 'dense' | 'line'
  frame?: 'round' | 'square' | 'rect'
  tameWarm?: boolean
  detail?: boolean
  bleed?: boolean
}
const PLAIN = ', centered, filling the frame, plain pale cream background, no text, no border'
const DELICATE = ', thin clean dark outlines, soft watercolour colours, centered, plain off-white background, lots of negative space, no text'
const JOBS: Record<string, Job> = {
  fox: { slug: 'fox', name: 'Red Fox', description: 'A red fox sitting alert, worked in bold directional long-and-short fur.', prompt: 'a highly detailed naturalistic illustration of a single red fox sitting and facing forward, fluffy fur, bright amber eyes, bushy tail, soft woodland colours' + PLAIN, frame: 'rect', widthMm: 250 },
  peacock: { slug: 'peacock', name: 'Peacock in Full Display', description: 'A peacock with its tail fanned in iridescent blue, teal and gold — a symmetrical showpiece.', prompt: 'a stunning highly detailed illustration of a peacock with its tail fanned out, iridescent blue and teal and gold feathers with eye spots, ornate, symmetrical' + PLAIN, frame: 'round', widthMm: 280 },
  cat: { slug: 'cat', name: 'Sleeping Cat', description: 'A cosy ginger cat curled asleep, worked in soft long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a fluffy ginger cat curled up asleep, soft fur, cosy' + PLAIN, frame: 'square', widthMm: 240 },
  hare: { slug: 'hare', name: 'Brown Hare', description: 'A brown hare sitting alert in profile, with soft directional fur and whiskers.', prompt: 'a highly detailed naturalistic illustration of a brown hare sitting alert in profile, soft fur, long ears' + PLAIN, frame: 'round', widthMm: 200 },
  robin: { slug: 'robin', name: 'Robin & Berries', description: 'A plump robin on a berried twig, in soft long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a plump European robin perched on a twig with a few red berries, orange-red breast' + PLAIN, frame: 'round', widthMm: 165 },
  kingfisher: { slug: 'kingfisher', name: 'Kingfisher', description: 'A kingfisher in jewel-bright plumage — electric blue and copper, in fine thread painting.', prompt: 'a highly detailed naturalistic illustration of a kingfisher bird perched, vivid electric blue back and bright orange belly' + PLAIN, frame: 'rect', widthMm: 230 },
  cottage: { slug: 'cottage', name: 'Thatched Cottage Garden', description: 'A thatched English cottage with a lush flower garden — a full stitched scene.', prompt: 'a highly detailed naturalistic illustration of a thatched english cottage with a lush cottage flower garden, path and trees under a soft blue sky' + PLAIN, frame: 'rect', widthMm: 320 },
  peony: { slug: 'peony', name: 'Peony Bloom', description: 'A single blush-pink peony in soft, layered long-and-short shading on a hoop.', prompt: 'a highly detailed naturalistic illustration of a single large blush-pink peony bloom with soft layered petals and green leaves' + PLAIN, frame: 'round', widthMm: 150 },
  jar: { slug: 'jar', name: 'Wildflower Jar', description: 'A little jar of mixed wildflowers — poppies, cornflowers and daisies — in delicate thread painting on bare linen.', prompt: 'a simple delicate botanical illustration of a small glass mason jar holding a little bunch of mixed wildflowers, poppies cornflowers daisies' + DELICATE, mode: 'line', frame: 'rect', widthMm: 200 },
  sprig: { slug: 'sprig', name: 'Lavender Sprig', description: 'A few lavender stems and small wildflowers tied with twine — a delicate line motif on bare linen.', prompt: 'a simple delicate botanical illustration of three lavender stems and two small wildflowers tied with twine' + DELICATE, mode: 'line', frame: 'round', widthMm: 150 },
  facecrown: { slug: 'facecrown', name: 'Flower Crown', description: 'A fine-art portrait crowned with roses and poppies, in soft thread painting.', prompt: "a beautiful fine-art portrait illustration of a young woman's face looking forward, adorned with a lush crown of colourful flowers - roses, poppies and blooms - woven into her hair, soft painterly naturalistic style, warm skin tones, delicate facial features, gentle even lighting" + PLAIN, frame: 'rect', widthMm: 210, tameWarm: true, detail: true },
  dogwine: { slug: 'dogwine', name: 'Rosé Dachshund', description: 'A chic dachshund in heart sunglasses with a glass of rosé — a full stitched scene.', prompt: 'a whimsical fashionable painterly illustration of a dachshund dog wearing pink heart-shaped sunglasses, sitting at a little table with a glass of rosé wine and a stack of colourful books, hot pink room, bold and stylish, highly detailed, full scene filling the whole frame, no text', frame: 'rect', widthMm: 230, tameWarm: true, detail: true, bleed: true },
  // ---- 2026-06-30 batch: fresh subjects, new themes (generate + gate + cull) ----
  bee: { slug: 'bee', name: 'Bumblebee & Lavender', description: 'A fuzzy bumblebee resting on a lavender sprig, in soft long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a single fuzzy bumblebee resting on a sprig of purple lavender, soft striped velvety body, delicate translucent wings' + PLAIN, frame: 'round', widthMm: 165, detail: true },
  mushroomscene: { slug: 'mushroomscene', name: 'Toadstool Glade', description: 'A cluster of red-capped toadstools among moss and ferns — a dense woodland thread-painting.', prompt: 'a highly detailed naturalistic illustration of a cluster of red toadstool mushrooms with white spots, growing among soft green moss, ferns and tiny woodland flowers on the forest floor, rich and lush' + PLAIN, frame: 'round', widthMm: 190, tameWarm: true, detail: true },
  seaturtle: { slug: 'seaturtle', name: 'Sea Turtle', description: 'A green sea turtle gliding through teal water, worked in flowing long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a green sea turtle swimming, intricately patterned shell, flippers spread, soft teal and aqua water tones' + PLAIN, frame: 'round', widthMm: 200, detail: true },
  hollywreath: { slug: 'hollywreath', name: 'Holly Wreath', description: 'A festive wreath of holly, red berries and pinecones — a rich circular composition.', prompt: 'a highly detailed naturalistic illustration of a round christmas wreath made of glossy green holly leaves, clusters of red berries, pinecones and sprigs of eucalyptus, lush and full, circular' + PLAIN, frame: 'round', widthMm: 200, tameWarm: true, detail: true },
  bluetit: { slug: 'bluetit', name: 'Blue Tit', description: 'A single blue tit perched on a twig — a simple, bright garden-bird motif.', prompt: 'a highly detailed naturalistic illustration of a single blue tit bird perched on a small twig, bright blue cap and wings, yellow breast, white cheeks' + PLAIN, frame: 'round', widthMm: 150 },
  // ---- 2026-06-30 batch 2: new themes across the full range ----
  highlandcow: { slug: 'highlandcow', name: 'Highland Cow', description: 'A shaggy Highland cow with a flower crown — a rich, characterful showpiece.', prompt: 'a highly detailed naturalistic illustration of a highland cow with a long shaggy ginger fringe over its eyes, big curved horns, wearing a small crown of wildflowers' + PLAIN, frame: 'round', widthMm: 240, detail: true },
  whale: { slug: 'whale', name: 'Humpback Whale', description: 'A humpback whale gliding through sunlit ocean — a full underwater scene.', prompt: 'a beautiful painterly illustration of a humpback whale gliding through deep blue-green ocean water with rays of sunlight from above, small fish, full underwater scene filling the frame, no text', frame: 'rect', widthMm: 260, detail: true, bleed: true },
  goldenretriever: { slug: 'goldenretriever', name: 'Golden Retriever', description: 'A golden retriever head portrait in soft golden long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a golden retriever dog head and shoulders portrait, soft golden fur, warm brown eyes, gentle happy expression' + PLAIN, frame: 'round', widthMm: 200, detail: true, tameWarm: true },
  dragon: { slug: 'dragon', name: 'Baby Dragon', description: 'A cute baby dragon curled around a flower, in jewel-toned scales.', prompt: 'a cute friendly baby dragon curled up around a single flower, smooth jewel-toned green and teal scales, big friendly eyes, tiny wings, whimsical' + PLAIN, frame: 'round', widthMm: 180, detail: true },
  fairymushroom: { slug: 'fairymushroom', name: 'Toadstool Fairy', description: 'A little fairy resting on a red toadstool in a glowing twilight woodland — a full scene.', prompt: 'a whimsical painterly illustration of a small fairy with glowing translucent wings sitting on a red toadstool with white spots in a magical woodland clearing at dusk, soft purple and deep blue twilight sky, golden fireflies, tiny flowers and ferns, full scene filling the whole frame, no text, no border', frame: 'rect', widthMm: 210, detail: true, tameWarm: true, bleed: true },
  lighthouse: { slug: 'lighthouse', name: 'Cliffside Lighthouse', description: 'A red-and-white lighthouse on a cliff at dusk — a full coastal scene.', prompt: 'a painterly illustration of a red and white striped lighthouse on a rocky cliff at golden dusk, calm sea and a dramatic warm sky, full scene filling the frame, no text', frame: 'rect', widthMm: 240, detail: true, bleed: true },
  monstera: { slug: 'monstera', name: 'Monstera in a Pot', description: 'A potted monstera with glossy split leaves — a fresh houseplant motif.', prompt: 'a highly detailed illustration of a single compact potted monstera deliciosa houseplant in a terracotta pot, a few large glossy split green leaves gathered together, the whole plant centred with a generous plain empty margin all around it, plain pale cream background, no scattered loose leaves, no text, no border', frame: 'round', widthMm: 200, detail: true },
  pumpkins: { slug: 'pumpkins', name: 'Autumn Pumpkins', description: 'A cluster of autumn pumpkins and gourds with leaves and berries.', prompt: 'a highly detailed naturalistic illustration of a cluster of autumn pumpkins and gourds in orange, cream and pale green, with autumn leaves, rosehips and berries' + PLAIN, frame: 'round', widthMm: 210, detail: true },
  cupcake: { slug: 'cupcake', name: 'Frosted Cupcake', description: 'A single frosted cupcake with sprinkles — a simple, sweet motif.', prompt: 'a cute illustration of a single cupcake with swirled pink frosting, colourful sprinkles and a cherry on top' + PLAIN, frame: 'round', widthMm: 150, tameWarm: true },
  fernstem: { slug: 'fernstem', name: 'Fern Frond', description: 'A single fern frond worked in delicate line stitching on bare linen.', prompt: 'a simple delicate botanical illustration of a single green fern frond with fine leaflets' + DELICATE, mode: 'line', frame: 'round', widthMm: 150 },
  // ---- 2026-07-01 batch 3: new themes; scenes via bleed; avoid white-ground single subjects ----
  ragdoll: { slug: 'ragdoll', name: 'Ragdoll Cat', description: 'A fluffy ragdoll cat portrait with blue eyes, in soft long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a fluffy ragdoll cat portrait, striking blue eyes, soft cream and grey colourpoint fur, head and shoulders' + PLAIN, frame: 'round', widthMm: 220, detail: true },
  owl: { slug: 'owl', name: 'Barn Owl', description: 'A barn owl with a heart-shaped face, in fine feather thread painting.', prompt: 'a highly detailed naturalistic illustration of a barn owl with a heart-shaped white face, soft golden and white feathers, dark eyes, perched' + PLAIN, frame: 'round', widthMm: 200, detail: true },
  hedgehog: { slug: 'hedgehog', name: 'Autumn Hedgehog', description: 'A cute hedgehog among autumn leaves and a little mushroom.', prompt: 'a highly detailed naturalistic illustration of a cute hedgehog among autumn leaves with a small red mushroom, soft spines, warm autumn colours' + PLAIN, frame: 'round', widthMm: 170, detail: true },
  springbunny: { slug: 'springbunny', name: 'Spring Bunny', description: 'A fluffy brown rabbit among spring flowers — a fresh, cheerful piece.', prompt: 'a highly detailed naturalistic illustration of a fluffy brown rabbit sitting among spring daffodils, tulips and bluebells' + PLAIN, frame: 'round', widthMm: 200, detail: true },
  halloweencat: { slug: 'halloweencat', name: 'Halloween Cat', description: 'A black cat beside a glowing carved pumpkin — a charming Halloween motif.', prompt: 'a charming illustration of a black cat sitting beside a glowing carved jack-o-lantern pumpkin among autumn leaves' + PLAIN, frame: 'round', widthMm: 185, detail: true },
  moon: { slug: 'moon', name: 'Crescent Moon & Stars', description: 'A glowing crescent moon and stars on a deep night sky — a celestial scene.', prompt: 'a celestial illustration of a glowing golden crescent moon with scattered stars and wispy clouds on a deep navy blue night sky, full scene filling the frame, no text', frame: 'round', widthMm: 180, detail: true, bleed: true },
  butterfly: { slug: 'butterfly', name: 'Monarch Butterfly', description: 'A monarch butterfly resting on a coneflower, in rich long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a monarch butterfly with open orange and black wings resting on a pink coneflower' + PLAIN, frame: 'round', widthMm: 175, detail: true },
  strawberries: { slug: 'strawberries', name: 'Strawberries', description: 'A cluster of ripe strawberries with blossom and leaves — a sweet botanical.', prompt: 'a highly detailed naturalistic illustration of a small compact bunch of three ripe red strawberries tied together with a white blossom and a few green leaves, a single centred cluster with a generous empty margin all around it, plain pale cream background, no text, no border', frame: 'round', widthMm: 175, tameWarm: true, detail: true },
  ladybird: { slug: 'ladybird', name: 'Ladybird', description: 'A single ladybird on a leaf — a simple, bright little motif.', prompt: 'a simple cute illustration of a single red ladybird with black spots resting on a green leaf' + PLAIN, frame: 'round', widthMm: 140, tameWarm: true },
  singletulip: { slug: 'singletulip', name: 'Single Tulip', description: 'A single tulip on a stem, in soft long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a single pink tulip flower in full bloom, solid layered petals, on a green stem with two leaves' + PLAIN, frame: 'round', widthMm: 150, detail: true },
  mountainlake: { slug: 'mountainlake', name: 'Mountain Lake', description: 'A mountain lake at sunrise with mirrored peaks — a full landscape scene.', prompt: 'a serene painterly illustration of a mountain lake at sunrise, snow-capped peaks reflected in still water, pine trees along the shore, full scene filling the frame, no text', frame: 'rect', widthMm: 240, detail: true, bleed: true },
  // ---- 2026-07-01 batch 4: new themes (valentine/witchy/nursery) + deepened popular ----
  cockapoo: { slug: 'cockapoo', name: 'Cockapoo', description: 'A curly apricot cockapoo portrait, in soft long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a cockapoo dog head and shoulders portrait, curly soft apricot fur, dark shiny eyes, happy expression' + PLAIN, frame: 'round', widthMm: 210, detail: true, tameWarm: true },
  redsquirrel: { slug: 'redsquirrel', name: 'Red Squirrel', description: 'A red squirrel with an acorn among autumn colours.', prompt: 'a highly detailed naturalistic illustration of a red squirrel sitting holding an acorn, bushy tail, warm autumn colours' + PLAIN, frame: 'round', widthMm: 170, detail: true },
  peoniesbouquet: { slug: 'peoniesbouquet', name: 'Peony Bouquet', description: 'A lush bouquet of pink and white peonies — a dense floral showpiece.', prompt: 'a lush highly detailed naturalistic illustration of a full bouquet of pink and white peonies with green foliage, buds and layered petals' + PLAIN, frame: 'round', widthMm: 240, detail: true, tameWarm: true },
  seahorse: { slug: 'seahorse', name: 'Seahorse', description: 'A seahorse among coral and seagrass, in fine detail.', prompt: 'a highly detailed naturalistic illustration of a seahorse among colourful coral and seagrass, intricate patterned body' + PLAIN, frame: 'round', widthMm: 180, detail: true },
  valentineheart: { slug: 'valentineheart', name: 'Rose Heart', description: 'A heart made of red roses and pink flowers — a romantic floral motif.', prompt: 'a highly detailed illustration of a heart shape made of red roses, pink peonies and small flowers with green leaves, romantic, symmetrical' + PLAIN, frame: 'round', widthMm: 190, detail: true, tameWarm: true },
  babyelephant: { slug: 'babyelephant', name: 'Baby Elephant', description: 'A cute baby elephant with a balloon — a sweet nursery motif.', prompt: 'a cute cartoon illustration of a baby elephant sitting and holding a red heart balloon with its trunk, saturated soft periwinkle-blue body clearly darker than the background, bold dark charcoal outlines all around the body, big friendly dark eyes, rosy pink cheeks, simple, no sewing needle' + PLAIN, frame: 'round', widthMm: 180, detail: true },
  hummingbird: { slug: 'hummingbird', name: 'Hummingbird', description: 'A hummingbird at a trumpet flower, in iridescent thread painting.', prompt: 'a highly detailed naturalistic illustration of a hummingbird hovering at a red trumpet flower, iridescent green and blue feathers' + PLAIN, frame: 'round', widthMm: 175, detail: true },
  cherryblossom: { slug: 'cherryblossom', name: 'Cherry Blossom', description: 'A cherry blossom branch in soft pink — a delicate spring motif.', prompt: 'a delicate naturalistic illustration of a cherry blossom branch with soft pink blossoms and buds' + PLAIN, frame: 'round', widthMm: 190, detail: true, tameWarm: true },
  snowdrop: { slug: 'snowdrop', name: 'Snowdrop', description: 'A single snowdrop nodding on a stem, in soft shading.', prompt: 'a highly detailed naturalistic illustration of a single snowdrop flower nodding on a green stem with two leaves, white petals with distinct green-tipped markings, soft grey-green shading and a shadowed side so the white reads against a pale ground' + PLAIN, frame: 'round', widthMm: 150, detail: true },
  witchymoon: { slug: 'witchymoon', name: 'Cat & Moon', description: 'A black cat beneath a crescent moon and stars — a mystical night scene.', prompt: 'a mystical painterly illustration of a black cat silhouette sitting beneath a glowing crescent moon, stars and wispy clouds, deep purple night sky, full scene filling the frame, no text, no border', frame: 'rect', widthMm: 210, detail: true, bleed: true },
  lavenderfield: { slug: 'lavenderfield', name: 'Lavender Field', description: 'Rows of lavender at sunset — a full landscape scene.', prompt: 'a serene painterly illustration of a lavender field in provence at sunset, rows of purple lavender leading to a distant stone farmhouse, warm glowing sky, full scene filling the frame, no text, no border', frame: 'rect', widthMm: 240, detail: true, bleed: true },
  // ---- Batch 5 (2026-07-01): closes themes 29/30/31 + range spread simple line -> dense showpiece ----
  eucalyptussprig: { slug: 'eucalyptussprig', name: 'Eucalyptus Sprig', description: 'A eucalyptus sprig with rounded silver-green leaves — a soft botanical motif.', prompt: 'a highly detailed naturalistic illustration of a single eucalyptus sprig with clearly rounded silver-green leaves arranged in neat pairs along one slender brown stem, soft sage and dusty blue-green tones, clean and simple' + PLAIN, frame: 'round', widthMm: 165, detail: true },
  dandelionclock: { slug: 'dandelionclock', name: 'Dandelion Clock', description: 'A dandelion seed head on a green stem — a soft botanical motif.', prompt: 'a highly detailed naturalistic illustration of a single dandelion seed head clock, a soft round pom-pom made ENTIRELY of fluffy pale grey-white translucent seeds radiating from a small pale brown centre, no red, no orange, no petals, on one clean slender green stem, a few seeds drifting off to one side' + PLAIN, frame: 'round', widthMm: 165, detail: true, tameWarm: true },
  toadstoolsingle: { slug: 'toadstoolsingle', name: 'Red Toadstool', description: 'A single red-capped toadstool with white spots — a simple woodland motif.', prompt: 'a simple cute naturalistic illustration of a single red toadstool mushroom with white spots and a cream stem, a little grass at the base' + PLAIN, frame: 'round', widthMm: 150, tameWarm: true },
  teddybear: { slug: 'teddybear', name: 'Teddy Bear', description: 'A soft honey-brown teddy bear holding a heart — a sweet nursery motif.', prompt: 'a cute cartoon illustration of a soft honey-brown teddy bear sitting and holding a small pink heart, stitched button eyes, clear bold clean outlines, simple' + PLAIN, frame: 'round', widthMm: 180, detail: true },
  puffin: { slug: 'puffin', name: 'Puffin on the Cliffs', description: 'An Atlantic puffin on a grassy clifftop above the sea — a full coastal scene.', prompt: 'a naturalistic painterly illustration of a single atlantic puffin standing on a grassy clifftop dotted with pink sea-thrift flowers, black and white body, bright orange striped beak and orange feet, calm blue sea and soft sky behind, full scene filling the frame, no text, no border', frame: 'rect', widthMm: 220, detail: true, bleed: true },
  dragonfly: { slug: 'dragonfly', name: 'Dragonfly', description: 'A dragonfly with iridescent wings on a reed — in fine thread painting.', prompt: 'a highly detailed naturalistic illustration of a single dragonfly resting on a reed, iridescent teal and blue body, delicate translucent lacework wings' + PLAIN, frame: 'round', widthMm: 175, detail: true },
  artnouveauiris: { slug: 'artnouveauiris', name: 'Art Nouveau Iris', description: 'A stylised purple iris in the Art Nouveau manner — a heritage-inspired motif.', prompt: 'a stylised art nouveau illustration of a single purple iris flower with flowing curved stem and leaves, elegant decorative lines, muted heritage colours' + PLAIN, frame: 'round', widthMm: 180, detail: true },
  popartlady: { slug: 'popartlady', name: 'Pop-Art Lady', description: 'A bold stylised woman in a sunhat, in flat pop-art colour blocks — a graphic fashion portrait.', prompt: 'a bold graphic pop-art illustration of a stylised elegant woman wearing a wide red sunhat and cat-eye sunglasses, flat blocks of bright colour, strong clean outlines, teal background, full composition filling the frame, no text, no border', frame: 'square', widthMm: 200, detail: true, bleed: true },
  macaw: { slug: 'macaw', name: 'Scarlet Macaw', description: 'A scarlet macaw in vivid red, blue and gold plumage — a bright showpiece.', prompt: 'a stunning highly detailed naturalistic illustration of a scarlet macaw parrot perched on a branch, vivid scarlet red body, bright blue and gold wings, ornate feather detail' + PLAIN, frame: 'round', widthMm: 250, detail: true, tameWarm: true },
  stag: { slug: 'stag', name: 'Red Deer Stag', description: 'A majestic red deer stag with full antlers among autumn bracken — a rich showpiece.', prompt: 'a majestic highly detailed naturalistic illustration of a red deer stag head and shoulders with large branching antlers, rich russet-brown fur, standing among golden autumn bracken and heather' + PLAIN, frame: 'round', widthMm: 250, detail: true },
  hydrangea: { slug: 'hydrangea', name: 'Hydrangea Bloom', description: 'A full blue and lilac hydrangea head with leaves — a dense floral showpiece.', prompt: 'a lush highly detailed naturalistic illustration of one single round hydrangea flower head packed with tiny blue lilac and violet florets, with a few broad green leaves below it, the whole plant centered small with a generous clear margin of empty space all around it, nothing touching the edges, plain pale cream background, no text, no border', frame: 'round', widthMm: 210, detail: true },
  // ---- Batch 6 (2026-07-01): full range across new themes (simple pet -> XL floral/wreath showpieces) ----
  guineapig: { slug: 'guineapig', name: 'Guinea Pig', description: 'A little agouti guinea pig sitting — a simple, sweet pet motif.', prompt: 'a cute naturalistic illustration of a single small agouti brown guinea pig sitting facing forward, soft brown and tan fur, dark eyes, a single centred subject with a generous clear margin all around it' + PLAIN, frame: 'round', widthMm: 150, detail: true },
  labrador: { slug: 'labrador', name: 'Golden Labrador', description: 'A yellow Labrador head portrait in soft golden long-and-short shading.', prompt: 'a highly detailed naturalistic illustration of a yellow labrador dog head and shoulders portrait, soft golden coat, warm brown eyes, gentle happy expression' + PLAIN, frame: 'round', widthMm: 200, detail: true, tameWarm: true },
  mainecoon: { slug: 'mainecoon', name: 'Maine Coon', description: 'A majestic Maine Coon cat portrait with tufted ears and a full ruff — a rich showpiece.', prompt: 'a highly detailed photorealistic illustration of a classic brown tabby maine coon cat head and shoulders portrait, long flowing brown and cream fur with natural black tabby striping, tufted ears, full ruff, calm green eyes, a small dark brown-black nose, realistic domestic cat colouring, absolutely no red markings, no red or pink patches on the face, no face paint' + PLAIN, frame: 'round', widthMm: 220, detail: true, tameWarm: true },
  rooster: { slug: 'rooster', name: 'Rooster', description: 'A proud rooster in iridescent plumage — a rich, colourful farmyard portrait.', prompt: 'a highly detailed naturalistic illustration of a proud rooster standing, iridescent green and copper tail feathers, golden neck hackles, bright red comb and wattle, ornate plumage detail' + PLAIN, frame: 'round', widthMm: 210, detail: true },
  goldfinch: { slug: 'goldfinch', name: 'Goldfinch on a Thistle', description: 'A goldfinch perched on a purple thistle, in fine feather thread painting.', prompt: 'a highly detailed naturalistic illustration of a european goldfinch perched on a purple thistle, red face, gold wing bars, brown and cream body, delicate' + PLAIN, frame: 'round', widthMm: 165, detail: true, tameWarm: true },
  lunamoth: { slug: 'lunamoth', name: 'Luna Moth', description: 'A luna moth with full pale-green wings and eyespots — delicate specimen thread painting.', prompt: 'a highly detailed naturalistic illustration of a luna moth with full spread wings, soft sea-green wings with distinct pink-purple eyespots and dark maroon wing borders and veining, long tapering tails, resting on a small brown twig' + PLAIN, frame: 'round', widthMm: 185, detail: true },
  narwhal: { slug: 'narwhal', name: 'Narwhal', description: 'A friendly narwhal with a single spiralled tusk — a sweet, simple sea motif.', prompt: 'a cute simple naturalistic illustration of a single friendly narwhal in clean side profile, one smooth torpedo-shaped blue-grey body with a pale underside, ONE single long straight spiralled ivory tusk pointing forward from the tip of its snout, one small friendly eye, a gently curved tail fluke, clear bold clean outlines, no extra horns, no flowers' + PLAIN, frame: 'round', widthMm: 175, detail: true },
  phoenix: { slug: 'phoenix', name: 'Phoenix', description: 'A mythical phoenix with fiery plumage and a long flame tail — a vivid fantasy motif.', prompt: 'a striking illustration of a mythical phoenix bird with wings spread, vivid scarlet red, orange and gold flame-like feathers and a long trailing tail of fire, glowing, ornate feather detail' + PLAIN, frame: 'round', widthMm: 190, detail: true },
  sunflower: { slug: 'sunflower', name: 'Sunflower', description: 'A single sunflower with a textured seed head — a bright, cheerful bloom.', prompt: 'a highly detailed naturalistic illustration of a single large classic sunflower in full bloom facing forward, bright golden-yellow petals, one large round dark brown seed-head centre, green leaves and stem, pure yellow petals with no pink and no coral, a dark brown centre not a green centre' + PLAIN, frame: 'round', widthMm: 200, detail: true, tameWarm: true },
  cottagegardenmix: { slug: 'cottagegardenmix', name: 'Cottage Garden Bouquet', description: 'A lush overflowing English cottage-garden bouquet — roses, delphiniums, foxgloves and sweet peas, a dense floral showpiece.', prompt: 'a lush highly detailed naturalistic illustration of an overflowing english cottage garden bouquet with pink and cream roses, tall blue delphiniums, pink foxgloves, sweet peas, nigella and green foliage, layered overlapping blooms, rich and full' + PLAIN, frame: 'round', widthMm: 260, detail: true, tameWarm: true },
  englishroseswreath: { slug: 'englishroseswreath', name: 'English Roses Wreath', description: 'A full circular wreath of English roses, buds and leaves — a dense romantic showpiece.', prompt: 'a lush highly detailed naturalistic illustration of a round wreath made of blush pink and cream english garden roses, rosebuds and green leaves, full and dense, circular, clean open centre' + PLAIN, frame: 'round', widthMm: 240, detail: true, tameWarm: true },
}

function flag(name: string): boolean { return process.argv.includes(`--${name}`) }
function titleCase(s: string): string { return s.replace(/(^|-)([a-z])/g, (_, p, c) => (p ? ' ' : '') + c.toUpperCase()) }

async function fluxCached(job: Job): Promise<Buffer> {
  mkdirSync(OUT, { recursive: true })
  const p = resolve(OUT, `${job.slug}.flux.png`)
  if (existsSync(p)) return readFileSync(p)
  const src = await fluxIllustration(job.prompt, { imageSize: 'square_hd' })
  writeFileSync(p, src.buffer)
  return src.buffer
}

async function run(job: Job): Promise<void> {
  const publish = flag('publish')
  const refreshDoc = flag('refresh-doc')
  const frameless = flag('none')
  const img = await fluxCached(job)
  const WORK = 460
  const { data, info } = await sharp(img).resize(WORK, WORK, { fit: 'inside' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })

  const engineFrame = frameless ? 'none' : (job.frame === 'round' ? 'round' : job.frame ?? 'round')
  const { stitchedElements, frameType, finishedSizeMm, outline } = bitmapToStitches(data, info.width, info.height, {
    mode: job.mode, frame: engineFrame, bleed: job.bleed, detail: job.detail, widthMm: job.widthMm,
  })
  console.log(`[${job.slug}] ${job.mode ?? 'dense'} · ${frameType} · ${stitchedElements.length} stitches · ${outline.length} outline paths · ${Math.round(finishedSizeMm.width)}x${Math.round(finishedSizeMm.height)}mm`)

  // --refresh-doc: rebuild the document + outline + vectorData on the EXISTING
  // row and re-store, WITHOUT re-rendering the hero. The engine is deterministic
  // from the cached Flux image, so the stored hero still matches these elements.
  if (refreshDoc) {
    const { prisma } = await import('@homemade/db')
    const existing = await prisma.needleworkPattern.findUnique({ where: { slug: job.slug }, select: { id: true } })
    if (!existing) throw new Error(`no NeedleworkPattern row for slug "${job.slug}" — publish it first`)
    const name = job.name ?? titleCase(job.slug)
    const canonical: NeedleworkSurfacePattern = {
      stitchedElements, finishedSizeMm, fabricSpec: { material: 'linen', colourHex: FABRIC, count: null },
      defaultThread: { type: 'stranded-cotton', weight: '3-strand' }, frameType, outline,
    }
    const document = buildPatternDocument(stitchedElements, finishedSizeMm, { title: name, outline })
    const { vectorData, regionAnnotations } = toStoredVectorData(canonical, { document })
    await prisma.needleworkPattern.update({
      where: { id: existing.id },
      data: {
        vectorData: vectorData as unknown as object,
        regionAnnotations: regionAnnotations as unknown as object,
        colourCount: document.flossKey.length,
      },
    })
    console.log(`[${job.slug}] REFRESHED doc on NeedleworkPattern ${existing.id} — ${document.flossKey.length} colours, ${outline.length} outline paths (hero untouched)`)
    await prisma.$disconnect()
    return
  }

  const hero = await renderHero(
    { name: job.slug, stitchedElements, finishedSizeMm, fabricHex: FABRIC, frameType,
      defaultThread: { type: 'stranded-cotton', weight: '3-strand' }, strands: 3 },
    { persist: publish, tameWarm: job.tameWarm ?? false, r2Prefix: 'patterns/needlework' },
  )

  if (!publish) {
    const { publicUrl } = await r2UploadScript(readFileSync(hero.localHeroPath), 'image/png', { prefix: 'scratch-review' })
    console.log(`[${job.slug}] preview: ${publicUrl}`)
    return
  }

  // ---- publish: persist through the proven NeedleworkPattern pipeline ----
  const { prisma, Visibility } = await import('@homemade/db')
  if (!hero.r2) throw new Error('renderHero did not persist to R2')
  // File into the surface-embroidery shelf. The live needlework category grid
  // only shows rows with a sub-category in the needlework category
  // (pattern-layout.tsx needleworkWhere) — an unfiled row is invisible on-site.
  const nwCat = await prisma.category.findUnique({ where: { slug: 'needlework' }, select: { id: true } })
  const nwSub = nwCat ? await prisma.subCategory.findFirst({ where: { categoryId: nwCat.id, slug: 'surface-embroidery' }, select: { id: true } }) : null
  if (!nwSub) throw new Error('surface-embroidery sub-category not found for needlework')
  const name = job.name ?? titleCase(job.slug)
  const meta = await sharp(hero.localHeroPath).metadata()
  const media = await prisma.media.create({
    data: {
      type: 'PHOTO', mimeType: 'image/png', filename: `${job.slug}-hero.png`,
      alt: `${name} — finished embroidery`, width: meta.width ?? hero.width, height: meta.height ?? hero.height,
      bytes: readFileSync(hero.localHeroPath).length, status: 'READY', r2Key: hero.r2.key,
      source: 'loom-render', requiresAttribution: false,
    },
    select: { id: true },
  })
  const canonical: NeedleworkSurfacePattern = {
    stitchedElements, finishedSizeMm, fabricSpec: { material: 'linen', colourHex: FABRIC, count: null },
    defaultThread: { type: 'stranded-cotton', weight: '3-strand' }, frameType, outline,
  }
  const document = buildPatternDocument(stitchedElements, finishedSizeMm, { title: name, outline })
  const { vectorData, regionAnnotations } = toStoredVectorData(canonical, { document })
  const data2 = {
    slug: job.slug, name, description: job.description ?? null,
    discipline: 'SURFACE_EMBROIDERY' as never, patternFormat: 'SURFACE_VECTOR' as never,
    vectorData: vectorData as unknown as object, regionAnnotations: regionAnnotations as unknown as object,
    fabricSpec: canonical.fabricSpec as unknown as object,
    frameType: (frameType === 'NONE' ? null : frameType) as never,
    threadTypes: ['stranded-cotton'], colourCount: document.flossKey.length,
    difficulty: 'INTERMEDIATE' as never, heroMediaId: media.id, thumbnailMediaId: media.id,
    subCategoryId: nwSub.id,
    visibility: Visibility.UNLISTED, publishedAt: new Date(),
  }
  const pattern = await prisma.needleworkPattern.upsert({ where: { slug: job.slug }, create: data2, update: data2, select: { id: true } })
  console.log(`[${job.slug}] PUBLISHED NeedleworkPattern ${pattern.id} (UNLISTED) — ${document.flossKey.length} colours`)
  console.log(`[${job.slug}] live at /needlework/patterns/${job.slug}`)
  await prisma.$disconnect()
}

async function main(): Promise<void> {
  const want = process.argv.slice(2).filter((a) => !a.startsWith('--'))
  for (const slug of (want.length ? want : ['fox'])) { const j = JOBS[slug]; if (!j) { console.error('no job', slug); continue } await run(j) }
}
main().catch((e) => { console.error('FAILED:', e instanceof Error ? (e.stack ?? e.message) : String(e)); process.exit(1) })
