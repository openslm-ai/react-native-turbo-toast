import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ToastManager } from './manager'
import type { QueuedToast, QueueEvent, QueueStats } from './types'

interface QueueMonitorProps {
  visible?: boolean
  onClose?: () => void
  refreshInterval?: number
}

export const QueueMonitor: React.FC<QueueMonitorProps> = ({
  visible = false,
  onClose,
  refreshInterval = 1000,
}) => {
  const [stats, setStats] = useState<QueueStats | null>(null)
  const [events, setEvents] = useState<QueueEvent[]>([])
  const [activeToasts, setActiveToasts] = useState<QueuedToast[]>([])
  const [queuedToasts, setQueuedToasts] = useState<QueuedToast[]>([])

  const refreshData = useCallback(() => {
    if (!visible) return

    const manager = ToastManager.getInstance()
    setStats(manager.getQueueStats())
    setActiveToasts(manager.getActiveToasts())
    setQueuedToasts(manager.getQueuedToasts())
  }, [visible])

  useEffect(() => {
    if (!visible) return

    refreshData()
    const interval = setInterval(refreshData, refreshInterval)
    return () => clearInterval(interval)
  }, [visible, refreshData, refreshInterval])

  useEffect(() => {
    if (!visible) return

    const manager = ToastManager.getInstance()

    // Set up event listener
    const handleQueueEvent = (event: QueueEvent) => {
      setEvents((prev) => [event, ...prev.slice(0, 49)]) // Keep last 50 events
    }

    // Configure manager to receive events
    manager.configure({
      onQueueEvent: handleQueueEvent,
    })

    return () => {
      // Clean up by removing event handler
      manager.configure({
        onQueueEvent: undefined,
      })
    }
  }, [visible])

  if (!visible) return null

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const _formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#4caf50'
      case 'error':
        return '#f44336'
      case 'warning':
        return '#ff9800'
      case 'info':
        return '#2196f3'
      default:
        return '#666'
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 10) return '#f44336' // High priority - red
    if (priority >= 5) return '#ff9800' // Medium priority - orange
    if (priority >= 1) return '#2196f3' // Low priority - blue
    return '#666' // Default - gray
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Queue Monitor</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content}>
          {/* Stats Section */}
          {stats && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Statistics</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.total}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.active}</Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.pending}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
              </View>

              {/* Priority Distribution */}
              {Object.keys(stats.byPriority).length > 0 && (
                <View style={styles.prioritySection}>
                  <Text style={styles.subTitle}>By Priority</Text>
                  {Object.entries(stats.byPriority).map(([priority, count]) => (
                    <View key={priority} style={styles.priorityItem}>
                      <View
                        style={[
                          styles.priorityDot,
                          { backgroundColor: getPriorityColor(Number(priority)) },
                        ]}
                      />
                      <Text style={styles.priorityText}>
                        Priority {priority}: {count}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Group Distribution */}
              {Object.keys(stats.byGroup).length > 0 && (
                <View style={styles.groupSection}>
                  <Text style={styles.subTitle}>By Group</Text>
                  {Object.entries(stats.byGroup).map(([group, count]) => (
                    <Text key={group} style={styles.groupText}>
                      {group}: {count}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Active Toasts */}
          {activeToasts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Toasts ({activeToasts.length})</Text>
              {activeToasts.map((toast) => (
                <View key={toast.id} style={styles.toastItem}>
                  <View style={styles.toastHeader}>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: getTypeColor(toast.type || 'default') },
                      ]}
                    >
                      <Text style={styles.typeBadgeText}>{toast.type || 'default'}</Text>
                    </View>
                    <Text style={styles.priorityBadge}>P{toast.priority}</Text>
                    {toast.group && <Text style={styles.groupBadge}>{toast.group}</Text>}
                  </View>
                  <Text style={styles.toastMessage}>{toast.message}</Text>
                  <Text style={styles.toastMeta}>
                    {formatTimestamp(toast.timestamp)} • ID: {toast.id.slice(0, 8)}...
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Queued Toasts */}
          {queuedToasts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Queued Toasts ({queuedToasts.length})</Text>
              {queuedToasts.map((toast, index) => (
                <View key={toast.id} style={styles.toastItem}>
                  <View style={styles.toastHeader}>
                    <Text style={styles.queuePosition}>#{index + 1}</Text>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: getTypeColor(toast.type || 'default') },
                      ]}
                    >
                      <Text style={styles.typeBadgeText}>{toast.type || 'default'}</Text>
                    </View>
                    <Text style={styles.priorityBadge}>P{toast.priority}</Text>
                    {toast.group && <Text style={styles.groupBadge}>{toast.group}</Text>}
                  </View>
                  <Text style={styles.toastMessage}>{toast.message}</Text>
                  <Text style={styles.toastMeta}>
                    {formatTimestamp(toast.timestamp)} •
                    {toast.expiresAt && ` Expires: ${formatTimestamp(toast.expiresAt)} • `}
                    ID: {toast.id.slice(0, 8)}...
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Recent Events */}
          {events.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Events ({events.length})</Text>
              {events.slice(0, 10).map((event, index) => (
                <View key={`event-${event.timestamp}-${index}`} style={styles.eventItem}>
                  <View style={styles.eventHeader}>
                    <Text style={[styles.eventType, { color: getEventTypeColor(event.type) }]}>
                      {event.type.toUpperCase()}
                    </Text>
                    <Text style={styles.eventTime}>{formatTimestamp(event.timestamp)}</Text>
                  </View>
                  {event.toast && (
                    <Text style={styles.eventMessage}>
                      {event.toast.message} (P{event.toast.priority})
                      {event.toast.group && ` [${event.toast.group}]`}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  )
}

const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'added':
      return '#4caf50'
    case 'removed':
      return '#f44336'
    case 'updated':
      return '#ff9800'
    case 'cleared':
      return '#9c27b0'
    default:
      return '#666'
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    maxWidth: 600,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    maxHeight: 400,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  prioritySection: {
    marginTop: 8,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 12,
    color: '#666',
  },
  groupSection: {
    marginTop: 8,
  },
  groupText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  toastItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  toastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  queuePosition: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
    minWidth: 24,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  priorityBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  groupBadge: {
    fontSize: 10,
    color: '#666',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  toastMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  toastMeta: {
    fontSize: 10,
    color: '#999',
  },
  eventItem: {
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 10,
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 10,
    color: '#999',
  },
  eventMessage: {
    fontSize: 12,
    color: '#666',
  },
})
