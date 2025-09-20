import type { QueuedToast } from './types';
export declare class ToastQueue {
    private queue;
    private activeToasts;
    private isProcessing;
    private maxConcurrent;
    constructor(maxConcurrent?: number);
    enqueue(toast: QueuedToast): void;
    dequeue(): QueuedToast | undefined;
    addActive(toast: QueuedToast): void;
    removeActive(id: string): QueuedToast | undefined;
    getActive(id: string): QueuedToast | undefined;
    getAllActive(): QueuedToast[];
    findDuplicate(message: string): QueuedToast | undefined;
    clear(): void;
    hasCapacity(): boolean;
    get size(): number;
    get activeSize(): number;
    setProcessing(value: boolean): void;
    get processing(): boolean;
}
//# sourceMappingURL=queue.d.ts.map