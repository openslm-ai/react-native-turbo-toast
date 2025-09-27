import { triggerHaptic } from '../utils'

// Mock react-native
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  Vibration: {
    vibrate: jest.fn(),
  },
}))

describe('Haptic Feedback', () => {
  let mockVibrate: jest.Mock
  const Platform = require('react-native').Platform
  const { Vibration } = require('react-native')

  beforeEach(() => {
    jest.clearAllMocks()
    mockVibrate = Vibration.vibrate as jest.Mock
  })

  describe('Android', () => {
    beforeEach(() => {
      Platform.OS = 'android'
    })

    it('should vibrate for success feedback', () => {
      triggerHaptic('success')
      expect(mockVibrate).toHaveBeenCalledWith(10)
    })

    it('should vibrate for error feedback', () => {
      triggerHaptic('error')
      expect(mockVibrate).toHaveBeenCalledWith([0, 30, 40, 30])
    })

    it('should vibrate for warning feedback', () => {
      triggerHaptic('warning')
      expect(mockVibrate).toHaveBeenCalledWith(30)
    })

    it('should vibrate for light feedback', () => {
      triggerHaptic('light')
      expect(mockVibrate).toHaveBeenCalledWith(10)
    })

    it('should vibrate for medium feedback', () => {
      triggerHaptic('medium')
      expect(mockVibrate).toHaveBeenCalledWith(30)
    })

    it('should vibrate for heavy feedback', () => {
      triggerHaptic('heavy')
      expect(mockVibrate).toHaveBeenCalledWith([0, 30, 40, 30])
    })

    it('should vibrate for selection feedback', () => {
      triggerHaptic('selection')
      expect(mockVibrate).toHaveBeenCalledWith(10)
    })
  })

  describe('Web', () => {
    beforeEach(() => {
      Platform.OS = 'web'
      // @ts-expect-error - Mocking navigator
      global.navigator = {
        vibrate: jest.fn(),
      }
    })

    afterEach(() => {
      // @ts-expect-error - Cleanup
      delete global.navigator
    })

    it('should use navigator.vibrate for success', () => {
      triggerHaptic('success')
      expect(global.navigator.vibrate).toHaveBeenCalledWith(10)
    })

    it('should use navigator.vibrate for error', () => {
      triggerHaptic('error')
      expect(global.navigator.vibrate).toHaveBeenCalledWith([30, 40, 30])
    })

    it('should use navigator.vibrate for warning', () => {
      triggerHaptic('warning')
      expect(global.navigator.vibrate).toHaveBeenCalledWith(30)
    })
  })

  describe('Error handling', () => {
    it('should not throw if Vibration API is not available', () => {
      Platform.OS = 'android'
      jest.resetModules()
      jest.doMock('react-native', () => ({
        Platform: { OS: 'android' },
        Vibration: undefined,
      }))

      expect(() => triggerHaptic('success')).not.toThrow()
    })

    it('should handle all haptic types without error', () => {
      Platform.OS = 'android'
      const types: Array<
        'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' | 'selection'
      > = ['success', 'warning', 'error', 'light', 'medium', 'heavy', 'selection']

      types.forEach((type) => {
        expect(() => triggerHaptic(type)).not.toThrow()
      })
    })
  })
})
