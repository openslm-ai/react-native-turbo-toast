import type { ToastConfig, ToastOptions } from './types';
export declare class ToastManager {
    private static instance;
    private queue;
    private webRenderer;
    private defaultOptions;
    private constructor();
    static getInstance(): ToastManager;
    configure(config: ToastConfig): void;
    show(options: ToastOptions | string): string;
    private processQueue;
    private showWebToast;
    private hideToast;
    hide(id?: string): void;
    hideAll(): void;
    update(id: string, options: Partial<ToastOptions>): void;
    private toNativeOptions;
}
//# sourceMappingURL=manager.d.ts.map