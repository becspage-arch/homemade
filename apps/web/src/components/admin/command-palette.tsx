'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Command } from 'cmdk'
import { useRouter, usePathname } from 'next/navigation'
import type { UserRole } from './admin-sidebar'
import { captureClientEvent } from '@/lib/client-analytics'

interface PaletteResultTutorial {
  id: string
  title: string
  slug: string
  status: string
  category: string | null
}

interface PaletteResultUser {
  id: string
  email: string
  name: string | null
  displayHandle: string | null
  role: string
}

interface PaletteResponse {
  tutorials: PaletteResultTutorial[]
  users: PaletteResultUser[]
}

interface PageEntry {
  href: string
  label: string
  group: string
  minRole: UserRole
}

const RANK: Record<UserRole, number> = {
  ANONYMOUS: 0,
  MEMBER: 1,
  TESTER: 2,
  CREATOR: 3,
  EDITOR: 4,
  ADMIN: 5,
}

function meets(role: UserRole, min: UserRole): boolean {
  return RANK[role] >= RANK[min]
}

const PAGES: PageEntry[] = [
  { href: '/admin', label: 'Dashboard', group: 'Pages', minRole: 'CREATOR' },
  { href: '/admin/tutorials', label: 'All content', group: 'Pages', minRole: 'CREATOR' },
  { href: '/admin/tutorials/new', label: 'New tutorial', group: 'Pages', minRole: 'CREATOR' },
  { href: '/admin/editorial-picks', label: 'Editorial picks', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/categories', label: 'Categories', group: 'Pages', minRole: 'ADMIN' },
  { href: '/admin/glossary', label: 'Glossary', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/media', label: 'Media', group: 'Pages', minRole: 'CREATOR' },
  { href: '/admin/reviews', label: 'Reviews', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/ugc-photos', label: 'UGC photos', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/questions', label: 'Q&A', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/errata', label: 'Errata', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/reports', label: 'Reports', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/community/dmca', label: 'DMCA queue', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/creators', label: 'Creator applications', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/creators/moderation', label: 'Creator moderation', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/patterns', label: 'Pattern tests', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/users', label: 'All users', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/users/suspended', label: 'Suspensions', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/users/data-requests', label: 'Data requests', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/users/deletion-queue', label: 'Deletion queue', group: 'Pages', minRole: 'EDITOR' },
  { href: '/admin/users/signup-allowlist', label: 'Signup allowlist', group: 'Pages', minRole: 'ADMIN' },
  { href: '/admin/audit-log', label: 'Audit log', group: 'Pages', minRole: 'ADMIN' },
  { href: '/admin/system/jobs', label: 'Jobs', group: 'Pages', minRole: 'ADMIN' },
  { href: '/admin/system/errors', label: 'Errors', group: 'Pages', minRole: 'ADMIN' },
]

interface RecentCommand {
  command: string
  label: string
  href: string
  at: number
}

const RECENT_KEY = 'homemade.admin.cmdk.recent'
const RECENT_LIMIT = 10

function loadRecent(): RecentCommand[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    if (!raw) return []
    return JSON.parse(raw) as RecentCommand[]
  } catch {
    return []
  }
}

function saveRecent(items: RecentCommand[]): void {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, RECENT_LIMIT)))
  } catch {
    // ignore
  }
}

