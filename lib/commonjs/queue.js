"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToastQueue = void 0;
class ToastQueue {
  queue = [];
  activeToasts = new Map();
  isProcessing = false;
  constructor(maxConcurrent = 1) {
    this.maxConcurrent = maxConcurrent;
  }
  enqueue(toast) {
    if (toast.priority) {
      const toastPriority = toast.priority || 0;
      const insertIndex = this.queue.findIndex(t => (t.priority || 0) < toastPriority);
      if (insertIndex === -1) {
        this.queue.push(toast);
      } else {
        this.queue.splice(insertIndex, 0, toast);
      }
    } else {
      this.queue.push(toast);
    }
  }
  dequeue() {
    if (this.activeToasts.size >= this.maxConcurrent) {
      return undefined;
    }
    return this.queue.shift();
  }
  addActive(toast) {
    this.activeToasts.set(toast.id, toast);
  }
  removeActive(id) {
    const toast = this.activeToasts.get(id);
    if (toast) {
      this.activeToasts.delete(id);
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
    return Array.from(this.activeToasts.values()).find(t => t.message === message);
  }
  clear() {
    this.queue = [];
    this.activeToasts.clear();
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
}
exports.ToastQueue = ToastQueue;
//# sourceMappingURL=queue.js.map