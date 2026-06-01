'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

export interface MediaOption {
  id: string
  alt: string | null
  caption: string | null
  type: string
  cloudflareId: string | null
  /** Pre-built delivery URL, computed on the server. */
  thumbnailUrl: string | null
  /** Pre-built hero-variant URL, computed on the server. Resolves both R2 and legacy Cloudflare Images rows. */
  heroUrl: string | null
}

interface HeroMediaPickerProps {
  options: MediaOption[]
  defaultSelectedId?: string | null
  /** Name of the hidden input that holds the chosen media id. */
  name: string
  onChange?: (selected: MediaOption | null) => void
}

export function HeroMediaPicker({
  options,
  defaultSelectedId,
  name,
  onChange,
}: HeroMediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(
    defaultSelectedId ?? null,
  )
  const [search, setSearch] = useState('')

  const selected = useMemo(
    () => options.find((o) => o.id === selectedId) ?? null,
    [options, selectedId],
  )

  function setSelected(id: string | null) {
    setSelectedId(id)
    onChange?.(id ? (options.find((o) => o.id === id) ?? null) : null)
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return options
    const q = search.trim().toLowerCase()
    return options.filter(
      (o) =>
        (o.alt ?? '').toLowerCase().includes(q) ||
        (o.caption ?? '').toLowerCase().includes(q),
    )
  }, [options, search])

  return (
    <div>
      <input type="hidden" name={name} value={selectedId ?? ''} />

      <div className="flex items-start gap-4">
        <div className="flex h-32 w-48 items-center justify-center overflow-hidden rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-soft-parchment)]">
          {selected?.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.thumbnailUrl}
              alt={selected.alt ?? ''}
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="px-2 text-center text-xs italic text-[var(--color-warm-taupe)] opacity-60"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              No hero image
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="bg-[var(--color-sage)] px-4 py-2 text-xs uppercase tracking-[0.25em] text-[var(--color-linen-cream)] hover:bg-[var(--color-forest)]"
            style={{ fontFamily: 'var(--font-lora)' }}
          >
            {selected ? 'change hero image' : 'pick hero image'}
          </button>
          {selected && (
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-left text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-burnt-sienna)]"
              style={{ fontFamily: 'var(--font-lora)' }}
            >
              remove
            </button>
          )}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-12"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-sm border border-[var(--color-linen-grey)] bg-[var(--color-linen-cream)] p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3
                className="text-xl text-[var(--color-espresso)]"
                style={{ fontFamily: 'var(--font-fraunces)' }}
              >
                Pick hero media
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs uppercase tracking-[0.25em] text-[var(--color-warm-taupe)] hover:text-[var(--color-sage)]"
                style={{ fontFamily: 'var(--font-lora)' }}
              >
                close
              </button>
            </div>

            {options.length === 0 ? (
              <div className="py-12 text-center">
                <p
                  className="text-[var(--color-warm-taupe)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                >
                  No media yet.
                </p>
                <Link
                  href="/admin/media/new"
                  className="mt-3 inline-block text-xs uppercase tracking-[0.25em] text-[var(--color-sage)] hover:text-[var(--color-forest)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                >
                  upload your first image →
                </Link>
              </div>
            ) : (
              <>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by alt or caption…"
                  className="mb-4 block w-full border-b border-[var(--color-linen-grey)] bg-transparent px-1 py-2 outline-none focus:border-[var(--color-sage)]"
                  style={{ fontFamily: 'var(--font-lora)' }}
                />
                <div className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4 md:grid-cols-5">
                  {filtered.map((m) => {
                    const active = m.id === selectedId
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => {
                          setSelected(m.id)
                          setOpen(false)
                        }}
                        className={`overflow-hidden rounded-sm border ${
                          active
                            ? 'border-[var(--color-sage)] ring-2 ring-[var(--color-sage)]'
                            : 'border-[var(--color-linen-grey)]'
                        }`}
                      >
                        <div className="aspect-[4/3] bg-[var(--color-soft-parchment)]">
                          {m.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.thumbnailUrl}
                              alt={m.alt ?? ''}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div
                              className="flex h-full items-center justify-center text-xs italic text-[var(--color-warm-taupe)] opacity-60"
                              style={{ fontFamily: 'var(--font-lora)' }}
                            >
                              {m.type.toLowerCase()}
                            </div>
                          )}
                        </div>
                        <div
                          className="truncate p-2 text-left text-xs text-[var(--color-warm-taupe)]"
                          style={{ fontFamily: 'var(--font-lora)' }}
                        >
                          {m.alt || m.caption || (
                            <span className="italic opacity-60">no alt</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                  {filtered.length === 0 && (
                    <p
                      className="col-span-full py-6 text-center text-sm italic text-[var(--color-warm-taupe)]"
                      style={{ fontFamily: 'var(--font-lora)' }}
                    >
                      No matches.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
