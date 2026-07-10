import { DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export const IncomeModulePage = () => {
  return (
    <div className="flex-1 flex flex-col space-y-6 pb-6 select-none text-left">
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">Premium Feature Unlocked</span>
        <h1 className="text-2xl font-black text-foreground mt-0.5 tracking-tight flex items-center space-x-2">
          <DollarSign className="w-6 h-6 text-accent shrink-0" />
          <span>Income Manager</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <Card className="bg-card/50">
          <CardContent className="pt-4 flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Income</span>
            <div className="flex items-center space-x-1 text-green-500 font-bold text-lg">
              <ArrowUpRight className="w-4 h-4" />
              <span>₹45,200</span>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-4 flex flex-col space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Expenses</span>
            <div className="flex items-center space-x-1 text-red-500 font-bold text-lg">
              <ArrowDownRight className="w-4 h-4" />
              <span>₹18,400</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 relative overflow-hidden">
        <CardContent className="pt-5 space-y-3.5">
          <h3 className="text-xs font-bold text-foreground flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span>Budget Overview</span>
          </h3>
          <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
            <div className="bg-accent h-full w-[40%]" />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
            <span>Spent: ₹18,400</span>
            <span>Limit: ₹50,000</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">Transactions</label>
        <Card className="bg-card/30 border-dashed">
          <CardContent className="pt-5 pb-5 text-center text-xs text-muted-foreground">
            Transactions details are kept local. Cloud sync coming soon.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default IncomeModulePage
