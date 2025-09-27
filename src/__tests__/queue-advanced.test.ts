import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { ToastQueue } from '../queue'
import type { QueuedToast, QueueEvent } from '../types'

describe('ToastQueue Advanced Features', () => {
  let queue: ToastQueue
  let mockEventHandler: jest.MockedFunction<(event: QueueEvent) => void>

  const createToast = (id: string, options: Partial<QueuedToast> = {}): QueuedToast => ({
    id,
    message: `Toast ${id}`,
    timestamp: Date.now(),
    priority: 0,
    ...options,
  })

  beforeEach(() => {
    mockEventHandler = jest.fn()
    queue = new ToastQueue({
      maxConcurrent: 2,
      maxQueueSize: 5,
      groupDeduplication: true,
      queueTimeout: 10000,
      onQueueEvent: mockEventHandler,
    })
  })

  afterEach(() => {
    queue.destroy()
  })

  describe('priority management', () => {
    it('should sort by priority correctly', () => {
      queue.enqueue(createToast('low', { priority: 1 }))
      queue.enqueue(createToast('high', { priority: 10 }))
      queue.enqueue(createToast('medium', { priority: 5 }))

      const queuedToasts = queue.getQueue()
      expect(queuedToasts[0].id).toBe('high')
      expect(queuedToasts[1].id).toBe('medium')
      expect(queuedToasts[2].id).toBe('low')
    })

    it('should maintain FIFO for same priority', () => {
      queue.enqueue(createToast('first', { priority: 5 }))
      queue.enqueue(createToast('second', { priority: 5 }))
      queue.enqueue(createToast('third', { priority: 5 }))

      const queuedToasts = queue.getQueue()
      expect(queuedToasts.map((t) => t.id)).toEqual(['first', 'second', 'third'])
    })

    it('should update queue positions', () => {
      queue.enqueue(createToast('1', { priority: 1 }))
      queue.enqueue(createToast('2', { priority: 2 }))
      queue.enqueue(createToast('3', { priority: 3 }))

      const queuedToasts = queue.getQueue()
      expect(queuedToasts[0].queuePosition).toBe(0)
      expect(queuedToasts[1].queuePosition).toBe(1)
      expect(queuedToasts[2].queuePosition).toBe(2)
    })
  })

  describe('group management', () => {
    it('should group toasts correctly', () => {
      queue.enqueue(createToast('1', { group: 'notifications' }))
      queue.enqueue(createToast('2', { group: 'notifications' }))
      queue.enqueue(createToast('3', { group: 'system' }))

      const notificationToasts = queue.findByGroup('notifications')
      const systemToasts = queue.findByGroup('system')

      expect(notificationToasts).toHaveLength(2)
      expect(systemToasts).toHaveLength(1)
      expect(notificationToasts.map((t) => t.id)).toEqual(['1', '2'])
      expect(systemToasts[0].id).toBe('3')
    })

    it('should clear group correctly', () => {
      queue.enqueue(createToast('1', { group: 'notifications' }))
      queue.enqueue(createToast('2', { group: 'notifications' }))
      queue.enqueue(createToast('3', { group: 'system' }))

      const cleared = queue.clearGroup('notifications')
      expect(cleared).toHaveLength(2)
      expect(queue.findByGroup('notifications')).toHaveLength(0)
      expect(queue.findByGroup('system')).toHaveLength(1)
    })

    it('should handle group deduplication', () => {
      const toast1 = createToast('1', { group: 'test', message: 'duplicate' })
      const toast2 = createToast('2', { group: 'test', message: 'duplicate' })

      expect(queue.enqueue(toast1)).toBe(true)
      expect(queue.enqueue(toast2)).toBe(true) // Should update existing instead

      const groupToasts = queue.findByGroup('test')
      expect(groupToasts).toHaveLength(1)
      expect(groupToasts[0].id).toBe('1') // Original ID should be kept
    })
  })

  describe('deduplication', () => {
    it('should prevent duplicate messages', () => {
      const toast1 = createToast('1', { message: 'duplicate', preventDuplicate: true })
      const toast2 = createToast('2', { message: 'duplicate', preventDuplicate: true })

      expect(queue.enqueue(toast1)).toBe(true)
      expect(queue.enqueue(toast2)).toBe(false)
      expect(queue.size).toBe(1)
    })

    it('should allow duplicates when not prevented', () => {
      const toast1 = createToast('1', { message: 'duplicate' })
      const toast2 = createToast('2', { message: 'duplicate' })

      expect(queue.enqueue(toast1)).toBe(true)
      expect(queue.enqueue(toast2)).toBe(true)
      expect(queue.size).toBe(2)
    })
  })

  describe('queue size limits', () => {
    it('should respect max queue size', () => {
      // Fill queue to max (5)
      for (let i = 0; i < 6; i++) {
        queue.enqueue(createToast(`${i}`, { priority: 1 }))
      }

      expect(queue.size).toBe(5)
    })

    it('should remove lowest priority when full', () => {
      // Fill with low priority
      for (let i = 0; i < 5; i++) {
        queue.enqueue(createToast(`low-${i}`, { priority: 1 }))
      }

      // Add high priority - should remove one low priority
      queue.enqueue(createToast('high', { priority: 10 }))

      expect(queue.size).toBe(5)
      const queuedToasts = queue.getQueue()
      expect(queuedToasts[0].id).toBe('high')
    })
  })

  describe('toast updates', () => {
    it('should update queued toast', () => {
      queue.enqueue(createToast('1', { message: 'original', priority: 1 }))

      const updated = queue.updateToast('1', { message: 'updated', priority: 5 })
      expect(updated).toBe(true)

      const toast = queue.getQueue().find((t) => t.id === '1')
      expect(toast?.message).toBe('updated')
      expect(toast?.priority).toBe(5)
    })

    it('should re-sort queue on priority update', () => {
      queue.enqueue(createToast('1', { priority: 1 }))
      queue.enqueue(createToast('2', { priority: 2 }))
      queue.enqueue(createToast('3', { priority: 3 }))

      queue.updateToast('1', { priority: 10 })

      const queuedToasts = queue.getQueue()
      expect(queuedToasts[0].id).toBe('1') // Now highest priority
    })

    it('should update active toast', () => {
      const toast = createToast('1', { message: 'original' })
      queue.addActive(toast)

      const updated = queue.updateToast('1', { message: 'updated' })
      expect(updated).toBe(true)

      const activeToast = queue.getActive('1')
      expect(activeToast?.message).toBe('updated')
    })
  })

  describe('statistics', () => {
    it('should calculate correct stats', () => {
      queue.enqueue(createToast('1', { priority: 1, group: 'test' }))
      queue.enqueue(createToast('2', { priority: 2, group: 'test' }))
      queue.addActive(createToast('3', { priority: 3, group: 'other' }))

      const stats = queue.getStats()

      expect(stats.total).toBe(3)
      expect(stats.active).toBe(1)
      expect(stats.pending).toBe(2)
      expect(stats.byPriority).toEqual({ 1: 1, 2: 1, 3: 1 })
      expect(stats.byGroup).toEqual({ test: 2, other: 1 })
      expect(stats.oldestTimestamp).toBeDefined()
      expect(stats.newestTimestamp).toBeDefined()
    })
  })

  describe('events', () => {
    it('should emit add event', () => {
      const toast = createToast('1')
      queue.enqueue(toast)

      expect(mockEventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'added',
          toast,
        }),
      )
    })

    it('should emit remove event', () => {
      const toast = createToast('1')
      queue.addActive(toast)
      queue.removeActive('1')

      expect(mockEventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'removed',
          toast,
        }),
      )
    })

    it('should emit update event', () => {
      const toast = createToast('1')
      queue.addActive(toast)
      queue.updateToast('1', { message: 'updated' })

      expect(mockEventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'updated',
          toast: expect.objectContaining({ message: 'updated' }),
        }),
      )
    })

    it('should emit clear event', () => {
      queue.clear()

      expect(mockEventHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cleared',
        }),
      )
    })
  })

  describe('expiration and cleanup', () => {
    it('should set expiration time', () => {
      const toast = createToast('1')
      queue.enqueue(toast)

      const queuedToast = queue.getQueue()[0]
      expect(queuedToast.expiresAt).toBeDefined()
      expect(queuedToast.expiresAt).toBeGreaterThan(Date.now())
    })
  })

  describe('error handling', () => {
    it('should handle event handler errors silently', () => {
      const errorHandler = jest.fn(() => {
        throw new Error('Handler error')
      })

      const errorQueue = new ToastQueue({
        onQueueEvent: errorHandler,
      })

      expect(() => {
        errorQueue.enqueue(createToast('1'))
      }).not.toThrow()

      errorQueue.destroy()
    })
  })
})
