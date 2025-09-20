import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'

export interface ToastOptions {
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
}

export interface Spec extends TurboModule {
  show(options: ToastOptions): Promise<void>
  hide(): void
  hideAll(): void
}

export default TurboModuleRegistry.getEnforcing<Spec>('TurboToast')
