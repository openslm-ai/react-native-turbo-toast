import { Platform } from 'react-native'
import type { HapticFeedback, ToastDuration } from './types'

export function generateId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

export function calculateDuration(duration?: ToastDuration): number {
  if (typeof duration === 'number') return duration
  if (duration === 'long') return 3500
  return 2000
}

export function triggerHaptic(type: HapticFeedback): void {
  if (Platform.OS === 'ios') {
    try {
      const HapticFeedback = require('react-native-haptic-feedback').default
      switch (type) {
        case 'success':
          HapticFeedback.trigger('notificationSuccess')
          break
        case 'warning':
          HapticFeedback.trigger('notificationWarning')
          break
        case 'error':
          HapticFeedback.trigger('notificationError')
          break
        case 'light':
          HapticFeedback.trigger('impactLight')
          break
        case 'medium':
          HapticFeedback.trigger('impactMedium')
          break
        case 'heavy':
          HapticFeedback.trigger('impactHeavy')
          break
        case 'selection':
          HapticFeedback.trigger('selection')
          break
      }
    } catch {
      // Fallback to Vibration API if react-native-haptic-feedback not available
      try {
        const { Vibration } = require('react-native')
        switch (type) {
          case 'success':
          case 'light':
          case 'selection':
            Vibration.vibrate(10)
            break
          case 'warning':
          case 'medium':
            Vibration.vibrate(20)
            break
          case 'error':
          case 'heavy':
            Vibration.vibrate([0, 20, 50, 20])
            break
        }
      } catch {
        // Silent fail if vibration not available
      }
    }
  } else if (Platform.OS === 'android') {
    try {
      const { Vibration } = require('react-native')
      switch (type) {
        case 'success':
        case 'light':
        case 'selection':
          Vibration.vibrate(10)
          break
        case 'warning':
        case 'medium':
          Vibration.vibrate(30)
          break
        case 'error':
        case 'heavy':
          Vibration.vibrate([0, 30, 40, 30])
          break
      }
    } catch {
      // Silent fail if vibration not available
    }
  } else if (Platform.OS === 'web' && 'vibrate' in navigator) {
    // Web fallback
    switch (type) {
      case 'success':
      case 'light':
      case 'selection':
        navigator.vibrate(10)
        break
      case 'warning':
      case 'medium':
        navigator.vibrate(30)
        break
      case 'error':
      case 'heavy':
        navigator.vibrate([30, 40, 30])
        break
    }
  }
}
