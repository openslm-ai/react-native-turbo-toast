import type { QueuedToast, ToastOptions } from './types'

export interface ToastAnalyticsEvent {
  eventType:
    | 'toast_shown'
    | 'toast_hidden'
    | 'toast_clicked'
    | 'toast_swiped'
    | 'toast_action_pressed'
    | 'toast_error'
    | 'toast_queued'
    | 'toast_expired'
  toastId: string
  toastType?: string
  message?: string
  position?: string
  duration?: number | string
  priority?: number
  group?: string
  actionType?: string
  errorMessage?: string
  timestamp: number
  metadata?: Record<string, any>
}

export interface AnalyticsProvider {
  trackEvent(event: ToastAnalyticsEvent): void | Promise<void>
  identify?(userId: string, traits?: Record<string, any>): void | Promise<void>
  flush?(): void | Promise<void>
}

export class ToastAnalytics {
  private providers: AnalyticsProvider[] = []
  private isEnabled = true
  private userId?: string
  private globalMetadata: Record<string, any> = {}
  private eventQueue: ToastAnalyticsEvent[] = []
  private batchSize = 10
  private batchInterval = 5000
  private batchTimer?: ReturnType<typeof setTimeout>

  addProvider(provider: AnalyticsProvider): void {
    this.providers.push(provider)
  }

  removeProvider(provider: AnalyticsProvider): void {
    const index = this.providers.indexOf(provider)
    if (index > -1) {
      this.providers.splice(index, 1)
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    if (!enabled && this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = undefined
      this.eventQueue = []
    }
  }

  setUserId(userId: string): void {
    this.userId = userId
    this.providers.forEach((provider) => {
      if (provider.identify) {
        provider.identify(userId, this.globalMetadata)
      }
    })
  }

  setGlobalMetadata(metadata: Record<string, any>): void {
    this.globalMetadata = { ...this.globalMetadata, ...metadata }
  }

  trackToastShown(toast: QueuedToast): void {
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
        animationPreset: toast.animationPreset,
      },
    })
  }

  trackToastHidden(toast: QueuedToast, reason: 'auto' | 'manual' | 'action' | 'swipe'): void {
    this.track({
      eventType: 'toast_hidden',
      toastId: toast.id,
      toastType: toast.type,
      timestamp: Date.now(),
      metadata: {
        dismissReason: reason,
        displayDuration: Date.now() - toast.timestamp,
      },
    })
  }

  trackToastClicked(toast: QueuedToast): void {
    this.track({
      eventType: 'toast_clicked',
      toastId: toast.id,
      toastType: toast.type,
      message: toast.message,
      timestamp: Date.now(),
    })
  }

  trackToastSwiped(toast: QueuedToast): void {
    this.track({
      eventType: 'toast_swiped',
      toastId: toast.id,
      toastType: toast.type,
      timestamp: Date.now(),
    })
  }

  trackToastActionPressed(toast: QueuedToast, actionStyle?: string): void {
    this.track({
      eventType: 'toast_action_pressed',
      toastId: toast.id,
      toastType: toast.type,
      actionType: actionStyle,
      timestamp: Date.now(),
    })
  }

  trackToastError(error: Error, options?: ToastOptions): void {
    this.track({
      eventType: 'toast_error',
      toastId: options?.id || 'unknown',
      errorMessage: error.message,
      timestamp: Date.now(),
      metadata: {
        stack: error.stack,
        options,
      },
    })
  }

  trackToastQueued(toast: QueuedToast): void {
    this.track({
      eventType: 'toast_queued',
      toastId: toast.id,
      toastType: toast.type,
      priority: toast.priority,
      group: toast.group,
      timestamp: Date.now(),
      metadata: {
        queuePosition: toast.queuePosition,
      },
    })
  }

  trackToastExpired(toast: QueuedToast): void {
    this.track({
      eventType: 'toast_expired',
      toastId: toast.id,
      toastType: toast.type,
      timestamp: Date.now(),
      metadata: {
        expiresAt: toast.expiresAt,
      },
    })
  }

  private track(event: ToastAnalyticsEvent): void {
    if (!this.isEnabled || this.providers.length === 0) return

    const enrichedEvent: ToastAnalyticsEvent = {
      ...event,
      metadata: {
        ...this.globalMetadata,
        ...event.metadata,
        userId: this.userId,
      },
    }

    // Add to queue
    this.eventQueue.push(enrichedEvent)

    // Start batch timer if not running
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.flushEvents()
      }, this.batchInterval)
    }

    // Flush if batch size reached
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents()
    }
  }

  private flushEvents(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = undefined
    }

    if (this.eventQueue.length === 0) return

    const events = [...this.eventQueue]
    this.eventQueue = []

    // Send to all providers
    this.providers.forEach((provider) => {
      events.forEach((event) => {
        try {
          provider.trackEvent(event)
        } catch (error) {
          console.warn('Analytics provider error:', error)
        }
      })
    })
  }

  async flush(): Promise<void> {
    this.flushEvents()

    // Call flush on providers that support it
    await Promise.all(
      this.providers
        .filter((p) => p.flush)
        .map((p) => {
          try {
            return p.flush!()
          } catch (error) {
            console.warn('Analytics provider flush error:', error)
            return Promise.resolve()
          }
        })
    )
  }
}

// Default providers
export class ConsoleAnalyticsProvider implements AnalyticsProvider {
  trackEvent(event: ToastAnalyticsEvent): void {
    console.log('[Toast Analytics]', event.eventType, event)
  }

  identify(userId: string, traits?: Record<string, any>): void {
    console.log('[Toast Analytics] Identify:', userId, traits)
  }
}

export class CustomAnalyticsProvider implements AnalyticsProvider {
  constructor(
    private onTrackEvent: (event: ToastAnalyticsEvent) => void | Promise<void>,
    private onIdentify?: (userId: string, traits?: Record<string, any>) => void | Promise<void>,
    private onFlush?: () => void | Promise<void>
  ) {}

  trackEvent(event: ToastAnalyticsEvent): void | Promise<void> {
    return this.onTrackEvent(event)
  }

  identify(userId: string, traits?: Record<string, any>): void | Promise<void> {
    if (this.onIdentify) {
      return this.onIdentify(userId, traits)
    }
  }

  flush(): void | Promise<void> {
    if (this.onFlush) {
      return this.onFlush()
    }
  }
}

export const toastAnalytics = new ToastAnalytics()