// src/background/index.ts
import './rwCapture';                  // KEEP this — preserves existing runtime behavior
import store from '../store/store';   // the real (background) Redux store
import { createWrapStore } from 'webext-redux';

// createWrapStore must be called at top-level in the service worker/global scope
// so it survives service-worker restarts and registers the port/listeners.
const wrapStore = createWrapStore();
wrapStore(store);

console.log('webext-redux: background store wrapped');
