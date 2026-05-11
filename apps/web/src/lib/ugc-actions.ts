'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  prisma,
  UGCStatus,
  UGCPhotoStatus,
  UserProjectStatus,
  ReviewStatus,
  ErrataStatus,
  ReportStatus,
  ReportTargetType,
  ReportReason,
  MediaStatus,
  MediaType,
  UserRole,
} from '@homemade/db'
import { getCurrentDbUser } from './get-current-user'
import { audit } from './audit'
import { scanImageForNsfw, nsfwDecision } from './nsfw-scan'
import { mediaUrl } from './media'

type ActionResult = { ok: true } | { ok: false; error: string }

async function requireMember() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  if (user.isSuspended) {
    return { user: null, error: 'Your account is suspended.' as const }
  }
  return { user, error: null as null | string }
}

function tutorialPath(tutorial: { slug: string; category: { slug: string } }) {
  return `/${tutorial.category.slug}/${tutorial.slug}`
}

// ────────────────────────────────────────────────────────────────────────────
// Reviews
// ────────────────────────────────────────────────────────────────────────────

export async function submitReview(input: {
  tutorialId: string
  rating: number
  title: string | null
  body: string
}): Promise<ActionResult> {
  const { user, error } = await requireMember()
  if (!user) return { ok: false, error: error ?? 'Not signed in.' }

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    return { ok: false, error: 'Rating must be a whole number between 1 and 5.' }
  }
  const body = input.body.trim()
  if (body.length === 0) return { ok: false, error: 'Add a few words about how it went.' }
  if (body.length > 5000) return { ok: false, error: 'Reviews are capped at 5,000 characters.' }
  const title = input.title?.trim().slice(0, 120) || null

  const tutorial = await prisma.tutorial.findUnique({
    where: { id: input.tutorialId },
    select: { id: true, slug: true, category: { select: { slug: true } } },
  })
  if (!tutorial) return { ok: false, error: 'Tutorial not found.' }

  // Reviews require a COMPLETED UserProject — finish the make first.
  const project = await prisma.userProject.findUnique({
    where: { userId_tutorialId: { userId: user.id, tutorialId: tutorial.id } },
    select: { status: true },
  })
  if (project?.status !== UserProjectStatus.COMPLETED) {
    return {
      ok: false,
      error: 'You can only review a tutorial once you’ve marked it as made.',
    }
  }

  const existing = await prisma.review.findUnique({
    where: { userId_tutorialId: { userId: user.id, tutorialId: tutorial.id } },
    select: { id: true },
  })
  if (existing) return { ok: false, error: 'You’ve already reviewed this tutorial.' }

  await prisma.review.create({
    data: {
      userId: user.id,
      tutorialId: tutorial.id,
      rating: input.rating,
      title,
      body,
    },
  })

  revalidatePath(tutorialPath(tutorial))
  revalidatePath('/me/reviews')
  return { ok: true }
}

export async function toggleReviewHelpful(reviewId: string): Promise<
  ActionResult & { helpful?: boolean; helpfulCount?: number }
> {
  const { user, error } = await requireMember()
  if (!user) return { ok: false, error: error ?? 'Not signed in.' }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: {
      id: true,
      status: true,
      tutorial: { select: { slug: true, category: { select: { slug: true } } } },
    },
  })
  if (!review || review.status !== ReviewStatus.PUBLISHED) {
    return { ok: false, error: 'Review not found.' }
  }

  const existing = await prisma.reviewHelpful.findUnique({
    where: { userId_reviewId: { userId: user.id, reviewId } },
  })

  let helpful: boolean
  if (existing) {
    await prisma.reviewHelpful.delete({
      where: { userId_reviewId: { userId: user.id, reviewId } },
    })
    helpful = false
  } else {
    await prisma.reviewHelpful.create({
      data: { userId: user.id, reviewId },
    })
    helpful = true
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { helpfulCount: helpful ? { increment: 1 } : { decrement: 1 } },
    select: { helpfulCount: true },
  })

  revalidatePath(tutorialPath(review.tutorial))
  return { ok: true, helpful, helpfulCount: updated.helpfulCount }
}

// ────────────────────────────────────────────────────────────────────────────
// UGC photos
// ────────────────────────────────────────────────────────────────────────────

