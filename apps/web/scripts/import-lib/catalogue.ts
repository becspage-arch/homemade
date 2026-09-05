/**
 * The 36-pattern Stitching Mama catalogue. Derived from the folder shape
 * on Rebecca's K: drive — `Theme - Subject` per folder, with apostrophes
 * stripped (operating systems balking at the punctuation). This module
 * restores apostrophes for user-facing names and routes each pattern to
 * the right cross-stitch sub-category.
 *
 * Anything bespoke (description tweaks, alternative title casing) lives
 * in the OVERRIDES map at the bottom. Default behaviour: title-case the
 * subject, restore "I'm" / "Don't" / "I'll" apostrophes, route by theme.
 */

import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export type Theme = 'Elephant' | 'Flowers' | 'LGBTQ' | 'Mom' | 'Quote'
export type SubCategorySlug = 'animals' | 'floral' | 'quotes-and-sayings' | 'pride-and-inclusive'

const THEME_TO_SUBCAT: Record<Theme, SubCategorySlug> = {
  Elephant: 'animals',
  Flowers: 'floral',
  LGBTQ: 'pride-and-inclusive',
  Mom: 'quotes-and-sayings',
  Quote: 'quotes-and-sayings',
}

export interface CatalogueEntry {
  /** Source folder absolute path on K: drive. */
  folderPath: string
  /** Theme keyword from folder prefix. */
  theme: Theme
  /** User-facing name (apostrophes restored, title case as appropriate). */
  name: string
  /** Kebab-case slug for the Pattern row. */
  slug: string
  /** Sub-category slug under the cross-stitch category. */
  subCategorySlug: SubCategorySlug
  /** Stem used to find PDF / stitched.jpg inside the folder. */
  patternStem: string
}

/**
 * Subject-line overrides where the folder name on disk drops punctuation
 * or contractions that need restoring for user display. Keyed by the
 * raw subject (everything after `<Theme> - `).
 */
const NAME_OVERRIDES: Record<string, string> = {
  // Mom / Quote — restore "I'm" and "I'll" apostrophes
  'Im a cool mom': "I'm a cool mom",
  'Im a snarky mom': "I'm a snarky mom",
  'Im not bossy': "I'm not bossy",
  'Im not old Im vintage': "I'm not old I'm vintage",
  'Im not yelling': "I'm not yelling",
  // The wording in the folder name reads as the designer wrote it; only
  // punctuation gets restored.
  'Mom hair, dont care': "Mom hair, don't care",
  'Mess with my kids and Ill unleash my inner momster': "Mess with my kids and I'll unleash my inner momster",
  // LGBTQ and Mom subjects that are already sentence-cased keep that
  // casing — they read as quotes, not titles.
}

function restoreName(rawSubject: string): string {
  if (NAME_OVERRIDES[rawSubject]) return NAME_OVERRIDES[rawSubject]
  return rawSubject
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Walk the source root, parse each folder name into a catalogue entry.
 * Returns entries sorted by theme then name for stable diff-friendly
 * processing.
 */
export async function readCatalogue(sourceRoot: string): Promise<CatalogueEntry[]> {
  const folders = await readdir(sourceRoot, { withFileTypes: true })
  const entries: CatalogueEntry[] = []
  for (const f of folders) {
    if (!f.isDirectory()) continue
    const folderName = f.name
    // "Elephant - Baby Elephant" → theme="Elephant", subject="Baby Elephant"
    const m = folderName.match(/^([A-Za-z]+)\s*-\s*(.+)$/)
    if (!m || !m[1] || !m[2]) continue
    const themeRaw = m[1]
    const subject = m[2].trim()
    if (!(themeRaw in THEME_TO_SUBCAT)) continue
    const theme = themeRaw as Theme
    const name = restoreName(subject)
    entries.push({
      folderPath: join(sourceRoot, folderName),
      theme,
      name,
      slug: toSlug(name),
      subCategorySlug: THEME_TO_SUBCAT[theme],
      patternStem: subject,
    })
  }
  entries.sort((a, b) => a.theme.localeCompare(b.theme) || a.name.localeCompare(b.name))
  return entries
}

/** Source root on Rebecca's machine. The importer fails early if this
 *  path doesn't exist on the current host. */
export const STITCHING_MAMA_SOURCE_ROOT =
  'K:\\My Drive\\Personal\\Stitching Mama\\TEAM\\Designs\\6 READY TO PUBLISH TO WEBSITE'
