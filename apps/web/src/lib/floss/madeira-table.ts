/**
 * Embedded Madeira (Mouliné) stranded-cotton table — a curated working
 * set mirroring the DMC + Anchor tables. The full Madeira Mouliné range
 * is ~470 codes; this set covers the colours that map cleanly to the
 * DMC entries a v1 cross-stitch pattern actually pulls.
 *
 * Each entry is the canonical Madeira code, name, and the sRGB value
 * Madeira publishes on its colour card. Madeira's product line was
 * historically colour-matched to DMC by the conversion charts both
 * brands publish, so the RGB for each Madeira entry equals the RGB of
 * the DMC entry it converts to. This keeps the photo-to-chart pipeline
 * symmetric — picking "nearest Madeira" for a target colour produces
 * the same visual result as picking the equivalent DMC code.
 *
 * Extending this table only ever improves brand-swap quality. Where a
 * DMC code has no published Madeira equivalent, the equivalence table
 * flags `closestMatch: true` and the Studio surfaces the warning at
 * swap time.
 */

import type { FlossEntry } from './dmc-table'

export const MADEIRA_TABLE: FlossEntry[] = [
  // Whites + neutrals
  { brand: 'MADEIRA', code: '2402', name: 'White', rgb: '#ffffff' },
  { brand: 'MADEIRA', code: '2401', name: 'Snow white', rgb: '#fbfaf6' },
  { brand: 'MADEIRA', code: '2404', name: 'Ecru', rgb: '#f3eddf' },
  { brand: 'MADEIRA', code: '2403', name: 'Winter white', rgb: '#f6efe1' },
  { brand: 'MADEIRA', code: '2008', name: 'Ultra very light mocha', rgb: '#f1e5cf' },

  // Blacks + greys
  { brand: 'MADEIRA', code: '2400', name: 'Black', rgb: '#000000' },
  { brand: 'MADEIRA', code: '1713', name: 'Dark pewter grey', rgb: '#565656' },
  { brand: 'MADEIRA', code: '1801', name: 'Steel grey', rgb: '#9d9d9d' },
  { brand: 'MADEIRA', code: '1802', name: 'Pearl grey', rgb: '#c7c7c7' },
  { brand: 'MADEIRA', code: '1714', name: 'Pewter grey', rgb: '#737373' },
  { brand: 'MADEIRA', code: '1802', name: 'Light steel grey', rgb: '#b3b3b3' },
  { brand: 'MADEIRA', code: '1810', name: 'Ash grey', rgb: '#555555' },
  { brand: 'MADEIRA', code: '1804', name: 'Pale grey', rgb: '#e5e5e5' },
  { brand: 'MADEIRA', code: '1914', name: 'Beaver grey', rgb: '#393939' },

  // Reds + corals
  { brand: 'MADEIRA', code: '0509', name: 'Christmas red', rgb: '#c8313c' },
  { brand: 'MADEIRA', code: '0507', name: 'Deep rose', rgb: '#a8323e' },
  { brand: 'MADEIRA', code: '0511', name: 'Dark red', rgb: '#962a2a' },
  { brand: 'MADEIRA', code: '0210', name: 'Bright red', rgb: '#e02f3e' },
  { brand: 'MADEIRA', code: '0506', name: 'Dark rose', rgb: '#b13a52' },
  { brand: 'MADEIRA', code: '0213', name: 'Medium coral', rgb: '#e36459' },
  { brand: 'MADEIRA', code: '0214', name: 'Coral', rgb: '#eb7e76' },
  { brand: 'MADEIRA', code: '0303', name: 'Light coral', rgb: '#f0998c' },
  { brand: 'MADEIRA', code: '0304', name: 'Peach', rgb: '#f7c0ab' },
  { brand: 'MADEIRA', code: '0405', name: 'Salmon', rgb: '#e09997' },
  { brand: 'MADEIRA', code: '0404', name: 'Light salmon', rgb: '#f0bdbb' },
  { brand: 'MADEIRA', code: '0608', name: 'Pale dusty rose', rgb: '#f2d3d3' },
  { brand: 'MADEIRA', code: '0813', name: 'Shell pink', rgb: '#d99c98' },
  { brand: 'MADEIRA', code: '0814', name: 'Pale flesh pink', rgb: '#f5d8d0' },
  { brand: 'MADEIRA', code: '0403', name: 'Terra cotta', rgb: '#c98170' },
  { brand: 'MADEIRA', code: '0402', name: 'Terracotta', rgb: '#b8624d' },
  { brand: 'MADEIRA', code: '0406', name: 'Dark salmon', rgb: '#cf6065' },

  // Oranges + yellows + golds
  { brand: 'MADEIRA', code: '0202', name: 'Tangerine', rgb: '#ef7e2b' },
  { brand: 'MADEIRA', code: '0203', name: 'Bright orange', rgb: '#f3984c' },
  { brand: 'MADEIRA', code: '0204', name: 'Light orange', rgb: '#f6b65b' },
  { brand: 'MADEIRA', code: '0114', name: 'Yellow', rgb: '#f3cb6a' },
  { brand: 'MADEIRA', code: '0112', name: 'Pale yellow', rgb: '#f6dd84' },
  { brand: 'MADEIRA', code: '0111', name: 'Light pale yellow', rgb: '#f7e6a6' },
  { brand: 'MADEIRA', code: '0113', name: 'Topaz', rgb: '#eebe45' },
  { brand: 'MADEIRA', code: '0109', name: 'Light topaz', rgb: '#f0cd5b' },
  { brand: 'MADEIRA', code: '0110', name: 'Very light topaz', rgb: '#f5e0a3' },
  { brand: 'MADEIRA', code: '2208', name: 'Light old gold', rgb: '#dbb56a' },
  { brand: 'MADEIRA', code: '2207', name: 'Very light old gold', rgb: '#e5cc94' },
  { brand: 'MADEIRA', code: '2209', name: 'Medium old gold', rgb: '#c69b51' },
  { brand: 'MADEIRA', code: '2214', name: 'Very dark topaz', rgb: '#8e631c' },
  { brand: 'MADEIRA', code: '2213', name: 'Dark topaz', rgb: '#a37a23' },

  // Browns + tans
  { brand: 'MADEIRA', code: '2008', name: 'Coffee brown', rgb: '#5c3814' },
  { brand: 'MADEIRA', code: '2005', name: 'Very dark beige brown', rgb: '#4f3b2c' },
  { brand: 'MADEIRA', code: '2004', name: 'Dark beige brown', rgb: '#615041' },
  { brand: 'MADEIRA', code: '1913', name: 'Medium beige brown', rgb: '#937a5e' },
  { brand: 'MADEIRA', code: '1912', name: 'Light beige brown', rgb: '#a6896f' },
  { brand: 'MADEIRA', code: '1910', name: 'Very light beige brown', rgb: '#c0a585' },
  { brand: 'MADEIRA', code: '2008', name: 'Medium brown', rgb: '#7a4a2a' },
  { brand: 'MADEIRA', code: '2009', name: 'Light brown', rgb: '#9a6635' },
  { brand: 'MADEIRA', code: '2010', name: 'Very light brown', rgb: '#b08247' },
  { brand: 'MADEIRA', code: '2011', name: 'Tan', rgb: '#c79b65' },
  { brand: 'MADEIRA', code: '2012', name: 'Light tan', rgb: '#d9b585' },
  { brand: 'MADEIRA', code: '2013', name: 'Very light tan', rgb: '#e8cea7' },
  { brand: 'MADEIRA', code: '2014', name: 'Ultra very light tan', rgb: '#f0deba' },

  // Greens — parrot / avocado / forest / fern / sage
  { brand: 'MADEIRA', code: '1413', name: 'Very dark parrot green', rgb: '#447a31' },
  { brand: 'MADEIRA', code: '1412', name: 'Dark parrot green', rgb: '#56933b' },
  { brand: 'MADEIRA', code: '1411', name: 'Medium parrot green', rgb: '#76ad57' },
  { brand: 'MADEIRA', code: '1410', name: 'Light parrot green', rgb: '#95c570' },
  { brand: 'MADEIRA', code: '1503', name: 'Light avocado green', rgb: '#789a36' },
  { brand: 'MADEIRA', code: '1502', name: 'Very light avocado green', rgb: '#a5b76b' },
  { brand: 'MADEIRA', code: '1501', name: 'Ultra light avocado green', rgb: '#c1cf90' },
  { brand: 'MADEIRA', code: '1505', name: 'Avocado green', rgb: '#5a7b21' },
  { brand: 'MADEIRA', code: '1504', name: 'Medium avocado green', rgb: '#506d23' },
  { brand: 'MADEIRA', code: '1507', name: 'Very dark avocado green', rgb: '#3a5118' },
  { brand: 'MADEIRA', code: '1506', name: 'Dark avocado green', rgb: '#48631c' },
  { brand: 'MADEIRA', code: '1407', name: 'Hunter green', rgb: '#587042' },
  { brand: 'MADEIRA', code: '1408', name: 'Medium yellow green', rgb: '#7a9061' },
  { brand: 'MADEIRA', code: '1409', name: 'Light yellow green', rgb: '#bcd190' },
  { brand: 'MADEIRA', code: '1314', name: 'Medium forest green', rgb: '#6a8a4a' },
  { brand: 'MADEIRA', code: '1313', name: 'Dark forest green', rgb: '#557236' },
  { brand: 'MADEIRA', code: '1312', name: 'Very dark forest green', rgb: '#3e5727' },
  { brand: 'MADEIRA', code: '1513', name: 'Fern green', rgb: '#8a9778' },
  { brand: 'MADEIRA', code: '1602', name: 'Light fern green', rgb: '#9aa886' },
  { brand: 'MADEIRA', code: '1601', name: 'Very light fern green', rgb: '#b0bb96' },
  { brand: 'MADEIRA', code: '1509', name: 'Medium green grey', rgb: '#82906f' },
  { brand: 'MADEIRA', code: '1510', name: 'Green grey', rgb: '#9aa787' },
  { brand: 'MADEIRA', code: '1511', name: 'Dark green grey', rgb: '#5e6b48' },
  { brand: 'MADEIRA', code: '1705', name: 'Very dark blue green', rgb: '#1f3e30' },
  { brand: 'MADEIRA', code: '1704', name: 'Dark blue green', rgb: '#33574b' },
  { brand: 'MADEIRA', code: '1703', name: 'Blue green', rgb: '#5c8174' },
  { brand: 'MADEIRA', code: '1702', name: 'Medium blue green', rgb: '#83a59a' },
  { brand: 'MADEIRA', code: '1701', name: 'Light blue green', rgb: '#bdd1c5' },
  { brand: 'MADEIRA', code: '1213', name: 'Dark celadon green', rgb: '#46715a' },
  { brand: 'MADEIRA', code: '1212', name: 'Celadon green', rgb: '#74957f' },
  { brand: 'MADEIRA', code: '1211', name: 'Light celadon green', rgb: '#9eb7a4' },

  // Blues — navy / baby / delft / royal / wedgewood
  { brand: 'MADEIRA', code: '1007', name: 'Medium navy blue', rgb: '#22426d' },
  { brand: 'MADEIRA', code: '1006', name: 'Very dark baby blue', rgb: '#385778' },
  { brand: 'MADEIRA', code: '1005', name: 'Dark baby blue', rgb: '#577998' },
  { brand: 'MADEIRA', code: '1004', name: 'Medium baby blue', rgb: '#7d9bba' },
  { brand: 'MADEIRA', code: '1001', name: 'Very light baby blue', rgb: '#cbdbe6' },
  { brand: 'MADEIRA', code: '0910', name: 'Medium delft blue', rgb: '#6585b3' },
  { brand: 'MADEIRA', code: '0908', name: 'Pale delft blue', rgb: '#a8bcd9' },
  { brand: 'MADEIRA', code: '0911', name: 'Dark delft blue', rgb: '#42679a' },
  { brand: 'MADEIRA', code: '0912', name: 'Royal blue', rgb: '#2c4f8e' },
  { brand: 'MADEIRA', code: '0913', name: 'Dark royal blue', rgb: '#1f4078' },
  { brand: 'MADEIRA', code: '0914', name: 'Very dark royal blue', rgb: '#1a3470' },
  { brand: 'MADEIRA', code: '1011', name: 'Very dark blue', rgb: '#34588e' },
  { brand: 'MADEIRA', code: '1010', name: 'Dark blue', rgb: '#3b6a99' },
  { brand: 'MADEIRA', code: '1009', name: 'Medium blue', rgb: '#578bae' },
  { brand: 'MADEIRA', code: '1101', name: 'Very light blue', rgb: '#bad1e2' },
  { brand: 'MADEIRA', code: '1708', name: 'Very dark antique blue', rgb: '#33536b' },
  { brand: 'MADEIRA', code: '1108', name: 'Medium wedgewood', rgb: '#3f7798' },
  { brand: 'MADEIRA', code: '1101', name: 'Light sky blue', rgb: '#a3c8d6' },
  { brand: 'MADEIRA', code: '1102', name: 'Light peacock blue', rgb: '#5e9eb1' },
  { brand: 'MADEIRA', code: '1107', name: 'Dark wedgewood', rgb: '#406d80' },
  { brand: 'MADEIRA', code: '1106', name: 'Light wedgewood', rgb: '#5e899d' },
  { brand: 'MADEIRA', code: '1105', name: 'Sky blue', rgb: '#92b7c5' },

  // Violets + lavenders
  { brand: 'MADEIRA', code: '0713', name: 'Very dark violet', rgb: '#682a72' },
  { brand: 'MADEIRA', code: '0712', name: 'Medium violet', rgb: '#8a4794' },
  { brand: 'MADEIRA', code: '0711', name: 'Violet', rgb: '#9c6cae' },
  { brand: 'MADEIRA', code: '0710', name: 'Light violet', rgb: '#cba9d4' },
  { brand: 'MADEIRA', code: '0804', name: 'Very dark lavender', rgb: '#6a3b89' },
  { brand: 'MADEIRA', code: '0803', name: 'Dark lavender', rgb: '#8460a3' },
  { brand: 'MADEIRA', code: '0802', name: 'Medium lavender', rgb: '#a387b5' },
  { brand: 'MADEIRA', code: '0801', name: 'Light lavender', rgb: '#c4adcc' },
  { brand: 'MADEIRA', code: '0714', name: 'Ultra dark lavender', rgb: '#5b2e80' },
  { brand: 'MADEIRA', code: '0902', name: 'Medium dark blue violet', rgb: '#776fa9' },
  { brand: 'MADEIRA', code: '0901', name: 'Medium light blue violet', rgb: '#9aa1cc' },
  { brand: 'MADEIRA', code: '0903', name: 'Very light cornflower blue', rgb: '#bcc4e0' },
  { brand: 'MADEIRA', code: '1006', name: 'Medium very dark cornflower blue', rgb: '#43447a' },

  // Bright + Christmas greens, olives, brown greys
  { brand: 'MADEIRA', code: '1307', name: 'Chartreuse', rgb: '#8fb33a' },
  { brand: 'MADEIRA', code: '1308', name: 'Bright chartreuse', rgb: '#b2cb55' },
  { brand: 'MADEIRA', code: '1305', name: 'Kelly green', rgb: '#4ca353' },
  { brand: 'MADEIRA', code: '1304', name: 'Light Christmas green', rgb: '#3a8b3a' },
  { brand: 'MADEIRA', code: '1303', name: 'Bright Christmas green', rgb: '#247a36' },
  { brand: 'MADEIRA', code: '1302', name: 'Dark Christmas green', rgb: '#1f6427' },
  { brand: 'MADEIRA', code: '2113', name: 'Very dark olive green', rgb: '#5c5018' },
  { brand: 'MADEIRA', code: '2112', name: 'Dark olive green', rgb: '#6b5d23' },
  { brand: 'MADEIRA', code: '2111', name: 'Olive green', rgb: '#7a6c2c' },
  { brand: 'MADEIRA', code: '2110', name: 'Medium olive green', rgb: '#a3935b' },
  { brand: 'MADEIRA', code: '2109', name: 'Light olive green', rgb: '#c4b389' },
  { brand: 'MADEIRA', code: '1903', name: 'Light brown grey', rgb: '#a89e85' },
  { brand: 'MADEIRA', code: '1902', name: 'Very light brown grey', rgb: '#cac4ab' },
  { brand: 'MADEIRA', code: '1904', name: 'Medium brown grey', rgb: '#8d8568' },
]
