/**
 * Chart symbol assignment.
 *
 * A cross-stitch chart is only as good as its symbols. Two colours that sit
 * next to each other in the picture and carry near-identical glyphs — ◐ beside
 * ◑, ▴ beside ▵, ○ beside ◯ — cost the stitcher a trip to the key on every
 * stitch, and that is the complaint dense charts attract most often.
 *
 * So symbols are not handed out in catalogue order. Every glyph carries two
 * pieces of metadata:
 *
 *   family  A confusable group. Glyphs in one family read as the same mark at
 *           printed size: the half-filled circles are one family, the small
 *           triangles another, filled and hollow of the same outline a third.
 *           Two colours that touch in the chart never share a family, and two
 *           colours that look alike never share one either.
 *
 *   weight  'light' for hollow, thin-stroke glyphs; 'solid' for everything
 *           with real ink in it. The renderer draws a symbol in near-white on
 *           a dark cell and near-black on a pale one (`symbolOnFill`), so a
 *           light glyph earns its keep on dark floss and disappears on pale
 *           floss. Light glyphs are therefore reserved for dark floss.
 *
 * The catalogue is ordered most-distinctive first, and colours are served in
 * descending stitch count, so the colours the stitcher meets most often get
 * the marks that are hardest to mistake.
 *
 * Constraints are relaxed in a fixed order when a palette runs the pool dry,
 * and the adjacency rule is the very last to go — a confusable pair is
 * tolerable between two colours that never meet on the cloth, and never
 * tolerable between two that do.
 */

export type SymbolWeight = 'light' | 'solid'

export interface SymbolSpec {
  glyph: string
  /** Confusable group. Glyphs sharing one read as the same mark when small. */
  family: string
  weight: SymbolWeight
}

/**
 * Confusable groups, in catalogue order — most distinctive first.
 *
 * The head of the list is the set of marks a stitcher can tell apart across a
 * room: a cross, a disc, a triangle, a square, a diamond, a star, the card
 * suits. Letters and digits follow (legible, but a chart of nothing but
 * letters is hard to scan), then the geometric fill variants, then the
 * quadrant and block glyphs that only earn a place on a very dense chart.
 *
 * ── PAST 154 (September 2026) ─────────────────────────────────────────────
 * The tiers after those are what the 200–300 colour showpiece tier needs, and
 * they are ordered by how well a mark survives being printed at 3.2mm rather
 * than by how many of them there are:
 *
 *   E  Greek letterforms with no Latin twin      Γ Θ Λ Ξ Π Σ Φ Ψ Ω α β δ …
 *   F  Cyrillic letterforms, same rule           Б Д Ж З И Ц Ч Ш Щ Ъ Ы Э Ю Я
 *   G  the geometric shapes tier A left behind   ▼ ▽ ◊ ⬡ ◻ ◜ ╱ ┼ ┬ ┌ …
 *   H  mathematical marks — plain strokes        ∞ ≈ ≠ ≡ ≤ ≥ √ ∑ ∫ ⊕ ⊞ ⊥ …
 *   I  arrows                                    ← ↑ → ↓ ↔ ↕ ↗ ↩ ↺ ⇄ …
 *   J  letterlike and typographic marks          £ ¥ € § ¶ © ° ÷ Æ Ø Þ ð ß …
 *   K  pictorial marks — the last resort         ❄ ✿ ✂ ✈ ☀ ☂ ♪ ⚓ ⚙ ♞ ① …
 *
 * A letter or a stroke reads at stitch size; a little picture does not, which
 * is why the pictograms sit at the very back and a 300-colour chart never
 * reaches them.
 *
 * Every glyph here is inside the ranges DejaVu Sans covers, which is the font
 * the chart renderer and the PDF export both embed, so none render as tofu —
 * checked against the bundled `public/fonts/DejaVuSans.ttf` cmap, and held
 * there by a test.
 */
