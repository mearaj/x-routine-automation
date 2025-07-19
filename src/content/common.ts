export const waitForElement = (selector: string, timeoutInMs = 10000): Promise<HTMLElement | null> => {
  return new Promise((resolve) => {

    const el = document.querySelector(selector) as HTMLElement | null;
    if (el) {
      resolve(el);
    }

    let resolved = false;
    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el && el.isConnected && !resolved) {
        resolved = true;
        observer.disconnect();
        clearTimeout(timeout);
        resolve(el as HTMLElement);
      }
    });

    observer.observe(document.body, {childList: true, subtree: true});

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

export function getCurrentUsernameFromUrl(): string | null {
  const match = window.location.pathname.match(/^\/([a-zA-Z0-9_]+)/);
  return match ? match[1] : null;
}

export function extractUsernameFromUrl(url: string) {
  try {
    const u = new URL(url);
    const pathSegments = u.pathname.split("/").filter(Boolean);
    return pathSegments[0] || null;
  } catch (e) {
    console.warn("Error extracting username from url", url, e);
    return null;
  }
}
