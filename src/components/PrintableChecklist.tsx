interface ChecklistItem {
  id: string
  title: string
  description: string | null
  category_id: string
}

interface ChecklistCategory {
  id: string
  name: string
  order_index: number
}

interface PrintableChecklistProps {
  items: ChecklistItem[]
  categories: ChecklistCategory[]
  completedIds: Set<string>
  showCompleted?: boolean
}

export function PrintableChecklist({
  items,
  categories,
  completedIds,
  showCompleted = true,
}: PrintableChecklistProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const completedCount = completedIds.size
  const totalItems = items.length
  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

  return (
    <div className="hidden print:block worksheet">
      {/* Header */}
      <div className="worksheet-header">
        <div className="worksheet-title">NikahPrep - Marriage Readiness Checklist</div>
        <div className="worksheet-subtitle">
          Printed on {currentDate} | Progress: {progress}% ({completedCount}/{totalItems} completed)
        </div>
      </div>

      {/* Categories and Items */}
      {categories.map((category) => {
        const categoryItems = items.filter((item) => item.category_id === category.id)
        const displayItems = showCompleted
          ? categoryItems
          : categoryItems.filter((item) => !completedIds.has(item.id))

        if (displayItems.length === 0) return null

        return (
          <div key={category.id} className="worksheet-section">
            <div className="worksheet-section-title">{category.name}</div>
            {displayItems.map((item) => {
              const isCompleted = completedIds.has(item.id)
              return (
                <div key={item.id} className="worksheet-item">
                  <div className={`worksheet-checkbox ${isCompleted ? 'checked' : ''}`} />
                  <div className="worksheet-item-text">
                    <div className="worksheet-item-title">{item.title}</div>
                    {item.description && (
                      <div className="worksheet-item-desc">{item.description}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Notes Section */}
      <div className="worksheet-section">
        <div className="worksheet-section-title">Notes</div>
        <div className="worksheet-notes-area" />
      </div>

      {/* Footer */}
      <div className="worksheet-footer">
        NikahPrep - Preparing Hearts for Marriage | nikahprep.com
      </div>
    </div>
  )
}
