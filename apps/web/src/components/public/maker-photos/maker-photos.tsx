import Link from 'next/link'
import type { PatternType } from '@homemade/db'
import type { MakerPhotoView } from '@/lib/maker-photos'
import { UploadPhotoButton } from './upload-photo-button'
import { PhotoReportLink } from './photo-report-link'

import './maker-photos.css'

/**
 * The shared maker-photo strip. Sits beside the hero on every made thing:
 * cross-stitch, crochet, knitting, needlework and sewing patterns, and
 * tutorials and recipes.
 *
 * Photos, handle credit, an Upload photo button, and the finished count where
 * one exists. Nothing else: no comments, likes, follows or reactions, and
 * nothing a member can do to another member's photo.
 */

interface MakerPhotosProps {
  photos: MakerPhotoView[]
  signedIn: boolean
  /** Exactly one of the two. */
  tutorialId?: string | null
  patternId?: string | null
  patternType?: PatternType | null
  /** Makers who have finished this, where the count exists. */
  finishedCount?: number | null
  /** Where sign-in comes back to. */
  returnTo?: string | null
  /** The category's gallery wall, when this thing sits in one. */
  galleryHref?: string | null
  heading?: string
}

export function MakerPhotos({
  photos,
  signedIn,
  tutorialId,
  patternId,
  patternType,
  finishedCount,
  returnTo,
  galleryHref,
  heading = 'Made by makers',
}: MakerPhotosProps) {
  const showCount = typeof finishedCount === 'number' && finishedCount > 0

  return (
    <section className="maker-photos" aria-label={heading}>
      <div className="maker-photos-header">
        <h2 className="maker-photos-title">{heading}</h2>
        {showCount && (
          <p className="maker-photos-count">
            Finished by {finishedCount.toLocaleString()}{' '}
            {finishedCount === 1 ? 'maker' : 'makers'}
          </p>
        )}
        {galleryHref && photos.length > 0 && (
          <Link className="maker-photos-count" href={galleryHref}>
            See every photo
          </Link>
        )}
      </div>

      {photos.length === 0 ? (
        <p className="maker-photos-empty">No photos yet. Yours could be the first.</p>
      ) : (
        <ul className="maker-photos-strip">
          {photos.map((p) => (
            <li className="maker-photos-item" key={p.id}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="maker-photos-image"
                src={p.thumbUrl ?? undefined}
                alt={p.alt}
                loading="lazy"
                decoding="async"
              />
              {p.handleHref ? (
                <Link className="maker-photos-credit" href={p.handleHref}>
                  {p.handle}
                </Link>
              ) : (
                <span className="maker-photos-credit">{p.handle}</span>
              )}
              {p.caption && <span className="maker-photos-caption">{p.caption}</span>}
              {signedIn && <PhotoReportLink photoId={p.id} />}
            </li>
          ))}
        </ul>
      )}

      <UploadPhotoButton
        tutorialId={tutorialId ?? null}
        patternId={patternId ?? null}
        patternType={patternType ?? null}
        signedIn={signedIn}
        returnTo={returnTo ?? null}
      />
    </section>
  )
}
