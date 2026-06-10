import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SchematicRenderer } from '@/components/knitting/SchematicRenderer'

import '@/components/studio/knitting/knitting-studio.css'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Knitting schematics — dev showcase',
  robots: { index: false, follow: false },
}

/**
 * /dev/knitting-schematics — dev-only showcase of every parametric
 * schematic template. Hidden in production via notFound() so the route
 * never serves traffic from homemade.education.
 *
 * Used for visual sanity checks during K-4.3 development and to give
 * Rebecca a single-page render of every shape when reviewing.
 */
export default function KnittingSchematicsShowcasePage() {
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return (
    <main
      style={{
        maxWidth: 980,
        margin: '0 auto',
        padding: '2.5rem 1.5rem 6rem',
        fontFamily: 'var(--studio-font-body, Lora, Georgia, serif)',
        color: 'var(--studio-ink, #3d2f22)',
      }}
    >
      <header style={{ marginBottom: '2.5rem' }}>
        <p
          style={{
            fontFamily: 'var(--studio-font-mono, monospace)',
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: 'var(--studio-ink-mute, #8a8276)',
            margin: 0,
          }}
        >
          Dev showcase — K-4.3
        </p>
        <h1
          style={{
            fontFamily: 'var(--studio-font-display, Fraunces, serif)',
            fontSize: '2.2rem',
            margin: '0.4rem 0 0.6rem',
          }}
        >
          Parametric knitting schematics
        </h1>
        <p style={{ margin: 0, color: 'var(--studio-ink-soft, #5c5347)' }}>
          Every project-shape template rendered with example sizes.
          Letter-keyed measurements use the industry convention. Sweater /
          cardigan / vest render as K-5 placeholders.
        </p>
      </header>

      {EXAMPLES.map((ex) => (
        <section
          key={ex.title}
          style={{
            marginBottom: '3rem',
            padding: '1.5rem',
            background: 'var(--studio-bg, #f5f0e8)',
            borderRadius: 14,
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--studio-font-display, Fraunces, serif)',
              fontSize: '1.3rem',
              margin: '0 0 0.4rem',
            }}
          >
            {ex.title}
          </h2>
          <p
            style={{
              margin: '0 0 1rem',
              fontSize: '0.9rem',
              color: 'var(--studio-ink-soft, #5c5347)',
            }}
          >
            {ex.note}
          </p>
          <SchematicRenderer
            pattern={ex.pattern}
            shawlStyle={ex.shawlStyle}
            chosenSize={ex.chosenSize}
          />
        </section>
      ))}
    </main>
  )
}

interface Example {
  title: string
  note: string
  pattern: Parameters<typeof SchematicRenderer>[0]['pattern']
  shawlStyle?: Parameters<typeof SchematicRenderer>[0]['shawlStyle']
  chosenSize?: string
}

const EXAMPLES: Example[] = [
  {
    title: 'Plain scarf (no grading)',
    note: 'Single default size derived from a hard-coded SizeRow.',
    pattern: {
      sizesGraded: [{ name: 'default', bust: 22, length: 180 }],
      needleBySection: null,
      finishedSizeText: '22 × 180 cm',
      projectShape: 'SCARF',
    },
  },
  {
    title: 'Multi-size hat — render M',
    note: 'Three graded sizes (S / M / L), M rendered. Brim depth from waist field, total depth from length.',
    pattern: {
      sizesGraded: [
        { name: 'S', bust: 52, waist: 4, length: 20 },
        { name: 'M', bust: 56, waist: 5, length: 22 },
        { name: 'L', bust: 60, waist: 5, length: 23 },
      ],
      needleBySection: [
        { section: 'ribbing', needleMm: 4.0 },
        { section: 'body', needleMm: 4.5 },
      ],
      finishedSizeText: null,
      projectShape: 'HAT',
    },
    chosenSize: 'M',
  },
  {
    title: 'Multi-size mitt — render L',
    note: 'Three graded sizes, L rendered. Cuff length from sleeveLength, hand length from length.',
    pattern: {
      sizesGraded: [
        { name: 'S', bust: 16, waist: 16, sleeveLength: 5, length: 16 },
        { name: 'M', bust: 18, waist: 18, sleeveLength: 6, length: 18 },
        { name: 'L', bust: 20, waist: 20, sleeveLength: 6, length: 20 },
      ],
      needleBySection: null,
      finishedSizeText: null,
      projectShape: 'MITT_GLOVE',
    },
    chosenSize: 'L',
  },
  {
    title: 'Top-down triangle shawl',
    note: 'Wingspan + centre depth. Bottom-up flips the apex.',
    pattern: {
      sizesGraded: [{ name: 'default', bust: 180, length: 80 }],
      needleBySection: null,
      finishedSizeText: null,
      projectShape: 'SHAWL',
    },
    shawlStyle: 'TRIANGLE_TOP_DOWN',
  },
  {
    title: 'Semicircle shawl',
    note: 'Half-pi approximation as an elliptical arc.',
    pattern: {
      sizesGraded: [{ name: 'default', bust: 180, length: 70 }],
      needleBySection: null,
      finishedSizeText: null,
      projectShape: 'SHAWL',
    },
    shawlStyle: 'SEMICIRCLE',
  },
  {
    title: 'Faroese shawl',
    note: 'Centre-panel triangle stylised with dashed gusset lines.',
    pattern: {
      sizesGraded: [{ name: 'default', bust: 180, length: 90 }],
      needleBySection: null,
      finishedSizeText: null,
      projectShape: 'SHAWL',
    },
    shawlStyle: 'FAROESE',
  },
  {
    title: 'Square shawl',
    note: 'Side length on both axes.',
    pattern: {
      sizesGraded: [{ name: 'default', bust: 110, length: 110 }],
      needleBySection: null,
      finishedSizeText: null,
      projectShape: 'SHAWL',
    },
    shawlStyle: 'SQUARE',
  },
  {
    title: 'Rectangular blanket',
    note: 'Width + length, scaled-down hero of the workhorse shape.',
    pattern: {
      sizesGraded: [{ name: 'default', bust: 100, length: 130 }],
      needleBySection: null,
      finishedSizeText: null,
      projectShape: 'BLANKET',
    },
  },
  {
    title: 'Sweater (K-5 placeholder)',
    note: 'Dashed bounding box with the K-5 message. Cardigan + vest behave identically.',
    pattern: {
      sizesGraded: [{ name: 'M', bust: 96, length: 60 }],
      needleBySection: null,
      finishedSizeText: null,
      projectShape: 'SWEATER',
    },
    chosenSize: 'M',
  },
]
