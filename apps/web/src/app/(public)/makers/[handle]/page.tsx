import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma, CreatorApplicationStatus, TutorialStatus } from '@homemade/db'
import { TutorialCard } from '@/components/public/tutorial-card'
import { cloudflareDeliveryUrl } from '@/lib/media'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { emptyReaderState, loadReaderState, readerStateFor } from '@/lib/user-state'

import '../makers.css'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ handle: string }>
}

async function loadCreator(handle: string) {
  return prisma.user.findFirst({
    where: {
      displayHandle: handle.toLowerCase(),
      isCreator: true,
      creatorProfile: {
        applicationStatus: CreatorApplicationStatus.APPROVED,
      },
    },
    include: {
      creatorProfile: true,
    },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const creator = await loadCreator(handle)
  if (!creator) return { title: 'Not found · homemade' }
  return {
    title: `${creator.name ?? creator.displayHandle} · homemade`,
    description: creator.creatorProfile?.specialty ?? undefined,
    robots: { index: false, follow: false },
  }
}

export default async function MakerProfilePage({ params }: PageProps) {
  const { handle } = await params
  const [creator, currentUser] = await Promise.all([
    loadCreator(handle),
    getCurrentDbUser(),
  ])

  if (!creator || !creator.creatorProfile) notFound()

  const tutorials = await prisma.tutorial.findMany({
    where: {
      creatorId: creator.id,
      status: TutorialStatus.PUBLISHED,
    },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      difficulty: true,
      season: true,
      category: { select: { slug: true, name: true } },
      hero: { select: { cloudflareId: true } },
    },
  })

  const readerState = currentUser
    ? await loadReaderState(
        currentUser.id,
        tutorials.map((t) => t.id),
      )
    : emptyReaderState()

  const profile = creator.creatorProfile
  const socials = buildSocials(profile)

  return (
    <div className="maker-profile">
      <header className="maker-profile-header">
        <div className="maker-profile-avatar" aria-hidden="true">
          {(creator.name ?? creator.displayHandle ?? 'h').slice(0, 1).toUpperCase()}
        </div>
        <div className="maker-profile-meta">
          <h1 className="maker-profile-name">
            {creator.name ?? creator.displayHandle}
            {creator.creatorVerifiedAt && <VerifiedDot />}
          </h1>
          <div className="maker-profile-handle">@{creator.displayHandle}</div>
          {profile.specialty && (
            <p className="maker-profile-specialty">{profile.specialty}</p>
          )}
          {profile.bio && <p className="maker-profile-bio">{profile.bio}</p>}
          {socials.length > 0 && (
            <div className="maker-profile-socials">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="maker-profile-social"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      <section>
        <span className="maker-profile-section-label">Tutorials</span>
        {tutorials.length === 0 ? (
          <p className="maker-profile-empty">No published tutorials yet.</p>
        ) : (
          <div className="maker-profile-tutorials">
            {tutorials.map((t) => (
              <TutorialCard
                key={t.id}
                href={`/${t.category.slug}/${t.slug}`}
                title={t.title}
                excerpt={t.excerpt}
                heroUrl={cloudflareDeliveryUrl(t.hero?.cloudflareId, 'card')}
                difficulty={t.difficulty}
                season={t.season}
                categoryName={t.category.name}
                state={readerStateFor(readerState, t.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

interface SocialLink {
  label: string
  href: string
}

function buildSocials(profile: {
  websiteUrl: string | null
  instagramHandle: string | null
  youtubeHandle: string | null
  tiktokHandle: string | null
  substackUrl: string | null
  pinterestHandle: string | null
}): SocialLink[] {
  const out: SocialLink[] = []
  if (profile.websiteUrl) out.push({ label: 'Website', href: normaliseUrl(profile.websiteUrl) })
  if (profile.instagramHandle) {
    out.push({ label: 'Instagram', href: `https://instagram.com/${stripAt(profile.instagramHandle)}` })
  }
  if (profile.youtubeHandle) {
    out.push({ label: 'YouTube', href: `https://youtube.com/${ensureYouTubeHandle(profile.youtubeHandle)}` })
  }
  if (profile.tiktokHandle) {
    out.push({ label: 'TikTok', href: `https://tiktok.com/@${stripAt(profile.tiktokHandle)}` })
  }
  if (profile.pinterestHandle) {
    out.push({ label: 'Pinterest', href: `https://pinterest.com/${stripAt(profile.pinterestHandle)}` })
  }
  if (profile.substackUrl) out.push({ label: 'Substack', href: normaliseUrl(profile.substackUrl) })
  return out
}

function stripAt(raw: string): string {
  return raw.replace(/^@/, '').trim()
}

function ensureYouTubeHandle(raw: string): string {
  const t = raw.trim()
  if (t.startsWith('@')) return t
  if (t.startsWith('http')) return t.replace(/^https?:\/\/(www\.)?youtube\.com\//, '')
  return `@${t}`
}

function normaliseUrl(raw: string): string {
  const t = raw.trim()
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

function VerifiedDot() {
  return (
    <span
      className="maker-verified-dot"
      aria-label="Verified maker"
      title="Verified maker"
    >
      <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
        <circle cx="7" cy="7" r="6.4" fill="currentColor" />
        <path
          d="M4 7.4l2 2 4-4"
          stroke="var(--color-cream)"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
