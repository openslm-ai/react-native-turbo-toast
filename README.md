# react-native-turbo-toast 🍞

Lightning-fast toast notifications for React Native with the new architecture (Fabric & TurboModules).

[![npm version](https://img.shields.io/npm/v/react-native-turbo-toast.svg)](https://www.npmjs.com/package/react-native-turbo-toast)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.81+-blue.svg)](https://reactnative.dev)
[![New Architecture](https://img.shields.io/badge/New%20Architecture-Ready-green.svg)](https://reactnative.dev/docs/the-new-architecture/landing-page)

## ✨ Features

- 🚀 **TurboModule** powered - Direct JSI calls, no bridge overhead
- 🎨 **Fabric Renderer** - Smooth 60fps animations
- 📱 **Cross-platform** - iOS, Android, and Web support
- 🎯 **Type-safe** - Full TypeScript support with Codegen
- 📦 **Tiny** - < 20KB bundle size
- ⚡ **Queue Management** - Automatic toast queueing
- 🎨 **Customizable** - Themes, positions, durations

## 🔥 Why Turbo Toast?

Traditional React Native toast libraries use the old bridge architecture, causing:
- Async communication delays
- JSON serialization overhead
- Dropped frames during animations

**Turbo Toast** uses the new architecture for:
- Synchronous native calls via JSI
- Direct memory access
- Guaranteed 60fps animations
- 3x faster show/hide operations

## 📦 Installation

```bash
npm install react-native-turbo-toast
# or
yarn add react-native-turbo-toast
# or
bun add react-native-turbo-toast
```

### iOS Setup

```bash
cd ios && pod install
```

### Android Setup

No additional setup needed! The new architecture is automatically configured.

## 🚀 Usage

```tsx
import Toast from 'react-native-turbo-toast'

// Simple usage
Toast.show('Hello World!')

// With options
Toast.show({
  message: 'Success!',
  type: 'success',
  position: 'top',
  duration: 'long'
})

// With action
Toast.show({
  message: 'Message sent',
  type: 'info',
  action: {
    text: 'UNDO',
    onPress: () => console.log('Undo pressed')
  }
})

// Hide current toast
Toast.hide()

// Clear all queued toasts
Toast.hideAll()
```

## 🎨 Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `message` | `string` | Required | Toast message |
| `duration` | `'short' \| 'long' \| number` | `'short'` | Duration (short=2s, long=3.5s) |
| `position` | `'top' \| 'center' \| 'bottom'` | `'bottom'` | Screen position |
| `type` | `'success' \| 'error' \| 'warning' \| 'info' \| 'default'` | `'default'` | Toast type |
| `backgroundColor` | `string` | Based on type | Custom background color |
| `textColor` | `string` | `'#FFFFFF'` | Custom text color |
| `icon` | `string` | Based on type | Custom icon |
| `action` | `{text: string, onPress: () => void}` | undefined | Action button |

## 🏗 New Architecture

This library is built specifically for React Native's new architecture:

- **TurboModules**: Native module using C++ TurboModule spec
- **Fabric**: Native component using Fabric renderer
- **JSI**: Direct JavaScript Interface for synchronous calls
- **Codegen**: Automatic native code generation from TypeScript

### Requirements

- React Native 0.81.0 or higher
- New Architecture enabled

## 📄 License

MIT © [Anivar Aravind](https://github.com/anivar)

---

Made with ❤️ using React Native's new architecture