'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export type Currency = 'GBP' | 'USD'
type Cycle = 'monthly' | 'annual'

const CURRENCY_KEY = 'homemade-currency'

// Locked pricing (rounded local numbers, not FX conversions). See
// project_business_model. Annual is framed as "2 months free", never a percent.
const PRICES: Record<
  Currency,
  { symbol: string; monthly: number; annual: number; minor: string }
> = {
  GBP: { symbol: '£', monthly: 10.99, annual: 109.99, minor: 'p' },
  USD: { symbol: '$', monthly: 14.99, annual: 149.99, minor: '¢' },
}

function formatPrice(symbol: string, amount: number): string {
  return `${symbol}${amount.toFixed(2)}`
}

/**
 * "Under Xp a day", derived from the monthly price in the shown currency.
 * Annualised across the year and rounded up to the next whole minor unit so the
 * figure is honest. Never hardcoded.
 */
function perDayLabel(currency: Currency): string {
  const c = PRICES[currency]
  const perDayMinor = Math.ceil(((c.monthly * 12) / 365) * 100)
  return `${perDayMinor}${c.minor}`
}

export function PremiumPricing({
  initialCurrency,
  libraryCountLabel,
}: {
  initialCurrency: Currency
  libraryCountLabel: string
}) {
  const [currency, setCurrency] = useState<Currency>(initialCurrency)
  const [cycle, setCycle] = useState<Cycle>('monthly')

  // Remembered choice overrides the geo default once the client hydrates.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CURRENCY_KEY)
      if (saved === 'GBP' || saved === 'USD') setCurrency(saved)
    } catch {
      // localStorage unavailable (private mode) — geo default stands.
    }
  }, [])

  function chooseCurrency(next: Currency) {
    setCurrency(next)
    try {
      window.localStorage.setItem(CURRENCY_KEY, next)
    } catch {
      // Ignore — the choice just won't persist this session.
    }
  }

  const c = PRICES[currency]
  const premiumPrice = cycle === 'monthly' ? c.monthly : c.annual
  const cadence = cycle === 'monthly' ? 'per month' : 'per year'

  return (
    <div className="premium-pricing">
      <div className="premium-controls">
        <div className="premium-cycle" role="group" aria-label="Billing period">
          <button
            type="button"
            className={`premium-cycle-option${cycle === 'monthly' ? ' is-active' : ''}`}
            aria-pressed={cycle === 'monthly'}
            onClick={() => setCycle('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`premium-cycle-option${cycle === 'annual' ? ' is-active' : ''}`}
            aria-pressed={cycle === 'annual'}
            onClick={() => setCycle('annual')}
          >
            Annual
            <span className="premium-cycle-flag">2 months free</span>
          </button>
        </div>

        <div className="premium-currency" role="group" aria-label="Currency">
          <button
            type="button"
            className={`premium-currency-option${currency === 'GBP' ? ' is-active' : ''}`}
            aria-pressed={currency === 'GBP'}
            onClick={() => chooseCurrency('GBP')}
          >
            £ GBP
          </button>
          <button
            type="button"
            className={`premium-currency-option${currency === 'USD' ? ' is-active' : ''}`}
            aria-pressed={currency === 'USD'}
            onClick={() => chooseCurrency('USD')}
          >
            $ USD
          </button>
        </div>
      </div>

      <div className="premium-cards">
        <article className="premium-plan">
          <h2 className="premium-plan-name">Free</h2>
          <p className="premium-plan-price">
            <span className="premium-plan-amount">{c.symbol}0</span>
          </p>
          <p className="premium-plan-cadence">Free, forever</p>
          <ul className="premium-plan-list">
            <li>
              {libraryCountLabel} patterns, tutorials and recipes across every
              craft
            </li>
            <li>
              The Studio: work through any pattern on screen, with instructions,
              a live chart, row counter and custom notes
            </li>
            <li>Save your progress and pick up on any device</li>
            <li>Bookmark and save tutorials and patterns</li>
          </ul>
          <Link href="/sign-in" className="premium-plan-cta is-secondary">
            Start free
          </Link>
        </article>

        <article className="premium-plan is-premium">
          <span className="premium-plan-flag">Most loved</span>
          <h2 className="premium-plan-name">Premium</h2>
          <p className="premium-plan-price">
            <span className="premium-plan-amount">
              {formatPrice(c.symbol, premiumPrice)}
            </span>
            <span className="premium-plan-cadence-inline">{cadence}</span>
          </p>
          <p className="premium-plan-perday">
            That&apos;s under {perDayLabel(currency)} a day
          </p>
          <p className="premium-plan-renews">
            Renews automatically. Cancel anytime in your account.
          </p>
          <p className="premium-plan-everything">Everything in Free, plus</p>
          <ul className="premium-plan-list">
            <li>
              Downloadable tutorial packs, pattern pieces and instructions so
              you can print and make anything offline
            </li>
            <li>Resize any pattern to your size and body shape</li>
            <li>Design your own, from a photo or from scratch</li>
            <li>A whole library of independent designer patterns</li>
            <li>Scale recipes, plan meals and build shopping lists</li>
            <li>
              Your very own AI Assistant to plan, adapt and troubleshoot as you
              make
            </li>
          </ul>
          <span
            className="premium-plan-cta is-disabled"
            aria-disabled="true"
            role="button"
          >
            Available soon
          </span>
        </article>
      </div>
    </div>
  )
}
