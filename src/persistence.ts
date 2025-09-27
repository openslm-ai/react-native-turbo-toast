import type { QueuedToast } from './types'

// AsyncStorage interface - users need to install @react-native-async-storage/async-storage
interface IAsyncStorage {
  getItem(key: string): Promise<string | null>
  setItem(key: string, value: string): Promise<void>
  removeItem(key: string): Promise<void>
}

const STORAGE_KEY = '@turbo_toast_queue'
const STORAGE_VERSION = '1.0'

export interface PersistedData {
  version: string
  toasts: QueuedToast[]
  timestamp: number
}

export class ToastPersistence {
  private isEnabled = false
  private autoSaveInterval: ReturnType<typeof setInterval> | null = null
  private storage: IAsyncStorage | null = null

  async enable(storage?: IAsyncStorage): Promise<void> {
    if (storage) {
      this.storage = storage
      this.isEnabled = true
    } else {
      // Try to load AsyncStorage dynamically
      try {
        // @ts-ignore - Optional peer dependency
        const AsyncStorageModule = require('@react-native-async-storage/async-storage')
        this.storage = AsyncStorageModule.default || AsyncStorageModule
        this.isEnabled = true
      } catch {
        console.warn('AsyncStorage not available. Install @react-native-async-storage/async-storage to enable persistence.')
        this.isEnabled = false
      }
    }
  }

  disable(): void {
    this.isEnabled = false
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
  }

  async save(toasts: QueuedToast[]): Promise<void> {
    if (!this.isEnabled) return

    try {
      const data: PersistedData = {
        version: STORAGE_VERSION,
        toasts: toasts.map((toast) => ({
          ...toast,
          // Remove functions as they can't be serialized
          onShow: undefined,
          onHide: undefined,
          onPress: undefined,
          onError: undefined,
          customView: undefined,
          action: toast.action
            ? { text: toast.action.text, style: toast.action.style }
            : undefined,
          actions: toast.actions?.map((a) => ({ text: a.text, style: a.style })),
        })) as QueuedToast[],
        timestamp: Date.now(),
      }

      if (this.storage) {
        await this.storage.setItem(STORAGE_KEY, JSON.stringify(data))
      }
    } catch (error) {
      console.warn('Failed to persist toasts:', error)
    }
  }

  async load(): Promise<QueuedToast[]> {
    if (!this.isEnabled || !this.storage) return []

    try {
      const stored = await this.storage.getItem(STORAGE_KEY)
      if (!stored) return []

      const data: PersistedData = JSON.parse(stored)

      // Check version compatibility
      if (data.version !== STORAGE_VERSION) {
        await this.clear()
        return []
      }

      // Filter out expired toasts (older than 5 minutes)
      const maxAge = 5 * 60 * 1000
      const now = Date.now()
      if (now - data.timestamp > maxAge) {
        await this.clear()
        return []
      }

      return data.toasts.filter((toast) => {
        // Filter out toasts that have expired
        if (toast.expiresAt && toast.expiresAt < now) {
          return false
        }
        return true
      })
    } catch (error) {
      console.warn('Failed to load persisted toasts:', error)
      return []
    }
  }

  async clear(): Promise<void> {
    if (!this.storage) return

    try {
      await this.storage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear persisted toasts:', error)
    }
  }

  startAutoSave(getToasts: () => QueuedToast[], interval = 1000): void {
    if (!this.isEnabled) return

    this.stopAutoSave()
    this.autoSaveInterval = setInterval(() => {
      this.save(getToasts())
    }, interval)
  }

  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
  }
}

export const toastPersistence = new ToastPersistence()