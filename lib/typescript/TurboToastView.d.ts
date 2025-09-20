import type { ViewProps } from 'react-native';
import type { DirectEventHandler, Double } from 'react-native/Libraries/Types/CodegenTypes';
interface NativeProps extends ViewProps {
    message: string;
    duration?: Double;
    position?: string;
    type?: string;
    backgroundColor?: string;
    textColor?: string;
    visible?: boolean;
    onShow?: DirectEventHandler<Record<string, never>>;
    onHide?: DirectEventHandler<Record<string, never>>;
    onPress?: DirectEventHandler<Record<string, never>>;
}
declare const _default: import("react-native/Libraries/Utilities/codegenNativeComponent").NativeComponentType<NativeProps>;
export default _default;
//# sourceMappingURL=TurboToastView.d.ts.map