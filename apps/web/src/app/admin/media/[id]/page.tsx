import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma, MediaStatus } from '@homemade/db'
import { mediaUrl } from '@/lib/media'
import { updateMedia, deleteMedia } from '../actions'

export const dynamic = 'force-dynamic'

export default async function EditMediaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const media = await prisma.media.findUnique({
    where: { id },
    include: { _count: { select: { tutorialsHero: true } } },
  })
  if (!media) notFound()

  const previewUrl =
    media.status === MediaStatus.READY ? mediaUrl(media, 'public') : null

  const updateAction = updateMedia.bind(null, id)
  const deleteAction = deleteMedia.bind(null, id)
  const blocked = media._count.tutorialsHero > 0

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-12">
        <Link
          href="/admin/media"
          className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          ← all media
        </Link>
        <h1
          className="mt-4 text-4xl text-[var(--color-espresso)]"
          style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 400 }}
        >
          Edit media
        </h1>
      </div>

      <div className="mb-12 flex gap-8">
        <div className="w-64 flex-shrink-0">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={media.alt ?? ''}
              className="w-full border border-[var(--color-linen-grey)] object-contain"
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center border border-[var(--color-linen-grey)] text-xs uppercase tracking-[0.2em] text-[var(--color-warm-taupe)]">
              {media.status === MediaStatus.FAILED ? 'upload failed' : 'no preview'}
            </div>
          )}
        </div>
        <dl
          className="flex-1 space-y-2 text-sm text-[var(--color-warm-taupe)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          <Pair label="Filename" value={media.filename ?? '—'} />
          <Pair label="MIME" value={media.mimeType ?? '—'} mono />
          <Pair
            label="Dimensions"
            value={media.width && media.height ? `${media.width} × ${media.height}` : '—'}
          />
          <Pair label="Size" value={media.bytes ? formatBytes(media.bytes) : '—'} />
          <Pair label="R2 key" value={media.r2Key ?? '—'} mono />
          <Pair label="Cloudflare ID" value={media.cloudflareId ?? '—'} mono />
          <Pair label="Status" value={media.status.toLowerCase()} />
          <Pair label="Uploaded" value={media.createdAt.toLocaleString('en-GB')} />
        </dl>
      </div>

      <form action={updateAction} className="space-y-8">
        <Field
          label="Alt text"
          hint="What the image shows. Required for accessibility on any image used in a tutorial."
          name="alt"
          defaultValue={media.alt ?? ''}
          multiline
        />
        <Field
          label="Caption"
          hint="Optional caption shown beneath the image in tutorials."
          name="caption"
          defaultValue={media.caption ?? ''}
          multiline
        />
        <Field
          label="Credit / attribution"
          hint="Where the image came from. Wikimedia, Unsplash, Pexels, photographer name, etc."
          name="attribution"
          defaultValue={media.attribution ?? ''}
        />

        <div className="pt-4">
          <button
            type="submit"
            className="bg-[var(--color-sage)] px-6 py-3 text-xs uppercase tracking-[0.3em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            save changes
          </button>
        </div>
      </form>

      <form action={deleteAction} className="mt-16 border-t border-[var(--color-linen-grey)] pt-8">
        {blocked ? (
          <p
            className="mb-4 text-sm text-[var(--color-burnt-sienna)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            This image is used as the hero on {media._count.tutorialsHero} tutorial
            {media._count.tutorialsHero === 1 ? '' : 's'}. Swap the hero on those before deleting.
          </p>
        ) : (
          <p
            className="mb-4 text-sm text-[var(--color-warm-taupe)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            Deleting removes the asset from Cloudflare and the database. It cannot be undone.
          </p>
        )}
        <button
          type="submit"
          disabled={blocked}
          className="border border-[var(--color-burnt-sienna)] px-5 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-burnt-sienna)] hover:bg-[var(--color-burnt-sienna)] hover:text-[var(--color-linen-cream)] disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[var(--color-burnt-sienna)]"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          delete image
        </button>
      </form>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function Pair({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-3">
      <dt
        className="w-32 flex-shrink-0 text-xs uppercase tracking-[0.2em]"
        style={{ fontFamily: 'var(--font-lora)' }}
      >
        {label}
      </dt>
      <dd
        className={mono ? 'font-mono text-xs text-[var(--color-espresso)]' : 'text-[var(--color-espresso)]'}
      >
        {value}
      </dd>
    </div>
  )
}

interface FieldProps {
  label: string
  hint?: string
  name: string
  defaultValue?: string
  multiline?: boolean
}

function Field({ label, hint, name, defaultValue, multiline }: FieldProps) {
  const inputClass =
    'w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 text-[var(--color-espresso)] outline-none focus:border-[var(--color-sage)]'
  const inputStyle: React.CSSProperties = { fontFamily: 'var(--font-lora)', fontSize: '1rem' }

  return (
    <label className="block">
      <span
        className="block text-xs uppercase text-[var(--color-warm-taupe)]"
        style={{ fontFamily: 'var(--font-lora)', letterSpacing: '0.25em' }}
      >
        {label}
      </span>
      {hint && (
        <span
          className="mb-2 mt-1 block text-xs text-[var(--color-warm-taupe)] opacity-70"
          style={{ fontFamily: 'var(--font-lora)', fontStyle: 'italic' }}
        >
          {hint}
        </span>
      )}
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={3}
          className={inputClass}
          style={inputStyle}
        />
      ) : (
        <input
          type="text"
          name={name}
          defaultValue={defaultValue}
          className={inputClass}
          style={inputStyle}
        />
      )}
    </label>
  )
}
