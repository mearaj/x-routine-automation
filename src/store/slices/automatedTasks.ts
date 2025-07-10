import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {
  type AutomatedTasks,
  type AutomatedTasksStatus,
  AutomatedTaskStatusEnum,
  type SourceReplies,
  type SourceToTargetReplies,
  type SourceTweetURL,
} from "@/utils/automatedTasks.ts";
import {
  followingThresholdDuration,
  likeRtThresholdDuration,
  minWaitingTimeForFollowing, minWaitingTimeForTweet,
  sourceToTargetThresholdDuration
} from "@/utils/common.ts";


const initialState: AutomatedTasks = {
  collectingFollowingsTask: {
    status: AutomatedTaskStatusEnum.Idle,
    skipOnFirstVisible: false,
  },
  likeRtQuoteReplyStatus: AutomatedTaskStatusEnum.Idle,
  sourceTweetURLs: [],
  targetTweetURLs: [],
  sourceReplies: {},
  sourceToTargetReplies: {},
  likeRtThresholdDuration: likeRtThresholdDuration,
  sourceToTargetThresholdDuration: sourceToTargetThresholdDuration,
  followingThresholdDuration: followingThresholdDuration,
  minWaitingTimeForFollowing,
  minWaitingTimeForTweet
}

const automatedTasks = createSlice({
  name: 'automatedTasks',
  initialState,
  reducers: {
    rehydrateAutomationState: (state, action: PayloadAction<Partial<AutomatedTasks>>) => {
      return {...state, ...action.payload};
    },
    setCollectingFollowingsStatus: (state: AutomatedTasks, action: PayloadAction<{
      status: AutomatedTasksStatus,
      skipOnFirstVisible: boolean
    }>) => {
      state.collectingFollowingsTask.status = action.payload.status;
      state.collectingFollowingsTask.skipOnFirstVisible = action.payload.skipOnFirstVisible;
    },
    setlikeRtQuoteReplyStatus: (state: AutomatedTasks, action: PayloadAction<{ status: AutomatedTasksStatus, }>) => {
      state.likeRtQuoteReplyStatus = action.payload.status;
    },
    setNewSourceTweetURLs: (
      state: AutomatedTasks,
      action: PayloadAction<{ sourceURLs: SourceTweetURL[] }>
    ) => {
      const urlSet = new Set(action.payload.sourceURLs.map(e => e.url));
      state.sourceTweetURLs = action.payload.sourceURLs.filter(e => urlSet.has(e.url));

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
    setNewTargetTweetURLs: (
      state: AutomatedTasks,
      action: PayloadAction<{
        targetURLs: string[]
      }>
    ) => {
      state.targetTweetURLs = Array.from(new Set(action.payload.targetURLs));
    },
    mergeSourceReplies: (
      state: AutomatedTasks,
      action: PayloadAction<{ sourceReplies: SourceReplies }>
    ) => {
      state.sourceReplies = {...state.sourceReplies, ...action.payload.sourceReplies};
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
    setMinWaitingTimeForFollowing:  (state: AutomatedTasks, action: PayloadAction<number>) => {
      state.minWaitingTimeForFollowing = action.payload;
    },
    setMinWaitingTimeForTweet: (state: AutomatedTasks, action: PayloadAction<number>) => {
      state.minWaitingTimeForTweet = action.payload;
    }
  },
});

export const automatedTasksReducer = automatedTasks.reducer;
export const automatedTasksActions = automatedTasks.actions;

export default automatedTasks;
