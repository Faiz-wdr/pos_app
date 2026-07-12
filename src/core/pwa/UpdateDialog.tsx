import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { usePWAUpdate } from './usePWAUpdate'
import { Rocket, ArrowRight, CheckCircle2 } from 'lucide-react'

export const UpdateDialog = () => {
  const { isUpdateAvailable, currentVersion, latestVersion, releaseNotes, updateNow, dismissUpdate, loading } = usePWAUpdate()

  return (
    <Dialog
      isOpen={isUpdateAvailable}
      onClose={dismissUpdate}
      title={
        <div className="flex items-center space-x-2 text-amber-500 font-bold select-none">
          <Rocket className="w-5 h-5 animate-bounce" />
          <span>Update Available</span>
        </div>
      }
      description="A new version of Personal OS is ready for installation."
    >
      <div className="space-y-5 pt-1 select-text">
        {/* Version Compare Tags */}
        <div className="flex items-center justify-center space-x-3 p-3 bg-muted/65 dark:bg-card border border-border/80 rounded-2xl select-none font-semibold text-xs text-muted-foreground">
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/75 font-bold">Current</span>
            <span className="text-foreground text-sm font-bold mt-0.5">v{currentVersion}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-accent animate-pulse shrink-0" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-accent font-bold">Available</span>
            <span className="text-accent text-sm font-bold mt-0.5">v{latestVersion}</span>
          </div>
        </div>

        {/* Release Notes list */}
        {releaseNotes && releaseNotes.length > 0 && (
          <div className="space-y-2.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1 select-none">
              What's New
            </label>
            <div className="border border-border/80 rounded-2xl p-4 bg-muted/20 space-y-2">
              {releaseNotes.map((note, index) => (
                <div key={index} className="flex items-start space-x-2 text-xs text-foreground/90 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Option action buttons */}
        <div className="flex items-center space-x-3 pt-2 select-none">
          <Button
            onClick={updateNow}
            disabled={loading}
            className="flex-1 font-bold uppercase text-xs tracking-wider h-12 rounded-xl bg-amber-500 text-black hover:bg-amber-600 border-none shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            {loading ? 'Updating...' : 'Update Now'}
          </Button>
          <Button
            onClick={dismissUpdate}
            variant="outline"
            disabled={loading}
            className="flex-1 font-bold uppercase text-xs tracking-wider h-12 rounded-xl border border-border/60 hover:bg-muted active:scale-[0.98] transition-all cursor-pointer"
          >
            Later
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default UpdateDialog
