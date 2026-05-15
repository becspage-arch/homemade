import 'server-only'
import {
  prisma,
  ReviewStatus,
  UGCStatus,
  UGCPhotoStatus,
  type User,
} from '@homemade/db'
import { mediaUrl } from './media'

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function handleOf(u: { displayHandle: string | null; name: string | null; email: string }): string {
  return u.displayHandle ?? u.name ?? u.email.split('@')[0] ?? u.email
}

export interface TutorialUgcData {
  reviews: {
    avg: number | null
    total: number
    distribution: Record<1 | 2 | 3 | 4 | 5, number>
    alreadyReviewed: boolean
    rows: {
      id: string
      rating: number
      title: string | null
      body: string
      helpfulCount: number
      createdAt: string
      authorHandle: string
      isMine: boolean
      helpful: boolean
    }[]
  }
  photos: {
    id: string
    thumbUrl: string | null
    fullUrl: string | null
    caption: string | null
    authorHandle: string
    createdAt: string
    alt: string
  }[]
  questions: {
    id: string
    body: string
    upvoteCount: number
    upvoted: boolean
    authorHandle: string
    createdAt: string
    isMine: boolean
    answers: {
      id: string
      body: string
      authorHandle: string
      isAuthorAnswer: boolean
      createdAt: string
      isMine: boolean
    }[]
  }[]
}

export async function loadTutorialUgc(
  tutorialId: string,
  viewer: User | null,
): Promise<TutorialUgcData> {
  const viewerId = viewer?.id ?? null

  // First batch: the rows that drive the page (reviews + photos + questions),
  // plus the viewer's "already reviewed this tutorial?" flag — that one needs
  // only viewerId + tutorialId so it can run alongside the others rather than
  // sequentially.
  const [reviewRows, photoRows, questionRows, alreadyReviewedRow] = await Promise.all([
    prisma.review.findMany({
      where: {
        tutorialId,
        status: ReviewStatus.PUBLISHED,
      },
      orderBy: [{ helpfulCount: 'desc' }, { createdAt: 'desc' }],
      take: 50,
      include: {
        user: { select: { displayHandle: true, name: true, email: true } },
      },
    }),
    prisma.uGCPhoto.findMany({
      where: { tutorialId, status: UGCPhotoStatus.APPROVED },
      orderBy: [{ createdAt: 'desc' }],
      take: 24,
      include: {
        user: { select: { displayHandle: true, name: true, email: true } },
        media: { select: { cloudflareId: true, r2Key: true, alt: true } },
      },
    }),
    prisma.question.findMany({
      where: { tutorialId, status: UGCStatus.PUBLISHED },
      orderBy: [{ upvoteCount: 'desc' }, { createdAt: 'desc' }],
      take: 30,
      include: {
        user: { select: { displayHandle: true, name: true, email: true } },
        answers: {
          where: { status: UGCStatus.PUBLISHED },
          orderBy: [{ isAuthorAnswer: 'desc' }, { createdAt: 'asc' }],
          include: {
            user: { select: { displayHandle: true, name: true, email: true } },
          },
        },
      },
    }),
    viewerId
      ? prisma.review.findUnique({
          where: { userId_tutorialId: { userId: viewerId, tutorialId } },
          select: { id: true },
        })
      : Promise.resolve(null),
  ])

  // Second batch: only the per-viewer helpful / upvote flags for the rows we
  // actually loaded. The earlier version pulled every helpful row and every
  // upvote row the viewer had ever cast across the whole site — fine on day
  // one, but scales linearly with the viewer's total interaction count rather
  // than the page's review / question count.
  const visibleReviewIds = reviewRows.map((r) => r.id)
  const visibleQuestionIds = questionRows.map((q) => q.id)
  const [myHelpfulIds, myUpvoteIds] = await Promise.all([
    viewerId && visibleReviewIds.length > 0
      ? prisma.reviewHelpful
          .findMany({
            where: { userId: viewerId, reviewId: { in: visibleReviewIds } },
            select: { reviewId: true },
          })
          .then((rs) => new Set(rs.map((r) => r.reviewId)))
      : Promise.resolve(new Set<string>()),
    viewerId && visibleQuestionIds.length > 0
      ? prisma.questionUpvote
          .findMany({
            where: { userId: viewerId, questionId: { in: visibleQuestionIds } },
            select: { questionId: true },
          })
          .then((rs) => new Set(rs.map((r) => r.questionId)))
      : Promise.resolve(new Set<string>()),
  ])

  // Review distribution + avg are computed off PUBLISHED rows only.
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  }
  for (const r of reviewRows) {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating as 1 | 2 | 3 | 4 | 5] += 1
    }
  }
  const total = reviewRows.length
  const avg =
    total > 0
      ? reviewRows.reduce((sum, r) => sum + r.rating, 0) / total
      : null

  const alreadyReviewed = alreadyReviewedRow !== null

  return {
    reviews: {
      avg,
      total,
      distribution,
      alreadyReviewed,
      rows: reviewRows.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        helpfulCount: r.helpfulCount,
        createdAt: fmtDate(r.createdAt),
        authorHandle: handleOf(r.user),
        isMine: r.userId === viewerId,
        helpful: myHelpfulIds.has(r.id),
      })),
    },
    photos: photoRows.map((p) => ({
      id: p.id,
      thumbUrl: mediaUrl(p.media, 'card'),
      fullUrl: mediaUrl(p.media, 'public'),
      caption: p.caption,
      authorHandle: handleOf(p.user),
      createdAt: fmtDate(p.createdAt),
      alt: p.media.alt ?? p.caption ?? 'Reader photo',
    })),
    questions: questionRows.map((q) => ({
      id: q.id,
      body: q.body,
      upvoteCount: q.upvoteCount,
      upvoted: myUpvoteIds.has(q.id),
      authorHandle: handleOf(q.user),
      createdAt: fmtDate(q.createdAt),
      isMine: q.userId === viewerId,
      answers: q.answers.map((a) => ({
        id: a.id,
        body: a.body,
        authorHandle: handleOf(a.user),
        isAuthorAnswer: a.isAuthorAnswer,
        createdAt: fmtDate(a.createdAt),
        isMine: a.userId === viewerId,
      })),
    })),
  }
}
