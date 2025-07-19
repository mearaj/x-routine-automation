export async function openOrFocusControllerTab(): Promise<chrome.tabs.Tab> {
  const controllerUrl = chrome.runtime.getURL("controller.html");

  const [existingTab] = await chrome.tabs.query({
    url: controllerUrl
  });

  if (existingTab) {
    await chrome.tabs.update(existingTab.id!, { active: true });
    return existingTab;
  }

  return  await chrome.tabs.create({ url: controllerUrl });
}

export function checkIfTabExists(tabId: number): Promise<chrome.tabs.Tab | null> {
  return new Promise((resolve) => {
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        // Tab does not exist (was likely closed)
        resolve(null);
      } else {
        // Optionally, check if tab is interactable
        if (tab.status === 'complete' && !tab.discarded) {
          resolve(tab);
        } else {
          resolve(null); // Open but not ready/interactable
        }
      }
    });
  });
}

export function sendMessageToTab<M, R>(tabId: number, message: M): Promise<R> {
  return chrome.tabs.sendMessage(tabId, message);
}
export function updateTab(tabId: number, updateProperties: chrome.tabs.UpdateProperties): Promise<chrome.tabs.Tab | undefined> {
  return chrome.tabs.update(tabId, updateProperties);
}

export function removeTab(tabId: number): Promise<void> {
  return chrome.tabs.remove(tabId);
}
