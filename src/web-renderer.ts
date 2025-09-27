import type { QueuedToast, ToastPosition } from './types'

export class WebRenderer {
  private static readonly COLORS: Record<string, string> = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    default: '#333',
  }

  private static readonly ICONS: Record<string, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ⓘ',
    default: '',
  }

  render(toast: QueuedToast, onDismiss: (id: string) => void): HTMLElement {
    const toastEl = this.createElement(toast)
    this.applyStyles(toastEl, toast)
    this.addEventHandlers(toastEl, toast, onDismiss)
    this.addActions(toastEl, toast, onDismiss)

    document.body.appendChild(toastEl)
    this.animateIn(toastEl, toast)

    return toastEl
  }

  update(id: string, options: Partial<QueuedToast>): void {
    const toastEl = document.getElementById(id)
    if (!toastEl) return

    // Update message if provided
    if (options.message) {
      const content = toastEl.querySelector('.turbo-toast-content')
      if (content) {
        content.textContent = options.message
      }
    }

    // Update progress bar if provided
    if (options.progress !== undefined) {
      const progressBar = toastEl.querySelector('.turbo-toast-progress-bar') as HTMLElement
      if (progressBar) {
        progressBar.style.width = `${options.progress * 100}%`
      }
    }
  }

  remove(id: string, animationDuration = 300): Promise<void> {
    return new Promise((resolve) => {
      const toastEl = document.getElementById(id)
      if (!toastEl) {
        resolve()
        return
      }

      // Clean up event listeners before removal
      this.cleanupEventListeners(toastEl)

      let toast: { position?: ToastPosition } = {}
      try {
        toast = toastEl.dataset.toast ? JSON.parse(toastEl.dataset.toast) : {}
      } catch (_e) {
        // Fallback if JSON parsing fails silently
        // In production, we don't want to log errors
      }

      this.animateOut(toastEl, toast.position)

      setTimeout(() => {
        if (toastEl.parentNode) {
          document.body.removeChild(toastEl)
        }
        resolve()
      }, animationDuration)
    })
  }

  private cleanupEventListeners(element: HTMLElement): void {
    // Clean up swipe handlers
    const handlers = (
      element as HTMLElement & {
        _swipeHandlers?: {
          handleStart: (e: Event) => void
          handleMove: (e: Event) => void
          handleEnd: (e: Event) => void
        }
      }
    )._swipeHandlers
    if (handlers) {
      element.removeEventListener('touchstart', handlers.handleStart)
      element.removeEventListener('touchmove', handlers.handleMove)
      element.removeEventListener('touchend', handlers.handleEnd)
      delete (element as HTMLElement & { _swipeHandlers?: unknown })._swipeHandlers
    }
  }

  private createElement(toast: QueuedToast): HTMLElement {
    const toastEl = document.createElement('div')
    toastEl.id = toast.id
    toastEl.className = 'turbo-toast'

    // Accessibility attributes
    toastEl.setAttribute('role', toast.accessibilityRole || 'alert')
    if (toast.accessibilityLabel) {
      toastEl.setAttribute('aria-label', toast.accessibilityLabel)
    }
    if (toast.accessibilityHint) {
      toastEl.setAttribute('aria-description', toast.accessibilityHint)
    }
    toastEl.setAttribute('aria-live', toast.type === 'error' ? 'assertive' : 'polite')

    if (!toastEl.dataset) {
      // For test environments where dataset might not be available
      Object.defineProperty(toastEl, 'dataset', { value: {}, writable: true })
    }
    toastEl.dataset.toast = JSON.stringify({ position: toast.position })

    const content = document.createElement('div')
    content.className = 'turbo-toast-content'
    content.textContent = toast.message

    if (toast.icon) {
      const icon = document.createElement('span')
      icon.className = 'turbo-toast-icon'
      icon.textContent = WebRenderer.ICONS[toast.type || 'default']
      toastEl.prepend(icon)
    }

    toastEl.appendChild(content)

    // Add progress bar if needed
    if (toast.showProgressBar && toast.progress !== undefined) {
      const progressContainer = document.createElement('div')
      progressContainer.className = 'turbo-toast-progress-container'
      progressContainer.style.cssText =
        'position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: rgba(255,255,255,0.2); overflow: hidden;'

      const progressBar = document.createElement('div')
      progressBar.className = 'turbo-toast-progress-bar'
      progressBar.style.cssText = `width: ${toast.progress * 100}%; height: 100%; background: ${toast.progressColor || '#fff'}; transition: width 0.3s ease;`

      progressContainer.appendChild(progressBar)
      toastEl.appendChild(progressContainer)
    }

    return toastEl
  }

  private applyStyles(element: HTMLElement, toast: QueuedToast): void {
    const baseStyles = {
      position: 'fixed' as const,
      padding: '12px 24px',
      borderRadius: '8px',
      backgroundColor: toast.backgroundColor || WebRenderer.COLORS[toast.type || 'default'],
      color: toast.textColor || '#fff',
      fontSize: '14px',
      zIndex: '99999',
      transition: `all ${toast.animationDuration}ms ease`,
      opacity: '0',
      transform: this.getInitialTransform(toast.position),
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxWidth: '90vw',
      cursor: toast.dismissOnPress ? 'pointer' : 'default',
    }

    Object.assign(element.style, baseStyles, this.getPositionStyles(toast.position))
  }

  private addEventHandlers(
    element: HTMLElement,
    toast: QueuedToast,
    onDismiss: (id: string) => void,
  ): void {
    if (toast.dismissOnPress) {
      element.onclick = () => {
        if (toast.onPress) toast.onPress()
        onDismiss(toast.id)
      }
    }

    if (toast.swipeToDismiss) {
      this.addSwipeHandler(element, toast, onDismiss)
    }
  }

  private addActions(
    element: HTMLElement,
    toast: QueuedToast,
    onDismiss: (id: string) => void,
  ): void {
    if (!toast.action && !toast.actions) return

    const actions = toast.actions || (toast.action ? [toast.action] : [])
    const actionsEl = document.createElement('div')
    actionsEl.className = 'turbo-toast-actions'

    actions.forEach((action) => {
      const btn = document.createElement('button')
      btn.textContent = action.text
      btn.className = `turbo-toast-action turbo-toast-action-${action.style || 'default'}`
      btn.setAttribute('type', 'button')
      btn.setAttribute('aria-label', action.text)
      if (action.style === 'destructive') {
        btn.setAttribute('aria-describedby', 'This action cannot be undone')
      }
      btn.onclick = () => {
        action.onPress()
        onDismiss(toast.id)
      }
      actionsEl.appendChild(btn)
    })

    element.appendChild(actionsEl)
  }

  private animateIn(element: HTMLElement, _toast: QueuedToast): void {
    requestAnimationFrame(() => {
      element.style.opacity = '1'
      element.style.transform = 'translate(-50%, 0)'
    })
  }

  private animateOut(element: HTMLElement, position?: ToastPosition): void {
    element.style.opacity = '0'
    element.style.transform = this.getInitialTransform(position)
  }

  private getPositionStyles(position?: ToastPosition): Partial<CSSStyleDeclaration> {
    switch (position) {
      case 'top':
        return { top: '20px', left: '50%', transform: 'translateX(-50%)' }
      case 'center':
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
      default:
        return { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
    }
  }

  private getInitialTransform(position?: ToastPosition): string {
    switch (position) {
      case 'top':
        return 'translate(-50%, -100%)'
      case 'center':
        return 'translate(-50%, -50%) scale(0.9)'
      default:
        return 'translate(-50%, 100%)'
    }
  }

  private addSwipeHandler(
    element: HTMLElement,
    toast: QueuedToast,
    onDismiss: (id: string) => void,
  ): void {
    let startX = 0
    let startY = 0
    let distX = 0
    let distY = 0

    const handleStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const handleMove = (e: TouchEvent) => {
      distX = e.touches[0].clientX - startX
      distY = e.touches[0].clientY - startY

      if (Math.abs(distX) > Math.abs(distY)) {
        element.style.transform = `translate(calc(-50% + ${distX}px), 0)`
        element.style.opacity = String(1 - Math.abs(distX) / 200)
      }
    }

    const handleEnd = () => {
      if (Math.abs(distX) > 100) {
        onDismiss(toast.id)
      } else {
        element.style.transform = 'translate(-50%, 0)'
        element.style.opacity = '1'
      }
    }

    // Store handlers for cleanup
    ;(
      element as HTMLElement & {
        _swipeHandlers?: {
          handleStart: (e: Event) => void
          handleMove: (e: Event) => void
          handleEnd: (e: Event) => void
        }
      }
    )._swipeHandlers = {
      handleStart: handleStart as (e: Event) => void,
      handleMove: handleMove as (e: Event) => void,
      handleEnd: handleEnd as (e: Event) => void,
    }

    element.addEventListener('touchstart', handleStart, { passive: true })
    element.addEventListener('touchmove', handleMove, { passive: true })
    element.addEventListener('touchend', handleEnd, { passive: true })
  }
}
