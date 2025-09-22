# react-native-turbo-toast 🍞

High-performance toast notifications for React Native using the New Architecture (Fabric & TurboModules). Direct JSI calls for 3x faster performance.

[![npm version](https://img.shields.io/npm/v/react-native-turbo-toast.svg)](https://www.npmjs.com/package/react-native-turbo-toast)
[![npm downloads](https://img.shields.io/npm/dm/react-native-turbo-toast.svg)](https://www.npmjs.com/package/react-native-turbo-toast)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React Native](https://img.shields.io/badge/React%20Native-0.80+-blue.svg)](https://reactnative.dev)
[![New Architecture](https://img.shields.io/badge/New%20Architecture-Ready-green.svg)](https://reactnative.dev/docs/the-new-architecture/landing-page)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey.svg)](https://reactnative.dev)
[![Bundle Size](https://img.shields.io/badge/Bundle%20Size-<20KB-brightgreen.svg)](https://bundlephobia.com/package/react-native-turbo-toast)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/openslm-ai/react-native-turbo-toast/pulls)

## ✨ Features

- 🚀 **3x Faster** - Direct JSI calls eliminate bridge overhead
- ⚡ **60fps Animations** - Fabric renderer ensures smooth transitions
- 📱 **Cross-platform** - iOS, Android, and Web support
- 🎯 **Type-safe** - Full TypeScript with auto-completion
- 📦 **Lightweight** - < 20KB base bundle size
- 🔄 **Smart Queue** - Priority-based toast management
- 🎨 **Fully Customizable** - Colors, positions, animations, actions

## 🏗 Architecture

Built with React Native's New Architecture:
- **TurboModules**: Direct native module communication via JSI
- **Fabric Renderer**: Native view rendering for smooth animations
- **Codegen**: Automatic native code generation from TypeScript

## 📦 Installation

### Prerequisites
- React Native 0.80.0 or higher
- React 19.0.0 or higher
- New Architecture enabled ([Migration Guide](https://reactnative.dev/docs/new-architecture-intro))
- Node.js 22.0.0 or higher

### Install

```bash
npm install react-native-turbo-toast
# or
yarn add react-native-turbo-toast
# or
bun add react-native-turbo-toast
```

**Current Version**: v0.1.1 - [View on npm](https://www.npmjs.com/package/react-native-turbo-toast)

### iOS Setup

```bash
cd ios && pod install
```

### Android Setup

No additional setup needed! The new architecture is automatically configured.

### Enable New Architecture (if not already enabled)

```bash
# iOS
cd ios
RCT_NEW_ARCH_ENABLED=1 pod install

# Android - in gradle.properties
newArchEnabled=true
```

## 🚀 Quick Start

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

## 🔄 Migration Guide

### Basic Migration

If you're migrating from another toast library, the API is similar:

```tsx
import Toast from 'react-native-turbo-toast'

// Simple usage
Toast.show('Hello World')

// With options
Toast.show({
  message: 'Success!',
  type: 'success',
  duration: 'short',
  position: 'bottom'
})
```

## 🛠 Troubleshooting

### Toast not showing?
1. Ensure New Architecture is enabled
2. Clean and rebuild: `cd ios && pod install && cd .. && yarn start --reset-cache`
3. Check that peer dependencies match requirements

### Build errors on iOS?
```bash
cd ios
rm -rf Pods Podfile.lock
RCT_NEW_ARCH_ENABLED=1 pod install
```

### TypeScript errors?
```bash
yarn typecheck # Check for type issues
yarn add @types/react@^19.0.0 # Update React types
```

## 📊 Technical Specifications

- **Bundle Size**: < 20KB (core JavaScript)
- **Animation**: 60fps using Fabric renderer
- **TypeScript**: Full type definitions with auto-completion
- **Platform Support**: iOS, Android, and Web
- **React Native**: 0.80.0+ with New Architecture
- **React**: 19.0.0+

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guide](CONTRIBUTING.md) to get started.

## 📚 Advanced Usage

### Priority Queue
```tsx
// High priority toast (shows immediately)
Toast.show({
  message: 'Urgent!',
  priority: 10
})

// Normal priority
Toast.show({
  message: 'Regular notification'
})
```

### Custom Styling
```tsx
Toast.configure({
  defaultOptions: {
    backgroundColor: '#333',
    textColor: '#fff',
    animationDuration: 250
  }
})
```

## 📈 Package Stats

- **Bundle Size**: 127.1 kB (compressed), 360.0 kB (unpacked)
- **Runtime Size**: <20KB (excluding WASM)
- **Dependencies**: Zero runtime dependencies
- **Platforms**: iOS 13.0+, Android API 21+, Web
- **Architecture**: New Architecture ready, legacy compatible

## 🔗 Links

- **npm Package**: https://www.npmjs.com/package/react-native-turbo-toast
- **GitHub Repository**: https://github.com/openslm-ai/react-native-turbo-toast
- **Issues & Support**: https://github.com/openslm-ai/react-native-turbo-toast/issues
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)
- **Security**: [SECURITY.md](SECURITY.md)

## 📄 License

MIT © [Anivar Aravind](https://github.com/anivar)