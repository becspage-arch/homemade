interface WordmarkProps {
  size?: 'small' | 'large'
}

export function Wordmark({ size = 'large' }: WordmarkProps) {
  const sizeClass = size === 'large' ? 'text-7xl md:text-8xl' : 'text-4xl md:text-5xl'

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
