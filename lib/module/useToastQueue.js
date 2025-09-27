"use strict";

import { useCallback, useEffect, useState } from 'react';
import { ToastManager } from './manager';
export const useToastQueue = (options = {}) => {
  const {
    refreshInterval = 1000,
    enableEvents = true,
    maxEvents = 100
  } = options;
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [activeToasts, setActiveToasts] = useState([]);
  const [queuedToasts, setQueuedToasts] = useState([]);
  const manager = ToastManager.getInstance();
  const refresh = useCallback(() => {
    setStats(manager.getQueueStats());
    setActiveToasts(manager.getActiveToasts());
    setQueuedToasts(manager.getQueuedToasts());
  }, [manager]);

  // Set up automatic refresh
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  // Set up event listener
  useEffect(() => {
    if (!enableEvents) return;
    const handleQueueEvent = event => {
      setEvents(prev => [event, ...prev.slice(0, maxEvents - 1)]);
    };

    // Configure manager to receive events
    manager.configure({
      onQueueEvent: handleQueueEvent
    });
    return () => {
      // Clean up by removing event handler
      manager.configure({
        onQueueEvent: undefined
      });
    };
  }, [enableEvents, maxEvents, manager]);
  const actions = {
    clearQueue: useCallback(() => {
      manager.hideAll();
      refresh();
    }, [manager, refresh]),
    clearGroup: useCallback(group => {
      const result = manager.clearGroup(group);
      refresh();
      return result;
    }, [manager, refresh]),
    pauseQueue: useCallback(() => {
      manager.pauseQueue();
      refresh();
    }, [manager, refresh]),
    resumeQueue: useCallback(() => {
      manager.resumeQueue();
      refresh();
    }, [manager, refresh]),
    hideToast: useCallback(id => {
      manager.hide(id);
      refresh();
    }, [manager, refresh]),
    updateToast: useCallback((id, updates) => {
      const result = manager.updateToast(id, updates);
      refresh();
      return result;
    }, [manager, refresh]),
    reorderToast: useCallback((id, newPriority) => {
      const result = manager.reorderToast(id, newPriority);
      refresh();
      return result;
    }, [manager, refresh]),
    getToastPosition: useCallback(id => {
      return manager.getToastPosition(id);
    }, [manager]),
    refresh,
    clearEvents: useCallback(() => {
      setEvents([]);
    }, [])
  };
  return {
    stats,
    events,
    activeToasts,
    queuedToasts,
    actions
  };
};

// Convenience hook for basic queue monitoring
export const useToastStats = (refreshInterval = 2000) => {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const manager = ToastManager.getInstance();
    const updateStats = () => {
      setStats(manager.getQueueStats());
    };
    updateStats();
    const interval = setInterval(updateStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);
  return stats;
};

// Hook for monitoring specific group
export const useGroupToasts = (group, refreshInterval = 1000) => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const manager = ToastManager.getInstance();
    const updateToasts = () => {
      setToasts(manager.findByGroup(group));
    };
    updateToasts();
    const interval = setInterval(updateToasts, refreshInterval);
    return () => clearInterval(interval);
  }, [group, refreshInterval]);
  return toasts;
};

// Hook for listening to queue events only
export const useQueueEvents = (maxEvents = 50) => {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    const manager = ToastManager.getInstance();
    const handleQueueEvent = event => {
      setEvents(prev => [event, ...prev.slice(0, maxEvents - 1)]);
    };
    manager.configure({
      onQueueEvent: handleQueueEvent
    });
    return () => {
      manager.configure({
        onQueueEvent: undefined
      });
    };
  }, [maxEvents]);
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);
  return {
    events,
    clearEvents
  };
};
//# sourceMappingURL=useToastQueue.js.map