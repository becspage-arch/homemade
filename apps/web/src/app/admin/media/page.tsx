import Link from 'next/link'
import { prisma, MediaStatus } from '@homemade/db'
import { mediaUrl } from '@/lib/media'

export const dynamic = 'force-dynamic'

export default async function MediaIndexPage() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1
          className="text-4xl text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        >
          Media
        </h1>
        <Link
          href="/admin/media/new"
          className="bg-[var(--color-sage)] px-5 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          upload image
        </Link>
      </div>

      {media.length === 0 ? (
        <p
          className="mt-12 text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          No images yet. Upload one to get started.
        </p>
      ) : (
        <table className="mt-12 w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-linen-grey)] text-left">
              <Th />
              <Th>File / Alt</Th>
              <Th>Dimensions</Th>
              <Th>Status</Th>
              <Th>Uploaded</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {media.map((m) => {
              const thumb = mediaUrl(m, 'thumbnail')
              return (
                <tr key={m.id} className="border-b border-[var(--color-linen-grey)]">
                  <Td>
                    {thumb && m.status === MediaStatus.READY ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={m.alt ?? ''}
                        className="h-16 w-16 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center border border-[var(--color-linen-grey)] text-[10px] uppercase tracking-[0.2em] text-[var(--color-warm-taupe)]">
                        {m.status === MediaStatus.FAILED ? '—' : '…'}
                      </div>
                    )}
                  </Td>
                  <Td>
                    <div
                      className="text-[var(--color-espresso)]"
                      style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.05rem' }}
                    >
                      {m.filename || m.alt || '(untitled)'}
                    </div>
                    {m.alt && m.filename && (
                      <div className="mt-1 text-xs text-[var(--color-warm-taupe)] opacity-80">
                        {m.alt}
                      </div>
                    )}
                  </Td>
                  <Td>{m.width && m.height ? `${m.width}×${m.height}` : '—'}</Td>
                  <Td>
                    <StatusPill status={m.status} />
                  </Td>
                  <Td>{m.createdAt.toLocaleDateString('en-GB')}</Td>
                  <Td>
                    <Link
                      href={`/admin/media/${m.id}`}
                      className="text-xs uppercase tracking-[0.25em] text-[var(--color-sage)] hover:text-[var(--color-forest)]"
                      style={{ fontFamily: 'var(--font-lora)' }}
                    >
                      edit
                    </Link>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: MediaStatus }) {
  const styles: Record<MediaStatus, { fg: string; label: string }> = {
    READY: { fg: 'var(--color-forest)', label: 'ready' },
    UPLOADING: { fg: 'var(--color-warm-taupe)', label: 'uploading' },
    FAILED: { fg: 'var(--color-burnt-sienna)', label: 'failed' },
  }
  const s = styles[status]
  return (
    <span
      className="text-xs uppercase tracking-[0.25em]"
      style={{ fontFamily: 'var(--font-lora)', color: s.fg }}
    >
      {s.label}
    </span>
  )
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th
      className="py-3 text-xs uppercase text-[var(--color-warm-taupe)]"
      style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.18em', fontWeight: 500 }}
    >
      {children}
    </th>
  )
}

function Td({ children }: { children?: React.ReactNode }) {
  return (
    <td
      className="py-4 align-top text-[var(--color-warm-taupe)]"
      style={{ fontFamily: 'var(--font-lora)' }}
    >
      {children}
    </td>
  )
}
