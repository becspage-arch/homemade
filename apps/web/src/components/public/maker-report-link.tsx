'use client'

import { useState } from 'react'
import { ReportModal } from './ugc/report-modal'

type MakerReportTarget =
  | 'MAKER_BIO'
  | 'MAKER_HANDLE'
  | 'MAKER_HEADER_IMAGE'
  | 'MAKER_PROJECT_PUBLIC_NOTE'
  | 'MAKER_PROJECT_WHAT_I_USED'

interface MakerReportLinkProps {
  targetType: MakerReportTarget
  targetId: string
  /** Default copy for the visible link. */
  label?: string
}

/**
 * Small text-only link that opens the existing ReportModal targeting one of
 * the new MAKER_* ReportTargetType values. Placed near each Maker-profile
 * surface so reporters can flag specific fields rather than the whole row.
 *
 * Hidden for unsigned visitors — submission needs an account, so we don't
 * surface the affordance to someone who'd hit a sign-in wall.
 */
export function MakerReportLink({
  targetType,
  targetId,
  label = 'Report',
}: MakerReportLinkProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: 'transparent',
          border: 0,
          padding: 0,
          fontFamily: 'var(--font-lora)',
          fontSize: 11,
          color: 'var(--color-warm-taupe, #b3a48d)',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
          cursor: 'pointer',
        }}
      >
        {label}
      </button>
      {open && (
        <ReportModal
          targetType={targetType}
          targetId={targetId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
