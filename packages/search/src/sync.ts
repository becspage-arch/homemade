/**
 * Server-side sync helpers — called from admin server actions after a Prisma
 * write. Fire-and-forget by design: if Typesense is down or unconfigured, an
 * admin save should not fail. We catch and log instead.
 *
 * Callers can `await` for ordering inside a server action, but should not
 * `throw` on failure: wrap each call in its own try/catch or just await with
 * intent to swallow.
 */

import type { Client } from 'typesense'
import { getAdminClient } from './client'
import type {
  CategoryDoc,
  GlossaryDoc,
  TutorialDoc,
} from './schemas'
import {
  CATEGORIES_COLLECTION,
  GLOSSARY_COLLECTION,
  TUTORIALS_COLLECTION,
} from './schemas'

function logFailure(scope: string, err: unknown): void {
  // Keep logging cheap and consistent. Server actions run in the Next.js
  // server runtime, so console.warn is captured by CloudWatch.
  // eslint-disable-next-line no-console
  console.warn(`[search] ${scope} failed`, err)
}

async function upsertDoc<T extends { id: string }>(
  client: Client,
  collection: string,
  doc: T,
): Promise<void> {
  await client.collections(collection).documents().upsert(doc as Record<string, unknown>)
}

async function removeDoc(
  client: Client,
  collection: string,
  id: string,
): Promise<void> {
  try {
    await client.collections(collection).documents(id).delete()
  } catch (err) {
    // Typesense returns 404 when the doc doesn't exist — fine.
    if (isNotFound(err)) return
    throw err
  }
}

function isNotFound(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const status = (err as { httpStatus?: number }).httpStatus
  return status === 404
}

// ────────────────────────────────────────────────────────────────────────────
// Tutorials
// ────────────────────────────────────────────────────────────────────────────

export async function syncTutorialDoc(doc: TutorialDoc): Promise<void> {
  const client = getAdminClient()
  if (!client) return
  try {
    await upsertDoc(client, TUTORIALS_COLLECTION, doc)
  } catch (err) {
    logFailure(`tutorial.upsert(${doc.id})`, err)
  }
}

export async function removeTutorialFromSearch(id: string): Promise<void> {
  const client = getAdminClient()
  if (!client) return
  try {
    await removeDoc(client, TUTORIALS_COLLECTION, id)
  } catch (err) {
    logFailure(`tutorial.remove(${id})`, err)
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Categories
// ────────────────────────────────────────────────────────────────────────────

export async function syncCategoryDoc(doc: CategoryDoc): Promise<void> {
  const client = getAdminClient()
  if (!client) return
  try {
    await upsertDoc(client, CATEGORIES_COLLECTION, doc)
  } catch (err) {
    logFailure(`category.upsert(${doc.id})`, err)
  }
}

export async function removeCategoryFromSearch(id: string): Promise<void> {
  const client = getAdminClient()
  if (!client) return
  try {
    await removeDoc(client, CATEGORIES_COLLECTION, id)
  } catch (err) {
    logFailure(`category.remove(${id})`, err)
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Glossary
// ────────────────────────────────────────────────────────────────────────────

export async function syncGlossaryDoc(doc: GlossaryDoc): Promise<void> {
  const client = getAdminClient()
  if (!client) return
  try {
    await upsertDoc(client, GLOSSARY_COLLECTION, doc)
  } catch (err) {
    logFailure(`glossary.upsert(${doc.id})`, err)
  }
}

export async function removeGlossaryFromSearch(id: string): Promise<void> {
  const client = getAdminClient()
  if (!client) return
  try {
    await removeDoc(client, GLOSSARY_COLLECTION, id)
  } catch (err) {
    logFailure(`glossary.remove(${id})`, err)
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Bootstrap (used by the backfill script)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Ensure all three collections exist. Idempotent: if a collection is already
 * present it's left alone (we don't auto-mutate schemas). Returns the list of
 * created collection names.
 */
export async function ensureCollections(
  schemas: import('typesense/lib/Typesense/Collections.js').CollectionCreateSchema[],
): Promise<string[]> {
  const client = getAdminClient()
  if (!client) throw new Error('Typesense admin client is not configured.')
  const created: string[] = []
  for (const schema of schemas) {
    try {
      await client.collections(schema.name).retrieve()
    } catch (err) {
      if (!isNotFound(err)) throw err
      await client.collections().create(schema)
      created.push(schema.name)
    }
  }
  return created
}

/** Drop a collection if it exists. Used by the wipe-and-rebuild backfill. */
export async function dropCollection(name: string): Promise<void> {
  const client = getAdminClient()
  if (!client) throw new Error('Typesense admin client is not configured.')
  try {
    await client.collections(name).delete()
  } catch (err) {
    if (isNotFound(err)) return
    throw err
  }
}

export async function bulkImport<T extends { id: string }>(
  collection: string,
  docs: T[],
): Promise<void> {
  const client = getAdminClient()
  if (!client) throw new Error('Typesense admin client is not configured.')
  if (docs.length === 0) return
  await client
    .collections(collection)
    .documents()
    .import(docs as Record<string, unknown>[], { action: 'upsert' })
}
