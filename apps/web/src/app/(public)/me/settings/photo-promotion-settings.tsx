'use client'

import { useState, useTransition } from 'react'
import { setPhotoPromotionAllowed } from '@/lib/maker-photo-actions'

/**
 * "Use my photos in Homemade's promotion". Default on. Turning it off applies
 * to photos already on the site as well as new ones; taking a photo down
 * entirely is a separate action on My photos.
 */
export function PhotoPromotionSettings({ initialAllowed }: { initialAllowed: boolean }) {
  const [allowed, setAllowed] = useState(initialAllowed)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [, start] = useTransition()

  function toggle(next: boolean) {
    setError(null)
    setStatus('saving')
    setAllowed(next)
    start(async () => {
      const res = await setPhotoPromotionAllowed(next)
      if (res.ok) {
        setStatus('saved')
      } else {
        setStatus('error')
        setError(res.error)
        setAllowed(!next)
      }
    })
  }

  return (
    <div>
      <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontFamily: 'var(--font-lora)' }}>
        <input
          type="checkbox"
          checked={allowed}
          onChange={(e) => toggle(e.target.checked)}
          disabled={status === 'saving'}
        />
        <span>Use my photos in Homemade&rsquo;s promotion</span>
      </label>
      {status === 'saved' && <p className="me-feedback">Saved.</p>}
      {error && <p className="me-feedback error">{error}</p>}
    </div>
  )
}
