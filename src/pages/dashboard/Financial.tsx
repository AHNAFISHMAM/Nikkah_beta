import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3, margin: "0px" }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0 }}
      >
        <div className="space-y-0.5 sm:space-y-1">
          <motion.h1
            className="text-2xl sm:text-3xl font-bold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3, margin: "0px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            Financial Planning
          </motion.h1>
          <motion.p
            className="text-sm sm:text-base text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3, margin: "0px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          >
            Manage your household budget, mahr, wedding expenses, and savings goals
          </motion.p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.8 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto p-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 1.1 }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <TabsTrigger value="budget" className="flex items-center gap-2 min-h-[44px] w-full">
                  <motion.div
                    whileHover={{ rotate: [0, -15, 15, 0] }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <Calculator className="h-4 w-4" />
                  </motion.div>
                  <span className="hidden sm:inline">Budget</span>
                  <span className="sm:hidden">Budget</span>
                </TabsTrigger>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 1.35 }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <TabsTrigger value="mahr" className="flex items-center gap-2 min-h-[44px] w-full">
                  <motion.div
                    whileHover={{ scale: 1.3, rotate: 10 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <Heart className="h-4 w-4" />
                  </motion.div>
                  <span className="hidden sm:inline">Mahr</span>
                  <span className="sm:hidden">Mahr</span>
                </TabsTrigger>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 1.6 }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <TabsTrigger value="wedding" className="flex items-center gap-2 min-h-[44px] w-full">
                  <motion.div
                    whileHover={{ rotate: 20 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <Calendar className="h-4 w-4" />
                  </motion.div>
                  <span className="hidden sm:inline">Wedding</span>
                  <span className="sm:hidden">Wedding</span>
                </TabsTrigger>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 1.85 }}
                whileHover={{ scale: 1.08, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <TabsTrigger value="savings" className="flex items-center gap-2 min-h-[44px] w-full">
                  <motion.div
                    whileHover={{ scale: 1.2, y: -3 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    <Target className="h-4 w-4" />
                  </motion.div>
                  <span className="hidden sm:inline">Savings</span>
                  <span className="sm:hidden">Savings</span>
                </TabsTrigger>
              </motion.div>
            </TabsList>
          </motion.div>

          <div className="mt-6">
            <AnimatePresence mode="wait">
              {activeTab === 'budget' && (
                <TabsContent value="budget" key="budget">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2, margin: "0px" }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    >
                      <BudgetCalculator />
                    </motion.div>
                  </motion.div>
                </TabsContent>
              )}
              {activeTab === 'mahr' && (
                <TabsContent value="mahr" key="mahr">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2, margin: "0px" }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    >
                      <MahrTracker />
                    </motion.div>
                  </motion.div>
                </TabsContent>
              )}
              {activeTab === 'wedding' && (
                <TabsContent value="wedding" key="wedding">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2, margin: "0px" }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    >
                      <WeddingBudget />
                    </motion.div>
                  </motion.div>
                </TabsContent>
              )}
              {activeTab === 'savings' && (
                <TabsContent value="savings" key="savings">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.2, margin: "0px" }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    >
                      <SavingsGoals />
                    </motion.div>
                  </motion.div>
                </TabsContent>
              )}
            </AnimatePresence>
          </div>
        </Tabs>
      </motion.div>
    </div>
  )
}