const FAMILY_ORDER: Array<{ family: string; glyphs: string[] }> = [
  // ── Tier A: the iconic marks, readable across a room ───────────────────
  { family: 'ex', glyphs: ['×', '✕', 'X', '✗', '✘', '✖', '╳', 'χ'] },
  { family: 'circle', glyphs: ['●', '○', '◯', '◌', '⬤', '⚫', '⚪', '◦', '°'] },
  { family: 'triangle-up', glyphs: ['▲', '△', 'Δ'] },
  { family: 'square', glyphs: ['■', '□', '▣', '▢', '◼', '◻', '▪', '▫', '◾', '◽', '⊡'] },
  { family: 'diamond', glyphs: ['◆', '◇', '◊', '◈'] },
  { family: 'star', glyphs: ['★', '☆', '✩', '⋆'] },
  { family: 'plus', glyphs: ['✚', '✜', '✛', '✢'] },
  { family: 'heart', glyphs: ['♥', '♡', '❤', '❥'] },
  { family: 'spade', glyphs: ['♠', '♤'] },
  { family: 'club', glyphs: ['♣', '♧'] },
  { family: 'suit-diamond', glyphs: ['♦', '♢'] },
  { family: 'sparkle', glyphs: ['✦', '✱', '✧', '✳'] },
  { family: 'polygon', glyphs: ['⬟', '⬢', '⬣', '⬠', '⬡', '⬚'] },
  { family: 'circle-dot', glyphs: ['◉', '◎', '◍'] },
  { family: 'triangle-large', glyphs: ['►', '◄', '▻', '◅', '▶', '◀', '▷', '◁'] },
  // The small directional triangles are one group: at printed size ▴ ▵ ▸ ▹
  // ▾ ▿ ◂ ◃ are the same speck of ink pointing somewhere.
  { family: 'triangle-small', glyphs: ['▴', '▵', '▸', '▹', '▾', '▿', '◂', '◃'] },
  { family: 'triangle-down', glyphs: ['▼', '▽', '∇'] },
  { family: 'half-circle', glyphs: ['◐', '◑', '◒', '◓', '◚', '◛'] },

  // ── Tier B: letters and digits, one family per confusable set ──────────
  // A Greek or Cyrillic letter that shares a Latin letter's shape shares its
  // family too: β and ß are B, ρ is p, И is N, Я is R. The alphabet a glyph
  // comes from is not something a stitcher can see.
  { family: 'oval', glyphs: ['O', '0', 'Q', 'D', 'Ø', 'ø', 'Ð'] },
  { family: 'ess', glyphs: ['S', 's', '5'] },
  { family: 'aitch', glyphs: ['H', 'h'] },
  { family: 'em', glyphs: ['M', 'm'] },
  { family: 'dubya', glyphs: ['W', 'w'] },
  { family: 'kay', glyphs: ['K', 'k'] },
  { family: 'ay', glyphs: ['A', 'a', 'Λ', 'λ', 'Æ', 'æ', '∧', '⋀'] },
  { family: 'eff', glyphs: ['E', 'F'] },
  { family: 'eff-lower', glyphs: ['e', 'f', 'ε', 'ϵ'] },
  { family: 'arr', glyphs: ['R', 'r', 'Я', 'я'] },
  { family: 'tee', glyphs: ['T', 't', 'τ'] },
  { family: 'zed', glyphs: ['Z', 'z', '2', 'ζ'] },
  { family: 'gee', glyphs: ['G', '6'] },
  { family: 'nine', glyphs: ['9', 'g', 'q'] },
  { family: 'bee', glyphs: ['B', '8', 'b', 'Б', 'б', 'β', 'ß'] },
  { family: 'pee', glyphs: ['P', 'p', 'ρ', 'Þ', 'þ'] },
  { family: 'en', glyphs: ['N', 'n', 'η', 'И', 'и'] },
  { family: 'why', glyphs: ['Y', 'y', 'γ'] },
  { family: 'cee', glyphs: ['C', 'c', 'Э', 'э', '⊂', '⊆', '⊃', '⊇'] },
  { family: 'yoo', glyphs: ['U', 'u', 'μ', 'µ', 'Ц', 'ц'] },
  { family: 'vee', glyphs: ['V', 'v', 'ν', '∨', '⋁'] },
  { family: 'jay', glyphs: ['J', 'j'] },
  { family: 'ell', glyphs: ['L'] },
  { family: 'eye', glyphs: ['I', '1', '¦'] },
  { family: 'dee', glyphs: ['d', 'δ', '∂'] },
  { family: 'three', glyphs: ['3', 'З', 'з'] },
  { family: 'four', glyphs: ['4', 'Ч', 'ч'] },
  { family: 'seven', glyphs: ['7'] },

  // ── Tier C: partly-filled shapes ───────────────────────────────────────
  { family: 'quarter-circle', glyphs: ['◔', '◕'] },
  { family: 'half-disc', glyphs: ['◖', '◗'] },
  { family: 'inverse-circle', glyphs: ['◘', '◙'] },
  { family: 'half-square', glyphs: ['◧', '◨', '◩', '◪', '◫'] },
  { family: 'quadrant-square', glyphs: ['◰', '◱', '◲', '◳'] },
  { family: 'quadrant-circle', glyphs: ['◴', '◵', '◶', '◷'] },
  { family: 'corner-triangle', glyphs: ['◢', '◣', '◤', '◥', '◸', '◹', '◺', '◿'] },
  { family: 'bar-horizontal', glyphs: ['▬', '▭'] },
  { family: 'bar-vertical', glyphs: ['▮', '▯'] },
  { family: 'parallelogram', glyphs: ['▰', '▱'] },

  // ── Tier D: hatches and blocks — only reached on a very dense chart ────
  { family: 'square-lined', glyphs: ['▤', '▥'] },
  { family: 'square-grid', glyphs: ['▦', '▩'] },
  { family: 'square-diagonal', glyphs: ['▧', '▨'] },
  { family: 'block-large', glyphs: ['▙', '▛', '▜', '▟'] },
  { family: 'block-diagonal', glyphs: ['▚', '▞'] },
  { family: 'block-small', glyphs: ['▖', '▗', '▘', '▝'] },

  // ── Tier E: Greek letterforms with no Latin twin ───────────────────────
  { family: 'gamma', glyphs: ['Γ'] },
  { family: 'theta', glyphs: ['Θ', 'θ', 'ϑ'] },
  { family: 'xi', glyphs: ['ξ'] },
  { family: 'pi', glyphs: ['Π', 'π', 'ϖ'] },
  { family: 'sigma', glyphs: ['Σ', 'σ', 'ς', '∑', '∐'] },
  { family: 'phi', glyphs: ['Φ', 'φ', 'ϕ', 'Ф'] },
  { family: 'psi', glyphs: ['Ψ', 'ψ'] },
  { family: 'omega', glyphs: ['Ω', 'ω'] },
  { family: 'alpha', glyphs: ['α'] },
  { family: 'upsilon', glyphs: ['υ'] },

  // ── Tier F: Cyrillic letterforms with no Latin or Greek twin ───────────
  { family: 'de-cyr', glyphs: ['Д', 'д'] },
  { family: 'zhe-cyr', glyphs: ['Ж', 'ж'] },
  { family: 'i-short-cyr', glyphs: ['Й', 'й'] },
  { family: 'sha-cyr', glyphs: ['Ш', 'ш', 'Щ', 'щ'] },
  { family: 'soft-sign-cyr', glyphs: ['Ь', 'ь', 'Ъ', 'ъ', 'Ы', 'ы'] },
  { family: 'yu-cyr', glyphs: ['Ю', 'ю'] },
  { family: 'dje-cyr', glyphs: ['Ђ', 'Ћ'] },
  { family: 'lje-cyr', glyphs: ['Љ', 'Њ'] },
  { family: 'yus-cyr', glyphs: ['Ѧ', 'Ѫ'] },

  // ── Tier G: the line shapes the first tiers left behind ────────────────
  { family: 'arc', glyphs: ['◜', '◝', '◞', '◟', '◠', '◡'] },
  { family: 'diagonal', glyphs: ['╱', '╲'] },
  { family: 'box-cross', glyphs: ['┼', '╋', '╬', '╪', '╫'] },
  { family: 'box-tee', glyphs: ['┬', '┴', '├', '┤', '╦', '╩', '╠', '╣'] },
  { family: 'box-corner', glyphs: ['┌', '┐', '└', '┘', '╭', '╮', '╯', '╰'] },

  // ── Tier H: mathematical marks — plain strokes, legible small ──────────
  { family: 'infinity', glyphs: ['∞'] },
  { family: 'approx', glyphs: ['≈', '∼', '≃', '≅'] },
  { family: 'not-equal', glyphs: ['≠', '≢'] },
  { family: 'identical', glyphs: ['≡', '≣', 'Ξ'] },
  { family: 'less-equal', glyphs: ['≤', '≦'] },
  { family: 'greater-equal', glyphs: ['≥', '≧'] },
  { family: 'root', glyphs: ['√', '∛', '✓', '✔'] },
  { family: 'integral', glyphs: ['∫', '∬', '∮'] },
  { family: 'cap-cup', glyphs: ['∩', '∪', '⋂', '⋃', '⊓', '⊔', '⊏', '⊐'] },
  { family: 'circled-op', glyphs: ['⊕', '⊖', '⊘', '⊗', '⊛'] },
  { family: 'boxed-op', glyphs: ['⊞', '⊟', '⊠'] },
  { family: 'turnstile', glyphs: ['⊥', '⊤', '⊢', '⊣'] },
  { family: 'bowtie', glyphs: ['⋈', '⋉', '⋊'] },
  { family: 'angle', glyphs: ['∠', '∡', '∢'] },
  { family: 'element', glyphs: ['∈', '∋', '∉'] },
  { family: 'forall', glyphs: ['∀'] },
  { family: 'exists', glyphs: ['∃', '∄'] },
  { family: 'therefore', glyphs: ['∴', '∵'] },
  { family: 'proportional', glyphs: ['∝'] },

  // ── Tier I: arrows ─────────────────────────────────────────────────────
  { family: 'arrow-left', glyphs: ['←', '⇐', '⟵'] },
  { family: 'arrow-up', glyphs: ['↑', '⇑'] },
  { family: 'arrow-right', glyphs: ['→', '⇒', '⟶'] },
  { family: 'arrow-down', glyphs: ['↓', '⇓'] },
  { family: 'arrow-leftright', glyphs: ['↔', '⇔', '⟷'] },
  { family: 'arrow-updown', glyphs: ['↕', '⇕'] },
  { family: 'arrow-ne', glyphs: ['↗', '⇗'] },
  { family: 'arrow-nw', glyphs: ['↖', '⇖'] },
  { family: 'arrow-se', glyphs: ['↘', '⇘'] },
  { family: 'arrow-sw', glyphs: ['↙', '⇙'] },
  { family: 'arrow-hook', glyphs: ['↩', '↪', '↰', '↱', '↲', '↳'] },
  { family: 'arrow-loop', glyphs: ['↺', '↻', '⟲', '⟳'] },
  { family: 'arrow-pair', glyphs: ['⇄', '⇅', '⇆', '⇈', '⇉', '⇊'] },

  // ── Tier J: letterlike and typographic marks ───────────────────────────
  { family: 'sterling', glyphs: ['£'] },
  { family: 'yen', glyphs: ['¥'] },
  { family: 'euro', glyphs: ['€'] },
  { family: 'cent', glyphs: ['¢'] },
  { family: 'section', glyphs: ['§'] },
  { family: 'pilcrow', glyphs: ['¶'] },
  { family: 'copyright', glyphs: ['©', '®'] },
  { family: 'plus-minus', glyphs: ['±'] },
  { family: 'divide', glyphs: ['÷'] },
  { family: 'eth', glyphs: ['ð'] },
  { family: 'cross-mark', glyphs: ['†', '‡', '✝', '✞', '✟', '✠', '☩', '☦'] },
  { family: 'inverted-punctuation', glyphs: ['¿', '¡'] },
  { family: 'guillemet', glyphs: ['«', '»'] },
  { family: 'ampersand', glyphs: ['&'] },
  { family: 'at-sign', glyphs: ['@'] },
  { family: 'hash', glyphs: ['#'] },
  { family: 'percent', glyphs: ['%', '‰'] },
  { family: 'interrobang', glyphs: ['‽'] },
  { family: 'bang', glyphs: ['!', '‼'] },

  // ── Tier K: pictorial marks — the last resort ──────────────────────────
  // A little picture is the least legible thing on a printed chart, so these
  // sit at the very back: a 300-colour showpiece barely reaches them, and a
  // palette that goes past them has run out of strokes and lines to give it.
  { family: 'snowflake', glyphs: ['❄', '❅', '❆'] },
  { family: 'flower', glyphs: ['✿', '❀', '❁', '✾', '❃'] },
  { family: 'star-fancy', glyphs: ['✪', '✫', '✭', '✮', '✯', '✰'] },
  { family: 'burst', glyphs: ['✶', '✷', '✸', '✹', '✺', '✴', '✵'] },
  { family: 'pinwheel', glyphs: ['✻', '✼', '✽', '❋'] },
  { family: 'scissors', glyphs: ['✂', '✁', '✃', '✄'] },
  { family: 'envelope', glyphs: ['✉', '✇', '✆'] },
  { family: 'aeroplane', glyphs: ['✈'] },
  { family: 'hand', glyphs: ['✌', '☚', '☛', '☜', '☝', '☞', '☟'] },
  { family: 'sun', glyphs: ['☀', '☼', '☉'] },
  { family: 'cloud', glyphs: ['☁'] },
  { family: 'umbrella', glyphs: ['☂', '☔'] },
  { family: 'snowman', glyphs: ['☃'] },
  { family: 'telephone', glyphs: ['☎', '☏'] },
  { family: 'skull', glyphs: ['☠'] },
  { family: 'yin-yang', glyphs: ['☯', '☮'] },
  { family: 'smiley', glyphs: ['☺', '☻', '☹'] },
  { family: 'moon-quarter', glyphs: ['☽', '☾'] },
  { family: 'venus', glyphs: ['♀'] },
  { family: 'mars', glyphs: ['♂'] },
  { family: 'note', glyphs: ['♪', '♫', '♩', '♬'] },
  { family: 'accidental', glyphs: ['♭', '♮', '♯'] },
  { family: 'anchor', glyphs: ['⚓'] },
  { family: 'flag', glyphs: ['⚑', '⚐'] },
  { family: 'gear', glyphs: ['⚙'] },
  { family: 'fleur', glyphs: ['⚜'] },
  { family: 'warning', glyphs: ['⚠', '⚡'] },
  { family: 'arrow-fat-right', glyphs: ['➤', '➔', '➜', '➝', '➞', '➟', '➠', '➡', '➢', '➣'] },
]

