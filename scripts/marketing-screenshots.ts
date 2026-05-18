/* Capture App Store / Play Store marketing screenshots from the live site
 * using Playwright. Hits homemade.education (or BASE_URL) at each required
 * viewport size, sets the splash cookie + the cooking-mode localStorage
 * fixtures, and writes PNGs into apps/mobile/marketing/screenshots/.
 *
 * Usage:
 *   SPLASH_PASSWORD=your-password pnpm screenshots
 *   BASE_URL=http://localhost:3000 SPLASH_PASSWORD=... pnpm screenshots
 *
 * The script is fail-soft per-frame — if one route 500s or the cooking-mode
 * page hasn't got any RECIPE tutorials yet, it logs and moves on so the
 * other frames still land.
 *
 * To install the headless browsers the first time:
 *   pnpm exec playwright install chromium
 */

import { chromium, devices, type Browser, type BrowserContext } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'

const REPO_ROOT = resolve(import.meta.dirname, '..')
const OUT_DIR = resolve(REPO_ROOT, 'apps', 'mobile', 'marketing', 'screenshots')

const BASE_URL = process.env.BASE_URL || 'https://homemade.education'
const SPLASH_PASSWORD = process.env.SPLASH_PASSWORD || ''

interface Viewport {
  /** Used as the subfolder name under screenshots/. */
  platform: string
  /** Used as the per-frame filename prefix. */
  device: string
  width: number
  height: number
  deviceScaleFactor: number
}

const VIEWPORTS: Viewport[] = [
  // iOS — required sizes from App Store Connect.
  { platform: 'ios', device: 'iphone-6.7', width: 1290 / 3, height: 2796 / 3, deviceScaleFactor: 3 },
  { platform: 'ios', device: 'iphone-6.5', width: 1242 / 3, height: 2688 / 3, deviceScaleFactor: 3 },
  { platform: 'ios', device: 'iphone-5.5', width: 1242 / 3, height: 2208 / 3, deviceScaleFactor: 3 },
  { platform: 'ios', device: 'ipad-12.9', width: 2048 / 2, height: 2732 / 2, deviceScaleFactor: 2 },
  // Android — typical phone + tablet from Play Console.
  { platform: 'android', device: 'phone', width: 360, height: 800, deviceScaleFactor: 3 },
  { platform: 'android', device: 'tablet-7in', width: 600, height: 960, deviceScaleFactor: 2 },
  { platform: 'android', device: 'tablet-10in', width: 800, height: 1280, deviceScaleFactor: 2 },
]

interface Frame {
  name: string
  path: string
  /** Optional pre-screenshot mutation — e.g. flipping cooking mode on via localStorage. */
  prepare?: (page: import('playwright').Page) => Promise<void>
  /** Optional CSS selector to wait for before capturing. */
  waitFor?: string
}

const FRAMES: Frame[] = [
  { name: '01-home', path: '/' },
  { name: '02-recipe', path: '/cooking' },
  { name: '03-saved', path: '/me/bookmarks' },
  { name: '04-search', path: '/search?q=pasta' },
  { name: '05-notifications', path: '/me/notifications' },
  {
    name: '06-cooking-mode',
    // The script picks the first published recipe at run time. Set this path
    // explicitly via FRAME_COOKING_MODE_PATH env var if you want a specific
    // one (e.g. a hero tutorial with a great photo).
    path: process.env.FRAME_COOKING_MODE_PATH || '',
    prepare: async (page) => {
      // Resolve the recipe URL from the home page if no explicit path was set.
      const explicit = process.env.FRAME_COOKING_MODE_PATH
      if (!explicit) {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })
        const href = await page
          .locator('a[href^="/cooking/"]')
          .first()
          .getAttribute('href')
        if (href) {
          await page.evaluate(
            ({ slug }) => {
              window.localStorage.setItem(
                `homemade:cookingMode:${slug.split('/').pop()}`,
                JSON.stringify({ enabled: true, stepIndex: 0 }),
              )
            },
            { slug: href },
          )
          await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle' })
          return
        }
      }
    },
  },
]

async function ensureDir(p: string) {
  await mkdir(p, { recursive: true })
}

async function unlock(context: BrowserContext): Promise<void> {
  if (!SPLASH_PASSWORD) return
  const page = await context.newPage()
  await page.goto(`${BASE_URL}/unlock`, { waitUntil: 'domcontentloaded' })
  await page.fill('input[name="password"]', SPLASH_PASSWORD)
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.click('button[type="submit"]'),
  ])
  await page.close()
}

async function captureFrame(
  context: BrowserContext,
  viewport: Viewport,
  frame: Frame,
): Promise<{ ok: boolean; bytes: number; err?: string }> {
  const page = await context.newPage()
  await page.setViewportSize({ width: viewport.width, height: viewport.height })
  try {
    if (frame.prepare) {
      await frame.prepare(page)
    } else if (frame.path) {
      await page.goto(`${BASE_URL}${frame.path}`, { waitUntil: 'networkidle' })
    }
    if (frame.waitFor) {
      await page.waitForSelector(frame.waitFor, { timeout: 8000 })
    }
    const outPath = join(
      OUT_DIR,
      viewport.platform,
      viewport.device,
      `${frame.name}.png`,
    )
    await ensureDir(resolve(outPath, '..'))
    const buf = await page.screenshot({
      fullPage: false,
      type: 'png',
    })
    await writeFile(outPath, buf)
    return { ok: true, bytes: buf.length }
  } catch (err) {
    return {
      ok: false,
      bytes: 0,
      err: err instanceof Error ? err.message : String(err),
    }
  } finally {
    await page.close().catch(() => undefined)
  }
}

async function main() {
  await ensureDir(OUT_DIR)
  let browser: Browser | null = null
  try {
    browser = await chromium.launch()
  } catch (err) {
    console.error(
      'Chromium not installed for Playwright. Run:\n  pnpm exec playwright install chromium',
    )
    throw err
  }

  let total = 0
  let failures = 0
  for (const viewport of VIEWPORTS) {
    console.log(
      `\n→ ${viewport.platform}/${viewport.device}  ${viewport.width}×${viewport.height} @${viewport.deviceScaleFactor}x`,
    )
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.deviceScaleFactor,
      userAgent: devices['iPhone 14 Pro Max'].userAgent,
      ignoreHTTPSErrors: true,
    })
    await unlock(context)
    for (const frame of FRAMES) {
      const result = await captureFrame(context, viewport, frame)
      total++
      if (!result.ok) {
        failures++
        console.warn(`  ✗ ${frame.name}: ${result.err}`)
      } else {
        console.log(`  ✓ ${frame.name}  (${Math.round(result.bytes / 1024)} KB)`)
      }
    }
    await context.close()
  }
  await browser.close()
  console.log(
    `\nDone. ${total - failures}/${total} frames captured. Output: ${OUT_DIR}`,
  )
  if (failures > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
