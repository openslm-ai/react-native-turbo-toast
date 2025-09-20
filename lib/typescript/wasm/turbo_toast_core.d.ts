/**
 * @param {string} duration_type
 * @returns {number}
 */
export function calculate_duration(duration_type: string): number;
/**
 * @param {string} prefix
 * @param {number} timestamp
 * @returns {string}
 */
export function generate_id(prefix: string, timestamp: number): string;
export class ToastQueue {
    /**
     * @param {number} max_concurrent
     */
    constructor(max_concurrent: number);
    __destroy_into_raw(): number;
    __wbg_ptr: number;
    free(): void;
    /**
     * @param {string} toast_json
     * @returns {string}
     */
    enqueue(toast_json: string): string;
    /**
     * @returns {string | undefined}
     */
    dequeue(): string | undefined;
    /**
     * @param {string} id
     * @returns {boolean}
     */
    complete(id: string): boolean;
    clear(): void;
    /**
     * @returns {number}
     */
    get_queue_size(): number;
    /**
     * @returns {number}
     */
    get_active_count(): number;
    /**
     * @returns {boolean}
     */
    has_capacity(): boolean;
}
export default __wbg_init;
export function initSync(module: any): any;
declare function __wbg_init(module_or_path: any): Promise<any>;
//# sourceMappingURL=turbo_toast_core.d.ts.map