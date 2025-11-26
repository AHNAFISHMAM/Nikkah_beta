import { useState } from 'react'
import { SEO } from '../../components/SEO'
import { PAGE_SEO } from '../../lib/seo'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs'
import { BudgetCalculator } from '../../components/financial/BudgetCalculator'
import { MahrTracker } from '../../components/financial/MahrTracker'
import { WeddingBudget } from '../../components/financial/WeddingBudget'
import { SavingsGoals } from '../../components/financial/SavingsGoals'
import { Calculator, Heart, Calendar, Target } from 'lucide-react'

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState('budget')

  return (
    <div className="space-y-6">
      <SEO
        title={PAGE_SEO.financial.title}
        description={PAGE_SEO.financial.description}
        path="/dashboard/financial"
        noIndex
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-0.5 sm:space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Financial Planning</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your household budget, mahr, wedding expenses, and savings goals
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
          <TabsTrigger value="budget" className="flex items-center gap-2 min-h-[44px]">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Budget</span>
            <span className="sm:hidden">Budget</span>
          </TabsTrigger>
          <TabsTrigger value="mahr" className="flex items-center gap-2 min-h-[44px]">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Mahr</span>
            <span className="sm:hidden">Mahr</span>
          </TabsTrigger>
          <TabsTrigger value="wedding" className="flex items-center gap-2 min-h-[44px]">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Wedding</span>
            <span className="sm:hidden">Wedding</span>
          </TabsTrigger>
          <TabsTrigger value="savings" className="flex items-center gap-2 min-h-[44px]">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Savings</span>
            <span className="sm:hidden">Savings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="budget" className="mt-6">
          <BudgetCalculator />
        </TabsContent>

        <TabsContent value="mahr" className="mt-6">
          <MahrTracker />
        </TabsContent>

        <TabsContent value="wedding" className="mt-6">
          <WeddingBudget />
        </TabsContent>

        <TabsContent value="savings" className="mt-6">
          <SavingsGoals />
        </TabsContent>
      </Tabs>
    </div>
  )
}
