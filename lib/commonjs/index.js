"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  show: true,
  hide: true,
  hideAll: true,
  update: true,
  configure: true,
  destroy: true,
  isActive: true,
  getActiveToasts: true,
  getQueuedToasts: true,
  getQueueStats: true,
  clearGroup: true,
  findByGroup: true,
  updateToast: true,
  reorderToast: true,
  pauseQueue: true,
  resumeQueue: true,
  getToastPosition: true,
  success: true,
  error: true,
  warning: true,
  info: true,
  loading: true,
  promise: true,
  showProgress: true,
  updateProgress: true,
  TurboToastView: true,
  toastAnalytics: true,
  ConsoleAnalyticsProvider: true,
  CustomAnalyticsProvider: true
};
Object.defineProperty(exports, "ConsoleAnalyticsProvider", {
  enumerable: true,
  get: function () {
    return _analytics.ConsoleAnalyticsProvider;
  }
});
Object.defineProperty(exports, "CustomAnalyticsProvider", {
  enumerable: true,
  get: function () {
    return _analytics.CustomAnalyticsProvider;
  }
});
Object.defineProperty(exports, "TurboToastView", {
  enumerable: true,
  get: function () {
    return _TurboToastView.default;
  }
});
exports.success = exports.showProgress = exports.show = exports.resumeQueue = exports.reorderToast = exports.promise = exports.pauseQueue = exports.loading = exports.isActive = exports.info = exports.hideAll = exports.hide = exports.getToastPosition = exports.getQueuedToasts = exports.getQueueStats = exports.getActiveToasts = exports.findByGroup = exports.error = exports.destroy = exports.default = exports.configure = exports.clearGroup = void 0;
Object.defineProperty(exports, "toastAnalytics", {
  enumerable: true,
  get: function () {
    return _analytics.toastAnalytics;
  }
});
exports.warning = exports.updateToast = exports.updateProgress = exports.update = void 0;
var _manager = require("./manager");
var _TurboToastView = _interopRequireDefault(require("./TurboToastView"));
var _analytics = require("./analytics");
var _types = require("./types");
Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Re-export types

// Create singleton instance
const Toast = _manager.ToastManager.getInstance();

// Export functions
const show = options => Toast.show(options);
exports.show = show;
const hide = id => Toast.hide(id);
exports.hide = hide;
const hideAll = () => Toast.hideAll();
exports.hideAll = hideAll;
const update = (id, options) => Toast.update(id, options);
exports.update = update;
const configure = options => Toast.configure(options);
exports.configure = configure;
const destroy = () => Toast.destroy();
exports.destroy = destroy;
const isActive = id => Toast.isActive(id);
exports.isActive = isActive;
const getActiveToasts = () => Toast.getActiveToasts();
exports.getActiveToasts = getActiveToasts;
const getQueuedToasts = () => Toast.getQueuedToasts();

// Advanced queue management
exports.getQueuedToasts = getQueuedToasts;
const getQueueStats = () => Toast.getQueueStats();
exports.getQueueStats = getQueueStats;
const clearGroup = group => Toast.clearGroup(group);
exports.clearGroup = clearGroup;
const findByGroup = group => Toast.findByGroup(group);
exports.findByGroup = findByGroup;
const updateToast = (id, updates) => Toast.updateToast(id, updates);
exports.updateToast = updateToast;
const reorderToast = (id, newPriority) => Toast.reorderToast(id, newPriority);
exports.reorderToast = reorderToast;
const pauseQueue = () => Toast.pauseQueue();
exports.pauseQueue = pauseQueue;
const resumeQueue = () => Toast.resumeQueue();
exports.resumeQueue = resumeQueue;
const getToastPosition = id => Toast.getToastPosition(id);

// Toast template shortcuts
exports.getToastPosition = getToastPosition;
const success = (message, options) => Toast.show({
  ...options,
  message,
  type: 'success'
});
exports.success = success;
const error = (message, options) => Toast.show({
  ...options,
  message,
  type: 'error'
});
exports.error = error;
const warning = (message, options) => Toast.show({
  ...options,
  message,
  type: 'warning'
});
exports.warning = warning;
const info = (message, options) => Toast.show({
  ...options,
  message,
  type: 'info'
});

// Convenience methods with common patterns
exports.info = info;
const loading = (message = 'Loading...', options) => Toast.show({
  ...options,
  message,
  duration: 999999,
  // Long duration for loading
  dismissOnPress: false,
  swipeToDismiss: false,
  icon: options?.icon || '⏳'
});
exports.loading = loading;
const promise = (promise, messages, options) => {
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
exports.promise = promise;
const showProgress = (message, initialProgress = 0, options) => Toast.show({
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
exports.showProgress = showProgress;
const updateProgress = (id, progress, message) => Toast.update(id, {
  progress: Math.min(1.0, Math.max(0, progress)),
  ...(message && {
    message
  })
});

// Export components
exports.updateProgress = updateProgress;
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
var _default = exports.default = {
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
}; // Export analytics
// Export types
//# sourceMappingURL=index.js.map