/**
 * Hollow and thin-stroke glyphs. The renderer draws a symbol in near-white on
 * a dark cell, so these read well there and wash out on pale floss.
 */
const LIGHT_GLYPHS = new Set([
  '○', '◯', '◌', '◎', '△', '▵', '▿', '▹', '◃', '▻', '◅',
  '□', '▢', '◇', '☆', '♤', '♧', '♡', '♢', '✧',
  '▭', '▯', '▱', 'I', '1', 'J', 'j', 'T', 't', 'v', 'y', 'r', 'c', '7',
  // Tier G onwards: hollow shapes, double-stroke arrows and the single-line
  // box pieces. All of them are outline rather than ink, so they belong on
  // dark floss for the same reason the originals do.
  '▽', '∇', '▷', '◁', '◊', '⚪', '◦', '⬡', '⬠', '⬚',
  '◻', '◽', '▫', '◜', '◝', '◞', '◟', '◠', '◡', '◸', '◹', '◺', '◿', '◚', '◛',
  '╱', '╲', '╳', '┼', '┬', '┴', '├', '┤', '┌', '┐', '└', '┘', '╭', '╮', '╯', '╰',
  '⇐', '⇑', '⇒', '⇓', '⇔', '⇕', '⇗', '⇖', '⇘', '⇙',
  '⊘', '⊖', '⊟', '⊐', '⊏', '⊤', '⊣', '∼', '¦', '†', '‡', '¡', '¿', '′', 'ι', 'ς',
])

