"use strict";

export class ToastAnalytics {
  providers = [];
  isEnabled = true;
  globalMetadata = {};
  eventQueue = [];
  batchSize = 10;
  batchInterval = 5000;
  addProvider(provider) {
    this.providers.push(provider);
  }
  removeProvider(provider) {
    const index = this.providers.indexOf(provider);
    if (index > -1) {
      this.providers.splice(index, 1);
    }
  }
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled && this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
      this.eventQueue = [];
    }
  }
  setUserId(userId) {
    this.userId = userId;
    this.providers.forEach(provider => {
      if (provider.identify) {
        provider.identify(userId, this.globalMetadata);
      }
    });
  }
  setGlobalMetadata(metadata) {
    this.globalMetadata = {
      ...this.globalMetadata,
      ...metadata
    };
  }
  trackToastShown(toast) {
    this.track({
      eventType: 'toast_shown',
      toastId: toast.id,
      toastType: toast.type,
      message: toast.message,
      position: toast.position,
      duration: toast.duration,
      priority: toast.priority,
      group: toast.group,
      timestamp: Date.now(),
      metadata: {
        hasIcon: !!toast.icon,
        hasAction: !!toast.action || !!(toast.actions && toast.actions.length > 0),
        hasCustomView: !!toast.customView,
        animationPreset: toast.animationPreset
      }
    });
  }
  trackToastHidden(toast, reason) {
    this.track({
      eventType: 'toast_hidden',
      toastId: toast.id,
      toastType: toast.type,
      timestamp: Date.now(),
      metadata: {
        dismissReason: reason,
        displayDuration: Date.now() - toast.timestamp
      }
    });
  }
  trackToastClicked(toast) {
    this.track({
      eventType: 'toast_clicked',
      toastId: toast.id,
      toastType: toast.type,
      message: toast.message,
      timestamp: Date.now()
    });
  }
  trackToastSwiped(toast) {
    this.track({
      eventType: 'toast_swiped',
      toastId: toast.id,
      toastType: toast.type,
      timestamp: Date.now()
    });
  }
  trackToastActionPressed(toast, actionStyle) {
    this.track({
      eventType: 'toast_action_pressed',
      toastId: toast.id,
      toastType: toast.type,
      actionType: actionStyle,
      timestamp: Date.now()
    });
  }
  trackToastError(error, options) {
    this.track({
      eventType: 'toast_error',
      toastId: options?.id || 'unknown',
      errorMessage: error.message,
      timestamp: Date.now(),
      metadata: {
        stack: error.stack,
        options
      }
    });
  }
  trackToastQueued(toast) {
    this.track({
      eventType: 'toast_queued',
      toastId: toast.id,
      toastType: toast.type,
      priority: toast.priority,
      group: toast.group,
      timestamp: Date.now(),
      metadata: {
        queuePosition: toast.queuePosition
      }
    });
  }
  trackToastExpired(toast) {
    this.track({
      eventType: 'toast_expired',
      toastId: toast.id,
      toastType: toast.type,
      timestamp: Date.now(),
      metadata: {
        expiresAt: toast.expiresAt
      }
    });
  }
  track(event) {
    if (!this.isEnabled || this.providers.length === 0) return;
    const enrichedEvent = {
      ...event,
      metadata: {
        ...this.globalMetadata,
        ...event.metadata,
        userId: this.userId
      }
    };

    // Add to queue
    this.eventQueue.push(enrichedEvent);

    // Start batch timer if not running
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushEvents();
      }, this.batchInterval);
    }

    // Flush if batch size reached
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }
  flushEvents() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }
    if (this.eventQueue.length === 0) return;
    const events = [...this.eventQueue];
    this.eventQueue = [];

    // Send to all providers
    this.providers.forEach(provider => {
      events.forEach(event => {
        try {
          provider.trackEvent(event);
        } catch (error) {
          console.warn('Analytics provider error:', error);
        }
      });
    });
  }
  async flush() {
    this.flushEvents();

    // Call flush on providers that support it
    await Promise.all(this.providers.filter(p => p.flush).map(p => {
      try {
        return p.flush();
      } catch (error) {
        console.warn('Analytics provider flush error:', error);
        return Promise.resolve();
      }
    }));
  }
}

// Default providers
export class ConsoleAnalyticsProvider {
  trackEvent(event) {
    console.log('[Toast Analytics]', event.eventType, event);
  }
  identify(userId, traits) {
    console.log('[Toast Analytics] Identify:', userId, traits);
  }
}
export class CustomAnalyticsProvider {
  constructor(onTrackEvent, onIdentify, onFlush) {
    this.onTrackEvent = onTrackEvent;
    this.onIdentify = onIdentify;
    this.onFlush = onFlush;
  }
  trackEvent(event) {
    return this.onTrackEvent(event);
  }
  identify(userId, traits) {
    if (this.onIdentify) {
      return this.onIdentify(userId, traits);
    }
  }
  flush() {
    if (this.onFlush) {
      return this.onFlush();
    }
  }
}
export const toastAnalytics = new ToastAnalytics();
//# sourceMappingURL=analytics.js.map