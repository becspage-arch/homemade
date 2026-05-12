/**
 * ISO week cohort label.
 *
 * Set on `User.signupCohortWeek` at first signup and surfaced as a person
 * property on every PostHog event. Used as the slicing dimension for the
 * D1 / D7 / D30 retention curves Berkowski hangs his retention-cohort
 * thesis on.
 *
 * Format: `YYYY-Www` (e.g. `2026-W19`). Matches the format PostHog cohort
 * insights accept directly.
 */
export function isoWeek(date: Date = new Date()): string {
  // ISO 8601: weeks start Monday, week 1 contains the first Thursday.
  const d = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}
