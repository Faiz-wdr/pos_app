import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Wallet } from 'lucide-react'
import { ModuleOptionsMenu } from '@/components/ModuleOptionsMenu'
import { Card, CardContent } from '@/components/ui/Card'

export const IncomeModulePage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-between w-full h-full relative select-none overflow-hidden">
      {/* Top Header Navigation Bar */}
      <header className="flex items-center justify-between w-full px-4 py-2.5 shrink-0 bg-background/90 dark:bg-background/80 backdrop-blur-xs border-b border-border/40 z-30 select-none">
        <div className="flex items-center space-x-2.5">
          <Link
            to="/modules"
            className="p-1.5 rounded-full hover:bg-card border border-border/20 text-muted-foreground hover:text-foreground transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-accent shrink-0"
            aria-label="Back to POS modules"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <span className="text-sm font-extrabold text-foreground tracking-tight">
            Income Manager
          </span>
        </div>

        <ModuleOptionsMenu />
      </header>

      {/* Clean Slate Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <Card className="border-dashed border-border bg-transparent shadow-none max-w-sm py-12">
          <CardContent className="pt-0 flex flex-col items-center justify-center text-center space-y-3">
            <div className="p-4 bg-accent/10 rounded-2xl text-accent">
              <Wallet className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">Income Manager</h3>
              <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                Clean slate ready for rebuild.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default IncomeModulePage
