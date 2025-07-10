import { RESPONSE_LIKE_AND_RT } from "../utils";
import { wait } from "../utils/common";
import type { Following } from "../utils/following";

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

    observer.observe(document.body, { childList: true, subtree: true });

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

    observer.observe(document.body, { childList: true, subtree: true });

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

export async function navigateToPinnedPostAndReply(following: Following,isGaza:boolean): Promise<{ type: string, following: Following }> {
  //navigateToRelativeUrl(following.pinnedUrl!);
  const response = {type: RESPONSE_LIKE_AND_RT, following};
  const tweet = await waitForNewElement("article[data-testid='tweet']");
  if (!tweet) {
    console.warn(`Tweet not found`);
    return response;
  }
  const errorMessage = document.body.textContent?.includes(
    'Something went wrong. Try reloading.'
  );

  if (errorMessage) {
    console.warn('Error detected — delaying...');
    await wait(1000 * 120);
    return response;
  }

  //following.doneVisiting = true;

  const like = tweet.querySelector("button[data-testid='like']") as HTMLElement | null;
  const retweet = tweet.querySelector("button[data-testid='retweet']") as HTMLElement | null;
  if (like) {
    like.click();
    await wait(200);
  }
  if (retweet) {
    retweet.click();
    await wait(1000);
  }


  const repostMenuItem = Array.from(document.querySelectorAll("div[role='menuitem']"))
  .find(el => el.textContent?.trim().toLowerCase() === "repost") as HTMLElement | undefined;

  if (repostMenuItem) {
    repostMenuItem.click();
    await wait(1500);
  }

  let text = "حَسْبُنَا اللَّهُ وَنِعْمَ الوَكِيلُ\n" +
    "❤️ 💔 🤲 🇵🇸";
  let imageText = "Save Gaza";
  if (!isGaza) {
    text = "حَسْبُنَا اللَّهُ وَنِعْمَ الوَكِيلُ";
    imageText = "together we will rebuild";
  }

  // Wait for reply input to appear
  const replyBox = document.querySelector('div[data-testid="tweetTextarea_0"]') as HTMLElement | null;

  if (!replyBox) {
    console.warn("❌ Reply input not found.");
    return response;
  }

// Click to focus the reply box
  const box = replyBox.getBoundingClientRect();
  window.scrollTo({top: box.top + window.scrollY - 100, behavior: 'smooth'});
  replyBox.click();
  await wait(1000);

// Paste reply text
  let data = new DataTransfer();
  data.setData("text/plain", text);
  let pasteEvent = new ClipboardEvent("paste", {
    clipboardData: data,
    bubbles: true,
    cancelable: true
  });
  replyBox.dispatchEvent(pasteEvent);

  await wait(1500);

// Click GIF button
  const gifBtn = document.querySelector('button[data-testid="gifSearchButton"]') as HTMLElement | null;
  if (gifBtn) {
    gifBtn.click();
    await wait(2000);
  }

// Type in GIF search
  const gifInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement | null;
  if (gifInput) {
    gifInput.focus();
    gifInput.setRangeText('', 0, gifInput.value.length, 'end');
    gifInput.setRangeText(imageText, 0, 0, 'end');
    gifInput.dispatchEvent(new InputEvent('input', {bubbles: true}));
    await wait(4000);
  }

// Click the first visible GIF
  const gifButtons = Array.from(document.querySelectorAll('button'))
  .filter(btn => btn.querySelector('[data-testid="gifSearchGifImage"]')) as HTMLElement[];

  for (const btn of gifButtons) {
    const visible = btn.offsetParent !== null;
    if (visible) {
      btn.scrollIntoView({block: 'center'});
      await wait(300);
      btn.click();
      await wait(2000);
      break;
    }
  }

// Click reply button
  const postReplyBtn = document.querySelector('button[data-testid="tweetButtonInline"]:not([disabled])') as HTMLElement | null;
  if (postReplyBtn) {
    postReplyBtn.click();
    await wait(6000);
    console.log("✅ Replied with text and GIF.");
  } else {
    console.warn("❌ Reply post button not found or disabled.");
  }


  if (retweet) {
    retweet.click();
    await wait(500);
  } else {
    const unretweet = tweet.querySelector("button[data-testid='unretweet']") as HTMLElement | null;
    if (unretweet) {
      unretweet.click();
      await wait(500);
    }
  }

  const quoteMenuItem = Array.from(document.querySelectorAll("a[role='menuitem']"))
  .find(el => el.textContent?.trim().toLowerCase() === "quote") as HTMLElement | undefined;

  if (!quoteMenuItem) {
    console.warn("❌ Quote menu item not found.");
    return response;
  }

  // Click the "Quote" menu item
  quoteMenuItem.click();

  // Wait for the editor to appear
  await wait(3000);
  const editor = document.querySelector('div.public-DraftEditor-content[contenteditable="true"]') as HTMLElement | null;
  if (!editor) {
    console.warn("❌ Quote editor not found.");
    return response;
  }

  // Focus and paste full text
  const fullText = `👇👇👇👇👇`;
  editor.focus();

  data = new DataTransfer();
  data.setData("text/plain", fullText);
  pasteEvent = new ClipboardEvent("paste", {
    clipboardData: data,
    bubbles: true,
    cancelable: true
  });
  editor.dispatchEvent(pasteEvent);

  // Wait for text to register and button to enable
  await wait(3000);
  const postBtn = document.querySelector('button[data-testid="tweetButton"]:not([disabled])') as HTMLElement | null;
  if (postBtn) {
    postBtn.click();
    await wait(1000);
    console.log("✅ Quote tweet posted.");
  } else {
    console.warn("❌ Post button not found or still disabled.");
  }

  await wait(2000);
  return response;
}
