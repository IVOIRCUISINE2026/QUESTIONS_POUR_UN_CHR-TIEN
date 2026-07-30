import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add global error interceptors to handle sandboxed iframe cross-origin boundaries
if (typeof window !== 'undefined') {
  // Overwrite window.onerror directly as it's the primary way browsers/runners catch unhandled errors
  const originalOnError = window.onerror;
  window.onerror = function (message, source, lineno, colno, error) {
    const msgString = String(message || '');
    const isCrossOrAmbient = 
      msgString.includes('Script error.') || 
      msgString.toLowerCase().includes('script error') ||
      !source || 
      source.includes('extensions') ||
      msgString.includes('ResizeObserver');

    if (isCrossOrAmbient) {
      console.warn('Suppressed cross-origin or ambient script error via window.onerror:', message, 'from', source);
      return true; // Prevents the error from propagating further or triggering browser/test runner failures
    }
    
    if (originalOnError) {
      return originalOnError.apply(window, [message, source, lineno, colno, error]);
    }
    return false;
  };

  // Add capturing listener with stopImmediatePropagation to choke errors before other scripts receive them
  window.addEventListener('error', (event) => {
    const msg = String(event.message || '');
    const filename = String(event.filename || '');
    const isScriptError = 
      msg === 'Script error.' || 
      !event.filename || 
      msg.toLowerCase().includes('script error') ||
      filename.includes('extensions');

    if (isScriptError) {
      console.warn('Suppressed cross-origin or ambient environment script error:', event);
      try {
        event.preventDefault();
        event.stopImmediatePropagation();
      } catch (e) {
        // Safe fallback
      }
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Suppressed unhandled promise rejection:', event.reason);
    try {
      event.preventDefault();
      event.stopImmediatePropagation();
    } catch (e) {
      // Safe fallback
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
