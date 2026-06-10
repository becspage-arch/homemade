import 'server-only'
import { Prisma, type SewingPlanStatus } from '@homemade/db'

const VALID_STATUSES = [
  'DRAFT',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'ARCHIVED',
] as const satisfies readonly SewingPlanStatus[]

export function asStatus(input: unknown): SewingPlanStatus | null {
  if (typeof input !== 'string') return null
  return (VALID_STATUSES as readonly string[]).includes(input)
    ? (input as SewingPlanStatus)
    : null
}

export function asTitle(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const trimmed = input.trim()
  if (!trimmed) return null
  return trimmed.slice(0, 200)
}

function asTrimmedString(input: unknown, max: number): string | null {
  if (typeof input !== 'string') return null
  const trimmed = input.trim()
  return trimmed ? trimmed.slice(0, max) : null
}

function asPositiveNumber(input: unknown): number | null {
  if (input === null || input === undefined || input === '') return null
  const num = typeof input === 'number' ? input : Number(input)
  if (!Number.isFinite(num) || num <= 0) return null
  return Math.round(num * 100) / 100
}

function asInt(input: unknown, min: number, max: number): number | null {
  if (input === null || input === undefined || input === '') return null
  const num = typeof input === 'number' ? input : Number(input)
  if (!Number.isFinite(num)) return null
  const intVal = Math.round(num)
  if (intVal < min || intVal > max) return null
  return intVal
}

function asBoolean(input: unknown): boolean {
  return input === true
}

export interface FabricRow {
  id: string
  name: string
  fabricType?: string
  widthCm?: number
  lengthCm?: number
  notes?: string
}

export interface NotionRow {
  id: string
  name: string
  quantity?: number
  notes?: string
}

export interface ThreadRow {
  id: string
  colour: string
  weight?: string
  notes?: string
}

export interface StepRow {
  id: string
  stepText: string
  isComplete: boolean
  completedAt?: string | null
  notes?: string
}

export interface CuttingPlanShape {
  layoutNotes?: string
  fabricWidthCm?: number
  totalLengthCm?: number
  pieceList?: string[]
}

function genId() {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36).slice(-4)
}

function sanitiseList<T>(input: unknown, mapper: (item: Record<string, unknown>) => T | null): T[] {
  if (!Array.isArray(input)) return []
  const out: T[] = []
  for (const item of input) {
    if (!item || typeof item !== 'object') continue
    const mapped = mapper(item as Record<string, unknown>)
    if (mapped) out.push(mapped)
  }
  return out
}

export function sanitiseFabricList(input: unknown): FabricRow[] {
  return sanitiseList<FabricRow>(input, (it) => {
    const name = asTrimmedString(it.name, 200)
    if (!name) return null
    return {
      id: typeof it.id === 'string' && it.id ? it.id : genId(),
      name,
      fabricType: asTrimmedString(it.fabricType, 100) ?? undefined,
      widthCm: asPositiveNumber(it.widthCm) ?? undefined,
      lengthCm: asPositiveNumber(it.lengthCm) ?? undefined,
      notes: asTrimmedString(it.notes, 500) ?? undefined,
    }
  })
}

export function sanitiseNotionsList(input: unknown): NotionRow[] {
  return sanitiseList<NotionRow>(input, (it) => {
    const name = asTrimmedString(it.name, 200)
    if (!name) return null
    return {
      id: typeof it.id === 'string' && it.id ? it.id : genId(),
      name,
      quantity: asInt(it.quantity, 1, 1000) ?? undefined,
      notes: asTrimmedString(it.notes, 500) ?? undefined,
    }
  })
}

export function sanitiseThreadList(input: unknown): ThreadRow[] {
  return sanitiseList<ThreadRow>(input, (it) => {
    const colour = asTrimmedString(it.colour, 200)
    if (!colour) return null
    return {
      id: typeof it.id === 'string' && it.id ? it.id : genId(),
      colour,
      weight: asTrimmedString(it.weight, 100) ?? undefined,
      notes: asTrimmedString(it.notes, 500) ?? undefined,
    }
  })
}

