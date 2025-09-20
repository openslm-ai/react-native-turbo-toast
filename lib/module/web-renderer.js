"use strict";

export class WebRenderer {
  static COLORS = {
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    default: '#333'
  };
  static ICONS = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ⓘ',
    default: ''
  };
  render(toast, onDismiss) {
    const toastEl = this.createElement(toast);
    this.applyStyles(toastEl, toast);
    this.addEventHandlers(toastEl, toast, onDismiss);
    this.addActions(toastEl, toast, onDismiss);
    document.body.appendChild(toastEl);
    this.animateIn(toastEl, toast);
    return toastEl;
  }
  remove(id, animationDuration = 300) {
    return new Promise(resolve => {
      const toastEl = document.getElementById(id);
      if (!toastEl) {
        resolve();
        return;
      }
      const toast = toastEl.dataset.toast ? JSON.parse(toastEl.dataset.toast) : {};
      this.animateOut(toastEl, toast.position);
      setTimeout(() => {
        if (toastEl.parentNode) {
          document.body.removeChild(toastEl);
        }
        resolve();
      }, animationDuration);
    });
  }
  createElement(toast) {
    const toastEl = document.createElement('div');
    toastEl.id = toast.id;
    toastEl.className = 'turbo-toast';
    toastEl.dataset.toast = JSON.stringify({
      position: toast.position
    });
    const content = document.createElement('div');
    content.className = 'turbo-toast-content';
    content.textContent = toast.message;
    if (toast.icon) {
      const icon = document.createElement('span');
      icon.className = 'turbo-toast-icon';
      icon.textContent = WebRenderer.ICONS[toast.type || 'default'];
      toastEl.prepend(icon);
    }
    toastEl.appendChild(content);
    return toastEl;
  }
  applyStyles(element, toast) {
    const baseStyles = {
      position: 'fixed',
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
      cursor: toast.dismissOnPress ? 'pointer' : 'default'
    };
    Object.assign(element.style, baseStyles, this.getPositionStyles(toast.position));
  }
  addEventHandlers(element, toast, onDismiss) {
    if (toast.dismissOnPress) {
      element.onclick = () => {
        if (toast.onPress) toast.onPress();
        onDismiss(toast.id);
      };
    }
    if (toast.swipeToDismiss) {
      this.addSwipeHandler(element, toast, onDismiss);
    }
  }
  addActions(element, toast, onDismiss) {
    if (!toast.action && !toast.actions) return;
    const actions = toast.actions || (toast.action ? [toast.action] : []);
    const actionsEl = document.createElement('div');
    actionsEl.className = 'turbo-toast-actions';
    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.textContent = action.text;
      btn.className = `turbo-toast-action turbo-toast-action-${action.style || 'default'}`;
      btn.onclick = () => {
        action.onPress();
        onDismiss(toast.id);
      };
      actionsEl.appendChild(btn);
    });
    element.appendChild(actionsEl);
  }
  animateIn(element, _toast) {
    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = 'translate(-50%, 0)';
    });
  }
  animateOut(element, position) {
    element.style.opacity = '0';
    element.style.transform = this.getInitialTransform(position);
  }
  getPositionStyles(position) {
    switch (position) {
      case 'top':
        return {
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      case 'center':
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
      default:
        return {
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)'
        };
    }
  }
  getInitialTransform(position) {
    switch (position) {
      case 'top':
        return 'translate(-50%, -100%)';
      case 'center':
        return 'translate(-50%, -50%) scale(0.9)';
      default:
        return 'translate(-50%, 100%)';
    }
  }
  addSwipeHandler(element, toast, onDismiss) {
    let startX = 0;
    let startY = 0;
    let distX = 0;
    let distY = 0;
    const handleStart = e => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const handleMove = e => {
      distX = e.touches[0].clientX - startX;
      distY = e.touches[0].clientY - startY;
      if (Math.abs(distX) > Math.abs(distY)) {
        element.style.transform = `translate(calc(-50% + ${distX}px), 0)`;
        element.style.opacity = String(1 - Math.abs(distX) / 200);
      }
    };
    const handleEnd = () => {
      if (Math.abs(distX) > 100) {
        onDismiss(toast.id);
      } else {
        element.style.transform = 'translate(-50%, 0)';
        element.style.opacity = '1';
      }
    };
    element.addEventListener('touchstart', handleStart, {
      passive: true
    });
    element.addEventListener('touchmove', handleMove, {
      passive: true
    });
    element.addEventListener('touchend', handleEnd, {
      passive: true
    });
  }
}
//# sourceMappingURL=web-renderer.js.map