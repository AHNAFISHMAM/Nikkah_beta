import jsPDF from 'jspdf'

/**
 * Generate PDF from module content
 * Best practices: Clean formatting, includes notes, completion status
 */
export async function generateModulePDF(
  moduleTitle: string,
  moduleDescription: string,
  moduleContent: string,
  userNotes: string,
  isCompleted: boolean,
  completedAt?: string | null
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const maxWidth = pageWidth - 2 * margin
  let yPosition = margin

  // Helper function to add new page if needed
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      doc.addPage()
      yPosition = margin
      return true
    }
    return false
  }

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number, isBold = false, color?: [number, number, number]) => {
    doc.setFontSize(fontSize)
    if (isBold) {
      doc.setFont(undefined, 'bold')
    } else {
      doc.setFont(undefined, 'normal')
    }
    if (color) {
      doc.setTextColor(color[0], color[1], color[2])
    } else {
      doc.setTextColor(0, 0, 0)
    }

    const lines = doc.splitTextToSize(text, maxWidth)
    lines.forEach((line: string) => {
      checkNewPage(7)
      doc.text(line, margin, yPosition)
      yPosition += 7
    })
  }

  // Helper to strip HTML and convert to plain text
  const stripHTML = (html: string): string => {
    if (typeof document === 'undefined') {
      // Fallback for server-side rendering
      return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
    }
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  // Header with brand color
  doc.setFillColor(0, 255, 135) // Brand green
  doc.rect(0, 0, pageWidth, 30, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('Module Summary', margin, 20)

  yPosition = 40

  // Module Title
  doc.setTextColor(0, 0, 0)
  addText(moduleTitle, 18, true)
  yPosition += 5

  // Description
  if (moduleDescription) {
    addText(moduleDescription, 12)
    yPosition += 5
  }

  // Completion Status
  if (isCompleted) {
    doc.setFillColor(0, 200, 0)
    doc.circle(margin + 5, yPosition, 3, 'F')
    addText('Status: Completed', 12, true, [0, 150, 0])
    if (completedAt) {
      addText(`Completed on: ${new Date(completedAt).toLocaleDateString()}`, 10)
    }
  } else {
    doc.setFillColor(200, 200, 200)
    doc.circle(margin + 5, yPosition, 3, 'F')
    addText('Status: In Progress', 12, true, [100, 100, 100])
  }
  yPosition += 10

  // Generated date
  addText(`Generated on: ${new Date().toLocaleDateString()}`, 10)
  yPosition += 10

  // Divider
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  // Module Content (convert HTML to plain text)
  const plainContent = stripHTML(moduleContent)
    .replace(/\s+/g, ' ')
    .trim()

  addText('Module Content:', 14, true)
  yPosition += 5
  
  // Split content into chunks to avoid overwhelming the PDF
  const contentChunks = plainContent.match(/.{1,2000}/g) || [plainContent]
  contentChunks.forEach((chunk, index) => {
    if (index > 0) {
      checkNewPage(15)
      yPosition += 5
    }
    addText(chunk, 11)
  })
  
  yPosition += 10

  // User Notes
  if (userNotes && userNotes.trim()) {
    checkNewPage(20)
    doc.setDrawColor(200, 200, 200)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 10

    addText('Your Notes:', 14, true)
    yPosition += 5
    const noteChunks = userNotes.match(/.{1,2000}/g) || [userNotes]
    noteChunks.forEach((chunk, index) => {
      if (index > 0) {
        checkNewPage(15)
        yPosition += 5
      }
      addText(chunk, 11)
    })
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${totalPages} - NikahPrep Module Summary`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
  }

  // Save PDF
  const fileName = `${moduleTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

