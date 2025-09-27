"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToastQueue = void 0;
class ToastQueue {
  queue = [];
  activeToasts = new Map();
  groupToasts = new Map();
  isProcessing = false;
  constructor(config = {}) {
    this.maxConcurrent = config.maxConcurrent || 1;
    this.maxQueueSize = config.maxQueueSize || 50;
    this.groupDeduplication = config.groupDeduplication || false;
    this.queueTimeout = config.queueTimeout || 30000; // 30 seconds
    this.eventHandler = config.onQueueEvent;

    // Start cleanup timer
    this.startCleanupTimer();
  }
  getQueue() {
    return [...this.queue];
  }
  enqueue(toast) {
    // Check queue size limit
    if (this.queue.length >= this.maxQueueSize) {
      // Remove oldest low-priority toast
      const lowestPriorityIndex = this.findLowestPriorityIndex();
      if (lowestPriorityIndex !== -1) {
        const removed = this.queue.splice(lowestPriorityIndex, 1)[0];
        this.removeFromGroup(removed);
        this.emitEvent('removed', removed);
      } else {
        return false; // Queue full with high priority items
      }
    }

    // Check for group deduplication
    if (this.groupDeduplication && toast.group) {
      const existing = this.findInGroup(toast.group, toast.message);
      if (existing) {
        // Update existing toast instead of adding new one
        this.updateToast(existing.id, {
          ...toast,
          id: existing.id
        });
        return true;
      }
    }

    // Check for message deduplication
    if (toast.preventDuplicate) {
      const duplicate = this.findDuplicate(toast.message);
      if (duplicate) {
        return false;
      }
    }

    // Set expiration time
    toast.expiresAt = Date.now() + this.queueTimeout;
    toast.priority = toast.priority || 0;

    // Insert by priority
    const insertIndex = this.findInsertIndex(toast.priority);
    this.queue.splice(insertIndex, 0, toast);

    // Update queue positions
    this.updateQueuePositions();

    // Add to group tracking
    if (toast.group) {
      this.addToGroup(toast);
    }
    this.emitEvent('added', toast);
    return true;
  }
  dequeue() {
    if (this.activeToasts.size >= this.maxConcurrent) {
      return undefined;
    }
    return this.queue.shift();
  }
  addActive(toast) {
    this.activeToasts.set(toast.id, toast);
    if (toast.group) {
      this.addToGroup(toast);
    }
  }
  removeActive(id) {
    const toast = this.activeToasts.get(id);
    if (toast) {
      this.activeToasts.delete(id);
      this.removeFromGroup(toast);
      this.emitEvent('removed', toast);
    }
    return toast;
  }
  getActive(id) {
    return this.activeToasts.get(id);
  }
  getAllActive() {
    return Array.from(this.activeToasts.values());
  }
  findDuplicate(message) {
    // Check active toasts
    const activeMatch = Array.from(this.activeToasts.values()).find(t => t.message === message);
    if (activeMatch) return activeMatch;

    // Check queued toasts
    return this.queue.find(t => t.message === message);
  }
  findInGroup(group, message) {
    const groupToastIds = this.groupToasts.get(group);
    if (!groupToastIds) return undefined;
    for (const id of groupToastIds) {
      const toast = this.activeToasts.get(id) || this.queue.find(t => t.id === id);
      if (toast && (!message || toast.message === message)) {
        return toast;
      }
    }
    return undefined;
  }
  findByGroup(group) {
    const groupToastIds = this.groupToasts.get(group);
    if (!groupToastIds) return [];
    const results = [];
    for (const id of groupToastIds) {
      const toast = this.activeToasts.get(id) || this.queue.find(t => t.id === id);
      if (toast) {
        results.push(toast);
      }
    }
    return results;
  }
  clearGroup(group) {
    const toasts = this.findByGroup(group);
    toasts.forEach(toast => {
      this.removeActive(toast.id);
      this.queue = this.queue.filter(t => t.id !== toast.id);
    });
    this.groupToasts.delete(group);
    this.updateQueuePositions();
    this.emitEvent('cleared');
    return toasts;
  }
  clear() {
    this.queue = [];
    this.activeToasts.clear();
    this.groupToasts.clear();
    this.emitEvent('cleared');
  }
  hasCapacity() {
    return this.activeToasts.size < this.maxConcurrent;
  }
  get size() {
    return this.queue.length;
  }
  get activeSize() {
    return this.activeToasts.size;
  }
  setProcessing(value) {
    this.isProcessing = value;
  }
  get processing() {
    return this.isProcessing;
  }
  getStats() {
    const stats = {
      total: this.queue.length + this.activeToasts.size,
      active: this.activeToasts.size,
      pending: this.queue.length,
      byPriority: {},
      byGroup: {}
    };

    // Calculate priority distribution
    const allToasts = [...this.queue, ...Array.from(this.activeToasts.values())];
    allToasts.forEach(toast => {
      const priority = toast.priority;
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
      if (toast.group) {
        stats.byGroup[toast.group] = (stats.byGroup[toast.group] || 0) + 1;
      }
    });

    // Find oldest and newest timestamps
    if (allToasts.length > 0) {
      const timestamps = allToasts.map(t => t.timestamp);
      stats.oldestTimestamp = Math.min(...timestamps);
      stats.newestTimestamp = Math.max(...timestamps);
    }
    return stats;
  }
  updateToast(id, updates) {
    const activeToast = this.activeToasts.get(id);
    if (activeToast) {
      Object.assign(activeToast, updates);
      this.emitEvent('updated', activeToast);
      return true;
    }
    const queueIndex = this.queue.findIndex(t => t.id === id);
    if (queueIndex !== -1) {
      Object.assign(this.queue[queueIndex], updates);
      // Re-sort if priority changed
      if (updates.priority !== undefined) {
        const toast = this.queue.splice(queueIndex, 1)[0];
        const insertIndex = this.findInsertIndex(toast.priority);
        this.queue.splice(insertIndex, 0, toast);
        this.updateQueuePositions();
      }
      this.emitEvent('updated', this.queue[queueIndex]);
      return true;
    }
    return false;
  }
  findInsertIndex(priority) {
    const index = this.queue.findIndex(t => t.priority < priority);
    return index === -1 ? this.queue.length : index;
  }
  findLowestPriorityIndex() {
    if (this.queue.length === 0) return -1;
    let lowestPriority = this.queue[0].priority;
    let lowestIndex = 0;
    for (let i = 1; i < this.queue.length; i++) {
      if (this.queue[i].priority < lowestPriority) {
        lowestPriority = this.queue[i].priority;
        lowestIndex = i;
      }
    }
    return lowestIndex;
  }
  updateQueuePositions() {
    this.queue.forEach((toast, index) => {
      toast.queuePosition = index;
    });
  }
  addToGroup(toast) {
    if (!toast.group) return;
    if (!this.groupToasts.has(toast.group)) {
      this.groupToasts.set(toast.group, new Set());
    }
    this.groupToasts.get(toast.group)?.add(toast.id);
  }
  removeFromGroup(toast) {
    if (!toast.group) return;
    const groupSet = this.groupToasts.get(toast.group);
    if (groupSet) {
      groupSet.delete(toast.id);
      if (groupSet.size === 0) {
        this.groupToasts.delete(toast.group);
      }
    }
  }
  emitEvent(type, toast) {
    if (!this.eventHandler) return;
    const event = {
      type,
      toast,
      stats: this.getStats(),
      timestamp: Date.now()
    };
    try {
      this.eventHandler(event);
    } catch {
      // Silently handle event handler errors
    }
  }
  startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredToasts();
    }, 5000); // Check every 5 seconds
  }
  cleanupExpiredToasts() {
    const now = Date.now();
    const expiredIndexes = [];
    this.queue.forEach((toast, index) => {
      if (toast.expiresAt && toast.expiresAt < now) {
        expiredIndexes.push(index);
      }
    });

    // Remove expired toasts (reverse order to maintain indexes)
    expiredIndexes.reverse().forEach(index => {
      const expired = this.queue.splice(index, 1)[0];
      this.removeFromGroup(expired);
      this.emitEvent('removed', expired);
    });
    if (expiredIndexes.length > 0) {
      this.updateQueuePositions();
    }
  }
  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
    this.clear();
  }
}
exports.ToastQueue = ToastQueue;
//# sourceMappingURL=queue.js.map