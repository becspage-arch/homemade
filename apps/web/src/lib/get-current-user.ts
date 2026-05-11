import 'server-only'
import { currentUser } from '@clerk/nextjs/server'
import { prisma, UserRole, type User } from '@homemade/db'

/**
 * Pre-launch admin allowlist. Any email here gets ADMIN role on first sign-in.
 * Anyone else lands as MEMBER. Eventually replaced with admin-controlled role
 * assignment from the dashboard.
 */
const ADMIN_EMAILS = new Set(['rebecca@homemade.education'])

function deriveRoleFromEmail(email: string): UserRole {
  return ADMIN_EMAILS.has(email.toLowerCase()) ? UserRole.ADMIN : UserRole.MEMBER
}

/**
 * Returns the Prisma `User` row for the currently signed-in Clerk user,
 * creating it on first access (just-in-time provisioning).
 *
 * We could mirror users via a Clerk webhook instead, but JIT means the app
 * works whether or not a webhook is wired and the User row is always at most
 * one Clerk call old.
 */
export async function getCurrentDbUser(): Promise<User | null> {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const email = clerkUser.emailAddresses[0]?.emailAddress
  if (!email) return null

  const existing = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } })
  if (existing) return existing

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim() || null

  return prisma.user.create({
    data: {
      clerkId: clerkUser.id,
      email: email.toLowerCase(),
      name,
      role: deriveRoleFromEmail(email),
    },
  })
}

export function isAdmin(user: { role: UserRole } | null | undefined): boolean {
  return user?.role === UserRole.ADMIN
}
