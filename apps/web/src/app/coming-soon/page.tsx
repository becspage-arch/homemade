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
    </main>
  )
}
