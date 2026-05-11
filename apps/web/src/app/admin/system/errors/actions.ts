'use server'

import { requireAdminRole } from '@/lib/get-current-user'

/**
 * Temporary smoke-test action used to confirm Sentry is wired end-to-end.
 * Throws an error with a recognisable message. Remove after the first
 * deploy that confirms Sentry catches it.
 */
export async function throwSentryTestError(): Promise<void> {
  await requireAdminRole({ minimum: 'ADMIN' })
  throw new Error(
    `Sentry smoke test — deliberate throw at ${new Date().toISOString()}`,
  )
}
