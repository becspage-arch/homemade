/**
 * Per-category CTA verb for hero buttons. Cooking and baking get
 * domain verbs ("Start cooking →" / "Start baking →"); everything
 * else falls to the generic "Start now →". Brand rule: button text
 * names the user benefit, not the feature.
 *
 * Sentence case in source; CSS uppercases at render time on the
 * homepage / category hero. The tutorial hero renders the text
 * as-is so we get "Start baking →" rather than "START BAKING →".
 */
export function heroCtaLabel(categorySlug: string): string {
  switch (categorySlug) {
    case 'cooking':
      return 'Start cooking →'
    case 'baking':
      return 'Start baking →'
    default:
      return 'Start now →'
  }
}
