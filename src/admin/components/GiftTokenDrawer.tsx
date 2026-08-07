import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GiftToken } from '../types'
import { X, Gift, Calendar, User, Copy, Check, Info } from 'lucide-react'

interface GiftTokenDrawerProps {
  token: GiftToken | null
  onClose: () => void
}

export const GiftTokenDrawer: React.FC<GiftTokenDrawerProps> = ({ token, onClose }) => {
  const [copied, setCopied] = useState(false)

  if (!token) return null

  const handleCopyUrl = async () => {
    const redeemUrl = `${window.location.origin}/redeem?token=${token.token}`
    try {
      await navigator.clipboard.writeText(redeemUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const formatDate = (dateStr: any) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black z-50 cursor-pointer"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="fixed top-0 right-0 h-screen w-full sm:max-w-md bg-card border-l border-border z-50 flex flex-col shadow-2xl select-none text-left"
      >
        {/* Header */}
        <div className="h-16 border-b border-border/60 flex items-center justify-between px-6 shrink-0 bg-muted/20">
          <div className="flex items-center space-x-2">
            <Gift className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-foreground">Gift Token Details</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground border border-border/40 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Token Card */}
          <div className="bg-muted/30 border border-border/40 p-4 rounded-2xl space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">Token Code</span>
                <p className="font-mono text-xs text-foreground truncate select-all font-bold pt-0.5">{token.token}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40 flex items-center justify-between">
              <span className={`inline-block text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-md ${
                token.status === 'Redeemed' 
                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/10' 
                  : 'bg-amber-500/15 text-amber-500 border border-amber-500/10'
              }`}>
                {token.status}
              </span>

              <button
                onClick={handleCopyUrl}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-accent text-black font-bold text-[10px] rounded-lg transition-all active:scale-95 cursor-pointer hover:bg-accent/90"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link' : 'Copy Redeem Link'}</span>
              </button>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-3.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-1">
              Token Metadata
            </h4>
            
            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="flex justify-between items-center bg-muted/15 p-2.5 rounded-lg border border-border/20">
                <span className="text-muted-foreground">Gift Name</span>
                <span className="font-bold text-foreground capitalize">{token.gift}</span>
              </div>
              <div className="flex justify-between items-center bg-muted/15 p-2.5 rounded-lg border border-border/20">
                <span className="text-muted-foreground">Campaign Campaign</span>
                <span className="font-bold text-foreground">{token.campaign}</span>
              </div>
              <div className="flex justify-between items-center bg-muted/15 p-2.5 rounded-lg border border-border/20">
                <span className="text-muted-foreground flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Created Date</span>
                </span>
                <span className="text-foreground">{formatDate(token.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Redemption Info (If claimed) */}
          {token.status === 'Redeemed' && (
            <div className="space-y-3.5 animate-in fade-in duration-250">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 border-b border-emerald-500/20 pb-1">
                Redemption Details
              </h4>
              
              <div className="grid grid-cols-1 gap-2.5 text-xs">
                <div className="flex justify-between items-center bg-muted/15 p-2.5 rounded-lg border border-border/20">
                  <span className="text-muted-foreground flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Redeemed By Email</span>
                  </span>
                  <span className="font-bold text-foreground truncate max-w-[200px]">{token.redeemedEmail || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center bg-muted/15 p-2.5 rounded-lg border border-border/20">
                  <span className="text-muted-foreground">Redeemed User UID</span>
                  <span className="font-mono text-[10px] text-foreground select-all">{token.redeemedByUserId || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center bg-muted/15 p-2.5 rounded-lg border border-border/20">
                  <span className="text-muted-foreground flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Redeemed Date</span>
                  </span>
                  <span className="text-foreground">{formatDate(token.redeemedAt)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Guidelines info */}
          <div className="p-3 bg-blue-500/5 text-blue-400 border border-blue-500/10 rounded-xl text-[10px] leading-normal flex items-start space-x-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              This gift token grants a lifetime Pro membership. Once redeemed, it cannot be transferred, revoked, or claimed again.
            </span>
          </div>
        </div>
      </motion.div>
    </>
  )
}
export default GiftTokenDrawer
