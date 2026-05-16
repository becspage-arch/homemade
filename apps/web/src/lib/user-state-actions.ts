'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma, UserProjectStatus } from '@homemade/db'
import { audit } from './audit'
import { getCurrentDbUser } from './get-current-user'
import { captureServerEvent } from './posthog'

/**
 * Caller-facing result shape. Server actions return a plain object so client
 * components can act on the result without throwing.
 */
type ActionResult = { ok: true } | { ok: false; error: string }

async function requireUser() {
  const user = await getCurrentDbUser()
  if (!user) redirect('/sign-in')
  return user
}

// ────────────────────────────────────────────────────────────────────────────
// Bookmarks
// ────────────────────────────────────────────────────────────────────────────

export async function toggleBookmark(tutorialId: string): Promise<
  ActionResult & { bookmarked?: boolean }
> {
  const user = await requireUser()
  const tutorial = await prisma.tutorial.findUnique({
    where: { id: tutorialId },
    select: { id: true, slug: true, category: { select: { slug: true } } },
  })
  if (!tutorial) return { ok: false, error: 'Tutorial not found' }

  const existing = await prisma.bookmark.findUnique({
    where: { userId_tutorialId: { userId: user.id, tutorialId } },
    select: { id: true },
  })

  let bookmarked: boolean
  let isFirstBookmark = false
  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } })
    bookmarked = false
  } else {
    // Is this the user's very first bookmark? Check before creating so
    // `first_bookmark` fires exactly once per user across their lifetime.
    const priorCount = await prisma.bookmark.count({ where: { userId: user.id } })
    isFirstBookmark = priorCount === 0
    await prisma.bookmark.create({
      data: { userId: user.id, tutorialId },
    })
    bookmarked = true
  }

  revalidatePath(`/${tutorial.category.slug}/${tutorial.slug}`)
  revalidatePath('/me')
  revalidatePath('/me/bookmarks')
  await captureServerEvent({
    event: bookmarked ? 'tutorial_bookmarked' : 'tutorial_unbookmarked',
    distinctId: user.clerkId,
    properties: { tutorialId },
  })
  if (bookmarked && isFirstBookmark) {
    await captureServerEvent({
      event: 'first_bookmark',
      distinctId: user.clerkId,
      properties: { tutorialId, isFirst: true },
    })
  }
  return { ok: true, bookmarked }
}

// ────────────────────────────────────────────────────────────────────────────
// Projects — lifecycle
// ────────────────────────────────────────────────────────────────────────────

export async function startProject(tutorialId: string): Promise<
  ActionResult & { projectId?: string }
> {
  const user = await requireUser()
  const tutorial = await prisma.tutorial.findUnique({
    where: { id: tutorialId },
    select: { id: true, slug: true, category: { select: { slug: true } } },
  })
  if (!tutorial) return { ok: false, error: 'Tutorial not found' }

  const existing = await prisma.userProject.findUnique({
    where: { userId_tutorialId: { userId: user.id, tutorialId } },
    select: { id: true, status: true },
  })

  // First-project? Check before insert/update so we can fire `first_project_started`
  // exactly once per user.
  const priorProjectCount = existing
    ? 1 // resume implies the user already has at least one project
    : await prisma.userProject.count({ where: { userId: user.id } })
  const isFirstProject = !existing && priorProjectCount === 0

  let project
  if (existing) {
    // Resume rather than re-create — keeps notes / supplies state intact.
    // Also keeps any in-flight schedule cursor; the user picks up where they
    // were on the multi-day arc.
    project = await prisma.userProject.update({
      where: { id: existing.id },
      data: {
        status: UserProjectStatus.IN_PROGRESS,
        completedAt: null,
        abandonedAt: null,
        lastViewedAt: new Date(),
      },
      select: { id: true },
    })
  } else {
    // Snapshot the first ProjectSchedule step (if any) onto the new
    // UserProject so the homepage's "Today's scheduled project actions" rail
    // can surface the right day without re-deriving from the schedule on
    // every request.
    const startedAt = new Date()
    const firstStep = await prisma.projectSchedule.findFirst({
      where: { tutorialId },
      orderBy: { stepNumber: 'asc' },
      select: { stepNumber: true, offsetDays: true },
    })
    const nextScheduledAt = firstStep
      ? new Date(startedAt.getTime() + firstStep.offsetDays * 86_400_000)
      : null

    project = await prisma.userProject.create({
      data: {
        userId: user.id,
        tutorialId,
        status: UserProjectStatus.IN_PROGRESS,
        startedAt,
        nextScheduledStepNumber: firstStep?.stepNumber ?? null,
        nextScheduledAt,
      },
      select: { id: true },
    })
  }

  await audit({
    actorId: user.id,
    action: existing ? 'project.resume' : 'project.start',
    resource: `UserProject:${project.id}`,
    metadata: { tutorialId },
  })

  revalidatePath(`/${tutorial.category.slug}/${tutorial.slug}`)
  revalidatePath('/me')
  revalidatePath('/me/projects')
  await captureServerEvent({
    event: 'tutorial_started',
    distinctId: user.clerkId,
    properties: { tutorialId, projectId: project.id, resumed: Boolean(existing) },
  })
  if (isFirstProject) {
    await captureServerEvent({
      event: 'first_project_started',
      distinctId: user.clerkId,
      properties: { tutorialId, projectId: project.id, isFirst: true },
    })
  }
  return { ok: true, projectId: project.id }
}

