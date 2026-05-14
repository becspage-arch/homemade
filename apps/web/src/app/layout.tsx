import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Fraunces, Lora } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { PostHogProvider } from '@/components/posthog-provider'
import { AcquisitionTracker } from '@/components/acquisition-tracker'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'homemade',
  description: 'The home of making things yourself.',
  robots: { index: false, follow: false },
}

// TEMPORARY: visible JS-error overlay to debug the iOS WKWebView white-screen
// issue (TestFlight build 17.x renders blank while Safari on the same device
// renders fine). Catches window.onerror + unhandledrejection + paints them as
// a fixed-position dark band at the top of the page so Rebecca can read them
// off her phone without remote debugging. Also paints a tiny "loaded:<route>"
// breadcrumb so we know whether the page even reached the bottom of execution.
// Remove once root cause is found.
const DEBUG_OVERLAY_SCRIPT = `
(function () {
  try {
    var box;
    function ensureBox(color) {
      if (box) return box;
      box = document.createElement('div');
      box.id = '__hm_debug_overlay';
      box.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;background:' + (color || '#b00') + ';color:#fff;font:12px/1.3 -apple-system,BlinkMacSystemFont,sans-serif;padding:8px 10px;white-space:pre-wrap;word-break:break-word;max-height:60vh;overflow:auto;';
      (document.body || document.documentElement).appendChild(box);
      return box;
    }
    function show(prefix, payload) {
      try {
        var b = ensureBox('#b00');
        var line = document.createElement('div');
        line.textContent = '[' + prefix + '] ' + payload;
        b.appendChild(line);
      } catch (e) {}
    }
    window.addEventListener('error', function (ev) {
      show('error', (ev.message || 'unknown') + ' @ ' + (ev.filename || '?') + ':' + (ev.lineno || '?'));
    });
    window.addEventListener('unhandledrejection', function (ev) {
      var r = ev.reason;
      var msg = (r && (r.message || r.toString())) || 'unknown';
      show('reject', msg);
    });
    document.addEventListener('DOMContentLoaded', function () {
      try {
        var b = document.createElement('div');
        b.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:2147483646;background:#080;color:#fff;font:11px/1.2 -apple-system,sans-serif;padding:4px 8px;';
        b.textContent = 'loaded: ' + location.pathname + (window.Capacitor ? ' (capacitor)' : ' (web)');
        document.body.appendChild(b);
      } catch (e) {}
    });
  } catch (e) {}
})();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en-GB" className={`${fraunces.variable} ${lora.variable}`}>
        <head>
          {/* TEMPORARY — see DEBUG_OVERLAY_SCRIPT comment above */}
          <script dangerouslySetInnerHTML={{ __html: DEBUG_OVERLAY_SCRIPT }} />
        </head>
        <body>
          <Suspense>
            <PostHogProvider>
              <AcquisitionTracker />
              {children}
            </PostHogProvider>
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  )
}
