import { NextResponse } from 'next/server'
import { requestDataExport } from '@/lib/data-rights-actions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/account/export — kick off a GDPR data export for the signed-in
 * user. Delegates to the same server action the data-rights page uses, so
 * the throttle and audit-log path are identical.
 */
export async function POST(): Promise<Response> {
  const res = await requestDataExport()
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error }, { status: 400 })
  }
  return NextResponse.json({ ok: true, requestId: res.requestId })
}
