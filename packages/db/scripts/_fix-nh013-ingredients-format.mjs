/**
 * Convert bulletList Ingredients sections in all 42 nh013 brief files
 * to proper ingredientsList blocks with valid ingredientSlug values.
 *
 * Run with: node scripts/_fix-nh013-ingredients-format.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BRIEFS_DIR = resolve(__dirname, '../../../docs/natural-home-bulk-013-briefs')

// Complete ingredient mappings for all 42 files
const INGREDIENT_MAP = {
  'arnica-bruise-balm.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'arnica-flowers-dried', amount: 10, unit: 'g', isOptional: false, prepNote: 'dried Arnica montana flowers; for infusing into the carrier oil' },
      { ingredientSlug: 'calendula-flowers-dried', amount: 10, unit: 'g', isOptional: false, prepNote: 'dried calendula petals; infused alongside the arnica' },
      { ingredientSlug: 'sunflower-oil', amount: 100, unit: 'g', isOptional: false, prepNote: 'carrier oil for infusing both herbs; yields ~80 g strained oil' },
      { ingredientSlug: 'beeswax-pellets', amount: 20, unit: 'g', isOptional: false, prepNote: 'yellow cosmetic-grade beeswax; sets the infused oil into a firm balm' },
    ],
  },

  'beeswax-lavender-solid-perfume.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'beeswax-pellets', amount: 3, unit: 'g', isOptional: false, prepNote: 'white cosmetic-grade beeswax; 30% of formula' },
      { ingredientSlug: 'jojoba-oil', amount: 5.5, unit: 'g', isOptional: false, prepNote: '55% of formula; conditioning base' },
      { ingredientSlug: 'essential-oil-lavender', amount: 1.3, unit: 'g', isOptional: false, prepNote: 'Lavandula angustifolia; 13% of formula' },
      { ingredientSlug: 'vanilla-absolute', amount: 0.2, unit: 'g', isOptional: false, prepNote: 'or CO2 extract; 2% of formula; warm gently before weighing' },
    ],
  },

  'beeswax-lip-balm.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'beeswax-pellets', amount: 5, unit: 'g', isOptional: false, prepNote: 'yellow or white cosmetic-grade beeswax' },
      { ingredientSlug: 'sweet-almond-oil', amount: 12, unit: 'g', isOptional: false, prepNote: 'conditioning carrier oil' },
      { ingredientSlug: 'castor-oil', amount: 3, unit: 'g', isOptional: false, prepNote: 'gives shine and helps the balm adhere to lips' },
      { ingredientSlug: 'essential-oil-peppermint', amount: 0.2, unit: 'g', isOptional: false, prepNote: '1% of total weight; cool tingling effect' },
    ],
  },

  'beeswax-orange-peel-pillar.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'beeswax-pellets', amount: 200, unit: 'g', isOptional: false, prepNote: 'yellow cosmetic-grade beeswax pastilles or grated block; beeswax needs no added fragrance' },
      { ingredientSlug: 'candle-wick-square4', amount: 1, unit: 'unit', isOptional: false, prepNote: 'square-braided beeswax wick sized for 6 cm diameter pillar; cut to mould height plus 5 cm' },
      { ingredientSlug: 'dried-orange-peel', amount: 10, unit: 'g', isOptional: true, prepNote: 'thin-sliced dried sweet orange peel for surface decoration; press into wax before final set' },
    ],
  },

  'beeswax-tealights.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'beeswax-pellets', amount: 200, unit: 'g', isOptional: false, prepNote: 'yellow or white beeswax pastilles or grated block; fills approximately 12 tealight cups' },
      { ingredientSlug: 'candle-wick-pretabbed', amount: 12, unit: 'unit', isOptional: false, prepNote: 'pre-tabbed tealight wicks in aluminium cups; sized for standard 38 mm tealight cups' },
    ],
  },

  'bergamot-vetiver-room-spray.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'perfumers-alcohol', amount: 25, unit: 'ml', isOptional: false, prepNote: '96% ethanol; dissolves the essential oils and dries quickly' },
      { ingredientSlug: 'essential-oil-bergamot', amount: 2.1, unit: 'g', isOptional: false, prepNote: '70% of essential oil total; 3% of total spray' },
      { ingredientSlug: 'essential-oil-vetiver', amount: 0.9, unit: 'g', isOptional: false, prepNote: '30% of essential oil total; 1% of total spray; earthy fixative' },
      { ingredientSlug: 'distilled-water', amount: 72, unit: 'ml', isOptional: false, prepNote: 'added last; shake before each use' },
    ],
  },

  'carpet-deodoriser-powder.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'bicarbonate-of-soda', amount: 170, unit: 'g', isOptional: false, prepNote: '85% of formula; odour-absorbing base' },
      { ingredientSlug: 'arrowroot-powder', amount: 30, unit: 'g', isOptional: false, prepNote: '15% of formula; cornflour or arrowroot; prevents clumping' },
      { ingredientSlug: 'essential-oil-lavender', amount: 0.8, unit: 'g', isOptional: false, prepNote: 'approx. 20 drops; stir in before sealing container' },
      { ingredientSlug: 'essential-oil-tea-tree', amount: 0.4, unit: 'g', isOptional: false, prepNote: 'approx. 10 drops; antimicrobial support' },
    ],
  },

  'carrot-turmeric-soap.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'olive-oil', amount: 450, unit: 'g', isOptional: false, prepNote: '50% of oil weight; pure (not extra virgin); conditioning base' },
      { ingredientSlug: 'coconut-oil', amount: 360, unit: 'g', isOptional: false, prepNote: '40% of oil weight; melt gently; hardness and lather' },
      { ingredientSlug: 'castor-oil', amount: 90, unit: 'g', isOptional: false, prepNote: '10% of oil weight; stabilises lather' },
      { ingredientSlug: 'sodium-hydroxide', amount: 135, unit: 'g', isOptional: false, prepNote: 'NaOH at 99% purity; calculated for 5% superfat; always add lye to liquid' },
      { ingredientSlug: 'carrot-juice', amount: 270, unit: 'g', isOptional: false, prepNote: 'fresh; freeze to a slush before use to control heat spike; provides beta-carotene colour' },
      { ingredientSlug: 'turmeric-powder', amount: 4.5, unit: 'g', isOptional: false, prepNote: '0.5% of oil weight; stirred in at trace; adds warm golden colour' },
    ],
  },

  'coconut-wax-jasmine-candle.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'coconut-wax', amount: 160, unit: 'g', isOptional: false, prepNote: 'container grade; melt point 45-50°C' },
      { ingredientSlug: 'fragrance-oil-jasmine', amount: 12, unit: 'g', isOptional: false, prepNote: '7.5% of wax weight; add when wax is at 60°C' },
      { ingredientSlug: 'candle-wick-pretabbed', amount: 1, unit: 'unit', isOptional: false, prepNote: 'pre-tabbed cotton wick slightly smaller than soy equivalent for 7 cm jar' },
    ],
  },

  'coconut-wax-rose-geranium-votive.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'coconut-wax', amount: 180, unit: 'g', isOptional: false, prepNote: 'votive/pillar grade; melt point 45-50°C; pour at 50-55°C' },
      { ingredientSlug: 'essential-oil-rose-geranium', amount: 6.5, unit: 'g', isOptional: false, prepNote: 'Pelargonium graveolens; 60% of essential oil blend; 3.6% of wax weight' },
      { ingredientSlug: 'essential-oil-rose', amount: 4.3, unit: 'g', isOptional: false, prepNote: 'rose absolute or rose fragrance oil; 40% of blend; 2.4% of wax weight' },
      { ingredientSlug: 'candle-wick-pretabbed', amount: 4, unit: 'unit', isOptional: false, prepNote: 'pre-tabbed wicks for votive moulds; one per votive' },
    ],
  },

  'geranium-lime-linen-spray.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'perfumers-alcohol', amount: 15, unit: 'ml', isOptional: false, prepNote: '96% ethanol; fixes the scent and dries without residue' },
      { ingredientSlug: 'essential-oil-rose-geranium', amount: 1.2, unit: 'g', isOptional: false, prepNote: 'Pelargonium graveolens; 60% of essential oil total; 1.2% of spray' },
      { ingredientSlug: 'essential-oil-lime', amount: 0.8, unit: 'g', isOptional: false, prepNote: 'steam-distilled, not cold-pressed; 40% of essential oil total' },
      { ingredientSlug: 'distilled-water', amount: 83, unit: 'ml', isOptional: false, prepNote: 'added last; shake before each use' },
    ],
  },

  'honey-oat-face-mask.json': {
    defaultServings: 2,
    items: [
      { ingredientSlug: 'colloidal-oatmeal', amount: 18, unit: 'g', isOptional: false, prepNote: 'approx. 2 tbsp; or rolled oats blitzed to fine powder in a blender' },
      { ingredientSlug: 'raw-honey', amount: 21, unit: 'g', isOptional: false, prepNote: 'approx. 1 tbsp; natural humectant and antimicrobial' },
      { ingredientSlug: 'plain-yoghurt', amount: 15, unit: 'g', isOptional: false, prepNote: 'approx. 1 tbsp; whole milk; adds mild lactic acid for texture' },
    ],
  },

  'lard-olive-bar-soap.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'lard', amount: 540, unit: 'g', isOptional: false, prepNote: 'rendered pork lard; 60% of oil weight; gives a dense, white, conditioning bar' },
      { ingredientSlug: 'olive-oil', amount: 360, unit: 'g', isOptional: false, prepNote: 'pure (not extra virgin); 40% of oil weight; adds conditioning slip' },
      { ingredientSlug: 'sodium-hydroxide', amount: 122, unit: 'g', isOptional: false, prepNote: 'NaOH at 99% purity; calculated for 5% superfat; add lye to water, never water to lye' },
      { ingredientSlug: 'distilled-water', amount: 290, unit: 'g', isOptional: false, prepNote: '32% of oil weight; the lye solution liquid' },
    ],
  },

  'lavender-kaolin-clay-soap.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'olive-oil', amount: 405, unit: 'g', isOptional: false, prepNote: 'pure (not extra virgin); 45% of oil weight; conditioning base' },
      { ingredientSlug: 'coconut-oil', amount: 360, unit: 'g', isOptional: false, prepNote: '40% of oil weight; lather and hardness' },
      { ingredientSlug: 'castor-oil', amount: 135, unit: 'g', isOptional: false, prepNote: '15% of oil weight; high castor for conditioning, stabilises lather' },
      { ingredientSlug: 'sodium-hydroxide', amount: 135, unit: 'g', isOptional: false, prepNote: 'NaOH at 99% purity; calculated for 5% superfat' },
      { ingredientSlug: 'distilled-water', amount: 288, unit: 'g', isOptional: false, prepNote: '32% of oil weight; the lye solution liquid' },
      { ingredientSlug: 'essential-oil-lavender', amount: 27, unit: 'g', isOptional: false, prepNote: '3% of oil weight; stir in at trace, not blended in' },
      { ingredientSlug: 'kaolin-clay', amount: 10, unit: 'g', isOptional: false, prepNote: 'white kaolin clay; disperse in 1 tbsp olive oil before adding to batter at trace' },
    ],
  },

  'lavender-rose-drawer-sachets.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'dried-lavender-flowers', amount: 120, unit: 'g', isOptional: false, prepNote: 'dried lavender buds; primary scent and insect deterrent' },
      { ingredientSlug: 'rose-petals-dried', amount: 60, unit: 'g', isOptional: false, prepNote: 'dried rose petals; adds floral depth to the scent blend' },
      { ingredientSlug: 'essential-oil-lavender', amount: 2, unit: 'ml', isOptional: false, prepNote: 'approx. 40 drops; refreshes the scent after a few weeks' },
    ],
  },

  'lemon-poppy-seed-soap.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'olive-oil', amount: 480, unit: 'g', isOptional: false, prepNote: 'pure (not extra virgin); 60% of oil weight; conditioning base' },
      { ingredientSlug: 'coconut-oil', amount: 320, unit: 'g', isOptional: false, prepNote: '40% of oil weight; lather and hardness' },
      { ingredientSlug: 'sodium-hydroxide', amount: 117, unit: 'g', isOptional: false, prepNote: 'NaOH at 99% purity; calculated for 5% superfat' },
      { ingredientSlug: 'distilled-water', amount: 256, unit: 'g', isOptional: false, prepNote: '32% of oil weight; the lye solution liquid' },
      { ingredientSlug: 'essential-oil-lemon', amount: 24, unit: 'g', isOptional: false, prepNote: '3% of oil weight; stir in at light trace, not blended in; may fade slightly in cure' },
      { ingredientSlug: 'poppy-seeds', amount: 15, unit: 'g', isOptional: false, prepNote: 'gentle exfoliant; stir in with the lemon EO at trace' },
    ],
  },

  'melt-and-pour-soap-beginner.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'melt-and-pour-soap-base', amount: 400, unit: 'g', isOptional: false, prepNote: 'clear glycerin base; fully saponified at manufacture; no lye handling needed' },
      { ingredientSlug: 'candle-fragrance-oil', amount: 10, unit: 'g', isOptional: false, prepNote: 'your choice of soap-safe fragrance oil at 2.5% of base weight; add below 70°C' },
      { ingredientSlug: 'cosmetic-mica', amount: 2, unit: 'g', isOptional: true, prepNote: 'soap-safe mica powder or liquid soap dye; adjust to desired colour intensity' },
    ],
  },

  'natural-drain-unblocker.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'bicarbonate-of-soda', amount: 60, unit: 'g', isOptional: false, prepNote: 'approx. 4 tbsp; pour directly into drain first' },
      { ingredientSlug: 'white-vinegar', amount: 120, unit: 'ml', isOptional: false, prepNote: 'pour directly after the bicarb; fizzing reaction loosens debris' },
      { ingredientSlug: 'water', amount: 500, unit: 'ml', isOptional: false, prepNote: 'very hot (just off the boil for metal drains; hot tap water for PVC); pour after 15 minutes' },
    ],
  },

  'natural-furniture-polish.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'beeswax-pellets', amount: 33, unit: 'g', isOptional: false, prepNote: 'yellow cosmetic-grade beeswax pastilles or grated block; 33% of formula' },
      { ingredientSlug: 'extra-virgin-olive-oil', amount: 65, unit: 'g', isOptional: false, prepNote: '65% of formula; penetrates wood fibres' },
      { ingredientSlug: 'essential-oil-lemon', amount: 2, unit: 'g', isOptional: false, prepNote: '2% of formula; limonene provides mild degreasing and characteristic scent' },
    ],
  },

  'neem-tea-tree-shampoo-bar.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'coconut-oil', amount: 360, unit: 'g', isOptional: false, prepNote: '60% of oil weight; main lather and hardness oil for shampoo bars' },
      { ingredientSlug: 'neem-oil', amount: 60, unit: 'g', isOptional: false, prepNote: '10% of oil weight; strong smell that fades on cure; scalp and hair benefits' },
      { ingredientSlug: 'olive-oil', amount: 120, unit: 'g', isOptional: false, prepNote: 'pure (not extra virgin); 20% of oil weight; conditioning' },
      { ingredientSlug: 'castor-oil', amount: 60, unit: 'g', isOptional: false, prepNote: '10% of oil weight; boosts and stabilises lather' },
      { ingredientSlug: 'sodium-hydroxide', amount: 91, unit: 'g', isOptional: false, prepNote: 'NaOH at 99% purity; calculated for 3% superfat (lower than body soap for cleansing)' },
      { ingredientSlug: 'distilled-water', amount: 192, unit: 'g', isOptional: false, prepNote: '32% of oil weight; the lye solution liquid' },
      { ingredientSlug: 'essential-oil-tea-tree', amount: 12, unit: 'g', isOptional: false, prepNote: '2% of oil weight; added at trace; scalp-purifying note' },
    ],
  },

  'oat-milk-soap.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'olive-oil', amount: 350, unit: 'g', isOptional: false, prepNote: 'pure (not extra virgin); 50% of oil weight; conditioning base' },
      { ingredientSlug: 'coconut-oil', amount: 245, unit: 'g', isOptional: false, prepNote: '35% of oil weight; lather and hardness' },
      { ingredientSlug: 'sweet-almond-oil', amount: 105, unit: 'g', isOptional: false, prepNote: '15% of oil weight; soft conditioning oil' },
      { ingredientSlug: 'sodium-hydroxide', amount: 100, unit: 'g', isOptional: false, prepNote: 'NaOH at 99% purity; calculated for 6% superfat' },
      { ingredientSlug: 'oat-milk', amount: 224, unit: 'g', isOptional: false, prepNote: 'frozen to slush before adding lye; the sugars cause a heat spike' },
    ],
  },

  'peppermint-foot-balm.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'beeswax-pellets', amount: 36, unit: 'g', isOptional: false, prepNote: 'yellow cosmetic-grade beeswax; 30% of formula; gives the firm salve texture' },
      { ingredientSlug: 'shea-butter', amount: 36, unit: 'g', isOptional: false, prepNote: '30% of formula; deeply conditioning for dry heel skin' },
      { ingredientSlug: 'coconut-oil', amount: 36, unit: 'g', isOptional: false, prepNote: '30% of formula; antimicrobial carrier oil' },
      { ingredientSlug: 'castor-oil', amount: 8, unit: 'g', isOptional: false, prepNote: '7% of formula; humectant and skin draw' },
      { ingredientSlug: 'essential-oil-peppermint', amount: 3.6, unit: 'g', isOptional: false, prepNote: '3% of total weight; cooling and refreshing; add below 45°C' },
    ],
  },

  'pine-juniper-room-spray.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'perfumers-alcohol', amount: 20, unit: 'ml', isOptional: false, prepNote: '96% ethanol; dissolves the essential oils' },
      { ingredientSlug: 'essential-oil-pine', amount: 2.1, unit: 'g', isOptional: false, prepNote: 'Scots pine; 70% of essential oil total; 2.1% of spray' },
      { ingredientSlug: 'essential-oil-juniper-berry', amount: 0.9, unit: 'g', isOptional: false, prepNote: '30% of essential oil total; 0.9% of spray; brightens the pine note' },
      { ingredientSlug: 'distilled-water', amount: 77, unit: 'ml', isOptional: false, prepNote: 'added last; shake before each use' },
    ],
  },

  'pine-tar-soap.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'coconut-oil', amount: 255, unit: 'g', isOptional: false, prepNote: '38% of oil weight; lather and hardness' },
      { ingredientSlug: 'olive-oil', amount: 315, unit: 'g', isOptional: false, prepNote: 'pure (not extra virgin); 47% of oil weight; conditioning base' },
      { ingredientSlug: 'pine-tar', amount: 100, unit: 'g', isOptional: false, prepNote: 'cosmetic grade; 15% of oil weight; contributes to SAP calculation; dark colour and distinctive scent' },
      { ingredientSlug: 'sodium-hydroxide', amount: 98, unit: 'g', isOptional: false, prepNote: 'NaOH at 99% purity; calculated for 5% superfat on total oil weight including pine tar' },
      { ingredientSlug: 'distilled-water', amount: 214, unit: 'g', isOptional: false, prepNote: '32% of oil weight; the lye solution liquid' },
    ],
  },

  'rapeseed-wax-lemon-thyme-candle.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'rapeseed-wax', amount: 160, unit: 'g', isOptional: false, prepNote: 'container grade; melt point 55-60°C; pour at 60-65°C; allow 48 hours to cure before test burning' },
      { ingredientSlug: 'essential-oil-lemon', amount: 7.5, unit: 'g', isOptional: false, prepNote: '4.7% of wax weight; bright top note; add at 60°C' },
      { ingredientSlug: 'essential-oil-thyme', amount: 3.5, unit: 'g', isOptional: false, prepNote: 'linalool chemotype; 2.2% of wax weight; herbal mid note' },
      { ingredientSlug: 'candle-wick-pretabbed', amount: 1, unit: 'unit', isOptional: false, prepNote: 'pre-tabbed cotton wick CD-12 or equivalent for 7 cm jar diameter' },
    ],
  },

  'rosehip-face-oil.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'rosehip-oil', amount: 24, unit: 'g', isOptional: false, prepNote: '80% of formula; rosehip seed oil, cold-pressed; high in linoleic acid and natural retinoic acid precursors' },
      { ingredientSlug: 'jojoba-oil', amount: 5, unit: 'g', isOptional: false, prepNote: '17% of formula; technically a wax ester; highly stable carrier oil' },
      { ingredientSlug: 'sea-buckthorn-oil', amount: 1, unit: 'g', isOptional: false, prepNote: '3% of formula; very high in beta-carotene; gives the oil a golden-orange tint' },
      { ingredientSlug: 'vitamin-e-oil', amount: 0.15, unit: 'g', isOptional: false, prepNote: 'tocopherol; 2-3 drops; antioxidant to extend shelf life' },
    ],
  },

  'rosemary-eucalyptus-simmer-pot.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'water', amount: 1000, unit: 'ml', isOptional: false, prepNote: 'in a small saucepan on the lowest heat; top up as needed' },
      { ingredientSlug: 'rosemary', amount: 4, unit: 'sprig', isOptional: false, prepNote: 'fresh; or 2 tbsp dried rosemary' },
      { ingredientSlug: 'eucalyptus-leaves-dried', amount: 8, unit: 'unit', isOptional: false, prepNote: '6-8 leaves; fresh or dried; fresh from a florist also works' },
      { ingredientSlug: 'lemon', amount: 1, unit: 'each', isOptional: false, prepNote: 'sliced into rounds' },
      { ingredientSlug: 'peppercorns-black', amount: 5, unit: 'g', isOptional: false, prepNote: 'approx. 1 tsp, cracked; adds a warm spicy note' },
    ],
  },

  'rosemary-scalp-oil.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'jojoba-oil', amount: 44, unit: 'g', isOptional: false, prepNote: '88% of formula; non-greasy wax ester that mimics sebum; good for all scalp types' },
      { ingredientSlug: 'castor-oil', amount: 5, unit: 'g', isOptional: false, prepNote: '10% of formula; adds body and helps the oil cling to the scalp' },
      { ingredientSlug: 'essential-oil-rosemary', amount: 1, unit: 'g', isOptional: false, prepNote: '2% of formula; ct. camphor or ct. cineole; stimulating; avoid in pregnancy' },
    ],
  },

  'sea-kelp-peppermint-soap.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'coconut-oil', amount: 315, unit: 'g', isOptional: false, prepNote: '45% of oil weight; lather and hardness' },
      { ingredientSlug: 'olive-oil', amount: 245, unit: 'g', isOptional: false, prepNote: 'pure (not extra virgin); 35% of oil weight; conditioning base' },
      { ingredientSlug: 'shea-butter', amount: 140, unit: 'g', isOptional: false, prepNote: '20% of oil weight; skin conditioning and creaminess' },
      { ingredientSlug: 'sodium-hydroxide', amount: 103, unit: 'g', isOptional: false, prepNote: 'NaOH at 99% purity; calculated for 5% superfat' },
      { ingredientSlug: 'distilled-water', amount: 224, unit: 'g', isOptional: false, prepNote: '32% of oil weight; the lye solution liquid' },
      { ingredientSlug: 'essential-oil-peppermint', amount: 21, unit: 'g', isOptional: false, prepNote: '3% of oil weight; added at trace; bright and cooling' },
      { ingredientSlug: 'kelp-powder', amount: 3.5, unit: 'g', isOptional: false, prepNote: 'cosmetic-grade sea kelp powder; 0.5% of oil weight; added at trace for mineral content and natural green tint' },
    ],
  },

  'shea-butter-body-lotion.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'shea-butter', amount: 30, unit: 'g', isOptional: false, prepNote: '15% of formula; heat to melt; rich emollient' },
      { ingredientSlug: 'sweet-almond-oil', amount: 20, unit: 'g', isOptional: false, prepNote: '10% of formula; light carrier oil; add to oil phase' },
      { ingredientSlug: 'emulsifying-wax-nf', amount: 14, unit: 'g', isOptional: false, prepNote: '7% of formula; Emulsifying Wax NF or BTMS-50; binds oil and water phases' },
      { ingredientSlug: 'distilled-water', amount: 132, unit: 'g', isOptional: false, prepNote: '66% of formula; heat to the same temperature as the oil phase before combining' },
      { ingredientSlug: 'optiphen-preservative', amount: 2, unit: 'g', isOptional: false, prepNote: '1% of formula; add to cooled emulsion below 40°C; essential for any water-containing product' },
      { ingredientSlug: 'essential-oil-lavender', amount: 2, unit: 'g', isOptional: false, prepNote: '1% of formula; add to cool-down phase below 40°C' },
    ],
  },

  'soy-driftwood-sea-salt-candle.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'soy-wax-container', amount: 160, unit: 'g', isOptional: false, prepNote: 'container-grade soy wax; melt point 48-53°C; pour at 55-60°C' },
      { ingredientSlug: 'fragrance-oil-sea-salt-driftwood', amount: 11, unit: 'g', isOptional: false, prepNote: '6.9% of wax weight; add when wax is at 60°C' },
      { ingredientSlug: 'candle-wick-pretabbed', amount: 1, unit: 'unit', isOptional: false, prepNote: 'pre-tabbed cotton wick CD-12 or equivalent for 7 cm jar diameter' },
    ],
  },

  'soy-grapefruit-mint-candle.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'soy-wax-container', amount: 160, unit: 'g', isOptional: false, prepNote: 'container-grade soy wax; melt point 48-53°C; pour at 55-60°C' },
      { ingredientSlug: 'essential-oil-grapefruit', amount: 9, unit: 'g', isOptional: false, prepNote: '5.6% of wax weight; bright citrus top note' },
      { ingredientSlug: 'essential-oil-peppermint', amount: 3, unit: 'g', isOptional: false, prepNote: '1.9% of wax weight; cool mint note; add when wax is at 60°C' },
      { ingredientSlug: 'candle-wick-pretabbed', amount: 1, unit: 'unit', isOptional: false, prepNote: 'pre-tabbed cotton wick CD-12 or equivalent for 7 cm jar diameter' },
    ],
  },

  'soy-pine-forest-candle.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'soy-wax-container', amount: 160, unit: 'g', isOptional: false, prepNote: 'container-grade soy wax; melt point 48-53°C; pour at 55-60°C' },
      { ingredientSlug: 'fragrance-oil-pine-cedarwood', amount: 11, unit: 'g', isOptional: false, prepNote: '6.9% of wax weight; add when wax is at 60°C' },
      { ingredientSlug: 'candle-wick-pretabbed', amount: 1, unit: 'unit', isOptional: false, prepNote: 'pre-tabbed cotton wick CD-12 or equivalent for 7 cm jar diameter' },
    ],
  },

  'soy-tobacco-vanilla-candle.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'soy-wax-container', amount: 160, unit: 'g', isOptional: false, prepNote: 'container-grade soy wax; melt point 48-53°C; pour at 55-60°C' },
      { ingredientSlug: 'fragrance-oil-tobacco-vanilla', amount: 12.8, unit: 'g', isOptional: false, prepNote: '8% of wax weight; add when wax is at 60°C' },
      { ingredientSlug: 'candle-wick-pretabbed', amount: 1, unit: 'unit', isOptional: false, prepNote: 'pre-tabbed cotton wick CD-12 or equivalent for 7 cm jar diameter' },
    ],
  },

  'stainless-steel-paste.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'bicarbonate-of-soda', amount: 160, unit: 'g', isOptional: false, prepNote: '80% of formula; gentle abrasive and deodoriser' },
      { ingredientSlug: 'liquid-castile-soap', amount: 36, unit: 'g', isOptional: false, prepNote: 'unscented; 18% of formula; surfactant base' },
      { ingredientSlug: 'essential-oil-lemon', amount: 4, unit: 'g', isOptional: true, prepNote: '2% of formula; mild degreasing and a clean scent' },
    ],
  },

  'sweet-orange-clove-simmer-pot.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'water', amount: 1000, unit: 'ml', isOptional: false, prepNote: 'in a small saucepan on the lowest heat; top up as needed' },
      { ingredientSlug: 'orange', amount: 1, unit: 'each', isOptional: false, prepNote: 'large; sliced into rounds; skin on' },
      { ingredientSlug: 'cloves', amount: 5, unit: 'g', isOptional: false, prepNote: 'approx. 1 tbsp, 15 whole cloves; warm spice foundation' },
      { ingredientSlug: 'cinnamon-stick', amount: 2, unit: 'each', isOptional: false, prepNote: 'adds sweet warmth and a woody note' },
      { ingredientSlug: 'star-anise', amount: 3, unit: 'each', isOptional: false, prepNote: 'pods; licorice and spice note' },
      { ingredientSlug: 'vanilla-pod', amount: 1, unit: 'each', isOptional: false, prepNote: 'split lengthways; releases vanilla fragrance gradually' },
    ],
  },

  'tallow-rose-soap.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'beef-tallow', amount: 720, unit: 'g', isOptional: false, prepNote: 'rendered beef tallow; 80% of oil weight; gives a very hard, white bar with fine, creamy lather' },
      { ingredientSlug: 'sweet-almond-oil', amount: 180, unit: 'g', isOptional: false, prepNote: '20% of oil weight; conditioning and a small lather boost' },
      { ingredientSlug: 'sodium-hydroxide', amount: 129, unit: 'g', isOptional: false, prepNote: 'NaOH at 99% purity; calculated for 5% superfat' },
      { ingredientSlug: 'distilled-water', amount: 288, unit: 'g', isOptional: false, prepNote: '32% of oil weight; the lye solution liquid' },
      { ingredientSlug: 'fragrance-oil-rose', amount: 27, unit: 'g', isOptional: false, prepNote: '3% of oil weight; added at light trace; rose fragrance oil holds better than rose EO through cure' },
    ],
  },

  'toilet-bowl-fizz-tablets.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'bicarbonate-of-soda', amount: 120, unit: 'g', isOptional: false, prepNote: '60% of formula; effervescent base and mild abrasive' },
      { ingredientSlug: 'citric-acid', amount: 60, unit: 'g', isOptional: false, prepNote: '30% of formula; reacts with bicarb when wet to produce fizz' },
      { ingredientSlug: 'cornflour', amount: 20, unit: 'g', isOptional: false, prepNote: '10% of formula; binder and slows the release' },
      { ingredientSlug: 'essential-oil-tea-tree', amount: 0.4, unit: 'g', isOptional: false, prepNote: 'approx. 10 drops; antimicrobial' },
      { ingredientSlug: 'essential-oil-eucalyptus', amount: 0.4, unit: 'g', isOptional: false, prepNote: 'approx. 10 drops; fresh, clean scent' },
      { ingredientSlug: 'witch-hazel', amount: 10, unit: 'ml', isOptional: false, prepNote: 'in a fine spray bottle; added drop by drop to bind mixture without triggering premature fizzing' },
    ],
  },

  'upholstery-spot-cleaner.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'water', amount: 200, unit: 'ml', isOptional: false, prepNote: 'warm; mix fresh per use' },
      { ingredientSlug: 'white-vinegar', amount: 40, unit: 'ml', isOptional: false, prepNote: 'deodorising and mild cleaning acid' },
      { ingredientSlug: 'liquid-castile-soap', amount: 10, unit: 'ml', isOptional: false, prepNote: 'approx. 2 tsp; surfactant; use unscented' },
      { ingredientSlug: 'bicarbonate-of-soda', amount: 3, unit: 'g', isOptional: false, prepNote: 'approx. 1 tsp; odour absorber' },
      { ingredientSlug: 'essential-oil-lavender', amount: 0.2, unit: 'g', isOptional: true, prepNote: 'approx. 5 drops; or tea tree EO; for odour' },
    ],
  },

  'vanilla-sandalwood-wax-melt.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'soy-wax-container', amount: 110, unit: 'g', isOptional: false, prepNote: 'container soy wax; adequate for wax melts without additional hardener' },
      { ingredientSlug: 'vanilla-fragrance-oil', amount: 13, unit: 'g', isOptional: false, prepNote: '10% of wax weight; adds the warm base note; add at 60°C' },
      { ingredientSlug: 'essential-oil-sandalwood', amount: 5, unit: 'g', isOptional: false, prepNote: 'Santalum spicatum; 4% of wax weight; rich woody base; add at 60°C' },
    ],
  },

  'wood-floor-cleaner.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'water', amount: 4000, unit: 'ml', isOptional: false, prepNote: '4 litres warm water; the dilution makes this safe for oiled/waxed wood floors' },
      { ingredientSlug: 'white-wine-vinegar', amount: 30, unit: 'ml', isOptional: false, prepNote: 'approx. 2 tbsp; or distilled white vinegar; cuts grease and deodorises' },
      { ingredientSlug: 'liquid-castile-soap', amount: 2, unit: 'ml', isOptional: false, prepNote: 'approx. 5 drops; use only a tiny amount to avoid soap film on floor' },
      { ingredientSlug: 'essential-oil-tea-tree', amount: 0.4, unit: 'g', isOptional: true, prepNote: 'approx. 10 drops; antimicrobial; omit for lacquered floors' },
    ],
  },

  'ylang-ylang-jasmine-room-spray.json': {
    defaultServings: 1,
    items: [
      { ingredientSlug: 'perfumers-alcohol', amount: 20, unit: 'ml', isOptional: false, prepNote: '96% ethanol; dissolves the oils' },
      { ingredientSlug: 'essential-oil-ylang-ylang', amount: 1, unit: 'g', isOptional: false, prepNote: 'complete grade; 1% of total spray; heady floral' },
      { ingredientSlug: 'jasmine-absolute', amount: 0.5, unit: 'g', isOptional: false, prepNote: '0.5% of total spray; very costly — substitute jasmine absolute FO if price is a concern' },
      { ingredientSlug: 'distilled-water', amount: 78.5, unit: 'ml', isOptional: false, prepNote: 'added last; shake before each use' },
    ],
  },
}

function buildIngredientsList(fileSlug) {
  const mapping = INGREDIENT_MAP[fileSlug]
  if (!mapping) return null
  return {
    type: 'ingredientsList',
    attrs: {
      defaultServings: mapping.defaultServings,
      items: mapping.items,
    },
  }
}

function patchFile(filename) {
  const filepath = `${BRIEFS_DIR}/${filename}`
  const data = JSON.parse(readFileSync(filepath, 'utf8'))
  const body = data.body.content

  // Find the Ingredients heading
  const headingIdx = body.findIndex(
    b => b.type === 'heading' && b.content?.[0]?.text === 'Ingredients'
  )
  if (headingIdx < 0) {
    console.error(`  [SKIP] ${filename}: no Ingredients heading found`)
    return false
  }

  // Find next major heading (Method or similar)
  const nextHeadingIdx = body.findIndex(
    (b, i) => i > headingIdx && b.type === 'heading' && (b.attrs?.level === 2 || (b.attrs?.level < 3))
  )
  const endIdx = nextHeadingIdx < 0 ? body.length : nextHeadingIdx

  // Collect indices to remove (paragraphs and bulletLists between Ingredients and next heading)
  const toRemove = []
  for (let i = headingIdx + 1; i < endIdx; i++) {
    if (body[i].type === 'bulletList' || body[i].type === 'paragraph') {
      toRemove.push(i)
    }
  }

  // Build ingredientsList block
  const ingredientsList = buildIngredientsList(filename)
  if (!ingredientsList) {
    console.error(`  [SKIP] ${filename}: no mapping defined`)
    return false
  }

  // Remove old blocks (in reverse order to preserve indices) and insert ingredientsList
  const newBody = [...body]
  // Sort indices descending
  toRemove.sort((a, b) => b - a)
  for (const idx of toRemove) {
    newBody.splice(idx, 1)
  }

  // Find the heading again (its index may have shifted if items above were removed, but headingIdx was before the removed items so it stays the same)
  const actualHeadingIdx = newBody.findIndex(
    b => b.type === 'heading' && b.content?.[0]?.text === 'Ingredients'
  )
  // Insert ingredientsList right after the Ingredients heading
  newBody.splice(actualHeadingIdx + 1, 0, ingredientsList)

  data.body.content = newBody
  writeFileSync(filepath, JSON.stringify(data, null, 2))
  console.log(`  [OK] ${filename}: inserted ${ingredientsList.attrs.items.length} ingredients`)
  return true
}

let ok = 0; let fail = 0
for (const filename of Object.keys(INGREDIENT_MAP)) {
  const result = patchFile(filename)
  if (result) ok++; else fail++
}
console.log(`\nDone: ${ok} patched, ${fail} skipped`)
