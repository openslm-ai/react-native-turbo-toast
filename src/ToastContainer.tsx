import type React from 'react'
import { useEffect, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { CustomToastView } from './CustomToastView'
import { ToastManager } from './manager'
import type { QueuedToast } from './types'

interface ToastContainerProps {
  children?: React.ReactNode
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ children }) => {
  const [toasts, setToasts] = useState<QueuedToast[]>([])

  useEffect(() => {
    const manager = ToastManager.getInstance()

    // Subscribe to toast updates
    const updateToasts = () => {
      const activeToasts = manager.getActiveToasts()
      setToasts(activeToasts.filter((toast) => toast.customView))
    }

    // Set up listener for custom view toasts
    manager.setCustomViewHandler(updateToasts)

    // Initial load
    updateToasts()

    return () => {
      manager.setCustomViewHandler(null)
    }
  }, [])

  const handleDismiss = (id: string) => {
    ToastManager.getInstance().hide(id)
  }

  // Don't render on web - web has its own renderer
  if (Platform.OS === 'web') {
    return <>{children}</>
  }

  const manager = ToastManager.getInstance()
  const config = manager.getConfig()
  const stackingEnabled = config?.stackingEnabled ?? false
  const stackingOffset = config?.stackingOffset ?? 10
  const stackingMaxVisible = config?.stackingMaxVisible ?? 3

  return (
    <>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map((toast, index) => {
          const isVisible = !stackingEnabled || index < stackingMaxVisible
          const stackOffset = stackingEnabled ? index * stackingOffset : 0

          return (
            <View
              key={toast.id}
              style={[
                styles.toastWrapper,
                {
                  transform: [{ translateY: stackOffset }],
                  opacity: isVisible ? 1 : 0,
                  zIndex: 99999 - index,
                },
              ]}
            >
              <CustomToastView toast={toast} onDismiss={handleDismiss} />
            </View>
          )
        })}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    elevation: 99999,
  },
  toastWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
})

// HOC to wrap app with toast container
export function withToastContainer<P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P> {
  return (props: P) => (
    <ToastContainer>
      <Component {...props} />
    </ToastContainer>
  )
}
