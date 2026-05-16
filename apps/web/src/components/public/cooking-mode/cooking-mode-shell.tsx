'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { TutorialContent } from '../tutorial-content/tutorial-content'
import type {
  GlossaryRef,
  SubTutorialRef,
  TipTapNode,
} from '../tutorial-content/types'
import { extractCookingSteps } from './extract-steps'
import { useKeepAwake } from './use-keep-awake'
import './cooking-mode.css'

interface CookingModeContextValue {
  enabled: boolean
  setEnabled: (v: boolean, opts?: { capture?: boolean }) => void
}

const Ctx = createContext<CookingModeContextValue | null>(null)

export function useCookingMode(): CookingModeContextValue {
  const v = useContext(Ctx)
  if (!v) {
    return {
      enabled: false,
      setEnabled: () => undefined,
    }
  }
  return v
}

interface Props {
  tutorialSlug: string
  tutorialTitle: string
  body: TipTapNode | null
  glossary: GlossaryRef[]
  subTutorials: SubTutorialRef[]
  beginnerMode: boolean
  autoEnableByDefault: boolean
  children: ReactNode
}

/**
 * Wraps the existing tutorial page render. When cooking mode is off (the
 * default), the wrapper is invisible — it only owns the React context and the
 * portal-style overlay container. When on, an overlay renders covering the
 * normal page with a stripped-down, step-paginated reader.
 *
 * Persistence: state is stored in localStorage keyed by tutorial slug, plus
 * the current step number so a partial recipe resumes where the cook left
 * off.
 */
export function CookingModeShell(props: Props) {
  const {
    tutorialSlug,
    tutorialTitle,
    body,
    glossary,
    subTutorials,
    beginnerMode,
    autoEnableByDefault,
    children,
  } = props

  const storageKey = `homemade:cookingMode:${tutorialSlug}`
  const [enabled, setEnabledState] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on first mount. Defer the state writes to the
  // next microtask so React 19's effect-setState lint doesn't fire (the
  // initial paint can use the default unhydrated values; values pop in on
  // the next frame).
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      let initialEnabled = false
      let initialStep = 0
      try {
        const raw = window.localStorage.getItem(storageKey)
        if (raw) {
          const parsed = JSON.parse(raw) as {
            enabled?: boolean
            stepIndex?: number
          }
          if (typeof parsed.enabled === 'boolean') initialEnabled = parsed.enabled
          if (typeof parsed.stepIndex === 'number') initialStep = parsed.stepIndex
        } else if (autoEnableByDefault && isMobileViewport()) {
          initialEnabled = true
        }
      } catch {
        /* localStorage blocked — defaults are fine */
      }
      setEnabledState(initialEnabled)
      setStepIndex(initialStep)
      setHydrated(true)
    })
    return () => window.cancelAnimationFrame(id)
  }, [storageKey, autoEnableByDefault])

  // Reflect cooking-mode state on <body> so other components (mobile tab bar,
  // sticky TOC, etc.) can hide themselves with a CSS attribute selector.
  useEffect(() => {
    if (!hydrated) return
    document.body.dataset.cookingMode = enabled ? '1' : '0'
    return () => {
      document.body.dataset.cookingMode = '0'
    }
  }, [enabled, hydrated])

  // Persist on change.
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ enabled, stepIndex }),
      )
    } catch {
      /* ignore */
    }
  }, [enabled, stepIndex, hydrated, storageKey])

  const setEnabled = useCallback((v: boolean) => {
    setEnabledState(v)
    if (!v) setStepIndex(0)
  }, [])

  const ctxValue = useMemo<CookingModeContextValue>(
    () => ({ enabled, setEnabled }),
    [enabled, setEnabled],
  )

  return (
    <Ctx.Provider value={ctxValue}>
      {children}
      {enabled && hydrated && (
        <CookingModeReader
          tutorialTitle={tutorialTitle}
          body={body}
          glossary={glossary}
          subTutorials={subTutorials}
          beginnerMode={beginnerMode}
          stepIndex={stepIndex}
          setStepIndex={setStepIndex}
          onExit={() => setEnabled(false)}
        />
      )}
    </Ctx.Provider>
  )
}

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 768px)').matches
}

interface ReaderProps {
  tutorialTitle: string
  body: TipTapNode | null
  glossary: GlossaryRef[]
  subTutorials: SubTutorialRef[]
  beginnerMode: boolean
  stepIndex: number
  setStepIndex: (v: number) => void
  onExit: () => void
}