/**
 * Flattened round-robin: one glyph from every family before any family gives
 * up a second. The first pass through the catalogue is therefore a set of
 * mutually distinct marks, which is what a chart of forty colours draws on,
 * and the later passes are the variants a showpiece needs.
 */
const PLAIN_SPECS: SymbolSpec[] = (() => {
  const out: SymbolSpec[] = []
  const deepest = Math.max(...FAMILY_ORDER.map((f) => f.glyphs.length))
  for (let round = 0; round < deepest; round++) {
    for (const f of FAMILY_ORDER) {
      const glyph = f.glyphs[round]
      if (glyph === undefined) continue
      out.push({
        glyph,
        family: f.family,
        weight: LIGHT_GLYPHS.has(glyph) ? 'light' : 'solid',
      })
    }
  }
  return out
})()

// ───────────────────────────────────────────────────────────────────────────
// The second channel: a rule under or over the glyph
// ───────────────────────────────────────────────────────────────────────────

/**
 * THE OVERFLOW CHANNEL.
 *
 * The glyph catalogue above is the first channel and carries several hundred
 * marks, which is more than the 200–300 a full-coverage showpiece asks for. The
 * second channel is what makes the ceiling a matter of arithmetic rather than
 * of how many shapes exist: the same glyph worn with a rule under it, or a rule
 * over it, is a different symbol — one a stitcher tells apart at a glance
 * because the extra mark sits outside the letterform rather than inside it.
 *
 * It is deliberately LAST. A chart only reaches it once every plain glyph is
 * spoken for, so the ordinary catalogue keeps its plain marks and nothing that
 * ships today changes.
 *
 * ── HOW IT IS CARRIED ─────────────────────────────────────────────────────
 * The pattern schema keys a cell to its palette entry by the `symbol` STRING,
 * and refuses two entries with the same one. So the decoration lives in the
 * string: the base glyph followed by a combining mark — U+0332 COMBINING LOW
 * LINE for the under-rule, U+0305 COMBINING OVERLINE for the over-rule. Both
 * are inside DejaVu Sans, the font the chart renderer and the PDF export embed.
 *
 * That encoding was chosen because it degrades correctly. Anything that simply
 * prints the string — the Studio floss key, the public chart key, a copy-paste
 * into an email — composes the mark onto the glyph itself, which is exactly the
 * intended picture. The two renderers that place glyphs by hand (the chart SVG
 * and the printed PDF) do not rely on that: they split the string with
 * `parseSymbol` and draw the rule as a real line, so its weight and position are
 * the same at every size and on every printer.
 */
