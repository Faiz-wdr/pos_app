import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Settings, ShoppingBag, Plus, Sparkles, History,
  Trash2, Copy, FileSpreadsheet, ArrowRight, ClipboardList, Search
} from 'lucide-react'
import { useShoppingSettingsStore } from '../store/settingsStore'
import { 
  useShoppingListsWithCounts, useTemplates
} from '../hooks/useShopping'
import { 
  deleteShoppingList, duplicateShoppingList, 
  createTemplateDirectly, deleteTemplate, instantiateTemplate,
  createShoppingList
} from '../services/shoppingService'
import ShoppingSettingsDialog from '../components/ShoppingSettings'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Dialog } from '@/components/ui/Dialog'

type SubTab = 'lists' | 'templates' | 'history'

export const ShoppingModulePage = () => {
  const navigate = useNavigate()
  
  // Tab and modal visibility
  const [activeTab, setActiveTab] = useState<SubTab>('lists')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Custom dialogs state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
    confirmText?: string
    variant?: 'primary' | 'danger'
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  })

  const [promptDialog, setPromptDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    value: string
    placeholder?: string
    onConfirm: (val: string) => void
  }>({
    isOpen: false,
    title: '',
    description: '',
    value: '',
    onConfirm: () => {},
  })

  // State expansion config
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)

  const { currency, confirmDelete } = useShoppingSettingsStore()

  // Database Queries
  const activeLists = useShoppingListsWithCounts(false)
  const completedLists = useShoppingListsWithCounts(true)
  const templates = useTemplates()

  if (activeLists === undefined || completedLists === undefined || templates === undefined) {
    return (
      <div className="flex-1 flex flex-col justify-between w-full h-full relative select-none pb-6 overflow-hidden">
        {/* Top Header Controls Bar */}
        <header className="flex items-center justify-between w-full px-5 py-4 shrink-0 border-b border-border/40 z-30">
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          <div className="w-32 h-8 rounded-xl bg-muted animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        </header>

        <div className="flex-1 flex flex-col px-5 pt-4 space-y-4 overflow-y-auto">
          {/* Pulsing search bar */}
          <div className="w-full h-10 rounded-xl bg-muted/60 animate-pulse" />

          <div className="flex items-center justify-between pt-2">
            <div className="w-20 h-4 rounded-md bg-muted/50 animate-pulse" />
            <div className="w-16 h-8 rounded-xl bg-muted/50 animate-pulse" />
          </div>

          {/* Pulsing cards */}
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="p-4 rounded-xl border border-border/45 bg-card/10 flex items-center justify-between h-16">
                <div className="flex-1 flex flex-col space-y-2">
                  <div className="w-1/3 h-4 rounded-md bg-muted/50 animate-pulse" />
                  <div className="w-1/2 h-3 rounded-md bg-muted/40 animate-pulse" />
                </div>
                <div className="w-12 h-6 rounded-md bg-muted/50 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Filter list search queries
  const filterBySearch = (list: any[]) => {
    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase().trim()
    return list.filter((l) => 
      l.name.toLowerCase().includes(q) || 
      l.description?.toLowerCase().includes(q)
    )
  }

  const filteredActiveLists = filterBySearch(activeLists)
  const filteredCompletedLists = filterBySearch(completedLists)
  const filteredTemplates = searchQuery.trim() 
    ? templates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : templates

  // List actions
  const handleCreateList = async () => {
    try {
      const nextNum = activeLists.length + completedLists.length + 1
      const newListId = await createShoppingList(`List ${nextNum}`)
      navigate(`/modules/shopping/list/${newListId}`)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteList = (id: string, name: string) => {
    if (confirmDelete) {
      setConfirmDialog({
        isOpen: true,
        title: 'Delete Shopping List',
        description: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
        confirmText: 'Delete',
        variant: 'danger',
        onConfirm: async () => {
          try {
            await deleteShoppingList(id)
          } catch (err) {
            console.error(err)
          }
        }
      })
    } else {
      deleteShoppingList(id).catch(console.error)
    }
  }

  const handleDuplicateList = async (id: string) => {
    try {
      const newListId = await duplicateShoppingList(id)
      navigate(`/modules/shopping/list/${newListId}`)
    } catch (err) {
      console.error(err)
    }
  }

  // Template actions
  const handleCreateTemplate = () => {
    setPromptDialog({
      isOpen: true,
      title: 'New Template',
      description: 'Enter a name for the new template:',
      value: '',
      placeholder: 'e.g. Monthly Grocery',
      onConfirm: async (val) => {
        try {
          await createTemplateDirectly(val)
        } catch (err) {
          console.error(err)
        }
      }
    })
  }

  const handleDeleteTemplate = (id: string, name: string) => {
    if (confirmDelete) {
      setConfirmDialog({
        isOpen: true,
        title: 'Delete Template',
        description: `Are you sure you want to delete template "${name}"?`,
        confirmText: 'Delete',
        variant: 'danger',
        onConfirm: async () => {
          try {
            await deleteTemplate(id)
          } catch (err) {
            console.error(err)
          }
        }
      })
    } else {
      deleteTemplate(id).catch(console.error)
    }
  }

  const handleUseTemplate = (templateId: string, templateName: string) => {
    setPromptDialog({
      isOpen: true,
      title: 'Create List from Template',
      description: 'Enter name for your new shopping session:',
      value: `${templateName} - Session`,
      placeholder: 'List Name',
      onConfirm: async (val) => {
        try {
          const newListId = await instantiateTemplate(templateId, val)
          navigate(`/modules/shopping/list/${newListId}`)
        } catch (err) {
          console.error(err)
        }
      }
    })
  }

  // Animation parameters
  const transition = animationsEnabled ? { duration: 0.15 } : { duration: 0 }

  return (
    <div className="flex-1 flex flex-col justify-between w-full h-full relative select-none pb-6 overflow-hidden">
      
      {/* Top Header Controls Bar */}
      <header className="flex items-center justify-between w-full px-4 py-2.5 shrink-0 bg-background/90 dark:bg-background/80 backdrop-blur-xs border-b border-border/40 z-30 select-none">
        <Link 
          to="/modules" 
          className="p-2 rounded-full hover:bg-card border border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Back to POS modules list"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Dynamic sub tab selectors */}
        <div className="flex bg-muted/70 p-1 rounded-xl border border-border/50">
          <button
            onClick={() => { setActiveTab('lists'); setSearchQuery(''); }}
            className={`flex items-center px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'lists'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 mr-1" />
            Lists
          </button>
          <button
            onClick={() => { setActiveTab('templates'); setSearchQuery(''); }}
            className={`flex items-center px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Templates
          </button>
          <button
            onClick={() => { setActiveTab('history'); setSearchQuery(''); }}
            className={`flex items-center px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="w-3.5 h-3.5 mr-1" />
            History
          </button>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="p-2 rounded-full hover:bg-card border border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Shopping list preferences settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main content body */}
      <div className="flex-1 flex flex-col px-4 pt-3 overflow-y-auto select-text">
        
        {/* Search bar inside lists page */}
        <div className="relative mb-4 shrink-0 select-none">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </span>
          <Input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 font-semibold h-10 rounded-xl"
          />
        </div>

        <AnimatePresence mode="wait">
          {/* TAB 1: LISTS SCREEN */}
          {activeTab === 'lists' && (
            <motion.div
              key="lists"
              initial={animationsEnabled ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={animationsEnabled ? { opacity: 0, y: -10 } : { opacity: 0, y: 0 }}
              transition={transition}
              className="flex-1 flex flex-col space-y-4 pb-16"
            >
              <div className="flex items-center justify-between shrink-0 select-none">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Sessions</span>
                <Button 
                  onClick={handleCreateList}
                  size="sm"
                  variant="primary" 
                  className="rounded-xl h-8 text-[11px] font-bold cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  New List
                </Button>
              </div>

              {filteredActiveLists.length === 0 ? (
                <div className="flex-1 flex items-center justify-center select-none py-10">
                  <Card className="border-dashed border-border bg-transparent shadow-none w-full max-w-sm py-10">
                    <CardContent className="pt-0 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="p-3.5 bg-accent/10 rounded-2xl text-accent">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-foreground">No Shopping Lists</h3>
                        <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                          {searchQuery.trim() 
                            ? 'No lists match your search query.' 
                            : 'Plan your grocery store runs. Create a shopping list to get started.'}
                        </p>
                      </div>
                      {!searchQuery.trim() && (
                        <Button 
                          onClick={handleCreateList}
                          variant="secondary" 
                          className="text-xs font-bold px-5 h-9 rounded-xl border border-border mt-2 cursor-pointer hover:bg-muted active:scale-[0.98]"
                        >
                          Create First List
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5 select-none">
                  {filteredActiveLists.map((list) => {
                    return (
                      <Card key={list.id} className="relative overflow-hidden bg-card/65 dark:bg-card/25 border-border hover:bg-card transition-all duration-200">
                        <CardContent className="pt-4 pb-4 px-4 flex items-center justify-between">
                          <Link to={`/modules/shopping/list/${list.id}`} className="flex-1 flex flex-col space-y-0.5 text-left min-w-0 pr-4">
                            <h3 className="text-sm font-bold text-foreground leading-tight truncate">{list.name}</h3>
                            <div className="flex items-center space-x-2 text-[10px] text-muted-foreground font-semibold">
                              <span>{list.remainingCount} remaining</span>
                              <span>•</span>
                              <span>{list.purchasedCount} purchased</span>
                            </div>
                          </Link>
                          
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-xs font-bold text-accent tabular-nums mr-2">
                              {currency}{list.actualTotal.toFixed(2)}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleDuplicateList(list.id)}
                                className="p-1.5 rounded-lg hover:bg-card border border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                title="Duplicate list"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteList(list.id, list.name)}
                                className="p-1.5 rounded-lg hover:bg-card border border-border/20 text-red-500 hover:bg-red-500/5 transition-all cursor-pointer"
                                title="Delete list"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: TEMPLATES SCREEN */}
          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={animationsEnabled ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={animationsEnabled ? { opacity: 0, y: -10 } : { opacity: 0, y: 0 }}
              transition={transition}
              className="flex-1 flex flex-col space-y-4 pb-16"
            >
              <div className="flex items-center justify-between shrink-0 select-none">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reusable Templates</span>
                <Button 
                  onClick={handleCreateTemplate}
                  size="sm"
                  variant="primary" 
                  className="rounded-xl h-8 text-[11px] font-bold cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  New Template
                </Button>
              </div>

              {filteredTemplates.length === 0 ? (
                <div className="flex-1 flex items-center justify-center select-none py-10">
                  <Card className="border-dashed border-border bg-transparent shadow-none w-full max-w-sm py-10">
                    <CardContent className="pt-0 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="p-3.5 bg-accent/10 rounded-2xl text-accent">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-foreground">No Templates</h3>
                        <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                          {searchQuery.trim() 
                            ? 'No templates match your search query.' 
                            : 'Save reusable shopping list patterns (e.g. Monthly Grocery, Gym Diet).'}
                        </p>
                      </div>
                      {!searchQuery.trim() && (
                        <Button 
                          onClick={handleCreateTemplate}
                          variant="secondary" 
                          className="text-xs font-bold px-5 h-9 rounded-xl border border-border mt-2 cursor-pointer hover:bg-muted active:scale-[0.98]"
                        >
                          Create First Template
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5 select-none">
                  {filteredTemplates.map((template) => (
                    <Card key={template.id} className="relative overflow-hidden bg-card/65 dark:bg-card/25 border-border hover:bg-card transition-all duration-200">
                      <CardContent className="pt-5 pb-4 px-5 space-y-4 text-left">
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col space-y-0.5">
                            <h3 className="text-sm font-bold text-foreground line-clamp-1">{template.name}</h3>
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              Contains {template.itemsCount} templates items
                            </span>
                          </div>
                          
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleDeleteTemplate(template.id, template.name)}
                              className="p-1.5 rounded-lg hover:bg-card border border-border/20 text-red-500 hover:bg-red-500/5 transition-all cursor-pointer animate-none"
                              title="Delete template"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Use template trigger */}
                        <div className="pt-3 border-t border-border/40">
                          <Button 
                            onClick={() => handleUseTemplate(template.id, template.name)}
                            variant="secondary" 
                            className="w-full flex justify-between items-center h-10 px-4 text-xs font-bold bg-muted/60 dark:bg-card/50 rounded-xl hover:bg-muted active:scale-[0.98] border border-border cursor-pointer"
                          >
                            <span>Use Template to Shop</span>
                            <ArrowRight className="w-4 h-4 text-accent" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: HISTORY SCREEN */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={animationsEnabled ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={animationsEnabled ? { opacity: 0, y: -10 } : { opacity: 0, y: 0 }}
              transition={transition}
              className="flex-1 flex flex-col space-y-4 pb-16"
            >
              <div className="flex items-center justify-between shrink-0 select-none">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Completed Sessions</span>
                <span className="text-[10px] font-bold text-muted-foreground">{completedLists.length} entries</span>
              </div>

              {filteredCompletedLists.length === 0 ? (
                <div className="flex-1 flex items-center justify-center select-none py-10">
                  <Card className="border-dashed border-border bg-transparent shadow-none w-full max-w-sm py-10">
                    <CardContent className="pt-0 flex flex-col items-center justify-center text-center space-y-3">
                      <div className="p-3.5 bg-accent/10 rounded-2xl text-accent">
                        <FileSpreadsheet className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-foreground">No Completed Sessions</h3>
                        <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                          {searchQuery.trim() 
                            ? 'No history matches your search query.' 
                            : 'Every shopping list you mark as completed is archived here for read-only references.'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5 select-none">
                  {filteredCompletedLists.map((list) => {
                    return (
                      <Card key={list.id} className="relative overflow-hidden bg-card/60 dark:bg-card/20 border-border hover:bg-card transition-all duration-200">
                        <CardContent className="pt-4 pb-4 px-4 flex items-center justify-between">
                          <Link to={`/modules/shopping/history/${list.id}`} className="flex-1 flex flex-col space-y-0.5 text-left min-w-0 pr-4">
                            <h3 className="text-sm font-bold text-foreground leading-tight truncate">{list.name}</h3>
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              {list.purchasedCount}/{list.totalItems} items completed
                            </span>
                          </Link>
                          
                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-xs font-bold text-accent tabular-nums mr-2">
                              {currency}{list.actualTotal.toFixed(2)}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleDuplicateList(list.id)}
                                className="p-1.5 rounded-lg hover:bg-card border border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                title="Reopen as Active"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteList(list.id, list.name)}
                                className="p-1.5 rounded-lg hover:bg-card border border-border/20 text-red-500 hover:bg-red-500/5 transition-all cursor-pointer"
                                title="Delete list history"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ShoppingSettingsDialog isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Custom Confirm Dialog */}
      <Dialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
      >
        <div className="pt-2 flex justify-end space-x-3 select-none">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            className="cursor-pointer font-bold text-xs rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmDialog.variant === 'danger' ? 'secondary' : 'primary'}
            className={`cursor-pointer font-bold text-xs rounded-xl ${
              confirmDialog.variant === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white border-0' : ''
            }`}
            onClick={() => {
              confirmDialog.onConfirm()
              setConfirmDialog(prev => ({ ...prev, isOpen: false }))
            }}
          >
            {confirmDialog.confirmText || 'Confirm'}
          </Button>
        </div>
      </Dialog>

      {/* Custom Prompt Dialog */}
      <Dialog
        isOpen={promptDialog.isOpen}
        onClose={() => setPromptDialog(prev => ({ ...prev, isOpen: false }))}
        title={promptDialog.title}
        description={promptDialog.description}
      >
        <div className="space-y-4 pt-2 text-left pb-2 select-none">
          <Input
            type="text"
            value={promptDialog.value}
            onChange={(e) => setPromptDialog(prev => ({ ...prev, value: e.target.value }))}
            placeholder={promptDialog.placeholder}
            className="w-full font-semibold"
            autoFocus
          />
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setPromptDialog(prev => ({ ...prev, isOpen: false }))}
              className="cursor-pointer font-bold text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!promptDialog.value.trim()}
              onClick={() => {
                promptDialog.onConfirm(promptDialog.value.trim())
                setPromptDialog(prev => ({ ...prev, isOpen: false }))
              }}
              className="cursor-pointer font-bold text-xs rounded-xl"
            >
              Submit
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

// Simple imported settings helper to bypass local variables
import { useSettingsStore } from '@/core/settings/settingsStore'

export default ShoppingModulePage
