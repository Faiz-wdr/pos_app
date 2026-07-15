import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/Input'

interface SearchBarProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = ''
}) => {
  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-9.5 h-10 w-full bg-card border-border/80 focus-visible:ring-1 focus-visible:ring-accent rounded-xl text-xs"
      />
    </div>
  )
}

export default SearchBar
