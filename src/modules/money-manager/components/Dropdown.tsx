import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface DropdownOption<T> {
  label: string
  value: T
}

interface DropdownProps<T> {
  value: T
  onChange: (val: T) => void
  options: DropdownOption<T>[]
  className?: string
  align?: 'left' | 'right'
}

export const Dropdown = <T extends string | number>({
  value,
  onChange,
  options,
  className = '',
  align = 'right'
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeOption = options.find((o) => o.value === value)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative inline-block text-left select-none">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-9 px-3 bg-muted/40 hover:bg-muted border border-border/60 text-xs font-bold text-foreground rounded-xl flex items-center justify-between space-x-2.5 transition-colors cursor-pointer active:scale-95 ${className}`}
      >
        <span>{activeOption ? activeOption.label : String(value)}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
      </button>

      {isOpen && (
        <div
          className={`absolute mt-1.5 min-w-[140px] bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-accent/10 text-accent font-extrabold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Dropdown
