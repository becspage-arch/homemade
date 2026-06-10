'use client'

/**
 * SewingInstructionsPanel - renders the pattern's instructionsBody.
 *
 * The body is a TipTap-style JSON doc. Top-level content nodes are
 * walked directly; we recognise the document layout used by sewing
 * patterns:
 *
 *   paragraph at the top → intro / preface
 *   heading level 3      → start of a numbered step
 *   paragraph after a    → step body
 *     heading
 *
 * Steps render with a "Mark complete" toggle that writes through the
 * onToggleStep callback. The host wires that to the autosave hook for
 * signed-in users.
 */

import { useMemo } from 'react'
import type { SewingTipTapDoc, SewingTipTapNode } from './types'

interface SewingInstructionsPanelProps {
  body: SewingTipTapDoc | null
  /** Per-step completion. Key = step index (0-based). */
  stepsProgress: Record<string, { completedAt: string; notes?: string | null }>
  onToggleStep: (stepIndex: number) => void
  showActions: boolean
}

interface ParsedStep {
  heading: string
  paragraphs: string[]
}

interface ParsedBody {
  intro: string[]
  steps: ParsedStep[]
}

export function SewingInstructionsPanel({
  body,
  stepsProgress,
  onToggleStep,
  showActions,
}: SewingInstructionsPanelProps) {
  const parsed = useMemo(() => parseBody(body), [body])

  if (!body || parsed.steps.length === 0) {
    return (
      <div className="sew-panel-section sew-instructions">
        <h3 className="sew-panel-heading">Instructions</h3>
        <p className="sew-instructions-step-intro">
          The instructions for this pattern aren&apos;t in yet.
        </p>
      </div>
    )
  }

  return (
    <div className="sew-panel-section sew-instructions">
      <h3 className="sew-panel-heading">Instructions</h3>
      <div className="sew-instructions-body">
        {parsed.intro.map((p, i) => (
          <p key={`intro-${i}`} className="sew-instructions-step-intro">
            {p}
          </p>
        ))}
        {parsed.steps.map((step, idx) => {
          const completed = Boolean(stepsProgress[String(idx)])
          return (
            <div
              key={idx}
              className={`sew-instructions-step ${completed ? 'completed' : ''}`}
            >
              <div className="sew-instructions-step-heading">
                <span>{step.heading}</span>
                {showActions && (
                  <div className="sew-instructions-step-actions">
                    <button type="button" onClick={() => onToggleStep(idx)}>
                      {completed ? 'Undo' : 'Mark complete'}
                    </button>
                  </div>
                )}
              </div>
              {step.paragraphs.map((p, i) => (
                <p key={i} className="sew-instructions-step-paragraph">
                  {p}
                </p>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function parseBody(body: SewingTipTapDoc | null): ParsedBody {
  if (!body || !Array.isArray(body.content)) return { intro: [], steps: [] }
  const intro: string[] = []
  const steps: ParsedStep[] = []
  let currentStep: ParsedStep | null = null
  for (const node of body.content) {
    if (node.type === 'heading' && (node.attrs?.level === 3 || node.attrs?.level === 2)) {
      if (currentStep) steps.push(currentStep)
      currentStep = { heading: nodeText(node), paragraphs: [] }
    } else if (node.type === 'paragraph') {
      const text = nodeText(node)
      if (!text) continue
      if (currentStep) currentStep.paragraphs.push(text)
      else intro.push(text)
    }
  }
  if (currentStep) steps.push(currentStep)
  return { intro, steps }
}

function nodeText(node: SewingTipTapNode): string {
  if (typeof node.text === 'string') return node.text
  if (!Array.isArray(node.content)) return ''
  return node.content.map((c) => nodeText(c)).join('')
}
