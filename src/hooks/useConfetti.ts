import confetti from 'canvas-confetti'

/**
 * Hook for celebratory confetti animations
 * Respects prefers-reduced-motion for accessibility
 */
export function useConfetti() {
  /**
   * Check if user prefers reduced motion
   */
  const prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  /**
   * Standard confetti burst for task completion
   * Uses Islamic color palette: Green + Gold + Purple
   */
  const triggerConfetti = () => {
    if (prefersReducedMotion()) return

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: [
        '#2db87d', // Islamic Green
        '#e6b422', // Islamic Gold
        '#7a3b8c', // Islamic Purple
      ],
    })
  }

  /**
   * Larger celebration for major milestones (100% completion, module finished)
   */
  const triggerCelebration = () => {
    if (prefersReducedMotion()) return

    const duration = 2000
    const animationEnd = Date.now() + duration
    const colors = ['#2db87d', '#e6b422', '#7a3b8c']

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }

  /**
   * Subtle star burst for small wins
   */
  const triggerStars = () => {
    if (prefersReducedMotion()) return

    confetti({
      particleCount: 40,
      spread: 100,
      origin: { y: 0.7 },
      colors: ['#e6b422'], // Gold stars only
      shapes: ['star'],
      scalar: 1.2,
    })
  }

  /**
   * Fireworks effect for ultimate achievement (100% readiness)
   */
  const triggerFireworks = () => {
    if (prefersReducedMotion()) return

    const duration = 3000
    const animationEnd = Date.now() + duration
    const colors = ['#2db87d', '#e6b422', '#7a3b8c', '#ffffff']

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      // Burst from random positions
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
        colors,
      })
    }, 250)
  }

  return {
    triggerConfetti,
    triggerCelebration,
    triggerStars,
    triggerFireworks,
    prefersReducedMotion,
  }
}
