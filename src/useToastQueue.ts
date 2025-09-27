import { useCallback, useEffect, useState } from 'react'
import { ToastManager } from './manager'
import type { QueuedToast, QueueEvent, QueueStats } from './types'

export interface UseToastQueueOptions {
  refreshInterval?: number
  enableEvents?: boolean
  maxEvents?: number
}

export interface UseToastQueueReturn {
  stats: QueueStats | null
  events: QueueEvent[]
  activeToasts: QueuedToast[]
  queuedToasts: QueuedToast[]
  actions: {
    clearQueue: () => void
    clearGroup: (group: string) => QueuedToast[]
    pauseQueue: () => void
    resumeQueue: () => void
    hideToast: (id: string) => void
    updateToast: (id: string, updates: Partial<QueuedToast>) => boolean
    reorderToast: (id: string, newPriority: number) => boolean
    getToastPosition: (id: string) => number | undefined
    refresh: () => void
    clearEvents: () => void
  }
}

export const useToastQueue = (options: UseToastQueueOptions = {}): UseToastQueueReturn => {
  const { refreshInterval = 1000, enableEvents = true, maxEvents = 100 } = options

  const [stats, setStats] = useState<QueueStats | null>(null)
  const [events, setEvents] = useState<QueueEvent[]>([])
  const [activeToasts, setActiveToasts] = useState<QueuedToast[]>([])
  const [queuedToasts, setQueuedToasts] = useState<QueuedToast[]>([])

  const manager = ToastManager.getInstance()

  const refresh = useCallback(() => {
    setStats(manager.getQueueStats())
    setActiveToasts(manager.getActiveToasts())
    setQueuedToasts(manager.getQueuedToasts())
  }, [manager])

  // Set up automatic refresh
  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, refreshInterval)
    return () => clearInterval(interval)
  }, [refresh, refreshInterval])

  // Set up event listener
  useEffect(() => {
    if (!enableEvents) return

    const handleQueueEvent = (event: QueueEvent) => {
      setEvents((prev) => [event, ...prev.slice(0, maxEvents - 1)])
    }

    // Configure manager to receive events
    manager.configure({
      onQueueEvent: handleQueueEvent,
    })

    return () => {
      // Clean up by removing event handler
      manager.configure({
        onQueueEvent: undefined,
      })
    }
  }, [enableEvents, maxEvents, manager])

  const actions = {
    clearQueue: useCallback(() => {
      manager.hideAll()
      refresh()
    }, [manager, refresh]),

    clearGroup: useCallback(
      (group: string) => {
        const result = manager.clearGroup(group)
        refresh()
        return result
      },
      [manager, refresh],
    ),

    pauseQueue: useCallback(() => {
      manager.pauseQueue()
      refresh()
    }, [manager, refresh]),

    resumeQueue: useCallback(() => {
      manager.resumeQueue()
      refresh()
    }, [manager, refresh]),

    hideToast: useCallback(
      (id: string) => {
        manager.hide(id)
        refresh()
      },
      [manager, refresh],
    ),

    updateToast: useCallback(
      (id: string, updates: Partial<QueuedToast>) => {
        const result = manager.updateToast(id, updates)
        refresh()
        return result
      },
      [manager, refresh],
    ),

    reorderToast: useCallback(
      (id: string, newPriority: number) => {
        const result = manager.reorderToast(id, newPriority)
        refresh()
        return result
      },
      [manager, refresh],
    ),

    getToastPosition: useCallback(
      (id: string) => {
        return manager.getToastPosition(id)
      },
      [manager],
    ),

    refresh,

    clearEvents: useCallback(() => {
      setEvents([])
    }, []),
  }

  return {
    stats,
    events,
    activeToasts,
    queuedToasts,
    actions,
  }
}

// Convenience hook for basic queue monitoring
export const useToastStats = (refreshInterval = 2000) => {
  const [stats, setStats] = useState<QueueStats | null>(null)

  useEffect(() => {
    const manager = ToastManager.getInstance()

    const updateStats = () => {
      setStats(manager.getQueueStats())
    }

    updateStats()
    const interval = setInterval(updateStats, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  return stats
}

// Hook for monitoring specific group
export const useGroupToasts = (group: string, refreshInterval = 1000) => {
  const [toasts, setToasts] = useState<QueuedToast[]>([])

  useEffect(() => {
    const manager = ToastManager.getInstance()

    const updateToasts = () => {
      setToasts(manager.findByGroup(group))
    }

    updateToasts()
    const interval = setInterval(updateToasts, refreshInterval)

    return () => clearInterval(interval)
  }, [group, refreshInterval])

  return toasts
}

// Hook for listening to queue events only
export const useQueueEvents = (maxEvents = 50) => {
  const [events, setEvents] = useState<QueueEvent[]>([])

  useEffect(() => {
    const manager = ToastManager.getInstance()

    const handleQueueEvent = (event: QueueEvent) => {
      setEvents((prev) => [event, ...prev.slice(0, maxEvents - 1)])
    }

    manager.configure({
      onQueueEvent: handleQueueEvent,
    })

    return () => {
      manager.configure({
        onQueueEvent: undefined,
      })
    }
  }, [maxEvents])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  return { events, clearEvents }
}
