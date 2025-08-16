// store/sagas/likeRtQuoteReply.ts

import type {PayloadAction} from "@reduxjs/toolkit";
import {automatedTasksActions} from "@/store/slices/automatedTasks.ts";
import {
  type AutomatedTasks,
  AutomatedTaskStatusEnum,
  type ControllerToLikeAndRtRequest,
  type ControllerToReplyWithURLRequest,
  type ControllerToRwScreenshotRequest,
  type LikeAndRtToControllerResponse,
  type ReplyWithURLToControllerResponse,
  type RwScreenshotToControllerResponse,
  type SourceReplies,
  type SourceToTargetKey,
  type SourceToTargetReplies,
  type SourceTweetURL,
  type URLWithTimestamp,
} from "@/utils/automatedTasks.ts";
import {call, delay, put, select} from "redux-saga/effects";
import {
  automatedTasksSelector,
  followingsSelector,
  followingThresholdDurationSelector,
  likeRtQuoteReplyStatusSelector,
  likeRtThresholdDurationSelector,
  minWaitingTimeForFollowingSelector,
  minWaitingTimeForTweetSelector,
  sourceRepliesSelector,
  sourceToTargetThresholdDurationSelector,
  sourceTweetURLsSelector,
  userInputSelector,
  userStateSelector,
  verifiedByRadioWaterMelonSelector
} from "@/store/selectors.ts";
import type {Following} from "@/utils/following.ts";
import {REQUEST_LIKE_AND_RT, REQUEST_RADIO_WATER_MELON_SCREENSHOT, REQUEST_REPLY_WITH_URL} from "@/utils";
import {userActions, type UserState} from "@/store/slices/userSlice.ts";
import {sendMessageToTab, updateTab} from "@/utils/tabs.ts";
import {globalAppStateActions} from "@/store/slices/globalAppState.ts";
import {extractUsernameFromXUrl, RW_VIEW_URL, wait} from "@/utils/common.ts";

function* getFirstFilteredFollowing() {
  const followings: Following[] = yield select(followingsSelector);
  const threshold: number = yield select(followingThresholdDurationSelector);
  const normalize = (u: string) => u.replace(/^@/, "").toLowerCase();
  const {data}: { data: Set<string> } = yield select(verifiedByRadioWaterMelonSelector);
  const verified: Set<string> = new Set(Array.from(data).map(u => u.replace(/^@/, "").toLowerCase()));
  const now = Date.now();
  for (const f of followings) {
    if ((now - f.timestamp) > threshold && verified.has(normalize(f.username))) {
      return f;
    }
  }
  for (const f of followings) {
    if ((now - f.timestamp) > threshold) {
      return f;
    }
  }
  return undefined;
}


function* getFirstFoundTweetURL() {
  const tweetURLs: SourceTweetURL[] = yield select(sourceTweetURLsSelector);
  if (tweetURLs.length === 0) {
    return undefined;
  }
  return tweetURLs[0];
}

function* cleanupTabs(tabId: number, targetMap: Record<string, number>) {
  try {
    const tabIds = Object.values(targetMap);
    if (tabId >= 0) tabIds.push(tabId);
    yield call(() => chrome.tabs.remove(tabIds));
  } catch (e) {
    console.warn("Failed to close tabs", e);
  }
}

function* shouldStopProcessing(tabId: number, targetMap: Record<string, number>) {
  const status = yield select(likeRtQuoteReplyStatusSelector);
  if (status !== AutomatedTaskStatusEnum.Running) {
    yield* cleanupTabs(tabId, targetMap);
    yield put(automatedTasksActions.setlikeRtQuoteReplyStatus({status}));
    return true;
  }
  return false;
}

