import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { queryClient } from '../../lib/queryClient'
import HomePage from '../Home'

const AllTheProviders = ({ children }) => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>{children}</ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

describe('HomePage', () => {
  it('renders welcome message', () => {
    render(<HomePage />, { wrapper: AllTheProviders })
    expect(screen.getByText(/Welcome to My App/i)).toBeInTheDocument()
  })
})