export type SymbolDecoration = 'none' | 'under' | 'over'

/** Combining marks, in the order the overflow tiers are handed out. */
export const DECORATION_MARK: Record<Exclude<SymbolDecoration, 'none'>, string> = {
  under: '\u0332',
  over: '\u0305',
}

const DECORATION_ORDER: Array<Exclude<SymbolDecoration, 'none'>> = ['under', 'over']

/** Build the symbol string for a base glyph plus a decoration. */
export function decorateSymbol(glyph: string, decoration: SymbolDecoration): string {
  return decoration === 'none' ? glyph : `${glyph}${DECORATION_MARK[decoration]}`
}

/**
 * Split a palette symbol into the glyph to draw and the rule to draw with it.
 *
 * Total: anything that is not one of the two known marks stays part of the
 * glyph, so an imported chart carrying some other combining character is drawn
 * as it always was rather than silently losing a mark.
 */
export function parseSymbol(symbol: string): { glyph: string; decoration: SymbolDecoration } {
  for (const decoration of DECORATION_ORDER) {
    const mark = DECORATION_MARK[decoration]
    if (symbol.length > mark.length && symbol.endsWith(mark)) {
      return { glyph: symbol.slice(0, -mark.length), decoration }
    }
  }
  return { glyph: symbol, decoration: 'none' }
}

