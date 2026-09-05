'use client'

/**
 * Describe an idea.
 *
 * A short conversation: the maker says what they want to make, the assistant
 * says back what it means to build, the maker adjusts, and when it sounds right
 * the assistant writes the stitch program. Nothing reaches the maker until that
 * program has compiled and passed the loom's audit gate on the server, so an
 * idea that came out of a chat is held to the same bar as anything else.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Loader2, SendHorizontal } from 'lucide-react'
import { writeInstructions, type CrochetProgram } from '@/lib/loom/crochet/engine/program'
import type { CompositionProgram } from '@/lib/loom/crochet/engine/composition'
import { compositionPieces, writeAssembly, writePieceInstructions } from '@/lib/loom/crochet/engine/compositionPattern'

interface Props {
  signedIn: boolean
  onSaved: (newId: string) => void
  onCancel: () => void
  header?: ReactNode
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

type Built =
  | { kind: 'piece'; program: CrochetProgram }
  | { kind: 'amigurumi'; program: CompositionProgram }

const OPENER: Message = {
  role: 'assistant',
  content:
    'Tell me what you want to make. A panel of colourwork, a flat circle, a stuffed ball, or a little creature with a body, a head and limbs. Say roughly how big and what colours you have.',
}

export function CrochetIdeaBuilderPanel({ signedIn, onSaved, onCancel, header }: Props) {
  const [available, setAvailable] = useState<boolean | null>(null)
  const [messages, setMessages] = useState<Message[]>([OPENER])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const [building, setBuilding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [built, setBuilt] = useState<Built | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [problems, setProblems] = useState<string[]>([])
  const scroller = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/studio/crochet/idea')
      .then((r) => r.json())
      .then((b) => {
        if (!cancelled) setAvailable(Boolean(b.available))
      })
      .catch(() => {
        if (!cancelled) setAvailable(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  const send = async () => {
    const text = draft.trim()
    if (!text || thinking) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setDraft('')
    setThinking(true)
    setError(null)
    try {
      const res = await fetch('/api/studio/crochet/idea', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'chat', messages: next.filter((m) => m !== OPENER) }),
      })
      const body = await res.json().catch(() => ({ error: 'Something went wrong.' }))
      if (!res.ok) throw new Error(body.error ?? 'Something went wrong.')
      setMessages([...next, { role: 'assistant', content: String(body.reply) }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setThinking(false)
    }
  }

  const build = async () => {
    setBuilding(true)
    setError(null)
    setProblems([])
    try {
      const res = await fetch('/api/studio/crochet/idea', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'build', messages: messages.filter((m) => m !== OPENER) }),
      })
      const body = await res.json().catch(() => ({ error: 'Something went wrong.' }))
      if (!res.ok) {
        if (Array.isArray(body.problems)) setProblems(body.problems)
        throw new Error(body.error ?? 'That could not be built into a pattern.')
      }
      const next = { kind: body.kind, program: body.program } as Built
      setBuilt(next)
      setName(String(next.program.name ?? 'Untitled pattern'))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That could not be built into a pattern.')
    } finally {
      setBuilding(false)
    }
  }

  const save = async () => {
    if (!built) return
    setSaving(true)
    setError(null)
    setProblems([])
    try {
      const res = await fetch('/api/studio/crochet/patterns', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: built.kind === 'amigurumi' ? 'amigurumi' : 'piece',
          name: name || 'Untitled pattern',
          origin: 'idea',
          program: { ...built.program, name: name || built.program.name },
        }),
      })
      const body = await res.json().catch(() => ({ error: 'Could not save.' }))
      if (!res.ok) {
        if (Array.isArray(body.problems)) setProblems(body.problems)
        throw new Error(body.error ?? 'Could not save.')
      }
      onSaved(body.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  if (available === false) {
    return (
      <section className="studio-p2c">
        <div className="studio-p2c-preview">
          <div className="studio-p2c-preview-canvas">
            <div className="crochet-idea-unavailable">
              <h2>Not available right now</h2>
              <p>
                Designing from a description needs a service that is not switched on here. The amigurumi
                designer and photo to tapestry both work as normal.
              </p>
              <button type="button" className="studio-button ghost" onClick={onCancel}>
                Back to the Studio
              </button>
            </div>
          </div>
        </div>
        <div className="studio-p2c-controls">{header}</div>
      </section>
    )
  }

  return (
    <section className="studio-p2c">
      <div className="studio-p2c-preview crochet-idea-preview">
        {built ? (
          <BuiltPreview built={built} />
        ) : (
          <div className="crochet-idea-empty">
            <p>What you settle on together shows up here as a pattern you can read.</p>
          </div>
        )}
        {building && (
          <div className="studio-p2c-thinking" role="status" aria-live="polite">
            <Loader2 size={28} strokeWidth={1.6} className="studio-p2c-thinking-spin" />
            <p>Writing the pattern</p>
            <p className="studio-p2c-thinking-sub">Every stitch is built and checked before you see it.</p>
          </div>
        )}
        {saving && (
          <div className="studio-p2c-thinking" role="status" aria-live="polite">
            <Loader2 size={28} strokeWidth={1.6} className="studio-p2c-thinking-spin" />
            <p>Saving your pattern</p>
          </div>
        )}
      </div>

      <div className="studio-p2c-controls crochet-idea-controls">
        {header}

        {!signedIn && (
          <div className="studio-dialog-notice">You will be asked to sign in before your pattern is saved.</div>
        )}

        <div className="crochet-idea-thread" ref={scroller}>
          {messages.map((m, i) => (
            <div key={i} className={`crochet-idea-message is-${m.role}`}>
              {m.content}
            </div>
          ))}
          {thinking && <div className="crochet-idea-message is-assistant is-thinking">Thinking</div>}
        </div>

        <div className="crochet-idea-composer">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
            rows={3}
            placeholder="A little grey bunny, about 8 cm, with a cream muzzle"
            aria-label="Tell the builder what you want to make"
          />
          <button
            type="button"
            className="studio-icon-button"
            onClick={send}
            disabled={thinking || !draft.trim()}
            aria-label="Send"
          >
            <SendHorizontal size={18} strokeWidth={1.6} />
          </button>
        </div>

        {built && (
          <div className="studio-dialog-field">
            <label htmlFor="idea-name">Pattern name</label>
            <input id="idea-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}

        <div className="studio-dialog-actions">
          <button type="button" className="studio-button ghost" onClick={onCancel}>
            Cancel
          </button>
          {built ? (
            <>
              <button type="button" className="studio-button ghost" onClick={build} disabled={building}>
                Try again
              </button>
              <button type="button" className="studio-button primary" onClick={save} disabled={saving}>
                {saving ? 'Saving' : 'Save to my patterns'}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="studio-button primary"
              onClick={build}
              disabled={building || thinking || messages.length < 2}
            >
              {building ? 'Building' : 'That sounds right, build it'}
            </button>
          )}
        </div>

        {error && <div className="studio-dialog-error">{error}</div>}
        {problems.length > 0 && (
          <ul className="crochet-studio-problems">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function BuiltPreview({ built }: { built: Built }) {
  if (built.kind === 'amigurumi') {
    const pieces = compositionPieces(built.program)
    return (
      <div className="crochet-designer-words">
        <h2>{built.program.name}</h2>
        {pieces.map((piece) => (
          <div key={piece.section} className="crochet-designer-piece">
            <h3>
              {piece.label}
              {piece.makeQuantity > 1 ? ` (make ${piece.makeQuantity})` : ''}
            </h3>
            <ol>
              {writePieceInstructions(piece).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ol>
          </div>
        ))}
        <div className="crochet-designer-piece">
          <h3>Putting it together</h3>
          <ol>
            {writeAssembly(built.program).map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ol>
        </div>
      </div>
    )
  }
  return (
    <div className="crochet-designer-words">
      <h2>{built.program.name}</h2>
      <div className="crochet-designer-piece">
        <ol>
          {writeInstructions(built.program).map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}
