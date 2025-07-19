import type {PayloadAction} from "@reduxjs/toolkit";
import {automatedTasksActions} from "@/store/slices/automatedTasks.ts";
import {
  type AutomatedTasks,
  AutomatedTaskStatusEnum,
  type ControllerToFollowingRequest
} from "@/utils/automatedTasks.ts";
import {call, delay, put, select} from "redux-saga/effects";
import {activeUsernameSelector, automatedTasksSelector, followingsSelector} from "@/store/selectors.ts";
import {removeTab, sendMessageToTab} from "@/utils/tabs.ts";
import {
  REQUEST_START_SCRAPE_FOLLOWINGS,
  REQUEST_STOP_SCRAPE_FOLLOWINGS,
  RESPONSE_START_SCRAPE_FOLLOWINGS
} from "@/utils";
import type {Following} from "@/utils/following.ts";
import {userActions} from "@/store/slices/userSlice.ts";

export function* stopCollectFollowingsSaga(action: PayloadAction) {
  if (action.type !== automatedTasksActions.setCollectingFollowingsStatus.type) {
    return;
  }
  const automatedTask: AutomatedTasks = yield select(automatedTasksSelector);
  if (automatedTask.collectingFollowingsTask !== AutomatedTaskStatusEnum.Stopped) {
    return;
  }
  const activeUsername: string | null = yield select(activeUsernameSelector);
  if (!activeUsername) {
    return;
  }
  yield delay(7100);
  const followings: Following[] = yield select(followingsSelector);
  const url = `https://x.com/${activeUsername}/following`;
  const tabs: chrome.tabs.Tab[] = yield call(chrome.tabs.query, {url});
  const existingTab = tabs.find(t => t.id !== undefined && t.id !== chrome.tabs.TAB_ID_NONE);
  if (existingTab && existingTab.id !== undefined && existingTab.id !== null) {
    try {
      const scrapeResponse = yield call(sendMessageToTab, existingTab.id, {
        type: REQUEST_STOP_SCRAPE_FOLLOWINGS,
        followings,
        activeUsername,
      } as ControllerToFollowingRequest);
      console.log(scrapeResponse);
    } catch (e) {
      console.error("error in stopCollectFollowingsSaga", e);
    }
  }
}


export function* collectFollowingsSaga(action: PayloadAction) {
  if (action.type !== automatedTasksActions.setCollectingFollowingsStatus.type) {
    return;
  }
  const automatedTask: AutomatedTasks = yield select(automatedTasksSelector);
  if (automatedTask.collectingFollowingsTask !== AutomatedTaskStatusEnum.Running) {
    return;
  }
  const activeUsername: string | null = yield select(activeUsernameSelector);
  if (!activeUsername) {
    yield put(automatedTasksActions.setCollectingFollowingsStatus(AutomatedTaskStatusEnum.Error));
    return;
  }

  const url = `https://x.com/${activeUsername}/following`;
  const tabs: chrome.tabs.Tab[] = yield call(chrome.tabs.query, {url});
  const existingTab = tabs.find(t => t.id !== undefined && t.id !== chrome.tabs.TAB_ID_NONE);
  if (existingTab && existingTab.id !== undefined && existingTab.id !== null) {
    yield call(removeTab, existingTab.id);
  }
  const window: chrome.windows.Window = yield call(() => chrome.windows.create({url, focused: true}));

  const newTab = window.tabs?.[0];
  if (!newTab?.id) {
    yield put(automatedTasksActions.setCollectingFollowingsStatus(AutomatedTaskStatusEnum.Error));
    return;
  }

  const tabIdToUse = newTab.id;

  yield delay(7000);
  const followings: Following[] = yield select(followingsSelector);
  try {
    const scrapeResponse = yield call(sendMessageToTab, tabIdToUse, {
      type: REQUEST_START_SCRAPE_FOLLOWINGS,
      followings,
      activeUsername,
    } as ControllerToFollowingRequest);
    console.log(scrapeResponse);
    if (scrapeResponse?.type !== RESPONSE_START_SCRAPE_FOLLOWINGS) {
      yield put(automatedTasksActions.setCollectingFollowingsStatus(AutomatedTaskStatusEnum.Error));
      return;
    }
    yield put(automatedTasksActions.setCollectingFollowingsStatus(AutomatedTaskStatusEnum.Success));
    yield put(userActions.setFollowingsForActiveUser({followings: scrapeResponse.followings}))
  } catch (err) {
    console.log(err);
    yield put(automatedTasksActions.setCollectingFollowingsStatus(AutomatedTaskStatusEnum.Error));
  }
}
