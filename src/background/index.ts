// background/index.ts (or your existing background file)

console.log("background extension installed and is compiled and empty");

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "open-controller",
    title: "Open Controller",
    contexts: ["action"], // shows when right-clicking the extension icon
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "open-controller") {
    chrome.tabs.create({ url: chrome.runtime.getURL("controller.html") });
  }
});

/* ---------------- RW capture handler ---------------- */

type CaptureRect = { x: number; y: number; w: number; h: number };
type CaptureMsg = { type: "RW_CAPTURE_VISIBLE_TAB_AND_CROP"; rect: CaptureRect; dpr: number };

function isCaptureMsg(m: unknown): m is CaptureMsg {
  if (!m || typeof m !== "object") return false;
  const x = m as Record<string, unknown>;
  if (x.type !== "RW_CAPTURE_VISIBLE_TAB_AND_CROP") return false;
  const r = x.rect as Record<string, unknown> | undefined;
  return (
    !!r &&
    typeof r.x === "number" &&
    typeof r.y === "number" &&
    typeof r.w === "number" &&
    typeof r.h === "number" &&
    typeof x.dpr === "number"
  );
}

function errStr(e: unknown): string {
  if (!e) return "unknown error";
  if (typeof e === "string") return e;
  const anyE = e as { message?: string; toString?: () => string };
  return anyE.message || anyE.toString?.() || "unknown error";
}

chrome.runtime.onMessage.addListener((msg: unknown, sender, sendResponse) => {
  if (!isCaptureMsg(msg)) return;

  console.log("[rw-bg] capture request", msg, "from tab", sender.tab?.id, "win", sender.tab?.windowId);

  (async () => {
    try {
      const tabId = typeof sender.tab?.id === "number" ? sender.tab.id : null;
      const winId = typeof sender.tab?.windowId === "number" ? sender.tab.windowId : null;

      // Zoom factor for correct pixel scaling
      let zoom = 1;
      try {
        if (tabId !== null) {
          zoom = await chrome.tabs.getZoom(tabId);
        }
      } catch (e) {
        console.warn("[rw-bg] getZoom failed; defaulting zoom=1:", errStr(e));
      }

      const options = { format: "png" as const };

      const afterCapture = async (dataUrl?: string) => {
        if (chrome.runtime.lastError) {
          const err = chrome.runtime.lastError.message || "captureVisibleTab failed";
          console.warn("[rw-bg]", err);
          sendResponse({ ok: false, err });
          return;
        }
        if (!dataUrl) {
          const err = "empty dataUrl";
          console.warn("[rw-bg]", err);
          sendResponse({ ok: false, err });
          return;
        }

        try {
          const { rect, dpr } = msg;
          const scale = Math.max(0.1, (dpr || 1) * (zoom || 1));

          const sx = Math.max(0, Math.round(rect.x * scale));
          const sy = Math.max(0, Math.round(rect.y * scale));
          const sw = Math.max(1, Math.round(rect.w * scale));
          const sh = Math.max(1, Math.round(rect.h * scale));

          console.log("[rw-bg] crop params", { scale, sx, sy, sw, sh });

          const out = await cropDataUrl(dataUrl, sx, sy, sw, sh);
          console.log("[rw-bg] crop done, bytes:", out.length);
          sendResponse({ ok: true, dataUrl: out });
        } catch (e) {
          const err = errStr(e);
          console.error("[rw-bg] crop error", err);
          sendResponse({ ok: false, err });
        }
      };

      // Use correct overload; never pass undefined as first arg
      if (typeof winId === "number") {
        chrome.tabs.captureVisibleTab(winId, options, afterCapture);
      } else {
        chrome.tabs.captureVisibleTab(options, afterCapture);
      }
    } catch (e) {
      const err = errStr(e);
      console.error("[rw-bg] unexpected error", err);
      sendResponse({ ok: false, err });
    }
  })();

  return true; // keep sendResponse alive (async)
});

/* ---------------- helpers ---------------- */

async function cropDataUrl(
  dataUrl: string,
  sx: number,
  sy: number,
  sw: number,
  sh: number
): Promise<string> {
  // Decode the data URL to a Blob, then to an ImageBitmap
  const blob = await (await fetch(dataUrl)).blob();
  const bitmap = await createImageBitmap(blob);

  // Clamp crop rect within bitmap bounds
  const cw = Math.max(1, Math.min(sw, bitmap.width - sx));
  const ch = Math.max(1, Math.min(sh, bitmap.height - sy));

  const canvas = new OffscreenCanvas(cw, ch);
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.drawImage(bitmap, sx, sy, cw, ch, 0, 0, cw, ch);
  const outBlob = await canvas.convertToBlob({ type: "image/png" });
  return blobToDataURL(outBlob);
}

async function blobToDataURL(blob: Blob): Promise<string> {
  // No FileReader (keeps worker-friendly + avoids DOM lib types)
  const buf = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < buf.length; i += chunk) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(buf.subarray(i, i + chunk)) as unknown as number[]
    );
  }
  const b64 = btoa(binary);
  return `data:${blob.type || "application/octet-stream"};base64,${b64}`;
}
