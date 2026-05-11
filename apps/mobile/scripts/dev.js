#!/usr/bin/env node

/**
 * Live-reload helper for local dev.
 *
 * Capacitor 8 supports `server.url` for live reload — point the wrapper at
 * your local Next.js dev server and rebuild the native project. To use this:
 *   1. In a separate terminal: `pnpm --filter @homemade/web dev`
 *      (defaults to http://localhost:3000)
 *   2. Find your machine's LAN IP (run `ipconfig` on Windows, `ifconfig`
 *      on macOS/Linux).
 *   3. `LAN_IP=192.168.x.x pnpm --filter @homemade/mobile dev`
 *   4. `pnpm --filter @homemade/mobile open:android` to open the project
 *      in Android Studio and run on an emulator / device.
 *
 * The script temporarily rewrites capacitor.config.ts to point at your dev
 * server, runs `cap sync`, and waits for Ctrl-C before restoring the file.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const configPath = resolve(__dirname, '..', 'capacitor.config.ts')

const lanIp = process.env.LAN_IP
const port = process.env.WEB_PORT ?? '3000'
if (!lanIp) {
  console.error(
    'LAN_IP is not set. Find your machine IP (e.g. 192.168.1.42) and run again as:\n' +
      '  LAN_IP=192.168.x.x pnpm --filter @homemade/mobile dev',
  )
  process.exit(1)
}

const original = readFileSync(configPath, 'utf8')
const patched = original.replace(
  /url: 'https:\/\/homemade.education',\s*\n\s*cleartext: false,/,
  `url: 'http://${lanIp}:${port}',\n    cleartext: true,`,
)

if (patched === original) {
  console.error('Could not patch capacitor.config.ts — has the file changed?')
  process.exit(1)
}

writeFileSync(configPath, patched)
console.log(`[mobile] capacitor.config.ts → http://${lanIp}:${port}`)

function restore() {
  try {
    writeFileSync(configPath, original)
    console.log('[mobile] capacitor.config.ts restored')
  } catch {}
}

process.on('SIGINT', () => {
  restore()
  process.exit(0)
})
process.on('exit', restore)

const sync = spawnSync('npx', ['cap', 'sync'], {
  cwd: resolve(__dirname, '..'),
  stdio: 'inherit',
  shell: true,
})
if (sync.status !== 0) {
  restore()
  process.exit(sync.status ?? 1)
}

console.log(
  '\n[mobile] config patched + cap sync done. Now open the native project:\n' +
    '  pnpm --filter @homemade/mobile open:android\n' +
    '  pnpm --filter @homemade/mobile open:ios   (needs macOS)\n' +
    '\nPress Ctrl-C when you are done to restore the production URL.\n',
)

// Block until killed so SIGINT cleanup runs.
setInterval(() => {}, 1 << 30)
