import {REQUEST_SCROLL_LIKE_AND_RT_TARGET, RESPONSE_SCROLL_LIKE_AND_RT_TARGET} from "../utils";
import {wait} from "../utils/common.ts";

export function registerScrollLikeAndRtTarget() {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === REQUEST_SCROLL_LIKE_AND_RT_TARGET) {
      scrollLikeAndRtTarget(message)
      .then(response => sendResponse(response))
      .catch(error => {
        console.error(error);
        sendResponse({ type: RESPONSE_SCROLL_LIKE_AND_RT_TARGET, completed: false });
      });
      return true;
    }
    return false;
  });
}


async function scrollLikeAndRtTarget(message: { type: string; targetUrl: string }) {
  const response = { type: RESPONSE_SCROLL_LIKE_AND_RT_TARGET, completed: false };

  if (window.location.href !== message.targetUrl) {
    console.warn(`URL mismatch. Expected: ${message.targetUrl}, Found: ${window.location.href}`);
    return response;
  }

  const errorMessage = document.body.textContent?.includes('Something went wrong. Try reloading.');
  if (errorMessage) {
    console.warn('Error detected — delaying...');
    await wait(1000 * 120);
    return response;
  }

  let idleCount = 0;
  let lastCount = 0;

  while (idleCount < 8) {
    const tweets = Array.from(document.querySelectorAll("article[data-testid='tweet']")) as HTMLElement[];

    for (const tweet of tweets) {
      const likeBtn = tweet.querySelector("button[data-testid='like']") as HTMLElement | null;
      const rtBtn = tweet.querySelector("button[data-testid='retweet']") as HTMLElement | null;

      if (likeBtn) {
        likeBtn.click();
        await wait(300);
      }

      if (rtBtn) {
        rtBtn.click();
        await wait(500);

        const repostBtn = Array.from(document.querySelectorAll("div[role='menuitem']"))
        .find(el => el.textContent?.trim().toLowerCase() === "repost") as HTMLElement | undefined;

        if (repostBtn) {
          repostBtn.click();
          await wait(600);
        }
      }

      tweet.scrollIntoView({ behavior: "smooth", block: "center" });
      await wait(600);
    }

    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    await wait(2000);

    if (tweets.length === lastCount) {
      idleCount++;
    } else {
      idleCount = 0;
      lastCount = tweets.length;
    }
  }

  response.completed = true;
  console.log("✅ Finished Like + RT scroll.");
  return response;
}
