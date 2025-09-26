export const waitForElement = (
  selector: string,
  timeoutInMs = 10000,
  parent: ParentNode = document
): Promise<HTMLElement | null> => {
  return new Promise((resolve) => {

    const el = parent.querySelector(selector) as HTMLElement | null;
    if (el) {
      resolve(el);
      return;
    }

    let resolved = false;
    const observer = new MutationObserver(() => {
      const el = parent.querySelector(selector);
      if (el && el.isConnected && !resolved) {
        resolved = true;
        observer.disconnect();
        clearTimeout(timeout);
        resolve(el as HTMLElement);
      }
    });

    const observeTarget: Node = (parent instanceof Document) ? (parent.body ?? parent) : (parent as Node);
    observer.observe(observeTarget, {childList: true, subtree: true});

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        observer.disconnect();
        resolve(null);
      }
    }, timeoutInMs);
  });
};


export const waitForNewElement = (selector: string, timeoutInMs = 10000): Promise<HTMLElement | null> => {
  return new Promise((resolve) => {
    const seen = new Set<HTMLElement>(); // Track elements seen before

    // Pre-fill with existing elements so we ignore them
    document.querySelectorAll<HTMLElement>(selector).forEach(el => seen.add(el));

    const observer = new MutationObserver(() => {
      const all = document.querySelectorAll<HTMLElement>(selector);
      for (const el of all) {
        if (!seen.has(el)) {
          observer.disconnect();
          clearTimeout(timeout);
          return resolve(el);
        }
      }
    });

    observer.observe(document.body, {childList: true, subtree: true});

    const timeout = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutInMs);
  });
};

export function navigateToRelativeUrl(relativeUrl: string) {
  const currentUrl = window.location.href;

  if (currentUrl !== relativeUrl) {
    history.pushState(null, '', relativeUrl);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
}

// add near top of content/likeAndRt.ts (or import from utils)
export function isCloudflareTurnstilePage(): boolean {
  const bodyText = (document.body?.textContent || "").toLowerCase();

  // 1) iframe served by Cloudflare Turnstile / challenge
  const hasCfIframe = !!document.querySelector(
    'iframe[src*="challenges.cloudflare.com"], iframe[src*="turnstile"]'
  );

  // 2) hidden inputs Turnstile uses
  const hasCfInputs = !!document.querySelector(
    'input[name="cf-turnstile-response"], input[id^="cf-chl-widget"], input[name="cf_challenge_response"]'
  );

  // 3) Turnstile / challenge scripts
  const hasCfScripts = !!document.querySelector(
    'script[src*="turnstile"], script[src*="challenge-platform"], script[src*="cdn-cgi/challenge-platform"]'
  );

  // 4) Common visible texts used on challenge pages
  const hasBannerText =
    bodyText.includes("verify you are human") ||
    bodyText.includes("just a moment") ||
    bodyText.includes("verify you are human") ||
    /ray id:/.test(bodyText) ||
    bodyText.includes("needs to review the security of your connection");

  return hasCfIframe || hasCfInputs || hasCfScripts || hasBannerText;
}
