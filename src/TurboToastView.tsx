import type { ViewProps } from 'react-native'
import type { DirectEventHandler, Double } from 'react-native/Libraries/Types/CodegenTypes'
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent'

interface NativeProps extends ViewProps {
  message: string
  duration?: Double
  position?: string
  type?: string
  backgroundColor?: string
  textColor?: string
  visible?: boolean
  onShow?: DirectEventHandler<Record<string, never>>
  onHide?: DirectEventHandler<Record<string, never>>
  onPress?: DirectEventHandler<Record<string, never>>
}

export default codegenNativeComponent<NativeProps>('TurboToastView', {
  interfaceOnly: true,
})
