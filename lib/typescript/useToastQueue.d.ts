import type { QueuedToast, QueueEvent, QueueStats } from './types';
export interface UseToastQueueOptions {
    refreshInterval?: number;
    enableEvents?: boolean;
    maxEvents?: number;
}
export interface UseToastQueueReturn {
    stats: QueueStats | null;
    events: QueueEvent[];
    activeToasts: QueuedToast[];
    queuedToasts: QueuedToast[];
    actions: {
        clearQueue: () => void;
        clearGroup: (group: string) => QueuedToast[];
        pauseQueue: () => void;
        resumeQueue: () => void;
        hideToast: (id: string) => void;
        updateToast: (id: string, updates: Partial<QueuedToast>) => boolean;
        reorderToast: (id: string, newPriority: number) => boolean;
        getToastPosition: (id: string) => number | undefined;
        refresh: () => void;
        clearEvents: () => void;
    };
}
export declare const useToastQueue: (options?: UseToastQueueOptions) => UseToastQueueReturn;
export declare const useToastStats: (refreshInterval?: number) => QueueStats | null;
export declare const useGroupToasts: (group: string, refreshInterval?: number) => QueuedToast[];
export declare const useQueueEvents: (maxEvents?: number) => {
    events: QueueEvent[];
    clearEvents: () => void;
};
//# sourceMappingURL=useToastQueue.d.ts.map