'use client'

import { useEffect, useRef, useState } from 'react'
import { updateProjectNotes } from '@/lib/user-state-actions'

interface ProjectNotesProps {
  projectId: string
  initialNotes: string
}

/**
 * Notes textarea with debounced auto-save. No explicit save button — the
 * intent is "scrawl as you go". On unmount, we flush so a quick visit doesn't
 * lose typing.
 */
export function ProjectNotes({ projectId, initialNotes }: ProjectNotesProps) {
  const [value, setValue] = useState(initialNotes)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latest = useRef(initialNotes)
  const dirty = useRef(false)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
      // Flush any pending change on unmount.
      if (dirty.current) {
        void updateProjectNotes(projectId, latest.current)
      }
    }
  }, [projectId])

  function onChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    const next = e.target.value
    setValue(next)
    latest.current = next
    dirty.current = true
    setStatus('saving')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      const snapshot = latest.current
      await updateProjectNotes(projectId, snapshot)
      dirty.current = false
      setStatus('saved')
    }, 1000)
  }

  return (
    <div>
      <div className="me-field">
        <textarea
          className="me-notes-area"
          value={value}
          onChange={onChange}
          placeholder="Field notes, swaps you tried, what went wrong, what worked."
          rows={8}
        />
      </div>
      <p className="me-feedback">
        {status === 'saving' && 'saving…'}
        {status === 'saved' && 'saved.'}
      </p>
    </div>
  )
}
