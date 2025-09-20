import { ToastManager } from './manager'
import TurboToastView from './TurboToastView'
import type { ToastConfig, ToastOptions } from './types'

// Re-export types
export type {
  ToastAction,
  ToastConfig,
  ToastDuration,
  ToastOptions,
  ToastPosition,
  ToastType,
} from './types'

// Create singleton instance
const Toast = ToastManager.getInstance()

// Export functions
export const show = (options: ToastOptions | string) => Toast.show(options)
export const hide = (id?: string) => Toast.hide(id)
export const hideAll = () => Toast.hideAll()
export const update = (id: string, options: Partial<ToastOptions>) => Toast.update(id, options)
export const configure = (options: ToastConfig) => Toast.configure(options)

// Export component
export { TurboToastView }

// Default export
export default {
  show,
  hide,
  hideAll,
  update,
  configure,
}
