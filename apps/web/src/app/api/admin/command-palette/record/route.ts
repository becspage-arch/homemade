import { NextResponse } from 'next/server'
import { recordAdminCommand } from '@/lib/admin-command-history'

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as {
      command?: string
      contextRoute?: string
    } | null
    if (!body || typeof body.command !== 'string') {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    await recordAdminCommand(body.command, body.contextRoute ? { contextRoute: body.contextRoute } : null)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
