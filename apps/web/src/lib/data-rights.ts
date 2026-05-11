import 'server-only'

import { prisma } from '@homemade/db'
import { r2Upload } from './r2'

const EXPORT_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

/**
 * Build the GDPR data-export bundle for a user. Walks every model that
 * holds user-owned content and packages it as JSON. Photo / media rows
 * are exported by URL (R2 / Cloudflare delivery), not as embedded bytes
 * — the user can right-click and save what they need.
 *
 * Intentionally synchronous: the volume of data per user during private
 * beta is small (low single-digit MBs). Once volume grows this should be
 * moved into an Inngest job.
 */
export async function buildExportBundle(userId: string): Promise<{
  payload: Record<string, unknown>
  bytes: number
}> {
  const [
    user,
    bookmarks,
    projects,
    reviews,
    questions,
    answers,
    photos,
    errata,
    notifications,
    auditLogsAuthored,
    creatorProfile,
    patternTests,
    testAssignments,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        displayHandle: true,
        bio: true,
        role: true,
        beginnerMode: true,
        isCreator: true,
        creatorVerifiedAt: true,
        isPatternTester: true,
        cookieConsent: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.bookmark.findMany({
      where: { userId },
      select: { id: true, tutorialId: true, createdAt: true },
    }),
    prisma.userProject.findMany({
      where: { userId },
      select: {
        id: true,
        tutorialId: true,
        status: true,
        startedAt: true,
        completedAt: true,
        abandonedAt: true,
        notes: true,
        suppliesChecked: true,
        readingProgressPercent: true,
        lastViewedAt: true,
      },
    }),
    prisma.review.findMany({
      where: { userId },
      select: {
        id: true,
        tutorialId: true,
        rating: true,
        title: true,
        body: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.question.findMany({
      where: { userId },
      select: {
        id: true,
        tutorialId: true,
        body: true,
        status: true,
        upvoteCount: true,
        createdAt: true,
      },
    }),
    prisma.answer.findMany({
      where: { userId },
      select: {
        id: true,
        questionId: true,
        body: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.uGCPhoto.findMany({
      where: { userId },
      select: {
        id: true,
        tutorialId: true,
        caption: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
        media: {
          select: {
            id: true,
            cloudflareId: true,
            r2Key: true,
            alt: true,
            mimeType: true,
            width: true,
            height: true,
            bytes: true,
            filename: true,
          },
        },
      },
    }),
    prisma.errata.findMany({
      where: { userId },
      select: {
        id: true,
        tutorialId: true,
        body: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.notification.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        body: true,
        href: true,
        readAt: true,
        createdAt: true,
      },
    }),
    prisma.auditLog.findMany({
      where: { actorId: userId },
      select: {
        id: true,
        action: true,
        resource: true,
        metadata: true,
        createdAt: true,
      },
      take: 5000,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.creatorProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        bio: true,
        specialty: true,
        websiteUrl: true,
        instagramHandle: true,
        youtubeHandle: true,
        tiktokHandle: true,
        substackUrl: true,
        pinterestHandle: true,
        applicationStatus: true,
        appliedAt: true,
        decidedAt: true,
      },
    }),
    prisma.patternTest.findMany({
      where: { creatorId: userId },
      select: {
        id: true,
        tutorialId: true,
        status: true,
        title: true,
        briefForTesters: true,
        maxTesters: true,
        createdAt: true,
      },
    }),
    prisma.testAssignment.findMany({
      where: { userId },
      select: {
        id: true,
        patternTestId: true,
        status: true,
        applicationNote: true,
        feedback: true,
        appliedAt: true,
        startedAt: true,
        completedAt: true,
      },
    }),
  ])

  const payload = {
    exportedAt: new Date().toISOString(),
    notice:
      'This file contains the personal data Homemade holds about you. ' +
      'Photographs and media are referenced by their delivery URL — you ' +
      'can download the originals from those links while the export is ' +
      'fresh. The export expires 7 days after generation.',
    user,
    bookmarks,
    projects,
    reviews,
    questions,
    answers,
    photos,
    errata,
    notifications,
    auditLogsAuthored,
    creatorProfile,
    patternTests,
    testAssignments,
  }

  const json = JSON.stringify(payload, null, 2)
  return { payload, bytes: Buffer.byteLength(json, 'utf8') }
}

/**
 * Build an export bundle and upload it to R2. Returns the row data the
 * caller should store on the DataExportRequest.
 */
export async function uploadExportBundle(
  userId: string,
  requestId: string,
): Promise<{ fileUrl: string; fileKey: string; bytes: number; expiresAt: Date }> {
  const { payload, bytes } = await buildExportBundle(userId)
  const json = JSON.stringify(payload, null, 2)

  const { key, publicUrl } = await r2Upload(Buffer.from(json, 'utf8'), 'application/json', {
    filename: `homemade-export-${requestId}.json`,
    prefix: `data-exports/${userId}`,
  })

  return {
    fileUrl: publicUrl,
    fileKey: key,
    bytes,
    expiresAt: new Date(Date.now() + EXPORT_TTL_MS),
  }
}
