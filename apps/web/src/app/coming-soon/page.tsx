import Link from 'next/link'
import { Wordmark } from '@/components/wordmark'

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      <Wordmark />
      <div className="mt-8 h-px w-24 bg-[var(--color-sage)] opacity-40" />
      <p
        className="mt-8 text-xs uppercase text-[var(--color-warm-taupe)]"
        style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.3em' }}
      >
        coming soon
      </p>
      {/* Discreet escape hatch so early testers + Rebecca can reach the
          splash unlock form from the wrapper / a plain visit. The /unlock
          route is already in PUBLIC_PATHS in proxy.ts so this link
          bypasses the splash cookie gate. */}
      <Link
        href="/unlock"
        className="absolute bottom-8 text-xs uppercase text-[var(--color-warm-taupe)] opacity-60 hover:opacity-100 transition-opacity"
        style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.2em' }}
      >
        already have access? sign in
      </Link>
    </main>
  )
}
