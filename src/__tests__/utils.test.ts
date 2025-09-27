import { describe, expect, it } from '@jest/globals'
import { calculateDuration, generateId, triggerHaptic } from '../utils'

// Mock react-native
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  Vibration: {
    vibrate: jest.fn(),
  },
}))

describe('utils', () => {
  describe('calculateDuration', () => {
    it('should return 2000 for short duration', () => {
      expect(calculateDuration('short')).toBe(2000)
    })

    it('should return 3500 for long duration', () => {
      expect(calculateDuration('long')).toBe(3500)
    })

    it('should return number duration as-is', () => {
      expect(calculateDuration(5000)).toBe(5000)
    })

    it('should return 2000 for undefined', () => {
      expect(calculateDuration(undefined)).toBe(2000)
    })

    it('should return 2000 for invalid input', () => {
      // @ts-expect-error - Testing invalid input
      expect(calculateDuration('invalid')).toBe(2000)
    })
  })

  describe('generateId', () => {
    it('should generate unique ids', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(id1).not.toBe(id2)
    })

    it('should contain toast prefix', () => {
      const id = generateId()
      expect(id).toContain('toast-')
    })

    it('should be string type', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
    })
  })

  describe('triggerHaptic', () => {
    it('should handle success feedback', () => {
      triggerHaptic('success')
      // Verify haptic trigger was called
    })

    it('should handle warning feedback', () => {
      triggerHaptic('warning')
      // Verify haptic trigger was called
    })

    it('should handle error feedback', () => {
      triggerHaptic('error')
      // Verify haptic trigger was called
    })

    it('should handle light feedback', () => {
      triggerHaptic('light')
      // Verify haptic trigger was called
    })

    it('should handle medium feedback', () => {
      triggerHaptic('medium')
      // Verify haptic trigger was called
    })

    it('should handle heavy feedback', () => {
      triggerHaptic('heavy')
      // Verify haptic trigger was called
    })

    it('should handle undefined feedback', () => {
      // @ts-expect-error - Testing undefined input
      expect(() => triggerHaptic(undefined)).not.toThrow()
    })
  })
})
