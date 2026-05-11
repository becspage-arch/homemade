import { NextResponse } from 'next/server'
import {
  cancelAccountDeletion,
  scheduleAccountDeletion,
} from '@/lib/data-rights-actions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface DeletePayload {
  action?: 'schedule' | 'cancel'
  reason?: string | null
}

/**
 * POST /api/account/delete — schedule (or cancel) account deletion.
 * Body: { action: 'schedule' | 'cancel', reason?: string }.
 * Defaults to 'schedule' when no body is provided.
 */
export async function POST(request: Request): Promise<Response> {
  let body: DeletePayload = {}
  try {
    const text = await request.text()
    if (text) body = JSON.parse(text) as DeletePayload
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 })
  }

  const action = body.action ?? 'schedule'

  if (action === 'cancel') {
    const res = await cancelAccountDeletion()
    if (!res.ok) return NextResponse.json(res, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'schedule') {
    const res = await scheduleAccountDeletion(body.reason ?? null)
    if (!res.ok) return NextResponse.json(res, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json(
    { ok: false, error: 'Unknown action.' },
    { status: 400 },
  )
}
