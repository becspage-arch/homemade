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
    // NOTE: tried `allowNavigation: ['homemade.education',
    // '*.homemade.education']` to keep same-origin links from punting to
    // Safari. That setting blanked the WKWebView entirely (page never
    // rendered) — possibly because Capacitor 8's allowNavigation
    // implementation also gates the initial server.url load when the
    // list is non-empty. Removed pending a different approach (probably
    // setting the right Capacitor server config on the iOS native side,
    // or handling navigation in JS via window.open intercept).
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
