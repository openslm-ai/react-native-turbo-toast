# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

react-native-turbo-toast is a high-performance toast notification library for React Native using the new architecture (Fabric and TurboModules). It provides native toast notifications with direct JSI calls, avoiding bridge overhead.

## Key Commands

### Development
```bash
# Type checking
bun run typecheck  # or npm run typecheck

# Linting and formatting (uses Biome)
bun run lint       # or npm run lint
bun run format     # or npm run format

# Run tests
bun test           # or npm test

# Build the library
bun run prepare    # or npm run prepare

# Release new version
bun run release    # or npm run release
```

### iOS Development
```bash
cd ios && pod install  # Required after installation
```

## Architecture

### Core Structure
- **TurboModule Implementation** (`src/NativeTurboToast.ts`): Defines the native module spec using TurboModuleRegistry for direct JSI communication
- **Toast Manager** (`src/manager.ts`): Singleton pattern managing toast lifecycle, queue, and configuration
- **Queue System** (`src/queue.ts`): Manages toast display queue with automatic show/hide orchestration
- **Web Renderer** (`src/web-renderer.ts`): Web-specific implementation using DOM APIs
- **Fabric Component** (`src/TurboToastView.tsx`): Native view component for rendering toasts

### Platform Support
- iOS: Uses native UIKit views via Fabric renderer
- Android: Native implementation via Fabric (to be implemented)
- Web: Custom DOM-based renderer with animations

### Type System
All types are defined in `src/types.ts` and exposed through the main index. The library uses TypeScript with React Native's Codegen for automatic native code generation.

## Code Conventions

### TypeScript/JavaScript
- Uses Biome for linting and formatting
- Single quotes for strings
- No semicolons (handled by Biome)
- 2 spaces indentation
- Line width: 100 characters
- Trailing commas in multi-line structures

### Exports Pattern
- Named exports for individual functions
- Default export object containing all functions
- Type exports separated from implementation

### Native Module Pattern
The library follows React Native's new architecture patterns:
- TurboModule spec defined in TypeScript
- Codegen configuration in package.json
- Native implementations conditionally loaded based on architecture

## Testing Approach
Tests use Bun test runner. Run with `bun test` to execute all tests.

## Important Notes
- Minimum React Native version: 0.81.0
- Requires new architecture to be enabled
- Library size target: < 20KB bundled
- Performance target: 60fps animations, 3x faster than bridge-based solutions