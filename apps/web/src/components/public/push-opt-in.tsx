'use client'

import { useEffect, useState } from 'react'
import './push-opt-in.css'

interface PluginPermissionStatus {
  receive: 'prompt' | 'prompt-with-rationale' | 'denied' | 'granted'
}

interface PluginRegistrationToken {
  value: string
}

interface PushPluginShape {
  checkPermissions(): Promise<PluginPermissionStatus>
  requestPermissions(): Promise<PluginPermissionStatus>
  register(): Promise<void>
  addListener(
    event: 'registration',
    cb: (token: PluginRegistrationToken) => void,
  ): Promise<unknown>
  addListener(event: 'registrationError', cb: (err: unknown) => void): Promise<unknown>
}

interface DevicePluginShape {
  getInfo(): Promise<{
    platform: string
    operatingSystem?: string
    model?: string
  }>
  getId(): Promise<{ identifier: string }>
}

interface CapacitorGlobal {
  isNativePlatform?: () => boolean
  getPlatform?: () => 'ios' | 'android' | 'web'
}

function isNative(): boolean {
  if (typeof globalThis === 'undefined') return false
  const cap = (globalThis as { Capacitor?: CapacitorGlobal }).Capacitor
  return Boolean(cap && cap.isNativePlatform && cap.isNativePlatform())
}

function platformOf(): 'IOS' | 'ANDROID' | 'WEB' {
  if (typeof globalThis === 'undefined') return 'WEB'
  const cap = (globalThis as { Capacitor?: CapacitorGlobal }).Capacitor
  const p = cap?.getPlatform?.()
  if (p === 'ios') return 'IOS'
  if (p === 'android') return 'ANDROID'
  return 'WEB'
}

const DISMISSED_KEY = 'homemade:pushOptIn:dismissed'

/**
 * Contextual push opt-in card. Renders when:
 *   - the user is signed in,
 *   - they have at least one IN_PROGRESS UserProject (passed in),
 *   - they haven't already enabled push, and
 *   - they haven't dismissed the prompt before.
 *
 * Survives both Capacitor and the open web — on web it stays hidden (Web
 * Push needs VAPID keys + a different code path; deferring per the brief).
 */
export function PushOptIn({
  alreadyEnabled,
  hasActiveProject,
}: {
  alreadyEnabled: boolean
  hasActiveProject: boolean
}) {
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (alreadyEnabled || !hasActiveProject) return
    if (!isNative()) return
    try {
      if (window.localStorage.getItem(DISMISSED_KEY) === '1') return
    } catch {
      /* ignore */
    }
    const id = window.requestAnimationFrame(() => setVisible(true))
    return () => window.cancelAnimationFrame(id)
  }, [alreadyEnabled, hasActiveProject])

  if (!visible) return null

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  const enable = async () => {
    setPending(true)
    setError(null)
    try {
      const pluginMod = await import(
        /* webpackIgnore: true */ '@capacitor/push-notifications'
      )
      const plugin = pluginMod.PushNotifications as PushPluginShape

      let perm = await plugin.checkPermissions()
      if (perm.receive !== 'granted') {
        perm = await plugin.requestPermissions()
      }
      if (perm.receive !== 'granted') {
        setError('Permission declined. You can change this in settings.')
        setPending(false)
        return
      }

      const tokenPromise = new Promise<string>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error('Timed out waiting for token')),
          12_000,
        )
        plugin.addListener('registration', (t) => {
          clearTimeout(timer)
          resolve(t.value)
        })
        plugin.addListener('registrationError', (err) => {
          clearTimeout(timer)
          reject(err)
        })
      })

      await plugin.register()
      const token = await tokenPromise

      let deviceId: string | undefined
      let userAgent: string | undefined
      try {
        const devMod = await import(/* webpackIgnore: true */ '@capacitor/device')
        const dev = devMod.Device as DevicePluginShape
        const info = await dev.getInfo()
        const ident = await dev.getId()
        deviceId = ident.identifier
        userAgent = `${info.operatingSystem ?? info.platform} ${info.model ?? ''}`.trim()
      } catch {
        /* device info optional */
      }

      const res = await fetch('/api/me/push/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          platform: platformOf(),
          deviceToken: token,
          deviceId,
          userAgent,
        }),
      })
      if (!res.ok) {
        setError('Could not register this device.')
        setPending(false)
        return
      }
      setVisible(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not enable push.')
      setPending(false)
    }
  }

  return (
    <div className="push-opt-in" role="dialog" aria-label="Turn on notifications">
      <div className="push-opt-in-text">
        <span className="push-opt-in-title">Heads-up for your projects</span>
        <p className="push-opt-in-body">
          Get a quiet nudge when your sourdough needs feeding or your tomatoes
          are ready to pinch back.
        </p>
        {error && <p className="push-opt-in-error">{error}</p>}
      </div>
      <div className="push-opt-in-actions">
        <button
          type="button"
          className="push-opt-in-dismiss"
          onClick={dismiss}
          disabled={pending}
        >
          Not now
        </button>
        <button
          type="button"
          className="push-opt-in-enable"
          onClick={enable}
          disabled={pending}
        >
          {pending ? 'Turning on…' : 'Turn on'}
        </button>
      </div>
    </div>
  )
}
