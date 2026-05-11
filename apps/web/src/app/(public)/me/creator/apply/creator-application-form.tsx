'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitCreatorApplication } from '@/lib/creator-actions'

interface Props {
  defaults: {
    bio: string
    specialty: string
    applicationNote: string
    displayHandle: string
    websiteUrl: string
    instagramHandle: string
    youtubeHandle: string
    tiktokHandle: string
    substackUrl: string
    pinterestHandle: string
  }
  /** True when the user already has a handle on their account. */
  handleAlreadySet: boolean
}

export function CreatorApplicationForm({ defaults, handleAlreadySet }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [bio, setBio] = useState(defaults.bio)
  const [specialty, setSpecialty] = useState(defaults.specialty)
  const [applicationNote, setApplicationNote] = useState(defaults.applicationNote)
  const [displayHandle, setDisplayHandle] = useState(defaults.displayHandle)
  const [websiteUrl, setWebsiteUrl] = useState(defaults.websiteUrl)
  const [instagramHandle, setInstagramHandle] = useState(defaults.instagramHandle)
  const [youtubeHandle, setYoutubeHandle] = useState(defaults.youtubeHandle)
  const [tiktokHandle, setTiktokHandle] = useState(defaults.tiktokHandle)
  const [substackUrl, setSubstackUrl] = useState(defaults.substackUrl)
  const [pinterestHandle, setPinterestHandle] = useState(defaults.pinterestHandle)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const res = await submitCreatorApplication({
        bio,
        specialty,
        displayHandle: handleAlreadySet ? null : displayHandle,
        applicationNote,
        websiteUrl,
        instagramHandle,
        youtubeHandle,
        tiktokHandle,
        substackUrl,
        pinterestHandle,
      })
      if (res.ok) {
        setSuccess(true)
        router.refresh()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <form className="me-form" onSubmit={onSubmit} style={{ maxWidth: 640 }}>
      {!handleAlreadySet && (
        <div className="me-field">
          <label htmlFor="displayHandle">Handle</label>
          <input
            id="displayHandle"
            type="text"
            value={displayHandle}
            onChange={(e) => setDisplayHandle(e.target.value)}
            placeholder="e.g. ada-makes"
            disabled={pending}
          />
          <span className="me-field-hint">
            Lowercase letters, numbers, underscores, hyphens. 3–32 characters.
            Your public profile lives at /makers/<em>your-handle</em>.
          </span>
        </div>
      )}

      <div className="me-field">
        <label htmlFor="specialty">Specialty</label>
        <input
          id="specialty"
          type="text"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          placeholder="e.g. seasonal vegetables, slow-bread baking, crochet"
          maxLength={200}
          disabled={pending}
        />
        <span className="me-field-hint">A short line — what you’re known for.</span>
      </div>

      <div className="me-field">
        <label htmlFor="bio">About you</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A few sentences readers will see on your profile."
          rows={6}
          maxLength={4000}
          disabled={pending}
        />
        <span className="me-field-hint">{bio.length} / 4000 characters.</span>
      </div>

      <div className="me-field">
        <label htmlFor="applicationNote">Note to the Homemade team (private)</label>
        <textarea
          id="applicationNote"
          value={applicationNote}
          onChange={(e) => setApplicationNote(e.target.value)}
          placeholder="Anything you’d like the reviewers to know — only the team sees this."
          rows={4}
          maxLength={4000}
          disabled={pending}
        />
      </div>

      <div className="me-field">
        <label htmlFor="websiteUrl">Website (optional)</label>
        <input
          id="websiteUrl"
          type="text"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://"
          disabled={pending}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        <div className="me-field">
          <label htmlFor="instagramHandle">Instagram (optional)</label>
          <input
            id="instagramHandle"
            type="text"
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
            placeholder="@handle"
            disabled={pending}
          />
        </div>
        <div className="me-field">
          <label htmlFor="youtubeHandle">YouTube (optional)</label>
          <input
            id="youtubeHandle"
            type="text"
            value={youtubeHandle}
            onChange={(e) => setYoutubeHandle(e.target.value)}
            placeholder="@channel"
            disabled={pending}
          />
        </div>
        <div className="me-field">
          <label htmlFor="tiktokHandle">TikTok (optional)</label>
          <input
            id="tiktokHandle"
            type="text"
            value={tiktokHandle}
            onChange={(e) => setTiktokHandle(e.target.value)}
            placeholder="@handle"
            disabled={pending}
          />
        </div>
        <div className="me-field">
          <label htmlFor="pinterestHandle">Pinterest (optional)</label>
          <input
            id="pinterestHandle"
            type="text"
            value={pinterestHandle}
            onChange={(e) => setPinterestHandle(e.target.value)}
            placeholder="username"
            disabled={pending}
          />
        </div>
        <div className="me-field">
          <label htmlFor="substackUrl">Substack (optional)</label>
          <input
            id="substackUrl"
            type="text"
            value={substackUrl}
            onChange={(e) => setSubstackUrl(e.target.value)}
            placeholder="https://yours.substack.com"
            disabled={pending}
          />
        </div>
      </div>

      {error && <p className="me-feedback error">{error}</p>}
      {success && (
        <p className="me-feedback">
          Application sent. The team will be in touch.
        </p>
      )}

      <div>
        <button type="submit" className="me-button" disabled={pending}>
          {pending ? 'Sending…' : 'Submit application'}
        </button>
      </div>
    </form>
  )
}
