"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToastManager = void 0;
var _reactNative = require("react-native");
var _NativeTurboToast = _interopRequireDefault(require("./NativeTurboToast"));
var _queue = require("./queue");
var _styles = require("./styles");
var _utils = require("./utils");
var _webRenderer = require("./web-renderer");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ToastManager {
  defaultOptions = {
    duration: 'short',
    position: 'bottom',
    type: 'default',
    dismissOnPress: true,
    swipeToDismiss: true,
    animationDuration: 300
  };
  constructor() {
    this.queue = new _queue.ToastQueue(1);
    this.webRenderer = new _webRenderer.WebRenderer();

    // Inject styles for web
    if (_reactNative.Platform.OS === 'web') {
      (0, _styles.injectStyles)();
    }
  }
  static getInstance() {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }
  configure(config) {
    if (config.maxConcurrent) {
      this.queue = new _queue.ToastQueue(config.maxConcurrent);
    }
    if (config.defaultOptions) {
      this.defaultOptions = {
        ...this.defaultOptions,
        ...config.defaultOptions
      };
    }
  }
  show(options) {
    const toastOptions = typeof options === 'string' ? {
      message: options
    } : options;
    const id = toastOptions.id || (0, _utils.generateId)();

    // Check for duplicate prevention
    if (toastOptions.preventDuplicate) {
      const existing = this.queue.findDuplicate(toastOptions.message);
      if (existing) return existing.id;
    }
    const queuedToast = {
      ...this.defaultOptions,
      ...toastOptions,
      id,
      timestamp: Date.now()
    };

    // Add haptic feedback
    if (queuedToast.hapticFeedback && _reactNative.Platform.OS !== 'web') {
      (0, _utils.triggerHaptic)(queuedToast.hapticFeedback);
    }
    if (_reactNative.Platform.OS === 'web') {
      this.showWebToast(queuedToast);
    } else {
      this.queue.enqueue(queuedToast);
      this.processQueue();
    }
    return id;
  }
  async processQueue() {
    if (this.queue.processing || !this.queue.hasCapacity()) return;
    const toast = this.queue.dequeue();
    if (!toast) return;
    this.queue.setProcessing(true);
    this.queue.addActive(toast);
    try {
      await _NativeTurboToast.default.show(this.toNativeOptions(toast));
      if (toast.onShow) {
        toast.onShow();
      }
      const duration = (0, _utils.calculateDuration)(toast.duration);
      setTimeout(() => {
        this.hideToast(toast.id);
      }, duration);
    } catch (error) {
      console.error('[TurboToast] Failed to show:', error);
      this.queue.removeActive(toast.id);
    } finally {
      this.queue.setProcessing(false);
      this.processQueue();
    }
  }
  showWebToast(toast) {
    this.queue.addActive(toast);
    this.webRenderer.render(toast, id => this.hideToast(id));
    if (toast.onShow) {
      toast.onShow();
    }
    const duration = (0, _utils.calculateDuration)(toast.duration);
    setTimeout(() => {
      this.hideToast(toast.id);
    }, duration);
  }
  hideToast(id) {
    const toast = this.queue.removeActive(id);
    if (!toast) return;
    if (_reactNative.Platform.OS === 'web') {
      this.webRenderer.remove(id, toast.animationDuration);
    } else {
      _NativeTurboToast.default.hide();
    }
    if (toast.onHide) {
      toast.onHide();
    }
    this.processQueue();
  }
  hide(id) {
    if (id) {
      this.hideToast(id);
    } else {
      // Hide the most recent toast
      const active = this.queue.getAllActive();
      const lastToast = active[active.length - 1];
      if (lastToast) {
        this.hideToast(lastToast.id);
      }
    }
  }
  hideAll() {
    this.queue.clear();
    const active = this.queue.getAllActive();
    active.forEach(toast => {
      this.hideToast(toast.id);
    });
    if (_reactNative.Platform.OS !== 'web') {
      _NativeTurboToast.default.hideAll();
    }
  }
  update(id, options) {
    const toast = this.queue.getActive(id);
    if (toast) {
      Object.assign(toast, options);
      if (_reactNative.Platform.OS !== 'web') {
        _NativeTurboToast.default.show(this.toNativeOptions(toast));
      } else {
        // For web, we'd need to update the DOM element
        const element = document.getElementById(id);
        if (element) {
          const contentEl = element.querySelector('.turbo-toast-content');
          if (contentEl && options.message) {
            contentEl.textContent = options.message;
          }
        }
      }
    }
  }
  toNativeOptions(toast) {
    const nativeOptions = {
      message: toast.message,
      duration: toast.duration,
      position: toast.position,
      type: toast.type,
      backgroundColor: toast.backgroundColor,
      textColor: toast.textColor
    };

    // Convert icon if it's an object
    if (typeof toast.icon === 'string') {
      nativeOptions.icon = toast.icon;
    }

    // Convert single action
    if (toast.action) {
      nativeOptions.action = {
        text: toast.action.text,
        onPress: toast.action.onPress
      };
    }
    return nativeOptions;
  }
}
exports.ToastManager = ToastManager;
//# sourceMappingURL=manager.js.map