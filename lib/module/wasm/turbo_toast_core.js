"use strict";

let wasm;
let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
let cachedTextDecoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', {
  ignoreBOM: true,
  fatal: true
}) : {
  decode: () => {
    throw Error('TextDecoder not available');
  }
};
if (typeof TextDecoder !== 'undefined') {
  cachedTextDecoder.decode();
}
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', {
      ignoreBOM: true,
      fatal: true
    }) : {
      decode: () => {
        throw Error('TextDecoder not available');
      }
    };
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return decodeText(ptr, len);
}
let WASM_VECTOR_LEN = 0;
const cachedTextEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : {
  encode: () => {
    throw Error('TextEncoder not available');
  }
};
const encodeString = typeof cachedTextEncoder.encodeInto === 'function' ? (arg, view) => cachedTextEncoder.encodeInto(arg, view) : (arg, view) => {
  const buf = cachedTextEncoder.encode(arg);
  view.set(buf);
  return {
    read: arg.length,
    written: buf.length
  };
};
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7f) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = encodeString(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_export_0.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}
/**
 * @param {string} duration_type
 * @returns {number}
 */
export function calculate_duration(duration_type) {
  const ptr0 = passStringToWasm0(duration_type, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.calculate_duration(ptr0, len0);
  return ret >>> 0;
}

/**
 * @param {string} prefix
 * @param {number} timestamp
 * @returns {string}
 */
export function generate_id(prefix, timestamp) {
  let deferred2_0;
  let deferred2_1;
  try {
    const ptr0 = passStringToWasm0(prefix, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.generate_id(ptr0, len0, timestamp);
    deferred2_0 = ret[0];
    deferred2_1 = ret[1];
    return getStringFromWasm0(ret[0], ret[1]);
  } finally {
    wasm.__wbindgen_free(deferred2_0, deferred2_1, 1);
  }
}
const ToastQueueFinalization = typeof FinalizationRegistry === 'undefined' ? {
  register: () => {},
  unregister: () => {}
} : new FinalizationRegistry(ptr => wasm.__wbg_toastqueue_free(ptr >>> 0, 1));
export class ToastQueue {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ToastQueueFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_toastqueue_free(ptr, 0);
  }
  /**
   * @param {number} max_concurrent
   */
  constructor(max_concurrent) {
    const ret = wasm.toastqueue_new(max_concurrent);
    this.__wbg_ptr = ret >>> 0;
    ToastQueueFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @param {string} toast_json
   * @returns {string}
   */
  enqueue(toast_json) {
    let deferred3_0;
    let deferred3_1;
    try {
      const ptr0 = passStringToWasm0(toast_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len0 = WASM_VECTOR_LEN;
      const ret = wasm.toastqueue_enqueue(this.__wbg_ptr, ptr0, len0);
      var ptr2 = ret[0];
      var len2 = ret[1];
      if (ret[3]) {
        ptr2 = 0;
        len2 = 0;
        throw takeFromExternrefTable0(ret[2]);
      }
      deferred3_0 = ptr2;
      deferred3_1 = len2;
      return getStringFromWasm0(ptr2, len2);
    } finally {
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
    }
  }
  /**
   * @returns {string | undefined}
   */
  dequeue() {
    const ret = wasm.toastqueue_dequeue(this.__wbg_ptr);
    let v1;
    if (ret[0] !== 0) {
      v1 = getStringFromWasm0(ret[0], ret[1]).slice();
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    }
    return v1;
  }
  /**
   * @param {string} id
   * @returns {boolean}
   */
  complete(id) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.toastqueue_complete(this.__wbg_ptr, ptr0, len0);
    return ret !== 0;
  }
  clear() {
    wasm.toastqueue_clear(this.__wbg_ptr);
  }
  /**
   * @returns {number}
   */
  get_queue_size() {
    const ret = wasm.toastqueue_get_queue_size(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * @returns {number}
   */
  get_active_count() {
    const ret = wasm.toastqueue_get_active_count(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * @returns {boolean}
   */
  has_capacity() {
    const ret = wasm.toastqueue_has_capacity(this.__wbg_ptr);
    return ret !== 0;
  }
}
const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);
async function __wbg_load(module, imports) {
  if (typeof Response === 'function' && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);
        if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
          console.warn('`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n', e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return {
        instance,
        module
      };
    } else {
      return instance;
    }
  }
}
function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbg_random_57255a777f5a0573 = () => {
    const ret = Math.random();
    return ret;
  };
  imports.wbg.__wbg_wbindgenthrow_4c11a24fca429ccf = (arg0, arg1) => {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = (arg0, arg1) => {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1);
    return ret;
  };
  imports.wbg.__wbindgen_init_externref_table = () => {
    const table = wasm.__wbindgen_export_0;
    const offset = table.grow(4);
    table.set(0, undefined);
    table.set(offset + 0, undefined);
    table.set(offset + 1, null);
    table.set(offset + 2, true);
    table.set(offset + 3, false);
  };
  return imports;
}
function __wbg_init_memory(_imports, _memory) {}
function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module;
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start();
  return wasm;
}
function initSync(module) {
  if (wasm !== undefined) return wasm;
  if (typeof module !== 'undefined') {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ;
      ({
        module
      } = module);
    } else {
      console.warn('using deprecated parameters for `initSync()`; pass a single object instead');
    }
  }
  const imports = __wbg_get_imports();
  __wbg_init_memory(imports);
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance, module);
}
async function __wbg_init(module_or_path) {
  if (wasm !== undefined) return wasm;
  if (typeof module_or_path !== 'undefined') {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ;
      ({
        module_or_path
      } = module_or_path);
    } else {
      console.warn('using deprecated parameters for the initialization function; pass a single object instead');
    }
  }
  if (typeof module_or_path === 'undefined') {
    module_or_path = new URL('turbo_toast_core_bg.wasm', import.meta.url);
  }
  const imports = __wbg_get_imports();
  if (typeof module_or_path === 'string' || typeof Request === 'function' && module_or_path instanceof Request || typeof URL === 'function' && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  __wbg_init_memory(imports);
  const {
    instance,
    module
  } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance, module);
}
export { initSync };
export default __wbg_init;
//# sourceMappingURL=turbo_toast_core.js.map