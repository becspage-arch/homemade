# Mobile setup — App Store + Play Store runbook

This walks through everything that has to happen *outside* the repo before
Homemade can ship native builds. Each step is tagged:

- **(rebecca-only)** — must be Rebecca, in person, with real identity
  documents. AI can't enrol developer accounts.
- **(rebecca-now)** — Rebecca's call, but routine clicking. Can be done
  whenever the rest of the launch is ready.
- **(automatable)** — a worker session can take care of it once an account
  exists.

Bundle ID locked across both stores: **education.homemade.app**.

---

## 1. Apple Developer Program

### 1a. Enrol the account (rebecca-only)

Rebecca's existing Apple Developer ID (set up for the Aura project) covers
Homemade — App Store Connect lets one developer account host multiple apps,
and a single £79/year membership is cheaper than running two. The Homemade
app record sits alongside Aura's under the same team ID.

(If a separate Homemade-only Apple Dev account is ever needed — e.g. to keep
ownership clean for a future sale — set the GitHub Variable `IOS_TEAM_ID`
on the repo and the iOS workflow picks it up; otherwise it falls back to the
Aura team ID.)

### 1b. App Store Connect app record (rebecca-now)

Once the developer account is approved:

1. Sign in at [appstoreconnect.apple.com](https://appstoreconnect.apple.com).
2. Apps → "+" → **New App**:
   - Platform: iOS
   - Name: **Homemade**
   - Primary language: English (UK)
   - Bundle ID: register a new one as **education.homemade.app**
     (matches `capacitor.config.ts`)
   - SKU: `homemade-ios-001`
   - Full Access for the developer (Rebecca).
3. Fill in app information later, but the *record* must exist before
   we can run the first archive upload.

### 1c. iOS code signing + TestFlight pipeline

The pipeline lives at `.github/workflows/ios-testflight.yml` (added in the
pre-launch debt sweep — mirrors the Aura iOS workflow). It runs on the
GitHub Actions `macos-26` runner — there is no need for a local Mac.

The workflow is **manual-only** (`workflow_dispatch`) for now to avoid
burning App Store Connect API quota on every commit. Trigger it from the
Actions tab once the secrets below are in place; flip on a path-filtered
push trigger when a release cadence settles.

What Rebecca does once (in the Apple Developer Console + App Store Connect):

1. **Distribution certificate** — Apple Developer → Certificates → Apple
   Distribution. Generate it from a CSR; download the `.cer` and import
   into Keychain (or, on Windows, generate the CSR via `openssl` then
   export the cert + private key as a `.p12` from any machine that has the
   key). The `.p12` is what CI consumes.
2. **Provisioning profile** — Apple Developer → Profiles → "+" → App Store.
   Pick App ID = `education.homemade.app`, the Distribution cert from
   step 1, and name it **Homemade App Store** (matches the workflow's
   `IOS_PROVISIONING_PROFILE_NAME` default — override with the GitHub
   Variable of the same name if you pick a different name).
3. **App Store Connect API key** — App Store Connect → Users and Access →
   Keys → "+". Role: App Manager. Download the `.p8` once; record the Key
   ID and Issuer ID from the same page.
4. **GitHub repository secrets** (Settings → Secrets and variables →
   Actions → Secrets):
   - `IOS_SIGNING_P12_BASE64` — `base64 < cert.p12`
   - `IOS_SIGNING_P12_PASSWORD` — the password set when exporting the .p12
   - `IOS_PROVISION_PROFILE_BASE64` — `base64 < profile.mobileprovision`
   - `APPSTORE_CONNECT_KEY_ID` — the Key ID from step 3
   - `APPSTORE_CONNECT_ISSUER_ID` — the Issuer ID from step 3
   - `APPSTORE_CONNECT_API_KEY_BASE64` — `base64 < AuthKey_<id>.p8`
5. **Optional GitHub Variables** (only if defaults don't fit):
   - `IOS_TEAM_ID` — defaults to the Aura team ID (`YA5SH43A77`); set this
     only if Homemade ends up on a separate Apple Dev account.
   - `IOS_PROVISIONING_PROFILE_NAME` — defaults to "Homemade App Store".

Once all secrets are pasted, kick off the workflow from the Actions tab.
First run uploads a build to TestFlight Internal Testing track. Subsequent
runs increment the build number from `${GITHUB_RUN_NUMBER}.${GITHUB_RUN_ATTEMPT}`.

The local placeholder `pnpm --filter @homemade/mobile build:ios` still
refuses to run off macOS — it's a stub for the unlikely case Rebecca ever
gets Mac access; the CI workflow is the actual ship path.

---

## 2. Google Play Console

### 2a. Enrol the account (rebecca-only)

- Sign in at [play.google.com/console](https://play.google.com/console/)
  with a Google account under `rebecca@homemade.education`.
- Choose **Personal** unless we've set up a company; either way the
  one-time fee is **$25**.
- Identity verification: passport / driver's licence photo + selfie via
  Persona. **Account type changed in 2023** — Google now requires a real
  trading address visible on Play, so Personal accounts can use their
  home address but it'll appear on the listing. If that's a deal-breaker
  we wait until there's a registered company address.
- Approval can take 24-72 hours, occasionally up to two weeks.

### 2b. Play Console app record (rebecca-now)

After approval:

1. **Create app** → name "Homemade", default language en-GB, app/game = app,
   free/paid = free.
2. Package name: **education.homemade.app**.
3. Skip the rest of the setup wizard for now — content rating, store
   listing copy, screenshots all go in once we have a real build to
   point at.

### 2c. Android signing keystore (automatable + rebecca-quick-step)

For Play Store distribution, Google requires an **upload key**. Easy to
generate, but the keystore *must not* live in the repo.

1. A worker session generates a keystore locally via `keytool`:
   ```bash
   keytool -genkey -v -keystore homemade-upload.keystore \
     -alias homemade -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Rebecca stores the `.keystore` + the alias password in 1Password (or
   equivalent). **If this file is lost, every future Play Store update
   has to re-key the app — painful**.
3. Worker session adds the encoded keystore + passwords as GitHub
   Actions secrets (`ANDROID_UPLOAD_KEYSTORE_BASE64`,
   `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`,
   `ANDROID_STORE_PASSWORD`).
4. CI signs the release build with this key before uploading to Play
   via the Play Developer API.

Google Play also offers **Play App Signing** (Google holds the real
signing key, you only manage the upload key). Highly recommended; it's
the default for new apps now.

---

## 3. After both accounts exist — build pipelines

- **iOS**: `.github/workflows/ios-testflight.yml` — already in the repo
  (see 1c above). Manual `workflow_dispatch` only.
- **Android**: not yet wired. A future worker session adds
  `.github/workflows/mobile-android.yml` — builds + signs a release
  bundle (`.aab`), uploads to Play internal testing track.

Once the cadence settles, both can flip on a path-filtered push trigger
(`apps/mobile/ios/**`, `apps/mobile/android/**`,
`apps/mobile/capacitor.config.*`) so a web-only push doesn't burn macOS or
Android-build minutes.

---

## 4. Live-reload dev on Android (Windows-friendly)

For iterating on the wrapper while waiting for accounts:

1. Install [Android Studio](https://developer.android.com/studio) and
   accept SDK licences.
2. Set up an AVD (Android Virtual Device) — Pixel 7, API 34.
3. From the repo root: `pnpm --filter "@homemade/web" dev`
4. Find your machine's LAN IP (`ipconfig` on Windows).
5. In another terminal:
   `LAN_IP=192.168.x.x pnpm --filter @homemade/mobile dev`
6. `pnpm --filter @homemade/mobile open:android` — opens the Android
   Studio project.
7. Hit Run in Android Studio with the emulator as the target.

The dev script temporarily rewrites `apps/mobile/capacitor.config.ts`
to point the wrapper at your dev server, runs `cap sync`, then waits
for Ctrl-C to restore the production URL. Don't commit while the
script is paused — the config file is in a "dev mode" state.

---

## 5. What's already in the repo

- `apps/mobile/` workspace, Capacitor 8 latest, plain TypeScript config
- Bundle ID `education.homemade.app` baked into the config
- Android project under `apps/mobile/android` — builds in Android Studio
- iOS project under `apps/mobile/ios` — built and shipped to TestFlight
  via `.github/workflows/ios-testflight.yml` on the macos-26 GHA runner.
  No local Mac needed.
- Splash screen plugin, status bar plugin, app plugin all installed
- Native icons + splash generated from
  `H:\My Drive\Branding\favicon-1024.png` and `wordmark-cream-on-sage.png`
- `pnpm --filter @homemade/mobile build:android` produces an unsigned
  debug APK
- `pnpm --filter @homemade/mobile build:ios` is a placeholder that
  refuses to run off macOS

### Asset quality notes (swap in when better source files exist)

- The splash source is `favicon-1024.png` (1024×1024). Capacitor wants
  2732×2732 with content inside an inner 1200×1200. Capacitor-assets
  pads it but the result is a bit cropped on tablets. Replace
  `apps/mobile/assets/splash.png` with a 2732×2732 PNG (sage cream
  background, wordmark centred ≤1200×1200) and rerun
  `pnpm --filter @homemade/mobile assets:generate` then
  `pnpm --filter @homemade/mobile sync`.
- The icon foreground/background pair could be split — currently both
  point at the same `favicon-1024.png`. A future pass: a transparent
  foreground sage "h" + a solid sage background tile gives a proper
  adaptive icon on Android.
