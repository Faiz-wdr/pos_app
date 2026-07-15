import React from 'react'
import { Settings as SettingsIcon, Save } from 'lucide-react'
import { PageContainer } from '../components/PageContainer'
import { SectionTitle } from '../components/SectionTitle'
import { EmptyState } from '../components/EmptyState'
import { ActionButton } from '../components/ActionButton'

export const SettingsPage: React.FC = () => {
  return (
    <PageContainer>
      <SectionTitle
        title="Admin Settings"
        subtitle="Configure general app parameters, API gateways, database indexes, and PWA manifest attributes."
        actions={
          <ActionButton icon={Save} onClick={() => {}}>
            Save Changes
          </ActionButton>
        }
      />
      <EmptyState
        title="Settings Template Empty"
        description="Configuration parameters for Firestore database endpoints, auth thresholds, and premium flags will show here."
        icon={SettingsIcon}
      />
    </PageContainer>
  )
}

export default SettingsPage
