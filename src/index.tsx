import { ToastManager } from './manager'
import TurboToastView from './TurboToastView'
import type { ToastConfig, ToastOptions } from './types'

// Re-export types
export type {
  QueuedToast,
  QueueEvent,
  QueueStats,
  ToastAction,
  ToastConfig,
  ToastDuration,
  ToastOptions,
  ToastPosition,
  ToastType,
} from './types'

// Create singleton instance
const Toast = ToastManager.getInstance()

// Export functions
export const show = (options: ToastOptions | string) => Toast.show(options)
export const hide = (id?: string) => Toast.hide(id)
export const hideAll = () => Toast.hideAll()
export const update = (id: string, options: Partial<ToastOptions>) => Toast.update(id, options)
export const configure = (options: ToastConfig) => Toast.configure(options)
export const destroy = () => Toast.destroy()
export const isActive = (id: string) => Toast.isActive(id)
export const getActiveToasts = () => Toast.getActiveToasts()
export const getQueuedToasts = () => Toast.getQueuedToasts()

// Advanced queue management
export const getQueueStats = () => Toast.getQueueStats()
export const clearGroup = (group: string) => Toast.clearGroup(group)
export const findByGroup = (group: string) => Toast.findByGroup(group)
export const updateToast = (id: string, updates: Partial<ToastOptions>) =>
  Toast.updateToast(id, updates)
export const reorderToast = (id: string, newPriority: number) => Toast.reorderToast(id, newPriority)
export const pauseQueue = () => Toast.pauseQueue()
export const resumeQueue = () => Toast.resumeQueue()
export const getToastPosition = (id: string) => Toast.getToastPosition(id)

// Toast template shortcuts
export const success = (message: string, options?: Partial<ToastOptions>) =>
  Toast.show({ ...options, message, type: 'success' })

export const error = (message: string, options?: Partial<ToastOptions>) =>
  Toast.show({ ...options, message, type: 'error' })

export const warning = (message: string, options?: Partial<ToastOptions>) =>
  Toast.show({ ...options, message, type: 'warning' })

export const info = (message: string, options?: Partial<ToastOptions>) =>
  Toast.show({ ...options, message, type: 'info' })

// Convenience methods with common patterns
export const loading = (message: string = 'Loading...', options?: Partial<ToastOptions>) =>
  Toast.show({
    ...options,
    message,
    duration: 999999, // Long duration for loading
    dismissOnPress: false,
    swipeToDismiss: false,
    icon: options?.icon || '⏳',
  })

export const promise = <T,>(
  promise: Promise<T>,
  messages: {
    loading?: string
    success?: string | ((result: T) => string)
    error?: string | ((error: Error) => string)
  },
  options?: Partial<ToastOptions>,
): Promise<T> => {
  const loadingId = loading(messages.loading || 'Loading...', options)

  return promise
    .then((result) => {
      hide(loadingId)
      const successMsg =
        typeof messages.success === 'function'
          ? messages.success(result)
          : messages.success || 'Success!'
      success(successMsg, options)
      return result
    })
    .catch((err) => {
      hide(loadingId)
      const errorMsg =
        typeof messages.error === 'function'
          ? messages.error(err)
          : messages.error || 'Something went wrong'
      error(errorMsg, options)
      throw err
    })
}

// Progress toast helpers
export const showProgress = (
  message: string,
  initialProgress: number = 0,
  options?: Partial<ToastOptions>,
) =>
  Toast.show({
    ...options,
    message,
    progress: initialProgress,
    showProgressBar: true,
    duration: 999999, // Long duration for progress
    dismissOnPress: false,
    swipeToDismiss: false,
    icon: options?.icon || '⏳',
  })

export const updateProgress = (id: string, progress: number, message?: string) =>
  Toast.update(id, {
    progress: Math.min(1.0, Math.max(0, progress)),
    ...(message && { message }),
  })

// Export components
export { TurboToastView }

// Only export React Native components if not in test environment
if (typeof jest === 'undefined') {
  try {
    // Dynamic imports to ensure components are available
    require('./ToastContainer')
    require('./CustomToastView')
    require('./QueueMonitor')
    require('./useToastQueue')
    // These are already exported as ES modules above
  } catch {
    // Components not available in this environment
  }
}

// Default export
export default {
  show,
  hide,
  hideAll,
  update,
  configure,
  destroy,
  isActive,
  getActiveToasts,
  getQueuedToasts,
  // Template shortcuts
  success,
  error,
  warning,
  info,
  loading,
  promise,
  // Progress helpers
  showProgress,
  updateProgress,
  // Advanced queue management
  getQueueStats,
  clearGroup,
  findByGroup,
  updateToast,
  reorderToast,
  pauseQueue,
  resumeQueue,
  getToastPosition,
}

// Export analytics
export {
  toastAnalytics,
  ConsoleAnalyticsProvider,
  CustomAnalyticsProvider,
  type ToastAnalyticsEvent,
  type AnalyticsProvider,
} from './analytics'

// Export types
export * from './types'
