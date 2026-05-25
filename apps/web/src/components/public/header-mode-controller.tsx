'use client'

import { useEffect } from 'react'

/**
 * Toggles `data-header-mode="transparent" | "solid"` on `<body>` while
 * the homepage hero is at the top of the viewport. The site header CSS
 * reads the attribute and renders cream-on-image while transparent,
 * solid cream-with-rule once scrolled past the hero.
 *
 * Mounted only on the homepage so other (public) routes default to the
 * solid header.
 */
export function HeaderModeController() {
  useEffect(() => {
    const body = document.body
    const threshold = 80 // px from top before we go solid
    function update() {
      const scrolled = window.scrollY > threshold
      body.dataset.headerMode = scrolled ? 'solid' : 'transparent'
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      delete body.dataset.headerMode
    }
  }, [])
  return null
}
