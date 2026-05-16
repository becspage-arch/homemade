#!/usr/bin/env node

/**
 * Build source asset files for @capacitor/assets to chew on.
 *
 * @capacitor/assets reads:
 *   assets/icon.png              1024×1024  — used for iOS + Android app icon
 *   assets/icon-foreground.png   1024×1024  — Android adaptive icon foreground
 *   assets/icon-background.png   1024×1024  — Android adaptive icon background
 *   assets/splash.png            2732×2732  — iOS + Android launch screen
 *   assets/splash-dark.png       2732×2732  — dark-mode variant
 *
 * The icon is a Fraunces sage "h" wordmark on cream parchment. The splash is
 * the same wordmark centred on cream, with the "h" sized at ~1100px so it
 * lands inside the 1200×1200 safe zone Capacitor uses for tablet splash
 * screens.
 *
 * Run with `pnpm --filter @homemade/mobile assets:source` to regenerate, then
 * `pnpm --filter @homemade/mobile assets:generate` to push everything through
 * the @capacitor/assets CLI.
 */

import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const ASSETS = resolve(here, '..', 'assets')

// Brand tokens — keep in sync with apps/web/src/app/globals.css.
const CREAM = '#f5f0e8'
const SAGE = '#6b7558'

function iconSvg(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${CREAM}"/>
  <text x="50%" y="50%"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="Fraunces, 'Times New Roman', serif"
    font-weight="500"
    font-size="${Math.round(size * 0.74)}"
    fill="${SAGE}">h</text>
</svg>`
}

function iconForegroundSvg(size) {
  // Transparent background so Android can composite the foreground over the
  // separate background tile. The "h" stays sage, sized smaller because the
  // adaptive icon mask trims the outer ~25%.
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <text x="50%" y="50%"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="Fraunces, 'Times New Roman', serif"
    font-weight="500"
    font-size="${Math.round(size * 0.52)}"
    fill="${SAGE}">h</text>
</svg>`
}

function iconBackgroundSvg(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${CREAM}"/>
</svg>`
}

function splashSvg(size, isDark) {
  // Splash content centred in the 1200×1200 safe zone — anything outside that
  // box can be clipped by tablet aspect ratios. We render the wordmark
  // "homemade" with a thin sage rule below.
  const bg = isDark ? '#3d2f22' : CREAM
  const fg = isDark ? CREAM : SAGE
  const half = size / 2
  const wordmarkSize = Math.round(size * 0.11)
  const ruleWidth = Math.round(size * 0.18)
  const ruleY = Math.round(half + wordmarkSize * 0.7)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${bg}"/>
  <text x="${half}" y="${half}"
    text-anchor="middle"
    dominant-baseline="central"
    font-family="Fraunces, 'Times New Roman', serif"
    font-weight="400"
    letter-spacing="${Math.round(wordmarkSize * 0.05)}"
    font-size="${wordmarkSize}"
    fill="${fg}">homemade</text>
  <line x1="${half - ruleWidth / 2}" y1="${ruleY}" x2="${half + ruleWidth / 2}" y2="${ruleY}" stroke="${fg}" stroke-width="${Math.max(1, Math.round(size * 0.0015))}" />
</svg>`
}

async function renderPng(svg, outPath) {
  const buffer = Buffer.from(svg, 'utf-8')
  await sharp(buffer, { density: 384 }).png().toFile(outPath)
  console.log(`wrote ${outPath}`)
}

async function main() {
  await renderPng(iconSvg(1024), resolve(ASSETS, 'icon.png'))
  await renderPng(iconForegroundSvg(1024), resolve(ASSETS, 'icon-foreground.png'))
  await renderPng(iconBackgroundSvg(1024), resolve(ASSETS, 'icon-background.png'))
  await renderPng(iconSvg(1024), resolve(ASSETS, 'icon-only.png'))
  await renderPng(splashSvg(2732, false), resolve(ASSETS, 'splash.png'))
  await renderPng(splashSvg(2732, true), resolve(ASSETS, 'splash-dark.png'))
  console.log(
    '\nDone. Next: pnpm --filter @homemade/mobile assets:generate\n',
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
