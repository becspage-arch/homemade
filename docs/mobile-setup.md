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

- Aura already has an Apple Developer ID. **Don't reuse it for Homemade**
  — App Store Connect lets one developer account host multiple apps, but
  keeping them on separate developer accounts means a future sale or
  hand-over of one product doesn't entangle the other. New account it is.
- Sign in at [developer.apple.com/programs](https://developer.apple.com/programs/)
  with the Apple ID Rebecca wants to be the public Homemade publisher
  (recommend a fresh apple-id under `rebecca@homemade.education`).
- Choose **Individual** enrolment unless we've set up a UK company by
  then (then it's **Organisation**, which needs a D-U-N-S number — free
  via [Dun & Bradstreet](https://www.dnb.co.uk/duns-number/get-a-duns.html)
  but takes 5–10 working days).
- £79/year fee. Charged to the card on the Apple ID.
- Identity verification takes anywhere from a few hours to a few days.
- Confirmation lands in the Apple-ID inbox.

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

### 1c. iOS code signing (automatable, after 1a + 1b)

This is the bit that runs on a Mac. Aura already uses GitHub Actions on
`macos-latest` to push to TestFlight, and that's the same pattern here.

Once we have an Apple Developer account and the App Store Connect app
record, a worker session can:

1. Create a Distribution certificate + provisioning profile in
   Apple Developer Console.
2. Create an App Store Connect API key (Users and Access → Keys → "+").
   Download the `.p8` once — it's never re-issuable.
3. Drop the API key + key ID + issuer ID + cert / profile into GitHub
   Actions secrets (`APPLE_*` names).
4. Add a `.github/workflows/ios-testflight.yml` that mirrors the Aura
   setup: `macos-latest`, install certificates, `npx cap sync ios`,
   `xcodebuild -workspace App.xcworkspace ... archive`, upload to
   TestFlight via fastlane or `xcrun altool`.

Everything in step 4 lives in the repo. The keys live in GitHub.

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

## 3. After both accounts exist — build pipeline

Then a worker session can:

- Add `.github/workflows/mobile-android.yml` — builds + signs a release
  bundle (`.aab`), uploads to Play internal testing track.
- Add `.github/workflows/mobile-ios.yml` — `macos-latest`, builds the
  archive, uploads to TestFlight.
- Both workflows trigger on push to a `mobile/release` branch (or a
  manual `workflow_dispatch`) so we don't burn macOS minutes on every
  web-only push.

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
- iOS project under `apps/mobile/ios` — needs a Mac to build, otherwise
  the Xcode project files are already there
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