export function CommandPalette({ userRole }: { userRole: UserRole }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<PaletteResponse>({ tutorials: [], users: [] })
  const [loading, setLoading] = useState(false)
  // Lazy initial state — loadRecent() returns [] on the server, so it's safe
  // to call during render rather than synchronously inside a mount effect.
  const [recent, setRecent] = useState<RecentCommand[]>(loadRecent)
  const router = useRouter()
  const pathname = usePathname()
  const abortRef = useRef<AbortController | null>(null)

  const closePalette = useCallback(() => {
    setOpen(false)
    setSearch('')
    setResults({ tutorials: [], users: [] })
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape' && open) {
        closePalette()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, closePalette])

  // Debounced search → /api/admin/command-palette. Only fires when the
  // palette is open AND the user typed at least one character — the
  // "no search text" reset path is handled by callers (closePalette /
  // empty-string short-circuit in the input handler).
  useEffect(() => {
    if (!open) return
    if (!search.trim()) return
    const handle = setTimeout(async () => {
      abortRef.current?.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      setLoading(true)
      try {
        const res = await fetch(
          `/api/admin/command-palette?q=${encodeURIComponent(search.trim())}`,
          { signal: ctrl.signal },
        )
        if (res.ok) {
          const json = (await res.json()) as PaletteResponse
          setResults(json)
        }
      } catch {
        // aborted or fetch failure — ignore
      } finally {
        setLoading(false)
      }
    }, 150)
    return () => clearTimeout(handle)
  }, [search, open])

  const visiblePages = useMemo(
    () => PAGES.filter((p) => meets(userRole, p.minRole)),
    [userRole],
  )

  const runCommand = useCallback(
    (entry: { command: string; label: string; href: string }) => {
      // Fire analytics + record to localStorage immediately; persist server-side
      // best-effort so the Recent rail survives across devices the next time we
      // wire it back from the DB.
      const next: RecentCommand = {
        command: entry.command,
        label: entry.label,
        href: entry.href,
        at: Date.now(),
      }
      const cleaned = recent.filter((r) => r.command !== next.command)
      const updated = [next, ...cleaned].slice(0, RECENT_LIMIT)
      setRecent(updated)
      saveRecent(updated)

      captureClientEvent('admin_command_invoked', {
        command: entry.command,
        contextRoute: pathname,
      })

      // Best-effort server persist — fire and forget.
      void fetch('/api/admin/command-palette/record', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ command: entry.command, contextRoute: pathname }),
      }).catch(() => {})

      closePalette()
      router.push(entry.href)
    },
    [closePalette, pathname, recent, router],
  )

  if (!open) return null

  return (
    <div className="cmdk-overlay" onClick={closePalette}>
      <div className="cmdk-shell" onClick={(e) => e.stopPropagation()}>
        <Command label="Admin command palette" className="cmdk-root">
          <Command.Input
            value={search}
            onValueChange={(v) => {
              setSearch(v)
              if (!v.trim()) setResults({ tutorials: [], users: [] })
            }}
            placeholder="Type a command, jump to a page, search content…"
            autoFocus
            className="cmdk-input"
          />
          <Command.List className="cmdk-list">
            <Command.Empty className="cmdk-empty">
              {loading ? 'Searching…' : 'No matches.'}
            </Command.Empty>

            {!search.trim() && recent.length > 0 && (
              <Command.Group heading="Recent" className="cmdk-group">
                {recent.map((r) => (
                  <Command.Item
                    key={`recent:${r.command}`}
                    value={`recent ${r.label}`}
                    onSelect={() =>
                      runCommand({ command: r.command, label: r.label, href: r.href })
                    }
                    className="cmdk-item"
                  >
                    {r.label}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Pages" className="cmdk-group">
              {visiblePages.map((p) => (
                <Command.Item
                  key={`page:${p.href}`}
                  value={`${p.label} ${p.href}`}
                  onSelect={() =>
                    runCommand({ command: `goto:${p.href}`, label: p.label, href: p.href })
                  }
                  className="cmdk-item"
                >
                  {p.label}
                  <span className="cmdk-meta">{p.href}</span>
                </Command.Item>
              ))}
            </Command.Group>

            {results.tutorials.length > 0 && (
              <Command.Group heading="Tutorials" className="cmdk-group">
                {results.tutorials.map((t) => (
                  <Command.Item
                    key={`tut:${t.id}`}
                    value={`${t.title} ${t.slug}`}
                    onSelect={() =>
                      runCommand({
                        command: `tutorial:open:${t.id}`,
                        label: `Open “${t.title}”`,
                        href: `/admin/tutorials/${t.id}`,
                      })
                    }
                    className="cmdk-item"
                  >
                    {t.title}
                    <span className="cmdk-meta">
                      {t.category ?? '—'} · {t.status.toLowerCase()}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {results.users.length > 0 && (
              <Command.Group heading="Users" className="cmdk-group">
                {results.users.map((u) => (
                  <Command.Item
                    key={`user:${u.id}`}
                    value={`${u.email} ${u.name ?? ''} ${u.displayHandle ?? ''}`}
                    onSelect={() =>
                      runCommand({
                        command: `user:open:${u.id}`,
                        label: `Open user ${u.email}`,
                        href: `/admin/users/${u.id}`,
                      })
                    }
                    className="cmdk-item"
                  >
                    {u.name ?? u.email}
                    <span className="cmdk-meta">
                      {u.email} · {u.role.toLowerCase()}
                    </span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            <Command.Group heading="Actions" className="cmdk-group">
              <Command.Item
                value="new tutorial create"
                onSelect={() =>
                  runCommand({
                    command: 'action:new_tutorial',
                    label: 'New tutorial',
                    href: '/admin/tutorials/new',
                  })
                }
                className="cmdk-item"
              >
                New tutorial
              </Command.Item>
              <Command.Item
                value="open public site"
                onSelect={() => {
                  captureClientEvent('admin_command_invoked', {
                    command: 'action:open_public_site',
                    contextRoute: pathname,
                  })
                  closePalette()
                  window.open('/', '_blank')
                }}
                className="cmdk-item"
              >
                Open public site
              </Command.Item>
            </Command.Group>
          </Command.List>
          <div className="cmdk-footer">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> navigate
            </span>
            <span>
              <kbd>↵</kbd> select
            </span>
            <span>
              <kbd>Esc</kbd> close
            </span>
          </div>
        </Command>
      </div>
    </div>
  )
}
