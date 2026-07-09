export interface AppModule {
  id: string
  name: string
  icon: string // Name of Lucide React icon (e.g. "Clock", "ShoppingBag")
  description: string
  isPremium: boolean
  enabled: boolean
  requiresLogin: boolean
  supportsCloudSync: boolean
  route: string
}
