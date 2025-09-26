import { useEffect, useRef } from 'react';

export const REQUEST_KEEP_BACKGROUND_ALIVE = "REQUEST_KEEP_BACKGROUND_ALIVE";
export const RESPONSE_KEEP_BACKGROUND_ALIVE = "RESPONSE_KEEP_BACKGROUND_ALIVE";

type Props = {
  intervalMs?: number;
};

function KeepBackgroundAliveProvider({ intervalMs = 15000 }: Props) {
  const mountedRef = useRef(true);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    const sendPing = () => {
      try {
        console.log("sending keep alive ping to background");
        chrome.runtime.sendMessage(
          { type: REQUEST_KEEP_BACKGROUND_ALIVE, ts: Date.now() },
          (resp) => {
            console.log("keep alive ping response:", resp);
            if (chrome.runtime.lastError) {
              return;
            }
            if (!mountedRef.current) return;
            timerRef.current = window.setTimeout(sendPing, intervalMs);
          }
        );
      } catch (e) {
        console.error("Error sending keep alive ping to background:", e);
      }
    };
    sendPing();
    return () => {
      mountedRef.current = false;
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [intervalMs]);

  return null;
}

export default KeepBackgroundAliveProvider;
