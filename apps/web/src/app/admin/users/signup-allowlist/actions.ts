'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma, UserRole } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { captureServerEvent, flushPostHog } from '@/lib/posthog'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function requireAdminActor() {
  const user = await getCurrentDbUser()
  if (!user || !hasRoleAtLeast(user, UserRole.ADMIN)) {
    throw new Error('Not authorised.')
  }
  return user
}

interface ParsedInput {
  email: string
  note: string | null
}

function parse(formData: FormData): ParsedInput {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const noteRaw = String(formData.get('note') ?? '').trim()
  return { email, note: noteRaw || null }
}

export async function addAllowlistEntry(formData: FormData): Promise<void> {
  const actor = await requireAdminActor()
  const input = parse(formData)

  if (!input.email) throw new Error('Email is required.')
  if (!EMAIL_PATTERN.test(input.email)) {
    throw new Error('That doesn’t look like a valid email address.')
  }

  const existing = await prisma.signupAllowlist.findUnique({ where: { email: input.email } })
  if (existing) {
    throw new Error(`${input.email} is already on the allowlist.`)
  }

  const created = await prisma.signupAllowlist.create({
    data: {
      email: input.email,
      addedById: actor.id,
      note: input.note,
    },
  })

  await audit({
    actorId: actor.id,
    action: 'signup_allowlist.add',
    resource: `SignupAllowlist:${created.id}`,
    metadata: { email: created.email, noteProvided: Boolean(input.note) },
  })

  await captureServerEvent({
    event: 'signup_allowlist_email_added',
    distinctId: actor.id,
    properties: {
      addedBy: actor.id,
      noteWasProvided: Boolean(input.note),
    },
  })
  await flushPostHog()

  revalidatePath('/admin/users/signup-allowlist')
  redirect('/admin/users/signup-allowlist')
}

export async function removeAllowlistEntry(id: string): Promise<void> {
  const actor = await requireAdminActor()

  const existing = await prisma.signupAllowlist.findUnique({ where: { id } })
  if (!existing) throw new Error('Allowlist entry not found.')

  await prisma.signupAllowlist.delete({ where: { id } })

  await audit({
    actorId: actor.id,
    action: 'signup_allowlist.remove',
    resource: `SignupAllowlist:${id}`,
    metadata: { email: existing.email },
  })

  await captureServerEvent({
    event: 'signup_allowlist_email_removed',
    distinctId: actor.id,
    properties: { removedBy: actor.id },
  })
  await flushPostHog()

  revalidatePath('/admin/users/signup-allowlist')
}
