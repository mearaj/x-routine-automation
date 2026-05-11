// content/rwScreenshot.ts
import {
  PING_REQUEST,
  PONG_RESPONSE,
  REQUEST_RADIO_WATER_MELON_SCREENSHOT,
  RESPONSE_RADIO_WATER_MELON_SCREENSHOT,
  RW_CAPTURE_DONE,
} from "../utils";
import type { ControllerToRwScreenshotRequest, RwScreenshotToControllerResponse } from "../utils/automatedTasks.ts";

function waitForRwCaptureDone(
  captureTraceId: string,
  timeoutMs: number,
  signal: AbortSignal
): Promise<{ ok: true; dataUrl: string } | { ok: false; err: string }> {
  return new Promise((resolve, reject) => {
    function cleanup() {
      clearTimeout(timer);
      chrome.runtime.onMessage.removeListener(onMsg);
      signal.removeEventListener("abort", onAbort);
    }
    function onAbort() {
      cleanup();
      reject(new Error("aborted"));
    }
    function onMsg(
      message: unknown,
      _sender: chrome.runtime.MessageSender,
      _sendResponse: (response?: unknown) => void
    ): boolean {
      if (!message || typeof message !== "object") return false;
      const m = message as Record<string, unknown>;
      if (m.type !== RW_CAPTURE_DONE || m.captureTraceId !== captureTraceId) return false;
      cleanup();
      if (m.ok === true && typeof m.dataUrl === "string") {
        resolve({ ok: true, dataUrl: m.dataUrl });
      } else {
        resolve({ ok: false, err: typeof m.err === "string" ? m.err : "capture failed" });
      }
      return false;
    }
    chrome.runtime.onMessage.addListener(onMsg);
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("RW_CAPTURE_DONE timeout"));
    }, timeoutMs);
    signal.addEventListener("abort", onAbort);
  });
}

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

    const captureTraceId = crypto.randomUUID();
    const extensionId = chrome.runtime.id;
    console.log("[rw] asking bg to capture + crop", { captureTraceId, rect, dpr, extensionId });

    const ac = new AbortController();
    const donePromise = waitForRwCaptureDone(captureTraceId, 120_000, ac.signal);

    type CaptureAck = { accepted: boolean; captureTraceId?: string; extensionId?: string; err?: string };

    let ack: CaptureAck | undefined;
    try {
      ack = await chrome.runtime.sendMessage<
        { type: "RW_CAPTURE_VISIBLE_TAB_AND_CROP"; rect: typeof rect; dpr: number; captureTraceId: string },
        CaptureAck | undefined
      >({ type: "RW_CAPTURE_VISIBLE_TAB_AND_CROP", rect, dpr, captureTraceId });
    } catch (e) {
      console.warn("[rw] capture ack sendMessage failed", captureTraceId, e);
    }

    console.log("[rw] capture ack", captureTraceId, ack);

    if (!ack?.accepted) {
      ac.abort();
      try {
        await donePromise;
      } catch {
        /* wait aborted: expected when capture was not accepted */
      }
    } else {
      try {
        const result = await donePromise;
        if (result.ok && result.dataUrl) {
          response.screenshot = result.dataUrl;
        } else {
          console.warn("[rw] capture done error", captureTraceId, result);
        }
      } catch (e) {
        console.warn("[rw] wait for RW_CAPTURE_DONE failed", captureTraceId, e);
      }
    }
    console.log("[rw] Sending response:", response);
    sendResponse(response);
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