/**
 * Every symbol a chart may carry, plain marks first and then each decoration
 * tier in turn. A family is the SAME family whatever rule it wears — an
 * under-ruled disc still reads as a disc — so the adjacency and lookalike rules
 * keep a plain and a ruled variant of one glyph away from colours that touch.
 */
export const SYMBOL_SPECS: SymbolSpec[] = [
  ...PLAIN_SPECS,
  ...DECORATION_ORDER.flatMap((decoration) =>
    PLAIN_SPECS.map((spec) => ({
      glyph: decorateSymbol(spec.glyph, decoration),
      family: spec.family,
      weight: spec.weight,
    })),
  ),
]

/** Catalogue order, distinctive first. The chart symbol vocabulary. */
export const SYMBOL_GLYPHS: string[] = SYMBOL_SPECS.map((s) => s.glyph)

/** The plain, single-codepoint half of the catalogue. */
export const PLAIN_SYMBOL_GLYPHS: string[] = PLAIN_SPECS.map((s) => s.glyph)

const SPEC_BY_GLYPH = new Map(SYMBOL_SPECS.map((s) => [s.glyph, s]))

export function symbolSpec(glyph: string): SymbolSpec | undefined {
  return SPEC_BY_GLYPH.get(glyph)
}

/**
 * Luminance cut at which the renderer switches from dark ink to light ink
 * (`symbolOnFill` in render-helpers). At or below it the glyph is drawn in
 * near-white, which is exactly where a light-weight glyph belongs.
 */