export async function submitUgcPhoto(input: {
  tutorialId: string
  r2Key: string
  caption: string | null
  filename: string | null
  mimeType: string | null
  width: number | null
  height: number | null
  bytes: number | null
}): Promise<ActionResult & { photoId?: string; status?: UGCPhotoStatus }> {
  const { user, error } = await requireMember()
  if (!user) return { ok: false, error: error ?? 'Not signed in.' }

  if (!input.r2Key) {
    return { ok: false, error: 'Upload was missing the R2 key.' }
  }
  const caption = input.caption?.trim().slice(0, 280) || null

  const tutorial = await prisma.tutorial.findUnique({
    where: { id: input.tutorialId },
    select: { id: true, slug: true, category: { select: { slug: true } } },
  })
  if (!tutorial) return { ok: false, error: 'Tutorial not found.' }

  // Any UserProject (in-progress or completed) entitles uploading.
  const project = await prisma.userProject.findUnique({
    where: { userId_tutorialId: { userId: user.id, tutorialId: tutorial.id } },
    select: { id: true },
  })
  if (!project) {
    return {
      ok: false,
      error: 'Start making this tutorial before sharing a photo.',
    }
  }

  // Create the Media row + UGCPhoto row. NSFW scan runs after so the row
  // exists even if the scan fails mid-flight.
  const media = await prisma.media.create({
    data: {
      r2Key: input.r2Key,
      type: MediaType.PHOTO,
      status: MediaStatus.READY,
      filename: input.filename ?? null,
      mimeType: input.mimeType ?? null,
      width: input.width ?? null,
      height: input.height ?? null,
      bytes: input.bytes ?? null,
    },
  })

  const photo = await prisma.uGCPhoto.create({
    data: {
      userId: user.id,
      tutorialId: tutorial.id,
      mediaId: media.id,
      caption,
    },
    select: { id: true },
  })

  // Run the NSFW pre-screen against the public URL.
  const imageUrl = mediaUrl({ r2Key: input.r2Key }, 'public')
  let status: UGCPhotoStatus = UGCPhotoStatus.PENDING_MODERATION
  if (imageUrl) {
    const scan = await scanImageForNsfw(imageUrl)
    const decision = nsfwDecision(scan.score)
    const updates: Record<string, unknown> = {
      nsfwScore: scan.score,
      nsfwClassification: scan.classification,
    }
    if (decision === 'auto-reject') {
      updates.status = UGCPhotoStatus.REJECTED
      updates.rejectionReason = `Auto-rejected: ${scan.classification ?? 'flagged content'}`
      updates.moderatedAt = new Date()
      status = UGCPhotoStatus.REJECTED
    }
    await prisma.uGCPhoto.update({
      where: { id: photo.id },
      data: updates,
    })
  }

  revalidatePath(tutorialPath(tutorial))
  revalidatePath('/me/photos')
  return { ok: true, photoId: photo.id, status }
}

// ────────────────────────────────────────────────────────────────────────────
// Q&A
// ────────────────────────────────────────────────────────────────────────────

export async function submitQuestion(input: {
  tutorialId: string
  body: string
}): Promise<ActionResult> {
  const { user, error } = await requireMember()
  if (!user) return { ok: false, error: error ?? 'Not signed in.' }

  const body = input.body.trim()
  if (body.length === 0) return { ok: false, error: 'Please write your question.' }
  if (body.length > 1000) return { ok: false, error: 'Questions are capped at 1,000 characters.' }

  const tutorial = await prisma.tutorial.findUnique({
    where: { id: input.tutorialId },
    select: { id: true, slug: true, category: { select: { slug: true } } },
  })
  if (!tutorial) return { ok: false, error: 'Tutorial not found.' }

  await prisma.question.create({
    data: { userId: user.id, tutorialId: tutorial.id, body },
  })

  revalidatePath(tutorialPath(tutorial))
  revalidatePath('/me/questions')
  return { ok: true }
}

export async function submitAnswer(input: {
  questionId: string
  body: string
}): Promise<ActionResult> {
  const { user, error } = await requireMember()
  if (!user) return { ok: false, error: error ?? 'Not signed in.' }

  const body = input.body.trim()
  if (body.length === 0) return { ok: false, error: 'Please write your answer.' }
  if (body.length > 5000) return { ok: false, error: 'Answers are capped at 5,000 characters.' }

  const question = await prisma.question.findUnique({
    where: { id: input.questionId },
    select: {
      id: true,
      tutorial: { select: { slug: true, category: { select: { slug: true } } } },
    },
  })
  if (!question) return { ok: false, error: 'Question not found.' }

  const isAuthorAnswer =
    user.role === UserRole.ADMIN || user.role === UserRole.EDITOR

  await prisma.answer.create({
    data: {
      userId: user.id,
      questionId: question.id,
      body,
      isAuthorAnswer,
      // Editor / admin answers publish immediately; member answers go to mod queue.
      status: isAuthorAnswer ? UGCStatus.PUBLISHED : UGCStatus.PENDING_MODERATION,
    },
  })

  revalidatePath(tutorialPath(question.tutorial))
  revalidatePath('/me/questions')
  return { ok: true }
}

