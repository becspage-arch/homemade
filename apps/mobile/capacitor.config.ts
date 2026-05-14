import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor 8 config. The webDir points at a tiny static landing page bundled
 * with the app so the wrapper still has a valid asset directory; in normal
 * use the wrapper loads the live site via the `server.url` below. This pattern
 * lets us ship a thin native shell without duplicating the web codebase.
 *
 * When the splash gate comes down or we want offline support, swap `server`
 * for a pre-built copy of apps/web (Next.js static export) under `dist`.
 */
const config: CapacitorConfig = {
  appId: 'education.homemade.app',
  appName: 'Homemade',
  webDir: 'dist',
  server: {
    url: 'https://homemade.education',
    cleartext: false,
    androidScheme: 'https',
    // Clerk's DEV environment performs a "dev browser" cookie handshake
    // on first visit by redirecting to its hosted domain
    // (open-muskrat-74.clerk.accounts.dev). Without that domain in the
    // allowNavigation list, the WKWebView either punts the redirect to
    // Safari (observed: app opens to a Safari sign-in screen) or stalls
    // (observed: white screen).
    //
    // The earlier attempt with only homemade.education in the list also
    // blanked the wrapper, because the redirect to Clerk's domain
    // counted as a disallowed navigation. Listing both fixes both
    // symptoms.
    allowNavigation: [
      'homemade.education',
      '*.homemade.education',
      '*.clerk.accounts.dev',
      '*.accounts.dev',
    ],
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#f5f0e8',
      androidScaleType: 'CENTER_INSIDE',
      showSpinner: false,
      splashImmersive: false,
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#f5f0e8',
    },
  },
}

export default config
