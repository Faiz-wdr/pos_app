import React from 'react'
import { LifeBuoy, HeartHandshake } from 'lucide-react'
import { PageContainer } from '../components/PageContainer'
import { SectionTitle } from '../components/SectionTitle'
import { EmptyState } from '../components/EmptyState'
import { ActionButton } from '../components/ActionButton'

export const SupportPage: React.FC = () => {
  return (
    <PageContainer>
      <SectionTitle
        title="Support Tickets"
        subtitle="Address user queries, bug submissions, and general feedback forms."
        actions={
          <ActionButton icon={HeartHandshake} onClick={() => {}} variant="outline">
            Resolve All
          </ActionButton>
        }
      />
      <EmptyState
        title="No Active Support Tickets"
        description="Help requests, crash logs, and custom feedback reports from standard/premium users will queue here."
        icon={LifeBuoy}
      />
    </PageContainer>
  )
}

export default SupportPage