export async function toggleQuestionUpvote(questionId: string): Promise<
  ActionResult & { upvoted?: boolean; upvoteCount?: number }
> {
  const { user, error } = await requireMember()
  if (!user) return { ok: false, error: error ?? 'Not signed in.' }

  const q = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      status: true,
      tutorial: { select: { slug: true, category: { select: { slug: true } } } },
    },
  })
  if (!q || q.status !== UGCStatus.PUBLISHED) {
    return { ok: false, error: 'Question not found.' }
  }

  const existing = await prisma.questionUpvote.findUnique({
    where: { userId_questionId: { userId: user.id, questionId } },
  })

  let upvoted: boolean
  if (existing) {
    await prisma.questionUpvote.delete({
      where: { userId_questionId: { userId: user.id, questionId } },
    })
    upvoted = false
  } else {
    await prisma.questionUpvote.create({
      data: { userId: user.id, questionId },
    })
    upvoted = true
  }
  const updated = await prisma.question.update({
    where: { id: questionId },
    data: { upvoteCount: upvoted ? { increment: 1 } : { decrement: 1 } },
    select: { upvoteCount: true },
  })

  revalidatePath(tutorialPath(q.tutorial))
  return { ok: true, upvoted, upvoteCount: updated.upvoteCount }
}

// ────────────────────────────────────────────────────────────────────────────
// Errata
// ────────────────────────────────────────────────────────────────────────────

export async function submitErrata(input: {
  tutorialId: string
  body: string
}): Promise<ActionResult> {
  const user = await getCurrentDbUser()
  // Errata is allowed even when signed out per spec; nullable userId.
  const body = input.body.trim()
  if (body.length === 0) return { ok: false, error: 'Please tell us what looks off.' }
  if (body.length > 2000) return { ok: false, error: 'Errata reports are capped at 2,000 characters.' }

  if (user?.isSuspended) {
    return { ok: false, error: 'Your account is suspended.' }
  }

  const tutorial = await prisma.tutorial.findUnique({
    where: { id: input.tutorialId },
    select: { id: true, slug: true, category: { select: { slug: true } } },
  })
  if (!tutorial) return { ok: false, error: 'Tutorial not found.' }

  await prisma.errata.create({
    data: {
      userId: user?.id ?? null,
      tutorialId: tutorial.id,
      body,
    },
  })

  revalidatePath(tutorialPath(tutorial))
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Reports — abuse on any UGC item or user
// ────────────────────────────────────────────────────────────────────────────

const ALLOWED_REASONS = new Set<ReportReason>([
  ReportReason.SPAM,
  ReportReason.ABUSE,
  ReportReason.MISINFORMATION,
  ReportReason.COPYRIGHT,
  ReportReason.NSFW,
  ReportReason.OTHER,
])

const ALLOWED_TARGETS = new Set<ReportTargetType>([
  ReportTargetType.REVIEW,
  ReportTargetType.PHOTO,
  ReportTargetType.QUESTION,
  ReportTargetType.ANSWER,
  ReportTargetType.USER,
])

export async function submitReport(input: {
  targetType: ReportTargetType
  targetId: string
  reason: ReportReason
  description: string | null
}): Promise<ActionResult> {
  const { user, error } = await requireMember()
  if (!user) return { ok: false, error: error ?? 'Not signed in.' }

  if (!ALLOWED_TARGETS.has(input.targetType)) {
    return { ok: false, error: 'Unknown report target.' }
  }
  if (!ALLOWED_REASONS.has(input.reason)) {
    return { ok: false, error: 'Pick a reason.' }
  }
  const description = input.description?.trim().slice(0, 1000) || null

  await prisma.report.create({
    data: {
      reporterId: user.id,
      targetType: input.targetType,
      targetId: input.targetId,
      reason: input.reason,
      description,
      status: ReportStatus.OPEN,
    },
  })

  await audit({
    actorId: user.id,
    action: 'report.create',
    resource: `Report:${input.targetType}:${input.targetId}`,
    metadata: { reason: input.reason },
  })

  return { ok: true }
}
