import { useState, useEffect } from 'react'
import { updateService, PWAUpdateState } from './updateService'

export const usePWAUpdate = () => {
  const [state, setState] = useState<PWAUpdateState>(updateService.getState())

  useEffect(() => {
    const unsubscribe = updateService.subscribe((newState) => {
      setState(newState)
    })
    return unsubscribe
  }, [])

  return {
    ...state,
    checkForUpdates: (isManual = false) => updateService.checkForUpdates(isManual),
    updateNow: () => updateService.updateNow(),
    dismissUpdate: () => updateService.dismissUpdate()
  }
}

export default usePWAUpdate
