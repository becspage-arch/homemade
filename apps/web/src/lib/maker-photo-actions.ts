'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  prisma,
  PatternType,
  UGCPhotoStatus,
  MediaStatus,
  MediaType,
  NotificationType,
} from '@homemade/db'
import { getCurrentDbUser, requireAdminRole } from './get-current-user'
import { audit } from './audit'
import { notify } from './notify'
import { mediaUrl } from './media'
import { captureServerEvent } from './posthog'
import { checkRateLimit } from './ratelimit'
import {
  gateMakerPhoto,
  makerPhotoGateRunsOnUpload,
  type MakerPhotoGateResult,
} from './maker-photo-gate'
import { resolveTarget } from './maker-photo-target'
import { targetData, type PhotoTarget } from './maker-photos'

/**
 * The one server action set for maker photos. Uploading is publishing: there is
 * no separate opt-in, no queue a photo waits in for a person, and no community
 * layer around it. The AI gate decides, the member can appeal once, and the
 * member can take any photo down at any time.
 */

type ActionResult = { ok: true } | { ok: false; error: string }

const MAX_GATE_BYTES = 6 * 1024 * 1024

async function requireMember() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  if (user.isSuspended) return { user: null, error: 'Your account is suspended.' as const }
  return { user, error: null as null | string }
}

/** Fetch an image we already published so the gate can look at the bytes. */
async function fetchImage(
  url: string | null,
): Promise<{ buffer: Buffer; mediaType: 'image/png' | 'image/jpeg' | 'image/webp' } | null> {
  if (!url) return null
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    if (buf.length === 0 || buf.length > MAX_GATE_BYTES) return null
    const ct = (res.headers.get('content-type') ?? '').toLowerCase()
    const mediaType = ct.includes('png')
      ? ('image/png' as const)
      : ct.includes('webp')
        ? ('image/webp' as const)
        : ('image/jpeg' as const)
    return { buffer: buf, mediaType }
  } catch {
    return null
  }
}

export interface SubmitMakerPhotoInput {
  /** Exactly one of the two. */
  tutorialId?: string | null
  patternId?: string | null
  patternType?: PatternType | null
  r2Key: string
  caption: string | null
  filename: string | null
  mimeType: string | null
  width: number | null
  height: number | null
  bytes: number | null
  /** The terms checkbox on the upload form. Required. */
  agreed: boolean
  /** Set when the photo comes from a pattern test. */
  testAssignmentId?: string | null
}

export type SubmitMakerPhotoResult =
  | { ok: true; photoId: string; status: UGCPhotoStatus; reasons: string[] }
  | { ok: false; error: string }

/**
 * Upload one photo of a made thing. Runs the gate inline so the member finds
 * out on the spot whether it is up.
 */
