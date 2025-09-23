import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {
  type AutomatedTasks,
  type AutomatedTasksStatus,
  AutomatedTaskStatusEnum,
  type ControllerToLikeAndRtInput,
  type SourceReplies,
  type SourceToTargetReplies,
  type SourceTweetURL,
} from "../../utils/automatedTasks.ts";
import {
  emptyUserInput,
  followingThresholdDuration,
  likeRtThresholdDuration,
  minWaitingTimeForFollowing,
  minWaitingTimeForTweet,
  sourceToTargetThresholdDuration
} from "../../utils/common.ts";


const initialState: AutomatedTasks = {
  collectingFollowingsTask: AutomatedTaskStatusEnum.Idle,
  likeRtQuoteReplyStatus: AutomatedTaskStatusEnum.Idle,
  sourceTweetURLs: [],
  targetTweetURLs: [],
  sourceReplies: {},
  sourceToTargetReplies: {},
  likeRtThresholdDuration: likeRtThresholdDuration,
  sourceToTargetThresholdDuration: sourceToTargetThresholdDuration,
  followingThresholdDuration: followingThresholdDuration,
  minWaitingTimeForFollowing,
  minWaitingTimeForTweet,
  userInput: emptyUserInput,
}

const automatedTasks = createSlice({
  name: 'automatedTasks',
  initialState,
  reducers: {
    rehydrateAutomationState: (state, action: PayloadAction<Partial<AutomatedTasks>>) => {
      return {...state, ...action.payload};
    },
    setCollectingFollowingsStatus: (state: AutomatedTasks, action: PayloadAction<AutomatedTasksStatus>) => {
      state.collectingFollowingsTask = action.payload;
    },
    setlikeRtQuoteReplyStatus: (state: AutomatedTasks, action: PayloadAction<{ status: AutomatedTasksStatus, }>) => {
      state.likeRtQuoteReplyStatus = action.payload.status;
    },
    replaceSourceTweetURL: (
      state: AutomatedTasks,
      action: PayloadAction<{ sourceTweetURLs: SourceTweetURL[] }>
    ) => {
      state.sourceTweetURLs = action.payload.sourceTweetURLs;
    },
    addSourceTweetURLs: (
      state: AutomatedTasks,
      action: PayloadAction<SourceTweetURL[]>
    ) => {
      const existing = new Map(state.sourceTweetURLs.map(e => [e.url, e]));
      for (const entry of action.payload) {
        existing.set(entry.url, entry);
      }
      state.sourceTweetURLs = Array.from(existing.values());
    },

    removeSourceTweetURLs: (
      state: AutomatedTasks,
      action: PayloadAction<string[]>
    ) => {
      const toRemove = new Set(action.payload);
      state.sourceTweetURLs = state.sourceTweetURLs.filter(e => !toRemove.has(e.url));
    },
    updateSourceTweetIsGaza: (
      state: AutomatedTasks,
      action: PayloadAction<{ url: string; isGaza: boolean }>
    ) => {
      const entry = state.sourceTweetURLs.find(e => e.url === action.payload.url);
      if (entry) {
        entry.isGaza = action.payload.isGaza;
      }
    },
    mergeSourceReplies: (
      state: AutomatedTasks,
      action: PayloadAction<{ sourceReplies: SourceReplies }>
    ) => {
      state.sourceReplies = {...state.sourceReplies, ...action.payload.sourceReplies};
    },
    removeSourceReplies: (
      state: AutomatedTasks,
      action: PayloadAction<string[]>
    ) => {
      for (const key of action.payload) {
        delete state.sourceReplies[key];
      }
    },
    addTargetTweetURLs: (
      state: AutomatedTasks,
      action: PayloadAction<string[]>
    ) => {
      const urlSet = new Set(state.targetTweetURLs);
      action.payload.forEach(url => urlSet.add(url));
      state.targetTweetURLs = Array.from(urlSet);
    },

    removeTargetTweetURLs: (
      state: AutomatedTasks,
      action: PayloadAction<string[]>
    ) => {
      const toRemove = new Set(action.payload);
      state.targetTweetURLs = state.targetTweetURLs.filter(url => !toRemove.has(url));
    },
    mergeSourceToTargetReplies: (
      state: AutomatedTasks,
      action: PayloadAction<{ sourceToTargetReplies: SourceToTargetReplies }>
    ) => {
      state.sourceToTargetReplies = {...state.sourceToTargetReplies, ...action.payload.sourceToTargetReplies};
    },
    setLikeRtThresholdDuration: (
      state: AutomatedTasks,
      action: PayloadAction<number>
    ) => {
      state.likeRtThresholdDuration = action.payload;
    },

    setSourceToTargetThresholdDuration: (
      state: AutomatedTasks,
      action: PayloadAction<number>
    ) => {
      state.sourceToTargetThresholdDuration = action.payload;
    },

    setFollowingThresholdDuration: (state: AutomatedTasks, action: PayloadAction<number>) => {
      state.followingThresholdDuration = action.payload;
    },
    setMinWaitingTimeForFollowing: (state: AutomatedTasks, action: PayloadAction<number>) => {
      state.minWaitingTimeForFollowing = action.payload;
    },
    setMinWaitingTimeForTweet: (state: AutomatedTasks, action: PayloadAction<number>) => {
      state.minWaitingTimeForTweet = action.payload;
    },
    setUserInput: (state: AutomatedTasks, action: PayloadAction<ControllerToLikeAndRtInput>) => {
      state.userInput = action.payload;
    },
  },
});

export const automatedTasksReducer = automatedTasks.reducer;
export const automatedTasksActions = automatedTasks.actions;

export default automatedTasks;
