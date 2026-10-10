/**
 * The motif set (audit rounds 8 and 9). Importing this module registers every
 * motif; ask for one with `getMotif(id)` (registry.ts).
 */
import './star'
import './leaf'
import './heart'
import './daisy'
import './butterfly'
import './berry'
import './leaf-vine'
import './rolled-rose'

export { getMotif, listMotifs, registerMotif } from './registry'
export type { BuiltMotif, MotifDef, MotifId, MotifOptions, MotifPiece } from './types'
export { motifScene, type MotifView } from './motifScene'
