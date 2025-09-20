// content/likeAndRt.ts
import {PING_REQUEST, PONG_RESPONSE, REQUEST_LIKE_AND_RT, RESPONSE_LIKE_AND_RT,} from "../utils/keys";
import {extractUsernameFromXUrl, wait} from "../utils/common.ts";
import {waitForElement} from "../content/common.ts";
import type {
  ControllerToLikeAndRtInput,
  ControllerToLikeAndRtRequest,
  LikeAndRtToControllerResponse,
  SourceReplies,
} from "../utils/automatedTasks.ts";

export function registerLikeAndRtProcessor() {
  chrome.runtime.onMessage.addListener((message: ControllerToLikeAndRtRequest, _sender, sendResponse) => {
    if (message.type === REQUEST_LIKE_AND_RT) {
      likeAndRtProcessor(message, sendResponse);
      return true;
    }
    if (message.type === PING_REQUEST) {
      sendResponse({type: PONG_RESPONSE});
      return true
    }
    return false;
  });
}

async function likeAndRtProcessor(message: ControllerToLikeAndRtRequest, sendResponse: (response: LikeAndRtToControllerResponse) => void): Promise<void> {
  let response: LikeAndRtToControllerResponse = {
    type: RESPONSE_LIKE_AND_RT,
    url: message.url,
    timestamp: message.timestamp,
    error: null,
  };
  if (location.href !== message.url) {
    const error = `expected ${message.url} and found ${location.href}`;
    console.error(error);
    response.error = error;
    sendResponse(response);
    return;
  }

  let errorMessage = document.body.textContent?.includes(
    'Something went wrong. Try reloading.'
  );

  if (errorMessage) {
    response.error = "Something went wrong. Try reloading.";
    console.error(response.error);
    await wait(1000 * 120);
    sendResponse(response);
    return;
  }

  errorMessage = document.body.textContent?.toLowerCase().includes(('Verify you are human').toLowerCase());
  if (errorMessage) {
    response.error = 'Verify you are human';
    console.error(response.error);
    sendResponse(response);
    return;
  }
  errorMessage = document.body.textContent?.includes('Caution: This account is temporarily restricted');
  if (errorMessage) {
    console.warn('account is temporarily restricted');
    const viewProfileButton = document.querySelector("button[data-testid='empty_state_button_text']") as HTMLButtonElement | null;
    if (!viewProfileButton) {
      sendResponse(response);
      return;
    }
    viewProfileButton.click();
    await wait(1000 * 2);
  }


  const nav = document.querySelector('nav[aria-label="Profile timelines"]');
  const targetDiv = nav?.closest('div');
  targetDiv?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
  await wait(500);

  const {
    isFundraiser,
    tweet,
    tweetUrl,
    isGaza
  } = getMatchingFundraiserUrl(message.fundraiserURLs, message.fundraiserExcludedURLs, message.verifiedRadioWaterMelonUsers);
  if (!tweet || !tweetUrl || (!isFundraiser && !message.isFundraiser)) {
    response.timestamp = Date.now();
    response.error = "Tweets not found";
    sendResponse(response);
    return;
  }
  console.log("isFundraiser", isFundraiser);
  console.log("tweet", tweet);
  console.log("tweetUrl", tweetUrl);
  console.log("isGaza", isGaza);
  const isReallyGaza = isGaza || !!message.isGaza;
  console.log("isReallyGaza", isReallyGaza);
  console.log("message", message);
  try {
    response.url = tweetUrl;
    response = await likeAndRtPinnedPostOnProfile(response, tweet, isReallyGaza, message.sourceReplies, message.threshold, message.userInput, message.verifiedRadioWaterMelonUsers, message.rwScreenshot);
    console.log("response", response);
  } catch (e) {
    console.error(e);
  }
  sendResponse(response);
}


