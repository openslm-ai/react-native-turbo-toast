import type { QueuedToast } from './types';
interface IAsyncStorage {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}
export interface PersistedData {
    version: string;
    toasts: QueuedToast[];
    timestamp: number;
}
export declare class ToastPersistence {
    private isEnabled;
    private autoSaveInterval;
    private storage;
    enable(storage?: IAsyncStorage): Promise<void>;
    disable(): void;
    save(toasts: QueuedToast[]): Promise<void>;
    load(): Promise<QueuedToast[]>;
    clear(): Promise<void>;
    startAutoSave(getToasts: () => QueuedToast[], interval?: number): void;
    stopAutoSave(): void;
}
export declare const toastPersistence: ToastPersistence;
export {};
//# sourceMappingURL=persistence.d.ts.map