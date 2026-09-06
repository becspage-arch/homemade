'use client'

import { useState } from 'react'
import { ReportModal } from '@/components/public/ugc/report-modal'

/**
 * The legal takedown link on a maker photo. This is the only thing one member
 * can do about another member's photo, and it goes to Homemade, not to the
 * maker: there is no reply, no reaction and no public signal of any kind.
 */
export function PhotoReportLink({ photoId }: { photoId: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className="maker-photos-report" onClick={() => setOpen(true)}>
        Report
      </button>
      {open && (
        <ReportModal targetType="PHOTO" targetId={photoId} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
