'use client'

export function PrintButton() {
  return (
    <button
      type="button"
      className="print-do-print"
      onClick={() => window.print()}
    >
      Print
    </button>
  )
}
