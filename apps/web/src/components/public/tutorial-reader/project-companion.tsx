'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import {
  abandonProject,
  markProjectComplete,
  toggleSupplyChecked,
  updateProjectNotes,
} from '@/lib/user-state-actions'
import type { HarvestedSupply } from '@/lib/supplies'

interface ProjectCompanionProps {
  projectId: string
  supplies: HarvestedSupply[]
  initialChecked: string[]
  initialNotes: string
  /** Beginner mode surfaces substitution hints in the supplies list. */
  beginnerMode: boolean
}

/**
 * Right-rail companion for in-progress projects. Supplies tick-list, notes
 * jotter, status controls. Collapsed by default on mobile via the host CSS
 * (rails go static below 1100px).
 */
export function ProjectCompanion({
  projectId,
  supplies,
  initialChecked,
  initialNotes,
  beginnerMode,
}: ProjectCompanionProps) {
  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(initialChecked),
  )
  const [notes, setNotes] = useState(initialNotes)
  const [notesStatus, setNotesStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle',
  )
  const [pending, start] = useTransition()

  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestNotes = useRef(initialNotes)
  const dirtyNotes = useRef(false)

  useEffect(() => {
    return () => {
      if (notesTimer.current) clearTimeout(notesTimer.current)
      if (dirtyNotes.current) {
        void updateProjectNotes(projectId, latestNotes.current)
      }
    }
  }, [projectId])

  function toggleSupply(key: string): void {
    const next = new Set(checked)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setChecked(next)
    void toggleSupplyChecked(projectId, key)
  }

  function onNotesChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    const next = e.target.value
    setNotes(next)
    latestNotes.current = next
    dirtyNotes.current = true
    setNotesStatus('saving')
    if (notesTimer.current) clearTimeout(notesTimer.current)
    notesTimer.current = setTimeout(async () => {
      await updateProjectNotes(projectId, latestNotes.current)
      dirtyNotes.current = false
      setNotesStatus('saved')
    }, 1000)
  }

  return (
    <aside className="companion">
      <span className="companion-label">You're making this</span>

      {supplies.length > 0 && (
        <section className="companion-section">
          <span className="companion-section-label">Supplies</span>
          <ul className="companion-supplies">
            {supplies.map((s) => {
              const isChecked = checked.has(s.key)
              return (
                <li key={s.key}>
                  <label>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSupply(s.key)}
                    />
                    <span
                      className={`companion-supply-name${
                        isChecked ? ' checked' : ''
                      }`}
                    >
                      {s.qty ? `${s.qty} ` : ''}
                      {s.name}
                    </span>
                  </label>
                  {beginnerMode && s.substitutions && (
                    <span className="companion-supply-sub">
                      or {s.substitutions}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="companion-section">
        <span className="companion-section-label">Quick notes</span>
        <textarea
          className="companion-notes"
          value={notes}
          onChange={onNotesChange}
          placeholder="Field notes for next time."
          rows={5}
        />
        <span className="companion-status">
          {notesStatus === 'saving' && 'saving…'}
          {notesStatus === 'saved' && 'saved.'}
        </span>
      </section>

      <section className="companion-section actions">
        <button
          type="button"
          className="reader-action"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await markProjectComplete(projectId)
            })
          }
        >
          Mark complete
        </button>
        <button
          type="button"
          className="reader-action subtle"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await abandonProject(projectId)
            })
          }
        >
          Set aside
        </button>
      </section>
    </aside>
  )
}
