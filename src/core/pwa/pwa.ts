import { registerSW } from 'virtual:pwa-register'
import { updateService } from './updateService'

export const registerPWA = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  const updateSW = registerSW({
    onRegistered(registration) {
      if (registration) {
        updateService.init(registration, updateSW)
      }
    },
    onNeedRefresh() {
      console.log('PWA Service Worker: New update available.')
      updateService.notifyUpdateAvailable()
    },
    onOfflineReady() {
      console.log('PWA Service Worker: Content is cached for offline use.')
    }
  })
}
