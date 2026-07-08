'use client'

import { Printer } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      type="button"
      className="cheatsheet-print-btn"
      onClick={() => typeof window !== 'undefined' && window.print()}
    >
      <Printer size={16} strokeWidth={1.5} aria-hidden />
      <span>Print / Save as PDF</span>
    </button>
  )
}
