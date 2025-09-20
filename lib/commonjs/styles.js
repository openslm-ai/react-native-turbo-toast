"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectStyles = injectStyles;
function injectStyles() {
  if (typeof document === 'undefined') return;
  const styleId = 'turbo-toast-styles';
  if (document.getElementById(styleId)) return;
  const styles = `
    .turbo-toast {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .turbo-toast-content {
      flex: 1;
      word-wrap: break-word;
      word-break: break-word;
    }

    .turbo-toast-icon {
      font-size: 18px;
      line-height: 1;
      flex-shrink: 0;
    }

    .turbo-toast-actions {
      display: flex;
      gap: 8px;
      margin-left: 12px;
      flex-shrink: 0;
    }

    .turbo-toast-action {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: inherit;
      padding: 4px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 200ms ease;
      white-space: nowrap;
    }

    .turbo-toast-action:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .turbo-toast-action:active {
      transform: scale(0.95);
    }

    .turbo-toast-action-cancel {
      opacity: 0.8;
    }

    .turbo-toast-action-destructive {
      border-color: rgba(255, 100, 100, 0.5);
      color: #ff6464;
    }

    .turbo-toast-action-destructive:hover {
      background: rgba(255, 100, 100, 0.1);
      border-color: rgba(255, 100, 100, 0.7);
    }

    @media (prefers-reduced-motion: reduce) {
      .turbo-toast {
        transition: none !important;
      }
    }

    @media (max-width: 480px) {
      .turbo-toast {
        width: calc(100vw - 32px);
        max-width: none;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .turbo-toast[data-type="default"] {
        background-color: #1a1a1a !important;
        color: #e0e0e0 !important;
      }
    }
  `;
  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
//# sourceMappingURL=styles.js.map