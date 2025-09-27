"use strict";

import { ToastManager } from './manager';
import TurboToastView from './TurboToastView';

// Re-export types

// Create singleton instance
const Toast = ToastManager.getInstance();

// Export functions
export const show = options => Toast.show(options);
export const hide = id => Toast.hide(id);
export const hideAll = () => Toast.hideAll();
export const update = (id, options) => Toast.update(id, options);
export const configure = options => Toast.configure(options);
export const destroy = () => Toast.destroy();
export const isActive = id => Toast.isActive(id);
export const getActiveToasts = () => Toast.getActiveToasts();
export const getQueuedToasts = () => Toast.getQueuedToasts();

// Advanced queue management
export const getQueueStats = () => Toast.getQueueStats();
export const clearGroup = group => Toast.clearGroup(group);
export const findByGroup = group => Toast.findByGroup(group);
export const updateToast = (id, updates) => Toast.updateToast(id, updates);
export const reorderToast = (id, newPriority) => Toast.reorderToast(id, newPriority);
export const pauseQueue = () => Toast.pauseQueue();
export const resumeQueue = () => Toast.resumeQueue();
export const getToastPosition = id => Toast.getToastPosition(id);

// Toast template shortcuts
export const success = (message, options) => Toast.show({
  ...options,
  message,
  type: 'success'
});
export const error = (message, options) => Toast.show({
  ...options,
  message,
  type: 'error'
});
export const warning = (message, options) => Toast.show({
  ...options,
  message,
  type: 'warning'
});
export const info = (message, options) => Toast.show({
  ...options,
  message,
  type: 'info'
});

// Convenience methods with common patterns
export const loading = (message = 'Loading...', options) => Toast.show({
  ...options,
  message,
  duration: 999999,
  // Long duration for loading
  dismissOnPress: false,
  swipeToDismiss: false,
  icon: options?.icon || '⏳'
});
export const promise = (promise, messages, options) => {
  const loadingId = loading(messages.loading || 'Loading...', options);
  return promise.then(result => {
    hide(loadingId);
    const successMsg = typeof messages.success === 'function' ? messages.success(result) : messages.success || 'Success!';
    success(successMsg, options);
    return result;
  }).catch(err => {
    hide(loadingId);
    const errorMsg = typeof messages.error === 'function' ? messages.error(err) : messages.error || 'Something went wrong';
    error(errorMsg, options);
    throw err;
  });
};

// Progress toast helpers
export const showProgress = (message, initialProgress = 0, options) => Toast.show({
  ...options,
  message,
  progress: initialProgress,
  showProgressBar: true,
  duration: 999999,
  // Long duration for progress
  dismissOnPress: false,
  swipeToDismiss: false,
  icon: options?.icon || '⏳'
});
export const updateProgress = (id, progress, message) => Toast.update(id, {
  progress: Math.min(1.0, Math.max(0, progress)),
  ...(message && {
    message
  })
});

// Export components
export { TurboToastView };

// Only export React Native components if not in test environment
if (typeof jest === 'undefined') {
  try {
    // Dynamic imports to ensure components are available
    require('./ToastContainer');
    require('./CustomToastView');
    require('./QueueMonitor');
    require('./useToastQueue');
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
  getToastPosition
};

// Export analytics
export { toastAnalytics, ConsoleAnalyticsProvider, CustomAnalyticsProvider } from './analytics';

// Export types
export * from './types';
//# sourceMappingURL=index.js.map