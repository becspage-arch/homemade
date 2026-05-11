import type { Metadata } from 'next'
import { Fraunces, Lora } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en-GB" className={`${fraunces.variable} ${lora.variable}`}>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
