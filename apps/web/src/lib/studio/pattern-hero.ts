import 'server-only'
import { mediaUrl, type ImageVariant } from '@/lib/media'

/**
 * Pick the right hero URL for a Pattern row.
 *
 * If a finished-piece photograph has been attached (the heroMediaId
 * relation resolves to a populated Media row), use the photo: that's
 * the most beautiful, on-brand surface. Otherwise fall back to the
 * server-rendered beauty thumbnail at /api/studio/patterns/[id]/thumbnail
 * — strand-shaded X stitches on Aida weave with a soft drop shadow.
 *
 * The fallback isn't a "no hero" state. It's a deliberate render that's
 * meant to look like a finished stitched piece, just without the
 * photographer's lighting and composition.
 */
export function patternHeroUrl(
  pattern: {
    id: string
    hero?: { r2Key?: string | null; cloudflareId?: string | null } | null
  },
  variant: ImageVariant = 'card',
): string {
  const photo = pattern.hero ? mediaUrl(pattern.hero, variant) : null
  if (photo) return photo
  return `/api/studio/patterns/${pattern.id}/thumbnail`
}
