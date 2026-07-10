import { Salad, Activity, Flame, Apple } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export const DietModulePage = () => {
  return (
    <div className="flex-1 flex flex-col space-y-6 pb-6 select-none text-left">
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">Premium Feature Unlocked</span>
        <h1 className="text-2xl font-black text-foreground mt-0.5 tracking-tight flex items-center space-x-2">
          <Salad className="w-6 h-6 text-accent shrink-0" />
          <span>Diet Planner</span>
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-card/50 text-center">
          <CardContent className="pt-4 flex flex-col items-center space-y-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Calories</span>
            <span className="text-xs font-bold text-foreground">1,820 kcal</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 text-center">
          <CardContent className="pt-4 flex flex-col items-center space-y-1">
            <Activity className="w-4 h-4 text-red-500" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Proteins</span>
            <span className="text-xs font-bold text-foreground">84g</span>
          </CardContent>
        </Card>
        <Card className="bg-card/50 text-center">
          <CardContent className="pt-4 flex flex-col items-center space-y-1">
            <Apple className="w-4 h-4 text-green-500" />
            <span className="text-[9px] font-bold text-muted-foreground uppercase">Carbs</span>
            <span className="text-xs font-bold text-foreground">210g</span>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Meal Schedule</label>
        <Card className="bg-card/50">
          <CardContent className="pt-5 space-y-4 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Breakfast</span>
              <span className="text-foreground">Oatmeal & Banana</span>
            </div>
            <hr className="border-border/60" />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Lunch</span>
              <span className="text-foreground">Grilled Chicken Salad</span>
            </div>
            <hr className="border-border/60" />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Dinner</span>
              <span className="text-foreground">Baked Salmon & Broccoli</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DietModulePage
