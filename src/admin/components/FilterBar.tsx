import React from 'react'
import { Filter, RotateCcw } from 'lucide-react'

interface FilterBarProps {
  roleFilter: string
  setRoleFilter: (role: string) => void
  premiumFilter: string
  setPremiumFilter: (premium: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  sortBy: string
  setSortBy: (sort: string) => void
  pageSize: number
  setPageSize: (size: number) => void
  onReset: () => void
}

export const FilterBar: React.FC<FilterBarProps> = ({
  roleFilter,
  setRoleFilter,
  premiumFilter,
  setPremiumFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  pageSize,
  setPageSize,
  onReset
}) => {
  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 flex flex-col space-y-3.5 select-none w-full">
      <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Filters & Sort</span>
        </div>
        <button
          onClick={onReset}
          className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground hover:text-accent flex items-center space-x-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="flex flex-col space-y-1">
          <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider px-1">Role</label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-2 bg-muted/65 border border-border/60 rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="guest">Guest</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider px-1">Premium</label>
          <select
            value={premiumFilter}
            onChange={(e) => setPremiumFilter(e.target.value)}
            className="h-9 px-2 bg-muted/65 border border-border/60 rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            <option value="all">All States</option>
            <option value="premium">Premium (Pro)</option>
            <option value="free">Free</option>
          </select>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider px-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2 bg-muted/65 border border-border/60 rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="online">Online</option>
            <option value="away">Away</option>
            <option value="offline">Offline</option>
          </select>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider px-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 px-2 bg-muted/65 border border-border/60 rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_active">Most Active</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="premium_first">Premium First</option>
          </select>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider px-1">Limit</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="h-9 px-2 bg-muted/65 border border-border/60 rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
          >
            <option value={25}>25 Users</option>
            <option value={50}>50 Users</option>
            <option value={100}>100 Users</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default FilterBar
