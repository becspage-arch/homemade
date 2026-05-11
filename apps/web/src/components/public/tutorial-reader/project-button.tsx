'use client'

import { useTransition } from 'react'
import {
  abandonProject,
  markProjectComplete,
  resumeProject,
  startProject,
} from '@/lib/user-state-actions'

interface ProjectButtonProps {
  tutorialId: string
  projectId: string | null
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | null
  completedAt?: Date | null
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ProjectButton({
  tutorialId,
  projectId,
  status,
  completedAt,
}: ProjectButtonProps) {
  const [pending, start] = useTransition()

  function run(fn: () => Promise<unknown>): void {
    start(async () => {
      await fn()
    })
  }

  if (!status) {
    return (
      <button
        type="button"
        className="reader-action primary"
        onClick={() => run(() => startProject(tutorialId))}
        disabled={pending}
      >
        Start making
      </button>
    )
  }

  if (status === 'IN_PROGRESS' && projectId) {
    return (
      <div className="reader-action-group">
        <span className="reader-action-label">In progress</span>
        <button
          type="button"
          className="reader-action"
          onClick={() => run(() => markProjectComplete(projectId))}
          disabled={pending}
        >
          Mark complete
        </button>
        <button
          type="button"
          className="reader-action subtle"
          onClick={() => run(() => abandonProject(projectId))}
          disabled={pending}
        >
          Set aside
        </button>
      </div>
    )
  }

  if (status === 'COMPLETED' && projectId) {
    return (
      <div className="reader-action-group">
        <span className="reader-action-label">
          {completedAt
            ? `Completed ${formatShortDate(completedAt)}`
            : 'Completed'}
        </span>
        <button
          type="button"
          className="reader-action subtle"
          onClick={() => run(() => resumeProject(projectId))}
          disabled={pending}
        >
          Make this again
        </button>
      </div>
    )
  }

  // ABANDONED
  if (projectId) {
    return (
      <div className="reader-action-group">
        <span className="reader-action-label subtle">Set aside</span>
        <button
          type="button"
          className="reader-action"
          onClick={() => run(() => resumeProject(projectId))}
          disabled={pending}
        >
          Pick it back up
        </button>
      </div>
    )
  }

  return null
}
