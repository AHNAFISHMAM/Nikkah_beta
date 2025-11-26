import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop component
 * Scrolls to top of page on route change and page refresh
 * Best practice: Use this component to ensure users always start at the top when navigating
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Instant scroll (no animation) for better UX
    })
  }, [pathname])

  // Also handle page refresh/initial load
  useEffect(() => {
    // Ensure scroll is at top on initial mount
    window.scrollTo(0, 0)
  }, [])

  return null
}

