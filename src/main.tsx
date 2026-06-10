import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle and suppress benign cross-origin iframe security errors (e.g. from browser extensions or environment wrappers trying to touch window.parent)
if (typeof window !== "undefined") {
  const isCrossOriginFrameError = (message?: string) => {
    if (!message) return false;
    const msg = message.toLowerCase();
    return (
      msg.includes("blocked a frame") ||
      msg.includes("cross-origin frame") ||
      msg.includes("failed to read a named property") ||
      msg.includes("origin' from 'location") ||
      msg.includes("permission denied to access property") ||
      msg.includes("securityerror")
    );
  };

  const handleGlobalError = (event: ErrorEvent) => {
    const errorMsg = event.message || (event.error && event.error.message);
    if (isCrossOriginFrameError(errorMsg)) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  };

  const handlePromiseRejection = (event: PromiseRejectionEvent) => {
    const reasonMsg = event.reason?.message || (typeof event.reason === "string" ? event.reason : "");
    if (isCrossOriginFrameError(reasonMsg)) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  };

  window.addEventListener("error", handleGlobalError, true);
  window.addEventListener("unhandledrejection", handlePromiseRejection, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

