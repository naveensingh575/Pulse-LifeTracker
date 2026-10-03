import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Auto-bust stale service worker and browser caches on new deployments (critical for mobile Safari/Chrome)
try {
  const currentBuild = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : '';
  const cachedBuild = localStorage.getItem('pulse_build_version');
  if (currentBuild && cachedBuild && cachedBuild !== currentBuild) {
    console.log('[PULSE] New build detected — cleaning outdated caches…');
    if (typeof caches !== 'undefined') {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
  }
  if (currentBuild) {
    localStorage.setItem('pulse_build_version', currentBuild);
  }
} catch (e) {
  console.warn('[PULSE] Cache bust check skipped:', e);
}

// Register service worker with immediate lifecycle update for mobile & desktop
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
