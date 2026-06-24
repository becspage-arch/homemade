/**
 * Google Analytics 4 + Google Consent Mode v2 — shared, framework-free
 * helpers used by the root layout (renders the bootstrap snippet in <head>)
 * and the client listener component (`components/google-analytics.tsx`).
 *
 * The measurement id is public, so it lives as a constant with an env
 * override. It only resolves in production unless the override is set, so
 * local/preview traffic never lands in the live property.
 */

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ??
  (process.env.NODE_ENV === 'production' ? 'G-XSRLKQR9JQ' : undefined)

/**
 * The bootstrap snippet that MUST run before the gtag.js library and before
 * hydration — rendered as a raw inline <script> in <head>. It declares the
 * dataLayer, sets every Consent Mode v2 signal to denied by default (so GA4
 * only sends cookieless, modelled pings until consent), then configs the
 * property. ad_* stay denied permanently — we run no ads. `wait_for_update`
 * gives the banner 500ms to flip analytics_storage before the first ping.
 */
export function gaConsentBootstrap(id: string): string {
  return [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}',
    'window.gtag=gtag;',
    "gtag('consent','default',{",
    "ad_storage:'denied',",
    "ad_user_data:'denied',",
    "ad_personalization:'denied',",
    "analytics_storage:'denied',",
    "functionality_storage:'granted',",
    "security_storage:'granted',",
    'wait_for_update:500});',
    "gtag('js',new Date());",
    `gtag('config','${id}',{anonymize_ip:true});`,
  ].join('')
}
