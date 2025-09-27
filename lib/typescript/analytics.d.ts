import type { QueuedToast, ToastOptions } from './types';
export interface ToastAnalyticsEvent {
    eventType: 'toast_shown' | 'toast_hidden' | 'toast_clicked' | 'toast_swiped' | 'toast_action_pressed' | 'toast_error' | 'toast_queued' | 'toast_expired';
    toastId: string;
    toastType?: string;
    message?: string;
    position?: string;
    duration?: number | string;
    priority?: number;
    group?: string;
    actionType?: string;
    errorMessage?: string;
    timestamp: number;
    metadata?: Record<string, any>;
}
export interface AnalyticsProvider {
    trackEvent(event: ToastAnalyticsEvent): void | Promise<void>;
    identify?(userId: string, traits?: Record<string, any>): void | Promise<void>;
    flush?(): void | Promise<void>;
}
export declare class ToastAnalytics {
    private providers;
    private isEnabled;
    private userId?;
    private globalMetadata;
    private eventQueue;
    private batchSize;
    private batchInterval;
    private batchTimer?;
    addProvider(provider: AnalyticsProvider): void;
    removeProvider(provider: AnalyticsProvider): void;
    setEnabled(enabled: boolean): void;
    setUserId(userId: string): void;
    setGlobalMetadata(metadata: Record<string, any>): void;
    trackToastShown(toast: QueuedToast): void;
    trackToastHidden(toast: QueuedToast, reason: 'auto' | 'manual' | 'action' | 'swipe'): void;
    trackToastClicked(toast: QueuedToast): void;
    trackToastSwiped(toast: QueuedToast): void;
    trackToastActionPressed(toast: QueuedToast, actionStyle?: string): void;
    trackToastError(error: Error, options?: ToastOptions): void;
    trackToastQueued(toast: QueuedToast): void;
    trackToastExpired(toast: QueuedToast): void;
    private track;
    private flushEvents;
    flush(): Promise<void>;
}
export declare class ConsoleAnalyticsProvider implements AnalyticsProvider {
    trackEvent(event: ToastAnalyticsEvent): void;
    identify(userId: string, traits?: Record<string, any>): void;
}
export declare class CustomAnalyticsProvider implements AnalyticsProvider {
    private onTrackEvent;
    private onIdentify?;
    private onFlush?;
    constructor(onTrackEvent: (event: ToastAnalyticsEvent) => void | Promise<void>, onIdentify?: ((userId: string, traits?: Record<string, any>) => void | Promise<void>) | undefined, onFlush?: (() => void | Promise<void>) | undefined);
    trackEvent(event: ToastAnalyticsEvent): void | Promise<void>;
    identify(userId: string, traits?: Record<string, any>): void | Promise<void>;
    flush(): void | Promise<void>;
}
export declare const toastAnalytics: ToastAnalytics;
//# sourceMappingURL=analytics.d.ts.map