export async function submitMakerPhoto(
  input: SubmitMakerPhotoInput,
): Promise<SubmitMakerPhotoResult> {
  const { user, error } = await requireMember()
  if (!user) return { ok: false, error: error ?? 'Not signed in.' }

  if (!input.r2Key) return { ok: false, error: 'The upload did not finish. Try again.' }
  if (!input.agreed) {
    return { ok: false, error: 'Tick the box to confirm the photo is yours before uploading.' }
  }

  const hasTutorial = Boolean(input.tutorialId)
  const hasPattern = Boolean(input.patternId && input.patternType)
  if (hasTutorial === hasPattern) {
    return { ok: false, error: 'A photo has to belong to one tutorial or one pattern.' }
  }

  const target: PhotoTarget = hasTutorial
    ? { kind: 'tutorial', tutorialId: input.tutorialId! }
    : { kind: 'pattern', patternId: input.patternId!, patternType: input.patternType! }

  const resolved = await resolveTarget(target)
  if (!resolved) return { ok: false, error: 'We could not find what this photo belongs to.' }

  // A tester photo has to be the tester's own live assignment.
  let testAssignmentId: string | null = null
  if (input.testAssignmentId) {
    const assignment = await prisma.testAssignment.findUnique({
      where: { id: input.testAssignmentId },
      select: { id: true, userId: true },
    })
    if (!assignment || assignment.userId !== user.id) {
      return { ok: false, error: 'That pattern test is not yours.' }
    }
    if (!user.testerAgreementAt) {
      return { ok: false, error: 'Accept the tester agreement before uploading test photos.' }
    }
    testAssignmentId = assignment.id
  }

  const limit = await checkRateLimit('photoUpload', user.id)
  if (!limit.allowed) {
    await captureServerEvent({
      event: 'rate_limit_hit',
      distinctId: user.clerkId,
      properties: { bucket: 'photoUpload' },
    })
    return { ok: false, error: limit.message }
  }

  const caption = input.caption?.trim().slice(0, 280) || null

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
      ...targetData(target),
      mediaId: media.id,
      caption,
      // Snapshot the member's promotion setting at upload time.
      promotionAllowed: user.allowPhotoPromotion,
      isTesterPhoto: Boolean(testAssignmentId),
      testAssignmentId,
    },
    select: { id: true },
  })

  // ── The gate ────────────────────────────────────────────────────────────
  // A photo with no verdict is "pending": invisible, and the member is told it
  // is being checked. That is where the photo stays in 'routine' mode — nothing
  // is fetched, nothing is called, and the scheduled judging session works the
  // queue with scripts/maker-photos-judge.ts against the same three rules.
  let verdict: MakerPhotoGateResult = { decision: 'pending', reasons: [], model: null }
  if (await makerPhotoGateRunsOnUpload()) {
    const uploaded = await fetchImage(mediaUrl({ r2Key: input.r2Key }, 'public'))
    // No bytes to look at means the gate could not run: hold the photo.
    if (uploaded) {
      const reference = resolved.referenceImageUrl
        ? await fetchImage(resolved.referenceImageUrl)
        : null
      verdict = await gateMakerPhoto({
        photo: uploaded.buffer,
        photoMediaType: uploaded.mediaType,
        itemTitle: resolved.title,
        itemKind: resolved.kind,
        reference,
      })
    }
  }

  const status =
    verdict.decision === 'approve'
      ? UGCPhotoStatus.APPROVED
      : verdict.decision === 'reject'
        ? UGCPhotoStatus.REJECTED
        : UGCPhotoStatus.PENDING_MODERATION

  await prisma.uGCPhoto.update({
    where: { id: photo.id },
    data: {
      status,
      gateVerdict: { decision: verdict.decision, reasons: verdict.reasons },
      gateModel: verdict.model,
      rejectionReason:
        verdict.decision === 'reject' ? verdict.reasons.join(' ') : null,
      moderatedAt: verdict.decision === 'pending' ? null : new Date(),
    },
  })

  if (resolved.path) revalidatePath(resolved.path)
  revalidatePath('/me/photos')

  await captureServerEvent({
    event: 'maker_photo_uploaded',
    distinctId: user.clerkId,
    properties: {
      photoId: photo.id,
      targetKind: target.kind,
      patternType: target.kind === 'pattern' ? target.patternType : null,
      isTesterPhoto: Boolean(testAssignmentId),
      status,
    },
  })
  if (status === UGCPhotoStatus.APPROVED) {
    await captureServerEvent({
      event: 'maker_photo_approved',
      distinctId: user.clerkId,
      properties: { photoId: photo.id, decidedBy: 'gate' },
    })
  }
  if (status === UGCPhotoStatus.REJECTED) {
    await captureServerEvent({
      event: 'maker_photo_rejected',
      distinctId: user.clerkId,
      properties: { photoId: photo.id, decidedBy: 'gate', reasons: verdict.reasons },
    })
  }

  return { ok: true, photoId: photo.id, status, reasons: verdict.reasons }
}

/**
 * "Ask us to look again". Puts a rejected photo in the appeal queue, which is
 * the only queue a person ever works.
 */
export async function requestPhotoAppeal(input: {
  photoId: string
  note?: string | null
}): Promise<ActionResult> {
  const { user, error } = await requireMember()
  if (!user) return { ok: false, error: error ?? 'Not signed in.' }

  const photo = await prisma.uGCPhoto.findUnique({
    where: { id: input.photoId },
    select: { id: true, userId: true, status: true, removedAt: true, appealRequestedAt: true },
  })
  if (!photo || photo.userId !== user.id) return { ok: false, error: 'Photo not found.' }
  if (photo.removedAt) return { ok: false, error: 'That photo has been removed.' }
  if (photo.status !== UGCPhotoStatus.REJECTED) {
    return { ok: false, error: 'Only a photo that was not accepted can be looked at again.' }
  }
  if (photo.appealRequestedAt) {
    return { ok: false, error: 'We are already looking at this one.' }
  }

  await prisma.uGCPhoto.update({
    where: { id: photo.id },
    data: {
      appealRequestedAt: new Date(),
      appealNote: input.note?.trim().slice(0, 500) || null,
    },
  })

  revalidatePath('/me/photos')
  revalidatePath('/admin/ugc-photos')
  await captureServerEvent({
    event: 'maker_photo_appealed',
    distinctId: user.clerkId,
    properties: { photoId: photo.id },
  })
  return { ok: true }
}

