'use client'

/**
 * IndexedDB-backed local-only pattern + progress store for logged-out
 * users. We never invent server identity for an anonymous reader —
 * their edits stay on-device. The same id space (Pattern.id) is reused
 * so a future "sign in to keep your progress" flow can lift the local
 * record into the server table without remapping anything.
 *
 * Two stores live inside one IDB database:
 *
 *   patterns   — { id, data, name, updatedAt }
 *   progress   — { patternId, stitchedCells, updatedAt }
 */

import { openDB, type IDBPDatabase } from 'idb'
import type { PatternData } from '@homemade/db'

const DB_NAME = 'homemade-studio'
const DB_VERSION = 1

interface StudioDB {
  patterns: { id: string; data: PatternData; updatedAt: number }
  progress: { patternId: string; stitchedCells: Record<string, true>; updatedAt: number }
}

let dbPromise: Promise<IDBPDatabase> | null = null

function db() {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is only available client-side')
  }
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('patterns')) {
          db.createObjectStore('patterns', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'patternId' })
        }
      },
    })
  }
  return dbPromise
}

export async function putLocalPattern(id: string, data: PatternData): Promise<void> {
  const d = await db()
  await d.put('patterns', { id, data, updatedAt: Date.now() })
}

export async function getLocalPattern(id: string): Promise<PatternData | null> {
  const d = await db()
  const row = (await d.get('patterns', id)) as StudioDB['patterns'] | undefined
  return row?.data ?? null
}

export async function putLocalProgress(patternId: string, stitchedCells: Record<string, true>): Promise<void> {
  const d = await db()
  await d.put('progress', { patternId, stitchedCells, updatedAt: Date.now() })
}

export async function getLocalProgress(patternId: string): Promise<Record<string, true> | null> {
  const d = await db()
  const row = (await d.get('progress', patternId)) as StudioDB['progress'] | undefined
  return row?.stitchedCells ?? null
}
