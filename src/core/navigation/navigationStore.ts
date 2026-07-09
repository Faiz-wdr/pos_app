import { create } from 'zustand'

export type TabType = 'home' | 'modules' | 'settings' | 'profile'

interface NavigationState {
  activeTab: TabType
  hideSystemNav: boolean
  isFullscreen: boolean
  setActiveTab: (tab: TabType) => void
  setHideSystemNav: (hide: boolean) => void
  setIsFullscreen: (fullscreen: boolean) => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeTab: 'home',
  hideSystemNav: false,
  isFullscreen: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setHideSystemNav: (hide) => set({ hideSystemNav: hide }),
  setIsFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
}))
