'use client'

import { useState, useTransition } from 'react'
import {
  updateBeginnerMode,
  updateProfile,
} from '@/lib/user-state-actions'

interface SettingsFormProps {
  initialBeginnerMode: boolean
  initialHandle: string | null
  initialBio: string | null
}

export function SettingsForm({
  initialBeginnerMode,
  initialHandle,
  initialBio,
}: SettingsFormProps) {
  const [beginnerMode, setBeginnerMode] = useState(initialBeginnerMode)
  const [handle, setHandle] = useState(initialHandle ?? '')
  const [bio, setBio] = useState(initialBio ?? '')
  const [beginnerStatus, setBeginnerStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [profileStatus, setProfileStatus] = useState<{
    state: 'idle' | 'saving' | 'saved' | 'error'
    message?: string
  }>({ state: 'idle' })
  const [, startBeginner] = useTransition()
  const [, startProfile] = useTransition()

  function toggleBeginner(next: boolean) {
    setBeginnerMode(next)
    setBeginnerStatus('saving')
    startBeginner(async () => {
      await updateBeginnerMode(next)
      setBeginnerStatus('saved')
    })
  }

  function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileStatus({ state: 'saving' })
    startProfile(async () => {
      const res = await updateProfile({
        displayHandle: handle.trim() || null,
        bio: bio.trim() || null,
      })
      if (res.ok) setProfileStatus({ state: 'saved' })
      else setProfileStatus({ state: 'error', message: res.error })
    })
  }

  return (
    <div className="me-form" style={{ marginTop: 8 }}>
      <label className="me-toggle">
        <input
          type="checkbox"
          checked={beginnerMode}
          onChange={(e) => toggleBeginner(e.target.checked)}
        />
        <span>Beginner mode</span>
      </label>
      <p className="me-feedback">
        {beginnerStatus === 'saving' && 'saving…'}
        {beginnerStatus === 'saved' && 'saved.'}
      </p>

      <form className="me-form" onSubmit={saveProfile} style={{ marginTop: 24 }}>
        <div className="me-field">
          <label htmlFor="settings-handle">Display handle</label>
          <input
            id="settings-handle"
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="e.g. rosehip-kitchen"
            maxLength={32}
            autoComplete="off"
          />
          <span className="me-field-hint">
            Used on your projects later, when other readers can see them. 2-32
            characters: lowercase letters, numbers, dashes, underscores.
          </span>
        </div>

        <div className="me-field">
          <label htmlFor="settings-bio">A line about you</label>
          <textarea
            id="settings-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={280}
            placeholder="Optional. Where you live, what you make, how long you've been at it."
          />
        </div>

        <div>
          <button type="submit" className="me-button">
            Save profile
          </button>
        </div>

        {profileStatus.state === 'saving' && (
          <p className="me-feedback">saving…</p>
        )}
        {profileStatus.state === 'saved' && <p className="me-feedback">saved.</p>}
        {profileStatus.state === 'error' && (
          <p className="me-feedback error">{profileStatus.message}</p>
        )}
      </form>
    </div>
  )
}
