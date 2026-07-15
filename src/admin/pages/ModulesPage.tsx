import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Layers, Plus, RefreshCw, ShieldAlert } from 'lucide-react'
import { useAdminModules, AdminModule } from '../hooks/useAdminModules'
import { PageContainer } from '../components/PageContainer'
import { SectionTitle } from '../components/SectionTitle'
import { EmptyState } from '../components/EmptyState'
import { ActionButton } from '../components/ActionButton'
import { ModuleCard } from '../components/ModuleCard'
import { ModuleDrawer } from '../components/ModuleDrawer'

export const ModulesPage: React.FC = () => {
  const { modules, loading, error, updateModule } = useAdminModules()
  const [selectedModule, setSelectedModule] = useState<AdminModule | null>(null)
  const [loadingModuleId, setLoadingModuleId] = useState<string | null>(null)

  const handleToggleEnabled = async (mod: AdminModule) => {
    setLoadingModuleId(mod.id)
    try {
      await updateModule(mod.id, { enabled: !mod.enabled })
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingModuleId(null)
    }
  }

  const handleSaveModule = async (updates: Partial<AdminModule>) => {
    if (!selectedModule) return
    await updateModule(selectedModule.id, updates)
  }

  if (error) {
    return (
      <PageContainer className="justify-center items-center h-[70vh]">
        <div className="text-center space-y-4 max-w-sm">
          <div className="p-4 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 inline-block">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Error Loading Modules</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
          <ActionButton
            onClick={() => window.location.reload()}
            icon={RefreshCw}
            className="mx-auto rounded-xl"
          >
            Retry
          </ActionButton>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <SectionTitle
        title="Module Registry"
        subtitle="Manage available application modules, visibility flags, pricing configurations, and versions."
        actions={
          <ActionButton 
            icon={Plus} 
            onClick={() => {
              setSelectedModule({
                id: `module-${Date.now()}`,
                name: '',
                description: '',
                category: 'Utility',
                free: true,
                premium: false,
                price: 0,
                accentColor: '#f8b518',
                icon: 'Layers',
                version: '1.0.0',
                status: 'beta',
                enabled: true,
                totalUsers: 0,
                activeUsersToday: 0,
                avgSessionTime: 0,
                lastUpdated: null
              })
            }}
            className="rounded-xl h-9"
          >
            Register Module
          </ActionButton>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-56 bg-muted/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : modules.length === 0 ? (
        <EmptyState
          title="No Modules Found"
          description="Click Register Module to create your first application module."
          icon={Layers}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <ModuleCard
              key={mod.id}
              module={mod}
              onEdit={() => setSelectedModule(mod)}
              onToggleEnabled={() => handleToggleEnabled(mod)}
              loadingAction={loadingModuleId === mod.id}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedModule && (
          <ModuleDrawer
            module={selectedModule}
            onClose={() => setSelectedModule(null)}
            onSave={handleSaveModule}
          />
        )}
      </AnimatePresence>
    </PageContainer>
  )
}

export default ModulesPage
