interface WordmarkProps {
  size?: 'small' | 'large'
}

export function Wordmark({ size = 'large' }: WordmarkProps) {
  // Mobile-first sizing: the wordmark with 0.18em tracking and 8 glyphs
  // overflows an iPhone viewport at text-7xl (72px) — visible cut-off
  // observed on iPhone Safari at the /coming-soon splash. Start at
  // text-4xl (36px) on phone, scale up at sm/md/lg breakpoints.
  const sizeClass =
    size === 'large'
      ? 'text-4xl sm:text-5xl md:text-7xl lg:text-8xl'
      : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'

  return (
    <h1
      className={`${sizeClass} text-[var(--color-sage)] lowercase`}
      style={{
        fontFamily: 'var(--font-fraunces)',
        letterSpacing: '0.18em',
        fontWeight: 300,
      }}
    >
      homemade
    </h1>
  )
}
