import type { ToastDuration } from './types'

export function generateId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export function calculateDuration(duration?: ToastDuration): number {
  if (typeof duration === 'number') return duration
  if (duration === 'long') return 3500
  return 2000
}

export function triggerHaptic(type: string): void {
  // Native implementation will override this
  if ('vibrate' in navigator) {
    switch (type) {
      case 'success':
      case 'light':
        navigator.vibrate(50)
        break
      case 'warning':
      case 'medium':
        navigator.vibrate(100)
        break
      case 'error':
      case 'heavy':
        navigator.vibrate([100, 50, 100])
        break
    }
  }
}
