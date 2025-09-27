"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.QueueMonitor = void 0;
var _react = require("react");
var _reactNative = require("react-native");
var _manager = require("./manager");
var _jsxRuntime = require("react/jsx-runtime");
const QueueMonitor = ({
  visible = false,
  onClose,
  refreshInterval = 1000
}) => {
  const [stats, setStats] = (0, _react.useState)(null);
  const [events, setEvents] = (0, _react.useState)([]);
  const [activeToasts, setActiveToasts] = (0, _react.useState)([]);
  const [queuedToasts, setQueuedToasts] = (0, _react.useState)([]);
  const refreshData = (0, _react.useCallback)(() => {
    if (!visible) return;
    const manager = _manager.ToastManager.getInstance();
    setStats(manager.getQueueStats());
    setActiveToasts(manager.getActiveToasts());
    setQueuedToasts(manager.getQueuedToasts());
  }, [visible]);
  (0, _react.useEffect)(() => {
    if (!visible) return;
    refreshData();
    const interval = setInterval(refreshData, refreshInterval);
    return () => clearInterval(interval);
  }, [visible, refreshData, refreshInterval]);
  (0, _react.useEffect)(() => {
    if (!visible) return;
    const manager = _manager.ToastManager.getInstance();

    // Set up event listener
    const handleQueueEvent = event => {
      setEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
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
  }, [visible]);
  if (!visible) return null;
  const formatTimestamp = timestamp => {
    return new Date(timestamp).toLocaleTimeString();
  };
  const _formatDuration = ms => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };
  const getTypeColor = type => {
    switch (type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      case 'info':
        return '#2196f3';
      default:
        return '#666';
    }
  };
  const getPriorityColor = priority => {
    if (priority >= 10) return '#f44336'; // High priority - red
    if (priority >= 5) return '#ff9800'; // Medium priority - orange
    if (priority >= 1) return '#2196f3'; // Low priority - blue
    return '#666'; // Default - gray
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
    style: styles.overlay,
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
      style: styles.container,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
        style: styles.header,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
          style: styles.title,
          children: "Queue Monitor"
        }), onClose && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.TouchableOpacity, {
          onPress: onClose,
          style: styles.closeButton,
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.closeText,
            children: "\u2715"
          })
        })]
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.ScrollView, {
        style: styles.content,
        children: [stats && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: styles.section,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
            style: styles.sectionTitle,
            children: "Statistics"
          }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: styles.statsGrid,
            children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
              style: styles.statItem,
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: styles.statValue,
                children: stats.total
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: styles.statLabel,
                children: "Total"
              })]
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
              style: styles.statItem,
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: styles.statValue,
                children: stats.active
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: styles.statLabel,
                children: "Active"
              })]
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
              style: styles.statItem,
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: styles.statValue,
                children: stats.pending
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: styles.statLabel,
                children: "Pending"
              })]
            })]
          }), Object.keys(stats.byPriority).length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: styles.prioritySection,
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.subTitle,
              children: "By Priority"
            }), Object.entries(stats.byPriority).map(([priority, count]) => /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
              style: styles.priorityItem,
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
                style: [styles.priorityDot, {
                  backgroundColor: getPriorityColor(Number(priority))
                }]
              }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Text, {
                style: styles.priorityText,
                children: ["Priority ", priority, ": ", count]
              })]
            }, priority))]
          }), Object.keys(stats.byGroup).length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: styles.groupSection,
            children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.subTitle,
              children: "By Group"
            }), Object.entries(stats.byGroup).map(([group, count]) => /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Text, {
              style: styles.groupText,
              children: [group, ": ", count]
            }, group))]
          })]
        }), activeToasts.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: styles.section,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Text, {
            style: styles.sectionTitle,
            children: ["Active Toasts (", activeToasts.length, ")"]
          }), activeToasts.map(toast => /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: styles.toastItem,
            children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
              style: styles.toastHeader,
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
                style: [styles.typeBadge, {
                  backgroundColor: getTypeColor(toast.type || 'default')
                }],
                children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                  style: styles.typeBadgeText,
                  children: toast.type || 'default'
                })
              }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Text, {
                style: styles.priorityBadge,
                children: ["P", toast.priority]
              }), toast.group && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: styles.groupBadge,
                children: toast.group
              })]
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.toastMessage,
              children: toast.message
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Text, {
              style: styles.toastMeta,
              children: [formatTimestamp(toast.timestamp), " \u2022 ID: ", toast.id.slice(0, 8), "..."]
            })]
          }, toast.id))]
        }), queuedToasts.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: styles.section,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Text, {
            style: styles.sectionTitle,
            children: ["Queued Toasts (", queuedToasts.length, ")"]
          }), queuedToasts.map((toast, index) => /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: styles.toastItem,
            children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
              style: styles.toastHeader,
              children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Text, {
                style: styles.queuePosition,
                children: ["#", index + 1]
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.View, {
                style: [styles.typeBadge, {
                  backgroundColor: getTypeColor(toast.type || 'default')
                }],
                children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                  style: styles.typeBadgeText,
                  children: toast.type || 'default'
                })
              }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Text, {
                style: styles.priorityBadge,
                children: ["P", toast.priority]
              }), toast.group && /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: styles.groupBadge,
                children: toast.group
              })]
            }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
              style: styles.toastMessage,
              children: toast.message
            }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Text, {
              style: styles.toastMeta,
              children: [formatTimestamp(toast.timestamp), " \u2022", toast.expiresAt && ` Expires: ${formatTimestamp(toast.expiresAt)} • `, "ID: ", toast.id.slice(0, 8), "..."]
            })]
          }, toast.id))]
        }), events.length > 0 && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
          style: styles.section,
          children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Text, {
            style: styles.sectionTitle,
            children: ["Recent Events (", events.length, ")"]
          }), events.slice(0, 10).map((event, index) => /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
            style: styles.eventItem,
            children: [/*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.View, {
              style: styles.eventHeader,
              children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: [styles.eventType, {
                  color: getEventTypeColor(event.type)
                }],
                children: event.type.toUpperCase()
              }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactNative.Text, {
                style: styles.eventTime,
                children: formatTimestamp(event.timestamp)
              })]
            }), event.toast && /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactNative.Text, {
              style: styles.eventMessage,
              children: [event.toast.message, " (P", event.toast.priority, ")", event.toast.group && ` [${event.toast.group}]`]
            })]
          }, `event-${event.timestamp}-${index}`))]
        })]
      })]
    })
  });
};
exports.QueueMonitor = QueueMonitor;
const getEventTypeColor = type => {
  switch (type) {
    case 'added':
      return '#4caf50';
    case 'removed':
      return '#f44336';
    case 'updated':
      return '#ff9800';
    case 'cleared':
      return '#9c27b0';
    default:
      return '#666';
  }
};
const styles = _reactNative.StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    maxWidth: 600
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  closeButton: {
    padding: 8
  },
  closeText: {
    fontSize: 18,
    color: '#666'
  },
  content: {
    maxHeight: 400
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 12
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  prioritySection: {
    marginTop: 8
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  priorityText: {
    fontSize: 12,
    color: '#666'
  },
  groupSection: {
    marginTop: 8
  },
  groupText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  toastItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  toastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  queuePosition: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
    minWidth: 24
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6
  },
  typeBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600'
  },
  priorityBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6
  },
  groupBadge: {
    fontSize: 10,
    color: '#666',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4
  },
  toastMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  toastMeta: {
    fontSize: 10,
    color: '#999'
  },
  eventItem: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  eventType: {
    fontSize: 10,
    fontWeight: '600'
  },
  eventTime: {
    fontSize: 10,
    color: '#999'
  },
  eventMessage: {
    fontSize: 12,
    color: '#666'
  }
});
//# sourceMappingURL=QueueMonitor.js.map