"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToastContainer = void 0;
exports.withToastContainer = withToastContainer;
var _react = require("react");
var _reactNative = require("react-native");
var _CustomToastView = require("./CustomToastView");
var _manager = require("./manager");
var _jsxRuntime = require("react/jsx-runtime");
const ToastContainer = ({
  children
}) => {
  const [toasts, setToasts] = (0, _react.useState)([]);
  (0, _react.useEffect)(() => {
    const manager = _manager.ToastManager.getInstance();

    // Subscribe to toast updates
    const updateToasts = () => {
      const activeToasts = manager.getActiveToasts();
      setToasts(activeToasts.filter(toast => toast.customView));
    };

    // Set up listener for custom view toasts
    manager.setCustomViewHandler(updateToasts);

    // Initial load
    updateToasts();
    return () => {
      manager.setCustomViewHandler(null);
    };
  }, []);
  const handleDismiss = id => {
    _manager.ToastManager.getInstance().hide(id);
  };

  // Don't render on web - web has its own renderer
  if (_reactNative.Platform.OS === 'web') {
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_jsxRuntime.Fragment, {
      children: children
    });
  }
  const manager = _manager.ToastManager.getInstance();
  const config = manager.getConfig();
  const stackingEnabled = config?.stackingEnabled ?? false;
  const stackingOffset = config?.stackingOffset ?? 10;
  const stackingMaxVisible = config?.stackingMaxVisible ?? 3;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
    children: [children, /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
      style: styles.container,
      pointerEvents: "box-none",
      children: toasts.map((toast, index) => {
        const isVisible = !stackingEnabled || index < stackingMaxVisible;
        const stackOffset = stackingEnabled ? index * stackingOffset : 0;
        return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
          style: [styles.toastWrapper, {
            transform: [{
              translateY: stackOffset
            }],
            opacity: isVisible ? 1 : 0,
            zIndex: 99999 - index
          }],
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_CustomToastView.CustomToastView, {
            toast: toast,
            onDismiss: handleDismiss
          })
        }, toast.id);
      })
    })]
  });
};
exports.ToastContainer = ToastContainer;
const styles = _reactNative.StyleSheet.create({
  container: {
    ..._reactNative.StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999
  },
  toastWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }
});

// HOC to wrap app with toast container
function withToastContainer(Component) {
  return props => /*#__PURE__*/(0, _jsxRuntime.jsx)(ToastContainer, {
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Component, {
      ...props
    })
  });
}
//# sourceMappingURL=ToastContainer.js.map