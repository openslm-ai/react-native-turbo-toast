# 🍞 react-native-turbo-toast

<div align="center">

[![an OpenSLM project](https://img.shields.io/badge/an%20OpenSLM-project-0b1118?style=flat-square&labelColor=0b1118)](https://github.com/openslm-ai)

  <h3>⚡ Lightning-fast toast notifications for React Native</h3>
  <p>Built with TurboModules • TypeScript • Full Platform Support</p>
</div>

<div align="center">

[![npm version](https://img.shields.io/npm/v/react-native-turbo-toast.svg?style=flat-square)](https://www.npmjs.com/package/react-native-turbo-toast)
[![npm downloads](https://img.shields.io/npm/dm/react-native-turbo-toast.svg?style=flat-square)](https://www.npmjs.com/package/react-native-turbo-toast)
[![CI](https://img.shields.io/github/actions/workflow/status/openslm-ai/react-native-turbo-toast/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/openslm-ai/react-native-turbo-toast/actions/workflows/ci.yml)
[![Provenance](https://img.shields.io/badge/npm-provenance-success?style=flat-square&logo=npm)](https://docs.npmjs.com/generating-provenance-statements)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/react-native-turbo-toast?style=flat-square)](https://bundlephobia.com/package/react-native-turbo-toast)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

[![iOS Support](https://img.shields.io/badge/iOS-13.0+-000000.svg?style=flat-square&logo=apple&logoColor=white)](https://developer.apple.com/ios/)
[![Android Support](https://img.shields.io/badge/Android-5.0+-3DDC84.svg?style=flat-square&logo=android&logoColor=white)](https://developer.android.com)
[![Web Support](https://img.shields.io/badge/Web-ES6+-F7DF1E.svg?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org)

[![React Native](https://img.shields.io/badge/React_Native-0.73+-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-105_passing-success?style=flat-square)](./src/__tests__)
[![Coverage](https://img.shields.io/badge/Coverage-95%25-brightgreen?style=flat-square)](./src/__tests__)

</div>

## 🎯 Why Choose This Library?

<table>
<tr>
<td>

**🚀 Performance First**
- TurboModule architecture (no bridge overhead)
- Native driver animations (60fps)
- Optimized queue operations O(log n)
- < 25KB bundle impact
- < 5ms initialization

</td>
<td>

**🛠️ Developer Experience**
- 100% TypeScript with IntelliSense
- Zero configuration required
- Hot reload friendly
- Comprehensive error messages
- Visual debugging tools

</td>
<td>

**📱 Platform Native**
- iOS: UIKit integration
- Android: Custom WindowManager
- Web: DOM with touch events
- Consistent API everywhere
- Platform-specific optimizations

</td>
</tr>
</table>

## 📦 Installation

```bash
# npm
npm install react-native-turbo-toast

# yarn
yarn add react-native-turbo-toast

# bun
bun add react-native-turbo-toast

# expo
npx expo install react-native-turbo-toast
```

### 📱 iOS Setup
```bash
cd ios && pod install
```

### 🤖 Android
No additional setup required!

### 🌐 Web
Works out of the box!

## 🚀 Quick Start

```tsx
import Toast from 'react-native-turbo-toast'

// 📝 Simple toast
Toast.show('Hello World!')

// ✅ Success toast
Toast.success('Operation completed!')

// ❌ Error toast
Toast.error('Something went wrong')

// ⚠️ Warning toast
Toast.warning('Please check your input')

// ℹ️ Info toast
Toast.info('New update available')

// ⏳ Loading toast
const loadingId = Toast.loading('Processing...')
// Later: Toast.hide(loadingId)

// 🎯 Promise-based toast
await Toast.promise(
  fetchUserData(),
  {
    loading: 'Fetching user data...',
    success: 'User data loaded!',
    error: 'Failed to load user data'
  }
)
```

## 🎨 Advanced Features

### 🎯 Priority Queue System

```tsx
// Higher priority toasts show first
Toast.show({
  message: '🚨 Critical alert!',
  priority: 10,
  type: 'error'
})

Toast.show({
  message: '📢 Normal notification',
  priority: 5,
  type: 'info'
})

// Manage queue
Toast.pauseQueue()   // ⏸️ Pause processing
Toast.resumeQueue()  // ▶️ Resume processing
const stats = Toast.getQueueStats()  // 📊 Get statistics
```

### 🎬 Animation Presets

```tsx
Toast.show({
  message: '✨ Animated toast!',
  animationPreset: 'bounce',  // fade | slide | bounce | zoom | spring | none
  animationDuration: 300
})
```

### 🔘 Multi-Action Support

```tsx
Toast.show({
  message: '📧 New message received',
  actions: [
    {
      text: 'Reply',
      onPress: () => openReply()
    },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: () => deleteMessage()
    },
    {
      text: 'Later',
      style: 'cancel'  // Won't dismiss toast
    }
  ]
})
```

### 📊 Progress Toasts

```tsx
// Show progress
const id = Toast.showProgress('Uploading...', 0)

// Update progress
for (let i = 0; i <= 100; i += 10) {
  await delay(100)
  Toast.updateProgress(id, i / 100, `Uploading... ${i}%`)
}

Toast.hide(id)
```

### 🎨 Custom React Components

```tsx
import { ToastContainer } from 'react-native-turbo-toast'

// Wrap your app
function App() {
  return (
    <ToastContainer>
      <YourApp />
    </ToastContainer>
  )
}

// Use custom components
Toast.show({
  customView: ({ toast, onDismiss }) => (
    <View style={styles.custom}>
      <Image source={{ uri: 'avatar.png' }} />
      <Text>{toast.message}</Text>
      <Button title="Dismiss" onPress={onDismiss} />
    </View>
  )
})
```

### 🪝 React Hooks

```tsx
import { useToast, useToastQueue } from 'react-native-turbo-toast'

function Component() {
  const toast = useToast()
  const { stats, events } = useToastQueue()

  return (
    <View>
      <Text>📊 Active: {stats.active}</Text>
      <Text>⏳ Queued: {stats.pending}</Text>
      <Button
        title="Show Toast"
        onPress={() => toast.show('Hello!')}
      />
    </View>
  )
}
```

### 📱 Group Management

```tsx
// Group related toasts
Toast.show({
  message: '📬 New email',
  group: 'notifications'
})

Toast.show({
  message: '💬 New chat message',
  group: 'notifications'
})

// Clear entire group
Toast.clearGroup('notifications')

// Find toasts by group
const notifications = Toast.findByGroup('notifications')
```

### 💾 Persistence

```bash
# Optional peer dependency
npm install @react-native-async-storage/async-storage
```

```tsx
Toast.configure({
  persistenceEnabled: true,
  persistenceInterval: 1000  // Auto-save every second
})
```

### 📈 Analytics Integration

```tsx
import { toastAnalytics } from 'react-native-turbo-toast'

// Add your analytics provider
toastAnalytics.addProvider({
  trackEvent: (event) => {
    analytics.track(event.eventType, {
      toastId: event.toastId,
      message: event.message,
      duration: event.duration
    })
  }
})

// Enable tracking
Toast.configure({ analyticsEnabled: true })
```

## ⚙️ Configuration

```tsx
Toast.configure({
  // 🎯 Queue settings
  maxConcurrent: 3,           // Max toasts shown simultaneously
  maxQueueSize: 100,          // Max queued toasts

  // 🎨 Default options
  defaultOptions: {
    position: 'bottom',
    duration: 3000,
    animationPreset: 'slide'
  },

  // 📊 Advanced features
  stackingEnabled: true,       // Visual stacking
  stackingOffset: 10,         // Pixels between stacked toasts
  persistenceEnabled: false,   // Save queue across restarts
  analyticsEnabled: false,     // Track interactions

  // 🔄 Retry logic
  maxRetries: 3,
  retryDelay: 1000
})
```

## 📱 Platform Support

| Feature | iOS | Android | Web | Notes |
|---------|-----|---------|-----|-------|
| 🍞 Basic Toasts | ✅ | ✅ | ✅ | Full support |
| 🎨 Custom Styling | ✅ | ✅ | ✅ | Full support |
| 🧩 Custom Components | ✅ | ✅ | ✅ | Full support |
| 🔘 Multi-Actions | ✅ | ✅ | ✅ | Full support |
| 👆 Swipe to Dismiss | ✅ | ⚠️ | ✅ | Android: Tap only* |
| 📳 Haptic Feedback | ✅ | ✅ | ✅ | Full support |
| 📊 Progress Bars | ✅ | ✅ | ✅ | Full support |
| 🎯 Queue Management | ✅ | ✅ | ✅ | Full support |
| ✨ Animations | ✅ | ✅ | ✅ | Full support |
| 💾 Persistence | ✅ | ✅ | ⚠️ | Web: localStorage** |

<sub>* Android uses WindowManager which doesn't support swipe gestures</sub><br/>
<sub>** Web requires localStorage adapter (not included)</sub>

## 🧪 TypeScript

Full TypeScript support with comprehensive type definitions:

```tsx
import type { ToastOptions, ToastConfig } from 'react-native-turbo-toast'

const options: ToastOptions = {
  message: '🎉 Typed toast',
  type: 'success',
  position: 'top',
  duration: 3000,
  priority: 5,
  group: 'notifications',
  animationPreset: 'bounce',
  actions: [
    { text: 'OK', onPress: () => {} }
  ]
}

const config: ToastConfig = {
  maxConcurrent: 3,
  stackingEnabled: true,
  defaultOptions: {
    position: 'bottom'
  }
}
```

## 📊 Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| 📦 Bundle Size | < 25KB | Minified + gzipped |
| 🧠 Memory Usage | < 1MB | Per active toast |
| 🎬 Animations | 60fps | Native driver |
| ⚡ Queue Ops | < 1ms | O(log n) complexity |
| 🚀 Cold Start | < 5ms | Initial setup |
| 📱 Show Toast | < 10ms | Call to display |

## 🔗 API Reference

### Core Methods

| Method | Description | Example |
|--------|-------------|---------|
| `show(options)` | Display toast | `Toast.show('Hello')` |
| `hide(id?)` | Hide toast | `Toast.hide()` |
| `hideAll()` | Clear all toasts | `Toast.hideAll()` |
| `update(id, options)` | Update active toast | `Toast.update(id, { message: 'Updated' })` |
| `configure(config)` | Set global config | `Toast.configure({ maxConcurrent: 5 })` |

### Template Methods

| Method | Description |
|--------|-------------|
| `success(message, options?)` | ✅ Green success toast |
| `error(message, options?)` | ❌ Red error toast |
| `warning(message, options?)` | ⚠️ Orange warning toast |
| `info(message, options?)` | ℹ️ Blue info toast |
| `loading(message?, options?)` | ⏳ Persistent loading toast |
| `promise(promise, messages, options?)` | 🎯 Promise-based toast |

### Queue Management

| Method | Description |
|--------|-------------|
| `getQueueStats()` | 📊 Get queue statistics |
| `pauseQueue()` | ⏸️ Pause processing |
| `resumeQueue()` | ▶️ Resume processing |
| `clearGroup(group)` | 🗑️ Clear group toasts |
| `reorderToast(id, priority)` | 🔄 Change priority |

Complete API documentation: [API.md](./API.md)

## 🚀 Examples

Check out the [example app](./example) for comprehensive usage:

```bash
cd example
npm install

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/react-native-turbo-toast.git

# Install dependencies
npm install

# Run tests
npm test

# Submit PR
```

## 🏛️ About OpenSLM

`react-native-turbo-toast` is part of [OpenSLM](https://github.com/openslm-ai) —
an open collection of on-device tooling for React Native and AI runtimes. More
projects in the [OpenSLM org](https://github.com/openslm-ai).

## 📄 License

MIT © [Anivar Aravind](https://github.com/anivar) / [OpenSLM](https://github.com/openslm-ai)

---

<div align="center">
  <sub>Built with ❤️ using React Native's New Architecture</sub><br/>
  <sub>⭐ Star us on GitHub — it helps!</sub>
</div>