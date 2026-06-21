import { NextResponse } from 'next/server'
import {
  prisma,
  parsePatternData,
  Visibility,
} from '@homemade/db'
import { getCurrentDbUser } from '@/lib/get-current-user'
import { hasPremium } from '@/lib/entitlements'
import { buildPatternPdf, type PaperKey } from '@/lib/studio/pdf-export'
import { mediaUrl } from '@/lib/media'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
// PDF export does a meaningful amount of SVG → PNG work; budget for it.
export const maxDuration = 60

interface Ctx {
  params: Promise<{ id: string }>
}

const PAPER_KEYS: PaperKey[] = ['a4', 'letter', 'a3', 'legal']

function parsePaper(raw: string | null | undefined): PaperKey {
  const v = (raw ?? '').toLowerCase()
  return PAPER_KEYS.includes(v as PaperKey) ? (v as PaperKey) : 'a4'
}

export async function GET(req: Request, ctx: Ctx) {
  const { id } = await ctx.params
  const url = new URL(req.url)
  const paper = parsePaper(url.searchParams.get('paper'))
  const monochrome = url.searchParams.get('monochrome') === '1'

  // Printing / downloading any PDF is a premium action across every category.
  const user = await getCurrentDbUser()
  if (!hasPremium(user)) {
    return new NextResponse('Homemade Premium is required to download a PDF.', { status: 402 })
  }

  const row = await prisma.pattern.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      data: true,
      ownerUserId: true,
      visibility: true,
      designer: { select: { displayName: true } },
      hero: { select: { cloudflareId: true, r2Key: true } },
    },
  })
  if (!row) return new NextResponse('Not found', { status: 404 })

  const isLibrary = row.ownerUserId === null && row.visibility !== Visibility.PRIVATE
  if (!isLibrary && row.ownerUserId !== user!.id) {
    return new NextResponse('Not authorised', { status: 403 })
  }

  let data
  try { data = parsePatternData(row.data) } catch {
    return new NextResponse('Pattern data is malformed', { status: 500 })
  }

  // Try to pull the finished-piece photograph if one's attached. Fall
  // through to the beauty-mode chart render in pdf-export when the
  // fetch fails or no hero is set.
  let heroPhoto: Buffer | null = null
  if (row.hero) {
    const url = mediaUrl(row.hero, 'hero')
    if (url) {
      try {
        const res = await fetch(url)
        if (res.ok) {
          const arr = new Uint8Array(await res.arrayBuffer())
          heroPhoto = Buffer.from(arr)
        }
      } catch {
        // ignore — fall through to render
      }
    }
  }

  const pdf = await buildPatternPdf(data, row.name, {
    paper,
    monochrome,
    designerName: row.designer?.displayName ?? null,
    heroPhoto,
  })

  const filename = `${slugify(row.name)}-${paper}${monochrome ? '-bw' : ''}.pdf`
  return new NextResponse(Buffer.from(pdf) as unknown as BodyInit, {
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${filename}"`,
      'cache-control': 'private, no-store',
    },
  })
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'pattern'
}
