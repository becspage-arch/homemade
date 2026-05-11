import 'server-only'

/**
 * Build a Cloudflare Images delivery URL for a stored media item.
 *
 * Returns null when the media row doesn't yet have a Cloudflare ID (still
 * pending upload, or a video / non-image type). The actual upload flow lives
 * in /admin/media (Phase 2e).
 */
export function cloudflareDeliveryUrl(
  cloudflareId: string | null | undefined,
  variant: 'thumbnail' | 'public' = 'thumbnail',
): string | null {
  if (!cloudflareId) return null
  const hash = process.env.CLOUDFLARE_IMAGES_DELIVERY_HASH
  if (!hash) return null
  return `https://imagedelivery.net/${hash}/${cloudflareId}/${variant}`
}
