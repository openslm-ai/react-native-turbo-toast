"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.useToastStats = exports.useToastQueue = exports.useQueueEvents = exports.useGroupToasts = void 0;
var _react = require("react");
var _manager = require("./manager");
const useToastQueue = (options = {}) => {
  const {
    refreshInterval = 1000,
    enableEvents = true,
    maxEvents = 100
  } = options;
  const [stats, setStats] = (0, _react.useState)(null);
  const [events, setEvents] = (0, _react.useState)([]);
  const [activeToasts, setActiveToasts] = (0, _react.useState)([]);
  const [queuedToasts, setQueuedToasts] = (0, _react.useState)([]);
  const manager = _manager.ToastManager.getInstance();
  const refresh = (0, _react.useCallback)(() => {
    setStats(manager.getQueueStats());
    setActiveToasts(manager.getActiveToasts());
    setQueuedToasts(manager.getQueuedToasts());
  }, [manager]);

  // Set up automatic refresh
  (0, _react.useEffect)(() => {
    refresh();
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [refresh, refreshInterval]);

  // Set up event listener
  (0, _react.useEffect)(() => {
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
    clearQueue: (0, _react.useCallback)(() => {
      manager.hideAll();
      refresh();
    }, [manager, refresh]),
    clearGroup: (0, _react.useCallback)(group => {
      const result = manager.clearGroup(group);
      refresh();
      return result;
    }, [manager, refresh]),
    pauseQueue: (0, _react.useCallback)(() => {
      manager.pauseQueue();
      refresh();
    }, [manager, refresh]),
    resumeQueue: (0, _react.useCallback)(() => {
      manager.resumeQueue();
      refresh();
    }, [manager, refresh]),
    hideToast: (0, _react.useCallback)(id => {
      manager.hide(id);
      refresh();
    }, [manager, refresh]),
    updateToast: (0, _react.useCallback)((id, updates) => {
      const result = manager.updateToast(id, updates);
      refresh();
      return result;
    }, [manager, refresh]),
    reorderToast: (0, _react.useCallback)((id, newPriority) => {
      const result = manager.reorderToast(id, newPriority);
      refresh();
      return result;
    }, [manager, refresh]),
    getToastPosition: (0, _react.useCallback)(id => {
      return manager.getToastPosition(id);
    }, [manager]),
    refresh,
    clearEvents: (0, _react.useCallback)(() => {
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
exports.useToastQueue = useToastQueue;
const useToastStats = (refreshInterval = 2000) => {
  const [stats, setStats] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    const manager = _manager.ToastManager.getInstance();
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
exports.useToastStats = useToastStats;
const useGroupToasts = (group, refreshInterval = 1000) => {
  const [toasts, setToasts] = (0, _react.useState)([]);
  (0, _react.useEffect)(() => {
    const manager = _manager.ToastManager.getInstance();
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
exports.useGroupToasts = useGroupToasts;
const useQueueEvents = (maxEvents = 50) => {
  const [events, setEvents] = (0, _react.useState)([]);
  (0, _react.useEffect)(() => {
    const manager = _manager.ToastManager.getInstance();
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
  const clearEvents = (0, _react.useCallback)(() => {
    setEvents([]);
  }, []);
  return {
    events,
    clearEvents
  };
};
exports.useQueueEvents = useQueueEvents;
//# sourceMappingURL=useToastQueue.js.map