const DARK_FLOSS_LUMINANCE = 0.58

/**
 * Two colours closer than this in RGB read as the same colour on a printed
 * chart, so they get glyphs from different families even when they never
 * touch. 52 is about the gap between two adjacent DMC shades of one hue.
 */
const CLOSE_COLOUR_DISTANCE = 52

export interface SymbolColour {
  /** Caller's stable id for the colour — a floss code, usually. */
  key: string
  /** '#rrggbb' as the chart will print it. */
  rgb: string
  /** Stitch count. The busiest colours are served first. */
  count: number
}

/**
 * Assign one distinct glyph per colour.
 *
 * `adjacency` maps a colour key to the keys it touches anywhere in the chart
 * (8-neighbourhood). Pass an empty map to assign on colour similarity alone.
 *
 * Returns key → glyph. When there are more colours than glyphs in the
 * catalogue the surplus gets '?', which is the behaviour the caller's clamp
 * exists to prevent.
 */
export function assignChartSymbols(
  colours: SymbolColour[],
  adjacency: Map<string, Set<string>>,
): Map<string, string> {
  // Busiest colour first, with a deterministic tie-break so the same chart
  // always produces the same key.
  const order = colours
    .slice()
    .sort((a, b) => b.count - a.count || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))

  const luminance = new Map(order.map((c) => [c.key, relativeLuminance(c.rgb)]))
  const rgbTuple = new Map(order.map((c) => [c.key, hexToRgb(c.rgb)]))

  const assigned = new Map<string, string>()
  /** Family → the colour keys already carrying a glyph from it. */
  const familyUsers = new Map<string, string[]>()
  const usedGlyphs = new Set<string>()

  for (const colour of order) {
    const neighbours = adjacency.get(colour.key) ?? EMPTY_SET
    const isDark = (luminance.get(colour.key) ?? 1) <= DARK_FLOSS_LUMINANCE
    const mine = rgbTuple.get(colour.key)!

    // A family clashes when a colour already using it touches this one, or
    // looks enough like it that the pair would be read as one colour.
    const familyClashes = (family: string): { touching: boolean; lookalike: boolean } => {
      let touching = false
      let lookalike = false
      for (const other of familyUsers.get(family) ?? []) {
        if (neighbours.has(other)) touching = true
        const theirs = rgbTuple.get(other)
        if (theirs && rgbDistance(mine, theirs) < CLOSE_COLOUR_DISTANCE) lookalike = true
      }
      return { touching, lookalike }
    }

    // Relaxations, strictest first. The adjacency rule survives longest: a
    // confusable pair is fine between colours that never meet, and never fine
    // between two that do.
    const stages: Array<(spec: SymbolSpec) => boolean> = [
      // 1. A family nobody has touched at all, correct weight for the floss.
      (spec) => !familyUsers.has(spec.family) && weightFits(spec, isDark),
      // 2. Reuse a family, but not one an adjacent or lookalike colour holds.
      (spec) => {
        const c = familyClashes(spec.family)
        return !c.touching && !c.lookalike && weightFits(spec, isDark)
      },
      // 3. Give up the weight preference.
      (spec) => {
        const c = familyClashes(spec.family)
        return !c.touching && !c.lookalike
      },
    ]

    let chosen: SymbolSpec | undefined
    for (const accepts of stages) {
      chosen = SYMBOL_SPECS.find((spec) => !usedGlyphs.has(spec.glyph) && accepts(spec))
      if (chosen) break
    }

    // 4. Past that the palette has genuinely run the pool dry, so a family has
    //    to be shared with a colour of similar shade. Take the sharing that
    //    hurts least: the family whose existing holders sit furthest away in
    //    colour, and still never one an adjacent colour holds.
    if (!chosen) {
      let bestGap = -1
      for (const spec of SYMBOL_SPECS) {
        if (usedGlyphs.has(spec.glyph)) continue
        if (familyClashes(spec.family).touching) continue
        let gap = Number.POSITIVE_INFINITY
        for (const other of familyUsers.get(spec.family) ?? []) {
          const theirs = rgbTuple.get(other)
          if (theirs) gap = Math.min(gap, rgbDistance(mine, theirs))
        }
        if (gap > bestGap) {
          bestGap = gap
          chosen = spec
        }
      }
    }

    // 5. Nothing left that avoids a neighbour. Take the first free glyph.
    if (!chosen) chosen = SYMBOL_SPECS.find((spec) => !usedGlyphs.has(spec.glyph))

    const glyph = chosen?.glyph ?? '?'
    assigned.set(colour.key, glyph)
    if (chosen) {
      usedGlyphs.add(glyph)
      const users = familyUsers.get(chosen.family)
      if (users) users.push(colour.key)
      else familyUsers.set(chosen.family, [colour.key])
    }
  }

  return assigned
}

