import 'server-only'

const API_BASE = 'https://api.cloudflare.com/client/v4'

interface CloudflareEnvelope<T> {
  result: T
  success: boolean
  errors: { code: number; message: string }[]
  messages: { code: number; message: string }[]
}

interface DirectUploadResult {
  id: string
  uploadURL: string
}

function cloudflareEnv() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  if (!accountId || !apiToken) {
    throw new Error(
      'Cloudflare credentials are not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN.',
    )
  }
  return { accountId, apiToken }
}

async function callCloudflare<T>(
  path: string,
  init: RequestInit & { authToken: string },
): Promise<T> {
  const { authToken, ...rest } = init
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      ...(rest.headers ?? {}),
      Authorization: `Bearer ${authToken}`,
    },
    cache: 'no-store',
  })
  const text = await res.text()
  let payload: CloudflareEnvelope<T>
  try {
    payload = JSON.parse(text) as CloudflareEnvelope<T>
  } catch {
    throw new Error(`Cloudflare returned non-JSON (${res.status}): ${text.slice(0, 200)}`)
  }
  if (!res.ok || !payload.success) {
    const msg = payload.errors?.map((e) => `${e.code}: ${e.message}`).join('; ') || res.statusText
    throw new Error(`Cloudflare API error (${res.status}): ${msg}`)
  }
  return payload.result
}

export async function createDirectUpload(): Promise<DirectUploadResult> {
  const { accountId, apiToken } = cloudflareEnv()
  const formData = new FormData()
  formData.append('requireSignedURLs', 'false')

  return callCloudflare<DirectUploadResult>(
    `/accounts/${accountId}/images/v2/direct_upload`,
    {
      method: 'POST',
      body: formData,
      authToken: apiToken,
    },
  )
}

export async function deleteImage(imageId: string): Promise<void> {
  const { accountId, apiToken } = cloudflareEnv()
  await callCloudflare<unknown>(
    `/accounts/${accountId}/images/v1/${encodeURIComponent(imageId)}`,
    {
      method: 'DELETE',
      authToken: apiToken,
    },
  )
}

