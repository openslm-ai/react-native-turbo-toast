// Mock React Native modules
global.__DEV__ = true;

// Mock native modules that aren't available in test environment
jest.mock('react-native', () => {
  const actualReactNative = jest.requireActual('react-native');
  return {
    ...actualReactNative,
    Platform: {
      OS: 'ios',
      select: jest.fn((config) => config.ios || config.default),
    },
    NativeModules: {},
    TurboModuleRegistry: {
      getEnforcing: jest.fn(() => ({
        show: jest.fn().mockResolvedValue(undefined),
        hide: jest.fn(),
        hideAll: jest.fn(),
      })),
    },
  };
});

// Mock DOM APIs for web renderer tests
Object.defineProperty(global, 'document', {
  value: {
    createElement: jest.fn(() => ({
      style: {},
      classList: {},
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      querySelector: jest.fn(),
      setAttribute: jest.fn(),
      getAttribute: jest.fn(),
    })),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn(),
    },
    getElementById: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(global, 'navigator', {
  value: {
    vibrate: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(global, 'requestAnimationFrame', {
  value: jest.fn((cb) => setTimeout(cb, 0)),
  writable: true,
});