const EMPTY_SET: ReadonlySet<string> = new Set()

function weightFits(spec: SymbolSpec, isDarkFloss: boolean): boolean {
  return spec.weight === 'solid' || isDarkFloss
}

/**
 * Which colours touch which, over the 8-neighbourhood of the finished grid.
 * Built once from the cells the chart will actually carry, so it reflects the
 * chart after confetti reduction rather than the raw quantiser output.
 */
export function buildAdjacency(
  cells: Array<{ x: number; y: number; s: string }>,
  width: number,
  height: number,
): Map<string, Set<string>> {
  const at = new Map<number, string>()
  for (const c of cells) at.set(c.y * width + c.x, c.s)

  const adjacency = new Map<string, Set<string>>()
  const link = (a: string, b: string) => {
    if (a === b) return
    let sa = adjacency.get(a)
    if (!sa) adjacency.set(a, (sa = new Set()))
    sa.add(b)
    let sb = adjacency.get(b)
    if (!sb) adjacency.set(b, (sb = new Set()))
    sb.add(a)
  }

  // Right, down, down-right and down-left cover every 8-neighbour pair once.
  for (const c of cells) {
    for (const [dx, dy] of [
      [1, 0],
      [0, 1],
      [1, 1],
      [-1, 1],
    ] as const) {
      const nx = c.x + dx
      const ny = c.y + dy
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue
      const other = at.get(ny * width + nx)
      if (other !== undefined) link(c.s, other)
    }
  }
  return adjacency
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex)
  if (!m || !m[1]) return [0, 0, 0]
  const v = m[1]
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ]
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

function rgbDistance(a: [number, number, number], b: [number, number, number]): number {
  // Weighted Euclidean — cheap, and closer to how the eye ranks the channels
  // than a flat distance.
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]
  return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db) / Math.sqrt(9)
}