async function loadProjectForUser(projectId: string, userId: string) {
  return prisma.userProject.findFirst({
    where: { id: projectId, userId },
    select: {
      id: true,
      tutorialId: true,
      tutorial: {
        select: { slug: true, category: { select: { slug: true } } },
      },
    },
  })
}

export async function markProjectComplete(projectId: string): Promise<ActionResult> {
  const user = await requireUser()
  const project = await loadProjectForUser(projectId, user.id)
  if (!project) return { ok: false, error: 'Project not found' }

  // Look up startedAt so we can derive timeToCompleteMinutes for the event.
  const before = await prisma.userProject.findUnique({
    where: { id: project.id },
    select: { startedAt: true },
  })
  const completedAt = new Date()
  const timeToCompleteMinutes = before?.startedAt
    ? Math.max(0, Math.round((completedAt.getTime() - before.startedAt.getTime()) / 60000))
    : null

  // First-completed? Count prior completions before flipping this one.
  const priorCompleted = await prisma.userProject.count({
    where: {
      userId: user.id,
      status: UserProjectStatus.COMPLETED,
      id: { not: project.id },
    },
  })
  const isFirstCompletion = priorCompleted === 0

  await prisma.userProject.update({
    where: { id: project.id },
    data: {
      status: UserProjectStatus.COMPLETED,
      completedAt,
      abandonedAt: null,
      // Schedule cursor cleared on completion so the homepage stops surfacing
      // step cards for a finished project.
      nextScheduledStepNumber: null,
      nextScheduledAt: null,
    },
  })
  await audit({
    actorId: user.id,
    action: 'project.complete',
    resource: `UserProject:${project.id}`,
    metadata: { tutorialId: project.tutorialId },
  })
  revalidatePath(`/${project.tutorial.category.slug}/${project.tutorial.slug}`)
  revalidatePath('/me')
  revalidatePath('/me/projects')
  revalidatePath(`/me/projects/${project.id}`)
  await captureServerEvent({
    event: 'tutorial_completed',
    distinctId: user.clerkId,
    properties: {
      tutorialId: project.tutorialId,
      projectId: project.id,
      timeToCompleteMinutes,
    },
  })
  if (isFirstCompletion) {
    await captureServerEvent({
      event: 'first_project_completed',
      distinctId: user.clerkId,
      properties: {
        tutorialId: project.tutorialId,
        projectId: project.id,
        isFirst: true,
      },
    })
  }
  return { ok: true }
}

export async function abandonProject(projectId: string): Promise<ActionResult> {
  const user = await requireUser()
  const project = await loadProjectForUser(projectId, user.id)
  if (!project) return { ok: false, error: 'Project not found' }

  await prisma.userProject.update({
    where: { id: project.id },
    data: {
      status: UserProjectStatus.ABANDONED,
      abandonedAt: new Date(),
      completedAt: null,
      nextScheduledStepNumber: null,
      nextScheduledAt: null,
    },
  })
  await audit({
    actorId: user.id,
    action: 'project.abandon',
    resource: `UserProject:${project.id}`,
    metadata: { tutorialId: project.tutorialId },
  })
  revalidatePath(`/${project.tutorial.category.slug}/${project.tutorial.slug}`)
  revalidatePath('/me')
  revalidatePath('/me/projects')
  revalidatePath(`/me/projects/${project.id}`)
  await captureServerEvent({
    event: 'project_abandoned',
    distinctId: user.clerkId,
    properties: { projectId: project.id, tutorialId: project.tutorialId },
  })
  return { ok: true }
}

