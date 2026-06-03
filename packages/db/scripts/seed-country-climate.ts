/**
 * Idempotent upsert of CountryClimate rows — country-level defaults the
 * gardening renderer + pattern-size selector fall back to when a user
 * hasn't set per-account values.
 *
 * Phase location_climate_paper_001.
 *
 * Country-default Köppen + frost dates are coarse country-average values
 * — fine as a fallback when the renderer can't reach the postcode lookup
 * (follow-up worker: UK / US / CA / AU postcode → Köppen).
 *
 * Paper sizes follow ISO 216 globally except the four imperial holdouts:
 * US, Mexico, Philippines, Liberia. Only US sits in our priority list,
 * so US → Letter, everyone else → A4.
 *
 * Frost dates use the 'MM-DD' month-day format so the year rolls
 * automatically when the renderer composes "wait until after 15 May".
 * Equatorial / tropical countries leave both frost columns null.
 *
 * Usage:
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-country-climate.ts
 *   pnpm --filter "@homemade/db" exec tsx scripts/seed-country-climate.ts --dry-run
 */

import { config as loadEnv } from 'dotenv'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
{
  let dir = __dirname
  let found = false
  for (let depth = 0; depth < 8; depth++) {
    const candidate = resolve(dir, '.env.credentials')
    if (existsSync(candidate)) {
      loadEnv({ path: candidate, override: true })
      found = true
      break
    }
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  if (!found) {
    const cwdCandidate = resolve(process.cwd(), '.env.credentials')
    if (existsSync(cwdCandidate)) loadEnv({ path: cwdCandidate, override: true })
  }
}

interface CountryClimateSeed {
  countryCode: string
  countryName: string
  defaultHemisphere: 'N' | 'S'
  defaultKoppenZone: string
  defaultUsdaZone: string | null
  defaultRhsZone: string | null
  defaultPaperSize: 'A4' | 'Letter'
  defaultLastFrostDate: string | null
  defaultFirstFrostDate: string | null
  notes: string | null
}

const ROWS: CountryClimateSeed[] = [
  // ── UK & Ireland ───────────────────────────────────────────────────
  { countryCode: 'GB', countryName: 'United Kingdom', defaultHemisphere: 'N', defaultKoppenZone: 'Cfb', defaultUsdaZone: '8', defaultRhsZone: 'H4', defaultPaperSize: 'A4', defaultLastFrostDate: '05-15', defaultFirstFrostDate: '10-15', notes: 'Oceanic — mild wet summers, cool winters. Significant regional variation: Scottish highlands closer to USDA 7, Cornwall closer to USDA 9.' },
  { countryCode: 'IE', countryName: 'Ireland',        defaultHemisphere: 'N', defaultKoppenZone: 'Cfb', defaultUsdaZone: '9', defaultRhsZone: 'H4', defaultPaperSize: 'A4', defaultLastFrostDate: '05-01', defaultFirstFrostDate: '10-31', notes: 'Mild oceanic, even gentler than the British average.' },

  // ── North America ──────────────────────────────────────────────────
  { countryCode: 'US', countryName: 'United States',  defaultHemisphere: 'N', defaultKoppenZone: 'Dfa', defaultUsdaZone: '6', defaultRhsZone: null, defaultPaperSize: 'Letter', defaultLastFrostDate: '04-15', defaultFirstFrostDate: '10-15', notes: 'Continental average — huge regional variation. Default Letter paper. USDA 6 is rough middle; postcode lookup is the right answer.' },
  { countryCode: 'CA', countryName: 'Canada',         defaultHemisphere: 'N', defaultKoppenZone: 'Dfb', defaultUsdaZone: '4', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '05-24', defaultFirstFrostDate: '09-30', notes: 'Continental, cold winters. USDA 4 is the populated southern band; lookup by postcode for accuracy.' },

  // ── Southern hemisphere ────────────────────────────────────────────
  { countryCode: 'AU', countryName: 'Australia',      defaultHemisphere: 'S', defaultKoppenZone: 'Cfb', defaultUsdaZone: '10', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '08-01', defaultFirstFrostDate: '06-01', notes: 'Southern hemisphere — winter is Jun–Aug. Average covers temperate south-east; tropical north has no frost; alpine south has heavy frost.' },
  { countryCode: 'NZ', countryName: 'New Zealand',    defaultHemisphere: 'S', defaultKoppenZone: 'Cfb', defaultUsdaZone: '9',  defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '09-15', defaultFirstFrostDate: '05-15', notes: 'Southern hemisphere oceanic.' },
  { countryCode: 'ZA', countryName: 'South Africa',   defaultHemisphere: 'S', defaultKoppenZone: 'Cwa', defaultUsdaZone: '9',  defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '08-15', defaultFirstFrostDate: '05-15', notes: 'Southern hemisphere. Highveld winter is dry-frosty; coastal subtropical regions rarely frost.' },

  // ── Northern Europe ────────────────────────────────────────────────
  { countryCode: 'DE', countryName: 'Germany',        defaultHemisphere: 'N', defaultKoppenZone: 'Cfb', defaultUsdaZone: '7', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '05-15', defaultFirstFrostDate: '10-15', notes: null },
  { countryCode: 'NL', countryName: 'Netherlands',    defaultHemisphere: 'N', defaultKoppenZone: 'Cfb', defaultUsdaZone: '8', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '05-15', defaultFirstFrostDate: '10-25', notes: null },
  { countryCode: 'BE', countryName: 'Belgium',        defaultHemisphere: 'N', defaultKoppenZone: 'Cfb', defaultUsdaZone: '8', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '05-15', defaultFirstFrostDate: '10-20', notes: null },
  { countryCode: 'LU', countryName: 'Luxembourg',     defaultHemisphere: 'N', defaultKoppenZone: 'Cfb', defaultUsdaZone: '7', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '05-15', defaultFirstFrostDate: '10-10', notes: null },
  { countryCode: 'FR', countryName: 'France',         defaultHemisphere: 'N', defaultKoppenZone: 'Cfb', defaultUsdaZone: '8', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '05-01', defaultFirstFrostDate: '11-01', notes: 'Continental in the east, oceanic in the north-west, Mediterranean in the south. Postcode lookup matters here.' },
  { countryCode: 'AT', countryName: 'Austria',        defaultHemisphere: 'N', defaultKoppenZone: 'Dfb', defaultUsdaZone: '6', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '05-20', defaultFirstFrostDate: '09-30', notes: null },
  { countryCode: 'CH', countryName: 'Switzerland',    defaultHemisphere: 'N', defaultKoppenZone: 'Dfb', defaultUsdaZone: '6', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '05-15', defaultFirstFrostDate: '10-01', notes: 'Plateau-average; Alps push frost-free window much shorter.' },

  // ── Mediterranean Europe ───────────────────────────────────────────
  { countryCode: 'ES', countryName: 'Spain',          defaultHemisphere: 'N', defaultKoppenZone: 'Csa', defaultUsdaZone: '9',  defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '04-01', defaultFirstFrostDate: '11-15', notes: 'Med south, oceanic north, continental interior.' },
  { countryCode: 'IT', countryName: 'Italy',          defaultHemisphere: 'N', defaultKoppenZone: 'Csa', defaultUsdaZone: '9',  defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '04-01', defaultFirstFrostDate: '11-15', notes: null },
  { countryCode: 'PT', countryName: 'Portugal',       defaultHemisphere: 'N', defaultKoppenZone: 'Csa', defaultUsdaZone: '10', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '03-15', defaultFirstFrostDate: '12-01', notes: null },
  { countryCode: 'GR', countryName: 'Greece',         defaultHemisphere: 'N', defaultKoppenZone: 'Csa', defaultUsdaZone: '9',  defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '04-01', defaultFirstFrostDate: '11-15', notes: null },
  { countryCode: 'MT', countryName: 'Malta',          defaultHemisphere: 'N', defaultKoppenZone: 'Csa', defaultUsdaZone: '10', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '01-15', defaultFirstFrostDate: '12-31', notes: 'Frost effectively nil; placeholder dates only.' },
  { countryCode: 'CY', countryName: 'Cyprus',         defaultHemisphere: 'N', defaultKoppenZone: 'Csa', defaultUsdaZone: '10', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '02-15', defaultFirstFrostDate: '12-15', notes: null },

  // ── Nordics ────────────────────────────────────────────────────────
  { countryCode: 'SE', countryName: 'Sweden',         defaultHemisphere: 'N', defaultKoppenZone: 'Dfb', defaultUsdaZone: '5', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '06-01', defaultFirstFrostDate: '09-15', notes: null },
  { countryCode: 'NO', countryName: 'Norway',         defaultHemisphere: 'N', defaultKoppenZone: 'Dfb', defaultUsdaZone: '5', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '06-01', defaultFirstFrostDate: '09-15', notes: 'Coast is much milder than inland; postcode lookup is the right answer.' },
  { countryCode: 'DK', countryName: 'Denmark',        defaultHemisphere: 'N', defaultKoppenZone: 'Cfb', defaultUsdaZone: '7', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '05-15', defaultFirstFrostDate: '10-15', notes: null },
  { countryCode: 'FI', countryName: 'Finland',        defaultHemisphere: 'N', defaultKoppenZone: 'Dfb', defaultUsdaZone: '4', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '06-01', defaultFirstFrostDate: '09-01', notes: null },
  { countryCode: 'IS', countryName: 'Iceland',        defaultHemisphere: 'N', defaultKoppenZone: 'Cfc', defaultUsdaZone: '5', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '06-15', defaultFirstFrostDate: '09-01', notes: null },

  // ── Asia / Oceania add-ons ─────────────────────────────────────────
  { countryCode: 'IN', countryName: 'India',          defaultHemisphere: 'N', defaultKoppenZone: 'Aw',  defaultUsdaZone: '11', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: null,    defaultFirstFrostDate: null,    notes: 'Tropical / sub-tropical average. Hill stations frost; lowlands do not.' },
  { countryCode: 'JP', countryName: 'Japan',          defaultHemisphere: 'N', defaultKoppenZone: 'Cfa', defaultUsdaZone: '8',  defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: '04-15', defaultFirstFrostDate: '11-01', notes: 'Tokyo-centred default. Hokkaido much colder; Okinawa frost-free.' },
  { countryCode: 'SG', countryName: 'Singapore',      defaultHemisphere: 'N', defaultKoppenZone: 'Af',  defaultUsdaZone: '13', defaultRhsZone: null, defaultPaperSize: 'A4', defaultLastFrostDate: null,    defaultFirstFrostDate: null,    notes: 'Equatorial — no frost ever.' },
]

const DRY_RUN = process.argv.includes('--dry-run')

async function main(): Promise<void> {
  const { prisma } = await import('../src/index.js')

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const seed of ROWS) {
    const existing = await prisma.countryClimate.findUnique({ where: { countryCode: seed.countryCode } })
    const payload = {
      countryName: seed.countryName,
      defaultHemisphere: seed.defaultHemisphere,
      defaultKoppenZone: seed.defaultKoppenZone,
      defaultUsdaZone: seed.defaultUsdaZone,
      defaultRhsZone: seed.defaultRhsZone,
      defaultPaperSize: seed.defaultPaperSize,
      defaultLastFrostDate: seed.defaultLastFrostDate,
      defaultFirstFrostDate: seed.defaultFirstFrostDate,
      notes: seed.notes,
    }
    if (!existing) {
      if (!DRY_RUN) {
        await prisma.countryClimate.create({ data: { countryCode: seed.countryCode, ...payload } })
      }
      created += 1
      console.log(`[seed] + ${seed.countryCode} (${seed.countryName})`)
      continue
    }
    const hasChanged =
      existing.countryName !== payload.countryName ||
      existing.defaultHemisphere !== payload.defaultHemisphere ||
      existing.defaultKoppenZone !== payload.defaultKoppenZone ||
      (existing.defaultUsdaZone ?? null) !== payload.defaultUsdaZone ||
      (existing.defaultRhsZone ?? null) !== payload.defaultRhsZone ||
      existing.defaultPaperSize !== payload.defaultPaperSize ||
      (existing.defaultLastFrostDate ?? null) !== payload.defaultLastFrostDate ||
      (existing.defaultFirstFrostDate ?? null) !== payload.defaultFirstFrostDate ||
      (existing.notes ?? null) !== payload.notes

    if (hasChanged) {
      if (!DRY_RUN) {
        await prisma.countryClimate.update({ where: { countryCode: seed.countryCode }, data: payload })
      }
      updated += 1
      console.log(`[seed] ~ ${seed.countryCode}`)
    } else {
      unchanged += 1
    }
  }

  console.log(
    `\n[seed] country-climate: created=${created} updated=${updated} unchanged=${unchanged} total=${ROWS.length}${DRY_RUN ? ' (dry-run)' : ''}`,
  )
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('[seed] failed:', err)
  process.exit(1)
})
