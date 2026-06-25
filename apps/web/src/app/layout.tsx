import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Fraunces, Lora } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { PostHogProvider } from '@/components/posthog-provider'
import { GoogleAnalytics } from '@/components/google-analytics'
import { AcquisitionTracker } from '@/components/acquisition-tracker'
import { JsonLd } from '@/components/seo/json-ld'
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
} from '@/lib/seo/schema-builders'
import { siteOrigin } from '@/lib/seo/site-url'
import { GA_MEASUREMENT_ID, gaConsentBootstrap } from '@/lib/ga'
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

// The root metadata sets the safe default (noindex) so any route that has
// not opted in via its own `generateMetadata` stays out of Google's index.
// Public surfaces (homepage, categories, tutorials, /about, /legal/*, Maker
// profiles, Made-it entries) opt in via the buildPublicMetadata helper.
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: 'Homemade',
  description: 'The home of all things homemade.',
  robots: { index: false, follow: false },
  other: process.env.GOOGLE_SITE_VERIFICATION
    ? { 'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: process.env.BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION }
      : undefined,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en-GB" className={`${fraunces.variable} ${lora.variable}`}>
        <head>
          <JsonLd data={[buildOrganizationSchema(), buildWebSiteSchema()]} />
          {/*
           * Google Analytics 4 + Consent Mode v2. The bootstrap snippet sets
           * every storage signal to denied BEFORE the gtag.js library loads
           * and before hydration, so GA4 is cookieless until the visitor
           * grants analytics consent. <GoogleAnalytics/> (in the body) flips
           * analytics_storage reactively when the banner choice changes.
           */}
          {GA_MEASUREMENT_ID && (
            <>
              <script
                dangerouslySetInnerHTML={{ __html: gaConsentBootstrap(GA_MEASUREMENT_ID) }}
              />
              <script
                async
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              />
            </>
          )}
        </head>
        <body>
          {/*
           * Analytics trackers live inside their own Suspense boundary because
           * PostHogProvider calls useSearchParams(), which Next requires to be
           * Suspense-wrapped. Crucially, {children} sits OUTSIDE this boundary:
           * if the page subtree streamed behind a Suspense boundary, Next would
           * flush the shell at HTTP 200 before a page's notFound() could set a
           * 404 — the soft-404 SEO bug. Keeping children unsuspended forces the
           * full page (including any notFound()) to resolve before the first
           * byte, so the 404 status survives.
           */}
          <Suspense>
            <PostHogProvider />
            <AcquisitionTracker />
          </Suspense>
          {/*
           * Reactive Consent Mode listener — pushes consent updates to GA4
           * when the banner choice changes. The tag itself loads from <head>
           * above. Renders null; kept outside the Suspense boundary so it
           * never affects the soft-404 streaming behaviour.
           */}
          <GoogleAnalytics />
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