function* propagateReplies(
  sourceURL: string,
  targetTweetURLs: string[],
  sourceToTargetReplies: SourceToTargetReplies,
  targetURLsToTabIdMap: Record<string, number>,
  threshold: number
) {
  for (const targetURL of targetTweetURLs) {
    const key: SourceToTargetKey = `${sourceURL}::${targetURL}`;
    const lastTimestamp = sourceToTargetReplies[key]?.timestamp ?? 0;
    const timeDifference = Date.now() - lastTimestamp;

    if (timeDifference >= threshold) {
      const request: ControllerToReplyWithURLRequest = {
        type: REQUEST_REPLY_WITH_URL,
        targetURL,
        sourceURL,
        timestamp: lastTimestamp
      };
      yield delay(500);
      const response: ReplyWithURLToControllerResponse =
        yield call(sendMessageToTab, targetURLsToTabIdMap[targetURL], request);
      sourceToTargetReplies[key] = {timestamp: response.timestamp};
      yield put(automatedTasksActions.mergeSourceToTargetReplies({sourceToTargetReplies}));
      yield delay(500);
    }
  }
}


function buildRwUrlForUser(username: string, verifiedSet: Set<string>): string | null {
  const key = username.replace(/^@/, "").toLowerCase();
  if (!verifiedSet.has(key)) return null;
  const u = new URL(RW_VIEW_URL);
  u.searchParams.set("filterAB", `@${key}`);
  return u.toString();
}

async function getRwScreenshot(rwUrl: string): Promise<string> {
  const [active] = await chrome.tabs.query({ active: true, currentWindow: true });
  const idx = (active?.index ?? 0) + 1;

  const rwTab = await chrome.tabs.create({
    url: rwUrl,
    active: false,
    index: idx,
    openerTabId: active?.id,
  });
  const rwTabId = rwTab.id ?? null;
  if (rwTabId == null) return "";

  await wait(6000);

  let dataUrl = "";
  try {
    await chrome.tabs.update(rwTabId, { active: true });
    await wait(200);

    const req: ControllerToRwScreenshotRequest = {
      type: REQUEST_RADIO_WATER_MELON_SCREENSHOT,
      url: rwUrl,
    };
    const resp = (await sendMessageToTab(rwTabId, req)) as RwScreenshotToControllerResponse;
    dataUrl = resp?.screenshot || "";
  } finally {
    if (active?.id) {
      try { await chrome.tabs.update(active.id, { active: true }); } catch (e){
        console.error(e);
      }
    }
    if (rwTabId != null) {
      try { await chrome.tabs.remove(rwTabId); } catch (e) {
        console.error(e);
      }
    }
  }
  return dataUrl;
}

