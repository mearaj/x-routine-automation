// content/likeAndRt.ts

import {PING_REQUEST, PONG_RESPONSE, REQUEST_REPLY_WITH_URL, RESPONSE_REPLY_WITH_URL} from "../utils";
import {wait} from "../utils/common.ts";
import {waitForElement} from "../content/common.ts";
import type {ControllerToReplyWithURLRequest, ReplyWithURLToControllerResponse} from "../utils/automatedTasks.ts";

export function registerReplyWithURL() {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === REQUEST_REPLY_WITH_URL) {
      replyWithURL(message, sendResponse);
      return true;
    }
    if (message.type === PING_REQUEST) {
      sendResponse({type: PONG_RESPONSE});
      return true
    }
    return false;
  });
}

async function replyWithURL(message: ControllerToReplyWithURLRequest, sendResponse: (response: ReplyWithURLToControllerResponse) => void): Promise<void> {
  const response: ReplyWithURLToControllerResponse = {
    type: RESPONSE_REPLY_WITH_URL,
    sourceURL: message.sourceURL,
    targetURL: message.targetURL,
    timestamp: message.timestamp
  };
  const currentUrl = window.location.href;
  if (currentUrl !== message.targetURL) {
    console.warn(`Url mismatch, provided target url is ${message.targetURL}, current is ${currentUrl}`);
    sendResponse(response);
    return;
  }
  if (!location.href.startsWith("https://x.com")) {
    console.warn("Invalid current location", location.href);
    sendResponse(response);
    return;
  }

  if (!message.sourceURL) {
    console.warn(`No sourceURL found for ${message.sourceURL}`);
    sendResponse(response);
    return;
  }
  if (!message.sourceURL.startsWith('https://x.com')) {
    sendResponse(response);
    return;
  }

  const errorMessage = document.body.textContent?.includes(
    'Something went wrong. Try reloading.'
  );

  if (errorMessage) {
    console.warn('Error detected — delaying...');
    await wait(1000 * 120);
    sendResponse(response);
    return;
  }

  const tweet = await waitForElement("article[data-testid='tweet']");
  if (!tweet) {
    console.warn(`Tweet not found`);
    sendResponse(response);
    return;
  }

  const replyBox = await waitForElement('div[data-testid="tweetTextarea_0"]');

  if (!replyBox) {
    console.warn("❌ Reply input not found.");
    sendResponse(response);
    return;
  }

  const innerSpan = replyBox.querySelector('span[data-text="true"]');
  if (innerSpan) {
    innerSpan.textContent = '';
    replyBox.dispatchEvent(new InputEvent('input', {bubbles: true}));
  }
  await wait(700);

  const box = replyBox.getBoundingClientRect();
  window.scrollTo({top: box.top + window.scrollY - 100, behavior: 'smooth'});
  replyBox.click();
  await wait(500);
  const data = new DataTransfer();
  data.setData("text/plain", message.sourceURL);
  const pasteEvent = new ClipboardEvent("paste", {
    clipboardData: data,
    bubbles: true,
    cancelable: true
  });
  replyBox.dispatchEvent(pasteEvent);
  response.timestamp = Date.now();
  await wait(1500);
  const postReplyBtn = document.querySelector('button[data-testid="tweetButtonInline"]:not([disabled])') as HTMLElement | null;
  if (postReplyBtn) {
    postReplyBtn.scrollIntoView({behavior: "smooth", block: "center"});
    await wait(500);
    postReplyBtn.click();
  } else {
    console.warn("❌ Reply post button not found or disabled.");
  }
  await wait(2000);
  const newReplyBox = await waitForElement('div[data-testid="tweetTextarea_0"]');
  if (newReplyBox) {
    const innerSpan = replyBox.querySelector('span[data-text="true"]');
    if (innerSpan) {
      innerSpan.textContent = '';
      replyBox.dispatchEvent(new InputEvent('input', {bubbles: true}));
    }
    await wait(500);
    console.log("🧹 Cleared reply input box.");
  }
  sendResponse(response);
}