function CookingModeReader(props: ReaderProps) {
  const {
    tutorialTitle,
    body,
    glossary,
    subTutorials,
    beginnerMode,
    stepIndex,
    setStepIndex,
    onExit,
  } = props

  useKeepAwake(true)

  // Pause scroll on the underlying page while cooking mode is open.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const { intro, ingredients, steps } = useMemo(
    () => extractCookingSteps(body),
    [body],
  )

  // Build a "pages" array: optional intro, then each method step.
  const pages = useMemo(() => {
    const list: { title: string; nodes: TipTapNode[] }[] = []
    if (intro.length > 0) list.push({ title: 'Overview', nodes: intro })
    list.push(...steps)
    if (list.length === 0) {
      // Fall back to the whole body as one page so nothing breaks for
      // tutorials that don't have h2-segmented method sections.
      list.push({ title: tutorialTitle, nodes: body?.content ?? [] })
    }
    return list
  }, [intro, steps, body, tutorialTitle])

  const clampedIndex = Math.min(Math.max(0, stepIndex), pages.length - 1)
  const totalPages = pages.length
  const isFirst = clampedIndex === 0
  const isLast = clampedIndex === totalPages - 1
  const currentPage = useMemo(
    () => pages[clampedIndex] ?? { title: tutorialTitle, nodes: [] },
    [pages, clampedIndex, tutorialTitle],
  )

  // Keyboard navigation: left/right arrows page through.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && !isLast) {
        setStepIndex(clampedIndex + 1)
        e.preventDefault()
      } else if (e.key === 'ArrowLeft' && !isFirst) {
        setStepIndex(clampedIndex - 1)
        e.preventDefault()
      } else if (e.key === 'Escape') {
        onExit()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [clampedIndex, isFirst, isLast, setStepIndex, onExit])

  const pageBodyNode: TipTapNode = useMemo(
    () => ({ type: 'doc', content: currentPage.nodes }),
    [currentPage],
  )
  const ingredientsNode: TipTapNode | null = useMemo(
    () =>
      ingredients
        ? { type: 'doc', content: ingredients }
        : null,
    [ingredients],
  )

  return (
    <div className="cooking-mode-overlay" role="dialog" aria-label="Cooking mode" aria-modal="true">
      <header className="cooking-mode-header">
        <button
          type="button"
          className="cooking-mode-exit"
          onClick={onExit}
          aria-label="Exit cooking mode"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <span>Exit</span>
        </button>
        <span className="cooking-mode-title" title={tutorialTitle}>
          {tutorialTitle}
        </span>
        <span className="cooking-mode-progress" aria-live="polite">
          {clampedIndex + 1} of {totalPages}
        </span>
      </header>

      <div className="cooking-mode-body">
        {ingredientsNode && (
          <details className="cooking-mode-ingredients" open>
            <summary>Ingredients</summary>
            <div className="cooking-mode-ingredients-content">
              <TutorialContent
                content={ingredientsNode}
                glossary={glossary}
                subTutorials={subTutorials}
                beginnerMode={beginnerMode}
                recipeContext={null}
              />
            </div>
          </details>
        )}

        <section className="cooking-mode-page" aria-label={currentPage.title}>
          <h2 className="cooking-mode-step-heading">{currentPage.title}</h2>
          <div className="cooking-mode-step-content">
            <TutorialContent
              content={pageBodyNode}
              glossary={glossary}
              subTutorials={subTutorials}
              beginnerMode={beginnerMode}
              recipeContext={null}
            />
          </div>
        </section>
      </div>

      <nav className="cooking-mode-toolbar" aria-label="Step controls">
        <button
          type="button"
          className="cooking-mode-toolbar-button"
          onClick={() => setStepIndex(clampedIndex - 1)}
          disabled={isFirst}
          aria-label="Previous step"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 5 8 12l7 7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <span className="cooking-mode-toolbar-indicator">
          Step {clampedIndex + 1} of {totalPages}
        </span>
        {isLast ? (
          <button
            type="button"
            className="cooking-mode-toolbar-done"
            onClick={onExit}
          >
            Done
          </button>
        ) : (
          <button
            type="button"
            className="cooking-mode-toolbar-button"
            onClick={() => setStepIndex(clampedIndex + 1)}
            aria-label="Next step"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </nav>
    </div>
  )
}
