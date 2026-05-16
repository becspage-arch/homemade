import Link from 'next/link'

export const dynamic = 'force-static'

export default function AdminTagsRetiredPage() {
  return (
    <div className="admin-placeholder">
      <h1>Tags have been retired</h1>
      <p>
        Tags were replaced by typed metadata — <strong>mood</strong>,{' '}
        <strong>meal type</strong>, <strong>dietary flags</strong>, and{' '}
        <strong>cuisine</strong> — all editable per tutorial from the content
        editor. The Tag model still exists in the schema for now; a future
        cleanup migration will drop it once production has no remaining
        references.
      </p>
      <p>
        Looking for something specific? Try <Link href="/admin/tutorials">all
        content</Link> with the relevant filter chip applied, or jump to{' '}
        <Link href="/admin/categories">categories</Link>.
      </p>
    </div>
  )
}
