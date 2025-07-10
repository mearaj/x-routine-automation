import type {PayloadAction} from "@reduxjs/toolkit";
import {automatedTasksActions} from "@/store/slices/automatedTasks.ts";
import {
  type AutomatedTasks,
  AutomatedTaskStatusEnum,
  type ControllerToFollowingRequest
} from "@/utils/automatedTasks.ts";
import {call, delay, put, select} from "redux-saga/effects";
import {followingsSelector, activeUsernameSelector, automatedTasksSelector} from "@/store/selectors.ts";
import {sendMessageToTab} from "@/utils/tabs.ts";
import {PING_REQUEST, PONG_RESPONSE, REQUEST_START_SCRAPE_FOLLOWINGS, RESPONSE_START_SCRAPE_FOLLOWINGS} from "@/utils";
import type {Following} from "@/utils/following.ts";
import {userActions} from "@/store/slices/userSlice.ts";

export function* collectFollowingsSaga(action: PayloadAction) {
  if (action.type !== automatedTasksActions.setCollectingFollowingsStatus.type) {
    return;
  }
  const automatedTask: AutomatedTasks = yield select(automatedTasksSelector);
  if (automatedTask.collectingFollowingsTask.status !== AutomatedTaskStatusEnum.Running) {
    return;
  }
  const activeUsername: string | null = yield select(activeUsernameSelector);
  if (!activeUsername) {
    yield put(automatedTasksActions.setCollectingFollowingsStatus({
      status: AutomatedTaskStatusEnum.Error,
      skipOnFirstVisible: automatedTask.collectingFollowingsTask.skipOnFirstVisible
    }));
    return;
  }

  const url = `https://x.com/${activeUsername}/following`;

  // 1. Check if tab exists
  const tabs: chrome.tabs.Tab[] = yield call(chrome.tabs.query, {url});

  const existingTab = tabs.find(t => t.id !== undefined && t.id !== chrome.tabs.TAB_ID_NONE);
  if (existingTab && existingTab.id !== undefined && existingTab.id !== null) {
    try {
      const response = yield call(sendMessageToTab, existingTab.id!, {type: PING_REQUEST});
      if (response?.type === PONG_RESPONSE) {
        yield call(() => chrome.tabs.remove(existingTab.id!));
      }
    } catch (error) {
      console.log(error);
    }
  }

  // 2. Open new window with new tab
  const window: chrome.windows.Window = yield call(() => chrome.windows.create({url, focused: true}));

  const newTab = window.tabs?.[0];
  if (!newTab?.id) {
    yield put(automatedTasksActions.setCollectingFollowingsStatus({
      status: AutomatedTaskStatusEnum.Error,
      skipOnFirstVisible: automatedTask.collectingFollowingsTask.skipOnFirstVisible
    }));
    return;
  }

  const tabIdToUse = newTab.id;

  yield delay(7000);
  const followings: Following[] = yield select(followingsSelector);
  try {
    const res = yield call(sendMessageToTab, tabIdToUse, {type: PING_REQUEST});
    if (res?.type !== PONG_RESPONSE) {
      yield put(automatedTasksActions.setCollectingFollowingsStatus({
        status: AutomatedTaskStatusEnum.Error,
        skipOnFirstVisible: automatedTask.collectingFollowingsTask.skipOnFirstVisible
      }));
      return;
    }
    const scrapeResponse = yield call(sendMessageToTab, tabIdToUse, {
      type: REQUEST_START_SCRAPE_FOLLOWINGS,
      followings,
      activeUsername,
      skipOnFirstVisible: automatedTask.collectingFollowingsTask.skipOnFirstVisible,
    } as ControllerToFollowingRequest);
    console.log(scrapeResponse);
    if (scrapeResponse?.type !== RESPONSE_START_SCRAPE_FOLLOWINGS) {
      yield put(automatedTasksActions.setCollectingFollowingsStatus({
        status: AutomatedTaskStatusEnum.Error,
        skipOnFirstVisible: automatedTask.collectingFollowingsTask.skipOnFirstVisible
      }));
      return;
    }

    yield put(automatedTasksActions.setCollectingFollowingsStatus({
      status: AutomatedTaskStatusEnum.Success,
      skipOnFirstVisible: automatedTask.collectingFollowingsTask.skipOnFirstVisible
    }));
    yield put(userActions.setFollowingsForActiveUser({followings: scrapeResponse.followings}))
  } catch (err) {
    console.log(err);
    yield put(automatedTasksActions.setCollectingFollowingsStatus({
      status: AutomatedTaskStatusEnum.Error,
      skipOnFirstVisible: automatedTask.collectingFollowingsTask.skipOnFirstVisible
    }));
  }
}
