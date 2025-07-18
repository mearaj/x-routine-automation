import type {RootState} from "@/store/store.ts";

export const userStateSelector = (state: RootState) => state.user;
export const activeUsernameSelector = (state: RootState) => state.user.activeUsername;
export const followingsSelector = (state: RootState) => state.user.followings;
export const automatedTasksSelector = (state: RootState)=> state.automatedTasks;
export const collectFollowingsTaskSelector = (state: RootState)=> state.automatedTasks.collectingFollowingsTask;
export const likeRtQuoteReplyStatusSelector = (state: RootState)=> state.automatedTasks.likeRtQuoteReplyStatus;
export const sourceTweetURLsSelector = (state: RootState)=> state.automatedTasks.sourceTweetURLs;
export const targetTweetURLsSelector = (state: RootState)=> state.automatedTasks.targetTweetURLs;
export const followingThresholdDurationSelector = (state: RootState)=> state.automatedTasks.followingThresholdDuration;
export const likeRtThresholdDurationSelector = (state: RootState)=> state.automatedTasks.likeRtThresholdDuration;
export const sourceToTargetThresholdDurationSelector = (state: RootState)=> state.automatedTasks.sourceToTargetThresholdDuration;
export const sourceRepliesSelector = (state: RootState)=> state.automatedTasks.sourceReplies;
export const minWaitingTimeForFollowingSelector = (state:RootState)=> state.automatedTasks.minWaitingTimeForFollowing
export const minWaitingTimeForTweetSelector = (state:RootState)=> state.automatedTasks.minWaitingTimeForTweet
export const userInputSelector = (state:RootState)=> state.automatedTasks.userInput;
export const verifiedByRadioWaterMelonSelector = (state:RootState)=> state.globalAppState.verifiedByRadioWaterMelonState;
