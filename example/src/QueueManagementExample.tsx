import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Toast, {
  QueueMonitor,
  useGroupToasts,
  useToastQueue,
  useToastStats,
} from 'react-native-turbo-toast'

const QueueManagementExample = () => {
  const [showMonitor, setShowMonitor] = useState(false)

  // Use the queue management hook
  const { stats, events, actions } = useToastQueue({
    refreshInterval: 500,
    enableEvents: true,
    maxEvents: 20,
  })

  // Monitor specific group
  const notificationToasts = useGroupToasts('notifications', 1000)

  // Basic stats only
  const _basicStats = useToastStats(2000)

  const examples = {
    // Priority examples
    addHighPriorityToast: () => {
      Toast.show({
        message: '🚨 Critical Alert!',
        type: 'error',
        priority: 10,
        duration: 5000,
      })
    },

    addMediumPriorityToast: () => {
      Toast.show({
        message: '⚠️ Warning Message',
        type: 'warning',
        priority: 5,
        duration: 4000,
      })
    },

    addLowPriorityToast: () => {
      Toast.show({
        message: '💡 Info Message',
        type: 'info',
        priority: 1,
        duration: 3000,
      })
    },

    // Group examples
    addNotificationGroup: () => {
      const messages = [
        '📧 New email received',
        '💬 New message from John',
        '🔔 Reminder: Meeting at 3 PM',
      ]

      messages.forEach((message, index) => {
        setTimeout(() => {
          Toast.show({
            message,
            group: 'notifications',
            priority: 3,
            duration: 4000,
          })
        }, index * 500)
      })
    },

    addSystemGroup: () => {
      Toast.show({
        message: '⚙️ System update available',
        group: 'system',
        priority: 2,
        duration: 6000,
      })
    },

    // Deduplication examples
    addDuplicateToast: () => {
      Toast.show({
        message: 'This is a duplicate message',
        preventDuplicate: true,
        duration: 3000,
      })
    },

    // Queue management examples
    addManyToasts: () => {
      const types = ['success', 'error', 'warning', 'info'] as const
      const priorities = [1, 2, 3, 4, 5]

      for (let i = 0; i < 10; i++) {
        Toast.show({
          message: `Toast #${i + 1} - ${types[i % types.length]}`,
          type: types[i % types.length],
          priority: priorities[i % priorities.length],
          duration: 3000,
        })
      }
    },

    // Progress with queue
    addProgressWithQueue: () => {
      const progressId = Toast.showProgress('Downloading file...', 0, {
        priority: 8, // High priority for progress
        group: 'downloads',
      })

      let progress = 0
      const interval = setInterval(() => {
        progress += 0.1
        if (progress >= 1) {
          clearInterval(interval)
          Toast.hide(progressId)
          Toast.success('Download complete!', { group: 'downloads' })
        } else {
          Toast.updateProgress(progressId, progress, `Downloading: ${Math.round(progress * 100)}%`)
        }
      }, 300)
    },
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Queue Management Examples</Text>

      {/* Stats Display */}
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Queue Stats</Text>
          <Text style={styles.statsText}>
            Total: {stats.total} | Active: {stats.active} | Pending: {stats.pending}
          </Text>
          {Object.keys(stats.byPriority).length > 0 && (
            <Text style={styles.statsText}>
              By Priority:{' '}
              {Object.entries(stats.byPriority)
                .map(([p, c]) => `P${p}:${c}`)
                .join(', ')}
            </Text>
          )}
          {Object.keys(stats.byGroup).length > 0 && (
            <Text style={styles.statsText}>
              By Group:{' '}
              {Object.entries(stats.byGroup)
                .map(([g, c]) => `${g}:${c}`)
                .join(', ')}
            </Text>
          )}
        </View>
      )}

      {/* Notification Group Monitor */}
      {notificationToasts.length > 0 && (
        <View style={styles.groupContainer}>
          <Text style={styles.groupTitle}>Notification Group ({notificationToasts.length})</Text>
          {notificationToasts.map((toast) => (
            <Text key={toast.id} style={styles.groupToast}>
              • {toast.message} (P{toast.priority})
            </Text>
          ))}
        </View>
      )}

      {/* Priority Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Priority Examples</Text>
        <TouchableOpacity
          style={[styles.button, styles.errorButton]}
          onPress={examples.addHighPriorityToast}
        >
          <Text style={styles.buttonText}>Add High Priority (10)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={examples.addMediumPriorityToast}
        >
          <Text style={styles.buttonText}>Add Medium Priority (5)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={examples.addLowPriorityToast}
        >
          <Text style={styles.buttonText}>Add Low Priority (1)</Text>
        </TouchableOpacity>
      </View>

      {/* Group Examples */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Group Examples</Text>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={examples.addNotificationGroup}
        >
          <Text style={styles.buttonText}>Add Notification Group</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={examples.addSystemGroup}
        >
          <Text style={styles.buttonText}>Add System Group</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={examples.addDuplicateToast}
        >
          <Text style={styles.buttonText}>Add Duplicate (Should Prevent)</Text>
        </TouchableOpacity>
      </View>

      {/* Queue Stress Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Queue Stress Test</Text>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={examples.addManyToasts}
        >
          <Text style={styles.buttonText}>Add 10 Toasts (Mixed Priority)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={examples.addProgressWithQueue}
        >
          <Text style={styles.buttonText}>Add Progress Toast</Text>
        </TouchableOpacity>
      </View>

      {/* Queue Control */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Queue Control</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={actions.pauseQueue}
          >
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={actions.resumeQueue}
          >
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={() => actions.clearGroup('notifications')}
          >
            <Text style={styles.buttonText}>Clear Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={actions.clearQueue}
          >
            <Text style={styles.buttonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Queue Monitor Toggle */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => setShowMonitor(!showMonitor)}
        >
          <Text style={styles.buttonText}>{showMonitor ? 'Hide' : 'Show'} Queue Monitor</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Events */}
      {events.length > 0 && (
        <View style={styles.eventsContainer}>
          <Text style={styles.eventsTitle}>Recent Events ({events.length})</Text>
          {events.slice(0, 5).map((event, index) => (
            <Text key={`event-${event.timestamp}-${index}`} style={styles.eventText}>
              {new Date(event.timestamp).toLocaleTimeString()}: {event.type.toUpperCase()}
              {event.toast && ` - ${event.toast.message.slice(0, 30)}...`}
            </Text>
          ))}
          <TouchableOpacity onPress={actions.clearEvents} style={styles.clearEventsButton}>
            <Text style={styles.clearEventsText}>Clear Events</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Queue Monitor Component */}
      <QueueMonitor
        visible={showMonitor}
        onClose={() => setShowMonitor(false)}
        refreshInterval={500}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  statsText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  groupContainer: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  groupToast: {
    fontSize: 12,
    color: '#1565c0',
    marginBottom: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#2196f3',
  },
  successButton: {
    backgroundColor: '#4caf50',
  },
  errorButton: {
    backgroundColor: '#f44336',
  },
  warningButton: {
    backgroundColor: '#ff9800',
  },
  infoButton: {
    backgroundColor: '#00bcd4',
  },
  secondaryButton: {
    backgroundColor: '#757575',
  },
  eventsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  eventText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'monospace',
  },
  clearEventsButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  clearEventsText: {
    fontSize: 12,
    color: '#2196f3',
    fontWeight: '600',
  },
})

export default QueueManagementExample
