/**
 * Native camera bridge. Inside the Capacitor wrapper this opens the native
 * camera; on the open web it returns null so the caller falls back to a
 * standard file input. Also handles client-side compression (JPEG quality 85,
 * 2048px longest edge) before returning a File the upload flow can hand to
 * the existing /api/ugc/photo-upload endpoint.
 */

const MAX_EDGE = 2048
const JPEG_QUALITY = 0.85

interface CapacitorGlobal {
  isNativePlatform?: () => boolean
}

function isNative(): boolean {
  if (typeof globalThis === 'undefined') return false
  const cap = (globalThis as { Capacitor?: CapacitorGlobal }).Capacitor
  return Boolean(cap && cap.isNativePlatform && cap.isNativePlatform())
}

export function isNativeCameraAvailable(): boolean {
  return isNative()
}

/**
 * Capture a photo via the native camera. Resolves to a File ready for upload,
 * or null if the user is not in the native shell or cancelled the capture.
 */
export async function captureNativePhoto(): Promise<File | null> {
  if (!isNative()) return null
  try {
    const mod = await import(/* webpackIgnore: true */ '@capacitor/camera')
    const { Camera, CameraResultType, CameraSource } = mod
    const photo = await Camera.getPhoto({
      quality: 90,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt,
      saveToGallery: false,
      allowEditing: false,
    })
    if (!photo.dataUrl) return null
    const blob = await dataUrlToBlob(photo.dataUrl)
    const compressed = await compressImage(blob, photo.format ?? 'jpeg')
    return compressed
  } catch {
    return null
  }
}

/**
 * Compress an arbitrary image (camera capture or library pick) to JPEG, capped
 * at 2048px on the longest edge. Returns a File the upload flow can use.
 */
export async function compressImage(
  source: Blob | File,
  formatHint = 'jpeg',
): Promise<File> {
  const bitmap = await createImageBitmap(source)
  const { width, height } = bitmap
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height))
  const w = Math.round(width * scale)
  const h = Math.round(height * scale)

  const canvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(w, h)
      : Object.assign(document.createElement('canvas'), { width: w, height: h })
  const ctx = (canvas as HTMLCanvasElement | OffscreenCanvas).getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null
  if (!ctx) {
    return new File([source], 'photo.jpg', { type: source.type || 'image/jpeg' })
  }
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()

  let blob: Blob
  if ('convertToBlob' in canvas) {
    blob = await (canvas as OffscreenCanvas).convertToBlob({
      type: 'image/jpeg',
      quality: JPEG_QUALITY,
    })
  } else {
    blob = await new Promise<Blob>((resolve, reject) => {
      ;(canvas as HTMLCanvasElement).toBlob(
        (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
        'image/jpeg',
        JPEG_QUALITY,
      )
    })
  }

  const ext = formatHint === 'png' ? 'png' : 'jpg'
  return new File([blob], `photo-${Date.now()}.${ext}`, { type: blob.type })
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return res.blob()
}
