"use strict";

import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { CustomToastView } from './CustomToastView';
import { ToastManager } from './manager';
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ToastContainer = ({
  children
}) => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    const manager = ToastManager.getInstance();

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
    ToastManager.getInstance().hide(id);
  };

  // Don't render on web - web has its own renderer
  if (Platform.OS === 'web') {
    return /*#__PURE__*/_jsx(_Fragment, {
      children: children
    });
  }
  const manager = ToastManager.getInstance();
  const config = manager.getConfig();
  const stackingEnabled = config?.stackingEnabled ?? false;
  const stackingOffset = config?.stackingOffset ?? 10;
  const stackingMaxVisible = config?.stackingMaxVisible ?? 3;
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [children, /*#__PURE__*/_jsx(View, {
      style: styles.container,
      pointerEvents: "box-none",
      children: toasts.map((toast, index) => {
        const isVisible = !stackingEnabled || index < stackingMaxVisible;
        const stackOffset = stackingEnabled ? index * stackingOffset : 0;
        return /*#__PURE__*/_jsx(View, {
          style: [styles.toastWrapper, {
            transform: [{
              translateY: stackOffset
            }],
            opacity: isVisible ? 1 : 0,
            zIndex: 99999 - index
          }],
          children: /*#__PURE__*/_jsx(CustomToastView, {
            toast: toast,
            onDismiss: handleDismiss
          })
        }, toast.id);
      })
    })]
  });
};
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
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
export function withToastContainer(Component) {
  return props => /*#__PURE__*/_jsx(ToastContainer, {
    children: /*#__PURE__*/_jsx(Component, {
      ...props
    })
  });
}
//# sourceMappingURL=ToastContainer.js.map