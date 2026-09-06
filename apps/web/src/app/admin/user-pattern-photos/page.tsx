import { redirect } from 'next/navigation'

/**
 * Retired. Pattern photos and tutorial photos are one model now, and one admin
 * surface with them. Kept as a redirect so old bookmarks and links still land
 * somewhere useful.
 */
export default function RetiredUserPatternPhotosPage(): never {
  redirect('/admin/ugc-photos')
}
