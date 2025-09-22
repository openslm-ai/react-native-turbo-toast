import { useState } from 'react'
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Toast from 'react-native-turbo-toast'

const TOAST_TYPES = ['default', 'success', 'error', 'warning', 'info'] as const
const POSITIONS = ['top', 'center', 'bottom'] as const
const DURATIONS = ['short', 'long'] as const

export default function App() {
  const [message, setMessage] = useState('Hello from TurboToast!')
  const [type, setType] = useState<(typeof TOAST_TYPES)[number]>('default')
  const [position, setPosition] = useState<(typeof POSITIONS)[number]>('bottom')
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>('short')
  const [customDuration, setCustomDuration] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('')
  const [textColor, setTextColor] = useState('')
  const [currentToastId, setCurrentToastId] = useState<string | null>(null)

  const showSimpleToast = () => {
    Toast.show('Simple toast message!')
  }

  const showCustomToast = () => {
    const id = Toast.show({
      message,
      type,
      position,
      duration: customDuration ? Number(customDuration) : duration,
      backgroundColor: backgroundColor || undefined,
      textColor: textColor || undefined,
    })
    setCurrentToastId(id)
  }

  const showToastWithAction = () => {
    Toast.show({
      message: 'Toast with action',
      type: 'info',
      action: {
        text: 'UNDO',
        onPress: () => {
          Toast.show('Action pressed!')
        },
      },
    })
  }

  const showPriorityToast = () => {
    Toast.show({
      message: 'High priority toast!',
      type: 'error',
      priority: 10,
    })
  }

  const showMultipleToasts = () => {
    Toast.show({ message: 'First toast', position: 'top' })
    setTimeout(() => {
      Toast.show({ message: 'Second toast', position: 'center' })
    }, 500)
    setTimeout(() => {
      Toast.show({ message: 'Third toast', position: 'bottom' })
    }, 1000)
  }

  const updateCurrentToast = () => {
    if (currentToastId) {
      Toast.update(currentToastId, {
        message: 'Updated message!',
        type: 'success',
      })
    } else {
      Toast.show('No active toast to update')
    }
  }

  const hideCurrentToast = () => {
    if (currentToastId) {
      Toast.hide(currentToastId)
      setCurrentToastId(null)
    } else {
      Toast.hide()
    }
  }

  const hideAllToasts = () => {
    Toast.hideAll()
    setCurrentToastId(null)
  }

  const configureToasts = () => {
    Toast.configure({
      maxConcurrent: 3,
      defaultOptions: {
        duration: 'long',
        position: 'top',
        animationDuration: 500,
      },
    })
    Toast.show('Configuration updated!')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>React Native TurboToast</Text>
        <Text style={styles.subtitle}>Example App</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Examples</Text>

          <TouchableOpacity style={styles.button} onPress={showSimpleToast}>
            <Text style={styles.buttonText}>Simple Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={showToastWithAction}>
            <Text style={styles.buttonText}>Toast with Action</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={showPriorityToast}>
            <Text style={styles.buttonText}>Priority Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={showMultipleToasts}>
            <Text style={styles.buttonText}>Multiple Toasts</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Toast</Text>

          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Enter message"
            placeholderTextColor="#999"
          />

          <View style={styles.optionsRow}>
            <Text style={styles.label}>Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TOAST_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.option, type === t && styles.optionActive]}
                  onPress={() => setType(t)}
                >
                  <Text style={[styles.optionText, type === t && styles.optionTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.optionsRow}>
            <Text style={styles.label}>Position:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {POSITIONS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.option, position === p && styles.optionActive]}
                  onPress={() => setPosition(p)}
                >
                  <Text style={[styles.optionText, position === p && styles.optionTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.optionsRow}>
            <Text style={styles.label}>Duration:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {DURATIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.option, duration === d && styles.optionActive]}
                  onPress={() => setDuration(d)}
                >
                  <Text style={[styles.optionText, duration === d && styles.optionTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TextInput
            style={styles.input}
            value={customDuration}
            onChangeText={setCustomDuration}
            placeholder="Custom duration (ms)"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          <View style={styles.colorRow}>
            <TextInput
              style={[styles.input, styles.colorInput]}
              value={backgroundColor}
              onChangeText={setBackgroundColor}
              placeholder="BG Color (#hex)"
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.input, styles.colorInput]}
              value={textColor}
              onChangeText={setTextColor}
              placeholder="Text Color (#hex)"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={showCustomToast}>
            <Text style={styles.buttonText}>Show Custom Toast</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toast Controls</Text>

          <TouchableOpacity style={styles.button} onPress={updateCurrentToast}>
            <Text style={styles.buttonText}>Update Current Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={hideCurrentToast}>
            <Text style={styles.buttonText}>Hide Current Toast</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={hideAllToasts}>
            <Text style={styles.buttonText}>Hide All Toasts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={configureToasts}>
            <Text style={styles.buttonText}>Configure Defaults</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 12,
    minWidth: 80,
    color: '#333',
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  optionActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionTextActive: {
    color: '#fff',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorInput: {
    flex: 1,
  },
})
