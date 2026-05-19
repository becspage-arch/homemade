'use client'

import { useTransition } from 'react'
import {
  abandonProject,
  markProjectComplete,
  resumeProject,
} from '@/lib/user-state-actions'

type Status = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'

interface ProjectStatusControlsProps {
  projectId: string
  status: Status
}

export function ProjectStatusControls({
  projectId,
  status,
}: ProjectStatusControlsProps) {
  const [pending, start] = useTransition()

  function run(fn: () => Promise<unknown>): void {
    start(async () => {
      await fn()
    })
  }

  if (status === 'IN_PROGRESS') {
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="me-button"
          disabled={pending}
          onClick={() => run(() => markProjectComplete(projectId))}
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
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
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
