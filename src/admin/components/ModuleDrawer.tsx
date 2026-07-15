import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AdminModule } from '../hooks/useAdminModules'
import { ActionButton } from './ActionButton'
import { X, Save, Sliders, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'

interface ModuleDrawerProps {
  module: AdminModule | null
  onClose: () => void
  onSave: (updates: Partial<AdminModule>) => Promise<any>
}

export const ModuleDrawer: React.FC<ModuleDrawerProps> = ({
  module,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Utility')
  const [free, setFree] = useState(true)
  const [price, setPrice] = useState(0)
  const [accentColor, setAccentColor] = useState('#f8b518')
  const [icon, setIcon] = useState('Layers')
  const [version, setVersion] = useState('1.0.0')
  const [status, setStatus] = useState<'published' | 'beta' | 'coming-soon' | 'hidden'>('published')
  const [enabled, setEnabled] = useState(true)
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (module) {
      setName(module.name)
      setDescription(module.description)
      setCategory(module.category)
      setFree(module.free)
      setPrice(module.price)
      setAccentColor(module.accentColor)
      setIcon(module.icon)
      setVersion(module.version)
      setStatus(module.status)
      setEnabled(module.enabled)
      setErrorMsg(null)
    }
  }, [module])

  if (!module) return null

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !description) {
      setErrorMsg('Module Name and Description are required.')
      return
    }

    setLoading(true)
    setErrorMsg(null)

    try {
      await onSave({
        name,
        description,
        category,
        free,
        premium: !free,
        price: free ? 0 : Number(price),
        accentColor,
        icon,
        version,
        status,
        enabled
      })
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update module configurations.')
    } finally {
      setLoading(false)
    }
  }

  const iconOptions = ['Clock', 'Hourglass', 'ShoppingCart', 'TrendingUp', 'Heart', 'Layers']

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black z-50 cursor-pointer"
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="fixed top-0 right-0 h-screen w-full sm:max-w-md bg-card border-l border-border z-50 flex flex-col shadow-2xl select-none"
      >
        <div className="h-16 border-b border-border/60 flex items-center justify-between px-6 shrink-0 bg-muted/20">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">Configure Module</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-left">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[11px] leading-relaxed flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Module Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
              Module Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Shopping List"
              className="h-10 bg-muted/20 border-border focus-visible:ring-accent rounded-xl text-xs"
            />
          </div>

          {/* Category & Version */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-2 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              >
                <option value="Utility">Utility</option>
                <option value="Finance">Finance</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Health">Health</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
                Version
              </label>
              <Input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                className="h-10 bg-muted/20 border-border focus-visible:ring-accent rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description of module features..."
              rows={3}
              className="w-full p-3 bg-muted/20 border border-border focus:outline-none focus:ring-1 focus:ring-accent rounded-xl text-xs text-foreground"
            />
          </div>

          {/* Accent Color & Icon */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
                Accent Color
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 bg-transparent border-none rounded-xl cursor-pointer"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  placeholder="#000000"
                  maxLength={7}
                  className="h-10 bg-muted/20 border-border focus-visible:ring-accent rounded-xl text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
                Icon Component
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full h-10 px-2 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
              >
                {iconOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing Config */}
          <div className="space-y-2 border-t border-border/40 pt-4">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
              Entitlements & Pricing (INR)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => { setFree(true); setPrice(0); }}
                className={`p-3 rounded-xl border text-center font-semibold text-xs transition-all active:scale-95 cursor-pointer ${
                  free 
                    ? 'bg-accent/10 border-accent text-accent' 
                    : 'bg-muted/25 border-border hover:bg-muted/40'
                }`}
              >
                Free Module
              </button>
              <button
                type="button"
                onClick={() => setFree(false)}
                className={`p-3 rounded-xl border text-center font-semibold text-xs transition-all active:scale-95 cursor-pointer ${
                  !free 
                    ? 'bg-accent/10 border-accent text-accent' 
                    : 'bg-muted/25 border-border hover:bg-muted/40'
                }`}
              >
                Premium (PRO)
              </button>
            </div>
            
            {!free && (
              <div className="space-y-1 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
                  One-time Price (₹ INR)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="299"
                  className="h-10 bg-muted/20 border-border focus-visible:ring-accent rounded-xl text-xs"
                />
              </div>
            )}
          </div>

          {/* Status & Flag dropdown */}
          <div className="space-y-2 border-t border-border/40 pt-4">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">
              Release Lifecycle State
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full h-10 px-2 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                >
                  <option value="published">Published</option>
                  <option value="beta">Beta (Sandbox)</option>
                  <option value="coming-soon">Coming Soon</option>
                  <option value="hidden">Archived (Hidden)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block px-0.5">Visibility State</label>
                <select
                  value={enabled ? 'true' : 'false'}
                  onChange={(e) => setEnabled(e.target.value === 'true')}
                  className="w-full h-10 px-2 bg-muted/30 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                >
                  <option value="true">Active (Visible)</option>
                  <option value="false">Disabled (Maint.)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 flex space-x-3.5">
            <ActionButton
              type="submit"
              loading={loading}
              icon={Save}
              className="flex-1 h-11 bg-accent text-black hover:bg-accent/90 border-none font-bold uppercase tracking-wider text-xs shadow-md mt-2 rounded-xl cursor-pointer"
            >
              Save Configuration
            </ActionButton>
          </div>
        </form>
      </motion.div>
    </>
  )
}

export default ModuleDrawer
