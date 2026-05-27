import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress benign HMR WebSocket browser errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && (
      (event.reason.message && event.reason.message.includes('WebSocket')) ||
      (event.reason.message && event.reason.message.includes('websocket')) ||
      (typeof event.reason === 'string' && event.reason.includes('WebSocket')) ||
      (typeof event.reason === 'string' && event.reason.includes('websocket'))
    )) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    if (event.message && (event.message.includes('WebSocket') || event.message.includes('websocket') || event.message.includes('Websocket'))) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
