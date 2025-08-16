// content/rwScreenshot.ts
import {
  PING_REQUEST,
  PONG_RESPONSE,
  REQUEST_RADIO_WATER_MELON_SCREENSHOT,
  RESPONSE_RADIO_WATER_MELON_SCREENSHOT
} from "../utils";
import type { ControllerToRwScreenshotRequest, RwScreenshotToControllerResponse } from "@/utils/automatedTasks.ts";

export function registerRwScreenshot() {
  chrome.runtime.onMessage.addListener((message: ControllerToRwScreenshotRequest, _sender, sendResponse) => {
    if (message.type === REQUEST_RADIO_WATER_MELON_SCREENSHOT) {
      replyWithRwScreenshot(message, sendResponse);
      return true; // async
    }
    if (message.type === PING_REQUEST) {
      sendResponse({ type: PONG_RESPONSE });
      return true;
    }
    return false;
  });
}

async function replyWithRwScreenshot(
  message: ControllerToRwScreenshotRequest,
  sendResponse: (response: RwScreenshotToControllerResponse) => void
): Promise<void> {
  const response: RwScreenshotToControllerResponse = {
    type: RESPONSE_RADIO_WATER_MELON_SCREENSHOT,
    screenshot: ""
  };

  if (location.href !== message.url) {
    console.warn("[rw] URL mismatch:", { expected: message.url, current: location.href });
    sendResponse(response);
    return;
  }

  try {
    // wait for the element
    const certEl = await waitForSelector(".about-container", 10000);
    const noDataEl = document.querySelector(".at-noData");

    if (!certEl && noDataEl) {
      console.log("[rw] No data UI detected, nothing to capture.");
      sendResponse(response);
      return;
    }
    if (!certEl) {
      console.warn("[rw] Certificate element not found in time.");
      sendResponse(response);
      return;
    }

    (certEl as HTMLElement).scrollIntoView({ block: "center" });
    await delay(600);

    const r = (certEl as HTMLElement).getBoundingClientRect();
    const rect = {
      x: Math.max(0, Math.round(r.x)),
      y: Math.max(0, Math.round(r.y)),
      w: Math.max(1, Math.round(r.width)),
      h: Math.max(1, Math.round(r.height)),
    };
    const dpr = window.devicePixelRatio || 1;

    console.log("[rw] asking bg to capture + crop", { rect, dpr });

    // ask background to capture & crop (bypasses canvas taint)
    chrome.runtime.sendMessage(
      { type: "RW_CAPTURE_VISIBLE_TAB_AND_CROP", rect, dpr },
      (reply: { ok: boolean; dataUrl?: string } | undefined) => {
        if (chrome.runtime.lastError) {
          console.warn("[rw] bg lastError:", chrome.runtime.lastError.message);
        } else {
          console.log("[rw] bg replied:", reply);
          if (reply?.ok && reply.dataUrl) {
            response.screenshot = reply.dataUrl;
          }
        }
        console.log("[rw] Sending response:", response);
        // keep your intentional long wait for log inspection
        (async () => {
          sendResponse(response);
        })();
      }
    );
  } catch (err) {
    console.error("[rw] capture error:", err);
    console.log("[rw] Sending response (error path):", response);
    sendResponse(response);
  }
}

function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function waitForSelector(selector: string, timeoutMs = 10000): Promise<Element | null> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const el = document.querySelector(selector);
    if (el) return el;
    await delay(250);
  }
  return null;
}
