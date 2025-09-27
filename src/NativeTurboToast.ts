import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'

export interface NativeToastOptions {
  id?: string
  message: string
  duration?: 'short' | 'long' | number
  position?: 'top' | 'center' | 'bottom'
  type?: 'success' | 'error' | 'warning' | 'info' | 'default'
  backgroundColor?: string
  textColor?: string
  icon?: string
  action?: {
    text: string
    onPress: () => void
  }
  dismissOnPress?: boolean
  swipeToDismiss?: boolean
  animationDuration?: number
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityRole?: 'alert' | 'status'
}

export interface Spec extends TurboModule {
  show(options: NativeToastOptions): Promise<void>
  hide(): void
  hideAll(): void
}

export default TurboModuleRegistry.getEnforcing<Spec>('TurboToast')
