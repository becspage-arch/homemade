import 'server-only'
import { mediaUrl, type ImageVariant } from '@/lib/media'

/**
 * Pick the right hero URL for a Pattern row.
 *
 * Resolution order:
 *   1. heroMediaId — a finished-piece photograph (most beautiful, on-brand).
 *   2. thumbnailMediaId — the chart render persisted to R2 (a static CDN
 *      asset, generated once rather than re-rendered on every request).
 *   3. the on-demand render route /api/studio/patterns/[id]/thumbnail, which
 *      persists to (2) on first hit and redirects there on later hits.
 *
 * The render fallback isn't a "no hero" state. It's a deliberate render meant
 * to look like a finished stitched piece, just without the photographer's
 * lighting and composition.
 */
export function patternHeroUrl(
  pattern: {
    id: string
    hero?: { r2Key?: string | null; cloudflareId?: string | null } | null
    thumbnail?: { r2Key?: string | null; cloudflareId?: string | null } | null
  },
  variant: ImageVariant = 'card',
): string {
  const photo = pattern.hero ? mediaUrl(pattern.hero, variant) : null
  if (photo) return photo
  const saved = pattern.thumbnail ? mediaUrl(pattern.thumbnail, variant) : null
  if (saved) return saved
  return `/api/studio/patterns/${pattern.id}/thumbnail`
}
