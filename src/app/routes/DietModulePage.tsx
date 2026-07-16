import { CalendarCheck, CheckSquare, Clock, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export const DietModulePage = () => {
  return (
    <div className="flex-1 flex flex-col space-y-6 pb-6 select-none text-left">
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">Premium Feature Unlocked</span>
        <h1 className="text-2xl font-bold text-foreground mt-0.5 tracking-tight flex items-center space-x-2">
          <CalendarCheck className="w-6 h-6 text-accent shrink-0" />
          <span>Day Planner</span>
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-card/50 text-center">
          <CardContent className="pt-4 flex flex-col items-center space-y-1">
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Tasks Done</span>
            <span className="text-xs font-bold text-foreground">5 / 8</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 text-center">
          <CardContent className="pt-4 flex flex-col items-center space-y-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Focus Time</span>
            <span className="text-xs font-bold text-foreground">4.5 hrs</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 text-center">
          <CardContent className="pt-4 flex flex-col items-center space-y-1">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Active Habits</span>
            <span className="text-xs font-bold text-foreground">3 / 4</span>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Daily Schedule</label>
        <Card className="bg-card/50">
          <CardContent className="pt-5 space-y-4 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Morning Standup</span>
              <span className="text-foreground">09:00 AM - Standup & Tasks</span>
            </div>
            <hr className="border-border/60" />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Focus Block</span>
              <span className="text-foreground">11:00 AM - Feature Work</span>
            </div>
            <hr className="border-border/60" />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Wrap-up</span>
              <span className="text-foreground">05:30 PM - Backlog Sync</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DietModulePage
