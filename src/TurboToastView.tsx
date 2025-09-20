import type { ViewProps } from 'react-native'
import type { DirectEventHandler, Double, Int32 } from 'react-native/Libraries/Types/CodegenTypes'
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent'

interface NativeProps extends ViewProps {
  message: string
  duration?: Double
  position?: string
  type?: string
  backgroundColor?: string
  textColor?: string
  visible?: boolean
  onShow?: DirectEventHandler<{}>
  onHide?: DirectEventHandler<{}>
  onPress?: DirectEventHandler<{}>
}

export default codegenNativeComponent<NativeProps>('TurboToastView', {
  interfaceOnly: true,
})