function getMatchingFundraiserUrl(urlsToMatch: string[], urlsToExclude: string[], verifiedRadioWaterMelonUsers: string[]): {
  tweetUrl: string,
  tweet: HTMLElement | null,
  isFundraiser: boolean,
  isGaza: boolean,
} {
  const tweet = document.querySelector("article[data-testid='tweet']") as HTMLElement | null;
  const tweetLink = tweet?.querySelector("a[role='link'][href*='/status/']:has(time)") as HTMLAnchorElement | null;
  const tweetUrl = tweetLink?.href?.match(/^https:\/\/x\.com\/[^/]+\/status\/\d+/)?.[0] ?? "";


  // If no tweet or tweet URL is found, no point continuing
  if (!tweet || !tweetUrl) return {tweetUrl, tweet, isFundraiser: false, isGaza: false};

  const descriptionText = document.querySelector("div[data-testid='UserDescription']")?.textContent ?? "";
  const userName = document.querySelector("div[data-testid='User-Name']")?.textContent ?? "";
  const userUrlText = document.querySelector("a[data-testid='UserUrl']")?.textContent ?? "";
  const tweetText = tweet.textContent ?? "";
  const tweetAltText = document.querySelector("div[data-testid='tweetText']")?.textContent ?? "";

  const donateRegex = /donat(e|ion)/i;
  const gazaTestRegex = /gaza|palestine|🇵🇸/i;
  const verifiedSet = new Set(verifiedRadioWaterMelonUsers.map(u => u.toLowerCase()));
  const usernameFromTweet = extractUsernameFromXUrl(tweetUrl)?.toLowerCase() ?? "";
  const isVerifiedRM = usernameFromTweet !== "" && verifiedSet.has(usernameFromTweet);

  let matched = false;
  const excluded = urlsToExclude.some((url) => {
    const lowercaseUrl = url.toLowerCase();
    return (
      descriptionText.toLowerCase().includes(lowercaseUrl) ||
      tweetText.toLowerCase().includes(lowercaseUrl) ||
      tweetUrl.toLowerCase().includes(lowercaseUrl) ||
      userUrlText.toLowerCase().includes(lowercaseUrl) ||
      location.href.toLowerCase().startsWith(url.toLowerCase())
    );
  })
  if (!excluded) {
    matched = urlsToMatch.some(url => {
      const truncatedUrl = url.replace("https://", "").toLowerCase();

      return (
        descriptionText.toLowerCase().includes(truncatedUrl) ||
        tweetText.toLowerCase().includes(truncatedUrl) ||
        tweetUrl.toLowerCase().includes(truncatedUrl) ||
        userUrlText.toLowerCase().includes(truncatedUrl) ||
        donateRegex.test(descriptionText) ||
        donateRegex.test(tweetText) ||
        donateRegex.test(tweetUrl) ||
        donateRegex.test(userUrlText)
      );
    });
  }
  const isGaza = gazaTestRegex.test(descriptionText) ||
    gazaTestRegex.test(tweetText) ||
    gazaTestRegex.test(tweetAltText) ||
    gazaTestRegex.test(tweetUrl) ||
    gazaTestRegex.test(userUrlText) ||
    gazaTestRegex.test(userName)

  const isFundraiser = matched || isVerifiedRM;
  return {tweetUrl: tweetUrl, tweet: tweet, isFundraiser, isGaza: isGaza};
}

