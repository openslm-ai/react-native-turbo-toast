import { useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import NativeTurboToast from './NativeTurboToast'
import TurboToastView from './TurboToastView'

export type ToastPosition = 'top' | 'center' | 'bottom'
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default'
export type ToastDuration = 'short' | 'long' | number

export interface ToastOptions {
  message: string
  duration?: ToastDuration
  position?: ToastPosition
  type?: ToastType
  backgroundColor?: string
  textColor?: string
  icon?: string
  action?: {
    text: string
    onPress: () => void
  }
}

class ToastManager {
  private static instance: ToastManager
  private queue: ToastOptions[] = []
  private isShowing = false

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager()
    }
    return ToastManager.instance
  }

  show(options: ToastOptions | string) {
    const toastOptions: ToastOptions = typeof options === 'string' ? { message: options } : options

    const finalOptions: ToastOptions = {
      duration: 'short',
      position: 'bottom',
      type: 'default',
      ...toastOptions,
    }

    if (Platform.OS === 'web') {
      // Web implementation using DOM
      this.showWebToast(finalOptions)
    } else {
      // Native implementation using TurboModule
      this.queue.push(finalOptions)
      this.processQueue()
    }
  }

  private async processQueue() {
    if (this.isShowing || this.queue.length === 0) return

    this.isShowing = true
    const options = this.queue.shift()!

    try {
      await NativeTurboToast.show(options)

      // Calculate duration in ms
      const duration =
        typeof options.duration === 'number'
          ? options.duration
          : options.duration === 'long'
            ? 3500
            : 2000

      // Auto hide after duration
      setTimeout(() => {
        NativeTurboToast.hide()
        this.isShowing = false
        this.processQueue()
      }, duration)
    } catch (error) {
      console.error('Failed to show toast:', error)
      this.isShowing = false
      this.processQueue()
    }
  }

  private showWebToast(options: ToastOptions) {
    // Simple web implementation
    const toast = document.createElement('div')
    toast.className = 'turbo-toast'
    toast.textContent = options.message

    // Apply styles
    Object.assign(toast.style, {
      position: 'fixed',
      padding: '12px 24px',
      borderRadius: '8px',
      backgroundColor: options.backgroundColor || '#333',
      color: options.textColor || '#fff',
      fontSize: '14px',
      zIndex: '99999',
      transition: 'opacity 0.3s',
      opacity: '0',
    })

    // Position
    switch (options.position) {
      case 'top':
        toast.style.top = '20px'
        toast.style.left = '50%'
        toast.style.transform = 'translateX(-50%)'
        break
      case 'center':
        toast.style.top = '50%'
        toast.style.left = '50%'
        toast.style.transform = 'translate(-50%, -50%)'
        break
      default:
        toast.style.bottom = '20px'
        toast.style.left = '50%'
        toast.style.transform = 'translateX(-50%)'
    }

    document.body.appendChild(toast)

    // Fade in
    requestAnimationFrame(() => {
      toast.style.opacity = '1'
    })

    // Remove after duration
    const duration =
      typeof options.duration === 'number'
        ? options.duration
        : options.duration === 'long'
          ? 3500
          : 2000

    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, duration)
  }

  hide() {
    if (Platform.OS !== 'web') {
      NativeTurboToast.hide()
    }
  }

  hideAll() {
    this.queue = []
    if (Platform.OS !== 'web') {
      NativeTurboToast.hideAll()
    }
  }
}

// Export singleton instance
const Toast = ToastManager.getInstance()

// Export functions
export const show = (options: ToastOptions | string) => Toast.show(options)
export const hide = () => Toast.hide()
export const hideAll = () => Toast.hideAll()

// Export component
export { TurboToastView }

// Default export
export default {
  show,
  hide,
  hideAll,
}
