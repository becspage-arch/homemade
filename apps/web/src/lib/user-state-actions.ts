'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma, UserProjectStatus } from '@homemade/db'
import { audit } from './audit'
import { getCurrentDbUser } from './get-current-user'

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
  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } })
    bookmarked = false
  } else {
    await prisma.bookmark.create({
      data: { userId: user.id, tutorialId },
    })
    bookmarked = true
  }

  revalidatePath(`/${tutorial.category.slug}/${tutorial.slug}`)
  revalidatePath('/me')
  revalidatePath('/me/bookmarks')
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

  let project
  if (existing) {
    // Resume rather than re-create — keeps notes / supplies state intact.
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
    project = await prisma.userProject.create({
      data: {
        userId: user.id,
        tutorialId,
        status: UserProjectStatus.IN_PROGRESS,
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

  await prisma.userProject.update({
    where: { id: project.id },
    data: {
      status: UserProjectStatus.COMPLETED,
      completedAt: new Date(),
      abandonedAt: null,
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
