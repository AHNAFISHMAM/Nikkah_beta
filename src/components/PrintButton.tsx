import { Printer } from 'lucide-react'
import { Button } from './ui/button'

interface PrintButtonProps {
  onClick?: () => void
  className?: string
}

export function PrintButton({ onClick, className }: PrintButtonProps) {
  const handlePrint = () => {
    if (onClick) {
      onClick()
    }
    window.print()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className={`print:hidden ${className || ''}`}
    >
      <Printer className="h-4 w-4 mr-2" />
      Print Worksheet
    </Button>
  )
}
