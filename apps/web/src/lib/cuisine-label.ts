/** Display labels for cuisine slugs (food category filters). */
const CUISINE_LABELS: Record<string, string> = {
  british: 'British', american: 'American', italian: 'Italian', french: 'French',
  indian: 'Indian', chinese: 'Chinese', thai: 'Thai', japanese: 'Japanese',
  mexican: 'Mexican', spanish: 'Spanish', greek: 'Greek', 'middle-eastern': 'Middle Eastern',
  caribbean: 'Caribbean', korean: 'Korean', vietnamese: 'Vietnamese', turkish: 'Turkish',
  moroccan: 'Moroccan', 'eastern-european': 'Eastern European', german: 'German',
  mediterranean: 'Mediterranean', persian: 'Persian', lebanese: 'Lebanese',
  'west-african': 'West African', 'north-african': 'North African', nigerian: 'Nigerian',
  ethiopian: 'Ethiopian', 'anglo-indian': 'Anglo-Indian', 'italian-american': 'Italian-American',
  polish: 'Polish', hungarian: 'Hungarian', portuguese: 'Portuguese', irish: 'Irish',
  scandinavian: 'Scandinavian', swedish: 'Swedish', danish: 'Danish', filipino: 'Filipino',
  malaysian: 'Malaysian', indonesian: 'Indonesian', peruvian: 'Peruvian', brazilian: 'Brazilian',
  argentinian: 'Argentinian', 'latin-american': 'Latin American', egyptian: 'Egyptian',
  jewish: 'Jewish', austrian: 'Austrian', russian: 'Russian', dutch: 'Dutch',
  australian: 'Australian', cuban: 'Cuban', jamaican: 'Jamaican', tunisian: 'Tunisian',
}

export function cuisineLabel(slug: string): string {
  return (
    CUISINE_LABELS[slug] ??
    slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  )
}
