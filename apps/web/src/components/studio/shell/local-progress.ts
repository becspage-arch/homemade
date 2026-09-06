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
 *   progress   — { patternId, stitchedCells, parking, updatedAt }
 *
 * Parking preferences (mode, working direction, current line) ride in the
 * progress record rather than a store of their own: they are per-project
 * stitching state, they change on the same beat as progress, and the parked
 * positions themselves are derived, never stored.
 */

import { openDB, type IDBPDatabase } from 'idb'
import type { PatternData } from '@homemade/db/pattern'
import { parseParkingDirection, type ParkingDirection } from '@/lib/studio/parking'

const DB_NAME = 'homemade-studio'
const DB_VERSION = 1

/** Per-project parking preferences. Derived state (which square each colour
 *  is parked in) is never stored: it is recomputed from progress plus the
 *  working order, so it can never drift out of step with either. */
export interface LocalParkingPrefs {
  enabled: boolean
  direction: ParkingDirection
  line: number
}

interface StudioDB {
  patterns: { id: string; data: PatternData; updatedAt: number }
  progress: {
    patternId: string
    stitchedCells: Record<string, true>
    parking?: LocalParkingPrefs
    updatedAt: number
  }
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

export async function putLocalProgress(
  patternId: string,
  stitchedCells: Record<string, true>,
  parking?: LocalParkingPrefs,
): Promise<void> {
  const d = await db()
  await d.put('progress', { patternId, stitchedCells, parking, updatedAt: Date.now() })
}

export async function getLocalProgress(patternId: string): Promise<Record<string, true> | null> {
  const d = await db()
  const row = (await d.get('progress', patternId)) as StudioDB['progress'] | undefined
  return row?.stitchedCells ?? null
}

/** Stored parking preferences for a pattern, or null when none were saved.
 *  A record written before parking existed simply has no `parking` key. */
export async function getLocalParking(patternId: string): Promise<LocalParkingPrefs | null> {
  const d = await db()
  const row = (await d.get('progress', patternId)) as StudioDB['progress'] | undefined
  const parking = row?.parking
  if (!parking) return null
  return {
    enabled: Boolean(parking.enabled),
    direction: parseParkingDirection(parking.direction),
    line: Number.isFinite(parking.line) ? Math.max(0, Math.trunc(parking.line)) : 0,
  }
}
