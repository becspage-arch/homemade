'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { SignOutButton } from '@clerk/nextjs'

interface UserMenuProps {
  initial: string
  greeting: string | null
}

export function UserMenu({ initial, greeting }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return
      if (e.target instanceof Node && ref.current.contains(e.target)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className="user-menu" ref={ref}>
      <button
        type="button"
        className="user-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {greeting && <span className="user-menu-greeting">Hi, {greeting}</span>}
        <span className="user-menu-avatar" aria-hidden="true">
          {initial}
        </span>
      </button>
      {open && (
        <div className="user-menu-panel" role="menu">
          <Link
            href="/me"
            role="menuitem"
            className="user-menu-item"
            onClick={() => setOpen(false)}
          >
            Overview
          </Link>
          <Link
            href="/me/projects"
            role="menuitem"
            className="user-menu-item"
            onClick={() => setOpen(false)}
          >
            Making
          </Link>
          <Link
            href="/me/bookmarks"
            role="menuitem"
            className="user-menu-item"
            onClick={() => setOpen(false)}
          >
            Make it list
          </Link>
          <Link
            href="/me/settings"
            role="menuitem"
            className="user-menu-item"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <SignOutButton>
            <button type="button" role="menuitem" className="user-menu-item">
              Sign out
            </button>
          </SignOutButton>
        </div>
      )}
    </div>
  )
}
