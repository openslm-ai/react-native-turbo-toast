# WASM Integration

This directory contains WebAssembly integration for react-native-turbo-toast, enabling high-performance toast processing at the edge.

## Structure

- `turbo_toast_core.js` - JavaScript bindings for WASM module
- `turbo_toast_core.d.ts` - TypeScript definitions
- `turbo_toast_core_bg.wasm` - Compiled WebAssembly binary (generated from Rust)
- `turbo_toast_core_bg.wasm.d.ts` - WASM TypeScript definitions

## Building from Rust

To generate the WASM module from Rust source:

1. Install Rust and wasm-pack:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install wasm-pack
```

2. Create Rust source in `rust-src/`:
```rust
// rust-src/lib.rs
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct ToastConfig {
    pub message: String,
    pub duration: u32,
    pub priority: u32,
}

#[wasm_bindgen]
pub struct ToastProcessor {
    queue: Vec<ToastConfig>,
}

#[wasm_bindgen]
impl ToastProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self { queue: Vec::new() }
    }

    pub fn add_toast(&mut self, message: String, duration: u32, priority: u32) {
        let config = ToastConfig {
            message,
            duration,
            priority,
        };
        self.queue.push(config);
        self.queue.sort_by(|a, b| b.priority.cmp(&a.priority));
    }

    pub fn get_next(&mut self) -> Option<String> {
        self.queue.pop().map(|t| t.message)
    }

    pub fn queue_size(&self) -> usize {
        self.queue.len()
    }

    pub fn clear_queue(&mut self) {
        self.queue.clear();
    }

    pub fn process_batch(&mut self, max_items: usize) -> Vec<String> {
        let mut result = Vec::new();
        for _ in 0..max_items.min(self.queue.len()) {
            if let Some(toast) = self.queue.pop() {
                result.push(toast.message);
            }
        }
        result
    }
}

#[wasm_bindgen]
pub fn calculate_display_time(message: &str, base_duration: u32) -> u32 {
    let words = message.split_whitespace().count() as u32;
    let reading_time = words * 200; // 200ms per word
    base_duration.max(reading_time)
}

#[wasm_bindgen]
pub fn format_toast_message(message: &str, toast_type: &str) -> String {
    let icon = match toast_type {
        "success" => "✓",
        "error" => "✕",
        "warning" => "⚠",
        "info" => "ⓘ",
        _ => "",
    };

    if icon.is_empty() {
        message.to_string()
    } else {
        format!("{} {}", icon, message)
    }
}
```

3. Create Cargo.toml:
```toml
[package]
name = "turbo-toast-core"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
serde = { version = "1.0", features = ["derive"] }
serde-wasm-bindgen = "0.6"

[profile.release]
opt-level = "z"
lto = true
```

4. Build WASM module:
```bash
wasm-pack build --target web --out-dir ../src/wasm --out-name turbo_toast_core
```

## Usage in React Native

```typescript
import * as wasm from './wasm/turbo_toast_core'

// Initialize WASM module
await wasm.default()

// Create processor
const processor = new wasm.ToastProcessor()

// Add toasts
processor.add_toast('Hello World', 2000, 1)
processor.add_toast('High Priority', 3000, 10)

// Process queue
const nextToast = processor.get_next()

// Calculate display time
const displayTime = wasm.calculate_display_time('Long message here', 2000)

// Format message with icon
const formatted = wasm.format_toast_message('Success!', 'success')
```

## Performance Benefits

- **Edge Computing**: Process toast logic at edge locations
- **Zero Latency**: No network round trips for toast processing
- **Memory Efficient**: Rust's memory safety guarantees
- **Parallel Processing**: Can handle multiple toast queues simultaneously
- **Platform Agnostic**: Runs on any JavaScript runtime with WASM support

## Future Enhancements

- [ ] Add animation interpolation in WASM
- [ ] Implement toast clustering algorithms
- [ ] Add machine learning for toast timing optimization
- [ ] Support for complex toast layouts
- [ ] Batch processing optimizations