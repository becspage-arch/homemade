/**
 * Yarn shade names.
 *
 * A tapestry pattern lists YARN, not floss, so the converted palette is named
 * the way a yarn band is: plain shade names a maker can shop by. There is no
 * DMC / Anchor / Madeira mapping here on purpose. Cross-stitch resolves its
 * colours against a floss table because floss codes are a real, buyable
 * standard; yarn has no cross-brand code, so a name and the colour itself is
 * the useful thing.
 */

export interface YarnShade {
  name: string
  hex: string
}

/** A working set of shade names covering the range a stash actually holds. */
export const YARN_SHADES: YarnShade[] = [
  { name: 'White', hex: '#f7f5f0' },
  { name: 'Cream', hex: '#efe6d2' },
  { name: 'Buttermilk', hex: '#f2e3b8' },
  { name: 'Oatmeal', hex: '#ddd0b8' },
  { name: 'Linen', hex: '#c9bda6' },
  { name: 'Silver', hex: '#c6c6c4' },
  { name: 'Storm', hex: '#9a9c9e' },
  { name: 'Slate', hex: '#6d7479' },
  { name: 'Charcoal', hex: '#41444a' },
  { name: 'Black', hex: '#1b1a19' },
  { name: 'Blush', hex: '#f0c9c1' },
  { name: 'Rose', hex: '#d98f92' },
  { name: 'Coral', hex: '#e2705c' },
  { name: 'Brick', hex: '#a9432f' },
  { name: 'Raspberry', hex: '#b83a5c' },
  { name: 'Wine', hex: '#6e2337' },
  { name: 'Fuchsia', hex: '#c1478f' },
  { name: 'Lilac', hex: '#bda6d1' },
  { name: 'Plum', hex: '#7a5486' },
  { name: 'Damson', hex: '#4b3352' },
  { name: 'Terracotta', hex: '#c4744c' },
  { name: 'Rust', hex: '#9c4a1e' },
  { name: 'Ochre', hex: '#c9902f' },
  { name: 'Mustard', hex: '#d4a520' },
  { name: 'Camel', hex: '#bb9264' },
  { name: 'Toffee', hex: '#9a6c40' },
  { name: 'Chocolate', hex: '#5b3a25' },
  { name: 'Mink', hex: '#8b7a6b' },
  { name: 'Mint', hex: '#b8ddc4' },
  { name: 'Sage', hex: '#9caf94' },
  { name: 'Moss', hex: '#7d8a4e' },
  { name: 'Olive', hex: '#5f6b34' },
  { name: 'Forest', hex: '#2f4a35' },
  { name: 'Duck egg', hex: '#a8ccc9' },
  { name: 'Teal', hex: '#2f7b7d' },
  { name: 'Petrol', hex: '#1f4b57' },
  { name: 'Sky', hex: '#9dc4e0' },
  { name: 'Denim', hex: '#5b7ba6' },
  { name: 'Cobalt', hex: '#2b4f9e' },
  { name: 'Navy', hex: '#22314f' },
  { name: 'Ink', hex: '#1a2233' },
]

/** '#rrggbb' → [r, g, b]. */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

/**
 * Name a set of yarn colours. Greedy nearest-name, each name used once, so a
 * palette never lists two shades called the same thing. Colours are handed to
 * this in the order they should claim names (most-used first reads best in the
 * key). Falls back to a numbered shade if the name list runs out.
 */
export function nameYarnColours(hexes: string[]): string[] {
  const taken = new Set<string>()
  return hexes.map((hex, i) => {
    const [r, g, b] = hexToRgb(hex)
    let best: string | null = null
    let bestD = Infinity
    for (const shade of YARN_SHADES) {
      if (taken.has(shade.name)) continue
      const [sr, sg, sb] = hexToRgb(shade.hex)
      const d = (r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2
      if (d < bestD) {
        bestD = d
        best = shade.name
      }
    }
    if (!best) best = `Shade ${i + 1}`
    taken.add(best)
    return best
  })
}
