import {ACTIVE_USERNAME_KEY, ALL_USERNAMES_KEY} from "./keys.ts";
import type {RootState} from "../store";
import {AutomatedTaskStatusEnum} from "../utils/automatedTasks.ts";
import type {Following} from "../utils/following.ts";
import {
  defaultUserInput,
  followingThresholdDuration as commonFollowingThresholdDuration,
  likeRtThresholdDuration as commonLikeRtThresholdDuration,
  minWaitingTimeForFollowing,
  minWaitingTimeForTweet,
  sourceToTargetThresholdDuration as commonSourceToTargetThresholdDuration
} from "./common.ts";

export const saveAppStateToStorage = async (appState: RootState): Promise<void> => {
  const userState = appState.user;
  const automatedTasksState = appState.automatedTasks;
  await chrome.storage.local.set({[ACTIVE_USERNAME_KEY]: userState.activeUsername});
  await chrome.storage.local.set({[ALL_USERNAMES_KEY]: userState.usernames});
  if (userState.activeUsername) {
    await chrome.storage.local.set({[`${userState.activeUsername}:followings`]: userState.followings});
    await chrome.storage.local.set({[`${userState.activeUsername}:fundraiserURLs`]: userState.fundraiserURLs});
    await chrome.storage.local.set({[`${userState.activeUsername}:fundraiserExcludedURLs`]: userState.fundraiserExcludedURLs});
    await chrome.storage.local.set({[`${userState.activeUsername}:sourceReplies`]: automatedTasksState.sourceReplies});
    await chrome.storage.local.set({[`${userState.activeUsername}:sourceToTargetReplies`]: automatedTasksState.sourceToTargetReplies});
    await chrome.storage.local.set({[`${userState.activeUsername}:likeRtThresholdDuration`]: automatedTasksState.likeRtThresholdDuration});
    await chrome.storage.local.set({[`${userState.activeUsername}:sourceToTargetThresholdDuration`]: automatedTasksState.sourceToTargetThresholdDuration});
    await chrome.storage.local.set({[`${userState.activeUsername}:followingThresholdDuration`]: automatedTasksState.followingThresholdDuration});
    await chrome.storage.local.set({[`${userState.activeUsername}:userInput`]: automatedTasksState.userInput});
  }
}

export const getAppStateFromStorage = async (): Promise<{
  automatedTasks: RootState["automatedTasks"],
  user: RootState["user"]
}> => {
  const activeUsername =
    (await chrome.storage.local.get([ACTIVE_USERNAME_KEY]))[ACTIVE_USERNAME_KEY];
  const usernames: string[] =
    (await chrome.storage.local.get([ALL_USERNAMES_KEY]))[ALL_USERNAMES_KEY] ?? [];

  if (!activeUsername) {
    return {
      user: {
        fundraiserExcludedURLs: [],
        activeUsername: '',
        usernames,
        fundraiserURLs: [],
        followings: [],
      },
      automatedTasks: {
        collectingFollowingsTask: AutomatedTaskStatusEnum.Idle,
        likeRtQuoteReplyStatus: AutomatedTaskStatusEnum.Idle,
        sourceTweetURLs: [],
        sourceReplies: {},
        sourceToTargetReplies: {},
        likeRtThresholdDuration: commonLikeRtThresholdDuration,
        sourceToTargetThresholdDuration: commonSourceToTargetThresholdDuration,
        followingThresholdDuration: commonFollowingThresholdDuration,
        targetTweetURLs: [],
        minWaitingTimeForFollowing,
        minWaitingTimeForTweet,
        userInput: defaultUserInput,
        verifiedByRadioWaterMelonState: {
          data: new Set<string>(),
          state: "idle",
        }
      },
    } as { automatedTasks: RootState["automatedTasks"], user: RootState["user"] };
  }

  const fundraiserURLs =
    (await chrome.storage.local.get([`${activeUsername}:fundraiserURLs`]))[
      `${activeUsername}:fundraiserURLs`
      ] ?? [];
  const fundraiserExcludedURLs =
    (await chrome.storage.local.get([`${activeUsername}:fundraiserExcludedURLs`]))[
      `${activeUsername}:fundraiserExcludedURLs`
      ] ?? [];
  const followings =
    ((await chrome.storage.local.get([`${activeUsername}:followings`]))[
      `${activeUsername}:followings`
      ] ?? []) as Following[];

  const sourceReplies =
    (await chrome.storage.local.get([`${activeUsername}:sourceReplies`]))[
      `${activeUsername}:sourceReplies`
      ] ?? {};

  const sourceToTargetReplies =
    (await chrome.storage.local.get([`${activeUsername}:sourceToTargetReplies`]))[
      `${activeUsername}:sourceToTargetReplies`
      ] ?? {};

  const likeRtThresholdDuration =
    (await chrome.storage.local.get([`${activeUsername}:likeRtThresholdDuration`]))[
      `${activeUsername}:likeRtThresholdDuration`
      ] ?? commonLikeRtThresholdDuration;

  const sourceToTargetThresholdDuration =
    (await chrome.storage.local.get([`${activeUsername}:sourceToTargetThresholdDuration`]))[
      `${activeUsername}:sourceToTargetThresholdDuration`
      ] ?? commonSourceToTargetThresholdDuration;

  const followingThresholdDuration =
    (await chrome.storage.local.get([`${activeUsername}:followingThresholdDuration`]))[
      `${activeUsername}:followingThresholdDuration`
      ] ?? commonFollowingThresholdDuration;

  const userInput =
    (await chrome.storage.local.get([`${activeUsername}:userInput`]))[
      `${activeUsername}:userInput`
      ] ?? defaultUserInput;
  if (userInput.rtImage === undefined) {
    userInput.rtImage = defaultUserInput.rtImage;
  }

  if (userInput.gazaRtImage === undefined) {
    userInput.gazaRtImage = defaultUserInput.gazaRtImage;
  }


  return {
    user: {
      fundraiserExcludedURLs,
      activeUsername,
      usernames,
      fundraiserURLs,
      followings,
    },
    automatedTasks: {
      sourceReplies,
      sourceToTargetReplies,
      likeRtThresholdDuration: likeRtThresholdDuration,
      sourceToTargetThresholdDuration: sourceToTargetThresholdDuration,
      followingThresholdDuration: followingThresholdDuration,
      collectingFollowingsTask: AutomatedTaskStatusEnum.Idle,
      likeRtQuoteReplyStatus: AutomatedTaskStatusEnum.Idle,
      sourceTweetURLs: [],
      targetTweetURLs: [],
      minWaitingTimeForFollowing,
      minWaitingTimeForTweet,
      userInput,
      verifiedByRadioWaterMelonState: {
        data: new Set<string>(),
        state: "idle",
      }
    },
  } as { automatedTasks: RootState["automatedTasks"], user: RootState["user"] };
};
