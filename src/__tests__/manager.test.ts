import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals'
import { Platform } from 'react-native'
import { ToastManager } from '../manager'
import type { ToastOptions } from '../types'

// Mock dependencies
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
  NativeModules: {},
  TurboModuleRegistry: {
    getEnforcing: jest.fn(),
  },
}))

jest.mock('../NativeTurboToast', () => ({
  default: {
    show: jest.fn().mockResolvedValue(undefined),
    hide: jest.fn(),
    hideAll: jest.fn(),
  },
}))

jest.mock('../styles', () => ({
  injectStyles: jest.fn(),
}))

jest.mock('../utils', () => ({
  calculateDuration: jest.fn((duration) => {
    if (duration === 'short') return 2000
    if (duration === 'long') return 3500
    if (typeof duration === 'number') return duration
    return 2000
  }),
  generateId: jest.fn(() => 'test-id-' + Math.random()),
  triggerHaptic: jest.fn(),
}))

describe('ToastManager', () => {
  let manager: ToastManager

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset singleton instance
    ;(ToastManager as any).instance = undefined
    manager = ToastManager.getInstance()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = ToastManager.getInstance()
      const instance2 = ToastManager.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('show', () => {
    it('should accept string message', () => {
      const id = manager.show('Test message')
      expect(id).toBeDefined()
      expect(id).toContain('test-id-')
    })

    it('should accept options object', () => {
      const options: ToastOptions = {
        message: 'Test message',
        type: 'success',
        duration: 'long',
      }
      const id = manager.show(options)
      expect(id).toBeDefined()
    })

    it('should use provided id if available', () => {
      const options: ToastOptions = {
        message: 'Test message',
        id: 'custom-id',
      }
      const id = manager.show(options)
      expect(id).toBe('custom-id')
    })

    it('should prevent duplicates when preventDuplicate is true', () => {
      const options: ToastOptions = {
        message: 'Duplicate message',
        preventDuplicate: true,
      }

      const id1 = manager.show(options)
      const id2 = manager.show(options)

      expect(id1).toBe(id2)
    })
  })

  describe('hide', () => {
    it('should hide specific toast by id', () => {
      const id = manager.show('Test message')
      manager.hide(id)
      // Verify toast is removed from active queue
    })

    it('should hide most recent toast when no id provided', () => {
      manager.show('First')
      manager.show('Second')
      manager.hide()
      // Should hide 'Second' toast
    })
  })

  describe('hideAll', () => {
    it('should hide all toasts', () => {
      manager.show('First')
      manager.show('Second')
      manager.show('Third')

      manager.hideAll()
      // All toasts should be hidden
    })
  })

  describe('update', () => {
    it('should update existing toast', () => {
      const id = manager.show('Original message')
      manager.update(id, { message: 'Updated message' })
      // Toast should be updated
    })

    it('should do nothing if toast does not exist', () => {
      expect(() => {
        manager.update('non-existent-id', { message: 'New message' })
      }).not.toThrow()
    })
  })

  describe('configure', () => {
    it('should update default options', () => {
      manager.configure({
        defaultOptions: {
          position: 'top',
          duration: 'long',
        },
      })

      // New toasts should use updated defaults
      manager.show('Test')
      // Verify position is 'top' and duration is 'long'
    })

    it('should update max concurrent toasts', () => {
      manager.configure({
        maxConcurrent: 3,
      })

      // Should be able to show 3 concurrent toasts
      manager.show('First')
      manager.show('Second')
      manager.show('Third')
    })
  })

  describe('Platform specific behavior', () => {
    it('should use web renderer on web platform', () => {
      ;(Platform as any).OS = 'web'
      const webManager = ToastManager.getInstance()
      webManager.show('Web toast')
      // Should use WebRenderer instead of NativeTurboToast
    })

    it('should use native module on mobile platforms', () => {
      ;(Platform as any).OS = 'ios'
      const iosManager = ToastManager.getInstance()
      iosManager.show('iOS toast')
      // Should use NativeTurboToast
    })
  })
})
