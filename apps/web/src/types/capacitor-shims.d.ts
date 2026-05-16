/* Ambient declarations for Capacitor plugins that are only available inside
 * the native wrapper. apps/web doesn't depend on @capacitor/* directly — the
 * mobile workspace does — so dynamic imports here would otherwise fail to
 * resolve at typecheck time. We give them minimal types covering only what
 * we call.
 */

declare module '@capacitor/camera' {
  export const CameraResultType: {
    DataUrl: 'dataUrl'
    Base64: 'base64'
    Uri: 'uri'
  }
  export const CameraSource: {
    Prompt: 'PROMPT'
    Camera: 'CAMERA'
    Photos: 'PHOTOS'
  }
  export const Camera: {
    getPhoto(options: {
      quality?: number
      resultType: 'dataUrl' | 'base64' | 'uri'
      source?: 'PROMPT' | 'CAMERA' | 'PHOTOS'
      saveToGallery?: boolean
      allowEditing?: boolean
    }): Promise<{ dataUrl?: string; base64String?: string; format?: string }>
  }
}

declare module '@capacitor/push-notifications' {
  export const PushNotifications: {
    checkPermissions(): Promise<{ receive: 'prompt' | 'prompt-with-rationale' | 'denied' | 'granted' }>
    requestPermissions(): Promise<{ receive: 'prompt' | 'prompt-with-rationale' | 'denied' | 'granted' }>
    register(): Promise<void>
    addListener(event: 'registration', cb: (token: { value: string }) => void): Promise<unknown>
    addListener(event: 'registrationError', cb: (err: unknown) => void): Promise<unknown>
    addListener(event: string, cb: (...args: unknown[]) => void): Promise<unknown>
  }
}

declare module '@capacitor/device' {
  export const Device: {
    getInfo(): Promise<{
      platform: string
      operatingSystem?: string
      model?: string
    }>
    getId(): Promise<{ identifier: string }>
  }
}

declare module '@capacitor-community/keep-awake' {
  export const KeepAwake: {
    keepAwake(): Promise<void>
    allowSleep(): Promise<void>
    isSupported(): Promise<{ isSupported: boolean }>
    isKeptAwake(): Promise<{ isKeptAwake: boolean }>
  }
}
