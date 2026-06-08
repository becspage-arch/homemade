'use client'

/**
 * CrochetNotesPanel — free-text project notes. Wired to the parent's
 * autosave loop via onChange. v1 is a single textarea; later additions
 * could include media attachments, yarn substitution notes, gauge
 * swatch links.
 */

interface Props {
  notes: string
  onChange: (value: string) => void
}

export function CrochetNotesPanel({ notes, onChange }: Props) {
  return (
    <div className="crochet-studio-notes">
      <h2 className="crochet-studio-notes-heading">Project notes</h2>
      <p className="crochet-studio-notes-help">
        What you swapped, where you marked a stitch, what the swatch said. Saved automatically.
      </p>
      <textarea
        className="crochet-studio-notes-textarea"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="The cardigan back ran tight at the hip. Dropped to a 3.75 mm hook from Row 60. Used Stylecraft Special DK in Sage instead of the suggested cotton."
        rows={14}
      />
    </div>
  )
}
