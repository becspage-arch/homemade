import './stash-grid.css'

interface StashGridProps {
  children: React.ReactNode
}

export function StashGrid({ children }: StashGridProps) {
  return <ul className="stash-grid">{children}</ul>
}

interface StashCardProps {
  children: React.ReactNode
  className?: string
}

export function StashCard({ children, className }: StashCardProps) {
  return <li className={`stash-card${className ? ` ${className}` : ''}`}>{children}</li>
}