export function* likeRtQuoteReplySage(action: PayloadAction) {
  if (action.type !== automatedTasksActions.setlikeRtQuoteReplyStatus.type) {
    return;
  }
  const automatedTask: AutomatedTasks = yield select(automatedTasksSelector);
  if (automatedTask.likeRtQuoteReplyStatus !== AutomatedTaskStatusEnum.Running) {
    return;
  }
  const userState: UserState = yield select(userStateSelector);
  const activeUsername: string | null = userState.activeUsername;
  if (!activeUsername) {
    yield put(automatedTasksActions.setlikeRtQuoteReplyStatus({status: AutomatedTaskStatusEnum.Error}));
    return;
  }

  let tabId: number = -1;
  const fundraiserURLs = userState.fundraiserURLs;
  const fundraiserExcludedURLs = userState.fundraiserExcludedURLs;
  const targetTweetURLs: string[] = automatedTask.targetTweetURLs;
  const targetURLsToTabIdMap: { [url: string]: number } = {};
  const sourceToTargetReplies: SourceToTargetReplies = {...automatedTask.sourceToTargetReplies};

  for (const tweetURL of targetTweetURLs) {
    try {
      const window: chrome.windows.Window = yield call(() => chrome.windows.create({url: tweetURL, focused: true}));
      const tab = window.tabs?.[0];
      if (!tab || tab.id === undefined || tab.id === null) {
        yield put(automatedTasksActions.setlikeRtQuoteReplyStatus({status: AutomatedTaskStatusEnum.Error}));
        return;
      }
      targetURLsToTabIdMap[tweetURL] = tab!.id;
      yield delay(6000);
    } catch (e) {
      console.error(e);
      yield put(automatedTasksActions.setlikeRtQuoteReplyStatus({status: AutomatedTaskStatusEnum.Error}));
      return;
    }
  }

  let tweetURL: SourceTweetURL | undefined = yield* getFirstFoundTweetURL();
  let following: Following | undefined = yield* getFirstFilteredFollowing();

  while (tweetURL || following) {
    const currentVerified = yield select(verifiedByRadioWaterMelonSelector);
    yield put(globalAppStateActions.setVerifiedByRadioWaterMelonState({
      state: "loading",
      data: currentVerified.data
    }));
    yield delay(1000);
    const state = yield select(verifiedByRadioWaterMelonSelector);
    const verifiedSet = state.data as Set<string>;
    const verifiedRadioWaterMelonUsers = Array.from(verifiedSet);
    const sourceReplies: SourceReplies = yield select(sourceRepliesSelector);
    const likeRtThresholdDuration: number = yield select(likeRtThresholdDurationSelector);
    const sourceToTargetThresholdDuration: number = yield select(sourceToTargetThresholdDurationSelector);
    const userInput = yield select(userInputSelector);
    if (tweetURL) {
      if (yield* shouldStopProcessing(tabId, targetURLsToTabIdMap)) {
        return;
      }
      let shouldSkipLike = false;
      const sourceTimestamp = sourceReplies[tweetURL.url]?.timestamp ?? 0;
      const timeDifference = Date.now() - sourceTimestamp;
      if (timeDifference < likeRtThresholdDuration) {
        shouldSkipLike = true;
        yield put(automatedTasksActions.removeSourceTweetURLs([tweetURL.url]));
      }
      try {
        if (!shouldSkipLike) {
          if (tabId === -1) {
            const window: chrome.windows.Window = yield call(() => chrome.windows.create({
              url: tweetURL!.url,
              focused: true
            }));
            if (window.tabs?.[0].id === undefined || window.tabs?.[0].id === null) {
              console.error("failed to create new window for tweetURL");
              yield put(automatedTasksActions.setlikeRtQuoteReplyStatus({status: AutomatedTaskStatusEnum.Error}));
              return;
            }
            tabId = window.tabs[0].id;
            yield delay(5000);
          } else {
            yield call(updateTab, tabId, {url: tweetURL.url});
            yield delay(4000);
          }
          const usernameExtracted = (extractUsernameFromXUrl(tweetURL.url) ?? '').replace(/^@/, '').toLowerCase();
          const isRadioWaterMelonVerified = verifiedSet.has(usernameExtracted);
          let rwScreenshot: string | undefined;
          if (isRadioWaterMelonVerified) {
            const rwUrl = buildRwUrlForUser(usernameExtracted, verifiedSet);
            if (rwUrl) {
              const shot: string = (yield call(getRwScreenshot, rwUrl)) as string;
              if (shot) rwScreenshot = shot;
            }
          }

          const request: ControllerToLikeAndRtRequest = {
            type: REQUEST_LIKE_AND_RT,
            url: tweetURL.url,
            fundraiserURLs,
            fundraiserExcludedURLs,
            sourceReplies: {},
            threshold: 0,
            isFundraiser: true,
            isGaza: tweetURL.isGaza,
            timestamp: sourceReplies[tweetURL.url]?.timestamp ?? 0,
            userInput,
            verifiedRadioWaterMelonUsers,
            rwScreenshot,
          }
          const startTime = Date.now();
          const response: LikeAndRtToControllerResponse = yield call(sendMessageToTab, tabId, request);
          if (response.error && response.error.toLowerCase().includes(('Verify you are human').toLowerCase())) {
            yield put(automatedTasksActions.setlikeRtQuoteReplyStatus({status: AutomatedTaskStatusEnum.Error}));
            return;
          }
          const endTime = Date.now();
          const diff = endTime - startTime;
          const waitingTime = yield select(minWaitingTimeForTweetSelector);
          if (diff < waitingTime) {
            yield delay((waitingTime) - diff);
          }
          const tweetURLEntry: URLWithTimestamp = {url: response.url, timestamp: response.timestamp};
          yield put(automatedTasksActions.removeSourceTweetURLs([tweetURL.url]));
          if (tweetURL.url != response.url) {
            yield put(automatedTasksActions.removeSourceTweetURLs([response.url]));
          }
          yield put(automatedTasksActions.mergeSourceReplies({sourceReplies: {[response.url]: tweetURLEntry}}));
          console.log(response);
        }
        yield* propagateReplies(tweetURL.url, targetTweetURLs, sourceToTargetReplies, targetURLsToTabIdMap, sourceToTargetThresholdDuration);
      } catch (e) {
        console.error(e);
        break;
      }
    } else if (following) {
      if (yield* shouldStopProcessing(tabId, targetURLsToTabIdMap)) {
        return;
      }
      try {
        const url = `https://x.com/${following.username}`
        if (tabId === -1) {
          const window: chrome.windows.Window = yield call(() => chrome.windows.create({url, focused: true}));
          if (window.tabs?.[0].id === undefined || window.tabs?.[0].id === null) {
            console.error("failed to create new window for tweetURL");
            yield put(automatedTasksActions.setlikeRtQuoteReplyStatus({status: AutomatedTaskStatusEnum.Error}));
            return;
          }
          tabId = window.tabs![0].id;
          yield delay(5000);
        } else {
          yield call(updateTab, tabId, {url});
          yield delay(4000);
        }
        const handleF = following.username.replace(/^@/, '').toLowerCase();
        const isRadioWaterMelonVerified = verifiedSet.has(handleF);
        let rwScreenshot: string | undefined;
        if (isRadioWaterMelonVerified) {
          const rwUrl = buildRwUrlForUser(handleF, verifiedSet);
          if (rwUrl) {
            const shot: string = (yield call(getRwScreenshot, rwUrl)) as string;
            if (shot) rwScreenshot = shot;
          }
        }

        const request: ControllerToLikeAndRtRequest = {
          type: REQUEST_LIKE_AND_RT,
          url,
          timestamp: following.timestamp,
          fundraiserURLs,
          sourceReplies,
          threshold: likeRtThresholdDuration,
          fundraiserExcludedURLs,
          userInput,
          verifiedRadioWaterMelonUsers,
          rwScreenshot
        }
        const startTime = Date.now();
        const response: LikeAndRtToControllerResponse = yield call(sendMessageToTab, tabId, request);
        if (response.error && response.error.toLowerCase().includes(('Verify you are human').toLowerCase())) {
          yield put(automatedTasksActions.setlikeRtQuoteReplyStatus({status: AutomatedTaskStatusEnum.Error}));
          return;
        }
        const endTime = Date.now();
        const diff = endTime - startTime;
        const waitingTime = yield select(minWaitingTimeForFollowingSelector);
        if (diff < waitingTime) {
          yield delay(waitingTime - diff);
        }
        if (response.url !== url) {
          const sourceReply: URLWithTimestamp = {url: response.url, timestamp: response.timestamp};
          yield put(automatedTasksActions.removeSourceTweetURLs([response.url]));
          yield put(automatedTasksActions.mergeSourceReplies({sourceReplies: {[response.url]: sourceReply}}));
          yield* propagateReplies(response.url, targetTweetURLs, sourceToTargetReplies, targetURLsToTabIdMap, sourceToTargetThresholdDuration);
          response.timestamp = Date.now(); // this prevents looping the same profile again and again
        }
        if (request.timestamp !== response.timestamp) {
          yield put(userActions.addOrUpdateFollowings({
            followings: [
              {username: following.username, mutual: following.mutual, timestamp: response.timestamp}
            ]
          }));
        } else {
          console.warn(("danger of looping through the same following again and again."))
        }
        console.log(response);
      } catch (e) {
        console.error(e);
        if (yield* shouldStopProcessing(tabId, targetURLsToTabIdMap)) {
          return;
        } else {
          yield put(automatedTasksActions.setlikeRtQuoteReplyStatus({status: AutomatedTaskStatusEnum.Error}));
          return;
        }
      }
    }
    yield delay(500);
    tweetURL = yield* getFirstFoundTweetURL();
    following = yield* getFirstFilteredFollowing();
  }
  yield* cleanupTabs(tabId, targetURLsToTabIdMap);
  yield put(automatedTasksActions.setlikeRtQuoteReplyStatus({status: AutomatedTaskStatusEnum.Success}));
  return;
}
