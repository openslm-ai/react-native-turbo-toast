# 🤝 Contributing to react-native-turbo-toast

Thank you for your interest in contributing! We love your input! 🎉

## 📋 Quick Links

- [Code of Conduct](#-code-of-conduct)
- [Development Setup](#-development-setup)
- [Making Changes](#-making-changes)
- [Testing](#-testing)
- [Submitting Changes](#-submitting-changes)
- [Coding Guidelines](#-coding-guidelines)

## 📜 Code of Conduct

Please be respectful and inclusive. We welcome contributors of all backgrounds and skill levels.

## 🛠️ Development Setup

### Prerequisites

```bash
# Required versions
node >= 22.0.0
bun >= 1.0.0 (recommended) or npm >= 10.0.0

# Platform tools
iOS: Xcode 14+ with CocoaPods
Android: Android Studio with JDK 11+
```

### 🚀 Quick Start

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/react-native-turbo-toast.git
cd react-native-turbo-toast

# 2. Install dependencies
bun install

# 3. Run checks
bun test           # ✅ Run tests
bun run typecheck  # 📝 Type checking
bun run lint       # 🧹 Linting
```

## 📁 Project Structure

```
react-native-turbo-toast/
├── 📦 src/                    # TypeScript source
│   ├── 🧪 __tests__/         # Unit tests
│   ├── 🎯 manager.ts         # Core manager
│   ├── 📊 queue.ts           # Queue system
│   ├── 💾 persistence.ts     # Storage layer
│   ├── 📈 analytics.ts       # Analytics
│   └── 🚀 index.tsx          # Entry point
├── 🍎 ios/                   # iOS native code
├── 🤖 android/               # Android native code
├── 📱 example/               # Example app
└── 📚 lib/                   # Build output
```

## 🔧 Making Changes

### 1️⃣ Create a Branch

```bash
# Feature branch
git checkout -b feature/amazing-feature

# Bug fix branch
git checkout -b fix/issue-123
```

### 2️⃣ Development Workflow

```bash
# Start development
bun run example    # 📱 Run example app

# Make changes
code src/          # ✏️ Edit source code

# Test changes
bun test --watch   # 🔄 Watch mode
```

### 3️⃣ Common Tasks

#### 🎨 Adding a New Feature

1. **Plan** - Open an issue to discuss
2. **Implement** - Write clean, typed code
3. **Test** - Add unit tests in `__tests__`
4. **Document** - Update README and API.md
5. **Example** - Add to example app

#### 🐛 Fixing a Bug

1. **Reproduce** - Create failing test
2. **Fix** - Make test pass
3. **Verify** - Run full test suite
4. **Document** - Update CHANGELOG

#### 📱 Platform-Specific Code

**iOS (Objective-C++)**
```objc
// ios/TurboToast.mm
- (void)showToast:(NSDictionary *)options {
    // Implementation
}
```

**Android (Kotlin)**
```kotlin
// android/src/main/java/com/turbo/toast/TurboToastModule.kt
fun showToast(options: ReadableMap) {
    // Implementation
}
```

**Web (TypeScript)**
```typescript
// src/TurboToastView.web.tsx
export function showToast(options: ToastOptions) {
    // Implementation
}
```

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Watch mode
bun test --watch

# Specific file
bun test manager.test.ts
```

### Platform Testing

```bash
# iOS
cd example
bun run ios

# Android
bun run android

# Web
bun run web
```

### Test Structure

```typescript
describe('ToastManager', () => {
  it('should show toast with message', () => {
    const id = Toast.show('Hello')
    expect(Toast.isActive(id)).toBe(true)
  })
})
```

## 📝 Coding Guidelines

### TypeScript

✅ **DO:**
```typescript
// Use proper types
interface ToastOptions {
  message: string
  duration?: number
  type?: 'success' | 'error'
}

// Use descriptive names
function showToastWithAnimation(options: ToastOptions): string

// Handle errors properly
try {
  await performAction()
} catch (error) {
  console.error('Action failed:', error)
}
```

❌ **DON'T:**
```typescript
// Avoid any
function showToast(options: any)  // ❌

// Avoid unclear names
function st(o)  // ❌

// Don't ignore errors
performAction().catch(() => {})  // ❌
```

### Style Guide

- 🎯 **Clarity** over cleverness
- 📏 **2 spaces** for indentation
- 🔤 **camelCase** for variables/functions
- 🏛️ **PascalCase** for types/components
- 💬 **Single quotes** for strings
- 📊 **No semicolons** (handled by formatter)

## 🚀 Submitting Changes

### 1️⃣ Pre-Submit Checklist

```bash
# ✅ All checks pass
bun test && bun run typecheck && bun run lint

# 📝 Commit with conventional format
git commit -m "feat: add amazing feature"
```

### 2️⃣ Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` ✨ New feature
- `fix:` 🐛 Bug fix
- `docs:` 📚 Documentation
- `style:` 🎨 Code style
- `refactor:` ♻️ Code refactoring
- `test:` 🧪 Testing
- `chore:` 🔧 Maintenance

**Examples:**
```bash
feat: add multi-action support for toasts
fix: prevent memory leak in queue manager
docs: update API documentation for v1.0
test: add tests for priority queue
```

### 3️⃣ Pull Request Process

1. **Push your branch**
   ```bash
   git push origin feature/amazing-feature
   ```

2. **Open PR with:**
   - ✅ Clear title
   - 📝 Description of changes
   - 🎯 Related issue number
   - 📸 Screenshots (if UI changes)
   - 🧪 Test results

3. **PR Template:**
   ```markdown
   ## 📝 Description
   Brief description of changes

   ## 🎯 Related Issue
   Fixes #123

   ## ✅ Checklist
   - [ ] Tests pass
   - [ ] TypeScript checks pass
   - [ ] Lint passes
   - [ ] Docs updated
   - [ ] Example updated
   ```

## 🎯 Areas to Contribute

### 🌟 Good First Issues

- 📚 Documentation improvements
- 🧪 Add more tests
- 📱 Example app enhancements
- 🐛 Bug fixes with clear reproduction

### 🚀 Advanced Contributions

- 🎨 New animation presets
- 📱 Platform-specific features
- 🔧 Performance optimizations
- ♿ Accessibility improvements

## 💡 Tips for Contributors

### 🏃 Quick Iteration

```bash
# Use example app for testing
cd example
bun run start

# Hot reload for native changes
# iOS: Cmd+R in simulator
# Android: RR in emulator
```

### 🐛 Debugging

```typescript
// Add debug logs
console.log('[Toast]', 'Processing queue:', queue.length)

// Use Chrome DevTools for RN
// Cmd+D (iOS) or Cmd+M (Android) → Debug
```

### 📊 Performance

```typescript
// Measure performance
const start = performance.now()
processQueue()
console.log('Queue processed in', performance.now() - start, 'ms')
```

## ❓ Getting Help

- 💬 **Discord**: Join our community
- 🐛 **Issues**: Report bugs or request features
- 💡 **Discussions**: Share ideas and get feedback

## 🏆 Recognition

Contributors are recognized in:
- 📜 [Contributors list](https://github.com/anivar/react-native-turbo-toast/contributors)
- 🎉 Release notes
- ⭐ Special thanks in README

## 📄 License

By contributing, you agree that your contributions will be licensed under MIT License.

---

<div align="center">
  <sub>Thank you for making react-native-turbo-toast better! 🎉</sub>
</div>