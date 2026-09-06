'use client'

import { useState, useTransition } from 'react'
import {
  abandonProject,
  markProjectComplete,
  resumeProject,
} from '@/lib/user-state-actions'
import { UploadPhotoButton } from '@/components/public/maker-photos/upload-photo-button'

type Status = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'

interface ProjectStatusControlsProps {
  projectId: string
  status: Status
  /** The tutorial the project is of, so the finish moment can take a photo. */
  tutorialId: string
}

export function ProjectStatusControls({
  projectId,
  status,
  tutorialId,
}: ProjectStatusControlsProps) {
  const [pending, start] = useTransition()
  // The finish moment: the tap that logs it as made puts Upload photo on the
  // same screen. Skipping is one tap.
  const [justFinished, setJustFinished] = useState(false)

  function run(fn: () => Promise<unknown>): void {
    start(async () => {
      await fn()
    })
  }

  if (justFinished) {
    return (
      <div>
        <p style={{ fontFamily: 'var(--font-lora)', marginTop: 0 }}>
          Logged as made. Add a photo of how it turned out?
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <UploadPhotoButton tutorialId={tutorialId} signedIn />
          <button
            type="button"
            className="me-button secondary"
            onClick={() => setJustFinished(false)}
          >
            Not now
          </button>
        </div>
      </div>
    )
  }

  if (status === 'IN_PROGRESS') {
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="me-button"
          disabled={pending}
          onClick={() =>
            run(async () => {
              await markProjectComplete(projectId)
              setJustFinished(true)
            })
          }
        >
          Log as Made it
        </button>
        <button
          type="button"
          className="me-button danger"
          disabled={pending}
          onClick={() => run(() => abandonProject(projectId))}
        >
          Set aside
        </button>
      </div>
    )
  }

  if (status === 'COMPLETED') {
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <UploadPhotoButton tutorialId={tutorialId} signedIn />
        <button
          type="button"
          className="me-button secondary"
          disabled={pending}
          onClick={() => run(() => resumeProject(projectId))}
        >
          Make this again
        </button>
      </div>
    )
  }

  // ABANDONED
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <button
        type="button"
        className="me-button"
        disabled={pending}
        onClick={() => run(() => resumeProject(projectId))}
      >
        Pick it back up
      </button>
    </div>
  )
}
