import React from 'react'
import { GitBranch, Plus } from 'lucide-react'
import { PageContainer } from '../components/PageContainer'
import { SectionTitle } from '../components/SectionTitle'
import { EmptyState } from '../components/EmptyState'
import { ActionButton } from '../components/ActionButton'

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
      <EmptyState
        title="No Published Changelogs"
        description="Version configurations, deployment logs, and active PWA update notes will display here."
        icon={GitBranch}
      />
    </PageContainer>
  )
}

export default ReleasesPage
