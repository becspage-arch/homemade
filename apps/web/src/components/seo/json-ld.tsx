/**
 * Renders a JSON-LD block as a `<script type="application/ld+json">` tag.
 * Accepts either a single object or an array — multiple graphs on one page
 * (e.g. Recipe + BreadcrumbList + ItemList) are valid and recommended for
 * rich-result eligibility.
 *
 * Render server-side only; clients don't need to parse this.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const payload = JSON.stringify(data)
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: payload }}
    />
  )
}