export function sanitiseStepsList(input: unknown): StepRow[] {
  return sanitiseList<StepRow>(input, (it) => {
    const stepText = asTrimmedString(it.stepText, 1000)
    if (!stepText) return null
    const isComplete = asBoolean(it.isComplete)
    return {
      id: typeof it.id === 'string' && it.id ? it.id : genId(),
      stepText,
      isComplete,
      completedAt:
        isComplete && typeof it.completedAt === 'string'
          ? it.completedAt
          : isComplete
            ? new Date().toISOString()
            : null,
      notes: asTrimmedString(it.notes, 500) ?? undefined,
    }
  })
}

export function sanitiseCuttingPlan(input: unknown): CuttingPlanShape | null {
  if (!input || typeof input !== 'object') return null
  const obj = input as Record<string, unknown>
  const layoutNotes = asTrimmedString(obj.layoutNotes, 2000)
  const fabricWidthCm = asPositiveNumber(obj.fabricWidthCm)
  const totalLengthCm = asPositiveNumber(obj.totalLengthCm)
  const pieceList = Array.isArray(obj.pieceList)
    ? (obj.pieceList as unknown[])
        .map((p) => (typeof p === 'string' ? p.trim() : ''))
        .filter((p): p is string => p.length > 0)
        .slice(0, 200)
    : undefined
  const empty =
    !layoutNotes && fabricWidthCm == null && totalLengthCm == null && (!pieceList || !pieceList.length)
  if (empty) return null
  return {
    layoutNotes: layoutNotes ?? undefined,
    fabricWidthCm: fabricWidthCm ?? undefined,
    totalLengthCm: totalLengthCm ?? undefined,
    pieceList: pieceList ?? undefined,
  }
}

type NullableJsonInput = Prisma.InputJsonValue | typeof Prisma.JsonNull

export interface PlanUpdatePayload {
  title?: string
  status?: SewingPlanStatus
  fabricList?: NullableJsonInput
  notionsList?: NullableJsonInput
  threadList?: NullableJsonInput
  cuttingPlan?: NullableJsonInput
  stepsList?: NullableJsonInput
  notes?: string | null
  patternSlug?: string | null
  startedAt?: Date | null
  completedAt?: Date | null
}

export function pickPlanUpdate(body: Record<string, unknown>): PlanUpdatePayload {
  const out: PlanUpdatePayload = {}
  if ('title' in body) {
    const t = asTitle(body.title)
    if (t) out.title = t
  }
  if ('status' in body) {
    const s = asStatus(body.status)
    if (s) {
      out.status = s
      if (s === 'ACTIVE' || s === 'COMPLETED') {
        out.startedAt = new Date()
      }
      if (s === 'COMPLETED') {
        out.completedAt = new Date()
      }
    }
  }
  if ('fabricList' in body) {
    out.fabricList = sanitiseFabricList(body.fabricList) as unknown as Prisma.InputJsonValue
  }
  if ('notionsList' in body) {
    out.notionsList = sanitiseNotionsList(body.notionsList) as unknown as Prisma.InputJsonValue
  }
  if ('threadList' in body) {
    out.threadList = sanitiseThreadList(body.threadList) as unknown as Prisma.InputJsonValue
  }
  if ('stepsList' in body) {
    out.stepsList = sanitiseStepsList(body.stepsList) as unknown as Prisma.InputJsonValue
  }
  if ('cuttingPlan' in body) {
    const cp = sanitiseCuttingPlan(body.cuttingPlan)
    out.cuttingPlan = cp ? (cp as unknown as Prisma.InputJsonValue) : Prisma.JsonNull
  }
  if ('notes' in body) {
    const n = asTrimmedString(body.notes, 5000)
    out.notes = n
  }
  if ('patternSlug' in body) {
    out.patternSlug = asTrimmedString(body.patternSlug, 200)
  }
  return out
}
