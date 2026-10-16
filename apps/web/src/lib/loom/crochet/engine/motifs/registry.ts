/**
 * The motif registry: each motif module registers itself on import, and an
 * assembly asks for one by id. `index.ts` imports every module, so importing
 * the index gives the full set.
 */

import type { MotifDef, MotifId } from './types'

const REGISTRY = new Map<MotifId, MotifDef>()

export function registerMotif(def: MotifDef): MotifDef {
  if (REGISTRY.has(def.id)) throw new Error(`motif ${def.id} registered twice`)
  REGISTRY.set(def.id, def)
  return def
}

export function getMotif(id: MotifId): MotifDef {
  const d = REGISTRY.get(id)
  if (!d) throw new Error(`no motif ${id} (import engine/motifs/index to register them all)`)
  return d
}

export function listMotifs(): MotifDef[] {
  return [...REGISTRY.values()]
}
