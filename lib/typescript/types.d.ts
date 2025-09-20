export type ToastPosition = 'top' | 'center' | 'bottom';
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';
export type ToastDuration = 'short' | 'long' | number;
export interface ToastAction {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}
export interface ToastOptions {
    message: string;
    duration?: ToastDuration;
    position?: ToastPosition;
    type?: ToastType;
    backgroundColor?: string;
    textColor?: string;
    icon?: string | {
        uri: string;
    };
    customView?: React.ReactNode;
    dismissOnPress?: boolean;
    swipeToDismiss?: boolean;
    preventDuplicate?: boolean;
    id?: string;
    action?: ToastAction;
    actions?: ToastAction[];
    animationDuration?: number;
    hapticFeedback?: 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy';
    onShow?: () => void;
    onHide?: () => void;
    onPress?: () => void;
}
export interface QueuedToast extends ToastOptions {
    id: string;
    priority?: number;
    timestamp: number;
}
export interface ToastConfig {
    maxConcurrent?: number;
    defaultOptions?: Partial<ToastOptions>;
}
//# sourceMappingURL=types.d.ts.map