"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "TurboToastView", {
  enumerable: true,
  get: function () {
    return _TurboToastView.default;
  }
});
exports.update = exports.show = exports.hideAll = exports.hide = exports.default = exports.configure = void 0;
var _manager = require("./manager");
var _TurboToastView = _interopRequireDefault(require("./TurboToastView"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Re-export types

// Create singleton instance
const Toast = _manager.ToastManager.getInstance();

// Export functions
const show = options => Toast.show(options);
exports.show = show;
const hide = id => Toast.hide(id);
exports.hide = hide;
const hideAll = () => Toast.hideAll();
exports.hideAll = hideAll;
const update = (id, options) => Toast.update(id, options);
exports.update = update;
const configure = options => Toast.configure(options);

// Export component
exports.configure = configure;
// Default export
var _default = exports.default = {
  show,
  hide,
  hideAll,
  update,
  configure
};
//# sourceMappingURL=index.js.map