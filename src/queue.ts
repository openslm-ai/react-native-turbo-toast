import type { QueuedToast } from './types'

export class ToastQueue {
  private queue: QueuedToast[] = []
  private activeToasts: Map<string, QueuedToast> = new Map()
  private isProcessing = false
  private maxConcurrent: number

  constructor(maxConcurrent = 1) {
    this.maxConcurrent = maxConcurrent
  }

  enqueue(toast: QueuedToast): void {
    if (toast.priority) {
      const toastPriority = toast.priority || 0
      const insertIndex = this.queue.findIndex((t) => (t.priority || 0) < toastPriority)
      if (insertIndex === -1) {
        this.queue.push(toast)
      } else {
        this.queue.splice(insertIndex, 0, toast)
      }
    } else {
      this.queue.push(toast)
    }
  }

  dequeue(): QueuedToast | undefined {
    if (this.activeToasts.size >= this.maxConcurrent) {
      return undefined
    }
    return this.queue.shift()
  }

  addActive(toast: QueuedToast): void {
    this.activeToasts.set(toast.id, toast)
  }

  removeActive(id: string): QueuedToast | undefined {
    const toast = this.activeToasts.get(id)
    if (toast) {
      this.activeToasts.delete(id)
    }
    return toast
  }

  getActive(id: string): QueuedToast | undefined {
    return this.activeToasts.get(id)
  }

  getAllActive(): QueuedToast[] {
    return Array.from(this.activeToasts.values())
  }

  findDuplicate(message: string): QueuedToast | undefined {
    return Array.from(this.activeToasts.values()).find((t) => t.message === message)
  }

  clear(): void {
    this.queue = []
    this.activeToasts.clear()
  }

  hasCapacity(): boolean {
    return this.activeToasts.size < this.maxConcurrent
  }

  get size(): number {
    return this.queue.length
  }

  get activeSize(): number {
    return this.activeToasts.size
  }

  setProcessing(value: boolean): void {
    this.isProcessing = value
  }

  get processing(): boolean {
    return this.isProcessing
  }
}
