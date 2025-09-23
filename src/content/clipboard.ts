// src/content/clipboard.ts
// src/content/clipboard.ts
// Clipboard capture without injection or dirty hacks.
// Uses navigator.clipboard.readText() first, then falls back.

import {ON_CLIPBOARD_COPY} from "../utils";

export function registerClipboardCapture(): void {
  // defensive: ensure we only attach once
  if ((window as Window & { __extClipboardRegistered?: boolean }).__extClipboardRegistered) return;
  (window as Window & { __extClipboardRegistered?: boolean }).__extClipboardRegistered = true;

  async function readClipboardViaAPI(): Promise<string> {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.readText === "function") {
        const txt = await navigator.clipboard.readText();
        return (txt ?? "").trim();
      }
    } catch {
      // ignore, fallbacks will run
    }
    return "";
  }

  function extractFromTarget(target: EventTarget | null): string {
    if (!target) return "";
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      return (target.value || "").trim();
    }
    if (target instanceof HTMLElement) {
      return (target.textContent || "").trim();
    }
    return "";
  }

  function getSelectionText(): string {
    const sel = window.getSelection?.()?.toString() ?? "";
    return sel.trim();
  }

  async function onCopy(ev: ClipboardEvent) {
    try {
      // 1) Preferred: Clipboard API
      const apiText = await readClipboardViaAPI();
      if (apiText) {
        console.log("[content/clipboard] clipboard (navigator.clipboard):", apiText);
        if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
         await chrome.runtime.sendMessage({type:ON_CLIPBOARD_COPY,text:apiText});
        } else {
          console.log("[content/clipboard] chrome runtime not found, cannot send message skipping sending of clipboard text");
        }
        return;
      }

      // 2) event.clipboardData
      const fromEvent = ev.clipboardData?.getData("text/plain") ?? "";
      if (fromEvent.trim()) {
        console.log("[content/clipboard] clipboard (event.clipboardData):", fromEvent.trim());
        return;
      }

      // 3) selection
      const sel = getSelectionText();
      if (sel) {
        console.log("[content/clipboard] clipboard (selection):", sel);
        return;
      }

      // 4) target element
      const tgt = extractFromTarget(ev.target);
      if (tgt) {
        console.log("[content/clipboard] clipboard (target fallback):", tgt);
        return;
      }
    } catch (err) {
      console.warn("[content/clipboard] capture failed", err);
    }
  }

  window.addEventListener("copy", onCopy, true);
}
