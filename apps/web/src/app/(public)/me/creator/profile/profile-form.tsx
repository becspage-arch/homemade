'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateCreatorProfile } from '@/lib/creator-actions'

interface Props {
  defaults: {
    bio: string
    specialty: string
    displayHandle: string
    websiteUrl: string
    instagramHandle: string
    youtubeHandle: string
    tiktokHandle: string
    substackUrl: string
    pinterestHandle: string
  }
}

export function CreatorProfileForm({ defaults }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [bio, setBio] = useState(defaults.bio)
  const [specialty, setSpecialty] = useState(defaults.specialty)
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
    setSuccess(false)
    start(async () => {
      const res = await updateCreatorProfile({
        bio,
        specialty,
        displayHandle,
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
      <div className="me-field">
        <label htmlFor="displayHandle">Handle</label>
        <input
          id="displayHandle"
          type="text"
          value={displayHandle}
          onChange={(e) => setDisplayHandle(e.target.value)}
          disabled={pending}
        />
        <span className="me-field-hint">
          Changing this changes your public profile URL.
        </span>
      </div>

      <div className="me-field">
        <label htmlFor="specialty">Specialty</label>
        <input
          id="specialty"
          type="text"
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          maxLength={200}
          disabled={pending}
        />
      </div>

      <div className="me-field">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={6}
          maxLength={4000}
          disabled={pending}
        />
        <span className="me-field-hint">{bio.length} / 4000 characters.</span>
      </div>

      <div className="me-field">
        <label htmlFor="websiteUrl">Website</label>
        <input
          id="websiteUrl"
          type="text"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          disabled={pending}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        <div className="me-field">
          <label htmlFor="instagramHandle">Instagram</label>
          <input
            id="instagramHandle"
            type="text"
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="me-field">
          <label htmlFor="youtubeHandle">YouTube</label>
          <input
            id="youtubeHandle"
            type="text"
            value={youtubeHandle}
            onChange={(e) => setYoutubeHandle(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="me-field">
          <label htmlFor="tiktokHandle">TikTok</label>
          <input
            id="tiktokHandle"
            type="text"
            value={tiktokHandle}
            onChange={(e) => setTiktokHandle(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="me-field">
          <label htmlFor="pinterestHandle">Pinterest</label>
          <input
            id="pinterestHandle"
            type="text"
            value={pinterestHandle}
            onChange={(e) => setPinterestHandle(e.target.value)}
            disabled={pending}
          />
        </div>
        <div className="me-field">
          <label htmlFor="substackUrl">Substack</label>
          <input
            id="substackUrl"
            type="text"
            value={substackUrl}
            onChange={(e) => setSubstackUrl(e.target.value)}
            disabled={pending}
          />
        </div>
      </div>

      {error && <p className="me-feedback error">{error}</p>}
      {success && <p className="me-feedback">Profile saved.</p>}

      <div>
        <button type="submit" className="me-button" disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
