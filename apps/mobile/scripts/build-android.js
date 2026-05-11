#!/usr/bin/env node

/**
 * Build a debug APK for Android.
 *
 * Prereqs (one-time):
 *   - Android Studio installed
 *   - ANDROID_HOME / ANDROID_SDK_ROOT pointing at the SDK
 *   - Java 17 (Capacitor 8 needs JDK 17)
 *
 * Output: apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk
 */

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const mobileRoot = resolve(__dirname, '..')
const androidRoot = resolve(mobileRoot, 'android')

if (!existsSync(androidRoot)) {
  console.error(
    '[mobile] apps/mobile/android does not exist yet.\n' +
      'Run `cd apps/mobile && npx cap add android` first.',
  )
  process.exit(1)
}

const sync = spawnSync('npx', ['cap', 'sync', 'android'], {
  cwd: mobileRoot,
  stdio: 'inherit',
  shell: true,
})
if (sync.status !== 0) process.exit(sync.status ?? 1)

const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'
const build = spawnSync(gradlew, ['assembleDebug'], {
  cwd: androidRoot,
  stdio: 'inherit',
  shell: true,
})
process.exit(build.status ?? 0)
