import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { countPublishedLibrary, formatLibraryCount } from '@/lib/library-count'
import { checkoutEnabled } from '@/lib/stripe/config'
import { isFeatureLive, type PremiumFeatureKey } from '@/lib/premium/feature-availability'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { captureServerEvent } from '@/lib/posthog'
import { PremiumPricing, type Currency } from './PremiumPricing'
import './premium-page.css'

// Live library count + geo currency are per-request.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = buildPublicMetadata({
  title: 'Homemade Premium',
  description:
    'Everything in the free library, plus downloads and printing, recipe scaling, meal plans and shopping lists, and turning a photo into a cross-stitch pattern.',
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
  /** Premium rows carry a feature key; only shown when that feature is live. */
  feature?: PremiumFeatureKey
}

interface Group {
  heading: string
  rows: Row[]
}

/**
 * The full comparison table, with each premium row tagged by feature. Free rows
 * (already live) always show; premium rows show only when their feature is
 * live (see feature-availability.ts). Groups that end up with no rows are
 * dropped, and the page only names the categories that are actually public.
 */
function buildGroups(libraryCountLabel: string): Group[] {
  const all: Group[] = [
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
          feature: 'downloads',
        },
        {
          label: 'Your very own AI Assistant to plan, adapt and troubleshoot',
          free: false,
          feature: 'aiAssistant',
        },
        {
          label: "Members' Make-a-thons and seasonal collections to join",
          free: false,
          feature: 'makeAThons',
        },
      ],
    },
    {
      heading: 'Cross-stitch',
      rows: [
        {
          label:
            'The Studio: open any pattern on screen, zoom the chart and mark off each stitch as you go',
          free: true,
        },
        {
          label:
            'Resize to your size and body shape, with full-bust and other fit adjustments',
          free: false,
          feature: 'grading',
        },
        {
          label: 'Turn a photo into your own cross-stitch pattern',
          free: false,
          feature: 'photoToChart',
        },
        {
          label:
            'Design a pattern from scratch',
          free: false,
          feature: 'designAPattern',
        },
        {
          label:
            'Personalised project and materials planners, download and printable',
          free: false,
          feature: 'projectPlanner',
        },
        {
          label:
            'A whole library of independent designer patterns, new ones added every week',
          free: false,
          feature: 'designerLibrary',
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
          feature: 'recipeScaling',
        },
        {
          label: 'Plan a whole week of meals, batch-cooks and leftovers',
          free: false,
          feature: 'mealPlanner',
        },
        {
          label:
            "Turn your week's recipes into one shopping list, summed and sorted by aisle",
          free: false,
          feature: 'shoppingList',
        },
      ],
    },
  ]

  return all
    .map((group) => ({
      ...group,
      rows: group.rows.filter(
        (row) => row.free || (row.feature && isFeatureLive(row.feature)),
      ),
    }))
    .filter((group) => group.rows.length > 0)
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

export default async function PremiumPage({
  searchParams,
}: {
  searchParams?: Promise<{ embed?: string }>
}) {
  const embed = (await searchParams)?.embed === '1'
  const [count, currency, user] = await Promise.all([
    countPublishedLibrary(),
    readCurrency(),
    getCurrentDbUser(),
  ])
  const libraryCountLabel = formatLibraryCount(count)
  const groups = buildGroups(libraryCountLabel)

  // Top of the revenue funnel — server-rendered so it always fires.
  void captureServerEvent({
    event: 'premium_page_viewed',
    distinctId: user?.clerkId ?? 'anonymous',
    properties: { currency, isPremium: Boolean(user?.premiumActive), signedIn: Boolean(user) },
  })

  return (
    <div className="premium-page">
      {embed && (
        // Rendered inside the in-page premium overlay (an iframe of this same
        // page) — hide the site chrome so only the premium content shows.
        <style dangerouslySetInnerHTML={{ __html: '.site-header,.site-footer,.cookie-banner,.mobile-tab-bar,.offline-banner{display:none!important}.public-main{padding-top:0!important}' }} />
      )}
      <header className="premium-hero">
        <p className="premium-hero-eyebrow">Homemade Premium</p>
        <h1 className="premium-hero-title">The home of all things homemade</h1>
      </header>

      <PremiumPricing
        initialCurrency={currency}
        libraryCountLabel={libraryCountLabel}
        checkoutEnabled={checkoutEnabled()}
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
            months free to try again.
          </p>
        </div>
      </section>

      {!checkoutEnabled() && (
        <p className="premium-footnote">
          Some premium features are still being built. Nothing is for sale here
          yet; this page describes what premium will include.
        </p>
      )}
    </div>
  )
}
