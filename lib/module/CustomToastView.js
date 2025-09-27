"use strict";

import { useCallback, useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Safe Dimensions access for tests
let screenWidth = 375;
try {
  const dims = Dimensions.get('window');
  if (dims?.width) {
    screenWidth = dims.width;
  }
} catch {
  // Use default in test environment
}
export const CustomToastView = ({
  toast,
  onDismiss,
  children
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const animateOut = useCallback(() => {
    const duration = 200;
    const preset = toast.animationPreset || 'slide';
    let animation;
    switch (preset) {
      case 'fade':
        animation = Animated.timing(fadeAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true
        });
        break;
      case 'bounce':
        animation = Animated.parallel([Animated.timing(fadeAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true
        }), Animated.timing(bounceAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true
        })]);
        break;
      case 'zoom':
        animation = Animated.parallel([Animated.timing(fadeAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true
        }), Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration,
          useNativeDriver: true
        })]);
        break;
      case 'none':
        onDismiss(toast.id);
        return;
      case 'spring':
      case 'slide':
      default:
        animation = Animated.parallel([Animated.timing(fadeAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true
        }), Animated.timing(slideAnim, {
          toValue: 100,
          duration,
          useNativeDriver: true
        })]);
    }
    animation.start(() => {
      onDismiss(toast.id);
    });
  }, [fadeAnim, slideAnim, scaleAnim, bounceAnim, onDismiss, toast.id, toast.animationPreset]);
  const getAnimationIn = () => {
    const duration = toast.animationDuration || 300;
    const preset = toast.animationPreset || 'slide';
    switch (preset) {
      case 'fade':
        return Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true
        });
      case 'bounce':
        return Animated.parallel([Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true
        }), Animated.spring(bounceAnim, {
          toValue: 1,
          tension: 10,
          friction: 3,
          useNativeDriver: true
        })]);
      case 'zoom':
        return Animated.parallel([Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true
        }), Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true
        })]);
      case 'spring':
        return Animated.parallel([Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true
        }), Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 6,
          useNativeDriver: true
        })]);
      case 'none':
        fadeAnim.setValue(1);
        slideAnim.setValue(0);
        scaleAnim.setValue(1);
        return null;
      case 'slide':
      default:
        return Animated.parallel([Animated.timing(fadeAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true
        }), Animated.timing(slideAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true
        })]);
    }
  };
  useEffect(() => {
    // Animate in
    const animation = getAnimationIn();
    if (animation) {
      animation.start();
    }

    // Auto dismiss timer
    const duration = typeof toast.duration === 'number' ? toast.duration : toast.duration === 'long' ? 3500 : 2000;
    const timer = setTimeout(() => {
      animateOut();
    }, duration);
    return () => clearTimeout(timer);
  }, [animateOut, fadeAnim, slideAnim, toast.animationDuration, toast.duration]);
  const handlePress = () => {
    if (toast.dismissOnPress !== false) {
      if (toast.onPress) {
        toast.onPress();
      }
      animateOut();
    }
  };
  const getPositionStyle = () => {
    switch (toast.position) {
      case 'top':
        return {
          top: 50
        };
      case 'center':
        return {
          top: '50%',
          marginTop: -50
        };
      default:
        return {
          bottom: 50
        };
    }
  };
  const getBackgroundColor = () => {
    if (toast.backgroundColor) return toast.backgroundColor;
    switch (toast.type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'info':
        return '#2196f3';
      default:
        return '#333333';
    }
  };
  const getAnimationStyle = () => {
    const preset = toast.animationPreset || 'slide';
    const baseStyle = {
      opacity: fadeAnim
    };
    switch (preset) {
      case 'fade':
        return baseStyle;
      case 'bounce':
        return {
          ...baseStyle,
          transform: [{
            translateY: bounceAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0]
            })
          }]
        };
      case 'zoom':
        return {
          ...baseStyle,
          transform: [{
            scale: scaleAnim
          }]
        };
      case 'spring':
      case 'slide':
      default:
        return {
          ...baseStyle,
          transform: [{
            translateY: slideAnim
          }]
        };
    }
  };

  // If custom view provided, render it
  if (toast.customView) {
    return /*#__PURE__*/_jsx(Animated.View, {
      style: [styles.container, getPositionStyle(), getAnimationStyle()],
      ...(toast.accessibilityLabel && {
        accessibilityLabel: toast.accessibilityLabel
      }),
      ...(toast.accessibilityHint && {
        accessibilityHint: toast.accessibilityHint
      }),
      children: /*#__PURE__*/_jsx(TouchableOpacity, {
        activeOpacity: toast.dismissOnPress === false ? 1 : 0.8,
        onPress: handlePress,
        style: [styles.customToast, {
          backgroundColor: getBackgroundColor()
        }],
        children: typeof toast.customView === 'function' ? toast.customView({
          toast,
          onDismiss: animateOut
        }) : toast.customView
      })
    });
  }

  // Default view with children support
  return /*#__PURE__*/_jsx(Animated.View, {
    style: [styles.container, getPositionStyle(), getAnimationStyle()],
    ...(toast.accessibilityLabel && {
      accessibilityLabel: toast.accessibilityLabel
    }),
    ...(toast.accessibilityHint && {
      accessibilityHint: toast.accessibilityHint
    }),
    children: /*#__PURE__*/_jsxs(TouchableOpacity, {
      activeOpacity: toast.dismissOnPress === false ? 1 : 0.8,
      onPress: handlePress,
      style: [styles.toast, {
        backgroundColor: getBackgroundColor()
      }],
      children: [children || /*#__PURE__*/_jsxs(View, {
        style: styles.defaultContent,
        children: [toast.icon && typeof toast.icon === 'string' && /*#__PURE__*/_jsx(Text, {
          style: [styles.icon, {
            color: toast.textColor || '#fff'
          }],
          children: toast.icon
        }), /*#__PURE__*/_jsx(Text, {
          style: [styles.message, {
            color: toast.textColor || '#fff'
          }],
          numberOfLines: 3,
          children: toast.message
        }), (toast.actions || (toast.action ? [toast.action] : [])).map((action, index) => /*#__PURE__*/_jsx(TouchableOpacity, {
          onPress: () => {
            action.onPress();
            if (action.style !== 'cancel') {
              animateOut();
            }
          },
          style: [styles.actionButton, action.style === 'destructive' && styles.destructiveButton, action.style === 'cancel' && styles.cancelButton],
          children: /*#__PURE__*/_jsx(Text, {
            style: [styles.actionText, {
              color: action.style === 'destructive' ? '#ff4444' : toast.textColor || '#fff'
            }],
            children: action.text
          })
        }, `action-${index}`))]
      }), toast.showProgressBar && toast.progress !== undefined && /*#__PURE__*/_jsx(View, {
        style: styles.progressContainer,
        children: /*#__PURE__*/_jsx(View, {
          style: [styles.progressBar, {
            width: `${toast.progress * 100}%`,
            backgroundColor: toast.progressColor || '#fff'
          }]
        })
      })]
    })
  });
};
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 99999
  },
  toast: {
    borderRadius: 8,
    padding: 16,
    minHeight: 50,
    maxWidth: screenWidth - 40,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  customToast: {
    borderRadius: 8,
    maxWidth: screenWidth - 40,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  defaultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  icon: {
    fontSize: 20,
    marginRight: 8
  },
  message: {
    flex: 1,
    fontSize: 14
  },
  actionButton: {
    marginLeft: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  destructiveButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)'
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600'
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff'
  }
});
//# sourceMappingURL=CustomToastView.js.map