export type ToastPosition = 'top' | 'center' | 'bottom'
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default'
export type ToastDuration = 'short' | 'long' | number

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
  customView?: React.ReactNode

  // Behavior
  dismissOnPress?: boolean
  swipeToDismiss?: boolean
  preventDuplicate?: boolean
  id?: string

  // Actions
  action?: ToastAction
  actions?: ToastAction[]

  // Animations
  animationDuration?: number
  hapticFeedback?: 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy'

  // Callbacks
  onShow?: () => void
  onHide?: () => void
  onPress?: () => void
}

export interface QueuedToast extends ToastOptions {
  id: string
  priority?: number
  timestamp: number
}

export interface ToastConfig {
  maxConcurrent?: number
  defaultOptions?: Partial<ToastOptions>
}
