'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@homemade/db'
import { audit } from './audit'
import { requireAdminRole } from './get-current-user'

type ActionResult = { ok: true } | { ok: false; error: string }

/**
 * Compute the [start, end) bounds of the calendar month containing `at`.
 * monthStart is the first instant of the month in UTC; monthEnd is the
 * last instant (23:59:59.999) of the same month.
 */
function monthBounds(at: Date): { monthStart: Date; monthEnd: Date } {
  const monthStart = new Date(
    Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), 1, 0, 0, 0, 0),
  )
  const monthEnd = new Date(
    Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 0, 23, 59, 59, 999),
  )
  return { monthStart, monthEnd }
}

/**
 * Set (or replace) the Maker of the Month for the calendar month
 * containing `monthAt`. If a row already exists with the same monthStart
 * (uniqueness constraint), it's overwritten in place.
 */
export async function setMakerOfTheMonth(input: {
  handle: string
  featuredReason: string
  /** ISO date string for any day in the target month; defaults to today.
      Lets an admin pre-set next month from this month. */
  monthAt?: string
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })

  const handle = input.handle.trim().toLowerCase()
  const reason = input.featuredReason.trim().slice(0, 500)
  if (!handle) return { ok: false, error: 'Pick a Maker.' }
  if (!reason) return { ok: false, error: 'Add a short reason note.' }

  const maker = await prisma.user.findUnique({
    where: { displayHandle: handle },
    select: {
      id: true,
      displayHandle: true,
      name: true,
      isPublicMakerProfile: true,
    },
  })
  if (!maker) return { ok: false, error: 'No Maker with that handle.' }
  if (!maker.isPublicMakerProfile) {
    return {
      ok: false,
      error: 'That Maker has a private profile. Ask them to make it public first.',
    }
  }

  const at = input.monthAt ? new Date(input.monthAt) : new Date()
  if (Number.isNaN(at.getTime())) {
    return { ok: false, error: 'Invalid month date.' }
  }
  const { monthStart, monthEnd } = monthBounds(at)

  const existing = await prisma.makerOfTheMonth.findUnique({
    where: { monthStart },
  })

  if (existing) {
    await prisma.makerOfTheMonth.update({
      where: { id: existing.id },
      data: {
        userId: maker.id,
        featuredReason: reason,
        createdByUserId: actor.id,
        monthEnd,
      },
    })
  } else {
    await prisma.makerOfTheMonth.create({
      data: {
        userId: maker.id,
        featuredReason: reason,
        createdByUserId: actor.id,
        monthStart,
        monthEnd,
      },
    })
  }

  await audit({
    actorId: actor.id,
    action: 'maker_of_the_month.set',
    resource: `User:${maker.id}`,
    metadata: {
      monthStart: monthStart.toISOString(),
      monthEnd: monthEnd.toISOString(),
      replaced: Boolean(existing),
      reason,
    },
  })

  revalidatePath('/admin/community/maker-of-the-month')
  revalidatePath('/')
  if (maker.displayHandle) {
    revalidatePath(`/m/${maker.displayHandle}`)
  }
  return { ok: true }
}

export async function clearMakerOfTheMonth(input: {
  id: string
}): Promise<ActionResult> {
  const actor = await requireAdminRole({ minimum: 'EDITOR' })

  const row = await prisma.makerOfTheMonth.findUnique({
    where: { id: input.id },
    include: { user: { select: { displayHandle: true } } },
  })
  if (!row) return { ok: false, error: 'Not found.' }

  await prisma.makerOfTheMonth.delete({ where: { id: row.id } })

  await audit({
    actorId: actor.id,
    action: 'maker_of_the_month.cleared',
    resource: `MakerOfTheMonth:${row.id}`,
    metadata: { monthStart: row.monthStart.toISOString() },
  })

  revalidatePath('/admin/community/maker-of-the-month')
  revalidatePath('/')
  if (row.user.displayHandle) {
    revalidatePath(`/m/${row.user.displayHandle}`)
  }
  return { ok: true }
}
