"use strict";

import { ToastManager } from './manager';
import TurboToastView from './TurboToastView';

// Re-export types

// Create singleton instance
const Toast = ToastManager.getInstance();

// Export functions
export const show = options => Toast.show(options);
export const hide = id => Toast.hide(id);
export const hideAll = () => Toast.hideAll();
export const update = (id, options) => Toast.update(id, options);
export const configure = options => Toast.configure(options);

// Export component
export { TurboToastView };

// Default export
export default {
  show,
  hide,
  hideAll,
  update,
  configure
};
//# sourceMappingURL=index.js.map