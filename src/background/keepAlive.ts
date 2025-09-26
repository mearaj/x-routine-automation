// src/background/keepAlive.ts

import {REQUEST_KEEP_BACKGROUND_ALIVE, RESPONSE_KEEP_BACKGROUND_ALIVE} from "../utils";

export function registerKeepAliveBackground() {
  chrome.runtime.onMessage.addListener((message: { type: string, ts: number }, _, sendResponse) => {
    if (message.type === REQUEST_KEEP_BACKGROUND_ALIVE) {
      sendResponse({type: RESPONSE_KEEP_BACKGROUND_ALIVE, ts: message.ts});
    }
    return false;
  });
}
