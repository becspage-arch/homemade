import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma, Visibility } from '@homemade/db'
import { buildPublicMetadata } from '@/lib/seo/metadata-helpers'
import { buildBreadcrumbSchema } from '@/lib/seo/schema-builders'
import { JsonLd } from '@/components/seo/json-ld'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { mediaUrl } from '@/lib/media'
import { fromStoredVectorData, storedDocument } from '@/lib/needlework/pattern'
import { buildPatternDocument } from '@/lib/needlework/engine/document'
import { DISCIPLINE_LABELS } from '@/components/studio/needlework/types'
import { PatternUnlockCta } from '@/components/public/pattern-access/PatternUnlockCta'
import './needlework-pattern-detail.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

/** Public + Unlisted are viewable; only Public is indexed. */
function isViewable(v: Visibility): boolean {
  return v === Visibility.PUBLIC || v === Visibility.UNLISTED
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const row = await prisma.needleworkPattern.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      ownerUserId: true,
      visibility: true,
      hero: { select: { cloudflareId: true, r2Key: true } },
    },
  })
  if (!row || row.ownerUserId !== null || !isViewable(row.visibility)) {
    return { robots: { index: false, follow: false } }
  }
  return buildPublicMetadata({
    title: `${row.name} · embroidery pattern · homemade`,
    description: row.description ?? `A surface-embroidery pattern on homemade.education.`,
    path: `/needlework/patterns/${slug}`,
    ogType: 'article',
    imageUrl: mediaUrl(row.hero, 'hero') ?? undefined,
    imageAlt: row.name,
    // Only PUBLIC patterns are indexed; UNLISTED (e.g. internal fixtures) are
    // reachable by link but held out of search.
    index: row.visibility === Visibility.PUBLIC,
  })
}

function prettify(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase()
}

