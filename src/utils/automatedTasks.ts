import {
  REQUEST_LIKE_AND_RT,
  REQUEST_REPLY_WITH_URL,
  REQUEST_START_SCRAPE_FOLLOWINGS,
  RESPONSE_LIKE_AND_RT,
  RESPONSE_REPLY_WITH_URL,
  RESPONSE_START_SCRAPE_FOLLOWINGS
} from "@/utils/keys.ts";
import type {Following} from "@/utils/following.ts";

export const AutomatedTaskStatusEnum = {
  Idle: 'Idle',
  Running: 'Running',
  Stopped: 'Stopped',
  Paused: 'Paused',
  Success: 'Success',
  Error: 'Error',
} as const;

export type AutomatedTasksStatus = keyof typeof AutomatedTaskStatusEnum;


export type SourceToTargetKey = `${string}::${string}`; // sourceURL::targetURL

export interface URLWithTimestamp {
  url: string;
  timestamp: number;
}

export type SourceReplies = {
  [url: string]: URLWithTimestamp
}

export type SourceToTargetReplies = {
  [key: SourceToTargetKey]: {
    timestamp: number;
  };
};


export interface ControllerToFollowingRequest {
  type: typeof REQUEST_START_SCRAPE_FOLLOWINGS;
  activeUsername: string;
  followings: Following[];
  skipOnFirstVisible: boolean;
}

export interface FollowingToControllerResponse {
  type: typeof RESPONSE_START_SCRAPE_FOLLOWINGS;
  followings: Following[];
  activeUsername: string;
  error: string | null | undefined;
}

export interface ControllerToLikeAndRtInput {
  rtText: string;
  rtImageSearchText: string;
  rtImageSearchPosition: number;
  quoteText: string;
  gazaRtText: string;
  gazaRtImageSearchText: string;
  gazaRtImageSearchPosition: number;
  gazaQuoteText: string;
}

export interface ControllerToLikeAndRtRequest {
  type: typeof REQUEST_LIKE_AND_RT;
  fundraiserURLs: string[];
  fundraiserExcludedURLs: string[];
  sourceReplies: SourceReplies;
  threshold: number;
  url: string;
  timestamp: number;
  isFundraiser?: boolean;
  isGaza?: boolean;
  userInput: ControllerToLikeAndRtInput;
}

export interface LikeAndRtToControllerResponse {
  type: typeof RESPONSE_LIKE_AND_RT;
  url: string;
  timestamp: number;
  error: string | null | undefined;
}

export interface ControllerToReplyWithURLRequest {
  type: typeof REQUEST_REPLY_WITH_URL;
  sourceURL: string,
  targetURL: string,
  timestamp: number;
}

export interface ReplyWithURLToControllerResponse {
  type: typeof RESPONSE_REPLY_WITH_URL;
  sourceURL: string,
  targetURL: string,
  timestamp: number;
}

export interface SourceTweetURL {
  url: string;
  isGaza: boolean;
}

export interface AutomatedTasks {
  collectingFollowingsTask: { status: AutomatedTasksStatus, skipOnFirstVisible: boolean };
  likeRtQuoteReplyStatus: AutomatedTasksStatus;
  sourceTweetURLs: SourceTweetURL[];
  targetTweetURLs: string[];
  sourceReplies: SourceReplies;
  sourceToTargetReplies: SourceToTargetReplies;
  likeRtThresholdDuration: number;
  followingThresholdDuration: number;
  sourceToTargetThresholdDuration: number;
  minWaitingTimeForFollowing: number;
  minWaitingTimeForTweet: number;
  userInput: ControllerToLikeAndRtInput;
}
