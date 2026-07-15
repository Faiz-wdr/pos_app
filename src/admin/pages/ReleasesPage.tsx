import React from 'react'
import { GitBranch, Plus, CheckCircle2 } from 'lucide-react'
import { PageContainer } from '../components/PageContainer'
import { SectionTitle } from '../components/SectionTitle'
import { ActionButton } from '../components/ActionButton'
import { releaseNotes } from '@/config/releases'

export const ReleasesPage: React.FC = () => {
  return (
    <PageContainer>
      <SectionTitle
        title="Releases"
        subtitle="Manage app updates, publish releases.ts changelogs, and notify active PWA sessions."
        actions={
          <ActionButton icon={Plus} onClick={() => {}}>
            Publish Release
          </ActionButton>
        }
      />
      
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 select-text">
        <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4 select-none">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-accent/10 text-accent rounded-xl border border-accent/20">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Current Active Release</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Production build target version</p>
            </div>
          </div>
          <span className="text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full uppercase tracking-wider">
            v{releaseNotes.version}
          </span>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">
            Release Changelog
          </h4>
          <div className="space-y-3">
            {releaseNotes.changes.map((change, index) => (
              <div key={index} className="flex items-start space-x-3 text-xs text-foreground/90 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default ReleasesPage