export default async function NeedleworkPatternDetailPage({ params }: PageProps) {
  const { slug } = await params
  const row = await prisma.needleworkPattern.findUnique({
    where: { slug },
    include: {
      designer: { select: { displayName: true, slug: true, bio: true } },
      subCategory: { select: { slug: true, name: true } },
      hero: { select: { cloudflareId: true, r2Key: true, alt: true } },
      thumbnail: { select: { cloudflareId: true, r2Key: true } },
      license: true,
    },
  })
  if (!row || row.ownerUserId !== null || !isViewable(row.visibility)) notFound()

  // Canonical pattern data (the loom contract) out of the vectorData column.
  const canonical = fromStoredVectorData(row.vectorData)
  if (!canonical) notFound()

  // The printable document: stored if the seed persisted it, else derived now
  // from the same elements (deterministic — can never drift from the hero).
  const doc =
    storedDocument(row.vectorData) ??
    buildPatternDocument(canonical.stitchedElements, canonical.finishedSizeMm, {
      title: row.name,
      outline: canonical.outline,
    })

  // Social proof: how many makers have started this pattern (a progress row is
  // created when someone opens it in the Studio). Hidden until it's meaningful.
  const makerCount = await prisma.needleworkProjectProgress.count({
    where: { needleworkPatternId: row.id },
  })

  const heroUrl = mediaUrl(row.hero, 'hero')
  // Extra finished-piece photos beyond the hero → a gallery. Empty until a
  // pattern carries multiple Media (wiring galleryMediaIds→Media is a follow-up).
  const galleryUrls: string[] = []
  const finishedW = canonical.finishedSizeMm.width
  const finishedH = canonical.finishedSizeMm.height
  const disciplineLabel =
    (DISCIPLINE_LABELS as Record<string, string>)[row.discipline] ?? prettify(row.discipline)

  const user = await getCurrentDbUser()
  const unlocked = Boolean(user)
  const returnTo = `/needlework/patterns/${slug}`
  const studioHref = `/studio/needlework?needleworkPatternId=${row.id}`
  const printHref = `/needlework/patterns/${slug}/print`

  // Materials = the thread brands/weights this design calls for + the fabric.
  const materials: string[] = [
    ...(row.threadTypes ?? []),
    ...(canonical.fabricSpec?.material ? [canonical.fabricSpec.material] : []),
  ]

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Needlework', href: '/needlework' },
    { name: 'Patterns', href: '/needlework/patterns' },
    { name: row.name, href: returnTo },
  ])
  // SEO shop-window schema — the indexable surface (no working step-by-step here,
  // those are behind the free login). Floss + stitch names + size stay public.
  const patternSchema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: row.name,
    genre: `${disciplineLabel} pattern`,
    url: returnTo,
    ...(heroUrl ? { image: heroUrl } : {}),
    ...(row.description ? { description: row.description } : {}),
    ...(row.designer ? { author: { '@type': 'Person', name: row.designer.displayName } } : {}),
    material: materials,
    keywords: [disciplineLabel, 'embroidery pattern', ...doc.stitchKey.map((s) => s.name)].join(', '),
  }

  return (
    <article className="nw-detail">
      <JsonLd data={[patternSchema, breadcrumbSchema]} />
      <nav className="nw-detail-breadcrumb">
        <Link href="/needlework">Needlework</Link>
        <span>·</span>
        <Link href="/needlework/patterns">Patterns</Link>
        {row.subCategory && (
          <>
            <span>·</span>
            <Link href={`/needlework/patterns?sub=${row.subCategory.slug}`}>{row.subCategory.name}</Link>
          </>
        )}
      </nav>

      <header className="nw-detail-hero">
        <div className="nw-detail-hero-image">
          {heroUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroUrl} alt={row.hero?.alt ?? row.name} loading="eager" />
          ) : (
            <div
              className="nw-detail-hero-svg"
              // The line-art transfer template stands in until a hero is rendered.
              dangerouslySetInnerHTML={{ __html: doc.technicalChartSvg }}
            />
          )}
        </div>
        <div className="nw-detail-hero-body">
          <p className="nw-detail-overline">{disciplineLabel} pattern</p>
          <h1 className="nw-detail-title">{row.name}</h1>
          {row.designer && <p className="nw-detail-designer">by {row.designer.displayName}</p>}

          <dl className="nw-detail-spec">
            <div><dt>Finished size</dt><dd>{finishedW.toFixed(0)} × {finishedH.toFixed(0)} mm</dd></div>
            <div><dt>Colours</dt><dd>{doc.flossKey.length}</dd></div>
            <div><dt>Stitches used</dt><dd>{doc.stitchKey.length}</dd></div>
            {row.difficulty && <div><dt>Difficulty</dt><dd>{prettify(row.difficulty)}</dd></div>}
            {row.estimatedHours && <div><dt>Time</dt><dd>~{row.estimatedHours}h</dd></div>}
            {row.frameType && <div><dt>Frame</dt><dd>{prettify(row.frameType.replace(/_/g, ' '))}</dd></div>}
          </dl>

          {row.description && <p className="nw-detail-description">{row.description}</p>}

          {makerCount >= 5 && (
            <p className="nw-detail-madeby">
              Made by {makerCount.toLocaleString()} {makerCount === 1 ? 'maker' : 'makers'}
            </p>
          )}

          {unlocked && (
            <div className="nw-detail-actions">
              <Link href={studioHref} className="nw-detail-action primary">Stitch this in the Studio</Link>
              <a href={printHref} className="nw-detail-action ghost">Print the transfer template</a>
            </div>
          )}
        </div>
      </header>

      {/* Extra finished-piece photos (a gallery) only when there's more than the
          hero — the hero already shows the finished piece, so no duplicate. */}
      {galleryUrls.length > 0 && (
        <section className="nw-detail-gallery">
          {galleryUrls.map((g, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={g} alt={`${row.name} — view ${i + 2}`} loading="lazy" />
          ))}
        </section>
      )}

      {/* Materials — indexable shop window. */}
      <section className="nw-detail-materials">
        <h2>What you’ll need</h2>
        {materials.length > 0 && (
          <ul className="nw-detail-materials-list">
            {materials.map((m) => <li key={m}>{m}</li>)}
          </ul>
        )}
        <h3>Threads</h3>
        <ul className="nw-detail-floss">
          {doc.flossKey.map((f) => (
            <li key={f.code}>
              <span className="nw-detail-floss-swatch" style={{ background: f.hex }} />
              <span className="nw-detail-floss-detail">
                <span className="nw-detail-floss-name">{f.name}</span>
                <span className="nw-detail-floss-code">DMC {f.code}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Stitches used — indexable shop window. */}
      <section className="nw-detail-stitches">
        <h2>Stitches used</h2>
        <ul className="nw-detail-stitch-list">
          {doc.stitchKey.map((s) => (
            <li key={s.slug}>
              <strong>{s.name}</strong>{s.how ? ` — ${s.how}` : ''}
            </li>
          ))}
        </ul>
      </section>

      {/* The usable pattern — free with login. Logged-out visitors get the gate;
          logged-in get the diagram, the printable template and the steps. */}
      {unlocked ? (
        <>
          {doc.isDense && doc.outlineSvg && doc.denseMapSvg ? (
            <section className="nw-detail-diagram">
              <h2>Transfer template &amp; colour map</h2>
              <p className="nw-detail-diagram-note">
                Two sheets that line up exactly. <strong>Transfer the outline</strong> onto your
                fabric (trace or iron-on), then <strong>fill it following the colour map</strong> —
                each area shows its thread colour and the stitch direction. Match colours to the
                floss key above.
              </p>
              <div className="nw-detail-diagram-pair">
                <figure>
                  <div
                    className="nw-detail-diagram-svg"
                    dangerouslySetInnerHTML={{ __html: doc.outlineSvg }}
                  />
                  <figcaption>Transfer template — trace this onto your fabric.</figcaption>
                </figure>
                <figure>
                  <div
                    className="nw-detail-diagram-svg"
                    dangerouslySetInnerHTML={{ __html: doc.denseMapSvg }}
                  />
                  <figcaption>Colour &amp; stitch-direction map — work from this.</figcaption>
                </figure>
              </div>
              <a href={printHref} className="nw-detail-action ghost">Print the transfer template (A4 / Letter)</a>
            </section>
          ) : (
            <section className="nw-detail-diagram">
              <h2>Transfer template &amp; colour guide</h2>
              <p className="nw-detail-diagram-note">
                Each area is labelled <em>[stitch][colour]</em> — match the keys below. Print the
                full 1:1 template to trace onto your fabric.
              </p>
              <div
                className="nw-detail-diagram-svg"
                dangerouslySetInnerHTML={{ __html: doc.colourGuideSvg }}
              />
              <a href={printHref} className="nw-detail-action ghost">Print the transfer template (A4 / Letter)</a>
            </section>
          )}

          <section className="nw-detail-steps">
            <h2>How to stitch it</h2>
            <ol>
              {doc.steps.map((step, i) => <li key={i}>{step}</li>)}
            </ol>
          </section>

          <section className="nw-detail-studio-cta">
            <Link href={studioHref} className="nw-detail-action primary">Open in the Studio</Link>
            <p>Track every area as you stitch it — your progress saves across devices.</p>
          </section>
        </>
      ) : (
        <section className="nw-detail-gate">
          <PatternUnlockCta
            craftLabel="this embroidery pattern"
            returnTo={returnTo}
            unlocks={[
              'The transfer template to print at home (1:1, A4 or Letter)',
              'The colour guide and the full step-by-step',
              'The interactive Studio to track your progress',
            ]}
          />
        </section>
      )}

      {row.designer?.bio && (
        <section className="nw-detail-designer-card">
          <h2>About {row.designer.displayName}</h2>
          <p>{row.designer.bio}</p>
        </section>
      )}
    </article>
  )
}