/**
 * Remove one of your own photos. Instant: `removedAt` takes it off every
 * surface, and every surface goes through the same visibility rule.
 */
export async function removeMakerPhoto(input: { photoId: string }): Promise<ActionResult> {
  const { user, error } = await requireMember()
  if (!user) return { ok: false, error: error ?? 'Not signed in.' }

  const photo = await prisma.uGCPhoto.findUnique({
    where: { id: input.photoId },
    select: {
      id: true,
      userId: true,
      removedAt: true,
      tutorialId: true,
      patternId: true,
      patternType: true,
    },
  })
  if (!photo || photo.userId !== user.id) return { ok: false, error: 'Photo not found.' }
  if (photo.removedAt) return { ok: true }

  await prisma.uGCPhoto.update({
    where: { id: photo.id },
    data: { removedAt: new Date(), isFeatured: false, isHero: false },
  })

  const target: PhotoTarget | null = photo.tutorialId
    ? { kind: 'tutorial', tutorialId: photo.tutorialId }
    : photo.patternId && photo.patternType
      ? { kind: 'pattern', patternId: photo.patternId, patternType: photo.patternType }
      : null
  const resolved = target ? await resolveTarget(target) : null
  if (resolved?.path) revalidatePath(resolved.path)
  revalidatePath('/me/photos')
  revalidatePath('/')
  if (user.displayHandle) revalidatePath(`/m/${user.displayHandle}`)

  await audit({
    actorId: user.id,
    action: 'maker_photo.removed',
    resource: `UGCPhoto:${photo.id}`,
    metadata: {},
  })
  await captureServerEvent({
    event: 'maker_photo_removed',
    distinctId: user.clerkId,
    properties: { photoId: photo.id, removedBy: 'maker' },
  })
  return { ok: true }
}

/** "Use my photos in Homemade's promotion" in settings. */
export async function setPhotoPromotionAllowed(value: boolean): Promise<ActionResult> {
  const { user, error } = await requireMember()
  if (!user) return { ok: false, error: error ?? 'Not signed in.' }
  const next = Boolean(value)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { allowPhotoPromotion: next },
    }),
    // Bring existing photos in line — the toggle reads as "my photos", not
    // "photos I upload from now on".
    prisma.uGCPhoto.updateMany({
      where: { userId: user.id },
      data: { promotionAllowed: next },
    }),
  ])

  revalidatePath('/me/settings')
  await captureServerEvent({
    event: next ? 'photo_promotion_opted_in' : 'photo_promotion_opted_out',
    distinctId: user.clerkId,
    properties: {},
  })
  return { ok: true }
}

/** The tester agreement checkbox at /me/tester/apply. */
export async function acceptTesterAgreement(): Promise<ActionResult> {
  const { user, error } = await requireMember()
  if (!user) return { ok: false, error: error ?? 'Not signed in.' }
  if (user.testerAgreementAt) return { ok: true }

  await prisma.user.update({
    where: { id: user.id },
    data: { testerAgreementAt: new Date() },
  })
  await audit({
    actorId: user.id,
    action: 'tester.agreement_accepted',
    resource: `User:${user.id}`,
    metadata: {},
  })
  revalidatePath('/me/tester/apply')
  return { ok: true }
}

/**
 * Run the gate again over a photo that is still waiting. A "pending" photo is
 * one the gate could not judge (no key, a network failure, an unparseable
 * reply), and nothing retries on its own, so this is how a person unsticks one
 * rather than leaving a maker looking at "Checking your photo" for good.
 */
