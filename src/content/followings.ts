import {
  REQUEST_START_SCRAPE_FOLLOWINGS,
  REQUEST_STOP_SCRAPE_FOLLOWINGS,
  RESPONSE_START_SCRAPE_FOLLOWINGS
} from "../utils";
import type {Following} from "../utils/following.ts";
import {wait} from "../utils/common.ts";
import type {ControllerToFollowingRequest, FollowingToControllerResponse} from "../utils/automatedTasks.ts";

let shouldStop = false;

export function registerFollowingScraper() {
  chrome.runtime.onMessage.addListener((message: ControllerToFollowingRequest, _, sendResponse) => {
    if (message.type === REQUEST_START_SCRAPE_FOLLOWINGS && message.activeUsername) {
      shouldStop = false; // ✅ Reset before starting
      scrapeFollowings(message, sendResponse);
      return true;
    }
    if (message.type === REQUEST_STOP_SCRAPE_FOLLOWINGS) {
      shouldStop = true;
      return true;
    }
    return false;
  });
}

async function scrapeFollowings(
  message: ControllerToFollowingRequest,
  sendResponse: (response: FollowingToControllerResponse) => void
): Promise<void> {
  const seen = new Set<string>(message.followings.map(e => e.username));
  const results: Following[] = [...message.followings];

  const waitForInitialLoad = (): Promise<void> => {
    return new Promise((resolve) => {
      const check = () => {
        const items = document.querySelectorAll('[data-testid="UserCell"]');
        if (items.length > 0) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
    });
  };

  const scrollAndCollect = async () => {
    let lastCount = 0;
    let idleTries = 0;
    const maxIdle = 10;

    while (idleTries < maxIdle) {
      if (shouldStop) {
        console.log("🛑 Scrape stopped by external message.");
        break;
      }

      const users = document.querySelectorAll('button[data-testid="UserCell"]');

      users.forEach((user) => {
        let username: string | null = null;

        const spans = user.querySelectorAll('span');
        spans.forEach((span) => {
          const text = span.textContent?.trim();
          if (text?.startsWith('@')) {
            username = text.slice(1);
          }
        });

        const isFollower = !!user.querySelector('[data-testid="userFollowIndicator"]');
        if (!username) return;

        if (seen.has(username)) {
          const existing = results.find(u => u.username === username);
          if (existing) {
            existing.mutual = isFollower;
          }
          return; // ✅ Prevent duplicate
        }

        seen.add(username);
        const newEntry = {username, mutual: isFollower, timestamp: 0};
        results.push(newEntry);
      });

      if (users.length === lastCount) {
        idleTries++;
      } else {
        idleTries = 0;
        lastCount = users.length;
      }

      window.scrollBy({top: window.innerHeight, behavior: 'smooth'});
      await wait(1000);
    }
  };

  try {
    await waitForInitialLoad();
    await scrollAndCollect();
    sendResponse({
      type: RESPONSE_START_SCRAPE_FOLLOWINGS,
      followings: results,
      activeUsername: message.activeUsername,
      error: undefined
    });
    console.log(`✅ Saved ${results.length} followings for @${message.activeUsername}`);
  } catch (error) {
    console.error(error);
    sendResponse({
      type: RESPONSE_START_SCRAPE_FOLLOWINGS,
      followings: results,
      activeUsername: message.activeUsername,
      error: error?.toString() ?? "Error occurred",
    });
  }
}
