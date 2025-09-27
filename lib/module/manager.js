"use strict";

import { Platform } from 'react-native';
import NativeTurboToast from './NativeTurboToast';
import { ToastQueue } from './queue';
import { injectStyles } from './styles';
import { calculateDuration, generateId, triggerHaptic } from './utils';
import { WebRenderer } from './web-renderer';
import { toastPersistence } from './persistence';
import { toastAnalytics } from './analytics';
export class ToastManager {
  activeTimers = new Map();
  retryAttempts = new Map();
  maxRetries = 3;
  retryDelay = 1000;
  isDestroyed = false;
  customViewHandler = null;
  config = {};
  defaultOptions = {
    duration: 'short',
    position: 'bottom',
    type: 'default',
    dismissOnPress: true,
    swipeToDismiss: true,
    animationDuration: 300,
    preventDuplicate: false,
    hapticFeedback: undefined
  };
  constructor() {
    this.queue = new ToastQueue({
      maxConcurrent: this.config.stackingEnabled ? this.config.stackingMaxVisible || 3 : 1
    });
    this.webRenderer = new WebRenderer();

    // Inject styles for web
    if (Platform.OS === 'web') {
      injectStyles();
    }

    // Load persisted toasts if enabled
    this.initializePersistence();

    // Cleanup on app state change
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.destroy());
    }

    // Listen for action button events from native
    if (Platform.OS !== 'web') {
      try {
        const {
          NativeEventEmitter,
          NativeModules
        } = require('react-native');
        const emitter = new NativeEventEmitter(NativeModules.TurboToast);
        emitter.addListener('TurboToast:ActionPressed', this.handleNativeAction.bind(this));
      } catch {
        // Silent fail if not available
      }
    }
  }
  handleNativeAction(event) {
    const toast = this.queue.getActive(event.toastId);
    if (toast?.action?.onPress && typeof toast.action.onPress === 'function') {
      try {
        toast.action.onPress();
      } catch (error) {
        // Safely handle errors in user callbacks
        if (toast.onError && typeof toast.onError === 'function') {
          toast.onError(error);
        }
      }
    }
  }
  static getInstance() {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }
  async initializePersistence() {
    if (this.config.persistenceEnabled && Platform.OS !== 'web') {
      try {
        await toastPersistence.enable();
        const persistedToasts = await toastPersistence.load();

        // Re-queue persisted toasts
        persistedToasts.forEach(toast => {
          this.queue.enqueue(toast);
        });

        // Start auto-save
        toastPersistence.startAutoSave(() => [...this.queue.getQueue(), ...this.queue.getAllActive()], this.config.persistenceInterval || 1000);

        // Process queue if there are persisted toasts
        if (persistedToasts.length > 0) {
          this.processQueue();
        }
      } catch (error) {
        console.warn('Failed to initialize persistence:', error);
      }
    }
  }
  getConfig() {
    return this.config;
  }
  configure(config) {
    const prevPersistenceEnabled = this.config.persistenceEnabled;
    this.config = {
      ...this.config,
      ...config
    };

    // Handle analytics changes
    if (config.analyticsEnabled !== undefined) {
      toastAnalytics.setEnabled(config.analyticsEnabled);
    }

    // Handle persistence changes
    if (config.persistenceEnabled !== undefined || config.persistenceInterval !== undefined) {
      if (this.config.persistenceEnabled && Platform.OS !== 'web') {
        if (!prevPersistenceEnabled) {
          this.initializePersistence();
        } else if (config.persistenceInterval) {
          toastPersistence.stopAutoSave();
          toastPersistence.startAutoSave(() => [...this.queue.getQueue(), ...this.queue.getAllActive()], config.persistenceInterval);
        }
      } else {
        toastPersistence.disable();
      }
    }

    // Recreate queue with new config if needed
    if (config.maxConcurrent || config.maxQueueSize || config.groupDeduplication || config.queueTimeout || config.onQueueEvent || config.stackingEnabled !== undefined || config.stackingMaxVisible) {
      const maxConcurrent = this.config.stackingEnabled ? this.config.stackingMaxVisible || 3 : config.maxConcurrent || 1;
      const oldQueue = this.queue;
      this.queue = new ToastQueue({
        ...config,
        maxConcurrent
      });

      // Migrate existing toasts
      const existingToasts = oldQueue.getQueue();
      existingToasts.forEach(toast => {
        this.queue.enqueue(toast);
      });

      // Migrate active toasts
      const activeToasts = oldQueue.getAllActive();
      activeToasts.forEach(toast => {
        this.queue.addActive(toast);
      });
      oldQueue.destroy();
    }
    if (config.defaultOptions) {
      this.defaultOptions = {
        ...this.defaultOptions,
        ...config.defaultOptions
      };
    }
    if (config.maxRetries !== undefined) {
      this.maxRetries = config.maxRetries;
    }
    if (config.retryDelay !== undefined) {
      this.retryDelay = config.retryDelay;
    }
  }
  show(options) {
    if (this.isDestroyed) {
      // Manager has been destroyed - silently return
      return '';
    }
    const toastOptions = typeof options === 'string' ? {
      message: options
    } : options;
    const id = toastOptions.id || generateId();

    // Check for duplicate prevention
    if (toastOptions.preventDuplicate) {
      const existing = this.queue.findDuplicate(toastOptions.message);
      if (existing) return existing.id;
    }
    const queuedToast = {
      ...this.defaultOptions,
      ...toastOptions,
      id,
      priority: toastOptions.priority || this.defaultOptions.priority || 0,
      timestamp: Date.now()
    };

    // Track analytics for queued toast
    if (this.config.analyticsEnabled) {
      toastAnalytics.trackToastQueued(queuedToast);
    }

    // Add haptic feedback
    if (Platform.OS !== 'web') {
      // Use explicit haptic feedback or default based on type
      const hapticType = queuedToast.hapticFeedback || (queuedToast.type === 'success' ? 'success' : queuedToast.type === 'error' ? 'error' : queuedToast.type === 'warning' ? 'warning' : undefined);
      if (hapticType) {
        triggerHaptic(hapticType);
      }
    }

    // Handle custom views differently
    if (queuedToast.customView) {
      this.queue.addActive(queuedToast);

      // Notify the custom view handler
      if (this.customViewHandler) {
        this.customViewHandler();
      }

      // Still set a timer for auto-dismiss
      const duration = calculateDuration(queuedToast.duration);
      const timer = setTimeout(() => {
        this.hideToast(queuedToast.id);
      }, duration);
      this.activeTimers.set(queuedToast.id, timer);
    } else if (Platform.OS === 'web') {
      this.showWebToast(queuedToast);
    } else {
      const enqueued = this.queue.enqueue(queuedToast);
      if (enqueued) {
        this.processQueue();
      }
    }
    return id;
  }
  async processQueue() {
    // Prevent concurrent processing
    if (this.isDestroyed || this.queue.processing || !this.queue.hasCapacity()) return;

    // Atomically set processing flag and dequeue
    this.queue.setProcessing(true);
    const toast = this.queue.dequeue();
    if (!toast) {
      this.queue.setProcessing(false);
      return;
    }
    this.queue.addActive(toast);
    try {
      await this.showNativeToast(toast);
    } finally {
      this.queue.setProcessing(false);
      // Process next item in queue
      if (!this.isDestroyed) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }
  async showNativeToast(toast, isRetry = false) {
    try {
      await NativeTurboToast.show(this.toNativeOptions(toast));
      if (toast.onShow && !isRetry) {
        toast.onShow();
      }

      // Track analytics for shown toast
      if (this.config.analyticsEnabled) {
        toastAnalytics.trackToastShown(toast);
      }
      const duration = calculateDuration(toast.duration);
      const timer = setTimeout(() => {
        this.hideToast(toast.id);
      }, duration);
      this.activeTimers.set(toast.id, timer);
      this.retryAttempts.delete(toast.id); // Clear retry count on success
    } catch (error) {
      // Failed to show toast

      // Implement retry logic
      const attempts = this.retryAttempts.get(toast.id) || 0;
      if (attempts < this.maxRetries) {
        this.retryAttempts.set(toast.id, attempts + 1);
        // Retrying toast display

        setTimeout(() => {
          if (!this.isDestroyed && this.queue.getActive(toast.id)) {
            this.showNativeToast(toast, true);
          }
        }, this.retryDelay * (attempts + 1));
      } else {
        // Max retries reached
        this.queue.removeActive(toast.id);
        if (toast.onError) {
          toast.onError(error);
        }

        // Track analytics for error
        if (this.config.analyticsEnabled) {
          toastAnalytics.trackToastError(error, toast);
        }
      }
    }
  }
  showWebToast(toast) {
    if (this.isDestroyed) return;
    this.queue.addActive(toast);
    try {
      this.webRenderer.render(toast, id => this.hideToast(id));
      if (toast.onShow) {
        toast.onShow();
      }
      const duration = calculateDuration(toast.duration);
      const timer = setTimeout(() => {
        this.hideToast(toast.id);
      }, duration);
      this.activeTimers.set(toast.id, timer);
    } catch (error) {
      // Failed to show web toast
      this.queue.removeActive(toast.id);
      if (toast.onError) {
        toast.onError(error);
      }
    }
  }
  hideToast(id) {
    if (this.isDestroyed) return;

    // Clear any active timer
    this.clearTimer(id);
    const toast = this.queue.removeActive(id);
    if (!toast) return;
    if (Platform.OS === 'web') {
      this.webRenderer.remove(id, toast.animationDuration);
    } else {
      try {
        NativeTurboToast.hide();
      } catch (_error) {
        // Failed to hide toast
      }
    }
    if (toast.onHide) {
      toast.onHide();
    }

    // Track analytics for hidden toast
    if (this.config.analyticsEnabled) {
      toastAnalytics.trackToastHidden(toast, 'manual');
    }

    // Clear retry attempts
    this.retryAttempts.delete(id);

    // Notify custom view handler if this was a custom view
    if (toast.customView && this.customViewHandler) {
      this.customViewHandler();
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
    // Clear all timers
    this.activeTimers.forEach(timer => {
      clearTimeout(timer);
    });
    this.activeTimers.clear();

    // Clear retry attempts
    this.retryAttempts.clear();

    // Clear queue
    this.queue.clear();

    // Hide all active toasts
    const active = this.queue.getAllActive();
    active.forEach(toast => {
      this.hideToast(toast.id);
    });
    if (Platform.OS !== 'web') {
      try {
        NativeTurboToast.hideAll();
      } catch (_error) {
        // Failed to hideAll
      }
    }
  }
  update(id, options) {
    const toast = this.queue.getActive(id);
    if (!toast) {
      // Try updating queued toast
      return this.queue.updateToast(id, options);
    }

    // Update toast properties
    Object.assign(toast, options);

    // Update native or web view
    if (Platform.OS !== 'web') {
      try {
        NativeTurboToast.show(this.toNativeOptions(toast));
      } catch (_error) {
        // Failed to update
        return false;
      }
    } else {
      // Use web renderer's update method
      this.webRenderer.update(id, options);
    }

    // Reset timer if duration changed
    if (options.duration !== undefined) {
      this.clearTimer(id);
      const duration = calculateDuration(options.duration);
      const timer = setTimeout(() => {
        this.hideToast(id);
      }, duration);
      this.activeTimers.set(id, timer);
    }
    return true;
  }
  clearTimer(id) {
    const timer = this.activeTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(id);
    }
  }
  toNativeOptions(toast) {
    const nativeOptions = {
      id: toast.id,
      // Pass ID for action handling
      message: toast.message,
      duration: toast.duration,
      position: toast.position,
      type: toast.type,
      backgroundColor: toast.backgroundColor,
      textColor: toast.textColor,
      dismissOnPress: toast.dismissOnPress,
      swipeToDismiss: toast.swipeToDismiss,
      animationDuration: toast.animationDuration,
      accessibilityLabel: toast.accessibilityLabel,
      accessibilityHint: toast.accessibilityHint,
      accessibilityRole: toast.accessibilityRole
    };

    // Convert icon
    if (typeof toast.icon === 'string') {
      nativeOptions.icon = toast.icon;
    } else if (toast.icon && typeof toast.icon === 'object' && 'uri' in toast.icon) {
      nativeOptions.icon = toast.icon.uri;
    }

    // Convert action
    if (toast.action) {
      nativeOptions.action = {
        text: toast.action.text,
        onPress: toast.action.onPress
      };
    }
    return nativeOptions;
  }
  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    // Clear all toasts
    this.hideAll();

    // Clear all timers
    this.activeTimers.forEach(timer => {
      clearTimeout(timer);
    });
    this.activeTimers.clear();

    // Clear retry attempts
    this.retryAttempts.clear();

    // Disable persistence
    toastPersistence.disable();

    // Destroy queue
    this.queue.destroy();

    // Clear singleton instance
    // @ts-expect-error - Resetting singleton
    ToastManager.instance = null;
  }
  isActive(id) {
    return this.queue.getActive(id) !== undefined;
  }
  getActiveToasts() {
    return this.queue.getAllActive();
  }
  getQueuedToasts() {
    return this.queue.getQueue();
  }
  setCustomViewHandler(handler) {
    this.customViewHandler = handler;
  }

  // Advanced queue management methods
  getQueueStats() {
    return this.queue.getStats();
  }
  clearGroup(group) {
    const clearedToasts = this.queue.clearGroup(group);
    // Hide any active toasts in the group
    clearedToasts.forEach(toast => {
      if (this.isActive(toast.id)) {
        this.hideToast(toast.id);
      }
    });
    return clearedToasts;
  }
  findByGroup(group) {
    return this.queue.findByGroup(group);
  }
  updateToast(id, updates) {
    return this.queue.updateToast(id, updates);
  }
  reorderToast(id, newPriority) {
    return this.queue.updateToast(id, {
      priority: newPriority
    });
  }
  pauseQueue() {
    this.queue.setProcessing(true);
  }
  resumeQueue() {
    this.queue.setProcessing(false);
    this.processQueue();
  }
  getToastPosition(id) {
    const queuedToasts = this.queue.getQueue();
    const index = queuedToasts.findIndex(t => t.id === id);
    return index >= 0 ? index : undefined;
  }
}
//# sourceMappingURL=manager.js.map