async function likeAndRtPinnedPostOnProfile(response: LikeAndRtToControllerResponse, tweet: HTMLElement, isGaza: boolean, sourceReplies: SourceReplies, threshold: number, userInput: ControllerToLikeAndRtInput, verifiedRadioWaterMelonUsers: string[], rwScreenshot?: string): Promise<LikeAndRtToControllerResponse> {
  const like = tweet.querySelector("button[data-testid='like']") as HTMLElement | null;
  const retweet = tweet.querySelector("button[data-testid='retweet']") as HTMLElement | null;
  await wait(500); // sometimes like are missed, hence wait
  if (like) {
    like.click();
    await wait(600);
  }
  if (retweet) {
    retweet.click();
    await wait(1000);
  }

  // for undo repost data-testid='unretweetConfirm'
  const repostMenuItem = document.querySelector("div[role='menuitem'][data-testid='retweetConfirm']") as HTMLElement | null;
  if (repostMenuItem) {
    repostMenuItem.click();
    await wait(1500);
  }

  if (sourceReplies[response.url] && sourceReplies[response.url].timestamp && threshold != 0) {
    const sourceTimestamp = sourceReplies[response.url].timestamp;
    const timeDifference = Date.now() - sourceTimestamp;
    if (timeDifference < threshold) {
      response.error = "Time difference is less than threshold";
      return response;
    }
  }
  response.timestamp = Date.now();
  const usernameExtracted = extractUsernameFromXUrl(response.url);
  console.log("usernameExtracted", usernameExtracted);
  let isWaterMelonVerified = false;
  if (usernameExtracted) {
    isWaterMelonVerified = verifiedRadioWaterMelonUsers.includes(usernameExtracted.toLowerCase());
  }
  isGaza = isGaza || isWaterMelonVerified;

  let commentText = userInput.gazaRtText;
  let quoteText = userInput.gazaQuoteText;
  if (!isGaza) {
    commentText = userInput.rtText;
    quoteText = userInput.quoteText;
  }
  if (isWaterMelonVerified) {
    quoteText = "#VerifiedByRadioWaterMelon " + quoteText;
  }

  const commentButton = tweet.querySelector("button[data-testid='reply']") as HTMLElement | null;
  if (!commentButton) {
    response.error = "comment button not found for reply"
    console.log(response.error);
    return response;
  }
  commentButton.click();
  const modalBox = await waitForElement('div[aria-labelledby="modal-header"][aria-modal="true"][role="dialog"]');
  let replyBtnDisabled = false;
  if (!modalBox) {
    await wait(500);
    const modalBox = await waitForElement('div[data-testid="sheetDialog"]') as HTMLElement | null;
    if (!modalBox) {
      response.error = "modalBox not found";
      console.log(response.error);
      return response;
    }
    replyBtnDisabled = (modalBox.textContent ?? "").includes('Who can reply?');
    if (replyBtnDisabled) {
      const appBarButton = modalBox.querySelector("button[data-testid='app-bar-close']") as HTMLElement | null;
      if (!appBarButton) {
        response.error = "modalBox's close button  not found";
        console.log(response.error);
        return response;
      }
      appBarButton.click();
      await wait(500);
    }
  }
  await wait(700);

  // Wait for reply input to appear
  const replyBox = modalBox?.querySelector('div[data-testid="tweetTextarea_0"]') as HTMLElement | null;

  if (!replyBox && !replyBtnDisabled) {
    response.error = "❌ Reply input not found."
    console.warn(response.error);
    return response;
  }

  await wait(200);
  if (replyBox && modalBox) {
    const box = replyBox.getBoundingClientRect();
    window.scrollTo({top: box.top + window.scrollY - 100, behavior: 'smooth'});
    replyBox.click();
    await wait(1000);

    const data = new DataTransfer();
    data.setData("text/plain", commentText);
    const pasteEvent = new ClipboardEvent("paste", {
      clipboardData: data,
      bubbles: true,
      cancelable: true
    });
    replyBox.dispatchEvent(pasteEvent);

    await wait(1500);
    const imageToInsert = isGaza ? userInput.gazaRtImage : userInput.rtImage;
    console.log("imageToInsert", imageToInsert);

    if (imageToInsert && typeof imageToInsert === 'object' && imageToInsert.base64?.startsWith('data:image/')) {
      try {
        const blob = await (await fetch(imageToInsert.base64)).blob();
        const file = new window.File([blob], imageToInsert.name, { type: imageToInsert.type });
        const dt = new DataTransfer();
        dt.items.add(file);

        const fileInput = modalBox.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement | null;
        if (fileInput) {
          fileInput.files = dt.files;
          fileInput.dispatchEvent(new Event('input', {bubbles: true}));
          fileInput.dispatchEvent(new Event('change', {bubbles: true}));
          await wait(2500);
          console.log("✅ Image injected.");
        } else {
          console.warn("❌ File input not found.");
        }
      } catch (e) {
        console.error("⚠️ Failed to inject image:", e);
      }
    }

    const postReplyBtn = modalBox.querySelector('button[data-testid="tweetButton"]:not([disabled])') as HTMLElement | null;
    if (postReplyBtn) {
      postReplyBtn.click();
      await wait(6000);
      console.log("✅ Replied with text and GIF.");
    } else {
      //response.error = "❌ Reply post button not found or disabled.";
      console.warn("❌ Reply post button not found or disabled.");
    }
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

  const quoteMenuItem = document.querySelector('a[role="menuitem"][href="/compose/post"]') as HTMLElement | null;

  if (!quoteMenuItem) {
    response.error = "❌ Quote menu item not found.";
    console.warn(response.error);
    return response;
  }

  quoteMenuItem.click();
  await wait(2500);

  let editor = document.querySelector('div.public-DraftEditor-content[contenteditable="true"]') as HTMLElement | null;
  if (!editor) {
    response.error = "❌ Quote editor not found."
    console.warn(response.error);
    return response;
  }

  editor.focus();

  const data = new DataTransfer();
  data.setData("text/plain", quoteText);
  const pasteEvent = new ClipboardEvent("paste", {
    clipboardData: data,
    bubbles: true,
    cancelable: true
  });
  editor.dispatchEvent(pasteEvent);
  console.log("rwScreenshot received inside content ", rwScreenshot);
  // QUOTE: attach RW screenshot if verified
  if (isWaterMelonVerified && rwScreenshot && rwScreenshot.startsWith('data:image/')) {
    try {
      if (usernameExtracted) {
        const handleForUrl = usernameExtracted.startsWith('@') ? usernameExtracted : `@${usernameExtracted}`;
        const rwLink = quoteText + `\nhttps://radiowatermelon.com/tools/verified-accounts?filterAB=${handleForUrl}`

        const dtLink = new DataTransfer();
        dtLink.setData('text/plain', `\n${rwLink}`);
        const pasteLinkEvt = new ClipboardEvent('paste', {
          clipboardData: dtLink,
          bubbles: true,
          cancelable: true
        });
        editor.dispatchEvent(pasteLinkEvt);
        await wait(300);
      }
      const blob = await (await fetch(rwScreenshot)).blob();
      const file = new File([blob], 'rw-certificate.png', {type: blob.type || 'image/png'});
      const dt = new DataTransfer();
      dt.items.add(file);

      // Scope strictly to the QUOTE composer modal (same pattern as reply)
      // 1st try the headered modal, then the sheet dialog fallback.
      const quoteModal =
        (document.querySelector('div[aria-labelledby="modal-header"][aria-modal="true"][role="dialog"]') as HTMLElement | null)
        || (document.querySelector('div[data-testid="sheetDialog"]') as HTMLElement | null);

      const fileInput =
        (quoteModal?.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement | null) ||
        (quoteModal?.querySelector('input[data-testid="fileInput"]') as HTMLInputElement | null) ||
        null;

      if (fileInput) {
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('input', {bubbles: true}));
        fileInput.dispatchEvent(new Event('change', {bubbles: true}));
        await wait(2500); // let preview render
        console.log('✅ RW screenshot injected into QUOTE.');
      } else {
        console.warn('❌ Quote composer file input not found.');
      }
    } catch (e) {
      console.error('⚠️ Failed to inject RW screenshot into QUOTE:', e);
    }
  }


  // Wait for text to register and button to enable
  await wait(2500);
  const postBtn = document.querySelector('button[data-testid="tweetButton"]:not([disabled])') as HTMLElement | null;
  if (postBtn) {
    postBtn.click();
    await wait(2000);
    console.log("✅ Quote tweet posted.");
  } else {
    console.warn("❌ Post button not found or still disabled.");
  }

  editor = await waitForElement(('div.public-DraftEditor-content[contenteditable="true"]'));
  if (editor) {
    editor.textContent = '';
    editor.dispatchEvent(new InputEvent('input', {bubbles: true}));
  }
  await wait(1000);
  return response;
}

