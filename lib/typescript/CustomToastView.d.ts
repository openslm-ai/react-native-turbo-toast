import type React from 'react';
import type { ToastOptions } from './types';
interface CustomToastViewProps {
    toast: ToastOptions & {
        id: string;
    };
    onDismiss: (id: string) => void;
    children?: React.ReactNode;
}
export declare const CustomToastView: React.FC<CustomToastViewProps>;
export {};
//# sourceMappingURL=CustomToastView.d.ts.map