# 📜 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 🎉 [1.0.0]

### ✨ Added
- **🔘 Multi-action support** - Multiple buttons per toast with style variants (default, destructive, cancel)
- **🎬 Animation presets** - 6 pre-built animations: fade, slide, bounce, zoom, spring, none
- **📚 Toast stacking** - Visual stacking with configurable offset and max visible count
- **💾 Persistence** - Save/restore queue across app restarts (iOS, Android)
- **📈 Analytics integration** - Pluggable provider system for usage tracking
- **📱 Toast grouping** - Organize toasts by logical groups
- **🛡️ Deduplication** - Prevent spam with message and group-based deduplication
- **🎯 Priority queue** - Higher priority toasts show first

### 🔄 Changed
- 📚 Improved documentation with accurate platform feature matrix
- 🎨 Enhanced TypeScript definitions for new features
- 📦 Updated bundle size optimization

### 🐛 Fixed
- 🤖 Android multi-action button implementation
- 📝 TypeScript type definitions for analytics
- 🧠 Memory cleanup in queue management
- 🧹 Linting issues with Biome

### 📱 Platform Notes
- **🍎 iOS**: Full feature support including swipe-to-dismiss
- **🤖 Android**: All features except swipe-to-dismiss (tap-to-dismiss only)
- **🌐 Web**: All features except persistence (no AsyncStorage in browser)

## 🚀 [0.2.0]

### ✨ Added

#### 🎯 Advanced Queue Management System
- Priority-based queue with automatic sorting
- Group management for organizing toasts
- Queue size limits with smart eviction
- Pause/resume queue processing
- Queue statistics and monitoring
- Event system for state changes
- Automatic cleanup of expired toasts

#### 🎨 Custom React Component Support
- Render any React component as toast
- Interactive components with full event support
- ToastContainer portal system
- Dynamic updates while displayed
- Callback props for custom interactions

#### 🛠️ Visual Developer Tools
- QueueMonitor component for debugging
- Visual statistics dashboard
- Event history with timestamps
- Interactive queue controls
- React hooks for integration

#### 📊 Progress Toast System
- Progress bars with 0-1 scale
- Dynamic progress updates
- Custom progress colors
- Auto-hide on completion
- Cross-platform support

#### 🎉 Template Shortcuts
- `Toast.success()` - ✅ Green success toast
- `Toast.error()` - ❌ Red error toast
- `Toast.warning()` - ⚠️ Orange warning toast
- `Toast.info()` - ℹ️ Blue info toast
- `Toast.loading()` - ⏳ Persistent loading toast
- `Toast.promise()` - 🎯 Promise-based toasts

### 🔄 Changed
- 🤖 Enhanced Android implementation with custom views
- 📳 Improved haptic feedback across platforms
- ♿ Better accessibility support
- 🧠 Optimized memory management

### 🐛 Fixed
- 🍎 iOS pod installation issues
- 📝 TypeScript declaration exports
- ⏱️ Memory leaks in timer management

## 🔧 [0.1.1]

### 🐛 Fixed
- 🏗️ Build configuration improvements
- 🍎 iOS pod installation issues
- 📝 TypeScript declaration exports

### 🔄 Changed
- 📦 Updated npm package configuration
- 🎯 Improved bundle size optimization

## 🎊 [0.1.0]

### ✨ Added
- 🚀 Initial release with basic toast functionality
- ⚡ TurboModule implementation for iOS, Android, and Web
- 📝 TypeScript support
- 🎨 Basic positioning and styling options
- 📱 Cross-platform compatibility

---

*For detailed API documentation, see [API.md](API.md)*
*For complete feature overview, see [FEATURES.md](FEATURES.md)*