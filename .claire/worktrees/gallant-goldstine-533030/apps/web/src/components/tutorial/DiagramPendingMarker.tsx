import { USER_SUBMISSION_ENABLED } from '@/lib/config'

export function DiagramPendingMarker() {
  return (
    <div className="my-6 rounded-lg border border-sage-200 bg-cream-50 px-6 py-5">
      <p className="font-lora text-sm text-stone-600">
        Process diagram coming soon. In the meantime, the steps above describe the technique fully.
      </p>
      {USER_SUBMISSION_ENABLED && (
        <p className="mt-2 font-lora text-xs text-stone-400">
          Have you taken a photo of this technique? Submit it to be featured here.
        </p>
      )}
    </div>
  )
}
