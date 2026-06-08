/**
 * Embedded DMC stranded-cotton table — a curated working set covering the
 * typical needs of a v1 cross-stitch pattern (skies, foliage, skin tones,
 * blacks / whites / primaries, common pastels and earth tones).
 *
 * The full DMC range is roughly 500 colours; for a publish-grade match
 * the floss-table will grow over time. For v1 this set quantises a
 * photo into floss colours well enough that the live-preview slider
 * tells the right story and the resulting chart can be stitched from
 * stock that's available at every needlework shop on the planet.
 *
 * Each entry is the canonical DMC code, name, and the approximate
 * sRGB value Marks Manufacturing publishes on their colour card.
 * The "nearest floss" routine uses CIEDE-2000-style perceptual distance
 * on these values to pick the closest stand for a target RGB.
 *
 * NOTE: extending this table only ever improves quality — any RGB still
 * resolves to "nearest floss" against whatever entries are present, so
 * shipping a smaller table never makes the photo-to-chart flow broken,
 * just less colour-accurate. The colour-count slider in the UI maps to
 * "pick N entries from this table that minimise total error."
 */

export interface FlossEntry {
  brand: 'DMC' | 'ANCHOR' | 'MADEIRA'
  code: string
  name: string
  rgb: string
}

export const DMC_TABLE: FlossEntry[] = [
  { brand: 'DMC', code: 'B5200', name: 'Snow white', rgb: '#ffffff' },
  { brand: 'DMC', code: 'BLANC', name: 'Bright white', rgb: '#fbfaf6' },
  { brand: 'DMC', code: 'ECRU', name: 'Ecru', rgb: '#f3eddf' },
  { brand: 'DMC', code: '310', name: 'Black', rgb: '#000000' },
  { brand: 'DMC', code: '413', name: 'Dark pewter grey', rgb: '#565656' },
  { brand: 'DMC', code: '414', name: 'Steel grey', rgb: '#9d9d9d' },
  { brand: 'DMC', code: '415', name: 'Pearl grey', rgb: '#c7c7c7' },
  { brand: 'DMC', code: '317', name: 'Pewter grey', rgb: '#737373' },
  { brand: 'DMC', code: '318', name: 'Light steel grey', rgb: '#b3b3b3' },
  { brand: 'DMC', code: '535', name: 'Ash grey', rgb: '#555555' },
  { brand: 'DMC', code: '762', name: 'Pale grey', rgb: '#e5e5e5' },
  { brand: 'DMC', code: '844', name: 'Beaver grey', rgb: '#393939' },

  { brand: 'DMC', code: '321', name: 'Christmas red', rgb: '#c8313c' },
  { brand: 'DMC', code: '326', name: 'Deep rose', rgb: '#a8323e' },
  { brand: 'DMC', code: '498', name: 'Dark red', rgb: '#962a2a' },
  { brand: 'DMC', code: '666', name: 'Bright red', rgb: '#e02f3e' },
  { brand: 'DMC', code: '309', name: 'Dark rose', rgb: '#b13a52' },
  { brand: 'DMC', code: '350', name: 'Medium coral', rgb: '#e36459' },
  { brand: 'DMC', code: '351', name: 'Coral', rgb: '#eb7e76' },
  { brand: 'DMC', code: '352', name: 'Light coral', rgb: '#f0998c' },
  { brand: 'DMC', code: '353', name: 'Peach', rgb: '#f7c0ab' },
  { brand: 'DMC', code: '760', name: 'Salmon', rgb: '#e09997' },
  { brand: 'DMC', code: '761', name: 'Light salmon', rgb: '#f0bdbb' },
  { brand: 'DMC', code: '963', name: 'Pale dusty rose', rgb: '#f2d3d3' },
  { brand: 'DMC', code: '224', name: 'Shell pink', rgb: '#d99c98' },
  { brand: 'DMC', code: '225', name: 'Pale flesh pink', rgb: '#f5d8d0' },
  { brand: 'DMC', code: '3779', name: 'Terra cotta', rgb: '#c98170' },
  { brand: 'DMC', code: '356', name: 'Terracotta', rgb: '#b8624d' },
  { brand: 'DMC', code: '3328', name: 'Dark salmon', rgb: '#cf6065' },

  { brand: 'DMC', code: '740', name: 'Tangerine', rgb: '#ef7e2b' },
  { brand: 'DMC', code: '741', name: 'Bright orange', rgb: '#f3984c' },
  { brand: 'DMC', code: '742', name: 'Light orange', rgb: '#f6b65b' },
  { brand: 'DMC', code: '743', name: 'Yellow', rgb: '#f3cb6a' },
  { brand: 'DMC', code: '744', name: 'Pale yellow', rgb: '#f6dd84' },
  { brand: 'DMC', code: '745', name: 'Light pale yellow', rgb: '#f7e6a6' },
  { brand: 'DMC', code: '725', name: 'Topaz', rgb: '#eebe45' },
  { brand: 'DMC', code: '726', name: 'Light topaz', rgb: '#f0cd5b' },
  { brand: 'DMC', code: '727', name: 'Very light topaz', rgb: '#f5e0a3' },
  { brand: 'DMC', code: '676', name: 'Light old gold', rgb: '#dbb56a' },
  { brand: 'DMC', code: '677', name: 'Very light old gold', rgb: '#e5cc94' },
  { brand: 'DMC', code: '729', name: 'Medium old gold', rgb: '#c69b51' },
  { brand: 'DMC', code: '780', name: 'Very dark topaz', rgb: '#8e631c' },
  { brand: 'DMC', code: '782', name: 'Dark topaz', rgb: '#a37a23' },
  { brand: 'DMC', code: '801', name: 'Coffee brown', rgb: '#5c3814' },
  { brand: 'DMC', code: '838', name: 'Very dark beige brown', rgb: '#4f3b2c' },
  { brand: 'DMC', code: '839', name: 'Dark beige brown', rgb: '#615041' },
  { brand: 'DMC', code: '840', name: 'Medium beige brown', rgb: '#937a5e' },
  { brand: 'DMC', code: '841', name: 'Light beige brown', rgb: '#a6896f' },
  { brand: 'DMC', code: '842', name: 'Very light beige brown', rgb: '#c0a585' },
  { brand: 'DMC', code: '433', name: 'Medium brown', rgb: '#7a4a2a' },
  { brand: 'DMC', code: '434', name: 'Light brown', rgb: '#9a6635' },
  { brand: 'DMC', code: '435', name: 'Very light brown', rgb: '#b08247' },
  { brand: 'DMC', code: '436', name: 'Tan', rgb: '#c79b65' },
  { brand: 'DMC', code: '437', name: 'Light tan', rgb: '#d9b585' },
  { brand: 'DMC', code: '738', name: 'Very light tan', rgb: '#e8cea7' },
  { brand: 'DMC', code: '739', name: 'Ultra very light tan', rgb: '#f0deba' },
  { brand: 'DMC', code: '3865', name: 'Winter white', rgb: '#f6efe1' },
  { brand: 'DMC', code: '3866', name: 'Ultra very light mocha brown', rgb: '#f1e5cf' },

  { brand: 'DMC', code: '904', name: 'Very dark parrot green', rgb: '#447a31' },
  { brand: 'DMC', code: '905', name: 'Dark parrot green', rgb: '#56933b' },
  { brand: 'DMC', code: '906', name: 'Medium parrot green', rgb: '#76ad57' },
  { brand: 'DMC', code: '907', name: 'Light parrot green', rgb: '#95c570' },
  { brand: 'DMC', code: '470', name: 'Light avocado green', rgb: '#789a36' },
  { brand: 'DMC', code: '471', name: 'Very light avocado green', rgb: '#a5b76b' },
  { brand: 'DMC', code: '472', name: 'Ultra light avocado green', rgb: '#c1cf90' },
  { brand: 'DMC', code: '469', name: 'Avocado green', rgb: '#5a7b21' },
  { brand: 'DMC', code: '937', name: 'Medium avocado green', rgb: '#506d23' },
  { brand: 'DMC', code: '936', name: 'Very dark avocado green', rgb: '#3a5118' },
  { brand: 'DMC', code: '935', name: 'Dark avocado green', rgb: '#48631c' },
  { brand: 'DMC', code: '3346', name: 'Hunter green', rgb: '#587042' },
  { brand: 'DMC', code: '3347', name: 'Medium yellow green', rgb: '#7a9061' },
  { brand: 'DMC', code: '3348', name: 'Light yellow green', rgb: '#bcd190' },
  { brand: 'DMC', code: '988', name: 'Medium forest green', rgb: '#6a8a4a' },
  { brand: 'DMC', code: '987', name: 'Dark forest green', rgb: '#557236' },
  { brand: 'DMC', code: '986', name: 'Very dark forest green', rgb: '#3e5727' },
  { brand: 'DMC', code: '522', name: 'Fern green', rgb: '#8a9778' },
  { brand: 'DMC', code: '523', name: 'Light fern green', rgb: '#9aa886' },
  { brand: 'DMC', code: '524', name: 'Very light fern green', rgb: '#b0bb96' },
  { brand: 'DMC', code: '3052', name: 'Medium green grey', rgb: '#82906f' },
  { brand: 'DMC', code: '3053', name: 'Green grey', rgb: '#9aa787' },
  { brand: 'DMC', code: '3051', name: 'Dark green grey', rgb: '#5e6b48' },
  { brand: 'DMC', code: '500', name: 'Very dark blue green', rgb: '#1f3e30' },
  { brand: 'DMC', code: '501', name: 'Dark blue green', rgb: '#33574b' },
  { brand: 'DMC', code: '502', name: 'Blue green', rgb: '#5c8174' },
  { brand: 'DMC', code: '503', name: 'Medium blue green', rgb: '#83a59a' },
  { brand: 'DMC', code: '504', name: 'Light blue green', rgb: '#bdd1c5' },
  { brand: 'DMC', code: '3815', name: 'Dark celadon green', rgb: '#46715a' },
  { brand: 'DMC', code: '3816', name: 'Celadon green', rgb: '#74957f' },
  { brand: 'DMC', code: '3817', name: 'Light celadon green', rgb: '#9eb7a4' },

  { brand: 'DMC', code: '311', name: 'Medium navy blue', rgb: '#22426d' },
  { brand: 'DMC', code: '312', name: 'Very dark baby blue', rgb: '#385778' },
  { brand: 'DMC', code: '322', name: 'Dark baby blue', rgb: '#577998' },
  { brand: 'DMC', code: '334', name: 'Medium baby blue', rgb: '#7d9bba' },
  { brand: 'DMC', code: '775', name: 'Very light baby blue', rgb: '#cbdbe6' },
  { brand: 'DMC', code: '799', name: 'Medium delft blue', rgb: '#6585b3' },
  { brand: 'DMC', code: '800', name: 'Pale delft blue', rgb: '#a8bcd9' },
  { brand: 'DMC', code: '798', name: 'Dark delft blue', rgb: '#42679a' },
  { brand: 'DMC', code: '797', name: 'Royal blue', rgb: '#2c4f8e' },
  { brand: 'DMC', code: '796', name: 'Dark royal blue', rgb: '#1f4078' },
  { brand: 'DMC', code: '820', name: 'Very dark royal blue', rgb: '#1a3470' },
  { brand: 'DMC', code: '824', name: 'Very dark blue', rgb: '#34588e' },
  { brand: 'DMC', code: '825', name: 'Dark blue', rgb: '#3b6a99' },
  { brand: 'DMC', code: '826', name: 'Medium blue', rgb: '#578bae' },
  { brand: 'DMC', code: '827', name: 'Very light blue', rgb: '#bad1e2' },
  { brand: 'DMC', code: '3750', name: 'Very dark antique blue', rgb: '#33536b' },
  { brand: 'DMC', code: '3760', name: 'Medium wedgewood', rgb: '#3f7798' },
  { brand: 'DMC', code: '3761', name: 'Light sky blue', rgb: '#a3c8d6' },
  { brand: 'DMC', code: '3766', name: 'Light peacock blue', rgb: '#5e9eb1' },
  { brand: 'DMC', code: '517', name: 'Dark wedgewood', rgb: '#406d80' },
  { brand: 'DMC', code: '518', name: 'Light wedgewood', rgb: '#5e899d' },
  { brand: 'DMC', code: '519', name: 'Sky blue', rgb: '#92b7c5' },

  { brand: 'DMC', code: '550', name: 'Very dark violet', rgb: '#682a72' },
  { brand: 'DMC', code: '552', name: 'Medium violet', rgb: '#8a4794' },
  { brand: 'DMC', code: '553', name: 'Violet', rgb: '#9c6cae' },
  { brand: 'DMC', code: '554', name: 'Light violet', rgb: '#cba9d4' },
  { brand: 'DMC', code: '208', name: 'Very dark lavender', rgb: '#6a3b89' },
  { brand: 'DMC', code: '209', name: 'Dark lavender', rgb: '#8460a3' },
  { brand: 'DMC', code: '210', name: 'Medium lavender', rgb: '#a387b5' },
  { brand: 'DMC', code: '211', name: 'Light lavender', rgb: '#c4adcc' },
  { brand: 'DMC', code: '3837', name: 'Ultra dark lavender', rgb: '#5b2e80' },
  { brand: 'DMC', code: '155', name: 'Medium dark blue violet', rgb: '#776fa9' },
  { brand: 'DMC', code: '156', name: 'Medium light blue violet', rgb: '#9aa1cc' },
  { brand: 'DMC', code: '157', name: 'Very light cornflower blue', rgb: '#bcc4e0' },
  { brand: 'DMC', code: '158', name: 'Medium very dark cornflower blue', rgb: '#43447a' },

  { brand: 'DMC', code: '703', name: 'Chartreuse', rgb: '#8fb33a' },
  { brand: 'DMC', code: '704', name: 'Bright chartreuse', rgb: '#b2cb55' },
  { brand: 'DMC', code: '907', name: 'Light parrot green light', rgb: '#a3c474' },
  { brand: 'DMC', code: '702', name: 'Kelly green', rgb: '#4ca353' },
  { brand: 'DMC', code: '701', name: 'Light Christmas green', rgb: '#3a8b3a' },
  { brand: 'DMC', code: '700', name: 'Bright Christmas green', rgb: '#247a36' },
  { brand: 'DMC', code: '699', name: 'Dark Christmas green', rgb: '#1f6427' },
  { brand: 'DMC', code: '730', name: 'Very dark olive green', rgb: '#5c5018' },
  { brand: 'DMC', code: '731', name: 'Dark olive green', rgb: '#6b5d23' },
  { brand: 'DMC', code: '732', name: 'Olive green', rgb: '#7a6c2c' },
  { brand: 'DMC', code: '733', name: 'Medium olive green', rgb: '#a3935b' },
  { brand: 'DMC', code: '734', name: 'Light olive green', rgb: '#c4b389' },
  { brand: 'DMC', code: '3023', name: 'Light brown grey', rgb: '#a89e85' },
  { brand: 'DMC', code: '3024', name: 'Very light brown grey', rgb: '#cac4ab' },
  { brand: 'DMC', code: '3022', name: 'Medium brown grey', rgb: '#8d8568' },
]
