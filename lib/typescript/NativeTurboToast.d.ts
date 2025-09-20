import type { TurboModule } from 'react-native';
export interface NativeToastOptions {
    message: string;
    duration?: 'short' | 'long' | number;
    position?: 'top' | 'center' | 'bottom';
    type?: 'success' | 'error' | 'warning' | 'info' | 'default';
    backgroundColor?: string;
    textColor?: string;
    icon?: string;
    action?: {
        text: string;
        onPress: () => void;
    };
}
export interface Spec extends TurboModule {
    show(options: NativeToastOptions): Promise<void>;
    hide(): void;
    hideAll(): void;
}
declare const _default: Spec;
export default _default;
//# sourceMappingURL=NativeTurboToast.d.ts.map