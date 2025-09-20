import type { QueuedToast } from './types';
export declare class WebRenderer {
    private static readonly COLORS;
    private static readonly ICONS;
    render(toast: QueuedToast, onDismiss: (id: string) => void): HTMLElement;
    remove(id: string, animationDuration?: number): Promise<void>;
    private createElement;
    private applyStyles;
    private addEventHandlers;
    private addActions;
    private animateIn;
    private animateOut;
    private getPositionStyles;
    private getInitialTransform;
    private addSwipeHandler;
}
//# sourceMappingURL=web-renderer.d.ts.map