export async function rerunPhotoGate(input: { photoId: string }): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })

  const photo = await prisma.uGCPhoto.findUnique({
    where: { id: input.photoId },
    select: {
      id: true,
      status: true,
      removedAt: true,
      tutorialId: true,
      patternId: true,
      patternType: true,
      media: { select: { r2Key: true } },
    },
  })
  if (!photo) return { ok: false, error: 'Photo not found.' }
  if (photo.removedAt) return { ok: false, error: 'That photo has been removed.' }
  if (photo.status !== UGCPhotoStatus.PENDING_MODERATION) {
    return { ok: false, error: 'That photo already has a verdict.' }
  }

  const target: PhotoTarget | null = photo.tutorialId
    ? { kind: 'tutorial', tutorialId: photo.tutorialId }
    : photo.patternId && photo.patternType
      ? { kind: 'pattern', patternId: photo.patternId, patternType: photo.patternType }
      : null
  const resolved = target ? await resolveTarget(target) : null
  if (!resolved) return { ok: false, error: 'We could not find what this photo belongs to.' }

  const uploaded = await fetchImage(mediaUrl({ r2Key: photo.media.r2Key }, 'public'))
  if (!uploaded) return { ok: false, error: 'The image could not be fetched. Try again later.' }

  const reference = resolved.referenceImageUrl
    ? await fetchImage(resolved.referenceImageUrl)
    : null
  const verdict = await gateMakerPhoto({
    photo: uploaded.buffer,
    photoMediaType: uploaded.mediaType,
    itemTitle: resolved.title,
    itemKind: resolved.kind,
    reference,
  })

  if (verdict.decision === 'pending') {
    return { ok: false, error: 'The gate still could not judge it. Try again later.' }
  }

  const approved = verdict.decision === 'approve'
  await prisma.uGCPhoto.update({
    where: { id: photo.id },
    data: {
      status: approved ? UGCPhotoStatus.APPROVED : UGCPhotoStatus.REJECTED,
      gateVerdict: { decision: verdict.decision, reasons: verdict.reasons },
      gateModel: verdict.model,
      rejectionReason: approved ? null : verdict.reasons.join(' '),
      moderatedAt: new Date(),
    },
  })

  await audit({
    actorId: actor.id,
    action: 'maker_photo.gate_rerun',
    resource: `UGCPhoto:${photo.id}`,
    metadata: { decision: verdict.decision },
  })

  if (resolved.path) revalidatePath(resolved.path)
  revalidatePath('/admin/ugc-photos')
  revalidatePath('/me/photos')
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Appeal decisions — admin
// ────────────────────────────────────────────────────────────────────────────

/**
 * Decide one appeal. This is the only place a person overrides the gate.
 * Rejecting needs a reason, because the member sees it.
 */
export async function decidePhotoAppeal(input: {
  photoId: string
  action: 'APPROVE' | 'REJECT'
  reason?: string | null
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })

  const photo = await prisma.uGCPhoto.findUnique({
    where: { id: input.photoId },
    select: {
      id: true,
      userId: true,
      appealRequestedAt: true,
      tutorialId: true,
      patternId: true,
      patternType: true,
    },
  })
  if (!photo) return { ok: false, error: 'Photo not found.' }
  if (!photo.appealRequestedAt) return { ok: false, error: 'That photo is not in the queue.' }

  const reason = input.reason?.trim() ?? ''
  if (input.action === 'REJECT' && !reason) {
    return { ok: false, error: 'Give a short reason so the maker knows why.' }
  }

  const approved = input.action === 'APPROVE'
  await prisma.uGCPhoto.update({
    where: { id: photo.id },
    data: {
      status: approved ? UGCPhotoStatus.APPROVED : UGCPhotoStatus.REJECTED,
      rejectionReason: approved ? null : reason,
      appealRequestedAt: null,
      moderatedAt: new Date(),
      moderatedById: actor.id,
    },
  })

  const target: PhotoTarget | null = photo.tutorialId
    ? { kind: 'tutorial', tutorialId: photo.tutorialId }
    : photo.patternId && photo.patternType
      ? { kind: 'pattern', patternId: photo.patternId, patternType: photo.patternType }
      : null
  const resolved = target ? await resolveTarget(target) : null

  await audit({
    actorId: actor.id,
    action: approved ? 'maker_photo.appeal_approved' : 'maker_photo.appeal_rejected',
    resource: `UGCPhoto:${photo.id}`,
    metadata: { reason },
  })
  await notify({
    userId: photo.userId,
    type: approved ? NotificationType.PHOTO_APPROVED : NotificationType.PHOTO_REJECTED,
    body: approved
      ? `We looked again at your photo of ${resolved?.title ?? 'your make'}. It is on the site now.`
      : `We looked again at your photo of ${resolved?.title ?? 'your make'}. ${reason}`,
    href: '/me/photos',
  })
  await captureServerEvent({
    event: approved ? 'maker_photo_approved' : 'maker_photo_rejected',
    distinctId: photo.userId,
    properties: { photoId: photo.id, decidedBy: 'appeal' },
  })

  revalidatePath('/admin/ugc-photos')
  revalidatePath('/me/photos')
  if (resolved?.path) revalidatePath(resolved.path)
  return { ok: true }
}
