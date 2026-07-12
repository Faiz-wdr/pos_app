import { releaseNotes } from '@/config/releases'

declare const __APP_VERSION__: string

export interface PWAUpdateState {
  currentVersion: string
  latestVersion: string
  releaseNotes: string[]
  isUpdateAvailable: boolean
  loading: boolean
  lastChecked: string | null
  lastUpdated: string | null
  error: string | null
}

type Listener = (state: PWAUpdateState) => void

class PWAUpdateService {
  private state: PWAUpdateState = {
    currentVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0',
    latestVersion: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0',
    releaseNotes: releaseNotes.changes,
    isUpdateAvailable: false,
    loading: false,
    lastChecked: null,
    lastUpdated: localStorage.getItem('pwa-last-updated') || new Date().toLocaleDateString(),
    error: null
  }

  private listeners = new Set<Listener>()
  private checkIntervalId: any = null
  private swRegistration: ServiceWorkerRegistration | null = null
  private updateSWCallback: ((reloadPage?: boolean) => Promise<void>) | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Listen for online/offline events
      window.addEventListener('online', () => {
        console.log('App online. Retrying update check...')
        this.checkForUpdates()
      })

      // 2. Listen for tab focus/active state
      window.addEventListener('focus', () => {
        console.log('App focused. Checking for updates...')
        this.checkForUpdates()
      })
    }
  }

  // Hook low-level Service Worker callbacks
  init(
    registration: ServiceWorkerRegistration,
    updateSW: (reloadPage?: boolean) => Promise<void>
  ) {
    this.swRegistration = registration
    this.updateSWCallback = updateSW

    // Check on startup
    this.checkForUpdates()

    // Periodically check every 30 minutes
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId)
    }
    this.checkIntervalId = setInterval(() => {
      console.log('Running periodic update check...')
      this.checkForUpdates()
    }, 30 * 60 * 1000)
  }

  getState(): PWAUpdateState {
    return { ...this.state }
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    listener({ ...this.state })
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emit() {
    this.listeners.forEach((l) => l({ ...this.state }))
  }

  updateState(updates: Partial<PWAUpdateState>) {
    this.state = { ...this.state, ...updates }
    this.emit()
  }

  async checkForUpdates(isManual = false): Promise<boolean> {
    if (typeof window === 'undefined') return false
    
    // Check if network is offline
    if (!navigator.onLine) {
      console.log('Offline. Skipping update check.')
      return false
    }

    // Preserve loading state but change to active
    this.updateState({ loading: true, error: null })

    try {
      // 1. Check Service Worker registration update
      if (this.swRegistration) {
        await this.swRegistration.update()
      }

      // 2. Fetch server-side version.json with a cache-buster query param
      const res = await fetch(`/version.json?t=${Date.now()}`)
      if (!res.ok) {
        throw new Error('Failed to fetch version metadata')
      }
      
      const serverData = await res.json()
      const serverVersion = serverData.version
      const changes = serverData.changes || []

      const currentVersion = this.state.currentVersion
      const isNewer = this.isVersionNewer(serverVersion, currentVersion)

      // If user chose "Later", check if it is dismissed for this session
      const isDismissed = sessionStorage.getItem('pwa-update-dismissed') === 'true'

      this.updateState({
        latestVersion: serverVersion,
        releaseNotes: changes,
        isUpdateAvailable: isNewer && !isDismissed,
        lastChecked: new Date().toLocaleTimeString(),
        loading: false
      })

      return isNewer
    } catch (err: any) {
      console.error('Error checking for updates:', err)
      this.updateState({ 
        loading: false, 
        error: isManual ? 'Unable to connect to update server.' : null 
      })
      return false
    }
  }

  // Version comparison helper: v1.1.0 > v1.0.4
  private isVersionNewer(newVer: string, oldVer: string): boolean {
    const clean = (v: string) => v.replace(/^v/, '').split('.').map(Number)
    const [newMajor, newMinor, newPatch] = clean(newVer)
    const [oldMajor, oldMinor, oldPatch] = clean(oldVer)

    if (newMajor !== oldMajor) return newMajor > oldMajor
    if (newMinor !== oldMinor) return newMinor > oldMinor
    return newPatch > oldPatch
  }

  dismissUpdate() {
    sessionStorage.setItem('pwa-update-dismissed', 'true')
    this.updateState({ isUpdateAvailable: false })
  }

  async updateNow() {
    if (this.updateSWCallback) {
      this.updateState({ loading: true })
      // Persist last updated timestamp
      const now = new Date().toLocaleDateString()
      localStorage.setItem('pwa-last-updated', now)
      
      // Trigger service worker skipWaiting and reload
      await this.updateSWCallback(true)
    } else {
      window.location.reload()
    }
  }

  notifyUpdateAvailable() {
    const isDismissed = sessionStorage.getItem('pwa-update-dismissed') === 'true'
    if (!isDismissed) {
      this.updateState({ isUpdateAvailable: true })
    }
  }
}

export const updateService = new PWAUpdateService()
export default updateService
