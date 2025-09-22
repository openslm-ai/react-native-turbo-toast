"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.calculateDuration = calculateDuration;
exports.generateId = generateId;
exports.triggerHaptic = triggerHaptic;
function generateId() {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
function calculateDuration(duration) {
  if (typeof duration === 'number') return duration;
  if (duration === 'long') return 3500;
  return 2000;
}
function triggerHaptic(type) {
  // Native implementation will override this
  if ('vibrate' in navigator) {
    switch (type) {
      case 'success':
      case 'light':
        navigator.vibrate(50);
        break;
      case 'warning':
      case 'medium':
        navigator.vibrate(100);
        break;
      case 'error':
      case 'heavy':
        navigator.vibrate([100, 50, 100]);
        break;
    }
  }
}
//# sourceMappingURL=utils.js.map