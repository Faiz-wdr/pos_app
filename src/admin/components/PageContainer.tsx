import React from 'react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '@/core/settings/settingsStore'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  const animationsEnabled = useSettingsStore((state) => state.animationsEnabled)

  return (
    <motion.div
      initial={animationsEnabled ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex-1 flex flex-col space-y-6 w-full max-w-6xl mx-auto pb-8 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default PageContainer
