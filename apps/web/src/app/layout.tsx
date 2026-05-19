import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Fraunces, Lora } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { PostHogProvider } from '@/components/posthog-provider'
import { AcquisitionTracker } from '@/components/acquisition-tracker'
import { JsonLd } from '@/components/seo/json-ld'
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
} from '@/lib/seo/schema-builders'
import { siteOrigin } from '@/lib/seo/site-url'
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
  description: 'The home of making things yourself.',
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
