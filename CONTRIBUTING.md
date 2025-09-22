# Contributing to react-native-turbo-toast

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

### Prerequisites

- Node.js 22.0.0 or higher
- Bun package manager (recommended) or npm
- React Native development environment
- iOS: Xcode 14+ and CocoaPods
- Android: Android Studio and JDK 11+

### Getting Started

1. Fork and clone the repository:
```bash
git clone https://github.com/your-username/react-native-turbo-toast.git
cd react-native-turbo-toast
```

2. Install dependencies:
```bash
bun install
```

3. Run tests to ensure everything works:
```bash
bun test
bun run typecheck
bun run lint
```

## Project Structure

```
├── src/                    # TypeScript source code
│   ├── __tests__/         # Unit tests
│   ├── wasm/              # WebAssembly integration
│   ├── manager.ts         # Main toast manager
│   ├── queue.ts           # Queue system
│   ├── types.ts           # TypeScript definitions
│   └── index.tsx          # Main entry point
├── ios/                   # iOS native implementation
├── android/               # Android native implementation
├── example/               # Example React Native app
└── lib/                   # Built output (generated)
```

## Development Workflow

### Making Changes

1. Create a feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and add tests if applicable

3. Run the development checks:
```bash
bun run typecheck    # TypeScript validation
bun run lint         # Code linting and formatting
bun test            # Unit tests
bun run prepare     # Build the library
```

4. Test your changes in the example app:
```bash
cd example
bun install
bun run ios     # or android
```

### Code Style

We use Biome for code formatting and linting:

- Run `bun run format` to format code
- Run `bun run lint` to check and fix linting issues
- Configuration is in `biome.json`

### Commit Messages

Use conventional commit format:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

Example: `feat: add haptic feedback support for iOS`

## Testing

### Unit Tests

We use Bun's built-in test runner:

```bash
bun test                    # Run all tests
bun test manager.test.ts    # Run specific test file
bun test --watch           # Watch mode
```

### Integration Testing

Test your changes with the example app:

1. Build the library: `bun run prepare`
2. Start the example: `cd example && bun run start`
3. Test on iOS: `bun run ios`
4. Test on Android: `bun run android`
5. Test on Web: `bun run web`

### Platform Testing

When contributing native code changes:

- **iOS**: Test on both simulator and physical device
- **Android**: Test on both emulator and physical device
- **Web**: Test in Chrome, Safari, and Firefox
- **New Architecture**: Test with both old and new React Native architecture

## Native Development

### iOS Development

- Native code is in `ios/` directory
- Uses Objective-C++ (`.mm` files)
- Supports both old bridge and new TurboModules
- Memory management is crucial - avoid retain cycles

### Android Development

- Native code is in `android/src/main/java/com/turbo/toast/`
- Uses Kotlin
- Supports both old bridge and new TurboModules
- Follow Android lifecycle best practices

### Building Native Code

The library uses Codegen to generate native interfaces:

```bash
# The build process automatically generates:
# - iOS: RNTurboToastSpec.h
# - Android: NativeTurboToastSpec.java
```

## Documentation

### README Updates

When adding new features:
1. Update the main README.md
2. Add examples to the example app
3. Update TypeScript definitions if needed

### API Documentation

All public APIs should have:
- JSDoc comments
- TypeScript type definitions
- Usage examples
- Migration notes (if breaking changes)

## Pull Request Process

1. **Pre-submission Checklist:**
   - [ ] Tests pass (`bun test`)
   - [ ] TypeScript compiles (`bun run typecheck`)
   - [ ] Code is formatted (`bun run lint`)
   - [ ] Library builds (`bun run prepare`)
   - [ ] Example app works
   - [ ] Documentation updated

2. **Pull Request:**
   - Create PR against `main` branch
   - Use descriptive title and description
   - Link any related issues
   - Add screenshots/videos for UI changes

3. **Review Process:**
   - Maintainers will review within 7 days
   - Address review feedback
   - Ensure CI passes
   - Squash commits before merge

## Release Process

Releases are handled by maintainers:

1. Version bump in `package.json`
2. Update CHANGELOG.md
3. Create GitHub release with notes
4. Publish to npm

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue with reproduction steps
- **Security**: Email security@openslm.ai (see SECURITY.md)

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Report unacceptable behavior to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to react-native-turbo-toast! 🍞