import TurboToastView from './TurboToastView';
import type { ToastConfig, ToastOptions } from './types';
export type { ToastAction, ToastConfig, ToastDuration, ToastOptions, ToastPosition, ToastType, } from './types';
export declare const show: (options: ToastOptions | string) => string;
export declare const hide: (id?: string) => void;
export declare const hideAll: () => void;
export declare const update: (id: string, options: Partial<ToastOptions>) => void;
export declare const configure: (options: ToastConfig) => void;
export { TurboToastView };
declare const _default: {
    show: (options: ToastOptions | string) => string;
    hide: (id?: string) => void;
    hideAll: () => void;
    update: (id: string, options: Partial<ToastOptions>) => void;
    configure: (options: ToastConfig) => void;
};
export default _default;
//# sourceMappingURL=index.d.ts.map