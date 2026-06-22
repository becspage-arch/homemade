import type { Metadata } from 'next'
import { headers } from 'next/headers'
import Link from 'next/link'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { countPublishedLibrary, formatLibraryCount } from '@/lib/library-count'
import { PremiumPricing, type Currency } from './PremiumPricing'
import './premium-page.css'

// Live library count + geo currency are per-request.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Homemade Premium',
  description:
    'Everything in the free library, plus downloads, custom-fit patterns, design-your-own, recipe planning and your very own AI assistant.',
  path: '/premium',
})

async function readCurrency(): Promise<Currency> {
  try {
    const h = await headers()
    const cc = (
      h.get('cf-ipcountry') ??
      h.get('x-vercel-ip-country') ??
      ''
    ).toUpperCase()
    return cc === 'GB' ? 'GBP' : 'USD'
  } catch {
    return 'USD'
  }
}

interface Row {
  label: string
  free: boolean
}

interface Group {
  heading: string
  rows: Row[]
}

function buildGroups(libraryCountLabel: string): Group[] {
  return [
    {
      heading: "Here's what you get",
      rows: [
        {
          label: `${libraryCountLabel} patterns, tutorials and recipes`,
          free: true,
        },
        { label: 'Save your progress and sync across devices', free: true },
        { label: 'Bookmark and save', free: true },
        {
          label:
            'Downloadable packs, pieces and instructions to print and make offline',
          free: false,
        },
        {
          label:
            'Your very own AI Assistant to plan, adapt and troubleshoot',
          free: false,
        },
        {
          label: "Members' Make-a-thons and seasonal collections to join",
          free: false,
        },
      ],
    },
    {
      heading: 'Crochet, knitting, cross-stitch, needlework and sewing',
      rows: [
        { label: 'The Studio', free: true },
        {
          label:
            'Resize to your size and body shape, with full-bust and other fit adjustments',
          free: false,
        },
        {
          label: 'Turn a photo into your own pattern, or design from scratch',
          free: false,
        },
        {
          label:
            'Personalised project and materials planners, download and printable',
          free: false,
        },
        {
          label:
            'A whole library of independent designer patterns, new ones added every week',
          free: false,
        },
      ],
    },
    {
      heading: 'Cooking and baking',
      rows: [
        {
          label:
            'Every recipe with automatic measurement conversions and ingredient swaps',
          free: true,
        },
        {
          label:
            'Scale any recipe up or down for smaller meals, meal prepping and batch cooking',
          free: false,
        },
        {
          label: 'Plan a whole week of meals, batch-cooks and leftovers',
          free: false,
        },
        {
          label:
            "Turn your week's recipes into one shopping list, summed and sorted by aisle",
          free: false,
        },
      ],
    },
    {
      heading:
        'Garden, home repair, natural home, herbal, smallholding, sustainability, mindset, paper, wood, pottery and more',
      rows: [
        { label: 'Every guide and tutorial', free: true },
        { label: 'Planners and schedules made for each craft', free: false },
        {
          label:
            'Calculators that customise tutorials to your garden, space and project',
          free: false,
        },
        {
          label:
            'Keep a journal of your garden, flock and projects with reminders for what needs doing and when',
          free: false,
        },
        {
          label:
            "Print your daily steps or whole plan to take into the garden, workshop or wherever you're working",
          free: false,
        },
      ],
    },
  ]
}

function Tick({ on }: { on: boolean }) {
  if (!on) {
    return (
      <span className="premium-cmp-cell is-off" aria-label="Not included">
        <span aria-hidden="true">·</span>
      </span>
    )
  }
  return (
    <span className="premium-cmp-cell is-on" aria-label="Included">
      <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
        <path
          d="M3 8.5 L6.5 12 L13 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export default async function PremiumPage() {
  const [count, currency] = await Promise.all([
    countPublishedLibrary(),
    readCurrency(),
  ])
  const libraryCountLabel = formatLibraryCount(count)
  const groups = buildGroups(libraryCountLabel)

  return (
    <div className="premium-page">
      <header className="premium-hero">
        <p className="premium-hero-eyebrow">Homemade Premium</p>
        <h1 className="premium-hero-title">Make beautiful things, in any craft</h1>
        <p className="premium-hero-lede">
          One membership for every craft on Homemade. Start free and stay free
          for as long as you like. Premium adds the tools that make bigger
          projects easier, from downloads and custom-fit patterns to your own AI
          assistant.
        </p>
      </header>

      <PremiumPricing
        initialCurrency={currency}
        libraryCountLabel={libraryCountLabel}
      />

      <section className="premium-compare" aria-label="What's included">
        {groups.map((group) => (
          <div className="premium-cmp-group" key={group.heading}>
            <div className="premium-cmp-head">
              <h2 className="premium-cmp-heading">{group.heading}</h2>
              <div className="premium-cmp-cols" aria-hidden="true">
                <span>Free</span>
                <span>Premium</span>
              </div>
            </div>
            <ul className="premium-cmp-rows">
              {group.rows.map((row) => (
                <li className="premium-cmp-row" key={row.label}>
                  <span className="premium-cmp-label">{row.label}</span>
                  <Tick on={row.free} />
                  <Tick on={true} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="premium-guarantee" aria-label="Guarantee">
        <h2 className="premium-guarantee-title">
          The Make-Something-You-Love Guarantee
        </h2>
        <p className="premium-guarantee-body">
          If you don&apos;t make something you love within your first 90 days,
          get your money back <strong>and</strong> another 3 months free to try
          again.
        </p>
      </section>

      <section className="premium-faq" aria-label="Questions">
        <h2 className="premium-faq-title">A few questions</h2>

        <div className="premium-faq-item">
          <h3>Can I cancel anytime?</h3>
          <p>
            Yes. Cancel whenever you like from your account settings. You keep
            premium until the end of the period you&apos;ve paid for, and it
            won&apos;t renew after that.
          </p>
        </div>

        <div className="premium-faq-item">
          <h3>What happens to my work if I stop?</h3>
          <p>
            Everything you&apos;ve made and saved stays with you. Your projects,
            notes and saved patterns stay in your free account. You keep all of
            that; you only set aside the premium extras like downloads and
            resizing until you come back.
          </p>
        </div>

        <div className="premium-faq-item">
          <h3>How does the guarantee work?</h3>
          <p>
            If you don&apos;t make something you love in your first 90 days,
            email us and we&apos;ll give you your money back plus another three
            months free to try again. The full details are in the{' '}
            <Link href="/legal/subscription-terms">subscription terms</Link>.
          </p>
        </div>
      </section>

      <p className="premium-footnote">
        Some premium features are still being built. Nothing is for sale here
        yet; this page describes what premium will include.
      </p>
    </div>
  )
}
