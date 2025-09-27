import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import Toast, { error, info, loading, promise, success, warning } from '../index'
import { ToastManager } from '../manager'

// Mock TurboToastView
jest.mock('../TurboToastView', () => 'TurboToastView')

// Mock NativeTurboToast
jest.mock('../NativeTurboToast', () => ({
  show: jest.fn().mockResolvedValue(undefined),
  hide: jest.fn(),
  hideAll: jest.fn(),
}))

// Mock react-native
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  Vibration: {
    vibrate: jest.fn(),
  },
}))

describe('Toast Templates', () => {
  let showSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    // Spy on the singleton instance that the templates use
    showSpy = jest.spyOn(ToastManager.getInstance(), 'show')
  })

  afterEach(() => {
    showSpy.mockRestore()
    // Don't destroy the manager - it resets the singleton
    ToastManager.getInstance().hideAll()
  })

  describe('Type shortcuts', () => {
    it('should show success toast with correct type', () => {
      const id = success('Payment successful')

      expect(showSpy).toHaveBeenCalledTimes(1)
      expect(showSpy).toHaveBeenCalledWith({
        message: 'Payment successful',
        type: 'success',
      })
      expect(typeof id).toBe('string')
    })

    it('should show error toast with correct type', () => {
      const id = error('Network failed')

      expect(showSpy).toHaveBeenCalledWith({
        message: 'Network failed',
        type: 'error',
      })
      expect(typeof id).toBe('string')
    })

    it('should show warning toast with correct type', () => {
      const id = warning('Low storage')

      expect(showSpy).toHaveBeenCalledWith({
        message: 'Low storage',
        type: 'warning',
      })
      expect(typeof id).toBe('string')
    })

    it('should show info toast with correct type', () => {
      const id = info('New update available')

      expect(showSpy).toHaveBeenCalledWith({
        message: 'New update available',
        type: 'info',
      })
      expect(typeof id).toBe('string')
    })

    it('should accept additional options', () => {
      success('Custom success', {
        position: 'top',
        duration: 5000,
        icon: '🎉',
      })

      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          position: 'top',
          duration: 5000,
          icon: '🎉',
          message: 'Custom success',
          type: 'success',
        }),
      )
    })

    it('should override type if provided in options', () => {
      success('Test', { type: 'error' })

      // Type from template should take precedence (comes after spread)
      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success', // Template type wins
          message: 'Test',
        }),
      )
    })
  })

  describe('Loading toast', () => {
    it('should show loading toast with default message', () => {
      const id = loading()

      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Loading...',
          duration: 999999,
          dismissOnPress: false,
          swipeToDismiss: false,
          icon: '⏳',
        }),
      )
      expect(typeof id).toBe('string')
    })

    it('should show loading toast with custom message', () => {
      loading('Uploading file...')

      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Uploading file...',
          duration: 999999,
          dismissOnPress: false,
          swipeToDismiss: false,
          icon: '⏳',
        }),
      )
    })

    it('should allow custom icon for loading', () => {
      loading('Processing', { icon: '⚙️' })

      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          icon: '⚙️',
          message: 'Processing',
          duration: 999999,
          dismissOnPress: false,
          swipeToDismiss: false,
        }),
      )
    })
  })

  describe('Promise helper', () => {
    jest.useFakeTimers()

    it('should handle successful promise', async () => {
      const testPromise = Promise.resolve('test-result')

      const result = await promise(testPromise, {
        loading: 'Fetching data...',
        success: 'Data loaded!',
        error: 'Failed to load',
      })

      // Should show loading first
      expect(showSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          message: 'Fetching data...',
          duration: 999999,
        }),
      )

      // Then success
      expect(showSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          message: 'Data loaded!',
          type: 'success',
        }),
      )

      expect(result).toBe('test-result')
    })

    it('should handle failed promise', async () => {
      const testError = new Error('Network error')
      const testPromise = Promise.reject(testError)

      await expect(
        promise(testPromise, {
          loading: 'Fetching data...',
          success: 'Data loaded!',
          error: 'Failed to load',
        }),
      ).rejects.toThrow('Network error')

      // Should show loading first
      expect(showSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          message: 'Fetching data...',
        }),
      )

      // Then error
      expect(showSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          message: 'Failed to load',
          type: 'error',
        }),
      )
    })

    it('should use function messages', async () => {
      const testPromise = Promise.resolve({ count: 42 })

      await promise(testPromise, {
        loading: 'Counting...',
        success: (result) => `Found ${result.count} items`,
        error: (err) => `Error: ${err.message}`,
      })

      expect(showSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          message: 'Found 42 items',
          type: 'success',
        }),
      )
    })

    it('should use default messages if not provided', async () => {
      const testPromise = Promise.resolve('done')

      await promise(testPromise, {})

      expect(showSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          message: 'Loading...',
        }),
      )

      expect(showSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          message: 'Success!',
        }),
      )
    })

    it('should handle error message function', async () => {
      const testError = new Error('Custom error')
      const testPromise = Promise.reject(testError)

      await expect(
        promise(testPromise, {
          error: (err) => `Failed: ${err.message}`,
        }),
      ).rejects.toThrow('Custom error')

      expect(showSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          message: 'Failed: Custom error',
          type: 'error',
        }),
      )
    })

    it('should pass through options to toasts', async () => {
      const testPromise = Promise.resolve('done')

      await promise(
        testPromise,
        {
          success: 'Completed',
        },
        {
          position: 'top',
          duration: 5000,
        },
      )

      // Loading toast should have options
      expect(showSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          position: 'top',
        }),
      )

      // Success toast should have options
      expect(showSpy).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          position: 'top',
          duration: 5000,
        }),
      )
    })

    jest.useRealTimers()
  })

  describe('Integration with Toast object', () => {
    it('should have all template methods on default export', () => {
      expect(Toast.success).toBeDefined()
      expect(Toast.error).toBeDefined()
      expect(Toast.warning).toBeDefined()
      expect(Toast.info).toBeDefined()
      expect(Toast.loading).toBeDefined()
      expect(Toast.promise).toBeDefined()
    })

    it('should work with Toast.success', () => {
      Toast.success('Using default export')

      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Using default export',
          type: 'success',
        }),
      )
    })

    it('should work with Toast.loading', () => {
      Toast.loading('Loading via default export')

      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Loading via default export',
          duration: 999999,
        }),
      )
    })
  })
})
