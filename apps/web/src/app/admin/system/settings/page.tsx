export default function AdminSystemSettingsPage() {
  return (
    <div className="admin-placeholder">
      <h1>Site settings</h1>
      <p>
        Site-wide configuration UI lands when there’s something worth flipping
        from the admin. Currently nothing to set — every site-level value lives
        in the codebase, in AWS Secrets Manager, or in the legal-entity config
        at <code>apps/web/src/lib/legal-entity.ts</code>.
      </p>
    </div>
  )
}
