interface BudgetData {
  income_his: number
  income_hers: number
  expense_housing: number
  expense_utilities: number
  expense_transportation: number
  expense_food: number
  expense_insurance: number
  expense_debt: number
  expense_entertainment: number
  expense_dining: number
  expense_clothing: number
  expense_gifts: number
  expense_charity: number
}

interface PrintableBudgetProps {
  budget: BudgetData | null
}

export function PrintableBudget({ budget }: PrintableBudgetProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`
  }

  const totalIncome = (budget?.income_his || 0) + (budget?.income_hers || 0)
  const expenses = [
    { label: 'Housing/Rent', amount: budget?.expense_housing || 0 },
    { label: 'Utilities', amount: budget?.expense_utilities || 0 },
    { label: 'Transportation', amount: budget?.expense_transportation || 0 },
    { label: 'Groceries/Food', amount: budget?.expense_food || 0 },
    { label: 'Insurance', amount: budget?.expense_insurance || 0 },
    { label: 'Debt Payments', amount: budget?.expense_debt || 0 },
    { label: 'Entertainment', amount: budget?.expense_entertainment || 0 },
    { label: 'Dining Out', amount: budget?.expense_dining || 0 },
    { label: 'Clothing', amount: budget?.expense_clothing || 0 },
    { label: 'Gifts', amount: budget?.expense_gifts || 0 },
    { label: 'Charity/Zakat', amount: budget?.expense_charity || 0 },
  ]
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const surplus = totalIncome - totalExpenses

  return (
    <div className="hidden print:block worksheet">
      {/* Header */}
      <div className="worksheet-header">
        <div className="worksheet-title">NikahPrep - Budget Worksheet</div>
        <div className="worksheet-subtitle">
          Printed on {currentDate}
        </div>
      </div>

      {/* Income Section */}
      <div className="worksheet-section">
        <div className="worksheet-section-title">Monthly Income</div>
        <table className="budget-table">
          <thead>
            <tr>
              <th>Source</th>
              <th className="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>His Income</td>
              <td className="amount">{formatCurrency(budget?.income_his || 0)}</td>
            </tr>
            <tr>
              <td>Her Income</td>
              <td className="amount">{formatCurrency(budget?.income_hers || 0)}</td>
            </tr>
            <tr className="budget-total">
              <td>Total Income</td>
              <td className="amount">{formatCurrency(totalIncome)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Expenses Section */}
      <div className="worksheet-section">
        <div className="worksheet-section-title">Monthly Expenses</div>
        <table className="budget-table">
          <thead>
            <tr>
              <th>Category</th>
              <th className="amount">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.label}>
                <td>{expense.label}</td>
                <td className="amount">{formatCurrency(expense.amount)}</td>
              </tr>
            ))}
            <tr className="budget-total">
              <td>Total Expenses</td>
              <td className="amount">{formatCurrency(totalExpenses)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="worksheet-section">
        <div className="worksheet-section-title">Summary</div>
        <table className="budget-table">
          <tbody>
            <tr>
              <td>Total Income</td>
              <td className="amount">{formatCurrency(totalIncome)}</td>
            </tr>
            <tr>
              <td>Total Expenses</td>
              <td className="amount">{formatCurrency(totalExpenses)}</td>
            </tr>
            <tr className="budget-total" style={{ backgroundColor: surplus >= 0 ? '#f0fdf4' : '#fef2f2' }}>
              <td>Monthly Surplus/Deficit</td>
              <td className="amount" style={{ color: surplus >= 0 ? '#22c55e' : '#ef4444' }}>
                {formatCurrency(surplus)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes Section */}
      <div className="worksheet-section">
        <div className="worksheet-section-title">Financial Goals & Notes</div>
        <div className="worksheet-notes-area" />
      </div>

      {/* Footer */}
      <div className="worksheet-footer">
        NikahPrep - Preparing Hearts for Marriage | nikahprep.com
      </div>
    </div>
  )
}
