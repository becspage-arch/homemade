import 'server-only'

/**
 * Build a public delivery URL for a stored media item.
 *
 * The new path is Cloudflare R2 (for storage) fronted by Cloudflare Image
 * Transformations (for resize). Image Transformations runs at the zone level
 * via the `/cdn-cgi/image/<params>/<absolute-url>` URL pattern.
 *
 *   https://homemade.education/cdn-cgi/image/width=800,format=auto/https://media.homemade.education/tutorials/abc.png
 *
 * The legacy Cloudflare Images path (imagedelivery.net) is kept for old
 * Media rows that still hold a `cloudflareId` — those rows pre-date this
 * worker session. New rows populate `r2Key` instead.
 */

export type ImageVariant = 'thumbnail' | 'public' | 'hero' | 'card'

interface MediaLike {
  r2Key?: string | null
  cloudflareId?: string | null
}

const VARIANT_PARAMS: Record<ImageVariant, string> = {
  thumbnail: 'width=200,format=auto',
  card: 'width=400,format=auto',
  public: 'width=1200,format=auto',
  hero: 'width=1600,format=auto',
}

const VARIANT_WIDTHS: Record<ImageVariant, number> = {
  thumbnail: 200,
  card: 400,
  public: 1200,
  hero: 1600,
}

function transformOrigin(): string {
  const explicit = process.env.CDN_IMAGE_TRANSFORM_ORIGIN
  if (explicit && explicit.length > 0) return explicit.replace(/\/$/, '')
  return 'https://homemade.education'
}

function r2PublicBase(): string {
  const explicit = process.env.R2_PUBLIC_BASE_URL
  if (explicit && explicit.length > 0) return explicit.replace(/\/$/, '')
  return 'https://media.homemade.education'
}

/**
 * Build a delivery URL for a Media row at the requested variant.
 *
 * Returns null when the row has no stored asset (either path) or when the
 * row is still pending upload.
 *
 * Two overloads are supported so existing call sites that only have a
 * cloudflareId string don't need to be touched:
 *
 *   mediaUrl(media, 'hero')
 *   mediaUrl(cloudflareIdString, 'hero')
 *   mediaUrl({ r2Key, cloudflareId }, 'hero')
 */
export function mediaUrl(
  source: MediaLike | string | null | undefined,
  variant: ImageVariant = 'thumbnail',
): string | null {
  if (!source) return null

  let r2Key: string | null = null
  let cloudflareId: string | null = null
  if (typeof source === 'string') {
    cloudflareId = source
  } else {
    r2Key = source.r2Key ?? null
    cloudflareId = source.cloudflareId ?? null
  }

  // R2-backed assets go through Image Transformations.
  if (r2Key) {
    const params = VARIANT_PARAMS[variant]
    const target = `${r2PublicBase()}/${r2Key}`
    return `${transformOrigin()}/cdn-cgi/image/${params}/${target}`
  }

  // Legacy Cloudflare Images rows continue to work via imagedelivery.net.
  if (cloudflareId) {
    const hash = process.env.CLOUDFLARE_IMAGES_DELIVERY_HASH
    if (!hash) return null
    return `https://imagedelivery.net/${hash}/${cloudflareId}/${variant}`
  }

  return null
}

/**
 * Back-compat alias for the old name. Kept so existing call sites don't all
 * break at once; new code should call `mediaUrl` directly. Removable once
 * every call site has been migrated to pass the Media row.
 */
export function cloudflareDeliveryUrl(
  source: MediaLike | string | null | undefined,
  variant: ImageVariant = 'thumbnail',
): string | null {
  return mediaUrl(source, variant)
}

/**
 * Build a `srcSet` string + a default `src` for responsive images.
 * Pass the variant the layout would normally use as `defaultVariant`; the
 * generated srcSet adds bigger variants for Retina + larger viewports.
 *
 * Returns null when the row has no stored asset (matches `mediaUrl`).
 */
export function mediaSrcSet(
  source: MediaLike | string | null | undefined,
  defaultVariant: ImageVariant,
  extraVariants: ImageVariant[] = [],
): { src: string; srcSet: string; widths: number[] } | null {
  const src = mediaUrl(source, defaultVariant)
  if (!src) return null
  const variants = Array.from(new Set([defaultVariant, ...extraVariants]))
  const entries: { url: string; width: number }[] = []
  for (const v of variants) {
    const u = mediaUrl(source, v)
    if (u) entries.push({ url: u, width: VARIANT_WIDTHS[v] })
  }
  entries.sort((a, b) => a.width - b.width)
  return {
    src,
    srcSet: entries.map((e) => `${e.url} ${e.width}w`).join(', '),
    widths: entries.map((e) => e.width),
  }
}