export async function resumeProject(projectId: string): Promise<ActionResult> {
  const user = await requireUser()
  const project = await loadProjectForUser(projectId, user.id)
  if (!project) return { ok: false, error: 'Project not found' }

  await prisma.userProject.update({
    where: { id: project.id },
    data: {
      status: UserProjectStatus.IN_PROGRESS,
      completedAt: null,
      abandonedAt: null,
      lastViewedAt: new Date(),
    },
  })
  await audit({
    actorId: user.id,
    action: 'project.resume',
    resource: `UserProject:${project.id}`,
    metadata: { tutorialId: project.tutorialId },
  })
  revalidatePath(`/${project.tutorial.category.slug}/${project.tutorial.slug}`)
  revalidatePath('/me')
  revalidatePath('/me/projects')
  revalidatePath(`/me/projects/${project.id}`)
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Projects — high-volume editing actions (not audit-logged)
// ────────────────────────────────────────────────────────────────────────────

export async function updateProjectNotes(
  projectId: string,
  notes: string,
): Promise<ActionResult> {
  const user = await requireUser()
  const exists = await prisma.userProject.findFirst({
    where: { id: projectId, userId: user.id },
    select: { id: true },
  })
  if (!exists) return { ok: false, error: 'Project not found' }

  // Cap notes length so a runaway client can't fill the column.
  const trimmed = notes.slice(0, 20_000)
  await prisma.userProject.update({
    where: { id: exists.id },
    data: { notes: trimmed },
  })
  // Caller (project-notes.tsx) debounces, so this fires at the caller's
  // cadence — typically once per minute per project per user.
  await captureServerEvent({
    event: 'project_notes_updated',
    distinctId: user.clerkId,
    properties: { projectId: exists.id },
  })
  return { ok: true }
}

export async function toggleSupplyChecked(
  projectId: string,
  supplyKey: string,
): Promise<ActionResult & { checked?: boolean }> {
  const user = await requireUser()
  const project = await prisma.userProject.findFirst({
    where: { id: projectId, userId: user.id },
    select: { id: true, suppliesChecked: true },
  })
  if (!project) return { ok: false, error: 'Project not found' }

  const current = Array.isArray(project.suppliesChecked)
    ? (project.suppliesChecked as string[]).filter((s) => typeof s === 'string')
    : []
  const has = current.includes(supplyKey)
  const next = has ? current.filter((s) => s !== supplyKey) : [...current, supplyKey]

  await prisma.userProject.update({
    where: { id: project.id },
    data: { suppliesChecked: next },
  })
  await captureServerEvent({
    event: 'project_supplies_checked',
    distinctId: user.clerkId,
    properties: { projectId: project.id, checked: !has },
  })
  return { ok: true, checked: !has }
}

export async function updateReadingProgress(
  projectId: string,
  percent: number,
): Promise<ActionResult> {
  const user = await requireUser()
  const exists = await prisma.userProject.findFirst({
    where: { id: projectId, userId: user.id },
    select: { id: true },
  })
  if (!exists) return { ok: false, error: 'Project not found' }

  const clamped = Math.max(0, Math.min(100, Math.round(percent)))
  await prisma.userProject.update({
    where: { id: exists.id },
    data: { readingProgressPercent: clamped, lastViewedAt: new Date() },
  })
  // Caller (reading-progress.tsx) throttles to once every 5s + on unmount.
  await captureServerEvent({
    event: 'project_progress_updated',
    distinctId: user.clerkId,
    properties: { projectId: exists.id, percent: clamped },
  })
  return { ok: true }
}

// ────────────────────────────────────────────────────────────────────────────
// Profile / settings
// ────────────────────────────────────────────────────────────────────────────

export async function updateBeginnerMode(value: boolean): Promise<ActionResult> {
  const user = await requireUser()
  await prisma.user.update({
    where: { id: user.id },
    data: { beginnerMode: Boolean(value) },
  })
  revalidatePath('/me/settings')
  await captureServerEvent({
    event: 'beginner_mode_toggled',
    distinctId: user.clerkId,
    properties: { value: Boolean(value) },
  })
  return { ok: true }
}

export async function updateCookingModeAutoEnable(
  value: boolean,
): Promise<ActionResult> {
  const user = await requireUser()
  await prisma.user.update({
    where: { id: user.id },
    data: { cookingModeAutoEnable: Boolean(value) },
  })
  revalidatePath('/me/settings')
  return { ok: true }
}

const HANDLE_RE = /^[a-z0-9](?:[a-z0-9_-]{1,30}[a-z0-9])?$/

export async function updateProfile(input: {
  displayHandle: string | null
  bio: string | null
}): Promise<ActionResult> {
  const user = await requireUser()

  let displayHandle: string | null = null
  if (input.displayHandle !== null) {
    const raw = input.displayHandle.trim().toLowerCase()
    if (raw.length > 0) {
      if (!HANDLE_RE.test(raw)) {
        return {
          ok: false,
          error: 'Handle must be 2-32 characters: lowercase letters, numbers, dashes or underscores.',
        }
      }
      const clash = await prisma.user.findFirst({
        where: { displayHandle: raw, NOT: { id: user.id } },
        select: { id: true },
      })
      if (clash) return { ok: false, error: 'That handle is taken.' }
      displayHandle = raw
    }
  }

  const bio = input.bio?.trim().slice(0, 280) || null

  await prisma.user.update({
    where: { id: user.id },
    data: { displayHandle, bio },
  })

  revalidatePath('/me/settings')
  return { ok: true }
}
