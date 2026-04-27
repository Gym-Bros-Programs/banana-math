import { describe, it, expect } from 'vitest'
import { formatOperatorSet, formatDate } from './formatters'

describe('Formatters', () => {
  describe('formatOperatorSet', () => {
    it('formats a set of operators correctly', () => {
      expect(formatOperatorSet(['addition', 'subtraction'])).toBe('+ −')
    })

    it('returns empty string for null or undefined', () => {
      expect(formatOperatorSet(null)).toBe('')
      expect(formatOperatorSet(undefined)).toBe('')
    })

    it('handles unknown operators gracefully', () => {
      expect(formatOperatorSet(['unknown' as any])).toBe('unknown')
    })
  })

  describe('formatDate', () => {
    it('formats a valid ISO date', () => {
      const date = '2024-01-01T12:00:00Z'
      // Use contain to avoid locale issues in different environments
      expect(formatDate(date)).toContain('2024')
    })

    it('returns the input if date is invalid', () => {
      expect(formatDate('invalid-date')).toBe('invalid-date')
    })
  })
})
