import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import Toast, { showProgress, updateProgress } from '../index'
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

describe('Progress Toast', () => {
  let showSpy: jest.SpyInstance
  let updateSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    // Spy on the singleton instance
    showSpy = jest.spyOn(ToastManager.getInstance(), 'show')
    updateSpy = jest.spyOn(ToastManager.getInstance(), 'update')
  })

  afterEach(() => {
    showSpy.mockRestore()
    updateSpy.mockRestore()
    ToastManager.getInstance().hideAll()
  })

  describe('showProgress', () => {
    it('should create a progress toast with default values', () => {
      const id = showProgress('Uploading...')

      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Uploading...',
          progress: 0,
          showProgressBar: true,
          duration: 999999,
          dismissOnPress: false,
          swipeToDismiss: false,
          icon: '⏳',
        }),
      )
      expect(typeof id).toBe('string')
    })

    it('should accept initial progress value', () => {
      showProgress('Processing...', 0.5)

      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Processing...',
          progress: 0.5,
          showProgressBar: true,
        }),
      )
    })

    it('should allow custom options', () => {
      showProgress('Downloading...', 0.25, {
        progressColor: '#00ff00',
        position: 'top',
        icon: '⬇️',
      })

      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Downloading...',
          progress: 0.25,
          showProgressBar: true,
          progressColor: '#00ff00',
          position: 'top',
          icon: '⬇️',
        }),
      )
    })
  })

  describe('updateProgress', () => {
    it('should update progress value', () => {
      updateProgress('toast-123', 0.75)

      expect(updateSpy).toHaveBeenCalledWith('toast-123', {
        progress: 0.75,
      })
    })

    it('should clamp progress between 0 and 1', () => {
      updateProgress('toast-1', -0.5)
      expect(updateSpy).toHaveBeenCalledWith('toast-1', {
        progress: 0,
      })

      updateProgress('toast-2', 1.5)
      expect(updateSpy).toHaveBeenCalledWith('toast-2', {
        progress: 1.0,
      })
    })

    it('should update both progress and message', () => {
      updateProgress('toast-123', 0.5, 'Halfway there!')

      expect(updateSpy).toHaveBeenCalledWith('toast-123', {
        progress: 0.5,
        message: 'Halfway there!',
      })
    })
  })

  describe('Toast.showProgress integration', () => {
    it('should be available on default export', () => {
      expect(Toast.showProgress).toBeDefined()
      expect(Toast.updateProgress).toBeDefined()
    })

    it('should work through default export', () => {
      const id = Toast.showProgress('Syncing...')

      expect(showSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Syncing...',
          progress: 0,
          showProgressBar: true,
        }),
      )
      expect(typeof id).toBe('string')
    })

    it('should update through default export', () => {
      Toast.updateProgress('toast-456', 0.9, 'Almost done!')

      expect(updateSpy).toHaveBeenCalledWith('toast-456', {
        progress: 0.9,
        message: 'Almost done!',
      })
    })
  })

  describe('Progress workflow', () => {
    it('should handle complete progress workflow', () => {
      // Start progress
      const id = showProgress('Starting upload...')
      expect(showSpy).toHaveBeenCalledTimes(1)

      // Update progress
      updateProgress(id, 0.25, 'Uploading: 25%')
      expect(updateSpy).toHaveBeenNthCalledWith(1, id, {
        progress: 0.25,
        message: 'Uploading: 25%',
      })

      updateProgress(id, 0.5, 'Uploading: 50%')
      expect(updateSpy).toHaveBeenNthCalledWith(2, id, {
        progress: 0.5,
        message: 'Uploading: 50%',
      })

      updateProgress(id, 0.75, 'Uploading: 75%')
      expect(updateSpy).toHaveBeenNthCalledWith(3, id, {
        progress: 0.75,
        message: 'Uploading: 75%',
      })

      updateProgress(id, 1.0, 'Upload complete!')
      expect(updateSpy).toHaveBeenNthCalledWith(4, id, {
        progress: 1.0,
        message: 'Upload complete!',
      })

      // Hide when done
      Toast.hide(id)
    })

    it('should handle progress with incremental updates', () => {
      const id = showProgress('Processing data...', 0.1)

      // Simulate incremental progress
      for (let i = 2; i <= 10; i++) {
        updateProgress(id, i * 0.1, `Processing: ${i * 10}%`)
      }

      expect(updateSpy).toHaveBeenCalledTimes(9)
      expect(updateSpy).toHaveBeenLastCalledWith(id, {
        progress: 1.0,
        message: 'Processing: 100%',
      })
    })
  })
})
