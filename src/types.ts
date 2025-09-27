export type ToastPosition = 'top' | 'center' | 'bottom'
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default'
export type ToastDuration = 'short' | 'long' | number
export type HapticFeedback =
  | 'success'
  | 'warning'
  | 'error'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'

export interface ToastAction {
  text: string
  onPress: () => void
  style?: 'default' | 'cancel' | 'destructive'
}

export interface ToastOptions {
  message: string
  duration?: ToastDuration
  position?: ToastPosition
  type?: ToastType

  // Visual customization
  backgroundColor?: string
  textColor?: string
  icon?: string | { uri: string }
  customView?:
    | React.ReactNode
    | ((props: { toast: ToastOptions & { id: string }; onDismiss: () => void }) => React.ReactNode)

  // Progress
  progress?: number // 0.0 to 1.0
  progressColor?: string
  showProgressBar?: boolean

  // Behavior
  dismissOnPress?: boolean
  swipeToDismiss?: boolean
  preventDuplicate?: boolean
  priority?: number
  group?: string
  id?: string

  // Actions
  action?: ToastAction
  actions?: ToastAction[]

  // Animations
  animationDuration?: number
  animationPreset?: 'fade' | 'slide' | 'bounce' | 'zoom' | 'spring' | 'none'
  hapticFeedback?: HapticFeedback

  // Callbacks
  onShow?: () => void
  onHide?: () => void
  onPress?: () => void
  onError?: (error: Error) => void

  // Accessibility
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityRole?: string
}

export interface QueuedToast extends ToastOptions {
  id: string
  priority: number
  group?: string
  timestamp: number
  queuePosition?: number
  expiresAt?: number
}

export interface QueueStats {
  total: number
  active: number
  pending: number
  byPriority: Record<number, number>
  byGroup: Record<string, number>
  oldestTimestamp?: number
  newestTimestamp?: number
}

export interface QueueEvent {
  type: 'added' | 'removed' | 'updated' | 'cleared'
  toast?: QueuedToast
  stats: QueueStats
  timestamp: number
}

export interface ToastConfig {
  maxConcurrent?: number
  defaultOptions?: Partial<ToastOptions>
  maxRetries?: number
  retryDelay?: number
  maxQueueSize?: number
  groupDeduplication?: boolean
  queueTimeout?: number
  onQueueEvent?: (event: QueueEvent) => void
  stackingEnabled?: boolean
  stackingOffset?: number
  stackingMaxVisible?: number
  persistenceEnabled?: boolean
  persistenceInterval?: number
  analyticsEnabled?: boolean
}
