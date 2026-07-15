import React from 'react'
import { CreditCard, Download } from 'lucide-react'
import { PageContainer } from '../components/PageContainer'
import { SectionTitle } from '../components/SectionTitle'
import { EmptyState } from '../components/EmptyState'
import { ActionButton } from '../components/ActionButton'

export const PaymentsPage: React.FC = () => {
  return (
    <PageContainer>
      <SectionTitle
        title="Payments"
        subtitle="Track subscription transactions, invoice logs, and premium unlocks."
        actions={
          <ActionButton icon={Download} onClick={() => {}} variant="outline">
            Export Invoices
          </ActionButton>
        }
      />
      <EmptyState
        title="Transaction Registry Empty"
        description="Premium upgrade records, transactions, and stripe webhooks status will display here."
        icon={CreditCard}
      />
    </PageContainer>
  )
}

export default PaymentsPage
