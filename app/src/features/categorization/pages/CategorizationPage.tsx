import { CategorizationFlow } from '@/features/categorization/components/CategorizationFlow'

export function CategorizationPage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Catégorise tes dépenses</h1>
      </div>
      <CategorizationFlow />
    </div>
  )
}
