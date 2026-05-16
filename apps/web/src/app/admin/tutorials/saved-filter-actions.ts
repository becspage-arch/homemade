'use server'

import { revalidatePath } from 'next/cache'
import { prisma, UserRole } from '@homemade/db'
import { getCurrentDbUser, hasRoleAtLeast } from '@/lib/auth'

export async function createSavedFilter(formData: FormData): Promise<void> {
  const actor = await getCurrentDbUser()
  if (!actor || !hasRoleAtLeast(actor, UserRole.CREATOR)) {
    throw new Error('Not authorised.')
  }

  const name = String(formData.get('name') ?? '').trim()
  const filterQueryRaw = String(formData.get('filterQuery') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim() || null

  if (!name) throw new Error('Filter name is required.')

  // Store the raw URL search string as the filterQuery JSON value. Cheap to
  // round-trip into URLSearchParams when applying.
  const filterQuery = { search: filterQueryRaw }

  await prisma.savedFilter.create({
    data: {
      userId: actor.id,
      name,
      description,
      filterQuery: filterQuery as never,
    },
  })

  revalidatePath('/admin/tutorials')
}

export async function deleteSavedFilter(id: string): Promise<void> {
  const actor = await getCurrentDbUser()
  if (!actor) throw new Error('Not authorised.')

  const filter = await prisma.savedFilter.findUnique({ where: { id } })
  if (!filter) return
  if (filter.userId !== actor.id) {
    throw new Error('Saved filters can only be deleted by their owner.')
  }

  await prisma.savedFilter.delete({ where: { id } })
  revalidatePath('/admin/tutorials')
}
