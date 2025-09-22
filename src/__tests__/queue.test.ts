import { beforeEach, describe, expect, it } from '@jest/globals'
import { ToastQueue } from '../queue'
import type { QueuedToast } from '../types'

describe('ToastQueue', () => {
  let queue: ToastQueue

  const createToast = (id: string, priority?: number): QueuedToast => ({
    id,
    message: `Toast ${id}`,
    timestamp: Date.now(),
    priority,
  })

  beforeEach(() => {
    queue = new ToastQueue(2) // Max 2 concurrent
  })

  describe('enqueue', () => {
    it('should add toast to queue', () => {
      const toast = createToast('1')
      queue.enqueue(toast)
      expect(queue.size).toBe(1)
    })

    it('should maintain priority order', () => {
      queue.enqueue(createToast('1', 1))
      queue.enqueue(createToast('2', 5))
      queue.enqueue(createToast('3', 3))

      expect(queue.dequeue()?.id).toBe('2') // Highest priority
      expect(queue.dequeue()?.id).toBe('3')
      expect(queue.dequeue()?.id).toBe('1') // Lowest priority
    })

    it('should add non-priority toasts at the end', () => {
      queue.enqueue(createToast('1', 5))
      queue.enqueue(createToast('2')) // No priority
      queue.enqueue(createToast('3', 3))

      expect(queue.dequeue()?.id).toBe('1')
      expect(queue.dequeue()?.id).toBe('3')
      expect(queue.dequeue()?.id).toBe('2')
    })
  })

  describe('dequeue', () => {
    it('should return undefined when queue is empty', () => {
      expect(queue.dequeue()).toBeUndefined()
    })

    it('should return undefined when max concurrent reached', () => {
      queue.addActive(createToast('active1'))
      queue.addActive(createToast('active2'))
      queue.enqueue(createToast('queued'))

      expect(queue.dequeue()).toBeUndefined()
    })

    it('should return next toast when capacity available', () => {
      queue.enqueue(createToast('1'))
      queue.addActive(createToast('active'))

      const toast = queue.dequeue()
      expect(toast?.id).toBe('1')
    })
  })

  describe('active toast management', () => {
    it('should add active toast', () => {
      const toast = createToast('1')
      queue.addActive(toast)
      expect(queue.activeSize).toBe(1)
      expect(queue.getActive('1')).toBe(toast)
    })

    it('should remove active toast', () => {
      const toast = createToast('1')
      queue.addActive(toast)

      const removed = queue.removeActive('1')
      expect(removed).toBe(toast)
      expect(queue.activeSize).toBe(0)
      expect(queue.getActive('1')).toBeUndefined()
    })

    it('should get all active toasts', () => {
      const toast1 = createToast('1')
      const toast2 = createToast('2')

      queue.addActive(toast1)
      queue.addActive(toast2)

      const active = queue.getAllActive()
      expect(active).toHaveLength(2)
      expect(active).toContainEqual(toast1)
      expect(active).toContainEqual(toast2)
    })
  })

  describe('findDuplicate', () => {
    it('should find duplicate by message', () => {
      const toast = createToast('1')
      queue.addActive(toast)

      const duplicate = queue.findDuplicate('Toast 1')
      expect(duplicate).toBe(toast)
    })

    it('should return undefined if no duplicate', () => {
      queue.addActive(createToast('1'))

      const duplicate = queue.findDuplicate('Different message')
      expect(duplicate).toBeUndefined()
    })
  })

  describe('clear', () => {
    it('should clear queue and active toasts', () => {
      queue.enqueue(createToast('1'))
      queue.enqueue(createToast('2'))
      queue.addActive(createToast('3'))

      queue.clear()

      expect(queue.size).toBe(0)
      expect(queue.activeSize).toBe(0)
    })
  })

  describe('hasCapacity', () => {
    it('should return true when below max concurrent', () => {
      queue.addActive(createToast('1'))
      expect(queue.hasCapacity()).toBe(true)
    })

    it('should return false when at max concurrent', () => {
      queue.addActive(createToast('1'))
      queue.addActive(createToast('2'))
      expect(queue.hasCapacity()).toBe(false)
    })
  })

  describe('processing state', () => {
    it('should set and get processing state', () => {
      expect(queue.processing).toBe(false)

      queue.setProcessing(true)
      expect(queue.processing).toBe(true)

      queue.setProcessing(false)
      expect(queue.processing).toBe(false)
    })
  })
})
