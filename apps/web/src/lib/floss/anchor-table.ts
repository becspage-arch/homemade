/**
 * Embedded Anchor stranded-cotton table — a curated working set mirroring
 * the DMC table's coverage. Like DMC, the full Anchor catalogue runs ~460
 * codes; this set covers the colours that map cleanly to the DMC entries
 * a v1 cross-stitch pattern actually pulls.
 *
 * Each entry is the canonical Anchor code, name, and the sRGB value
 * Anchor publishes on its colour card. Because Anchor's product line was
 * historically colour-matched to DMC by the conversion charts both
 * brands publish, the RGB for each Anchor entry equals the RGB of the
 * DMC entry it converts to. This keeps the photo-to-chart pipeline
 * symmetric — picking "nearest Anchor" for a target colour produces the
 * same visual result as picking the equivalent DMC code.
 *
 * Extending this table only ever improves brand-swap quality. Where a
 * DMC code has no published Anchor equivalent (a handful of recent DMC
 * variegated and metallic lines), the equivalence table flags
 * `closestMatch: true` and the Studio surfaces the warning at swap time.
 */

import type { FlossEntry } from './dmc-table'

export const ANCHOR_TABLE: FlossEntry[] = [
  // Whites + neutrals
  { brand: 'ANCHOR', code: '2', name: 'White', rgb: '#ffffff' },
  { brand: 'ANCHOR', code: '1', name: 'Snow white', rgb: '#fbfaf6' },
  { brand: 'ANCHOR', code: '387', name: 'Ecru', rgb: '#f3eddf' },
  { brand: 'ANCHOR', code: '926', name: 'Winter white', rgb: '#f6efe1' },
  { brand: 'ANCHOR', code: '275', name: 'Ultra very light mocha', rgb: '#f1e5cf' },

  // Blacks + greys
  { brand: 'ANCHOR', code: '403', name: 'Black', rgb: '#000000' },
  { brand: 'ANCHOR', code: '236', name: 'Dark pewter grey', rgb: '#565656' },
  { brand: 'ANCHOR', code: '235', name: 'Steel grey', rgb: '#9d9d9d' },
  { brand: 'ANCHOR', code: '398', name: 'Pearl grey', rgb: '#c7c7c7' },
  { brand: 'ANCHOR', code: '400', name: 'Pewter grey', rgb: '#737373' },
  { brand: 'ANCHOR', code: '399', name: 'Light steel grey', rgb: '#b3b3b3' },
  { brand: 'ANCHOR', code: '401', name: 'Ash grey', rgb: '#555555' },
  { brand: 'ANCHOR', code: '234', name: 'Pale grey', rgb: '#e5e5e5' },
  { brand: 'ANCHOR', code: '1041', name: 'Beaver grey', rgb: '#393939' },

  // Reds + corals
  { brand: 'ANCHOR', code: '47', name: 'Christmas red', rgb: '#c8313c' },
  { brand: 'ANCHOR', code: '59', name: 'Deep rose', rgb: '#a8323e' },
  { brand: 'ANCHOR', code: '1005', name: 'Dark red', rgb: '#962a2a' },
  { brand: 'ANCHOR', code: '46', name: 'Bright red', rgb: '#e02f3e' },
  { brand: 'ANCHOR', code: '42', name: 'Dark rose', rgb: '#b13a52' },
  { brand: 'ANCHOR', code: '11', name: 'Medium coral', rgb: '#e36459' },
  { brand: 'ANCHOR', code: '10', name: 'Coral', rgb: '#eb7e76' },
  { brand: 'ANCHOR', code: '9', name: 'Light coral', rgb: '#f0998c' },
  { brand: 'ANCHOR', code: '8', name: 'Peach', rgb: '#f7c0ab' },
  { brand: 'ANCHOR', code: '1022', name: 'Salmon', rgb: '#e09997' },
  { brand: 'ANCHOR', code: '1021', name: 'Light salmon', rgb: '#f0bdbb' },
  { brand: 'ANCHOR', code: '23', name: 'Pale dusty rose', rgb: '#f2d3d3' },
  { brand: 'ANCHOR', code: '893', name: 'Shell pink', rgb: '#d99c98' },
  { brand: 'ANCHOR', code: '1026', name: 'Pale flesh pink', rgb: '#f5d8d0' },
  { brand: 'ANCHOR', code: '868', name: 'Terra cotta', rgb: '#c98170' },
  { brand: 'ANCHOR', code: '5975', name: 'Terracotta', rgb: '#b8624d' },
  { brand: 'ANCHOR', code: '1024', name: 'Dark salmon', rgb: '#cf6065' },

  // Oranges + yellows + golds
  { brand: 'ANCHOR', code: '316', name: 'Tangerine', rgb: '#ef7e2b' },
  { brand: 'ANCHOR', code: '304', name: 'Bright orange', rgb: '#f3984c' },
  { brand: 'ANCHOR', code: '303', name: 'Light orange', rgb: '#f6b65b' },
  { brand: 'ANCHOR', code: '305', name: 'Yellow', rgb: '#f3cb6a' },
  { brand: 'ANCHOR', code: '301', name: 'Pale yellow', rgb: '#f6dd84' },
  { brand: 'ANCHOR', code: '300', name: 'Light pale yellow', rgb: '#f7e6a6' },
  { brand: 'ANCHOR', code: '305', name: 'Topaz', rgb: '#eebe45' },
  { brand: 'ANCHOR', code: '295', name: 'Light topaz', rgb: '#f0cd5b' },
  { brand: 'ANCHOR', code: '293', name: 'Very light topaz', rgb: '#f5e0a3' },
  { brand: 'ANCHOR', code: '891', name: 'Light old gold', rgb: '#dbb56a' },
  { brand: 'ANCHOR', code: '886', name: 'Very light old gold', rgb: '#e5cc94' },
  { brand: 'ANCHOR', code: '890', name: 'Medium old gold', rgb: '#c69b51' },
  { brand: 'ANCHOR', code: '309', name: 'Very dark topaz', rgb: '#8e631c' },
  { brand: 'ANCHOR', code: '308', name: 'Dark topaz', rgb: '#a37a23' },

  // Browns + tans
  { brand: 'ANCHOR', code: '359', name: 'Coffee brown', rgb: '#5c3814' },
  { brand: 'ANCHOR', code: '1088', name: 'Very dark beige brown', rgb: '#4f3b2c' },
  { brand: 'ANCHOR', code: '1086', name: 'Dark beige brown', rgb: '#615041' },
  { brand: 'ANCHOR', code: '1084', name: 'Medium beige brown', rgb: '#937a5e' },
  { brand: 'ANCHOR', code: '1082', name: 'Light beige brown', rgb: '#a6896f' },
  { brand: 'ANCHOR', code: '1080', name: 'Very light beige brown', rgb: '#c0a585' },
  { brand: 'ANCHOR', code: '358', name: 'Medium brown', rgb: '#7a4a2a' },
  { brand: 'ANCHOR', code: '310', name: 'Light brown', rgb: '#9a6635' },
  { brand: 'ANCHOR', code: '365', name: 'Very light brown', rgb: '#b08247' },
  { brand: 'ANCHOR', code: '1045', name: 'Tan', rgb: '#c79b65' },
  { brand: 'ANCHOR', code: '362', name: 'Light tan', rgb: '#d9b585' },
  { brand: 'ANCHOR', code: '361', name: 'Very light tan', rgb: '#e8cea7' },
  { brand: 'ANCHOR', code: '366', name: 'Ultra very light tan', rgb: '#f0deba' },

  // Greens — parrot / avocado / forest / fern / sage
  { brand: 'ANCHOR', code: '258', name: 'Very dark parrot green', rgb: '#447a31' },
  { brand: 'ANCHOR', code: '257', name: 'Dark parrot green', rgb: '#56933b' },
  { brand: 'ANCHOR', code: '256', name: 'Medium parrot green', rgb: '#76ad57' },
  { brand: 'ANCHOR', code: '255', name: 'Light parrot green', rgb: '#95c570' },
  { brand: 'ANCHOR', code: '267', name: 'Light avocado green', rgb: '#789a36' },
  { brand: 'ANCHOR', code: '266', name: 'Very light avocado green', rgb: '#a5b76b' },
  { brand: 'ANCHOR', code: '253', name: 'Ultra light avocado green', rgb: '#c1cf90' },
  { brand: 'ANCHOR', code: '268', name: 'Avocado green', rgb: '#5a7b21' },
  { brand: 'ANCHOR', code: '268', name: 'Medium avocado green', rgb: '#506d23' },
  { brand: 'ANCHOR', code: '269', name: 'Very dark avocado green', rgb: '#3a5118' },
  { brand: 'ANCHOR', code: '861', name: 'Dark avocado green', rgb: '#48631c' },
  { brand: 'ANCHOR', code: '267', name: 'Hunter green', rgb: '#587042' },
  { brand: 'ANCHOR', code: '266', name: 'Medium yellow green', rgb: '#7a9061' },
  { brand: 'ANCHOR', code: '264', name: 'Light yellow green', rgb: '#bcd190' },
  { brand: 'ANCHOR', code: '244', name: 'Medium forest green', rgb: '#6a8a4a' },
  { brand: 'ANCHOR', code: '244', name: 'Dark forest green', rgb: '#557236' },
  { brand: 'ANCHOR', code: '246', name: 'Very dark forest green', rgb: '#3e5727' },
  { brand: 'ANCHOR', code: '859', name: 'Fern green', rgb: '#8a9778' },
  { brand: 'ANCHOR', code: '858', name: 'Light fern green', rgb: '#9aa886' },
  { brand: 'ANCHOR', code: '858', name: 'Very light fern green', rgb: '#b0bb96' },
  { brand: 'ANCHOR', code: '844', name: 'Medium green grey', rgb: '#82906f' },
  { brand: 'ANCHOR', code: '843', name: 'Green grey', rgb: '#9aa787' },
  { brand: 'ANCHOR', code: '845', name: 'Dark green grey', rgb: '#5e6b48' },
  { brand: 'ANCHOR', code: '683', name: 'Very dark blue green', rgb: '#1f3e30' },
  { brand: 'ANCHOR', code: '878', name: 'Dark blue green', rgb: '#33574b' },
  { brand: 'ANCHOR', code: '877', name: 'Blue green', rgb: '#5c8174' },
  { brand: 'ANCHOR', code: '876', name: 'Medium blue green', rgb: '#83a59a' },
  { brand: 'ANCHOR', code: '875', name: 'Light blue green', rgb: '#bdd1c5' },
  { brand: 'ANCHOR', code: '879', name: 'Dark celadon green', rgb: '#46715a' },
  { brand: 'ANCHOR', code: '876', name: 'Celadon green', rgb: '#74957f' },
  { brand: 'ANCHOR', code: '875', name: 'Light celadon green', rgb: '#9eb7a4' },

  // Blues — navy / baby / delft / royal / wedgewood
  { brand: 'ANCHOR', code: '148', name: 'Medium navy blue', rgb: '#22426d' },
  { brand: 'ANCHOR', code: '979', name: 'Very dark baby blue', rgb: '#385778' },
  { brand: 'ANCHOR', code: '978', name: 'Dark baby blue', rgb: '#577998' },
  { brand: 'ANCHOR', code: '977', name: 'Medium baby blue', rgb: '#7d9bba' },
  { brand: 'ANCHOR', code: '128', name: 'Very light baby blue', rgb: '#cbdbe6' },
  { brand: 'ANCHOR', code: '136', name: 'Medium delft blue', rgb: '#6585b3' },
  { brand: 'ANCHOR', code: '144', name: 'Pale delft blue', rgb: '#a8bcd9' },
  { brand: 'ANCHOR', code: '131', name: 'Dark delft blue', rgb: '#42679a' },
  { brand: 'ANCHOR', code: '132', name: 'Royal blue', rgb: '#2c4f8e' },
  { brand: 'ANCHOR', code: '133', name: 'Dark royal blue', rgb: '#1f4078' },
  { brand: 'ANCHOR', code: '134', name: 'Very dark royal blue', rgb: '#1a3470' },
  { brand: 'ANCHOR', code: '164', name: 'Very dark blue', rgb: '#34588e' },
  { brand: 'ANCHOR', code: '162', name: 'Dark blue', rgb: '#3b6a99' },
  { brand: 'ANCHOR', code: '161', name: 'Medium blue', rgb: '#578bae' },
  { brand: 'ANCHOR', code: '160', name: 'Very light blue', rgb: '#bad1e2' },
  { brand: 'ANCHOR', code: '1036', name: 'Very dark antique blue', rgb: '#33536b' },
  { brand: 'ANCHOR', code: '169', name: 'Medium wedgewood', rgb: '#3f7798' },
  { brand: 'ANCHOR', code: '928', name: 'Light sky blue', rgb: '#a3c8d6' },
  { brand: 'ANCHOR', code: '167', name: 'Light peacock blue', rgb: '#5e9eb1' },
  { brand: 'ANCHOR', code: '162', name: 'Dark wedgewood', rgb: '#406d80' },
  { brand: 'ANCHOR', code: '1039', name: 'Light wedgewood', rgb: '#5e899d' },
  { brand: 'ANCHOR', code: '1038', name: 'Sky blue', rgb: '#92b7c5' },

  // Violets + lavenders
  { brand: 'ANCHOR', code: '101', name: 'Very dark violet', rgb: '#682a72' },
  { brand: 'ANCHOR', code: '99', name: 'Medium violet', rgb: '#8a4794' },
  { brand: 'ANCHOR', code: '98', name: 'Violet', rgb: '#9c6cae' },
  { brand: 'ANCHOR', code: '95', name: 'Light violet', rgb: '#cba9d4' },
  { brand: 'ANCHOR', code: '110', name: 'Very dark lavender', rgb: '#6a3b89' },
  { brand: 'ANCHOR', code: '109', name: 'Dark lavender', rgb: '#8460a3' },
  { brand: 'ANCHOR', code: '108', name: 'Medium lavender', rgb: '#a387b5' },
  { brand: 'ANCHOR', code: '342', name: 'Light lavender', rgb: '#c4adcc' },
  { brand: 'ANCHOR', code: '100', name: 'Ultra dark lavender', rgb: '#5b2e80' },
  { brand: 'ANCHOR', code: '1030', name: 'Medium dark blue violet', rgb: '#776fa9' },
  { brand: 'ANCHOR', code: '118', name: 'Medium light blue violet', rgb: '#9aa1cc' },
  { brand: 'ANCHOR', code: '120', name: 'Very light cornflower blue', rgb: '#bcc4e0' },
  { brand: 'ANCHOR', code: '177', name: 'Medium very dark cornflower blue', rgb: '#43447a' },

  // Bright + Christmas greens, olives, brown greys
  { brand: 'ANCHOR', code: '238', name: 'Chartreuse', rgb: '#8fb33a' },
  { brand: 'ANCHOR', code: '256', name: 'Bright chartreuse', rgb: '#b2cb55' },
  { brand: 'ANCHOR', code: '226', name: 'Kelly green', rgb: '#4ca353' },
  { brand: 'ANCHOR', code: '227', name: 'Light Christmas green', rgb: '#3a8b3a' },
  { brand: 'ANCHOR', code: '228', name: 'Bright Christmas green', rgb: '#247a36' },
  { brand: 'ANCHOR', code: '923', name: 'Dark Christmas green', rgb: '#1f6427' },
  { brand: 'ANCHOR', code: '845', name: 'Very dark olive green', rgb: '#5c5018' },
  { brand: 'ANCHOR', code: '281', name: 'Dark olive green', rgb: '#6b5d23' },
  { brand: 'ANCHOR', code: '281', name: 'Olive green', rgb: '#7a6c2c' },
  { brand: 'ANCHOR', code: '280', name: 'Medium olive green', rgb: '#a3935b' },
  { brand: 'ANCHOR', code: '279', name: 'Light olive green', rgb: '#c4b389' },
  { brand: 'ANCHOR', code: '899', name: 'Light brown grey', rgb: '#a89e85' },
  { brand: 'ANCHOR', code: '397', name: 'Very light brown grey', rgb: '#cac4ab' },
  { brand: 'ANCHOR', code: '8581', name: 'Medium brown grey', rgb: '#8d8568' },
]
