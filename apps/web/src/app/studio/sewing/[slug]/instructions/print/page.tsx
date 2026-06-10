import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  DEMO_SEWING_PATTERN_SLUG,
  loadDemoSewingPattern,
} from '@/lib/sewing/demo-pattern'
import { loadSewingPatternForStudio } from '@/lib/sewing/load-pattern'
import type { SewingTipTapDoc, SewingTipTapNode } from '@/components/studio/sewing/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Print sewing instructions · homemade',
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ slug: string }>
}

/**
 * /studio/sewing/[slug]/instructions/print - clean print-friendly server
 * render of the instructions body, no pattern pieces. Browser's Save-As
 * PDF or Print is the assumed output path.
 */
export default async function SewingInstructionsPrintPage({ params }: PageProps) {
  const { slug } = await params
  const pattern =
    slug === DEMO_SEWING_PATTERN_SLUG
      ? loadDemoSewingPattern()
      : await loadSewingPatternForStudio({ slug })
  if (!pattern) notFound()

  const parsed = parseBody(pattern.instructionsBody)

  return (
    <div style={instructionsContainerStyle}>
      <article style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 500, margin: 0 }}>
            {pattern.name}
          </h1>
          {pattern.designerName && (
            <p style={{ color: '#5c5347', marginTop: '0.4rem' }}>
              by {pattern.designerName}
            </p>
          )}
          {pattern.description && (
            <p style={{ marginTop: '0.4rem' }}>{pattern.description}</p>
          )}
        </header>

        {parsed.intro.length > 0 && (
          <section style={{ marginBottom: '1.5rem' }}>
            {parsed.intro.map((text, i) => (
              <p key={i} style={{ fontStyle: 'italic', color: '#5c5347' }}>
                {text}
              </p>
            ))}
          </section>
        )}

        <section>
          <h2
            style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 500,
              borderBottom: '1px solid #d4c8b8',
              paddingBottom: '0.4rem',
            }}
          >
            Instructions
          </h2>
          {parsed.steps.map((step, idx) => (
            <div key={idx} style={{ marginBottom: '1.2rem' }}>
              <h3
                style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontWeight: 500,
                  fontSize: '1.05rem',
                  margin: '0 0 0.4rem',
                }}
              >
                {step.heading}
              </h3>
              {step.paragraphs.map((p, j) => (
                <p key={j} style={{ margin: '0 0 0.6rem', lineHeight: 1.55 }}>
                  {p}
                </p>
              ))}
            </div>
          ))}
        </section>

        <footer
          style={{
            marginTop: '3rem',
            paddingTop: '0.8rem',
            borderTop: '1px solid #d4c8b8',
            color: '#5c5347',
            fontSize: '0.85rem',
          }}
        >
          <p>homemade.education · {pattern.slug}</p>
          {pattern.attributionText && <p>{pattern.attributionText}</p>}
        </footer>
      </article>
    </div>
  )
}

const instructionsContainerStyle: React.CSSProperties = {
  background: '#fff',
  color: '#3d2f22',
  fontFamily: '"Lora", Georgia, serif',
  minHeight: '100vh',
}

interface ParsedStep {
  heading: string
  paragraphs: string[]
}

function parseBody(body: SewingTipTapDoc | null): { intro: string[]; steps: ParsedStep[] } {
  if (!body || !Array.isArray(body.content)) return { intro: [], steps: [] }
  const intro: string[] = []
  const steps: ParsedStep[] = []
  let current: ParsedStep | null = null
  for (const node of body.content) {
    if (node.type === 'heading' && (node.attrs?.level === 3 || node.attrs?.level === 2)) {
      if (current) steps.push(current)
      current = { heading: nodeText(node), paragraphs: [] }
    } else if (node.type === 'paragraph') {
      const text = nodeText(node)
      if (!text) continue
      if (current) current.paragraphs.push(text)
      else intro.push(text)
    }
  }
  if (current) steps.push(current)
  return { intro, steps }
}

function nodeText(node: SewingTipTapNode): string {
  if (typeof node.text === 'string') return node.text
  if (!Array.isArray(node.content)) return ''
  return node.content.map((c) => nodeText(c)).join('')
}
