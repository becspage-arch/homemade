#!/usr/bin/env node

/**
 * Placeholder. iOS builds require macOS + Xcode + an Apple developer account.
 * Rebecca is on Windows; we scaffold the iOS project so it's ready to build
 * on a Mac (or via a Mac CI runner — e.g. GitHub Actions' macos-latest, the
 * same approach the Aura project uses for TestFlight).
 */

if (process.platform !== 'darwin') {
  console.error(
    '[mobile] iOS builds require macOS. See docs/mobile-setup.md for the\n' +
      'GitHub-Actions-on-macos-latest pattern (mirrors the Aura project setup).',
  )
  process.exit(1)
}

const { spawnSync } = await import('node:child_process')
const { resolve, dirname } = await import('node:path')
const { fileURLToPath } = await import('node:url')

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const sync = spawnSync('npx', ['cap', 'sync', 'ios'], {
  cwd: mobileRoot,
  stdio: 'inherit',
  shell: true,
})
if (sync.status !== 0) process.exit(sync.status ?? 1)

console.log(
  '\n[mobile] cap sync done. Open the Xcode workspace and build there:\n' +
    '  pnpm --filter @homemade/mobile open:ios\n',
)
