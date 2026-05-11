import { Wordmark } from '@/components/wordmark'

export default function UnlockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return <UnlockForm searchParams={searchParams} />
}

async function UnlockForm({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  const hasError = params.error === '1'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center">
      <Wordmark size="small" />
      <form action="/api/unlock" method="POST" className="mt-12 flex w-72 flex-col gap-4">
        <input
          type="password"
          name="password"
          placeholder="password"
          autoFocus
          required
          className="border-b border-[var(--color-sage)] bg-transparent px-2 py-3 text-center outline-none placeholder:text-[var(--color-linen-grey)] focus:border-[var(--color-forest)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        />
        <button
          type="submit"
          className="bg-[var(--color-sage)] py-3 text-xs uppercase tracking-[0.3em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          enter
        </button>
        {hasError && (
          <p className="text-xs text-[var(--color-burnt-sienna)]" style={{ fontFamily: 'var(--font-lora)' }}>
            try again
          </p>
        )}
      </form>
    </main>
  )
}
